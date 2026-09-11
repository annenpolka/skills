#!/usr/bin/env python3
"""Bounded local Devin invocation; preserves raw evidence without guessing success."""
import argparse
import json
import math
import os
from pathlib import Path
import signal
import subprocess
import tempfile
import time


def inspect_export(path):
    try:
        data = json.loads(path.read_text())
        if not isinstance(data, dict):
            raise ValueError('ATIF root is not an object')
        sid = data.get('session_id')
        agent = data.get('agent', {})
        steps = data.get('steps', [])
        if not isinstance(steps, list):
            raise ValueError('ATIF steps is not an array')
        replies = [s for s in steps if isinstance(s, dict) and s.get('source') == 'agent']
        return {
            'sessionId': sid if isinstance(sid, str) and sid else None,
            'reportedModel': agent.get('model_name') if isinstance(agent, dict) else None,
            'reportedModels': sorted({s['model_name'] for s in replies
                                      if isinstance(s.get('model_name'), str)}),
            'lastExportedMessage': replies[-1].get('message') if replies else None,
            'usage': data.get('final_metrics'),
            'exportError': None,
        }
    except (OSError, ValueError) as error:
        return {'sessionId': None, 'reportedModel': None, 'reportedModels': [],
                'lastExportedMessage': None, 'usage': None, 'exportError': str(error)}


def snapshot(cwd):
    try:
        p = subprocess.run(['git', 'status', '--porcelain=v1', '--untracked-files=all'],
                           cwd=cwd, capture_output=True, text=True, timeout=10,
                           env={**os.environ, 'GIT_OPTIONAL_LOCKS': '0'})
        return p.stdout if p.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def write_result(path, result):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(result, indent=2) + '\n')
    temp.replace(path)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cd', required=True)
    parser.add_argument('--model', default='swe-2-max',
                        help='Exact catalog model_uid (default: swe-2-max)')
    parser.add_argument('--brief', required=True)
    parser.add_argument('--session', help='Exact session ID from a previous export')
    parser.add_argument('--mode', choices=['normal', 'smart', 'sandbox'], default='normal')
    parser.add_argument('--trust-workspace', action='store_true',
                        help='Explicitly skip Devin workspace trust check for this reviewed workspace')
    parser.add_argument('--timeout', type=float, default=1800, help='Seconds, default 1800')
    parser.add_argument('--output-root', help='Parent for a new unique run directory')
    args = parser.parse_args(argv)
    if os.name != 'posix':
        parser.error('This runner requires macOS/Linux process groups')
    if not math.isfinite(args.timeout) or args.timeout <= 0:
        parser.error('--timeout must be finite and positive')
    cwd = Path(args.cd).resolve(strict=True)
    if not cwd.is_dir():
        parser.error('--cd must be a directory')
    brief = Path(args.brief).resolve(strict=True).read_bytes()
    if not brief.strip() or not args.model.strip() or args.session == '':
        parser.error('brief, model and supplied session must not be empty')
    root = Path(args.output_root).resolve() if args.output_root else None
    if root:
        root.mkdir(parents=True, exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix='devin-delegate-', dir=root)).resolve()
    os.chmod(run, 0o700)
    (run / 'brief.txt').write_bytes(brief)
    export = run / 'conversation.json'
    command = ['devin', '--model', args.model, '--print', '--prompt-file',
               str(run / 'brief.txt'), '--export', str(export)]
    if args.mode == 'sandbox':
        command += ['--sandbox', '--permission-mode', 'autonomous']
    else:
        command += ['--permission-mode', args.mode]
    command += ['--respect-workspace-trust', 'false' if args.trust_workspace else 'true']
    if args.session:
        command += ['--resume', args.session]
    # CLI flags select the permission mode; do not inherit a surprise sandbox toggle.
    env = dict(os.environ)
    env.pop('DEVIN_SANDBOX', None)
    result = {
        'status': 'running', 'backend': 'local', 'cwd': str(cwd),
        'requestedModel': args.model, 'resumeSessionId': args.session,
        'sessionId': None, 'reportedModel': None, 'usage': None, 'cost': None,
        'verification': 'not_performed', 'command': command, 'cleanupErrors': [],
        'gitBefore': snapshot(cwd), 'artifacts': str(run),
    }
    target = run / 'result.json'
    write_result(target, result)
    print(str(run), flush=True)
    proc = None
    stopped = None

    def stop_group(sig):
        if proc is not None:
            try:
                os.killpg(proc.pid, sig)
            except ProcessLookupError:
                pass
            except PermissionError as error:
                result['cleanupErrors'].append(str(error))
                # A host sandbox may forbid killpg even for an owned child.
                # Stop the direct child, but retain uncertainty about descendants.
                if proc.poll() is None:
                    proc.send_signal(sig)

    def on_signal(signum, _frame):
        nonlocal stopped
        stopped = 'interrupted'
        stop_group(signal.SIGTERM)

    previous = {s: signal.signal(s, on_signal) for s in (signal.SIGINT, signal.SIGTERM)}
    started = time.monotonic()
    try:
        with (run / 'stdout.txt').open('wb') as out, (run / 'stderr.txt').open('wb') as err:
            proc = subprocess.Popen(command, cwd=cwd, env=env, stdin=subprocess.DEVNULL,
                                    stdout=out, stderr=err, start_new_session=True)
            result['pid'] = proc.pid
            write_result(target, result)
            while proc.poll() is None and stopped is None:
                if time.monotonic() - started >= args.timeout:
                    stopped = 'timed_out'
                    break
                time.sleep(0.1)
            if stopped:
                stop_group(signal.SIGTERM)
                time.sleep(0.3)
                stop_group(signal.SIGKILL)
            proc.wait()
            # Do not leave ordinary child servers running after the CLI exits.
            stop_group(signal.SIGTERM)
            time.sleep(0.1)
            stop_group(signal.SIGKILL)
            result['exitCode'] = proc.returncode
            result['status'] = stopped or ('exited' if proc.returncode == 0 else 'failed')
    except OSError as error:
        result.update(status='failed', error=str(error), exitCode=None)
    finally:
        for sig, handler in previous.items():
            signal.signal(sig, handler)
        result.update(inspect_export(export))
        result['elapsedSeconds'] = round(time.monotonic() - started, 3)
        result['gitAfter'] = snapshot(cwd)
        write_result(target, result)
    print(json.dumps(result), flush=True)
    return 0 if result['status'] == 'exited' else 1


if __name__ == '__main__':
    raise SystemExit(main())
