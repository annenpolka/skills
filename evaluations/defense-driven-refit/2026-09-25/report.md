# defense-driven-refit — empirical tuning of the backend impact index (2026-09-25)

## Question

Does the short backend hook in SKILL.md (§影響駆動, two lines) plus `references/impact-profiles/backend.md`
make executors recall and use backend impact knowledge well? The user then asked to also fix the core
unclear points that surfaced, one theme per iteration, and to add a knowledge-dependent scenario to test
whether the index changes what executors find.

## Provenance and method

- Baseline: `e814514` (committed skill). Snapshots per iteration under `snapshots/`.
- Protocol: `protocol.md`. Fixtures: `fixtures/{A,B,C,D}`. Executor checklist: `checklists.json`.
- Blind recall design: executors see only the abstract checklist. Grading uses `grading-key.md`
  (A, B, C; frozen before any execution) and `grading-key-D.md` (D; frozen before D's first execution).
  Both hashes were recorded in `manifest.json` before dispatch and re-checked before grading.
- Each run: fresh `general-purpose` subagent, no history, one fixture copy, one skill snapshot, Skill tool
  forbidden. Neutral run names; arm mapping in `run-map*.json`.
- Grading: separate fresh grader subagent per iteration, blind to arms and skill versions, quoting ledger IDs.
  Parent spot-checks with direct reading and TypeSafe Jev assertions (`results/jev-*`).
- `tool_uses` and `duration_ms` come from the Agent tool usage metadata (`metrics.json`).
- Index reads were counted from subagent transcripts (Read tool calls on `backend.md`), not self-reports.

## Iteration 0 — static

Description and body agree on scope. The index is an internal aid; the description need not mention it.
Hypothesis recorded, not patched: workflow step 1 omits the index, so an executor might never open it.
Empirically refuted: every index-arm run opened it (below).

## Iteration 1 — baseline, index vs control

| Scenario | Arm | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|---|
| A renewal worker | index (run-03) | ○ | 100% (7/7) | 31 | 18.2 min | 3 |
| A renewal worker | control (run-01) | ○ | 100% (7/7) | 32 | 17.5 min | 3 |
| B account deletion | index (run-02) | ○ | 100% (7/7) | 20 | 13.3 min | 2 |
| B account deletion | control (run-04) | ○ | 100% (7/7) | 15 | 10.8 min | 2 |

- Index read: 2/2 index runs, once each, immediately after SKILL.md; 0/2 control runs (transcripts).
- Rows cited as sources were case-relevant (graceful shutdown, N+1, timeouts, lost update, mixed-version;
  deletion propagation, session revocation, restore drill, BOLA/CSRF). Irrelevant rows were excluded with
  reasons. Anchor names appeared only in entry comments, never in grounding/evidence (confirmed by reading).
- No accuracy difference. Controls also found replicas: 2 double charge, missing timeout, 400k-row volume,
  and all three deletion propagation targets. Difference was organisational: index runs raised index-area
  concerns as separate items (e.g. run-03 D-008 graceful shutdown) where the control mentioned them inside
  another item's gap (run-01 D-05).
- Jev: 16 assertions over grader verdicts; two low answers resolved by direct reading
  (`results/jev-iter-1/`).

## Iteration 2 — T1 (ledger state definitions) + discrimination probe D

Changes: evidence type `inspection`; record form for gap-less items; definition of 確定; "同一scope"
rewritten as "scope.ref が重なる項目".

| Scenario | Arm | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|---|
| A | T1, index (run-06) | ○ | 100% | 41 | 18.7 min | 3 |
| B | T1, index (run-08) | ○ | 100% | 31 | 12.4 min | 3 |
| D knowledge-dependent | T1, index (run-07) | ○ | 100% (D1–D5: 5/5) | 24 | 17.4 min | 4 |
| D knowledge-dependent | T1, control (run-05) | ○ | 100% (D1–D5: 5/5) | 17 | 14.8 min | 2 |

- D probe: no detection difference. The control found cache-key tenant/role omission, SSRF via redirects,
  mixed-version rename, work inside the transaction, and the seat-limit race from the initial list and
  prior knowledge. The one visible difference: the control placed "Expand and Contract" and the OWASP SSRF
  cheat sheet under `convention` in grounding; no index run did (n=1).
- T1 effects: nobody asked where document checks go; gap-less items were recorded without hesitation.
  Regression: "scope.ref が重なる" was applied as a literal line-range test (3/4), blocking unrelated items.
- New recurring points: end condition satisfiable by limits on pending items (3/4); unit/question of the
  first-level answer (4/4).

## Iteration 3 — T2 (graph and identifiers) + T1 regression fix

Changes: layer order via logical dependency in depends_on ("行範囲が重なるだけでは依存とみなさない");
invalidation direction (items that contain the changed item in depends_on, transitively); version =
commit ID, else content hash, method stated in the signature.

| Scenario | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|
| A (run-11) | ○ | 100% | 49 | 20.1 min | 4 |
| B (run-09) | ○ | 100% | 36 | 13.2 min | 1 |
| D (run-10) | ○ | 100% (D1–D5: 5/5) | 16 | 11.3 min | 2 |

- Resolved: depends_on direction (0/3), line-overlap blocking (0/3; run-10 removed a depends_on because
  "the upper decision does not delete the target").
- Residual: no field for the candidate state (2/3); version for multi-file scopes (3/3).
- Still recurring: simulated vs actual `asked` (3/3), end condition (3/3), first-level answer unit (2/3).
- External recommendations (RFC 9110, requests docs) placed under `convention` also in index runs: a
  core-definition ambiguity of `convention`, not an index effect.

## Iteration 4 — T3' (distinguish settled/actual from provisional/simulated) + holdout C

Changes: `candidate: true` on a lower resolution waiting for its upper item; `simulated: true` on
items from mock questioning (origin stays `asked`); end condition counts an admitted_limit only when the
limit is accepted and not being fixed this round, and says limits on items scheduled for fixing do not count.

| Scenario | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|
| A (run-13) | ○ | 100% | 29 | 17.8 min | 4 |
| B (run-15) | ○ | 100% | 39 | 12.8 min | 2 |
| D (run-14) | ○ | 100% (D1–D5: 5/5) | 20 | 13.9 min | 3 |
| C holdout, first execution (run-12) | ○ | 100% (5/5) | 26 | 13.7 min | 1 |

- Resolved: simulated vs actual `asked` (0/4; every run used `simulated: true`). Three runs split the third
  output level into accepted limits and pending reports.
- Residual from this round's own fix: `candidate` scope (3/4) — where the field lives (not in the item-shape
  example), whether it applies to gap-less items, and how to mark a lower fix needed under every upper
  outcome (same class as run-07 in iteration 2).
