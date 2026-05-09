---
name: stratal
description: "Use when a coding, design, or product task needs repo-local judgment management: clarifying hidden assumptions, preserving human preferences, turning uncertainty into working defaults, maintaining a .stratal/brief.md, or producing a compact decision brief that helps future AI agents continue with less friction. Stratal is self-contained and does not require other skills, orchestrators, issue trackers, worktree managers, dashboards, event sourcing, or global personal memory."
---

# Stratal

Stratal is a self-contained repo-local judgment binding skill for AI coding agents.

Use it to turn unclear assumptions, human preferences, discomfort signals, repo observations, risks, and agent inferences into a compact working contract that future agents can use without asking the human to become an expert.

## Core Rule

The atomic operation is **Judgment Binding**:

> Convert an uncertain judgment into a routed, evidenced, default-bound working item with validation and revisit conditions.

A note is not ready for the brief until it answers:

- What is being judged?
- Why does it matter for future work?
- What has authority here?
- What evidence supports it?
- What is the current working default?
- How should it be validated?
- When should it be revisited?

## When To Use

Use Stratal when the user asks for:

- Stratal, a project brief, judgment binding, decision defaults, or low-friction correctness.
- Help extracting hidden premises, preferences, fit conditions, risks, or decision pressure points.
- A way for future Codex or Claude Code agents to continue work without rediscovering context.
- A repo-local `.stratal/brief.md` or updates to an existing brief.
- A design review where "ask the human to choose" is not enough, especially when the human may lack domain expertise.

Also consider Stratal before substantial implementation when output quality depends on taste, product intent, repo norms, unstated constraints, or uncertain tradeoffs.

Do not use Stratal for simple factual answers, small mechanical edits, or tasks where the requested behavior is already fully specified.

## Non-Goals

Stratal does not:

- Manage issues, tasks, worktrees, branches, or agent assignment.
- Start subagents or orchestrate parallel work.
- Maintain an attempt ledger or event-sourced history.
- Create dashboards or long reports.
- Build a global profile of the human's skill, taste, or competence.
- Treat AI-generated judgments as true merely because they are fluent.

Record only the repo-local working contract needed for this project or task.

## Workflow

1. **Load context.** If `.stratal/brief.md` exists, read it first. Also inspect the relevant repo files, user request, and any provided notes.
2. **Find pressure points.** Identify 3-7 places where correctness depends on judgment, taste, unstated context, risk, or future interpretation.
   If more than 7 pressure points seem important, group them into themes or recommend splitting the task. Do not silently discard high-impact judgments just to fit the number.
3. **Bind judgments.** For each important point, create or update a Judgment Binding. Leave weak material as an open question or discomfort signal.
4. **Ask sparingly.** Ask the human only when a default would be high-risk, irreversible, or blocked by missing stakes. Ask at most two questions, and include a recommended default.
5. **Do the work.** Use the current working contract while answering, designing, or implementing.
6. **Return deltas.** At the end, include at most five proposed brief changes, or edit `.stratal/brief.md` directly when the user asked to create/update the brief.

## Ask Policy

Do not ask the human to supply expert knowledge they may not have. Prefer questions about stakes, examples, appetite for risk, and what would feel wrong.

When asking, use this shape:

```md
I can default to <default>. The risk is <risk>. I would override it if <condition>. Is that acceptable?
```

If the user does not answer and the task can proceed, choose the conservative default and mark it as needing validation.

## Authority Labels

Use plain labels rather than elaborate scoring.

- **Human stated**: The user explicitly said it.
- **Repo evidence**: Existing code, tests, docs, configuration, logs, or conventions show it.
- **External source**: A cited external source supports it.
- **Agent inference**: The agent inferred it from context; useful but weak.
- **Working default**: A temporary choice made to keep work moving.
- **Needs human judgment**: The point depends on values, stakes, or taste the agent cannot safely decide.

Prefer stronger authority when conflicts arise. Do not let an agent inference override human-stated intent or repo evidence.

## Evidence Classes

Use evidence classes to keep judgments honest:

- **Observed**: Directly seen in files, commands, UI, logs, or source material.
- **Derived**: Reasoned from observed evidence.
- **Stated**: Provided by the user or a cited source.
- **Speculative**: Plausible but not yet grounded.
- **Preference**: A taste or fit judgment rather than a factual claim.

