#!/usr/bin/env node

import { createHash } from "node:crypto";
import { appendFile, chmod, mkdir, readFile, rename, symlink, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { pathToFileURL } from "node:url";

const configuredScenario = process.env.MOCK_SCENARIO ?? "success";
let scenario = configuredScenario;
const CONTINUATION_SCENARIOS = new Map([
  ["two_round_prior", "round_two_prior"],
  ["two_round_silent", "round_two_silent"],
  ["two_round_same_silent", "round_two_same_silent"],
  ["two_round_verifier_mutation", "round_two_prior"],
  ["two_round_timeout_same_path", "timeout_same_path"],
]);
const logPath = process.env.MOCK_LOG ?? null;
const sentinel = process.env.MOCK_SENTINEL ?? "PRIVATE_SENTINEL_9f74";
const malformedAuthSecret = "POSTCHECK_AUTH_SENTINEL_d6b1702f";
const workspace = process.cwd();
const sessionId = "session-PRIVATE_SENTINEL_4c0e7b8a";
let promptRequest = null;
let permissionQueue = [];
let loaded = false;
let reverseResponses = 0;
let authEchoSecrets = [];

async function log(value) {
  if (!logPath) return;
  await appendFile(logPath, `${JSON.stringify(value)}\n`, { mode: 0o600 });
}

function send(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function response(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function rpcError(id, code = -32000) {
  send({ jsonrpc: "2.0", id, error: { code, message: sentinel } });
}

function update(updateValue) {
  send({ jsonrpc: "2.0", method: "session/update", params: { sessionId, update: updateValue } });
}

async function write(relative, contents) {
  const target = path.join(workspace, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

function report(summary = "Implemented the frozen change", changePath = "src/result.txt") {
  return JSON.stringify({
    schemaVersion: 1,
    summary,
    changes: [{ path: changePath, description: "Added the delegated result" }],
    verificationNotes: ["Wrapper verification is authoritative"],
    risks: [],
    residue: [{ id: "quality-review", status: "pending_human_review", note: "Review semantics" }],
  });
}

function authEchoReport() {
  const echoed = [...authEchoSecrets, sessionId].join("|");
  return JSON.stringify({
    schemaVersion: 1,
    summary: echoed,
    changes: [{ path: "src/result.txt", description: echoed }],
    verificationNotes: [echoed],
    risks: [echoed],
    residue: [{ id: "auth-echo", status: "pending_human_review", note: echoed }],
  });
}

async function finishPrompt(text = report()) {
  update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text } });
  response(promptRequest.id, { stopReason: "end_turn" });
  promptRequest = null;
}

async function finishAuthEcho() {
  const text = authEchoReport();
  const offsets = [authEchoSecrets[0], sessionId]
    .map((secret) => text.indexOf(secret) + Math.floor(secret.length / 2))
    .sort((left, right) => left - right);
  let cursor = 0;
  for (const offset of offsets) {
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: text.slice(cursor, offset) } });
    cursor = offset;
  }
  update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: text.slice(cursor) } });
  response(promptRequest.id, { stopReason: "end_turn" });
  promptRequest = null;
}

function requestPermission({
  id, kind, input, secondaryInput = null, options, pathValue = null,
  toolCallId = `tool-${id}`, session = sessionId, metadata = null, title = null,
}) {
  const toolCall = {
    title: title ?? `${kind} ${sentinel}`,
    rawInput: input,
    rawOutput: sentinel,
  };
  if (kind) toolCall.kind = kind;
  if (toolCallId) toolCall.toolCallId = toolCallId;
  if (secondaryInput) toolCall.input = secondaryInput;
  if (metadata) toolCall._meta = metadata;
  if (pathValue) toolCall.locations = [{ path: pathValue }];
  send({
    jsonrpc: "2.0",
    id,
    method: "session/request_permission",
    params: { sessionId: session, toolCall, options },
  });
  return toolCall.toolCallId;
}

function requestUnknownMethod(id) {
  send({
    jsonrpc: "2.0",
    id,
    method: "workspace/private_probe",
    params: { value: sentinel },
  });
}

const standardOptions = [
  { optionId: "once", kind: "allow_once" },
  { optionId: "always", kind: "allow_always" },
  { optionId: "reject", kind: "reject_once" },
];

const realOptions = [
  { optionId: "always", name: "Always Allow", kind: "allow_always" },
  { optionId: "once", name: "Allow Once", kind: "allow_once" },
  { optionId: "reject", name: "Reject", kind: "reject_once" },
];

function realWriteMetadata(relative = "src/result.txt", overrides = {}) {
  return {
    "x.ai/tool": {
      version: 1,
      namespace: "opencode",
      name: "write",
      kind: "write",
      label: "Write",
      read_only: false,
      input: { path: relative },
      ...overrides,
    },
  };
}

