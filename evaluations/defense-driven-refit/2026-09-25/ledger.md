# Failure pattern ledger — defense-driven-refit (2026-09-25)

Counts are "runs reporting the pattern / runs in that iteration".

## Index-related

- **No record form for questions confirmed as handled (gap-less items)**
  - Example: run-02 — "backend.md says close questions whose handling is confirmed, but the SKILL rules and end condition cover only items with a gap." run-01 (control) — "resolution has no value for 'keep as is'."
  - General Fix Rule: state whether gap-less items are recorded and in what form.
  - Seen in: iter 1 (2/4: one index run, one control run). iter 2: not raised as such; 3/4 runs recorded gap-less done items without hesitation.
  - Fix: iter 2 (T1). Follow-up in iter 2 (1/4, run-08): relation between a gap-less item's final_answer and the Deny rule against ungrounded final_answer.
- **Concept names placed as grounding** (observation, not an unclear point)
  - run-05 (control, D) put "Expand and Contract" and the OWASP SSRF cheat sheet under `convention`, with concrete content and repo references. No index run did this (0/7). The index says anchor names are entrances, not grounding; the SKILL body lists `convention` as "名前つき規約" without saying it must be one the project follows.

## Core ledger schema (T1: state definitions)

- **Document-check results have no evidence type** — iter 1 (3/4). Fixed iter 2 (`inspection`); not raised in iter 2. Follow-up (1/4, run-07): whether an unexecuted test goes under `test` or `inspection`.
- **"確定" (settled) had no definition** — iter 1 (3/4). Fixed iter 2. Follow-up (1/4, run-08): action-level vs form-level; (1/4, run-07): lower-level fixes needed under every upper candidate.
- **Layer-order rule applied as literal line-range overlap** (regression introduced by the iter 2 wording "scope.ref が重なる")
  - Example: run-06 — "a wide upper item stops logically unrelated lower items; narrowed D-010's scope to avoid it." run-05 — "applied mechanically to line ranges, it creates unrelated dependencies."
  - General Fix Rule: order settlement by logical dependency (depends_on); use line overlap only to find candidate dependencies.
  - Seen in: iter 2 (3/4).
  - Why the existing fix failed: the literal term "重なる" was read as a mechanical test, not as the rule's purpose (an upper decision may delete or change the lower target).
  - Fix: iter 3 (T2) — rule restated through depends_on; "行範囲が重なるだけでは依存とみなさない".

## Core graph and identifiers (T2)

- **Direction of depends_on invalidation** — iter 1 (3/4), iter 2 (1/4). Fixed iter 3; iter 3 0/3, iter 4 0/4.
- **Version identifier without VCS** — iter 1 (3/4), iter 2 (4/4). Fixed iter 3 (commit ID, else content hash).
  Residual: multi-file / external references — iter 3 (3/3), iter 4 (2/4). Open.
- **Cross-cutting scope.ref format** — iter 1 (1/4).
- **Line-overlap regression** — fixed iter 3; iter 3 run-10 removed a depends_on because the upper decision
  does not delete the target. Not seen again.
- **Two kinds of dependency on depends_on** (layer vs remediation prerequisite) — iter 4 (1/4).
- **Initial state when a dependency has an unapplied fix** — iter 4 (1/4).

## Core entry classification and provisional states (T3', iter 4)

- **Simulated review questions vs actual `asked`** — iter 1 (4/4), iter 2 (3/4), iter 3 (3/3). Fixed iter 4
  (`simulated: true`); iter 4 0/4.
- **No field for the candidate state** — iter 3 (2/3). Fixed iter 4 (`candidate: true`).
  Residual introduced by that fix — iter 4 (3/4): placement not in the item-shape example; gap-less items;
  a lower fix needed under every upper outcome (also run-07, iter 2). Open.
- **Item reachable from several entries; origin is single-valued** — iter 1 (2/4).

## End condition

- **admitted_limit on pending items formally satisfies the end condition**
  - Example: run-07 — "admitted_limit means both an accepted limit and a report of an unverified state."
  - General Fix Rule: separate accepted limits from pending work; judge the end condition by the decision to accept, not by a filled field.
  - Seen in: iter 2 (3/4), iter 3 (3/3). Fixed iter 4; three iter-4 runs split accepted limits from pending reports in the output.
  - Residual: per-round completion for a planning-only round — iter 4 (2/4). Open.