Speculative and preference items may guide work, but they need validation or revisit triggers.

Evidence discipline:

- If a claim is based on what a file, command, log, UI, or source literally shows, mark it `Observed` and cite the source.
- If a claim is based on what the agent concludes from observed material, mark it `Derived` or `Agent inference`.
- A filename, function name, convention, or architectural resemblance is not authority by itself; the interpretation is still derived.
- When authority and evidence feel blurry, choose the weaker label and add validation.

## Brief Format

When creating `.stratal/brief.md`, use this format:

```md
# Stratal Brief

## Goal
<!-- What are we trying to make true in this repo or task? -->

## Current Working Contract
<!-- The concise practical direction future agents should follow. -->

## Fit Conditions
<!-- What makes an output feel correct, useful, or acceptable? -->

## Hard Constraints
<!-- Things that must not be violated. Require strong authority. -->

## Preference Gradients
<!-- Preferred directions when several options are viable. -->

## Judgment Bindings
<!-- Bound judgments that future agents may rely on. -->

### <short self-explanatory title>
Authority: <label>
Evidence: <class; cite file/user/source when possible>
Working default:
- <current default>
Why it matters:
- <effect on future work>
Validation:
- <how to check whether this is right>
Revisit when:
- <condition that should reopen the judgment>
Status: active

## Open Questions And Discomfort
<!-- Important uncertainty that is not bound enough to act as a default. -->

## Rejected Directions
<!-- What not to retry, why, and when the rejection should be revisited. -->

## Evidence Notes
<!-- Short references to files, commands, conversations, or sources. -->
```

Keep headings self-explanatory. Do not invent separate opaque IDs or aliases when the heading title is enough. If a stable handle is useful, include it in the heading text itself.

## Brief Delta Format

When not editing the brief directly, return proposed changes in this shape:

```md
## Proposed Brief Delta

### Add

#### <short self-explanatory title>
Authority:
Evidence:
Working default:
Why it matters:
Validation:
Revisit when:

### Update

### Retire

### Keep Unresolved

### Human Follow-up Needed
```

Keep deltas small. Prefer fewer, stronger bindings over many weak notes.

## Editing Rules

`.stratal/brief.md` is human-editable Markdown, not an event log. Preserve human prose and make small diffs.

When updating a brief:

- Preserve existing headings unless a rename clearly improves self-explanation.
- Merge duplicates by meaning, not by filename, timestamp, or source path.
- Retire stale or overgrown items instead of letting sections become unreadable.
- Move weak or unsettled material to `Open Questions And Discomfort`.
- Add validation and revisit conditions to any new working default.
- Avoid YAML events, hidden state machines, and append-only ritual unless the user explicitly asks for them.

Keep the brief compact. A useful brief should be readable in one pass, ideally within about 200-300 lines. If it grows beyond that, compress repeated material, retire stale judgments, or split clearly task-local material out only when the project genuinely needs it.

`.stratal/brief.md` may be committed when it is part of the shared repo working contract. If it contains private preferences, sensitive context, or local-only working notes, keep it untracked or ignore it. Stratal should make this choice explicit instead of assuming either policy.

## Lifecycle

Lifecycle applies to any judgment, not only rejected directions.

Use simple Markdown status words:

- `active`: Future agents may rely on this.
- `tentative`: Usable as a default, but validation is important.
- `revisit`: Something changed; re-check before relying on it.
- `retired`: No longer guides work, kept only for record.

Prefer editing the item's status and explanation in Markdown. Do not create a parallel machine-readable lifecycle unless the project later proves it needs automation.

## Quality Gate

Before finishing a Stratal pass, check:

- Can a future agent act from the brief without rereading the whole conversation?
- Are unsupported AI inferences clearly marked as weak or tentative?
- Are human preferences preserved without pretending they are universal facts?
- Are there validation or revisit conditions for important defaults?
- Is the brief compact enough that an agent will actually read it, preferably in about 200-300 lines or less?
- Did you avoid turning Stratal into an issue tracker, orchestrator, or full project-management system?

## Response Shape

When using Stratal in chat, keep the answer focused:

```md
## Result
<answer, design, implementation summary, or decision>

## Judgment Bindings Used
<only the bindings that materially shaped the work>

## Proposed Brief Delta
<at most five changes, unless the brief was edited directly>
```

Omit sections that would be empty or noisy.
