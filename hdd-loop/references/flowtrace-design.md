# flowtrace

## Design and Implementation Specification

**Status:** Exploratory design, implementation-oriented<br>
**Primary target:** Node.js / TypeScript development and test environments<br>
**Primary consumer:** Coding agents / LLM tool users<br>
**Interface:** One-shot command-line tool with structured JSON output

---

## 1. Overview

`flowtrace` is a command-line runtime provenance and active differential debugging tool designed primarily for coding agents.

Its core question is not:

> What is the current call stack?

but:

> Why did this runtime state become what it is, and where did a failing execution first diverge from a successful one in a way that can reach the failure?

A coding agent invokes `flowtrace` once around a reproduction command. `flowtrace` may execute that command many times internally, progressively instrument the program, capture runtime state transitions and asynchronous lineage, build execution evidence graphs, compare passing and failing executions, and optionally perform controlled intervention experiments. It returns a compact machine-readable diagnosis rather than a large trace or a human-oriented debugger UI.

The intended interaction is:

```bash
flowtrace diagnose \
  --budget-runs 200 \
  -- npm test -- tenant.spec.ts
```

The output is JSON suitable for immediate consumption by an LLM:

```json
{
  "outcome": "candidate_cause_validated",
  "failure_sink": {
    "kind": "assertion",
    "source": "test/tenant.spec.ts:91"
  },
  "divergence": {
    "event": "timer_fire",
    "source": "src/tenant-refresh.ts:42",
    "origin": "observed"
  },
  "downstream": [
    {
      "event": "write",
      "target": "currentTenant",
      "source": "src/tenant.ts:84",
      "before": null,
      "after": "tenant-b",
      "origin": "observed"
    }
  ],
  "alignment": {
    "origin": "inferred",
    "confidence": 0.94
  },
  "intervention": {
    "suppress_divergent_timer_in_fail_run": "PASS",
    "inject_timer_into_pass_run": "FAIL"
  },
  "recommended_source_reads": [
    "src/tenant-refresh.ts:30-50",
    "src/tenant.ts:75-90"
  ],
  "limitations": []
}
```

The user does not need to open a trace viewer, place breakpoints, manually correlate logs, or run separate capture and diff commands. Those operations are internal implementation details.

---

## 2. Motivation

Modern coding agents are strong at reading source code and forming hypotheses, but their access to runtime evidence is usually crude. A common debugging loop is:

1. inspect the failing test or error;
2. search the source tree;
3. read several plausible modules;
4. form a hypothesis;
5. add logs or run a debugger/test command;
6. inspect the new output;
7. revise the hypothesis;
8. repeat.

This is often source-first debugging: the agent guesses where to look, then asks the runtime whether the guess was useful.

`flowtrace` aims to make evidence-first debugging practical. It gives the agent a queryable, compressed representation of what actually happened during execution before the agent commits to reading large portions of the codebase.

The strongest initial use cases are bugs where the final failure is far removed from the state transition that caused it:

- flaky tests caused by leaked timers, module state, singletons, or asynchronous work;
- event-driven application state that changes through several callbacks;
- retry, timeout, cancellation, and compensation interactions;
- stale cache or invalidation bugs;
- queue/job state transitions;
- optimistic updates and later rollback/compensation;
- shared mutable application state;
- regressions where the assertion is unchanged but runtime behavior changed earlier;
- bugs whose interesting question is "who changed this value, under what logical execution context, and why was that path reached?"

`flowtrace` is deliberately not positioned as a replacement for a compiler, profiler, distributed tracing system, or ordinary breakpoint debugger.

---

## 3. Product definition

A concise definition:

> **flowtrace is a one-shot CLI for coding agents that repeatedly executes a reproduction, records runtime provenance, constructs failure-directed dynamic slices, compares passing and failing execution DAGs, and returns the smallest useful evidence graph explaining where behavior diverged.**

A stronger long-term definition:

> **flowtrace is an active differential dynamic debugger: it does not only observe execution; when safe and useful, it performs controlled counterfactual interventions to test whether candidate divergences contribute to the failure.**

The distinction matters. Passive tracing can show that two things happened together. Active intervention can sometimes show that suppressing or injecting one behavior changes the outcome.

---

## 4. Goals

### 4.1 Primary goals

`flowtrace` should:

- be usable by an LLM through one CLI invocation;
- require no interactive debugger session;
- operate primarily in local development and test environments;
- capture runtime state changes with source and asynchronous provenance;
- model execution as a partial-order graph rather than a flat chronological log;
- automatically identify failure sinks such as assertions and uncaught exceptions;
- trace backward from the failure rather than compare unrelated runtime noise;
- obtain both passing and failing executions when a flaky reproduction permits it;
- align logically corresponding events across executions even when runtime IDs differ;
- identify the earliest meaningful divergence capable of influencing the failure;
- separate observed facts from inferred relationships and user/framework declarations;
- progressively increase instrumentation depth instead of tracing everything at maximum cost;
- use repeated executions as part of the diagnosis algorithm;
- perform controlled intervention experiments when possible;
- return compact JSON evidence suitable for an LLM context window;
- explicitly report uncertainty, unsupported observations, and instrumentation-sensitive failures.

### 4.2 Secondary goals

The architecture should eventually support:

- deterministic or partial replay of nondeterministic inputs;
- worker threads and Node child processes;
- framework-aware semantic adapters;
- regression comparison across Git revisions;
- durable trace artifacts for offline re-analysis;
- agent-controlled focus hints without requiring them;
- additional languages through separate instrumentation backends.

---

## 5. Non-goals

`flowtrace` is not intended to:

- provide a general human-facing IDE or time-travel UI;
- replace CPU, allocation, or lock profilers;
- replace OpenTelemetry for production distributed tracing;
- prove arbitrary program causality;
- automatically infer complete business semantics from arbitrary code;
- assign stable semantic identity to arbitrary runtime objects with certainty;
- record every program value with zero overhead;
- eliminate observer effects from timing-sensitive concurrency bugs;
- make unsafe modifications to production systems;
- treat chronological adjacency as causal evidence;
- present inferred relationships as observed facts.

