# CLI contract

Checked 2026-09-15 against Claude Code 2.1.272 on macOS with claude.ai (Pro)
authentication. Re-check time-sensitive details before relying on them; flags gain
minimum versions over time. Probe evidence: [validation.json](validation.json).

## Invocation shape

`claude -p` reads the prompt from stdin when piped, prints the result to stdout, and prints
diagnostics to stderr. It exits 0 on success and non-zero when the run fails. Argument and
startup errors go to stderr with no JSON on stdout (for example
`Error: Session ID ... is already in use.` or
`No conversation found with session ID: ...`).

- `--output-format json` emits one JSON object when the run finishes.
- `--output-format stream-json --verbose` emits newline-delimited events; the last line is
  the `result` message. `system/init` carries `model`, `permissionMode`, `tools`,
  `mcp_servers`, `session_id`, `apiKeySource`, and command/skill counts. SessionStart hook
  events (`hook_started`, `hook_response`) can precede `system/init`. Denials appear as
  `permission_denied` system messages and again in the result's `permission_denials`.
- `--include-partial-messages` and `--forward-subagent-text` add streaming detail.
- stdin is capped at 10MB; reference large files by path instead of piping them.
- `claude --help` does not list every flag or accepted value. `--max-turns` works while
  being absent from help, and `--permission-mode default` works even though help's choice
  list shows `manual` (the alias) without `default`; `system/init` reports `default`.
  Absence from help is not evidence that a flag or value is unavailable.
- Pin `--permission-mode` explicitly on every dispatch and resume. The effective startup
  mode can differ from the built-in `default`: observed in 2.1.272 that a `--safe-mode`
  dispatch without `--permission-mode` reported `permissionMode: "auto"` in `system/init`
  and auto-approved an edit on a model that supports auto mode, while an explicit
  `--permission-mode default` denied the same edit. Read `system/init.permissionMode` as the
  authoritative startup mode for a run.

## Result fields (json output)

| Field | Meaning |
| --- | --- |
| `subtype` | `success` or an error subtype such as `error_max_turns`, `error_max_budget_usd`, `error_during_execution` |
| `is_error` | Boolean; the authoritative failure marker. Can be `true` while `subtype` is `success` |
| `result` | Closing text; `null` on several error results |
| `session_id` | Exact ID for resume |
| `num_turns`, `duration_ms`, `stop_reason`, `terminal_reason` | Run shape (`terminal_reason: max_turns` accompanies `error_max_turns`) |
| `permission_denials` | Tools whose permission requests were refused; non-empty does not by itself fail the run |
| `usage` | Main-loop token counts only; excludes subagents |
| `total_cost_usd`, `modelUsage` | Client-side cost estimates. `modelUsage` includes subagents and names effective models; entries carry `costBasis` (`list`/`managed`/`unknown`) |
| `subagent_stats`, `fast_mode_state`, `api_error_status` | Additional run metadata |

Success decision: exit code 0 AND `is_error == false` AND `subtype` is not an error subtype.
Treating `subtype == "success"` as sufficient is a known trap: a `--bare` run without API-key
credentials returned `subtype: success`, `is_error: true`,
`result: "Not logged in · Please run /login"`, exit 1.

## Observed failure signatures (2.1.272)

| Case | Exit | subtype | is_error | Notes |
| --- | --- | --- | --- | --- |
| Normal completion | 0 | `success` | false | Edits depend on permission mode |
| Write requested, default mode, no approval host | 0 | `success` | false | `permission_denials: [Write]`; no file created |
| Bash write (`echo pink > file`) in default mode | 0 | `success` | false | `permission_denials: [Bash, Write]`; no file created |
| Write requested with `--permission-mode acceptEdits` | 0 | `success` | false | File created; no denials |
| `--bare` under subscription login | 1 | `success` | **true** | `Not logged in · Please run /login` |
| `--max-turns 1` with a tool-using task | 1 | `error_max_turns` | true | `num_turns: 2`, `result: null`, `terminal_reason: max_turns` |
| `--max-budget-usd` below the first response cost | 1 | `error_max_budget_usd` | true | `result: null`; stops after the crossing response |
| Reused `--session-id` for a new conversation | 1 | none | — | stderr: `Session ID ... is already in use.` |
| Resume of an unknown session ID | 1 | none | — | stderr: `No conversation found with session ID: ...` |
| SIGTERM during a turn | 143 | none | — | Unfinished turn, no result; resume continues it |

## Sessions and resume

- Preassign `--session-id <uuid>` (valid UUID) to know the ID before completion; the result
  echoes it. Reusing that ID for a new conversation fails; continuation is `--resume <id>`.
- `-p` and SDK sessions do not appear in the session picker or interactive
  `claude --continue`. `claude -p --continue` does include `-p` sessions, but it selects
  only the directory's most recent conversation; captured session IDs are the reliable
  resume path.
- A resumed session restores conversation history, model (unless a `--model` flag or
  `ANTHROPIC_MODEL`-family variable picks one at launch), and the agent. It does not
  restore launch flags such as `--settings`, `--mcp-config`, `--plugin-dir`,
  `--fallback-model`, `--add-dir`, or directories added mid-session.
- `-p --resume` starts in the permission mode a new `-p` run would start in, not the mode
  the session ended in. Plan mode is restored only under documented conditions
  (`--permission-prompt-tool` passed, no `--permission-mode`, no `--fork-session`, not
  started through channels).
- Session lookup by ID covers other projects since v2.1.223; the local version resolves IDs
  machine-wide. `--fork-session` branches to a new ID instead of continuing.
- `--no-session-persistence` makes a run unresumable. Transcripts live under
  `~/.claude/projects/<project>/<session-id>.jsonl` unless `CLAUDE_CONFIG_DIR` moves them.

## Limits and stopping

- `--max-turns` and `--max-budget-usd` apply to print mode only and are per invocation.
  Reaching either produces an error result with `result: null`; inspect the worktree for
  partial work before resuming with new limits.
- `--max-budget-usd` bounds the client-side cost estimate within one invocation. It is not
  a spending guarantee and does not carry across resumes.
- There is no built-in wall-clock timeout. Supervise from the host; do not dispatch a
  duplicate on yield.

## Stream, background, and exit behavior

- Background Bash tasks are terminated about five seconds after the final result.
- Background subagents keep the `-p` process open until they finish, with a 10-minute idle
  wait ceiling (`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS`).
- `--bg` cannot be combined with `-p`; agent view is a separate transport with its own
  management commands (`claude agents --json`, `logs`, `stop`).
- SIGTERM exits 143, records the in-flight context as killed, runs SessionEnd hooks, and
  leaves the turn unfinished with no result; resuming continues that turn. SIGINT ends the
  turn instead.

## Version gates to check before relying on a flag

- `--permission-prompts none`: v2.1.259+.
- `modelUsage[].costBasis`: v2.1.246+.
- `-p --resume` plan-mode restoration: v2.1.246+.
- Cross-project `--resume` ID lookup: v2.1.223+.
- Nested subagent stream messages: v2.1.219+.
- `--forward-subagent-text`: v2.1.211+.
- `--max-turns` queued-input behavior: v2.1.205+.

## Upstream references

- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [CLI reference](https://code.claude.com/docs/en/cli-reference)
- [Manage sessions](https://code.claude.com/docs/en/sessions)
- [Track cost and usage](https://code.claude.com/docs/en/agent-sdk/cost-tracking)
