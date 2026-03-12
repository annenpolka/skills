---
name: codebase-investigator
description: |
  Exhaustive static codebase investigation skill for repo analysis, architecture review,
  audits, onboarding, dependency review, technical-debt assessment, and requests like
  "investigate this repo", "what does this codebase do", "where is X implemented",
  "コードベース調査", "コード調査", and "全体像を把握". Uses 6 investigation phases,
  mandatory coverage lanes, contradiction and gap ledgers, and evidence-backed synthesis.
  STRICT: The parent agent MUST orchestrate all 6 phases in order — never skip phases
  or delegate the entire investigation to Explore agents. Phase 1 Census MUST run first.
  Focus narrows scope within each phase, never reduces phase count. Subagents handle
  bounded probes within a phase; the parent drives phase transitions and synthesis.
---

# Codebase Investigator

Systematic, exhaustive, static investigation that trades confidence theater for
explicit coverage, contradiction handling, and gap reporting.

## Core Workflow

```
Phase 1: Census & Scope Freeze
          ↓
Phase 2: Surface Coverage Sweep ─┐
Phase 3: Flow Tracing            ├─> targeted gap-closing probes
Phase 4: Cross-Cutting Census    │
          ↓                      │
Phase 5: Falsification & Blind-Spot Hunt
          ↓
Phase 6: Synthesis & Confidence Gate
```

Always exhaustive. The six old topic buckets are coverage lanes, not phase names.

### Before You Start

> **STOP — read this before doing anything.** Do not launch Explore agents, do not start
> searching code, do not delegate the investigation. First complete steps 1–6 below in the
> parent agent. The protocol exists because undirected searching misses coverage gaps that
> only the phase structure catches. "The task seems simple enough to skip phases" is the
> single most common failure mode — it is never correct.

1. **Sync repos**: Ensure target repositories are up-to-date before investigating.
2. **Identify the root**: Confirm the project root (`.git/`, `package.json`, `Cargo.toml`, etc.).
3. **Run the Phase 1 Census** (not optional): Use Claude's native tools (Glob, Grep, Read, Bash) to collect the initial project census. See Phase 1 for detailed goals and recommended procedures.
4. **Freeze the census**: investigation units, candidate entrypoints, surface roots, initial size calibration.
5. **Fold in user focus areas as extra probes, not exemptions**: focus shifts depth, not phase count. A user-approved skip must still appear in the final phase table.
6. **Stay static only:** Do not require install, build, test, boot, or external credentials. Runtime-only questions must be labeled `Unverified`.

---

## Mandatory Coverage Lanes

Every exhaustive run must close these lanes across all major investigation units, or list the unresolved parts in the gap ledger:

1. Structure & Layout
2. Dependency & Build System
3. Code Patterns & Conventions
4. Architecture & Data Flow
5. Test & Quality Infrastructure
6. Git History & Evolution

For every major unit, each applicable lane must end in: **Closed with evidence**, **N/A with reason**, or **Open gap with follow-up note**.

---

## Compliance & Blocking Gates

- **Always execute all 6 phases — no exceptions, no shortcuts, no "this task is simple enough".**
- A focused user question (e.g. "find all Firebase events", "list API differences") does NOT reduce phase count. It narrows the scope WITHIN each phase.
- Do not start synthesis until Phases 1–5 produced outputs and high-risk gaps were revisited.
- Final report must show both phase status and coverage-lane status.
- **First action after reading this skill must be Phase 1 Census**, not undirected Explore agents. If you find yourself launching broad searches before completing the Census — you are violating the protocol.

Final report is blocked until:

- Every phase is `Full`, `Minimal`, or `User-skipped` with required artifacts
- Every coverage lane is closed with evidence or listed in the gap ledger
- Every major investigation unit is touched, marked `N/A`, or listed as a blind spot
- Major contradictions are resolved or listed in the contradiction ledger
- Negative claims cite search query and scope
- Runtime-dependent statements are labeled `Unverified`

A phase is complete only when its artifact set includes: coverage advanced, evidence ledger, contradictions, open gaps, next probes, confidence. Missing artifacts → `Re-run required`.

High confidence requires: every primary unit touched, every applicable lane closed or explicitly open, core flow claims backed by files actually read, no major contradiction unresolved.

---

## Subagent Protocol

Use subagents for bounded, read-only probes **within a phase**. Keep orchestration, phase transitions, and final synthesis in the parent agent.

