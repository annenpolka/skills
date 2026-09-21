# defense-driven-refit — empirical tuning

## Scope and provenance

- Baseline commit: `b419bdd` (`Add defense-driven-refit skill baseline`). Only the original target skill was committed.
- Original: `snapshots/original.md`. Execution baseline after Iteration 0: `snapshots/iter-1.md`.
- The user asked for a baseline commit after initial executors had started. Both were interrupted, the original target was committed, then the same incomplete executions resumed. No scenario or snapshot was changed by that interruption.
- Frozen requirements: `checklists.json`; fixtures: `fixtures/`; raw executor reports: `work/iter-N/{A,B}/report.md`.
- All executors receive only target path, scenario, frozen checklist and report contract, with `fork_turns=none`. Parent checks actual outputs independently. No empirical-prompt-tuning authoring context or previous result is given to executors.
- Native `tool_uses` / `duration_ms` are unavailable. Table values are N/A, not estimated. This prevents a full quantitative convergence claim.

## Iteration 0 — description/body consistency

Description and body both cover post-generation refit, not creating a new system or reconstructing intent. Two internal contradictions were corrected:

1. Tests alone cannot justify a constant's selection. Applied grounding/evidence distinction to the human-conditions paragraph (B1, B4).
2. Pending items may be disclosed as limits; they may not be presented as verified final answers. Reconciled Deny with admitted-limit termination (B2, B6).

These are static corrections before the empirical baseline. Their isolated causal effects were not measured against the original snapshot.

## Iteration 1

### Changes

Baseline after Iteration 0; no empirical patch yet. Patterns: selection rationale vs suitability proof; unresolved disclosure vs verified defense.

### Execution results

| Scenario | Success/Failure | Accuracy | steps | duration | retries | Weak phase |
|---|---|---|---|---|---|---|
| A: actual code refit | ○ | 100% (6/6) | N/A | N/A | 1 | Execution, recovered |
| B: missing policy/contract | ○ | 100% (6/6) | N/A | N/A | 0 | — |

Parent verification: A tests rerun successfully plus 5 valid/8 invalid independent inputs and absence of class wrappers (`results/iter-1-A-parent.json`). Final code SHA-256 and both ledgers' status/version/limit invariants pass (`results/iter-1-*-ledger.json`). Parent read deletion evidence, three-level explanations, and narrowed design. No critical drops.

### Structured reflection

- A: Issue: coverage command initially imported tests without running discovery. Cause: executor's command choice, not missing target rule. General Fix Rule: attach coverage to the actual test runner and keep scoped evidence. Execution phase; recovered before submission.
- B: reports ambiguous attempt counting and unknown provider behavior. These are intentionally missing scenario facts, correctly retained as limits, not prompt defects.

### Discretionary fill-ins

- A: JSON ledger; SHA-256 final source version; accepts str subclasses; name boundary and no-normalization counterexample.
- B: YAML ledger; SHA-256 design version; lost-response counterexample and owner policy questions without selecting policy.

### Ledger updates

Recorded coverage-runner issue; no recurring pattern yet. No new target-prompt issue established.

### Next fix proposal

None. Rerun unchanged target with fresh agents. Baseline alone does not establish consecutive clear rounds; native quantitative thresholds unavailable.

## Iteration 2

### Changes

None. Same target bytes and frozen fixtures/checklists, fresh executors.

### Execution results

| Scenario | Success/Failure | Accuracy | steps | duration | retries | Weak phase |
|---|---|---|---|---|---|---|
| A | ○ | 100% (6/6) | N/A | N/A | 0 decision / 1 tool | Execution, recovered |
| B | ○ | 100% (6/6) | N/A | N/A | 0 | — |

Parent reran actual A tests and independent inputs, checked both ledgers against final content, and inspected probe and explanation artifacts. Receipts: `results/iter-2-*`. No critical drops. Executor retry categories differ: A1 reported coverage correction as retry 1; A2 separates decision=0/tool=1. Preserve raw reports rather than presenting that reporting difference as efficiency improvement.

### Structured reflection

- A: the tracing command again needed correction; no new uncertainty class. A normal string subclass is accepted under the supplied string contract, with custom operators out of scope. This is a declared fixture interpretation, already observed in A1, not a missing rule.
- B: repeats missing owner policy/provider semantics and count interpretation; these are expected scenario limits.

### Discretionary fill-ins

