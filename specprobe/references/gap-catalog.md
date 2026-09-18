# Consequential-gap catalog

These are investigation patterns, not universal requirements. Instantiate only
patterns supported by the product's scope, then screen each generated question.
Codes are report labels, not claims of an implemented automatic detector.

| Code | Candidate issue | Witness to seek | False-positive guard |
|---|---|---|---|
| SP01 | Ambiguous reading | Two source-plausible interpretations with different observations | Both may be intentionally permitted |
| SP02 | Undecided policy | A relevant scenario requiring a choice not determined in the reviewed sources | Retrieve incorporated rules and check delegation |
| SP03 | Conflicting obligations | Overlapping preconditions and incompatible effects or constraints | Different subjects, versions, timing, or exceptions may reconcile them |
| SP04 | Boundary omission | Different results at a threshold, empty set, last item, or exact deadline | The boundary may follow from explicit types or adopted standards |
| SP05 | Lifetime/order omission | A sequence whose result depends on reset, expiry, ordering, or atomicity | Internal ordering differences may be unobservable |
| SP06 | Failure/retry omission | Duplicate, cancellation, timeout, partial success, or recovery changes a promised effect | The operation may be explicitly non-retryable or out of scope |
| SP07 | Ownership/authority gap | A required action or conflicting decision has no responsible actor or precedence | Existing responsibility policies may cover it |
| SP08 | Acceptance ambiguity | Two test oracles disagree while both fit the wording | An approved external test standard may provide the oracle |
| SP09 | List/quantifier ambiguity | "At least" versus "only", per item versus aggregate, all versus some | Don't demand exclusivity for an intentionally open list |
| SP10 | Formalization assumption | Model behavior depends on a rule not grounded in the source | A labeled abstraction or adopted decision is not automatically a defect |

## Generate scenarios from a contract, not from imagination alone

For a stateful operation, inspect a small selection of:

`precondition → trigger → effect → completion → failure → retry → expiry`

For multiple actors, consider permitted overlap and reordering. For resources,
consider identity, scope, ownership, capacity, and lifecycle. For numeric conditions,
consider units, inclusivity, and the exact boundary before inventing extreme values.

Use one variation first. Combine variations only when their interaction changes the
contract. A Cartesian product is a generation strategy; unreachable combinations
are not gaps. Maintain a distinction between enumeration coverage and real-world
scenario coverage.

## Examples that must not become automatic findings

- A locked account rejects further login attempts. A disabled "successful login"
  action is not necessarily a missing transition.
- A state machine has a terminal state. Having no outgoing transition can be correct.
- Two workers may finish in either order. Nondeterminism can be part of the contract.
- A function may use either a hash table or a tree. Different internals alone are
  not externally consequential ambiguity.
- A source references a missing "retry policy" document. First report a missing
  source, not proof that the product has no retry rule.
- A document says logs are retained 90 days and identifiers are removed after 30.
  This can be consistent if the stored forms, scopes, or anonymization rules differ.
- A property is true because its antecedent never occurs. Check reachability before
  saying the relevant behavior is supported.

## Prioritization

Prefer decisions that alter external outcomes, irreversibility, persistence, cross-
component agreement, or the ability to tell success from failure. State the reason;
do not manufacture a numerical risk probability from an uncalibrated judge output.

Group findings that share one root decision. Show the smallest scenario that exposes
that decision. Keep additional affected cases as supporting evidence rather than
asking the user the same question many times.
