#!/usr/bin/env node
// The event scanner is adapted from amElnagdy/delegate-skills (MIT); see ../LICENSE.
import { spawn, spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { constants, tmpdir } from 'node:os';
import { StringDecoder } from 'node:string_decoder';

const HELP = `Usage: node relay.mjs --model provider/model [options] < brief.txt
  --brief FILE      Read prompt from a file instead of stdin
  --cd DIR          Target working directory (default: current directory)
  --model ID        Required on every call; never silently falls back
  --agent NAME      build (default) or plan
  --session ID      Resume this exact OpenCode session
  --variant NAME    Optional provider-specific reasoning variant
  --pure            Disable external OpenCode plugins
  --auto            Auto-approve non-denied permissions (build only)
  --timeout DUR     Positive h/m/s duration (default: 30m)
  --out-dir DIR     Create a NEW run directory (default: private temporary dir)
  --help            Show help
Requires Node.js 18+ and OpenCode on PATH; macOS/Linux/WSL.
Exit: 0 completed, 1 failed, 2 usage, 124 timeout, 127 unavailable,
      128 + signal number for interruption. See result.json for details.
`;

function duration(value) {
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!m) throw new Error('invalid --timeout; use e.g. 30m or 1h30m');
  const ms = (Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0)) * 1000;
  if (!Number.isSafeInteger(ms) || ms <= 0 || ms > 2147483647) throw new Error('--timeout must be positive and at most about 24 days');
  return ms;
}

function options(argv) {
  const opts = { cd: process.cwd(), agent: 'build', timeout: '30m', auto: false, pure: false };
  const values = { '--brief': 'brief', '--cd': 'cd', '--model': 'model', '--agent': 'agent', '--session': 'session', '--variant': 'variant', '--timeout': 'timeout', '--out-dir': 'outDir' };
  const seen = new Set();
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--help' || flag === '-h') return { help: true };
    if (seen.has(flag)) throw new Error(`duplicate option: ${flag}`);
    seen.add(flag);
    if (flag === '--auto' || flag === '--pure') opts[flag.slice(2)] = true;
    else if (values[flag]) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
      opts[values[flag]] = value;
    } else throw new Error(`unknown option: ${flag}`);
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(opts.model || '')) throw new Error('--model provider/model is required on every call');
  if (!['build', 'plan'].includes(opts.agent)) throw new Error('--agent must be build or plan');
  if (opts.auto && opts.agent === 'plan') throw new Error('--auto cannot be combined with --agent plan');
  if (opts.session && !/^ses_[A-Za-z0-9_-]+$/.test(opts.session)) throw new Error('invalid --session ID');
  if (opts.variant && !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(opts.variant)) throw new Error('invalid --variant');
  opts.timeoutMs = duration(opts.timeout);
  opts.cd = realpathSync(opts.cd);
  if (!statSync(opts.cd).isDirectory()) throw new Error('--cd must be a directory');
  return opts;
}

// JSON events may be fragmented or surrounded by plugin output. Bound retained
// partial input; raw bytes always remain available in events.jsonl.
function eventScanner(onEvent, onOversize) {
  let buffer = '', depth = 0, start = -1, index = 0, quoted = false, escaped = false;
  return chunk => {
    buffer += chunk;
    while (index < buffer.length) {
      const ch = buffer[index];
      if (quoted) {
        if (escaped) escaped = false;
        else if (ch === '\\') escaped = true;
        else if (ch === '"') quoted = false;
      } else if (ch === '"' && depth > 0) quoted = true;
      else if (ch === '{') { if (depth++ === 0) start = index; }
      else if (ch === '}' && depth > 0 && --depth === 0) {
        let event;
        try { event = JSON.parse(buffer.slice(start, index + 1)); } catch { /* non-JSON noise */ }
        if (event) onEvent(event);
        start = -1;
      }
      index++;
    }
    if (depth > 0 && start >= 0) {
      buffer = buffer.slice(start); index = buffer.length; start = 0;
      if (buffer.length > 4 * 1024 * 1024) {
        onOversize(); buffer = ''; index = 0; depth = 0; start = -1; quoted = false; escaped = false;
      }
    } else { buffer = ''; index = 0; }
  };
}

