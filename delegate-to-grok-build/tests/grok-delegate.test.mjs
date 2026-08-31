import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import {
  access,
  appendFile,
  chmod,
  mkdir,
  mkdtemp,
  readlink,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.dirname(TEST_DIR);
const CLI = path.join(SKILL_DIR, "scripts", "grok-delegate.mjs");
const MOCK_GROK = path.join(TEST_DIR, "fixtures", "mock-grok.mjs");
const SENTINEL = "PRIVATE_SENTINEL_9f74";
const REAL_TMP = realpathSync(os.tmpdir());
const SAFE_TEST_PATH = [...new Set([path.dirname(process.execPath), "/usr/bin", "/bin"])].join(path.delimiter);
const TEST_AUTH_ROOT = mkdtempSync(path.join(REAL_TMP, "grok-delegate-auth-"));
const TEST_AUTH_PATH = path.join(TEST_AUTH_ROOT, "auth.json");
mkdirSync(TEST_AUTH_ROOT, { recursive: true, mode: 0o700 });
writeFileSync(TEST_AUTH_PATH, "{}\n", { mode: 0o600 });
process.on("exit", () => rmSync(TEST_AUTH_ROOT, { recursive: true, force: true }));

function git(cwd, ...argv) {
  return execFileSync("git", ["-C", cwd, ...argv], {
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_TERMINAL_PROMPT: "0",
      GIT_OPTIONAL_LOCKS: "0",
    },
  }).trim();
}

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function exists(value) {
  try { await access(value); return true; } catch { return false; }
}

async function makeRepo(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "grok-delegate-repo-"));
  t.after(async () => rm(root, { recursive: true, force: true }));
  git(root, "init", "-q");
  git(root, "config", "user.name", "Test User");
  git(root, "config", "user.email", "test@example.invalid");
  await mkdir(path.join(root, "src", "protected"), { recursive: true });
  await writeFile(path.join(root, "src", "base.txt"), "base\n");
  await writeFile(path.join(root, "src", "delete.txt"), "delete\n");
  await writeFile(path.join(root, "src", "mode.txt"), "mode\n");
  await writeFile(path.join(root, "src", "rename.txt"), "rename\n");
  await writeFile(path.join(root, "src", "protected", "keep.txt"), "protected\n");
  git(root, "add", "-A");
  git(root, "commit", "-qm", "base");
  const stateDir = await mkdtemp(path.join(os.tmpdir(), "grok-delegate-state-"));
  t.after(async () => rm(stateDir, { recursive: true, force: true }));
  const logPath = path.join(root, "..", `mock-${path.basename(root)}.jsonl`);
  t.after(async () => { try { await unlink(logPath); } catch { /* Absent is fine. */ } });
  return { root, stateDir, logPath };
}

function baseTask(repository, overrides = {}) {
  const task = {
    schemaVersion: 1,
    task: {
      id: "delegation-test",
      objective: "Implement the frozen test change.",
      taskClass: "feature",
      granularity: "deep",
      acceptanceCriteria: [{ id: "ac-focused", text: "The focused verifier passes.", verifyWith: ["verify-focused"] }],
      constraints: ["Keep the source checkout isolated."],
      expectedChange: "required",
      writeScope: [{ kind: "prefix", path: "src" }],
      protectedPaths: ["src/protected"],
      antiCheat: ["Do not weaken tests."],
      residue: [{ id: "human-quality", judgment: "Review semantic quality.", owner: "human" }],
    },
    repository: { path: repository, base: "HEAD", dirtyPolicy: "reject" },
    authorization: {
      network: false,
      installDependencies: false,
      commit: false,
      push: false,
      externalSideEffects: false,
    },
    agent: {
      timeoutMs: 5_000,
      cancelGraceMs: 200,
      model: null,
      reasoningEffort: null,
      executionProfile: "trusted_local",
      sandbox: null,
      inheritEnv: ["MOCK_SCENARIO", "MOCK_LOG", "MOCK_SENTINEL"],
      shellPermissions: [{
        id: "shell-focused",
        match: "exact",
        argv: ["node", "--test", "test/focused.test.mjs"],
      }],
    },
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "process.exit(process.env.AWS_SECRET_ACCESS_KEY||process.env.XAI_API_KEY?23:0)"],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
      requireDiffCheck: true,
    },
    limits: { maxRounds: 3, maxPatchBytes: 1024 * 1024, maxArtifactBytes: 64 * 1024 },
  };
  for (const [section, values] of Object.entries(overrides)) {
    if (section in task && values && typeof values === "object" && !Array.isArray(values)) {
      task[section] = { ...task[section], ...values };
    } else {
      task[section] = values;
    }
  }
  return task;
}

function runCli({ args, input = null, scenario = "success", logPath = null, extraEnv = {}, timeout = 15_000 }) {
  const result = spawnSync(process.execPath, [CLI, ...args], {
    input: input === null ? undefined : JSON.stringify(input),
    encoding: "utf8",
    timeout,
    env: {
      ...process.env,
      PATH: SAFE_TEST_PATH,
      MOCK_SCENARIO: scenario,
      MOCK_LOG: logPath ?? "",
      MOCK_SENTINEL: SENTINEL,
      GROK_AUTH_PATH: TEST_AUTH_PATH,
      ...extraEnv,
    },
  });
  const lines = result.stdout.trim() ? result.stdout.trimEnd().split("\n").map((line) => JSON.parse(line)) : [];
  return { ...result, lines, json: lines.at(-1) ?? null };
}

function startArgs(stateDir, stream = false) {
  return ["start", "--state-dir", stateDir, "--grok-bin", MOCK_GROK, ...(stream ? ["--stream"] : [])];
}

function transactionDir(stateDir, result) {
  return path.join(stateDir, result.transactionId);
}

async function sourceSnapshot(repository) {
  const gitDir = git(repository, "rev-parse", "--git-dir");
  const index = await readFile(path.resolve(repository, gitDir, "index"));
  return {
    head: git(repository, "rev-parse", "HEAD"),
    index: digest(index),
    status: git(repository, "status", "--porcelain=v2", "--untracked-files=all"),
    files: git(repository, "ls-files", "-s"),
  };
}

async function readLog(logPath) {
  if (!(await exists(logPath))) return [];
  return (await readFile(logPath, "utf8")).trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

async function treeContainsAny(root, values) {
  const needles = values.map((value) => Buffer.from(value));
  const walk = async (directory) => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (needles.some((needle) => Buffer.from(entry.name).includes(needle))) return true;
      if (entry.isDirectory()) {
        if (await walk(target)) return true;
      } else if (entry.isSymbolicLink()) {
        const linkTarget = await readlink(target);
        if (needles.some((needle) => Buffer.from(linkTarget).includes(needle))) return true;
      } else if (entry.isFile()) {
        const content = await readFile(target);
        if (needles.some((needle) => content.includes(needle))) return true;
      }
    }
    return false;
  };
  return walk(root);
}

test("strict schema rejects unknown fields, unsafe paths, authorization, raw shell form, and secret env names", async (t) => {
  const fixture = await makeRepo(t);
  const cases = [
    { mutate: (task) => { task.extra = true; }, kind: "validation" },
    { mutate: (task) => { task.task.writeScope[0].path = "../escape"; }, kind: "validation" },
    { mutate: (task) => { task.authorization.network = true; }, kind: "authorization" },
    { mutate: (task) => { task.verification.commands[0].command = "node --test"; }, kind: "validation" },
    { mutate: (task) => { task.agent.inheritEnv.push("AWS_SECRET_ACCESS_KEY"); }, kind: "validation" },
    { mutate: (task) => { task.agent.inheritEnv.push("GROK_AUTH_PATH"); }, kind: "validation" },
    ...[
      "GROK_AUTH_PROVIDER_COMMAND",
      "GROK_API_URL",
      "XAI_BASE_URL",
      "OPENAI_BASE_URL",
      "DYLD_INSERT_LIBRARIES",
      "LD_PRELOAD",
      "GIT_CONFIG_COUNT",
      "NODE_OPTIONS",
      "BUN_OPTIONS",
      "DENO_DIR",
      "PYTHONPATH",
      "BASH_ENV",
      "HTTPS_PROXY",
      "SSL_CERT_FILE",
    ].map((name) => ({
      mutate: (task) => { task.agent.inheritEnv.push(name); },
      kind: "validation",
    })),
    { mutate: (task) => { task.verification.commands.push({ ...task.verification.commands[0] }); }, kind: "validation" },
  ];
  for (const { mutate, kind } of cases) {
    const task = baseTask(fixture.root);
    mutate(task);
    const result = runCli({ args: startArgs(fixture.stateDir), input: task, logPath: fixture.logPath });
    assert.equal(result.status, 2);
    assert.equal(result.lines.length, 1);
    assert.equal(result.json.type, "result");
    assert.equal(result.json.ok, false);
    assert.equal(result.json.error.kind, kind);
  }
});

