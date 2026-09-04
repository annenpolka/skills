---
name: kaisetsu
description: Runs an independent second-pass technical explanation and explanatory audit through Gemini 3.8 Flash via `agy`, presenting the reconstruction as a self-contained HTML artifact. Use after substantive architecture, refactoring, debugging, investigation, or implementation when a reader-facing Japanese reconstruction, rationale record, or explanation-gap check would add value, or when the user explicitly asks for a Gemini second pass, 解説, or 感想戦. Do not invoke for trivial edits, routine CRUD, ordinary short explanations, or before the primary agent has formed and stated its own technical understanding.
---

# Kaisetsu

Use Gemini 3.8 Flash as an independent second-pass reader after the primary agent has already done the substantive technical work and explained it in its own words.

The point is deliberately **not** to save explanation tokens. The two passes have different jobs:

```text
primary work + verification
        ↓
primary self-explanation
        ↓
bounded explanation packet
        ↓
Gemini reader reconstruction + audit
        ↓
primary discrepancy check
        ↓
reader-facing result
```

## Invariants

1. **Two-pass principle** — Never outsource the primary reasoning. The primary agent investigates, decides, implements or reviews, verifies, and produces its own explanation before invoking Gemini.
2. **Epistemic isolation** — By default Gemini reconstructs the work from a bounded explanation packet rather than independently exploring the repository. Running from an empty temporary directory reduces accidental repository grounding and encourages packet-only reconstruction. It does not prevent repository or external access and is not a security or isolation boundary. Packet-only reasoning is an instruction contract, not an enforced capability restriction.
3. **Epistemic labeling** — Facts, decisions, inferences, and unknowns must remain distinct. Fluent prose must not manufacture certainty, evidence, or rationale.
4. **Implementation learning is first-class** — Preserve broken assumptions, surprises, newly exposed constraints, and changes in understanding discovered while touching the implementation.
5. **Discrepancies are signal** — Differences between the primary explanation and Gemini's reconstruction are useful observations. Do not silently merge them away.
6. **Mechanism over polish** — Optimize for technical information retained per unit of reader effort, not minimum length or maximum rhetorical smoothness.

## Trigger criteria

### Invoke when

- A substantive architectural or ownership decision was made.
- A non-trivial refactor or implementation needs a durable rationale.
- A subtle bug root cause needs to be reconstructed for another reader.
- Investigation changed the working mental model of the system.
- A reviewer or future maintainer should be able to understand the result without replaying the entire investigation.
- An independent reader check could expose hidden assumptions, missing premises, naming problems, or abstraction friction.
- The user explicitly requests a Gemini explanation pass, rationale audit, post-mortem comparison / 感想戦, or technical 解説.

### Do not invoke when

- The task is a typo fix, formatting change, mechanical rename, import sort, routine dependency bump, or straightforward CRUD.
- The user only wants a quick conversational explanation.
- No meaningful technical decision or non-obvious finding exists.
- The primary agent cannot yet state why the result works, what evidence supports it, or what remains uncertain.

If the primary agent is not ready to explain the work, continue the primary investigation instead of using Gemini to invent the missing story.

## Defaults

- **Language:** Japanese
- **Audience:** Technically capable developer unfamiliar with the immediate work
- **Behavior:** Reader reconstruction as semantic HTML followed by a compact explanatory audit
- **Model:** `gemini-3.8-flash-medium`
- **Scope:** Explanation packet only

Use `gemini-3.8-flash-high` when the packet contains genuinely difficult architectural causality, several interacting alternatives, subtle concurrency/state ownership, or important ambiguity. Do not escalate merely for nicer prose.

## Workflow

### 1. Produce the primary self-explanation

Before invoking `agy`, write the primary agent's own faithful explanation of the work.

At minimum, establish:

- What problem or question was addressed?
- What changed or was concluded?
- Why was this approach chosen?
- What concrete evidence supports the result?
- Which alternatives materially affected the decision?
- What did implementation or investigation reveal that was not known initially?
- What remains unverified, provisional, environment-dependent, or out of scope?

Use `UNKNOWN` when something is not established. Do not fabricate a rationale after the fact simply because an explanation feels incomplete.

### 2. Build the bounded explanation packet

Use semantic sections for **role in the technical story** and epistemic tags for **how strongly the statement is known**. Do not mix these two axes.

Epistemic tags:

- `[FACT]` — directly observed or verified from code, tests, commands, measurements, or supplied documents
- `[DECISION]` — an intentional technical choice
- `[INFERENCE]` — an interpretation or hypothesis supported by evidence but not directly established
- `[UNKNOWN]` — not established, weakly verified, provisional, or outside scope

