---
name: autoresearch-loop
description: >-
  Use when the user asks Codex to run or design an autoresearch-style measured
  improvement loop: improve, optimize, reduce errors, speed up tests, lower
  latency, raise coverage, remove types/lint findings, or repeatedly iterate
  toward a numeric/verifiable target with keep/discard decisions. Also use when
  converting Karpathy-style autoresearch patterns into a Codex skill or repo
  workflow. Do not use for ordinary one-shot edits where a single fix is enough.
metadata:
  short-description: Run measured keep/discard improvement loops
---

# Autoresearch Loop

Run a measured improvement loop:

```text
contract -> baseline -> one packet -> verify -> keep/discard -> log -> repeat
```

## Trigger Discipline

Use this skill only when the loop has, or can be given, a mechanical success
signal. If the goal is subjective, first turn it into a checklist, rubric score,
visual assertion, or other repeatable evaluator.

## Contract First

Before changing code, establish a contract with these fields:

- `Goal`: one sentence describing the improvement.
- `Metric`: numeric primary value.
- `Direction`: `lower`, `higher`, or `zero`.
- `Verify`: command that produces the metric.
- `Guard`: command(s) that prove behavior did not regress.
- `Scope`: editable paths.
- `Read-only`: benchmark, metric parser, fixtures, secrets, deploy config.
- `Stop`: target, iteration cap, failure cap, budget, or manual interruption.

If any field is missing and cannot be inferred safely, ask one concise question
or run a read-only scan to propose it. Do not launch an autonomous loop with an
unclear metric, mutable evaluator, or broad write scope.

## Setup

Prefer a dedicated branch or worktree. Never include unrelated dirty files in
the experiment.

1. Check `git status --short`.
2. Read the in-scope files and the evaluator before editing.
3. Create or update `autoresearch-results/` without touching product code:
   - `contract.json`: the agreed contract fields.
   - `results.tsv`: `iteration`, `commit`, `metric`, `delta`, `status`,
     `description`.
   - `state.json`: current iteration, best metric/commit, last result, discard
     and crash counters.
   - `notes.md`: current best, lessons, pivots, and remaining risks.
4. Record a baseline before the first change.

## Artifact Conventions

- Use statuses: `baseline`, `keep`, `discard`, `crash`.
- Compute `delta` as current metric minus previous best metric. For `lower`
  goals, negative delta is improvement; for `higher`, positive delta is
  improvement; for `zero`, compare absolute distance from zero.
- Update `best_metric` and `best_commit` for `baseline` and accepted `keep`
  packets. If the metric is equal but the code is materially simpler, a `keep`
  is allowed; explain that tradeoff in `notes.md`.
- Increment discard/crash counters only for those statuses. Reset them after a
  kept packet.
- Keep raw noisy command output in separate logs when useful, but summarize the
  decision in `notes.md` instead of pasting full logs.

## Runtime Cycle

Each packet tests one hypothesis.

1. Record the current commit and best metric.
2. Make one coherent change inside `Scope`.
3. Commit the experiment before verification when the worktree contains only
   experiment-owned changes.
4. Run `Verify`, redirecting noisy output to a log.
5. Parse the metric from output. Prefer one of these formats:
   - `AUTORESEARCH_METRIC_VALUE=<number>`
   - `METRIC <name>=<number>`
   - `<metric_name>: <number>`
6. Run `Guard`.
7. Decide:
   - `keep`: metric improved beyond threshold and guard passed.
   - `discard`: metric worsened, was under noise floor, or guard failed.
   - `crash`: verify failed, timed out, or metric could not be parsed.
8. Update `results.tsv`, `state.json`, and `notes.md`.
9. If discarded, revert only the experiment-owned change. Never revert unrelated
   user work.

Record packets serially. If you run parallel worktrees, give each lane its own
results directory and merge evidence manually.

## Keep Rules

Keep a packet only when all are true:

- primary metric improves in the declared direction;
- guard commands pass;
- evaluator and parser were not weakened;
- diff stays inside scope;
- complexity cost is justified.

Simplicity is a tiebreaker. Equal metric plus simpler code can be kept. Tiny
metric gains with large complexity should be discarded.

## Escalation

- After 3 consecutive discards: refine within the same strategy.
- After 5 consecutive discards: pivot to a different strategy.
- After 2 pivots without progress: stop and report learned constraints.
- If benchmark noise is high, repeat promising packets before calling them wins.

## Output

During long runs, keep user-facing updates short:

- current best metric;
- last packet decision;
- next hypothesis or blocker.

At completion, report best metric, kept commits, discarded lessons, remaining
risk, and exact verification commands.

## References

- Read `references/patterns.md` when adapting the loop to performance, tests,
  typing, complexity, UI, security, or open-ended research.
- Read `references/implementation-digest.md` when comparing this skill against
  existing autoresearch implementations.
