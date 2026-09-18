# Formal escalation: questions into explicit obligations

Use formal machinery only for a concrete uncertainty that it can reduce. Formal
claims are about the encoded model and assumptions; source alignment remains a
separate review obligation. The methods below are recipes, not bundled integrations.

## Choose the smallest adequate backend

| Problem | First useful method | What to record |
|---|---|---|
| A few threshold or case combinations | Decision table or finite enumeration | Domain and whether every case was enumerated |
| Two small deterministic event policies | Product-state breadth-first search | Common input alphabet and observable projection |
| Numeric, Boolean, or finite structural constraints | SMT/SAT | Formula, assumptions, satisfiability, solver result |
| Stateful/concurrent behavior | Existing Quint/TLA+ toolchain | Atomicity, environment, state/trace bounds, fairness |
| Ownership/permission/topology relationships | Alloy or an existing relational model | Scope, predicates, satisfiable instances, assertions |
| Model versus actual code | Model-based testing / trace validation | Driver, projection, event ordering, accepted policy |

Do not install a new stack just to check a small table. Prefer the project's installed
and pinned toolchain. Discover actual versions and help; command availability is not
implied by this reference. Approve downloads and additional execution separately.

## A. Finite distinguishing trace

For *total deterministic* models A and B sharing a finite event alphabet, let O be
the agreed observation function. Explore pairs `(a,b)` from corresponding initial
states. A pair where `O(a) != O(b)` gives a distinguishing input sequence.

Breadth-first exploration returns a shortest sequence when earlier layers were
fully explored. If the finite reachable product is exhausted with no difference,
the two declared models have the same observations for every finite input sequence.
This conclusion does not identify the intended policy or validate their prose mapping.

The optional `scripts/compare_fsm.py` implements this narrow case using JSON tables
and the Python standard library. It refuses incomplete or nondeterministic tables
instead of inventing transitions. It neither parses prose nor verifies TLA+/Quint.

```bash
python3 <skill-dir>/scripts/compare_fsm.py \
  <skill-dir>/examples/reset-on-success.json \
  <skill-dir>/examples/preserve-on-success.json
```

The contract includes the initial observation. A difference there has an empty
input witness. This helper does not model timing, fairness, stuttering equivalence,
partial input availability, concurrency, or nondeterministic trace inclusion. For
such cases, write down the required equivalence/refinement relation and use an
appropriate model checker; do not compare two arbitrarily selected runs.

A policy choice is a fixed parameter of a candidate implementation. Choosing "reset"
or "preserve" afresh after every event would describe a different, usually broader
system. Treat unknown policy parameters as fixed-at-initialization alternatives
unless variability is itself part of the source contract.

## B. SMT for decidability within a partial model

Let M encode the reviewed source constraints plus separately tagged assumptions.
Let P be a precise proposed behavior or property.

1. Check whether M is satisfiable. If not, investigate conflicting constraints or
   a modeling error; do not claim every desired property is meaningfully satisfied.
2. Check `M AND P` and `M AND NOT P`.
3. Interpret both results, keeping timeout/unknown separate:

| M∧P | M∧¬P | Meaning relative to M |
|---|---|---|
| sat | sat | M admits both outcomes; obtain two assignments |
| sat | unsat | M entails P, within its encoding and assumptions |
| unsat | sat | M entails ¬P, within its encoding and assumptions |
| unsat | unsat | M is inconsistent, or the query construction is wrong |
| unknown/error | any | No decisive result for the unresolved side |

A sat/sat result is **model underdetermination**, not automatically a requirements
bug. Determine whether both assignments are reachable, allowed by the source, and
observably different in a decision the contract must resolve.

Use named assertions to trace an unsatisfiable subset to source rules. A solver's
unsat core is not necessarily minimal or minimum-cardinality. Do not call it the
smallest contradiction unless a separate minimization establishes that claim.

Keep units, integer/real choice, overflow semantics, domains, and environmental
constraints explicit. An inconsistent numeric encoding can otherwise manufacture a
very convincing but irrelevant result. See the official Z3 references in sources.md.

