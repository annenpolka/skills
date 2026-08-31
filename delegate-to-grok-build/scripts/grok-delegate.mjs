#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import {
  access,
  chmod,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  readlink,
  realpath,
  rename,
  rm,
  stat,
  symlink,
  unlink,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import { fileURLToPath, pathToFileURL } from "node:url";

const NAME = "delegate-to-grok-build";
const VERSION = "1.0.0";
const PROTOCOL_VERSION = 1;
const MANIFEST_VERSION = 1;
const MAX_INPUT_BYTES = 2 * 1024 * 1024;
const MAX_AUTH_BYTES = 1024 * 1024;
const MAX_PUBLIC_TEXT = 64 * 1024;
const DEFAULT_CANCEL_GRACE_MS = 2_000;
const TERMINATION_POLL_MS = 750;
const INBOUND_QUIET_MS = 100;
const TX_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SECRET_ENV_PATTERN = /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)/i;
const STATES = new Set([
  "preparing",
  "running",
  "collecting",
  "verifying",
  "candidate_ready",
  "applied",
  "discarded",
]);
const EXECUTION_STATUSES = new Set([
  "running",
  "in_progress",
  "completed",
  "succeeded",
  "failed",
]);
const KNOWN_TOOL_STATUSES = new Set([
  "pending",
  "queued",
  "running",
  "in_progress",
  "completed",
  "succeeded",
  "failed",
  "cancelled",
  "canceled",
]);
const TERMINAL_TOOL_STATUSES = new Set([
  "completed",
  "succeeded",
  "failed",
  "cancelled",
  "canceled",
]);
const FORBIDDEN_AUTHORIZATION = [
  "network",
  "installDependencies",
  "commit",
  "push",
  "externalSideEffects",
];
const CORE_ENV_NAMES = [
  "PATH",
  "TMPDIR",
  "TMP",
  "TEMP",
  "LANG",
  "LC_ALL",
  "LC_CTYPE",
  "TZ",
  "SYSTEMROOT",
  "WINDIR",
  "COMSPEC",
  "PATHEXT",
];
const GROK_DISABLE_ENV = {
  GROK_SUBAGENTS: "false",
  GROK_MANAGED_MCPS_ENABLED: "false",
  GROK_MANAGED_MCP_GATEWAY_TOOLS_ENABLED: "false",
  GROK_REMEMBER_TOOL_APPROVALS: "false",
  GROK_DEFAULT_SELECTED_PERMISSION: "allow_once",
};
for (const family of ["CLAUDE", "CURSOR", "CODEX"]) {
  for (const feature of ["SKILLS", "RULES", "AGENTS", "MCPS", "HOOKS", "SESSIONS"]) {
    GROK_DISABLE_ENV[`GROK_${family}_${feature}_ENABLED`] = "false";
  }
}
const WRAPPER_OWNED_ENV_NAMES = new Set([
  "HOME",
  "GROK_HOME",
  "GROK_AUTH_PATH",
  "GROK_CONFIG",
  "GROK_CONFIG_PATH",
  "XDG_CONFIG_HOME",
  "XDG_CACHE_HOME",
  "XDG_DATA_HOME",
  "XDG_STATE_HOME",
  ...Object.keys(GROK_DISABLE_ENV),
]);
const CONTROL_ENV_NAMES = new Set([
  "NODE_OPTIONS",
  "BUN_OPTIONS",
  "PYTHONPATH",
  "PYTHONHOME",
  "PYTHONSTARTUP",
  "RUBYOPT",
  "PERL5OPT",
  "BASH_ENV",
  "ENV",
  "ZDOTDIR",
  "SHELLOPTS",
  "PROMPT_COMMAND",
  "SSL_CERT_FILE",
  "SSL_CERT_DIR",
  "REQUESTS_CA_BUNDLE",
  "CURL_CA_BUNDLE",
  "NODE_EXTRA_CA_CERTS",
]);
const CONTROL_ENV_PREFIXES = [
  "GROK_",
  "XAI_",
  "CLAUDE_",
  "CURSOR_",
  "CODEX_",
  "ANTHROPIC_",
  "OPENAI_",
  "DYLD_",
  "LD_",
  "GIT_",
  "DENO_",
];
const RESIDUE = [
  {
    id: "semantic-quality",
    status: "pending_human_review",
    judgment: "Semantic code quality and product correctness remain human judgments.",
  },
  {
    id: "macos-network-boundary",
    status: "pending_trust_decision",
    judgment: "macOS child-network restriction is not a hard security boundary.",
  },
  {
    id: "sandbox-availability",
    status: "pending_trust_decision",
    judgment: "The current machine's requested strict sandbox may fail closed.",
  },
  {
    id: "hardened-verifier-residue",
    status: "pending_trust_decision",
    judgment: "Hardened verifier sandboxing permits global reads and does not prove inherited-FD closure, resource limits, race freedom, or restoration after a malicious temporary write.",
  },
  {
    id: "grok-permission-variance",
    status: "pending_human_review",
    judgment: "Grok permission behavior may vary with CLI version; repository-native and system/MDM configuration layers may remain despite the private runtime home.",
  },
  {
    id: "trusted-local-auth-mutation",
    status: "pending_trust_decision",
    judgment: "Trusted-local cached auth is referenced without copying; a Grok refresh or same-UID process may mutate it before the wrapper detects the changed fingerprint, and the wrapper neither prevents nor rolls back that host mutation.",
  },
  {
    id: "path-provenance-byte-binding",
    status: "pending_human_review",
    judgment: "Observed Edit/Write provenance binds paths and round deltas, not the exact final bytes; human diff review remains required.",
  },
  {
    id: "same-uid-state-tampering",
    status: "pending_trust_decision",
    judgment: "Transaction/session bindings do not resist a malicious same-UID process that can rewrite state and code together.",
  },
  {
    id: "same-uid-apply-race",
    status: "pending_trust_decision",
    judgment: "Apply has repeated identity checks but no cross-process lock against same-UID concurrent mutation.",
  },
  {
    id: "encoded-secret-exfiltration",
    status: "pending_trust_decision",
    judgment: "Exact inherited-value redaction does not prevent transformed or encoded secret exfiltration.",
  },
];

class DelegateError extends Error {
  constructor(kind, message, exitCode = 1, details = null) {
    super(message);
    this.name = "DelegateError";
    this.kind = kind;
    this.exitCode = exitCode;
    this.details = details;
  }
}

function usage() {
  return [
    "Usage:",
    "  grok-delegate.mjs start [--state-dir DIR] [--grok-bin PATH] [--stream] < task.json",
    "  grok-delegate.mjs continue --transaction TX_ID [--state-dir DIR] [--grok-bin PATH] [--stream] < feedback.json",
    "  grok-delegate.mjs inspect --transaction TX_ID [--state-dir DIR]",
    "  grok-delegate.mjs apply --transaction TX_ID [--state-dir DIR]",
    "  grok-delegate.mjs discard --transaction TX_ID [--state-dir DIR]",
    "",
    "Task and feedback are accepted only on stdin, never as argv.",
  ].join("\n");
}

function defaultStateDir() {
  const base = process.env.XDG_STATE_HOME
    ? path.resolve(process.env.XDG_STATE_HOME)
    : path.join(os.homedir(), ".local", "state");
  return path.join(base, NAME);
}

function parseArgs(argv) {
  let command = null;
  const options = {
    stateDir: defaultStateDir(),
    grokBin: "grok",
    transaction: null,
    stream: false,
    help: false,
  };
  const commands = new Set(["start", "continue", "inspect", "apply", "discard"]);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (commands.has(argument) && command === null) {
      command = argument;
    } else if (argument === "--state-dir" || argument === "--grok-bin" || argument === "--transaction") {
      const value = argv[++index];
      if (typeof value !== "string" || value.length === 0) {
        throw new DelegateError("usage", `${argument} requires a value`, 2);
      }
      if (argument === "--state-dir") options.stateDir = path.resolve(value);
      if (argument === "--grok-bin") options.grokBin = value;
      if (argument === "--transaction") options.transaction = value;
    } else if (argument === "--stream") {
      options.stream = true;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new DelegateError("usage", `Unknown command or option: ${argument}`, 2);
    }
  }
  if (options.help) return { command, ...options };
  if (!command) throw new DelegateError("usage", "A command is required", 2);
  if (command === "start" && options.transaction !== null) {
    throw new DelegateError("usage", "start does not accept --transaction", 2);
  }
  if (command !== "start" && !options.transaction) {
    throw new DelegateError("usage", `${command} requires --transaction`, 2);
  }
  if (options.transaction && (!TX_PATTERN.test(options.transaction) || options.transaction === "." || options.transaction === "..")) {
    throw new DelegateError("usage", "Unsafe transaction ID", 2);
  }
  if (!["start", "continue"].includes(command) && options.stream) {
    throw new DelegateError("usage", `${command} does not accept --stream`, 2);
  }
  if (!["start", "continue"].includes(command) && options.grokBin !== "grok") {
    throw new DelegateError("usage", `${command} does not accept --grok-bin`, 2);
  }
  if (options.grokBin.includes("\0")) {
    throw new DelegateError("usage", "--grok-bin contains NUL", 2);
  }
  return { command, ...options };
}

class OutputWriter {
  constructor(stream) {
    this.stream = stream;
    this.seq = 0;
    this.finished = false;
  }

  event(event) {
    if (!this.stream || this.finished) return;
    this.seq += 1;
    process.stdout.write(`${JSON.stringify({ ...event, seq: this.seq })}\n`);
  }

  result(result) {
    if (this.finished) return;
    this.finished = true;
    if (this.stream) {
      this.seq += 1;
      process.stdout.write(`${JSON.stringify({ ...result, seq: this.seq })}\n`);
    } else {
      process.stdout.write(`${JSON.stringify(result)}\n`);
    }
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, required, optional, label) {
  if (!isPlainObject(value)) throw new DelegateError("validation", `${label} must be an object`, 2);
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new DelegateError("validation", `${label} contains unknown field ${key}`, 2);
  }
  for (const key of required) {
    if (!Object.hasOwn(value, key)) throw new DelegateError("validation", `${label}.${key} is required`, 2);
  }
}

function nonEmptyString(value, label, maximum = 65_536) {
  if (typeof value !== "string" || value.length === 0 || value.length > maximum || value.includes("\0")) {
    throw new DelegateError("validation", `${label} must be a non-empty bounded string without NUL`, 2);
  }
  return value;
}

function nullableString(value, label, maximum = 512) {
  if (value === null) return null;
  return nonEmptyString(value, label, maximum);
}

function positiveInteger(value, label, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > maximum) {
    throw new DelegateError("validation", `${label} must be a positive integer no greater than ${maximum}`, 2);
  }
  return value;
}

function enumValue(value, choices, label) {
  if (!choices.includes(value)) {
    throw new DelegateError("validation", `${label} must be one of ${choices.join(", ")}`, 2);
  }
  return value;
}

function validateRepoRelative(value, label, { allowDot = false } = {}) {
  nonEmptyString(value, label, 4_096);
  if (value.includes("\\") || path.posix.isAbsolute(value) || path.win32.isAbsolute(value)) {
    throw new DelegateError("validation", `${label} must be a POSIX repository-relative path`, 2);
  }
  if (value === ".") {
    if (allowDot) return value;
    throw new DelegateError("validation", `${label} cannot be the repository root`, 2);
  }
  const pieces = value.split("/");
  if (pieces.some((piece) => piece.length === 0 || piece === "." || piece === "..")) {
    throw new DelegateError("validation", `${label} must be canonical and cannot contain dot segments`, 2);
  }
  if (path.posix.normalize(value) !== value) {
    throw new DelegateError("validation", `${label} must be canonical`, 2);
  }
  return value;
}

function validateStringArray(value, label) {
  if (!Array.isArray(value)) throw new DelegateError("validation", `${label} must be an array`, 2);
  return value.map((item, index) => nonEmptyString(item, `${label}[${index}]`));
}

function validateArgv(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new DelegateError("validation", `${label} must be a non-empty argv array`, 2);
  }
  return value.map((item, index) => nonEmptyString(item, `${label}[${index}]`, 16_384));
}

function registerId(ids, id, label) {
  nonEmptyString(id, label, 256);
  if (ids.has(id)) throw new DelegateError("validation", `Duplicate ID: ${id}`, 2);
  ids.add(id);
}

function validateTask(input) {
  exactKeys(input, ["schemaVersion", "task", "repository", "authorization", "agent", "verification", "limits"], [], "root");
  if (input.schemaVersion !== 1) throw new DelegateError("validation", "schemaVersion must be 1", 2);
  const allIds = new Set();

  exactKeys(input.task, [
    "id", "objective", "taskClass", "granularity", "acceptanceCriteria", "constraints",
    "expectedChange", "writeScope", "protectedPaths", "antiCheat", "residue",
  ], [], "task");
  nonEmptyString(input.task.id, "task.id", 256);
  nonEmptyString(input.task.objective, "task.objective");
  enumValue(input.task.taskClass, ["feature", "bug_fix", "refactor", "cleanup"], "task.taskClass");
  enumValue(input.task.granularity, ["light", "standard", "deep"], "task.granularity");
  enumValue(input.task.expectedChange, ["required", "optional"], "task.expectedChange");
  if (!Array.isArray(input.task.acceptanceCriteria)) {
    throw new DelegateError("validation", "task.acceptanceCriteria must be an array", 2);
  }
  for (const [index, criterion] of input.task.acceptanceCriteria.entries()) {
    exactKeys(criterion, ["id", "text", "verifyWith"], [], `task.acceptanceCriteria[${index}]`);
    registerId(allIds, criterion.id, `task.acceptanceCriteria[${index}].id`);
    nonEmptyString(criterion.text, `task.acceptanceCriteria[${index}].text`);
    validateStringArray(criterion.verifyWith, `task.acceptanceCriteria[${index}].verifyWith`);
  }
  validateStringArray(input.task.constraints, "task.constraints");
  validateStringArray(input.task.antiCheat, "task.antiCheat");
  if (!Array.isArray(input.task.writeScope) || input.task.writeScope.length === 0) {
    throw new DelegateError("validation", "task.writeScope must be a non-empty array", 2);
  }
  for (const [index, scope] of input.task.writeScope.entries()) {
    exactKeys(scope, ["kind", "path"], [], `task.writeScope[${index}]`);
    enumValue(scope.kind, ["exact", "prefix"], `task.writeScope[${index}].kind`);
    validateRepoRelative(scope.path, `task.writeScope[${index}].path`, { allowDot: scope.kind === "prefix" });
  }
  if (!Array.isArray(input.task.protectedPaths)) {
    throw new DelegateError("validation", "task.protectedPaths must be an array", 2);
  }
  input.task.protectedPaths.forEach((item, index) => validateRepoRelative(item, `task.protectedPaths[${index}]`, { allowDot: true }));
  if (!Array.isArray(input.task.residue)) throw new DelegateError("validation", "task.residue must be an array", 2);
  for (const [index, residue] of input.task.residue.entries()) {
    exactKeys(residue, ["id", "judgment", "owner"], [], `task.residue[${index}]`);
    registerId(allIds, residue.id, `task.residue[${index}].id`);
    nonEmptyString(residue.judgment, `task.residue[${index}].judgment`);
    if (residue.owner !== "human") throw new DelegateError("validation", `task.residue[${index}].owner must be human`, 2);
  }

  exactKeys(input.repository, ["path", "base", "dirtyPolicy"], [], "repository");
  nonEmptyString(input.repository.path, "repository.path", 4_096);
  if (!path.isAbsolute(input.repository.path)) throw new DelegateError("validation", "repository.path must be absolute", 2);
  nonEmptyString(input.repository.base, "repository.base", 1_024);
  if (input.repository.base.startsWith("-") || /[\r\n]/.test(input.repository.base)) {
    throw new DelegateError("validation", "repository.base is unsafe", 2);
  }
  enumValue(input.repository.dirtyPolicy, ["reject", "head_only"], "repository.dirtyPolicy");

  exactKeys(input.authorization, FORBIDDEN_AUTHORIZATION, [], "authorization");
  for (const key of FORBIDDEN_AUTHORIZATION) {
    if (input.authorization[key] !== false) {
      throw new DelegateError("authorization", `authorization.${key} must be false`, 2);
    }
  }

  exactKeys(input.agent, [
    "timeoutMs", "model", "reasoningEffort", "executionProfile", "sandbox", "inheritEnv", "shellPermissions",
  ], ["cancelGraceMs"], "agent");
  positiveInteger(input.agent.timeoutMs, "agent.timeoutMs");
  if (Object.hasOwn(input.agent, "cancelGraceMs")) positiveInteger(input.agent.cancelGraceMs, "agent.cancelGraceMs");
  nullableString(input.agent.model, "agent.model");
  nullableString(input.agent.reasoningEffort, "agent.reasoningEffort");
  enumValue(input.agent.executionProfile, ["hardened", "trusted_local"], "agent.executionProfile");
  nullableString(input.agent.sandbox, "agent.sandbox");
  if (input.agent.sandbox && !/^[A-Za-z0-9._-]+$/.test(input.agent.sandbox)) {
    throw new DelegateError("validation", "agent.sandbox contains unsupported characters", 2);
  }
  if (!Array.isArray(input.agent.inheritEnv)) throw new DelegateError("validation", "agent.inheritEnv must be an array", 2);
  const envNames = new Set();
  for (const [index, name] of input.agent.inheritEnv.entries()) {
    nonEmptyString(name, `agent.inheritEnv[${index}]`, 256);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw new DelegateError("validation", `Invalid environment name: ${name}`, 2);
    if (WRAPPER_OWNED_ENV_NAMES.has(name)) {
      throw new DelegateError("validation", `Wrapper-owned environment name is forbidden: ${name}`, 2);
    }
    if (isControlEnvironmentName(name)) {
      throw new DelegateError("validation", `Control-plane environment name is forbidden: ${name}`, 2);
    }
    if (SECRET_ENV_PATTERN.test(name) && name !== "XAI_API_KEY") {
      throw new DelegateError("validation", `Secret-like environment name is forbidden: ${name}`, 2);
    }
    if (envNames.has(name)) throw new DelegateError("validation", `Duplicate environment name: ${name}`, 2);
    envNames.add(name);
  }
  if (!Array.isArray(input.agent.shellPermissions)) throw new DelegateError("validation", "agent.shellPermissions must be an array", 2);
  for (const [index, permission] of input.agent.shellPermissions.entries()) {
    exactKeys(permission, ["id", "match", "argv"], [], `agent.shellPermissions[${index}]`);
    registerId(allIds, permission.id, `agent.shellPermissions[${index}].id`);
    enumValue(permission.match, ["exact", "prefix"], `agent.shellPermissions[${index}].match`);
    validateArgv(permission.argv, `agent.shellPermissions[${index}].argv`);
  }
  if (input.agent.executionProfile === "hardened") {
    if (!input.agent.sandbox) throw new DelegateError("validation", "hardened execution requires agent.sandbox", 2);
    if (input.agent.sandbox !== "strict") throw new DelegateError("validation", "hardened execution currently requires the built-in strict sandbox", 2);
    if (!envNames.has("XAI_API_KEY")) throw new DelegateError("validation", "hardened execution requires XAI_API_KEY in agent.inheritEnv", 2);
    if (!process.env.XAI_API_KEY) throw new DelegateError("authentication", "hardened execution requires an inherited XAI_API_KEY", 2);
  }

  exactKeys(input.verification, ["commands", "requireDiffCheck"], [], "verification");
  if (!Array.isArray(input.verification.commands)) throw new DelegateError("validation", "verification.commands must be an array", 2);
  const verifierIds = new Set();
  for (const [index, command] of input.verification.commands.entries()) {
    exactKeys(command, ["id", "argv", "cwd", "timeoutMs", "required"], [], `verification.commands[${index}]`);
    registerId(allIds, command.id, `verification.commands[${index}].id`);
    verifierIds.add(command.id);
    validateArgv(command.argv, `verification.commands[${index}].argv`);
    validateRepoRelative(command.cwd, `verification.commands[${index}].cwd`, { allowDot: true });
    positiveInteger(command.timeoutMs, `verification.commands[${index}].timeoutMs`);
    if (typeof command.required !== "boolean") throw new DelegateError("validation", `verification.commands[${index}].required must be boolean`, 2);
  }
  if (typeof input.verification.requireDiffCheck !== "boolean") throw new DelegateError("validation", "verification.requireDiffCheck must be boolean", 2);
  for (const criterion of input.task.acceptanceCriteria) {
    for (const verifierId of criterion.verifyWith) {
      if (!verifierIds.has(verifierId)) {
        throw new DelegateError("validation", `Acceptance criterion ${criterion.id} references unknown verifier ${verifierId}`, 2);
      }
    }
  }

  exactKeys(input.limits, ["maxRounds", "maxPatchBytes", "maxArtifactBytes"], [], "limits");
  positiveInteger(input.limits.maxRounds, "limits.maxRounds", 5);
  positiveInteger(input.limits.maxPatchBytes, "limits.maxPatchBytes");
  positiveInteger(input.limits.maxArtifactBytes, "limits.maxArtifactBytes");
  return structuredClone(input);
}

function validateFeedback(input) {
  exactKeys(input, ["schemaVersion", "feedback"], [], "feedback");
  if (input.schemaVersion !== 1) throw new DelegateError("validation", "feedback.schemaVersion must be 1", 2);
  return { schemaVersion: 1, feedback: nonEmptyString(input.feedback, "feedback.feedback", 65_536) };
}

async function readJsonStdin(label) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > MAX_INPUT_BYTES) throw new DelegateError("validation", `${label} exceeds ${MAX_INPUT_BYTES} bytes`, 2);
    chunks.push(buffer);
  }
  if (bytes === 0) throw new DelegateError("validation", `${label} stdin is empty`, 2);
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new DelegateError("validation", `${label} is malformed JSON`, 2);
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function inheritedEnvironmentBindingHash(names) {
  return sha256(stableJson(names.map((name) => ({
    name,
    present: Object.hasOwn(process.env, name),
    value: Object.hasOwn(process.env, name) ? process.env[name] : null,
  }))));
}

function effectivePathValue() {
  const value = Object.hasOwn(process.env, "PATH") ? process.env.PATH : "/usr/bin:/bin";
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    throw new DelegateError("environment_binding", "Effective PATH is malformed", 2);
  }
  const entries = value.split(path.delimiter);
  if (entries.length === 0 || entries.some((entry) => entry.length === 0 || !path.isAbsolute(entry))) {
    throw new DelegateError("environment_binding", "Effective PATH must contain only nonempty absolute entries", 2);
  }
  return value;
}

function pathEnvironmentBindingHash() {
  return sha256(stableJson({ PATH: effectivePathValue() }));
}

function executableStatIdentity(info) {
  return {
    dev: info.dev.toString(),
    ino: info.ino.toString(),
    mode: info.mode.toString(),
    size: info.size.toString(),
    nlink: info.nlink.toString(),
  };
}

async function executableIdentity(command, {
  cwd = process.cwd(),
  allowRelativePath = true,
} = {}) {
  if (typeof command !== "string" || command.length === 0 || command.includes("\0")) {
    throw new DelegateError("environment_binding", "Executable binding is malformed", 2);
  }
  const hasPathSeparator = command.includes("/") || (path.sep === "\\" && command.includes("\\"));
  let candidate = null;
  if (path.isAbsolute(command)) {
    candidate = path.normalize(command);
  } else if (hasPathSeparator) {
    if (!allowRelativePath) {
      throw new DelegateError("environment_binding", "Control executable paths must be absolute", 2);
    }
    candidate = path.resolve(cwd, command);
  } else {
    for (const entry of effectivePathValue().split(path.delimiter)) {
      const possible = path.join(entry, command);
      try {
        await access(possible, fsConstants.X_OK);
        const possibleInfo = await stat(possible);
        if (possibleInfo.isFile()) {
          candidate = possible;
          break;
        }
      } catch { /* Continue searching PATH. */ }
    }
  }
  if (!candidate) {
    throw new DelegateError("environment_binding", "A bound executable could not be resolved", 2);
  }

  let resolved;
  let linked;
  try {
    resolved = await realpath(candidate);
    linked = await lstat(resolved, { bigint: true });
    await access(resolved, fsConstants.X_OK);
  } catch {
    throw new DelegateError("environment_binding", "A bound executable is unavailable", 2);
  }
  if (!linked.isFile() || linked.isSymbolicLink()) {
    throw new DelegateError("environment_binding", "A bound executable is not a regular file", 2);
  }

  const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0);
  let handle;
  try {
    handle = await open(resolved, flags);
    const openedBefore = await handle.stat({ bigint: true });
    if (!openedBefore.isFile()
      || stableJson(executableStatIdentity(openedBefore)) !== stableJson(executableStatIdentity(linked))) {
      throw new DelegateError("environment_binding", "A bound executable changed during inspection", 2);
    }
    const hasher = createHash("sha256");
    const buffer = Buffer.allocUnsafe(64 * 1024);
    let position = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
      if (bytesRead === 0) break;
      hasher.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
    const openedAfter = await handle.stat({ bigint: true });
    const linkedAfter = await lstat(resolved, { bigint: true });
    if (stableJson(executableStatIdentity(openedBefore)) !== stableJson(executableStatIdentity(openedAfter))
      || stableJson(executableStatIdentity(openedAfter)) !== stableJson(executableStatIdentity(linkedAfter))) {
      throw new DelegateError("environment_binding", "A bound executable changed during inspection", 2);
    }
    return {
      configured: command,
      resolved,
      identity: executableStatIdentity(openedAfter),
      content: { bytes: position, sha256: hasher.digest("hex") },
    };
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    throw new DelegateError("environment_binding", "A bound executable could not be fingerprinted", 2);
  } finally {
    if (handle) await handle.close();
  }
}

