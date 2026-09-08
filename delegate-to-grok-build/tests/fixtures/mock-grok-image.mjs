#!/usr/bin/env node
import readline from "node:readline";
import { mkdir, writeFile, symlink, link } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const lines = readline.createInterface({ input: process.stdin });
const send = (value) => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...value })}\n`);
const sessionId = "image-session-1";
const editing = process.argv[process.argv.indexOf("--tools") + 1] === "image_edit";
const variant = editing ? "ImageEdit" : "ImageGen";
const native = { version: 1, namespace: "grok_build", name: editing ? "image_edit" : "image_gen", kind: "image_gen", label: "Image", read_only: false };
const update = (value) => send({ method: "session/update", params: { sessionId, update: value } });
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=", "base64");
let pendingPermission = null;
for await (const line of lines) {
  const message = JSON.parse(line);
  const { id, method, params } = message;
  if (!method) {
    if (pendingPermission) { send({ id: pendingPermission, result: { stopReason: "end_turn" } }); pendingPermission = null; }
    continue;
  }
  if (method === "initialize") send({ id, result: { protocolVersion: 1, agentCapabilities: { promptCapabilities: { image: !process.argv[1].includes("no-image-capability") } }, authMethods: [{ id: "cached_token" }, { id: "xai.api_key" }] } });
  else if (method === "authenticate") send({ id, result: {} });
  else if (method === "session/new") {
    await writeFile(path.join(process.cwd(), "mock-invocation.json"), JSON.stringify({ args: process.argv.slice(2), meta: params._meta, homes: [process.env.HOME, process.env.GROK_HOME], parallel: process.env.GROK_MAX_PARALLEL_IMAGE_GEN_CALLS }));
    send({ id, result: { sessionId } });
  } else if (method === "session/prompt") {
    const brief = JSON.parse(params.prompt[0].text.split("\n").find((line) => line.startsWith("{")));
    const scenario = brief.prompt;
    const attachments = params.prompt.slice(1).map((b) => ({ type: b.type, mimeType: b.mimeType, uri: b.uri,
      sha256: createHash("sha256").update(Buffer.from(b.data, "base64")).digest("hex") }));
    await writeFile(path.join(process.cwd(), "mock-attachments.json"), JSON.stringify(attachments));
    if (scenario === "timeout") continue;
    if (scenario === "permission") {
      pendingPermission = id;
      send({ id: "permission-1", method: "session/request_permission", params: { sessionId, toolCall: { toolCallId: "image-1", _meta: { "x.ai/tool": native } }, options: [{ kind: "allow_once", optionId: "yes" }] } });
      continue;
    }
    const rawInput = { prompt: brief.prompt, aspect_ratio: brief.aspect_ratio, ...(editing ? { image: [...brief.image] } : {}) };
    if (scenario === "attachment_tokens") rawInput.image = brief.image.map((_, i) => `[Image #${i + 1}]`);
    if (scenario === "reordered_refs") rawInput.image.reverse();
    if (scenario === "missing_ref") rawInput.image.pop();
    if (scenario === "extra_ref") rawInput.image.push("/tmp/not-requested.png");
    if (scenario === "unknown_ref_token") rawInput.image[0] = "[Image #99]";
    const identity = scenario === "wrong_tool" ? { ...native, name: "bash", kind: "execute" }
      : scenario === "edit_fallback_gen" ? { ...native, name: "image_gen" } : native;
    update({ sessionUpdate: "tool_call", toolCallId: "image-1", rawInput, _meta: { "x.ai/tool": identity } });
    if (scenario === "multiple") update({ sessionUpdate: "tool_call", toolCallId: "image-2", rawInput, _meta: { "x.ai/tool": native } });
    update({ sessionUpdate: "tool_call_update", toolCallId: "image-1", kind: "other", rawInput: { ...rawInput, variant: scenario === "wrong_input_variant" ? "ImageGen" : variant, ...(scenario === "changed_input" ? { prompt: "changed" } : {}) } });
    if (scenario === "failed") {
      update({ sessionUpdate: "tool_call_update", toolCallId: "image-1", status: "failed" });
      send({ id, result: { stopReason: "end_turn" } });
      continue;
    }
    const directory = path.join(process.env.GROK_HOME, "sessions", encodeURIComponent(process.cwd()), sessionId, "images");
    await mkdir(directory, { recursive: true });
    const imagePath = path.join(directory, "1.jpg");
    if (["symlink", "hardlink"].includes(scenario)) {
      const other = path.join(process.cwd(), "other.png");
      await writeFile(other, png);
      await (scenario === "symlink" ? symlink(other, imagePath) : link(other, imagePath));
    } else await writeFile(imagePath, scenario === "corrupt" ? "not an image" : png);
    if (scenario === "auth_mutation") await writeFile(process.env.GROK_AUTH_PATH, JSON.stringify({ token: "mutated-test-secret-should-never-appear" }), { mode: 0o600 });
    if (scenario === "reference_mutation") await writeFile(brief.image[0], "changed");
    if (scenario === "source_mutation") await writeFile(path.resolve(process.cwd(), "..", "..", "reference-1.png"), "changed");
    const rawOutput = scenario === "no_image" ? { type: "Text", text: "mock-secret-do-not-publish: subscription unavailable" }
      : { type: scenario === "wrong_output_variant" ? "ImageGen" : variant, path: scenario === "outside_path" ? path.join(process.cwd(), "other.png") : imagePath, filename: "1.jpg", session_folder: "images" };
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: "mock-secret-do-not-publish: I generated a perfect image." } });
    update({ sessionUpdate: "tool_call_update", toolCallId: "image-1", status: "completed", rawOutput });
    send({ id, result: { stopReason: "end_turn" } });
    if (scenario === "late_tool") setTimeout(() => update({ sessionUpdate: "tool_call", toolCallId: "late", rawInput, _meta: { "x.ai/tool": native } }), 20);
  } else if (method === "session/cancel") process.exit(0);
  else send({ id, error: { code: -32601, message: "Method not found" } });
}