test("successful start keeps source HEAD/index/files unchanged and produces one candidate result", async (t) => {
  const fixture = await makeRepo(t);
  const before = await sourceSnapshot(fixture.root);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { AWS_SECRET_ACCESS_KEY: "must-not-reach-children", XAI_API_KEY: "not-task-approved" },
  });
  assert.equal(result.status, 0, `${result.stderr}\n${JSON.stringify(result.json)}`);
  assert.equal(result.lines.length, 1);
  assert.equal(result.json.ok, true);
  assert.equal(result.json.state, "candidate_ready");
  assert.equal(result.json.candidate.patch.changedPaths.some((item) => item.newPath === "src/result.txt"), true);
  assert.deepEqual(await sourceSnapshot(fixture.root), before);
  assert.equal(result.stdout.includes(SENTINEL), false);
  assert.equal("sessionId" in result.json, false);
  const txDir = await realpath(transactionDir(fixture.stateDir, result.json));
  assert.equal((await stat(txDir)).mode & 0o777, 0o700);
  assert.equal((await stat(path.join(txDir, "manifest.json"))).mode & 0o777, 0o600);
  assert.equal((await stat(path.join(txDir, result.json.candidate.patch.path))).mode & 0o777, 0o600);

  const logs = await readLog(fixture.logPath);
  const prompt = logs.find((item) => item.type === "prompt");
  assert.ok(prompt);
  const args = prompt.args;
  assert.ok(args.indexOf("--no-auto-update") < args.indexOf("agent"));
  assert.ok(args.indexOf("--cwd") < args.indexOf("agent"));
  assert.ok(args.indexOf("--permission-mode") < args.indexOf("agent"));
  assert.deepEqual(args.slice(-3), ["agent", "--no-leader", "stdio"]);
  assert.equal(prompt.env.includes("AWS_SECRET_ACCESS_KEY"), false);
  assert.equal(prompt.env.includes("XAI_API_KEY"), false);
  assert.equal(prompt.env.includes("GROK_SUBAGENTS"), true);
  assert.equal(prompt.home, path.join(txDir, "runtime-home"));
  assert.equal(prompt.grokHome, path.join(txDir, "grok-home"));
  assert.equal(prompt.grokAuthPath, TEST_AUTH_PATH);
  assert.equal(prompt.grokControls.GROK_SUBAGENTS, "false");
  assert.equal(prompt.grokControls.GROK_REMEMBER_TOOL_APPROVALS, "false");
  assert.equal(prompt.grokControls.GROK_DEFAULT_SELECTED_PERMISSION, "allow_once");
  for (const family of ["CLAUDE", "CURSOR", "CODEX"]) {
    for (const feature of ["SKILLS", "RULES", "AGENTS", "MCPS", "HOOKS", "SESSIONS"]) {
      const name = `GROK_${family}_${feature}_ENABLED`;
      assert.equal(prompt.env.includes(name), true);
      assert.equal(prompt.grokControls[name], "false");
    }
  }
  const config = await readFile(path.join(txDir, "grok-home", "config.toml"), "utf8");
  assert.match(config, /permission_mode = "ask"/);
  assert.match(config, /default_selected_permission = "allow_once"/);
  assert.match(config, /remember_tool_approvals = false/);
  assert.match(config, /ask = \["Edit", "Write", "Bash"\]/);
  assert.match(config, /"Read\(\*\*\/auth\.json\)"/);
  assert.match(config, /"Grep\(\*\*\/auth\.json\)"/);
  assert.equal(result.stdout.includes(TEST_AUTH_PATH), false);
  assert.equal(prompt.prompt.includes(fixture.root), false);
  assert.match(prompt.prompt, /"path": "\."/);
});

test("trusted_local cached auth rejects shared or linked source files before Grok spawn", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-unsafe-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const wrongName = path.join(authRoot, "cached-token.json");
  await writeFile(wrongName, "{}\n", { mode: 0o600 });
  const named = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: wrongName },
  });
  assert.equal(named.status, 1);
  assert.equal(named.json.error.kind, "authentication");
  const sharedDir = path.join(authRoot, "shared");
  await mkdir(sharedDir, { mode: 0o700 });
  const sharedAuth = path.join(sharedDir, "auth.json");
  await writeFile(sharedAuth, "{}\n", { mode: 0o644 });
  const shared = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: sharedAuth },
  });
  assert.equal(shared.status, 1);
  assert.equal(shared.json.error.kind, "authentication");
  assert.equal((await readLog(fixture.logPath)).some((item) => item.type === "prompt"), false);

  const target = path.join(authRoot, "target.json");
  const linkedDir = path.join(authRoot, "linked");
  await mkdir(linkedDir, { mode: 0o700 });
  const linkedAuth = path.join(linkedDir, "auth.json");
  await writeFile(target, "{}\n", { mode: 0o600 });
  await symlink(target, linkedAuth);
  const linked = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: linkedAuth },
  });
  assert.equal(linked.status, 1);
  assert.equal(linked.json.error.kind, "authentication");
  assert.equal((await readLog(fixture.logPath)).some((item) => item.type === "prompt"), false);
});

test("trusted_local rejects duplicate cached-auth object keys before Grok can echo either scalar", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-duplicate-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const authPath = path.join(authRoot, "auth.json");
  const priorSecret = "DUPLICATE_PRIOR_AUTH_SENTINEL_86cda410";
  const finalSecret = "DUPLICATE_FINAL_AUTH_SENTINEL_2e7934bf";
  await writeFile(
    authPath,
    `{"access_token":${JSON.stringify(priorSecret)},"access_token":${JSON.stringify(finalSecret)}}\n`,
    { mode: 0o600 },
  );
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "auth_timeout_path",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.error.kind, "authentication");
  assert.equal((await readLog(fixture.logPath)).some((item) => item.type === "prompt"), false);
  for (const secret of [priorSecret, finalSecret]) {
    assert.equal(result.stdout.includes(secret), false);
    assert.equal(result.stderr.includes(secret), false);
  }
  assert.equal(await treeContainsAny(fixture.stateDir, [priorSecret, finalSecret]), false);
});

test("trusted_local redacts nested cached-auth scalars from stream, result, and transaction state", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-redacted-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const authPath = path.join(authRoot, "auth.json");
  const secrets = [
    "ZX91ACCS_SENTINEL_91c4e8a7",
    "QF28REFR_SENTINEL_02d9fb36",
    "LM73ARRY_SENTINEL_775ec010",
  ];
  const authContent = `${JSON.stringify({
    access_token: secrets[0],
    nested: { refresh_token: secrets[1] },
    values: [secrets[2]],
  })}\n`;
  await writeFile(authPath, authContent, { mode: 0o600 });
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "auth_echo",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
  });
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(result.json.state, "candidate_ready");
  const txDir = transactionDir(fixture.stateDir, result.json);
  const manifest = JSON.parse(await readFile(path.join(txDir, "manifest.json"), "utf8"));
  const splitFragments = [
    secrets[0].slice(0, Math.floor(secrets[0].length / 2)),
    secrets[0].slice(Math.floor(secrets[0].length / 2)),
    manifest.sessionId.slice(0, Math.floor(manifest.sessionId.length / 2)),
    manifest.sessionId.slice(Math.floor(manifest.sessionId.length / 2)),
  ];
  const publicForbidden = [
    authPath,
    digest(authContent),
    manifest.sessionId,
    ...secrets,
    ...secrets.map(digest),
    ...splitFragments,
  ];
  for (const value of publicForbidden) {
    assert.equal(result.stdout.includes(value), false);
    assert.equal(result.stderr.includes(value), false);
  }
  assert.ok(result.lines.some((line) => line.type === "message" && line.text.includes("[REDACTED]")));
  assert.equal(result.json.agentReport.summary.includes("[REDACTED]"), true);
  const privateForbidden = [authPath, digest(authContent), ...secrets, ...secrets.map(digest)];
  assert.equal(await treeContainsAny(txDir, privateForbidden), false);
  assert.equal(await exists(path.join(txDir, "auth.json")), false);
  assert.equal(await exists(path.join(txDir, "grok-home", "auth.json")), false);

  const boundaryFixture = await makeRepo(t);
  const boundary = runCli({
    args: startArgs(boundaryFixture.stateDir, true),
    input: baseTask(boundaryFixture.root),
    scenario: "auth_boundary_echo",
    logPath: boundaryFixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
  });
  assert.equal(boundary.status, 1, `${boundary.stderr}\n${boundary.stdout}`);
  assert.ok(boundary.json.permissionAudit.violations.some((item) => item.code === "agent_output_limit"));
  for (const value of [...secrets, secrets[0].slice(0, 8), secrets[1].slice(0, 8)]) {
    assert.equal(boundary.stdout.includes(value), false);
    assert.equal(boundary.stderr.includes(value), false);
  }
  assert.equal(boundary.lines.some((line) => line.type === "message"), false);
  const boundaryTx = transactionDir(boundaryFixture.stateDir, boundary.json);
  assert.equal(await treeContainsAny(boundaryTx, privateForbidden), false);
});

test("trusted_local detects cached auth mutation after a round and cannot continue", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-mutating-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const authPath = path.join(authRoot, "auth.json");
  await writeFile(authPath, "{}\n", { mode: 0o600 });
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "auth_mutation",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.error.kind, "auth_source_mutation");
  assert.equal(result.json.recoverable, false);
  assert.equal(result.lines.length, 1);
  assert.equal(result.lines[0].type, "result");
  assert.equal(result.stdout.includes(authPath), false);
  assert.equal(result.stdout.includes("MUTATED_AUTH_SENTINEL_f0c729ab"), false);
  const txDir = transactionDir(fixture.stateDir, result.json);
  assert.equal(await exists(path.join(txDir, "auth.json")), false);
  assert.equal(await exists(path.join(txDir, "grok-home", "auth.json")), false);
});

test("unreadable post-round auth suppresses all dynamic ACP state that cannot be redacted", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-malformed-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const authPath = path.join(authRoot, "auth.json");
  const dynamicSecret = "POSTCHECK_AUTH_SENTINEL_d6b1702f";
  await writeFile(authPath, "{}\n", { mode: 0o600 });
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "auth_malformed_dynamic",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.error.kind, "auth_source_mutation");
  assert.equal(result.json.recoverable, false);
  assert.equal(result.lines.length, 1);
  assert.equal(result.json.candidate, null);
  assert.equal(result.json.agentReport, null);
  assert.deepEqual(result.json.permissionAudit.decisions, []);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "auth_redaction_incomplete"));
  const txDir = transactionDir(fixture.stateDir, result.json);
  const manifestText = await readFile(path.join(txDir, "manifest.json"), "utf8");
  for (const surface of [result.stdout, result.stderr, manifestText]) {
    assert.equal(surface.includes(dynamicSecret), false);
  }
  assert.equal(await treeContainsAny(txDir, [dynamicSecret]), false);
});

