# Implementation delegation

Use this when assigning code changes, especially work with shared boundaries or
parallel editors. The caller decides the contract and owns acceptance and integration.

## Choose a task with a usable precedent

Give the delegate a working call site, representative input/output, or adjacent
implementation whose behavior it should follow. Identify which parts are intentional
requirements and which are only examples. If an external API or engine boundary is
unverified, first probe it or assign a read-only investigation that returns source
locations, observed behavior, and open questions. Do not ask each implementation worker
to invent the same missing adapter, lifecycle, or comparison logic.

Where the contract is settled and test-first work is useful, the caller writes the
important behavioral tests before delegation. Confirm a meaningful failure against
the missing or incorrect behavior, then freeze the tests and reference data. A minimal
stub may expose a new entry point; an import failure or missing dependency is not the
behavioral red test. Use a checksum or baseline diff when needed to protect the oracle.
The delegate can add coverage but must not rewrite expectations or narrow generators
to fit its output; return a suspected contract error to the caller.

## Reduce the caller's work when cost matters

Assign implementation, permitted checks, and first repairs as one coherent unit once
its contract and precedent are stable. The caller supplies the critical acceptance
cases and shared decisions; the delegate can fill in routine cases and resolve its
own test failures. Return a compact counterexample to the same session before taking
over a repair that still fits the contract.

Bound the read set and the requested response. Ask for changed paths, command exit
status, a short test summary, and unresolved issues; keep full logs in local artifacts.
When summarizing command output, preserve the tested command's exit status so a tail
or filter cannot hide failure. Avoid giving the caller another full implementation
or investigation to repeat. Use independent review for uncertain or consequential
boundaries and retain the acceptance gates that still apply.

## Keep ownership explicit

For parallel work, assign disjoint edit sets including new files and generated outputs.
The caller must also avoid editing files an active delegate owns. Build and verify a
shared component once before distributing dependent additions. Use an isolated checkout
when direct shared-tree edits cannot keep ownership clear. Parallel model calls do not
make shared databases, ports, builds, or fixtures safe for concurrent execution; assign
an environment owner and an execution order where those resources are shared.

Include the following when relevant, using the task's actual paths and commands:

- Purpose, current state, requested edit, and surviving behavior.
- Allowed reads, editable files, permitted commands, protected tests, and exclusions.
- Working precedent and representative successful and rejected input/output.
- Caller-owned acceptance checks, including the failure already observed.
- Runtime budget and requested report: changes, executed checks, failures, unrun checks.

A short task can express this in a few sentences. Avoid copying a whole repository's
instructions or secrets into the brief. Existing examples should reduce inference,
not carry unrelated project conventions into the implementation.

## Verify the claim, including the caller's changes

Capture the identity of inputs before asynchronous setup or execution can admit
concurrent edits. Carry that original identity through the run and reject changes;
do not relabel already loaded code with a later working-tree hash. Confirm protected
tests and references mechanically, inspect the changed code, and independently test
the affected boundaries. Delegate test results cover their actual scope. Repeating
unchanged broad checks is useful only when new changes, failures, or uncertainty
warrant it; real integration still needs its own evidence when the task requires it.

For asynchronous or timed work, choose relevant acceptance cases: a clock that stops,
a pending operation that never settles, completion arriving after cancellation, or
repeated waits that retain listeners or callbacks. Verify that the watchdog can still
run and late results cannot mutate a finished result. These are behavioral conditions,
not a requirement to use a particular timer or cancellation implementation. If work
and cleanup both fail, preserve both errors and any saved artifact. A primary failure
must not hide cleanup failure or allow unsafe continuation into the next unit.

Turn review findings into small reproductions before correction when practical. Decide
whether concrete feedback makes another delegate pass worthwhile using the recovery
criteria in [SKILL.md](../SKILL.md). Keep parent-authored fixes under the same regression
and integration checks. Report observed coverage and unresolved cases separately; a
passing local test suite does not establish untested runtime or persistence behavior.
