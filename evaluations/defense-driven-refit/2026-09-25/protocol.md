# Frozen evaluation protocol — 2026-09-25

Target: `defense-driven-refit` — does the short backend hook (SKILL.md §影響駆動, two lines) plus
`references/impact-profiles/backend.md` make executors recall and use backend impact knowledge well?

Iteration 0 (static): description and body agree on scope (post-generation refit). The backend index is an
internal aid, not a trigger, so the description need not mention it. Recorded hypothesis for the empirical
round, not patched: the workflow step 1 lists "影響領域一覧（無ければ初期一覧＋案件固有）" without the index,
so an executor following the workflow may never open it.

Scenarios (fixtures/): A = PR #318 annual renewal worker (median; planted failure paths, some only reachable via
deploy/ops facts or areas absent from the SKILL.md initial list). B = PR #57 account deletion (edge; unknown
requirements, propagation targets with no trace in the PR code, over-application traps). C = PR #402 webhook
(holdout; mostly handled, one ordering gap). C is not run until convergence judgment.

Arms: s1 = target skill as committed (e814514). s2 = control, identical except the two hook lines and
`references/` removed. The control arm runs in iteration 1 only, to estimate what the index adds.

Blind recall design (deviation from the default contract, deliberate): the executor receives the abstract
checklist (`checklists.json`), not the planted failure paths, because a revealing checklist would scaffold
the very recall under test. Grading uses `grading-key.md`, frozen before any execution; its SHA-256 is
recorded in `manifest.json` before dispatch. Executors never see it.

Isolation: each run gets a fresh copy of one fixture and one skill snapshot under neutral names
(run-NN), a fresh general-purpose subagent with no conversation history, and an instruction not to use
the Skill tool nor read outside its repo and skill directories. Run-to-arm mapping lives in `run-map.json`.

Grading: a separate fresh grader subagent receives the key and run outputs under neutral names, without
knowing arms or skill versions, and quotes ledger IDs as evidence. The parent spot-checks verdicts.
Scoring ○=1 / partial=.5 / ×=0; success iff all [critical] ○. Metrics: tool_uses and duration_ms from the
Agent tool usage meta when available, otherwise N/A.

Stopping: empirical-prompt-tuning criteria (two consecutive rounds without new unclear points, then holdout C).
Resource cutoff after baseline + up to three fix rounds.