test("cached-auth timeout never persists or publishes secret-bearing partial patch paths", async (t) => {
  const fixture = await makeRepo(t);
  const authRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-timeout-auth-"));
  t.after(async () => rm(authRoot, { recursive: true, force: true }));
  const authPath = path.join(authRoot, "auth.json");
  const authSecret = "TIMEOUT_AUTH_SENTINEL_3a910dce";
  await writeFile(authPath, `${JSON.stringify({ access_token: authSecret })}\n`, { mode: 0o600 });
  const task = baseTask(fixture.root, { agent: { timeoutMs: 500, cancelGraceMs: 100 } });
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: task,
    scenario: "auth_timeout_path",
    logPath: fixture.logPath,
    extraEnv: { GROK_AUTH_PATH: authPath },
    timeout: 10_000,
  });
  assert.equal(result.status, 124, `${result.stderr}\n${result.stdout}`);
  assert.equal(result.json.error.kind, "timeout");
  assert.equal(result.json.candidate, null);
  assert.equal(result.lines.length, 1);
  const txDir = transactionDir(fixture.stateDir, result.json);
  const manifestPath = path.join(txDir, "manifest.json");
  const manifestText = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  assert.equal(result.stdout.includes(authSecret), false);
  assert.equal(result.stdout.includes(manifest.sessionId), false);
  assert.equal(result.stderr.includes(authSecret), false);
  assert.equal(manifestText.includes(authSecret), false);
  assert.equal(await exists(path.join(txDir, "artifacts", "round-1", "candidate.patch.partial")), false);
});

test("state root overlap and shared permissions fail before transaction creation without mutation", async (t) => {
  const fixture = await makeRepo(t);
  const sourceMode = (await stat(fixture.root)).mode & 0o777;
  const sourceBefore = await sourceSnapshot(fixture.root);
  const overlap = runCli({
    args: ["start", "--state-dir", fixture.root, "--grok-bin", MOCK_GROK],
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(overlap.status, 2);
  assert.equal(overlap.json.transactionId, null);
  assert.equal(overlap.json.error.kind, "state_source_overlap");
  assert.equal((await stat(fixture.root)).mode & 0o777, sourceMode);
  assert.deepEqual(await sourceSnapshot(fixture.root), sourceBefore);

  const shared = await mkdtemp(path.join(os.tmpdir(), "grok-delegate-shared-"));
  t.after(async () => rm(shared, { recursive: true, force: true }));
  await chmod(shared, 0o755);
  const sharedResult = runCli({
    args: startArgs(shared),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(sharedResult.status, 2);
  assert.equal(sharedResult.json.transactionId, null);
  assert.equal(sharedResult.json.error.kind, "state");
  assert.equal((await stat(shared)).mode & 0o777, 0o755);
  assert.deepEqual(await sourceSnapshot(fixture.root), sourceBefore);
  assert.deepEqual(await readdir(shared), []);
});

test("state root cannot overlap an external Git metadata directory", async (t) => {
  const container = await mkdtemp(path.join(os.tmpdir(), "grok-delegate-external-git-"));
  t.after(async () => rm(container, { recursive: true, force: true }));
  const root = path.join(container, "worktree");
  const gitDir = path.join(container, "metadata");
  await mkdir(root, { recursive: true });
  execFileSync("git", ["init", "-q", "--separate-git-dir", gitDir, root]);
  git(root, "config", "user.name", "Test User");
  git(root, "config", "user.email", "test@example.invalid");
  await mkdir(path.join(root, "src"), { recursive: true });
  await writeFile(path.join(root, "src", "base.txt"), "base\n");
  git(root, "add", "-A");
  git(root, "commit", "-qm", "base");
  const stateInsideGit = path.join(gitDir, "delegate-state");
  const result = runCli({
    args: startArgs(stateInsideGit),
    input: baseTask(root),
    scenario: "success",
    logPath: path.join(container, "mock.jsonl"),
  });
  assert.equal(result.status, 2);
  assert.equal(result.json.transactionId, null);
  assert.equal(result.json.error.kind, "state_source_overlap");
  assert.equal(await exists(stateInsideGit), false);
  assert.equal(await readFile(path.join(root, "src", "base.txt"), "utf8"), "base\n");
});

test("a model claim cannot pass required verification or the required-patch gate", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "process.exit(7)"],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const result = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "claim_only", logPath: fixture.logPath });
  assert.equal(result.status, 1);
  assert.equal(result.json.state, "verifying");
  assert.equal(result.json.agentReport.summary.includes("claim"), true);
  assert.equal(result.json.verification[0].status, "failed");
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "required_verification_failed"));
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "empty_required_patch"));
});

test("hardened profile probes its external verifier sandbox before any Grok spawn", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    agent: {
      executionProfile: "hardened",
      sandbox: "strict",
      inheritEnv: ["XAI_API_KEY", "MOCK_SCENARIO", "MOCK_LOG", "MOCK_SENTINEL"],
    },
  });
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { XAI_API_KEY: "test-only-key" },
  });
  assert.ok([0, 1].includes(result.status), `${result.stderr}\n${JSON.stringify(result.json)}`);
  const prompt = (await readLog(fixture.logPath)).find((item) => item.type === "prompt");
  const txDir = await realpath(transactionDir(fixture.stateDir, result.json));
  const profile = await readFile(path.join(txDir, "verifier-sandbox.sb"), "utf8");
  assert.match(profile, /^\(deny default\)$/m);
  assert.match(profile, /\(deny network\*\)/);
  assert.match(profile, /SOURCE_ROOT/);
  assert.match(profile, /WORKSPACE_GIT_DIR/);
  assert.equal(profile.includes(fixture.root), false);
  if (result.json.error?.kind === "verifier_sandbox") {
    assert.equal(prompt, undefined);
    assert.equal(await exists(path.join(txDir, "grok-home")), false);
  } else {
    assert.equal(result.status, 0, `${result.stderr}\n${JSON.stringify(result.json)}`);
    assert.ok(prompt);
    assert.equal(prompt.hasXaiApiKey, true);
    assert.equal(prompt.home, path.join(txDir, "grok-home"));
    assert.equal(prompt.grokHome, path.join(txDir, "grok-home"));
    assert.equal(prompt.args.includes("--sandbox"), true);
    assert.equal(prompt.args[prompt.args.indexOf("--sandbox") + 1], "strict");
    assert.equal((await stat(path.join(txDir, "grok-home"))).mode & 0o777, 0o700);
    assert.equal((await stat(path.join(txDir, "grok-home", "config.toml"))).mode & 0o777, 0o600);
    const config = await readFile(path.join(txDir, "grok-home", "config.toml"), "utf8");
    assert.match(config, /^\[permission\]$/m);
    assert.match(config, /ask = \["Edit", "Write", "Bash"\]/);
    assert.match(config, /"MCPTool\(\*\)"/);
    assert.match(config, /"WebSearch\(\*\)"/);
    assert.match(config, /"Bash\(git push \*\)"/);
  }

  const missing = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { XAI_API_KEY: "" },
  });
  assert.equal(missing.status, 2);
  assert.equal(missing.json.error.kind, "authentication");
});

test("hardened verifier sandbox denies an absolute source write", async (t) => {
  const fixture = await makeRepo(t);
  const original = await readFile(path.join(fixture.root, "src", "base.txt"), "utf8");
  const code = `require('node:fs').writeFileSync(${JSON.stringify(path.join(fixture.root, "src", "base.txt"))},'sandbox-escape\\n')`;
  const task = baseTask(fixture.root, {
    agent: {
      executionProfile: "hardened",
      sandbox: "strict",
      inheritEnv: ["XAI_API_KEY", "MOCK_SCENARIO", "MOCK_LOG", "MOCK_SENTINEL"],
    },
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", code], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const result = runCli({
    args: startArgs(fixture.stateDir), input: task, scenario: "success", logPath: fixture.logPath,
    extraEnv: { XAI_API_KEY: "sandbox-test-key" },
  });
  assert.equal(result.status, 1, `${result.stderr}\n${JSON.stringify(result.json)}`);
  if (result.json.error.kind === "verifier_sandbox") assert.deepEqual(result.json.verification, []);
  else assert.equal(result.json.verification[0].status, "failed");
  assert.equal(await readFile(path.join(fixture.root, "src", "base.txt"), "utf8"), original);
});

test("trusted_local detects but does not claim to prevent a hostile verifier source write", async (t) => {
  const fixture = await makeRepo(t);
  const target = path.join(fixture.root, "src", "base.txt");
  const code = `require('node:fs').writeFileSync(${JSON.stringify(target)},'trusted-hostile-write\\n')`;
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", code], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const result = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "success", logPath: fixture.logPath });
  assert.equal(result.status, 1);
  assert.equal(result.json.error.kind, "source_mutation");
  assert.equal(result.json.recoverable, false);
  assert.equal(await readFile(target, "utf8"), "trusted-hostile-write\n");
});

test("exact inherited key values are redacted from stream and agent report text", async (t) => {
  const fixture = await makeRepo(t);
  const inheritedKey = "xai-private-key-value-123456";
  const task = baseTask(fixture.root, {
    agent: {
      executionProfile: "trusted_local",
      sandbox: null,
      inheritEnv: ["XAI_API_KEY", "MOCK_SCENARIO", "MOCK_LOG", "MOCK_SENTINEL"],
    },
  });
  const result = runCli({
    args: startArgs(fixture.stateDir, true), input: task, scenario: "redact_key", logPath: fixture.logPath,
    extraEnv: { XAI_API_KEY: inheritedKey },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.includes(inheritedKey), false);
  assert.equal(result.stdout.includes("[REDACTED]"), true);
});

test("exact inherited values are redacted from every public candidate and permission path", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "path_redaction",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.includes(SENTINEL), false);
  assert.equal(result.stdout.includes("src/[REDACTED].txt"), true);
  assert.ok(result.json.candidate.patch.changedPaths.some((item) => item.newPath === "src/[REDACTED].txt"));
  assert.ok(result.json.permissionAudit.decisions.some((item) => item.paths.includes("src/[REDACTED].txt")));
  assert.equal(result.json.agentReport.summary.includes("[REDACTED]"), true);
  assert.equal(result.json.agentReport.changes[0].path, "src/[REDACTED].txt");
});

test("out-of-scope and protected permission activity prevents candidate_ready", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario: "out_of_scope", logPath: fixture.logPath });
  assert.equal(result.status, 1);
  assert.notEqual(result.json.state, "candidate_ready");
  assert.ok(result.json.permissionAudit.rejectedCount >= 1);
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "scope_violation" || item.kind === "policy_violation"));
  assert.equal(await exists(path.join(fixture.root, "outside.txt")), false);
});