async function gitControlBindings() {
  return {
    pathEnvironmentBindingHash: pathEnvironmentBindingHash(),
    gitExecutableBindingHash: sha256(stableJson(await executableIdentity("git", { allowRelativePath: false }))),
  };
}

async function controlExecutableBindings(options) {
  return {
    ...await gitControlBindings(),
    grokExecutableBindingHash: sha256(stableJson(await executableIdentity(options.grokBin, { allowRelativePath: false }))),
  };
}

async function taskExecutableBindingHash(task, source) {
  const descriptors = [
    ...task.verification.commands.map((command) => ({
      role: "verifier",
      id: command.id,
      command: command.argv[0],
      cwd: path.resolve(source.root, command.cwd),
    })),
    ...task.agent.shellPermissions.map((permission) => ({
      role: "delegated_shell",
      id: permission.id,
      command: permission.argv[0],
      cwd: source.root,
    })),
  ];
  const identities = [];
  for (const descriptor of descriptors) {
    identities.push({
      role: descriptor.role,
      id: descriptor.id,
      executable: await executableIdentity(descriptor.command, { cwd: descriptor.cwd }),
    });
  }
  return sha256(stableJson(identities));
}

function bindingHashIsValid(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function isControlEnvironmentName(name) {
  if (name === "XAI_API_KEY") return false;
  return CONTROL_ENV_NAMES.has(name)
    || CONTROL_ENV_PREFIXES.some((prefix) => name.startsWith(prefix))
    || /_PROXY$/i.test(name);
}

function safeText(value, maximum = MAX_PUBLIC_TEXT) {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
  return cleaned.length <= maximum ? cleaned : `${cleaned.slice(0, maximum)}…`;
}

function buildExactValueRedactor(environment, inheritedNames, privateValues = []) {
  const secrets = new Set();
  let ordered = [];
  const add = (...values) => {
    let changed = false;
    for (const value of values.flat()) {
      if (typeof value !== "string" || value.length < 8 || secrets.has(value)) continue;
      secrets.add(value);
      changed = true;
    }
    if (changed) ordered = [...secrets].sort((left, right) => right.length - left.length);
  };
  add(inheritedNames.map((name) => environment[name]), privateValues);
  const redact = (value) => {
    if (typeof value !== "string") return value;
    let redacted = value;
    for (const secret of ordered) redacted = redacted.split(secret).join("[REDACTED]");
    return redacted;
  };
  redact.add = (...values) => add(...values);
  return redact;
}

function publicText(value, maximum, redact) {
  if (typeof value !== "string") return null;
  return safeText(redact(value), maximum);
}

function now() {
  return new Date().toISOString();
}

function isWithin(parent, child) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

async function ensureStateRoot(value) {
  let existed = true;
  try { await lstat(value); }
  catch (error) {
    if (error?.code !== "ENOENT") throw new DelegateError("state", "State root cannot be inspected", 2);
    existed = false;
    await mkdir(value, { recursive: true, mode: 0o700 });
  }
  const info = await lstat(value);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new DelegateError("state", "State root must be a real directory", 2);
  if ((info.mode & 0o077) !== 0 || (info.mode & 0o700) !== 0o700) {
    throw new DelegateError("state", "State root must have owner-only 0700-compatible permissions", 2);
  }
  if (typeof process.getuid === "function" && info.uid !== process.getuid()) {
    throw new DelegateError("state", "State root must be owned by the current user", 2);
  }
  if (!existed) {
    const created = await lstat(value);
    if ((created.mode & 0o777) !== 0o700) throw new DelegateError("state", "New state root was not created with mode 0700", 2);
  }
  return realpath(value);
}

async function readOnlyStateRoot(value) {
  let info;
  try { info = await lstat(value); }
  catch { throw new DelegateError("state", "State root does not exist"); }
  if (!info.isDirectory() || info.isSymbolicLink()) {
    throw new DelegateError("state", "State root must be a real directory");
  }
  if ((info.mode & 0o077) !== 0 || (info.mode & 0o700) !== 0o700) {
    throw new DelegateError("state", "State root must have owner-only 0700-compatible permissions");
  }
  if (typeof process.getuid === "function" && info.uid !== process.getuid()) {
    throw new DelegateError("state", "State root must be owned by the current user");
  }
  return realpath(value);
}

async function prospectiveResolvedPath(value) {
  const missing = [];
  let cursor = path.resolve(value);
  while (true) {
    try {
      const resolved = await realpath(cursor);
      return path.join(resolved, ...missing.reverse());
    } catch (error) {
      if (error?.code !== "ENOENT") throw new DelegateError("state", "State root path cannot be resolved safely", 2);
      const parent = path.dirname(cursor);
      if (parent === cursor) throw new DelegateError("state", "State root has no resolvable ancestor", 2);
      missing.push(path.basename(cursor));
      cursor = parent;
    }
  }
}

function assertStateSeparatedFromSource(statePath, source) {
  const protectedRoots = [...new Set([source.root, source.gitDir, source.commonGitDir].filter(Boolean))];
  if (protectedRoots.some((protectedRoot) => isWithin(protectedRoot, statePath) || isWithin(statePath, protectedRoot))) {
    throw new DelegateError(
      "state_source_overlap",
      "State root cannot equal, contain, or be contained by the source worktree or Git metadata",
      2,
    );
  }
}

async function ensureSecureDirectory(directory, root) {
  const resolvedRoot = await realpath(root);
  if (!isWithin(resolvedRoot, directory)) throw new DelegateError("artifact_path", "Secure directory escapes its root");
  const relative = path.relative(resolvedRoot, directory);
  let cursor = resolvedRoot;
  for (const component of relative.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, component);
    let created = false;
    try { await lstat(cursor); }
    catch (error) {
      if (error?.code !== "ENOENT") throw new DelegateError("artifact_path", "Secure directory cannot be inspected");
      await mkdir(cursor, { mode: 0o700 });
      created = true;
    }
    const info = await lstat(cursor);
    if (!info.isDirectory() || info.isSymbolicLink() || await realpath(cursor) !== cursor) {
      throw new DelegateError("artifact_path", "Secure directory crosses a symbolic link");
    }
    if (created && (info.mode & 0o777) !== 0o700) throw new DelegateError("artifact_path", "Secure directory mode is not 0700");
  }
  return directory;
}

async function validateSecureParent(filePath, root) {
  const resolvedRoot = await realpath(root);
  const parent = path.dirname(filePath);
  if (!isWithin(resolvedRoot, filePath) || !isWithin(resolvedRoot, parent)) {
    throw new DelegateError("artifact_path", "Secure file escapes its root");
  }
  const parentInfo = await lstat(parent);
  if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink() || await realpath(parent) !== parent) {
    throw new DelegateError("artifact_path", "Secure file parent is unsafe");
  }
}

async function writeSecureFile(filePath, content, root = path.dirname(filePath)) {
  await validateSecureParent(filePath, root);
  const flags = fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL | (fsConstants.O_NOFOLLOW ?? 0);
  let handle;
  try { handle = await open(filePath, flags, 0o600); }
  catch { throw new DelegateError("artifact_path", "Secure file already exists or cannot be created safely"); }
  try {
    await handle.writeFile(content);
    await handle.chmod(0o600);
    await handle.sync();
    const opened = await handle.stat();
    const linked = await lstat(filePath);
    if (!opened.isFile() || !linked.isFile() || linked.isSymbolicLink()
      || opened.dev !== linked.dev || opened.ino !== linked.ino || linked.nlink !== 1) {
      throw new DelegateError("artifact_path", "Secure file inode validation failed");
    }
  } finally {
    await handle.close();
  }
}

async function ensureSecureStaticFile(filePath, content, root) {
  try {
    const info = await lstat(filePath);
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o777) !== 0o600 || await realpath(filePath) !== filePath) {
      throw new DelegateError("artifact_path", "Static security file is unsafe");
    }
    const existing = await readFile(filePath);
    const expected = Buffer.isBuffer(content) ? content : Buffer.from(content);
    if (!existing.equals(expected)) throw new DelegateError("artifact_path", "Static security file changed");
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    if (error?.code !== "ENOENT") throw new DelegateError("artifact_path", "Static security file cannot be inspected");
    await writeSecureFile(filePath, content, root);
  }
}

async function atomicWriteJson(filePath, value) {
  const temporary = `${filePath}.tmp-${randomUUID()}`;
  await writeSecureFile(temporary, `${JSON.stringify(value)}\n`, path.dirname(filePath));
  try {
    const existing = await lstat(filePath);
    if (!existing.isFile() || existing.isSymbolicLink()) throw new DelegateError("state", "Manifest path is unsafe");
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    if (error?.code !== "ENOENT") throw new DelegateError("state", "Manifest path cannot be inspected");
  }
  await rename(temporary, filePath);
}

async function createTransaction(stateRoot, task, runtimeBindings) {
  const transactionId = randomUUID();
  const transactionDir = path.join(stateRoot, transactionId);
  await mkdir(transactionDir, { mode: 0o700 });
  const transactionInfo = await lstat(transactionDir);
  if ((transactionInfo.mode & 0o777) !== 0o700) throw new DelegateError("state", "Transaction directory mode is not 0700");
  const manifest = {
    schemaVersion: MANIFEST_VERSION,
    transactionId,
    state: "preparing",
    createdAt: now(),
    updatedAt: now(),
    task,
    taskHash: sha256(stableJson(task)),
    inheritedEnvBindingHash: inheritedEnvironmentBindingHash(task.agent.inheritEnv),
    pathEnvironmentBindingHash: runtimeBindings.pathEnvironmentBindingHash,
    gitExecutableBindingHash: runtimeBindings.gitExecutableBindingHash,
    grokExecutableBindingHash: runtimeBindings.grokExecutableBindingHash,
    taskExecutableBindingHash: runtimeBindings.taskExecutableBindingHash,
    source: null,
    sourceBindingHash: null,
    workspace: { relativePath: "workspace" },
    sessionId: null,
    sessionBindingHash: null,
    containment: task.agent.executionProfile === "trusted_local"
      ? "transactional_only"
      : "transactional_plus_requested_sandbox",
    round: 0,
    recoverable: false,
    lastError: null,
    candidate: null,
    verification: [],
    agentReport: null,
    permissionAudit: null,
    executedApprovedPaths: [],
    executedApprovedPathsHash: sha256(stableJson([])),
    history: [],
  };
  await atomicWriteJson(path.join(transactionDir, "manifest.json"), manifest);
  return { transactionId, transactionDir, manifest };
}

async function saveManifest(transactionDir, manifest) {
  if (!STATES.has(manifest.state)) throw new DelegateError("state", "Manifest has an invalid lifecycle state");
  if (!Array.isArray(manifest.executedApprovedPaths)) throw new DelegateError("state", "Manifest write provenance is malformed");
  manifest.executedApprovedPaths = [...new Set(manifest.executedApprovedPaths)].sort();
  manifest.executedApprovedPathsHash = sha256(stableJson(manifest.executedApprovedPaths));
  manifest.updatedAt = now();
  await atomicWriteJson(path.join(transactionDir, "manifest.json"), manifest);
}

async function loadTransaction(stateRoot, transactionId, { requireWorkspace = false } = {}) {
  if (!TX_PATTERN.test(transactionId) || transactionId === "." || transactionId === "..") {
    throw new DelegateError("usage", "Unsafe transaction ID", 2);
  }
  const transactionDir = path.join(stateRoot, transactionId);
  if (!isWithin(stateRoot, transactionDir) || path.dirname(transactionDir) !== stateRoot) {
    throw new DelegateError("state", "Transaction path escapes the state root", 2);
  }
  let info;
  try {
    info = await lstat(transactionDir);
  } catch {
    throw new DelegateError("state", "Transaction does not exist", 1);
  }
  if (!info.isDirectory() || info.isSymbolicLink()) throw new DelegateError("state", "Transaction path is unsafe");
  const resolvedTransaction = await realpath(transactionDir);
  if (!isWithin(stateRoot, resolvedTransaction) || path.basename(resolvedTransaction) !== transactionId) {
    throw new DelegateError("state", "Resolved transaction path is unsafe");
  }
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(resolvedTransaction, "manifest.json"), "utf8"));
  } catch {
    throw new DelegateError("state", "Transaction manifest is unreadable");
  }
  if (!isPlainObject(manifest)
    || manifest.schemaVersion !== MANIFEST_VERSION
    || manifest.transactionId !== transactionId
    || !STATES.has(manifest.state)
    || manifest.taskHash !== sha256(stableJson(manifest.task))
    || !bindingHashIsValid(manifest.inheritedEnvBindingHash)
    || !bindingHashIsValid(manifest.pathEnvironmentBindingHash)
    || !bindingHashIsValid(manifest.gitExecutableBindingHash)
    || !bindingHashIsValid(manifest.grokExecutableBindingHash)
    || !bindingHashIsValid(manifest.taskExecutableBindingHash)) {
    throw new DelegateError("state", "Transaction manifest integrity check failed");
  }
  if (manifest.source) {
    if (manifest.sourceBindingHash !== sha256(stableJson(manifest.source))) {
      throw new DelegateError("state", "Transaction source binding changed");
    }
  } else if (manifest.sourceBindingHash !== null) {
    throw new DelegateError("state", "Transaction source binding is malformed");
  }
  if (manifest.sessionId) {
    if (manifest.sessionBindingHash !== sha256(`${manifest.transactionId}\0${manifest.sessionId}`)) {
      throw new DelegateError("state", "Transaction ACP session binding changed");
    }
  } else if (manifest.sessionBindingHash !== null) {
    throw new DelegateError("state", "Transaction ACP session binding is malformed");
  }
  if (!Array.isArray(manifest.executedApprovedPaths)
    || manifest.executedApprovedPaths.some((item) => typeof item !== "string")
    || new Set(manifest.executedApprovedPaths).size !== manifest.executedApprovedPaths.length
    || manifest.executedApprovedPathsHash !== sha256(stableJson(manifest.executedApprovedPaths))) {
    throw new DelegateError("state", "Transaction write provenance binding changed");
  }
  try {
    for (const item of manifest.executedApprovedPaths) validateRepoRelative(item, "write provenance path");
  } catch {
    throw new DelegateError("state", "Transaction write provenance is malformed");
  }
  const workspace = path.join(resolvedTransaction, manifest.workspace?.relativePath ?? "");
  if (workspace !== path.join(resolvedTransaction, "workspace")) {
    throw new DelegateError("state", "Transaction workspace binding is invalid");
  }
  if (requireWorkspace) {
    let workspaceInfo;
    try {
      workspaceInfo = await lstat(workspace);
    } catch {
      throw new DelegateError("state", "Transaction workspace is unavailable");
    }
    if (!workspaceInfo.isDirectory() || workspaceInfo.isSymbolicLink()) {
      throw new DelegateError("state", "Transaction workspace is unsafe");
    }
    const resolvedWorkspace = await realpath(workspace);
    if (resolvedWorkspace !== workspace || !isWithin(resolvedTransaction, resolvedWorkspace)) {
      throw new DelegateError("state", "Resolved workspace binding is invalid");
    }
  }
  return { transactionDir: resolvedTransaction, workspace, manifest };
}

function coreEnvironment() {
  const environment = {};
  for (const name of CORE_ENV_NAMES) {
    if (Object.hasOwn(process.env, name)) environment[name] = process.env[name];
  }
  environment.PATH = effectivePathValue();
  return environment;
}

function configuredCachedAuthPath() {
  let candidate;
  if (typeof process.env.GROK_AUTH_PATH === "string" && process.env.GROK_AUTH_PATH.length > 0) {
    if (!path.isAbsolute(process.env.GROK_AUTH_PATH) || process.env.GROK_AUTH_PATH.includes("\0")) {
      throw new DelegateError("authentication", "Configured Grok auth path is unsafe");
    }
    candidate = path.normalize(process.env.GROK_AUTH_PATH);
  } else if (typeof process.env.GROK_HOME === "string" && process.env.GROK_HOME.length > 0) {
    if (!path.isAbsolute(process.env.GROK_HOME) || process.env.GROK_HOME.includes("\0")) {
      throw new DelegateError("authentication", "Configured Grok home is unsafe");
    }
    candidate = path.join(path.normalize(process.env.GROK_HOME), "auth.json");
  } else {
    if (typeof process.env.HOME !== "string" || process.env.HOME.length === 0
      || !path.isAbsolute(process.env.HOME) || process.env.HOME.includes("\0")) {
      throw new DelegateError("authentication", "No safe cached Grok auth location is available");
    }
    candidate = path.join(path.normalize(process.env.HOME), ".grok", "auth.json");
  }
  if (path.basename(candidate) !== "auth.json") {
    throw new DelegateError("authentication", "Configured Grok auth path must name auth.json");
  }
  return candidate;
}

function jsonStringScalars(value) {
  const strings = [];
  const stack = [value];
  while (stack.length > 0) {
    const current = stack.pop();
    if (typeof current === "string") {
      if (current.length >= 8) strings.push(current);
    } else if (Array.isArray(current)) {
      stack.push(...current);
    } else if (isPlainObject(current)) {
      stack.push(...Object.values(current));
    }
  }
  return [...new Set(strings)];
}

function jsonHasDuplicateObjectKeys(text) {
  let index = 0;
  const whitespace = () => {
    while (index < text.length && /[\t\n\r ]/.test(text[index])) index += 1;
  };
  const stringValue = () => {
    const start = index;
    if (text[index] !== '"') throw new Error("expected string");
    index += 1;
    while (index < text.length) {
      const character = text[index];
      index += 1;
      if (character === '"') return JSON.parse(text.slice(start, index));
      if (character === "\\") {
        if (index >= text.length) throw new Error("invalid escape");
        if (text[index] === "u") index += 5;
        else index += 1;
      }
    }
    throw new Error("unterminated string");
  };
  let duplicate = false;
  const value = () => {
    whitespace();
    if (text[index] === "{") {
      index += 1;
      whitespace();
      const keys = new Set();
      if (text[index] === "}") {
        index += 1;
        return;
      }
      while (index < text.length) {
        whitespace();
        const key = stringValue();
        if (keys.has(key)) duplicate = true;
        keys.add(key);
        whitespace();
        if (text[index] !== ":") throw new Error("expected colon");
        index += 1;
        value();
        whitespace();
        if (text[index] === "}") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("expected comma");
        index += 1;
      }
      throw new Error("unterminated object");
    }
    if (text[index] === "[") {
      index += 1;
      whitespace();
      if (text[index] === "]") {
        index += 1;
        return;
      }
      while (index < text.length) {
        value();
        whitespace();
        if (text[index] === "]") {
          index += 1;
          return;
        }
        if (text[index] !== ",") throw new Error("expected comma");
        index += 1;
      }
      throw new Error("unterminated array");
    }
    if (text[index] === '"') {
      stringValue();
      return;
    }
    const start = index;
    while (index < text.length && !/[\t\n\r ,\]}]/.test(text[index])) index += 1;
    if (index === start) throw new Error("expected scalar");
  };
  value();
  whitespace();
  if (index !== text.length) throw new Error("trailing input");
  return duplicate;
}

