# Constraints

Checked 2026-09-15 against Claude Code 2.1.272 and the official documentation. These
boundaries decide what a `-p` delegation can and cannot guarantee.

## Permission modes are not isolation

Modes choose what runs without asking; the Bash sandbox and outer containers choose what a
running action can reach. Neither is implied by the other.

| Mode | Auto-approved without a prompt | Intended use |
| --- | --- | --- |
| `default` / `manual` | Reads in working directories and the built-in read-only Bash set | Sensitive work; interactive review |
| `acceptEdits` | Reads, file edits, and `mkdir`/`touch`/`rm`/`rmdir`/`mv`/`cp`/`sed` inside working directories | Edits reviewed after the fact |
| `plan` | Reads, plus classifier-approved commands when auto mode is available | Explore before changing |
| `auto` | Most actions, with a classifier reviewing them | Long hands-off tasks |
| `dontAsk` | Only reads and pre-approved rules; anything that would prompt is denied | Locked-down CI |
| `bypassPermissions` | Everything except the documented exclusions | Isolated containers and VMs only |

- The built-in startup mode for `-p` is `default` (Manual) on every plan, but ambient
  `permissions.defaultMode` settings and flag interactions can change the effective mode.
  Observed in 2.1.272: with a user settings file setting `defaultMode: "auto"`, an unflagged
  `-p` run reported `permissionMode: "default"` in `system/init`, while the same dispatch
  with `--safe-mode` and no `--permission-mode` reported `"auto"` — and on a model that
  supports auto mode, an edit was auto-approved with no denial, whereas the same edit under
  an explicit `--permission-mode default` was denied. Pass the mode explicitly on every
  dispatch and resume, and check `system/init.permissionMode`.
- With no approval host, anything that would prompt is denied and recorded in
  `permission_denials`.
- The built-in read-only Bash set (`ls`, `cat`, `echo`, `pwd`, `head`, `tail`, `grep`,
  `find`, `wc`, `which`, `diff`, `stat`, `du`, `cd`, read-only `git`, and similar) runs
  without approval in every mode. Redirects are checked against file rules, so
  `echo pink > file` is a write, not a read (observed denied).
- `acceptEdits` does not approve arbitrary Bash commands or writes outside the working
  directories; add `--allowedTools` rules such as `Bash(python3 -m pytest *)` (the space
  before `*` enables prefix matching; without it the pattern also matches longer program
  names such as `lsof` for `ls`).
- Compound commands are split and each subcommand must match. Wrappers such as `timeout`,
  `nice`, `nohup`, `command`, and leading safe environment assignments are stripped before
  matching. A rule is not a boundary around a program: `Bash(curl *)` does not stop
  `/usr/bin/curl` or `sh -c 'curl ...'`.
- Deny rules outrank every mode, including `bypassPermissions`. Ask rules still prompt in
  auto mode. Both deny and ask rules apply when any subcommand matches.
- `--permission-prompts none` tells Claude that no host can approve, so requests are denied
  without waiting and without retry. It does not change which calls the mode or rules
  already approve.
- `bypassPermissions` is documented for containers, VMs, or the sandbox runtime, run as a
  non-root user. Do not enable it on a normal workstation.

## What loads in a `-p` run

- `-p` skips the workspace trust dialog. Project hooks, MCP servers, CLAUDE.md, skills, and
  settings can run from a directory that was never trusted. Inspect the target repository
  before dispatch.
- User-level configuration loads too. A probe run in an empty directory reported the
  machine's user MCP servers (9 entries, some needing auth) and ran a SessionStart hook.
- `--safe-mode` disables customizations (CLAUDE.md, skills, plugins, hooks, MCP, custom
  agents, output styles) while keeping normal auth, built-in tools, and permissions. Judge
  suppression from behavioral signals (`system/init`: empty `mcp_servers`, no hook events, a
  smaller tool and slash-command surface); the advertised skill and plugin lists can still
  appear, so a non-empty list is not evidence that customizations stayed active.
- `--setting-sources user,project,local` selects which settings files load.
- `--strict-mcp-config` ignores MCP configuration other than explicit `--mcp-config`.
- `--bare` skips auto-discovery and uses only `ANTHROPIC_API_KEY` or an `apiKeyHelper`; it
  never reads OAuth or keychain credentials. Under subscription login it fails with
  `Not logged in · Please run /login` (exit 1, `is_error: true`). It is recommended for
  CI/SDK reproducibility, and is expected to become the `-p` default in a future release.
- The host must allow Claude Code's own runtime writes under `~/.claude/` (transcripts,
  settings, logs).

## Authentication, cost, and reporting

- Local runs typically use claude.ai OAuth; CI usually uses an API key. Do not move
  credentials into briefs, logs, or repository files.
- `total_cost_usd` and `modelUsage[].costUSD` are client-side estimates from a bundled price
  table, not billing data. `usage` excludes subagent tokens; use `total_cost_usd`/`modelUsage`
  for whole-tree estimates, and read `costBasis` before treating a figure as list price.
- `--max-budget-usd` bounds the estimated running total within one invocation; it is not a
  spending guarantee and does not carry across resumed calls.
- Report task scope, permission mode, model, and limits together; the observed runs are not
  controlled benchmarks.

## Interrupts, timeouts, and long runs

- There is no built-in wall-clock timeout. Use the host's supervisor (`timeout 1800 ...` on
  GNU coreutils) or a managed background process, and do not dispatch duplicates on yield.
- SIGTERM exits 143, leaves the turn unfinished, and produces no result; resuming the session
  continues the unfinished turn. SIGINT ends the turn instead.
- Background Bash tasks die about five seconds after the final result. Background subagents
  keep the process open (10-minute idle ceiling by default).
- `--bg` cannot be combined with `-p`. Background sessions and agent view are a separate,
  research-preview workflow with their own lifecycle commands; this skill does not use them
  and does not switch transports after an error.

## Out of scope

- Cloud sessions (`--cloud`), agent teams, and the Agent SDK's programmatic hooks.
- OS-level isolation. When the task needs a hard boundary, use a container or VM; this
  skill's flags only shape approvals and configuration loading.

## Upstream references

- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
- [Configure permissions](https://code.claude.com/docs/en/permissions)
- [Run Claude Code programmatically](https://code.claude.com/docs/en/headless)
- [Sandboxing](https://code.claude.com/docs/en/sandboxing)
- [Sandbox environments](https://code.claude.com/docs/en/sandbox-environments)
