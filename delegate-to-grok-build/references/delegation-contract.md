# Delegation Contract

This is the task-authoring and result-auditing contract for `scripts/grok-delegate.mjs`. Codex is the author and auditor; Grok Build is the executor. The wrapper never turns Grok's self-report into verification evidence.

## Lifecycle

```text
preparing -> running -> collecting -> verifying -> candidate_ready -> applied
                                                        |
                                                        `-> discarded
```

A recoverable failure remains in the phase where it occurred and may be continued while `limits.maxRounds` permits. Failure, timeout, and cancellation preserve the private clone and bounded artifacts. Only an explicit `discard --transaction TX_ID` recursively deletes a transaction.

Use the CLI with task and feedback JSON on stdin:

```bash
node <skill-dir>/scripts/grok-delegate.mjs start --state-dir <private-state-dir> < task.json
node <skill-dir>/scripts/grok-delegate.mjs continue --state-dir <private-state-dir> --transaction <tx-id> < feedback.json
node <skill-dir>/scripts/grok-delegate.mjs inspect --state-dir <private-state-dir> --transaction <tx-id>
node <skill-dir>/scripts/grok-delegate.mjs apply --state-dir <private-state-dir> --transaction <tx-id>
node <skill-dir>/scripts/grok-delegate.mjs discard --state-dir <private-state-dir> --transaction <tx-id>
```

Omit `--state-dir` to use `${XDG_STATE_HOME}/delegate-to-grok-build` or `~/.local/state/delegate-to-grok-build`. Automated tests must always use a temporary `--state-dir`. Before creating state, `start` resolves and inspects the source repository. The state root must be disjoint from the source worktree, its resolved Git directory, and its resolved common Git directory: it cannot equal, contain, or be contained by any of them. This includes repositories whose Git metadata is outside the worktree. A new root is created as `0700`; an existing root must already be a real directory owned by the current user with no group or other permissions. The wrapper never chmods an existing supplied root. Transaction directories and files use `0700` and `0600`, respectively, and new manifests, configuration, logs, and patch artifacts are created without following links and fail closed on an existing link or non-regular path.

`--stream` is available for `start` and `continue`; it emits normalized NDJSON with increasing `seq`, ending in exactly one `result`. Without it, stdout is exactly one normalized JSON result line.

## Strict task JSON

Unknown fields are rejected. IDs are unique across criteria, residue, shell permissions, and verification commands. All five authorization values must be `false`.

```json
{
  "schemaVersion": 1,
  "task": {
    "id": "feature-123",
    "objective": "Implement the already-decided change.",
    "taskClass": "feature",
    "granularity": "standard",
    "acceptanceCriteria": [
      {"id": "ac-1", "text": "The focused test passes.", "verifyWith": ["test-focused"]}
    ],
    "constraints": ["Preserve the public API."],
    "expectedChange": "required",
    "writeScope": [{"kind": "prefix", "path": "src"}],
    "protectedPaths": ["src/generated"],
    "antiCheat": ["Do not weaken tests."],
    "residue": [
      {"id": "quality-review", "judgment": "Review semantic code quality.", "owner": "human"}
    ]
  },
  "repository": {
    "path": "/absolute/path/to/exact/git/root",
    "base": "HEAD",
    "dirtyPolicy": "reject"
  },
  "authorization": {
    "network": false,
    "installDependencies": false,
    "commit": false,
    "push": false,
    "externalSideEffects": false
  },
  "agent": {
    "timeoutMs": 300000,
    "cancelGraceMs": 2000,
    "model": null,
    "reasoningEffort": null,
    "executionProfile": "hardened",
    "sandbox": "strict",
    "inheritEnv": ["XAI_API_KEY"],
    "shellPermissions": [
      {"id": "shell-test-focused", "match": "exact", "argv": ["node", "--test", "test/focused.test.mjs"]}
    ]
  },
  "verification": {
    "commands": [
      {
        "id": "test-focused",
        "argv": ["node", "--test", "test/focused.test.mjs"],
        "cwd": ".",
        "timeoutMs": 120000,
        "required": true
      }
    ],
    "requireDiffCheck": true
  },
  "limits": {
    "maxRounds": 3,
    "maxPatchBytes": 1048576,
    "maxArtifactBytes": 262144
  }
}
```

Repository-relative paths are canonical POSIX-style paths. They cannot be absolute, contain `..`, NUL, backslashes, or traverse a symlink. `.` is accepted only where the whole repository or repository root is deliberately selected. `prefix` includes the named path and its descendants; protected paths protect both the named path and descendants.

`dirtyPolicy: "reject"` rejects tracked and untracked dirt. `head_only` deliberately ignores source dirt when building the private clone from the immutable base; it never copies, stashes, resets, or commits that dirt. Source identity is nevertheless content-sensitive: the wrapper deterministically fingerprints every worktree entry except the resolved Git metadata directories, including tracked, nonignored untracked, and ignored entries, regular-file bytes, modes, and symbolic-link targets. Git directory/common-directory binding plus index, HEAD, and common config fingerprints are checked separately. This catches same-status dirty-file overwrites and ignored-file overwrites without staging or writing Git objects. A later `apply` still requires the source checkout to be completely clean and bound to those starting identities.

`hardened` requires macOS, the built-in `strict` Grok sandbox, `XAI_API_KEY` in `inheritEnv`, and a present `XAI_API_KEY` value. It gets transaction-local runtime, Grok, XDG, and temporary homes without copied auth. Its minimal Grok configuration asks for Edit, Write, and Bash permission, defaults to `allow_once`, disables remembered approvals, and denies MCP, web, secret-path reads, dangerous Git commands, removal, and common network commands. Claude/Cursor/Codex compatibility skills, rules, agents, MCPs, hooks, and sessions are disabled with wrapper-owned environment values. Repository-native and system/MDM configuration layers may nevertheless remain; no reverse grant still means no mutation can pass the wrapper audit. Before Grok is spawned, the wrapper must establish a private default-deny `sandbox-exec` profile for verifiers. That profile permits global reads and process execution, denies network and link operations, permits writes only in the candidate worktree, verifier home, and verifier temp, then explicitly re-denies writes to the source root, source Git metadata, and candidate `.git`. The same profile, definitions, and environment must positively prove allowed-root create/read/unlink and deny transaction-root, source, source-Git, candidate-Git, symlink-escape, hardlink, and network probes while source/candidate fingerprints remain unchanged. Unsupported systems or any missing/rejected probe fail before Grok with `verifier_sandbox`; there is no unsandboxed retry.

`trusted_local` is the practical profile for a trusted personal repository when external sandboxing is unavailable and requires explicit user approval for each transaction before Codex writes that choice into the task. It uses the same transaction-private runtime homes and minimal permission configuration. It may authenticate through an explicitly inherited `XAI_API_KEY`; otherwise it may reference cached auth through wrapper-owned `GROK_AUTH_PATH`, but only after verifying a basename-exact `auth.json` that is a real, non-symlink, current-UID, `0600`, single-link, bounded valid-JSON file with no duplicate object keys whose real path is disjoint from the source, Git/common-Git metadata, and transaction state. Auth bytes are never copied into the transaction, and the auth path/content/hash are never persisted in the manifest or public output. Sufficiently long JSON string scalars are retained only in memory for exact-value redaction; encoded or transformed values remain outside that guarantee. Read/Grep policy denies and Bash carrier screening for `auth.json` are additional best-effort barriers. The source is fingerprinted before and after each round; a detected auth change is nonrecoverable. Cached-auth events remain queued until that check passes. If the post-round file is unreadable, dynamic decisions, permission carriers, provenance, report, candidate, and events are suppressed because the redactor cannot be safely extended. Authentication refresh or another same-UID process may already have changed that host file before detection, and the wrapper neither prevents nor rolls back it.

Trusted-local result containment is `transactional_only`. The independent clone, content fingerprints, scope and diff gates, verifier checks, and apply checks remain active, but this profile does not prevent hostile same-UID Grok or verifier code from modifying the source or local state. Source fingerprints are rechecked after each verifier and before readiness so detected source mutation fails the transaction; detection is not isolation. Wrapper-owned names such as `HOME`, `GROK_HOME`, `GROK_AUTH_PATH`, XDG homes, compatibility controls, remembered-approval controls, and the default permission selection cannot appear in task `inheritEnv`.

Environment names containing `KEY`, `TOKEN`, `SECRET`, `PASSWORD`, or `CREDENTIAL` are rejected except for the exact name `XAI_API_KEY`. Wrapper/Grok/provider prefixes, dynamic loader variables, Node/Bun/Deno/Python/Ruby/Perl and shell startup injection, Git control variables, proxy variables, and TLS/CA override variables are also rejected. The manifest stores only private aggregate hashes binding every inherited name's presence/value, the exact effective `PATH`, and resolved executable identities; raw inherited values are not persisted. `PATH` entries must be nonempty absolute paths. Before the first Git operation, `start` fingerprints the real regular executable, metadata, and content for Git, Grok, every verifier `argv[0]`, and every delegated-shell permission `argv[0]`. `continue` checks all bindings before reset/Grok, and `apply` checks `PATH` plus Git before source mutation. A mismatch is a nonrecoverable `environment_binding` failure. Shell permission `argv` values are tokens, never shell strings. `prefix` means the frozen token list must be an exact prefix of the requested token list.

## Continue feedback JSON

The continuation payload is strict and does not modify the task:

```json
{"schemaVersion": 1, "feedback": "Address verifier test-focused; do not change scope."}
```

The wrapper sends only the prior normalized verifier evidence and caller feedback. It loads only the ACP session ID bound to that transaction manifest; callers cannot supply a session ID through the CLI, and a cross-transaction ID fails validation before load. Frozen inherited-environment, `PATH`, and executable aggregates must match before any continuation Git or Grok execution. This is an ordinary caller-misuse boundary, not a cryptographic seal against a same-UID process able to rewrite transaction state and wrapper code together. Scope, base, repository, policy, task, limits, environment values, and executable identities are immutable. A wider permission, changed environment, changed executable, or changed oracle requires a new transaction.

## Candidate and apply rules

The wrapper runs every verifier independently with its frozen tokenized `argv`, candidate-relative cwd, minimal environment, and timeout. Before and after each verifier it creates a temporary index seeded from the immutable base, stages candidate contents into that temporary index, and compares the resulting tree OID; porcelain status is only supplemental. The real candidate index is unchanged by fingerprinting. This detects a verifier overwriting an already-modified path as well as adding a new path. The source checkout fingerprint is rechecked after every verifier and once more before readiness.

Full logs never enter terminal output. Bounded stdout/stderr artifacts expose only transaction-relative pointers, hashes, sizes, truncation, exit code, signal, duration, and status. Required failures, verifier mutation, source mutation, scope violations, policy violations, a changed candidate `HEAD`, diff-check failure, an empty required patch, or artifact limits prevent `candidate_ready`. Optional failures remain visible but do not alone block readiness.

Every old and new path in the final Git change set must appear in the transaction-private union of paths whose same-ID terminal Edit/Write execution was observed after an `allow_once` grant. ACP v1 tool updates are stateful deltas: `tool_call` alone establishes an ID; omitted fields in later updates inherit from that ID, while every present ID alias, native identity, display kind, path, or argv projection—including generic carriers inside x.ai metadata input—must exactly agree with prior state and the permission snapshot. After native identity exists, an x.ai-omitted fragment may carry only an exact compatible ACP display kind; legacy strong names or native-looking kinds are contradictions. Statusless post-establishment pre-grant enrichment is not execution, but a statusless update for an unknown ID is rejected. A permission-envelope status is merged before deciding, and any execution/terminal status prevents a grant. Because scope resolution is asynchronous, the complete same-ID snapshot is checked again immediately before `allow_once`. A permission grant without a terminal update, a silent write, a Bash execution, a pre-grant execution status, an unknown or reused ID, or a changed path carrier contributes no write provenance. A wrapper-rejected permission followed by same-ID `failed`/`cancelled` is a non-executed terminal; after a grant, `failed` is treated as a potentially partial execution attempt. In addition, the wrapper fingerprints the candidate tree at round start and immediately after ACP: every path in that current-round delta must be covered by current-round execution evidence, never only historical provenance. Clean rounds accumulate the union across `continue`; a current-round causal violation is nonrecoverable. Any verifier workspace mutation is also nonrecoverable, as is any workspace mutation left by a timed-out or otherwise failed ACP round. An ordinary verifier failure with an unchanged workspace remains recoverable. Failure-path partial patches are retained only when the full memory-only round redactor is available and the prospective patch contains none of its private values; otherwise the mutated workspace is retained without a partial patch or candidate record.

This is path-level observable provenance, not byte authorship. A malicious or nonconforming server could perform an unreported same-path overwrite within the same round after a legitimate observed Edit/Write, and the protocol does not bind exact final bytes to a particular tool event. Human inspection of the final diff remains required. The sorted path ledger is bound to the manifest by a content hash and is never exposed in normalized results. Its hash detects accidental or caller-level tampering but, like the other manifest bindings, is not a cryptographic defense against a same-UID process able to rewrite state and wrapper code together.

The candidate patch is staged only in the private clone. It is binary, full-index, no-ext-diff, hash-addressed, and tied to base and candidate tree OIDs. `apply` opens and validates the patch artifact once, hashes one in-memory buffer, and feeds those same bytes over stdin to `git apply --check`, the temporary-index proof, and the final apply. The final path seeds a temporary index from the immutable base, proves its tree, refreshes its stat cache against the already-rechecked clean source, proves that refresh did not change the base tree, and then runs `git apply --index` against that temporary index. This supports tracked modifications, deletes, renames, mode changes, and binary changes while the real index remains unchanged. `apply` rechecks source realpath, Git/common-Git bindings, base/HEAD, complete cleanliness, source content fingerprint, operation state, patch and candidate identities immediately before mutation and rechecks the source tree, real index, and `HEAD` immediately after. No 3-way application or automatic merge is allowed. These repeated checks do not provide a lock against a malicious same-UID process racing the apply.

## Result interpretation

`agentReport` is a bounded, sanitized Grok self-report and has `authoritative: false`. Evidence is limited to wrapper-recorded Git identities, changed paths, patch hash/tree, permission audit, verifier exit metadata and artifacts, and diff checks. Do not report the task complete until pending human residue has been reviewed.

Every result keeps these residue items pending:

- semantic code quality and product judgment;
- macOS child-network restriction is not an independent hard security boundary, and the requested external sandbox may fail closed;
- hardened verifier sandboxing allows global file reads and does not prove confidentiality, inherited-file-descriptor closure, resource limits, race freedom, or restoration after a malicious temporary write;
- trusted-local detects source mutation after execution but does not isolate hostile same-UID code; hostile code requires a container or VM boundary;
- trusted-local cached auth may be mutated by refresh or same-UID code before the wrapper detects it; detection does not prevent or roll back the host mutation;
- Grok permission behavior can vary by version, and private homes do not prove repository-native or system/MDM configuration layers absent;
- path-level Edit/Write provenance does not bind exact final bytes to an observed tool event, so the final diff remains human-reviewed;
- transaction/session binding does not resist same-UID state-and-code tampering;
- repeated apply checks do not lock out a same-UID concurrent mutation race;
- exact inherited-value redaction does not prevent transformed or encoded secret exfiltration.
