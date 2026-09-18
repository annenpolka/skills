# Sources and compatibility notes

Reviewed 2026-09-18. This is a workflow skill, not a claim of measured review accuracy.
Public documentation can change; check the installed tools before execution. Source
contents inform the design but do not grant permissions or turn illustrative models
into the user's requirements.

## Public primary references

- **S1 — Agent Skills specification**: [format and progressive disclosure](https://agentskills.io/specification).
  Supports SKILL.md frontmatter, relative references, and optional scripts.
- **S2 — TypeSafe primitives and Noul**: [primitives](https://docs.typesafe.ai/primitives),
  [Noul](https://docs.typesafe.ai/primitives/noul).
  Supports typed focused questions, the use of instructions rather than question IDs,
  shared-state question independence, and Noul's response shape.
- **S3 — TypeSafe confidence**: [confidence](https://docs.typesafe.ai/confidence).
  Describes confidence derived from Choice/Score distributions; project-specific
  calibration and permissions remain separate obligations in this skill.
- **S4 — Quint CLI**: [CLI manual](https://quint.sh/docs/quint).
  Supports typecheck/run/verify distinctions, explicit backend selection, bounded
  Apalache checks, and the possibility of automatic backend acquisition.
- **S5 — Quint property checking**: [checking properties](https://quint.sh/docs/checking-properties).
  Supports witness queries and distinctions between ordinary and inductive checks.
- **S6 — Apalache**: [symbolic model checking](https://apalache-mc.org/docs/tutorials/symbmc.html).
  Defines transition systems, reachable states, finite exploration, and the limits
  of drawing unbounded conclusions from bounded absence of counterexamples.
- **S7 — Quint MBT**: [model-based testing](https://quint.sh/docs/model-based-testing).
  Distinguishes model/code behavioral confidence from proof of the complete code;
  the older Rust walkthrough is marked deprecated in favor of Quint Connect.
- **S8 — Alloy**: [analysis tutorial](https://alloytools.org/tutorials/online/maintext-FS-2.html),
  [language and commands](https://alloytools.org/spec.html).
  Supports finite-scope instance/counterexample analysis and run/check distinctions.
- **S9 — Z3**: [basic commands](https://microsoft.github.io/z3guide/docs/logic/basiccommands/),
  [propositional logic](https://microsoft.github.io/z3guide/docs/logic/propositional-logic/).
  Supports satisfiability queries and the separation of sat, unsat, and unknown.

## Existing companion skills inspected

- `annenpolka/skills/jev-crosscheck/SKILL.md`
  [source](https://github.com/annenpolka/skills/blob/main/jev-crosscheck/SKILL.md)
  Blob SHA: `94983f39b069d1777f9eeeb8d4453684686a7758`.
  Reused boundary: concrete sufficiency assertions, independent questions,
  original evidence, existing credential helper, separate inspection/sending,
  and probabilities as review signals rather than acceptance.
- `annenpolka/skills/spec-interview/SKILL.md`
  [source](https://github.com/annenpolka/skills/blob/main/spec-interview/SKILL.md)
  Blob SHA: `edf499983181964555fe82489213fc996c3af03b`.
  Reused as an optional decision-resolution handoff, not an automatic endless interview.
- `annenpolka/skills/README.md`
  Blob SHA: `28fac75a017d4990a0c8146acabbc9e532541308`.
  Repository convention: one root-level directory per skill. This bundle does not
  modify that repository or its skill index.

## Design lineage, not a runtime dependency

The local qlint v0.1 design separates question, state, binding, and checking profile;
negative answers from missing evidence; and static facts from semantic signals and
observed behavior. Specprobe uses that discipline as a checklist. It does not assume
that qlint's proposed CLI, a Jev adapter, or an automatic specification compiler exists.

The runtime bundle is standalone. It does not require the prior design document,
private conversation history, access to a particular repository, or an external
service for its basic source-review workflow.
