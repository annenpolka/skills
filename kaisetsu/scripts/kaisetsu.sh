#!/usr/bin/env bash
set -euo pipefail

MODEL="gemini-3.8-flash-medium"
TIMEOUT="10m"
AUDIENCE="Technically capable developer unfamiliar with the immediate work"
PACKET_FILE=""
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
RENDERER="$SCRIPT_DIR/render_html.py"

usage() {
  cat <<'USAGE'
Usage:
  kaisetsu.sh [--model MODEL] [--timeout DURATION] [--audience TEXT] PACKET_FILE

Defaults:
  --model    gemini-3.8-flash-medium
  --timeout  10m
  --audience Technically capable developer unfamiliar with the immediate work

The script prints one normalized JSON result object to stdout.
Read the explanation with: jq -r '.response'
Read usage with:       jq '.usage'

On SUCCESS, the semantic HTML response is wrapped in a self-contained shell,
saved to /tmp/kaisetsu.*.html, and opened through the macOS default file
association. Failure to open the file is reported as a warning only.
USAGE
}

fail() {
  printf 'kaisetsu.sh: %s\n' "$*" >&2
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)
      [[ $# -ge 2 ]] || fail "--model requires a value"
      MODEL="$2"
      shift 2
      ;;
    --timeout)
      [[ $# -ge 2 ]] || fail "--timeout requires a value"
      TIMEOUT="$2"
      shift 2
      ;;
    --audience)
      [[ $# -ge 2 ]] || fail "--audience requires a value"
      AUDIENCE="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      [[ $# -eq 1 ]] || fail "expected exactly one PACKET_FILE after --"
      PACKET_FILE="$1"
      shift
      ;;
    -*)
      fail "unknown option: $1"
      ;;
    *)
      [[ -z "$PACKET_FILE" ]] || fail "expected exactly one PACKET_FILE"
      PACKET_FILE="$1"
      shift
      ;;
  esac
done

[[ -n "$PACKET_FILE" ]] || { usage >&2; exit 2; }
[[ -f "$PACKET_FILE" ]] || fail "packet file not found: $PACKET_FILE"
command -v agy >/dev/null 2>&1 || fail "agy is not available on PATH"
command -v jq >/dev/null 2>&1 || fail "jq is not available on PATH"
command -v python3 >/dev/null 2>&1 || fail "python3 is not available on PATH"
[[ -f "$RENDERER" ]] || fail "HTML renderer not found: $RENDERER"

TMP_DIR="$(mktemp -d)"
PROMPT_FILE="$TMP_DIR/prompt.txt"
INPUT_FILE="$TMP_DIR/input.ndjson"
WORKSPACE_DIR="$TMP_DIR/workspace"
EVENTS_FILE="$TMP_DIR/events.ndjson"
STDERR_FILE="$TMP_DIR/agy.stderr"
PARSE_ERR_FILE="$TMP_DIR/jq.stderr"
FRAGMENT_FILE="$TMP_DIR/response.fragment.html"
DOCUMENT_FILE="$TMP_DIR/response.html"
RESPONSE_FILE=""
ARTIFACT_PUBLISHED=0
cleanup() {
  if [[ -n "$RESPONSE_FILE" && $ARTIFACT_PUBLISHED -ne 1 ]]; then
    rm -f -- "$RESPONSE_FILE"
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cat > "$PROMPT_FILE" <<EOF_PROMPT
You are the independent second-pass reader of technical work completed by another agent.

Your job is NOT to redo the implementation, inspect the repository, invent a better design, or repair missing facts from general knowledge.
Your job is to reconstruct the supplied technical story faithfully for a human reader and then audit whether the supplied explanation supports its own conclusions.

Work only from the EXPLANATION_PACKET appended below.

Treat packet-only reasoning as an instruction contract, not an enforced capability restriction. The empty workspace reduces accidental repository grounding, but it does not prevent repository or external access and is not a security or isolation boundary. Never claim that it prevents access or guarantees packet-only grounding.

Reconstruction rules:
1. Preserve epistemic distinctions. Never turn an inference or unknown into a fact.
2. Write natural, plain, direct Japanese.
3. Preserve technical density and concrete mechanisms. Compress redundancy, not substance.
4. Prefer explicit causal relationships and concrete nouns/verbs.
5. Use original English technical terms when Japanese translation would reduce precision.
6. Avoid ceremonial introductions, generic praise, repeated conclusions, invented motives, and vague quality claims such as "improves maintainability" unless the mechanism is stated.
7. If the packet contains a gap, preserve the gap. A fluent story is not automatically a true story.
8. Preserve implementation learnings: when the initial understanding changed after implementation or investigation, keep that before/after structure visible.
9. Do not judge global implementation correctness unless the packet contains enough evidence to support that judgment.
10. A reconstruction failure or explanation gap is only a diagnostic signal. Possible causes include an incomplete primary explanation, missing evidence, terminology or naming friction, abstraction or architecture issues, and your own misreading. Do not attribute it to the underlying design without additional evidence.

Presentation policy:

Choose the smallest representation that makes the technical mechanism clear.

Prose is not mandatory and is not privileged.

Use the representation that best matches the technical structure:

- concise prose for causal or conceptual explanation,
- before -> discovery -> after for changed understanding,
- compact tables for meaningful comparisons,
- shallow trees for ownership or file/module shape,
- diff-shaped blocks when the important fact is what changed,
- code blocks when code shape itself carries the explanation,
- simple diagrams when spatial or directional relationships materially improve understanding.

Do not add diagrams, tables, or visual structure merely for decoration.
Prefer one strong representation over several redundant ones.
Preserve technical density. Compress redundancy, not substance.
Technical reconstruction fidelity matters more than visual richness.

Every representation has a reading cost. Silently identify the dominant technical structure before writing, then use one primary representation by default. Add a second specialized representation only when it exposes a different material relationship that the first cannot show clearly. Never restate the same mechanism as prose, a flow, and a table.

When the whole story is one short causal chain, one boundary, or one concept with no meaningful comparison matrix or change in understanding, concise headings and prose are already the smallest representation. In that case, do not manufacture a diagram or table by splitting the same sentences into boxes or cells. This is not a preference for prose; it is the minimum-view rule.

Use a table only when readers must compare multiple options or entities across multiple meaningful fields. Use a flow/grid only when order, branching, ownership, or direction would be materially harder to retain in sentences; two adjacent concepts or two sequential steps do not by themselves justify boxes. Cards are not a substitute for paragraphs. If the full mechanism fits in roughly three short paragraphs without losing structure, use ordinary headings and prose plus the required gaps section, with no table, preformatted flow, SVG, learning-flow, cards, or flow class.

Specialized-representation admission gate (mandatory):

- learning-flow requires an actual initial understanding, observed discovery, and changed understanding or decision in IMPLEMENTATION_LEARNINGS;
- a comparison table requires at least two genuine alternatives or entities and at least two decision-relevant comparison fields;
- a shallow tree requires hierarchy or ownership shape that cannot be retained as a short sentence;
- a diff-shaped or focused code block requires exact changed/code shape to carry meaning that a prose paraphrase would lose;
- a flow diagram or SVG requires non-trivial topology such as branching, re-entry, concurrency, or ownership crossing among at least three interacting nodes.

Chronological order by itself, two serial stages, or a simple success/failure boundary does not pass the flow-diagram gate. When no gate passes, you MUST use prose as the primary representation and MUST NOT emit table, pre, SVG, learning-flow, cards, or flow markup. Lists remain acceptable only when the items are genuinely parallel and easier to scan than a sentence.

When implementation or investigation actually changed the working model, make the change itself easy to see. A compact before/discovery/after flow is preferred over burying it in long prose. Do not use that shape when the packet contains no real change in understanding.

Diagram priority is: HTML/CSS layout, then a simple tree or flow in <pre>, then a table or grid, and only then a small inline SVG when direction or space materially clarifies the mechanism. Do not emit Mermaid. Do not spend substantial markup on decorative SVG.

If a small inline SVG is genuinely necessary, wrap it in <figure>, give the <svg> role="img" and an accessible name through at least a <title> (plus <desc> when useful) with IDs and aria-labelledby, add a concise <figcaption>, and do not encode a technical distinction by color alone.

Epistemic presentation:

- Do not mechanically repeat [FACT], [DECISION], [INFERENCE], and [UNKNOWN] on every sentence.
- When a distinction must remain visible, put data-epistemic="fact", "decision", "inference", or "unknown" on a block-level element such as <article>, <aside>, or <div>. The shell will label and style it.
- Use uncertainty language in the content as well as visual treatment. Never let visual smoothness turn uncertainty into certainty.
- Keep explanation gaps visibly distinct from the reconstruction.

HTML fragment contract:

1. Return only a semantic HTML fragment. Do not use Markdown fences or HTML comments, and do not include <!doctype>, <html>, <head>, <meta>, <style>, <body>, <script>, external resources, or JavaScript.
2. The fragment must have exactly one top-level <main> element and all elements must have explicit matching closing tags. Use <br> and <hr> without closing tags; self-close SVG shape elements.
3. Include exactly one <section class="explanation-gaps" data-section="explanation-gaps">. It may appear wherever it best supports the explanation. If there are no material gaps, say so briefly inside it. Each real unresolved item should retain explicit uncertainty wording and may use data-epistemic="unknown".
4. The helper owns typography, layout, responsive behavior, colors, callouts, tables, code, and the page shell. Do not emit CSS or style attributes.
5. Useful shell classes include lede, kicker, callout, learning-flow, cards, flow, tree, diff, muted, and explanation-gaps. Apply learning-flow, cards, or flow only to a <section> or <div> that contains the relevant blocks; do not put those grid classes on <table>. Put tree or diff on <pre>. For a real learning transition, learning-flow may contain blocks with data-stage="before", "discovery", and "after".
6. Prefer semantic elements such as header, section, article, aside, h1-h4, p, ul/ol/li, dl/dt/dd, table/caption/thead/tbody/tr/th/td, pre/code, blockquote, figure/figcaption, details/summary, and small inline SVG primitives. Keep the vocabulary simple.
7. Escape literal <, >, and & characters inside code samples. Links, images, embedded media, forms, and remote assets are outside this artifact contract; render source paths and URLs as text or code instead.
8. The fragment must be complete and valid. Do not trail off, append commentary outside <main>, or return a full HTML document.

AUDIENCE:
$AUDIENCE

Within the HTML contract, produce:

- a coherent reader-facing reconstruction, organized by the representation that best exposes its concepts, mechanism, and causality rather than by mechanically repeating packet headings; and
- the material explanation gaps, missing premises, ambiguities, or unsupported leaps. For each real gap, make clear what is unclear, why the packet does not establish it, and what evidence or clarification would resolve it.

EOF_PROMPT

cat "$PACKET_FILE" >> "$PROMPT_FILE"

# Stage one compact NDJSON input event before invoking agy. This keeps jq out of
# the agy pipeline, so host-side input formatting failures cannot be mistaken for
# agy failures under pipefail.
jq -Rsc '{event:"user", message:{content:.}}' "$PROMPT_FILE" > "$INPUT_FILE"

# Keep workspace-visible files out of agy's cwd. This reduces accidental
# repository grounding but does not prevent repository or external access and
# is not a security or isolation boundary.
mkdir -p "$WORKSPACE_DIR"

set +e
(
  cd "$WORKSPACE_DIR" || exit 70

  # Avoid accidentally attaching the child to the active Antigravity agent/LS
  # session. Preserve unrelated ANTIGRAVITY_* configuration such as project or
  # provider settings rather than blanking the entire prefix.
  unset ANTIGRAVITY_AGENT ANTIGRAVITY_TRAJECTORY_ID ANTIGRAVITY_LS_ADDRESS

  agy \
    --input-format stream-json \
    --output-format stream-json \
    --model "$MODEL" \
    --print-timeout "$TIMEOUT" < "$INPUT_FILE"
) >"$EVENTS_FILE" 2>"$STDERR_FILE"
AGY_STATUS=$?
set -e

# Parse the terminal result even when agy exits non-zero: headless JSON modes can
# emit a structured ERROR result and then return a failing process status.
set +e
RESULT_JSON="$(jq -sc '[.[] | select(.event == "result") | .result] | last // empty' \
  "$EVENTS_FILE" 2>"$PARSE_ERR_FILE")"
PARSE_STATUS=$?
set -e

if [[ $PARSE_STATUS -ne 0 ]]; then
  [[ -s "$PARSE_ERR_FILE" ]] && cat "$PARSE_ERR_FILE" >&2
  [[ -s "$STDERR_FILE" ]] && cat "$STDERR_FILE" >&2
  fail "could not parse agy stream-json output"
fi

if [[ -n "$RESULT_JSON" ]]; then
  STATUS="$(jq -r '.status // empty' <<<"$RESULT_JSON")"
  if [[ "$STATUS" != "SUCCESS" ]]; then
    ERROR_TEXT="$(jq -r '.error // empty' <<<"$RESULT_JSON")"
    [[ -n "$ERROR_TEXT" ]] && printf '%s\n' "$ERROR_TEXT" >&2
    [[ -s "$STDERR_FILE" ]] && cat "$STDERR_FILE" >&2
    fail "agy result status was ${STATUS:-<missing>}, expected SUCCESS (exit code: $AGY_STATUS)"
  fi
fi

if [[ $AGY_STATUS -ne 0 ]]; then
  [[ -s "$STDERR_FILE" ]] && cat "$STDERR_FILE" >&2
  fail "agy exited with status $AGY_STATUS without a structured ERROR result"
fi

if [[ -z "$RESULT_JSON" ]]; then
  [[ -s "$STDERR_FILE" ]] && cat "$STDERR_FILE" >&2
  fail "agy produced no terminal result event"
fi

RESPONSE="$(jq -r '.response // empty' <<<"$RESULT_JSON")"
[[ -n "${RESPONSE//[[:space:]]/}" ]] || fail "agy returned SUCCESS with an empty response"

printf '%s\n' "$RESPONSE" > "$FRAGMENT_FILE"
if ! python3 "$RENDERER" "$FRAGMENT_FILE" > "$DOCUMENT_FILE"; then
  fail "agy returned SUCCESS but its response was not a valid kaisetsu HTML fragment"
fi
[[ -s "$DOCUMENT_FILE" ]] || fail "HTML renderer produced an empty document"
chmod 600 "$DOCUMENT_FILE"

# macOS mktemp only replaces trailing Xs, so reserve a unique path first and
# then add the HTML suffix. Publish only a fully validated, rendered document.
RESPONSE_TMP_FILE="$(mktemp /tmp/kaisetsu.XXXXXX)"
RESPONSE_FILE="${RESPONSE_TMP_FILE}.html"
mv "$RESPONSE_TMP_FILE" "$RESPONSE_FILE"
mv "$DOCUMENT_FILE" "$RESPONSE_FILE"
ARTIFACT_PUBLISHED=1

if ! command -v open >/dev/null 2>&1; then
  printf 'kaisetsu.sh: warning: open is unavailable; response saved to %s\n' \
    "$RESPONSE_FILE" >&2
elif ! open "$RESPONSE_FILE" >/dev/null; then
  printf 'kaisetsu.sh: warning: could not open response file: %s\n' \
    "$RESPONSE_FILE" >&2
fi

# Emit the final result object so callers can inspect response, duration and usage.
printf '%s\n' "$RESULT_JSON"