test("optional verifier failure is reported but does not alone block readiness", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "process.exit(9)"],
        cwd: ".",
        timeoutMs: 3_000,
        required: false,
      }],
    },
  });
  const result = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "success", logPath: fixture.logPath });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.state, "candidate_ready");
  assert.equal(result.json.verification[0].status, "failed");
  assert.equal(result.json.verification[0].required, false);
});

test("candidate metadata records renames, binary additions, and mode changes", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "rename_binary_mode",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, result.stderr);
  const changes = result.json.candidate.patch.changedPaths;
  assert.ok(changes.some((item) => item.status === "R" && item.oldPath === "src/base.txt" && item.newPath === "src/renamed.txt"));
  assert.ok(changes.some((item) => item.newPath === "src/data.bin" && item.binary === true));
  assert.ok(changes.some((item) => item.newPath === "src/mode.txt" && item.oldMode === "100644" && item.newMode === "100755"));
});

test("verifier mutation and artifact overflow are mechanically detected", async (t) => {
  const fixture = await makeRepo(t);
  const mutationCode = "require('node:fs').writeFileSync('src/verifier.txt','mutation\\n')";
  const mutationTask = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", mutationCode], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const mutated = runCli({ args: startArgs(fixture.stateDir), input: mutationTask, scenario: "success", logPath: fixture.logPath });
  assert.equal(mutated.status, 1);
  assert.equal(mutated.json.verification[0].mutatedWorkspace, true);
  assert.ok(mutated.json.candidate.violations.some((item) => item.kind === "verification_mutated_workspace"));
  assert.equal(mutated.json.recoverable, false);

  const fixtureSamePath = await makeRepo(t);
  const overwriteCode = "require('node:fs').writeFileSync('src/result.txt','verifier-overwrite\\n')";
  const overwriteTask = baseTask(fixtureSamePath.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", overwriteCode], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const overwritten = runCli({
    args: startArgs(fixtureSamePath.stateDir), input: overwriteTask, scenario: "success", logPath: fixtureSamePath.logPath,
  });
  assert.equal(overwritten.status, 1);
  assert.equal(overwritten.json.verification[0].mutatedWorkspace, true);
  assert.ok(overwritten.json.candidate.violations.some((item) => item.kind === "verification_mutated_workspace"));
  assert.equal(overwritten.json.recoverable, false);

  const fixture2 = await makeRepo(t);
  const overflowTask = baseTask(fixture2.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", `process.stdout.write('${SENTINEL}'.repeat(100))`],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
    limits: { maxArtifactBytes: 32 },
  });
  const overflow = runCli({ args: startArgs(fixture2.stateDir), input: overflowTask, scenario: "success", logPath: fixture2.logPath });
  assert.equal(overflow.status, 1);
  assert.equal(overflow.json.verification[0].artifacts.stdout.truncated, true);
  assert.ok(overflow.json.verification[0].artifacts.stdout.storedBytes <= 32);
  assert.equal(overflow.stdout.includes(SENTINEL), false);
  assert.ok(overflow.json.candidate.violations.some((item) => item.kind === "artifact_limit"));
});

test("precreated verifier artifact symlink fails closed without touching its target", async (t) => {
  const fixture = await makeRepo(t);
  const target = path.join(fixture.root, "src", "base.txt");
  const original = await readFile(target, "utf8");
  const task = baseTask(fixture.root);
  task.agent.inheritEnv.push("MOCK_TARGET_PATH");
  const result = runCli({
    args: startArgs(fixture.stateDir), input: task, scenario: "artifact_symlink", logPath: fixture.logPath,
    extraEnv: { MOCK_TARGET_PATH: target },
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.error.kind, "artifact_path");
  assert.equal(await readFile(target, "utf8"), original);
});

test("verifier timeout, patch cap, and max-round gates fail closed", async (t) => {
  const fixture = await makeRepo(t);
  const timeoutTask = baseTask(fixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "setTimeout(()=>{},10000)"],
        cwd: ".",
        timeoutMs: 100,
        required: true,
      }],
    },
  });
  const timedOut = runCli({ args: startArgs(fixture.stateDir), input: timeoutTask, scenario: "success", logPath: fixture.logPath });
  assert.equal(timedOut.status, 1);
  assert.equal(timedOut.json.verification[0].status, "timed_out");

  const fixture2 = await makeRepo(t);
  const cappedTask = baseTask(fixture2.root, { limits: { maxRounds: 1, maxPatchBytes: 16 } });
  const capped = runCli({ args: startArgs(fixture2.stateDir), input: cappedTask, scenario: "success", logPath: fixture2.logPath });
  assert.equal(capped.status, 1);
  assert.equal(capped.json.candidate.patch.complete, false);
  assert.ok(capped.json.candidate.patch.storedBytes <= 16);
  assert.ok(capped.json.candidate.violations.some((item) => item.kind === "patch_limit"));
  assert.equal(capped.json.recoverable, false);
  const continued = runCli({
    args: ["continue", "--state-dir", fixture2.stateDir, "--transaction", capped.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry." },
    scenario: "success",
    logPath: fixture2.logPath,
  });
  assert.equal(continued.status, 1);
  assert.equal(continued.json.error.kind, "continue_gate");
});

test("timeout preserves a partial patch but makes a mutated round nonrecoverable", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, { agent: { timeoutMs: 250, cancelGraceMs: 100 } });
  const before = await sourceSnapshot(fixture.root);
  const result = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "timeout", logPath: fixture.logPath });
  assert.equal(result.status, 124);
  assert.equal(result.json.error.kind, "timeout");
  assert.equal(result.json.recoverable, false);
  assert.deepEqual(await sourceSnapshot(fixture.root), before);
  const txDir = transactionDir(fixture.stateDir, result.json);
  assert.equal(await exists(path.join(txDir, "workspace", "src", "partial.txt")), true);
  assert.equal(result.json.candidate.patch.partial, true);
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "partial_round_mutation"));
  assert.equal(await exists(path.join(txDir, result.json.candidate.patch.path)), true);
  const manifest = JSON.parse(await readFile(path.join(txDir, "manifest.json"), "utf8"));
  assert.equal(manifest.history.at(-1).cancelSent, true);
  assert.equal(manifest.history.at(-1).childReaped, true);
  const logs = await readLog(fixture.logPath);
  assert.ok(logs.some((item) => item.type === "cancel"));
});

test("stream output is monotonic, result-last, exactly once, and privacy-normalized", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", `process.stdout.write('${SENTINEL}')`],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const result = runCli({ args: startArgs(fixture.stateDir, true), input: task, scenario: "privacy", logPath: fixture.logPath });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.lines.length > 1);
  assert.deepEqual(result.lines.map((item) => item.seq), result.lines.map((_, index) => index + 1));
  assert.equal(result.lines.at(-1).type, "result");
  assert.equal(result.lines.filter((item) => item.type === "result").length, 1);
  assert.equal(result.stdout.includes(SENTINEL), false);
  assert.equal(result.lines.some((item) => item.type === "tool" && item.kind === "edit"), true);
});

test("clean apply reproduces candidate tree and leaves real index and HEAD unchanged", async (t) => {
  const fixture = await makeRepo(t);
  const started = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario: "success", logPath: fixture.logPath });
  assert.equal(started.status, 0, started.stderr);
  const before = await sourceSnapshot(fixture.root);
  const applied = runCli({ args: ["apply", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId] });
  assert.equal(applied.status, 0, applied.stderr);
  assert.equal(applied.json.state, "applied");
  assert.equal(applied.json.applied.sourceTree, started.json.candidate.patch.candidateTree);
  const after = await sourceSnapshot(fixture.root);
  assert.equal(after.head, before.head);
  assert.equal(after.index, before.index);
  assert.equal(await readFile(path.join(fixture.root, "src", "result.txt"), "utf8"), "delegated\n");
  assert.equal(git(fixture.root, "diff", "--cached"), "");
});

test("apply handles tracked modification, delete, rename, mode change, and binary content with a temporary index", async (t) => {
  const fixture = await makeRepo(t);
  const before = await sourceSnapshot(fixture.root);
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "apply_complex",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 0, `${started.stderr}\n${JSON.stringify(started.json)}`);
  const changed = started.json.candidate.patch.changedPaths;
  assert.ok(changed.some((item) => item.status === "M" && item.newPath === "src/base.txt"));
  assert.ok(changed.some((item) => item.status === "D" && item.oldPath === "src/delete.txt"));
  assert.ok(changed.some((item) => item.status === "R" && item.oldPath === "src/rename.txt" && item.newPath === "src/renamed.txt"));
  assert.ok(changed.some((item) => item.newPath === "src/mode.txt" && item.oldMode === "100644" && item.newMode === "100755"));
  assert.ok(changed.some((item) => item.newPath === "src/data.bin" && item.binary === true));

  const applied = runCli({ args: ["apply", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId] });
  assert.equal(applied.status, 0, `${applied.stderr}\n${JSON.stringify(applied.json)}`);
  assert.equal(applied.json.applied.sourceTree, started.json.candidate.patch.candidateTree);
  const after = await sourceSnapshot(fixture.root);
  assert.equal(after.head, before.head);
  assert.equal(after.index, before.index);
  assert.equal(git(fixture.root, "diff", "--cached"), "");
  assert.equal(await readFile(path.join(fixture.root, "src", "base.txt"), "utf8"), "tracked-modified\n");
  assert.equal(await exists(path.join(fixture.root, "src", "delete.txt")), false);
  assert.equal(await exists(path.join(fixture.root, "src", "rename.txt")), false);
  assert.equal(await readFile(path.join(fixture.root, "src", "renamed.txt"), "utf8"), "rename\n");
  assert.equal((await stat(path.join(fixture.root, "src", "mode.txt"))).mode & 0o777, 0o755);
  assert.deepEqual(await readFile(path.join(fixture.root, "src", "data.bin")), Buffer.from([0, 1, 2, 3, 0, 255]));
});

