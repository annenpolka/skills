---
name: jev-crosscheck
description: Check semantic assertions in bulk with TypeSafe's Jev model through a bundled helper that reads the API key from the OS credential store (macOS Keychain or Windows Credential Manager) at call time. Use throughout work in any project to turn reading-based claims into typed assertions with probabilities, such as whether a diff implements what a report claims, whether a test asserts the claimed behavior, whether a cited passage supports a claim, whether docs match config or code, whether a brief states scope and completion conditions, and whether your own conclusions hold. Also use when the user says "jev-crosscheck", "Jevで確認", or "TypeSafeでチェック". Assertions narrow attention; they never replace tests, real execution, or the agent's own acceptance.
---

# Jev Crosscheck

Tests assert what code does; semantic assertions assert what text means. Whenever a
conclusion rests on reading rather than on a deterministic mechanism, write it as
one or more assertions and send them to Jev, which returns a calibrated probability
for each. Use it heavily: many small assertions in one request are cheap, and a low
answer points at what to inspect. Use the installed directory containing this file as
`<skill-dir>`.

The example below is enough for Noul (yes/no) assertions, the default form. For
Choice or Score questions, structured state, or unfamiliar answer fields, read the
official `typesafe-ai` skill when available, otherwise https://docs.typesafe.ai/llms.txt.

## What to assert

By default, assert every reading-based claim you rely on, including conclusions you
have already reached yourself. Typical assertions:

- A delegate's report: the diff implements each claimed change; an added test asserts
  the claimed behavior; the log shows or names the relevant test.
- Docs, comments, config, spec, and code: each described behavior or value matches.
- A research note: the cited passage supports each claim.
- A brief before delegating: it states editable files, forbidden actions, and
  completion conditions.
- Review findings or logs: Score severity or Choice a category.

For tests, first name the contract the test protects, a concrete wrong implementation
it should catch, and implementation changes it should tolerate. Then assert whether
the assertions distinguish that wrong implementation, whether the test boundary or a
mock removes the behavior under test, and whether each detail the test depends on is
needed to verify that contract. Depending on internals is not wrong by itself: counting
calls to a notification client can be the contract ("never notify twice"), while
pinning calls to a private helper usually is not.

Do not assert only these:

- Anything the data boundary below forbids sending.
- Whether a deterministic mechanism's reported results are true (test runner counts
  and exit status, type checker, linter, schema validator, an existing script). Use
  its output instead. If you did not run it during this task, rerun it when the
  source, the command, and permission to run it are all available; otherwise read the
  output as given and say it was not reproduced. The counts and statuses it prints
  are part of that output, so read them directly. What else the output shows or names
  is an ordinary assertion when your conclusion relies on it: for a report saying
  "all tests pass", assert that the given log shows the relevant tests by name, not
  that the tests pass. When your decision rests only on counts and statuses, assert
  nothing about that output.

A general instruction to use TypeSafe checks does not override these exclusions.
When nothing was asserted, say so in the deliverable with the reason.

## Question directions

When preparing a batch, skim [question-lenses.md](references/question-lenses.md)
for useful angles: scope, timing, ordering, failure, evidence, tests, and simpler
alternatives. Treat it as a sample palette, not a checklist or another workflow.
Adapt relevant seeds into concrete assertions about the supplied state; expand
freely where useful without requiring every lens, a fixed count, or a preliminary
Jev call to choose directions. These questions supplement the claims above.

Keep one proposition per question and the specific sufficiency checks below. Batch
questions that can share the same permitted state within the provider's input limits;
use separate requests when their evidence must differ. Do not dilute the data boundary
or turn many similar answers into votes. Use the same helper and reporting procedure.

## Write assertions

Three separate tool calls, in order. Run the helper with `bash` (installers may drop
the executable bit). The helper refuses to send a file that was not
inspected, or whose bytes or endpoint changed after inspection (exit `4`), so do not
batch them. It is a guard against accidents, not a sandbox.

```bash
# 1. write the request
jq -n --arg report "$REPORT" --arg diff "$DIFF" '{
  state: {report: $report, diff: $diff},
  questions: {
    diff_implements_claim: {
      type: "noul",
      instructions: "Does `diff` implement the behavior change that `report` claims?",
      criteria: {true: "The diff contains the claimed change", false: "The claimed change is missing, partial, or contradicted"}
    }
  }
}' > request.json
# 2. inspect: prints endpoint, state keys, each question with its instructions and criteria;
#    scans for credential patterns; records the inspection for these bytes and this endpoint
bash <skill-dir>/scripts/jev-crosscheck --inspect request.json
# 3. after reading the summary, send
bash <skill-dir>/scripts/jev-crosscheck request.json
```

- One assertion per claim against one source. Split compound claims; nearby claims in
  the same material get their own assertions. Send all assertions over the same state
  in one request (`questions` map; `model` defaults to `jev-latest`).
- Pair each assertion your conclusion relies on with a sufficiency assertion that
  names the specific fact the claim needs and asks whether the shown material states
  it directly, not through names of definitions that are absent. One sufficiency
  assertion may cover several claims that depend on the same fact in the same source. For example: "Does
  `test_code` show which HTTP statuses the fake server returns, without relying on
  imported constants whose definitions are not shown?" In trials, a generic "is this
  enough to judge the claim?" and a Choice option `insufficient_evidence` both missed
  absent definitions; the specific form separated them. A low sufficiency answer means
  read more material, not that the claim is false, and any claim answer that depends
  on that fact counts as unsupported however high it is (in trials, claim answers of
  0.8 to 0.97 rested on names whose definitions were absent).
