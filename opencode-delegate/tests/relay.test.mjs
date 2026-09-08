import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync, statSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const relay = fileURLToPath(new URL('../scripts/relay.mjs', import.meta.url));
const root = realpathSync(mkdtempSync(join(tmpdir(), 'opencode-relay-test-')));
after(() => rmSync(root, { recursive: true, force: true }));
let sequence = 0;
const prompt = '日本語の依頼\n`touch PWNED` $(touch PWNED) "quoted"\n';
const fakeSource = `#!${process.execPath}
import { readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
const mode = process.env.RELAY_TEST_MODE;
if (process.argv.includes('--version')) {
  if (mode === 'version-failed') process.exit(9);
  if (mode === 'version-timeout') setInterval(() => {}, 1000);
  else { console.log('1.18.test'); process.exit(0); }
} else {
  const brief = readFileSync(0, 'utf8');
  writeFileSync(process.env.RELAY_TEST_CAPTURE, JSON.stringify({ argv: process.argv.slice(2), brief, cwd: process.cwd(), pwd: process.env.PWD }));
  const sid = process.argv.includes('--session') ? process.argv[process.argv.indexOf('--session') + 1] : 'ses_test';
  const event = (type, part) => ({ type, sessionID: sid, part });
  if (mode === 'timeout' || mode === 'abort' || mode === 'tree') {
    process.on('SIGTERM', () => {});
    if (mode === 'tree') {
      const grandchild = spawn(process.execPath, ['-e', 'process.on("SIGTERM",()=>{});setInterval(()=>{},1000)'], { stdio: 'inherit' });
      writeFileSync(process.env.RELAY_TEST_CAPTURE + '.pid', String(grandchild.pid));
    }
    setInterval(() => {}, 1000);
  } else if (mode === 'empty') process.exit(0);
  else if (mode === 'error') {
    console.log(JSON.stringify({ type: 'error', sessionID: sid, error: { name: 'APIError', data: { message: 'model unavailable' } } }));
  } else if (mode === 'failed') { console.error('authentication failed'); process.exitCode = 7; }
  else {
    const events = [
      event('text', { id: 'old', messageID: 'm1', type: 'text', text: 'progress' }),
      event('text', { id: 'p1', messageID: 'm2', type: 'text', text: '途中' }),
      event('text', { id: 'p1', messageID: 'm2', type: 'text', text: '完了🦆' }),
      event('text', { id: 'p2', messageID: 'm2', type: 'text', text: 'second line' }),
      event('step_finish', { id: 's1', reason: mode === 'incomplete' ? 'length' : 'stop', cost: 0.25 }),
      event('step_finish', { id: 's1', reason: mode === 'incomplete' ? 'length' : 'stop', cost: 0.25 }),
    ];
    if (mode === 'trailing-start') events.push(event('step_start', { id: 's2' }));
    if (mode === 'mismatch') events.push({ type: 'step_finish', sessionID: 'ses_wrong', part: { reason: 'stop' } });
    if (mode === 'edit') writeFileSync('changed.txt', 'done');
    const bytes = Buffer.from('plugin noise "prefix\\n' + events.map(JSON.stringify).join(''));
    for (let i = 0; i < bytes.length; i += 2) process.stdout.write(bytes.subarray(i, i + 2));
  }
}
`;

function fixture(mode = 'success') {
  const dir = join(root, String(++sequence)); mkdirSync(dir);
  const bin = join(dir, 'bin'); mkdirSync(bin);
  // OpenCode is an executable script without a .mjs suffix; use a CommonJS
  // launcher so Node's package-type detection cannot affect the fixture.
  writeFileSync(join(bin, 'fake.mjs'), fakeSource);
  writeFileSync(join(bin, 'opencode'), `#!${process.execPath}\nimport(${JSON.stringify('file://' + join(bin, 'fake.mjs'))});\n`, { mode: 0o700 });
  const work = join(dir, 'work space'); mkdirSync(work);
  const out = join(dir, 'result');
  const capture = join(dir, 'capture.json');
  return { dir, work, out, capture,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, RELAY_TEST_MODE: mode, RELAY_TEST_CAPTURE: capture, PWD: '/wrong/inherited/pwd' },
    args: [relay, '--cd', work, '--model', 'deepseek/test-model', '--out-dir', out, '--timeout', '10s'],
  };
}

function run(f, extra = [], input = prompt) {
  const child = spawnSync(process.execPath, [...f.args, ...extra], { env: f.env, input, encoding: 'utf8', timeout: 15000 });
  assert.equal(child.error, undefined, child.error?.message);
  const resultPath = join(f.out, 'result.json');
  return { child, result: existsSync(resultPath) ? JSON.parse(readFileSync(resultPath, 'utf8')) : null };
}

test('preserves stdin, workdir/PWD, fragmented Unicode, final message, cost and private artifacts', () => {
  const f = fixture(); const { child, result } = run(f, ['--pure']);
  assert.equal(child.status, 0, child.stderr);
  assert.equal(result.status, 'completed');
  assert.equal(result.finalMessage, '完了🦆\nsecond line');
  assert.equal(result.sessionId, 'ses_test'); assert.equal(result.cost, 0.25);
  assert.equal(result.gitBefore, null); assert.equal(result.gitAfter, null);
  const captured = JSON.parse(readFileSync(f.capture));
  assert.equal(captured.brief, prompt); assert.equal(captured.cwd, f.work); assert.equal(captured.pwd, f.work);
  assert.deepEqual(captured.argv, ['run', '--format', 'json', '--agent', 'build', '--model', 'deepseek/test-model', '--pure']);
  assert.equal(existsSync(join(f.work, 'PWNED')), false);
  assert.equal(statSync(f.out).mode & 0o777, 0o700);
  assert.equal(statSync(result.paths['brief.txt']).mode & 0o777, 0o600);
  assert.equal(readFileSync(result.paths['final.txt'], 'utf8'), result.finalMessage);
});

