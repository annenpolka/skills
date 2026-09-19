# Question lenses

A palette of directions to ask from, not an execution plan. Use these samples to
notice questions you would otherwise omit and put useful, distinct assertions into
the ordinary `questions` map. There is no required lens set, question count,
category allocation, metadata format, or extra round of Jev evaluation.

## Using the samples

Skim for directions relevant to the goal and material already in hand. Instantiate
as many useful assertions as that material supports; do not ask Jev to rank the
lenses before using them. These expand the assertions required by `SKILL.md`, not
replace them. Invent other directions when the samples miss the subject.

Each question below is a separate seed. Replace X, G, A, B, etc. with a concrete
subject and name the actual state field. Default to Noul for one proposition; use
Choice for defined competing readings and Score for a defined ordered scale. Do not
send the lens title or an open-ended "why/how could we improve this?" as a question.

Keep the existing sufficiency rule: name the particular definition, behavior, or
measurement a claim needs. A document's explicit statement is not proof of runtime
behavior. A missing statement in a complete, named excerpt is not absence from an
unread repository. Lack of evidence, a negative answer, and inapplicability differ.

Samples are not findings or requirements. Do not assume a fault exists, invent a
user preference, or add your expected conclusion to the criteria. If an answer
depends on a hypothetical, make it explicit and follow `SKILL.md`'s conditional /
unconditional pairing rule. Keep hypothetical material out of questions meant to
read the actual source; use separate requests when their evidence must differ.

Batch questions that can share the same permitted state within the provider's
input limits. Do not accumulate unrelated material just to make one request. More
questions do not authorize more disclosure or spending. Read the answers against
the source, without counting similar questions as votes; no lens creates an
approval, proof, or automatic follow-up loop.

## Meaning and evidence

| Lens | Separate question seeds |
|---|---|
| Definition | Does `spec` define X by an observable condition? Does `implementation` use X with the meaning stated in `contract`? |
| Competing readings | Under reading A, does `clause` require X? Under reading B, does the same clause require X? Make each reading explicit in its own question. |
| Scope and quantifiers | Does `guarantee` include actors other than the initiating caller? Does it apply to every item rather than at least one item? |
| Missing dependency | Does `test_code` show the actual response statuses returned by its fake, rather than only a reference to an unseen fixture? Does `policy` include the definition of the role used by this rule? |
| Claim-to-source fit | Does `source` support the population named in `claim`? Does `claim` retain the condition under which `source` says G holds? |

## Time, state, and ownership

| Lens | Separate question seeds |
|---|---|
| Temporal boundary | Does `spec` bind G to operation start? Does it bind G to successful completion? Ask separately instead of assuming those events coincide. |
| Acknowledgement vs. completion | Does `protocol` define its acknowledgement as acceptance for processing? Does it require the side effect to finish before that acknowledgement? |
| Ordering | Does `protocol` require A before B? Does it explicitly permit B before A? Absence of a requirement alone does not establish permission. |
| Concurrent ownership | Does `design` name an authority that resolves competing claims to X? Does `write_path` reject a result from an owner whose lease has expired? |
| Intermediate visibility | Does `read_path` expose a state between A and B? Does `client_contract` define how to interpret that intermediate state? |

## Failure and recovery

| Lens | Separate question seeds |
|---|---|
| Partial success | Does `procedure` specify the state retained when A succeeds and B fails? Does `recovery` cover that particular partial state? |
| Duplicate and retry | Does `retry_policy` preserve the operation's identity across attempts? Does `deduplication` cover the external side effect rather than only queue admission? |
| Lost, late, or stale data | Does `consumer` distinguish a delayed update from a newer update? Does `protocol` specify recovery when a required notification is lost? |
| Cancellation | Does `cancel_contract` mean preventing result publication? Does it also require interrupting ongoing computation? Keep these as different guarantees. |
| Rollback and restart | Does `rollback_plan` address effects outside the local transaction? Does `restart_path` resume from a persisted checkpoint rather than a process-local flag? |

## Inputs and external boundaries

