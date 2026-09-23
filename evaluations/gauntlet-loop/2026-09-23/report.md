# gauntlet-loop — empirical tuning

## Scope and provenance

- Target: `gauntlet-loop/SKILL.md`. Original: `snapshots/original.md`; each iteration's executed version: `snapshots/iter-N.md`; shipped: `snapshots/final.md`.
- Frozen requirements: `checklists.json` (A/B/C fixed before iter 1; H appended at iter 6 as holdout). Executor contract: `contract.md`. Raw deliverables and reports: `work/iter-N/{A,B,C,H}/`.
- Executors: fresh general-purpose subagents with no history, given only the target path, scenario, checklist key and contract. Parent re-scored each deliverable independently (grep for leftover `{PLACEHOLDER}` / `［任意］` in run prompts; presence/absence of run prompt before gate).
- `tool_uses` / `duration_ms` come from the Agent usage meta.

Scenarios: A = median compose (Docusaurus chapter, user-named bar, 8h). B = edge, mixed request (fee calculation is machine-verifiable, receipt email copy is not). C = edge, bar undefined (landing page). H = holdout, skill/prompt domain on Codex.

## Iteration 0 — description/body consistency

Description (compose/run, use cases 1–5, Do NOT list) maps to body sections. No static correction.

## Results

| Iter | A | B | C | H | steps (A/B/C/H) | duration s (A/B/C/H) | retries |
|---|---|---|---|---|---|---|---|
| 1 | ○ 100% | ○ 92% | ○ 100% | — | 5/5/5 | 88/74/47 | B:1 |
| 2 | ○ 100% | ○ 100% | ○ 100% | — | 5/5/5 | 95/70/50 | A:1 |
| 3 | ○ 100% | ○ 100% | ○ 100% | — | 5/5/5 | 77/81/60 | 0 |
| 4 | ○ 100% | ○ 100% | ○ 100% | — | 5/6/5 | 81/70/63 | 0 |
| 5 | ○ 100% | ○ 100% | ○ 100% | — | 5/5/5 | 74/65/77 | 0 |
| 6 | ○ 100% | ○ 100% | ○ 100% | ○ 100% | 11/6/5/5 | 104/67/57/129 | 0 |
| 7 | ○ 100% | — | — | ○ 100% | 9/–/–/5 | 96/–/–/107 | 0 |

A's steps rise from iter 6 because the iter-6 rule makes the lead open references at design time (WebFetch). That is intended work, not index descent.

## Fixes by iteration

1. → iter 2: **First human gate** — which outputs may precede bar selection; coarse user-named bars (site-level) are chosen, not gated. (B6: stop conditions written; C1 kept.)
2. → iter 3: gate rule restated as a principle (does the bar choice change it?); **content-independent reader-task questions** when subjects differ; **new floor checks** marked 新規 and double-run before round 1.
3. → iter 4 (structural, after 3 recurrences): **per-item before/after-gate table** in compose output; **multi-target requests** get per-target verdicts and one design, folding non-looped targets into the floor; optional line relabelled by failure class; source-revealing names masked in normalization.
4. → iter 5: **missing user inputs** — Phase 0 Q4 answers "can be decided"; one budget axis suffices; action verbs alone are not an explicit run; unverified references marked 未確認 and checked pre-run.
5. → iter 6: humans pick only the top rung; domain types may be combined; references opened at design time when possible; deliverable-side guesses also marked 未確認.
6. → iter 7 (holdout-exposed): skill/prompt row had the artefact itself as top rung — replaced with an external top rung; dev/held-out split with sealed held-out set; template independence line covers `codex exec` / `claude -p`.
7. → final (not re-tested): general rule "current version may be the bottom rung; top rung always external" (fixes a conflict A found in iter 7); plateau default lowered for short budgets.

## Stopping decision

Resource cutoff, not full convergence. Accuracy was 100% on every scenario from iter 2 onward, retries were zero from iter 3, and the three recurring patterns (gate scope, multi-target format, missing inputs) stopped recurring after their fixes. Each round still surfaced one or two new minor unclear points (granularity/wording, no score or retry effect), so the "two consecutive rounds with zero new unclear points" criterion was not met. Holdout H scored 100% (no overfitting drop) but exposed real defects in the skill/prompt domain row; those were fixed and rechecked in iter 7. The last two small edits in `final.md` were not re-run.

Open minor notes (not patched): stateful reference pages (which tab to fix), closing the non-looped target's tests, concrete sealing-command example, criterion for "判定が変わる" with coarse bars.
