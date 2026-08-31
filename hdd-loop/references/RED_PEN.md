# Red Pen Rubric

Red Pen applies evolutionary pressure without replacing the artifact.

Always begin by identifying what should survive.

## Review dimensions

### Preserve

Identify new affordances, operations, metaphors, or abstractions worth protecting.

A Preserve item should describe an interaction or design property, not fictional lore.

### Contradictions

Look for conflicts with:

- the current output;
- the ledger;
- previous observations;
- arithmetic or units;
- the artifact's own definitions.

### Magic

Identify capabilities whose information source or implementation boundary is missing.

Do not reject magic solely because it is unfamiliar. Ask what information would be required to make the interaction real.

### Provenance Problems

Distinguish:

- observed: directly obtained from a real execution or explicit supplied source;
- inferred: produced by analysis, matching, heuristics, or a model;
- declared: provided as a user/framework/domain semantic rule;
- fictional-observed: represented by the Dreamer as an observation inside the speculative world.

During HDD Dreaming, fictional-observed material is legitimate design material but not external evidence.

Flag cases where the Dreamer:

- cites its own generated output as independent evidence;
- invents historical logs after the fact;
- creates a validation command solely to prove another invented command;
- rewrites earlier observations without acknowledging the rewrite.

### Boring Collapse

Flag when realism pressure destroys the interesting operation and replaces it with:

- a thin wrapper;
- a familiar product with renamed nouns;
- generic LLM search or summarization;
- ordinary shell scripting without a new interaction model.

### Semantic Inflation

Flag when familiar mechanisms receive grandiose names that hide rather than clarify their actual behavior.

Typical warning signs from the reference case include "quantum", "spacetime", "entanglement", "causal" and "physical" when the implementation is merely probabilistic state, a predicate, a dependency edge, or a normalized metric.

### Unsupported Precision

Flag exact-looking values with no measurement or derivation.

Recompute numerical claims whenever useful.

### Implementation Drift

If the Dreamer is now spending most of its effort on AST details, WeakMaps, exact APIs, edge-case coding, or benchmark claims, consider ending HDD and handing off to an implementation-focused model.

## Pressure construction

Return only 1-3 important pressures per iteration.

Good pressure:

- "Do not use quantum concepts at all; keep the same interaction useful."
- "The OS has no PID, path, or device-file abstractions. Discover what replaces them."
- "That 0.75 value appeared earlier without justification. Explain the tradeoff that makes it optimal."
- "You cannot prove the observation by querying another output from the same fictional environment."
- "Keep it a one-shot CLI for coding agents. Do not add a human GUI."

Bad pressure:

- a complete replacement architecture;
- a long implementation tutorial;
- a list of ten unrelated improvements.

## Structured external-critic contract

When the runner uses an external critic, return a single JSON object and no prose outside it.

```json
{
  "summary": "short red-pen summary",
  "preserve_add": ["..."],
  "established_add": ["..."],
  "rejected_add": ["..."],
  "constraints_add": ["..."],
  "open_questions_add": ["..."],
  "harvest_candidates_add": ["..."],
  "pressure": ["one to three pressures"],
  "redpen_markdown": "optional human-readable review"
}
```

Do not remove ledger entries in an automated patch. Human intervention may revise or supersede them explicitly.
