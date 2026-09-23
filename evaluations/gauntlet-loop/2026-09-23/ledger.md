# Failure pattern ledger — gauntlet-loop

## Iteration 1
- **Human gate scope undefined for bar-independent items**: with bar undecided, executors could not tell whether floor/stop defaults/budget may precede the gate (B retried once; C unsure about ladder rungs and budget). General Fix Rule: split outputs by dependency on the bar; bar-independent items may precede the gate; ask all user decisions (budget, run location) in one gate. Seen in: iter 1 (B, C). Fix applied in iter 2 snapshot.
- **Coarse user-named bar**: site-level naming ("Stripe Docs") vs undecided bar. General Fix Rule: pick the most plausible concrete item with reason and swap window; ask only when choice changes the judgment. Seen in: iter 1 (A). Bundled into the iter-2 fix (same theme: first human gate).
- Pending (not yet patched): content-independent reader-task questions when subjects differ (A); newly authored floor scripts need double-run verification (A); per-artifact Phase 0 for mixed requests (B). Handled correctly by executors; watch for recurrence.

## Iteration 2
- Re-seen: **Human gate scope** (B, narrower) — iter-2 fix listed items by name, so a bar-independent comparison method looked forbidden. Existing fix did not generalise because it enumerated instead of stating the principle. Fix in iter 3: principle "does the bar choice change its content".
- Re-seen: **Reader task across different subjects** (A, iter 1 & 2). Promoted to fix in iter 3.
- Re-seen: **Uncreated floor checks** (A iter 1, B iter 2). Promoted to fix in iter 3 (Phase 2 floor: mark new, build before round 1, double-run).
- Re-seen (not patched): per-artifact Phase 0 for mixed requests (B). Executors handle it correctly both times.
- New minor: gate question scope incl. repo location (C) → folded into iter-3 gate wording ("成果物の所在"). Optional-line label by failure class (A); other-family critic vs data rules (A); middle-rung selection (A). Not patched; watch.

## Iteration 3
- iter-3 fixes landed: content-independent questions (A, B, C all used them); new floor checks marked 新規 + double run (A, B).
- Re-seen 3rd time: **Human gate scope** (B iter 1–3). Principle wording insufficient; boundary items (floor, question set vs answers) still ambiguous → structural fix in iter 4: per-item before/after-gate table in compose output.
- Re-seen 3rd time: **Mixed multi-target request format** (B iter 1–3). Patch in iter 4: per-target verdict, one integrated design, fold "no" targets into floor, with example.
- Re-seen 2nd time: **Optional-line label tied to visuals** (A iter 2–3). Patch in iter 4: label by failure class ("検査が揺れうる").
- New: **Blindness when subjects differ** (A). Patch in iter 4 (one clause in normalization): mask source-revealing names; task-based judgment primary, pairwise secondary.
- New minor: token cap when bar decided (A) → iter 4 adds "propose and confirm once"; pre-gate candidate set wording (C) → table row 2 states candidates are the selection set.

## Iteration 4
- Structural fix landed: gate-scope and multi-target issues did not recur in any scenario (first time since iter 1).
- Re-seen 2nd time: **Missing user inputs** — Phase 0 Q4 without a value (C iter 1, 4); one budget axis only (A iter 3, 4; iter-4 "confirm once" wording too strong); run explicitness of "回して" (B iter 1, 4); unverified references named from memory (A iter 2, 4). Patch in iter 5: one block "利用者の入力が欠けているときの扱い" + pre-run check line for unverified references.
- Scenario limit (not prompt): B could not read repo before gate because the eval contract forbids it.
- Minor new: per-row example for pre-gate granularity (C). Not patched; watch.

## Iteration 5
- iter-5 fix landed: 未確認 marks (A, B, C); single budget axis used without extra gate (A); "回して"/"やりたい" not treated as run (B, C).
- Re-seen 3rd time: **Middle-rung authority** (A iter 2, 4, 5) — never stated in text; executors guessed right each time. Patch in iter 6: humans pick only the top rung.
- New follow-ons of iter-5 fix: when to verify references if they can be opened (C); deliverable-side locations unknown (A). Patch in iter 6 (same bullet).
- Re-seen 2nd time: **Domain-type boundaries** (C iter 4, 5). Patch in iter 6: types may be combined.
- Minor new: pre-gate budget number vs question (B, rule already allows both); who closes the non-looped target (B). Not patched.

## Iteration 6 + holdout H
- iter-6 fixes landed: A opened rungs at design time (tool_uses 11 reflects real fetching, not index descent) and marked deliverable path 未確認; no gate for middle rungs (A); C marked 未確認 without fetching (wording "開ける" read as permission — re-seen, minor).
- A/B/C new unclear points: all minor granularity/wording, no retries, no score effect.
- Holdout H: 100% (no overfitting), but exposed three text defects in the skill/prompt domain row and template. Patched in iter-7 snapshot: external top rung, dev/held-out split with sealed held-out set, independence line covering codex exec / claude -p. Example text updated for the renamed optional line.

## Iteration 7 (recheck A + H)
- Holdout fixes landed (H 100%).
- Regression found by A: skill-row clause "現行版は段ではなく前の版" conflicted with CLI example using current version as bottom rung. Fixed in final snapshot with a general rule (current version may be the bottom rung; top rung always external). Not re-tested.
- Re-seen 2nd time: plateau default vs short budget (H iter 6, 7). Patched in final snapshot (stop table), not re-tested.
