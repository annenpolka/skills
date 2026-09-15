---
name: claude-code-delegate
description: Delegate implementation, investigation, review, or consultation to the Claude Code CLI (`claude -p`) with an explicit model, structured JSON result evidence, and exact session resume. Use when the user asks to delegate a task to Claude Code, run Claude Code non-interactively, or resume a Claude Code session.
---

# Claude Code Delegate

The caller owns the brief, permission choices, acceptance, integration, and the final
answer. Claude Code is the executor; its closing text is not evidence. Read referenced
files relative to this file. Requires the Claude Code CLI on macOS/Linux/WSL.

Print mode (`claude -p`) is the only transport this skill uses. Background sessions
(`claude --bg`, agent view) and the Agent SDK are separate workflows; do not switch to
them after an error.

## Prepare

Check `claude --version` and the login state once per environment (`claude auth status | jq
'{loggedIn}'` — the raw output also carries the account email and org ID). Use the existing
login; never read, print, or copy credentials, and keep raw auth output out of reports and
artifacts. Claude Code writes its own transcripts under `~/.claude/`, so the host must permit
those runtime writes.

Pass `--model` on every call and use the model the user named exactly. When no model is
named, default to `opus` and say so in the report. Never substitute another model because
the requested one failed. The result's `modelUsage` keys name the effective model; check
them instead of trusting the alias. `--fallback-model` degrades silently by design; pass
it only when the user allows that, and record it.

Inspect the target repository's instructions, hooks, MCP config, and current changes
before dispatch. A `-p` run skips the workspace trust dialog and still loads project
hooks, MCP servers, CLAUDE.md, and skills unless you block them. `--safe-mode` disables
those customizations while keeping subscription auth; `--setting-sources` selects which
settings sources load; `--strict-mcp-config` ignores non-explicit MCP configs. `--bare`
also skips OAuth and fails under subscription login, so it is not a casual isolation flag.
Decide the load boundary explicitly and record it in the run evidence; do not assume `-p` is
isolated. Decide it from the customizations you actually observed: when none of the
workspace's CLAUDE.md, hooks, skills, or MCP servers are part of the task, `--safe-mode` is
the default; when the repository's own conventions are part of the task, keep project
settings and use `--strict-mcp-config` to drop unrelated MCP servers.

Write a self-contained brief: goal, the positive edit scope (which files may change, and
whether new files may be created), bounded read scope, working examples, acceptance commands,
and first-repair scope. Keep file-creation rules consistent across the brief, the allowlist, and
the caller's rerun: a no-new-files rule needs a bytecode-free command (for example `python3 -B`),
and where the workspace already carries runtime artifacts such as `__pycache__` or the README
prescribes a bytecode-writing command, prefer its bytecode-free form in the brief, the allowlist,
and the caller's rerun, and scope the rule to source and spec files only when no bytecode-free
form exists. State the no-change predicate explicitly (for example: identical file set and
identical bytes for the files in scope), and, when you will quote the closing text, state the
expected output language over the whole response (for example, "Respond entirely in English"). Keep credentials and unrelated private data outside both
the brief and the permitted reads. Supply exact paths for known dependencies instead of
asking for broad searches. Pass the brief through stdin to avoid shell interpolation; piped
stdin is capped at 10MB, so reference large inputs by path.

Choose permissions for the task, not for convenience:
- Implementation reviewed after the fact: `--permission-mode acceptEdits`, plus
  `--allowedTools` entries derived from the exact acceptance commands the task needs (the
  space before `*` enables prefix matching, so `Bash(python3 -B -m unittest *)` covers the
  bytecode-free test run).
