# CLI contract

Checked 2026-09-23 against Codex CLI 0.155.1 on macOS with ChatGPT login. Re-check
time-sensitive details before relying on them; flags and model names change between releases.
Probe evidence: [validation.json](validation.json). The helper builds these invocations (see
[helper.md](helper.md)); this file is for diagnosing it or running `codex exec` by hand.

## Invocation shape

`codex exec [OPTIONS] -` reads the brief from stdin, prints events to stdout with `--json`, and
prints diagnostics to stderr. When a positional prompt is also given, piped stdin is appended to
it as a `<stdin>` block, so pass only one of them.

- `--json` emits JSON Lines events (see below).
- `-o, --output-last-message <file>` writes the final agent message to a file.
- `--output-schema <file>` constrains the final message to a JSON Schema; the `-o` file then
  holds the JSON object (observed under ChatGPT login).
- `-C, --cd <dir>` sets the working root on `exec`, but `exec resume` has no `-C`, so this skill
  uses `cd` for both.
- `-c key=value` overrides any `config.toml` key; the value is parsed as TOML and falls back to
  a raw string. Quote string values (`-c 'approval_policy="never"'`) so the parse is explicit.
- `codex exec` has no `-a/--ask-for-approval`; set the approval policy with `-c`.
- There is no turn limit, budget limit, or built-in wall-clock timeout.

`codex exec resume [SESSION_ID] [PROMPT]` accepts `-m`, `-c`, `--json`, `-o`,
`--output-schema`, `--ignore-user-config`, `--ignore-rules`, `--skip-git-repo-check`,
`--ephemeral`, `--last`, and `--all`. It has no `-s`, `-C`, `--add-dir`, or `-p/--profile`.

## Events (`--json`)

| Event | Fields and meaning |
| --- | --- |
| `thread.started` | `thread_id`; first event; the resume ID |
| `turn.started` | Start of a turn |
| `item.started` / `item.completed` | `item` with `id`, `type`, and type-specific fields |
| `turn.completed` | `usage`: `input_tokens`, `cached_input_tokens`, `cache_write_input_tokens`, `output_tokens`, `reasoning_output_tokens`; a running total, not the turn's own count (a resumed turn reported 174198 input tokens after 82460 on the first). After an interrupted turn it omitted that turn's usage (83876 reported; the rollout's thread total was 103578) |
| `turn.failed` | Turn failed; carries the error |
| `error` | Top-level error, emitted before `turn.failed` on API errors |

Item types include `agent_message` (`text`), `reasoning`, `command_execution` (`command`,
`aggregated_output`, `exit_code`, `status`), `file_change`, `mcp_tool_call`, `web_search`,
`todo_list`, and `error` (`message`). An `error` item is a warning inside a successful turn (for
example `Skill descriptions were shortened to fit the skills context budget.` or
`Model metadata for <model> not found`).

The stream does not report the model, sandbox, or approval policy, and it does not always show
denied attempts: in one run a sandbox-denied first write did not appear as a
`command_execution` item, and only the later escalated command did. The rollout is the
authoritative record.

## Rollout (effective settings)

Each thread writes `$CODEX_HOME/sessions/YYYY/MM/DD/rollout-<timestamp>-<thread_id>.jsonl`.

- `session_meta` (first line): `id`, `cwd`, `cli_version`, `originator` (`codex_exec`), `source`
  (`exec`), `model_provider`, `git` (commit and branch), and the base instructions.
- `turn_context` (one per turn): `cwd`, `model`, `effort`, `approval_policy`,
  `approvals_reviewer`, `sandbox_policy` (`type`, `writable_roots`, `network_access`,
  `exclude_tmpdir_env_var`, `exclude_slash_tmp`), `permission_profile`, `personality`, and
  `workspace_roots`. Read the last `turn_context` for the latest turn. `writable_roots` is omitted
  when there are no extra roots, and `effort` is `null` when no reasoning effort was set.
- `token_usage_record` records (one per model request) carry `turn_id`, `turn_token_usage` (the
  turn so far), and `thread_token_usage` (the thread so far, including interrupted turns). The
  last record for a turn is the authoritative usage.
- `event_msg` records with `payload.type == "token_count"` carry `info.total_token_usage` (the
  process's running total), `info.last_token_usage` (the last model request only), and `rate_limits` (`primary.used_percent`, `window_minutes`, `resets_at`).
- `response_item` records hold the injected instructions (`AGENTS.md`, skills, permissions,
  memories), the brief, and every tool call. Extract fields with `jq`; do not copy the file.

## Success decision

Exit code 0 AND the last event is `turn.completed` AND no `turn.failed` or top-level `error`
event. Exit 0 is not sufficient: a SIGTERM-stopped run exited 0 with no terminal event.

## Observed failure signatures (0.155.1)

| Case | Exit | Events | Notes |
| --- | --- | --- | --- |
| Normal completion | 0 | ends with `turn.completed` | An `error` item warning can precede it |
| Write in `-s read-only`, approval `on-request`, reviewer `auto_review` | 0 | `turn.completed` | Escalated write approved; file created |
| Write in `-s read-only`, approval `never` | 0 | `turn.completed` | `operation not permitted` in command output; `exit_code` 0 because the command masked it |
| Unsupported model | 1 | `error`, `turn.failed` | 400 `invalid_request_error`: not supported with a ChatGPT account |
| Non-git, untrusted directory | 1 | none | stderr: `Not inside a trusted directory and --skip-git-repo-check was not specified.` |
| Resume of an unknown or ephemeral thread ID | 1 | none | stderr: `thread/resume failed: no rollout found for thread id <id>` |
| SIGTERM during a command | 0 | no terminal event | The command's `sleep` child survived as an orphan; the thread resumed |
| SIGINT during a command | 1 | no terminal event | stderr `failed to record rollout items`; the thread still resumed |
| Resume after a SIGTERM-interrupted command | 0 | ends with `turn.completed` | stderr repeats `Custom tool call output is missing for call id <id>` for the interrupted call; the turn completes normally |

## Resume

- `codex exec resume <thread_id>` continues the thread; `thread.started` repeats the same ID.
- Restored: the conversation. Not restored (observed): sandbox, approval policy, model (falls
  back to the config default), working directory (the process cwd is used), and
  `--ignore-user-config`. Treat every launch setting as not restored and re-pass it.
- `--last` picks the most recent recorded thread (filtered by cwd unless `--all`); use the exact
  ID instead.
- `--ephemeral` writes no rollout; a later resume fails with `no rollout found`.

## Preview what loads

`codex debug prompt-input [-c ...] <prompt>`, run in the target directory, renders the
model-visible input list without a model call: injected `AGENTS.md`, skills, the permissions
block (sandbox mode, approval policy, writable roots, network). It accepts `-c` but not
`--ignore-user-config`, and the memory block seen in real runs did not appear in it, so treat it
as a preview; the rollout `turn_context` remains the evidence for a run.

## Upstream references

- [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- `codex exec --help`, `codex exec resume --help`