- When no material for a claim is available at all, do not assert it; list it in the
  deliverable as not checkable, naming the source you would need.
- The content of material you cannot see (the value of an absent constant, the body of
  an absent fixture) is not a meaning assumption. You may ask a conditional assertion
  that states a hypothetical value explicitly ("If `EXPECTED_ATTEMPTS` is 2, would...")
  only together with the same assertion without that hypothesis. Report the
  conditional answer as "if", never as support. In trials the pair differed sharply
  (0.98 conditional, 0.29 without the hypothesis).
- Keep assertions independent of your own findings. Describe both outcomes at the
  same level of detail and do not put what you found or expect (for example "only the
  log message changed") into the instructions or criteria. Examples inside criteria
  may come only from the claim being checked, never from what you inspected.
- Assumptions about meaning (what a term or config key means, how a library call
  behaves, which test is relevant) go into an assertion when its answer depends on
  them; observed or expected outcomes never do. Fix one reading per assertion and add
  one assertion per reading whenever the readings could change the answer, even if
  your own conclusion is the same under each. Assumptions the answer does
  not depend on go only in the deliverable, which also says whether your conclusion
  holds under every reading. For example, "with pytz, `is_dst=None` raises on
  ambiguous times" is an allowed assumption; "the diff leaves `is_dst=None` unchanged"
  is your finding and stays out.
- Requires `jq`, `curl`, and a key store: macOS `security`, or on Windows (Git Bash,
  MSYS2 or Cygwin) `powershell.exe` with Credential Manager. `TYPESAFE_BASE_URL`
  overrides the endpoint.
- Exit codes: `0` success; `2` invalid request JSON or usage (fix it, inspect again);
  `3` key missing or empty (see below); `4` not inspected, or file or endpoint changed
  since (inspect again as its own step); `5` credential-like content, reported by
  category and state key without the value (remove it, then inspect again); any other value comes from curl, such as `7` cannot
  connect or `22` HTTP error; the response body goes to stderr. For those, call once more
  at most, then stop and report. Never work around a failure by calling the API
  yourself or changing the endpoint.
- The key lives in the macOS login Keychain as service `typesafe-api`, or on Windows
  as the Credential Manager generic credential `typesafe-api`. The helper never
  exports it, so child processes and delegates do not inherit it. Never print, export,
  or put the key into a brief. On exit `3`, relay any store error printed on stderr,
  then tell the user to register the key in a normal terminal (a Claude Code `!`
  command cannot take hidden input):
  macOS `security add-generic-password -U -a "$USER" -s typesafe-api -w`;
  Windows `cmdkey /generic:typesafe-api /user:%USERNAME% /pass` (prompts for the key).

## Data boundary

Sending state publishes it to TypeSafe. Reading files locally to choose what to send
is fine; these limits apply to the request. Send only what the current project allows
to leave the machine. Never send credentials, keys, tokens, connection strings,
databases or dumps, personal or player data, proprietary assets, or raw logs a project
marks private. When no project rule covers the material, text free of those
categories may be sent; otherwise ask.

Decide per source. A short, relevant source containing none of those categories may be
sent whole. For mixed sources (config files, logs, documents with embedded secrets),
build state from an allowlist of only the lines or fields the assertions need, never
from the whole file minus a denylist. Read the `--inspect` summary before sending; its
credential scan catches common patterns only and does not replace the allowlist. If a source contains
credentials, the deliverable may name their category and location but never their
value, even partly.

## Report results

- Keep the full record in files: save the response next to its request (for example
  `request.json` and `response.json` in a scratch folder the task allows) and keep both. The deliverable points to them
  instead of listing every assertion.
- In the deliverable, put your own findings and conclusion first. Then a short
  TypeSafe section with the helper exit code, the returned `model`, the state keys
  sent and their sources, the saved file paths, and only the assertions that matter:
  low or disputed answers, low sufficiency answers, and any answer your conclusion
  uses. For those, give the id, the instructions (quoted or summarized), the answer
  fields as returned (`noul`; or `choice`, `probabilities`, `confidence`; or `score`,
  `probabilities`, `confidence`; Noul has no `confidence`), and the effect on your
  conclusion. `usage` is optional.
- Give each finding that matters a status and update it when later work resolves it:
  `confirmed by execution`, `confirmed by reading` (a direct comparison of material you
  have, such as a config value against a documented number), `counterexample found`
  (say whether by execution or by reading), or `unresolved`. An assertion
  suggests where to look; the status records what actually checked it.
- Do not turn a probability into PASS/FAIL or present it as verified fact. A low or
  disputed answer is a reason to inspect the evidence or send the work back; a high
  one is not acceptance. Tests, real runs, proofs, and your own review still decide.
- Noul near 0.5 means undecided, not "medium". Low Choice/Score confidence can mean
  several acceptable answers.
- If the call fails, say no assertion was checked, give the exit code and error text,
  list the prepared state keys and assertions, and give no answer fields. Never
  substitute a guessed judgment.
- Project instructions that restrict external transfer or define acceptance take
  precedence over this skill.
