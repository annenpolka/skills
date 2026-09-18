# Reuse Jev Crosscheck; do not replace its execution boundary

Locate and read the installed `jev-crosscheck/SKILL.md`. This companion describes
what to ask; the installed skill controls API access, credential handling, permitted
state, inspection, retries, and reporting. If it is unavailable or forbidden, perform
source-based review and explicitly mark the cross-check not run.

The reviewed repository version uses a helper with separate request-writing,
inspection, and sending calls. Do not combine them or build a direct HTTP fallback.
Current host/project restrictions take precedence. Store keys only through the
existing skill's supported mechanism; never read or reproduce them in this skill.

## Useful semantic relations

| Relation | Ask about | Do not ask about |
|---|---|---|
| Clause → decision | Whether the shown rule determines a named behavior | Whether the whole product is fully specified |
| Evidence → sufficiency | Whether a concrete needed definition is actually shown | A generic confidence score detached from evidence |
| Clause → candidate model | Whether the candidate changes a boundary, loses an exception, or introduces a rule | Whether a solver proof is valid by majority vote |
| Scenario → applicability | Whether the source's actors and preconditions cover the case | Whether an unexecuted trace is reachable |
| Finding → consequence | Whether the difference touches the stated observation contract | Whether a probability authorizes changing that contract |

## Request construction pattern

Use raw, identified source passages and separately named candidate interpretations.
Keep the agent's conclusion, preferred resolution, gold labels, and expected Jev
answer out of the request. Frame alternatives with comparable detail. Question IDs
are bookkeeping: put the full task and context references in instructions. [S2]

Example of a *prepared* request shape, not a prevalidated API call:

```json
{
  "state": {
    "clause": "Three failed logins lock the account.",
    "decision": "Whether a successful login resets the failure count.",
    "candidate_a": "Success resets the count to zero.",
    "candidate_b": "Success preserves the count."
  },
  "questions": {
    "reset_rule_visible": {
      "type": "noul",
      "instructions": "Does `clause` explicitly state how a successful login changes the failure count?",
      "criteria": {
        "true": "The effect of success on the count is explicitly specified.",
        "false": "The effect of success on the count is not explicitly specified."
      }
    },
    "a_contradicts_clause": {
      "type": "noul",
      "instructions": "Does `candidate_a` contradict an explicit rule in `clause`, without adding an unstated convention about counter lifetime?"
    },
    "b_contradicts_clause": {
      "type": "noul",
      "instructions": "Does `candidate_b` contradict an explicit rule in `clause`, without adding an unstated convention about counter lifetime?"
    }
  }
}
```

"No explicit reset rule" and "not contradicted by this excerpt" are not proofs of
absence or admissibility across all project requirements. A low contradiction
answer does not establish full source compatibility. Read incorporated rules and
report the searched scope. A low sufficiency signal means gather material or remain
unresolved, not that the candidate is false.

Do not always funnel evidence sufficiency through one generic question. Name the
particular fact the candidate needs: a unit, reset rule, time window, exception,
identity definition, or allowable input. Shared sufficiency probes are acceptable
only when the claims genuinely depend on that same fact in the same evidence.

## Batch without changing the evidence boundary

Independent questions can share a request when all are meant to see the same
approved state. If two checks have different permitted sources, keep them separate.
Question independence does not hide a field included in shared state. If a prior
answer is needed to fetch new material, construct a second request after retrieval.

Noul gives a yes-probability, not a separate confidence. Score/Choice distribution
concentration is not a guarantee of correctness in this project. Do not invent a
single universal threshold for specification truth or policy adoption. [S2, S3]

## Report integration

Keep the agent's evidence-based finding first. Add only material Jev results: actual
exit code, requested/returned model when available, source fields sent, authorized
request/response locations, consequential answers, and how they affected review.
Raw results stay in the permitted scratch location according to the installed skill.
When no call occurred or it failed, give the reason and no fabricated response fields.

Never let a solver success bypass source alignment; never let a high semantic score
bypass a solver failure. These mechanisms answer different questions.