function realWriteInput(relative = "src/result.txt") {
  return {
    content: "delegated\n",
    file_path: path.join(workspace, relative),
    variant: "Write",
  };
}

function announceRealWrite(
  toolCallId = "real-write",
  relative = "src/result.txt",
  metadata = realWriteMetadata(relative),
) {
  update({
    sessionUpdate: "tool_call",
    toolCallId,
    title: "write",
    rawInput: realWriteInput(relative),
    _meta: metadata,
  });
}

function enrichRealWrite({
  toolCallId = "real-write",
  relative = "src/result.txt",
  displayKind = "edit",
  metadata = realWriteMetadata(relative),
} = {}) {
  update({
    sessionUpdate: "tool_call_update",
    toolCallId,
    kind: displayKind,
    title: `Write \`${relative}\``,
    content: [{ type: "diff", path: relative, oldText: "", newText: "delegated\n" }],
    locations: [{ path: relative }],
    rawInput: realWriteInput(relative),
    _meta: metadata,
  });
}

function completeRealWrite({
  toolCallId = "real-write",
  relative = "src/result.txt",
  includePath = false,
  status = "completed",
} = {}) {
  const value = {
    sessionUpdate: "tool_call_update",
    toolCallId,
    status,
    content: [{ type: "diff", path: relative, oldText: "base\n", newText: "delegated\n" }],
    rawOutput: { type: "SearchReplace", result: "ok" },
  };
  if (includePath) value.rawInput = realWriteInput(relative);
  update(value);
}

function requestRealWritePermission({
  id = 980,
  toolCallId = "real-write",
  relative = "src/result.txt",
  displayKind = "edit",
  metadata = realWriteMetadata(relative),
  status = null,
  paramsToolCallId = null,
} = {}) {
  const toolCall = {
    toolCallId,
    title: "write",
    kind: displayKind,
    rawInput: realWriteInput(relative),
    _meta: metadata,
  };
  if (status !== null) toolCall.status = status;
  const params = {
    sessionId,
    toolCall,
    options: realOptions,
    _meta: { source: "real-grok-fixture" },
  };
  if (paramsToolCallId !== null) params.toolCallId = paramsToolCallId;
  send({
    jsonrpc: "2.0",
    id,
    method: "session/request_permission",
    params,
  });
}

function realBashMetadata(namespace = "grok_build", overrides = {}) {
  return {
    "x.ai/tool": {
      version: 1,
      namespace,
      name: "bash",
      kind: "execute",
      label: "Run Command",
      read_only: false,
      ...overrides,
    },
  };
}

function realBashInput() {
  return { command: "node --test test/focused.test.mjs" };
}

function announceRealBash(displayKind = null) {
  const value = {
    sessionUpdate: "tool_call",
    toolCallId: "real-bash",
    title: "Run Command",
    rawInput: realBashInput(),
    _meta: realBashMetadata(),
  };
  if (displayKind) value.kind = displayKind;
  update(value);
}

function enrichRealBash(displayKind = "execute") {
  update({
    sessionUpdate: "tool_call_update",
    toolCallId: "real-bash",
    kind: displayKind,
    title: "Run Command",
    rawInput: realBashInput(),
    _meta: realBashMetadata(),
  });
}

function requestRealBashPermission(displayKind = "execute") {
  send({
    jsonrpc: "2.0",
    id: 981,
    method: "session/request_permission",
    params: {
      sessionId,
      toolCall: {
        toolCallId: "real-bash",
        title: "Run Command",
        kind: displayKind,
        rawInput: realBashInput(),
        _meta: realBashMetadata(),
      },
      options: realOptions,
    },
  });
}

function completeRealBash(status = "completed") {
  update({ sessionUpdate: "tool_call_update", toolCallId: "real-bash", status });
}

function writePathsForScenario() {
  if (scenario === "apply_complex") {
    return ["src/base.txt", "src/delete.txt", "src/rename.txt", "src/renamed.txt", "src/data.bin", "src/mode.txt"];
  }
  if (scenario === "rename_binary_mode") {
    return ["src/base.txt", "src/renamed.txt", "src/data.bin", "src/mode.txt"];
  }
  if (scenario === "path_redaction") return [`src/${sentinel}.txt`];
  if (scenario === "out_of_scope") return ["outside.txt"];
  if (["round_two_prior", "round_two_silent"].includes(scenario)) return ["src/second.txt"];
  if (scenario === "path_carriers") return ["src/base.txt", "src/moved.txt"];
  return ["src/result.txt"];
}

function pathInput(paths) {
  return paths.length === 1 ? { path: paths[0] } : { paths };
}

