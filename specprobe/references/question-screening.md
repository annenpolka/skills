# Screen a probe before trusting its answer

This checklist applies qlint-style contract separation without requiring qlint as a
runtime dependency. The question, available source, review stage, and intended use
jointly determine whether it is meaningful.

## Minimal probe record

```yaml
id: successful_login_counter_policy
mode: interpret
question: After one or more failed attempts, what effect does a successful login have on the failure count?
scenario: Two failed attempts, a success, then another failed attempt, with no expiry or administrator action.
source_refs: [SPEC-1]
needed_evidence: A rule defining the count's lifetime or the effect of a successful login.
applicability: The product tracks failures across more than one attempt.
observation: Whether the account becomes locked after the final attempt.
answer_policy: unresolved_when_not_determined
candidate_interpretations:
  - reset the count on success
  - preserve the count on success
```

The candidate list is not exhaustive merely because it is written down. Explicitly
consider another policy, an allowed range, or a declaration that the choice is
intentionally delegated. In the example, the counter's value is not itself required
to be public; the resulting lock decision is the relevant observation.

## Screening procedure

1. **Relevance:** What required decision or observable contract would the answer
   change? Reject a stylistic preference masquerading as a requirement.
2. **Applicability:** Can this scenario occur under the stated environment and input
   contract? A hypothetical scenario may be investigated, not called reachable.
3. **Single obligation:** Split independently variable obligations unless the
   conjunction is intentional and explicit. "Is it safe and fast?" is not a useful
   atomic probe. "Does rule R require A and B together?" may be.
4. **Evidence:** Name the missing definition, clause, time window, or resource
   identity concretely. "Enough information?" alone is too vague. Retrieve the
   referenced source; do not infer its contents from a title or symbol name.
5. **Output shape:** Distinguish yes/no, category, ordered scale, a set of allowed
   results, and a request for a new design decision. Do not force an underdetermined
   contract into a binary answer.
6. **Mode:** Extraction asks what is stated; interpretation asks what follows;
   prediction asks about unknown outcomes. Missing future labels do not invalidate
   prediction, but predictions cannot establish intended normative behavior.
7. **Independence:** Remove the reviewer's conclusion, expected label, and persuasive
   summary from judge instructions. Include original evidence, candidate semantics,
   and equally detailed criteria instead.
8. **Temporal and authority fit:** Do not use later outcomes as if available at an
   earlier stage. Do not turn current implementation behavior into adopted policy.
9. **Unknowns:** Keep negative, insufficient evidence, not applicable, and tool error
   separate. Missing evidence is not a vote for the negative answer.
10. **Testability:** Specify what observation would distinguish the alternatives,
    and whether the observation is part of the contract rather than a private detail.

## Static checks versus semantic judgments

A missing file reference or duplicate ID may be mechanically established. Whether
"soon" has a sufficient contextual definition generally requires reading. Label
model screening as `semantic_signal`; do not promote it to a proof by threshold.

A high-entropy output is not a diagnosis by itself. It may reflect ambiguity, missing
material, multiple acceptable outcomes, or model error. Likewise, a rare positive
result can be valuable; prevalence alone does not establish question quality.

## Lightweight behavioral checks

Use one positive, one negative, and one boundary case when practical. Apply a
meaning-preserving paraphrase only after confirming that it preserves this contract.
An LLM's own declaration that its rewrite is equivalent is insufficient evidence to
blame the judge for changed output.

Keep original-language clauses available. A translation is an auxiliary view, not a
replacement source. When testing multiple languages or question phrasings, record
which version was used; do not assume equivalence or stability.

## Resolution states

- `answered`: evidence determines the outcome or allowed outcome set.
- `intentionally_open`: the decision is explicitly delegated or variability is allowed.
- `not_applicable`: the scenario is outside the contract's legitimate scope.
- `unresolved`: evidence or intent is insufficient, conflicting, or inaccessible.

Runtime/provider failures are recorded separately as checks not completed. Do not
invent a semantic answer to make the report look complete.
