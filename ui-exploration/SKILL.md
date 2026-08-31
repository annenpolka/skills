---
name: ui-exploration
description: >-
  Explore and improve a working product UI through controlled visual variants
  and human comparison. Use for vague perceptual feedback such as "feels off"
  or "too heavy", requests to explore alternatives, A/B comparisons, or
  region-level KEEP/REWORK/REJECT feedback. Do not use for implementing an
  already precise UI specification, fixing a purely functional bug, or
  generating standalone artwork.
metadata:
  short-description: Explore product UI through controlled visual variants
---

# UI Exploration

Treat UI work as an experiment:

```text
baseline -> controlled variants -> human comparison -> narrower experiment
```

The human is the primary evaluator. Your job is to make useful differences
visible and preserve what they choose, not to infer a final design from vague
language in one pass.

## Operating Rules

- Capture or inspect a visual baseline before making visual changes. Never
  claim to have seen a state that you could not render or inspect.
- Test one concrete uncertainty, or one tightly related set of competing
  hypotheses, per round.
- Produce 2-3 candidates when direction is genuinely uncertain. Keep unrelated
  visual and interaction variables stable so the comparison teaches something.
- Render every candidate in the same application state, viewport, data,
  platform, and scale. If any of these differ, disclose the comparison limit.
- Call a candidate `preferred` only after the human selects it. Do not describe
  your own candidate as better unless an explicit requirement makes it
  objectively so.
- Treat vague feedback as evidence. `Heavy` may implicate borders, nesting,
  contrast, typography, density, or whitespace; make the next comparison
  distinguish plausible causes instead of choosing one silently.
- Preserve accepted regions and decisions across rounds. If a requested change
  conflicts with a KEEP region, surface the conflict before changing it.
- Keep experiments reversible and isolated from unrelated user work. Do not
  erase alternatives until the human chooses a direction.
- Prefer an existing project capture/review workflow. Do not build a review app,
  recorder, design system, or automation framework unless the user asks for it.

## Exploration Loop

### 1. Preflight

Read repository instructions and inspect the current worktree before editing.
Identify:

- the exact UI region under exploration;
- a reproducible state that exposes it;
- the available run, capture, browser, and test mechanisms;
- existing uncommitted work that must remain untouched;
- the fastest reversible way to hold multiple candidates.

Use pixels as the minimum observation layer. Accessibility data, DOM/component
metadata, stable element IDs, and project-specific state adapters are useful
when already available, but they are not prerequisites.

If the target cannot be rendered or captured after reasonable in-scope checks,
stop before visual judgment. Report the concrete missing prerequisite and ask
only for what is needed to obtain an observable baseline.

### 2. Establish the baseline

Reach one known state and capture the relevant view before editing. Record enough
context to reproduce it: launch command or fixture, interaction state, viewport,
theme, scale, and screenshot path when applicable.

Use an existing `.ui-explore/` or project session convention when present. Do
not introduce session infrastructure just to record a single comparison; a
short session note is sufficient.

### 3. Frame the experiment

Turn the user's feedback into a question and competing hypotheses. State for
each candidate:

- the hypothesis it tests;
- the intended mutations;
- the variables deliberately held constant.

Choose the mode:

- **Divergence:** direction is unclear; compare semantically distinct options.
- **Convergence:** a direction is preferred; vary one nearby parameter or
  design decision.

Example for `the panel feels heavy`:

```text
A: weaken section borders; preserve spacing and typography
B: increase whitespace; preserve grouping and typography
C: reduce background contrast; preserve grouping and spacing
```

Avoid candidates that simultaneously change color, spacing, type, hierarchy,
icons, and interaction. A preference for such a bundle provides little evidence
about the cause.

### 4. Build reversible candidates

Choose the lightest isolation mechanism the repository supports: runtime style
parameters, patch snapshots, dedicated files, temporary branches, or worktrees.
Keep each candidate attributable to its stated hypothesis. Preserve unrelated
dirty files and do not weaken behavior merely to make a screenshot look right.

If compile or relaunch time dominates the loop, reuse existing runtime-editable
presentation parameters. Do not redesign the application architecture solely to
accelerate exploration unless requested.

### 5. Capture comparable evidence

Replay the baseline state for every candidate and capture the same checkpoints.
For interactive UI, include the states material to the question, such as idle,
hover, focus, menu-open, selected, or drag feedback. Prefer targets in this
order when replaying interactions:

1. semantic or accessibility target;
2. stable application/component identifier;
3. project adapter;
4. raw coordinates as a disclosed fallback.

Use raw coordinates only for non-destructive, recoverable interactions. Never
use coordinate fallback for deleting, purchasing, publishing, overwriting, or
other destructive actions. Such actions require an explicit project adapter,
an exact-target check, a disposable or safely reversible fixture, and the
user's authorization immediately before the action.

Verify that the target actually launched, the intended candidate is visible,
and the images are not stale before presenting them.

### 6. Ask for perceptual judgment

Use the highest-bandwidth comparison surface already available:

1. project-local review UI with rapid switching or hold-to-compare;
2. an interactive browser/computer surface;
3. clearly labeled screenshots in chat.

Keep the image frame stable. Present the baseline and candidates with concise
hypothesis labels, then ask the human to choose, reject, or mark regions. Do not
make them restate visual details that comparison can reveal.

Useful feedback vocabulary:

- `KEEP`: preserve this region as strongly as practical in later rounds;
- `REWORK`: keep it as the active exploration target;
- `REJECT`: abandon this local direction;
- whole-variant preference: use that candidate as the next baseline;
- `meh` or no meaningful preference: the tested difference may no longer
  matter.

### 7. Interpret without overclaiming

Translate choices into evidence, not universal taste rules.

- A preferred candidate supplies the next baseline, not proof that every one of
  its changes caused the preference.
- A KEEP region becomes a preservation constraint.
- A REWORK region localizes the next experiment.
- A vague note generates plausible explanations that the next controlled
  variants should separate.
- A rejected direction stays available as history until a winner is promoted;
  do not quietly mix it back into later candidates.

When feedback combines signals, inherit the preferred candidate globally while
changing only the REWORK region and preserving KEEP regions.

### 8. Converge or stop

Continue only while a round can answer a meaningful design question. Stop when:

- the human selects a direction and asks to apply it;
- repeated candidates produce no meaningful preference;
- the user changes focus;
- reliable visual comparison is no longer available.

Do not chase microscopic differences after preferences collapse unless asked.

## Promoting a Winner

After the human chooses:

1. promote the selected candidate to the working baseline;
2. preserve accepted regions and decisions;
3. run relevant functional checks as well as a final visual capture in the same
   state;
4. deactivate rejected candidates, but retain branches, worktrees, and patches
   unless the user explicitly asks to delete them;
5. remove only verified disposable captures or session files you created and
   that contain no user work;
6. report the accepted direction, evidence used, checks run, preserved regions,
   and any unresolved visual or interaction risk.

Never overwrite unrelated work or silently promote a candidate before the human
has selected it.

## Optional Structured Review Integration

If the repository already has a local review surface, or the user explicitly
asks to build one, read [references/review-protocol.md](references/review-protocol.md).
That reference defines the minimal session and feedback contract, including
normalized region coordinates and localhost safety boundaries.
