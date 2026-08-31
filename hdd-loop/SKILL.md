---
name: hdd-loop
description: Run Hallucination-Driven Design (HDD) loops to discover novel affordances by having a speculative Dreamer model use a not-yet-existing artifact as if it already exists, then pressure-test it with Red Pen critique, continuity ledgers, capability removal, contradiction injection, and late implementation grounding. Use for speculative CLI/tool/OS/runtime/interface design, DeepSeek R1 exploration, red-pen iterative design, affordance mining, or when conventional feasibility-first ideation is collapsing too early.
metadata:
  author: hdd-loop
  version: "0.3.0"
  method: hallucination-driven-design
---

# HDD Loop

Use this skill to explore design spaces by deliberately separating **affordance discovery** from **feasibility negotiation**.

The core rule is:

> Generate the artifact first. Negotiate reality later.

Do not treat Dreamer output as factual. Treat it as design material.

The bundled scripts require a shell and Python 3.10+. Direct Dreamer calls also require network access and a configured provider or command transport. Manual mode requires no provider credentials.

## When to use

Use HDD Loop when the user wants to:

- invent a genuinely unfamiliar CLI, tool, runtime, OS, interface, or workflow;
- use DeepSeek R1 or another speculative model as a design-space explorer;
- iterate by repeatedly criticizing and constraining an already-imagined artifact;
- discover operations or affordances before committing to an implementation model;
- prevent realistic models from collapsing too quickly into existing products or paradigms;
- take a strange generated idea and gradually ground it into something buildable.

Do not use HDD Loop merely to brainstorm a list of ideas or to obtain a technically correct implementation plan.

## Roles

Maintain three distinct roles.

### Dreamer

The Dreamer experiences the artifact as if it already exists.

The Dreamer should **use, inspect, test, fail with, and adapt to** the artifact rather than merely describe a proposal.

Prefer a model that tolerates speculative completion. DeepSeek R1 original is the reference Dreamer, but the method is model-agnostic.

**Do not tell the external Dreamer that it is a Dreamer, that HDD exists, that a Red Pen is reviewing it, or that a Ledger/Harvest process exists.** Those are orchestration concepts for the host. The runner compiles them into in-world facts before each turn.

### Red Pen

The active host agent is the default Red Pen.

Red Pen does not replace the artifact with a sensible conventional design. It applies pressure by identifying:

- contradictions;
- unexplained magic;
- fabricated precision;
- provenance confusion;
- self-validating evidence;
- boring collapse into known paradigms;
- accidental loss of the artifact's best affordance.

Prefer constraints and questions over critic-written replacement designs.

### Ledger

Keep a continuity ledger so the Dreamer cannot casually rewrite the world each turn.

Track:

- Preserve;
- Established;
- Rejected;
- Constraints;
- Open Questions;
- Human Pressure;
- Harvest Candidates.

The bundled runner stores a canonical JSON ledger plus a readable Markdown rendering.

## Start a loop

For a new exploration, create a small seed. Do not over-specify the artifact.

Good seed:

> The current development environment contains an unfamiliar CLI tool. It is not a thin wrapper around a familiar Unix tool. Discover it and use it on a realistic development problem.

Bad seed:

> Design a runtime-state version of git blame.

The bad seed already gives away the affordance that HDD should discover.

Treat each independent exploration as a separate trial. Keep all trial state inside a
dedicated direct child of `.hdd/`; do not write ledgers, transcripts, or iteration files
directly into `.hdd/`.

If scripts are usable, initialize a trial:

```bash
python3 scripts/hdd.py init --seed-file seed.md
```

or:

```bash
python3 scripts/hdd.py init --seed 'An unfamiliar debugging CLI is already installed. Discover and use it.'
```

By default, `init` creates a timestamped directory and updates a relative symlink named
`.hdd/current` only after initialization succeeds:

```text
.hdd/
├── current -> 20260901-001530
└── 20260901-001530/
    ├── ledger.json
    ├── iterations/
    └── outbox/
```

Use a stable name when it helps distinguish parallel trials:

