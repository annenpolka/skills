#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, realpath } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  AcpPeer, DelegateError, buildGrokArgs, chooseAuthMethod, exactKeys,
  inheritedEnvironmentBindingHash, inspectCachedAuthSource, pathEnvironmentBindingHash,
  prepareGrokEnvironment, readJsonStdin, safeWorkspacePath, stableJson, stopAcp,
  writeSecureFile,
} from "./grok-delegate.mjs";

const RATIOS = ["auto", "1:1", "16:9", "9:16", "3:2", "2:3", "4:3", "3:4"];
const MAX_IMAGE_BYTES = 32 * 1024 * 1024;
const MAX_REFERENCES = 8;
const fail = (kind, message, code = 1) => { throw new DelegateError(kind, message, code); };

export function validateImageRequest(input) {
  exactKeys(input, ["schemaVersion", "prompt"], ["aspectRatio", "timeoutMs", "referenceImages"], "image request");
  if (input.schemaVersion !== 1) fail("validation", "schemaVersion must be 1", 2);
  if (typeof input.prompt !== "string" || !input.prompt.trim() || input.prompt.includes("\0")
    || Buffer.byteLength(input.prompt) > 32_768) fail("validation", "prompt must be 1–32768 UTF-8 bytes without NUL", 2);
  const aspectRatio = input.aspectRatio ?? "auto";
  if (!RATIOS.includes(aspectRatio)) fail("validation", "Unsupported aspectRatio", 2);
  const timeoutMs = input.timeoutMs ?? 300_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 600_000) {
    fail("validation", "timeoutMs must be an integer from 100 to 600000", 2);
  }
  const referenceImages = input.referenceImages ?? [];
  if (input.referenceImages !== undefined && (!Array.isArray(referenceImages)
    || referenceImages.length < 1 || referenceImages.length > MAX_REFERENCES
    || referenceImages.some((p) => typeof p !== "string" || !path.isAbsolute(p) || p.includes("\0"))
    || new Set(referenceImages.map((p) => path.normalize(p))).size !== referenceImages.length)) {
    fail("validation", "referenceImages must contain 1–8 distinct absolute local PNG/JPEG paths", 2);
  }
  return { ...input, aspectRatio, timeoutMs, referenceImages };
}

async function readReference(source) {
  let handle;
  try {
    const info = await lstat(source);
    if (!info.isFile() || info.nlink !== 1 || info.size < 24 || info.size > MAX_IMAGE_BYTES) {
      fail("reference_image", "Reference must be a bounded regular image file with one link", 2);
    }
    handle = await open(source, constants.O_RDONLY | constants.O_NOFOLLOW);
    const opened = await handle.stat();
    if (!opened.isFile() || opened.ino !== info.ino || opened.dev !== info.dev || opened.size !== info.size) {
      fail("reference_image", "Reference changed while opening", 2);
    }
    // Bound the read even if another process grows the source concurrently.
    const buffer = Buffer.alloc(info.size + 1);
    let length = 0;
    while (length < buffer.length) {
      const { bytesRead } = await handle.read(buffer, length, buffer.length - length, length);
      if (!bytesRead) break;
      length += bytesRead;
    }
    const after = await handle.stat();
    if (length !== info.size || after.size !== info.size || after.nlink !== 1
      || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) {
      fail("reference_image", "Reference changed while reading", 2);
    }
    const bytes = buffer.subarray(0, length), metadata = imageMetadata(bytes);
    if (metadata.width * metadata.height > 12_000_000) fail("reference_image", "Reference exceeds 12 million pixels", 2);
    return { bytes, metadata, sha256: createHash("sha256").update(bytes).digest("hex") };
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    fail("reference_image", "Could not read the requested local reference image", 2);
  } finally { await handle?.close(); }
}

