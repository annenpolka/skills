import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { chmod, copyFile, link, mkdir, mkdtemp, readFile, realpath, rm, stat, symlink, truncate, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ImageAudit, imageMetadata, validateImageRequest } from "../scripts/grok-image.mjs";

const CLI = fileURLToPath(new URL("../scripts/grok-image.mjs", import.meta.url));
const MOCK = fileURLToPath(new URL("./fixtures/mock-grok-image.mjs", import.meta.url));
const SAFE_PATH = [...new Set([path.dirname(process.execPath), "/opt/homebrew/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"])].join(path.delimiter);
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");

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
  const raw = spawnSync(process.execPath, [CLI, "--output-dir", f.outputDir, "--grok-bin", f.mock ?? MOCK, ...extraArgs], {
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

async function referenceFixture(t, count = 2) {
  const f = await fixture(t);
  f.referenceImages = [];
  for (let i = 0; i < count; i++) {
    const file = path.join(f.root, `reference-${i + 1}.png`);
    await writeFile(file, PNG);
    f.referenceImages.push(file);
  }
  return f;
}

test("reference request rejects empty, duplicate, nonlocal and malformed attachment lists", () => {
  for (const referenceImages of [[], null, "x", [null], ["relative.png"], ["https://example.org/a.png"],
    ["data:image/png;base64,AAAA"], ["/tmp/a.png", "/tmp/./a.png"], Array.from({ length: 9 }, (_, i) => `/tmp/${i}.png`)]) {
    assert.throws(() => validateImageRequest({ schemaVersion: 1, prompt: "edit", referenceImages }));
  }
});

test("editing copies only selected refs and sends real ACP image blocks with matching hashes", async (t) => {
  const f = await referenceFixture(t), result = run(f, "success", { referenceImages: f.referenceImages });
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.json.tool, "image_edit");
  assert.equal(result.json.attachmentMode, "acp-images");
  assert.equal(result.json.references.length, 2);
  const invocation = JSON.parse(await readFile(path.join(f.outputDir, "workspace/mock-invocation.json")));
  assert.equal(invocation.args[invocation.args.indexOf("--tools") + 1], "image_edit");
  const blocks = JSON.parse(await readFile(path.join(f.outputDir, "workspace/mock-attachments.json")));
  for (const [i, ref] of result.json.references.entries()) {
    assert.equal(ref.path, path.join(f.outputDir, "workspace/references", `${i + 1}.png`));
    assert.deepEqual(await readFile(ref.path), await readFile(f.referenceImages[i]));
    assert.equal((await stat(ref.path)).mode & 0o777, 0o600);
    assert.equal(blocks[i].type, "image");
    assert.equal(blocks[i].mimeType, "image/png");
    assert.equal(blocks[i].sha256, ref.sha256);
    assert.equal(fileURLToPath(blocks[i].uri), ref.path);
  }
});

test("same-turn attachment tokens resolve to the authorized copies in order", async (t) => {
  const f = await referenceFixture(t), result = run(f, "attachment_tokens", { referenceImages: f.referenceImages });
  assert.equal(result.status, 0, result.stdout);
});

test("reference files fail before starting Grok if unreadable, linked, nonimage or oversized", async (t) => {
  for (const scenario of ["missing", "directory", "symlink", "hardlink", "corrupt", "oversized", "too_many_pixels"]) await t.test(scenario, async (t) => {
    const f = await fixture(t), source = path.join(f.root, "reference.png");
    if (scenario === "directory") await mkdir(source);
    else if (["symlink", "hardlink"].includes(scenario)) {
      const other = path.join(f.root, "other.png"); await writeFile(other, PNG);
      await (scenario === "symlink" ? symlink(other, source) : link(other, source));
    } else if (scenario !== "missing") {
      const bytes = Buffer.from(PNG);
      if (scenario === "too_many_pixels") { bytes.writeUInt32BE(4096, 16); bytes.writeUInt32BE(4096, 20); }
      await writeFile(source, scenario === "corrupt" ? "mock-secret-do-not-publish" : bytes);
      if (scenario === "oversized") await truncate(source, 32 * 1024 * 1024 + 1);
    }
    const result = run(f, "success", { referenceImages: [source] });
    assert.notEqual(result.status, 0, result.stdout);
    assert.equal(result.json.observedToolCalls, 0);
    await assert.rejects(stat(path.join(f.outputDir, "workspace/mock-invocation.json")));
  });
});

test("edit audits reject fallback generation, changed refs, output mismatches and reference mutations", async (t) => {
  for (const [scenario, kind] of [["edit_fallback_gen", "image_audit"], ["reordered_refs", "image_audit"],
    ["missing_ref", "image_audit"], ["extra_ref", "image_audit"], ["unknown_ref_token", "image_audit"],
    ["wrong_input_variant", "image_audit"], ["wrong_output_variant", "no_image"],
    ["reference_mutation", "reference_mutation"], ["source_mutation", "reference_mutation"],
    ["auth_mutation", "auth_source_mutation"], ["multiple", "image_audit"], ["permission", "image_permission"]]) await t.test(scenario, async (t) => {
    const f = await referenceFixture(t), result = run(f, scenario, { referenceImages: f.referenceImages });
    assert.notEqual(result.status, 0, result.stdout);
    assert.equal(result.json.error.kind, kind, result.stdout);
    assert.deepEqual(result.json.images, []);
  });
});

test("without ACP vision, native image_edit still receives every reference path", async (t) => {
  const f = await referenceFixture(t);
  f.mock = path.join(f.root, "no-image-capability.mjs");
  await copyFile(MOCK, f.mock); await chmod(f.mock, 0o755);
  const result = run(f, "success", { referenceImages: f.referenceImages });
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.json.tool, "image_edit");
  assert.equal(result.json.attachmentMode, "tool-reference-paths");
  assert.equal(result.json.references.length, 2);
  assert.deepEqual(JSON.parse(await readFile(path.join(f.outputDir, "workspace/mock-attachments.json"))), []);
});

test("attachment tokens are rejected when no ACP image blocks were sent", async (t) => {
  const f = await referenceFixture(t);
  f.mock = path.join(f.root, "no-image-capability.mjs");
  await copyFile(MOCK, f.mock); await chmod(f.mock, 0o755);
  const result = run(f, "attachment_tokens", { referenceImages: f.referenceImages });
  assert.equal(result.json.error.kind, "image_audit");
  assert.deepEqual(result.json.images, []);
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
