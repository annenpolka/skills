# Example: a login-count policy with a consequential open decision

This is synthetic source material for exercising the skill, not an authentication
recommendation. The example models only the stated slice and explicit assumptions.

## Source under review

> ログインに3回失敗したユーザーはロックする。

No incorporated document or additional lifetime rule is supplied in this fixture.
In a real review, retrieve such referenced material before reporting an omission.

## Decision

Does a successful login reset the failure count, or preserve it?

The source does not explicitly state that effect. It also does not define a counting
window. Neither candidate is treated as adopted policy. "No explicit contradiction
found in this fixture" is weaker than proving either one matches all intended rules.

## Candidate models

- `reset-on-success.json`: success resets the counter; the third counted failure locks.
- `preserve-on-success.json`: success preserves the counter; the third counted failure locks.

Both candidate models assume one account and sequential atomic events, omit time-
expiry/admin actions, make lock immediate, and leave the locked state unchanged for
these two input symbols. Those choices are declared assumptions, not recovered
source requirements. Here, `success` means an attempted authentication with valid
credentials; once locked it is rejected rather than implying a successful login.

The model's observation is `locked`. Counter values are intentionally not public.
Comparing counters directly would expose a different internal value after a shorter
sequence, but would not establish the relevant public consequence.

## Run the witness search

From the skill directory:

```bash
python3 scripts/compare_fsm.py examples/reset-on-success.json examples/preserve-on-success.json
```

For these explicit models, the search finds a four-event witness. With the fixture's
input enumeration order it is:

```text
failure → failure → success → failure

Reset policy:    unlocked
Preserve policy: locked
```

Other four-event sequences may also distinguish them. Breadth-first search establishes
minimal input length for the *declared models and observation*, not universal
minimality for all possible implementations or abstractions.

The script examines actual transition tables and does not ask Jev whether its own
result is correct. It does not determine which interpretation the user intended.

## Finding packet

**SP02-001 — Count reset behavior is unresolved in the supplied fixture.**

Source: the single quoted rule above. The two candidate models yield different lock
results after two failures, one success, and a further failure. Their behavioral
difference can be reproduced by finite search. Both mappings to the source still
require interpretation review, and additional project policy may settle the choice.

Resolution question: What is the intended count lifetime and success/reset policy?
A recommendation, if requested, must be separated from the current specification.

## Negative control: an explicit policy

Replace the fixture with:

> ログインの連続失敗を数える。成功した時点で失敗回数を0に戻す。
> 連続3回の失敗で直ちにロックする。この節では時間によるリセットは行わない。

Now the reset question is answered by the source. The preserve policy is not a
second admissible reading of that policy. The same two synthetic machines still
have different behavior, but that difference is **not evidence of ambiguity in the
revised source**. This is a required regression case for the skill.

## Second negative control: explicitly allowed variability

If a contract expressly delegates the count lifetime to an adopted deployment policy,
report the delegation and find that policy. Do not insist that the top-level document
choose one result for all deployments merely because the finite models differ.
