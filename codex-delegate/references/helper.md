# Helper contract

`scripts/codex-delegate.sh` runs `codex exec` with the settings this skill requires and writes
evidence for each turn. It uses bash 3.2+, `jq`, and standard `find`/`stat`/`tar`/`shasum` or
`sha256sum`. `bash scripts/codex-delegate.sh --help` lists the commands. `tests/run-tests.sh`
exercises it against a fake `codex`.

On Windows it runs under Git Bash or MSYS2 (`uname` `MINGW*`/`MSYS*`/`CYGWIN*`) and then also
uses `powershell.exe` (`Get-CimInstance Win32_Process`) and `taskkill` for native processes, and
`/proc` in place of `pgrep`/`ps -o`. It calls a native `jq.exe` with `--binary` so its output
has no carriage returns. See [constraints](constraints.md#windows-git-bash--msys2).

## Commands

| Command | Effect |
| --- | --- |
| `snapshot <target> <new-dir>` | Records `paths.txt` (`TYPE MODE ./path`, sorted, types `d f l o`), `sha256.txt` (every regular file, including `.git`), `copy/` (the target without `.git`), and `target.txt`. Refuses an existing directory or one inside the target |
| `compare <snapshot> <target-or-snapshot>` | Prints added, removed, and type/mode-changed paths, changed files, and a unified diff for each changed file outside `.git`. Exit 0 identical, 1 different |
| `run ...` | First turn of a new thread (see below) |
| `resume --run-dir D --brief F [--limit S] [--dry-run]` | Next turn on the recorded thread with the stored settings |
| `check --run-dir D [--turn N]` | Exit 3 while the helper or the launcher of the turn is alive and no result exists; otherwise rebuilds `result.json` and prints the status |
| `stop --run-dir D` | Records the running launcher's descendants, marks the turn `stopped`, and sends SIGTERM to the launcher PID; on Windows it first ends the launcher's Windows process tree with `taskkill /T /F` (the watchdog does the same) |
| `reap --run-dir D [--turn N]` | For each recorded descendant, sends SIGTERM only if its current command line equals the recorded one (`taskkill /F` for a native Windows `w<WINPID>`); logs `signaled`, `gone`, or `skipped` to `reap.log` and rebuilds the result |

`run` options: `--run-dir`, `--workspace`, `--model`, `--sandbox read-only|workspace-write`,
`--brief` (all required), `--limit SECONDS` (default 1800), `--effort LEVEL`,
`--keep-user-config`, `--dry-run`, and `-- EXTRA_CODEX_ARGS` (for example `-c` keys that are
not pinned).

## Arguments the helper builds

In this order, so the pinned values win (a later `-c` overrides an earlier one; observed):

1. `--ignore-user-config`, unless `--keep-user-config`. With `--keep-user-config` and
   `workspace-write`, also `sandbox_workspace_write.writable_roots=[]` and
   `sandbox_workspace_write.network_access=false`; pass a later `-c` in the extra arguments to
   re-enable network when the task needs it. On Windows with `--ignore-user-config`, also
   `-c windows.sandbox="VALUE"` with the `[windows] sandbox` value of
   `$CODEX_HOME/config.toml` (only that key is read), unless the extra arguments set it; when
   the config has none, a warning on stderr.
2. `--skip-git-repo-check` when the workspace is not inside a git work tree.
3. With `workspace-write`: `sandbox_workspace_write.exclude_slash_tmp=true` when the run
   directory resolves under `/tmp` (on macOS `/private/tmp`), and
   `sandbox_workspace_write.exclude_tmpdir_env_var=true` when it resolves under `$TMPDIR`.
   The working directory stays writable even when it lies under `/tmp` (observed).
4. Extra arguments.
5. `-m MODEL`, `-c approval_policy="never"`, optional `-c model_reasoning_effort=...`, then
   `-s SANDBOX` on the first turn or `-c sandbox_mode="SANDBOX"` on a resume, then
   `--json -o turn-N/last-message.txt -` with the brief on stdin.

Extra arguments that set the model, sandbox, approval policy, reasoning effort, working
directory, output, `--ephemeral`, `--last`, `--ignore-user-config`, `--skip-git-repo-check`, or
a bypass flag are refused before any dispatch (exit 2). The helper `cd`s to the canonical
workspace path and refuses to start when it does not exist.

## Run directory

| Path | Meaning |
| --- | --- |
| `settings.json` | Workspace, run directory, model, sandbox, effort, `keep_user_config`, and the stored arguments; written once by `run`, and its presence makes `run` refuse the directory |
| `thread_id.txt` | The thread ID from turn 1; never rewritten |
| `turn-N/brief.txt` | The exact brief sent |
| `turn-N/command.txt` | The exact command, shell-quoted |
| `turn-N/events.jsonl`, `stderr.log`, `last-message.txt` | Raw event stream, diagnostics, final message |
| `turn-N/helper.pid`, `launcher.pid` | PIDs of the helper and of the `codex` launcher for this turn |
| `turn-N/exit_code.txt`, `thread_id.txt` | Launcher exit code; the ID this turn's `thread.started` reported |
| `turn-N/timed-out`, `stopped`, `descendants.txt`, `reap.log` | Present after the watchdog or `stop` ended the turn; `PID COMMAND` of each descendant recorded before the signal (`w<WINPID> COMMAND` for a native Windows process); what `reap` did |
| `turn-N/limit.txt`, `tool_calls.jsonl` | The time limit in seconds; the full payload of each rollout tool call for this turn |
| `turn-N/turn_contexts_before.txt`, `turn_id.txt` | How many `turn_context` records the rollout held before this turn, and the rollout turn ID this turn maps to; rollout fields in the result come from that turn's records only |
| `turn-N/result.json` | Structured outcome |

The run directory and each turn directory are created with mode 0700.

## Result fields (`codex-delegate.result.v1`)

| Field | Meaning |
| --- | --- |
| `status` | `completed`, `failed`, `interrupted`, `startup_error`, or `settings_mismatch` |
| `turn`, `thread_id` | Turn number and the thread this turn reported |
| `exit_code`, `limit_seconds`, `timed_out`, `stopped`, `last_event` | Process and stream evidence |
| `failures` | Messages from `turn.failed` and top-level `error` events |
| `warnings` | Messages from `item.completed` items of type `error`; non-fatal |
| `expected`, `effective`, `mismatches` | Requested `cwd`/model/approval/sandbox, the rollout's latest `turn_context`, and each difference; Windows spellings of one directory (`C:\x`, `C:/x`, `/c/x`, `/cygdrive/c/x`, any case) count as the same `cwd` |
| `commands` | `command` and `exit_code` of each completed `command_execution` item in the event stream |
| `tool_calls` | The rollout's tool-call records after the latest `turn_context`: `type`, `name`, the first 400 characters of the input, `input_length`, and `truncated`; includes patch edits and attempts the event stream omits. Full inputs are in `turn-N/tool_calls.jsonl` |
| `denial_count` | Tool-call records (`response_item` payloads whose type contains `call`) after the latest `turn_context` that mention `operation not permitted`, `Permission denied`, `Read-only file system`, `require_escalated`, or on Windows `Access ... is denied`, `UnauthorizedAccess`, or `blocked by policy`; the brief's own text is not counted |
| `leftover_pids` | Recorded descendants still alive (by PID) after an interrupted turn; numbers, or `"w<WINPID>"` strings for native Windows processes |
| `usage_total`, `usage_turn`, `usage_source` | The thread's and this turn's token usage from the turn's last rollout `token_usage_record`; when the rollout has none, `turn.completed.usage` and its difference from the previous turn |
| `rollout`, `paths` | Rollout file and this turn's artifact paths |

Status rules, in order: no `thread.started` → `startup_error`; watchdog, `stop`, or a last event
other than `turn.completed`/`turn.failed` → `interrupted`; a failure event or nonzero exit →
`failed`; any mismatch or no `turn_context` → `settings_mismatch`; otherwise `completed`.

Helper exit codes: `run`/`resume` 0 only for `completed` and 1 for other statuses; 2 for usage
errors and refusals; `check` 3 while running.