The tool must remain useful when some of these hard problems cannot be solved exactly.

---

## 6. Core design principles

### 6.1 Evidence before interpretation

`flowtrace` records what it can directly observe and exposes those observations to the agent. It should avoid claiming a high-level root cause that requires semantic understanding beyond its evidence.

Good output:

> In failing runs, timer T remains active, fires during test A, and is followed by a write of `currentTenant` from `null` to `tenant-b`. In passing runs, the corresponding timer is cancelled. Suppressing T in a failing reproduction caused the test to pass.

Bad output:

> The developer forgot to clean up the timer.

The latter may be a reasonable LLM conclusion, but it is not a runtime observation.

### 6.2 Observed, inferred, and declared are different data types

Every nontrivial graph relation should carry provenance.

- **observed** — directly produced by instrumentation, runtime hooks, test adapters, or external boundary observation;
- **inferred** — derived by `flowtrace`, such as cross-run event alignment or logical-entity matching;
- **declared** — supplied by a user, framework adapter, configuration, or schema;
- **intervention_validated** — a candidate relationship whose relevance was strengthened by a controlled experiment.

Example:

```json
{
  "relation": "same_logical_operation",
  "from": "pass:event:82",
  "to": "fail:event:104",
  "origin": "inferred",
  "confidence": 0.84,
  "evidence": [
    "same_source_site",
    "same_async_parent",
    "same_operation_kind"
  ]
}
```

### 6.3 Narrow deep observation beats broad sampling

For state provenance, dropping the mutation that caused the failure can invalidate the diagnosis. Therefore deep tracing should not randomly sample events within the selected slice.

Instead, `flowtrace` uses progressive instrumentation:

1. broad but cheap survey;
2. identify failure-relevant regions;
3. rerun with deep, complete instrumentation only in those regions.

### 6.4 Partial order, not total order

Asynchronous programs do not naturally form a single meaningful event sequence. Two events may be concurrent or causally unrelated.

The internal model is therefore a DAG of events and dependencies. Timestamps are metadata, not the primary semantic structure.

### 6.5 Re-execution is a feature

`flowtrace` is allowed to spend many executions to reduce uncertainty. The agent pays one tool call; `flowtrace` can internally run dozens or hundreds of experiments.

### 6.6 The failure directs the analysis

The tool should not ask "what differs anywhere?" It should ask:

> What differs in the portion of execution that can reach the failure sink?

This dramatically reduces noise and makes run comparison tractable.

---

## 7. User and agent interface

### 7.1 Primary command

```bash
flowtrace diagnose [flowtrace options] -- <reproduction command...>
```

Examples:

```bash
flowtrace diagnose --until-pair --budget-runs 100 -- npm test
```

```bash
flowtrace diagnose \
  --focus 'src/store.ts::currentTenant' \
  --budget-runs 200 \
  -- npm test -- tenant.spec.ts
```

```bash
flowtrace diagnose \
  --baseline git:HEAD~1 \
  -- npm test -- order.spec.ts
```

### 7.2 Recommended options

```text
--budget-runs <n>          Maximum number of internal executions.
--until-pair              Seek at least one passing and one failing run.
--until-failure           Stop reproduction phase after a failing run exists.
--focus <selector>        Optional source/state hint; repeatable.
--timeout <duration>      Per-run timeout.
--baseline <spec>         Compare against another revision/environment.
--keep-traces             Preserve raw trace artifacts.
--trace-dir <path>        Artifact destination.
--instrumentation <mode>  auto | survey | deep.
--intervene <mode>        auto | off | conservative | aggressive.
--redact <rule>           Additional value-redaction rules.
--config <path>           Framework/domain adapter configuration.
--pretty                  Human-readable output; JSON remains default.
```

### 7.3 Exit codes

Suggested stable exit contract:

```text
0  Diagnosis/evidence produced.
2  Requested failure could not be reproduced within budget.
3  Failure reproduced, but no relevant divergence/evidence found.
4  Instrumentation or runtime bootstrap failed.
5  Comparison inconclusive.
6  Intervention requested but unsafe or unsupported.
7  Input/configuration error.
```

The JSON body should always contain the richer explanation.

---

## 8. High-level architecture

```text
                         ┌──────────────────────┐
                         │   Coding Agent / LLM │
                         └──────────┬───────────┘
                                    │
                            one-shot CLI call
                                    │
                         ┌──────────▼───────────┐
                         │      Orchestrator    │
                         │ reproduce / rerun /  │
                         │ deepen / intervene   │
                         └──────────┬───────────┘
                                    │
                   ┌────────────────┼────────────────┐
                   │                │                │
          ┌────────▼──────┐ ┌──────▼────────┐ ┌────▼───────────┐
          │ Instrumenter  │ │ Runtime Hooks │ │ Test/Framework │
          │ AST transforms│ │ async/events  │ │ Adapters       │
          └────────┬──────┘ └──────┬────────┘ └────┬───────────┘
                   │                │                │
                   └────────────────┼────────────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Binary Event Recorder│
                         └──────────┬───────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Provenance DAG Builder│
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┼──────────────────┐
                  │                 │                  │
        ┌─────────▼──────┐ ┌────────▼─────────┐ ┌─────▼──────────┐
        │ Dynamic Slicer │ │ Cross-run Aligner│ │ Intervention   │
        │ failure-directed│ │ pass/fail DAGs  │ │ Engine         │
        └─────────┬──────┘ └────────┬─────────┘ └─────┬──────────┘
                  └─────────────────┼──────────────────┘
                                    │
                         ┌──────────▼───────────┐
                         │ Evidence Compressor  │
                         └──────────┬───────────┘
                                    │
                                  JSON
```

---