test("dirty or stale apply target fails before mutation", async (t) => {
  const fixture = await makeRepo(t);
  const started = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario: "success", logPath: fixture.logPath });
  assert.equal(started.status, 0);
  await writeFile(path.join(fixture.root, "dirty.txt"), "dirty\n");
  const dirtyBefore = await sourceSnapshot(fixture.root);
  const dirtyApply = runCli({ args: ["apply", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId] });
  assert.equal(dirtyApply.status, 1);
  assert.equal(dirtyApply.json.error.kind, "dirty_target");
  assert.deepEqual(await sourceSnapshot(fixture.root), dirtyBefore);
  assert.equal(await exists(path.join(fixture.root, "src", "result.txt")), false);

  const fixture2 = await makeRepo(t);
  const started2 = runCli({ args: startArgs(fixture2.stateDir), input: baseTask(fixture2.root), scenario: "success", logPath: fixture2.logPath });
  await writeFile(path.join(fixture2.root, "later.txt"), "later\n");
  git(fixture2.root, "add", "later.txt");
  git(fixture2.root, "commit", "-qm", "later");
  const staleBefore = await sourceSnapshot(fixture2.root);
  const staleApply = runCli({ args: ["apply", "--state-dir", fixture2.stateDir, "--transaction", started2.json.transactionId] });
  assert.equal(staleApply.status, 1);
  assert.equal(staleApply.json.error.kind, "stale_target");
  assert.deepEqual(await sourceSnapshot(fixture2.root), staleBefore);
  assert.equal(await exists(path.join(fixture2.root, "src", "result.txt")), false);
});

test("continue uses only its transaction-bound session and suppresses load replay", async (t) => {
  const fixture = await makeRepo(t);
  const verifyFixed = "const fs=require('node:fs');process.exit(fs.readFileSync('src/result.txt','utf8')==='fixed\\n'?0:4)";
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", verifyFixed], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "replay", logPath: fixture.logPath });
  assert.equal(started.status, 1);
  assert.equal(started.json.recoverable, true);
  const continued = runCli({
    args: [
      "continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId,
      "--grok-bin", MOCK_GROK, "--stream",
    ],
    input: { schemaVersion: 1, feedback: "Fix only the failed verifier." },
    scenario: "replay",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 0, continued.stderr);
  assert.equal(continued.json.state, "candidate_ready");
  assert.equal(continued.stdout.includes(`OLD_REPLAY_${SENTINEL}`), false);
  assert.equal(continued.stdout.includes(SENTINEL), false);
  const logs = await readLog(fixture.logPath);
  const loads = logs.filter((item) => item.type === "load");
  assert.equal(loads.length, 1);
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, started.json), "manifest.json"), "utf8"));
  assert.equal(loads[0].sessionId, manifest.sessionId);
});

test("continue rejects inherited environment drift before Grok spawn", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "process.exit(8)"],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1);
  assert.equal(started.json.recoverable, true);
  const promptCount = (await readLog(fixture.logPath)).filter((item) => item.type === "prompt").length;
  const driftValue = "ENV_DRIFT_SENTINEL_192bca7e";
  const continued = runCli({
    args: [
      "continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId,
      "--grok-bin", MOCK_GROK,
    ],
    input: { schemaVersion: 1, feedback: "Retry without changing the frozen environment." },
    scenario: "success",
    logPath: fixture.logPath,
    extraEnv: { MOCK_SENTINEL: driftValue },
  });
  assert.equal(continued.status, 1);
  assert.equal(continued.json.error.kind, "environment_binding");
  assert.equal(continued.json.recoverable, false);
  assert.equal(continued.stdout.includes(driftValue), false);
  assert.equal((await readLog(fixture.logPath)).filter((item) => item.type === "prompt").length, promptCount);
  const manifestText = await readFile(
    path.join(transactionDir(fixture.stateDir, continued.json), "manifest.json"),
    "utf8",
  );
  assert.equal(manifestText.includes(driftValue), false);
  assert.equal(manifestText.includes(SENTINEL), false);
});

test("PATH requires absolute nonempty entries before transaction creation", async (t) => {
  const fixture = await makeRepo(t);
  for (const unsafePath of [
    ["relative-bin", SAFE_TEST_PATH].join(path.delimiter),
    `${SAFE_TEST_PATH}${path.delimiter}`,
  ]) {
    const result = runCli({
      args: startArgs(fixture.stateDir),
      input: baseTask(fixture.root),
      scenario: "success",
      logPath: fixture.logPath,
      extraEnv: { PATH: unsafePath },
    });
    assert.equal(result.status, 2);
    assert.equal(result.json.error.kind, "environment_binding");
    assert.equal(result.json.transactionId, null);
  }
  assert.equal((await readLog(fixture.logPath)).some((item) => item.type === "prompt"), false);
});

test("continue rejects PATH drift and verifier executable replacement before Git or Grok", async (t) => {
  const pathFixture = await makeRepo(t);
  const failingTask = baseTask(pathFixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", "process.exit(8)"],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const started = runCli({
    args: startArgs(pathFixture.stateDir),
    input: failingTask,
    scenario: "success",
    logPath: pathFixture.logPath,
  });
  assert.equal(started.status, 1);
  assert.equal(started.json.recoverable, true);
  const promptCount = (await readLog(pathFixture.logPath)).filter((item) => item.type === "prompt").length;
  const drifted = runCli({
    args: [
      "continue", "--state-dir", pathFixture.stateDir, "--transaction", started.json.transactionId,
      "--grok-bin", MOCK_GROK,
    ],
    input: { schemaVersion: 1, feedback: "Retry." },
    scenario: "success",
    logPath: pathFixture.logPath,
    extraEnv: { PATH: [`${REAL_TMP}/unused-absolute-bin`, SAFE_TEST_PATH].join(path.delimiter) },
  });
  assert.equal(drifted.status, 1);
  assert.equal(drifted.json.error.kind, "environment_binding");
  assert.equal(drifted.json.recoverable, false);
  assert.equal((await readLog(pathFixture.logPath)).filter((item) => item.type === "prompt").length, promptCount);

  const executableFixture = await makeRepo(t);
  const executableRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-executable-"));
  t.after(async () => rm(executableRoot, { recursive: true, force: true }));
  const verifier = path.join(executableRoot, "bound-verifier");
  await writeFile(verifier, `#!${process.execPath}\nprocess.exit(8);\n`, { mode: 0o700 });
  await chmod(verifier, 0o700);
  const executableTask = baseTask(executableFixture.root, {
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [verifier],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const executableStarted = runCli({
    args: startArgs(executableFixture.stateDir),
    input: executableTask,
    scenario: "success",
    logPath: executableFixture.logPath,
  });
  assert.equal(executableStarted.status, 1);
  assert.equal(executableStarted.json.recoverable, true);
  const executablePromptCount = (await readLog(executableFixture.logPath))
    .filter((item) => item.type === "prompt").length;
  await writeFile(verifier, `#!${process.execPath}\nprocess.exit(0);\n`, { mode: 0o700 });
  await chmod(verifier, 0o700);
  const replaced = runCli({
    args: [
      "continue", "--state-dir", executableFixture.stateDir,
      "--transaction", executableStarted.json.transactionId, "--grok-bin", MOCK_GROK,
    ],
    input: { schemaVersion: 1, feedback: "Retry." },
    scenario: "success",
    logPath: executableFixture.logPath,
  });
  assert.equal(replaced.status, 1);
  assert.equal(replaced.json.error.kind, "environment_binding");
  assert.equal(replaced.json.recoverable, false);
  assert.equal((await readLog(executableFixture.logPath)).filter((item) => item.type === "prompt").length, executablePromptCount);
});

test("apply rejects a shadowed Git executable before source mutation", async (t) => {
  const fixture = await makeRepo(t);
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 0);
  const before = await sourceSnapshot(fixture.root);
  const shadowRoot = await mkdtemp(path.join(REAL_TMP, "grok-delegate-shadow-git-"));
  t.after(async () => rm(shadowRoot, { recursive: true, force: true }));
  const marker = path.join(shadowRoot, "executed");
  const shadowGit = path.join(shadowRoot, "git");
  await writeFile(
    shadowGit,
    `#!${process.execPath}\nrequire("node:fs").writeFileSync(${JSON.stringify(marker)}, "executed");\nprocess.exit(99);\n`,
    { mode: 0o700 },
  );
  await chmod(shadowGit, 0o700);
  const applied = runCli({
    args: ["apply", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId],
    extraEnv: { PATH: [shadowRoot, SAFE_TEST_PATH].join(path.delimiter) },
  });
  assert.equal(applied.status, 1);
  assert.equal(applied.json.error.kind, "environment_binding");
  assert.equal(await exists(marker), false);
  assert.deepEqual(await sourceSnapshot(fixture.root), before);
});

test("tampered or cross-transaction session binding cannot be loaded", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", "process.exit(8)"], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "success", logPath: fixture.logPath });
  assert.equal(started.json.recoverable, true);
  const txDir = transactionDir(fixture.stateDir, started.json);
  const manifestPath = path.join(txDir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.sessionId = "session-from-another-transaction";
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, { mode: 0o600 });
  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry." },
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 1);
  assert.equal(continued.json.error.kind, "state");
  const logs = await readLog(fixture.logPath);
  assert.equal(logs.some((item) => item.type === "load"), false);
});

test("real Grok Write deltas merge by toolCallId and bind allow-once provenance", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "real_write_delta",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, `${result.stderr}\n${JSON.stringify(result.json)}`);
  assert.equal(result.json.state, "candidate_ready");
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.equal(result.json.permissionAudit.rejectedCount, 0);
  assert.deepEqual(result.json.permissionAudit.violations, []);
  assert.deepEqual(result.json.permissionAudit.decisions[0].paths, ["src/result.txt"]);
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, result.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt"]);
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 980);
  assert.equal(response?.result?.outcome?.optionId, "once");
});