async function inspectCachedAuthSource(authPath, protectedRoots, errorKind = "authentication") {
  const fail = () => { throw new DelegateError(errorKind, "Cached Grok auth source failed its security binding"); };
  let linked;
  let resolved;
  try {
    linked = await lstat(authPath);
    resolved = await realpath(authPath);
  } catch { fail(); }
  if (resolved !== authPath
    || !linked.isFile()
    || linked.isSymbolicLink()
    || linked.nlink !== 1
    || (linked.mode & 0o777) !== 0o600
    || linked.size <= 0
    || linked.size > MAX_AUTH_BYTES
    || (typeof process.getuid === "function" && linked.uid !== process.getuid())
    || protectedRoots.some((root) => typeof root === "string" && isWithin(root, resolved))) {
    fail();
  }
  let handle;
  let content;
  try {
    handle = await open(resolved, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
    const opened = await handle.stat();
    if (!opened.isFile()
      || opened.dev !== linked.dev
      || opened.ino !== linked.ino
      || opened.nlink !== 1
      || (opened.mode & 0o777) !== 0o600
      || opened.size !== linked.size) fail();
    content = await handle.readFile();
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    fail();
  } finally {
    if (handle) await handle.close();
  }
  try {
    const afterRead = await lstat(resolved);
    if (!afterRead.isFile()
      || afterRead.isSymbolicLink()
      || afterRead.dev !== linked.dev
      || afterRead.ino !== linked.ino
      || afterRead.nlink !== 1
      || (afterRead.mode & 0o777) !== 0o600
      || afterRead.size !== content.length) fail();
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    fail();
  }
  let parsed;
  try {
    const text = content.toString("utf8");
    parsed = JSON.parse(text);
    if (!isPlainObject(parsed) || jsonHasDuplicateObjectKeys(text)) fail();
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    fail();
  }
  return {
    path: resolved,
    secretValues: jsonStringScalars(parsed),
    fingerprint: {
      dev: linked.dev,
      ino: linked.ino,
      uid: linked.uid,
      mode: linked.mode & 0o777,
      nlink: linked.nlink,
      size: content.length,
      sha256: sha256(content),
    },
  };
}

function gitEnvironment(extra = {}) {
  return {
    ...coreEnvironment(),
    HOME: path.join(os.tmpdir(), `${NAME}-git-home`),
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
    GIT_OPTIONAL_LOCKS: "0",
    ...extra,
  };
}

function killChild(child, signal) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  try {
    if (process.platform !== "win32" && child.pid) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch {
    try { child.kill(signal); } catch { /* Already gone. */ }
  }
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function spawnCaptured(executable, argv, {
  cwd,
  env,
  input = null,
  timeoutMs = 0,
  maxBytes = 16 * 1024 * 1024,
  detached = process.platform !== "win32",
} = {}) {
  const started = Date.now();
  let child;
  try {
    child = spawn(executable, argv, {
      cwd,
      env,
      shell: false,
      detached,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return {
      spawned: false, code: null, signal: null, timedOut: false, durationMs: Date.now() - started,
      stdout: Buffer.alloc(0), stderr: Buffer.alloc(0), stdoutBytes: 0, stderrBytes: 0,
      stdoutHash: sha256(Buffer.alloc(0)), stderrHash: sha256(Buffer.alloc(0)), truncated: false,
    };
  }
  const stdoutChunks = [];
  const stderrChunks = [];
  const stdoutHasher = createHash("sha256");
  const stderrHasher = createHash("sha256");
  let stdoutBytes = 0;
  let stderrBytes = 0;
  let storedStdout = 0;
  let storedStderr = 0;
  let timedOut = false;
  let spawnError = false;

  const collect = (chunk, chunks, hasher, kind) => {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    hasher.update(buffer);
    if (kind === "stdout") stdoutBytes += buffer.length;
    else stderrBytes += buffer.length;
    const stored = kind === "stdout" ? storedStdout : storedStderr;
    if (stored < maxBytes) {
      const piece = buffer.subarray(0, Math.min(buffer.length, maxBytes - stored));
      if (piece.length > 0) chunks.push(piece);
      if (kind === "stdout") storedStdout += piece.length;
      else storedStderr += piece.length;
    }
  };
  child.stdout.on("data", (chunk) => collect(chunk, stdoutChunks, stdoutHasher, "stdout"));
  child.stderr.on("data", (chunk) => collect(chunk, stderrChunks, stderrHasher, "stderr"));
  child.once("error", () => { spawnError = true; });
  if (input !== null && child.stdin.writable) child.stdin.end(input);
  else if (child.stdin.writable) child.stdin.end();

  let timer = null;
  if (timeoutMs > 0) {
    timer = setTimeout(() => {
      timedOut = true;
      killChild(child, "SIGTERM");
      setTimeout(() => killChild(child, "SIGKILL"), TERMINATION_POLL_MS).unref();
    }, timeoutMs);
  }
  const outcome = await new Promise((resolve) => {
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
  if (timer) clearTimeout(timer);
  return {
    spawned: !spawnError,
    code: outcome.code,
    signal: outcome.signal,
    timedOut,
    durationMs: Date.now() - started,
    stdout: Buffer.concat(stdoutChunks),
    stderr: Buffer.concat(stderrChunks),
    stdoutBytes,
    stderrBytes,
    stdoutHash: stdoutHasher.digest("hex"),
    stderrHash: stderrHasher.digest("hex"),
    truncated: stdoutBytes > maxBytes || stderrBytes > maxBytes,
  };
}

async function runGit(cwd, argv, {
  env = {}, input = null, timeoutMs = 60_000, maxBytes = 32 * 1024 * 1024,
} = {}) {
  const result = await spawnCaptured("git", ["-C", cwd, ...argv], {
    cwd,
    env: gitEnvironment(env),
    input,
    timeoutMs,
    maxBytes,
  });
  if (!result.spawned || result.timedOut || result.code !== 0 || result.stdoutBytes > maxBytes || result.stderrBytes > maxBytes) {
    throw new DelegateError("git", "A required Git operation failed");
  }
  return result.stdout;
}

async function gitText(cwd, argv, options) {
  return (await runGit(cwd, argv, options)).toString("utf8").trim();
}

async function operationInProgress(repository, gitDir) {
  const markers = [
    "MERGE_HEAD",
    "CHERRY_PICK_HEAD",
    "REVERT_HEAD",
    "BISECT_LOG",
    "BISECT_START",
    "rebase-merge",
    "rebase-apply",
    "sequencer",
  ];
  for (const marker of markers) {
    const markerPath = path.join(gitDir, marker);
    try {
      await lstat(markerPath);
      return marker;
    } catch (error) {
      if (error?.code !== "ENOENT") throw new DelegateError("git", "Could not inspect Git operation state");
    }
  }
  const status = await gitText(repository, ["status", "--porcelain=v2", "--branch", "--untracked-files=all"]);
  if (/^# branch\.(?:head|oid)/m.test(status)) return null;
  return null;
}

function statusIsDirty(statusText) {
  return statusText.split("\n").some((line) => line.length > 0 && !line.startsWith("# "));
}

function bigintStatIdentity(info) {
  return {
    dev: info.dev.toString(),
    ino: info.ino.toString(),
    mode: info.mode.toString(),
    size: info.size.toString(),
    nlink: info.nlink.toString(),
  };
}

async function regularFileContentFingerprint(filePath, expectedInfo) {
  const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0);
  let handle;
  try { handle = await open(filePath, flags); }
  catch { throw new DelegateError("source_mutation", "A source file could not be opened without following links"); }
  try {
    const openedBefore = await handle.stat({ bigint: true });
    if (!openedBefore.isFile()
      || stableJson(bigintStatIdentity(openedBefore)) !== stableJson(bigintStatIdentity(expectedInfo))) {
      throw new DelegateError("source_mutation", "A source file changed while it was fingerprinted");
    }
    const hasher = createHash("sha256");
    const buffer = Buffer.allocUnsafe(64 * 1024);
    let position = 0;
    while (true) {
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, position);
      if (bytesRead === 0) break;
      hasher.update(buffer.subarray(0, bytesRead));
      position += bytesRead;
    }
    const openedAfter = await handle.stat({ bigint: true });
    let linkedAfter;
    try { linkedAfter = await lstat(filePath, { bigint: true }); }
    catch { throw new DelegateError("source_mutation", "A source file disappeared while it was fingerprinted"); }
    if (stableJson(bigintStatIdentity(openedBefore)) !== stableJson(bigintStatIdentity(openedAfter))
      || stableJson(bigintStatIdentity(openedAfter)) !== stableJson(bigintStatIdentity(linkedAfter))) {
      throw new DelegateError("source_mutation", "A source file changed while it was fingerprinted");
    }
    return { sha256: hasher.digest("hex"), bytes: position };
  } finally {
    await handle.close();
  }
}

function sourceEntryType(info) {
  if (info.isDirectory()) return "directory";
  if (info.isFile()) return "file";
  if (info.isSymbolicLink()) return "symlink";
  if (info.isBlockDevice()) return "block_device";
  if (info.isCharacterDevice()) return "character_device";
  if (info.isFIFO()) return "fifo";
  if (info.isSocket()) return "socket";
  return "other";
}

async function sourceFilesystemFingerprint(root, excludedMetadataDirectories) {
  const excluded = new Set(excludedMetadataDirectories.filter((item) => isWithin(root, item)));
  const hasher = createHash("sha256");
  let entryCount = 0;
  const record = (value) => {
    const encoded = Buffer.from(stableJson(value), "utf8");
    const length = Buffer.allocUnsafe(8);
    length.writeBigUInt64BE(BigInt(encoded.length));
    hasher.update(length);
    hasher.update(encoded);
    entryCount += 1;
  };

  const walk = async (directory, relativeDirectory) => {
    let names;
    try { names = await readdir(directory); }
    catch { throw new DelegateError("source_mutation", "A source directory could not be enumerated"); }
    names.sort((left, right) => Buffer.from(left).compare(Buffer.from(right)));
    for (const name of names) {
      const absolute = path.join(directory, name);
      if (excluded.has(absolute)) continue;
      const relative = relativeDirectory ? `${relativeDirectory}/${name}` : name;
      let info;
      try { info = await lstat(absolute, { bigint: true }); }
      catch { throw new DelegateError("source_mutation", "A source entry disappeared while it was fingerprinted"); }
      const type = sourceEntryType(info);
      const common = {
        path: relative,
        type,
        mode: Number(info.mode & 0o7777n),
      };
      if (type === "file") {
        const content = await regularFileContentFingerprint(absolute, info);
        record({ ...common, content });
      } else if (type === "symlink") {
        let target;
        try { target = await readlink(absolute, { encoding: "buffer" }); }
        catch { throw new DelegateError("source_mutation", "A source symbolic link changed while it was fingerprinted"); }
        const after = await lstat(absolute, { bigint: true });
        if (stableJson(bigintStatIdentity(info)) !== stableJson(bigintStatIdentity(after))) {
          throw new DelegateError("source_mutation", "A source symbolic link changed while it was fingerprinted");
        }
        record({ ...common, targetSha256: sha256(target), targetBytes: target.length });
      } else if (type === "directory") {
        record(common);
        await walk(absolute, relative);
        const after = await lstat(absolute, { bigint: true });
        if (!after.isDirectory() || after.isSymbolicLink()
          || info.dev !== after.dev || info.ino !== after.ino || info.mode !== after.mode) {
          throw new DelegateError("source_mutation", "A source directory changed while it was fingerprinted");
        }
      } else {
        record({ ...common, rdev: info.rdev.toString() });
      }
    }
  };

  await walk(root, "");
  return { sha256: hasher.digest("hex"), entries: entryCount };
}

async function inspectRepository(task) {
  let repository;
  try {
    repository = await realpath(task.repository.path);
  } catch {
    throw new DelegateError("preflight", "repository.path does not resolve");
  }
  const repositoryInfo = await stat(repository);
  if (!repositoryInfo.isDirectory()) throw new DelegateError("preflight", "repository.path is not a directory");
  const topLevel = await gitText(repository, ["rev-parse", "--show-toplevel"]);
  let resolvedTop;
  try { resolvedTop = await realpath(topLevel); } catch { throw new DelegateError("preflight", "Git root does not resolve"); }
  if (resolvedTop !== repository) throw new DelegateError("preflight", "repository.path must resolve to the exact Git root");
  if (await gitText(repository, ["rev-parse", "--is-bare-repository"]) !== "false") {
    throw new DelegateError("preflight", "Bare repositories are not supported");
  }
  const gitDirValue = await gitText(repository, ["rev-parse", "--git-dir"]);
  const gitDir = await realpath(path.resolve(repository, gitDirValue));
  const commonGitDirValue = await gitText(repository, ["rev-parse", "--git-common-dir"]);
  const commonGitDir = await realpath(path.resolve(repository, commonGitDirValue));
  const operation = await operationInProgress(repository, gitDir);
  if (operation) throw new DelegateError("preflight", "A Git operation is already in progress");
  const baseOid = await gitText(repository, ["rev-parse", "--verify", "--end-of-options", `${task.repository.base}^{commit}`]);
  if (!/^[0-9a-f]{40,64}$/.test(baseOid)) throw new DelegateError("preflight", "repository.base did not resolve to an immutable commit OID");
  const baseTree = await gitText(repository, ["rev-parse", "--verify", `${baseOid}^{tree}`]);
  const headOid = await gitText(repository, ["rev-parse", "--verify", "HEAD"]);
  const branchResult = await spawnCaptured("git", ["-C", repository, "symbolic-ref", "--quiet", "--short", "HEAD"], {
    cwd: repository,
    env: gitEnvironment(),
    timeoutMs: 30_000,
  });
  const branch = branchResult.code === 0 ? branchResult.stdout.toString("utf8").trim() : null;
  const statusPorcelain = (await runGit(repository, ["status", "--porcelain=v2", "--branch", "--untracked-files=all"])).toString("utf8");
  const dirty = statusIsDirty(statusPorcelain);
  if (task.repository.dirtyPolicy === "reject" && dirty) {
    throw new DelegateError("dirty_source", "Source checkout is dirty under dirtyPolicy=reject");
  }
  const indexPath = path.join(gitDir, "index");
  const headPath = path.join(gitDir, "HEAD");
  const indexFingerprint = await hashFile(indexPath);
  const headFileFingerprint = await hashFile(headPath);
  const configFingerprint = await optionalFileFingerprint(path.join(commonGitDir, "config"));
  const workingTreeFingerprint = await sourceFilesystemFingerprint(repository, [gitDir, commonGitDir]);
  return {
    root: repository,
    gitDir,
    commonGitDir,
    baseOid,
    baseTree,
    headOid,
    branch,
    statusHash: sha256(statusPorcelain),
    indexFingerprint,
    headFileFingerprint,
    configFingerprint,
    workingTreeFingerprint,
    dirtyAtStart: dirty,
    dirtyIgnored: task.repository.dirtyPolicy === "head_only" && dirty,
  };
}

async function assertSourceUnchangedSinceStart(source) {
  let root;
  try { root = await realpath(source.root); }
  catch { throw new DelegateError("source_mutation", "Source repository stopped resolving during delegation"); }
  if (root !== source.root) throw new DelegateError("source_mutation", "Source repository realpath changed during delegation");
  const headOid = await gitText(root, ["rev-parse", "--verify", "HEAD"]);
  const currentGitDirValue = await gitText(root, ["rev-parse", "--git-dir"]);
  const currentGitDir = await realpath(path.resolve(root, currentGitDirValue));
  const currentCommonGitDirValue = await gitText(root, ["rev-parse", "--git-common-dir"]);
  const currentCommonGitDir = await realpath(path.resolve(root, currentCommonGitDirValue));
  const statusPorcelain = await runGit(root, ["status", "--porcelain=v2", "--branch", "--untracked-files=all"]);
  const indexFingerprint = await hashFile(path.join(source.gitDir, "index"));
  const headFileFingerprint = await hashFile(path.join(source.gitDir, "HEAD"));
  const configFingerprint = await optionalFileFingerprint(path.join(source.commonGitDir, "config"));
  const workingTreeFingerprint = await sourceFilesystemFingerprint(root, [source.gitDir, source.commonGitDir]);
  if (headOid !== source.headOid
    || currentGitDir !== source.gitDir
    || currentCommonGitDir !== source.commonGitDir
    || sha256(statusPorcelain) !== source.statusHash
    || indexFingerprint.sha256 !== source.indexFingerprint.sha256
    || indexFingerprint.bytes !== source.indexFingerprint.bytes
    || headFileFingerprint.sha256 !== source.headFileFingerprint.sha256
    || headFileFingerprint.bytes !== source.headFileFingerprint.bytes
    || stableJson(configFingerprint) !== stableJson(source.configFingerprint)
    || stableJson(workingTreeFingerprint) !== stableJson(source.workingTreeFingerprint)) {
    throw new DelegateError("source_mutation", "Source Git bindings or working-tree contents changed during delegation");
  }
}

async function createWorkspace(transactionDir, source) {
  const workspace = path.join(transactionDir, "workspace");
  const clone = await spawnCaptured("git", [
    "clone", "--no-local", "--no-hardlinks", "--no-checkout", "--", source.root, workspace,
  ], {
    cwd: transactionDir,
    env: gitEnvironment(),
    timeoutMs: 120_000,
    maxBytes: 1024 * 1024,
  });
  if (!clone.spawned || clone.timedOut || clone.code !== 0) {
    throw new DelegateError("clone", "Could not create the independent transaction clone");
  }
  await chmod(workspace, 0o700);
  await runGit(workspace, ["checkout", "--detach", source.baseOid]);
  await runGit(workspace, ["remote", "remove", "origin"]);
  const head = await gitText(workspace, ["rev-parse", "HEAD"]);
  if (head !== source.baseOid) throw new DelegateError("clone", "Transaction clone did not detach at the immutable base");
  return workspace;
}

async function repositoryFingerprint(repository) {
  const statusBuffer = await runGit(repository, [
    "status", "--porcelain=v2", "--branch", "--untracked-files=all", "--ignored=matching",
  ]);
  return {
    sha256: sha256(statusBuffer),
    bytes: statusBuffer.length,
  };
}

async function optionalFileFingerprint(filePath) {
  try { return await hashFile(filePath); }
  catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function captureWorkspaceInfrastructure(workspace) {
  const gitDir = path.join(workspace, ".git");
  const gitInfo = await lstat(gitDir);
  if (!gitInfo.isDirectory() || gitInfo.isSymbolicLink() || await realpath(gitDir) !== gitDir) {
    throw new DelegateError("workspace_integrity", "Transaction Git directory is unsafe");
  }
  const files = {};
  for (const relative of ["config", "info/attributes", "objects/info/alternates"]) {
    files[relative] = await optionalFileFingerprint(path.join(gitDir, ...relative.split("/")));
  }
  return { gitDir: ".git", files };
}

async function assertWorkspaceInfrastructure(workspace, binding = null) {
  const gitDir = path.join(workspace, ".git");
  let gitInfo;
  try { gitInfo = await lstat(gitDir); }
  catch { throw new DelegateError("workspace_integrity", "Transaction Git directory is missing"); }
  if (!gitInfo.isDirectory() || gitInfo.isSymbolicLink() || await realpath(gitDir) !== gitDir) {
    throw new DelegateError("workspace_integrity", "Transaction Git directory binding changed");
  }
  for (const relative of ["HEAD", "index", "config"]) {
    const target = path.join(gitDir, relative);
    const info = await lstat(target);
    if (!info.isFile() || info.isSymbolicLink()) {
      throw new DelegateError("workspace_integrity", `Transaction .git/${relative} is unsafe`);
    }
  }
  const objects = path.join(gitDir, "objects");
  const objectsInfo = await lstat(objects);
  if (!objectsInfo.isDirectory() || objectsInfo.isSymbolicLink() || !isWithin(gitDir, await realpath(objects))) {
    throw new DelegateError("workspace_integrity", "Transaction object database is unsafe");
  }
  if (binding) {
    if (binding.gitDir !== ".git") throw new DelegateError("workspace_integrity", "Transaction Git binding is malformed");
    for (const [relative, expected] of Object.entries(binding.files ?? {})) {
      const current = await optionalFileFingerprint(path.join(gitDir, ...relative.split("/")));
      if (stableJson(current) !== stableJson(expected)) {
        throw new DelegateError("workspace_integrity", `Transaction .git/${relative} changed`);
      }
    }
  }
}

async function assertWorkspaceHead(workspace, baseOid, binding = null) {
  await assertWorkspaceInfrastructure(workspace, binding);
  const head = await gitText(workspace, ["rev-parse", "HEAD"]);
  if (head !== baseOid) throw new DelegateError("candidate_head_changed", "Candidate clone HEAD no longer equals the immutable base");
}

async function safeWorkspacePath(workspace, requested, { mustExist = false } = {}) {
  if (typeof requested !== "string" || requested.length === 0 || requested.includes("\0")) {
    throw new DelegateError("path_policy", "Tool path is malformed");
  }
  const absolute = path.isAbsolute(requested) ? path.normalize(requested) : path.resolve(workspace, requested);
  if (!isWithin(workspace, absolute)) throw new DelegateError("path_policy", "Tool path escapes the transaction workspace");
  const relative = path.relative(workspace, absolute);
  let cursor = workspace;
  for (const component of relative.split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, component);
    try {
      const info = await lstat(cursor);
      if (info.isSymbolicLink()) throw new DelegateError("path_policy", "Tool path crosses a symbolic link");
    } catch (error) {
      if (error instanceof DelegateError) throw error;
      if (error?.code === "ENOENT") break;
      throw new DelegateError("path_policy", "Tool path cannot be resolved safely");
    }
  }
  try {
    const resolved = await realpath(absolute);
    if (!isWithin(workspace, resolved)) throw new DelegateError("path_policy", "Resolved tool path escapes the workspace");
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    if (mustExist || error?.code !== "ENOENT") throw new DelegateError("path_policy", "Tool path does not resolve safely");
  }
  const posix = relative.length === 0 ? "." : relative.split(path.sep).join("/");
  validateRepoRelative(posix, "tool path", { allowDot: true });
  return { absolute, relative: posix };
}

function matchesPrefix(candidate, prefix) {
  return candidate === prefix || candidate.startsWith(`${prefix}/`);
}

function pathIsAllowed(relative, task) {
  if (relative === ".git" || relative.startsWith(".git/")) return false;
  const inScope = task.task.writeScope.some((scope) => {
    if (scope.kind === "exact") return relative === scope.path;
    if (scope.path === ".") return true;
    return matchesPrefix(relative, scope.path);
  });
  if (!inScope) return false;
  return !task.task.protectedPaths.some((protectedPath) => protectedPath === "." || matchesPrefix(relative, protectedPath));
}

const TOOL_KIND_ALLOWLIST = new Map([
  ["edit", "edit"],
  ["write", "write"],
  ["bash", "bash"],
  ["read", "read"],
  ["mcptool", "mcp"],
  ["webfetch", "web"],
  ["websearch", "web"],
]);

function canonicalToolKind(value) {
  const text = safeText(value, 128);
  if (!text) return null;
  return TOOL_KIND_ALLOWLIST.get(text.toLowerCase()) ?? null;
}

function toolIdentityValues(toolCall, params) {
  const strong = [];
  const titles = [];
  const collect = (container) => {
    if (!isPlainObject(container)) return;
    for (const key of ["kind", "toolKind", "name", "toolName"]) {
      if (Object.hasOwn(container, key) && typeof container[key] === "string") strong.push(container[key]);
    }
    if (Object.hasOwn(container, "title") && typeof container.title === "string") titles.push(container.title);
  };
  collect(toolCall);
  if (params !== toolCall) collect(params);
  return { strong, titles };
}

function descriptiveTitleKind(value) {
  const text = safeText(value, 512);
  if (!text) return null;
  const match = /^\s*(Edit|Write|Bash|Read|MCPTool|WebFetch|WebSearch)(?=$|[\s:—–-])/i.exec(text);
  return match ? canonicalToolKind(match[1]) : null;
}

function hasCompositeToolIdentity(value) {
  const text = safeText(value, 128);
  if (!text || canonicalToolKind(text)) return false;
  const segments = text.match(/[A-Z]+(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[0-9]+/g) ?? [];
  if (segments.length < 2) return false;
  const identityWords = new Set(["edit", "write", "bash", "read", "mcp", "mcptool", "web", "webfetch", "websearch"]);
  return segments.some((segment) => identityWords.has(segment.toLowerCase()));
}

function classifyToolIdentity(toolCall, params) {
  const { strong, titles } = toolIdentityValues(toolCall, params);
  const values = strong.length > 0 ? strong : titles;
  const canonical = strong.length > 0
    ? values.map(canonicalToolKind)
    : values.map(descriptiveTitleKind);
  const known = [...new Set(canonical.filter(Boolean))];
  const hasUnknown = canonical.some((item) => item === null);
  const ambiguous = known.length > 1
    || (values.length > 1 && hasUnknown)
    || (strong.length > 0 && strong.some(hasCompositeToolIdentity));
  return {
    kind: !hasUnknown && known.length === 1 ? known[0] : "unknown",
    ambiguous,
    unknown: values.length === 0 || hasUnknown,
  };
}

const ACP_DISPLAY_KINDS = new Set([
  "read", "edit", "delete", "move", "search", "execute", "think", "fetch", "switch_mode", "other",
]);
const XAI_NATIVE_IDENTITIES = new Map([
  ["opencode\0write\0write", "write"],
  ["opencode\0edit\0edit", "edit"],
  ["opencode\0execute\0bash", "bash"],
  ["grok_build\0read\0read_file", "read"],
  ["grok_build\0edit\0search_replace", "edit"],
  ["grok_build\0execute\0bash", "bash"],
  ["grok_build_concise\0read\0read_file", "read"],
  ["grok_build_concise\0edit\0search_replace", "edit"],
  ["grok_build_concise\0execute\0bash", "bash"],
]);
const DISPLAY_COMPATIBILITY = new Map([
  ["read", new Set(["read"])],
  ["edit", new Set(["edit"])],
  ["write", new Set(["edit"])],
  ["bash", new Set(["execute"])],
]);

function xaiToolIdentity(toolCall, params) {
  const envelopes = [];
  let suspicious = false;
  for (const metadata of [toolCall?._meta, params !== toolCall ? params?._meta : null]) {
    if (!isPlainObject(metadata)) continue;
    for (const [key, value] of Object.entries(metadata)) {
      if (key === "x.ai/tool") envelopes.push(value);
      else if (/x\.ai/i.test(key) && /tool/i.test(key)) suspicious = true;
    }
  }
  if (envelopes.length === 0) {
    return { present: false, kind: null, name: null, reason: suspicious ? "unknown_xai_tool_identity" : null };
  }
  let identity = null;
  for (const envelope of envelopes) {
    const keys = isPlainObject(envelope) ? Object.keys(envelope) : [];
    const allowedKeys = new Set(["version", "namespace", "name", "kind", "label", "read_only", "input"]);
    if (!isPlainObject(envelope)
      || keys.some((key) => !allowedKeys.has(key))
      || envelope.version !== 1
      || typeof envelope.namespace !== "string"
      || typeof envelope.kind !== "string"
      || typeof envelope.name !== "string"
      || typeof envelope.label !== "string"
      || typeof envelope.read_only !== "boolean"
      || (Object.hasOwn(envelope, "input") && !isPlainObject(envelope.input))) {
      return { present: true, kind: null, name: null, reason: "unknown_xai_tool_identity" };
    }
    const kind = XAI_NATIVE_IDENTITIES.get(
      `${envelope.namespace}\0${envelope.kind}\0${envelope.name}`,
    ) ?? null;
    if (!kind || envelope.read_only !== (kind === "read")) {
      return { present: true, kind: null, name: null, reason: "unknown_xai_tool_identity" };
    }
    const current = {
      kind,
      nativeKind: envelope.kind,
      name: envelope.name,
      namespace: envelope.namespace,
      readOnly: envelope.read_only,
    };
    if (identity && stableJson(identity) !== stableJson(current)) {
      return { present: true, kind: null, name: null, reason: "xai_tool_identity_mismatch" };
    }
    identity = current;
  }
  return {
    present: true,
    kind: identity.kind,
    name: identity.name,
    nativeIdentity: identity,
    reason: null,
  };
}

function outerToolKinds(toolCall, params) {
  const values = [];
  for (const container of [toolCall, params !== toolCall ? params : null]) {
    if (!isPlainObject(container)) continue;
    for (const key of ["kind", "toolKind"]) {
      if (Object.hasOwn(container, key)) {
        if (typeof container[key] !== "string" || container[key].length === 0) return { values, reason: "unknown_tool_kind" };
        values.push(container[key]);
      }
    }
  }
  return { values: [...new Set(values)], reason: null };
}

function hasLegacyStrongNameCarrier(toolCall, params) {
  for (const container of [toolCall, params !== toolCall ? params : null]) {
    if (!isPlainObject(container)) continue;
    if (Object.hasOwn(container, "name") || Object.hasOwn(container, "toolName")) return true;
  }
  return false;
}

function resolveToolIdentity(toolCall, params, current = null) {
  const currentKind = current?.kind ?? null;
  const xai = xaiToolIdentity(toolCall, params);
  if (xai.reason) {
    return {
      kind: null,
      displayKind: null,
      nativeIdentity: null,
      present: xai.present,
      reason: xai.reason,
    };
  }
  const outer = outerToolKinds(toolCall, params);
  if (outer.reason) return { kind: null, displayKind: null, present: true, reason: outer.reason };
  let displayKind = null;
  if (xai.present) {
    for (const value of outer.values) {
      const candidate = value;
      if (!ACP_DISPLAY_KINDS.has(candidate)
        || !DISPLAY_COMPATIBILITY.get(xai.kind)?.has(candidate)) {
        return {
          kind: xai.kind,
          displayKind: candidate,
          nativeIdentity: xai.nativeIdentity,
          present: true,
          reason: "incompatible_tool_identity",
        };
      }
      if (displayKind && displayKind !== candidate) {
        return {
          kind: xai.kind,
          displayKind: candidate,
          nativeIdentity: xai.nativeIdentity,
          present: true,
          reason: "incompatible_tool_identity",
        };
      }
      displayKind = candidate;
    }
    return {
      kind: xai.kind,
      displayKind,
      nativeIdentity: xai.nativeIdentity,
      present: true,
      reason: null,
    };
  }
  if (current?.nativeIdentity) {
    if (hasLegacyStrongNameCarrier(toolCall, params)) {
      return {
        kind: currentKind,
        displayKind: null,
        present: true,
        reason: "xai_tool_identity_changed",
      };
    }
    for (const value of outer.values) {
      if (!ACP_DISPLAY_KINDS.has(value)
        || !DISPLAY_COMPATIBILITY.get(currentKind)?.has(value)
        || (displayKind && displayKind !== value)) {
        return {
          kind: currentKind,
          displayKind: value,
          present: true,
          reason: "incompatible_tool_identity",
        };
      }
      displayKind = value;
    }
    return {
      kind: currentKind,
      displayKind,
      nativeIdentity: null,
      present: outer.values.length > 0,
      reason: null,
    };
  }
  if (outer.values.length > 0) {
    let inferred = null;
    for (const value of outer.values) {
      const lowered = value.toLowerCase();
      if (currentKind && value === lowered && ACP_DISPLAY_KINDS.has(lowered)) {
        if (!DISPLAY_COMPATIBILITY.get(currentKind)?.has(lowered)) {
          return { kind: currentKind, displayKind: lowered, present: true, reason: "incompatible_tool_identity" };
        }
        displayKind = lowered;
        continue;
      }
      const native = canonicalToolKind(value);
      if (hasCompositeToolIdentity(value) || (native && inferred && inferred !== native)) {
        return { kind: null, displayKind, present: true, reason: "ambiguous_tool_kind" };
      }
      if (!native) {
        return { kind: null, displayKind, present: true, reason: "unknown_tool_kind" };
      }
      inferred = native;
    }
    const resolved = currentKind ?? inferred;
    if (currentKind && inferred && inferred !== currentKind) {
      return { kind: currentKind, displayKind, present: true, reason: "tool_kind_changed" };
    }
    return { kind: resolved, displayKind, present: true, reason: resolved ? null : "unknown_tool_kind" };
  }
  if (currentKind) return { kind: currentKind, displayKind: null, present: false, reason: null };
  const legacy = classifyToolIdentity(toolCall, params);
  if (!legacy.unknown && !legacy.ambiguous && legacy.kind !== "unknown") {
    return { kind: legacy.kind, displayKind: null, present: true, reason: null };
  }
  return {
    kind: null,
    displayKind: null,
    present: false,
    reason: null,
  };
}

function extractToolCallId(toolCall, params) {
  const values = [];
  const collect = (container, keys) => {
    if (!isPlainObject(container)) return;
    for (const key of keys) {
      if (!Object.hasOwn(container, key)) continue;
      const value = container[key];
      if (typeof value !== "string"
        || value.length === 0
        || value.length > 256
        || /[\u0000-\u001f]/.test(value)) {
        return false;
      }
      values.push(value);
    }
    return true;
  };
  if (!collect(toolCall, ["toolCallId", "id", "permissionId"])) {
    return { toolCallId: null, reason: "ambiguous_tool_call_id" };
  }
  if (params !== toolCall && !collect(params, ["toolCallId", "permissionId"])) {
    return { toolCallId: null, reason: "ambiguous_tool_call_id" };
  }
  const unique = [...new Set(values)];
  return unique.length > 1
    ? { toolCallId: null, reason: "ambiguous_tool_call_id" }
    : { toolCallId: unique[0] ?? null, reason: null };
}

function extractPresentedToolStatus(toolCall, params) {
  const values = [];
  for (const container of [toolCall, params !== toolCall ? params : null]) {
    if (!isPlainObject(container) || !Object.hasOwn(container, "status")) continue;
    if (typeof container.status !== "string"
      || container.status.length === 0
      || container.status !== container.status.toLowerCase()
      || !KNOWN_TOOL_STATUSES.has(container.status)) {
      return { status: null, present: true, reason: "unknown_tool_status" };
    }
    values.push(container.status);
  }
  const unique = [...new Set(values)];
  return unique.length > 1
    ? { status: null, present: true, reason: "unknown_tool_status" }
    : { status: unique[0] ?? null, present: values.length > 0, reason: null };
}

function extractToolCall(params, current = null) {
  const toolCall = isPlainObject(params?.toolCall) ? params.toolCall : params;
  const id = extractToolCallId(toolCall, params);
  const identity = resolveToolIdentity(toolCall, params, current);
  return {
    toolCall,
    toolCallId: id.toolCallId,
    toolCallIdReason: id.reason,
    kind: identity.kind,
    displayKind: identity.displayKind,
    nativeIdentity: identity.nativeIdentity ?? null,
    identityPresent: identity.present,
    identityReason: identity.reason,
  };
}

const SCALAR_PATH_CARRIERS = new Set([
  "path", "filePath", "file_path", "filename", "uri", "fileUri", "fileURI", "file_uri",
  "target", "targetPath", "target_path",
  "source", "sourcePath", "source_path",
  "destination", "destinationPath", "destination_path",
  "oldPath", "old_path", "newPath", "new_path", "from", "to",
]);
const LIST_PATH_CARRIERS = new Set(["paths", "locations", "files"]);
const UNKNOWN_PATH_CONTAINER_KEYS = new Set(["edits", "changes", "targets"]);

function normalizePathCarrier(value, key) {
  if (typeof value !== "string" || value.length === 0 || value.includes("\0")) {
    return { value: null, reason: "malformed_path_carrier" };
  }
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
  if (key.toLowerCase().includes("uri") || hasScheme) {
    if (!value.toLowerCase().startsWith("file:")) {
      return { value: null, reason: "unsupported_path_scheme" };
    }
    try { return { value: fileURLToPath(value), reason: null }; }
    catch { return { value: null, reason: "malformed_path_carrier" }; }
  }
  return { value, reason: null };
}

function suspiciousUnknownPathKey(key) {
  return UNKNOWN_PATH_CONTAINER_KEYS.has(key)
    || /(?:path|uri|file|location|paths|uris|files|locations)$/i.test(key)
    || /^(?:source|destination|old|new|from|to|target)$/i.test(key);
}

function extractRequestedPaths(toolCall, params) {
  const paths = [];
  const scalarFamilies = new Map();
  let reason = null;
  const carrierFamily = (key) => {
    if (["path", "filePath", "file_path", "filename", "uri", "fileUri", "fileURI", "file_uri"].includes(key)) return "primary";
    if (["target", "targetPath", "target_path"].includes(key)) return "target";
    if (["source", "sourcePath", "source_path"].includes(key)) return "source";
    if (["destination", "destinationPath", "destination_path"].includes(key)) return "destination";
    if (["oldPath", "old_path"].includes(key)) return "old";
    if (["newPath", "new_path"].includes(key)) return "new";
    return key;
  };
  const record = (candidate, key) => {
    const normalized = normalizePathCarrier(candidate, key);
    if (normalized.reason) {
      reason = normalized.reason;
      return;
    }
    if (SCALAR_PATH_CARRIERS.has(key)) {
      const family = carrierFamily(key);
      const existing = scalarFamilies.get(family) ?? [];
      existing.push(normalized.value);
      scalarFamilies.set(family, existing);
    }
    paths.push(normalized.value);
  };
  const visit = (value, carrierKey = null) => {
    if (reason) return;
    if (typeof value === "string" && carrierKey) {
      record(value, carrierKey);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, carrierKey);
      return;
    }
    if (!isPlainObject(value)) {
      reason = "malformed_path_carrier";
      return;
    }
    for (const [key, item] of Object.entries(value)) {
      if (SCALAR_PATH_CARRIERS.has(key)) {
        record(item, key);
        if (reason) return;
      } else if (LIST_PATH_CARRIERS.has(key)) {
        if (!Array.isArray(item)) {
          reason = "malformed_path_carrier";
          return;
        }
        visit(item, key);
      } else if (suspiciousUnknownPathKey(key)) {
        reason = "unknown_path_carrier";
        return;
      }
    }
  };

  visit(toolCall);
  if (params !== toolCall) visit(params);
  for (const input of rawToolInputs(toolCall, params)) visit(input);
  for (const container of [toolCall, params !== toolCall ? params : null]) {
    if (!isPlainObject(container)) continue;
    if (Array.isArray(container.content)) {
      for (const item of container.content) {
        if (isPlainObject(item) && item.type === "diff" && Object.hasOwn(item, "path")) {
          record(item.path, "path");
        }
      }
    }
  }
  return {
    paths: [...new Set(paths)],
    families: [...scalarFamilies.entries()].map(([family, values]) => ({ family, values: [...new Set(values)] })),
    reason,
  };
}

function rawToolInputs(toolCall, params) {
  const inputs = [
    toolCall?.rawInput,
    toolCall?.input,
    toolCall?.arguments,
    params?.rawInput,
    params?.input,
  ];
  for (const container of [toolCall, params !== toolCall ? params : null]) {
    const xaiInput = container?._meta?.["x.ai/tool"]?.input;
    if (xaiInput !== undefined && xaiInput !== null) inputs.push(xaiInput);
  }
  return inputs.filter((item) => item !== undefined && item !== null);
}

function tokenizeSimpleCommand(command) {
  if (typeof command !== "string" || command.length === 0 || command.includes("\0")) return null;
  if (/[\r\n;&|<>`$*?!#~(){}\[\]]/.test(command)) return null;
  const tokens = [];
  let token = "";
  let quote = null;
  let escaped = false;
  let active = false;
  for (const character of command) {
    if (escaped) {
      if (quote === "'") return null;
      token += character;
      active = true;
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (quote) {
      if (character === quote) quote = null;
      else token += character;
      active = true;
    } else if (character === "'" || character === '"') {
      quote = character;
      active = true;
    } else if (/\s/.test(character)) {
      if (active) {
        tokens.push(token);
        token = "";
        active = false;
      }
    } else {
      token += character;
      active = true;
    }
  }
  if (escaped || quote) return null;
  if (active) tokens.push(token);
  return tokens.length > 0 ? tokens : null;
}

function extractRequestedArgv(toolCall, params, { allowAbsent = false } = {}) {
  const candidates = [];
  let reason = null;
  let sawCarrier = false;
  let sawRawInput = false;
  const addArgv = (value) => {
    if (value === undefined) return;
    sawCarrier = true;
    if (!Array.isArray(value) || value.length === 0 || !value.every((item) => typeof item === "string")) {
      reason = "unparsable_argv";
      return;
    }
    candidates.push([...value]);
  };
  const addCommand = (value) => {
    if (value === undefined) return;
    sawCarrier = true;
    const tokenized = tokenizeSimpleCommand(value);
    if (!tokenized) reason = "unparsable_argv";
    else candidates.push(tokenized);
  };
  const inspect = (input) => {
    if (reason || input === undefined || input === null) return;
    if (typeof input === "string") {
      addCommand(input);
      return;
    }
    if (!isPlainObject(input)) {
      reason = "unparsable_argv";
      return;
    }
    for (const key of Object.keys(input)) {
      if (!["argv", "command", "cmd"].includes(key)
        && /(?:argv|args|command|cmd|shell|script)/i.test(key)) {
        reason = "unknown_argv_carrier";
        return;
      }
    }
    addArgv(input?.argv);
    addCommand(input?.command);
    addCommand(input?.cmd);
  };
  for (const input of rawToolInputs(toolCall, params)) {
    sawRawInput = true;
    inspect(input);
  }
  inspect(toolCall);
  if (params !== toolCall) inspect(params);
  if (reason) return { argv: null, present: sawCarrier || sawRawInput, reason };
  if (candidates.length === 0) {
    return allowAbsent && !sawRawInput
      ? { argv: null, present: false, reason: null }
      : { argv: null, present: sawCarrier || sawRawInput, reason: "unparsable_argv" };
  }
  const unique = new Map(candidates.map((candidate) => [stableJson(candidate), candidate]));
  if (unique.size !== 1) return { argv: null, present: true, reason: "ambiguous_argv" };
  return { argv: [...unique.values()][0], present: true, reason: null };
}

function forbiddenArgvReason(argv) {
  if (!Array.isArray(argv) || argv.length === 0 || argv.some((item) => typeof item !== "string" || item.includes("\0"))) {
    return "unparsable_argv";
  }
  if (argv.some((item) => /[\r\n;&|<>`$*?!#~(){}\[\]\\]/.test(item))) {
    return "shell_metacharacter";
  }
  const executable = path.basename(argv[0]).toLowerCase();
  if (["sh", "bash", "zsh", "fish", "dash", "env", "xargs", "sudo", "doas", "command", "printenv", "set", "export"].includes(executable)) {
    return "shell_wrapper";
  }
  if (["curl", "wget", "ssh", "scp", "sftp", "ftp", "nc", "ncat", "socat", "telnet"].includes(executable)) {
    return "network_command";
  }
  if (["rm", "rmdir", "unlink", "shred"].includes(executable)) return "removal_command";
  if (["npm", "pnpm", "yarn", "bun"].includes(executable) && ["install", "add", "i"].includes(argv[1]?.toLowerCase())) {
    return "dependency_install";
  }
  if (["pip", "pip3", "cargo", "gem", "brew", "apt", "apt-get", "dnf", "yum"].includes(executable)
    && ["install", "add"].includes(argv[1]?.toLowerCase())) return "dependency_install";
  if (executable === "git") {
    const operation = argv.slice(1).map((item) => item.toLowerCase()).find((item) => [
      "commit", "push", "reset", "stash", "checkout", "switch", "worktree", "clean", "merge", "rebase", "cherry-pick", "revert",
    ].includes(item));
    if (operation) {
      return `git_${operation}`;
    }
  }
  const joined = argv.join(" ").toLowerCase();
  if (/(mcp|keychain|credential|secret|password|token|api[_-]?key|auth\.json|\.ssh|\.aws|\.grok|\.env)/.test(joined)) {
    return "secret_or_mcp_access";
  }
  return null;
}

function matchShellPermission(argv, permissions) {
  return permissions.find((permission) => {
    if (permission.match === "exact" && argv.length !== permission.argv.length) return false;
    if (permission.match === "prefix" && argv.length < permission.argv.length) return false;
    return permission.argv.every((token, index) => token === argv[index]);
  }) ?? null;
}

function serverOption(params, kind) {
  const options = Array.isArray(params?.options) ? params.options : [];
  return options.find((option) => option?.kind === kind && typeof option.optionId === "string") ?? null;
}

function permissionSelected(optionId) {
  return { outcome: { outcome: "selected", optionId } };
}

function permissionRejected(params) {
  const reject = serverOption(params, "reject_once");
  return reject ? permissionSelected(reject.optionId) : { outcome: { outcome: "cancelled" } };
}

function suppressDynamicPermissionAudit(audit) {
  const violations = Array.isArray(audit?.violations)
    ? audit.violations
      .filter((item) => typeof item?.code === "string" && /^[a-z0-9_:.-]{1,128}$/.test(item.code))
      .map((item) => ({ code: item.code }))
    : [];
  if (!violations.some((item) => item.code === "auth_redaction_incomplete")) {
    violations.push({ code: "auth_redaction_incomplete" });
  }
  return {
    decisions: [],
    toolCallCount: Number.isSafeInteger(audit?.toolCallCount) ? audit.toolCallCount : 0,
    allowedCount: Number.isSafeInteger(audit?.allowedCount) ? audit.allowedCount : 0,
    rejectedCount: Number.isSafeInteger(audit?.rejectedCount) ? audit.rejectedCount : 0,
    violations,
  };
}

function reverseRequestKey(requestId) {
  if (typeof requestId === "string") return `string:${requestId}`;
  if (typeof requestId === "number" && Number.isFinite(requestId)) return `number:${requestId}`;
  return null;
}

function canonicalWorkspacePath(workspace, requested) {
  if (typeof requested !== "string" || requested.length === 0 || requested.includes("\0")) {
    throw new DelegateError("path_policy", "Tool path is malformed");
  }
  const absolute = path.isAbsolute(requested) ? path.normalize(requested) : path.resolve(workspace, requested);
  if (!isWithin(workspace, absolute)) throw new DelegateError("path_policy", "Tool path escapes the transaction workspace");
  const relative = path.relative(workspace, absolute).split(path.sep).join("/") || ".";
  validateRepoRelative(relative, "tool path", { allowDot: true });
  return relative;
}

function createToolCallState(kind = null) {
  return {
    revision: 0,
    kind,
    nativeIdentity: null,
    displayKind: null,
    statuses: [],
    allowed: false,
    allowedPaths: [],
    argv: null,
    observedPaths: null,
    observedArgv: null,
    announced: false,
    permissionRequested: false,
    permissionGranted: false,
    permissionRejected: false,
    terminalStatus: null,
    executionObserved: false,
    executionBeforePermission: false,
    executedApprovedPaths: [],
  };
}

function sameStringSet(left, right) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return leftSet.size === rightSet.size && [...leftSet].every((item) => rightSet.has(item));
}

class PermissionPolicy {
  constructor({ workspace, task, getSessionId, isPromptActive, redact }) {
    this.workspace = workspace;
    this.task = task;
    this.getSessionId = getSessionId;
    this.isPromptActive = isPromptActive;
    this.redact = redact;
    this.decisions = [];
    this.toolCalls = new Map();
    this.permissionToolCallIds = new Set();
    this.violations = [];
    this.invalidToolCallIds = new Set();
  }

  violation(code, toolCallId = null) {
    if (!this.violations.some((item) => item.code === code && item.toolCallId === toolCallId)) {
      this.violations.push({ code, toolCallId });
    }
    if (toolCallId) this.invalidToolCallIds.add(toolCallId);
  }

  mergeIdentity(current, identity, toolCallId) {
    if (identity.identityReason) this.violation(identity.identityReason, toolCallId);
    if (identity.nativeIdentity) {
      if (current.nativeIdentity
        && stableJson(current.nativeIdentity) !== stableJson(identity.nativeIdentity)) {
        this.violation("xai_tool_identity_changed", toolCallId);
      } else {
        current.nativeIdentity = structuredClone(identity.nativeIdentity);
      }
    }
    if (identity.kind) {
      if (current.kind && current.kind !== identity.kind) this.violation("tool_kind_changed", toolCallId);
      else current.kind = identity.kind;
    }
    if (identity.displayKind) {
      if (current.displayKind && current.displayKind !== identity.displayKind) {
        this.violation("tool_display_kind_changed", toolCallId);
      } else {
        current.displayKind = identity.displayKind;
      }
    }
    if (!current.kind && identity.identityPresent) this.violation("unknown_tool_kind", toolCallId);
  }

  canonicalObservedPaths(extracted, toolCallId) {
    if (extracted.reason) {
      this.violation(extracted.reason, toolCallId);
      return null;
    }
    const canonical = [];
    for (const candidate of extracted.paths) {
      try { canonical.push(canonicalWorkspacePath(this.workspace, candidate)); }
      catch {
        this.violation("execution_path_outside_workspace", toolCallId);
        return null;
      }
    }
    for (const family of extracted.families ?? []) {
      const projected = [];
      for (const candidate of family.values) {
        try { projected.push(canonicalWorkspacePath(this.workspace, candidate)); }
        catch {
          this.violation("execution_path_outside_workspace", toolCallId);
          return null;
        }
      }
      if (new Set(projected).size > 1) {
        this.violation("ambiguous_path_carrier", toolCallId);
        return null;
      }
    }
    return [...new Set(canonical)];
  }

  mergeObservedPaths(current, extracted, toolCallId) {
    if ((extracted.paths?.length ?? 0) === 0 && !extracted.reason) return;
    const paths = this.canonicalObservedPaths(extracted, toolCallId);
    if (!paths) {
      if (current.permissionGranted || current.observedPaths) {
        this.violation("tool_path_changed", toolCallId);
      }
      return;
    }
    if (current.observedPaths && !sameStringSet(current.observedPaths, paths)) {
      this.violation("tool_path_changed", toolCallId);
      return;
    }
    current.observedPaths ??= paths;
    if (current.permissionGranted && !sameStringSet(current.allowedPaths, paths)) {
      this.violation("tool_path_changed", toolCallId);
    }
  }

  mergeObservedArgv(current, extracted, toolCallId) {
    if (!extracted.present && !extracted.reason) return;
    if (extracted.reason || !extracted.argv) {
      this.violation(extracted.reason ?? "unparsable_argv", toolCallId);
      return;
    }
    if (current.observedArgv && stableJson(current.observedArgv) !== stableJson(extracted.argv)) {
      this.violation("tool_argv_changed", toolCallId);
      return;
    }
    current.observedArgv ??= [...extracted.argv];
    if (current.permissionGranted && current.argv
      && stableJson(current.argv) !== stableJson(extracted.argv)) {
      this.violation("tool_argv_changed", toolCallId);
    }
  }

  observeReverseViolation(code, message = null) {
    if (code === "duplicate_request_id"
      && message?.method === "session/request_permission"
      && isPlainObject(message.params)) {
      const rawToolCall = isPlainObject(message.params.toolCall) ? message.params.toolCall : message.params;
      const preliminary = extractToolCallId(rawToolCall, message.params);
      const existing = preliminary.toolCallId ? this.toolCalls.get(preliminary.toolCallId) : null;
      const {
        toolCallId, kind, identityReason, toolCallIdReason,
      } = extractToolCall(message.params, existing);
      const duplicateToolCallId = toolCallId ? this.permissionToolCallIds.has(toolCallId) : false;
      if (toolCallId) {
        this.permissionToolCallIds.add(toolCallId);
        const current = this.toolCalls.get(toolCallId) ?? createToolCallState(kind);
        current.permissionRequested = true;
        this.toolCalls.set(toolCallId, current);
      }
      this.decisions.push({
        requestId: String(message.id),
        toolCallId,
        kind,
        allowed: false,
        permissionId: null,
        reason: code,
        paths: [],
        argv: null,
      });
      this.violation(code, toolCallId);
      if (toolCallIdReason) this.violation(toolCallIdReason, null);
      else if (!toolCallId) this.violation("missing_tool_call_id", null);
      if (duplicateToolCallId) this.violation("reused_tool_call_id", toolCallId);
      if (identityReason) this.violation(identityReason, toolCallId);
      if (!kind) this.violation("unknown_tool_kind", toolCallId);
      return;
    }
    this.violation(code, null);
  }

  async decide(requestId, params) {
    const rawToolCall = isPlainObject(params?.toolCall) ? params.toolCall : params;
    const preliminary = extractToolCallId(rawToolCall, params);
    let currentBeforePermission = preliminary.toolCallId
      ? this.toolCalls.get(preliminary.toolCallId)
      : null;
    const identity = extractToolCall(params, currentBeforePermission);
    const {
      toolCall, toolCallId, kind,
    } = identity;
    const allowOnce = serverOption(params, "allow_once");
    const permissionStatus = extractPresentedToolStatus(toolCall, params);
    const requestKey = reverseRequestKey(requestId);
    const duplicateToolCallId = toolCallId ? this.permissionToolCallIds.has(toolCallId) : false;
    let permissionStateRevision = null;
    if (toolCallId && !duplicateToolCallId) this.permissionToolCallIds.add(toolCallId);
    if (toolCallId && !duplicateToolCallId) {
      currentBeforePermission ??= createToolCallState(kind);
      currentBeforePermission.permissionRequested = true;
      this.mergeIdentity(currentBeforePermission, identity, toolCallId);
      if (permissionStatus.reason) {
        this.violation(permissionStatus.reason, toolCallId);
      } else if (permissionStatus.status) {
        currentBeforePermission.statuses.push(permissionStatus.status);
        if (EXECUTION_STATUSES.has(permissionStatus.status)) {
          currentBeforePermission.executionBeforePermission = true;
          if (TERMINAL_TOOL_STATUSES.has(permissionStatus.status)) {
            currentBeforePermission.executionObserved = true;
            currentBeforePermission.terminalStatus = permissionStatus.status;
          }
          this.violation("execution_preceded_permission", toolCallId);
          this.violation("unapproved_tool_execution", toolCallId);
        } else if (TERMINAL_TOOL_STATUSES.has(permissionStatus.status)) {
          currentBeforePermission.terminalStatus = permissionStatus.status;
        }
      }
      this.toolCalls.set(toolCallId, currentBeforePermission);
      permissionStateRevision = currentBeforePermission.revision;
    }
    let allowed = false;
    let permissionId = null;
    let reason = "unknown_tool";
    let paths = [];
    let argv = null;

    if (!requestKey) {
      reason = "invalid_request_id";
    } else if (!this.isPromptActive()) {
      reason = "permission_outside_current_prompt";
    } else if (params?.sessionId !== this.getSessionId()) {
      reason = "permission_session_mismatch";
    } else if (identity.toolCallIdReason) {
      reason = identity.toolCallIdReason;
    } else if (!toolCallId) {
      reason = "missing_tool_call_id";
    } else if (duplicateToolCallId) {
      reason = "reused_tool_call_id";
    } else if (currentBeforePermission?.executionObserved || currentBeforePermission?.executionBeforePermission) {
      reason = "execution_preceded_permission";
    } else if (currentBeforePermission?.terminalStatus) {
      reason = "terminal_tool_call_reuse";
    } else if (identity.identityReason) {
      reason = identity.identityReason;
    } else if (permissionStatus.reason) {
      reason = permissionStatus.reason;
    } else if (!kind) {
      reason = "unknown_tool_kind";
    } else if (this.invalidToolCallIds.has(toolCallId)) {
      reason = "prior_tool_policy_violation";
    } else if (!allowOnce) {
      reason = "allow_once_unavailable";
    } else if (kind === "edit" || kind === "write") {
      const extractedPaths = extractRequestedPaths(toolCall, params);
      if (extractedPaths.reason) {
        reason = extractedPaths.reason;
      } else if (extractedPaths.paths.length === 0) {
        reason = "missing_write_path";
      } else {
        try {
          for (const candidate of extractedPaths.paths) {
            const resolved = await safeWorkspacePath(this.workspace, candidate);
            if (!pathIsAllowed(resolved.relative, this.task)) {
              throw new DelegateError("path_policy", "Write path is outside scope or protected");
            }
            paths.push(resolved.relative);
          }
          paths = [...new Set(paths)];
          for (const family of extractedPaths.families ?? []) {
            const projected = [];
            for (const candidate of family.values) {
              projected.push((await safeWorkspacePath(this.workspace, candidate)).relative);
            }
            if (new Set(projected).size > 1) {
              throw new DelegateError("ambiguous_path_carrier", "Permission path carriers disagree");
            }
          }
          if (currentBeforePermission.observedPaths
            && !sameStringSet(currentBeforePermission.observedPaths, paths)) {
            throw new DelegateError("tool_path_changed", "Permission path differs from the announced tool path");
          }
          allowed = true;
          permissionId = allowOnce.optionId;
          reason = "in_scope_allow_once";
        } catch (error) {
          reason = error instanceof DelegateError ? error.kind : "path_policy";
        }
      }
    } else if (kind === "bash") {
      const extracted = extractRequestedArgv(toolCall, params);
      argv = extracted.argv;
      const forbidden = extracted.reason ?? forbiddenArgvReason(argv);
      if (forbidden) {
        reason = forbidden;
      } else {
        const permission = matchShellPermission(argv, this.task.agent.shellPermissions);
        if (currentBeforePermission.observedArgv
          && stableJson(currentBeforePermission.observedArgv) !== stableJson(argv)) {
          reason = "tool_argv_changed";
        } else if (permission) {
          allowed = true;
          permissionId = allowOnce.optionId;
          reason = `matched:${permission.id}`;
        } else {
          reason = "argv_not_frozen";
        }
      }
    } else {
      reason = kind === "mcp" || kind === "web" ? `${kind}_forbidden` : "unknown_tool";
    }

    const stateAtGrant = toolCallId ? this.toolCalls.get(toolCallId) : null;
    if (allowed && (stateAtGrant?.executionObserved || stateAtGrant?.executionBeforePermission)) {
      allowed = false;
      permissionId = null;
      reason = "execution_preceded_permission";
    } else if (allowed && (
      !stateAtGrant
      || stateAtGrant.revision !== permissionStateRevision
      || stateAtGrant.kind !== kind
      || stateAtGrant.terminalStatus
      || this.invalidToolCallIds.has(toolCallId)
      || (["edit", "write"].includes(kind)
        && stateAtGrant.observedPaths
        && !sameStringSet(stateAtGrant.observedPaths, paths))
      || (kind === "bash"
        && stateAtGrant.observedArgv
        && stableJson(stateAtGrant.observedArgv) !== stableJson(argv))
    )) {
      allowed = false;
      permissionId = null;
      reason = "permission_state_changed";
    }

    const decision = {
      requestId: String(requestId),
      toolCallId,
      kind,
      allowed,
      permissionId,
      reason,
      paths,
      argv,
    };
    this.decisions.push(decision);
    if (toolCallId) {
      const current = this.toolCalls.get(toolCallId) ?? createToolCallState(kind);
      if (allowed) {
        current.allowed = true;
        current.permissionGranted = true;
        current.allowedPaths = [...new Set(paths)];
        current.argv = argv ? [...argv] : null;
        if (["edit", "write"].includes(current.kind)) current.observedPaths ??= [...current.allowedPaths];
        if (current.kind === "bash") current.observedArgv ??= current.argv ? [...current.argv] : null;
      } else {
        current.permissionRejected = true;
      }
      this.toolCalls.set(toolCallId, current);
    }
    if (!allowed) {
      this.violation(`permission_rejected:${reason}`, toolCallId);
      if ([
        "permission_outside_current_prompt",
        "permission_session_mismatch",
        "missing_tool_call_id",
        "reused_tool_call_id",
        "terminal_tool_call_reuse",
        "tool_kind_changed",
        "xai_tool_identity_mismatch",
        "unknown_xai_tool_identity",
        "incompatible_tool_identity",
        "prior_tool_policy_violation",
        "tool_path_changed",
        "tool_argv_changed",
        "invalid_request_id",
        "ambiguous_tool_kind",
        "ambiguous_argv",
        "shell_metacharacter",
        "unknown_argv_carrier",
        "unknown_tool_kind",
        "execution_preceded_permission",
        "permission_state_changed",
        "ambiguous_tool_call_id",
        "unknown_tool_status",
        "ambiguous_path_carrier",
        "unknown_path_carrier",
        "malformed_path_carrier",
        "unsupported_path_scheme",
      ].includes(reason)) this.violation(reason, toolCallId);
    }
    return allowed ? permissionSelected(permissionId) : permissionRejected(params);
  }

  observeTool(update, eventType = "tool_call_update") {
    const id = extractToolCallId(update, update);
    const toolCallId = id.toolCallId;
    const statusPresent = Object.hasOwn(update, "status") && update.status !== null;
    const status = statusPresent ? safeText(update.status, 128)?.toLowerCase() ?? null : null;
    const executionAttempt = status ? EXECUTION_STATUSES.has(status) : false;
    const terminal = status ? TERMINAL_TOOL_STATUSES.has(status) : false;
    if (id.reason) {
      this.violation(id.reason, null);
      if (executionAttempt || eventType === "tool_call") {
        this.violation("execution_missing_tool_call_id", null);
      }
      return "unknown";
    }
    if (!toolCallId) {
      if (executionAttempt || eventType === "tool_call") {
        this.violation("execution_missing_tool_call_id", null);
      }
      return "unknown";
    }
    const existing = this.toolCalls.get(toolCallId) ?? null;
    const identity = extractToolCall(update, existing);
    const current = existing ?? createToolCallState(identity.kind);
    current.revision += 1;
    if (statusPresent && (!status || !KNOWN_TOOL_STATUSES.has(status))) {
      this.violation("unknown_tool_status", toolCallId);
    }
    this.mergeIdentity(current, identity, toolCallId);
    if (["edit", "write"].includes(current.kind)) {
      this.mergeObservedPaths(current, extractRequestedPaths(update, update), toolCallId);
    } else if (current.kind === "bash") {
      this.mergeObservedArgv(
        current,
        extractRequestedArgv(update, update, { allowAbsent: true }),
        toolCallId,
      );
    }
    if (current.terminalStatus) {
      this.violation("reused_tool_call_id", toolCallId);
      this.toolCalls.set(toolCallId, current);
      return current.kind ?? "unknown";
    }
    if (eventType === "tool_call") {
      if (current.announced) this.violation("reused_tool_call_id", toolCallId);
      current.announced = true;
    }
    if (!existing && eventType === "tool_call_update") {
      this.violation("unknown_tool_call_id", toolCallId);
    }
    if (!current.kind && (identity.identityPresent || terminal || executionAttempt)) {
      this.violation("unknown_tool_kind", toolCallId);
    }

    const rejectedNonExecution = current.permissionRejected
      && ["failed", "cancelled", "canceled"].includes(status);
    if (executionAttempt && !rejectedNonExecution
      && ["edit", "write", "bash", "mcp", "web"].includes(current.kind ?? "unknown")) {
      if (!current.permissionGranted) {
        current.executionBeforePermission = true;
        this.violation("unapproved_tool_execution", toolCallId);
      }
    }
    if (terminal && !rejectedNonExecution && ["edit", "write", "bash"].includes(current.kind)) {
      current.executionObserved = true;
      if (!current.permissionGranted) {
        current.executionBeforePermission = true;
        this.violation("unapproved_tool_execution", toolCallId);
      } else if (["edit", "write"].includes(current.kind)) {
        if (!current.observedPaths || current.observedPaths.length === 0) {
          this.violation("missing_execution_path", toolCallId);
        } else if (!sameStringSet(current.observedPaths, current.allowedPaths)) {
          this.violation("tool_path_changed", toolCallId);
        } else if (!this.invalidToolCallIds.has(toolCallId)) {
          current.executedApprovedPaths = [...new Set([
            ...current.executedApprovedPaths,
            ...current.observedPaths,
          ])];
        }
      } else if (!current.observedArgv) {
        this.violation("unparsable_argv", toolCallId);
      } else if (!current.argv || stableJson(current.observedArgv) !== stableJson(current.argv)) {
        this.violation("tool_argv_changed", toolCallId);
      }
    }
    if (terminal && !current.kind) {
      this.violation("executed_unknown_tool", toolCallId);
      if (!rejectedNonExecution) this.violation("unapproved_tool_execution", toolCallId);
    }
    if (executionAttempt && current.kind === "unknown") {
      this.violation("executed_unknown_tool", toolCallId);
    }
    if (terminal && current.permissionGranted && ["edit", "write"].includes(current.kind)
      && (!current.observedPaths || current.observedPaths.length === 0)) {
        this.violation("missing_execution_path", toolCallId);
    }
    if (status) current.statuses.push(status);
    if (terminal) current.terminalStatus = status;
    this.toolCalls.set(toolCallId, current);
    return current.kind ?? "unknown";
  }

  observeMismatchedSession(update) {
    const id = extractToolCallId(update, update);
    if (id.reason) this.violation(id.reason, null);
    const status = safeText(update?.status, 128)?.toLowerCase() ?? null;
    if (status && !KNOWN_TOOL_STATUSES.has(status)) {
      this.violation("unknown_tool_status", id.toolCallId);
    }
    if (status && EXECUTION_STATUSES.has(status)) {
      this.violation("mismatched_session_execution", id.toolCallId);
    }
  }

  observeOutsidePrompt(update) {
    const id = extractToolCallId(update, update);
    if (id.reason) this.violation(id.reason, null);
    const status = safeText(update?.status, 128)?.toLowerCase() ?? null;
    if (status && !KNOWN_TOOL_STATUSES.has(status)) {
      this.violation("unknown_tool_status", id.toolCallId);
    }
    if (status && EXECUTION_STATUSES.has(status)) {
      this.violation("execution_outside_current_prompt", id.toolCallId);
    }
  }

  executedApprovedPaths() {
    const paths = [];
    for (const [toolCallId, call] of this.toolCalls) {
      if (!this.invalidToolCallIds.has(toolCallId)
        && call.permissionGranted
        && call.executionObserved
        && !call.executionBeforePermission
        && ["edit", "write"].includes(call.kind)) {
        paths.push(...call.executedApprovedPaths);
      }
    }
    return [...new Set(paths)];
  }

  finalize() {
    for (const [toolCallId, call] of this.toolCalls) {
      if (["edit", "write", "bash"].includes(call.kind)
        && call.permissionGranted
        && !call.terminalStatus) {
        this.violation("missing_terminal_status", toolCallId);
      }
      if (["edit", "write", "bash"].includes(call.kind)
        && (call.executionObserved || call.executionBeforePermission)
        && !call.allowed) {
        this.violation("unapproved_tool_execution", toolCallId);
      }
      if (["mcp", "web"].includes(call.kind) && (call.executionObserved || call.executionBeforePermission)) {
        this.violation("forbidden_tool_execution", toolCallId);
      }
    }
    return {
      decisions: this.decisions.map((decision) => ({
        kind: decision.kind ?? "unknown",
        allowed: decision.allowed,
        reason: this.redact(decision.reason),
        paths: decision.paths.map((item) => this.redact(item)),
        argv: decision.argv ? decision.argv.map((item) => this.redact(item)) : null,
      })),
      toolCallCount: this.toolCalls.size,
      allowedCount: this.decisions.filter((decision) => decision.allowed).length,
      rejectedCount: this.decisions.filter((decision) => !decision.allowed).length,
      violations: this.violations.map((violation) => ({ code: violation.code })),
    };
  }
}

function sanitizeUpdate(update, workspace, policy, redact) {
  if (!isPlainObject(update)) return null;
  if (update.sessionUpdate === "agent_message_chunk") {
    const text = publicText(update.content?.text, MAX_PUBLIC_TEXT, redact);
    return text ? { type: "message", text } : null;
  }
  if (update.sessionUpdate === "tool_call" || update.sessionUpdate === "tool_call_update") {
    const kind = policy.observeTool(update, update.sessionUpdate);
    const event = { type: "tool" };
    const status = publicText(update.status, 128, redact);
    if (kind) event.kind = kind;
    if (status) event.status = status;
    const rawLocations = Array.isArray(update.locations) ? update.locations : [];
    const paths = [];
    for (const location of rawLocations.slice(0, 32)) {
      const candidate = location?.path ?? location?.uri;
      if (typeof candidate !== "string") continue;
      const absolute = path.isAbsolute(candidate) ? path.normalize(candidate) : path.resolve(workspace, candidate);
      if (!isWithin(workspace, absolute)) continue;
      const relative = path.relative(workspace, absolute).split(path.sep).join("/") || ".";
      try {
        validateRepoRelative(relative, "tool location", { allowDot: true });
        paths.push(redact(relative));
      } catch { /* Drop unsafe locations. */ }
    }
    if (paths.length > 0) event.paths = [...new Set(paths)];
    return Object.keys(event).length > 1 ? event : null;
  }
  if (update.sessionUpdate === "plan" && Array.isArray(update.entries)) {
    const entries = update.entries.slice(0, 64).map((entry) => {
      const result = {};
      const content = publicText(entry?.content, 2_048, redact);
      const status = publicText(entry?.status, 128, redact);
      const priority = publicText(entry?.priority, 128, redact);
      if (content) result.content = content;
      if (status) result.status = status;
      if (priority) result.priority = priority;
      return result;
    }).filter((entry) => Object.keys(entry).length > 0);
    return entries.length > 0 ? { type: "plan", entries } : null;
  }
  if (update.sessionUpdate === "usage_update") {
    const event = { type: "usage" };
    for (const [key, value] of Object.entries(update)) {
      if (key !== "sessionUpdate" && typeof value === "number" && Number.isFinite(value)) event[key] = value;
    }
    return Object.keys(event).length > 1 ? event : null;
  }
  return null;
}

class AcpPeer {
  constructor(child, { onNotification, onReverseRequest, onReverseViolation }) {
    this.child = child;
    this.onNotification = onNotification;
    this.onReverseRequest = onReverseRequest;
    this.onReverseViolation = onReverseViolation;
    this.nextId = 1;
    this.pending = new Map();
    this.reverseInFlight = new Set();
    this.reverseRequestIds = new Set();
    this.inboundGeneration = 0;
    this.protocolActivityGeneration = 0;
    this.lastProtocolActivityAt = Date.now();
    this.quiescenceWaiters = new Set();
    this.fatal = null;
    this.exited = false;
    this.stderrBytes = 0;
    this.lines = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    child.stderr.on("data", (chunk) => { this.stderrBytes += Buffer.byteLength(chunk); });
    child.stdin.on("error", () => {
      if (!this.exited) this.fail(new DelegateError("transport", "Grok ACP stdin closed unexpectedly"));
    });
    this.exitPromise = new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        this.exited = true;
        this.wakeQuiescenceWaiters();
        const failure = this.fatal ?? result.error ?? new DelegateError("transport", "Grok ACP exited before request completion");
        for (const pending of this.pending.values()) pending.reject(failure);
        this.pending.clear();
        resolve(result);
      };
      child.once("error", () => finish({ code: null, signal: null, error: new DelegateError("spawn", "Could not start the Grok executable") }));
      child.once("close", (code, signal) => finish({ code, signal, error: null }));
    });
    this.lines.on("line", (line) => {
      this.noteProtocolActivity({ inbound: true });
      this.handleLine(line);
    });
    this.lines.on("close", () => {
      if (!this.exited && this.pending.size > 0) this.fail(new DelegateError("early_eof", "Grok ACP stdout closed early"));
    });
  }

  fail(error) {
    if (this.fatal) return;
    this.fatal = error;
    this.wakeQuiescenceWaiters();
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
  }

  wakeQuiescenceWaiters() {
    for (const wake of [...this.quiescenceWaiters]) wake();
  }

  noteProtocolActivity({ inbound = false } = {}) {
    if (inbound) this.inboundGeneration += 1;
    this.protocolActivityGeneration += 1;
    this.lastProtocolActivityAt = Date.now();
    this.wakeQuiescenceWaiters();
  }

  waitForProtocolActivity(generation, timeoutMs) {
    return new Promise((resolve) => {
      if (this.fatal || this.exited || this.protocolActivityGeneration !== generation) {
        resolve();
        return;
      }
      let settled = false;
      let timer;
      const finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.quiescenceWaiters.delete(finish);
        resolve();
      };
      this.quiescenceWaiters.add(finish);
      timer = setTimeout(finish, timeoutMs);
    });
  }

  async waitForInboundQuiescence() {
    while (!this.fatal && !this.exited) {
      const generation = this.protocolActivityGeneration;
      const elapsed = Date.now() - this.lastProtocolActivityAt;
      const remaining = Math.max(0, INBOUND_QUIET_MS - elapsed);
      if (remaining > 0) await this.waitForProtocolActivity(generation, remaining);
      else await new Promise((resolve) => setImmediate(resolve));
      if (this.fatal || this.exited) return;
      if (generation === this.protocolActivityGeneration
        && Date.now() - this.lastProtocolActivityAt >= INBOUND_QUIET_MS) return;
    }
  }

  async settleInboundAndReverse() {
    while (!this.fatal && !this.exited) {
      await this.waitForInboundQuiescence();
      if (this.fatal || this.exited) return;
      const generation = this.protocolActivityGeneration;
      const inboundGeneration = this.inboundGeneration;
      await this.drainReverse();
      if (this.fatal || this.exited) return;
      await new Promise((resolve) => setImmediate(resolve));
      if (generation === this.protocolActivityGeneration
        && inboundGeneration === this.inboundGeneration
        && this.reverseInFlight.size === 0) return;
    }
  }

  send(message) {
    if (this.exited || this.fatal || !this.child.stdin.writable) {
      throw this.fatal ?? new DelegateError("transport", "Grok ACP is not writable");
    }
    this.child.stdin.write(`${JSON.stringify(message)}\n`);
  }

  sendFlushed(message) {
    if (this.exited || this.fatal || !this.child.stdin.writable) {
      return Promise.reject(this.fatal ?? new DelegateError("transport", "Grok ACP is not writable"));
    }
    return new Promise((resolve, reject) => {
      this.child.stdin.write(`${JSON.stringify(message)}\n`, (error) => {
        if (error) reject(new DelegateError("transport", "Grok ACP write could not be flushed"));
        else {
          this.noteProtocolActivity();
          resolve();
        }
      });
    });
  }

  trackReverseWork(delivery) {
    let tracked;
    tracked = Promise.resolve(delivery)
      .catch(() => {
        this.fail(new DelegateError("transport", "A reverse ACP response could not be delivered"));
      })
      .finally(() => { this.reverseInFlight.delete(tracked); });
    this.reverseInFlight.add(tracked);
  }

  request(method, params, { beforeResolve = null } = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { method, resolve, reject, beforeResolve });
      try { this.send({ jsonrpc: "2.0", id, method, params }); }
      catch (error) { this.pending.delete(id); reject(error); }
    });
  }

  notify(method, params) {
    this.send({ jsonrpc: "2.0", method, params });
  }

  respond(id, result) {
    return this.sendFlushed({ jsonrpc: "2.0", id, result });
  }

  respondError(id, code, message) {
    return this.sendFlushed({ jsonrpc: "2.0", id, error: { code, message } });
  }

  handleLine(line) {
    if (line.trim().length === 0 || this.fatal) return;
    let message;
    try { message = JSON.parse(line); }
    catch { this.fail(new DelegateError("protocol", "Grok emitted malformed JSON-RPC")); return; }
    if (!isPlainObject(message) || message.jsonrpc !== "2.0") {
      this.fail(new DelegateError("protocol", "Grok emitted invalid JSON-RPC"));
      return;
    }
    if (Object.hasOwn(message, "id") && typeof message.method === "string") {
      const requestKey = reverseRequestKey(message.id);
      if (!requestKey) {
        this.onReverseViolation?.("invalid_request_id", message);
        this.trackReverseWork(this.respondError(message.id, -32600, "Invalid reverse request ID"));
        return;
      }
      if (this.reverseRequestIds.has(requestKey)) {
        this.onReverseViolation?.("duplicate_request_id", message);
        this.trackReverseWork(this.respondError(message.id, -32600, "Duplicate reverse request ID"));
        return;
      }
      this.reverseRequestIds.add(requestKey);
      const delivery = Promise.resolve()
        .then(() => this.onReverseRequest(message.method, message.params, message.id))
        .then((result) => {
          if (result?.__jsonRpcError) {
            return this.respondError(message.id, result.__jsonRpcError.code, result.__jsonRpcError.message);
          }
          return this.respond(message.id, result);
        }, () => this.respondError(message.id, -32603, "Client request handler failed"));
      this.trackReverseWork(delivery);
      return;
    }
    if (Object.hasOwn(message, "id")) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      try { pending.beforeResolve?.(); }
      catch {
        const error = new DelegateError("protocol", `${pending.method} response transition failed`);
        pending.reject(error);
        this.fail(error);
        return;
      }
      if (message.error) pending.reject(new DelegateError("rpc", `${pending.method} failed`));
      else pending.resolve(message.result);
      return;
    }
    if (typeof message.method === "string") this.onNotification(message.method, message.params);
  }

  async drainReverse() {
    while (this.reverseInFlight.size > 0) {
      await Promise.allSettled([...this.reverseInFlight]);
    }
    await new Promise((resolve) => setImmediate(resolve));
    while (this.reverseInFlight.size > 0) {
      await Promise.allSettled([...this.reverseInFlight]);
    }
  }

  async endAndDrain() {
    await this.settleInboundAndReverse();
    if (this.fatal) throw this.fatal;
    if (this.child.stdin.writable) {
      await new Promise((resolve, reject) => {
        this.child.stdin.end((error) => {
          if (error) reject(new DelegateError("transport", "Grok ACP stdin could not be flushed before close"));
          else resolve();
        });
      });
    }
    const result = await this.exitPromise;
    await this.drainReverse();
    if (this.fatal) throw this.fatal;
    if (result.code !== 0) throw new DelegateError("child_exit", "Grok ACP exited unsuccessfully");
    return { childReaped: true, stderrBytes: this.stderrBytes };
  }
}

