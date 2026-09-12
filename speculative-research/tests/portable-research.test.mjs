// Extraction-specific lifecycle coverage for skills/speculative-research.
//
// These adapt the accepted dev-research expectations to the portable CLI. They
// use only isolated fixtures and an injected fake provider process: no live
// provider, Docker, DB or network call is made.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, realpathSync, mkdirSync, writeFileSync, readFileSync, rmSync,
  symlinkSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createHost} from '../scripts/lib/io-host.mjs';
import {runMoonCli} from '../scripts/lib/cli-host.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function fixture(t, {source = 'docs/hook.mbt', text = 'announce()\n', scope = ['docs/']} = {}) {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'portable-research-')));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  mkdirSync(path.join(root, 'docs'));
  const sourcePath = path.join(root, source);
  mkdirSync(path.dirname(sourcePath), {recursive: true});
  writeFileSync(sourcePath, text);
  const helpers = {devinHelper: path.join(root, 'helpers', 'devin.py'), deepseekHelper: path.join(root, 'helpers', 'deepseek.mjs')};
  mkdirSync(path.dirname(helpers.devinHelper));
  writeFileSync(helpers.devinHelper, 'raise SystemExit("no live provider")\n');
  writeFileSync(helpers.deepseekHelper, 'throw new Error("no live provider");\n');
  writeFileSync(path.join(root, 'profile.json'), JSON.stringify({schemaVersion: 1, projectName: 'Notebook', allowedRoots: scope, ...helpers}));
  writeFileSync(path.join(root, 'seed.json'), JSON.stringify({
    concept: {id: 'routing', title: 'Notebook routing', premise: 'Unadopted design', scope},
    tasks: [{id: 'q1', question: 'Can routing reuse this component?', decisionIfTrue: 'reuse', decisionIfFalse: 'investigate adapter', kind: 'constraint', priority: 5}],
  }));
  const base = createHost({root});
  async function invoke(args, runProcess = async () => { throw new Error('unexpected provider'); }) {
    const output = [];
    const host = raw => {
      const request = JSON.parse(raw);
      if (request.op === 'print') { output.push(request.text); return JSON.stringify({ok: true, value: null}); }
      return base(raw);
    };
    const result = await runMoonCli('research', args, {root, host, signals: false, verifyEachCall: false, runProcess});
    let json = null;
    try { json = JSON.parse(output.join('')); } catch { /* host failure keeps stdout empty */ }
    return {exitCode: result.exitCode, json};
  }
  const dir = path.join(root, '.runtime/research');
  const state = () => {
    const head = JSON.parse(readFileSync(path.join(dir, 'HEAD.json'), 'utf8'));
    const bytes = readFileSync(path.join(dir, head.file));
    assert.equal(sha(bytes), head.sha256);
    return JSON.parse(bytes);
  };
  const init = () => invoke(['init', '--profile', 'profile.json']);
  return {root, source, text, helpers, invoke, init, state, dir};
}

function devinRunProcess(calls, {nextQuestions = []} = {}) {
  return async request => {
    calls.push(request);
    const outputRoot = request.args[request.args.indexOf('--output-root') + 1];
    const directory = path.join(outputRoot, 'devin-acp-fake');
    mkdirSync(directory, {recursive: true});
    writeFileSync(path.join(directory, 'result.json'), JSON.stringify({
      status: 'turn_completed', config: {model: 'swe-2-max', mode: 'ask'}, processExitCode: 0,
      cleanupErrors: [], sessionId: 'session-one',
      finalMessage: '<research-result>' + JSON.stringify({
        findings: [{statement: 'A literal return exists', kind: 'source',
          evidence: [{path: 'docs/hook.mbt', quote: 'announce()'}], limitations: ['static'], decisionImpact: 'reuse'}],
        nextQuestions,
      }) + '</research-result>',
    }));
    return {exitCode: 0, signal: null, timedOut: false, interrupted: false, forcedTermination: false,
      cleanupUnverified: false, terminationErrors: []};
  };
}