## 9. End-to-end diagnosis pipeline

### Phase 0 — Environment bootstrap

Before execution, `flowtrace` determines:

- Node version;
- module system and TypeScript transpilation path;
- test runner;
- worker/child-process behavior;
- source-map availability;
- framework adapters that can be enabled;
- whether the command already uses instrumentation that conflicts with rewriting;
- whether running the command repeatedly is safe in the current environment.

No diagnosis should proceed if the reproduction command appears to target a production environment or has obvious destructive side effects without explicit opt-in.

### Phase 1 — Uninstrumented baseline

Run the command with no or minimal instrumentation several times to estimate:

- normal duration;
- reproduction rate;
- pass/fail classification;
- timing variability;
- whether instrumentation itself later changes reproduction probability.

This gives a control population for observer-effect detection.

### Phase 2 — Survey instrumentation

Run lightweight instrumentation that captures broad structure without collecting every value:

- module/source identity;
- test lifecycle;
- function invocation sites where affordable;
- asynchronous scheduling and firing;
- exception creation/throw/catch;
- external I/O boundaries;
- selected mutation categories or compact fingerprints;
- nondeterministic inputs where interceptable.

The purpose is not to diagnose the bug. It is to map enough of the runtime to decide where deeper observation is worthwhile.

### Phase 3 — Failure sink discovery

Identify the concrete observable failure.

Possible sinks include:

- assertion failure;
- uncaught exception;
- unhandled rejection;
- non-zero process exit;
- test timeout;
- explicit failed test result;
- user-provided predicate;
- incorrect watched state supplied through `--focus`.

A framework adapter should extract richer sink structure where possible. An assertion such as:

```ts
expect(currentTenant).toBe(null)
```

should ideally yield a sink tied to the observed read of `currentTenant`, not merely an `AssertionError` string.

### Phase 4 — Candidate slice discovery

Starting from the failure sink, identify source modules, runtime values, async resources, operations, and external events that plausibly feed it.

The survey graph is used to choose deep instrumentation targets.

### Phase 5 — Deep re-execution

Rerun the reproduction with targeted instrumentation that records complete events inside the candidate slice:

- writes;
- relevant reads;
- function arguments and return values;
- branch/control predicates;
- async parentage;
- event registration, fire, cancellation;
- throw/catch propagation;
- external I/O values or hashes;
- object identity;
- test lifecycle transitions.

Deep mode records all selected events rather than sampling them.

### Phase 6 — Provenance DAG construction

Construct a graph for each run. Nodes are runtime events. Edges have explicit semantics.

Suggested edge kinds:

```text
async_parent
triggered_by
data_dependency
control_dependency
mutation_predecessor
operation_parent
external_input
same_runtime_entity
temporal_only
```

`temporal_only` edges must never silently become causal edges.

### Phase 7 — Dynamic backward slicing

Starting at the failure sink, traverse only edges that can carry data, control, or execution dependency back toward earlier events.

The resulting failure-directed slice is substantially smaller than the full runtime trace.

### Phase 8 — Passing/failing run selection

For flaky tests, choose representative passing and failing runs.

Selection should prefer runs that:

- have similar external inputs where possible;
- have comparable test lifecycle structure;
- minimize unrelated environmental variation;
- reproduce the same failure sink.

Multiple pairs can be analyzed to avoid overfitting to one anomalous run.

### Phase 9 — Cross-run DAG alignment

Correspond logically related nodes across runs. This is an inference problem, not direct observation.

Potential alignment evidence includes:

- same normalized source location;
- same operation kind;
- same enclosing test/route/job context;
- structurally similar async parent lineage;
- same declared domain identity;
- same external input anchor;
- same branch/function role;
- neighboring aligned nodes.

A runtime ID is not a cross-run identity.

### Phase 10 — Divergence frontier detection

Find the earliest region in the failure-directed DAG where passing and failing runs cease to be structurally and semantically equivalent.

This is not simply the earliest timestamp difference.

The output may contain multiple candidate frontier nodes if the partial order does not determine a single earliest event.

### Phase 11 — Candidate ranking

Rank divergences using evidence such as:

- reachability to failure sink;
- graph distance to sink;
- consistency across multiple pass/fail pairs;
- whether the divergence changes a watched value;
- whether downstream events converge or remain different;
- whether the divergence concerns nondeterministic input;
- alignment confidence;
- whether a framework adapter assigns semantic significance.

### Phase 12 — Intervention experiments

Where safe, transform a correlation candidate into stronger evidence by changing one aspect of execution and rerunning.

Examples:

- suppress a timer callback observed only in failing runs;
- replay the passing external response in a failing execution;
- force a branch outcome;
- substitute a recorded passing value at a particular mutation;
- prevent a candidate mutation;
- inject the failing event into a passing execution;
- cancel or fire a scheduled task under controlled conditions.

The intervention must itself be recorded in the evidence graph. It must never be represented as an ordinary observation.

### Phase 13 — Delta debugging over divergence sets

If many events differ, group interventions can reduce the candidate set.

Conceptually:

1. identify divergence set `D`;
2. replace or suppress half of `D`;
3. rerun;
4. choose the half that preserves or removes the failure;
5. recurse.

This seeks a smaller failure-relevant divergence set rather than exhaustively testing every event.

### Phase 14 — Evidence compression

The LLM does not receive the raw trace. It receives:

- failure sink;
- most relevant observed divergence(s);
- backward/forward path to the sink;
- important pass/fail contrast;
- intervention results;
- inference confidences;
- relevant source ranges;
- limitations and observer-effect warnings.

---

## 10. Runtime event model

### 10.1 Base event

```ts
interface BaseEvent {
  runId: number;
  eventId: number;
  kind: EventKind;
  timestampMono: bigint;
  workerId: number;
  sourceSite?: SourceSiteId;
  asyncContextId?: number;
  operationId?: number;
}
```

Runtime IDs only need to be stable within a single run.