function buildGrokArgs(task, workspace) {
  const args = [
    "--no-auto-update",
    "--cwd", workspace,
    "--permission-mode", "default",
    "--disable-web-search",
    "--deny", "MCPTool",
    "--deny", "WebFetch",
    "--deny", "WebSearch",
    "--deny", "Bash(git commit *)",
    "--deny", "Bash(git push *)",
    "--deny", "Bash(git reset *)",
    "--deny", "Bash(git stash *)",
    "--deny", "Bash(git checkout *)",
    "--deny", "Bash(git worktree *)",
    "--deny", "Bash(rm *)",
    "--deny", "Bash(curl *)",
    "--deny", "Bash(wget *)",
    "--no-subagents",
  ];
  if (task.agent.sandbox) args.push("--sandbox", task.agent.sandbox);
  if (task.agent.model) args.push("--model", task.agent.model);
  if (task.agent.reasoningEffort) args.push("--reasoning-effort", task.agent.reasoningEffort);
  args.push("agent", "--no-leader", "stdio");
  return args;
}

async function prepareGrokEnvironment(
  transactionDir,
  task,
  source,
  inheritedEnvBindingHash,
  expectedPathEnvironmentBindingHash,
) {
  if (inheritedEnvironmentBindingHash(task.agent.inheritEnv) !== inheritedEnvBindingHash) {
    throw new DelegateError("environment_binding", "Frozen inherited environment changed since transaction start");
  }
  if (pathEnvironmentBindingHash() !== expectedPathEnvironmentBindingHash) {
    throw new DelegateError("environment_binding", "Frozen PATH changed since transaction start");
  }
  const environment = coreEnvironment();
  for (const name of task.agent.inheritEnv) {
    if (Object.hasOwn(process.env, name)) environment[name] = process.env[name];
  }
  Object.assign(environment, GROK_DISABLE_ENV);
  const runtimeHome = task.agent.executionProfile === "hardened"
    ? path.join(transactionDir, "grok-home")
    : path.join(transactionDir, "runtime-home");
  const grokHome = path.join(transactionDir, "grok-home");
  const configHome = path.join(grokHome, "config");
  const cacheHome = path.join(grokHome, "cache");
  const dataHome = path.join(grokHome, "data");
  const stateHome = path.join(grokHome, "state");
  const temporary = path.join(grokHome, "tmp");
  for (const directory of [...new Set([runtimeHome, grokHome, configHome, cacheHome, dataHome, stateHome, temporary])]) {
    await ensureSecureDirectory(directory, transactionDir);
  }
  const config = [
    "[cli]",
    "use_leader = false",
    "auto_update = false",
    "",
    "[ui]",
    "permission_mode = \"ask\"",
    "default_selected_permission = \"allow_once\"",
    "remember_tool_approvals = false",
    "",
    "[permission]",
    "ask = [\"Edit\", \"Write\", \"Bash\"]",
    "deny = [",
    "  \"MCPTool(*)\",",
    "  \"WebFetch(*)\",",
    "  \"WebSearch(*)\",",
    "  \"Read(**/.env*)\",",
    "  \"Read(**/auth.json)\",",
    "  \"Read(**/*credential*)\",",
    "  \"Read(**/*secret*)\",",
    "  \"Read(**/*token*)\",",
    "  \"Grep(**/auth.json)\",",
    "  \"Bash(rm *)\",",
    "  \"Bash(git commit *)\",",
    "  \"Bash(git push *)\",",
    "  \"Bash(git reset *)\",",
    "  \"Bash(git stash *)\",",
    "  \"Bash(git checkout *)\",",
    "  \"Bash(git worktree *)\",",
    "  \"Bash(curl *)\",",
    "  \"Bash(wget *)\",",
    "]",
    "",
  ].join("\n");
  await ensureSecureStaticFile(path.join(grokHome, "config.toml"), config, transactionDir);
  environment.HOME = runtimeHome;
  environment.GROK_HOME = grokHome;
  environment.XDG_CONFIG_HOME = configHome;
  environment.XDG_CACHE_HOME = cacheHome;
  environment.XDG_DATA_HOME = dataHome;
  environment.XDG_STATE_HOME = stateHome;
  environment.TMPDIR = temporary;
  environment.TMP = temporary;
  environment.TEMP = temporary;

  let authSource = null;
  if (task.agent.executionProfile === "trusted_local" && !environment.XAI_API_KEY) {
    const protectedRoots = [
      path.dirname(transactionDir),
      source?.root,
      source?.gitDir,
      source?.commonGitDir,
    ].filter(Boolean);
    authSource = {
      ...await inspectCachedAuthSource(configuredCachedAuthPath(), protectedRoots),
      protectedRoots,
    };
    environment.GROK_AUTH_PATH = authSource.path;
  }
  return { environment, authSource };
}

