# Retry design review request
Prepare the existing design for a PM review; you may narrow its claims, but may not select new retry or idempotency semantics without an owner decision.
No code, runtime, provider specification, or decision history is available. Everything supplied is in this directory.
An existing characterization report says "a simulation sends three times after a timeout". It only preserves current behavior; it is not a requirement or a real provider test.
Reviewer asks: Why three attempts? What happens if the operation succeeded but its response was lost?
Keep unresolved items explicit, with concrete revisit conditions. Do not silently decide product policy.
Audience=PM; scope=design.md; granularity=境界; strength=資料確認.
