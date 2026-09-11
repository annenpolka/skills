---
name: devin-delegate
description: Delegate implementation, investigation, review, or consultation to Devin through ACP with a fixed model, execution evidence, and explicit session resume. Use when the user asks to delegate to Devin or use SWE through Devin. Includes a CLI route for sandbox execution; Cloud handoff requires a separate capability and authorization check.
---

# Devin Delegate

The caller owns the brief, acceptance, integration, and final answer. Use this file's
containing directory as `<skill-dir>`. Requires Python 3 and local Devin on macOS/Linux.
ACP is the default transport. Use [CLI runner](references/cli-runner.md) when sandbox
execution is required; do not silently switch transports after an error.

## Prepare

Check `devin --version`, `devin acp --help`, and `devin models list --format json`
once per environment. Use existing login, without reading or printing credentials.
Devin writes its own runtime logs; use the host's ordinary approval mechanism when
those writes are blocked. Do not replace the user's home or authentication store.

Default to **SWE-2 Max (`swe-2-max`)**. Explicit user model/effort choices override this.
Verify the exact catalog `model_uid`; `swe` follows the latest family version.
Do not substitute another model if the requested one is unavailable. The ACP runner
sets and checks the model on both new and loaded sessions and removes the inherited
refusal-fallback setting. Reported model labels remain server evidence, not attestation.

Inspect target instructions, configuration, and existing edits before dispatch.
Give a self-contained brief with goal, bounded read/edit scope, working examples,
acceptance commands, and first-repair scope. When behavior is settled, freeze caller-
owned representative acceptance tests before dispatch, then delegate implementation,
allowed checks, and first repair together. Supply exact dependency/stdlib paths when
known; resolve irrelevant broad searches with those paths. Keep credentials and
unrelated private data outside scope. Existing global/project skills, rules, hooks,
and MCP may still load. Empty `mcpServers` and disabled client filesystem/terminal
capabilities do not isolate Devin.

The ACP runner defaults to **`smart` for authorized implementation**. It may auto-run
commands its policy accepts and can still request permission. Select `accept-edits`
explicitly when automatic edits with more command approvals are intended. Use `ask`
for questions or `plan` for planning, and explicitly state no-edit scope. Modes are
not OS isolation. OpenCode `--auto` and Devin `smart` / `accept-edits` are different
approval conditions; record the effective mode when comparing outcomes. Read
[constraints](references/constraints.md) for permissions, Cloud boundaries, and pricing.

## Delegate

Write a brief with a file tool or quoted heredoc, then run:

```bash
python3 "<skill-dir>/scripts/acp_relay.py" \
  --cd /absolute/path/to/workspace \
  --brief /absolute/path/to/brief.txt \
  --model swe-2-max --mode smart --timeout 1800 \
  --output-root /absolute/path/to/private-evidence
```

Model and output root are optional; defaults are SWE-2 Max and a unique system-temp
folder. Use a persistent private output root when evidence must survive temp cleanup.
The runner prints its private run directory immediately. Poll that managed process;
read `events.jsonl`/`result.json` for progress. Do not dispatch a duplicate on a yield.

Use an explicit 1800-second envelope for an ordinary implementation attempt; adjust
it to the task and user constraints. `--timeout` bounds one `session/prompt` in wall
time, including thinking, waiting, and tools; progress does not reset it. Setup RPCs
have separate deadlines and cancellation has a cleanup grace. It is **not a token or
spending cap**. Judge progress from current-turn reads, edits, checks, and repairs,
not a short interval without a diff. When cost matters, reduce duplicate caller work
and bound scope; elapsed time alone does not measure cost.

For shell operations already authorized by the task, write a JSON array of exact
command strings and pass `--allow-commands /absolute/path/to/commands.json`. The
runner can grant a matching exec request once; it never grants a prefix, permanent
permission, or Bypass. This controls reverse requests, not tools Devin auto-approves.
Do not describe the command list as an OS boundary or universal execution allowlist.

Unmatched permission requests are recorded and cancel the turn with status
`permission_required`. Inspect the requested command and task scope, then resume with
an appropriate exact grant if existing authorization covers it. Ask the user only
when the actual operation needs new authorization. Unknown client requests also stop
the turn. Do not widen permissions just to make a blocked run continue.

For a correction, pass `--session <sessionId>` from `result.json`, the same workdir,
and a delta brief. The runner checks `loadSession`, loads that exact session, reapplies
model/mode, and excludes historical replay from the current answer. Raw events still
include replay; do not count replayed tools as new work. An unavailable load capability
is an error, not permission to create a replacement conversation.

## Verify and finish

`result.json` saves `requestedMode` and `promptTimeoutSeconds` from startup, plus
session ID, effective configuration, reported model, current answer, permissions,
stop reason, usage, and process cleanup errors. `elapsedSeconds` includes setup and
cleanup as well as the prompt. The session ID is saved before prompting.
`turn_completed` requires the matching prompt response with `end_turn`; it still means
**caller verification is outstanding**. Never infer task
success from tool titles or the latest tool status: Devin was observed to emit
`failed` followed by `completed` for a cancelled command. Preserve raw events.

Distinguish `timed_out` (the configured prompt deadline), `permission_required`
(an unmatched approval request), and `interrupted` (caller SIGINT/SIGTERM). An early
stop establishes only the result within that run, not inability to finish the task.

Timeout/SIGINT/SIGTERM during a turn sends `session/cancel`, waits up to five seconds
for its matching prompt response, then stops the owned process group. If group
signaling is denied, direct-child shutdown is attempted and `cleanupErrors` records
that descendants are unverified. Detached or remote jobs require separate management.
Confirm shutdown before taking over files; keep cancelled work explicitly partial.

Independently inspect tracked diffs **and untracked file contents**, check fixed tests
were preserved, and run relevant acceptance checks. Status snapshots are not file-
content baselines or edit attribution. Send concrete failures back to the same session
for bounded repair; diagnose repeated non-progress before taking over. Research claims
also need verification.

Keep raw logs private. Preserve unknown cost as null; usage fields are raw provider
reports, not dollars, and their aggregation semantics must be checked before summing,
especially across resumed runs. A final usage report need not describe the whole
session. Compare task scope, approval mode, time limits, and caller effort before
attributing differences to a model; the observed runs are not controlled benchmarks.

Report model/session, observed changes, caller verification, and material limits.
Commit, push, install, and Cloud transfer follow the user's existing authorization.
For maintenance and observed protocol details, see [ACP contract](references/acp.md).