function authMethodIds(initializeResult) {
  const methods = Array.isArray(initializeResult?.authMethods) ? initializeResult.authMethods : [];
  return methods.map((method) => typeof method === "string" ? method : method?.id).filter((item) => typeof item === "string");
}

function chooseAuthMethod(initializeResult, task, environment) {
  const methods = authMethodIds(initializeResult);
  if (environment.XAI_API_KEY && methods.includes("xai.api_key")) return "xai.api_key";
  if (task.agent.executionProfile === "trusted_local" && methods.includes("cached_token")) return "cached_token";
  throw new DelegateError("authentication", "No permitted non-interactive Grok authentication method is available");
}

function supportsSessionLoad(initializeResult) {
  return initializeResult?.agentCapabilities?.loadSession === true;
}

function canonicalPrompt(task, { round, feedback = null, previousEvidence = [] }) {
  const executorTask = structuredClone(task);
  executorTask.repository.path = ".";
  const reportContract = {
    schemaVersion: 1,
    summary: "bounded summary",
    changes: [{ path: "repo-relative path", description: "what changed" }],
    verificationNotes: ["non-authoritative observation"],
    risks: ["known risk"],
    residue: [{ id: "human-owned item", status: "pending_human_review", note: "why" }],
  };
  const payload = {
    role: {
      codex: "task author and auditor",
      grokBuild: "executor in an isolated transaction clone",
    },
    round,
    frozenTask: executorTask,
    repositoryPath: "Source path redacted; . means the transaction workspace.",
    continuation: feedback ? { callerFeedback: feedback.feedback, priorMechanicalEvidence: previousEvidence } : null,
    absoluteProhibitions: [
      "Do not commit, push, stash, reset, create/switch branches, checkout another revision, or create worktrees.",
      "Do not use network, web, MCP, subagents, install dependencies, or cause external side effects.",
      "Do not read secrets or files outside the transaction workspace.",
      "Use only the frozen write scope and tokenized shell permissions. Ask permission for every edit/write/bash action.",
      "Do not weaken tests, alter expected values to fit an implementation, suppress errors, add race-hiding sleeps/retries, hardcode only fixtures, broaden permissions, or make unrelated changes.",
    ],
    completion: {
      instruction: "Implement the frozen task, then emit only the structured JSON self-report. It is a claim, not verification evidence.",
      reportContract,
    },
  };
  return [
    "Execute this frozen delegation contract. The JSON below is canonical and immutable.",
    JSON.stringify(payload, null, 2),
  ].join("\n\n");
}