function executionUpdate({ toolCallId = "tool-900", kind = "Edit", input = null, title = null, status = "completed" } = {}) {
  const value = { sessionUpdate: "tool_call_update", toolCallId, status };
  if (kind) value.kind = kind;
  if (title) value.title = title;
  if (input !== null) value.rawInput = input;
  update(value);
}

async function beginPermissionScenario() {
  permissionQueue = [
    { id: 901, kind: "Edit", input: { path: "src/result.txt", content: sentinel }, pathValue: "src/result.txt", expected: "allowed" },
    { id: 902, kind: "Bash", input: { argv: ["node", "--test", "test/focused.test.mjs"] }, expected: "allowed" },
    { id: 903, kind: "Write", input: { path: "outside.txt" }, pathValue: "outside.txt", expected: "rejected" },
    { id: 904, kind: "Edit", input: { path: "src/protected/file.txt" }, pathValue: "src/protected/file.txt", expected: "rejected" },
    { id: 905, kind: "Bash", input: { command: "node --test test/focused.test.mjs; rm -rf ." }, expected: "rejected" },
    {
      id: 906,
      kind: "Edit",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: [{ optionId: "persist", kind: "allow_always" }, { optionId: "reject-persist", kind: "reject_once" }],
      expected: "rejected",
    },
    { id: 907, kind: "MysteryTool", input: { payload: sentinel }, expected: "rejected" },
    { id: 908, kind: "Bash", input: { argv: ["node", "--test", "test/focused.test.mjs"] }, toolCallId: "tool-901", expected: "rejected" },
    { id: 909, kind: "Edit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", toolCallId: "", expected: "rejected" },
    {
      id: 910,
      kind: "Edit",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      metadata: { "x.ai/tool": { kind: "Bash" } },
      expected: "rejected",
    },
    { id: 911, kind: "Edit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", session: "wrong-session", expected: "rejected" },
    { id: 912, kind: "Edit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", expected: "allowed" },
    {
      id: 913,
      kind: "Bash",
      input: {
        argv: ["node", "--test", "test/focused.test.mjs"],
        command: "node --test test/other.test.mjs",
      },
      expected: "rejected",
    },
    { id: 914, kind: "Edit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", expected: "allowed" },
    { id: 914, kind: "Edit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", toolCallId: "tool-914-duplicate", expected: "rejected" },
    { id: 915, kind: "WebEdit", input: { path: "src/result.txt" }, pathValue: "src/result.txt", expected: "rejected" },
    { id: 916, kind: "MCPWrite", input: { path: "src/result.txt" }, pathValue: "src/result.txt", expected: "rejected" },
    {
      id: 917,
      kind: "Bash",
      input: { argv: ["node", "--test", "test/focused.test.mjs"] },
      secondaryInput: { command: "node --test test/other.test.mjs" },
      expected: "rejected",
    },
  ];
  sendNextPermission();
}

function sendNextPermission() {
  const item = permissionQueue[0];
  if (!item) return;
  requestPermission({ ...item, options: item.options ?? standardOptions });
}