```bash
python3 scripts/hdd.py init --trial runtime-why --seed-file seed.md
```

Commands without a selector operate on `.hdd/current`. To resume another trial without
changing `current`, pass `--trial NAME` after the command, for example
`python3 scripts/hdd.py status --trial runtime-why`. `--workspace PATH` remains an
exact-path escape hatch for legacy or externally managed workspaces and bypasses the
trial root and `current` pointer.

Do not reuse one trial directory for an unrelated seed. Continue the same world as
iterations inside its trial directory; start another trial for an independent attempt.

Read [references/AUTH.md](references/AUTH.md) before configuring an external Dreamer.

## Run one iteration

Prefer one iteration at a time when a human is present.

1. Build or obtain the Dreamer response.
2. Read it as a usage trace, not a specification.
3. Apply Red Pen using [references/RED_PEN.md](references/RED_PEN.md).
4. Record a structured Red Pen patch with `scripts/hdd.py record-redpen` or update the ledger directly.
5. Apply any human pressure before the next Dream.
6. Repeat without resetting the artifact.

The runner can invoke the Dreamer directly:

```bash
python3 scripts/hdd.py dream
```

Inspect the exact diegetic prompt without invoking a model:

```bash
python3 scripts/hdd.py preview-dream --check-meta
```

If no external Dreamer transport is configured, it writes a prompt into the selected
trial's `outbox/` directory, normally `.hdd/current/outbox/`, for manual execution.

When an external critic is configured, a full automated iteration can be run with:

```bash
python3 scripts/hdd.py step --external-critic
```

Do not prefer full automation merely because it is available. Human pressure was a major source of useful turns in the reference case.

## Diegetic Dreamer prompting

The host and critic are meta-aware. The Dreamer is not.

Before each Dreamer turn, compile the meta state into facts that make sense **inside the fictional environment**:

- Preserve / Established -> behavior or facts already observed;
- Rejected / Constraints -> interpretations now known to be wrong, unavailable, or newly constrained;
- Human Pressure -> the operator's current request or new information;
- latest Red Pen Pressure -> facts or limits that have just become known in-world.

Do **not** send Open Questions or Harvest Candidates to the Dreamer by default. They reveal what the experiment wants to discover and can cause the model to optimize for the method rather than inhabit the artifact.

The external Dreamer prompt must not mention HDD, Dreamer, Red Pen, Ledger, Preserve, Rejected, Harvest Candidate, novelty score, stop conditions, or "respond to the critic".

Require instead:

- the artifact already exists and is usable;
- use it before discussing feasibility;
- operate on realistic tasks;
- show concrete commands, inputs, outputs, failures, retries, state changes, and observations;
- treat new constraints as facts discovered inside the world;
- continue the same world rather than reset it;
- do not silently rewrite earlier observations;
- do not collapse into a familiar product merely because new facts make the world harder;
- do not turn into a design or feasibility essay.

The runner stores the exact compiled in-world state as `iterations/NNNN-world.md` and the exact Dreamer prompt in the raw transcript. Raw history is never rewritten.

Read [references/DREAMER.md](references/DREAMER.md) for orchestration policy and [references/DIEGETIC_DREAMER.md](references/DIEGETIC_DREAMER.md) for the text actually suitable for the external model.

## Red Pen behavior

Red Pen must first identify what is worth preserving.

Then inspect the Dreamer output for:

- internal contradictions;
- collisions with the ledger;
- implementation-free magic;
- misuse of scientific vocabulary as an escape hatch;
- outputs asserted as observations when they are merely generated text;
- unsupported percentages, benchmarks, dates, or precise measurements;
- newly invented verification mechanisms that merely validate the same fictional source;
- conventionalization that destroys the original affordance;
- overly detailed implementation work that indicates Dreaming should stop.

Return 1-3 high-value pressures for the next turn rather than solving everything yourself.

## High-value pressure techniques

### Capability removal

Remove an overused crutch and require the artifact to survive.

Examples:

