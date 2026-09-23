---
name: codex-delegate
description: Delegate implementation, investigation, review, or consultation to the OpenAI Codex CLI (`codex exec`) with an explicit model, a pinned sandbox and approval policy, JSONL event evidence, and exact thread resume. Use when the user asks to delegate a task to Codex, run Codex non-interactively, get a Codex second opinion through the CLI, or resume a Codex exec thread.
---

# Codex Delegate

The caller owns the brief, sandbox choice, acceptance, integration, and the final answer.
Codex is the executor; its closing message is not evidence. Read referenced files relative to
this file, and run the helper as `bash <skill-dir>/scripts/codex-delegate.sh` (below: `helper`).
It needs bash, `jq`, and the Codex CLI on macOS/Linux/WSL.

`codex exec` and `codex exec resume`, driven through the helper, are the only transport this
skill uses. The interactive TUI, `codex cloud`, `codex exec review`, the MCP server, and plugin
or app-server helpers (such as a `codex:rescue` command) are separate workflows; do not switch
to them after an error.

## Prepare

First choose a new run directory outside the workspace (for example a sibling of it); it holds
the baseline, the turns, and all caller evidence. `snapshot` and `run` create it, and `run`
refuses it only when it already holds `settings.json` (a started thread). Then do these steps
in order.

1. **Take the caller's baseline first.** When any file must stay unchanged (including a rule such
   as "do not modify tests"), the task makes a no-change claim, or the target is not a git
   repository, run `helper snapshot <target> <run-dir>/baseline` before any caller command that
   could write to the target (read-only listing is fine). It records every path with type and
   mode, per-file checksums including `.git`, and a copy for content diffs. Keep later caller
   commands on the target non-mutating (`git --no-optional-locks status`, `python3 -B`).

2. **Check the CLI.** Run `codex --version` and `codex login status` once per environment. Use
   the existing login; never read `auth.json` or print credentials. The user's `config.toml` can
   hold MCP bearer tokens, so never print it whole: read only the keys you need, for example
   `grep -E '^(model|sandbox_mode|approval_policy|approvals_reviewer) *=' ~/.codex/config.toml`.
   Codex writes rollouts and state databases under `$CODEX_HOME` (default `~/.codex`), so the
   host must permit those runtime writes.

3. **Choose the model.** Use the model the user named exactly. When none is named, use a choice
   already authorized in the conversation or project instructions, otherwise the `model` key of
   the user's Codex config, and say so in the report. Never substitute another model because the
   requested one failed. Pass `--effort <level>` only when the user asks or the task needs it.

4. **Decide the load boundary.** An unflagged `codex exec` loads the user's `config.toml`:
   default model, sandbox and approval settings, an automatic approvals reviewer, MCP servers,
   extra writable roots, network access, memories, hooks, and plugins. The helper passes
   `--ignore-user-config` unless you pass `--keep-user-config`; keep it only when the task needs
   part of it (an MCP server, a custom provider). Global and project `AGENTS.md` files and
   installed skills load either way. Inspect the target's `AGENTS.md`, `.codex/`, and current
   changes; you need not read the global `AGENTS.md`, but state in the brief what it could
   change, such as the reply language (a closing message came back in Japanese with no language
   instruction; observed).

5. **Choose the sandbox.** `workspace-write` for implementation reviewed after the fact (writes
   limited to the working directory, `/tmp`, and `$TMPDIR`; `.git`, `.codex`, and `.agents` stay
   read-only, so the delegate cannot commit). `read-only` for investigation, review, or
   consultation; commands still run but cannot write, so a runner that writes caches or bytecode
   can fail. The helper pins the approval policy to `never` on every turn: with `on-request` and
   an automatic approvals reviewer, a `-s read-only` run requested escalation and the reviewer
   approved a file write (observed). The helper refuses `danger-full-access`; that belongs only
   in a container or VM, outside this skill.