function sanitizeAgentReport(text, redact) {
  const fallback = {
    authoritative: false,
    structured: false,
    summary: publicText(text, MAX_PUBLIC_TEXT, redact) ?? "",
    changes: [],
    verificationNotes: [],
    risks: [],
    residue: [],
  };
  let value;
  try { value = JSON.parse(text.trim()); } catch { return fallback; }
  if (!isPlainObject(value)) return fallback;
  const report = {
    authoritative: false,
    structured: value.schemaVersion === 1,
    summary: publicText(value.summary, MAX_PUBLIC_TEXT, redact) ?? "",
    changes: [],
    verificationNotes: [],
    risks: [],
    residue: [],
  };
  if (Array.isArray(value.changes)) {
    for (const item of value.changes.slice(0, 128)) {
      if (!isPlainObject(item)) continue;
      try {
        const reportPath = validateRepoRelative(item.path, "agent report path", { allowDot: false });
        const description = publicText(item.description, 4_096, redact);
        if (description) report.changes.push({ path: redact(reportPath), description });
      } catch { /* Suppress malformed paths. */ }
    }
  }
  for (const [sourceKey, targetKey] of [["verificationNotes", "verificationNotes"], ["risks", "risks"]]) {
    if (Array.isArray(value[sourceKey])) {
      report[targetKey] = value[sourceKey].slice(0, 128).map((item) => publicText(item, 4_096, redact)).filter(Boolean);
    }
  }
  if (Array.isArray(value.residue)) {
    report.residue = value.residue.slice(0, 128).map((item) => {
      if (!isPlainObject(item)) return null;
      const id = publicText(item.id, 256, redact);
      const note = publicText(item.note, 4_096, redact);
      if (!id || !note) return null;
      return { id, status: "pending_human_review", note };
    }).filter(Boolean);
  }
  return report;
}

async function stopAcp(peer, sessionId, graceMs) {
  const outcome = { cancelSent: false, childReaped: false };
  if (!peer) return outcome;
  await peer.drainReverse();
  if (!peer.exited && sessionId && peer.child.stdin.writable) {
    try {
      peer.notify("session/cancel", { sessionId });
      outcome.cancelSent = true;
    } catch { /* Continue to termination. */ }
  }
  if (!peer.exited) await Promise.race([peer.exitPromise, wait(graceMs)]);
  if (!peer.exited) killChild(peer.child, "SIGTERM");
  if (!peer.exited) await Promise.race([peer.exitPromise, wait(Math.min(graceMs, TERMINATION_POLL_MS))]);
  if (!peer.exited) killChild(peer.child, "SIGKILL");
  if (!peer.exited) await Promise.race([peer.exitPromise, wait(TERMINATION_POLL_MS)]);
  await peer.drainReverse();
  outcome.childReaped = peer.exited;
  return outcome;
}

async function runAcpRound({
  options,
  transactionDir,
  workspace,
  manifest,
  writer,
  feedback,
  previousEvidence,
}) {
  const task = manifest.task;
  const preparedEnvironment = await prepareGrokEnvironment(
    transactionDir,
    task,
    manifest.source,
    manifest.inheritedEnvBindingHash,
    manifest.pathEnvironmentBindingHash,
  );
  const { environment, authSource } = preparedEnvironment;
  const privateLocations = [
    transactionDir,
    workspace,
    manifest.source.root,
    manifest.source.gitDir,
    manifest.source.commonGitDir,
    environment.HOME,
    environment.GROK_HOME,
    environment.XDG_CONFIG_HOME,
    environment.XDG_CACHE_HOME,
    environment.XDG_DATA_HOME,
    environment.XDG_STATE_HOME,
    environment.GROK_AUTH_PATH,
    manifest.sessionId,
  ];
  const redact = buildExactValueRedactor(environment, task.agent.inheritEnv, [
    ...privateLocations,
    ...(authSource?.secretValues ?? []),
    ...privateLocations
      .filter((value) => typeof value === "string" && path.isAbsolute(value))
      .map((value) => pathToFileURL(value).href),
  ]);
  const state = {
    sessionId: manifest.sessionId,
    capture: false,
    textParts: [],
    textBytes: 0,
    outputLimit: false,
    eventCount: 0,
    promptStarted: false,
  };
  const pendingEvents = [];
  const emitEvent = (event) => {
    if (authSource) pendingEvents.push(event);
    else writer.event(event);
  };
  let redactionComplete = !authSource;
  const assertAuthSourceUnchanged = async () => {
    if (!authSource) return;
    let after;
    try {
      after = await inspectCachedAuthSource(
        authSource.path,
        authSource.protectedRoots,
        "auth_source_mutation",
      );
    } catch (error) {
      redactionComplete = false;
      throw error;
    }
    redact.add(after.secretValues);
    redactionComplete = true;
    if (stableJson(after.fingerprint) !== stableJson(authSource.fingerprint)) {
      throw new DelegateError("auth_source_mutation", "Cached Grok auth source changed during the delegated round");
    }
  };
  const policy = new PermissionPolicy({
    workspace,
    task,
    getSessionId: () => state.sessionId,
    isPromptActive: () => state.capture,
    redact,
  });
  let child;
  try {
    child = spawn(options.grokBin, buildGrokArgs(task, workspace), {
      cwd: workspace,
      env: environment,
      shell: false,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    throw new DelegateError("spawn", "Could not start the Grok executable");
  }
  let peer;
  peer = new AcpPeer(child, {
    onNotification(method, params) {
      if (method !== "session/update") return;
      if (params?.sessionId !== state.sessionId) {
        policy.observeMismatchedSession(params?.update);
        return;
      }
      if (!state.capture) {
        policy.observeOutsidePrompt(params?.update);
        return;
      }
      if (params?.update?.sessionUpdate === "agent_message_chunk") {
        const rawText = params.update?.content?.text;
        if (typeof rawText !== "string") return;
        state.eventCount += 1;
        const bytes = Buffer.byteLength(rawText, "utf8");
        if (state.textBytes + bytes <= Math.min(MAX_PUBLIC_TEXT, task.limits.maxArtifactBytes)) {
          state.textParts.push(rawText);
          state.textBytes += bytes;
        } else {
          state.outputLimit = true;
        }
        return;
      }
      const event = sanitizeUpdate(params?.update, workspace, policy, redact);
      if (!event) return;
      state.eventCount += 1;
      emitEvent({ transactionId: manifest.transactionId, round: manifest.round, ...event });
    },
    async onReverseRequest(method, params, requestId) {
      if (method !== "session/request_permission") {
        return { __jsonRpcError: { code: -32601, message: "Method not found" } };
      }
      return policy.decide(requestId, params);
    },
    onReverseViolation(code, message) {
      policy.observeReverseViolation(code, message);
    },
  });

  const runtime = { peer, state };
  const execute = async () => {
    const initializeResult = await peer.request("initialize", {
      protocolVersion: PROTOCOL_VERSION,
      clientCapabilities: {
        fs: { readTextFile: false, writeTextFile: false },
        terminal: false,
      },
      clientInfo: { name: NAME, version: VERSION },
      _meta: { clientType: NAME, clientVersion: VERSION },
    });
    if (initializeResult?.protocolVersion !== PROTOCOL_VERSION) {
      throw new DelegateError("protocol", "Grok selected an unsupported ACP protocol version");
    }
    const authMethod = chooseAuthMethod(initializeResult, task, environment);
    await peer.request("authenticate", { methodId: authMethod, _meta: { headless: true } });
    const sessionMeta = { yoloMode: false, autoMode: false, askUserQuestion: false };
    if (manifest.sessionId) {
      if (!supportsSessionLoad(initializeResult)) throw new DelegateError("session", "Grok ACP does not support session/load");
      await peer.request("session/load", {
        sessionId: manifest.sessionId,
        cwd: workspace,
        mcpServers: [],
        _meta: sessionMeta,
      });
    } else {
      const created = await peer.request("session/new", {
        cwd: workspace,
        mcpServers: [],
        _meta: sessionMeta,
      });
      if (typeof created?.sessionId !== "string" || created.sessionId.length === 0 || /[\r\n\0]/.test(created.sessionId)) {
        throw new DelegateError("protocol", "session/new did not return a safe session ID");
      }
      manifest.sessionId = created.sessionId;
      manifest.sessionBindingHash = sha256(`${manifest.transactionId}\0${created.sessionId}`);
      state.sessionId = created.sessionId;
      redact.add(created.sessionId);
      await saveManifest(transactionDir, manifest);
    }
    state.promptStarted = true;
    state.capture = true;
    const promptPromise = peer.request("session/prompt", {
      sessionId: state.sessionId,
      prompt: [{
        type: "text",
        text: canonicalPrompt(task, { round: manifest.round, feedback, previousEvidence }),
      }],
    }, { beforeResolve: () => { state.capture = false; } });
    const promptResult = await promptPromise;
    const drain = await peer.endAndDrain();
    const permissionAudit = policy.finalize();
    const executedApprovedPaths = policy.executedApprovedPaths();
    if (state.outputLimit) permissionAudit.violations.push({ code: "agent_output_limit" });
    const joinedText = state.outputLimit ? "" : state.textParts.join("");
    const turnMessage = publicText(
      joinedText,
      Math.min(MAX_PUBLIC_TEXT, task.limits.maxArtifactBytes),
      redact,
    );
    if (turnMessage) {
      emitEvent({
        transactionId: manifest.transactionId,
        round: manifest.round,
        type: "message",
        text: turnMessage,
      });
    }
    return {
      completed: true,
      stopReason: publicText(promptResult?.stopReason, 128, redact),
      eventCount: state.eventCount,
      agentReport: sanitizeAgentReport(joinedText, redact),
      permissionAudit,
      executedApprovedPaths,
      redact,
      childReaped: drain.childReaped,
      cancelSent: false,
    };
  };

  let timeout;
  let interruptHandler;
  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new DelegateError("timeout", "Grok ACP round timed out", 124)), task.agent.timeoutMs);
  });
  const interruptPromise = new Promise((_, reject) => {
    interruptHandler = () => reject(new DelegateError("interrupted", "Grok ACP round was interrupted", 130));
    process.once("SIGINT", interruptHandler);
  });
  try {
    const outcome = await Promise.race([execute(), timeoutPromise, interruptPromise]);
    await assertAuthSourceUnchanged();
    for (const event of pendingEvents) writer.event(event);
    outcome.redactionComplete = redactionComplete;
    return outcome;
  } catch (error) {
    runtime.state.capture = false;
    const grace = task.agent.cancelGraceMs ?? DEFAULT_CANCEL_GRACE_MS;
    const termination = await stopAcp(runtime.peer, runtime.state.sessionId, grace);
    let normalized = error instanceof DelegateError ? error : new DelegateError("acp", "Grok ACP round failed");
    try { await assertAuthSourceUnchanged(); }
    catch (authError) { normalized = authError; }
    const finalizedAudit = policy.finalize();
    const permissionAudit = redactionComplete
      ? finalizedAudit
      : suppressDynamicPermissionAudit(finalizedAudit);
    normalized.details = {
      ...(isPlainObject(normalized.details) ? normalized.details : {}),
      ...termination,
      permissionAudit,
      executedApprovedPaths: redactionComplete ? policy.executedApprovedPaths() : [],
      redact,
      redactionComplete,
    };
    throw normalized;
  } finally {
    clearTimeout(timeout);
    process.removeListener("SIGINT", interruptHandler);
  }
}

async function verifierEnvironment(transactionDir) {
  const home = path.join(transactionDir, "verifier-home");
  const temporary = path.join(transactionDir, "verifier-tmp");
  for (const directory of [
    home,
    temporary,
    path.join(home, "config"),
    path.join(home, "cache"),
    path.join(home, "data"),
    path.join(home, "state"),
  ]) await ensureSecureDirectory(directory, transactionDir);
  return {
    ...coreEnvironment(),
    HOME: home,
    XDG_CONFIG_HOME: path.join(home, "config"),
    XDG_CACHE_HOME: path.join(home, "cache"),
    XDG_DATA_HOME: path.join(home, "data"),
    XDG_STATE_HOME: path.join(home, "state"),
    TMPDIR: temporary,
    TMP: temporary,
    TEMP: temporary,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_TERMINAL_PROMPT: "0",
    GIT_OPTIONAL_LOCKS: "0",
  };
}

async function writeVerifierArtifact(transactionDir, round, verifierId, streamName, captured, maximum) {
  const artifactDir = path.join(transactionDir, "artifacts", `round-${round}`, "verifiers");
  await ensureSecureDirectory(artifactDir, transactionDir);
  const safeId = sha256(verifierId).slice(0, 16);
  const fileName = `${safeId}.${streamName}`;
  const filePath = path.join(artifactDir, fileName);
  const buffer = streamName === "stdout" ? captured.stdout : captured.stderr;
  const totalBytes = streamName === "stdout" ? captured.stdoutBytes : captured.stderrBytes;
  const digest = streamName === "stdout" ? captured.stdoutHash : captured.stderrHash;
  const stored = buffer.subarray(0, maximum);
  await writeSecureFile(filePath, stored, transactionDir);
  return {
    path: path.relative(transactionDir, filePath).split(path.sep).join("/"),
    sha256: digest,
    sizeBytes: totalBytes,
    storedBytes: stored.length,
    truncated: totalBytes > stored.length,
  };
}

async function candidateContentFingerprint({ transactionDir, workspace, baseOid, infrastructure }) {
  await assertWorkspaceHead(workspace, baseOid, infrastructure);
  const realIndexPath = path.join(workspace, ".git", "index");
  const realIndexBefore = await hashFile(realIndexPath);
  const temporaryIndex = path.join(transactionDir, `fingerprint-index-${randomUUID()}`);
  const environment = { GIT_INDEX_FILE: temporaryIndex };
  try {
    await runGit(workspace, ["read-tree", baseOid], { env: environment });
    await runGit(workspace, ["add", "--all", "--force", "--", "."], { env: environment });
    const tree = await gitText(workspace, ["write-tree"], { env: environment });
    const status = await repositoryFingerprint(workspace);
    const realIndexAfter = await hashFile(realIndexPath);
    if (stableJson(realIndexBefore) !== stableJson(realIndexAfter)) {
      throw new DelegateError("workspace_integrity", "Content fingerprint changed the real candidate index");
    }
    return { tree, statusHash: status.sha256, statusBytes: status.bytes };
  } finally {
    for (const target of [temporaryIndex, `${temporaryIndex}.lock`]) {
      try { await unlink(target); } catch (error) { if (error?.code !== "ENOENT") throw error; }
    }
  }
}

function verifierSandboxProfile() {
  return [
    "(version 1)",
    "(deny default)",
    "(import \"system.sb\")",
    "(allow file-read*)",
    "(allow file-test-existence)",
    "(allow file-map-executable)",
    "(allow process-fork)",
    "(allow process-exec*)",
    "(allow process-info* (target self))",
    "(allow process-info* (target children))",
    "(allow signal (target self))",
    "(allow signal (target children))",
    "(allow sysctl-read)",
    "(allow ipc-posix-shm)",
    "(deny network*)",
    "(deny system-socket)",
    "(deny mach-lookup)",
    "(deny mach-register)",
    "(deny sysctl-write)",
    "(deny file-write*)",
    "(deny file-link)",
    "(allow file-write-data (literal \"/dev/null\"))",
    "(allow file-write*",
    "  (subpath (param \"WORKSPACE\"))",
    "  (subpath (param \"VERIFIER_HOME\"))",
    "  (subpath (param \"VERIFIER_TMP\")))",
    "(deny file-write* (subpath (param \"SOURCE_ROOT\")))",
    "(deny file-write* (subpath (param \"SOURCE_GIT_DIR\")))",
    "(deny file-write* (subpath (param \"SOURCE_COMMON_GIT_DIR\")))",
    "(deny file-write* (subpath (param \"WORKSPACE_GIT_DIR\")))",
    "",
  ].join("\n");
}

const verifiedSandboxProfiles = new Set();

function sandboxDefinitionArgs(binding) {
  return [
    "-D", `WORKSPACE=${binding.workspace}`,
    "-D", `VERIFIER_HOME=${binding.verifierHome}`,
    "-D", `VERIFIER_TMP=${binding.verifierTmp}`,
    "-D", `SOURCE_ROOT=${binding.source.root}`,
    "-D", `SOURCE_GIT_DIR=${binding.source.gitDir}`,
    "-D", `SOURCE_COMMON_GIT_DIR=${binding.source.commonGitDir}`,
    "-D", `WORKSPACE_GIT_DIR=${path.join(binding.workspace, ".git")}`,
  ];
}

