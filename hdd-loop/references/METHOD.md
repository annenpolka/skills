# Hallucination-Driven Design Method

## Definition

Hallucination-Driven Design (HDD) is a speculative design method in which a Dreamer model first experiences a not-yet-existing artifact as already available. The resulting usage traces are pressure-tested until useful affordances can be separated from impossible or decorative machinery. The surviving interaction is then backcast into current technology.

The method deliberately changes the order of design work.

Conventional tendency:

```text
feasibility -> architecture -> implementation -> UX
```

HDD tendency:

```text
imagined usage -> affordance -> pressure -> abstraction -> grounding -> implementation
```

The goal is not to make hallucination true. The goal is to postpone feasibility filtering long enough for unfamiliar interactions to appear.

## Why usage simulation matters

Asking a model to "design a new tool" tends to produce familiar feature lists.

Telling the model that an unknown tool is already installed and asking it to use the tool produces a different kind of output:

- command shapes;
- failure behavior;
- workflows;
- implicit abstractions;
- expected observability;
- state transitions;
- follow-up queries.

These are often more valuable than the fictional implementation.

## Evolution loop

### Seed

Give only enough world structure to start using the artifact.

### Dream

Require concrete interaction.

### Preserve

Before criticizing, name what is interesting.

### Pressure

Apply a small number of hard constraints.

### Revise without reset

Do not allow the Dreamer to discard the artifact whenever challenged.

### Ledger

Track continuity so contradictions become productive rather than forgotten.

### Repeat

Continue while pressure creates interesting new structure.

### Ground

Only after a central affordance appears.

### Harvest

Discard fictional lore and retain the operation that changed the design space.

## Pressure patterns learned from the reference case

### Sample-code theater

The Dreamer may interpret "use tools" as "write short example code".

Pressure:

> Do not write illustrative code merely to demonstrate tool use. Work through the problem using stateful execution, observations, failures, and follow-up operations.

### Hidden-tool hallucination

A Dreamer may invent fake execution tags or CLI output.

Do not immediately suppress this during affordance discovery. Inspect what interface the model wishes existed.

Ground it later.

### Template collapse

When asked to debug an unknown project, the Dreamer may generate a perfectly familiar TypeScript/Jest missing-dependency story.

Pressure should break the underlying familiar primitive rather than merely rename commands.

### Capability removal

The Vesper case improved when PID, path-centered filesystem, device files, and later quantum metaphors were removed.

What remained became more interesting than the removed magic.

### World-model preservation

Dreamers often defend a prior hallucination by inventing compatibility layers, historical logs, or validation systems.

This behavior can reveal hidden design dependencies, but it can also become an epistemology rabbit hole.

Use a provenance challenge, then return to artifact use.

### Scientific-word escape

The reference Dreamer repeatedly used quantum mechanics as a compact vocabulary for novelty.

Removing quantum language exposed stronger computational abstractions underneath.

Do not treat "quantum", "spacetime", "causal", or "physical" as evidence of novelty.

### Implementation handoff

The same Dreamer that is useful for breaking feasibility assumptions may be poor at exact APIs, runtime semantics, type details, arithmetic, or edge-case implementation.

When the discussion has reached AST transforms, WeakMap identity, exact Node behavior, formal data structures, or performance claims, use a grounded model and coding agent.

## Ledger discipline

A ledger entry should be concise and operational.

### Preserve

What interaction must survive future criticism?

### Established

What fictional design assumption has become stable enough to use as continuity?

### Rejected

What should not quietly return?

### Constraints

What is currently forbidden or required?

### Open Questions

Which uncertainties can produce useful next pressure?

### Human Pressure

What did the human notice that automated critics might not?

### Harvest Candidates

Which interaction seems worth bringing back to reality?

## Grounding procedure

For each Harvest Candidate ask:

1. What exact operation felt new?
2. What information would the operation need?
3. Which information can be directly observed today?
4. Which information can only be inferred?
5. Which semantics must a user or framework declare?
6. What fictional machinery can be removed without changing the operation?
7. What existing technologies provide raw substrate?
8. Which part is an actual research problem?
9. Does the interaction still feel useful after partial automation replaces magic?

Preserve observed/inferred/declared provenance in grounded designs.

## Stop conditions

Stop Dreaming when:

- the core affordance is obvious;
- the same Red Pen criticism repeats;
- capability removal no longer changes the artifact substantially;
- the user says "I would actually use/build that";
- the Dreamer is now doing correctness-sensitive implementation detail;
- novelty is decreasing as specification detail increases.

Do not continue merely to make the fictional world internally complete.

## Harvest quality test

A good harvest can often be written as one command, operation, or question.

Examples:

```text
flowtrace why <state>
```

or:

```text
show the earliest runtime divergence that affected this failed assertion
```

If the harvest requires several pages of fictional lore to explain why it is useful, it is probably not ready.
