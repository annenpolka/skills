#!/usr/bin/env python3
"""Local Devin ACP runner. Exact command grants; caller verifies task correctness."""
import argparse
import json
import math
import os
from pathlib import Path
import queue
import signal
import subprocess
import tempfile
import threading
import time
from relay import snapshot, write_result


class ACP:
    def __init__(self, cwd, model, run, allowed):
        self.run = run
        self.expected_model = model
        self.session = None
        self.active = False
        self.cancelled = None
        self.n = 0
        self.q = queue.Queue()
        self.allowed = set(allowed)
        self.calls = {}
        self.reverse_ids = set()
        self.messages = []
        self.permissions = []
        self.config = {}
        self.reported_model = None
        self.cleanup_errors = []
        self.log = (run / 'events.jsonl').open('w')
        self.err = (run / 'stderr.txt').open('w')
        env = dict(os.environ)
        for key in ('DEVIN_REFUSAL_FALLBACK', 'DEVIN_SANDBOX', 'DEVIN_PERMISSION_MODE'):
            env.pop(key, None)
        self.p = subprocess.Popen(['devin', 'acp', '--model', model], cwd=cwd, env=env,
                                  stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                  stderr=self.err, text=True, start_new_session=True)
        def reader():
            try:
                for line in self.p.stdout:
                    self.q.put(json.loads(line))
            except Exception as error:
                self.q.put(error)
            finally:
                self.q.put(None)
        threading.Thread(target=reader, daemon=True).start()

    def send(self, msg):
        self.log.write(json.dumps({'direction': 'send', 'message': msg}) + '\n')
        self.log.flush()
        self.p.stdin.write(json.dumps(msg) + '\n')
        self.p.stdin.flush()

    def start(self, method, params):
        self.n += 1
        self.send({'jsonrpc': '2.0', 'id': self.n, 'method': method, 'params': params})
        return self.n

    def cancel(self, reason):
        if self.active and not self.cancelled:
            self.cancelled = reason
            self.send({'jsonrpc': '2.0', 'method': 'session/cancel',
                       'params': {'sessionId': self.session}})

    def permission(self, msg):
        p = msg.get('params', {})
        tool = p.get('toolCall', {})
        tid = tool.get('toolCallId')
        prior = self.calls.get(tid, {})
        command = prior.get('rawInput', {}).get('command')
        editable = tool.get('_meta', {}).get('cognition.ai/editableCommand')
        option = next((o for o in p.get('options', []) if o.get('kind') == 'allow_once'), None)
        duplicate = msg['id'] in self.reverse_ids
        self.reverse_ids.add(msg['id'])
        grant = (self.active and not self.cancelled and not duplicate
                 and p.get('sessionId') == self.session
                 and prior.get('kind') == 'execute'
                 and prior.get('_meta', {}).get('cognition.ai/inferenceToolName') == 'exec'
                 and prior.get('status') in (None, 'pending')
                 and isinstance(command, str) and command in self.allowed
                 and editable == command and option is not None
                 and not prior.get('_granted'))
        outcome = {'outcome': 'selected', 'optionId': option['optionId']} if grant else {'outcome': 'cancelled'}
        self.permissions.append({'toolCallId': tid, 'command': command, 'granted': grant})
        if grant:
            prior['_granted'] = True
        self.send({'jsonrpc': '2.0', 'id': msg['id'], 'result': {'outcome': outcome}})
        if not grant:
            self.cancel('permission_required')

    def receive(self, timeout):
        msg = self.q.get(timeout=timeout)
        if msg is None:
            raise RuntimeError('ACP closed stdout before the expected response')
        if isinstance(msg, Exception):
            raise RuntimeError('Malformed ACP stream') from msg
        if not isinstance(msg, dict) or msg.get('jsonrpc') != '2.0':
            raise RuntimeError('Invalid JSON-RPC message')
        self.log.write(json.dumps({'direction': 'receive', 'message': msg}) + '\n')
        self.log.flush()
        method = msg.get('method')
        p = msg.get('params', {})
        if method and 'id' in msg:
            if method == 'session/request_permission':
                self.permission(msg)
            else:
                self.reverse_ids.add(msg['id'])
                self.send({'jsonrpc': '2.0', 'id': msg['id'],
                           'error': {'code': -32601, 'message': 'Unsupported client method'}})
                self.cancel('unsupported_client_request')
        elif method == 'session/update' and p.get('sessionId') == self.session:
            u = p.get('update', {})
            kind = u.get('sessionUpdate')
            if kind == 'config_option_update':
                self.config.update({o['id']: o.get('currentValue') for o in u.get('configOptions', [])})
                if self.active and self.config.get('model') != self.expected_model:
                    self.cancel('model_changed')
            if self.active:
                if kind == 'agent_message_chunk' and u.get('content', {}).get('type') == 'text':
                    self.messages.append(u['content']['text'])
                elif kind == 'tool_call':
                    if u['toolCallId'] in self.calls:
                        self.cancel('duplicate_tool_id')
                    else:
                        self.calls[u['toolCallId']] = dict(u)
                elif kind == 'tool_call_update':
                    # Keep raw history; a later completed notification may follow cancellation.
                    old = self.calls.get(u.get('toolCallId'))
                    if old is not None:
                        old.update(u)
        elif method == '_cognition.ai/agent_stopped' and self.active and p.get('sessionId') == self.session:
            self.reported_model = p.get('stats', {}).get('modelLabel')
        return msg

    def call(self, method, params, timeout):
        rid = self.start(method, params)
        end = time.monotonic() + timeout
        grace = None
        while True:
            if self.active and (self.cancelled or time.monotonic() >= end):
                self.cancel('timed_out')
                if grace is None:
                    grace = time.monotonic() + 5
            deadline = grace if grace is not None else end
            if time.monotonic() >= deadline:
                raise TimeoutError('ACP response deadline exceeded')
            try:
                msg = self.receive(min(0.2, deadline-time.monotonic()))
            except queue.Empty:
                continue
            if msg.get('id') == rid and 'method' not in msg:
                if 'error' in msg:
                    raise RuntimeError('ACP error: ' + json.dumps(msg['error']))
                return msg['result']

    def close(self):
        # Protocol cancellation is attempted before process-group cleanup.
        for sig in (signal.SIGTERM, signal.SIGKILL):
            try:
                os.killpg(self.p.pid, sig)
            except ProcessLookupError:
                pass
            except PermissionError as error:
                self.cleanup_errors.append(str(error))
                if self.p.poll() is None:
                    self.p.send_signal(sig)
            try:
                self.p.wait(timeout=1)
            except subprocess.TimeoutExpired:
                continue
        self.p.wait(timeout=2)
        self.p.stdin.close()
        self.p.stdout.close()
        self.log.close()
        self.err.close()


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--cd', required=True)
    p.add_argument('--brief', required=True)
    p.add_argument('--model', default='swe-2-max')
    p.add_argument('--session')
    p.add_argument('--mode', choices=['ask', 'accept-edits', 'smart', 'plan'], default='accept-edits')
    p.add_argument('--allow-commands', help='JSON array of exact authorized shell command strings')
    p.add_argument('--timeout', type=float, default=1800)
    p.add_argument('--output-root')
    args = p.parse_args(argv)
    if os.name != 'posix' or not math.isfinite(args.timeout) or args.timeout <= 0:
        p.error('Requires POSIX and a positive finite timeout')
    cwd = Path(args.cd).resolve(strict=True)
    brief = Path(args.brief).read_text()
    allowed = json.loads(Path(args.allow_commands).read_text()) if args.allow_commands else []
    if not cwd.is_dir() or not brief.strip() or not args.model.strip():
        p.error('Directory, brief and model must be valid')
    if not isinstance(allowed, list) or any(not isinstance(s, str) or not s for s in allowed):
        p.error('--allow-commands must contain a JSON string array')
    root = Path(args.output_root).resolve() if args.output_root else None
    if root:
        root.mkdir(parents=True, exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix='devin-acp-', dir=root)).resolve()
    os.chmod(run, 0o700)
    (run/'brief.txt').write_text(brief)
    result = {'status': 'starting', 'transport': 'acp', 'requestedModel': args.model,
              'sessionId': args.session, 'verification': 'not_performed', 'cost': None,
              'gitBefore': snapshot(cwd), 'artifacts': str(run), 'cwd': str(cwd)}
    write_result(run/'result.json', result)
    print(run, flush=True)
    c = None
    start = time.monotonic()
    previous = {}
    try:
        c = ACP(cwd, args.model, run, allowed)
        result['pid'] = c.p.pid
        for sig in (signal.SIGINT, signal.SIGTERM):
            def interrupt(_s, _f):
                if c.active:
                    c.cancel('interrupted')
                else:
                    raise InterruptedError('Interrupted during session setup')
            previous[sig] = signal.signal(sig, interrupt)
        capabilities = c.call('initialize', {'protocolVersion': 1,
            'clientCapabilities': {'fs': {'readTextFile': False, 'writeTextFile': False}, 'terminal': False},
            'clientInfo': {'name': 'devin-delegate', 'version': '0.1'}}, 30)
        result['capabilities'] = capabilities.get('agentCapabilities')
        params = {'cwd': str(cwd), 'mcpServers': []}
        if args.session:
            if not capabilities.get('agentCapabilities', {}).get('loadSession'):
                raise RuntimeError('Agent does not support session/load')
            c.session = args.session
            params['sessionId'] = args.session
            new = c.call('session/load', params, 30)
        else:
            new = c.call('session/new', params, 30)
            c.session = new['sessionId']
        result['sessionId'] = c.session
        write_result(run/'result.json', result)
        for key, value in [('model', args.model), ('mode', args.mode)]:
            state = c.call('session/set_config_option', {'sessionId': c.session, 'configId': key, 'value': value}, 30)
            current = {o['id']: o.get('currentValue') for o in state['configOptions']}
            if current.get(key) != value:
                raise RuntimeError('Agent did not retain requested ' + key)
            c.config.update(current)
        c.active = True
        result['status'] = 'running'
        write_result(run/'result.json', result)
        reply = c.call('session/prompt', {'sessionId': c.session, 'prompt': [{'type': 'text', 'text': brief}]}, args.timeout)
        c.active = False
        result.update(stopReason=reply.get('stopReason'), usage=reply.get('usage'),
                      status=c.cancelled or ('turn_completed' if reply.get('stopReason') == 'end_turn' else 'incomplete'))
        if c.config.get('model') != args.model:
            result['status'] = 'model_changed'
    except Exception as error:
        if c:
            try:
                c.cancel('failed')
            except Exception:
                pass
        result.update(status=(c.cancelled if c else None) or 'failed', error=str(error))
    finally:
        if c:
            try:
                c.close()
            except Exception as error:
                result['cleanupError'] = str(error)
            result.update(finalMessage=''.join(c.messages), permissions=c.permissions,
                          reportedModel=c.reported_model, config=c.config,
                          cleanupErrors=c.cleanup_errors, processExitCode=c.p.poll())
        for sig, old in previous.items():
            signal.signal(sig, old)
        result.update(elapsedSeconds=round(time.monotonic()-start, 3), gitAfter=snapshot(cwd))
        write_result(run/'result.json', result)
    print(json.dumps(result), flush=True)
    return 0 if result['status'] == 'turn_completed' else 1


if __name__ == '__main__':
    raise SystemExit(main())