test('legacy ledger without pinned project policy is refused without mutation', async t => {
  const f = fixture(t);
  const dir = f.dir;
  mkdirSync(path.join(dir, 'generations'), {recursive: true});
  const legacy = {schemaVersion: 1, revision: 0, paused: false, turn: 0, concepts: [], tasks: [], findings: [], runs: [], reviews: []};
  const bytes = Buffer.from(JSON.stringify(legacy) + '\n');
  writeFileSync(path.join(dir, 'generations', '0.json'), bytes);
  writeFileSync(path.join(dir, 'HEAD.json'), JSON.stringify({revision: 0, file: 'generations/0.json', sha256: sha(bytes)}) + '\n');
  const before = readFileSync(path.join(dir, 'HEAD.json'));
  const r = await f.invoke(['status']);
  assert.equal(r.exitCode, 1);
  assert.match(r.json.error, /legacy_ledger_requires_migration/);
  assert.deepEqual(readFileSync(path.join(dir, 'HEAD.json')), before);
});

test('provider helper locations are pinned at init and survive later profile edits', async t => {
  const f = fixture(t);
  assert.equal((await f.init()).exitCode, 0);
  const configPath = path.join(f.dir, 'config.json');
  const pinned = JSON.parse(readFileSync(configPath, 'utf8'));
  assert.equal(pinned.devinHelper, f.helpers.devinHelper);
  const pinnedPolicy = f.state().policy;
  assert.equal(pinnedPolicy.projectName, 'Notebook');
  assert.deepEqual(pinnedPolicy.allowedRoots, ['docs/']);
  const other = path.join(f.root, 'helpers', 'other.py');
  writeFileSync(other, 'pass\n');
  writeFileSync(path.join(f.root, 'profile.json'), JSON.stringify({schemaVersion: 1, projectName: 'Notebook', allowedRoots: ['docs/', 'outside/'], devinHelper: other, deepseekHelper: f.helpers.deepseekHelper}));
  f.invoke(['add', 'seed.json']);
  const calls = [];
  const r = await f.invoke(['tick'], devinRunProcess(calls));
  assert.equal(r.exitCode, 0, JSON.stringify(r.json));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[0], f.helpers.devinHelper, 'must launch the pinned helper, not the edited profile');
  assert.deepEqual(JSON.parse(readFileSync(configPath, 'utf8')), pinned);
  assert.deepEqual(f.state().policy.allowedRoots, ['docs/']);
});

test('completed run publishes exact finding, review history and derived child scope', async t => {
  const f = fixture(t);
  assert.equal((await f.init()).exitCode, 0);
  assert.equal((await f.invoke(['add', 'seed.json'])).exitCode, 0);
  const calls = [];
  const r = await f.invoke(['tick'], devinRunProcess(calls, {nextQuestions: [{question: 'Which adapter boundary?', decisionIfTrue: 'reuse', decisionIfFalse: 'adapt', kind: 'integration', priority: 4}]}));
  assert.equal(r.exitCode, 0, JSON.stringify(r.json));
  let state = f.state();
  assert.equal(state.runs.length, 1);
  assert.equal(state.runs[0].status, 'completed');
  assert.equal(state.findings[0].epistemicStatus, 'unreviewed');
  assert.equal(state.findings[0].evidence[0].quote, 'announce()');
  assert.equal(state.tasks.length, 2);
  assert.equal(state.tasks[1].parentId, 'q1');
  assert.deepEqual(state.concepts[0].scope, ['docs/']);
  const findingId = state.findings[0].id;
  writeFileSync(path.join(f.root, 'review.json'), JSON.stringify({findingId, verdict: 'qualified', note: 'bounded static evidence', basisFindingIds: [findingId], reviewer: 'codex'}));
  const review = await f.invoke(['review', 'review.json']);
  assert.equal(review.exitCode, 0, JSON.stringify(review.json));
  state = f.state();
  assert.equal(state.reviews.length, 1);
  assert.equal(state.reviews[0].findingId, findingId);
  assert.equal(state.reviews[0].verdict, 'qualified');
  const q = await f.invoke(['query', findingId]);
  assert.equal(q.exitCode, 0);
  assert.equal(q.json.result.reviews.length, 1);
  assert.equal(q.json.result.findings[0].requiresRevalidation, true);
});

