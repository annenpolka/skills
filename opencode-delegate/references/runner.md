# Runner contract

Read this when inspecting a result, resuming a task, or diagnosing a failed call.
`scripts/relay.mjs --help` lists the supported arguments. The implementation uses
Node.js built-ins only, invokes OpenCode without a shell, and feeds the exact brief
through stdin. It sets both the child cwd and `PWD` to the canonical `--cd` path.

## Artifacts

Each run creates a private directory (mode `0700`) containing files with mode `0600`:

| File | Meaning |
| --- | --- |
| `brief.txt` | Exact input sent to OpenCode |
| `events.jsonl` | Raw stdout bytes, including any non-JSON plugin output |
| `stderr.log` | Raw CLI diagnostics |
| `final.txt` | Text from the last assistant message that emitted text |
| `result.json` | Structured outcome, published atomically when execution ends |

The default directory is a fresh system temporary directory. `--out-dir` must name
a new directory whose parent already exists; existing directories are rejected to
avoid mixing runs or reading an old result. These artifacts can contain source code
and task context. Keep them local and do not commit them by default. Temporary files
are not a durable archive; retain a run explicitly if later work needs its evidence.

The output directory does not isolate OpenCode: the process uses the target working
directory, installed configuration, credentials, runtime storage, and host permissions.
`--pure` only suppresses external OpenCode plugins. It is not a sandbox.

## Result fields

The schema is `opencode-delegate.result.v1`.

| Field | Meaning |
| --- | --- |
| `status` | `completed`, `failed`, `timeout`, `aborted`, or `opencode_unavailable` |
| `exitCode` | Helper exit code; nonzero for every unsuccessful outcome |
| `childExitCode` | OpenCode's exit code, present after dispatch; can be zero on failure |
| `signal` | Terminating signal if known; null for an ordinary exit |
| `model`, `agent`, `variant`, `auto`, `pure` | Requested dispatch settings |
| `opencodeVersion` | Result of the bounded `opencode --version` preflight |
| `sessionId`, `resumed` | Exact session for follow-up and whether this call resumed one |
| `finalMessage` | Last emitted assistant text message; may be empty |
| `lastStepReason`, `eventCount`, `errors` | Stream evidence used for completion detection |
| `cost` | Sum of reported step costs, deduplicated by step ID; null when absent |
| `gitBefore`, `gitAfter` | Git porcelain status arrays, or null if unavailable/non-repository |
| `workdir`, `startedAt`, `finishedAt`, `paths` | Execution context and artifact locations |
| `error`, `stderrTail` | Failure explanation and captured diagnostic tail when available |

`completed` requires a zero CLI exit, a closing step with reason `stop`, and no error
events or detected scanner overflow. A provider error emitted as JSON with exit zero
is a failure. A `length` or `tool-calls` ending is incomplete. A completed run can still
contain a refusal or incorrect implementation: read the response and verify the work.
If OpenCode's event format changes, inspect the raw events before changing this rule.

Intermediate assistant messages stay in `events.jsonl`. Repeated text parts replace
earlier versions by ID. If a run ends with tools and no new text, `finalMessage` may
still be an earlier message; inspect the events and worktree. A reported cost of zero
is provider/CLI metadata and does not establish that the call was free.

## Recovery

- **Exit 2, no result:** argument, brief, working-directory, or output-directory error.
  Fix it before dispatching again.
- **`opencode_unavailable` / exit 127:** the executable is missing from PATH.
  Verify the active installation with `command -v opencode` and `opencode --version`.
- **Version preflight failure:** no task was dispatched. The probe is capped at
  10 seconds (or the requested timeout if shorter).
- **Auth/model/permission failure:** inspect `error`, `errors`, `stderr.log`, and the
  ending events. Confirm the exact model with `opencode models <provider>`; do not
  switch models or enable `--auto` merely to conceal the failure.
- **Runtime filesystem denial:** OpenCode also writes its normal logs and database
  outside the target directory. Use the host's permission workflow for those writes;
  moving only the result directory does not fix that denial.
- **Timeout / exit 124:** the helper sends SIGTERM to its child process group and
  escalates to SIGKILL after two seconds. Inspect partial edits before resuming.
- **Aborted / signal exit:** SIGINT, SIGTERM, and SIGHUP received during dispatch use
  the same group cleanup and publish an aborted result after the process closes.
  To end a stalled run deliberately, use the host's managed interrupt or send SIGINT
  to the exact owned relay process after verifying its identity. Let the helper stop
  its child group, then wait for exit and inspect `result.json` and the partial diff.
  Do not broadly kill OpenCode processes or assume that sending the signal proves
  shutdown. Completed edits and passing checks can justify accepting a partial diff
  after independent verification; they do not change `aborted` into `completed`.
- **Process gone without a result:** treat the outcome as incomplete. SIGKILL, a host
  crash, or an artifact-write failure can prevent final publication. Inspect the
  process tree, raw logs, and working tree before rerunning.

Resume using `--session` plus a delta brief and the explicit model. There is no
implicit retry, provider fallback, `--continue`, session sharing, Git commit, or
installation action in the helper. OpenCode configuration still governs its own behavior.

## Verification

Run the deterministic runner checks without contacting a model:

```bash
node --test opencode-delegate/tests/relay.test.mjs
```

These exercise a fake executable through the real process boundary: stdin and cwd,
Unicode event reconstruction, session resumption arguments, permissions flags,
private artifacts, Git status, exit-zero errors, failed/missing executables,
timeouts, descendant cleanup, and parent cancellation.

Live integration was checked on 2026-09-08 with OpenCode `1.18.29` and the explicitly
requested `deepseek/deepseek-v4.1-flash-expires-on-0910`. This dated identifier is a
validation record, not a permanent default or an availability guarantee. See the
following observed outcomes:

- A fresh `plan` call returned the exact requested smoke-test response.
- A `build` call through the helper implemented a tag-normalization function in a
  temporary workspace. All four prewritten behavioral tests failed before the edit
  and passed afterward. The calling agent reran them successfully and confirmed
  the test file's SHA-256 was unchanged. The model edited only the permitted source file.
- A `plan` follow-up through the helper resumed the exact captured session ID and
  returned the marker from the prior brief without being told its value again.
  Both helper runs reported `completed`, with the requested model and `auto: false`.

A further implementation exercise on 2026-09-09 used the same explicitly selected
model and a single session for two bounded build calls. The caller supplied working
code, a one-file edit scope, and prewritten behavioral tests. The first call passed
all 32 runner tests, but independent review found that an immediately resolving wait
with a stopped clock could starve its watchdog, and cancellation reactions accumulated.
A new failing test and a precise delta brief led to a passing correction in that session.
The caller separately fixed late connection completion mutating an already returned
result and verified the real system integration. These observations motivate the
[implementation guidance](implementation.md); they do not establish general model
quality or a delegation speedup. The CLI/result contract and earlier smoke records
remain applicable to their stated scope.

## Upstream references

- [Reference skill at revision b781ee2](https://github.com/amElnagdy/delegate-skills/tree/b781ee2e23089630e2fbee1cfd6174afe4edeb76/skills/opencode-delegate):
  brief-driven delegation, stream capture, session IDs, and independent verification.
  The event scanner is adapted under the included [MIT license](../LICENSE).
- [OpenCode CLI](https://opencode.ai/docs/cli/): `run`, model/session/agent flags,
  plugin suppression, and environment configuration.
- [OpenCode permissions](https://opencode.ai/docs/permissions/): agent permissions
  and auto-approval behavior.
