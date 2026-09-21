# Deliverable

Refitted `preview.py` to one direct function with explicit string validation. Added boundary tests in `test_preview.py`. One graph ledger: `ledger.yaml`; execution/version receipt: `verification.json`; deletion probe: `probe.json`.

## Frozen requirements A

1. ○ Valid string output and TypeError for non-strings: executed `python3 -m unittest discover -v`, final 3 tests pass (Ada, 5 additional strings, 8 non-string cases). The rejection test first failed on all 8 cases.
2. ○ Removed provider/facade indirection; no replacement abstraction added.
3. ○ One ledger separates README-sourced convention/requirements and declared freedom from execution/tests. No invented decision history.
4. ○ Deletion probe recorded wrapper execution at original lines 7/10/3/13; actual deletion retained Ada output. Branch 2 applies to Ada only; no universal equivalence claim.
5. ○ All done entries carry matching SHA-256 scope.version/artifact_version for final preview.py and actual final test results.
6. ○ Three levels, admitted limits, and explicit dials below.

## Three-level reviewer explanation

1. The greeting now uses the project's direct-function convention. It returns the required greeting for strings and rejects non-strings with TypeError. There is no current interchangeable provider responsibility to preserve.
2. README's contract and convention ground the changes; ledger D1–D4 link them to the deletion trace and tests. Baseline and deletion-only runs each passed the one existing test; expanded tests exposed eight invalid-input failures; the final required command passed all three tests.
3. Deletion equivalence was observed only for Ada; review again if another provider or class consumer appears. Finite tests do not characterize custom string-subclass operator overrides; revisit if those become a requirement. Error-message text is discretionary; revisit if callers need a stable message.

Signature: scope=preview.py; granularity=細部; strength=テスト実行.

## Phase trace

Understanding / Planning / Execution / Formatting: OK. Structure was resolved before the input boundary and discretionary detail. Execution included one corrected tracing-tool invocation.

## Unclear points

- Phase: Understanding. Issue: whether subclasses count as strings. Cause: README does not demand exact built-in type. General Fix Rule: use normal isinstance semantics, declare the interpretation, and test an ordinary subclass; do not claim custom operator coverage.
- Phase: Execution. Issue: trace CLI did not run unittest as a module. Cause: invocation used an incompatible flag form. General Fix Rule: check actual execution before interpreting coverage; use sys.settrace and capture line hits. Resolved with one tool retry.

## Discretionary fill-ins and retries

Selected TypeError text “name must be a string”, ordinary str-subclass acceptance, local SHA-256 content versions, and representative boundary cases. Strict reviewer simulation asked about the error text and subtype interpretation. Impact area was input/failure behavior; this fixture has no persistence, money, network, time, authorization, or concurrency mechanism.

Decision Retries: 0. Tool retries: 1. Expected red-to-green test failure was verification, not a decision retry. No prompt fix recommended.
