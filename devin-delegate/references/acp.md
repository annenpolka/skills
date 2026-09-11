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
returned currentValue. The server's initial mode in the probe was accept-edits, not
CLI normal; the runner now explicitly selects smart by default. Reapply model
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

This is reverse-request handling, not an isolation layer. Accept-edits and smart can
write workspace files without a request, and global/project permissions can permit other
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

`--timeout` is the wall deadline for one `session/prompt`, not an idle deadline.
Incoming tool/text updates do not extend it. Initialize, new/load, and each config
RPC have their own 30-second deadline; cancellation adds up to five seconds for the
matching response, followed by process cleanup. The default prompt deadline is
1800 seconds. `promptTimeoutSeconds` and `requestedMode` are saved in the initial
receipt even if setup fails. `elapsedSeconds` covers setup, prompting, and cleanup,
so it is not the configured prompt duration or a spending limit.

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
The mode/receipt update adds regression checks for default smart, explicit accept-edits
on new/load, settings in the first receipt before initialization failure, and prompt
cancellation despite continuing progress. These checks use fake ACP, not new paid calls.

## Implementation experience, 2026-09-11

These separate Runeweave attempts used `swe-2-max`, reported SWE-2 Max, and the same
ACP helper revision. Elapsed values include setup and cleanup. No private source,
briefs, or raw transcripts are included here.

| Task / session | Effective mode | Elapsed seconds | Stop / accepted result |
| --- | --- | ---: | --- |
| Review / `iridescent-grass` | accept-edits | 300.185 | `timed_out` at an explicit 300-second prompt limit; no completed review |
| CLI implementation / `lake-boar` | accept-edits | 145.671 | `permission_required` for a broad filesystem search; no edits |
| Same CLI session, resumed with exact stdlib paths | accept-edits | 579.208 | `interrupted` by caller; investigation but no edits, not an automatic timeout |
| Offline MoonBit query / `faithful-bank` | smart | 483.017 | `end_turn` within an explicit 1800-second limit; one implementation file accepted |

For the query, the caller supplied a fixed contract, nine representative acceptance
tests, and existing examples. Devin implemented the owned file and ran its checks;
the caller verified the unchanged fixed tests and adopted the file without rewriting
it, then completed integration and independent checks. No reverse permission request
occurred. This supports delegating a defined implementation plus its tests/repair;
it does not establish that smart caused the improvement. Task size, mode, time limit,
and caller preparation differed. Earlier OpenCode implementation runs used `--auto`;
that is a different approval condition, not an equivalent control group.

All four receipts have `cost: null`. Raw final usage was retained privately; it is
not established as full-session usage and resumed reports were not added together.
Short no-diff periods and elapsed time alone do not measure cost or ability to finish.
All four runs reported process-group cleanup EPERM with child exit 0; the caller
separately checked the owned processes absent before taking over. Child exit alone
would not have established descendant cleanup.

Private `result.json` SHA-256 anchors, in table order:

```text
876694fd571b3522aa4e8b696b6dcf3bb3539d2c0e2d36e825cfdbd3c350618f
14d8c0d2f3743b3a61a2bd5bfe650dbe370ab2d132bfb5d781d7afd7cfc83115
16e7e37dc8230ba44d963c064ee8c9f290d3a76fdfcf79a6b0505c97941bb9f9
d734bfea3901769fd4beea3e44a5e67639f8b0664b8ff178b033a4926ba594b8
```
