import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, renameSync, rmSync, realpathSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

const helper = fileURLToPath(new URL('../scripts/jev-crosscheck', import.meta.url));
const root = realpathSync(mkdtempSync(join(tmpdir(), 'jev-crosscheck-test-')));
const bin = join(root, 'bin');
mkdirSync(bin);
const setKey = (value) => {
  writeFileSync(join(bin, 'security'), `#!/bin/sh\necho '${value}'\n`);
  chmodSync(join(bin, 'security'), 0o755);
};
setKey('FAKEKEY123');

const received = [];
let status = 200;
let responseBody = '{"model":"jev-test","answers":{}}';
const server = createServer((req, res) => {
  let data = '';
  req.on('data', (c) => { data += c; });
  req.on('end', () => {
    received.push({ auth: req.headers.authorization, body: JSON.parse(data) });
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(responseBody);
  });
});
let url;
before(async () => {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); rmSync(root, { recursive: true, force: true }); });

const run = (args, { endpoint } = {}) => new Promise((resolve) => {
  const child = spawn('bash', [helper, ...args], {
    cwd: root,
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, TYPESAFE_BASE_URL: endpoint ?? url },
  });
  let stdout = '', stderr = '';
  child.stdout.on('data', (c) => { stdout += c; });
  child.stderr.on('data', (c) => { stderr += c; });
  child.stdin.end();
  child.on('close', (code) => resolve({ code, stdout, stderr }));
});

let seq = 0;
const request = (state, questions) => {
  const file = join(root, `req-${++seq}.json`);
  writeFileSync(file, JSON.stringify({
    state,
    questions: questions ?? {
      q: { type: 'noul', instructions: 'Does `diff` implement `report`?', criteria: { true: 'CRITERION-TRUE-TEXT', false: 'CRITERION-FALSE-TEXT' } },
    },
  }));
  return file;
};

test('send without inspection is refused', async () => {
  const r = await run([request({ report: 'a', diff: 'b' })]);
  assert.equal(r.code, 4);
});

test('inspect then send delivers the inspected body with the key header', async () => {
  const f = request({ report: 'fixed', diff: '- a\n+ b' });
  assert.equal((await run(['--inspect', f])).code, 0);
  const before = received.length;
  const r = await run([f]);
  assert.equal(r.code, 0);
  assert.equal(received.length, before + 1);
  const got = received.at(-1);
  assert.equal(got.auth, 'Bearer FAKEKEY123');
  assert.deepEqual(got.body.state, { report: 'fixed', diff: '- a\n+ b' });
  assert.equal(got.body.model, 'jev-latest');
});

test('file changed after inspection is refused', async () => {
  const f = request({ report: 'x' });
  assert.equal((await run(['--inspect', f])).code, 0);
  writeFileSync(f, JSON.stringify({ state: { report: 'y' }, questions: { q: { type: 'noul', instructions: '?' } } }));
  assert.equal((await run([f])).code, 4);
});

test('endpoint changed after inspection is refused', async () => {
  const f = request({ report: 'x' });
  assert.equal((await run(['--inspect', f])).code, 0);
  const before = received.length;
  const r = await run([f], { endpoint: `${url}/other` });
  assert.equal(r.code, 4);
  assert.equal(received.length, before);
});

test('inspection shows the endpoint, instructions, and criteria', async () => {
  const r = await run(['--inspect', request({ report: 'x' })]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /Does `diff` implement `report`\?/);
  assert.match(r.stdout, /CRITERION-TRUE-TEXT/);
  assert.match(r.stdout, /CRITERION-FALSE-TEXT/);
  assert.ok(r.stdout.includes(url), 'endpoint shown');
});

test('credential patterns are refused without revealing any part of the value', async () => {
  // Built at runtime so the fake token is not a literal secret-shaped string in the repository.
  const token = ['ghp', '7Qm2xVb9Lr4Tz8Kd1Nw6Hs3Yc5Pa0Ej2'].join('_');
  const dbPassword = 'Tq9-vL2mK8xR';
  const f = request({ brief: `GITHUB_TOKEN=${token}`, config: `postgres://svc:${dbPassword}@db/x`, clean: 'nothing here' });
  const r = await run(['--inspect', f]);
  assert.equal(r.code, 5);
  const out = r.stdout + r.stderr;
  for (const secret of [token.slice(4), dbPassword]) {
    for (let i = 0; i + 4 <= secret.length; i++) {
      assert.ok(!out.includes(secret.slice(i, i + 4)), `leaked fragment ${secret.slice(i, i + 4)}`);
    }
  }
  assert.ok(!out.includes('ghp_7'), 'no token prefix with value');
  assert.match(r.stderr, /brief/);
  assert.match(r.stderr, /config/);
  assert.doesNotMatch(r.stderr, /clean/);
  assert.equal((await run([f])).code, 4, 'not recorded as inspected');
});

test('ordinary words like token are not flagged', async () => {
  const r = await run(['--inspect', request({ t: 'The token bucket refills every second.' })]);
  assert.equal(r.code, 0);
});

test('HTTP error body goes to stderr with a curl exit code', async () => {
  const f = request({ report: 'x' });
  assert.equal((await run(['--inspect', f])).code, 0);
  status = 400;
  responseBody = '{"detail":"ERROR-BODY-MARKER"}';
  try {
    const r = await run([f]);
    assert.equal(r.code, 22);
    assert.equal(r.stdout, '');
    assert.match(r.stderr, /ERROR-BODY-MARKER/);
  } finally {
    status = 200;
    responseBody = '{"model":"jev-test","answers":{}}';
  }
});

test('usage errors, invalid requests, and a missing key', async () => {
  assert.equal((await run([])).code, 2);
  const bad = join(root, 'bad.json');
  writeFileSync(bad, '{"state":"x"}');
  assert.equal((await run(['--inspect', bad])).code, 2);
  const f = request({ report: 'x' });
  assert.equal((await run(['--inspect', f])).code, 0);
  setKey('');
  try {
    assert.equal((await run([f])).code, 3);
  } finally {
    setKey('FAKEKEY123');
  }
});

test('only inspected bytes are ever sent while the file is being replaced', async () => {
  const f = join(root, 'race.json');
  const body = (marker) => JSON.stringify({ state: { marker }, questions: { q: { type: 'noul', instructions: '?' } } });
  writeFileSync(f, body('INSPECTED'));
  assert.equal((await run(['--inspect', f])).code, 0);
  let flip = false;
  const writer = setInterval(() => {
    flip = !flip;
    writeFileSync(`${f}.tmp`, body(flip ? 'OTHER' : 'INSPECTED'));
    renameSync(`${f}.tmp`, f);
  }, 1);
  const before = received.length;
  try {
    for (let i = 0; i < 60; i++) await run([f]);
  } finally {
    clearInterval(writer);
  }
  const markers = received.slice(before).map((x) => x.body.state.marker);
  assert.ok(markers.length > 0, 'some sends went through');
  assert.deepEqual([...new Set(markers)], ['INSPECTED']);
});