async function handlePermissionResponse(message) {
  await log({ type: "permission_response", id: message.id, result: message.result, error: message.error });
  if (scenario === "permissions") {
    const current = permissionQueue.shift();
    if (current.id === 901 && message.result?.outcome?.optionId === "once") {
      await write("src/result.txt", "permission-approved\n");
      executionUpdate({ toolCallId: "tool-901", kind: "Edit", input: { path: "src/result.txt" } });
    }
    if (current.id === 912 && message.result?.outcome?.optionId === "once") {
      executionUpdate({ toolCallId: "tool-912", kind: "Edit", input: { path: "src/result.txt" } });
      executionUpdate({ toolCallId: "tool-912", kind: "Edit", input: { path: "src/result.txt" } });
    }
    if (permissionQueue.length > 0) sendNextPermission();
    else {
      update({ sessionUpdate: "tool_call_update", toolCallId: "unknown-exec", kind: "MysteryTool", status: "completed" });
      executionUpdate({ toolCallId: "tool-901", kind: "Bash", input: { argv: ["node", "--test", "test/focused.test.mjs"] } });
      update({ sessionUpdate: "tool_call_update", toolCallId: "unknown-status", kind: "Edit", status: "quantum_done" });
      await finishPrompt();
    }
    return;
  }
  if (["simultaneous_request_id", "simultaneous_tool_id", "unknown_method_reuse"].includes(scenario)) {
    reverseResponses += 1;
    if (reverseResponses === 2) await finishPrompt();
    return;
  }
  if (scenario === "unknown_kinds") {
    reverseResponses += 1;
    if (reverseResponses === 3) await finishPrompt();
    return;
  }
  if (scenario === "error_drain_reverse") return;
  if (message.id === 981 && scenario.startsWith("real_bash")) {
    if (message.result?.outcome?.optionId === "once") completeRealBash();
    await finishPrompt(report("Real Grok Bash fixture"));
    return;
  }
  if (message.id === 980 && scenario.startsWith("real_")) {
    const selected = message.result?.outcome?.optionId === "once";
    if (selected && !["real_missing_terminal"].includes(scenario)) {
      await write("src/result.txt", "delegated\n");
    }
    if (scenario === "real_write_delta" && selected) {
      completeRealWrite();
    } else if (scenario === "real_granted_failed" && selected) {
      completeRealWrite({ status: "failed" });
    } else if (scenario === "real_path_change" && selected) {
      completeRealWrite({ relative: "src/other.txt", includePath: true });
    } else if (scenario === "real_terminal_reuse" && selected) {
      completeRealWrite();
      completeRealWrite();
    } else if (scenario === "real_rejected_failed" && !selected) {
      completeRealWrite({ relative: "src/protected/file.txt", status: "failed" });
    } else if (scenario === "real_permission_precompleted" && !selected) {
      await write("src/result.txt", "must-not-be-provenanced\n");
      completeRealWrite();
    }
    await finishPrompt(report("Real Grok delta fixture"));
    return;
  }
  if (message.id === 900) {
    const selected = message.result?.outcome?.optionId === "once";
    if ([
      "strong_unknown_title", "unknown_argv_carrier", "ambiguous_path_carrier", "unknown_path_carrier",
      "execution_before_permission", "bash_cmd_outside", "argv_metachar", "auth_malformed_dynamic",
    ].includes(scenario)) {
      await finishPrompt(scenario === "auth_malformed_dynamic" ? report(malformedAuthSecret) : report());
      return;
    }
    if (selected) {
      if (scenario === "out_of_scope") await write("outside.txt", "outside\n");
      else if (scenario === "path_redaction") await write(`src/${sentinel}.txt`, "redacted-path\n");
      else if (["path_carriers", "uri_destination_mismatch"].includes(scenario)) {
        await rename(path.join(workspace, "src", "base.txt"), path.join(workspace, "src", "moved.txt"));
      }
      else if (["round_two_prior", "round_two_silent"].includes(scenario)) {
        await write("src/second.txt", "round-two\n");
        if (scenario === "round_two_silent") await write("src/never-permitted.txt", "silent\n");
      }
      else if (["permission_without_execution", "bash_write", "execution_path_mismatch", "title_fallback"].includes(scenario)) {
        await write("src/result.txt", `${scenario}\n`);
      }
      else if (["bash_cmd", "bash_cmd_mismatch"].includes(scenario)) {
        // A shell execution does not itself create a candidate write in these protocol fixtures.
      }
      else if (scenario === "apply_complex") {
        await write("src/base.txt", "tracked-modified\n");
        await unlink(path.join(workspace, "src", "delete.txt"));
        await rename(path.join(workspace, "src", "rename.txt"), path.join(workspace, "src", "renamed.txt"));
        await writeFile(path.join(workspace, "src", "data.bin"), Buffer.from([0, 1, 2, 3, 0, 255]));
        await chmod(path.join(workspace, "src", "mode.txt"), 0o755);
      }
      else if (scenario === "rename_binary_mode") {
        await rename(path.join(workspace, "src", "base.txt"), path.join(workspace, "src", "renamed.txt"));
        await writeFile(path.join(workspace, "src", "data.bin"), Buffer.from([0, 1, 2, 3, 0, 255]));
        await chmod(path.join(workspace, "src", "mode.txt"), 0o755);
      }
      else await write("src/result.txt", loaded ? "fixed\n" : "delegated\n");
    }
    if (scenario === "permission_without_execution") {
      await finishPrompt();
      return;
    }
    if (scenario === "bash_cmd" || scenario === "bash_write") {
      executionUpdate({ kind: "Bash", input: { cmd: "node --test test/focused.test.mjs" } });
    } else if (scenario === "bash_cmd_mismatch") {
      executionUpdate({ kind: "Bash", input: { cmd: "node --test test/other.test.mjs" } });
    } else if (scenario === "execution_path_mismatch") {
      executionUpdate({ input: { path: "src/other.txt" } });
    } else if (scenario === "title_fallback") {
      executionUpdate({ kind: null, title: "Edit src/result.txt", input: { fileUri: pathToFileURL(path.join(workspace, "src", "result.txt")).href } });
    } else if (scenario === "path_carriers") {
      const carrierInput = {
        fileUri: pathToFileURL(path.join(workspace, "src", "base.txt")).href,
        source: "src/base.txt",
        destination: "src/moved.txt",
        oldPath: "src/base.txt",
        newPath: "src/moved.txt",
        from: "src/base.txt",
        to: "src/moved.txt",
      };
      executionUpdate({ input: carrierInput });
    } else if (scenario === "uri_destination_mismatch") {
      executionUpdate({
        input: {
          fileUri: pathToFileURL(path.join(workspace, "src", "base.txt")).href,
          destination: path.join(path.dirname(workspace), "outside.txt"),
        },
      });
    } else {
      const paths = writePathsForScenario();
      executionUpdate({ kind: scenario === "out_of_scope" ? "Write" : "Edit", input: pathInput(paths) });
    }
    if (scenario === "auth_echo") {
      await finishAuthEcho();
      return;
    }
    await finishPrompt(scenario === "path_redaction"
      ? report(`path ${sentinel}`, `src/${sentinel}.txt`)
      : scenario === "raw_path_echo"
        ? report(`workspace ${workspace} ${pathToFileURL(path.join(workspace, "src", "result.txt")).href}`, workspace)
        : report());
  }
}

