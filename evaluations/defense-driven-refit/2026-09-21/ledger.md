# Failure pattern ledger

## Static contradictions (Iteration 0)
- **Suitability proof confused with selection rationale**: the final human-conditions paragraph attributed constant justification to tests alone, contradicting grounding/evidence definitions. General Fix Rule: apply the grounding/evidence distinction consistently to every layer. Fixed before baseline; covered by B1/B4.
- **Pending disclosure confused with verified defense**: blanket ban on submitting pending items contradicted admitted-limit completion. General Fix Rule: distinguish reporting an unresolved limit from presenting a verified final answer. Fixed before baseline; covered by B2/B6.

## Execution observations (Iteration 1)
- **Coverage collected without invoking test discovery**: A's initial trace command imported a test module without running tests; corrected by executor. General Fix Rule: connect coverage to the actual test entry point, retaining target execution evidence. Phase: Execution. Seen in: iter 1. No target-prompt patch: framework-specific command error recovered, criterion A4 met; recheck recurrence first.
- B's missing provider contract and ambiguous attempt counting are scenario uncertainties, explicitly reported as unresolved policy. They are not newly discovered target-prompt defects; do not repair by inventing policy.

## Iteration 2
- Re-seen coverage-runner issue (iter 1, iter 2); incompatible trace CLI invocation, recovered using actual runner instrumentation. No prior prompt fix; both executions retain coverage evidence and bounded conclusions. Keep as executor/tool observation, not a fabricated skill defect.
- String-subclass interpretation and unknown retry-policy/provider facts are declared scenario choices/limits already represented in Iteration 1.

## Iteration 3
No new target-prompt issue. No tracing retry. Known fixture uncertainties remain explicit. Advance to previously unused H without changing criteria or prompt.

## Holdout H
No new prompt issue. Unknown replacement contracts remain intentional scenario limits. Correct invalidation direction, transitive closure, null pending answers, and retained unrelated decisions verified by parent. Filename lookup corrected once; no decision retry or target patch justified.