test('explicit session, model, variant and plan are passed together on resume', () => {
  const f = fixture(); const { result } = run(f, ['--session', 'ses_existing', '--agent', 'plan', '--variant', 'high']);
  assert.equal(result.resumed, true); assert.equal(result.sessionId, 'ses_existing');
  const { argv } = JSON.parse(readFileSync(f.capture));
  assert.ok(argv.includes('deepseek/test-model')); assert.ok(argv.includes('plan')); assert.ok(argv.includes('high'));
  assert.equal(argv.includes('--auto'), false); assert.equal(argv.includes('--continue'), false);
});

test('auto approval requires a flag and is forbidden with plan', () => {
  const enabled = fixture(); assert.equal(run(enabled, ['--auto']).child.status, 0);
  assert.ok(JSON.parse(readFileSync(enabled.capture)).argv.includes('--auto'));
  const denied = fixture(); const result = run(denied, ['--auto', '--agent', 'plan']);
  assert.equal(result.child.status, 2); assert.equal(result.result, null); assert.equal(existsSync(denied.capture), false);
});

test('invalid inputs fail before dispatch or artifact creation', () => {
  for (const args of [[], ['--session', 'ses_existing'], ['--model', 'bare-model'], ['--model', 'p/m', '--timeout', '0s'], ['--model', 'p/m', '--unknown']]) {
    const f = fixture(); f.args = [relay, '--cd', f.work, '--out-dir', f.out, ...args];
    const { child, result } = run(f);
    assert.equal(child.status, 2); assert.equal(result, null); assert.equal(existsSync(f.capture), false);
  }
  const f = fixture(); assert.equal(run(f, [], ' \n').child.status, 2);
});

test('brief file handles shell-sensitive filename literally', () => {
  const f = fixture(); const brief = join(f.dir, 'brief $(literal).txt'); writeFileSync(brief, prompt);
  assert.equal(run(f, ['--brief', brief], '').child.status, 0);
  assert.equal(JSON.parse(readFileSync(f.capture)).brief, prompt);
});

test('an existing run directory cannot be reused or overwritten', () => {
  const f = fixture(); assert.equal(run(f).child.status, 0);
  const saved = readFileSync(join(f.out, 'result.json'), 'utf8');
  assert.equal(run(f).child.status, 2);
  assert.equal(readFileSync(join(f.out, 'result.json'), 'utf8'), saved);
});

test('error events, incomplete generation and empty exit-zero output are failures', () => {
  for (const mode of ['error', 'incomplete', 'empty', 'mismatch', 'trailing-start']) {
    const { child, result } = run(fixture(mode));
    assert.equal(child.status, 1, mode); assert.equal(result.status, 'failed', mode);
    assert.equal(result.childExitCode, 0); assert.ok(result.error);
  }
});

test('nonzero CLI exit captures the error without falsely completing', () => {
  const { child, result } = run(fixture('failed'));
  assert.equal(child.status, 7); assert.equal(result.status, 'failed');
  assert.match(result.stderrTail, /authentication failed/);
});

test('missing executable and failed version preflight produce results', () => {
  const missing = fixture(); const empty = join(missing.dir, 'empty'); mkdirSync(empty); missing.env.PATH = empty;
  const a = run(missing); assert.equal(a.child.status, 127); assert.equal(a.result.status, 'opencode_unavailable');
  const broken = fixture('version-failed'); const b = run(broken);
  assert.equal(b.child.status, 1); assert.equal(b.result.status, 'failed'); assert.equal(existsSync(broken.capture), false);
});

test('git snapshots distinguish existing and resulting worktree status', () => {
  const f = fixture('edit'); assert.equal(spawnSync('git', ['init', '-q', f.work]).status, 0);
  writeFileSync(join(f.work, 'existing.txt'), 'leave this alone');
  const { result } = run(f);
  assert.deepEqual(result.gitBefore, ['?? existing.txt']);
  assert.deepEqual(result.gitAfter, ['?? changed.txt', '?? existing.txt']);
});

test('watchdog bounds both preflight and a CLI ignoring SIGTERM', () => {
  for (const mode of ['version-timeout', 'timeout', 'tree']) {
    const f = fixture(mode); f.args[f.args.indexOf('10s')] = '1s';
    const { child, result } = run(f);
    assert.equal(child.status, 124, mode); assert.equal(result.status, 'timeout', mode);
    if (mode === 'tree') {
      const pid = Number(readFileSync(f.capture + '.pid', 'utf8'));
      assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
    }
  }
});

test('parent cancellation terminates the run and records an aborted result', async () => {
  const f = fixture('abort');
  const child = spawn(process.execPath, f.args, { env: f.env, stdio: ['pipe', 'ignore', 'pipe'] });
  child.stdin.end(prompt);
  const deadline = Date.now() + 5000;
  while (!existsSync(f.capture) && Date.now() < deadline) await new Promise(r => setTimeout(r, 20));
  assert.ok(existsSync(f.capture), 'fake CLI started');
  const closed = new Promise(r => child.once('close', code => r(code)));
  child.kill('SIGTERM');
  assert.equal(await closed, 143);
  const result = JSON.parse(readFileSync(join(f.out, 'result.json')));
  assert.equal(result.status, 'aborted'); assert.equal(result.signal, 'SIGTERM');
});