test("real Grok delta conflicts and incomplete lifecycles remain fail closed", async (t) => {
  const cases = [
    ["real_unknown_terminal", "unknown_tool_call_id"],
    ["real_unknown_statusless_delta", "unknown_tool_call_id"],
    ["real_update_id_conflict", "ambiguous_tool_call_id"],
    ["real_permission_id_conflict", "ambiguous_tool_call_id"],
    ["real_incompatible_identity", "incompatible_tool_identity"],
    ["real_uppercase_display", "incompatible_tool_identity"],
    ["real_post_native_write_display", "incompatible_tool_identity"],
    ["real_post_native_upper_display", "incompatible_tool_identity"],
    ["real_post_native_name_change", "xai_tool_identity_changed"],
    ["real_post_native_bash_display", "incompatible_tool_identity"],
    ["real_native_identity_change", "xai_tool_identity_changed"],
    ["real_invalid_xai_envelope", "unknown_xai_tool_identity"],
    ["real_xai_path_conflict", "ambiguous_path_carrier"],
    ["real_xai_destination_conflict", "tool_path_changed"],
    ["real_bash_xai_cmd_mismatch", "ambiguous_argv"],
    ["real_path_change", "tool_path_changed"],
    ["real_terminal_reuse", "reused_tool_call_id"],
    ["real_pregrant_terminal", "execution_preceded_permission"],
    ["real_sparse_terminal", "unknown_tool_call_id"],
    ["real_auto_write", "unapproved_tool_execution"],
    ["real_failed_without_permission", "unapproved_tool_execution"],
    ["real_missing_terminal", "missing_terminal_status"],
  ];
  for (const [scenario, code] of cases) {
    const fixture = await makeRepo(t);
    const result = runCli({
      args: startArgs(fixture.stateDir),
      input: baseTask(fixture.root),
      scenario,
      logPath: fixture.logPath,
    });
    assert.equal(result.status, 1, `${scenario}: ${result.stderr}\n${JSON.stringify(result.json)}`);
    assert.equal(result.json.candidate?.ready ?? false, false, scenario);
    assert.ok(result.json.permissionAudit.violations.some((item) => item.code === code), `${scenario}: ${JSON.stringify(result.json.permissionAudit)}`);
  }
});

test("a granted failed terminal is partial execution evidence, while permissionless failed is not", async (t) => {
  const grantedFixture = await makeRepo(t);
  const granted = runCli({
    args: startArgs(grantedFixture.stateDir),
    input: baseTask(grantedFixture.root),
    scenario: "real_granted_failed",
    logPath: grantedFixture.logPath,
  });
  assert.equal(granted.status, 0, `${granted.stderr}\n${granted.stdout}`);
  assert.equal(granted.json.state, "candidate_ready");
  assert.deepEqual(granted.json.permissionAudit.violations, []);
  const grantedManifest = JSON.parse(await readFile(
    path.join(transactionDir(grantedFixture.stateDir, granted.json), "manifest.json"),
    "utf8",
  ));
  assert.deepEqual(grantedManifest.executedApprovedPaths, ["src/result.txt"]);

  const unapprovedFixture = await makeRepo(t);
  const unapproved = runCli({
    args: startArgs(unapprovedFixture.stateDir),
    input: baseTask(unapprovedFixture.root),
    scenario: "real_failed_without_permission",
    logPath: unapprovedFixture.logPath,
  });
  assert.equal(unapproved.status, 1);
  assert.equal(unapproved.json.recoverable, false);
  assert.ok(unapproved.json.permissionAudit.violations.some((item) => item.code === "unapproved_tool_execution"));
  assert.ok(unapproved.json.candidate.violations.some((item) => item.kind === "round_unmediated_write"));
  const unapprovedManifest = JSON.parse(await readFile(
    path.join(transactionDir(unapprovedFixture.stateDir, unapproved.json), "manifest.json"),
    "utf8",
  ));
  assert.deepEqual(unapprovedManifest.executedApprovedPaths, []);
});

test("real Grok Bash uses execute display kind and exact allow-once argv", async (t) => {
  const positiveFixture = await makeRepo(t);
  const task = baseTask(positiveFixture.root);
  task.task.expectedChange = "optional";
  const positive = runCli({
    args: startArgs(positiveFixture.stateDir),
    input: task,
    scenario: "real_bash_delta",
    logPath: positiveFixture.logPath,
  });
  assert.equal(positive.status, 0, `${positive.stderr}\n${positive.stdout}`);
  assert.equal(positive.json.state, "candidate_ready");
  assert.equal(positive.json.permissionAudit.allowedCount, 1);
  assert.deepEqual(positive.json.permissionAudit.violations, []);
  const positiveManifest = JSON.parse(await readFile(
    path.join(transactionDir(positiveFixture.stateDir, positive.json), "manifest.json"),
    "utf8",
  ));
  assert.deepEqual(positiveManifest.permissionAudit.decisions[0].argv, [
    "node", "--test", "test/focused.test.mjs",
  ]);

  const negativeFixture = await makeRepo(t);
  const negative = runCli({
    args: startArgs(negativeFixture.stateDir),
    input: baseTask(negativeFixture.root),
    scenario: "real_bash_incompatible",
    logPath: negativeFixture.logPath,
  });
  assert.equal(negative.status, 1);
  assert.equal(negative.json.permissionAudit.allowedCount, 0);
  assert.ok(negative.json.permissionAudit.violations.some((item) => item.code === "incompatible_tool_identity"));
});

test("a rejected real Grok permission followed by failed is not execution evidence", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "real_rejected_failed",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "permission_rejected:path_policy"));
  assert.equal(result.json.permissionAudit.violations.some((item) => item.code === "unapproved_tool_execution"), false);
  assert.equal(result.json.permissionAudit.violations.some((item) => item.code === "execution_preceded_permission"), false);
});

test("a same-ID update during async permission resolution revokes allow-once", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "real_permission_race",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "permission_state_changed"));
  const response = (await readLog(fixture.logPath)).find(
    (item) => item.type === "permission_response" && item.id === 980,
  );
  assert.match(response?.result?.outcome?.optionId ?? "", /^reject/);
});

test("a terminal status carried by the permission request is pre-grant execution and cannot be erased", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "real_permission_precompleted",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "execution_preceded_permission"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "unapproved_tool_execution"));
  const response = (await readLog(fixture.logPath)).find(
    (item) => item.type === "permission_response" && item.id === 980,
  );
  assert.match(response?.result?.outcome?.optionId ?? "", /^reject/);
  const manifest = JSON.parse(await readFile(
    path.join(transactionDir(fixture.stateDir, result.json), "manifest.json"),
    "utf8",
  ));
  assert.deepEqual(manifest.executedApprovedPaths, []);
});

test("permission policy allows only in-scope allow-once edit and frozen argv", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario: "permissions", logPath: fixture.logPath });
  assert.equal(result.status, 1);
  const logs = (await readLog(fixture.logPath)).filter((item) => item.type === "permission_response");
  const byId = new Map(logs.map((item) => [item.id, item.result?.outcome?.optionId ?? null]));
  assert.equal(byId.get(901), "once");
  assert.equal(byId.get(902), "once");
  for (const id of [903, 904, 905, 906, 907]) assert.match(byId.get(id) ?? "", /^reject/);
  assert.equal(result.json.permissionAudit.allowedCount, 4);
  assert.ok(result.json.permissionAudit.rejectedCount >= 14);
  assert.equal(result.json.recoverable, false);
  for (const id of [908, 909, 910, 911]) assert.match(byId.get(id) ?? "", /^reject/);
  assert.equal(byId.get(912), "once");
  assert.match(byId.get(913) ?? "", /^reject/);
  const duplicateRequestResponses = logs.filter((item) => item.id === 914);
  assert.equal(duplicateRequestResponses.filter((item) => item.result?.outcome?.optionId === "once").length, 1);
  assert.equal(duplicateRequestResponses.filter((item) => item.error?.code === -32600).length, 1);
  for (const id of [915, 916, 917]) assert.match(byId.get(id) ?? "", /^reject/);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "reused_tool_call_id"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "tool_kind_changed"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "executed_unknown_tool"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "ambiguous_argv"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "duplicate_request_id"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "ambiguous_tool_kind"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "unknown_tool_status"));
  const workspace = path.join(transactionDir(fixture.stateDir, result.json), "workspace");
  assert.equal(await exists(path.join(workspace, "outside.txt")), false);
  assert.equal(await exists(path.join(workspace, "src", "protected", "file.txt")), false);
});

test("Credit, Rewrite, and Shellfish remain unknown tool kinds", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "unknown_kinds",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  const responses = (await readLog(fixture.logPath)).filter((item) => item.type === "permission_response");
  assert.deepEqual(responses.map((item) => item.id).sort(), [960, 961, 962]);
  assert.ok(responses.every((item) => /^reject/.test(item.result?.outcome?.optionId ?? "")));
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 3);
  assert.ok(result.json.permissionAudit.decisions.every((item) => item.kind === "unknown"));
  assert.ok(result.json.permissionAudit.decisions.every((item) => item.reason === "unknown_tool_kind"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "unknown_tool_kind"));
  for (const rawKind of ["Credit", "Rewrite", "Shellfish", SENTINEL]) {
    assert.equal(result.stdout.includes(rawKind), false);
  }
});

test("simultaneous reverse requests cannot reuse a JSON-RPC request ID", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "simultaneous_request_id",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  const responses = (await readLog(fixture.logPath)).filter((item) => item.type === "permission_response" && item.id === 970);
  assert.equal(responses.length, 2);
  assert.equal(responses.filter((item) => item.result?.outcome?.optionId === "once").length, 1);
  assert.equal(responses.filter((item) => item.error?.code === -32600).length, 1);
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "duplicate_request_id"));
});

test("simultaneous permissions cannot reuse a toolCallId before either response", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "simultaneous_tool_id",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  const responses = (await readLog(fixture.logPath)).filter((item) => item.type === "permission_response");
  const byId = new Map(responses.map((item) => [item.id, item.result?.outcome?.optionId ?? null]));
  assert.match(byId.get(971) ?? "", /^reject/);
  assert.match(byId.get(972) ?? "", /^reject/);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 2);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "reused_tool_call_id"));
});

test("an unknown reverse method consumes its ID before a permission can reuse it", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "unknown_method_reuse",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  const responses = (await readLog(fixture.logPath)).filter((item) => item.type === "permission_response" && item.id === 973);
  assert.equal(responses.length, 2);
  assert.deepEqual(responses.map((item) => item.error?.code).sort(), [-32601, -32600].sort());
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "duplicate_request_id"));
});

