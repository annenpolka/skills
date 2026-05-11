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

  Do NOT use for:
  - Executing the task itself (this skill writes instructions, not code)
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
- GET /api/users p95 response time under 200ms
  Failure: p95 above 200ms across 3 runs
- Peak memory usage under 500MB
  Failure: peak exceeds 500MB under benchmark load

Verification: benchmark script (k6, wrk, hyperfine, etc.)
```

**Principles:**
- Choosing the metric is itself a judgment call (p95 vs p99, 200ms vs 500ms)
- Choosing the metric and threshold is the moment you exercise the option
- Specify the measurement command. A metric without a command is incomplete

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
```

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

### Input

A task description the human is about to hand to an agent.
One line or one page — either is fine.

### Granularity

Not all tasks need the same depth of descent.

**Light descent** — small, low-risk tasks (rename a variable, add a log line,
fix a typo). Produce 2–3 Done-When conditions + verification command +
standard anti-cheat. No residue analysis needed.

**Standard descent** — most tasks. Full four-operation treatment.
The default.

**Deep descent** — high-risk tasks (auth, permissions, data deletion,
migrations, payment, production incident fixes). Standard descent plus:
regression matrix (actor × action × expected result), safety invariants
(conditions that must never be violated), before/after evidence requirement.

Choose granularity based on the blast radius of getting it wrong.

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
7. Present descent results. Confirm with the human:
   - "If an agent delivered something meeting these conditions,
     would you still reject it?"
   - Would reject → descent incomplete. Apply additional operations
   - Would not reject → condition fully descended
8. Surface descent residue explicitly
9. Generate final output
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

## Output Format

### Standard Output

```markdown
## Completion Conditions

### Behavioral (test-verifiable)
- [ ] [input → expected output | failure: what would prove it wrong]
- [ ] [input → expected output | failure: what would prove it wrong]

### Structural (static-analysis-verifiable)
- [ ] [lint / type / structural rule]

### Metric (measurement-verifiable)
- [ ] [metric + threshold + measurement command]

### Negation (absence-verifiable)
- [ ] [must not be present: TODO comments, unused imports, etc.]

## Verification Commands
- `[narrowest relevant test command]`
- `[typecheck / lint / build command]`

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
## Done When
- [observable condition]
- [observable condition]

## Verify
- `[command]`

## Constraints
- Do not weaken tests
- Do not make unrelated changes

## Evidence
- Changed files and verification result
```

### Deep Output

For high-risk tasks. Add these sections to standard output:

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

## Deny

- **Executing the task.** This skill writes instructions. It does not write code
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
- **Inventing verification commands.** If the project's test runner or lint
  command is unknown, state that it must be discovered from project config.
  Do not guess a passing result