async function prepareReferences(sources, root, workspace) {
  const references = [];
  if (sources.length) await mkdir(path.join(workspace, "references"), { mode: 0o700 });
  let total = 0;
  for (const source of sources) {
    const reference = await readReference(source);
    total += reference.bytes.length;
    if (total > MAX_IMAGE_BYTES) fail("reference_image", "References exceed 32 MiB in total", 2);
    const destination = path.join(workspace, "references", `${references.length + 1}.${reference.metadata.extension}`);
    await writeSecureFile(destination, reference.bytes, root);
    references.push({ ...reference, source, path: destination });
  }
  return references;
}

// Header/container checks are mechanical evidence; viewing/decoding the image is still required.
export function imageMetadata(bytes) {
  if (bytes.length < 24 || bytes.length > MAX_IMAGE_BYTES) fail("image_format", "Image is empty, too small, or exceeds 32 MiB");
  const png = Buffer.from("89504e470d0a1a0a", "hex");
  if (bytes.subarray(0, 8).equals(png) && bytes.toString("ascii", 12, 16) === "IHDR"
    && bytes.readUInt32BE(8) === 13 && bytes.subarray(-12).equals(Buffer.from("0000000049454e44ae426082", "hex"))) {
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    if (width && height && width <= 16384 && height <= 16384) return { mimeType: "image/png", extension: "png", width, height };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes.at(-2) === 0xff && bytes.at(-1) === 0xd9) {
    let offset = 2;
    while (offset + 4 <= bytes.length) {
      if (bytes[offset++] !== 0xff) break;
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xda || marker === 0xd9) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) break;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) break;
      if ([0xc0, 0xc1, 0xc2].includes(marker) && length >= 8) {
        const height = bytes.readUInt16BE(offset + 3), width = bytes.readUInt16BE(offset + 5);
        if (width && height && width <= 16384 && height <= 16384) return { mimeType: "image/jpeg", extension: "jpg", width, height };
      }
      offset += length;
    }
  }
  fail("image_format", "Generated file is not a supported PNG/JPEG container");
}