### 10.2 Mutation event

```ts
interface MutationEvent extends BaseEvent {
  kind: 'mutation';
  target: RuntimeTarget;
  before: EncodedValue;
  after: EncodedValue;
  mutationKind:
    | 'binding_write'
    | 'property_write'
    | 'element_write'
    | 'compound_write'
    | 'update_expression'
    | 'destructuring_write'
    | 'setter_effect'
    | 'framework_state';
}
```

### 10.3 Read event

Deep-mode slices may require reads to establish value provenance.

```ts
interface ReadEvent extends BaseEvent {
  kind: 'read';
  target: RuntimeTarget;
  value: EncodedValue;
}
```

Recording every read globally is too expensive. Read instrumentation should be failure-directed.

### 10.4 Async event

```ts
interface AsyncEvent extends BaseEvent {
  kind:
    | 'async_create'
    | 'async_schedule'
    | 'async_start'
    | 'async_end'
    | 'async_cancel';
  resourceKind: string;
  parentAsyncContextId?: number;
}
```

### 10.5 Call event

```ts
interface CallEvent extends BaseEvent {
  kind: 'call_enter' | 'call_return';
  functionSite: SourceSiteId;
  receiverId?: RuntimeObjectId;
  args?: EncodedValue[];
  returnValue?: EncodedValue;
}
```

Arguments/return values can be omitted in survey mode.

### 10.6 Branch event

```ts
interface BranchEvent extends BaseEvent {
  kind: 'branch';
  branchSite: SourceSiteId;
  outcome: boolean | number | string;
  predicateInputs?: EventRef[];
}
```

### 10.7 External boundary event

```ts
interface ExternalEvent extends BaseEvent {
  kind: 'external_input' | 'external_output';
  system: 'http' | 'fs' | 'db' | 'child_process' | 'env' | 'other';
  operation: string;
  payload: EncodedValue;
}
```

An external service is an opaque boundary unless separately instrumented.

### 10.8 Nondeterminism event

```ts
interface NondeterminismEvent extends BaseEvent {
  kind: 'nondeterministic_input';
  source:
    | 'date_now'
    | 'performance_now'
    | 'math_random'
    | 'crypto_random'
    | 'timer_order'
    | 'environment'
    | 'io_result'
    | 'other';
  value: EncodedValue;
}
```

---

## 11. Identity model

One identifier cannot solve all identity problems. `flowtrace` should maintain several layers.

### 11.1 Runtime identity

Valid only within one run.

```text
run:17/object:829
run:17/closure:42
run:17/async:1008
```

For JS objects, a `WeakMap<object, RuntimeObjectId>` is sufficient for the basic mechanism.

### 11.2 Structural identity

An inferred cross-run correspondence candidate based on runtime structure:

```text
allocation site
+ operation context
+ async parent lineage
+ constructor/function identity
+ creation role/ordinal where useful
```

Structural identity is always `inferred`; it can fail when event ordering changes or many objects are allocated from the same site.

### 11.3 Domain identity

A framework adapter or configuration can declare strong semantic keys:

```text
Order(order.id)
User(user.id)
Job(job.id)
TestCase(test.fullName)
HTTP logical request(request correlation key)
```

Domain identity is `declared` unless directly exposed by an instrumented framework contract.

### 11.4 Identity mapping evidence

```json
{
  "pass": "run:3/object:82",
  "fail": "run:17/object:104",
  "logical_entity": "Order:ORD-1842",
  "origin": "declared",
  "confidence": 1.0
}
```

---

## 12. Provenance DAG semantics

A graph edge must say what evidence supports it.

```ts
type EdgeKind =
  | 'async_parent'
  | 'triggered_by'
  | 'data_dependency'
  | 'control_dependency'
  | 'mutation_chain'
  | 'operation_parent'
  | 'external_input'
  | 'same_runtime_entity'
  | 'same_logical_entity'
  | 'temporal_only';

interface EvidenceEdge {
  from: EventRef;
  to: EventRef;
  kind: EdgeKind;
  origin: 'observed' | 'inferred' | 'declared' | 'intervention_validated';
  confidence?: number;
  evidence?: string[];
}
```

An inferred edge should never be silently promoted to observed because later analysis depends on it.

---

## 13. Instrumentation strategy for Node.js / TypeScript

### 13.1 Module loading

A practical current Node implementation can preload `flowtrace` with `--import` and register synchronous module customization hooks. As of Node.js 26.8.1, `module.registerHooks()` supports synchronous in-thread `resolve` and `load` hooks and is release-candidate functionality. Node documentation recommends synchronous hooks over the older asynchronous customization path for simplicity and fewer caveats.

The launcher can conceptually execute:

```text
node --import flowtrace/register ...
```

The registered `load` hook obtains eligible application source, transforms it, attaches source maps, and returns instrumented source for execution.

This mechanism is an implementation dependency, not part of the public `flowtrace` contract; alternative bootstrap methods can be substituted as Node evolves.

### 13.2 Parser and source transformation

The transform layer needs modern JS/TS syntax support and stable source-map preservation. Suitable implementation strategies include:

- SWC-based parser/transform/generator;
- Babel parser/traverse/generator;
- TypeScript compiler API where appropriate.

The public design must not depend on one transformer library.

### 13.3 Survey transform

Survey mode instruments only inexpensive high-value sites, for example:

- test/assertion adapters;
- timer scheduling/cancellation;
- EventEmitter-style registration/emission;
- selected assignment sites;
- function boundary fingerprints;
- throw/catch;
- external boundary wrappers.

### 13.4 Deep transform

Deep mode instruments the failure-directed source region more aggressively:

- lexical binding reads/writes;
- property reads/writes;
- element reads/writes;
- destructuring;
- compound assignments;
- update expressions;
- call arguments/returns;
- branch predicates;
- selected object allocations;
- closure creation where necessary.

### 13.5 Source maps

