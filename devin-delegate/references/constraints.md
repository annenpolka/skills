# Verified constraints and route decisions

Checked 2026-09-11 against official documentation and local CLI 3000.10.21.
Recheck time-sensitive details before relying on them.
See [validation.json](validation.json) for the bounded real-call checks, export
hashes and observed token totals. These are probes, not comparative benchmarks.

## Local execution

[CLI reference](https://docs.devin.ai/cli/reference/commands) documents print,
prompt-file, explicit resume, ATIF export and a JSON model catalog. These flags
were also present in local help. Prefer catalog variant IDs for reproducible calls.
[Models](https://docs.devin.ai/cli/models) explains that family aliases move forward.
The local catalog exposed `swe-2-medium`, `swe-2-high`, and `swe-2-max`; the pasted
conversation's uncertainty about explicit effort selection is therefore resolved
for this CLI/account. There is no need to invent a separate reasoning flag.

## Permissions are not interchangeable

[Permissions](https://docs.devin.ai/cli/reference/permissions) distinguishes Smart
from sandbox Autonomous: Smart can ask even for routine-looking work, and sandbox
does not guarantee every tool runs without prompts. Direct edit/write tools are
outside the exec sandbox. Organization rules still apply. Documentation says
Autonomous is selected with sandbox; do not build a Sandbox + Smart mode.

[Sandbox](https://docs.devin.ai/cli/sandbox) restricts exec writes by workspace and
granted scopes. Reads are broadly available unless denied. Network filtering needs
configuration and is marked unstable. Thus `--sandbox` alone is neither a secrets
boundary nor verified network isolation. Use a separately isolated host when the
task requires that stronger boundary. Do not remove sandbox after startup failure.

## Cloud and hybrid are separate workflows

Browser needs alone do not justify automatic Cloud routing: check locally available
tools, target reachability, data-transfer scope, account access and budget first.
The local helpers do not implement Cloud. ACP is now the default local transport;
see [acp.md](acp.md) for real permission, cancellation and resume probes. The CLI
print route remains available for sandbox execution.

[Devin Handoff](https://github.com/club-cog/devin-handoff) supplies a Cloud workflow,
not the local SWE CLI transport. Its documented context packaging truncates tracked
diff at 100KB; `git diff HEAD` omits untracked file contents. Do not treat that packet
as an exact checkout transfer. Inspect/pin the upstream script before use and verify
the Cloud checkout, base commit and required local changes independently.

[V3 create session](https://docs.devin.ai/api-reference/v3/sessions/post-organizations-sessions)
supports service-user authentication, `max_acu_limit`, resumability and structured
output. Current modes include normal, fast, lite, ultra and fusion, correcting the
pasted normal/fast-only claim. These are agent modes, not an explicit SWE-2 model pin.
An ACU cap is not a verified dollar cap. Validate final structured output and actual
artifacts; suspended/exit status alone does not establish task success.

For a requested Cloud extension, resolve credentials without exposing values,
organization, exact transmitted state, budget and stop semantics first. Save session
ID/URL immediately, poll the existing session, and distinguish user-input waits from
completion. Reconcile an uncertain create response before retrying to avoid duplicate
paid sessions. Stopping a local poll does not stop remote work. Hybrid additionally
requires explicit revision/patch transfer and caller-side integration checks.

## Pricing

[Pricing](https://devin.ai/pricing) currently advertises free SWE-2 use in Desktop/CLI
through 2026-10-10 on the Pro offering; this is not a permanent price or a Cloud
allowance. The local catalog reported all three SWE-2 variants as Free. Keep billing
unknown unless actual billing evidence is available. The
[SWE-2 announcement](https://cognition.com/blog/swe-2) is not a raw-model API contract.