test('continuation reuses the frozen session and refuses a changed snapshot', async t => {
  const f = fixture(t);
  assert.equal((await f.init()).exitCode, 0);
  assert.equal((await f.invoke(['add', 'seed.json'])).exitCode, 0);
  let calls = 0, cwd;
  const first = await f.invoke(['tick'], async request => {
    calls += 1; cwd = request.cwd;
    const outputRoot = request.args[request.args.indexOf('--output-root') + 1];
    const directory = path.join(outputRoot, 'devin-acp-1');
    mkdirSync(directory, {recursive: true});
    writeFileSync(path.join(directory, 'result.json'), JSON.stringify({
      status: 'turn_completed', config: {model: 'swe-2-max', mode: 'ask'}, processExitCode: 0, cleanupErrors: [], sessionId: 'session-one',
      finalMessage: '<research-result>' + JSON.stringify({findings: [{statement: 'wrong quote', kind: 'source', evidence: [{path: 'docs/hook.mbt', quote: 'not present'}], limitations: ['static'], decisionImpact: 'x'}], nextQuestions: []}) + '</research-result>',
    }));
    return {exitCode: 0, signal: null, timedOut: false, interrupted: false, forcedTermination: false, cleanupUnverified: false, terminationErrors: []};
  });
  assert.equal(first.exitCode, 0, JSON.stringify(first.json));
  assert.equal(f.state().runs[0].status, 'invalid_output');
  const second = await f.invoke(['continue', 'q1'], async request => {
    calls += 1;
    assert.equal(request.cwd, cwd, 'correction must reuse the frozen working directory');
    assert.equal(request.args[request.args.indexOf('--session') + 1], 'session-one');
    assert.equal(request.args[request.args.indexOf('--model') + 1], 'swe-2-max');
    const outputRoot = request.args[request.args.indexOf('--output-root') + 1];
    const directory = path.join(outputRoot, 'devin-acp-2');
    mkdirSync(directory, {recursive: true});
    writeFileSync(path.join(directory, 'result.json'), JSON.stringify({
      status: 'turn_completed', config: {model: 'swe-2-max', mode: 'ask'}, processExitCode: 0, cleanupErrors: [], sessionId: 'session-one',
      finalMessage: '<research-result>' + JSON.stringify({findings: [{statement: 'correct quote', kind: 'source', evidence: [{path: 'docs/hook.mbt', quote: 'announce()'}], limitations: ['static'], decisionImpact: 'x'}], nextQuestions: []}) + '</research-result>',
    }));
    return {exitCode: 0, signal: null, timedOut: false, interrupted: false, forcedTermination: false, cleanupUnverified: false, terminationErrors: []};
  });
  assert.equal(second.exitCode, 0, JSON.stringify(second.json));
  assert.equal(calls, 2);
  const state = f.state();
  assert.equal(state.runs[1].status, 'completed');
  assert.equal(state.runs[1].continuedFromRunId, state.runs[0].id);
  assert.notEqual(state.runs[1].receipt.artifactDir, state.runs[0].receipt.artifactDir);
  const expected = readFileSync(path.join(f.root, f.source), 'utf8');
  assert.equal(state.findings[0].evidence[0].quote, 'announce()');
  assert.ok(expected.includes(state.findings[0].evidence[0].quote));
});

test('a symlink inside scope refuses the snapshot before any provider launch', async t => {
  const f = fixture(t);
  assert.equal((await f.init()).exitCode, 0);
  assert.equal((await f.invoke(['add', 'seed.json'])).exitCode, 0);
  symlinkSync(path.join(f.root, 'docs', 'hook.mbt'), path.join(f.root, 'docs', 'link.mbt'));
  const calls = [];
  const r = await f.invoke(['tick'], async request => { calls.push(request); throw new Error('provider must not launch'); });
  assert.equal(r.exitCode, 0, JSON.stringify(r.json));
  assert.equal(calls.length, 0);
  const state = f.state();
  assert.equal(state.runs[0].status, 'failed');
  assert.equal(state.findings.length, 0);
});