test("execution observed before permission is rejected and cannot create provenance", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "execution_before_permission",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 900);
  assert.match(response?.result?.outcome?.optionId ?? "", /^reject/);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "unapproved_tool_execution"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "execution_preceded_permission"));
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, result.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, []);
});

test("a silent in-scope write without permission or execution evidence is unmediated", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "silent_write",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.error.kind, "candidate_not_ready");
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 0);
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "unmediated_write"));
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, result.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, []);
});

test("allow-once without a matching execution update does not authorize a write", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "permission_without_execution",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "missing_terminal_status"));
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "unmediated_write"));
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, result.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, []);
});

test("a matching permission then execution update privately binds the changed path", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(result.json.candidate.ready, true);
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.deepEqual(result.json.permissionAudit.violations, []);
  const txDir = transactionDir(fixture.stateDir, result.json);
  const manifest = JSON.parse(await readFile(path.join(txDir, "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt"]);
  assert.equal(manifest.executedApprovedPathsHash, digest(JSON.stringify(["src/result.txt"])));
  assert.equal(result.stdout.includes("executedApprovedPaths"), false);
  assert.equal(result.stdout.includes(path.join(txDir, "workspace")), false);
});

test("file URI and destination carriers bind both rename paths without exposing raw values", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "path_carriers",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, `${result.stderr}\n${result.stdout}`);
  assert.equal(result.json.candidate.ready, true);
  assert.deepEqual(result.json.permissionAudit.decisions[0].paths.sort(), ["src/base.txt", "src/moved.txt"]);
  const txDir = transactionDir(fixture.stateDir, result.json);
  const manifest = JSON.parse(await readFile(path.join(txDir, "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/base.txt", "src/moved.txt"]);
  assert.equal(result.stdout.includes("file://"), false);
  assert.equal(result.stdout.includes(path.join(txDir, "workspace")), false);
  assert.equal(result.stdout.includes("executedApprovedPaths"), false);
});

test("a changed or outside URI/destination execution carrier is a policy violation", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "uri_destination_mismatch",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "execution_path_outside_workspace"));
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "tool_path_changed"));
  assert.ok(result.json.candidate.violations.some((item) => item.kind === "policy_violation"));
  assert.equal(result.stdout.includes(path.join(transactionDir(fixture.stateDir, result.json), "outside.txt")), false);
});

test("an outside file URI is rejected before any write authorization", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "uri_outside",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.decisions[0].reason, "path_policy");
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "unapproved_tool_execution"));
  assert.equal(result.stdout.includes("file://"), false);
});

test("a cmd execution carrier must equal the argv that received permission", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "bash_cmd_mismatch",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "tool_argv_changed"));
  assert.equal(result.stdout.includes("test/other.test.mjs"), false);
});

test("a cmd permission carrier outside the frozen argv set is rejected", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "bash_cmd_outside",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.equal(result.json.permissionAudit.decisions[0].reason, "argv_not_frozen");
  assert.equal(result.stdout.includes("test/other.test.mjs"), false);
});

test("direct argv metacharacters cannot extend an otherwise matching prefix permission", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    agent: {
      shellPermissions: [{ id: "shell-prefix", match: "prefix", argv: ["node", "--test"] }],
    },
  });
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "argv_metachar",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.equal(result.json.permissionAudit.decisions[0].reason, "shell_metacharacter");
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "shell_metacharacter"));
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 900);
  assert.match(response?.result?.outcome?.optionId ?? "", /^reject/);
  assert.equal(result.stdout.includes("src/pwned.txt"), false);
});

test("prompt completion drains in-flight reverse requests before permission finalization", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "drain_reverse",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.notEqual(result.json.error.kind, "transport");
  assert.equal(result.json.permissionAudit.allowedCount, 1);
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 950);
  assert.equal(response?.result?.outcome?.optionId, "once");
});

test("prompt completion drains an in-flight reverse error response", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "error_drain_reverse",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.notEqual(result.json.error.kind, "transport");
  assert.deepEqual(result.json.permissionAudit.violations, []);
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 952);
  assert.equal(response?.error?.code, -32601);
  assert.equal(result.stdout.includes(SENTINEL), false);
});

test("raw transaction paths and local home values never enter stream or agent report output", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir, true),
    input: baseTask(fixture.root),
    scenario: "raw_path_echo",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 0, result.stderr);
  const workspace = path.join(transactionDir(fixture.stateDir, result.json), "workspace");
  assert.equal(result.stdout.includes(workspace), false);
  assert.equal(result.stdout.includes(pathToFileURL(workspace).href), false);
  if ((process.env.HOME?.length ?? 0) >= 8) assert.equal(result.stdout.includes(process.env.HOME), false);
  assert.equal(result.stdout.includes("file://"), false);
  assert.equal(result.stdout.includes("executedApprovedPaths"), false);
  assert.equal(result.lines.at(-1).agentReport.summary.includes("[REDACTED]"), true);
  assert.deepEqual(result.lines.at(-1).agentReport.changes, []);
});

test("a reverse permission arriving after the prompt response is rejected", async (t) => {
  const fixture = await makeRepo(t);
  const result = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "late_permission",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 1, result.stderr);
  assert.equal(result.json.permissionAudit.allowedCount, 0);
  assert.equal(result.json.permissionAudit.rejectedCount, 1);
  assert.ok(result.json.permissionAudit.violations.some((item) => item.code === "permission_outside_current_prompt"));
  const response = (await readLog(fixture.logPath)).find((item) => item.type === "permission_response" && item.id === 951);
  assert.match(response?.result?.outcome?.optionId ?? "", /^reject/);
});

test("tool execution replayed during session/load is audited outside current prompt", async (t) => {
  const fixture = await makeRepo(t);
  const verifyFixed = "const fs=require('node:fs');process.exit(fs.readFileSync('src/result.txt','utf8')==='fixed\\n'?0:4)";
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", verifyFixed], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "load_execution", logPath: fixture.logPath });
  assert.equal(started.status, 1);
  assert.equal(started.json.recoverable, true);
  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry without widening scope." },
    scenario: "load_execution",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 1);
  assert.equal(continued.json.recoverable, false);
  assert.ok(continued.json.permissionAudit.violations.some((item) => item.code === "execution_outside_current_prompt"));
  assert.ok(continued.json.candidate.violations.some((item) => item.kind === "policy_violation"));
});

test("continue accumulates only executed write provenance across two rounds", async (t) => {
  const fixture = await makeRepo(t);
  const verifyBoth = "const fs=require('node:fs');process.exit(fs.existsSync('src/result.txt')&&fs.existsSync('src/second.txt')?0:7)";
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", verifyBoth], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "two_round_prior",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1, started.stderr);
  assert.equal(started.json.recoverable, true);
  let manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, started.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt"]);

  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Add only the second frozen path." },
    scenario: "two_round_prior",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 0, continued.stderr);
  assert.equal(continued.json.candidate.ready, true);
  manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, continued.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt", "src/second.txt"]);
  assert.equal(manifest.executedApprovedPathsHash, digest(JSON.stringify(["src/result.txt", "src/second.txt"])));
  assert.equal(continued.stdout.includes("executedApprovedPaths"), false);
});

test("a later unpermitted path is rejected even when prior-round provenance is valid", async (t) => {
  const fixture = await makeRepo(t);
  const verifyBoth = "const fs=require('node:fs');process.exit(fs.existsSync('src/result.txt')&&fs.existsSync('src/second.txt')?0:7)";
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", verifyBoth], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "two_round_silent",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1, started.stderr);
  assert.equal(started.json.recoverable, true);

  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Add only the second frozen path." },
    scenario: "two_round_silent",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 1, continued.stderr);
  assert.equal(continued.json.candidate.ready, false);
  assert.ok(continued.json.candidate.violations.some((item) => item.kind === "unmediated_write"));
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, continued.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt", "src/second.txt"]);
  assert.equal(manifest.executedApprovedPaths.includes("src/never-permitted.txt"), false);
  assert.equal(continued.stdout.includes("never-permitted"), true);
  assert.equal(continued.stdout.includes("executedApprovedPaths"), false);
});

test("prior path provenance cannot authorize a silent overwrite of the same path in a later round", async (t) => {
  const fixture = await makeRepo(t);
  const verifyOverwrite = "const fs=require('node:fs');process.exit(fs.readFileSync('src/result.txt','utf8')==='silent-overwrite\\n'?0:7)";
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", verifyOverwrite], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "two_round_same_silent",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1, started.stderr);
  assert.equal(started.json.recoverable, true);

  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Make the verifier pass without widening scope." },
    scenario: "two_round_same_silent",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 1, continued.stderr);
  assert.equal(continued.json.verification[0].status, "passed");
  assert.ok(continued.json.candidate.violations.some((item) => item.kind === "round_unmediated_write"));
  assert.equal(continued.json.recoverable, false);
  const manifest = JSON.parse(await readFile(path.join(transactionDir(fixture.stateDir, continued.json), "manifest.json"), "utf8"));
  assert.deepEqual(manifest.executedApprovedPaths, ["src/result.txt"]);
});

test("verifier mutation of a previously approved path makes the transaction nonrecoverable", async (t) => {
  const fixture = await makeRepo(t);
  const mutateAfterSecond = [
    "const fs=require('node:fs');",
    "if(!fs.existsSync('src/second.txt'))process.exit(7);",
    "fs.writeFileSync('src/result.txt','verifier-mutated\\n');",
  ].join("");
  const task = baseTask(fixture.root, {
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", mutateAfterSecond], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "two_round_verifier_mutation",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1, started.stderr);
  assert.equal(started.json.recoverable, true);

  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Add the second approved path." },
    scenario: "two_round_verifier_mutation",
    logPath: fixture.logPath,
  });
  assert.equal(continued.status, 1, continued.stderr);
  assert.equal(continued.json.verification[0].mutatedWorkspace, true);
  assert.ok(continued.json.candidate.violations.some((item) => item.kind === "verification_mutated_workspace"));
  assert.equal(continued.json.recoverable, false);
  const retry = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry." },
    scenario: "two_round_verifier_mutation",
    logPath: fixture.logPath,
  });
  assert.equal(retry.status, 1);
  assert.equal(retry.json.error.kind, "continue_gate");
});

