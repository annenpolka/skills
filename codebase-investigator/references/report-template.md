# Investigation Report Template

Use this template when synthesizing an exhaustive investigation. Keep the main report
readable: summary first, evidence matrix second, then the details that matter.

---

```markdown
# Codebase Investigation Report: [Project Name]

> Investigated on [date] | [LOC] lines across [N] files | Primary language: [lang]

## Executive Summary

[2–3 sentences: what the system is, what it seems built to do, and what matters most before changing it.]

**Health Assessment**: [🟢 Healthy / 🟡 Moderate concerns / 🔴 Significant risks]
**Confidence**: [High / Medium / Low]
**Static investigation limits**: [What could not be verified without runtime access]

### Verified Facts
- [Facts backed directly by files or command output]

### Inferences
- [Interpretations that connect multiple verified facts]

### Unverified / Needs Follow-up
- [Important unknowns, unresolved contradictions, or runtime-only questions]

**Top 3 Things to Know**:
1. [Most important architectural decision or constraint]
2. [Most important convention or workflow invariant]
3. [Biggest risk or landmine]

---

## System Model

### Purpose
[What the system does, for whom, and what problem it solves]

### Major Units
- `[unit]` — [what it owns]
- `[unit]` — [what it owns]

### Candidate Entrypoints
- `[path]` — [why it looks central]

### Core Flows
1. [Flow name] — [short textual trace]
2. [Flow name] — [short textual trace]

### Technology Stack
| Layer | Technology | Version / Notes |
|------|------------|-----------------|
| Language | [e.g. TypeScript] | [version] |
| Framework | [e.g. Next.js] | [version] |
| Persistence | [e.g. PostgreSQL] | [version] |
| Delivery | [e.g. Docker + GitHub Actions] | [notes] |

---

## Evidence Matrix

### Coverage Lane Matrix
| Coverage lane | Units covered | Key evidence | Status |
|--------------|---------------|--------------|--------|
| Structure & Layout | [units] | [paths] | [Closed / N/A / Open gap] |
| Dependency & Build System | [units] | [paths] | [Closed / N/A / Open gap] |
| Code Patterns & Conventions | [units] | [paths] | [Closed / N/A / Open gap] |
| Architecture & Data Flow | [units] | [paths] | [Closed / N/A / Open gap] |
| Test & Quality Infrastructure | [units] | [paths] | [Closed / N/A / Open gap] |
| Git History & Evolution | [units] | [paths or commands] | [Closed / N/A / Open gap] |

### Phase Completion
| Phase | Status | Notes |
|------|--------|-------|
| Phase 1: Census & Scope Freeze | [Full / Minimal / Re-run required / User-skipped] | [why] |
| Phase 2: Surface Coverage Sweep | [Full / Minimal / Re-run required / User-skipped] | [why] |
| Phase 3: Flow Tracing | [Full / Minimal / Re-run required / User-skipped] | [why] |
| Phase 4: Cross-Cutting Census | [Full / Minimal / Re-run required / User-skipped] | [why] |
| Phase 5: Falsification & Blind-Spot Hunt | [Full / Minimal / Re-run required / User-skipped] | [why] |
| Phase 6: Synthesis & Confidence Gate | [Full / Minimal / Re-run required / User-skipped] | [why] |

### Contradiction Ledger
- [Contradiction] — [evidence on both sides] — [resolved / unresolved]

### Open Gap Ledger
- [Gap] — [which unit or lane is open] — [why it remains open]

### Claim Confidence Table
| Claim | Label | Evidence | Counter-evidence attempted | Confidence |
|------|-------|----------|---------------------------|------------|
| [Claim] | [Verified / Inference / Hypothesis / Unverified] | [paths or commands] | [search or N/A] | [High / Medium / Low] |

---

## Findings by Coverage Lane

### Structure & Layout
- [Finding]

### Dependency & Build System
- [Finding]

### Code Patterns & Conventions
- [Finding]

### Architecture & Data Flow
- [Finding]

### Test & Quality Infrastructure
- [Finding]

### Git History & Evolution
- [Finding]

---

## Risks & Recommendations

### Technical Debt & Risks

#### Critical
- **[Issue]**: [Description]
  - Evidence: [file:line or command output]
  - Impact: [What could go wrong]
  - Confidence: [High / Medium / Low]

#### Moderate
- **[Issue]**: [Description]
  - Evidence: [file:line or command output]
  - Impact: [What could go wrong]
  - Confidence: [High / Medium / Low]

#### Low
- **[Issue]**: [Description]
  - Evidence: [file:line or command output]
  - Impact: [What could go wrong]
  - Confidence: [High / Medium / Low]

## Recommendations

Only include recommendations backed by findings above.
If a recommendation is still speculative, move it to `Areas needing deeper investigation`.

### Before making changes
1. [Specific recommendation]
   - Evidence: [What finding supports this action]
   - Why now: [Why this matters now]
2. [Specific recommendation]
   - Evidence: [What finding supports this action]
   - Why now: [Why this matters now]

### Quick wins
1. [Low-effort, high-value improvement]
   - Evidence: [What finding supports this action]
   - Why now: [Why this matters now]
2. [Low-effort, high-value improvement]
   - Evidence: [What finding supports this action]
   - Why now: [Why this matters now]

### Areas needing deeper investigation
1. [Area — why it needs more attention]
```