6. **Write the brief** to a file outside the workspace, next to the run directory. Give every
   field; write "none" where one does not apply:
   - Goal, and the positive edit scope: which files may change and whether new files may be
     created (read-only work: none).
   - Bounded read scope: the exact paths the executor may choose to read. What the toolchain
     reads on its own (shell startup files, interpreter and standard libraries) is outside the
     rule. The sandbox does not limit reads, so this is an instruction only; check it afterwards.
   - Working examples: for implementation, concrete inputs with expected outputs; for
     investigation, review, or consultation, the expected answer shape.
   - Acceptance commands in non-mutating form. The caller reruns every one itself; say whether
     the executor also runs them, and attribute each result to its side in the report.
   - First-repair scope: what the executor may still change when an acceptance command fails;
     read-only work: "none — report, do not fix".
   - The no-change predicate. The caller owns it: tell the executor not to assert
     baseline-dependent invariants.
   - The closing format: split the question into its parts (every "and" or list that names a
     separate thing gets its own line, even if the answers may coincide) and ask only for those
     parts and their evidence; mark which lines acceptance depends on. Add an explicit abstention
     line such as "No-change: not claimed — caller-owned", and state the language for the whole
     response.
   When a phase deliberately leaves failures for a later phase, list the exact expected failing
   set as its acceptance. When the brief states a starting state (for example, which tests
   fail), record it with a non-mutating command after the baseline, keep the output under
   `<run-dir>/start-state/`, and compare against the baseline again so later differences stay
   the delegate's. Keep credentials and unrelated private data outside both the brief
   and the permitted reads.

## Delegate

Run the first turn as one managed background process of the host, with the sandbox chosen in
Prepare step 5 (`read-only` unless the turn implements changes):

```bash
bash <skill-dir>/scripts/codex-delegate.sh run \
  --run-dir /absolute/private/run-dir --workspace /absolute/path/to/workspace \
  --model gpt-6-luna --sandbox read-only \
  --brief /absolute/path/to/brief.txt --limit 1800
```

- The helper refuses a missing workspace, a run directory inside the workspace, a run directory
  that already holds a thread, and extra arguments that would change the model, sandbox,
  approval policy, or output. It adds `--skip-git-repo-check` for a non-git target and, with
  `workspace-write`, excludes `/tmp` or `$TMPDIR` from the delegate's writable roots when the
  run directory resolves under them. `--dry-run` prints the command without running it.
- It prints `turn N: <status>  result=<path>` and exits 0 only for `completed`. If your host
  re-invokes you when a background command exits (Claude Code does, for subagents too), yield
  and let that notification end the wait; otherwise, or when unsure, poll
  `helper check --run-dir <dir>` until it stops exiting 3 (running). Use one of the two per turn, and never start a second run because
  the first yielded.
- `--limit` is the host-side time limit in seconds; size it to the task. To stop a turn
  yourself, run `helper stop --run-dir <dir>`, which records the launcher's descendants first.

To continue the thread — a correction, an interrupted turn, or a planned next phase — first run
`helper snapshot <target> <run-dir>/accepted-<N>`, where N is the latest turn whatever its
status, to record the state the next turn starts from, then:

```bash
bash <skill-dir>/scripts/codex-delegate.sh resume \
  --run-dir /absolute/private/run-dir --brief /absolute/path/to/delta-brief.txt --limit 1800
```

The helper reuses the stored workspace, model, sandbox, approval policy, flags, and thread ID,
and writes `turn-<N+1>/`. This matters because `codex exec resume` restores only the
conversation: a read-only, `never` thread resumed without re-passed settings ran
`workspace-write` with approval `on-request` from the user config and wrote a file; without
`-m` it switched to the config's default model; from another directory it worked in that
directory (all observed). A delta brief carries the accepted state, the new goal and edit
scope, the failing input with actual and expected results when something failed, and the
regression check, and restates the brief fields that still apply (read scope, acceptance
commands, first-repair scope, no-change predicate, closing format, language). After an
interrupted turn it also says which command was cut off (its output never reached the thread)
and whether to repeat or skip it. `turn-<N>/brief.txt` is the exact input each turn received. To change the
model or sandbox, start a new run directory instead.