async function prepareVerifierSandbox(transactionDir, task, source, workspace) {
  if (task.agent.executionProfile !== "hardened") return null;
  if (process.platform !== "darwin") {
    throw new DelegateError("verifier_sandbox", "Hardened verification is unsupported on this operating system");
  }
  const executable = "/usr/bin/sandbox-exec";
  try { await access(executable, fsConstants.X_OK); }
  catch { throw new DelegateError("verifier_sandbox", "macOS sandbox-exec is unavailable for hardened verification"); }
  const verifierHome = path.join(transactionDir, "verifier-home");
  const verifierTmp = path.join(transactionDir, "verifier-tmp");
  await verifierEnvironment(transactionDir);
  const binding = { executable, workspace, verifierHome, verifierTmp, source };
  const profilePath = path.join(transactionDir, "verifier-sandbox.sb");
  await ensureSecureStaticFile(profilePath, verifierSandboxProfile(), transactionDir);
  binding.profilePath = profilePath;
  if (!verifiedSandboxProfiles.has(profilePath)) {
    const nonce = randomUUID();
    const workspaceProbe = path.join(workspace, `.verifier-allowed-${nonce}`);
    const homeProbe = path.join(verifierHome, `allowed-${nonce}`);
    const temporaryProbe = path.join(verifierTmp, `allowed-${nonce}`);
    const receipt = path.join(verifierTmp, `receipt-${nonce}`);
    const transactionProbe = path.join(transactionDir, `denied-${nonce}`);
    const sourceProbe = path.join(source.root, `.verifier-denied-${nonce}`);
    const sourceGitProbe = path.join(source.gitDir, `verifier-denied-${nonce}`);
    const candidateGitProbe = path.join(workspace, ".git", `verifier-denied-${nonce}`);
    const symlinkPath = path.join(workspace, `.verifier-link-${nonce}`);
    const symlinkEscapeProbe = path.join(transactionDir, `link-denied-${nonce}`);
    const hardlinkProbe = path.join(workspace, `.verifier-hardlink-${nonce}`);
    const workspaceBefore = await sourceFilesystemFingerprint(workspace, [path.join(workspace, ".git")]);
    const workspaceGitBefore = {
      head: await hashFile(path.join(workspace, ".git", "HEAD")),
      index: await hashFile(path.join(workspace, ".git", "index")),
      config: await optionalFileFingerprint(path.join(workspace, ".git", "config")),
    };
    try { await symlink(transactionDir, symlinkPath); }
    catch { throw new DelegateError("verifier_sandbox", "Hardened verifier symlink probe could not be prepared"); }
    const probeScript = [
      "const fs=require('node:fs');",
      "const dgram=require('node:dgram');",
      "const a=process.argv.slice(1);let failed=false;",
      "for(const p of a.slice(0,3)){try{fs.writeFileSync(p,'allowed',{flag:'wx'});if(fs.readFileSync(p,'utf8')!=='allowed')failed=true;fs.unlinkSync(p);}catch{failed=true;}}",
      "for(const p of a.slice(4,9)){let denied=false;try{fs.writeFileSync(p,'denied',{flag:'wx'});}catch{denied=true;}if(!denied)failed=true;}",
      "let linkDenied=false;try{fs.linkSync(a[9],a[10]);}catch{linkDenied=true;}if(!linkDenied)failed=true;",
      "const networkDenied=await new Promise((resolve)=>{const s=dgram.createSocket('udp4');let done=false;const end=(v)=>{if(done)return;done=true;try{s.close();}catch{}resolve(v);};s.once('error',()=>end(true));try{s.bind(0,'127.0.0.1',()=>end(false));}catch{end(true);}setTimeout(()=>end(false),1000);});",
      "if(!networkDenied)failed=true;",
      "if(failed)process.exit(73);fs.writeFileSync(a[3],'verified',{flag:'wx'});",
    ].join("");
    const probe = await spawnCaptured(executable, [
      ...sandboxDefinitionArgs(binding),
      "-f", profilePath,
      process.execPath, "--input-type=commonjs", "-e", `(async()=>{${probeScript}})().catch(()=>process.exit(74))`,
      workspaceProbe,
      homeProbe,
      temporaryProbe,
      receipt,
      transactionProbe,
      sourceProbe,
      sourceGitProbe,
      candidateGitProbe,
      path.join(symlinkPath, path.basename(symlinkEscapeProbe)),
      path.join(source.gitDir, "HEAD"),
      hardlinkProbe,
    ], {
      cwd: transactionDir,
      env: await verifierEnvironment(transactionDir),
      timeoutMs: 10_000,
      maxBytes: 8_192,
    });
    let receiptContents = null;
    try { receiptContents = await readFile(receipt, "utf8"); } catch { /* Probe failed. */ }
    let deniedExists = false;
    const cleanupTargets = [
      workspaceProbe, homeProbe, temporaryProbe, receipt,
      transactionProbe, sourceProbe, sourceGitProbe, candidateGitProbe,
      symlinkEscapeProbe, hardlinkProbe, symlinkPath,
    ];
    for (const target of cleanupTargets) {
      try { await lstat(target); if (![receipt, symlinkPath].includes(target)) deniedExists = true; }
      catch { /* Expected absence. */ }
    }
    for (const target of cleanupTargets) {
      try { await unlink(target); } catch (error) { if (error?.code !== "ENOENT") throw error; }
    }
    let sourceUnchanged = true;
    try { await assertSourceUnchangedSinceStart(source); } catch { sourceUnchanged = false; }
    const workspaceAfter = await sourceFilesystemFingerprint(workspace, [path.join(workspace, ".git")]);
    const workspaceGitAfter = {
      head: await hashFile(path.join(workspace, ".git", "HEAD")),
      index: await hashFile(path.join(workspace, ".git", "index")),
      config: await optionalFileFingerprint(path.join(workspace, ".git", "config")),
    };
    if (!probe.spawned || probe.timedOut || probe.code !== 0 || receiptContents !== "verified" || deniedExists
      || !sourceUnchanged || stableJson(workspaceBefore) !== stableJson(workspaceAfter)
      || stableJson(workspaceGitBefore) !== stableJson(workspaceGitAfter)) {
      throw new DelegateError("verifier_sandbox", "Hardened verifier sandbox could not be established");
    }
    verifiedSandboxProfiles.add(profilePath);
  }
  return binding;
}

async function runVerifier({ transactionDir, workspace, task, command, round, source, infrastructure }) {
  let cwd;
  try {
    cwd = (await safeWorkspacePath(workspace, command.cwd, { mustExist: true })).absolute;
    const cwdInfo = await stat(cwd);
    if (!cwdInfo.isDirectory()) throw new DelegateError("verification_cwd", "Verifier cwd is not a directory");
  } catch {
    return {
      id: command.id,
      required: command.required,
      status: "not_run",
      exitCode: null,
      signal: null,
      durationMs: 0,
      mutatedWorkspace: false,
      artifacts: null,
      error: "unsafe_or_missing_cwd",
    };
  }
  const before = await candidateContentFingerprint({
    transactionDir,
    workspace,
    baseOid: source.baseOid,
    infrastructure,
  });
  const sandboxBinding = await prepareVerifierSandbox(transactionDir, task, source, workspace);
  const executable = sandboxBinding ? sandboxBinding.executable : command.argv[0];
  const argv = sandboxBinding
    ? [...sandboxDefinitionArgs(sandboxBinding), "-f", sandboxBinding.profilePath, command.argv[0], ...command.argv.slice(1)]
    : command.argv.slice(1);
  const captured = await spawnCaptured(executable, argv, {
    cwd,
    env: await verifierEnvironment(transactionDir),
    timeoutMs: command.timeoutMs,
    maxBytes: task.limits.maxArtifactBytes,
  });
  const after = await candidateContentFingerprint({
    transactionDir,
    workspace,
    baseOid: source.baseOid,
    infrastructure,
  });
  const stdout = await writeVerifierArtifact(transactionDir, round, command.id, "stdout", captured, task.limits.maxArtifactBytes);
  const stderr = await writeVerifierArtifact(transactionDir, round, command.id, "stderr", captured, task.limits.maxArtifactBytes);
  let statusName;
  if (captured.timedOut) statusName = "timed_out";
  else if (!captured.spawned) statusName = "failed";
  else statusName = captured.code === 0 ? "passed" : "failed";
  return {
    id: command.id,
    required: command.required,
    status: statusName,
    exitCode: captured.code,
    signal: captured.signal,
    durationMs: captured.durationMs,
    mutatedWorkspace: before.tree !== after.tree || before.statusHash !== after.statusHash,
    artifacts: { stdout, stderr },
    error: captured.spawned ? null : "spawn_failed",
  };
}

function parseRawDiff(buffer) {
  const fields = buffer.toString("utf8").split("\0");
  if (fields.at(-1) === "") fields.pop();
  const changes = [];
  for (let index = 0; index < fields.length;) {
    const header = fields[index++];
    const match = /^:(\d{6}) (\d{6}) ([0-9a-f]+) ([0-9a-f]+) ([A-Z])(\d*)$/.exec(header);
    if (!match) throw new DelegateError("diff_parse", "Could not parse candidate diff metadata");
    const [, oldMode, newMode, , , statusCode, score] = match;
    const firstPath = fields[index++];
    if (firstPath === undefined) throw new DelegateError("diff_parse", "Candidate diff path is missing");
    let oldPath = null;
    let newPath = null;
    if (statusCode === "R" || statusCode === "C") {
      oldPath = firstPath;
      newPath = fields[index++];
      if (newPath === undefined) throw new DelegateError("diff_parse", "Candidate rename path is missing");
    } else if (statusCode === "D") {
      oldPath = firstPath;
    } else {
      newPath = firstPath;
      if (statusCode === "M" || statusCode === "T" || statusCode === "U") oldPath = firstPath;
    }
    changes.push({
      status: statusCode,
      score: score ? Number(score) : null,
      oldPath,
      newPath,
      oldMode,
      newMode,
      binary: false,
    });
  }
  return changes;
}

async function changedPathsBetweenTrees(workspace, beforeTree, afterTree) {
  if (beforeTree === afterTree) return [];
  const raw = await runGit(workspace, [
    "diff", "--raw", "-z", "--find-renames", "--no-ext-diff", beforeTree, afterTree, "--",
  ]);
  const paths = [];
  for (const change of parseRawDiff(raw)) {
    for (const candidate of [change.oldPath, change.newPath].filter(Boolean)) {
      validateRepoRelative(candidate, "round changed path");
      paths.push(candidate);
    }
  }
  return [...new Set(paths)].sort();
}

function parseNumstat(buffer) {
  const fields = buffer.toString("utf8").split("\0");
  if (fields.at(-1) === "") fields.pop();
  const binaryPaths = new Set();
  for (let index = 0; index < fields.length;) {
    const header = fields[index++];
    const match = /^([^\t]+)\t([^\t]+)\t(.*)$/.exec(header);
    if (!match) continue;
    const [, added, deleted, pathField] = match;
    let candidatePath = pathField;
    if (pathField === "") {
      index += 1;
      candidatePath = fields[index++];
    }
    if (added === "-" && deleted === "-" && candidatePath !== undefined) binaryPaths.add(candidatePath);
  }
  return binaryPaths;
}

async function validateChangedPath(workspace, relative, task) {
  validateRepoRelative(relative, "changed path");
  if (!pathIsAllowed(relative, task)) throw new DelegateError("scope_violation", "Candidate contains an out-of-scope or protected path");
  const absolute = path.join(workspace, ...relative.split("/"));
  try {
    const info = await lstat(absolute);
    if (info.isSymbolicLink()) throw new DelegateError("symlink_ambiguity", "Candidate changed path is a symbolic link");
    await safeWorkspacePath(workspace, absolute, { mustExist: true });
  } catch (error) {
    if (error instanceof DelegateError) throw error;
    if (error?.code !== "ENOENT") throw new DelegateError("symlink_ambiguity", "Candidate changed path cannot be resolved safely");
  }
}

async function stageAndBuildPatch({
  transactionDir,
  workspace,
  manifest,
  round,
  partial = false,
  sensitiveRedact = null,
}) {
  await assertWorkspaceHead(workspace, manifest.source.baseOid, manifest.workspace.infrastructure);
  await runGit(workspace, ["add", "-A"]);
  const rawDiff = await runGit(workspace, ["diff", "--cached", "--raw", "-z", "--find-renames", "--no-ext-diff", manifest.source.baseOid, "--"]);
  const changes = parseRawDiff(rawDiff);
  const binaryPaths = parseNumstat(await runGit(workspace, ["diff", "--cached", "--numstat", "-z", "--find-renames", "--no-ext-diff", manifest.source.baseOid, "--"]));
  for (const change of changes) {
    const effective = change.newPath ?? change.oldPath;
    change.binary = binaryPaths.has(effective);
  }
  const patchResult = await spawnCaptured("git", [
    "-C", workspace, "diff", "--cached", "--binary", "--full-index", "--no-ext-diff",
    "--find-renames", "--src-prefix=a/", "--dst-prefix=b/", manifest.source.baseOid, "--",
  ], {
    cwd: workspace,
    env: gitEnvironment(),
    timeoutMs: 120_000,
    maxBytes: manifest.task.limits.maxPatchBytes,
  });
  if (!patchResult.spawned || patchResult.timedOut || patchResult.code !== 0) {
    throw new DelegateError("patch", "Could not generate the candidate patch");
  }
  if (sensitiveRedact) {
    const patchText = patchResult.stdout.toString("utf8");
    if (sensitiveRedact(patchText) !== patchText) {
      throw new DelegateError("sensitive_partial_candidate", "Partial candidate contains private redaction values");
    }
  }
  const complete = patchResult.stdoutBytes <= manifest.task.limits.maxPatchBytes;
  const artifactDir = path.join(transactionDir, "artifacts", `round-${round}`);
  await ensureSecureDirectory(artifactDir, transactionDir);
  const fileName = complete && !partial ? "candidate.patch" : "candidate.patch.partial";
  const patchPath = path.join(artifactDir, fileName);
  await writeSecureFile(patchPath, patchResult.stdout, transactionDir);
  const candidateTree = await gitText(workspace, ["write-tree"]);
  return {
    complete: complete && !partial,
    partial: partial || !complete,
    path: path.relative(transactionDir, patchPath).split(path.sep).join("/"),
    sha256: patchResult.stdoutHash,
    sizeBytes: patchResult.stdoutBytes,
    storedBytes: patchResult.stdout.length,
    changedPaths: changes,
    baseTree: manifest.source.baseTree,
    candidateTree,
  };
}

function addPublicChangedPaths(patch, redact) {
  if (!patch) return patch;
  patch.publicChangedPaths = patch.changedPaths.map((change) => ({
    ...change,
    oldPath: change.oldPath === null ? null : redact(change.oldPath),
    newPath: change.newPath === null ? null : redact(change.newPath),
  }));
  return patch;
}

async function capturePartialCandidate(transactionDir, workspace, manifest, sensitiveRedact = null) {
  try {
    return await stageAndBuildPatch({
      transactionDir,
      workspace,
      manifest,
      round: manifest.round,
      partial: true,
      sensitiveRedact,
    });
  } catch {
    return null;
  }
}

function errorRecord(error) {
  return {
    kind: error instanceof DelegateError ? error.kind : "internal",
    message: error instanceof DelegateError ? error.message : "Unexpected delegation failure",
  };
}

function appendExecutedApprovedPaths(manifest, paths, permissionAudit) {
  if ((permissionAudit?.violations?.length ?? 0) !== 0) return;
  if (!Array.isArray(paths)) throw new DelegateError("policy_violation", "Executed write provenance is malformed");
  const additions = [];
  for (const item of paths) {
    validateRepoRelative(item, "executed write path");
    additions.push(item);
  }
  manifest.executedApprovedPaths = [...new Set([
    ...manifest.executedApprovedPaths,
    ...additions,
  ])].sort();
}

async function collectCandidate({ transactionDir, workspace, manifest, acp, roundStart, postAcp }) {
  await assertSourceUnchangedSinceStart(manifest.source);
  const roundChangedPaths = await changedPathsBetweenTrees(workspace, roundStart.tree, postAcp.tree);
  const currentRoundApprovedPaths = new Set(acp.executedApprovedPaths);
  const roundStatusOnlyMutation = roundStart.tree === postAcp.tree
    && roundStart.statusHash !== postAcp.statusHash;
  manifest.state = "collecting";
  manifest.agentReport = acp.agentReport;
  manifest.permissionAudit = acp.permissionAudit;
  appendExecutedApprovedPaths(manifest, acp.executedApprovedPaths, acp.permissionAudit);
  await saveManifest(transactionDir, manifest);
  await assertWorkspaceHead(workspace, manifest.source.baseOid, manifest.workspace.infrastructure);
  const agentFingerprint = await repositoryFingerprint(workspace);
  manifest.state = "verifying";
  await saveManifest(transactionDir, manifest);

  const verification = [];
  for (const command of manifest.task.verification.commands) {
    verification.push(await runVerifier({
      transactionDir,
      workspace,
      task: manifest.task,
      command,
      round: manifest.round,
      source: manifest.source,
      infrastructure: manifest.workspace.infrastructure,
    }));
    await assertSourceUnchangedSinceStart(manifest.source);
  }
  await assertWorkspaceHead(workspace, manifest.source.baseOid, manifest.workspace.infrastructure);
  const patch = addPublicChangedPaths(
    await stageAndBuildPatch({ transactionDir, workspace, manifest, round: manifest.round }),
    acp.redact,
  );
  const violations = [];
  for (const candidatePath of roundChangedPaths) {
    if (!currentRoundApprovedPaths.has(candidatePath)) {
      violations.push({
        kind: "round_unmediated_write",
        message: "Candidate path changed this round without matching current-round Edit/Write execution",
      });
    }
  }
  if (roundStatusOnlyMutation) {
    violations.push({
      kind: "round_workspace_state_changed",
      message: "Candidate Git state changed this round without a content-tree change",
    });
  }
  const executedApprovedPaths = new Set(manifest.executedApprovedPaths);
  for (const change of patch.changedPaths) {
    for (const candidatePath of [change.oldPath, change.newPath].filter(Boolean)) {
      try { await validateChangedPath(workspace, candidatePath, manifest.task); }
      catch (error) { violations.push(errorRecord(error)); }
      if (!executedApprovedPaths.has(candidatePath)) {
        violations.push({
          kind: "unmediated_write",
          message: "Candidate changed path lacks a matching approved Edit/Write execution",
        });
      }
    }
  }
  let diffCheck = { required: manifest.task.verification.requireDiffCheck, passed: true };
  if (manifest.task.verification.requireDiffCheck) {
    const check = await spawnCaptured("git", ["-C", workspace, "diff", "--cached", "--check", manifest.source.baseOid, "--"], {
      cwd: workspace,
      env: gitEnvironment(),
      timeoutMs: 60_000,
      maxBytes: manifest.task.limits.maxArtifactBytes,
    });
    diffCheck = {
      required: true,
      passed: check.spawned && !check.timedOut && check.code === 0 && check.stdoutBytes <= manifest.task.limits.maxArtifactBytes && check.stderrBytes <= manifest.task.limits.maxArtifactBytes,
      exitCode: check.code,
    };
    if (!diffCheck.passed) violations.push({ kind: "diff_check_failed", message: "git diff --check failed" });
  }
  if (manifest.task.task.expectedChange === "required" && patch.changedPaths.length === 0) {
    violations.push({ kind: "empty_required_patch", message: "The frozen task requires a non-empty patch" });
  }
  if (!patch.complete || patch.sizeBytes > manifest.task.limits.maxPatchBytes) {
    violations.push({ kind: "patch_limit", message: "Candidate patch exceeds maxPatchBytes" });
  }
  for (const result of verification) {
    if (result.mutatedWorkspace) violations.push({ kind: "verification_mutated_workspace", message: `Verifier ${result.id} mutated the candidate` });
    if (result.artifacts && (result.artifacts.stdout.truncated || result.artifacts.stderr.truncated)) {
      violations.push({ kind: "artifact_limit", message: `Verifier ${result.id} exceeded maxArtifactBytes` });
    }
    if (result.required && result.status !== "passed") {
      violations.push({ kind: "required_verification_failed", message: `Required verifier ${result.id} did not pass` });
    }
  }
  for (const violation of acp.permissionAudit.violations) {
    violations.push({ kind: "policy_violation", message: violation.code });
  }
  await assertSourceUnchangedSinceStart(manifest.source);
  const ready = violations.length === 0;
  const verifierMutatedWorkspace = verification.some((item) => item.mutatedWorkspace);
  const roundCausalityFailed = violations.some((item) => [
    "round_unmediated_write",
    "round_workspace_state_changed",
  ].includes(item.kind));
  manifest.verification = verification;
  manifest.candidate = {
    ready,
    acpCompleted: acp.completed,
    stopReason: acp.stopReason,
    agentStatusFingerprint: agentFingerprint,
    patch,
    diffCheck,
    violations,
  };
  manifest.state = ready ? "candidate_ready" : "verifying";
  manifest.recoverable = !ready
    && manifest.round < manifest.task.limits.maxRounds
    && acp.permissionAudit.violations.length === 0
    && !roundCausalityFailed
    && !verifierMutatedWorkspace;
  manifest.lastError = ready ? null : { kind: "candidate_not_ready", message: "Mechanical candidate gates did not all pass" };
  manifest.history.push({
    round: manifest.round,
    state: manifest.state,
    candidateReady: ready,
    verification: verification.map((item) => ({ id: item.id, status: item.status, required: item.required })),
    violations: violations.map((item) => item.kind),
  });
  await saveManifest(transactionDir, manifest);
  return manifest;
}

function priorEvidence(manifest) {
  return (manifest.verification ?? []).map((item) => ({
    id: item.id,
    required: item.required,
    status: item.status,
    exitCode: item.exitCode,
    signal: item.signal,
    mutatedWorkspace: item.mutatedWorkspace,
    artifacts: item.artifacts,
  }));
}

async function resetCandidateIndex(workspace, baseOid, infrastructure) {
  await assertWorkspaceHead(workspace, baseOid, infrastructure);
  await runGit(workspace, ["reset", "--mixed", "--quiet", baseOid, "--"]);
}