## C. Quint/TLA+ for a stateful slice

Before execution, prepare a model card:

```yaml
source_revision: exact revision or content hash
source_mapping: requirement IDs to actions/properties
state: relevant variables and finite domains/abstractions
inputs: valid environment actions and restrictions
observations: externally relevant state/output projection
atomicity: what one transition represents
open_decisions: fixed parameters or explicit candidate variants
assumptions: named, sourced or explicitly provisional
properties: each with a source and safety/liveness/reachability kind
limits: bounds, seeds, resources, fairness assumptions, omitted behavior
```

Read installed help first. The current official CLI documents `typecheck`, simulation
via `run`, and model checking via `verify`. For an existing `slice.qnt` defining
`inv`, a bounded recipe is:

```bash
quint --version
quint typecheck slice.qnt
quint verify --help
quint verify slice.qnt --backend apalache --invariant inv --max-steps 12
```

The bound 12 is illustrative, not a completeness threshold. `verify` can obtain a
backend automatically; confirm approved local configuration before allowing it to
run. Typecheck success, random simulation, bounded checking, completed finite TLC
exploration, and inductive obligations support different conclusions. Do not hide
those differences behind a single green "verified" label. [S4, S5, S6]

For a comparison, couple the *same* environment inputs in a product model and
compare declared observations. If one candidate disallows an input, decide whether
that is an observable rejection, an environment assumption, or outside the common
domain. Do not silently drop inconvenient traces.

### Checks before trusting the result

- **Non-vacuity:** At least one admissible initial state exists; required scenarios
  and property antecedents are reachable under the declared environment.
- **Frame conditions:** State not intended to change is modeled deliberately. A
  missing decision must not become an implicit unchanged/default value.
- **Deadlocks:** Distinguish terminal states, rejected inputs, disabled actions,
  missing transitions, and true unintended deadlock. Stuttering does not establish
  useful progress. An unhandled event may exist even when another action is enabled.
- **Nondeterminism:** Allowed choice is not ambiguity by itself. Preserve it when
  the contract deliberately permits multiple implementations or schedules.
- **Liveness:** State the fairness/environment assumptions and the actual temporal
  check. Reaching a success once, or finding no short failure, is not a liveness proof.
- **Abstraction:** Tag abstraction-added behavior and prove or review the relevant
  relationship before transferring a counterexample or guarantee to the real system.
- **Purpose:** A negated reachability query may deliberately generate an invariant
  violation. Report it as a sought witness, not automatically as a product bug.

## D. Alloy for relational constraints

First use a satisfiable instance to check that the chosen scope and facts permit a
meaningful system. Then check the relevant assertions under a declared scope.
Record integer bounds, exact versus upper cardinality limits, and environmental
facts. A counterexample is a scoped instance; absence of one does not establish
validity for arbitrary larger scopes. [S8]

When comparing interpretations, keep the same identities and observation relation
where appropriate. Different anonymous atom names alone do not establish a
behavioral difference.

## E. Return evidence to the prose

For every result, separate:

1. **Mechanism result:** What command/search actually found, in which model.
2. **Alignment result:** Which original clauses support the modeled behavior.
3. **Decision consequence:** What remains undecided or which adopted rule is violated.

A model mismatch can be caused by a bad projection, logger, test driver, abstraction,
or the implementation. Triage before blaming code. Model-based tests should use
adopted decisions, not an arbitrary choice made merely to finish the model. The
Quint MBT documentation distinguishes behavioral confidence from whole-code proof;
its older Rust walkthrough is marked deprecated in favor of Quint Connect. [S7]

## Counterexample-guided review loop

`candidate → smallest witness → source alignment review → decision or model repair`

Allow at most two refinement attempts per finding in the initial pass unless a
larger budget is authorized. Preserve unresolved alternatives and limitations when
stopping. Do not weaken an accepted invariant to make a check pass. A newly adopted
policy is a new decision, not a retroactive claim that the source was always clear.