## Verify and finish

Do these steps in order after each turn.

1. **Read `turn-<N>/result.json`** (fields in [helper contract](references/helper.md)); this
   touches only the run directory.
   - `completed`: exit 0, `turn.completed` last, no failure event, and the rollout's effective
     `cwd`, model, approval policy, and sandbox match what was requested. Exit 0 alone is not
     success: a SIGTERM-stopped run exited 0 with no terminal event (observed).
   - `failed`: read `failures` (an unsupported model returns a 400 error); do not switch models.
   - `startup_error`: no thread started; read `stderr.log`.
   - `interrupted`: time limit, `stop`, or no terminal event. Commands it started can outlive
     it: run `helper reap --run-dir <dir>`, which signals each recorded descendant whose command
     line still matches and logs the rest as gone. The list is taken when the turn stops, so
     also check the process table for commands the brief started. Then do steps 2–4 to
     establish the state, and resume the same thread.
   - `settings_mismatch`: the run did not use the requested settings; check the target for
     changes it allowed and start a new run instead of accepting it.
   - `warnings` (such as shortened skill descriptions) do not fail a turn. `denial_count` counts
     sandbox denials in the rollout's tool-call records for the turn (a raw grep of the rollout
     also matches the brief, which is stored there). If the task needed a denied action, settle
     scope or authorization with the user; do not widen the sandbox to make a blocked run
     continue.
2. **Compare the target** with `helper compare <run-dir>/baseline <target>` before any other
   caller command touches it, so every difference is the delegate's. After a resume, compare
   against the `accepted-*` snapshot taken just before that turn for its scope, and against
   `baseline` for whole-task invariants.
3. **Check scope** against `tool_calls` in the result: the rollout's record of every tool call,
   including patch edits and attempts the event stream omits (`commands` is the event-stream
   view). Count only the paths the executor chose; for a call marked `truncated`, read its full
   input in `turn-<N>/tool_calls.jsonl`. Writes outside the target (`workspace-write` also allows `$TMPDIR`, and
   `/tmp` unless the helper excluded it) do not show in the compare; find them here and report
   them as a limit.
4. **Rerun the acceptance commands** and any other checks caller-side, keep their output under
   `<run-dir>/turn-<N>/caller/`, and compare again after the last caller action that touches
   the target. When you cannot rule out that a command writes, run it in the `copy/` of a fresh
   snapshot instead of the target. A returned message, a passing mock, or the executor's own test
   output does not prove the intended effect; for consultation, verify the claims that matter.
5. **Decide.** Accept when every claim acceptance depends on is present and verified
   caller-side, even if the closing format drifted; report an inaccurate informational detail
   (such as a wrong line citation) as a delegate inaccuracy. Resume with a delta brief when a claim is missing, ambiguous, or
   fails verification; stop when the same failure recurs without progress or the remaining work
   is smaller than the verification cost.

Keep raw runs (run directory, rollout, events, stderr) local; they can contain source code and
task context. Where the user's existing rules allow sending material to an outside service,
send only excerpts: the brief, the closing message, diffs, or source lines. Report the requested and effective model, the thread ID, the
effective sandbox and approval policy, the status with its evidence (exit code, last event,
time limit), token usage (`usage_turn` and `usage_total` from the rollout; under a ChatGPT
login there is no per-run cost), observed
changes, caller verification, and material limits. Commit, push, install, or cloud transfer
follow the user's existing authorization.

[Helper contract](references/helper.md) lists the artifacts, result fields, and refusals.
[CLI contract](references/cli-contract.md) covers the underlying `codex exec` flags, events,
and failure signatures for diagnosing the helper. [Constraints](references/constraints.md)
covers sandbox, approval, load-boundary, and interruption details, and
[validation](references/validation.json) records the probe evidence.
