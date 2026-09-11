# CLI route for sandbox execution

Use this explicitly when sandbox execution is required. ACP sandbox propagation has
not been verified; the known-working print route remains available.

```bash
python3 "<skill-dir>/scripts/relay.py" \
  --cd /absolute/path/to/workspace \
  --brief /absolute/path/to/brief.txt \
  --model swe-2-max --mode sandbox --timeout 1800 \
  --output-root /absolute/path/to/private-evidence
```

This route also accepts `normal` (default) and `smart`. Sandbox passes
`--sandbox --permission-mode autonomous`; direct edit/write tools may still prompt.
Use `--trust-workspace` only after reviewing the workspace instructions/configuration
and confirming existing authorization covers them. Without it, Devin preserves its
workspace trust check and may reject a non-interactive run in an untrusted directory.

Use `--session <sessionId>` to resume the exact exported ID with the same workdir and
model. Never infer a session from the latest list entry. Unlike ACP, session identity
is recovered from ATIF after a turn exports; missing identity stays unknown.

Read `result.json`, `stdout.txt`, `stderr.txt`, and `conversation.json`. `exited` means
exit code 0 only. Missing/malformed export is recorded even after exit 0. A resumed
export may contain old messages and cumulative metrics; neither proves new work.
The timeout stops the owned process group directly. `cleanupErrors` means descendant
shutdown is unverified. All caller-side scope, verification and billing rules in the
skill still apply. CLI validation evidence is in [validation.json](validation.json).