function gitStatus(cwd) {
  const p = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
    cwd, encoding: 'utf8', timeout: 10000, killSignal: 'SIGKILL', maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' },
  });
  return p.status === 0 ? p.stdout.split('\n').filter(Boolean) : null;
}

function killGroup(child, signal) {
  if (!child?.pid) return;
  try { process.kill(-child.pid, signal); }
  catch { try { child.kill(signal); } catch { /* already gone */ } }
}

async function main() {
  let opts, brief, outDir;
  try {
    opts = options(process.argv.slice(2));
    if (opts.help) { process.stdout.write(HELP); return; }
    if (process.platform === 'win32') throw new Error('use WSL; native Windows is not supported');
    if (!opts.brief && process.stdin.isTTY) throw new Error('pass --brief FILE or provide stdin');
    brief = readFileSync(opts.brief || 0, 'utf8');
    if (!brief.trim()) throw new Error('brief is empty');
    if (opts.outDir) {
      outDir = resolve(opts.outDir);
      mkdirSync(outDir, { mode: 0o700 }); // exclusive: do not overwrite a past result
    } else outDir = mkdtempSync(join(tmpdir(), 'opencode-delegate-'));
  } catch (error) {
    process.stderr.write(`relay: ${error.message}\n`); process.exitCode = 2; return;
  }

  const paths = Object.fromEntries(['brief.txt', 'events.jsonl', 'stderr.log', 'final.txt', 'result.json'].map(name => [name, join(outDir, name)]));
  const save = (name, data) => writeFileSync(paths[name], data, { mode: 0o600 });
  save('brief.txt', brief); save('events.jsonl', ''); save('stderr.log', '');
  process.stdout.write(`run directory: ${outDir}\n`);
  const base = {
    schema: 'opencode-delegate.result.v1', tool: 'opencode', workdir: opts.cd,
    model: opts.model, agent: opts.agent, variant: opts.variant || null,
    auto: opts.auto, pure: opts.pure, resumed: Boolean(opts.session),
    startedAt: new Date().toISOString(), opencodeVersion: null,
    gitBefore: gitStatus(opts.cd), paths,
  };
  function finish(extra) {
    const result = { ...base, finishedAt: new Date().toISOString(), sessionId: opts.session || null,
      finalMessage: '', cost: null, gitAfter: gitStatus(opts.cd), ...extra };
    save('final.txt', result.finalMessage);
    const temporary = join(outDir, 'result.tmp');
    writeFileSync(temporary, JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
    renameSync(temporary, paths['result.json']);
    process.stdout.write(`relay: ${result.status} (exit ${result.exitCode})\nresult: ${paths['result.json']}\n`);
    process.exitCode = result.exitCode;
  }
  const probe = spawnSync('opencode', ['--version'], {
    cwd: opts.cd, encoding: 'utf8', timeout: Math.min(10000, opts.timeoutMs), killSignal: 'SIGKILL',
    maxBuffer: 1024 * 1024, env: { ...process.env, PWD: opts.cd },
  });
  if (probe.error || probe.status !== 0) {
    const missing = probe.error?.code === 'ENOENT', timedOut = probe.error?.code === 'ETIMEDOUT';
    save('stderr.log', probe.stderr || '');
    finish({ status: missing ? 'opencode_unavailable' : timedOut ? 'timeout' : 'failed',
      exitCode: missing ? 127 : timedOut ? 124 : 1, signal: probe.signal || null,
      error: `OpenCode version preflight failed: ${probe.error?.message || `exit ${probe.status}`}` });
    return;
  }
  base.opencodeVersion = probe.stdout.trim();
  const argv = ['run', '--format', 'json', '--agent', opts.agent, '--model', opts.model];
  if (opts.session) argv.push('--session', opts.session);
  if (opts.variant) argv.push('--variant', opts.variant);
  if (opts.pure) argv.push('--pure');
  if (opts.auto) argv.push('--auto');
  const child = spawn('opencode', argv, {
    cwd: opts.cd, env: { ...process.env, PWD: opts.cd },
    stdio: ['pipe', 'pipe', 'pipe'], detached: true, shell: false,
  });
  let sessionId = opts.session || null, lastReason = null, launchError = null;
  let stop = null, escalation = null, stderrTail = '', sawCost = false, cost = 0;
  let malformed = false, eventCount = 0, lastMessage = null;
  const errors = [], texts = new Map(), steps = new Map();
  const scanner = eventScanner(event => {
    if (typeof event.type !== 'string') return;
    eventCount++;
    if (event.sessionID) {
      if (sessionId && sessionId !== event.sessionID) errors.push('unexpected session ID in event stream');
      sessionId = event.sessionID;
    }
    const part = event.part;
    if (event.type === 'step_start') lastReason = null;
    if (event.type === 'error') errors.push(event.error || event);
    if (event.type === 'text' && part?.type === 'text' && typeof part.text === 'string') {
      const message = part.messageID || 'unidentified';
      lastMessage = message;
      texts.set(part.id || `anonymous-${texts.size}`, { message, text: part.text });
    }
    if (event.type === 'step_finish') {
      lastReason = part?.reason || null;
      if (Number.isFinite(part?.cost)) {
        steps.set(part.id || `anonymous-${steps.size}`, part.cost);
        sawCost = true;
      }
    }
  }, () => { malformed = true; });
  const decoder = new StringDecoder('utf8'), errDecoder = new StringDecoder('utf8');
  child.stdout.on('data', chunk => { appendFileSync(paths['events.jsonl'], chunk); scanner(decoder.write(chunk)); });
  child.stderr.on('data', chunk => {
    appendFileSync(paths['stderr.log'], chunk);
    stderrTail = (stderrTail + errDecoder.write(chunk)).slice(-8192);
  });
  function terminate(status, signal, exitCode) {
    if (stop) return;
    stop = { status, signal, exitCode };
    killGroup(child, 'SIGTERM');
    escalation = setTimeout(() => killGroup(child, 'SIGKILL'), 2000);
  }
  const handlers = new Map(['SIGINT', 'SIGTERM', 'SIGHUP'].map(signal => [signal,
    () => terminate('aborted', signal, 128 + constants.signals[signal])]));
  for (const [signal, handler] of handlers) process.on(signal, handler);
  const watchdog = setTimeout(() => terminate('timeout', null, 124), opts.timeoutMs);
  child.stdin.on('error', () => {}); // a failed launch/early close is handled below
  child.on('error', error => { launchError = error.message; });
  child.stdin.end(brief);
  const outcome = await new Promise(resolveOutcome => {
    child.on('close', (code, signal) => resolveOutcome({ code, signal }));
  });
  clearTimeout(watchdog);
  if (escalation) clearTimeout(escalation);
  if (stop) killGroup(child, 'SIGKILL');
  for (const [signal, handler] of handlers) process.off(signal, handler);
  scanner(decoder.end()); stderrTail += errDecoder.end();
  cost = [...steps.values()].reduce((sum, value) => sum + value, 0);
  const finalMessage = [...texts.values()].filter(part => part.message === lastMessage).map(part => part.text).join('\n').trim();
  const completed = !stop && !launchError && outcome.code === 0 && !errors.length && !malformed && lastReason === 'stop';
  const exitCode = stop?.exitCode ?? (completed ? 0 : outcome.code || (outcome.signal ? 128 + (constants.signals[outcome.signal] || 0) : 1));
  finish({
    status: stop?.status || (completed ? 'completed' : 'failed'), exitCode,
    childExitCode: outcome.code, signal: stop?.signal || outcome.signal || null,
    sessionId, finalMessage, cost: sawCost ? cost : null, eventCount, lastStepReason: lastReason,
    errors, stderrTail,
    ...(completed ? {} : { error: launchError || (stop ? `run ${stop.status}; inspect partial changes before retrying` :
      errors.length ? 'OpenCode emitted error events' : malformed ? 'event scanner exceeded retained input limit' :
        `OpenCode did not finish normally (exit ${outcome.code}, last step ${lastReason})`) }),
  });
}

main().catch(error => { process.stderr.write(`relay: ${error.message}\n`); process.exitCode = 1; });