- Residual: per-round completion (2/4); required fields and line counting for the 20-line rule (2/4);
  version for multi-file or external references (2/4).
- Holdout C: C1 (late `charge.succeeded` overwrites `refunded`, tied to requirement 4) in P-01; signature and
  deduplication closed as done with no change demanded. X-04 (non-ASCII signature → 500) is a real edge case
  (`hmac.compare_digest` rejects non-ASCII str) resolved by `narrow`, not a nitpick. Confirmed by reading.
- Overfitting check: holdout accuracy 100% vs recent average 100% — no drop.

## Index verdict

- Invocation: 24/24 index-arm runs (iterations 1–7) read `backend.md` exactly once, right after SKILL.md; 0/3 control runs
  (Read tool calls counted in transcripts). The Iteration-0 worry (workflow step 1 omits the index) did not
  materialise.
- Use: selected rows matched the case (A: timeouts, graceful shutdown, N+1, lost update, mixed-version;
  B: deletion propagation, session revocation, restore drill, BOLA/CSRF; C: ordering; D: cache key
  completeness, SSRF, write skew, pool exhaustion, expand-contract). Irrelevant rows were excluded with
  reasons. Anchor names stayed in comments, meta and gaps, never as grounding or evidence (all graders).
  Confirmed-safe questions (BOLA/CSRF, migrations) were closed rather than turned into demands.
- Effect on detection: none measurable. On A, B and D the control arm reached the same key items at the
  same accuracy. The only differences seen: index runs more often raised index areas as separate items,
  and the one control run on D put pattern names (Expand and Contract, OWASP cheat sheet) under
  `convention` in grounding, which no index run did (n=1).

## Stopping decision after iteration 4 (superseded by "Final decision")

Stopped by resource cutoff after baseline + three fix rounds, as fixed in `protocol.md`. Not converged:
each round still produced 5–7 self-reported unclear points per run. The recurring high-frequency classes
were eliminated (depends_on direction, line-overlap blocking, document-check evidence type, simulated
questioning), and later rounds surfaced narrower ones. The divergence criterion (no decrease over three
rounds) is borderline on raw counts but not on recurrence: fixed classes did not come back.
`tool_uses` and duration varied without trend (A: 31→41→49→29; B: 20→31→36→39), so the ±10% / ±15%
thresholds are not met and are not meaningful at n=1 per cell.

