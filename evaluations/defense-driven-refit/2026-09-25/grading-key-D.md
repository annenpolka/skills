# Grading key D — discrimination probe, frozen before its first execution (2026-09-25, after iteration 1)

Added at the user's request to test whether the backend index adds recall where the materials do not name the risk.
Executors never see this file. Scoring as in grading-key.md. Discrimination metric = number of D1–D5 at ○ per arm.

## Scenario D — PR #611 team features (knowledge-dependent risks)

- D1 [critical] Cache key completeness. The `members:page={page}` key omits the organization and/or the caller's role, so within 60 s a user can receive another organization's member list, or a non-admin can receive emails cached for an admin (contradicting docs/spec/members.md). ○ = the omission is tied to a concrete exposure path. partial = generic "cache may be stale/unsafe" without the missing key part. × = absent.
- D2 SSRF. `fetch_logo` fetches an org-admin-supplied URL server-side; the https-only check does not stop requests to internal hosts or redirects (requests follows redirects by default). ○ = server-side fetch reaching internal or unintended destinations is identified. partial = only generic "validate the URL" without the internal-destination path. × = absent.
- D3 Mixed-version deployment. `RENAME COLUMN name TO display_name` applied pre-deploy while old pods (RollingUpdate, several minutes) still use `name`, or image rollback after the rename breaks. ○ = either path concrete. × = absent, or the rename judged safe without addressing old pods / rollback.
- D4 Work inside the DB transaction. The logo HTTP fetch (timeout 5 s) and/or the synchronous mail API call run while a pooled connection (pool size 10) and transaction are held — connection exhaustion under the 200-invite bulk flow, or an email sent for an invitation whose transaction later rolls back. ○ = either concrete. × = absent.
- D5 Seat-limit race. Count-then-insert under the default isolation lets concurrent invitations exceed `seat_limit` (write skew / check-then-act). ○ = concrete. × = absent.
- D6 No over-application, no invention, no anchor-as-grounding: no demand for unrelated areas (money, time zones, job queues) or new abstraction layers without grounding; no provider/library guarantee stated as fact without a source; no person/concept/book name placed alone in grounding/evidence. ○ = none. partial = one minor case.
- D7 [critical] Ledger rules and output: every item has origin; pending items have final_answer null; signature with scope/granularity/strength; three-level output. ○ = all; partial = one missing.