async function handlePrompt(message) {
  promptRequest = message;
  await log({
    type: "prompt",
    sessionId: message.params?.sessionId,
    prompt: message.params?.prompt?.[0]?.text,
    args: process.argv.slice(2),
    env: Object.keys(process.env).sort(),
    home: process.env.HOME ?? null,
    grokHome: process.env.GROK_HOME ?? null,
    grokAuthPath: process.env.GROK_AUTH_PATH ?? null,
    hasXaiApiKey: Boolean(process.env.XAI_API_KEY),
    grokControls: Object.fromEntries(Object.entries(process.env)
      .filter(([key]) => key === "GROK_SUBAGENTS"
        || key === "GROK_REMEMBER_TOOL_APPROVALS"
        || key === "GROK_DEFAULT_SELECTED_PERMISSION"
        || /^GROK_(?:CLAUDE|CURSOR|CODEX)_(?:SKILLS|RULES|AGENTS|MCPS|HOOKS|SESSIONS)_ENABLED$/.test(key))),
  });
  if ([
    "real_write_delta",
    "real_granted_failed",
    "real_path_change",
    "real_terminal_reuse",
    "real_missing_terminal",
  ].includes(scenario)) {
    announceRealWrite();
    enrichRealWrite();
    requestRealWritePermission();
    return;
  }
  if (scenario === "real_rejected_failed") {
    announceRealWrite("real-write", "src/protected/file.txt");
    enrichRealWrite({ relative: "src/protected/file.txt" });
    requestRealWritePermission({ relative: "src/protected/file.txt" });
    return;
  }
  if (scenario === "real_permission_race") {
    const metadata = realWriteMetadata();
    delete metadata["x.ai/tool"].input;
    send({
      jsonrpc: "2.0",
      id: 980,
      method: "session/request_permission",
      params: {
        sessionId,
        toolCall: {
          toolCallId: "real-write",
          title: "write",
          kind: "edit",
          rawInput: {
            paths: Array.from({ length: 256 }, (_, index) => `src/race-${index}.txt`),
            content: "delegated\n",
          },
          _meta: metadata,
        },
        options: realOptions,
      },
    });
    setTimeout(() => {
      update({
        sessionUpdate: "tool_call_update",
        toolCallId: "real-write",
        kind: "edit",
      });
    }, 5);
    return;
  }
  if (scenario === "real_permission_precompleted") {
    announceRealWrite();
    enrichRealWrite();
    requestRealWritePermission({ status: "completed" });
    return;
  }
  if (scenario === "real_permission_id_conflict") {
    announceRealWrite();
    requestRealWritePermission({ paramsToolCallId: "different-real-write" });
    return;
  }
  if (scenario === "real_update_id_conflict") {
    update({
      sessionUpdate: "tool_call",
      toolCallId: "real-write",
      id: "different-real-write",
      rawInput: realWriteInput(),
      _meta: realWriteMetadata(),
    });
    await finishPrompt();
    return;
  }
  if (scenario === "real_unknown_statusless_delta") {
    update({
      sessionUpdate: "tool_call_update",
      toolCallId: "statusless-real-write",
      kind: "edit",
      rawInput: realWriteInput(),
      _meta: realWriteMetadata(),
    });
    requestRealWritePermission({ toolCallId: "statusless-real-write" });
    return;
  }
  if (scenario === "real_incompatible_identity") {
    announceRealWrite();
    enrichRealWrite({ displayKind: "execute" });
    requestRealWritePermission({ displayKind: "execute" });
    return;
  }
  if (scenario === "real_uppercase_display") {
    announceRealWrite();
    enrichRealWrite({ displayKind: "Edit" });
    await finishPrompt();
    return;
  }
  if ([
    "real_post_native_write_display",
    "real_post_native_upper_display",
    "real_post_native_name_change",
  ].includes(scenario)) {
    announceRealWrite();
    const value = { sessionUpdate: "tool_call_update", toolCallId: "real-write" };
    if (scenario === "real_post_native_write_display") value.kind = "write";
    if (scenario === "real_post_native_upper_display") value.kind = "Edit";
    if (scenario === "real_post_native_name_change") value.name = "Bash";
    update(value);
    await finishPrompt();
    return;
  }
  if (scenario === "real_post_native_bash_display") {
    announceRealBash();
    update({ sessionUpdate: "tool_call_update", toolCallId: "real-bash", kind: "bash" });
    await finishPrompt();
    return;
  }
  if (scenario === "real_xai_destination_conflict") {
    announceRealWrite();
    enrichRealWrite({
      metadata: realWriteMetadata("src/result.txt", {
        input: { path: "src/result.txt", destination: "src/other.txt" },
      }),
    });
    await finishPrompt();
    return;
  }
  if (scenario === "real_bash_xai_cmd_mismatch") {
    announceRealBash();
    update({
      sessionUpdate: "tool_call_update",
      toolCallId: "real-bash",
      kind: "execute",
      rawInput: realBashInput(),
      _meta: realBashMetadata("grok_build", { input: { cmd: "node --test test/other.test.mjs" } }),
    });
    await finishPrompt();
    return;
  }
  if (["real_bash_delta", "real_bash_incompatible"].includes(scenario)) {
    const displayKind = scenario === "real_bash_delta" ? "execute" : "edit";
    announceRealBash();
    enrichRealBash(displayKind);
    requestRealBashPermission(displayKind);
    return;
  }
  if (scenario === "real_native_identity_change") {
    announceRealWrite("real-write", "src/result.txt", realWriteMetadata("src/result.txt", {
      kind: "edit",
      name: "edit",
      label: "Edit",
    }));
    enrichRealWrite({
      metadata: realWriteMetadata("src/result.txt", {
        namespace: "grok_build",
        kind: "edit",
        name: "search_replace",
        label: "Edit",
      }),
    });
    await finishPrompt();
    return;
  }
  if (scenario === "real_invalid_xai_envelope") {
    announceRealWrite("real-write", "src/result.txt", realWriteMetadata("src/result.txt", {
      namespace: "near_opencode",
    }));
    await finishPrompt();
    return;
  }
  if (scenario === "real_xai_path_conflict") {
    announceRealWrite();
    enrichRealWrite({
      metadata: realWriteMetadata("src/result.txt", { input: { path: "src/other.txt" } }),
    });
    await finishPrompt();
    return;
  }
  if (scenario === "real_pregrant_terminal") {
    announceRealWrite();
    enrichRealWrite();
    completeRealWrite();
    requestRealWritePermission();
    return;
  }
  if (scenario === "real_unknown_terminal") {
    update({
      sessionUpdate: "tool_call_update",
      toolCallId: "unknown-real-write",
      kind: "edit",
      status: "completed",
      rawInput: realWriteInput(),
      _meta: realWriteMetadata(),
    });
    await finishPrompt();
    return;
  }
  if (scenario === "real_sparse_terminal") {
    completeRealWrite({ toolCallId: "sparse-real-write" });
    await finishPrompt();
    return;
  }
  if (scenario === "real_auto_write") {
    announceRealWrite();
    enrichRealWrite();
    await write("src/result.txt", "delegated\n");
    completeRealWrite();
    await finishPrompt();
    return;
  }
  if (scenario === "real_failed_without_permission") {
    announceRealWrite();
    enrichRealWrite();
    await write("src/result.txt", "delegated\n");
    completeRealWrite({ status: "failed" });
    await finishPrompt();
    return;
  }
  if (scenario === "auth_malformed_dynamic") {
    await writeFile(process.env.GROK_AUTH_PATH, `{malformed:${malformedAuthSecret}\n`, { mode: 0o600 });
    update({ sessionUpdate: "plan", entries: [{ content: malformedAuthSecret, status: "pending" }] });
    requestPermission({
      id: 900,
      kind: "Edit",
      input: { path: `src/${malformedAuthSecret}.txt` },
      pathValue: `src/${malformedAuthSecret}.txt`,
      options: standardOptions,
    });
    return;
  }
  if (scenario === "auth_mutation") {
    const refreshed = "MUTATED_AUTH_SENTINEL_f0c729ab";
    await writeFile(process.env.GROK_AUTH_PATH, `${JSON.stringify({ access_token: refreshed })}\n`, { mode: 0o600 });
    update({ sessionUpdate: "plan", entries: [{ content: refreshed, status: "pending" }] });
    await finishPrompt(report(refreshed));
    return;
  }
  if (scenario === "auth_timeout_path") {
    const parsed = JSON.parse(await readFile(process.env.GROK_AUTH_PATH, "utf8"));
    await write(`src/${parsed.access_token}.txt`, "partial\n");
    await write(`src/${sessionId}.txt`, "partial\n");
    return;
  }
  if (scenario === "timeout") {
    await write("src/partial.txt", "partial\n");
    return;
  }
  if (scenario === "timeout_same_path") {
    await write("src/result.txt", "timeout-overwrite\n");
    return;
  }
  if (scenario === "claim_only" || scenario === "empty") {
    await finishPrompt(report("I claim every test passes"));
    return;
  }
  if (scenario === "round_two_same_silent") {
    await write("src/result.txt", "silent-overwrite\n");
    await finishPrompt();
    return;
  }
  if (scenario === "round_two_no_change") {
    await finishPrompt();
    return;
  }
  if (scenario === "unapproved_write") {
    await write("src/result.txt", "unapproved\n");
    update({ sessionUpdate: "tool_call_update", toolCallId: "rogue", kind: "Edit", status: "completed", rawInput: sentinel });
    await finishPrompt();
    return;
  }
  if (scenario === "permissions") {
    await beginPermissionScenario();
    return;
  }
  if (scenario === "unknown_kinds") {
    for (const [index, kind] of ["Credit", "Rewrite", "Shellfish"].entries()) {
      requestPermission({
        id: 960 + index,
        kind,
        input: { path: "src/result.txt" },
        pathValue: "src/result.txt",
        options: standardOptions,
      });
    }
    return;
  }
  if (scenario === "simultaneous_request_id") {
    requestPermission({
      id: 970,
      kind: "Edit",
      toolCallId: "simultaneous-request-first",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    requestPermission({
      id: 970,
      kind: "Edit",
      toolCallId: "simultaneous-request-second",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    return;
  }
  if (scenario === "simultaneous_tool_id") {
    requestPermission({
      id: 971,
      kind: "Edit",
      toolCallId: "simultaneous-tool",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    requestPermission({
      id: 972,
      kind: "Edit",
      toolCallId: "simultaneous-tool",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    return;
  }
  if (scenario === "unknown_method_reuse") {
    requestUnknownMethod(973);
    requestPermission({
      id: 973,
      kind: "Edit",
      toolCallId: "after-unknown-method",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    return;
  }
  if (scenario === "execution_before_permission") {
    executionUpdate({
      toolCallId: "tool-900",
      kind: "Edit",
      input: { path: "src/result.txt" },
    });
    requestPermission({
      id: 900,
      kind: "Edit",
      toolCallId: "tool-900",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    return;
  }
  if (scenario === "silent_write") {
    await write("src/result.txt", "silent\n");
    await finishPrompt();
    return;
  }
  if (scenario === "drain_reverse") {
    requestPermission({
      id: 950,
      kind: "Edit",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    await finishPrompt();
    return;
  }
  if (scenario === "error_drain_reverse") {
    requestUnknownMethod(952);
    await finishPrompt();
    return;
  }
  if (scenario === "late_permission") {
    await finishPrompt();
    requestPermission({
      id: 951,
      kind: "Edit",
      input: { path: "src/result.txt" },
      pathValue: "src/result.txt",
      options: standardOptions,
    });
    return;
  }
  if (scenario === "artifact_symlink") {
    const artifactDir = path.join(path.dirname(workspace), "artifacts", "round-1", "verifiers");
    await mkdir(artifactDir, { recursive: true });
    const artifactName = `${createHash("sha256").update("verify-focused").digest("hex").slice(0, 16)}.stdout`;
    await symlink(process.env.MOCK_TARGET_PATH, path.join(artifactDir, artifactName));
  }
  if (scenario === "redact_key") {
    const key = process.env.XAI_API_KEY ?? "";
    update({ sessionUpdate: "plan", entries: [{ content: key, status: key }] });
    update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: key } });
  }
  if (scenario === "privacy") {
    process.stderr.write(`${sentinel}\n`);
    update({ sessionUpdate: "agent_thought_chunk", content: { text: sentinel } });
    send({ jsonrpc: "2.0", method: "_x.ai/mcp/servers_updated", params: { env: sentinel, servers: [sentinel] } });
  }
  if (scenario === "raw_path_echo") {
    update({
      sessionUpdate: "agent_message_chunk",
      content: {
        type: "text",
        text: `workspace=${workspace} uri=${pathToFileURL(path.join(workspace, "src", "result.txt")).href} home=${process.env.HOME ?? ""}`,
      },
    });
  }
  if (["auth_echo", "auth_boundary_echo"].includes(scenario)) {
    const parsed = JSON.parse(await readFile(process.env.GROK_AUTH_PATH, "utf8"));
    authEchoSecrets = [parsed.access_token, parsed.nested?.refresh_token, parsed.values?.[0]];
    if (scenario === "auth_boundary_echo") {
      update({
        sessionUpdate: "plan",
        entries: [{ content: `${"P".repeat(2_040)}${authEchoSecrets[1]}`, status: "pending" }],
      });
      update({
        sessionUpdate: "agent_message_chunk",
        content: {
          type: "text",
          text: `${"M".repeat(65_528)}${authEchoSecrets[0].slice(0, 8)}`,
        },
      });
      update({
        sessionUpdate: "agent_message_chunk",
        content: { type: "text", text: authEchoSecrets[0].slice(8) },
      });
    }
  }
  const relative = scenario === "out_of_scope"
    ? "outside.txt"
    : scenario === "path_redaction"
      ? `src/${sentinel}.txt`
      : ["round_two_prior", "round_two_silent"].includes(scenario)
        ? "src/second.txt"
      : "src/result.txt";
  const requestedPaths = scenario === "apply_complex"
    ? ["src/base.txt", "src/delete.txt", "src/rename.txt", "src/renamed.txt", "src/data.bin", "src/mode.txt"]
    : null;
  let kind = scenario === "out_of_scope" ? "Write" : "Edit";
  let input = scenario === "rename_binary_mode"
    ? { paths: ["src/base.txt", "src/renamed.txt", "src/data.bin", "src/mode.txt"], content: sentinel }
    : requestedPaths
      ? { paths: requestedPaths, content: sentinel }
      : { path: relative, content: sentinel };
  let pathValue = relative;
  if (requestedPaths || scenario === "rename_binary_mode") pathValue = null;
  if (["bash_cmd", "bash_cmd_mismatch", "bash_cmd_outside", "bash_write", "argv_metachar"].includes(scenario)) {
    kind = "Bash";
    input = scenario === "argv_metachar"
      ? { argv: ["node", "--test", ";", "touch", "src/pwned.txt"] }
      : scenario === "bash_write"
      ? { argv: ["node", "--test", "test/focused.test.mjs"] }
      : { cmd: scenario === "bash_cmd_outside"
        ? "node --test test/other.test.mjs"
        : "node --test test/focused.test.mjs" };
    pathValue = null;
  } else if (["path_carriers", "uri_destination_mismatch"].includes(scenario)) {
    input = {
      fileUri: pathToFileURL(path.join(workspace, "src", "base.txt")).href,
      destination: "src/moved.txt",
    };
    pathValue = null;
  } else if (scenario === "uri_outside") {
    input = {
      fileUri: pathToFileURL(path.join(path.dirname(workspace), "outside.txt")).href,
      destination: "src/result.txt",
    };
    pathValue = null;
  }
  requestPermission({
    id: 900,
    kind,
    input,
    options: standardOptions,
    pathValue,
  });
}

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on("line", async (line) => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  await log({ type: "client", method: message.method ?? null, id: message.id ?? null });
  if (Object.hasOwn(message, "id") && !message.method) {
    await handlePermissionResponse(message);
    return;
  }
  if (message.method === "initialize") {
    if (scenario === "malformed") {
      process.stdout.write(`not-json-${sentinel}\n`);
      return;
    }
    if (scenario === "early_eof") {
      process.exit(0);
      return;
    }
    response(message.id, {
      protocolVersion: 1,
      authMethods: ["xai.api_key", "cached_token"],
      agentCapabilities: { loadSession: true },
      _meta: { private: sentinel },
    });
    return;
  }
  if (message.method === "authenticate") {
    if (scenario === "auth_failure") rpcError(message.id);
    else response(message.id, {});
    return;
  }
  if (message.method === "session/new") {
    response(message.id, { sessionId });
    return;
  }
  if (message.method === "session/load") {
    loaded = true;
    scenario = CONTINUATION_SCENARIOS.get(configuredScenario) ?? configuredScenario;
    await log({ type: "load", sessionId: message.params?.sessionId });
    if (scenario === "load_execution") {
      update({ sessionUpdate: "tool_call_update", toolCallId: "load-rogue", kind: "Edit", status: "completed" });
    }
    if (scenario === "replay") {
      update({ sessionUpdate: "agent_message_chunk", content: { type: "text", text: `OLD_REPLAY_${sentinel}` } });
    }
    response(message.id, {});
    return;
  }
  if (message.method === "session/prompt") {
    await handlePrompt(message);
    return;
  }
  if (message.method === "session/cancel") {
    await log({ type: "cancel", sessionId: message.params?.sessionId });
    process.exit(0);
  }
});

lines.on("close", () => { process.exitCode = 0; });