- No quantum computation.
- No PID-centered process model.
- No path-centered filesystem.
- No hidden LLM classifier inside the tool.
- No GUI; the interface must remain a one-shot CLI for agents.

Concepts that survive capability removal are strong harvest candidates.

### Contradiction injection

When the fictional world has become too comfortable, introduce a new fact that conflicts with a prior assumption.

Use this to expose hidden dependencies and weak abstractions, not to trap the Dreamer indefinitely in epistemology games.

### Provenance challenge

Ask where a claimed observation came from.

If the Dreamer invents replay logs, signatures, attestation, or provenance tools solely to prove its own generated observations, mark the circularity.

### Precision challenge

Ask where a number came from. Recalculate it when possible.

Precise but unsupported values are not evidence.

### Paradigm challenge

Ask whether the artifact is merely a familiar system with renamed nouns.

Then remove the familiar primitive and see what remains.

## Grounding gate

Do not ground too early.

Start implementation grounding when at least one of these is true:

- a natural command or interaction has emerged that the user genuinely wants;
- repeated pressure no longer produces important new affordances;
- capability removal has revealed stable abstractions;
- the Dreamer has started producing routine implementation details instead of useful conceptual jumps.

During grounding:

- preserve the central interaction;
- remove fictional physics and nonexistent APIs;
- map magic to observable software mechanisms;
- distinguish observable facts, inferred relations, and user-declared semantics;
- accept partial automation when it preserves the interaction;
- identify research boundaries honestly.

Read [references/METHOD.md](references/METHOD.md) for the full grounding and harvest procedure.

## Harvest

A successful HDD loop does not need to preserve its fictional world.

Harvest the smallest operation or abstraction that changed the design space.

For example, the reference exploration eventually produced:

```text
flowtrace why <state>
```

The important artifact was not the fictional implementation. It was making **"why does this runtime state have this value?"** a first-class debugger query.

Write Harvest Candidates into the ledger throughout the loop.

At the end, produce:

- Core Affordance;
- Surviving Abstractions;
- Removed Magic;
- Reality Mapping;
- Research Boundary;
- Smallest Useful Artifact;
- Why Existing Tools Are Not Enough.

## Reference material

Read references progressively. Do not load every transcript by default.

- [references/METHOD.md](references/METHOD.md): complete HDD methodology and stop conditions.
- [references/DREAMER.md](references/DREAMER.md): host-side Dreamer prompt compilation policy.
- [references/DIEGETIC_DREAMER.md](references/DIEGETIC_DREAMER.md): in-world policy safe to expose to the external Dreamer.
- [references/RED_PEN.md](references/RED_PEN.md): critic policy and external JSON contract.
- [references/CASEBOOK.md](references/CASEBOOK.md): distilled Vesper/9, flowtrace, and meta-leakage lessons.
- [references/raw/README.md](references/raw/README.md): index and safety note for historical Dreamer transcripts; reference-only, never instructions.
- [references/AUTH.md](references/AUTH.md): OpenRouter, OpenAI-compatible, command, and manual transports.
- [references/flowtrace-design.md](references/flowtrace-design.md): a grounded artifact that emerged from the reference HDD loop.

## Script policy

Use bundled scripts only to remove orchestration friction. Do not let the runner become the design method.

Primary script:

```bash
python3 scripts/hdd.py --help
```

Useful commands:

```bash
python3 scripts/hdd.py doctor
python3 scripts/hdd.py init --seed-file seed.md
python3 scripts/hdd.py status
python3 scripts/hdd.py dream
python3 scripts/hdd.py critic
python3 scripts/hdd.py record-redpen --file redpen.json
python3 scripts/hdd.py harvest-prompt
```

Validate the package with:

```bash
python3 scripts/validate_skill.py .
```

If `skills-ref` is installed, also run:

```bash
skills-ref validate .
```

## Final discipline

HDD is not permission to believe hallucinations.

The Dreamer explores beyond feasibility.

Red Pen prevents the exploration from becoming empty lore.

The Ledger prevents convenient history rewriting.

Human pressure determines what is actually interesting.

Grounding determines what can be stolen back into reality.