Recommended packet:

```text
<EXPLANATION_PACKET>

AUDIENCE
Who will read this and what they should be able to understand or do afterward.

OUTPUT_GOAL
For example: understand the change, review a design decision, remember why it exists later, operate/debug it, or assess whether the rationale is complete.

TASK
The original problem or question.

RESULT
What was changed, fixed, concluded, or discovered.

FACTS_AND_EVIDENCE
- [FACT] Concrete observation, source location, test result, command result, benchmark, or other evidence.

DECISIONS
- [DECISION] Choice made, including the constraint or evidence that made it preferable.

ALTERNATIVES
- [FACT] Alternative A was actually considered.
- [INFERENCE] Why it appeared weaker under the current constraints, when that judgment is interpretive.
- [UNKNOWN] What evidence could still change the choice, when applicable.

IMPLEMENTATION_LEARNINGS
Initial understanding:
- [INFERENCE] What was expected before implementation/investigation.

Discovery:
- [FACT] What was actually observed.

Adaptation:
- [DECISION] How the design or implementation changed in response.

UNCERTAINTIES_AND_LIMITS
- [UNKNOWN] Unverified behavior, scope limit, environmental dependency, missing measurement, or unresolved question.

PRIMARY_EXPLANATION
The primary agent's complete self-explanation.

</EXPLANATION_PACKET>
```

Do not manufacture alternatives merely to make the packet look rigorous. Include alternatives that were genuinely considered or that are necessary to explain the decision boundary.

Before sending the packet externally, remove credentials, tokens, private keys, unrelated personal data, unnecessary production data, and source dumps that are not needed as evidence.

### 3. Run the second pass

Resolve this skill's directory and invoke the helper by its actual path. Do not assume the target project's working directory contains `scripts/kaisetsu.sh`. Invoke it through `bash` because download-based installation may not preserve Git's executable bit.

Example:

```bash
RESULT_JSON="$(bash /absolute/path/to/kaisetsu-skill/scripts/kaisetsu.sh /path/to/explanation-packet.txt)"
GEMINI_EXPLANATION="$(jq -r '.response' <<<"$RESULT_JSON")"
```

For a reasoning-dense packet:

```bash
RESULT_JSON="$(bash /absolute/path/to/kaisetsu-skill/scripts/kaisetsu.sh \
  --model gemini-3.8-flash-high \
  /path/to/explanation-packet.txt)"
GEMINI_EXPLANATION="$(jq -r '.response' <<<"$RESULT_JSON")"
```

The helper:

- verifies `agy`, `jq`, `python3`, and its HTML renderer are available,
- builds the reader prompt,
- stages one NDJSON input event before launching `agy`,
- sends the prompt through `agy` using stdin streaming rather than a large command-line argument,
- runs `agy` from a separate empty workspace directory so prompt/event files are not visible in its cwd,
- removes known parent-session linkage variables (`ANTIGRAVITY_AGENT`, `ANTIGRAVITY_TRAJECTORY_ID`, `ANTIGRAVITY_LS_ADDRESS`) from the child while preserving unrelated Antigravity configuration/authentication,
- parses a terminal structured result even when `agy` exits non-zero, so `.result.error` is not masked by the process exit code,
- requires an explicit `SUCCESS` result and non-empty response,
- treats the successful `.response` as Gemini's raw semantic HTML fragment and preserves it unchanged in the normalized JSON for the primary discrepancy audit,
- validates that fragment before publication: exactly one `<main>` root, exactly one stable explanation-gaps section, balanced supported markup, and no script, style, event handler, embedded media, or external resource dependency,
- wraps only a valid fragment in the helper-owned self-contained HTML shell and CSS,
- saves the resulting page to `/tmp/kaisetsu.*.html` and attempts to display it with macOS `open` through the normal file association,
- treats failure to launch `open` as a warning while keeping the second pass successful,
- preserves the final response and usage metadata in normalized JSON,
- never silently falls back to another model.

A successful Gemini pass and a successful local display are separate outcomes. If the helper returns `SUCCESS` JSON but emits an `open` warning containing a saved path, complete the normal display workflow as follows:

1. Recognize exactly one of these helper-owned warning forms and ignore path-like text from any other stderr line:

   ```text
   kaisetsu.sh: warning: open is unavailable; response saved to <path>
   kaisetsu.sh: warning: could not open response file: <path>
   ```

