---
name: opencode-delegate
description: Call the OpenCode CLI with an explicitly selected model for implementation, investigation, review, or consultation. Use when the user asks to use OpenCode, delegate a task to OpenCode, or resume an OpenCode session. Captures the response and session ID for verification and follow-up.
---

# OpenCode Delegate

OpenCode receives a self-contained brief through stdin. The calling agent owns scope,
verification, and the answer to the user. Use the installed directory containing this
file as `<skill-dir>`; do not resolve the helper relative to the target repository.

## Prepare

Check `command -v opencode`, `opencode --version`, and `opencode run --help` once per
environment. The helper requires Node.js 18+ and macOS/Linux (WSL is also suitable).
Git is optional for questions, and useful for inspecting coding changes.

Use the user's selected `provider/model` exactly. Check `opencode models <provider>`
if availability is uncertain. Do not silently substitute a model after an error.
If no model is given, use an already authorized choice from the conversation or
project instructions; ask only if none exists. Pass `--model` on resumed runs too.
Use existing OpenCode authentication; never put credentials into a brief or print
credential files. A normal run writes OpenCode's own logs and session database in
addition to the helper's artifacts, so the host must permit those runtime writes.

Inspect target instructions and current changes before delegating edits. A brief
must contain the goal, relevant context, permitted files/actions, acceptance criteria,
and actual verification commands when applicable. OpenCode does not receive this
conversation. Ask it to report changes, checks, and unresolved issues. Keep commits,
pushes, and external publishing with the calling agent under the user's authorization.
For a question, a short brief with the necessary context and desired answer is enough.

## Call

Write the brief to a file with a quoted heredoc or file-editing tool. Then run:

```bash
node "<skill-dir>/scripts/relay.mjs" \
  --cd /absolute/path/to/workspace \
  --model provider/model \
  --agent build \
  --brief /absolute/path/to/brief.txt \
  --pure --timeout 30m
```

- Use `--agent build` for implementation and `--agent plan` for analysis or consultation.
  `plan` uses OpenCode's configured permissions; it is not filesystem isolation.
- Permissions are preserved by default. Add `--auto` only when the authorized task
  permits unattended tool use. It auto-approves permissions not explicitly denied;
  the helper rejects it with `plan`. A denied permission needs a scope/configuration
  decision, not repeated retries or automatic permission widening.
- `--pure` disables external OpenCode plugins for this call; use it unless the task
  depends on them. It does not remove project instructions or all configuration.
- Omit `--brief` to supply stdin. The helper never interpolates the prompt into shell code.
- For follow-up, send a delta brief with `--session ses_...`, the same workdir, and
  the selected model. Use the exact returned ID; avoid an ambient "latest session".
- The default time limit is 30 minutes; `--timeout 2h` can extend a known long task.

The helper prints its run directory immediately. Keep a long command in the host's
managed execution session and poll that session for completion while communicating
useful progress. In Codex, resume an `exec_command` session with `write_stdin`.
Do not launch another OpenCode process just because the first call yielded.

## Inspect and finish

Read `result.json` after the process exits. It includes `status`, `sessionId`,
`finalMessage`, the requested model, reported cost, and artifact paths. `completed`
means the CLI emitted a normal closing step and exited successfully; it does not
certify that the task is correct. Consult [references/runner.md](references/runner.md)
for the result contract and failure recovery.

For edits, review the actual diff, including untracked files, and run the relevant
checks yourself. `gitBefore` and `gitAfter` are status snapshots, not attribution of
which files OpenCode changed; existing edits can retain the same status. Use a separate
checkout when concurrent work or fragile local changes make direct edits unsuitable.
For consultation, assess the answer and verify claims as the task requires.

If rework is needed within scope, resume the captured session with concrete feedback.
After a timeout, interrupted run, or missing result, inspect partial changes before
resuming. Report the useful result, validation, and material limitations to the user.
Commit, push, or install only when the user requested it or existing authorization covers it.

## Sources and validation

Inspired by [amElnagdy/delegate-skills: opencode-delegate](https://github.com/amElnagdy/delegate-skills/tree/b781ee2e23089630e2fbee1cfd6174afe4edeb76/skills/opencode-delegate).
The brief → captured run → independent review flow is retained; this implementation
has no fleet-skill dependency, requires an explicit model on every call, and keeps
automatic permission approval opt-in. See [references/runner.md](references/runner.md)
for the verified CLI version and model trial.
