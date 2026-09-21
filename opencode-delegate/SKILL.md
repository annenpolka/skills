---
name: opencode-delegate
description: Call the OpenCode CLI (v1 or v2) with an explicitly selected model for implementation, investigation, review, or consultation. Use when the user asks to use OpenCode or opencode2, delegate a task to OpenCode, or resume an OpenCode session. Captures the response and session ID for verification and follow-up.
---

# OpenCode Delegate

OpenCode receives a self-contained brief through stdin. The calling agent owns scope,
shared interfaces, acceptance, integration, and the answer to the user. Use the
installed directory containing this file as `<skill-dir>`; do not resolve the helper
relative to the target repository.

## Prepare

The helper defaults to `opencode`; use `--cli opencode2` to select that executable.
Check the selected executable with `command -v`, `--version`, and `run --help`.
Command names do not identify the generation: `opencode` can be v2. The helper
checks the actual version on every call and selects v1/v2 arguments accordingly.
It also recognizes the inspected `0.0.0-beta-18743` build as v2; unknown versions
stop before dispatch. It never falls back to a different executable. The helper requires Node.js 18+ and macOS/Linux (WSL is also suitable).
Git is optional for questions, and useful for inspecting coding changes.

Use the user's selected `provider/model` exactly. Check the selected CLI's `models --help` and model listing
if availability is uncertain. Do not silently substitute a model after an error.
If no model is given, use an already authorized choice from the conversation or
project instructions; ask only if none exists. Pass `--model` on resumed runs too.
Use existing OpenCode authentication; never put credentials into a brief or print
credential files. A normal run writes OpenCode's own logs and session database in
addition to the helper's artifacts, so the host must permit those runtime writes.

Inspect target instructions and current changes. Carry forward the user's existing
model and scoped external-transfer authorization; compare any new data, destination,
or operation against that scope. Exclude credentials and unrelated private runtime
data from both the brief and the delegate's permitted reads.

For implementation, read [references/implementation.md](references/implementation.md)
to choose a bounded task, supply working examples and acceptance tests, and match
ownership to the user's cost or time priority. Include permitted checks and first
repairs in the delegate's scope. Use the task's actual paths and commands. Keep
shared environment operations, integration, and publishing with the caller unless
specifically assigned within the user's authorization. A simple question only needs its
context and the desired answer; it does not require an implementation workflow.

## Call

Write the brief to a file with a quoted heredoc or file-editing tool. Then run:

```bash
node "<skill-dir>/scripts/relay.mjs" \
  --cd /absolute/path/to/workspace \
  --model provider/model \
  --agent build \
  --brief /absolute/path/to/brief.txt \
  --timeout 30m
```

- Use `--agent build` for implementation and `--agent plan` for analysis or consultation.
  `plan` uses OpenCode's configured permissions; it is not filesystem isolation.
- Permissions are preserved by default. Add `--auto` only when the authorized task
  permits unattended tool use. It auto-approves permissions not explicitly denied;
  the helper rejects it with `plan`. A denied permission needs a scope/configuration
  decision, not repeated retries or automatic permission widening.
- OpenCode v2 runs with `--standalone`, giving this call its own server lifetime
  for timeout and cancellation. It still uses installed configuration and plugins.
  The v2 CLI has no `--pure`; the helper rejects that combination. If plugin
  suppression is required, resolve that requirement before dispatch. For v1, use `--pure` unless the task depends on external plugins.
- Pass reasoning variants as `--variant high`; the helper encodes this as
  `provider/model#high` for v2 and `--variant high` for v1.
- Omit `--brief` to supply stdin. The helper never interpolates the prompt into shell code.
- For follow-up, send a delta brief with `--session ses_...`, the same CLI and workdir, and
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

For edits, inspect the diff and untracked files against the assigned scope, confirm
protected tests and references stayed intact, and independently check the affected
behavior. Reuse verified evidence for unchanged areas; expand checks when new changes,
failures, or uncertainty justify it. A returned identifier, packet, or successful
mock does not by itself prove the resulting effect. Validate caller-side integration
changes as well. `gitBefore` and `gitAfter` are status snapshots, not edit attribution;
existing edits can retain the same status. For consultation, verify the claims that
matter to the task.

Resume when a concrete counterexample or clarified contract gives the delegate a
bounded correction. Send the failing input, actual result, expected behavior, and
required regression check to the captured session with the same explicit model.
Stop implementation retries when the same failure recurs without useful progress,
progress depends on an unresolved contract decision, or review and rework outweigh
the remaining edit. Take over that part or separate out a concrete investigation.
Respect a user-requested cutoff. If edits and checks have finished but the final
response stalls without useful progress, use the user's cost priority to decide
whether to end that run.
Follow the owned-process shutdown procedure in [runner.md](references/runner.md).
Preserve its interrupted status; partial changes can be accepted only after independent
verification. Confirm the run has stopped before taking over its files. Do not substitute
a provider or expand permissions to keep delegation going.

Report the model/session, useful changes, caller verification, and remaining limits.
Keep raw evidence local and record only necessary, non-sensitive provenance. Do not
claim time or cost savings without comparable measurements. Distinguish work delegated,
caller effort, reported usage, and actual billing.
Commit, push, or install only when the user requested it or existing authorization covers it.