async function executeRound({ options, transactionDir, workspace, manifest, writer, feedback = null }) {
  await prepareVerifierSandbox(transactionDir, manifest.task, manifest.source, workspace);
  const roundStart = await candidateContentFingerprint({
    transactionDir,
    workspace,
    baseOid: manifest.source.baseOid,
    infrastructure: manifest.workspace.infrastructure,
  });
  manifest.round += 1;
  manifest.state = "running";
  manifest.recoverable = false;
  manifest.lastError = null;
  manifest.candidate = null;
  await saveManifest(transactionDir, manifest);
  let roundRedact = null;
  let roundRedactionComplete = false;
  try {
    const acp = await runAcpRound({
      options,
      transactionDir,
      workspace,
      manifest,
      writer,
      feedback,
      previousEvidence: feedback ? priorEvidence(manifest) : [],
    });
    roundRedact = acp.redact;
    roundRedactionComplete = acp.redactionComplete === true;
    const postAcp = await candidateContentFingerprint({
      transactionDir,
      workspace,
      baseOid: manifest.source.baseOid,
      infrastructure: manifest.workspace.infrastructure,
    });
    return await collectCandidate({
      transactionDir,
      workspace,
      manifest,
      acp,
      roundStart,
      postAcp,
    });
  } catch (error) {
    let normalized = error instanceof DelegateError ? error : new DelegateError("internal", "Unexpected round failure");
    if (typeof normalized.details?.redact === "function") {
      roundRedact = normalized.details.redact;
      roundRedactionComplete = normalized.details.redactionComplete === true;
      delete normalized.details.redact;
      delete normalized.details.redactionComplete;
    }
    try { await assertSourceUnchangedSinceStart(manifest.source); }
    catch (sourceError) { normalized = sourceError; }
    let partialRoundMutated = true;
    try {
      const partialFingerprint = await candidateContentFingerprint({
        transactionDir,
        workspace,
        baseOid: manifest.source.baseOid,
        infrastructure: manifest.workspace.infrastructure,
      });
      partialRoundMutated = partialFingerprint.tree !== roundStart.tree
        || partialFingerprint.statusHash !== roundStart.statusHash;
    } catch { /* An unmeasurable partial workspace is not safe to continue. */ }
    const partial = roundRedactionComplete && typeof roundRedact === "function"
      ? addPublicChangedPaths(
        await capturePartialCandidate(transactionDir, workspace, manifest, roundRedact),
        roundRedact,
      )
      : null;
    manifest.candidate = partial ? {
      ready: false,
      acpCompleted: false,
      patch: partial,
      diffCheck: null,
      violations: [
        { kind: normalized.kind, message: normalized.message },
        ...(partialRoundMutated ? [{
          kind: "partial_round_mutation",
          message: "A failed ACP round changed the candidate and cannot be continued safely",
        }] : []),
      ],
    } : null;
    manifest.permissionAudit = normalized.details?.permissionAudit ?? manifest.permissionAudit;
    if (!roundRedactionComplete && normalized.kind === "auth_source_mutation") {
      manifest.agentReport = null;
      manifest.candidate = null;
    }
    if (!partialRoundMutated) {
      appendExecutedApprovedPaths(
        manifest,
        normalized.details?.executedApprovedPaths ?? [],
        normalized.details?.permissionAudit,
      );
    }
    manifest.lastError = errorRecord(normalized);
    manifest.recoverable = Boolean(manifest.sessionId)
      && manifest.round < manifest.task.limits.maxRounds
      && ![
        "policy_violation",
        "source_mutation",
        "auth_source_mutation",
        "environment_binding",
      ].includes(normalized.kind)
      && (manifest.permissionAudit?.violations?.length ?? 0) === 0
      && !partialRoundMutated;
    manifest.history.push({
      round: manifest.round,
      state: manifest.state,
      candidateReady: false,
      error: normalized.kind,
      cancelSent: Boolean(normalized.details?.cancelSent),
      childReaped: Boolean(normalized.details?.childReaped),
      partialRoundMutated,
    });
    await saveManifest(transactionDir, manifest);
    normalized.details = {
      ...(isPlainObject(normalized.details) ? normalized.details : {}),
      transactionId: manifest.transactionId,
    };
    throw normalized;
  }
}

function publicVerification(verification) {
  return (verification ?? []).map((item) => ({
    id: item.id,
    required: item.required,
    status: item.status,
    exitCode: item.exitCode,
    signal: item.signal,
    durationMs: item.durationMs,
    mutatedWorkspace: item.mutatedWorkspace,
    artifacts: item.artifacts,
    error: item.error,
  }));
}

function publicCandidate(candidate) {
  if (!candidate) return null;
  return {
    ready: Boolean(candidate.ready),
    acpCompleted: Boolean(candidate.acpCompleted),
    stopReason: candidate.stopReason ?? null,
    agentStatusFingerprint: candidate.agentStatusFingerprint ?? null,
    patch: candidate.patch ? {
      complete: Boolean(candidate.patch.complete),
      partial: Boolean(candidate.patch.partial),
      path: candidate.patch.path,
      sha256: candidate.patch.sha256,
      sizeBytes: candidate.patch.sizeBytes,
      storedBytes: candidate.patch.storedBytes,
      changedPaths: candidate.patch.publicChangedPaths ?? candidate.patch.changedPaths,
      baseTree: candidate.patch.baseTree,
      candidateTree: candidate.patch.candidateTree,
    } : null,
    diffCheck: candidate.diffCheck ?? null,
    violations: (candidate.violations ?? []).map((item) => ({ kind: item.kind, message: item.message })),
  };
}

function normalizedResult(command, manifest, { ok = null, error = null, extra = {} } = {}) {
  const successful = ok ?? (command === "inspect" || manifest.state === "candidate_ready" || manifest.state === "applied");
  return {
    type: "result",
    command,
    ok: successful,
    transactionId: manifest.transactionId,
    state: manifest.state,
    round: manifest.round,
    maxRounds: manifest.task?.limits?.maxRounds ?? null,
    recoverable: Boolean(manifest.recoverable),
    containment: manifest.containment,
    source: manifest.source ? {
      baseOid: manifest.source.baseOid,
      baseTree: manifest.source.baseTree,
      headAtStart: manifest.source.headOid,
      branchAtStart: manifest.source.branch,
      statusHashAtStart: manifest.source.statusHash,
      dirtyIgnored: manifest.source.dirtyIgnored,
    } : null,
    candidate: publicCandidate(manifest.candidate),
    verification: publicVerification(manifest.verification),
    permissionAudit: manifest.permissionAudit ? {
      decisions: manifest.permissionAudit.decisions.map((decision) => ({
        kind: decision.kind,
        allowed: decision.allowed,
        reason: decision.reason,
        paths: decision.paths,
      })),
      toolCallCount: manifest.permissionAudit.toolCallCount,
      allowedCount: manifest.permissionAudit.allowedCount,
      rejectedCount: manifest.permissionAudit.rejectedCount,
      violations: manifest.permissionAudit.violations,
    } : null,
    agentReport: manifest.agentReport,
    error: error ?? manifest.lastError,
    residue: [
      ...RESIDUE,
      ...(manifest.task?.task?.residue ?? []).map((item) => ({
        id: item.id,
        status: "pending_human_review",
        judgment: item.judgment,
      })),
    ],
    ...extra,
  };
}

function genericFailure(command, error) {
  return {
    type: "result",
    command: command ?? null,
    ok: false,
    transactionId: error?.details?.transactionId ?? null,
    state: null,
    recoverable: false,
    containment: null,
    source: null,
    candidate: null,
    verification: [],
    permissionAudit: null,
    agentReport: null,
    error: errorRecord(error),
    residue: RESIDUE,
  };
}

async function hashFile(filePath) {
  const data = await readFile(filePath);
  return { sha256: sha256(data), bytes: data.length };
}

async function readSecureFileOnce(filePath, root) {
  await validateSecureParent(filePath, root);
  let resolved;
  try { resolved = await realpath(filePath); }
  catch { throw new DelegateError("artifact_integrity", "Artifact no longer resolves"); }
  if (resolved !== filePath || !isWithin(root, resolved)) {
    throw new DelegateError("artifact_integrity", "Artifact crosses a symbolic link");
  }
  const flags = fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0);
  let handle;
  try { handle = await open(filePath, flags); }
  catch { throw new DelegateError("artifact_integrity", "Artifact cannot be opened safely"); }
  try {
    const opened = await handle.stat();
    const linked = await lstat(filePath);
    if (!opened.isFile() || !linked.isFile() || linked.isSymbolicLink()
      || opened.dev !== linked.dev || opened.ino !== linked.ino || linked.nlink !== 1) {
      throw new DelegateError("artifact_integrity", "Artifact inode validation failed");
    }
    return Buffer.from(await handle.readFile());
  } finally {
    await handle.close();
  }
}

async function assertCleanApplyTarget(manifest) {
  const source = manifest.source;
  let resolved;
  try { resolved = await realpath(source.root); }
  catch { throw new DelegateError("stale_target", "Source repository no longer resolves"); }
  if (resolved !== source.root) throw new DelegateError("stale_target", "Source repository realpath changed");
  const top = await realpath(await gitText(resolved, ["rev-parse", "--show-toplevel"]));
  if (top !== resolved) throw new DelegateError("stale_target", "Source is no longer the exact Git root");
  const currentGitDirValue = await gitText(resolved, ["rev-parse", "--git-dir"]);
  const currentGitDir = await realpath(path.resolve(resolved, currentGitDirValue));
  if (currentGitDir !== source.gitDir) throw new DelegateError("stale_target", "Source Git directory binding changed");
  const currentCommonGitDirValue = await gitText(resolved, ["rev-parse", "--git-common-dir"]);
  const currentCommonGitDir = await realpath(path.resolve(resolved, currentCommonGitDirValue));
  if (currentCommonGitDir !== source.commonGitDir) throw new DelegateError("stale_target", "Source common Git directory binding changed");
  const operation = await operationInProgress(resolved, source.gitDir);
  if (operation) throw new DelegateError("stale_target", "A Git operation is in progress");
  const head = await gitText(resolved, ["rev-parse", "--verify", "HEAD"]);
  if (head !== source.baseOid) throw new DelegateError("stale_target", "Source HEAD no longer equals the immutable base");
  const statusText = (await runGit(resolved, ["status", "--porcelain=v2", "--branch", "--untracked-files=all"])).toString("utf8");
  if (statusIsDirty(statusText)) throw new DelegateError("dirty_target", "Source checkout must be completely clean before apply");
  const currentBindings = {
    index: await hashFile(path.join(source.gitDir, "index")),
    head: await hashFile(path.join(source.gitDir, "HEAD")),
    config: await optionalFileFingerprint(path.join(source.commonGitDir, "config")),
    workingTree: await sourceFilesystemFingerprint(resolved, [source.gitDir, source.commonGitDir]),
  };
  if (stableJson(currentBindings.index) !== stableJson(source.indexFingerprint)
    || stableJson(currentBindings.head) !== stableJson(source.headFileFingerprint)
    || stableJson(currentBindings.config) !== stableJson(source.configFingerprint)
    || stableJson(currentBindings.workingTree) !== stableJson(source.workingTreeFingerprint)) {
    throw new DelegateError("stale_target", "Source Git bindings or working-tree contents changed after delegation started");
  }
  return resolved;
}

async function temporaryIndexTree(source, baseOid, patchBuffer = null, {
  fromWorkingTree = false,
  applyToWorkingTree = false,
  transactionDir,
  expectedBaseTree = null,
} = {}) {
  const indexPath = path.join(transactionDir, `temporary-index-${randomUUID()}`);
  const environment = { GIT_INDEX_FILE: indexPath };
  try {
    await runGit(source, ["read-tree", baseOid], { env: environment });
    const seededTree = await gitText(source, ["write-tree"], { env: environment });
    if (expectedBaseTree && seededTree !== expectedBaseTree) {
      throw new DelegateError("candidate_integrity", "Temporary index was not seeded from the recorded base tree");
    }
    if (applyToWorkingTree) {
      await runGit(source, ["update-index", "--really-refresh"], { env: environment });
      const refreshedTree = await gitText(source, ["write-tree"], { env: environment });
      if (refreshedTree !== seededTree) {
        throw new DelegateError("stale_target", "Refreshing the temporary index changed the recorded base tree");
      }
      await runGit(source, ["diff-index", "--quiet", baseOid, "--"], { env: environment });
    }
    if (patchBuffer) {
      const mode = applyToWorkingTree ? "--index" : "--cached";
      await runGit(source, ["apply", mode, "--binary", "-"], { env: environment, input: patchBuffer });
    }
    if (fromWorkingTree) await runGit(source, ["add", "-A"], { env: environment });
    return await gitText(source, ["write-tree"], { env: environment });
  } finally {
    try { await unlink(indexPath); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
}

async function validateCandidateForApply(transactionDir, workspace, manifest) {
  if (manifest.state !== "candidate_ready" || !manifest.candidate?.ready || !manifest.candidate.patch?.complete) {
    throw new DelegateError("apply_gate", "apply requires candidate_ready with a complete patch");
  }
  await assertWorkspaceHead(workspace, manifest.source.baseOid, manifest.workspace.infrastructure);
  const patchMetadata = manifest.candidate.patch;
  const patchPath = path.join(transactionDir, ...patchMetadata.path.split("/"));
  if (!isWithin(transactionDir, patchPath)) throw new DelegateError("artifact_integrity", "Patch path escapes the transaction");
  const patchBuffer = await readSecureFileOnce(patchPath, transactionDir);
  if (sha256(patchBuffer) !== patchMetadata.sha256 || patchBuffer.length !== patchMetadata.sizeBytes) {
    throw new DelegateError("artifact_integrity", "Patch artifact hash or size changed");
  }
  const currentTree = await gitText(workspace, ["write-tree"]);
  if (currentTree !== patchMetadata.candidateTree) throw new DelegateError("candidate_integrity", "Candidate index tree changed");
  const regenerated = await spawnCaptured("git", [
    "-C", workspace, "diff", "--cached", "--binary", "--full-index", "--no-ext-diff",
    "--find-renames", "--src-prefix=a/", "--dst-prefix=b/", manifest.source.baseOid, "--",
  ], {
    cwd: workspace,
    env: gitEnvironment(),
    timeoutMs: 120_000,
    maxBytes: manifest.task.limits.maxPatchBytes,
  });
  if (!regenerated.spawned || regenerated.timedOut || regenerated.code !== 0
    || regenerated.stdoutBytes !== patchMetadata.sizeBytes || regenerated.stdoutHash !== patchMetadata.sha256) {
    throw new DelegateError("candidate_integrity", "Candidate patch no longer matches its recorded hash");
  }
  return { patchBuffer, patchMetadata };
}

async function applyCandidate(transactionDir, workspace, manifest) {
  const { patchBuffer, patchMetadata } = await validateCandidateForApply(transactionDir, workspace, manifest);
  const source = await assertCleanApplyTarget(manifest);
  const check = await spawnCaptured("git", ["-C", source, "apply", "--check", "--binary", "-"], {
    cwd: source,
    env: gitEnvironment(),
    input: patchBuffer,
    timeoutMs: 60_000,
    maxBytes: manifest.task.limits.maxArtifactBytes,
  });
  if (!check.spawned || check.timedOut || check.code !== 0) {
    throw new DelegateError("apply_check", "git apply --check rejected the candidate patch");
  }
  const proofTree = await temporaryIndexTree(source, manifest.source.baseOid, patchBuffer, {
    transactionDir,
    expectedBaseTree: manifest.source.baseTree,
  });
  if (proofTree !== patchMetadata.candidateTree) {
    throw new DelegateError("candidate_integrity", "Temporary-index proof did not produce the candidate tree");
  }
  await assertCleanApplyTarget(manifest);
  const indexPath = path.join(manifest.source.gitDir, "index");
  const headPath = path.join(manifest.source.gitDir, "HEAD");
  for (const [label, target] of [["index", indexPath], ["HEAD", headPath]]) {
    const info = await lstat(target);
    if (!info.isFile() || info.isSymbolicLink()) {
      throw new DelegateError("stale_target", `Source ${label} path is unsafe`);
    }
  }
  const indexBefore = await hashFile(indexPath);
  const headBefore = await hashFile(headPath);
  const sourceTreeFromApply = await temporaryIndexTree(source, manifest.source.baseOid, patchBuffer, {
    applyToWorkingTree: true,
    transactionDir,
    expectedBaseTree: manifest.source.baseTree,
  });
  const indexImmediatelyAfter = await hashFile(indexPath);
  const headImmediatelyAfter = await hashFile(headPath);
  const headOidImmediatelyAfter = await gitText(source, ["rev-parse", "--verify", "HEAD"]);
  if (sourceTreeFromApply !== patchMetadata.candidateTree
    || indexBefore.sha256 !== indexImmediatelyAfter.sha256
    || indexBefore.bytes !== indexImmediatelyAfter.bytes
    || headBefore.sha256 !== headImmediatelyAfter.sha256
    || headBefore.bytes !== headImmediatelyAfter.bytes
    || headOidImmediatelyAfter !== manifest.source.baseOid) {
    throw new DelegateError("post_apply_integrity", "Immediate post-apply source/index/HEAD identity check failed");
  }
  const sourceTree = await temporaryIndexTree(source, manifest.source.baseOid, null, {
    fromWorkingTree: true,
    transactionDir,
    expectedBaseTree: manifest.source.baseTree,
  });
  const indexAfter = await hashFile(indexPath);
  const headAfter = await hashFile(headPath);
  if (sourceTree !== patchMetadata.candidateTree
    || indexBefore.sha256 !== indexAfter.sha256
    || indexBefore.bytes !== indexAfter.bytes
    || headBefore.sha256 !== headAfter.sha256
    || headBefore.bytes !== headAfter.bytes) {
    throw new DelegateError("post_apply_integrity", "Applied working tree did not satisfy the recorded candidate/index/HEAD invariants");
  }
  manifest.state = "applied";
  manifest.recoverable = false;
  manifest.lastError = null;
  manifest.applied = {
    at: now(),
    sourceTree,
    candidateTree: patchMetadata.candidateTree,
    realIndexUnchanged: true,
    headUnchanged: true,
  };
  manifest.history.push({ round: manifest.round, state: "applied", sourceTree });
  await saveManifest(transactionDir, manifest);
  return manifest;
}

async function runStart(options, writer) {
  const task = validateTask(await readJsonStdin("task JSON"));
  const controlBindings = await controlExecutableBindings(options);
  const inspectedSource = await inspectRepository(task);
  const runtimeBindings = {
    ...controlBindings,
    taskExecutableBindingHash: await taskExecutableBindingHash(task, inspectedSource),
  };
  const prospectiveState = await prospectiveResolvedPath(options.stateDir);
  assertStateSeparatedFromSource(prospectiveState, inspectedSource);
  const stateRoot = await ensureStateRoot(options.stateDir);
  assertStateSeparatedFromSource(stateRoot, inspectedSource);
  const transaction = await createTransaction(stateRoot, task, runtimeBindings);
  const { transactionDir, manifest } = transaction;
  try {
    manifest.source = inspectedSource;
    manifest.sourceBindingHash = sha256(stableJson(manifest.source));
    await saveManifest(transactionDir, manifest);
    const workspace = await createWorkspace(transactionDir, manifest.source);
    manifest.workspace.infrastructure = await captureWorkspaceInfrastructure(workspace);
    await saveManifest(transactionDir, manifest);
    const finalManifest = await executeRound({ options, transactionDir, workspace, manifest, writer });
    return normalizedResult("start", finalManifest);
  } catch (error) {
    const normalized = error instanceof DelegateError ? error : new DelegateError("internal", "Unexpected start failure");
    if (manifest.round === 0) {
      manifest.lastError = errorRecord(normalized);
      manifest.recoverable = false;
      await saveManifest(transactionDir, manifest);
    }
    normalized.details = { ...(isPlainObject(normalized.details) ? normalized.details : {}), transactionId: manifest.transactionId };
    throw normalized;
  }
}

async function runContinue(options, writer) {
  const feedback = validateFeedback(await readJsonStdin("feedback JSON"));
  const stateRoot = await ensureStateRoot(options.stateDir);
  const loaded = await loadTransaction(stateRoot, options.transaction, { requireWorkspace: true });
  const { transactionDir, workspace, manifest } = loaded;
  try {
    const controlBindings = await controlExecutableBindings(options);
    const currentTaskExecutableBindingHash = await taskExecutableBindingHash(manifest.task, manifest.source);
    if (controlBindings.pathEnvironmentBindingHash !== manifest.pathEnvironmentBindingHash
      || controlBindings.gitExecutableBindingHash !== manifest.gitExecutableBindingHash
      || controlBindings.grokExecutableBindingHash !== manifest.grokExecutableBindingHash
      || currentTaskExecutableBindingHash !== manifest.taskExecutableBindingHash) {
      throw new DelegateError("environment_binding", "Frozen runtime executable environment changed since transaction start");
    }
  } catch (error) {
    const normalized = error instanceof DelegateError
      ? error
      : new DelegateError("environment_binding", "Frozen runtime executable environment could not be verified");
    manifest.recoverable = false;
    manifest.lastError = errorRecord(normalized);
    await saveManifest(transactionDir, manifest);
    normalized.details = { transactionId: manifest.transactionId };
    throw normalized;
  }
  if (!manifest.recoverable || !["running", "collecting", "verifying"].includes(manifest.state)) {
    throw new DelegateError("continue_gate", "Transaction is not in a recoverable state", 1, { transactionId: manifest.transactionId });
  }
  if (!manifest.sessionId) throw new DelegateError("continue_gate", "Transaction has no bound ACP session", 1, { transactionId: manifest.transactionId });
  if (manifest.round >= manifest.task.limits.maxRounds) {
    throw new DelegateError("round_limit", "Transaction reached limits.maxRounds", 1, { transactionId: manifest.transactionId });
  }
  await resetCandidateIndex(workspace, manifest.source.baseOid, manifest.workspace.infrastructure);
  try {
    const finalManifest = await executeRound({ options, transactionDir, workspace, manifest, writer, feedback });
    return normalizedResult("continue", finalManifest);
  } catch (error) {
    if (error instanceof DelegateError) {
      error.details = { ...(isPlainObject(error.details) ? error.details : {}), transactionId: manifest.transactionId };
    }
    throw error;
  }
}

async function runInspect(options) {
  const stateRoot = await readOnlyStateRoot(options.stateDir);
  const { manifest } = await loadTransaction(stateRoot, options.transaction);
  return normalizedResult("inspect", manifest, { ok: true });
}

async function runApply(options) {
  const stateRoot = await ensureStateRoot(options.stateDir);
  const { transactionDir, workspace, manifest } = await loadTransaction(stateRoot, options.transaction, { requireWorkspace: true });
  try {
    const currentBindings = await gitControlBindings();
    if (currentBindings.pathEnvironmentBindingHash !== manifest.pathEnvironmentBindingHash
      || currentBindings.gitExecutableBindingHash !== manifest.gitExecutableBindingHash) {
      throw new DelegateError("environment_binding", "Frozen Git execution environment changed since transaction start");
    }
    const finalManifest = await applyCandidate(transactionDir, workspace, manifest);
    return normalizedResult("apply", finalManifest, {
      ok: true,
      extra: {
        applied: {
          sourceTree: finalManifest.applied.sourceTree,
          candidateTree: finalManifest.applied.candidateTree,
          realIndexUnchanged: true,
          headUnchanged: true,
        },
      },
    });
  } catch (error) {
    const normalized = error instanceof DelegateError ? error : new DelegateError("internal", "Unexpected apply failure");
    if (normalized.kind === "environment_binding") {
      manifest.recoverable = false;
      manifest.lastError = errorRecord(normalized);
      await saveManifest(transactionDir, manifest);
    }
    normalized.details = { ...(isPlainObject(normalized.details) ? normalized.details : {}), transactionId: manifest.transactionId };
    throw normalized;
  }
}

async function runDiscard(options) {
  const stateRoot = await ensureStateRoot(options.stateDir);
  const { transactionDir, manifest } = await loadTransaction(stateRoot, options.transaction);
  manifest.state = "discarded";
  manifest.recoverable = false;
  manifest.history.push({ round: manifest.round, state: "discarded" });
  await saveManifest(transactionDir, manifest);
  await rm(transactionDir, { recursive: true, force: false });
  return {
    type: "result",
    command: "discard",
    ok: true,
    transactionId: options.transaction,
    state: "discarded",
    recoverable: false,
    containment: manifest.containment,
    removed: {
      transaction: true,
      workspace: true,
      artifacts: true,
    },
    recovery: "not_recoverable",
    error: null,
    residue: RESIDUE,
  };
}

async function main() {
  let parsed;
  let writer = new OutputWriter(false);
  try {
    parsed = parseArgs(process.argv.slice(2));
    writer = new OutputWriter(parsed.stream);
    if (parsed.help) {
      writer.result({ type: "result", command: parsed.command, ok: true, help: usage(), error: null });
      return;
    }
    let result;
    if (parsed.command === "start") result = await runStart(parsed, writer);
    else if (parsed.command === "continue") result = await runContinue(parsed, writer);
    else if (parsed.command === "inspect") result = await runInspect(parsed);
    else if (parsed.command === "apply") result = await runApply(parsed);
    else result = await runDiscard(parsed);
    writer.result(result);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    const normalized = error instanceof DelegateError ? error : new DelegateError("internal", "Unexpected delegation failure");
    let result = genericFailure(parsed?.command, normalized);
    if (parsed?.transaction && normalized.details?.transactionId) {
      try {
        const stateRoot = await ensureStateRoot(parsed.stateDir);
        const { manifest } = await loadTransaction(stateRoot, parsed.transaction);
        result = normalizedResult(parsed.command, manifest, { ok: false, error: errorRecord(normalized) });
      } catch { /* Keep generic normalized failure. */ }
    } else if (normalized.details?.transactionId && parsed?.stateDir) {
      try {
        const stateRoot = await ensureStateRoot(parsed.stateDir);
        const { manifest } = await loadTransaction(stateRoot, normalized.details.transactionId);
        result = normalizedResult(parsed.command, manifest, { ok: false, error: errorRecord(normalized) });
      } catch { /* Keep generic normalized failure. */ }
    }
    writer.result(result);
    process.exitCode = normalized.exitCode ?? 1;
  }
}

await main();
