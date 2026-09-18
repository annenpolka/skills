# Decision packet and evidence ledger

The default output is a short review, not a new specification. Write in the user's
language. Preserve exact original-language quotations and source locations.

## Review header

```yaml
review_scope: documents, revision/snapshot, and functionality examined
source_authority: normative sources versus implementation/test evidence
observation_contract: outputs or persisted effects that matter
budget: review/exploration limits
checks_run: reading, Jev, table enumeration, solver, execution
checks_not_run: method and concrete reason
```

## Finding template

```yaml
id: SP02-001
status: unresolved_decision
kind: missing_policy
summary: What remains undecided, stated without a proposed answer.
source_refs:
  - location: exact file/revision/section or line range
    quote: copied source text, not generated wording
searched_scope: documents and incorporated references actually checked
missing_sources: []
decision: The precise choice the owner must make.
scenario: The smallest relevant scenario that exposes the choice.
applicability: Why the scenario belongs to this contract; mark hypotheses.
interpretations:
  - id: A
    rule: candidate behavior
    source_alignment: supported / not_contradicted_in_reviewed_scope / unresolved
  - id: B
    rule: alternative behavior
    source_alignment: supported / not_contradicted_in_reviewed_scope / unresolved
observation: Observable output/effect in which they differ.
assumptions: Named assumptions, separate from explicit or derived requirements.
evidence:
  - basis: source_comparison / semantic_signal / execution_witness / formal_counterexample / unresolved
    artifact: actual source, output, or trace location
    claim_supported: Exactly which limited claim this evidence establishes.
consequence: Why the unresolved choice matters.
resolution_options: Alternatives with tradeoffs, not adopted policy.
recommendation: Optional proposed choice and rationale; label as proposal.
owner: Decision authority, or unknown if not available.
revisit_when: Changed source, accepted policy, model revision, or new evidence.
```

Do not require every field for every one-line observation. Missing evidence, scope,
or authority must never be concealed by inventing data to fill the template.

## Mechanism result card

```yaml
method: direct reading / finite enumeration / simulation / bounded model check / inductive check
model_artifact: path and digest
source_mapping: clause IDs and interpretation assumptions
tool: actual name and version, or not_run
command: executed command, or planned_command explicitly labeled
inputs: relevant config, domain, initial conditions, observation projection
limits: depth, scope, seed, resource cap, fairness where relevant
result: witness_found / no_witness_in_bound / completed_finite_search / obligation_discharged / unknown / error / not_run
trace_artifact: actual path or none
minimality: established with method / not established
source_alignment: separate status and evidence
```

A search result supports the exact modeled predicate. A full finite search can
establish a property of that finite model; it does not establish all relevant
real-world requirements were represented. A bounded no-witness result is weaker.

A hypothesis supported by multiple model judgments remains a semantic signal. A
model-level counterexample is not automatically an implementation bug. An
unreachable scenario cannot by itself establish an operational gap.

## Compact user-facing format

1. **Findings and decisions:** A few consequential items, each with source and case.
2. **Resolved or deliberately open:** Prevent repeated questioning and false alarms.
3. **Verification and limits:** Actual checks, missing sources, unmodeled families.

Keep factual observations separate from suggestions. Never place an assumed choice
inside a quotation or let it silently determine test expectations.

## Coverage ledger

```text
Reviewed source slices: ...
Checked scenario families: ...
Probes: answered / intentionally open / inapplicable / unresolved
Formal checks: executed + scope, or not run
External semantic checks: executed + material result, or not run
Not explored: ...
```

Counts are useful only when generated from an actual ledger. Do not invent a coverage
percentage without a defined denominator. Generated scenarios do not define the
entire domain merely by existing.

## Handoff to spec-interview

Pass one unresolved decision with its source, minimal scenario, alternatives,
consequences, and proposed recommendation. Do not ask the user to restate facts that
were already recoverable. Only activate a continuing interview when requested; the
normal review can finish with a packet of remaining decisions.