## Open points after iteration 4 (addressed in iteration 5)

1. `candidate`: add it to the item-shape YAML example; say whether it applies to gap-less items; decide how
   to mark a lower fix needed under every upper outcome (a proposed `blocking` marker came up twice).
2. Per-round completion: the end condition describes the whole refit; a planning-only round cannot reach it.
3. Version for items spanning several files or depending on external material.
4. The 20-line rule: which fields are required, and how lines are counted (flow style makes it trivial).
5. First-level answer: unit (whole output vs per topic), the question it answers, and whether a lower-layer
   blocker may appear (4/4 in iteration 2, still 1/4 in iteration 4).
6. `convention`: SKILL.md lists "名前つき規約（Rails流儀…）" without saying whether an external recommendation
   (RFC 9110, library docs, OWASP) qualifies. Seen in both arms.
7. `question`: a five-label enum with no place for the concrete question (3 runs).

## Iteration 5 — the seven open points, decided with the author

Author decisions: first-level answer = whole-artifact verdict + per-question answers; version = one hash
over the material set + invalidation on change; 20-line rule replaced by "one question and one response per
item"; external standards allowed as `convention` with document, section and statement. Applied as
recommended: `candidate` scope and placement, `question` format "label: concrete question", stop-early
signature, `inspection` covers undesirable current behaviour and product behaviour.
Jev over the diff: 12/12 claimed changes present, 0.93–0.98 (`results/jev-iter-5-diff/`).

| Scenario | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|
| A (run-19) | ○ | 100% | 42 | 16.7 min | 4 |
| B (run-17) | ○ | 100% | 31 | 12.3 min | 1 |
| C (run-18) | ○ | 100% | 28 | 14.2 min | 1 |
| D (run-16) | ○ | 100% (D1–D5: 5/5) | 45 | 15.7 min | 2 |

- Resolved (0/4 each): unit of the first-level answer, `question` format, line counting, stopping early
  (every run wrote met/unmet, remaining gaps and next step), whether external standards may be convention.
- First-level answers now match the intent in all four runs: a ≤3-sentence adoption verdict, per-item
  answers for structure/boundary, and lower-layer blockers pulled to the top (run-17, 18, 19).
- Residuals of this round's own changes: which files the version hash covers and how to tell which changed
  (2/4); candidate transitivity and done items waiting on another item's fix (2/4); answering pending items
  in the first level, and a criterion for "adoption-blocking" (1/4 each); convention vs inspection when a
  product behaviour supports necessity (1/4).
- Older classes now most visible: origin when several entries reach one question, including questions born
  from fix proposals (3/4); layer of items produced by counterexamples (2/4); no field to tell accepted limits
  from unverified reports (2/4).
- Self-reported unclear points per run: iteration 1 ≈ 6.8, iteration 5 ≈ 5.0.
- Grader borderline: run-18 C2 would drop to partial if C-01 (non-ASCII signature → 500, one-line fix) were
  read as a nitpick; kept ○ as a real defect not presented as a blocker.

## Iteration 6 — second round of author decisions

Author decisions: origin lists every entry that reached the question; `admitted_limit.kind`
(accepted | unverified); an adoption-blocking gap is a requirement/contract violation that is established.
Applied as recommended: version set = all scope.ref plus referenced files, with a per-file hash list;
candidate is transitive and gap-less done items return to pending through the version rule; counterexample
items sit in the layer that must change, including counterexamples to proposed fixes; pending items answer
with current state and what they wait for; normative statements go to convention, behaviour to inspection.
Jev over the diff: 10/11 at 0.96–0.99, one at 0.79 (implied, not stated: gap-less done items stay done until
the fix lands) (`results/jev-iter-6-diff/`).

| Scenario | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|
| A (run-21) | ○ | 100% | 35 | 18.3 min | 5 |
| B (run-20) | ○ | 100% | 38 | 16.3 min | 3 |
| C (run-23) | ○ | 100% | 32 | 15.3 min | 1 |
| D (run-22) | ○ | 100% (D1–D5: 5/5) | 24 | 16.0 min | 1 |

- Resolved (0/4): origin with several entries, counterexamples to fixes, counterexample item layer, pending
  answers in the first level, candidate transitivity.
