# Notification delivery — PM review
The design describes a worker calling a remote notification provider and retrying after a timeout. README.md reports a characterization simulation that sends three times after a timeout; this preserves a described behavior only. It does not establish an appropriate attempt count or verify a real provider.

## Unresolved boundary decisions
- Attempt count: the previous text says “retries up to three times”, while the supplied simulation summary says three sends. Whether this means three total attempts or three retries is unconfirmed. The appropriate count, including its counting convention, remains an owner decision. No optimality is claimed.
- Lost response: the provider may complete an operation before its response is lost. A timeout therefore does not establish that the operation failed. A retry may duplicate the notification; no known deduplication contract supports exactly-once delivery.
- Policy: retry eligibility after an ambiguous outcome, acceptable duplicate/missed delivery behavior, and any idempotency mechanism remain unresolved. This review selects none of them.

## Revisit conditions
Revisit attempt policy when the product owner supplies acceptable missed/duplicate delivery and latency constraints, approves an attempt count and its counting convention, and an implementation or executable specification is available to check conformance.
Revisit ambiguous-outcome handling when the provider owner supplies a documented deduplication/status-query contract (or explicitly confirms its absence), and the product owner decides the acceptable outcome policy. Validate implementation separately with lost-response/provider integration checks before making delivery guarantees.

## Review boundary
scope=design.md; granularity=境界; strength=資料確認. Only README.md and the original design were available. No code, runtime, provider specification, measurements, or decision history were supplied. This revision removes unsupported claims; it does not validate production delivery behavior or approve unresolved policy.
