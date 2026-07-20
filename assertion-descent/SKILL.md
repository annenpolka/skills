---
name: assertion-descent
description: |
  Push completion conditions for coding agents down to machine-verifiable
  assertions. Transforms vague intent ("make it clean", "handle errors properly")
  into conditions verifiable by tests, linters, type checkers, and command output.
  Residue that cannot be pushed down is treated as a signal: "don't delegate this."

  Use when:
  (1) User says "write a task", "write instructions", "I want to hand this to an agent"
  (2) User is about to delegate a coding task to an AI agent (Claude Code, Codex, etc.)
  (3) User says "assertion descent", "make it verifiable", "descent"
  (4) User has a vague task description and wants to make it verifiable
  (5) User says "is this ready to hand off?" — task instruction review before delegation
  (6) User says "descent してそのまま実装", "descent then implement" — freeze, then implement

  Do NOT use for:
  - Implementing before the freeze (see Execution Handoff)
  - Tasks that already have explicit test cases
  - Exploratory prototyping ("just show me something that works" doesn't need descent)
---

# Assertion Descent

## What This Skill Does

Push completion conditions in coding agent instructions down to
machine-verifiable altitude.

Completion conditions have altitude.

```
Altitude 4: Intent ("make it good")                        — unverifiable
Altitude 3: Quality attribute ("readable", "robust")       — human-only
Altitude 2: Structural constraint ("functions < 30 lines") — static analysis
Altitude 1: Behavioral assertion ("this input → this output") — tests
Altitude 0: Type constraint ("takes int, returns string")  — compiler
```

Descent is the operation of converting conditions at altitude 4–3
into conditions at altitude 2–0.

## Why Descent Is Necessary — Option Inversion

Humans prefer vague completion conditions. Vagueness has value.
Say "make the code readable" and you can look at the result and say
"hmm, not quite." Post-hoc veto power.

Vagueness in a spec is an option contract. When the executor is human,
this option has positive expected value — humans ask clarifying questions,
negotiate, share tacit knowledge.

When the executor is an agent, expected value inverts.
Agents don't ask. They infer and run.
The cost of vagueness (rework, wrong deliverables) is entirely yours.
The upside of the option (flexible judgment) is something agents can't exercise.

**The moment the executor changes from human to agent,
spec vagueness flips from asset to liability.
But human habit doesn't register the flip.**

This skill forces exercise of the inverted option.

## Four Descent Operations

Each descent operation produces conditions with two faces:
a **success oracle** (what proves it worked) and
a **failure oracle** (what proves it didn't).
Both faces are required. A condition with only a success oracle
lets agents optimize for "making the test green" while the actual
problem persists.

### Operation 1: Behavioral Descent

Convert "works correctly" into "what input produces what output."
The most fundamental descent. Altitude 4 → 1.

**How:**
Find verbs in the intent. Make input and output concrete for each verb.
For each success oracle, state the corresponding failure oracle.

**Example:**
```
Intent: "Implement authentication"

Descent question: "What is true when authentication is 'implemented'?"

Descent result:
- POST /login with valid credentials returns 200
  Failure: returns 401/500 or no endpoint exists
- Invalid credentials returns 401
  Failure: returns 200 or leaks user info in error body
- Expired token returns 403
  Failure: returns 200 or silently creates new session
- Passwords are bcrypt-hashed in the database
  Failure: plaintext or weak hash found in users table

Verification: HTTP tests + DB query assertions
```

**Principles:**
- Always include error cases. They descend more easily than happy paths
- Ask "what input produces what output", not "what should happen"
- Vague verbs ("handle", "manage", "process") are altitude-4 markers

### Operation 2: Negation Descent

When positive descent stalls, descend via negation.
"Appropriate" is hard to define. "Inappropriate" is easy to enumerate.
Altitude 3 → 1–2.

**How:**
Invert the quality attribute. Build a list of "if this is present, not done."

**Example:**
```
Intent: "Handle errors appropriately"

Descent question: "What would count as 'inappropriate'?"

Descent result:
- Uncaught exception crashes the process
- Stack trace shown to user
- HTTP 200 returned on error
- Error log lacks context (request ID, etc.)

Verification: error-path tests + log output assertions + response code checks
```

**Principles:**
- Negation conditions are grep-friendly and test-friendly
- Structural negations work too: "no TODO comments remain", "no unused imports"
- Don't aim for completeness. 3–5 critical negations suffice

### Operation 3: Metric Descent

Convert quantifiable quality attributes into measurements with thresholds.
Altitude 3 → 1.

**How:**
Choose a metric for the quality attribute. Set a threshold.
Identify the measurement command.

**Example:**
```
Intent: "Improve performance"

Descent question: "What metric below what number means 'improved'?"

Descent result:
- GET /api/users p95 response time under <project SLO threshold>
  Failure: p95 above that threshold across 3 runs
  Threshold and measurement command: discover from the project's existing
  SLO / benchmark harness — mark as residue if no project value exists
- Peak memory usage under <project memory budget>
  Failure: peak exceeds budget under benchmark load
  Threshold: same discover-or-residue rule

Verification: the project's existing benchmark harness (k6/wrk/hyperfine/etc.
are illustrative families; use whatever the project already runs)
```

**Principles:**
- Choosing the metric *shape* (p95 vs p99, latency vs memory) is a
  domain-generic judgment call — make it
- Choosing the threshold *value* is project-local — discover or surface
  as residue, do not invent a number to satisfy the template
- Specify the measurement command — but the command itself is project-local
  too. A metric "with a command" means "with a *discovered* command."
- A metric category where neither threshold nor harness exists in the
  project is residue, not an excuse to fabricate

### Operation 4: Structural Descent

Convert structural qualities into static analysis rules.
Altitude 3 → 2. Highest information loss of the four operations.

**How:**
Decompose the quality attribute into structural properties.
Make each a verifiable rule.

**Example:**
```
Intent: "Make the code clean"

Descent question: "Which parts of 'clean' can a machine measure?"

Descent result:
- Functions under 30 lines
- Nesting under 3 levels
- Zero lint warnings
- No unused imports

Verification: lint rules + static analysis
```

**Principles:**
- "Clean" will never fully reduce to structural constraints. That's fine
- What doesn't reduce becomes Descent Residue
- If the project already has lint config, conforming to it is lowest-cost

## Landing Surfaces

When descending, you need to know where conditions can land.
Prefer higher surfaces — they are harder to fake.

```
1. Public behavior (strongest)
   HTTP status, API response body, CLI output, UI text, return value

2. Persistent state
   Database rows, generated files, config, event records, audit logs

3. Runtime signals
   Exit code, logs, metrics, traces, error messages

4. Developer-facing checks
   Unit tests, integration tests, E2E, typecheck, lint, build

5. Structural properties (weakest)
   Dependency direction, API compatibility, import boundaries, schema shape
```

For refactoring, structural properties may be primary.
For feature work or bug fixes, structural properties should not be the only surface.

## Anti-cheat Constraints

Descended conditions can be satisfied in bad faith.
An agent can make a test green by weakening the test.
Anti-cheat constraints prevent this.

Always include constraints that prevent false success.
Select from the following and add task-specific ones as needed.

```
Standard:
- Do not weaken or delete existing tests
- Do not change expected test values merely to match the implementation
- Do not suppress type errors with `any`, `@ts-ignore`, or equivalent
  unless explicitly justified
- Do not swallow errors silently
- Do not add arbitrary sleeps or retries to hide race conditions
- Do not hardcode only the tested case
- Do not make unrelated changes outside the task scope

Auth / permission tasks — add:
- Authorization must be enforced server-side
- Tests must include both authorized and unauthorized cases

Data mutation / deletion tasks — add:
- Verify protected data is unchanged after denied operations
- Soft-delete vs hard-delete semantics must match project convention

Migration tasks — add:
- Backward compatibility or rollback path must be documented
- Schema changes must not silently drop data

Refactor / cleanup tasks — add:
- No algorithm migrations smuggled into the refactor (hash function,
  token signing algorithm, encryption, KDF parameters)
- No storage backend swaps or schema changes under the cleanup label
- No silent change to security-relevant defaults (cookie flags,
  token lifetime, password policy, rate-limit thresholds)
- "Cleanup" is structural; any behavior delta is out of scope and
  belongs in a separate, named task
```

**Bucket composition.** When a task hits multiple buckets (e.g., an auth
refactor that touches a session store fits *both* Auth/permission and
Data mutation), take the **union** of all applicable bucket constraints.
Buckets are additive, not exclusive; do not pick the "primary" bucket
and skip the others.

## Descent Residue

What remains after all four operations have been applied.
Conditions that won't descend further.

Residue is not a defect. It is a signal.
**"Don't delegate this part to the agent."**

Residue comes from the judge, not the code:
- Another developer would accept it (a matter of taste)
- You'd accept it today but maybe not tomorrow (irreproducible judgment)
- You can't judge without knowing this project's context (tacit knowledge)

When residue is large, don't fully delegate to the agent.
Hand off only the machine-verifiable portion.
Reserve the residue for human review. Divide and conquer.

## Session Flow

### Two Roles

This skill is operated by two distinct roles:

- **Author** — runs the skill and writes the agent instruction (often an LLM
  invoking this skill, or a human doing the same)
- **Executor** — the coding agent that will receive the written instruction
  and act on the codebase

Any "discover from project config" clause is always the **executor's**
responsibility, regardless of whether the author has repo access. If the
author has repo access and wants to pre-populate discovered values inline,
they may, but the default is to defer discovery to the executor. The author
never invents project-local values to fill gaps the executor will face.

### Task Class

Tasks divide into classes the skill treats differently:

- **Feature / new behavior** — adds observable behavior. Regression Matrix
  rows describe the new behavior's specification
- **Bug fix** — changes specific observable behavior. Regression Matrix
  pairs broken case with corrected case
- **Refactor** — changes structure with **no intended observable change**.
  Regression Matrix's job is to snapshot pre-refactor behavior for
  preservation, not to specify new behavior
- **Cleanup / hygiene** — a sub-class of refactor; same rules apply

The Output Format adapts per task class — see "Output Format" below.

### Input

A task description the human is about to hand to an agent.
One line or one page — either is fine.

### Granularity

Not all tasks need the same depth of descent. Choose by the predicate:

**Deep descent** when ANY of the following is true:
- The task touches a **high-risk domain** — auth, permissions, data deletion,
  migrations, payment, production incident fixes, anything where regression
  is irreversible or visible to users at scale
- The task performs an **irreversible operation** — schema migration, mass
  delete, public API change, force-push, key rotation
- The user explicitly flags it as high-blast (`"this is critical"`,
  `"do not break X"`)

Refactor / cleanup tasks **on a high-risk domain** are Deep — domain
trumps operation. A "cleanup" of auth still gets Deep treatment because
the blast radius is the auth surface, not the task verb.

Deep produces: standard descent plus regression matrix
(actor × action × expected result), safety invariants
(conditions that must never be violated), before/after evidence requirement.

**Light descent** when ALL of the following hold:
- Single file or near-single-file scope
- No behavioral surface change beyond the immediate fix
- Failure is locally reversible (rename a variable, add a log line, fix
  a typo, adjust a comment)

Light produces: 2–3 Done-When conditions + verification command +
standard anti-cheat. No residue analysis needed.

**Standard descent** — everything else. The default. Full four-operation
treatment.

When in doubt between two levels, go deeper, not shallower.

### Flow

```
1. Receive task description
2. Judge granularity: light / standard / deep
3. Extract completion conditions. Judge each condition's current altitude
4. For conditions at altitude 3–4, select descent operations:
   - Has a verb → Behavioral Descent
   - Has a quality adjective → Negation Descent or Structural Descent
   - Is quantifiable → Metric Descent
   - Combine operations when multiple apply
5. For each descended condition, state both success and failure oracle
6. Select anti-cheat constraints relevant to the task
7. Apply the Descent Test (see below). Interactive mode: ask the human.
   Non-interactive mode (one-shot generation, no live human): self-simulate
   by mentally inhabiting a reviewer who knows this codebase and project
   norms. If the simulated reviewer would still reject, the condition is
   undescended — apply more operations or move it to residue. Do not skip
   this step just because no human is present
8. Surface descent residue explicitly
9. Generate final output
10. Optional: proceed to implementation via Execution Handoff (see below)
```

### The Descent Test

The question that determines whether descent is sufficient:

**"If an agent delivered something meeting these conditions,
would you still reject it?"**

- "I'd reject it" → undescended conditions remain. Ask what you'd look at
  to reject, and run that through a descent operation
- "I'd accept it" → this condition is fully descended
- "It depends" → make "depends" concrete and either fold it into conditions
  or treat it as descent residue

**Non-interactive use.** When applying the skill in a one-shot generation
with no live human reviewer, run the Descent Test against yourself:
imagine the most demanding reviewer you can plausibly model — someone
who knows the codebase, the team's taste, and the failure modes you've
seen before — and ask the same question. Record the simulated answer
in the deliverable (e.g., a brief "Descent Test" note that names the
"would still reject" axes and where they land: condition, residue, or
"out of scope, human-only"). The non-interactive form is a substitute
for the conversation, not a license to skip the check.

## Execution Handoff (optional)

Descent may be followed by implementation in the same session,
but never interleaved with it. The handoff has three rules:

1. **Freeze.** The descent deliverable (conditions, anti-cheat constraints,
   evidence contract) is finalized and shown BEFORE any code is written.
   Interactive mode: the user approves it. Non-interactive mode: the
   recorded Descent Test note serves as the freeze point.

2. **No self-renegotiation.** During implementation, the frozen conditions
   are a contract. If a condition turns out to be unsatisfiable or wrong,
   STOP implementing, return to descent, revise the condition visibly,
   and re-freeze. Silently weakening a condition mid-implementation is
   the self-grading failure this skill exists to prevent. This rule is
   mandatory, not advisory — it is what replaces the author/executor
   separation when both roles live in one session.

3. **Residue firewall.** Residue is out of scope for the execution phase.
   The completion report must re-list the residue verbatim, marked
   "pending human review" — implementation does not consume it.

Execution form by granularity:

- **Light** — same-session continuation; the freeze is a one-line summary
  of the Done-When conditions before the first edit
- **Standard** — same-session continuation after an explicit freeze of
  the full deliverable
- **Deep** — prefer subagent delegation: pass ONLY the copy-ready
  instruction to the executor agent. The main session stays author,
  never touches the code, and audits the returned evidence against the
  frozen conditions. This doubles as a self-containment test of the
  instruction: an executor with no access to the descent discussion
  must be able to act on it

When execution stays in-session, the author has repo access by
definition: project-local discovery ("discover from project config")
becomes the first step of the execution phase, with sources cited
inline per the existing author/executor rules.

## Output Format

**Template conventions.** Bullets shown in the templates below are
**illustrative slots, not cardinality limits**. Fill each slot with as
many oracles as the task's distinct observable checks demand. A single
bullet in the template does not mean "exactly one"; it means "at least
one of this kind."

### Standard Output

```markdown
## Granularity: standard
## Task Class: <feature | bug fix | refactor | cleanup>

## Completion Conditions

### Behavioral (test-verifiable)
- [ ] Success: [input → expected output]
      Failure: [what observable evidence would prove it wrong]
- [ ] Success: [input → expected output]
      Failure: [what observable evidence would prove it wrong]

### Structural (static-analysis-verifiable)
- [ ] [lint / type / structural rule]

### Metric (measurement-verifiable)
- [ ] [metric + threshold + measurement command, OR: discover threshold from <project SLO / existing benchmark> — mark as residue if no project value exists; do not invent a number]

### Negation (absence-verifiable)
- [ ] [must not be present: TODO comments, unused imports, etc.]

## Verification Commands
- `[narrowest relevant test command, OR: discover from <package.json scripts | Makefile | project README> — do not guess]`
- `[typecheck / lint / build command, OR: same fallback]`

## Anti-cheat Constraints
- [selected constraints relevant to this task]

## Evidence Required
The agent must report upon completion:
- Summary of changes made
- Files changed
- Tests added or modified
- Verification commands run and their output
- Any verification that failed or could not be run
- Remaining risks or open assumptions

## Descent Residue (requires human review)
- [conditions that could not be descended, with reasons]

## Agent Instructions (copy-ready)
[Task description with descended conditions, anti-cheat constraints,
and evidence requirements integrated into a coherent instruction.
Not a list of conditions — context and conditions unified.]
```

### Light Output

For small, low-risk tasks. Omit residue analysis and landing surface detail.

```markdown
## Granularity: light
## Task Class: <bug fix | cleanup | other>

## Done When
- [observable condition]
- [observable condition]

## Verify
- `[command, OR: discover from <project config> — do not guess]`

## Constraints
- Do not weaken tests
- Do not make unrelated changes

## Evidence
- Changed files and verification result
```

### Deep Output

For high-risk tasks. Use standard output but replace the granularity tag with
`## Granularity: deep` (keep the `## Task Class:` slot, set to the actual
class), then add these sections:

```markdown
## Regression Matrix

| Actor / Input | Action | Expected Result | Verification |
|---|---|---|---|

## Safety Invariants
- [condition that must never be violated, regardless of task outcome]

## Before / After Evidence
- Before: [current observable state]
- After: [expected observable state post-implementation]
```

**Refactor variant.** When the task class is refactor (or cleanup), the
Regression Matrix's role flips: it captures **pre-refactor behavior that
must be preserved**, not new behavior to be added. Use this column shape
instead:

```markdown
## Regression Matrix (refactor)

| Actor / Input | Action | Pre-refactor result | Post-refactor result | Diff allowed? |
|---|---|---|---|---|
```

`Diff allowed?` is normally `No`; when `Yes`, the row must include the
explicit reason and the human reviewer who signed off.

The Standard `## Evidence Required` block lists the report contract;
Deep's `## Before / After Evidence` specifies the snapshot artifacts
within that contract. Keep both — they do not duplicate, they nest.

## Deny

- **Interleaving descent with execution.** Implementation may follow
  descent (see Execution Handoff), but only after the deliverable is
  frozen. Writing code while conditions are still descending defeats
  the skill's purpose
- **Forcing descent.** If the human says "this one doesn't need to descend,"
  respect it. Choosing not to descend is a delegation decision:
  "I will review this myself"
- **Illusion of completeness.** Never claim the descended conditions capture
  everything. Descent residue always exists
- **Over-application to exploratory tasks.** Don't attach 20 verification
  conditions to "just show me something that works."
  Task nature determines descent granularity
- **Eliminating residue.** Don't force residue into machine-verifiable form.
  Residue is a signal. Preserve it as such
- **Inventing project-local values.** Do not fabricate any value whose
  correct setting depends on this specific project's configuration,
  operations, legal context, or business policy. The defining test:
  *"Could this value be wrong in a way that only this project's reality
  could tell me?"* If yes, it is project-local. The list below is
  illustrative, not exhaustive — extend the test to unfamiliar instance
  types you encounter.
  Examples (illustrative): test/lint/build/typecheck commands; metric
  thresholds (latency budgets, coverage floors); role/permission names;
  schema columns; path conventions; API conventions; retention windows;
  deletion caps; audit log shapes; compliance parameters; SLOs.
  Uniform fallback: state that the value must be discovered from project
  config, or — if no value can be discovered — mark it as residue rather
  than guess. **Domain-generic** facts (HTTP status semantics, JWT
  algorithm names, cookie attribute names like `HttpOnly`/`Secure`, SQL
  parameterization) are **not** project-local and may be used directly.
  **Author / executor split:** the author surfaces project-local gaps;
  the executor performs the discovery. If the author has repo access and
  pre-populates a value, they cite the source inline.
  **Universal tooling exemption.** Universal POSIX/Git tooling (`grep`,
  `git diff`, `find`, etc.) is excluded from this rule and may be used
  freely.
  **Candidate hints** are allowed, only in this canonical phrasing:
  `<candidate value> — verify against <source>` (e.g., `commonly \`npm
  test\` — verify against package.json scripts`). The hint must be
  explicitly framed as a hint, never asserted as the answer.
  **Missing tooling.** If a required descent surface (linter, formatter,
  typecheck, benchmark harness) is absent from the project, that absence
  is itself residue. Introducing or configuring such tooling is a
  separate task and is not part of this descent deliverable
