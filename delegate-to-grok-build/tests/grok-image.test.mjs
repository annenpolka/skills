import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, mkdtemp, readFile, realpath, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ImageAudit, imageMetadata, validateImageRequest } from "../scripts/grok-image.mjs";

const CLI = fileURLToPath(new URL("../scripts/grok-image.mjs", import.meta.url));
const MOCK = fileURLToPath(new URL("./fixtures/mock-grok-image.mjs", import.meta.url));
const SAFE_PATH = [...new Set([path.dirname(process.execPath), "/opt/homebrew/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"])].join(path.delimiter);

async function fixture(t) {
  const root = await mkdtemp(path.join(await realpath(os.tmpdir()), "grok-image-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await chmod(MOCK, 0o755);
  const authPath = path.join(root, "auth.json");
  await writeFile(authPath, JSON.stringify({ token: "mock-secret-do-not-publish" }), { mode: 0o600 });
  const env = { ...process.env, PATH: SAFE_PATH, GROK_AUTH_PATH: authPath };
  delete env.XAI_API_KEY;
  return { root, env, outputDir: path.join(root, "output") };
}

function run(f, scenario = "success", overrides = {}, extraArgs = []) {
  const raw = spawnSync(process.execPath, [CLI, "--output-dir", f.outputDir, "--grok-bin", MOCK, ...extraArgs], {
    input: JSON.stringify({ schemaVersion: 1, prompt: scenario, aspectRatio: "1:1", timeoutMs: 5000, ...overrides }),
    env: f.env, encoding: "utf8", timeout: 10000,
  });
  assert.equal(raw.error, undefined);
  assert.equal(raw.stdout.trim().split("\n").length, 1);
  assert.ok(!raw.stdout.includes("mock-secret") && !raw.stdout.includes("mutated-test-secret"));
  return { ...raw, json: JSON.parse(raw.stdout) };
}

test("strict request rejects missing/unknown values and applies bounded defaults", () => {
  assert.equal(validateImageRequest({ schemaVersion: 1, prompt: "duck" }).aspectRatio, "auto");
  for (const input of [null, {}, { schemaVersion: 2, prompt: "duck" }, { schemaVersion: 1, prompt: "" },
    { schemaVersion: 1, prompt: "x", extra: true }, { schemaVersion: 1, prompt: "x", aspectRatio: "0:0" },
    { schemaVersion: 1, prompt: "x", timeoutMs: 600001 }, { schemaVersion: 1, prompt: "x".repeat(32769) }]) {
    assert.throws(() => validateImageRequest(input));
  }
});

test("successful ACP generation exports actual image bytes, dimensions, hash and private receipt", async (t) => {
  const f = await fixture(t), result = run(f);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.json.ok, true);
  const image = result.json.images[0], bytes = await readFile(image.path);
  assert.equal(image.mimeType, "image/png");
  assert.equal(path.basename(image.path), "image.png");
  assert.deepEqual([image.width, image.height], [1, 1]);
  assert.equal(image.bytes, bytes.length);
  assert.equal(image.sha256, createHash("sha256").update(bytes).digest("hex"));
  assert.equal((await stat(f.outputDir)).mode & 0o777, 0o700);
  assert.equal((await stat(image.path)).mode & 0o777, 0o600);
  assert.deepEqual(JSON.parse(await readFile(path.join(f.outputDir, "result.json"))), result.json);
  const invocation = JSON.parse(await readFile(path.join(f.outputDir, "workspace", "mock-invocation.json")));
  assert.equal(invocation.args[invocation.args.indexOf("--tools") + 1], "image_gen");
  assert.equal(invocation.args[invocation.args.indexOf("--max-turns") + 1], "2");
  assert.equal(invocation.parallel, "1");
  assert.deepEqual(invocation.meta, { yoloMode: false, autoMode: false, askUserQuestion: false });
  assert.ok(invocation.homes.every((home) => home.startsWith(result.json.outputDir + path.sep)));
  assert.ok(!invocation.args.some((arg) => ["--always-approve", "--trust", "bypassPermissions"].includes(arg)));
});

test("existing output is rejected before Grok executes and leaves bytes unchanged", async (t) => {
  const f = await fixture(t), first = run(f), before = await readFile(first.json.images[0].path);
  const second = run(f);
  assert.equal(second.status, 2);
  assert.equal(second.json.error.kind, "output_exists");
  assert.deepEqual(await readFile(first.json.images[0].path), before);
});

test("failed, missing, untrusted and malformed results cannot become successful artifacts", async (t) => {
  for (const [scenario, kind] of [
    ["no_image", "no_image"], ["failed", "generation_failed"], ["outside_path", "image_path"],
    ["symlink", "path_policy"], ["hardlink", "image_path"], ["corrupt", "image_format"],
    ["multiple", "image_audit"], ["wrong_tool", "image_audit"], ["changed_input", "image_audit"],
    ["permission", "image_permission"], ["late_tool", "image_audit"], ["auth_mutation", "auth_source_mutation"],
  ]) await t.test(scenario, async (t) => {
    const f = await fixture(t), result = run(f, scenario);
    assert.notEqual(result.status, 0, result.stdout);
    assert.equal(result.json.error.kind, kind, result.stdout);
    assert.deepEqual(result.json.images, []);
    assert.equal((await stat(path.join(f.outputDir, "result.json"))).isFile(), true);
  });
});

test("timeout cancels the native session and preserves a failure receipt without retrying", async (t) => {
  const f = await fixture(t), result = run(f, "timeout", { timeoutMs: 300 });
  assert.equal(result.status, 124, result.stdout);
  assert.equal(result.json.error.kind, "timeout");
  assert.equal(result.json.observedToolCalls, 0);
});

test("SIGINT cancels and exits 130", async (t) => {
  const f = await fixture(t);
  const child = spawn(process.execPath, [CLI, "--output-dir", f.outputDir, "--grok-bin", MOCK], { env: f.env, stdio: ["pipe", "pipe", "pipe"] });
  child.stdin.end(JSON.stringify({ schemaVersion: 1, prompt: "timeout", timeoutMs: 5000 }));
  let stdout = "";
  child.stdout.on("data", (data) => { stdout += data; });
  const closed = new Promise((resolve) => child.on("close", resolve));
  const start = Date.now();
  while (true) {
    try { await stat(path.join(f.outputDir, "workspace", "mock-invocation.json")); break; }
    catch { if (Date.now() - start > 3000) throw new Error("Mock did not start"); await new Promise((resolve) => setTimeout(resolve, 20)); }
  }
  child.kill("SIGINT");
  assert.equal(await closed, 130);
  assert.equal(JSON.parse(stdout).error.kind, "interrupted");
});

test("audit requires native identity, matching lifecycle and input; headers reject corrupt files", () => {
  const audit = new ImageAudit("1:1");
  assert.throws(() => audit.observe({ sessionUpdate: "tool_call_update", toolCallId: "unknown", status: "completed" }));
  assert.throws(() => new ImageAudit("1:1").observe({ sessionUpdate: "tool_call", toolCallId: "one", title: "image_gen" }));
  assert.throws(() => imageMetadata(Buffer.from("not an image")));
  assert.throws(() => imageMetadata(Buffer.alloc(40)));
});
