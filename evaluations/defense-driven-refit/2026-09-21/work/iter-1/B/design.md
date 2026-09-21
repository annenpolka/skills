# Notification delivery — PM review

The proposed worker calls a remote notification provider and retries after a timeout. Retry policy remains subject to an owner decision.

The supplied characterization summary says a simulation sends three times after a timeout. This preserves a simulated behavior; it does not establish that three attempts are necessary or optimal. The previous design's phrase “retries up to three times” also leaves total attempts versus additional retries ambiguous. No new count or interpretation is selected here.

A timeout does not establish that delivery failed: the provider may already have performed the operation before its response was lost. No deduplication contract is known. Retrying may therefore produce duplicate notifications; exactly-once delivery is not established.

## Decisions required

- **Attempt policy:** The product owner must specify the acceptable delivery delay, additional request budget, and whether a count means total attempts or additional retries, then approve a retry policy. Revisit when that recorded decision and its constraints are supplied.
- **Ambiguous outcome:** The product owner must specify the acceptable duplicate/missed-notification tradeoff. Revisit when that decision and provider documentation about deduplication or outcome lookup are available. Until then, behavior after an ambiguous timeout remains unresolved; this review neither approves retrying nor suppressing retries in that situation.

This document review does not verify a worker, provider behavior, or a runtime guarantee. The underlying code, provider specification, and decision history were not supplied.

Review scope: design.md; granularity: 境界; strength: 資料確認; audience: PM.
