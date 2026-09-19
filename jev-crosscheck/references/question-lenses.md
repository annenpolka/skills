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