- New boundary questions created by this round's rules: the adoption-blocking definition (4/4: concurrency
  conditions, SSRF without a security requirement — run-22 left it out of the top as defined, irreversible
  pre-emption of an undecided requirement, paths hidden behind another defect, many blockers in 3
  sentences); web documents in the version hash (4/4; every run excluded them unprompted); counterparty API
  promises vs the "behaviour → inspection" rule (2/4); who may mark a limit accepted (2/4); one-item rule vs
  the worked example (1/4); `simulated` placement with list-valued origin (2/4).
- Self-reported unclear points per run stayed near 5.5. Fixed classes did not recur; each new rule produced
  its own boundary questions. SKILL.md grew from 385 to 400 lines. With the author, decided to make one last
  fix round and a verification round, then stop.
- Scratchpad note: between iterations 5 and 6 the system temp cleaner removed older scratchpad files
  (frozen keys, metrics, run maps). Keys were restored from this directory and matched their frozen hashes
  before grading iteration 6.

## Iteration 7 — last fix round and verification

Author decisions: the adoption-blocking definition is broadened (requirement / contract / existing spec /
convention norm, reachable with inputs the artifact accepts; uncertain cases go in with a one-sentence
reason) instead of adding boundary rules; `accepted_by` records who accepted a limit, and a limit stays
`unverified` when that subject lacks the authority. Applied as recommended: web documents are excluded from
the version hash and recorded with name, section, URL and access date; a counterparty API promise used as a
reason goes to `existing_contract`, product behaviour used to check the artifact goes to `inspection`; limits
inherent to the chosen response stay in the same item; `simulated` is shown in the item shape and modifies
only the asked entry. Jev over the diff: 5/6 at 0.97–0.99; `simulated` 0.62 because it sits in the example
as a comment line, confirmed by reading (`results/jev-iter-7-diff/`).

| Scenario | Success | Accuracy | tool_uses | duration | retries |
|---|---|---|---|---|---|
| A (run-26) | ○ | 100% | 41 | 18.9 min | 3 |
| B (run-27) | ○ | 100% | 41 | 14.0 min | 1 |
| C (run-24) | ○ | 100% | 25 | 13.2 min | 1 |
| D (run-25) | ○ | 100% (D1–D5: 5/5) | 24 | 17.4 min | 1 |

- Not raised again (Jev over the four unclear-point lists, `results/jev-iter-7-recurrence/`, plus reading):
  counterparty API placement (0.07), web documents in the version hash (0.33; the nearby run-27 point is
  about referenced files that could not be read), splitting limits inherent to the chosen response (0.65;
  run-24's "split" point concerns layers, confirmed by reading).
- Follow-on rather than recurrence: every run used `accepted_by` without hesitation, but two runs asked
  whether a `narrow` that relies on someone else's acceptance counts as settled or toward the end (0.98).
- Still raised: `simulated` with a list-valued origin (1/4, despite the clarifying sentence); the 3-sentence
  verdict when many blockers and uncertain cases must all appear (2/4); blocking on an external standard
  the team has not adopted (1/4). SSRF in D was included as a blocker via a cited external standard (run-25),
  which the iteration-6 definition had excluded (run-22).
- Self-reported unclear points per run ≈ 4.5 (iteration 1 ≈ 6.8).

## Final decision

Stopped after iteration 7 by agreement with the author: fixed classes do not recur, every run in every
iteration succeeded (27 runs: 24 with the index, 3 control; 100% on the frozen keys), and each round's new
rules now produce only narrow boundary questions that executors resolve consistently. SKILL.md: 385 → 401
lines. `backend.md` unchanged. Open classes are recorded in `ledger.md` ("Iterations 5–7") for the author to
decide later; they are not fixed here.

## Limits

- n=1 per scenario × arm × iteration. Executors were Opus-class general-purpose subagents only; weaker
  executors, where a recall index may matter more, were not tested.
- Fixtures and keys were written by the same model family that executes them. Risks I can plant are risks
  the executors already know, so this design cannot show the index helping with knowledge the model lacks.
- Strength was 資料確認 in every scenario; no fixture was executed, no code was changed.
- Graders are LLM subagents; the parent re-read disputed verdicts and cross-checked with Jev
  (`results/jev-iter-1/`, `results/jev-final/`, and the iteration-2 grader's own `results/jev-iter-2-grader/`).
- Self-reported unclear points depend on executor diligence; counts are indicative, not a precise metric.