| Lens | Separate question seeds |
|---|---|
| Empty and extreme inputs | Does `input_contract` distinguish an empty value from an absent value? Does `boundary_test` assert the behavior at the stated limit? Compute numeric boundaries with tools, not Jev. |
| Dependency assumptions | Does `design` rely on ordering from the upstream service? Does the supplied `upstream_contract` actually promise that ordering? |
| Compatibility and migration | Does `migration_plan` address concurrent old and new readers? Does `api_change` preserve the behavior promised to existing clients? |
| Authority and revocation | Does `authorization_path` check the resource's owner? Does `revocation_policy` specify the treatment of work already in flight? |
| Resource exhaustion | Does `overload_policy` identify which work is rejected when capacity is reached? Does `retry_policy` account for the specified overload response? |

## Tests, observation, and explanation

| Lens | Separate question seeds |
|---|---|
| Distinguishing test | Would the assertions in `test` reject the explicit wrong behavior in `counterexample`? Does `test` assert the externally promised effect rather than only that a helper ran? Treat hypothetical wrong behavior as hypothetical. |
| Mock boundary | Does the mock in `test` replace the interaction where `claimed_failure` could occur? Does the test still exercise the ordering that `requirement` concerns? |
| Contract vs. incidental detail | Does `requirement` constrain the call count asserted by `test`? Would the assertions reject `equivalent_implementation` despite its preserving that named contract? |
| Observability and recovery signal | Does `telemetry_definition` distinguish accepted work from completed work? Does `runbook` name an observable signal for the failure it addresses? |
| Alternative explanation | Does `evidence` distinguish explanation A from the supplied explanation B? Does `report` present an association as establishing causation? Ask about evidential support, not an invented causal probability. |

## Simplification and reframing

For these lenses, first describe a concrete candidate as a proposal, not existing
behavior. Ask about one required property at a time; do not ask for a blanket
"simpler and equally good" verdict. If the candidate is underspecified, identify
that missing detail instead of silently completing it.

| Lens | Separate question seeds |
|---|---|
| Remove a component | Does `requirement` explicitly require component X, rather than the outcome it serves? Under `candidate_without_X`, is the rule implementing G still present? |
| Move responsibility | Does `candidate` put the check at the layer that has the information it needs? Does the move leave the named failure path unchecked? |
| Single source of truth | Does `current_design` give two stores authority over the same decision? Does `candidate` eliminate the reconciliation step while retaining the specified authority? |
| Weaken one guarantee explicitly | Does `requirement` permit the delay introduced by `candidate`? Does `candidate` change a mandatory guarantee rather than only a stated preference? Do not adopt that change on Jev's authority. |
| Reframe the problem | Does `goal` require reducing latency, rather than this particular caching mechanism? Does `alternative` address the same named outcome by a different mechanism? Evaluate each outcome separately. |

## Decisions while building

Use these directions when making something, not only reviewing a finished proposal.
Reading an existing promise and choosing a new promise are different jobs. Start
from the current goal, constraints, and artifact; write concrete candidates yourself.
An unspecified behavior can become an explicit design choice within your authority,
not a fact to recover from the source or an invitation to guess hidden user intent.
A supplied proposal is material to inspect, not evidence of implemented behavior.
The conditional-pair rule still applies when assuming facts about unseen material.

| Lens | Separate question seeds |
|---|---|
| Purpose vs. mechanism | Does `goal` require component X itself, rather than outcome G? Does the rule for G remain in `candidate_without_X`? |
| Capability gained | Does `candidate_B` provide a path to retry only the failed operation? Does `candidate_A` provide that same path? |
| Work avoided | Does `candidate` remove the reconciliation step described in `current_design`? Does the proposal still define who owns the reconciled decision? |
| External promise | Does `candidate` expose its storage format in the public API? Does `requirement` require that format to be public? |
| Decision ordering | Do `candidate_A` and `candidate_B` require the same public operation signature? Does `first_slice` commit to a behavior on which the candidates differ? |
| Reversible choice | Would the explicit change from `candidate_A` to `candidate_B` require converting existing records? Does the supplied `migration_plan` cover that conversion? |
| Joint effects | Under the combined rules in `retry_and_notification_candidate`, can one operation trigger more than one notification? Does that proposal include a rule suppressing the duplicate effect? |
| Discriminating experiment | Does `experiment` exercise a condition where the candidates prescribe different behavior? Does its observation distinguish those behaviors rather than merely report completion? |
| Revisit condition | Does `candidate` depend on there being only one writer? Does the requested scope in `goal` preserve that condition? |