## Three-level output (new in iter 2, not yet fixed)

- **Unit and question of the first-level answer are undefined**
  - Examples: whether "3文以内" is per output or per topic (run-05); which question it answers (run-06); whether a lower-layer blocker may appear (run-07); two audiences (run-08).
  - Seen in: iter 2 (4/4), iter 3 (2/3), iter 4 (1/4). Iter 1 had three retries rewriting 7-8 sentences into 3; retries of the same kind continue in iter 4. Open.

## Other open classes

- **20-line rule: required fields and counting** — iter 3 (2/3), iter 4 (2/4).
- **`question` enum has no place for the concrete question** — iter 1, iter 2, iter 4 (1 each).
- **`convention` vs external recommendations** (RFC 9110, library docs, OWASP) — observed by graders in both arms.

## Single observations (not scheduled)

- admitted_limit holds one limit only (iter 1: 1/4); where a `narrow` result lives (iter 1: 1/4, iter 2: 1/4); granularity = create vs settle (iter 1: 1/4); question field format (iter 1: 1/4, iter 2: 1/4); no base diff in the fixture (iter 2: 1/4, fixture limitation).

## Executor behaviour (not a target-prompt defect)

- run-03 wrote a helper script to the scratchpad root. Iteration 2 prompts name the only writable directory; no recurrence.
- Several executors note the user's global jev-crosscheck instruction and skip it because the scenario forbids reading outside the run and treats the repository as internal. Environment interaction, not a skill defect.

## Iterations 5–7 (author-decided rounds)

Iteration 5 fixed, then not seen again (0/4 in later rounds): unit of the first-level answer, `question`
format, 20-line counting (rule replaced by one question / one response per item), stopping early, whether
external standards may be convention.

Iteration 6 fixed, then not seen again: several entries reaching one question (origin list), counterexamples
to proposed fixes, layer of counterexample items, pending items in the first level, candidate transitivity.

Iteration 7 fixed, then not seen again: web documents in the version hash, counterparty API promises
(existing_contract vs inspection), who may mark a limit accepted (`accepted_by`), limits inherent to the
chosen response. Adoption-blocking definition: broadened (requirement / contract / existing spec /
convention norm, reachable with accepted inputs; uncertain cases included with a reason); in iteration 7
runs applied it, SSRF was included via a cited external standard (run-25).

### Boundary classes created by rules added in iterations 5–7

- **Adoption-blocking definition edges** — iter 6 (4/4) → iter 7 (1/4: blocking on an external standard the
  team has not adopted).
- **3-sentence verdict vs "include every blocker and uncertain case"** — iter 6 (1/4), iter 7 (2/4). Open.
- **narrow that relies on someone else's acceptance: settled? counts toward the end?** — iter 7 (2/4). Open.
- **`simulated` attached to the item while origin is a list** — iter 6 (2/4), iter 7 (1/4) despite the
  clarifying sentence. Open (a structural change was proposed: put it on the asked entry).
- **Version hash vs referenced files that could not be read** — iter 7 (1/4).
- **Pending change items without admitted_limit are absent from the third level** — iter 7 (1/4).

### Open single or low-frequency classes (recorded, not fixed)

- Several audiences at once: which levels differ (iter 2, 5, 7 — 1 each).
- Unexecuted tests as `test` vs `inspection` (iter 2, 7 — 1 each).
- Granularity of candidate / "same response under every upper choice" (iter 6, 7 — 1 each).
- Unit for "at least one impact item per scope" (iter 5, 7 — 1 each).
- Layer of a fix spanning several layers or external targets (iter 7 — 2 runs, different wording).
- Meaning of grounding on a pending item (iter 7 — 1).
- Provenance when an entry is appended to origin later (iter 7 — 1).
- No base diff in the fixtures (iter 2, 6 — fixture limitation, not a skill defect).

### Trend

Self-reported unclear points per run: iter 1 ≈ 6.8, iter 2 ≈ 6.3, iter 3 ≈ 5.3, iter 4 ≈ 5.8, iter 5 ≈ 5.0,
iter 6 ≈ 5.5, iter 7 ≈ 4.5. Fixed classes did not recur; each round's new rules produced narrower boundary
questions. Accuracy stayed 100% in every run.