// image_gen in Grok 1.0.13 executes without request_permission. This is an
// observation audit, not a pre-execution permission or billing boundary.
export class ImageAudit {
  constructor(aspectRatio, referencePaths = []) {
    this.aspectRatio = aspectRatio; this.referencePaths = [...referencePaths];
    this.tool = referencePaths.length ? "image_edit" : "image_gen";
    this.variant = referencePaths.length ? "ImageEdit" : "ImageGen";
    this.allowAttachmentTokens = false;
    this.call = null; this.error = null; this.count = 0;
  }
  referencePath(value) {
    if (typeof value !== "string") return null;
    // ACP image blocks establish these 1-based attachments in the same turn.
    const token = /^(?:\[Image #(\d+)\]|Image #(\d+)|image #(\d+)|#(\d+))$/.exec(value);
    if (token) return this.allowAttachmentTokens ? this.referencePaths[Number(token.slice(1).find(Boolean)) - 1] ?? null : null;
    if (value.startsWith("file://")) { try { return fileURLToPath(value); } catch { return null; } }
    return value;
  }
  observe(update) {
    if (!["tool_call", "tool_call_update"].includes(update?.sessionUpdate)) return;
    const id = update.toolCallId;
    if (typeof id !== "string" || !id) fail("image_audit", "Missing tool call identity");
    if (update.sessionUpdate === "tool_call") {
      this.count++;
      if (this.call) fail("image_audit", "More than one tool call was observed; no automatic retry is permitted");
      this.call = { id, terminal: false, output: null };
    }
    if (!this.call || this.call.id !== id || this.call.terminal) fail("image_audit", "Unexpected or repeated tool update");
    const native = update._meta?.["x.ai/tool"];
    if (update.sessionUpdate === "tool_call" && !native) fail("image_audit", "Native image tool identity is required");
    if (native && (native.version !== 1 || native.namespace !== "grok_build" || native.name !== this.tool
      || native.kind !== "image_gen" || native.read_only !== false)) fail("image_audit", "Unexpected native tool identity");
    if (update.kind !== undefined && update.kind !== "other") fail("image_audit", "Unexpected image tool display kind");
    const input = update.rawInput;
    if (input !== undefined) {
      try { exactKeys(input, ["prompt", "aspect_ratio", ...(this.referencePaths.length ? ["image"] : [])], ["variant"], "image tool input"); }
      catch { fail("image_audit", "Image tool input has an unexpected shape"); }
      if (typeof input.prompt !== "string" || !input.prompt.trim() || input.aspect_ratio !== this.aspectRatio
        || (input.variant !== undefined && input.variant !== this.variant)) fail("image_audit", "Unexpected image tool input");
      const images = this.referencePaths.length && Array.isArray(input.image) ? input.image.map((p) => this.referencePath(p)) : [];
      if (this.referencePaths.length && stableJson(images) !== stableJson(this.referencePaths)) {
        fail("image_audit", "Image edit references do not match the requested copies in order");
      }
      const normalized = stableJson({ prompt: input.prompt, aspect_ratio: input.aspect_ratio, ...(this.referencePaths.length ? { image: images } : {}) });
      if (this.call.input && normalized !== this.call.input) fail("image_audit", "Image tool input changed during execution");
      this.call.input = normalized;
    }
    if (update.status === undefined || ["pending", "queued", "running", "in_progress"].includes(update.status)) return;
    this.call.terminal = true;
    if (update.status !== "completed") fail("generation_failed", "Image generation did not complete; inspect account availability before retrying");
    if (!this.call.input || update.rawOutput?.type !== this.variant || typeof update.rawOutput.path !== "string") {
      fail("no_image", "Grok returned no structured local image; account restrictions or tool availability may be the cause");
    }
    this.call.output = update.rawOutput;
  }
  result() {
    if (!this.call?.terminal || !this.call.output) fail("no_image", "No completed image artifact was received");
    return this.call.output;
  }
}

async function readImage(output, root, workspace, sessionId) {
  const expectedDirectory = path.join(root, "grok-home", "sessions", encodeURIComponent(workspace), sessionId, "images");
  if (output.uploaded_url || output.session_folder !== "images" || !/^\d+\.jpg$/.test(output.filename)
    || output.path !== path.join(expectedDirectory, output.filename)) fail("image_path", "Image path is outside this session's generated-image directory");
  const source = (await safeWorkspacePath(root, output.path, { mustExist: true })).absolute;
  const info = await lstat(source);
  if (!info.isFile() || info.nlink !== 1 || info.size > MAX_IMAGE_BYTES) fail("image_path", "Generated image must be a bounded regular file with one link");
  const handle = await open(source, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const opened = await handle.stat();
    if (opened.ino !== info.ino || opened.dev !== info.dev || opened.size !== info.size) fail("image_path", "Generated image changed while opening");
    const bytes = await handle.readFile();
    const after = await handle.stat();
    if (after.size !== opened.size || after.mtimeMs !== opened.mtimeMs || after.ctimeMs !== opened.ctimeMs) fail("image_path", "Generated image changed while reading");
    return { bytes, metadata: imageMetadata(bytes) };
  } finally { await handle.close(); }
}

export async function generateImage(request, { outputDir, grokBin = "grok" }) {
  const input = validateImageRequest(request);
  if (!path.isAbsolute(outputDir)) fail("validation", "--output-dir must be an absolute new directory", 2);
  const parent = await realpath(path.dirname(outputDir));
  const root = path.join(parent, path.basename(outputDir));
  // mkdir without recursive is intentional: existing destinations are never reused.
  try { await mkdir(root, { mode: 0o700 }); }
  catch (error) { if (error.code === "EEXIST") fail("output_exists", "Output directory already exists; choose a new directory", 2); throw error; }
  let peer, sessionId, authSource, timer, interruptHandler, active = false, attachmentMode = "none";
  let references = [];
  let audit = new ImageAudit(input.aspectRatio);
  let result;
  const checkAuth = async () => {
    if (!authSource) return;
    const after = await inspectCachedAuthSource(authSource.path, authSource.protectedRoots, "auth_source_mutation");
    if (stableJson(after.fingerprint) !== stableJson(authSource.fingerprint)) fail("auth_source_mutation", "Cached Grok auth changed during generation");
  };
  const checkReferences = async () => {
    for (const reference of references) {
      try {
        for (const source of [reference.path, reference.source]) {
          if ((await readReference(source)).sha256 !== reference.sha256) throw new Error("changed");
        }
      } catch { fail("reference_mutation", "A reference image changed during image editing"); }
    }
  };
  try {
    const workspace = path.join(root, "workspace");
    await mkdir(workspace, { mode: 0o700 });
    references = await prepareReferences(input.referenceImages, root, workspace);
    audit = new ImageAudit(input.aspectRatio, references.map((r) => r.path));
    const task = { agent: { executionProfile: "trusted_local", inheritEnv: process.env.XAI_API_KEY ? ["XAI_API_KEY"] : [], sandbox: null } };
    const prepared = await prepareGrokEnvironment(root, task, null,
      inheritedEnvironmentBindingHash(task.agent.inheritEnv), pathEnvironmentBindingHash(),
      { authProtectedRoots: [root] });
    authSource = prepared.authSource;
    const args = buildGrokArgs(task, workspace);
    args.unshift("--tools", audit.tool, "--max-turns", "2");
    const child = spawn(grokBin, args, {
      cwd: workspace, env: { ...prepared.environment, GROK_MAX_PARALLEL_IMAGE_GEN_CALLS: "1" },
      detached: process.platform !== "win32", shell: false, stdio: ["pipe", "pipe", "pipe"],
    });
    peer = new AcpPeer(child, {
      onNotification(method, params) {
        if (method !== "session/update") return;
        if (!["tool_call", "tool_call_update"].includes(params?.update?.sessionUpdate)) return;
        try {
          if (!active || params.sessionId !== sessionId) fail("image_audit", "Tool execution outside the active image prompt");
          audit.observe(params.update);
        } catch (error) { audit.error = error; peer.fail(error); }
      },
      onReverseRequest(method) {
        if (method !== "session/request_permission") return { __jsonRpcError: { code: -32601, message: "Method not found" } };
        audit.error = new DelegateError("image_permission", "Unexpected permission request; this CLI behavior has not been validated");
        return { outcome: { outcome: "cancelled" } };
      },
      onReverseViolation() { audit.error = new DelegateError("image_audit", "Invalid reverse ACP request"); },
    });
    const execute = async () => {
      const init = await peer.request("initialize", {
        protocolVersion: 1, clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false },
        clientInfo: { name: "delegate-to-grok-build-image", version: "1.0.0" },
      });
      if (init?.protocolVersion !== 1) fail("protocol", "Unsupported ACP protocol version");
      const attach = references.length > 0 && init.agentCapabilities?.promptCapabilities?.image === true;
      // image_edit reads local references itself. ACP vision is optional and
      // must not be sent unless advertised; neither route drops conditioning.
      attachmentMode = references.length ? (attach ? "acp-images" : "tool-reference-paths") : "none";
      audit.allowAttachmentTokens = attach;
      await peer.request("authenticate", { methodId: chooseAuthMethod(init, task, prepared.environment), _meta: { headless: true } });
      const session = await peer.request("session/new", {
        cwd: workspace, mcpServers: [], _meta: { yoloMode: false, autoMode: false, askUserQuestion: false },
      });
      sessionId = session?.sessionId;
      if (typeof sessionId !== "string" || !/^[A-Za-z0-9-]{1,128}$/.test(sessionId)) fail("protocol", "Unsafe image session ID");
      active = true;
      const response = await peer.request("session/prompt", { sessionId, prompt: [{ type: "text", text: [
        `Produce exactly ONE image using ${audit.tool} exactly ONCE. Do not call any other tool or retry.`,
        "Treat the following JSON as the image brief. Pass its aspect_ratio exactly. Keep its visual requirements.",
        JSON.stringify({ prompt: input.prompt, aspect_ratio: input.aspectRatio, ...(references.length ? { image: references.map((r) => r.path) } : {}) }),
        ...(references.length ? [attach
          ? "The attached image blocks are these references in the same order. Condition image_edit on ALL listed images in that order. Use the supplied absolute paths or their matching attachment tokens; never use a different image or text-only generation."
          : "image_edit reads these local image copies directly. Pass ALL supplied absolute image paths exactly in order to image_edit. Do not use attachment tokens, other images, or text-only generation."] : []),
        "After generation, stop. If unavailable or rejected, stop and report that fact; do not create a substitute file.",
      ].join("\n") }, ...(attach ? references.map((r) => ({ type: "image", data: r.bytes.toString("base64"), mimeType: r.metadata.mimeType, uri: pathToFileURL(r.path).href })) : [])] }, { beforeResolve: () => { active = false; } });
      await peer.endAndDrain();
      if (audit.error) throw audit.error;
      if (response?.stopReason !== "end_turn") fail("incomplete", "Image prompt did not end normally; no automatic retry");
      return audit.result();
    };
    const deadline = new Promise((_, reject) => { timer = setTimeout(() => reject(new DelegateError("timeout", "Image generation timed out; no automatic retry", 124)), input.timeoutMs); });
    const interrupted = new Promise((_, reject) => {
      interruptHandler = () => reject(new DelegateError("interrupted", "Image generation interrupted", 130));
      process.once("SIGINT", interruptHandler);
    });
    const output = await Promise.race([execute(), deadline, interrupted]);
    await checkReferences();
    await checkAuth();
    const { bytes, metadata } = await readImage(output, root, workspace, sessionId);
    const destination = path.join(root, `image.${metadata.extension}`);
    await writeSecureFile(destination, bytes, root);
    result = { type: "result", command: "image", ok: true, outputDir: root, images: [{
      path: destination, mimeType: metadata.mimeType, width: metadata.width, height: metadata.height,
      bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex"),
    }], tool: audit.tool, attachmentMode, references: references.map((r) => ({ path: r.path, mimeType: r.metadata.mimeType,
      width: r.metadata.width, height: r.metadata.height, bytes: r.bytes.length, sha256: r.sha256 })),
    observedToolCalls: 1, visualReviewRequired: true, error: null };
  } catch (error) {
    active = false;
    if (peer) await stopAcp(peer, sessionId, 2000);
    try { await checkReferences(); } catch (referenceError) { error = referenceError; }
    try { await checkAuth(); } catch (authError) { error = authError; }
    const known = error instanceof DelegateError;
    result = { type: "result", command: "image", ok: false, outputDir: root, images: [],
      observedToolCalls: audit.count,
      error: { kind: known ? error.kind : "internal", message: known ? error.message : "Image generation failed; artifacts were preserved", exitCode: known ? error.exitCode : 1 } };
  } finally {
    clearTimeout(timer);
    if (interruptHandler) process.removeListener("SIGINT", interruptHandler);
  }
  await writeSecureFile(path.join(root, "result.json"), `${JSON.stringify(result, null, 2)}\n`, root);
  return result;
}

async function main() {
  let result;
  try {
    const args = process.argv.slice(2), options = {};
    if (args.length === 1 && ["--help", "-h"].includes(args[0])) {
      console.log("Usage: node grok-image.mjs --output-dir /absolute/new-directory [--grok-bin /absolute/grok] < image-request.json");
      return;
    }
    for (let i = 0; i < args.length; i += 2) {
      if (!["--output-dir", "--grok-bin"].includes(args[i]) || !args[i + 1] || options[args[i]]) fail("usage", "Expected --output-dir and optional --grok-bin, each once", 2);
      options[args[i]] = args[i + 1];
    }
    if (!options["--output-dir"]) fail("usage", "--output-dir is required", 2);
    result = await generateImage(await readJsonStdin("image request"), { outputDir: options["--output-dir"], grokBin: options["--grok-bin"] });
  } catch (error) {
    result = { type: "result", command: "image", ok: false, images: [], error: {
      kind: error instanceof DelegateError ? error.kind : "internal",
      message: error instanceof DelegateError ? error.message : "Could not prepare image generation",
      exitCode: error instanceof DelegateError ? error.exitCode : 1,
    } };
  }
  console.log(JSON.stringify(result));
  if (!result.ok) process.exitCode = result.error?.exitCode ?? 1;
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