These are optional samples, not a new review gate. Batch several decisions when
their questions can share permitted material. Ask about the intended combination
as well as individual choices when interactions matter; separately favored options
are not automatically compatible. Keep candidate descriptions separate from your
preferred conclusion, and retain the specific sufficiency checks in `SKILL.md`.

A Choice recommendation can supplement these questions when the alternatives and
priorities are explicit. It is advice, not authority or a substitute for checking
mandatory properties. A concrete experiment can be a next-action option, not a
catch-all label for unknown. If a property is unsupported, obtain evidence or leave
it unresolved. If several choices meet the constraints, choose within delegation
and state the actual preference or reversible assumption used; do not wait for a
unanimous Jev answer or invent a preference on the user's behalf.

The useful result is the next piece of work: choose a promise, build a common slice,
try a reversible implementation, remove unnecessary scope, or run a distinguishing
check. Preserve mandatory requirements. Record what was chosen, why, what to do
next, and what would cause a revisit in an ordinary work note; use an ADR when the
project or the significance of the decision warrants it. Keep source evidence,
Jev's signals, and your own reasoning distinguishable. Do not put a human's name
on an unapproved decision. Existing permission, disclosure, and budget rules apply.

Return to the same helper when new code, a test result, or new evidence raises a
useful decision. Do not add rounds just to grow the question set, or rephrase until
Jev endorses the preferred answer. Resolve delegated implementation details rather
than sending every small choice back to the user; flag choices outside delegation.

### Example: decide reuse semantics before storage

This fictional, unexecuted example supplies four state fields. The candidates are
proposals and the experiment is a plan, not existing code or observed results.
No Jev answers are included. Keep actual-source questions distinct from questions
about proposals, as with the other examples in this palette.

```json
{
  "goal": "Build a CLI that processes multiple files. After interruption, the user can edit inputs or processing settings and continue. Reuse successful work when its input and settings are unchanged. The first release has one user and one process on one machine. No persistence format is required.",
  "candidate_A": "Proposal: record a pathname after successfully producing its output. On a later run, skip any pathname marked complete, without comparing input contents or processing settings. Recovery between output publication and completion-record update is not specified.",
  "candidate_B": "Proposal: record a pathname with fingerprints of input contents and processing settings after successfully producing its output. Reuse a completed result only when both fingerprints match the current input and settings. Recovery between output publication and completion-record update is not specified.",
  "experiment": "Proposed check, not executed: complete one input; then keep its pathname and settings but edit its contents so its input fingerprint differs; rerun and observe whether that input is processed again."
}
```

Each row below can become a separate Noul question in the ordinary request. The
rule-visibility questions are specific sufficiency checks, not safety verdicts.

| Direction | Concrete question |
|---|---|
| A rule visibility | Does `candidate_A` state its reuse condition directly, without referring to an unseen rule? |
| B rule visibility | Does `candidate_B` state its reuse condition directly, without referring to an unseen rule? |
| Distinction missing from A | Does the reuse rule in `candidate_A` compare input contents before skipping a completed pathname? |
| Input condition in B | Does the reuse rule in `candidate_B` require the input fingerprint to match? |
| Settings condition in B | Does the reuse rule in `candidate_B` require the processing-settings fingerprint to match? |
| Defer a mechanism | Does `goal` require a particular persistence format? |
| Unfinished recovery decision | Does `candidate_B` define recovery after output publication but before completion-record update? |
| Experiment visibility | Does `experiment` explicitly state what changes between the two runs? |
| Observable distinction | Does `experiment` observe whether the input is processed again rather than only whether the CLI exits successfully? |

After an actual run, inspect the proposals and goal against the returned signals.
A possible author-written decision note could have this shape; it is not a Jev
result or an approved decision:

```text
Status: proposed.
Choose: reuse completed results only when input and processing settings match.
Reason: preserve unchanged work without treating edited work as already complete.
Evidence: link the goal and candidate passages; add real answer IDs after a run.
Next: write cases for unchanged input, edited input, and changed settings;
      prototype interruption between output publication and completion recording.
Defer: storage format. No crash-safe implementation is claimed yet.
Revisit: the scope gains concurrent writers, or measurements challenge the cost
         of fingerprinting.
```

Choose storage after understanding the record and recovery needs, rather than
asking a product-name Choice to settle unspecified semantics. A code or test change
from this step can supply the material for the next useful batch. There is no
mandatory second call or separate decision runner.

## Mutations of one question

Use a mutation when it creates a useful distinction, not a Cartesian product or a
quota. Keep the original and changed condition explicit. A changed answer suggests
something to inspect; it does not establish a causal effect or a specification bug.

| Mutation | Example direction |
|---|---|
| Actor swap | Initiating caller -> another caller or node. Does the stated guarantee still include that actor? |
| Time shift | Before -> during -> after a named commit or acknowledgement. Which interval is covered? Turn each into a proposition. |
| Order swap | A then B -> B then A. Does the source define the changed sequence's result? |
| Partial failure | A succeeds, B fails. Is that intermediate outcome specified? |
| Duplicate | One delivery -> the same operation delivered twice. Is identity preserved across both? |
| Delay or loss | Immediate delivery -> delayed or missing delivery. Is a corresponding recovery rule present? |
| Input boundary | Missing -> empty -> stated minimum or maximum. Is each case covered by the contract? |
| Permission change | Permission at submission -> revocation before use. Is the latter check required? |
| Dependency unavailable | Healthy dependency -> explicit timeout or unavailability. Does the caller have a defined response? |
| Representation change | Same logical value, different encoding or version. Does the contract require equivalent treatment? |
| Component removal | Remove a named cache, queue, or coordinator in an explicit proposal. Which required property loses its implementation? Ask one property at a time. |
| Responsibility relocation | Writer-side check -> reader-side check in an explicit proposal. Is the same named failure path covered? |

## Example: one excerpt, several directions, one request

This is a fictional input example, not a model run or a finding. It combines scope,
acknowledgement, failure, missing-dependency, and simplification lenses. The candidate
is labelled as a proposal. Questions reading the source do not treat the candidate
as implemented. Put it in a separate request if that separation is unclear.

```json
{
  "state": {
    "cache_spec": "R1: After a successful update response, any read started on any API node must return the committed version or a newer version. R2: The writer commits the update to the primary database, enqueues an invalidation event, and returns success. R3: A worker consumes the event and invalidates per-node cache entries asynchronously. R4: Failure handling for delivery is not specified in this excerpt.",
    "candidate": "Proposal only: remove per-node caches from this read path and serve each read from the primary database. All other steps remain as described. No latency measurements are supplied."
  },
  "questions": {
    "scope": {
      "type": "noul",
      "instructions": "Does R1 in `cache_spec` extend its read guarantee to API nodes other than the node handling the update?"
    },
    "success_boundary_stated": {
      "type": "noul",
      "instructions": "Does `cache_spec` directly state the writer's sequence up to returning success, without referring to an unseen definition of that sequence?"
    },
    "ack_barrier": {
      "type": "noul",
      "instructions": "Does the writer sequence in R2 of `cache_spec` explicitly require confirmation of cache invalidation before returning success?"
    },
    "delivery_failure_rule": {
      "type": "noul",
      "instructions": "Does `cache_spec` specify the action taken when invalidation-event delivery fails?"
    },
    "candidate_cache_dependency": {
      "type": "noul",
      "instructions": "Under the proposal in `candidate`, does a read on this path still use a per-node cached entry?"
    },
    "latency_evidence": {
      "type": "noul",
      "instructions": "Does `candidate` include measured read latency for its proposed path?"
    }
  }
}
```

`success_boundary_stated` supplies a specific sufficiency check for reading the
writer's acknowledgement sequence; it is not a general safety check. A low
`latency_evidence` answer would leave latency claims unsupported, not show that the
candidate is slow. Add a question about latency only after the required evidence
exists. Likewise, discovering a documented rule is not testing its implementation.

Use the existing write -> inspect -> send procedure and retain the request and raw
response. There is no new runner, lens-selection call, or mandatory second batch.
