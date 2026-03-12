# Investigation Benchmark & Scoring Rubric

Verification framework for codebase-investigator output quality.
Scores **evidence tracing** (how findings are supported), not just final answers.

## How to Use

### Benchmark Evaluation

1. Run an investigation against a benchmark question
2. `bash scripts/score.sh <output-file>` for Tier 1 (deterministic) scoring
3. Evaluate Tier 2 (judgment) criteria using the rubric below

### Real Investigation Self-Check

After Phase 6 synthesis, verify output against Tier 1 criteria.
If Tier 1 score < 10/12 or warnings present, revisit findings to add missing evidence fields.

---

## Benchmark Question Design Principles

- Score **evidence tracing**, not just correctness of the final answer
- Expected evidence uses structural patterns (directory patterns, architecture boundaries), not line numbers
- Each question specifies: Expected evidence / Minimum files / Counter-evidence search
- Questions are stable across repo evolution; update calibration notes after major changes

---

## Benchmark Question Template

Use this template to create project-specific benchmark questions:

```markdown
### Q[N]: [Title] [Easy/Medium/Hard]

- **Question**: [What should the investigation answer?]
- **Expected evidence**:
  - [Structural pattern 1 — e.g., "File in `src/auth/` handling token validation"]
  - [Structural pattern 2 — e.g., "≥2 middleware layers between request and handler"]
- **Minimum files**: ≥[N] ([brief description of which files])
- **Must cross**: [boundary that the answer must trace across, if applicable]
- **Counter-evidence search**: [search that would disprove the expected answer] → expect [result]
- **Calibration note** ([date]): [finding count and key metrics from last run]
```

### Field Guide

| Field | Purpose | Example |
|-------|---------|---------|
| Question | What the investigation should answer | "How does user authentication work?" |
| Expected evidence | Structural patterns (not line numbers) that a correct answer must cover | "Auth middleware in `src/middleware/`" |
| Minimum files | Lower bound on files that must be cited | ≥3 |
| Must cross | Architectural boundary the trace must span | controller → service → repository |
| Counter-evidence search | A search whose result would break the expected answer | `grep "hardcoded.*password"` → expect 0 |
| Calibration note | Snapshot from last verified run | "2026-01-15: 8 findings, 3 auth paths confirmed" |

### Difficulty Guidelines

- **Easy**: Single-layer answer, few files, obvious entry point (e.g., "What test framework?")
- **Medium**: Cross-layer answer, multiple files, requires tracing a flow (e.g., "How is billing handled?")
- **Hard**: Multi-layer with hidden paths, requires counter-evidence to confirm (e.g., "Trace data from API to persistence with all side effects")

---

## Example Benchmark Question

This is a generic example — not tied to any specific project:

### QX: Authentication Flow [Medium]

- **Question**: How does the application authenticate API requests?
- **Expected evidence**:
  - Entry point in request middleware or controller base class
  - Token validation logic (JWT, session, API key, etc.)
  - At least one path that bypasses authentication (health check, public endpoints)
- **Minimum files**: ≥3 (middleware/base controller + auth logic + route config)
- **Must cross**: HTTP layer → auth module → user/session store
- **Counter-evidence search**: Endpoints without auth middleware → document which and why
- **Calibration note**: (fill after first run)

---

## Scoring Rubric

### Tier 1: Evidence Presence (deterministic — checked by score.sh)

| Criterion | Points | Pass condition |
|-----------|--------|---------------|
| File path citations | 0-3 | ≥1 file path per finding = 3 |
| Line number citations (unique) | 0-2 | ≥1 unique file:line per finding = 2 |
| Command log | 0-2 | Every finding has command = 2 |
| Uncertainty declared (substantive) | 0-2 | ≥1 per phase, excluding empty (なし/N/A) = 2 |
| Counter-evidence attempted (substantive) | 0-3 | ≥1 per phase, excluding empty = 3 |
| **Tier 1 total** | **/12** | |

**Auto-fail conditions** (score.sh enforced):
- findings < 5 → pass: false regardless of score
- warnings issued for: phases < 3, zero substantive uncertainties, zero substantive counter-evidence

### Tier 2: Evidence Quality (judgment — human or AI evaluates)

| Criterion | Points | Evaluation |
|-----------|--------|-----------|
| Evidence relevance | 0-3 | Cited files actually support the claim |
| Correct identification | 0-3 | Found the right entry point / flow / pattern |
| Completeness | 0-3 | Did not miss major components |
| Uncertainty honesty | 0-2 | Unconfirmed items are genuinely uncertain, not padding |
| Counter-evidence quality | 0-2 | Counter-evidence includes expected disproving result, not just search |
| **Tier 2 total** | **/13** | |

### Thresholds

| Score | Interpretation |
|-------|---------------|
| Tier 1 ≥ 10/12 + no auto-fail | Evidence protocol followed correctly |
| Tier 2 ≥ 10/13 | Investigation output is trustworthy |
| Tier 2 8-9/13 | Partially trustworthy; gaps identified |
| Tier 2 < 8/13 | Should not be trusted without follow-up |

---

## Creating Project-Specific Benchmarks

To create benchmarks for a new project:

1. **Run a full investigation first** — you need real findings to calibrate expectations
2. **Pick 3–5 questions** covering different difficulty levels and architectural layers
3. **Use structural patterns** in Expected evidence (directory names, module boundaries), not line numbers
4. **Include counter-evidence** for each question — "what search would disprove the expected answer?"
5. **Calibrate** — run the investigation, record finding counts and key metrics in Calibration notes
6. **Store project-specific benchmarks** alongside the project (not in this skill directory)

### Maintaining Benchmarks

Expected answers are structural (directory patterns, architecture boundaries) rather than
line-specific. When repos change significantly:

1. Re-run the investigation and compare against expected evidence
2. Update calibration notes with new finding counts
3. Add new benchmark questions for newly discovered architectural patterns
4. Remove questions whose domain area no longer exists in the codebase