All runtime source sites must map back to original TS/JS source rather than transformed code. Trace source identity should include:

```text
module content hash
original file URL/path
original line/column
AST node kind
stable local site ID
```

Source location alone is insufficient as a cross-revision identity, so content and structural fingerprints should be retained.

---

## 14. Node asynchronous context capture

### 14.1 AsyncLocalStorage

Use `AsyncLocalStorage` where a logical context can be propagated through normal asynchronous operations. It is a stable Node API intended for maintaining state across callbacks and promise chains.

`flowtrace` should create its own lightweight execution context containing IDs, not copy arbitrary application state into the store.

### 14.2 Diagnostics Channel

Node's `diagnostics_channel` API provides named channels for diagnostic data. `TracingChannel` formalizes traceable action start/end/async transitions and is stable in Node.js 26.8. It can be used where Node core or libraries expose appropriate diagnostic channels.

This is especially attractive for framework adapters because it avoids source rewriting when semantic runtime events are already exposed.

### 14.3 Low-level async tracking

The lower-level async hooks API may still be useful for specialized tracing, but the design should minimize dependence on fragile or high-overhead global hooks. Node itself recommends higher-level context and diagnostics facilities for many use cases.

### 14.4 Timers and event emitters

Where platform APIs do not expose enough provenance, `flowtrace` can wrap/intercept selected APIs to assign runtime resource IDs and record:

```text
created by event E
scheduled at site S
fired as async context C
cancelled by event K
```

---

## 15. V8 Inspector as an auxiliary sensor

Node's `node:inspector` module provides a stable API for communicating with the V8 inspector backend.

`flowtrace` should treat the inspector as supplementary rather than foundational. Potential uses include:

- exception and pause metadata;
- runtime object inspection in targeted investigations;
- heap/profiler assistance;
- breakpoint-like intervention experiments;
- evaluating controlled expressions when explicitly permitted.

The main provenance path should not require an interactive debugging session.

---

## 16. Failure sink adapters

### 16.1 Generic Node sinks

Capture:

- uncaught exceptions;
- unhandled rejections;
- exit codes;
- explicit process termination;
- timeout.

### 16.2 Test frameworks

Adapters for Jest, Vitest, and `node:test` should expose:

- test identity;
- suite identity;
- setup/teardown lifecycle;
- assertion location;
- expected/actual values where available;
- test result;
- test timeout/cancellation.

This allows `flowtrace` to use the assertion's data dependencies as a dynamic-slicing root.

---

## 17. Framework semantic adapters

Adapters are not a compromise; they are how `flowtrace` gains reliable semantics without pretending arbitrary runtime code is automatically understandable.

Potential adapters:

### State libraries

Redux, Zustand, or similar:

```text
action
state before/after
store identity
selector/result
```

### Job/queue systems

```text
job identity
attempt
retry
ack/nack
state transition
```

### ORM/database

```text
transaction
logical entity identity
query
commit/rollback
```

### HTTP frameworks

```text
request logical identity
route
middleware operation hierarchy
response
```

### Test runners

```text
test lifecycle
fixture/setup/teardown
assertion sink
```

Adapters emit semantic events but must still label whether information is observed from a framework API or inferred.

---

## 18. Cross-run alignment

Cross-run alignment is one of the core hard problems.

### 18.1 Why runtime IDs fail

The following are generally unstable between runs:

- object IDs;
- timer IDs;
- promise IDs;
- worker IDs;
- async IDs;
- memory addresses;
- randomly generated values.

### 18.2 Alignment anchors

Strong anchors include:

- test identity;
- route/job logical identity;
- declared domain entity key;
- external input fingerprint;
- stable source site;
- operation name from an adapter.

### 18.3 Candidate score

An aligner can score candidate event pairs using weighted evidence:

```text
same normalized source site        +w1
same event kind                    +w2
same operation parent              +w3
aligned async parent               +w4
same domain identity               +w5
compatible value shape             +w6
aligned predecessor/successor      +w7
contradictory domain identity      -infinity
```

The exact scoring algorithm can evolve. The output must expose confidence rather than pretending the mapping is certain.

### 18.4 Graph-aware alignment

Alignment should be iterative:

1. align strong anchors;
2. propagate matches into neighborhoods;
3. score candidate children/parents;
4. reject impossible order/dependency mappings;
5. repeat until stable;
6. retain ambiguous alternatives where needed.

This is closer to graph matching than sequence diff.

---

## 19. Semantic equivalence and normalization

Some values legitimately differ on every run.

Examples:

- timestamps;
- UUIDs;
- random nonces;
- generated temporary paths;
- trace IDs;
- ordering of independent operations.

`flowtrace` should distinguish value equality from semantic equivalence.

Normalization can come from:

- built-in recognizers;
- framework adapters;
- config rules;
- domain declarations;
- inferred patterns with explicit confidence.

Example configuration:

```yaml
normalize:
  - selector: request.id
    as: uuid
  - selector: token
    as: jwt_claims
  - selector: createdAt
    as: relative_timestamp
```

A generated JWT can differ byte-for-byte while still be equivalent with respect to selected claims.

---

## 20. Dynamic slicing

### 20.1 Backward slice

Given sink event `S`, compute events that may influence it through selected dependency edges.

At minimum:

```text
data_dependency
control_dependency
async_parent/triggered_by
external_input
mutation_chain
```

The slice should preserve provenance and uncertainty.

### 20.2 Forward validation

After identifying a candidate divergence `D`, also inspect whether changes downstream from `D` reach `S`. A candidate that differs but whose downstream states reconverge before the failure should receive a lower rank.

### 20.3 Multi-run stability

A candidate is stronger if the same structural divergence appears across many passing/failing pairs.

---

## 21. Active interventions

Interventions are powerful and dangerous. They are only permitted in development/test sandboxes.

### 21.1 Intervention classes

#### Suppression

Prevent an observed event from taking effect.

Examples:

- suppress callback;
- skip mutation;
- cancel timer;
- ignore one retry attempt.

#### Substitution

Replace a failing-run value/event result with a passing-run counterpart.

Examples:

- substitute external response;
- substitute branch input;
- substitute state mutation value.

#### Injection

Introduce a failing behavior into a passing run.

Examples:

- fire a timer that was cancelled;
- inject an error response;
- reproduce a mutation.

#### Ordering intervention

Where controllable, delay or advance a callback/resource to test ordering sensitivity.

### 21.2 Interpretation

An intervention does not prove general mathematical causality. It demonstrates an experimental relationship under the reproduced test conditions.

Output terminology should reflect this:

```text
correlated
failure_reachable
intervention_supported
intervention_validated
```

rather than simply `caused_by`.

---

## 22. Nondeterminism recording and replay

Flaky failures are often driven by nondeterministic inputs. `flowtrace` should progressively capture:

- `Date.now()` and related clocks;
- `Math.random()`;
- cryptographic random calls where interception is safe;
- environment variables read during execution;
- timer scheduling/firing order;
- filesystem reads;
- network responses;
- process scheduling signals that can be observed;
- framework-level retry outcomes.

Not every source can be deterministically replayed. Each nondeterministic input should have capability metadata:

```text
observed_only
record_replay_supported
intervention_supported
opaque
```

Partial replay is still useful.

---

## 23. Workers and child processes

### 23.1 Worker threads

Propagate a `flowtrace` run context through worker creation and instrument workers where possible.

Each worker records to a separate buffer. Parent/worker message transfer creates explicit graph edges.

### 23.2 Node child processes

Intercept Node child process launches and inject the preload/bootstrap configuration where safe.

### 23.3 Non-Node child processes

Treat them as opaque external activities:

```text
process invocation
input fingerprints
stdout/stderr hash or preview
exit code
elapsed time
```

They remain represented in the graph even when internal state cannot be observed.

---

## 24. Trace storage

Deep instrumentation can generate millions of events. The recorder must be designed as a low-overhead append pipeline rather than line-oriented JSON.

### 24.1 Hot-path encoding

Use:

- integer event-kind IDs;
- interned source-site IDs;
- interned string/value-shape tables;
- per-worker append buffers;
- parent-ID references instead of duplicated stacks;
- inline encoding for small primitives;
- hashes plus optional side blobs for large objects;
- monotonic timestamps;
- batched disk writes.

### 24.2 Value encoding

```ts
type EncodedValue =
  | { mode: 'inline'; type: string; value: unknown }
  | { mode: 'preview'; type: string; preview: string; hash: string }
  | { mode: 'hash'; type: string; hash: string }
  | { mode: 'redacted'; type: string; reason: string };
```

### 24.3 Analysis separation

Hot-path capture should perform minimal graph analysis. DAG construction, slicing, alignment, and ranking occur after the run or in a separate process.

---

## 25. Privacy and security

Runtime state can contain credentials, PII, authentication tokens, customer data, and proprietary information.

Defaults should be conservative:

- development/test environments only;
- redact known secret patterns;
- store large strings as hashes/previews by default;
- never upload traces unless explicitly configured;
- avoid recording environment variables wholesale;
- allow path/selector-based redaction;
- retain raw trace files only when requested or when diagnosis requires them;
- mark intervention runs as mutated executions and prevent accidental reuse as test evidence.

Because the primary consumer is an LLM, the evidence compressor must enforce redaction before JSON leaves the local process.

---

## 26. Observer effect and Heisenbugs

Instrumentation changes execution timing and can alter the failure itself.

`flowtrace` should measure this rather than hide it.

Example:

```json
{
  "warning": "instrumentation_sensitive_failure",
  "reproduction_rates": {
    "uninstrumented": 0.08,
    "survey": 0.07,
    "deep": 0.00
  }
}
```

Mitigations:

- obtain uninstrumented reproduction baseline;
- progressively deepen instrumentation;
- instrument the smallest failure-directed region;
- compare multiple instrumentation levels;
- prefer runtime/framework hooks over source rewriting when equivalent evidence exists;
- report when deep tracing eliminates the failure;
- preserve timing and scheduling metadata even when diagnosis is inconclusive.

An inconclusive result is better than a confident artifact caused by the tracer itself.

---

## 27. Regression mode

`flowtrace` can compare runtime behavior across source revisions.

Example:

```bash
flowtrace diagnose \
  --baseline git:HEAD~1 \
  -- npm test -- order.spec.ts
```

Internally:

1. create isolated worktrees/environments;
2. run baseline until representative passing trace exists;
3. run target revision and reproduce failure;
4. align source sites across revisions using source maps, AST structure, and Git diff information;
5. compare failure-directed runtime DAGs;
6. report both code diff and runtime divergence.

This complements `git bisect`:

- `git bisect`: which revision introduced the failure?
- `flowtrace`: what runtime behavior changed when the failure appeared?

---

## 28. Evidence output schema

A diagnosis should contain enough structure for an LLM to decide what to inspect next without exposing the entire trace.

Representative schema:

