// Portable review -> revise -> rereview roundtrip against the real writer CLI.
//
// Isolated frozen source/packet/candidate only. No ledger, shared environment
// or live provider is used; the whole flow runs through scripts/research-artifacts.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, realpathSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const script = path.resolve(import.meta.dirname, '..', 'scripts', 'research-artifacts.mjs');

function save(file, value) {
  const bytes = Buffer.from(JSON.stringify(value) + '\n');
  writeFileSync(file, bytes);
  return sha(bytes);
}

test('review -> revise -> rereview preserves open history and binds new candidate hash/round', t => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), 'portable-roundtrip-')));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  const source = 'docs/hook.mbt';
  const text = 'announce()\nsecond line\n';
  mkdirSync(path.join(root, 'source', 'docs'), {recursive: true});
  writeFileSync(path.join(root, 'source', source), text);

  const cli = (...args) => {
    const r = spawnSync(process.execPath, [script, ...args], {cwd: root, encoding: 'utf8', timeout: 30000});
    assert.equal(r.error, undefined, String(r.error));
    let json;
    try { json = JSON.parse(r.stdout); } catch { assert.fail(`structured output required: ${r.stdout}\n${r.stderr}`); }
    return {status: r.status, json};
  };
  const receiptHashesMatch = directory => {
    const receipt = JSON.parse(readFileSync(path.join(directory, 'receipt.json'), 'utf8'));
    for (const file of receipt.files) {
      const bytes = readFileSync(path.join(directory, file.path));
      assert.equal(sha(bytes), file.sha256, `${directory}/${file.path}`);
      assert.equal(bytes.length, file.bytes, `${directory}/${file.path}`);
    }
  };

  const finding = {id: 'f1', runId: 'run-one', snapshotId: 'snap-one', statement: 'announce exists', kind: 'source',
    evidence: [{path: source, quote: 'announce()'}], limitations: ['static'], decisionImpact: 'reuse candidate'};
  const candidate = {findings: [finding], proposedTaskIds: ['q1']};
  const candidateFile = path.join(root, 'candidate.json');
  const candidateHash = save(candidateFile, candidate);
  const packet = {packetId: 'packet-one', frozenSourceRoot: path.join(root, 'source'),
    allowedSourceFiles: [{path: source, sha256: sha(Buffer.from(text))}],
    selectedFindings: [{...finding, findingId: 'f1'}], tasks: [{taskId: 'q1'}],
    peerReview: {round: 1, reviewedArtifactSha256: candidateHash, candidateDraft: candidate, previousIssues: []}};
  save(path.join(root, 'packet.json'), packet);

  const issue = {id: 'P1', findingId: 'f1', state: 'open', note: 'qualify inference'};
  save(path.join(root, 'review-draft.json'), {
    reviews: [{findingId: 'f1', verdict: 'qualified', note: 'static only', basisFindingIds: ['f1'],
      sourceRefs: [{path: source, fromLine: 1, toLine: 1, kind: 'scope_limit'}], remainingChecks: []}],
    questionActions: [], infrastructureObservations: [],
    coverage: {unreadSources: [], unperformedChecks: []},
    peerReview: {disposition: 'changes_requested', issues: [issue]},
  });
  const review = cli('review', '--packet', 'packet.json', '--candidate', 'candidate.json', '--draft', 'review-draft.json', '--out', 'review');
  assert.equal(review.status, 0, JSON.stringify(review.json));
  const firstReview = JSON.parse(readFileSync(path.join(root, 'review/review.json'), 'utf8'));
  assert.equal(firstReview.peerReview.round, 1);
  assert.equal(firstReview.peerReview.reviewedArtifactSha256, candidateHash);
  assert.deepEqual(firstReview.peerReview.issues, [issue]);
  assert.deepEqual(firstReview.coverage.reviewedFindingIds, ['f1']);
  assert.equal(firstReview.reviews[0].sourceChecks[0].quote, 'announce()\n');
  assert.equal(firstReview.reviews[0].sourceChecks[0].line, 1);
  receiptHashesMatch(path.join(root, 'review'));
  const candidateBefore = readFileSync(candidateFile);

  const responses = [{id: 'P1', state: 'resolved', note: 'qualified claim'}];
  save(path.join(root, 'revision-draft.json'), {
    findingPatches: [{findingId: 'f1', statement: 'narrowed observation', limitations: ['static'], decisionImpact: 'requires runtime check'}],
    issueResponses: responses, remainingChecks: [],
  });
  const revised = cli('revise', '--packet', 'packet.json', '--candidate', 'candidate.json',
    '--review', 'review/review.json', '--draft', 'revision-draft.json', '--out', 'revision');
  assert.equal(revised.status, 0, JSON.stringify(revised.json));
  assert.deepEqual(readFileSync(candidateFile), candidateBefore, 'original candidate must stay byte-identical');

  const revisedPacket = JSON.parse(readFileSync(path.join(root, 'revision/packet.json'), 'utf8'));
  const revisedCandidateBytes = readFileSync(path.join(root, 'revision/candidate.json'));
  assert.equal(revisedPacket.peerReview.round, 2);
  assert.deepEqual(revisedPacket.peerReview.previousIssues, [issue], 'previousIssues must retain the original open issue');
  assert.deepEqual(revisedPacket.peerReview.authorResponses, responses);
  assert.equal(revisedPacket.peerReview.reviewedArtifactSha256, sha(revisedCandidateBytes));
  const revisedCandidate = JSON.parse(revisedCandidateBytes);
  assert.equal(revisedCandidate.findings[0].id, 'f1');
  assert.equal(revisedCandidate.findings[0].statement, 'narrowed observation');
  assert.deepEqual(revisedCandidate.findings[0].evidence, [{path: source, quote: 'announce()'}]);
  receiptHashesMatch(path.join(root, 'revision'));

  save(path.join(root, 'rereview-draft.json'), {
    reviews: [{findingId: 'f1', verdict: 'supported', note: 'new candidate qualifies', basisFindingIds: ['f1'],
      sourceRefs: [{path: source, fromLine: 2, toLine: 2, kind: 'support'}], remainingChecks: []}],
    questionActions: [], infrastructureObservations: [],
    coverage: {unreadSources: [], unperformedChecks: []},
    peerReview: {disposition: 'no_open_issues', issues: [{id: 'P1', findingId: 'f1', state: 'resolved', note: 'resolved on new candidate'}]},
  });
  const rereview = cli('review', '--packet', 'revision/packet.json', '--candidate', 'revision/candidate.json',
    '--draft', 'rereview-draft.json', '--out', 'rereview');
  assert.equal(rereview.status, 0, JSON.stringify(rereview.json));
  const secondReview = JSON.parse(readFileSync(path.join(root, 'rereview/review.json'), 'utf8'));
  assert.equal(secondReview.peerReview.round, 2);
  assert.equal(secondReview.peerReview.reviewedArtifactSha256, sha(revisedCandidateBytes));
  assert.equal(secondReview.peerReview.disposition, 'no_open_issues');
  assert.equal(secondReview.peerReview.issues[0].state, 'resolved');
  assert.deepEqual(secondReview.coverage.reviewedFindingIds, ['f1']);
  assert.equal(secondReview.reviews[0].sourceChecks[0].quote, 'second line\n');
  receiptHashesMatch(path.join(root, 'rereview'));
  assert.ok(existsSync(path.join(root, 'rereview/receipt.json')));
});