test('a recovery barrier refuses continuation without launching a provider', async t => {
  const f = fixture(t);
  assert.equal((await f.init()).exitCode, 0);
  assert.equal((await f.invoke(['add', 'seed.json'])).exitCode, 0);
  writeFileSync(path.join(f.dir, 'recovery-needed.json'), JSON.stringify({reason: 'helper_cleanup_unverified'}) + '\n');
  const calls = [];
  const r = await f.invoke(['tick'], async request => { calls.push(request); throw new Error('provider must not launch'); });
  assert.equal(r.exitCode, 1);
  assert.equal(calls.length, 0);
  assert.equal(f.state().findings.length, 0);
});

test('evidence CLI extracts an exact quote read-only from a frozen packet', async t => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'portable-evidence-')));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  mkdirSync(path.join(root, 'src'));
  const text = '\ufeffmodule\r\n\treturn "exact";\r\n';
  writeFileSync(path.join(root, 'src/component.txt'), text);
  writeFileSync(path.join(root, 'packet.json'), JSON.stringify({packetId: 'p', frozenSourceRoot: path.join(root, 'src'), allowedSourceFiles: [{path: 'component.txt', sha256: sha(Buffer.from(text))}]}));
  const script = path.resolve(import.meta.dirname, '..', 'scripts', 'research-evidence.mjs');
  const r = spawnSync(process.execPath, [script, 'quote', '--packet', 'packet.json', '--path', 'component.txt', '--from', '2', '--to', '2'], {cwd: root, encoding: 'utf8', timeout: 30000});
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const json = JSON.parse(r.stdout);
  assert.equal(json.ok, true, JSON.stringify(json));
  assert.equal(json.quote, '\treturn "exact";\r\n');
  assert.equal(readFileSync(path.join(root, 'src/component.txt'), 'utf8'), text);
});

test('skill closure has no Runeweave-wide or hidden helper dependency', () => {
  const skill = path.resolve(import.meta.dirname, '..');
  const manifest = JSON.parse(readFileSync(path.join(skill, 'scripts', 'runtime', 'manifest.json'), 'utf8'));
  assert.equal(manifest.module, 'portable/research');
  assert.match(manifest.tests.find(x => x.path === 'tests/portable-skill.test.mjs').sha256, /^[0-9a-f]{64}$/);
  const forbidden = /runeweave|game-core|external\/rathena|~\/\.codex|moon-toolchain|dev\/lib/i;
  // Origin provenance legitimately names the source repository; the contract
  // forbids a runtime dependency, not an honest origin note. Only
  // references/provenance.md is exempt from the repository-name token; every
  // other forbidden pattern and all runtime-file checks stay in force.
  const forbiddenWithoutOrigin = /game-core|external\/rathena|~\/\.codex|moon-toolchain|dev\/lib/i;
  const privatePath = /\/Users\/|\/private\/|\/var\/folders\//;
  const files = ['SKILL.md', 'references/profile.md', 'references/commands.md', 'references/artifacts.md',
    'references/review-recovery.md', 'references/provenance.md',
    'scripts/research.mjs', 'scripts/research-artifacts.mjs', 'scripts/research-evidence.mjs',
    'scripts/build-runtime.mjs', 'scripts/lib/cli-host.mjs', 'scripts/lib/runtime.mjs',
    ...manifest.sources.map(s => path.join('scripts', 'runtime', s.path))];
  for (const file of files) {
    const body = readFileSync(path.join(skill, file), 'utf8');
    const forbiddenPattern = file === 'references/provenance.md' ? forbiddenWithoutOrigin : forbidden;
    assert.doesNotMatch(body, forbiddenPattern, `${file} must stay project-neutral`);
    assert.doesNotMatch(body, privatePath, `${file} must not embed personal or scratch paths`);
  }
  assert.doesNotMatch(JSON.stringify(manifest), privatePath, 'manifest must not embed absolute scratch paths');
  for (const entry of manifest.entries) {
    assert.ok(existsSync(path.join(skill, 'scripts', 'runtime', entry.file)), entry.file);
  }
  for (const test of manifest.tests) {
    assert.ok(existsSync(path.join(skill, test.path)), test.path);
  }
});