```json
{
  "schema_version": "1",
  "outcome": "candidate_cause_validated",
  "command": ["npm", "test", "--", "tenant.spec.ts"],
  "runs": {
    "attempted": 24,
    "passing": 22,
    "failing": 2
  },
  "failure_sink": {
    "id": "fail:17:event:991",
    "kind": "assertion",
    "source": "test/tenant.spec.ts:91:5",
    "summary": "expected currentTenant to be null"
  },
  "divergence_frontier": [
    {
      "id": "fail:17:event:442",
      "kind": "timer_fire",
      "source": "src/tenant-refresh.ts:42:3",
      "origin": "observed",
      "present_in_pass": false
    }
  ],
  "evidence_path": [
    {
      "id": "fail:17:event:442",
      "kind": "timer_fire",
      "origin": "observed"
    },
    {
      "id": "fail:17:event:451",
      "kind": "call",
      "source": "src/tenant-refresh.ts:47:1",
      "label": "refreshTenant",
      "origin": "observed"
    },
    {
      "id": "fail:17:event:466",
      "kind": "mutation",
      "target": "currentTenant",
      "source": "src/tenant.ts:84:7",
      "before": null,
      "after": "tenant-b",
      "origin": "observed"
    }
  ],
  "alignment": {
    "origin": "inferred",
    "confidence": 0.94,
    "evidence": [
      "same_test_identity",
      "same_source_site",
      "aligned_async_parent"
    ]
  },
  "interventions": [
    {
      "kind": "suppress_event",
      "event": "fail:17:event:442",
      "result": "PASS",
      "origin": "intervention_validated"
    }
  ],
  "recommended_source_reads": [
    "src/tenant-refresh.ts:35-52",
    "src/tenant.ts:78-89"
  ],
  "limitations": []
}
```

---

## 29. LLM integration contract

The LLM should be able to treat `flowtrace` as a runtime evidence oracle, not as another conversational agent.

A recommended agent policy is:

1. reproduce the failure normally;
2. if the failure is runtime/state-related and not already obvious, call `flowtrace diagnose`;
3. trust `observed` evidence more strongly than `inferred` mappings;
4. inspect only the returned relevant source ranges first;
5. form a repair hypothesis;
6. implement the change;
7. rerun tests;
8. optionally rerun `flowtrace` to verify the suspect evidence path disappeared or changed as expected.

The JSON should contain no natural-language persuasion such as "this is definitely the root cause." It should expose evidence and experimental strength.

---

## 30. Feasibility assessment

### Straightforward / established building blocks

- process orchestration and repeated test execution;
- Node source transformation at load time;
- mutation instrumentation for selected JS/TS syntax;
- stable source mapping;
- test result classification;
- append-only trace recording;
- per-run runtime object IDs;
- assertion/exception sinks;
- basic asynchronous context propagation;
- structured JSON evidence output.

### Difficult but realistically buildable

- targeted read instrumentation;
- robust async lineage across common Node APIs;
- worker/Node-child trace propagation;
- framework adapters;
- failure-directed dynamic slicing;
- cross-run graph alignment;
- semantic normalizers;
- observer-effect measurement;
- partial nondeterministic input replay;
- safe intervention infrastructure.

### Research-heavy / inherently approximate

- robust graph alignment under severe nondeterminism;
- automatic semantic identity for arbitrary runtime objects;
- automatic inference of commutativity or business-level operations;
- precise control/data dependencies in highly dynamic JS;
- race analysis without materially perturbing timing;
- generalized counterfactual causal claims;
- deterministic replay of arbitrary Node programs and external systems.

`flowtrace` does not require solving the research-heavy items perfectly to be valuable. It requires uncertainty to remain explicit.

---

## 31. Implementation program

The desired product scope is broad; implementation can still proceed in layers so each layer creates infrastructure used by the next.

### Layer A — Capture substrate

Implement:

- CLI/orchestrator;
- Node preload/bootstrap;
- source transformation;
- source-map mapping;
- efficient trace writer;
- run/test classification;
- exception/assertion sinks;
- basic mutation events;
- timers and basic async lineage.

Deliverable: reliable evidence for "which observed write produced this bad value?"

### Layer B — Provenance graph

Implement:

- typed event DAG;
- reads in selected slices;
- data-dependency tracking;
- control-dependency tracking;
- async/event edges;
- backward slicing;
- JSON evidence extraction.

Deliverable: "what observed execution path fed this failure?"

### Layer C — Differential execution

Implement:

- pass/fail pair collection;
- structural identities;
- graph alignment;
- divergence frontier detection;
- multi-run candidate ranking;
- noise normalization.

Deliverable: "where do successful and failing executions first diverge on a path that reaches the failure?"

### Layer D — Active diagnosis

Implement:

- reproducible intervention mechanism;
- event suppression/substitution;
- controlled external result replay;
- candidate validation;
- delta debugging over divergence sets.

Deliverable: "does changing this candidate behavior alter the failure?"

### Layer E — Semantic breadth

Implement:

- Jest/Vitest/node:test adapters;
- HTTP framework adapters;
- state-store adapters;
- job/queue adapters;
- ORM adapters;
- worker/child support;
- domain identity configuration.

Deliverable: less inference, stronger semantic evidence.

### Layer F — Regression and replay

Implement:

- Git revision baseline mode;
- source/AST correspondence across revisions;
- broader nondeterminism recording;
- partial deterministic replay;
- trace cache/re-analysis.

Deliverable: active runtime differential debugging across both executions and revisions.

---

## 32. Evaluation strategy

The project should be evaluated on diagnosis quality, not trace completeness.

### 32.1 Synthetic bug corpus

Build cases for:

- leaked timer across tests;
- stale module singleton;
- event listener not removed;
- retry path overwriting final state;
- Promise completion-order bug;
- cache invalidation race;
- optimistic update rollback;
- queue retry/idempotency bug;
- closure-instance confusion;
- object alias mutation;
- Proxy/setter-mediated write;
- worker message ordering;
- external API nondeterministic response;
- instrumentation-sensitive timing failure.

Each bug should have a known ground-truth failure path.

### 32.2 Metrics

Measure:

- reproduction success rate with and without instrumentation;
- capture overhead;
- trace size;
- backward-slice size relative to full trace;
- top-1/top-k divergence precision;
- source-range reduction delivered to the agent;
- intervention success/false-positive rate;
- diagnosis stability across repeated runs;
- agent tokens/tool calls/time-to-fix with and without `flowtrace`.

### 32.3 Agent benchmark

The most important benchmark is end-to-end:

```text
same coding agent
same bug
same repository
```

Compare:

- normal shell/test/log tools;
- normal tools + `flowtrace`.

Measure whether `flowtrace` reduces source exploration and increases successful fixes, especially for flaky/stateful/async bugs.

