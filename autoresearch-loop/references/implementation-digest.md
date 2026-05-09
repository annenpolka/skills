# Implementation Digest

Sources inspected locally under `tmp/autoresearch-impls/`:

- `karpathy/autoresearch`
- `leo-lilinxiao/codex-autoresearch`
- `TheGreenCedar/codex-autoresearch`
- `uditgoenka/autoresearch`

## Extracted Invariants

- Constrain autonomy with an explicit goal, scope, metric, and evaluator.
- Establish baseline first.
- Make one focused change per packet.
- Use git as memory, but do not stage or revert unrelated user work.
- Keep improvements only when the metric improves and guards pass.
- Record every packet, including failed and discarded attempts.
- Treat benchmark/parser files as read-only unless the user explicitly asks to
  improve the evaluator before the loop starts.
- Prefer simple changes; discard tiny wins that add disproportionate complexity.

## What This Skill Keeps

- Contract-first launch.
- Mechanical metric requirement.
- Dual gates: `Verify` for the metric, `Guard` for regressions.
- `autoresearch-results/` artifacts for state and resumability.
- Escalation from refine to pivot to stop.
- Skill-native artifact format that Codex can maintain directly.

## What This Skill Intentionally Leaves Out

- Detached background controller.
- Dashboard server.
- Parallel worktree orchestration.
- Multi-mode suites such as ship/security/scenario/predict.
- Automatic hooks.
- A bundled CLI.

Use larger plugin implementations when those features are required. Use this
skill when a repo needs a small, auditable improvement loop.
