# Constraints

Checked 2026-09-23 against Codex CLI 0.155.1 and the official documentation. These boundaries
decide what a `codex exec` delegation can and cannot guarantee.

## Sandbox and approval are separate controls

The sandbox decides what a running command can reach; the approval policy decides whether the
agent may ask to leave the sandbox, and who answers.

| Sandbox (`-s`) | Reads | Writes | Network |
| --- | --- | --- | --- |
| `read-only` | Everywhere | None | Off (documented) |
| `workspace-write` | Everywhere | Working directory, `writable_roots`, `/tmp`, `$TMPDIR`; never `.git`, `.codex`, `.agents` under a writable root | Off unless `sandbox_workspace_write.network_access = true` |
| `danger-full-access` | Everywhere | Everywhere | On |

| Approval policy | Effect in `codex exec` |
| --- | --- |
| `never` | Escalation requests are rejected; the model is told not to request them |
| `on-request` | The model can request escalation (`require_escalated`); an approvals reviewer can grant it |
| `granular` | Per-category approval behavior |

- The documentation says `codex exec` defaults to a read-only sandbox. That default applies
  only when no configuration sets `sandbox_mode`. Observed: with a user config setting
  `sandbox_mode = "workspace-write"`, `approval_policy = "on-request"`, an automatic approvals
  reviewer, network access, and one extra writable root, an unflagged run used all of them.
- Observed: `-s read-only` with approval `on-request` and reviewer `auto_review` did not hold. The
  first write failed with `operation not permitted`, the model retried with
  `sandbox_permissions: "require_escalated"`, the reviewer approved it within seconds, and the
  file was created. The same request with `-c 'approval_policy="never"'` failed and stayed failed.
  Pin the approval policy with the sandbox on every dispatch and resume.
- The reviewer runs extra model calls and judges risk, not task scope. Approval by a reviewer is
  not the user's authorization.
- Pin extra reach explicitly when keeping the user config:
  `-c 'sandbox_workspace_write.writable_roots=[]'` removes configured roots,
  `-c 'sandbox_workspace_write.network_access=false'` turns network off, and
  `-c 'sandbox_workspace_write.exclude_slash_tmp=true'` with
  `-c 'sandbox_workspace_write.exclude_tmpdir_env_var=true'` removes `/tmp` and `$TMPDIR`
  (observed in the permissions block). A run directory under `/tmp` is writable by the delegate
  unless excluded; test tools that need temporary files may fail when it is. The working
  directory keeps its own write entry, so a workspace under `/tmp` stays writable with
  `exclude_slash_tmp=true` (observed in evaluation runs).
- Sandbox denials are not reported as a structured field. They surface as command output, and
  the command's own `exit_code` may hide them.
- `danger-full-access` and `--dangerously-bypass-approvals-and-sandbox` remove the boundary.
  Use them only inside an external container or VM. `--dangerously-bypass-hook-trust` runs
  untrusted hooks; do not use it for delegation.

## What loads in a `codex exec` run

- User `config.toml` (unless `--ignore-user-config`): model, reasoning effort, personality,
  sandbox and approval settings, approvals reviewer, MCP servers, writable roots, network,
  features such as memories and hooks, plugins, and project trust entries.
- Always observed, including with `--ignore-user-config`: global `AGENTS.md` from `$CODEX_HOME`,
  project `AGENTS.md`, the skills list, and plugin recommendations. The memory block was
  present with the user config and absent with `--ignore-user-config`.
- With `--ignore-user-config` the observed defaults were: sandbox `read-only`, approval `never`,
  reviewer `user`, personality `pragmatic`, network off, no extra writable roots. Auth still
  comes from `$CODEX_HOME`. Pass `-m` anyway; the config's default model is also skipped.
- `--ignore-rules` skips user and project execpolicy `.rules` files.
- Enabled hooks run only with persisted hook trust; `--dangerously-bypass-hook-trust` lifts
  that for one invocation (help text; not probed).
- `codex exec` requires a git repository or a trusted directory; `--skip-git-repo-check`
  lifts that check. The check applies to the process cwd on resume too.
- The host must allow Codex's runtime writes under `$CODEX_HOME` (rollouts, state and log
  databases, memories when enabled).

## Resume restores the conversation only

Observed in 0.155.1: a resumed turn used the sandbox and approval policy from the current
invocation and config (not from the thread), the model from `-m` or the config default, the
process cwd as its working directory, and the user config unless `--ignore-user-config` was
passed again. `exec resume` has no `-s` or `-C`: use `-c 'sandbox_mode="..."'` and `cd`.

## Authentication, usage, and reporting

- Local runs typically use a ChatGPT login; CI uses `CODEX_API_KEY` for a single invocation. The
  documentation warns against setting `OPENAI_API_KEY` or `CODEX_API_KEY` as a job-level
  environment variable in workflows that run repository-controlled code. Do not move
  credentials into briefs, logs, or repository files.
- `turn.completed.usage` is the thread's running total; subtract the previous turn's total for a
  resumed turn (see [cli-contract.md](cli-contract.md)). Under a ChatGPT login there is no per-run
  cost; `rate_limits.primary.used_percent` in the rollout is plan usage over a window.
- Report task scope, sandbox, approval policy, model, and effort together; observed runs are
  not controlled benchmarks.

## Interrupts, timeouts, and long runs

- There is no built-in turn limit, budget, or wall-clock timeout. Supervise from the host and
  do not dispatch duplicates on yield.
- `codex` is a Node launcher that starts a native binary; commands run in their own process
  groups under the native binary. Observed: SIGTERM to the launcher exited 0 with no terminal
  event and left the running `sleep` as an orphan; SIGINT exited 1 with no terminal event.
  Signal the launcher PID you started, not a PID found by pattern matching (a pattern match can
  hit a wrapper shell and leave Codex running), then look for leftover child commands before
  inspecting or taking over the worktree.
- Both interrupted threads resumed normally with a delta brief.

## Out of scope

- The interactive TUI, `codex cloud`, `codex exec review`, `codex mcp-server`, and the
  app-server or plugin helpers (for example a Claude Code `codex:rescue` command). They have
  their own lifecycle and evidence; this skill does not use them and does not switch transports
  after an error.
- OS-level isolation beyond Codex's own sandbox. When the task needs a hard boundary, use a
  container or VM.

## Upstream references

- [Agent approvals and security](https://learn.chatgpt.com/docs/agent-approvals-security)
- [Non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode)