> **Anti-pattern (PROHIBITED):** "The user wants Firebase events → launch 2 Explore agents
> to find them → combine results → done." This skips census, skips all 6 phases, and
> produces unstructured output with no coverage tracking.
>
> **Correct pattern:** Parent runs Phase 1 Census → Phase 2 dispatches subagents for
> bounded surface probes → Parent collects, tracks coverage → Phase 3–5 → Phase 6
> synthesis with evidence protocol.

### Evidence & Coverage Standards

**Evidence**: Every claim must cite specific files and lines. Cite ≥3 instances per repeated pattern (or all if fewer). Negative claims must cite the search query and scope.

**Coverage**: Every phase must report: units touched, lanes advanced, main searches performed, files actually read, untouched areas, confidence level (High/Medium/Low).

### Evidence Protocol (per finding)

Every finding in any phase MUST follow this structure:

| Field | Required | Description |
|-------|----------|-------------|
| 結論 | Yes | One-sentence factual claim with label (Verified/Inference/Hypothesis/Unverified) |
| 根拠ファイル | Yes | File paths with line numbers (≥1) |
| 根拠コード | If citing patterns | Quoted code snippet or command output excerpt |
| 実行コマンド | Yes | Glob/Grep/Bash command that produced this evidence |
| 未確認事項 | Yes (empty OK) | What remains uncertain + where to look for confirmation |
| 反証候補 | Yes (empty OK) | Search that would disprove this claim, with expected disproving result |

Example:

```
- 結論 [Verified]: DI は constructor injection で統一されている
  根拠ファイル: src/services/UserService.ts:15, src/services/OrderService.ts:22
  実行コマンド: Grep `constructor.*@Inject` in src/services/ → 12 hits
  未確認事項: linter rule による強制があるかは未確認 → .eslintrc を確認すれば判明
  反証候補: Grep `new UserService(` → 0 hits なら主張を支持、1+ hits なら崩れる → 0 hits
```

Negative finding example:

```
- 結論 [Verified]: 直接 SQL による位置情報書き込みは存在しない
  根拠ファイル: app/models/user_location.rb (全永続化がここを経由)
  実行コマンド: Grep `insert_all|raw\.execute.*INSERT` in app/ → 0 hits
  未確認事項: マイグレーション内の seed データ書き込みは未確認 → db/seeds/ を確認すれば判明
  反証候補: Grep `execute.*INSERT.*user_location` → 1+ hits なら主張が崩れる → 0 hits
```

### Minimum Coverage by Repo Size

- **Small**: read ≥3 files per phase (or all if fewer)
- **Medium**: touch each primary unit; read entry, core, config-or-CI, test-or-doc surfaces
- **Large**: touch every investigation unit before revisiting hotspots

### Search Strategy

| Goal | Tool | Example |
|------|------|---------|
| Find files by name/extension | Glob | `**/*.test.ts`, `**/routes/**` |
| Find patterns or absences | Grep | `TODO|FIXME`,`import .* from` |
| Read representative evidence | Read | After Glob/Grep surfaced candidates |
| List directories or git history | Bash | `ls`, `git log --oneline -20` |

Search order: Glob → Grep → Read. Never read files blindly.

### Subagent Output Format

```markdown
## Phase [N]: [Phase Title]
### Scope Snapshot
- Units touched: [unit1], [unit2]
- Coverage lanes advanced: [lane1], [lane2]
### Findings (Evidence Protocol format)
- 結論 [Verified]: [finding]
  根拠ファイル: [paths:lines]
  実行コマンド: [command → result]
  未確認事項: [what remains uncertain]
  反証候補: [what would disprove this]
### Required Artifacts
- Evidence ledger / Contradictions / Open gaps / Next probes
### Search Log
- Glob: `[pattern]` → [result]  |  Grep: `[pattern]` → [result]
### Confidence
- [High/Medium/Low] — [why]
```

### Subagent Constraints

Do NOT: modify files, run build/test/start/install, assume runtime behavior, report on unread files, silently skip units/lanes/contradictions, generate huge output.

---

## Investigation Phases

### Phase 1: Census & Scope Freeze

Build the investigation census before parallel work starts. Decide what counts as the system, what counts as a unit, and what surfaces later phases must touch.

**Goals:**

- Confirm the project root and project type (single-language, monorepo, polyglot, etc.)
- Identify and freeze investigation units
- List candidate entrypoints
- Map surface roots (source, config/CI, tests, docs, packages)
- Determine size category (small: <5K LOC, medium: 5K–50K, large: >50K)
- Read README and root-level manifest/config

**Steps:**

1. Collect project census using Claude tools (see recommended procedures below)
2. Read root README and one root-level manifest/config
3. Confirm candidate entrypoints; add obvious misses
4. Confirm surface roots for source, config/CI, tests, docs, packages
5. Search for nested apps, extra manifests, alternate roots, vendored subprojects, abandoned dirs

**Recommended Census procedures** (adapt to the target repo):

```
# Manifest detection → investigation unit identification
Glob: **/package.json, **/Cargo.toml, **/go.mod, **/pyproject.toml,
      **/setup.py, **/requirements.txt, **/Gemfile, **/pom.xml,
      **/build.gradle, **/build.gradle.kts

# Directory structure overview
Bash: ls -la <project-root>
Glob: <project-root>/*/ (top-level directories)

# Entrypoint candidates
Glob: **/main.*, **/index.*, **/app.*, **/server.*, **/cli.*
Glob: **/__main__.py

# Source/test file scope estimation
Glob: **/*.{ts,tsx,js,jsx,py,rb,go,rs,java,kt,swift,cs,cpp,c,php}
Glob: **/*.test.*, **/*.spec.*, **/*_test.*, **/test_*

# Git intelligence (if .git/ exists)
Bash: git log --oneline -1 --reverse (first commit)
Bash: git log --oneline -1 (last commit)
Bash: git rev-list --count HEAD (total commits)
Bash: git shortlog -sn --no-merges | head -10 (contributors)
```

**Required artifacts:** Frozen unit list, lane applicability table, candidate entrypoints, surface roots, initial blind spots.

**Exit:** Every major unit named, candidate entrypoints explicit, lane applicability defined, uncertainty recorded as blind spot.

**Handoff:** Pass frozen unit list, lane table, entrypoints, surface roots to Phases 2–5.

### Phase 2: Surface Coverage Sweep

Touch broadly before going deep — every major unit, every surface. Breadth prevents tunnel vision.

**Steps:**

1. For each major unit, read ≥1 entry, core, config/CI, test/doc file
2. Use Phase 1 surface roots first; expand only if thin
3. Record representative files and which lanes each read advanced
4. Search for hidden surfaces: alternate test trees, orphan docs, extra CI files, config roots outside expected dirs
5. Stop only after every major unit has ≥1 real read or explicit open gap

**Required artifacts:** Unit × surface coverage table, first-pass evidence ledger, lane-closure status, blind spots, representative file list, next probes.

**Exit:** Every major unit touched with real file reads; entry/core/config/test surfaces covered; thin coverage explicit.

**Handoff:** Pass unit × surface table, representative files, thin-coverage warnings to Phases 3–5.

### Phase 3: Flow Tracing

Trace how the system works by following concrete flows from entrypoints to side effects.

**Steps:**

1. Pick 2–3 core flows from candidate entrypoints, docs, or hotspots
2. Trace each through validation → orchestration → persistence → external calls → output
3. Include ≥1 cross-unit flow in multi-unit repos
4. Record transformations, branching points, hidden couplings
5. Search for alternate entrypoints, bypass paths, side-channel writes, shadow integrations

**Required artifacts:** Core flow list, textual flow traces, boundary/ownership map, evidence ledger per hop, contradictions, next probes.

**Exit:** ≥1 central end-to-end flow traced with read evidence; cross-unit boundaries explicit; unexplained bypasses recorded.

**Handoff:** Pass traced flows, boundary map, unresolved forks to Phases 4–5.

### Phase 4: Cross-Cutting Census

Compare patterns that cut across the repo: dependencies, build, CI, conventions, testing, security.

**Steps:**

1. Read primary manifest and lockfile for each major unit
2. Read main CI/quality config governing each unit
3. Compare code patterns across units: naming, error handling, logging, state, imports, typing
4. Compare test strategy and quality gates
5. For exhaustive investigations, **MUST read** `references/security-checklist.md`
6. Search for competing configs, duplicate dep managers, inconsistent quality gates, legacy patterns, security bypasses

**Required artifacts:** Lane comparison notes, dependency/build evidence, pattern consistency ledger, test/quality ledger, security observations, next probes.

**Exit:** Claims backed by files read; canonical patterns and exceptions recorded; cross-unit inconsistencies explicit; security-significant findings surfaced.

**Handoff:** Pass cross-cutting ledgers, inconsistencies, security findings to Phases 5–6.

### Phase 5: Falsification & Blind-Spot Hunt

Attack the current explanation. Try to break the leading narrative.

**Steps:**

1. Read recent git history, hotspots, deleted-file history, contributor concentration
2. Compare hotspots against current lane matrix
3. Search for dead dirs, duplicate configs, backup entrypoints, migrations, legacy paths, low-visibility churn, single-owner hotspots
4. Re-open weak lanes with more evidence or move to open gaps
5. Promote unresolved challenges into contradiction/gap ledger

**Required artifacts:** Contradiction ledger, blind-spot ledger, git history notes, re-opened lanes, falsification results, next probes.

**Exit:** Git history used as evidence; ≥1 serious falsification attempt; weak lanes strengthened or moved to open gaps; single-owner/high-churn landmines surfaced.

### Phase 6: Synthesis & Confidence Gate

Synthesize only after Phases 1–5 and gap-closing are complete.

**Gap-closing pass** (before synthesis): revisit contradictions between phases, units with thin/zero lane coverage, negative claims with weak search evidence, landmine areas (simple-looking but high churn), lanes still open for major units. Do not stop after one follow-up if contradiction/blind spot remains.

**Steps:**

1. Verify Phase 1–6 status and coverage-lane closure
2. Separate `Verified`, `Inference`, `Hypothesis`, `Unverified`
3. Build coverage-lane matrix and contradiction/gap ledgers
4. Set confidence based on coverage, not optimism
5. Write report using the report template below
6. Optionally: `python3 <skill-path>/scripts/dep_graph.py <project-root>`

**Exit:** Every phase marked, every lane closed/N/A/open-gap, high-confidence claims pass the gate, recommendations supported by findings.

---

## Report Template (Skeleton)

```markdown
# Codebase Investigation Report: [Project Name]

> Investigated on [date] | [LOC] lines | [N] files | Primary language: [lang]

## Executive Summary
[2–3 sentences] | Health: [🟢/🟡/🔴] | Confidence: [H/M/L]
- Verified Facts: [list]
- Inferences: [list]
- Unverified / Needs Follow-up: [list]
**Top 3**: 1. [architecture] 2. [convention] 3. [risk]

## System Model
Purpose / Major Units / Candidate Entrypoints / Core Flows / Tech Stack table

## Evidence Matrix
- Coverage Lane Matrix: | Lane | Units | Evidence | Status (Closed/N-A/Open gap) |
- Phase Completion: | Phase | Status (Full/Minimal/Re-run/Skipped) | Notes |
- Contradiction Ledger / Open Gap Ledger / Claim Confidence Table

## Findings by Coverage Lane
Structure / Dependency / Patterns / Architecture / Test / Git History

## Risks & Recommendations
- Technical Debt: Critical / Moderate / Low — each with evidence, impact, confidence
- Recommendations: Before changes / Quick wins / Areas needing deeper investigation
```

For the full template with all field details, read `references/report-template.md`.

---

## Claim & Recommendation Standards

**Claim labels** — use consistently:

- `Verified`: directly supported by files read or command output captured
- `Inference`: reasoned conclusion from multiple verified facts
- `Hypothesis`: plausible explanation needing more evidence
- `Unverified`: depends on runtime, missing coverage, or unresolved contradiction

Do not use "likely", "probably", "appears", "seems" as fact — label as `Hypothesis` or `Unverified`.

Every recommendation must cite both evidence and impact. Unsupported recommendations → "Areas needing deeper investigation."

### Report Delivery

Highlight: top 3 things to know, biggest risk, landmines, unverified items, phase/lane status. Then ask: "Want me to deep-dive into any specific area?"

---

## Reference Files

Read when applicable:

- `references/report-template.md` — Full report template with all field details (use during Phase 6 for complete formatting)
- `references/security-checklist.md` — **MUST read during Phases 4–5** for exhaustive investigations
- `references/patterns-catalog.md` — Language/framework-specific pattern hints and grep targets (read when analyzing code patterns for the detected language)
- `references/benchmark.md` — Known-answer benchmark questions and scoring rubric (use during skill evaluation or self-check after Phase 6)

---

## Important Reminders

- **Evidence over opinion**: cite files, lines, and command output
- **Coverage over confidence theater**: low coverage = low confidence
- **Six phases means six phases**: always execute all six
- **Lane closure beats pretty summaries**: an open gap is better than a fake conclusion
- **Respect the codebase**: describe observations and implications, not insults
