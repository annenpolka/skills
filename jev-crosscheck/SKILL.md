---
name: jev-crosscheck
description: Check semantic assertions in bulk with TypeSafe's Jev model through a bundled helper that reads the API key from the macOS Keychain at call time. Use throughout work in any project to turn reading-based claims into typed assertions with probabilities, such as whether a diff implements what a report claims, whether a test asserts the claimed behavior, whether a cited passage supports a claim, whether docs match config or code, whether a brief states scope and completion conditions, and whether your own conclusions hold. Also use when the user says "jev-crosscheck", "Jevで確認", or "TypeSafeでチェック". Assertions narrow attention; they never replace tests, real execution, or the agent's own acceptance.
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

## Write assertions

Three separate tool calls, in order. Run the helper with `bash` (installers may drop
the executable bit). The helper refuses to send a file that was not
inspected or that changed after inspection (exit `4`), so do not batch them.

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
# 2. inspect: prints state keys and questions, scans for credential patterns, records the inspection
bash <skill-dir>/scripts/jev-crosscheck --inspect request.json
# 3. after reading the summary, send
bash <skill-dir>/scripts/jev-crosscheck request.json
```

- One assertion per claim against one source. Split compound claims; nearby claims in
  the same material get their own assertions. Send all assertions over the same state
  in one request (`questions` map; `model` defaults to `jev-latest`).
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
- Requires `jq`, `curl`, and macOS `security`. `TYPESAFE_BASE_URL` overrides the endpoint.
- Exit codes: `0` success; `2` invalid request JSON or usage (fix it, inspect again);
  `3` key missing or empty (see below); `4` not inspected or changed since (inspect
  again as its own step); `5` credential-like pattern in the request (remove it from
  state, then inspect again); any other value comes from curl, such as `7` cannot
  connect or `22` HTTP error with the body on stderr. For those, call once more
  at most, then stop and report. Never work around a failure by calling the API
  yourself or changing the endpoint.
- The key lives in the login Keychain as service `typesafe-api`. The helper never
  exports it, so child processes and delegates do not inherit it. Never print, export,
  or put the key into a brief. On exit `3`, tell the user to register it in a normal
  terminal (a Claude Code `!` command cannot take hidden input):
  `security add-generic-password -U -a "$USER" -s typesafe-api -w`

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

- Put your own findings and conclusion first. Then a TypeSafe section with the helper
  exit code, the returned `model`, the state keys sent and their source files or
  lines, and for each assertion its id, `instructions` text (quoted, or a summary
  pointing to the saved request), and answer fields as returned: `noul` for Noul;
  `choice`, `probabilities`, `confidence` for Choice; `score`, `probabilities`,
  `confidence` for Score. Noul has no `confidence`; do not invent one. `usage` is
  optional.
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
