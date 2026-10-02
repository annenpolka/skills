# Grading key — frozen before any execution (2026-09-25)

Executors never see this file. They receive only the abstract checklist in checklists.json.
Scoring: ○=1, partial=0.5, ×=0. Success iff every [critical] item is ○.
Grader quotes ledger item IDs / explanation lines as evidence for each verdict.

## Scenario A — PR #318 annual renewal worker (median)

- A1 [critical] Concurrent double charge. Links `deploy/scheduler.yaml` replicas: 2 (or multiple scheduler processes) to the absence of any row lock / claim / exclusion in `renewal_worker`, and records the resulting double-charge path as an `origin: impact` item. ○ = deploy material cited AND path made concrete. partial = generic concurrency concern without the deploy fact. × = absent.
- A2 [critical] Ambiguous charge outcome. Makes concrete a double-charge path via retry on 5xx / connection error, or via stop after successful charge and before the DB update. If an idempotency key is proposed, the item mentions that the key must be stable per billing period (e.g. renews_at moves on failure) OR that the provider's key retention is unknown (SUP-4411); the item's verification is pending and final_answer is null. ○ = path + (derivation or unknown retention) + pending/null. partial = path only, closed as "add a key". × = absent, or presented as verified.
- A3 Areas absent from the SKILL.md initial list (index-contribution probe). At least two of the following, each tied to concrete material (file, line, figure): (a) month-start 400k / 1.8M rows loaded at once, N+1 customer query, or multi-hour run → resource/duration problem; (b) RollingUpdate / SIGTERM / terminationGracePeriodSeconds 30 stopping the worker mid-charge (graceful shutdown); (c) no HTTP timeout on requests.post, or fixed backoff without jitter concentrating load. ○ = ≥2, partial = 1, × = 0.
- A4 Time or money defect, at least one made concrete: Feb 29 `replace(year+1)` ValueError; naive `datetime.now()` with TZ=Asia/Tokyo vs timestamptz; JPY rounded to 2 decimals / float arithmetic (mismatch with `money.py`, Decimal×float TypeError, PayCo expects integer minor units); renews_at shifted by the failure path drifting the anniversary. ○ = ≥1.
- A5 No anchor (person / concept / book name) placed in grounding or evidence. No provider specification (e.g. concrete key retention), law or internal requirement absent from the materials written as fact. ○ = none. partial = one minor case. × = anchor name as grounding, or invented retention/spec.
- A6 No over-application. No change demand or new abstraction for areas the materials show as unrelated (authn/authz, API compatibility, cache, generic distributed-lock infrastructure beyond the concrete double-run fix). 0042 additive column is not forced into expand-contract or similar (closing it, scoping it, or leaving the PostgreSQL-version-specific property as a primary-source check is fine). ○ = none.
- A7 Ledger rules and output. Every item has origin; pending items have final_answer null; every item has grounding, a freedom declaration, or admitted_limit; signature states scope/granularity/strength; three-level output exists. ○ = all; partial = one missing.

## Scenario B — PR #57 account deletion (edge: unknowns, trace-less propagation)

- B1 [critical] Deletion propagation. Identifies from repository materials at least two of: `jobs/user_indexer.py` / OpenSearch (updated_at polling cannot observe deletes), `jobs/export_analytics.py` / DWH (daily full snapshots, no lifecycle), `jobs/crm_sync.py` / external CRM. Records them as impact items; does not mark them non-applicable because the PR code has no trace. ○ = ≥2, partial = 1, × = 0 or declared non-applicable.
- B2 [critical] No invention. Does not set a retention period (days/years) or a named law as a requirement; does not decide order-history handling or the grace period. Unknowns remain pending (final_answer null) or admitted_limit with an owner or revisit condition. ○ = no invention and unknowns explicit. × = otherwise.
- B3 Existing 24 h access tokens (current_user reads claims without DB lookup) stay valid after deletion; checked against the requirement "削除後、その利用者はログインできない" as a gap. ○.
- B4 Foreign keys: orders ON DELETE CASCADE deletes the undecided order history, or audit_logs FK (no ON DELETE) makes deletion fail for users with audit rows. ○ = ≥1 concrete.
- B5 Backups (35-day snapshots / 7-day PITR) retain deleted data, or restore resurrects it. ○.
- B6 No over-application: no BOLA/IDOR fix for /v1/me, no CSRF measure for the bearer-token API, no payment/queue/distributed-lock/cache change demanded. ○ = none.
- B7 Investigation first and ledger rules: does not hand all questions to the user before investigating the materials; every item has origin; pending final_answer null; signature with dials; three-level output. ○ = all; partial = one missing.

## Scenario C — PR #402 webhook (holdout: mostly handled)

- C1 [critical] Unordered delivery: a late `charge.succeeded` (including a redelivery) overwrites `refunded` back to `paid`; tied to requirement 4 (refund display / mis-shipment). ○.
- C2 [critical] Handled questions closed: signature verification (HMAC, constant-time compare, timestamp tolerance) and deduplication (processed_events in the same transaction) are treated as confirmed by code/tests/materials; no saga / outbox / queue / redesign demanded. ○ = both closed and no unneeded method. partial = only one closed, or one nitpick.
- C3 No over-application to unrelated areas (outbound payment calls, distributed locks, cache, BOLA). ○.
- C4 No anchor as grounding/evidence; no provider specification outside the materials written as fact. ○.
- C5 Ledger rules: unverified remediation stays pending with final_answer null; every item has origin; signature with dials; three-level output. ○ = all; partial = one missing.

## Observations recorded per run (not scored)

- O1 Whether the executor read `references/impact-profiles/backend.md` (self-reported file list), and when.
- O2 Impact items attributed by the executor to the reference file / skill body / materials / prior knowledge.
- O3 Index rows the executor selected, and whether each led to a concrete ledger item.