2. Extract `<path>` into `RESPONSE_FILE` only when it matches `/tmp/kaisetsu.[A-Za-z0-9]{6}.html` and names a non-symlink regular file owned by the current user. If validation fails or more than one candidate is present, do not escalate; report the warning instead.
3. Run `/usr/bin/open "$RESPONSE_FILE"` once as a separate command using the host's narrowly scoped sandbox-escalation or approval mechanism. On Codex hosts exposing per-command permissions, use `sandbox_permissions: require_escalated` for this exact command. Treat this retry as part of the requested automatic display; do not wait for another user message, though the host may still require approval. Do not request a broader reusable rule when the host cannot constrain it to this validated artifact shape.
4. Escalate only that exact display command. Do not rerun or elevate the helper, `agy`, or the Gemini pass, and do not use `sudo`.
5. If scoped escalation is unavailable, denied, or the retry still returns non-zero, report the warning and saved path. The second pass remains successful.

The empty workspace is an **epistemic aid**. It reduces accidental repository grounding and encourages the second-pass reader to reconstruct from the packet. It does not prevent repository or external access and is not a security or isolation boundary. Treat packet-only reasoning as an instruction contract, not an enforced capability restriction. Normal Antigravity auth/configuration remains available except for the parent-session linkage variables listed above. Do not forward sensitive material merely because the working directory is empty.

Do not pass `--dangerously-skip-permissions` for the normal explanation pass.

### 4. Audit Gemini's reconstruction

Before presenting the result, compare it with the packet and primary explanation.

Check:

1. **Added facts** — Did Gemini introduce claims that are not grounded in the packet?
2. **Certainty creep** — Did an `[INFERENCE]` or `[UNKNOWN]` become an established fact?
3. **Lost mechanism** — Did compression remove the actual causal or technical mechanism and replace it with generic language such as "improves maintainability"?
4. **Valid gaps** — Did Gemini expose a real missing premise, unexplained term, unsupported leap, or unresolved decision boundary?
5. **Implementation learning** — Did it preserve the difference between the initial model and what implementation revealed?
6. **Architecture lint** — Treat misunderstanding as a diagnostic signal, not a design verdict. Consider explanation gaps, missing evidence, terminology or naming friction, abstraction or architecture issues, and Gemini's own misreading. Do not attribute reconstruction failure to the underlying design without additional evidence.
7. **Representation fidelity** — Did the chosen prose, table, tree, diff, code, flow, or small diagram clarify the actual technical structure without hiding substance or implying false certainty? Extra visual variety is not a success signal.

A reconstruction failure alone does not distinguish among those causes. Architecture lint only indicates that the underlying design may be worth additional investigation; it does not establish a design defect.

If Gemini is wrong, do not edit its text and still present the edited version as Gemini's reconstruction. Preserve the discrepancy and explain it separately.

### 5. Present the result

For ordinary chat, do not reproduce Gemini's full response. The saved `/tmp/kaisetsu.*.html` page, opened by the helper or the scoped retry when permitted, is the reader-facing copy. In chat, present only the primary agent's concise delta: material gaps, discrepancies, corrections, or supplementary technical insight found by comparing Gemini's raw semantic response with the packet. If there is no material delta, say so briefly. If display ultimately failed, also report the warning and saved path. Do not restate the full reconstruction as a summary.

A normal no-delta completion can be as short as:

```text
kaisetsu 完了。解説をブラウザで開きました。
重要な認識差・説明ギャップはありません。
```

For an explicit **感想戦**, preserve both viewpoints and compare:

- primary self-explanation,
- Gemini reconstruction,
- gaps Gemini identified,
- claims Gemini added or flattened,
- differences in conceptual organization,
- implementation learnings preserved or lost,
- whether explanation difficulty signals architecture/naming friction worth investigating,
- latency/token usage when relevant.

## Reader prompt contract

The helper instructs Gemini to act as a reader, not as a replacement implementer. The intended behavior is:

- Work only from the packet unless the user explicitly requests a repository-aware verification pass.
- Treat packet-only reasoning as an instruction contract, not an enforced capability restriction. Never claim that the empty workspace prevents repository or external access or guarantees packet-only grounding.
- Preserve distinctions among facts, decisions, inferences, and unknowns.
- Write natural, plain, direct Japanese.
- Preserve technical density and concrete mechanisms.
- Compress redundancy rather than substance.
- Choose the smallest representation that makes the technical mechanism clear. Prose is neither mandatory nor privileged.
- Match the representation to the content: concise prose for causal explanation; before/discovery/after for real changes in understanding; compact tables for meaningful comparisons; shallow trees for ownership; diff-shaped blocks for changes; focused code when code shape matters; and simple diagrams only when direction or space materially improves understanding.
- Prefer one strong representation over multiple redundant ones. Do not add visual structure for decoration, and prioritize reconstruction fidelity over appearance.
- Treat every representation as a reading cost. Use one primary representation by default, and add another only when it exposes a different material relationship. Never repeat one mechanism as prose, flow, and table.
- For one short causal chain, one boundary, or one concept without a real comparison matrix or changed understanding, concise prose is the minimum view; do not manufacture a diagram or table from the same sentences.
- Tables require a real multi-field comparison; flow/grid requires order, branching, ownership, or direction that prose would make materially harder to retain. Two concepts or two sequential steps alone do not justify boxes, and cards are not a substitute for paragraphs.
- Apply an admission gate: learning-flow requires a real before/discovery/after; comparison tables require at least two genuine alternatives/entities across at least two meaningful fields; trees require meaningful hierarchy; diff/code requires exact shape to carry meaning; flow/SVG requires non-trivial topology among at least three interacting nodes. Mere chronology, two serial stages, or a binary success/failure boundary stays prose.
- Prefer HTML/CSS layout, then `<pre>` tree/flow, then table/grid, and only then a small inline SVG. Do not use Mermaid or external resources.
- When an inline SVG is genuinely necessary, keep it small, use `role="img"`, provide an accessible name with at least `<title>` (plus `<desc>` when useful) and `aria-labelledby`, add a concise `<figcaption>`, and never encode a technical distinction by color alone.
- Preserve epistemic distinctions visually when they matter by using stable `data-epistemic` attributes, without mechanically labeling every sentence.
- When implementation learning exists, keep its before/discovery/after change visible; do not force that layout when no real change occurred.
- Avoid ceremonial introductions, generic praise, repeated conclusions, invented motives, and generic quality claims with no mechanism.
- Use original English technical terms when translation would reduce precision.
- Treat a gap as a gap rather than repairing it with a plausible story.
- Treat reconstruction failure as a diagnostic signal with multiple possible causes. Do not attribute it to the underlying design without additional evidence.

Expected Gemini output contract:

```html
<main>
  <header><h1>技術解説の題名</h1></header>
  <section><p>読者向け再構成</p></section>
  <section class="explanation-gaps" data-section="explanation-gaps">
    <h2>説明上の未解決点</h2>
    <p>material gaps、または未解決点がない旨</p>
  </section>
</main>
```

This is a schematic semantic fragment, not a fixed layout or a complete document. The helper owns the doctype, document root, metadata, base typography, responsive layout, common callout/table/code styles, light/dark colors, and restrictive content-security policy. Gemini must not emit Markdown fences, HTML comments, CSS, JavaScript, remote assets, or document boilerplate. The explanation-gaps section may be placed where it best supports the reconstruction, but its stable `data-section="explanation-gaps"` marker and non-empty content are mandatory so the primary agent can distinguish unresolved points in the raw response.

## Failure handling

- **`agy`, `jq`, `python3`, or the bundled renderer unavailable:** Report that the external pass could not run. The primary self-explanation remains valid output.
- **Gemini 3.8 Flash unavailable:** Fail loudly. Do not silently substitute another model family or version.
- **Authentication failure / non-zero exit / timeout:** Report the actual failure. Do not fabricate a Gemini response.
- **No terminal `result` event, non-`SUCCESS` status, or empty response:** Treat the pass as failed.
- **Invalid, incomplete, unsafe, or contract-breaking HTML fragment / renderer failure:** Treat the pass as failed. Do not publish or open a partial artifact; keep renderer diagnostics on stderr.
- **Initial `open` attempt returns non-zero after a successful response:** Keep the second pass successful and perform the single scoped display retry described above.
- **Scoped display retry unavailable, denied, or still non-zero:** Report a warning with the saved HTML path. Do not retry again or turn it into a second-pass failure.
- **Gemini materially changes technical meaning:** Preserve what Gemini wrote and separately identify the disagreement and packet evidence.

## Success criteria

The second pass earns its cost if it produces at least one of these:

- a substantially easier explanation to read without losing technical content,
- a better conceptual organization of the same evidence,
- a real gap in the primary explanation,
- a hidden assumption worth making explicit,
- a diagnostic signal that naming or the underlying design may warrant additional investigation,
- independent confirmation that a capable reader reconstructed the intended technical story correctly.

Polished Japanese alone is not success.

The final question is:

> Did the second reader preserve the work accurately, and did comparing the two explanations teach us anything?
