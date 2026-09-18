# specprobe evaluation

Fresh OpenCode subagents (one per scenario and round, never reused) read the skill as
their operating instruction and ran realistic reviews on frozen fixtures. The executor
prompt carried a visible checklist (contract items); scenario-specific expected content
and false-positive guards were kept as hidden grader checks and judged by the parent.
Self-reported unclear points were classified as Issue / Cause / General Fix Rule and
adjudicated; fixes landed between rounds. Quint 0.32.0 (with Apalache 0.56.1, Java
Temurin 25, all local) was used by the resolution scenario so the formal slice ran on a
real toolchain. External sending was forbidden in every scenario; Jev had to be reported
as not run with no probabilities.

| Round | Skill state | A payments | B reservation + Quint | C delivery | Holdout | New unclear points |
|---|---|---|---|---|---|---|
| iter1 | v0.1.0 baseline | ○ 7/7 · grader pass | ○ 9/9 · grader pass | ○ 7/7 · grader pass | — | 5 |
| iter2 | + formal-evidence fixes | ○ 7/7 · pass | ○ 9/9 · pass | ○ 7/7 · pass | — | 6 |
| iter3 | + reference-contract fixes | ○ 7/7 · pass | ○ 9/9 · pass | ○ 7/7 · pass | — | 7 |
| iter4 | + Quint example, minimality | ○ 7/7 · pass | ○ 9/9 · pass | ○ 7/7 · pass | H ○ 7/7 · pass | 6 (+0) |
| iter5 | + final polish | ○ 7/7 · pass | ○ 9/9 · pass | ○ 7/7 · pass | — | 8 |

Visible accuracy was 100% in every round; every hidden grader check passed in every
round, including the false-positive guards (delegated retention ranges, intentional
worker-order nondeterminism, referenced retry policy retrieved and applied). The
holdout (subscription cancellation) scored 100%, so no overfitting signal (drop 0
points < 15-point threshold).

## What the loop changed (→ v0.2.0)

1. `references/formal-methods.md` §C: witness-search polarity (`not(bad)`), mandatory
   `--out-itf` witness artifacts, restricted-environment checks (local backend, localhost
   endpoint, statistics off, surface recorded), backend encoding-rejection triage, type
   invariants for inductive checks, fixed-port serialization, and a verified minimal
   Quint slice with `*Test` selection and init/step defaults.
2. `references/reporting.md`: compact format declared as the default reply; the finding
   and mechanism cards are the internal record; minimal required finding content;
   "smallest" defined operationally; coverage-ledger counting unit.
3. `SKILL.md`: budget counts candidate probes generated (not findings); phases skipped
   by external constraints are recorded without reading that phase's reference; Jev
   availability and permission are separate conditions with a defined denied path;
   referenced deployment settings are delegated values, and saved witness artifacts are
   recorded.

## Convergence

The literal stop rule (two consecutive rounds with zero new unclear points) was not
reached: fresh executors surfaced 5–8 micro-items per round even though accuracy and
grader checks stayed perfect. After iter3, the items stopped being contract defects and
became tool-operational details or taxonomy edge cases; most were fixed in the next
round and verified, two were closed post-loop, and the remainder were adjudicated as
non-blocking (see [failure-patterns.json](failure-patterns.json)). The loop was stopped
on the skill's resource-cutoff criterion rather than on the zero-unclear-point rule.

## Files

- [scenarios.json](scenarios.json): frozen scenarios, user requests, visible checklist,
  hidden grader checks.
- [results.json](results.json): per-round results, convergence notes, adjudications.
- [failure-patterns.json](failure-patterns.json): cumulative ledger with fix status.
- `fixtures/`: the five source documents used by the scenarios (payments API,
  reservation, delivery + retry policy, cancellation holdout).

Not covered by this evaluation: Jev cross-check paths (external sending was forbidden
by design), SMT/Alloy backends, multi-language sources, and the spec-interview handoff.
