# Notification delivery — PM review draft

## Documented scope
The existing design describes a worker calling a remote notification provider and retrying after a timeout. This document does not approve a retry policy.

README.md reports an existing characterization simulation that sends three times after a timeout. This preserves a simulated behavior only; it is neither a requirement nor a real provider test. It establishes no optimal attempt count. The original wording “retries up to three times” also leaves total attempts versus additional retries ambiguous; the simulation report does not settle that product policy.

## Unresolved boundary decisions
- **Attempt policy:** Why three attempts is unanswered. The responsible product/service owner must specify total attempts versus additional retries, acceptable delay and duplicate risk, and stopping behavior before the retry policy is approved. No new attempt count is selected here.
- **Ambiguous outcome:** The provider may perform the operation before its response is lost. A timeout therefore does not establish that the notification failed. With no known deduplication contract, another attempt could duplicate a notification. Exactly-once delivery is not established.
- **Owner decision required:** Whether to retry, stop, reconcile, or use another outcome-handling policy after an ambiguous timeout remains unresolved. Obtain the provider's documented side-effect/deduplication contract and the owner's acceptable duplicate-versus-missed-delivery policy, then revisit this boundary before approving delivery guarantees. This draft selects none of those policies.

## Review limits
Source review only: design.md and README.md. No implementation, runtime, provider specification, measurements, or decision history was supplied. Owner identity is not supplied and must be assigned for the decisions above. Subsequent implementation/provider verification is required to substantiate any approved behavior; this review cannot do so.

Scope: design.md / Granularity: 境界 / Strength: 資料確認 / Audience: PM.
