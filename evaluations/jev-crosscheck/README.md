# jev-crosscheck evaluation

Fresh Claude Code subagents (one per scenario and round) read the skill and ran real
TypeSafe calls through an evaluation wrapper that recorded every `--inspect` and send
(arguments, request bytes, output, exit code). The parent verified those records, the
notes, and fixture hashes, and adjudicated self-reported unclear points
([adjudication.md](adjudication.md)).

| Round | Skill | A | B | C | Holdout | New defects |
|---|---|---|---|---|---|---|
| iter1–13 | v1–v13 | ○ 100% | ○ 100% | ○ 100% | H ○ (iter7) | 5,3,4,2,2,3,4,3,2,1,2,3,2 |
| iter14 | v14 | ○ 100% | ○ 100% | ○ 100% | — | 0 |
| iter15 | v14 | ○ 100% | ○ 100% | ○ 100% | H2 ○ | 2 |
| iter16–19 | v15–v18 | ○ 100% | ○ 100% | ○ 100% | — | 1,1,1,1 |
| iter20 | v19 | ○ 100% | ○ 100% | ○ 100% | — | 0 |
| iter21 | v19 | ○ 100% | ○ 100% | ○ 100% | H3 ○ | 0 |

Converged qualitatively at v19: two consecutive rounds without new defects and an
unused holdout at 100%. Numeric step/duration thresholds were not met between those
rounds (single runs), so numerical convergence is not claimed.

Key findings:
- User direction reshaped the contract three times: use checks wherever no
  deterministic mechanism exists (v4), send to Jev when in doubt (v9), and center the
  skill on semantic assertions used heavily (v12).
- Folding several readings into one criteria set dropped a clear mismatch from ~0.05
  to 0.36; one reading per assertion restored it (v7).
- Prose ordering ("inspect before send") was violated five times, partly because the
  example piped straight into the helper. The helper now enforces it: sends require an
  inspection stamp matching the file hash (exit 4), and inspection refuses common
  credential patterns (exit 5).

Limitations: checklists are visible to executors; fixtures are small and synthetic, so
this measures skill operation, not Jev's accuracy on real material; executors ran
inside another project's working tree. Raw transcripts, requests, and the API key are
not distributed.

- [Results](results.json) · [Scenarios](scenarios.json) · [Failure patterns](failure-patterns.json) · [Shipped hashes](package-manifest.json)
