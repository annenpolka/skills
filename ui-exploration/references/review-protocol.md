# Structured Review Protocol

Read this only when integrating with an existing visual review surface or when
the user explicitly asks to implement one. UI exploration itself must still
work with ordinary screenshots.

## Minimal boundary

Keep the division of responsibility strict:

```text
agent: hypotheses, code changes, interpretation
scripts: reproduce state, capture, persist
review UI: display, compare, point, choose
```

The review UI must not edit source code, run arbitrary shell commands, infer
design intent, or grow into a general design application.

## Session data

A session may contain:

- a stable ID and title;
- target description and reproducible state;
- baseline ID and current preferred candidate;
- candidate IDs;
- screenshot paths;
- per-candidate parent, hypothesis, intended mutations, held-constant variables,
  and reversible patch reference;
- append-only human feedback.

Keep the schema deliberately weak. Do not encode a complete design ontology.
Exploration artifacts normally belong under `.ui-explore/` and should be ignored
by Git unless the project intentionally retains them.

## Feedback events

Use append-only JSON Lines. The minimum useful event types are:

```json
{"type":"variant_preference","preferred":"b","over":["baseline","a"]}
{"type":"region_feedback","variant":"b","verdict":"keep","rect":{"x":0.04,"y":0.08,"w":0.91,"h":0.18}}
{"type":"region_feedback","variant":"b","verdict":"rework","rect":{"x":0.04,"y":0.30,"w":0.91,"h":0.52},"note":"too heavy"}
```

Normalize `x`, `y`, `w`, and `h` to the rendered image, with every value in the
inclusive range `0.0..1.0`. This keeps annotations independent of display scale.

Interpret verdicts as follows:

- `keep`: preserve the region across later variants unless an explicit conflict
  is raised;
- `rework`: keep the region active and localize the next experiment there;
- `reject`: abandon the marked local direction;
- `variant_preference`: inherit the preferred candidate globally before applying
  region constraints.

Free-text notes are optional and remain weak evidence. Escape them when rendered.

## Review interactions

The smallest useful surface supports:

- baseline plus at most three candidates;
- instant switching at identical image position and dimensions;
- hold-to-compare with reliable restoration on key release or lost focus;
- rectangular SVG region creation, move, and resize;
- KEEP, REWORK, and REJECT;
- optional one-line note;
- explicit candidate preference;
- JSONL persistence.

Do not introduce a large frontend framework solely for this surface. Use the
project's existing stack or a dependency-light implementation.

## Server and filesystem safety

- Bind to `127.0.0.1` by default; LAN exposure requires an explicit request.
- Resolve screenshot paths beneath the active session directory and reject path
  traversal.
- Validate session IDs, event shape, normalized coordinates, and payload size.
- Serialize or otherwise protect concurrent JSONL appends.
- Escape notes and other user-controlled text in the browser.
- Never expose arbitrary filesystem reads or shell execution.
- Never use coordinate fallback for destructive interactions. Require an
  explicit project adapter, exact-target verification, a disposable or safely
  reversible fixture, and user authorization immediately before the action.
- Treat branches, worktrees, and patches as recovery references, not disposable
  session files. Retain them unless the user explicitly requests deletion.

## What not to build by default

Do not add preference models, generalized interaction recording, design-system
inference, framework introspection, exploration-graph visualization, persistent
user taste profiles, region transplantation, or collaborative review until
repeated use demonstrates the need or the user requests it.
