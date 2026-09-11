# Devin ACP contract and evidence

Checked 2026-09-11 with local Devin CLI 3000.10.21 and SWE-2 Max.

## Transport

`devin acp --model swe-2-max` speaks newline-delimited JSON-RPC on stdio.
Initialize protocol 1 with client filesystem and terminal capabilities disabled.
Devin still owns tools and can execute them itself. Authentication uses existing
Devin login; a successful initialize response alone does not prove model access.

Observed `loadSession: true`, image/embedded-context prompt support, and session
list/delete capabilities. No `sessionCapabilities.resume` was advertised: use
`session/load`, not an invented resume method. Model and mode are returned through
configOptions and can be selected with `session/set_config_option`; verify the
returned currentValue. Initial mode was accept-edits, not CLI normal. Reapply model
and mode after load, and ignore replay when collecting the new turn's text.

See [session setup](https://agentclientprotocol.com/protocol/v1/session-setup) and
[configuration options](https://agentclientprotocol.com/protocol/v1/session-config-options).

## Permission requests

An exec tool_call supplies rawInput.command and cognition.ai/inferenceToolName.
The following permission request may contain only its toolCallId plus
cognition.ai/editableCommand, so associate it with the earlier tool call rather
than requiring a full standalone tool description. The runner grants only an
active-session, exact command match using the server's allow_once option. It checks
that the displayed editable command matches rawInput.command. Unknown requests
cancel the turn; no persistent grants or Bypass are selected.

This is reverse-request handling, not an isolation layer. Accept-edits can write
workspace files without a request, and global/project permissions can permit other
actions. Do not claim that the exact command file intercepts all execution. No
sandbox support is claimed for this ACP adapter; use the explicit CLI route for that.

## Completion and cancellation

Only the matching session/prompt response ends a turn. Usage returned there is saved
raw. Never accept end_turn as code correctness. Config changes away from the selected
model cancel the run. The cognition.ai/agent_stopped event supplied a SWE-2 Max label
in real probes; that label is supplementary provider evidence.

For cancellation, answer pending permission requests with cancelled and send
session/cancel. Wait for the original prompt's cancelled result, with a bounded
five-second grace in the runner, then clean up the process. Preserve cancellation
regardless of later tool status. Real Devin emitted failed/canceled followed by
completed with terminal exit -1 for a cancelled exec. The prompt still correctly
returned cancelled. Raw events retain both transitions.

See [prompt lifecycle](https://agentclientprotocol.com/protocol/v1/prompt-turn).

## Real checks

- New session immediately returned an ID and model selection swe-2-max.
- Text chunks reconstructed the exact requested marker, followed by end_turn.
- Rejected exec permission produced no target file.
- allow_once for an exact command created the expected file; bytes verified outside Devin.
- After a command wrote a start marker, cancellation returned in about 8 ms; the
  scheduled write after 15 seconds remained absent when checked after 17 seconds.
  This single check does not prove arbitrary subprocess trees always terminate.
- A new ACP process loaded the exact prior session and recalled its marker.
- The packaged runner independently passed a fresh Max/ask invocation and resumed
  that session in accept-edits, granted an exact command, verified its file, and
  recalled the original marker without including replay in finalMessage.

Receipts and event hashes are in [acp-validation.json](acp-validation.json). Raw
probe logs remain private under /private/tmp/devin-acp-probe. Billing is unknown.
On this host, process-group cleanup after the packaged runs reported EPERM despite
direct-child termination; descendant cleanup is not claimed verified by those runs.
The explicit in-flight cancellation probe above separately verified its delayed
file write was prevented.

ACP and CLI unit/integration tests use fake subprocesses to cover transport failure
boundaries without additional model usage. They do not replace the real checks.