test("a timed-out partial overwrite of a prior path cannot be continued", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, {
    agent: { timeoutMs: 1_000, cancelGraceMs: 100 },
    verification: {
      commands: [{ id: "verify-focused", argv: [process.execPath, "-e", "process.exit(7)"], cwd: ".", timeoutMs: 3_000, required: true }],
    },
  });
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: task,
    scenario: "two_round_timeout_same_path",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 1, started.stderr);
  assert.equal(started.json.recoverable, true);

  const continued = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry the same path." },
    scenario: "two_round_timeout_same_path",
    logPath: fixture.logPath,
    timeout: 10_000,
  });
  assert.equal(continued.status, 124, continued.stderr);
  assert.equal(continued.json.error.kind, "timeout");
  assert.equal(continued.json.recoverable, false);
  assert.ok(continued.json.candidate.violations.some((item) => item.kind === "partial_round_mutation"));
  const retry = runCli({
    args: ["continue", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId, "--grok-bin", MOCK_GROK],
    input: { schemaVersion: 1, feedback: "Retry again." },
    scenario: "two_round_timeout_same_path",
    logPath: fixture.logPath,
  });
  assert.equal(retry.status, 1);
  assert.equal(retry.json.error.kind, "continue_gate");
});

test("write provenance binding rejects manifest path tampering", async (t) => {
  const fixture = await makeRepo(t);
  const started = runCli({
    args: startArgs(fixture.stateDir),
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(started.status, 0, started.stderr);
  const manifestPath = path.join(transactionDir(fixture.stateDir, started.json), "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  manifest.executedApprovedPaths.push("src/forged.txt");
  await writeFile(manifestPath, `${JSON.stringify(manifest)}\n`, { mode: 0o600 });
  const inspected = runCli({
    args: ["inspect", "--state-dir", fixture.stateDir, "--transaction", started.json.transactionId],
  });
  assert.equal(inspected.status, 1);
  assert.equal(inspected.json.error.kind, "state");
});

test("malformed JSON-RPC, early EOF, auth failure, and spawn failure preserve source and normalize one result", async (t) => {
  for (const scenario of ["malformed", "early_eof", "auth_failure"]) {
    const fixture = await makeRepo(t);
    const before = await sourceSnapshot(fixture.root);
    const result = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario, logPath: fixture.logPath });
    assert.equal(result.status, 1);
    assert.equal(result.lines.length, 1);
    assert.equal(result.json.ok, false);
    assert.deepEqual(await sourceSnapshot(fixture.root), before);
    assert.equal(result.stdout.includes(SENTINEL), false);
  }
  const fixture = await makeRepo(t);
  const before = await sourceSnapshot(fixture.root);
  const result = runCli({
    args: ["start", "--state-dir", fixture.stateDir, "--grok-bin", path.join(fixture.root, "missing-grok")],
    input: baseTask(fixture.root),
    scenario: "success",
    logPath: fixture.logPath,
  });
  assert.equal(result.status, 2);
  assert.equal(result.lines.length, 1);
  assert.equal(result.json.ok, false);
  assert.equal(result.json.error.kind, "environment_binding");
  assert.deepEqual(await sourceSnapshot(fixture.root), before);
});

test("SIGINT sends cancellation, preserves partial state, and exits 130", async (t) => {
  const fixture = await makeRepo(t);
  const task = baseTask(fixture.root, { agent: { timeoutMs: 10_000, cancelGraceMs: 100 } });
  const child = spawn(process.execPath, [CLI, ...startArgs(fixture.stateDir)], {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      PATH: SAFE_TEST_PATH,
      GROK_AUTH_PATH: TEST_AUTH_PATH,
      MOCK_SCENARIO: "timeout",
      MOCK_LOG: fixture.logPath,
      MOCK_SENTINEL: SENTINEL,
    },
  });
  child.stdin.end(JSON.stringify(task));
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline) {
    const logs = await readLog(fixture.logPath);
    if (logs.some((item) => item.type === "prompt")) break;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  child.kill("SIGINT");
  const outcome = await new Promise((resolve) => child.once("close", (code, signal) => resolve({ code, signal })));
  assert.equal(outcome.code, 130, `${stderr}\n${stdout}`);
  const lines = stdout.trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(lines.length, 1);
  assert.equal(lines[0].error.kind, "interrupted");
  const logs = await readLog(fixture.logPath);
  assert.ok(logs.some((item) => item.type === "cancel"));
});

test("head_only ignores but never copies dirty source, and apply still rejects it", async (t) => {
  const fixture = await makeRepo(t);
  await writeFile(path.join(fixture.root, "src", "dirty-untracked.txt"), "source-only\n");
  const task = baseTask(fixture.root, { repository: { dirtyPolicy: "head_only" } });
  const result = runCli({ args: startArgs(fixture.stateDir), input: task, scenario: "success", logPath: fixture.logPath });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.json.source.dirtyIgnored, true);
  const workspace = path.join(transactionDir(fixture.stateDir, result.json), "workspace");
  assert.equal(await exists(path.join(workspace, "src", "dirty-untracked.txt")), false);
  assert.equal(await readFile(path.join(fixture.root, "src", "dirty-untracked.txt"), "utf8"), "source-only\n");
  const applied = runCli({ args: ["apply", "--state-dir", fixture.stateDir, "--transaction", result.json.transactionId] });
  assert.equal(applied.status, 1);
  assert.equal(applied.json.error.kind, "dirty_target");
  assert.equal(await exists(path.join(fixture.root, "src", "result.txt")), false);
});

test("head_only source fingerprint detects same-status tracked and ignored content overwrites", async (t) => {
  const tracked = await makeRepo(t);
  const trackedTarget = path.join(tracked.root, "src", "base.txt");
  await writeFile(trackedTarget, "dirty-one\n");
  const trackedStatus = git(tracked.root, "status", "--porcelain=v2", "--untracked-files=all");
  const trackedTask = baseTask(tracked.root, {
    repository: { dirtyPolicy: "head_only" },
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(trackedTarget)},'dirty-two\\n')`],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const trackedResult = runCli({
    args: startArgs(tracked.stateDir), input: trackedTask, scenario: "success", logPath: tracked.logPath,
  });
  assert.equal(trackedResult.status, 1);
  assert.equal(trackedResult.json.error.kind, "source_mutation");
  assert.equal(git(tracked.root, "status", "--porcelain=v2", "--untracked-files=all"), trackedStatus);

  const ignored = await makeRepo(t);
  await writeFile(path.join(ignored.root, ".gitignore"), "src/ignored.txt\n");
  git(ignored.root, "add", ".gitignore");
  git(ignored.root, "commit", "-qm", "ignore test canary");
  const ignoredTarget = path.join(ignored.root, "src", "ignored.txt");
  await writeFile(ignoredTarget, "ignore-one\n");
  const ignoredStatus = git(ignored.root, "status", "--porcelain=v2", "--untracked-files=all");
  const ignoredTask = baseTask(ignored.root, {
    repository: { dirtyPolicy: "head_only" },
    verification: {
      commands: [{
        id: "verify-focused",
        argv: [process.execPath, "-e", `require('node:fs').writeFileSync(${JSON.stringify(ignoredTarget)},'ignore-two\\n')`],
        cwd: ".",
        timeoutMs: 3_000,
        required: true,
      }],
    },
  });
  const ignoredResult = runCli({
    args: startArgs(ignored.stateDir), input: ignoredTask, scenario: "success", logPath: ignored.logPath,
  });
  assert.equal(ignoredResult.status, 1);
  assert.equal(ignoredResult.json.error.kind, "source_mutation");
  assert.equal(git(ignored.root, "status", "--porcelain=v2", "--untracked-files=all"), ignoredStatus);
});

test("inspect is normalized and discard removes only the explicit transaction", async (t) => {
  const fixture = await makeRepo(t);
  const fixture2 = await makeRepo(t);
  const first = runCli({ args: startArgs(fixture.stateDir), input: baseTask(fixture.root), scenario: "success", logPath: fixture.logPath });
  const secondTask = baseTask(fixture2.root);
  secondTask.repository.path = fixture2.root;
  const second = runCli({ args: startArgs(fixture.stateDir), input: secondTask, scenario: "success", logPath: fixture2.logPath });
  const firstManifestPath = path.join(fixture.stateDir, first.json.transactionId, "manifest.json");
  const manifestBeforeInspect = await readFile(firstManifestPath);
  const inspected = runCli({ args: ["inspect", "--state-dir", fixture.stateDir, "--transaction", first.json.transactionId] });
  assert.equal(inspected.status, 0);
  assert.equal(inspected.lines.length, 1);
  assert.equal(inspected.stdout.includes("session-"), false);
  assert.deepEqual(await readFile(firstManifestPath), manifestBeforeInspect);
  const discarded = runCli({ args: ["discard", "--state-dir", fixture.stateDir, "--transaction", first.json.transactionId] });
  assert.equal(discarded.status, 0);
  assert.equal(discarded.json.recovery, "not_recoverable");
  assert.equal(await exists(path.join(fixture.stateDir, first.json.transactionId)), false);
  assert.equal(await exists(path.join(fixture.stateDir, second.json.transactionId)), true);
});

test("help and malformed input still use exactly one normalized terminal line", async () => {
  const help = runCli({ args: ["--help"] });
  assert.equal(help.status, 0);
  assert.equal(help.lines.length, 1);
  assert.equal(help.json.type, "result");
  const stateDir = await mkdtemp(path.join(os.tmpdir(), "grok-delegate-state-"));
  try {
    const malformed = spawnSync(process.execPath, [CLI, "start", "--state-dir", stateDir], {
      input: "{bad",
      encoding: "utf8",
    });
    const lines = malformed.stdout.trim().split("\n").map((line) => JSON.parse(line));
    assert.equal(malformed.status, 2);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].error.kind, "validation");
  } finally {
    await rm(stateDir, { recursive: true, force: true });
  }
});
