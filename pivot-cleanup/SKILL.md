---
name: pivot-cleanup
description: Remove remnants of a superseded implementation after a design decision is settled, aligning affected code, tests, and current documentation with the chosen design. Use for requests such as "clean up the old approach", "remove transition scaffolding", or "pivot cleanup" after a pivot. Not a visual design polish or general refactoring pass.
---

# Pivot Cleanup

Make the maintained implementation express the chosen design directly. Remove transition machinery that has lost its purpose while preserving the behavior and contracts that still belong to the product.

## Establish the boundary

State the chosen design, the superseded mechanism, and any surviving contracts in a short working summary. Use the user's decision and current project evidence. When these already agree, proceed without asking again. If competing interpretations would change what gets removed, inspect enough to name the conflict and ask one targeted question; continue only work independent of that choice.

Read applicable project instructions and inspect the working tree before editing. Include committed branch changes, staged changes, unstaged changes, and relevant untracked files. Respect unrelated user edits, including those in a file you need to change.

Use an explicit task base when supplied. Otherwise inspect local branch metadata to identify the integration branch; do not assume a branch name or mistake the topic branch's tracking ref for its integration base. Compute a merge base only after verifying the refs exist. If the base is unavailable, state the limit and use the working diff and explicit task targets. Without Git, use the supplied files and available references without inventing history.

Scope consists of the decision's implementation and its actual callers, configuration, tests, and documentation. Follow references outside the initial diff when they depend on that decision. A nearby issue or matching word alone does not make a file in scope.

## Identify candidates

Search for the retired names and inspect how each match is used. Check these areas where relevant:

- Unused branches, settings, parameters, helpers, and dependencies belonging only to the retired mechanism.
- Adapters, aliases, flags, and extra layers that served the transition but have no remaining consumer.
- Names or module boundaries that still describe the retired concept.
- Comments and current guides that explain the implementation through the sequence of changes instead of its present responsibilities.
- Tests and examples that specify the discarded design; outstanding work items for the discarded plan.

For each proposed removal, establish why it is obsolete from consumers, tests, or the explicit decision. Classify uncertain matches as retained or unresolved rather than treating search hits as proof. A name such as `legacy` or `v2` can describe a supported contract.

Preserve supported public APIs, persisted formats, and required migration paths unless their retirement is part of the task. Preserve historical records such as accepted ADRs, changelogs, and migration history; revise current guidance and add a superseding reference only when project conventions call for it. Cleanup of source content does not authorize rewriting Git history.

## Apply the cleanup

Remove proven dead machinery outright. Simplify layers only when their surviving purpose is accounted for. Rename internal concepts consistently across consumers. Describe the resulting design directly in maintained documentation and comments, retaining rationale that still explains a real constraint.

Rewrite tests to assert the chosen behavior. Keep coverage for surviving error cases and compatibility guarantees. A test failure is evidence to examine, not permission to delete the test. Avoid incidental formatting, dependency upgrades, and unrelated fixes. Leave generated outputs consistent through the project's supported generation workflow.

## Verify and hand back

Run relevant checks before editing when practical to distinguish existing failures, then run the checks required by project instructions and those affected by the change. Inspect the final diff for accidental behavior changes and unrelated edits. Search the relevant source tree again for retired concepts; explain legitimate remaining matches. Search results identify review candidates, not a zero-match target.

If a check cannot run, record the attempted check and concrete limitation. Do not present static inspection as a passing runtime check. When no candidate is actually obsolete, report that outcome without manufacturing a cleanup.

Report the decision and scope, what was removed or renamed, verification results, and intentional leftovers or unresolved boundaries. Scale the report to the change; do not require empty category headings. Completion means the obsolete pieces in scope are handled and the surviving design has appropriate verification, with any unmet checks stated explicitly.