A uses YAML; B uses JSON. Both use final-content SHA-256. No new material implicit product decision.

### Ledger updates

Re-seen: coverage collected without actual test runner execution, iter 2. There was no earlier targeted prompt fix to fail; both executors recover and satisfy A4. Do not add framework-specific trace syntax to a general design/code review skill without evidence of a portable fix.

### Next fix proposal

None. Run unchanged target again. One subsequent round with zero new target ambiguity; no numeric convergence can be judged from unavailable native metrics.

## Iteration 3

### Changes

None. Same target, cases and requirements; fresh executors.

### Execution results

| Scenario | Success/Failure | Accuracy | steps | duration | retries | Weak phase |
|---|---|---|---|---|---|---|
| A | ○ | 100% (6/6) | N/A | N/A | 0 | — |
| B | ○ | 100% (6/6) | N/A | N/A | 0 | — |

Parent reran A's four tests and 13 independent inputs; verified both ledger final-content hashes and pending/done constraints. Inspected explanation and deletion evidence. Receipts: `results/iter-3-*`. No critical drops.

### Structured reflection

No new target-prompt uncertainty. A explicitly retains the known string-subclass scope limit. B retains known policy/count/provider uncertainties. These are resolved as bounded choices or disclosed limits, not invented answers. Tracing-tool retry did not recur.

### Discretionary fill-ins

As before, local JSON/YAML ledgers and SHA-256 content versions. Different grouping/number of test methods (A has four rather than three) is not a fixed-rubric failure or a tool-use metric.

### Ledger updates

No new failure pattern. No third recurrence of tracing failure.

### Next fix proposal

None. Two successive repeat rounds show no new target uncertainty and 0-point accuracy change. Launch the unused dependency-graph holdout. Native step/duration thresholds remain unmeasurable, so this is qualitative saturation, not full convergence.

## Holdout H — dependency invalidation

First execution of H, after Iteration 3, using the unchanged target. No earlier agent saw this fixture; the checklist was frozen before baseline.

| Scenario | Success/Failure | Accuracy | steps | duration | retries | Weak phase |
|---|---|---|---|---|---|---|
| H | ○ | 100% (5/5) | N/A | N/A | 0 decision / 1 filename lookup | — |

Parent verification: traversed reverse dependencies from the original graph, independently asserting B/C pending with null answers, P/U retained, A changed, IDs/edges preserved. All done versions match final design bytes. Receipts: `results/holdout-parent.json`, `results/holdout-ledger.json`. The executor records a corrected ledger filename lookup separately, not as a decision retry. Unknown replacement contracts remain scenario limits. No critical drops, new prompt defect or holdout accuracy drop (0 points versus the recent 100% average).

## Final decision and limits

Keep the two Iteration-0 corrections; no empirical patch was justified by the seven subsequent executions. Actual artifacts satisfy all 41 frozen checks across 7 cases (A/B × 3, H × 1), including independent parent test execution and ledger checks. This establishes behavior on the small supplied fixtures only. It does not establish effectiveness across arbitrary repositories, domains, security audits, or large dependency graphs. The requirement-bearing executor contract may scaffold behavior; no unassisted triggering benchmark was run.

Two consecutive repeat rounds showed no new target ambiguity and saturated accuracy; the holdout passed. Stop by **resource cutoff after qualitative saturation**, not full convergence: native tool-use and duration metadata are unavailable, so ±10%/±15% quantitative thresholds cannot be assessed. Repeated runs solely to fill absent metadata would add cost without resolving that limitation. No claimed speedup. Static correction effect versus the untouched original was not experimentally isolated.

Baseline original remains committed as `b419bdd`. Tuned skill and evaluation artifacts remain working-tree changes. No publishing, installation, or memory update was performed.

Validation: target YAML frontmatter parsed; target diff whitespace check passed; original snapshot equals committed baseline; Iterations 1–3 and holdout target bytes identical. `manifest.json` records frozen fixture/checklist/snapshot hashes. Raw per-case reports retain executor uncertainties, fill-ins and retries. Helpers require Python 3 and PyYAML; execute from this repository and give `verify_code.py` a case directory or `verify_ledger.py` a ledger path. `verify_holdout.py` resolves its own fixture paths.

Publication preparation: removed trailing spaces from two saved unittest output lines to satisfy the repository whitespace check; test content and outcomes are unchanged.