---

## 33. Important failure modes

`flowtrace` must be explicit about cases where it cannot safely conclude.

### Aliasing

The same object may be mutated through many references. Runtime object IDs solve within-run identity but not cross-run logical identity.

### Proxies and setters

A syntactic assignment may trigger arbitrary code. Source rewriting must distinguish the visible write from downstream effects.

### Native addons

State changed entirely inside native code may be opaque.

### Dynamic code generation

`eval`, `Function`, VM contexts, or unusual transpilers may bypass normal transform paths.

### Race-sensitive behavior

Deep instrumentation may suppress or create timing bugs.

### Cross-run ambiguity

Many structurally identical objects or tasks can make alignment ambiguous.

### Semantics

Two unequal values can be semantically equivalent, and two equal-looking values can represent different domain states.

### External systems

A database, remote service, kernel operation, or non-Node subprocess may contain the true cause outside the observable boundary.

All of these should lead to confidence reduction or explicit limitations, not fabricated certainty.

---

## 34. Relationship to existing tooling

`flowtrace` deliberately overlaps several existing categories but combines them around a different unit of diagnosis.

### Debuggers

Traditional debuggers are excellent at inspecting a suspended execution. `flowtrace` specializes in post-execution provenance and repeated-run comparison.

### Profilers

Profilers answer where CPU time, allocations, or other resources are spent. `flowtrace` asks how state and execution dependencies reached a failure.

### Distributed tracing

Tracing systems such as OpenTelemetry model operations and context across system boundaries. `flowtrace` focuses more deeply on selected in-process state transitions and failure-directed data/control provenance. Existing trace context can be imported as anchors rather than reinvented.

### Record/replay debuggers

Record/replay systems may provide much stronger time travel than `flowtrace`. `flowtrace` instead prioritizes compact machine-queryable diagnosis, differential executions, and active experimentation.

### Dynamic analysis systems

Research systems such as Jalangi/Jalangi2 and NodeProf demonstrate that fine-grained dynamic instrumentation of JavaScript is feasible. `flowtrace` applies related instrumentation capabilities toward agent-facing runtime provenance, dynamic slicing, and differential diagnosis.

---

## 35. Current Node implementation notes

The initial Node implementation should target a recent supported Node release and feature-detect runtime capabilities.

Useful current APIs include:

- `node:module` synchronous customization hooks through `module.registerHooks()`; current Node 26.8.1 documentation marks these synchronous in-thread hooks as release candidate and supports registering them before application code through `--import` or `--require`;
- `AsyncLocalStorage` for logical async context propagation;
- `diagnostics_channel`, including stable `TracingChannel` in Node 26.8, for diagnostic/trace events exposed by Node or cooperating libraries;
- the stable `node:inspector` module as an optional V8 observation/control channel.

These APIs are implementation mechanisms, not assumptions in trace data semantics. `flowtrace` should retain adapters so Node API evolution does not leak into the public evidence model.

---

## 36. Open design questions

Important unresolved questions include:

1. Which JS/TS writes and reads can be instrumented reliably without changing semantics?
2. What is the best internal binary trace representation?
3. How should object snapshots handle cycles, getters, proxies, and large graphs?
4. Which async relationships can be directly observed versus inferred?
5. How much control-dependency tracking is worth the overhead?
6. What graph-alignment algorithm performs well enough on real test traces?
7. How should alignment ambiguity be represented to the LLM?
8. Which intervention types can be safely automated without making executions unrealistic?
9. How can `flowtrace` distinguish a useful counterfactual from an intervention that simply prevents the program from doing meaningful work?
10. What framework adapters provide the highest semantic leverage?
11. How should source-site identity survive code changes in regression mode?
12. How aggressively should external I/O be captured or replayed?
13. How can capture overhead be kept low enough that flaky scheduling behavior remains reproducible?
14. How much trace data is necessary before evidence compression becomes reliable?
15. What evidence schema best teaches coding agents to distinguish observation from inference?

These are the substantive engineering/research questions. None require pretending the runtime automatically understands the business meaning of arbitrary code.

---

## 37. Summary

`flowtrace` begins from a simple interaction:

> Run this failing program and tell me where its runtime state first went wrong.

But its intended implementation is richer than a write logger.

The complete design combines:

- progressive Node/TypeScript instrumentation;
- state mutation and read provenance;
- asynchronous lineage;
- typed partial-order execution DAGs;
- failure-directed dynamic slicing;
- repeated pass/fail execution;
- cross-run graph alignment;
- semantic normalization with explicit provenance;
- nondeterminism observation and partial replay;
- controlled counterfactual intervention;
- delta debugging over candidate divergence sets;
- compact evidence generation for coding agents.

The most important constraint is epistemic rather than algorithmic:

> `flowtrace` must always preserve the distinction between what the runtime directly showed, what the tool inferred, what a user or adapter declared, and what an intervention experimentally supported.

The target product is therefore not a debugger that claims to understand the program. It is an automated experimental instrument that gives an LLM substantially better runtime evidence than source code, logs, and a failing assertion alone.

The desired final experience remains intentionally small:

```bash
flowtrace diagnose --budget-runs 200 -- npm test -- tenant.spec.ts
```

One invocation in; a compact evidence graph out.

---

## 38. Implementation references

The following existing systems/APIs are useful implementation references, not specifications for `flowtrace` itself:

- Node.js `node:module` customization hooks: https://nodejs.org/api/module.html
- Node.js asynchronous context APIs: https://nodejs.org/api/async_context.html
- Node.js Diagnostics Channel / TracingChannel: https://nodejs.org/api/diagnostics_channel.html
- Node.js V8 Inspector integration: https://nodejs.org/api/inspector.html
- OpenTelemetry context propagation concepts: https://opentelemetry.io/docs/concepts/context-propagation/
- Jalangi2 dynamic JavaScript analysis framework: https://github.com/Samsung/jalangi2
