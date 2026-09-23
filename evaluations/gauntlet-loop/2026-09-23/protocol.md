# Frozen evaluation protocol — 2026-09-23
Target: gauntlet-loop/SKILL.md. Iteration 0: description/body scope consistent (compose/run modes, use cases 1–5, Do NOT list all map to body sections). No static correction needed.
Scenarios: A = median compose (docs tutorial chapter, user-named bar, 8h budget). B = edge, mixed machine-verifiable (fee calc) + non-verifiable (email copy). C = edge, bar undefined (LP). Holdout H introduced only at convergence check.
Checklists frozen in checklists.json. Scoring: ○=1, partial=.5, ×=0; success iff all [critical] ○.
Executors: fresh general-purpose subagents, no history, given only target path, scenario, checklist, report contract. Instructed not to read evaluations/ or other skills. tool_uses / duration_ms taken from Agent usage meta when available, otherwise N/A.
Holdout H added at iter 6 (after 5 rounds all 100%): skill/prompt domain (use case 5), compose for Codex. Checklist "H" appended to checklists.json at that time; A/B/C lists unchanged.