- Read-only investigation, review, or consultation: pass `--permission-mode default`
  (Manual) explicitly and never rely on the startup default: ambient `permissions.defaultMode`
  settings and flag interactions can change it, and `--safe-mode` does not pin it. Manual runs
  reads and the built-in read-only Bash set; do not add an edit mode. For each acceptance
  command that needs to run, decide before dispatch who produces the evidence — an exact
  non-mutating `--allowedTools` entry for the executor (for example
  `Bash(python3 -B -m unittest *)`), or a caller-side rerun — prefer non-mutating forms, and
  attribute which side produced each result. A caller-side rerun is not a workaround of a
  denial; an executor-side denial is reported as a limitation. The caller owns no-change claims:
  instruct the executor not to assert baseline-dependent invariants it cannot evidence from its
  own run, and give its closing format an explicit abstention line (for example, "No-change: not
  claimed — caller-owned") so the abstention is part of the required output rather than a rule
  that is easy to drop.
- Locked-down unattended runs: `--permission-mode dontAsk` with an exact `--allowedTools`
  allowlist, optionally `--permission-prompts none` so denials never wait on a host.
- `bypassPermissions` / `--dangerously-skip-permissions` only inside a container or VM.

Permission modes are not OS isolation, and `acceptEdits` still denies Bash commands beyond
a small filesystem set. Bound the run with `--max-turns` and `--max-budget-usd` (print mode
only; the budget compares against a client-side estimate, not a bill).

## Delegate

Write the brief to a private file, create a run directory, and preassign a session ID so the
session stays resumable even if the process is killed:

```bash
# for read-only work, pass --permission-mode default instead of acceptEdits
run_dir=/absolute/private/run-dir && mkdir -p "$run_dir"
sid=$(uuidgen | tr 'A-Z' 'a-z')
cd /absolute/path/to/workspace
claude -p \
  --model haiku \
  --permission-mode acceptEdits \
  --allowedTools "Bash(python3 -m unittest *)" \
  --max-turns 40 --max-budget-usd 10 \
  --session-id "$sid" \
  --output-format json \
  < /absolute/path/to/brief.txt > "$run_dir/result.json" 2> "$run_dir/stderr.log"
```

- Run this inside the host's managed background process and read `result.json` after exit.
  If the host instead suspends you until the process ends, wait for that completion; in
  both cases, never start a second dispatch because the first yielded.
- Persist the exit code beside the result (for example append
  `; code=$?; echo "$code" > "$run_dir/exit_code.txt"`); the success decision needs it.
- Choose the output format from the evidence you must report: use `--output-format stream-json
  --verbose` piped to a file when you need progress, stall detection, or the run's own
  `system/init` evidence (permissionMode, model, mcp_servers) because the report must state the
  effective mode or load boundary; its last line is the result message, and SessionStart hook
  events can precede `system/init`. Keep plain `json` when the result message alone decides the
  outcome, confirm the mode or boundary indirectly, and say which path you used.
- `--session-id` must be a fresh UUID. Reusing one for a new conversation exits non-zero
  with `Session ID ... is already in use.`

For a correction or a limit-interrupted continuation, send a delta brief to the same
session:

```bash
claude -p --resume "$sid" \
  --model haiku --permission-mode acceptEdits \
  --allowedTools "Bash(python3 -m unittest *)" \
  --max-turns 20 --max-budget-usd 5 \
  --output-format json \
  < /absolute/path/to/delta-brief.txt > "$run_dir/result-2.json"
# plus any flag that shaped the first dispatch's load boundary, such as --safe-mode
```

Re-pass model, permission mode, allowed tools, limits, and every flag that shaped the load
boundary such as `--safe-mode` on every resume: a `-p --resume` run starts in the permission
mode a new `-p` run would start in, not the mode the session ended in, and launch flags such as
`--settings`, `--mcp-config`, `--add-dir`, and `--fallback-model` are not restored. Treat the
restored and non-restored lists as open: re-pass anything that shapes the run or the load
boundary rather than assuming it survives. A correction delta brief carries the failing input,
actual result, expected behavior, and the regression check; a limit-interrupted continuation
carries the caller-verified worktree state and the new limits with their basis. Use the exact
session ID from the result; `--continue` selects only the directory's most recent session, so
it is not a delegation-safe resume path.

## Verify and finish

Decide the outcome from structured fields, never from the closing text alone:
- Success requires exit code 0, `is_error == false`, and a non-error `subtype`. A `--bare`
  auth failure returned `subtype: success` with `is_error: true`, so check the fields.
- Read `permission_denials`. A run can end "successfully" with the requested work denied; a
  write-denied run returned exit 0, `is_error: false`, and no file. If the task needed the
  denied tool, settle the scope or authorization with the user; do not add
  `bypassPermissions` or widen the allowlist just to make a blocked run continue.
- `error_max_turns` and `error_max_budget_usd` are partial results with `result: null`; the
  first limit reached decides the subtype, so when a run must exercise one stop path, keep the
  other bound well above a conservative single-run estimate (with no prior measurement, a floor
  of a few dollars is ample for a one-turn probe). Inspect the worktree (a minimal-turn
  stop may contain no edits), state the verified state in the delta brief, and resume with
  explicit new limits sized to the remaining work (count the remaining edits, checks, and
  repairs, and allow headroom over the last run's observed usage) or take the work over; record
  the chosen limits and that basis.
- Exit 143 means SIGTERM: the turn is unfinished and no result JSON exists. Inspect partial
  edits, then resume that session to continue the unfinished turn.
- Exit non-zero with no JSON usually means a startup or argument error; read `stderr.log`
  (for example `No conversation found with session ID: ...`).

Confirm the effective mode and load boundary when the report must state them: with `stream-json
--verbose`, read `permissionMode`, `model`, and `mcp_servers` from `system/init`; with plain
`json`, confirm indirectly from the explicit flags, `permission_denials`, and the observed
actions, and say which evidence was available. A mode that is not the one you chose is a setup
anomaly: fix the flags and re-dispatch instead of accepting the run's permissions.

Independently inspect tracked diffs and untracked file contents, confirm protected tests were
preserved, and run the acceptance commands caller-side. When the target is not a git
repository, take a caller-owned baseline before dispatch (file copy or checksums) and compare
against it. A returned result, commit, or passing mock does not prove the intended effect.
For consultation or research, verify the claims that matter to the task rather than repeating
them. Send concrete failures back to the same session for bounded repair; stop retrying when
the same failure recurs without progress or the remaining work is smaller than the
verification cost.

Keep raw runs private; they can contain source code and task context. `total_cost_usd` and
`modelUsage[].costUSD` are client-side estimates, not billing, and `usage` excludes subagent
tokens. Report the requested model, the effective model, the session ID, observed changes,
caller verification, and material limits. Commit, push, install, or cloud transfer follow the
user's existing authorization.

Read [CLI contract](references/cli-contract.md) for verified flags, result fields, and failure
signatures. Read [constraints](references/constraints.md) for permission, isolation,
authentication, and background-session boundaries. [Validation](references/validation.json)
records the probe evidence behind these claims.
