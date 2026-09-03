#!/usr/bin/env bash
set -euo pipefail

MODEL="gemini-3.8-flash-medium"
TIMEOUT="10m"
AUDIENCE="Technically capable developer unfamiliar with the immediate work"
PACKET_FILE=""

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

On SUCCESS, the response is also saved to /tmp/kaisetsu.*.md and opened with
macOS open -t. Failure to open the file is reported as a warning only.
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

TMP_DIR="$(mktemp -d)"
PROMPT_FILE="$TMP_DIR/prompt.txt"
INPUT_FILE="$TMP_DIR/input.ndjson"
WORKSPACE_DIR="$TMP_DIR/workspace"
EVENTS_FILE="$TMP_DIR/events.ndjson"
STDERR_FILE="$TMP_DIR/agy.stderr"
PARSE_ERR_FILE="$TMP_DIR/jq.stderr"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cat > "$PROMPT_FILE" <<EOF_PROMPT
You are the independent second-pass reader of technical work completed by another agent.

Your job is NOT to redo the implementation, inspect the repository, invent a better design, or repair missing facts from general knowledge.
Your job is to reconstruct the supplied technical story faithfully for a human reader and then audit whether the supplied explanation supports its own conclusions.

Work only from the EXPLANATION_PACKET appended below.

Treat packet-only reasoning as an instruction contract, not an enforced capability restriction. The empty workspace reduces accidental repository grounding, but it does not prevent repository or external access and is not a security or isolation boundary. Never claim that it prevents access or guarantees packet-only grounding.

Rules:
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

AUDIENCE:
$AUDIENCE

Return exactly these two sections:

# 説明

Produce a coherent reader-facing reconstruction. Structure it by concepts, mechanism, and causality rather than mechanically repeating packet headings.

# 説明上の未解決点

List only material gaps, missing premises, ambiguities, or unsupported leaps. For each gap, state:
- what is unclear,
- why the packet does not establish it,
- what evidence or clarification would resolve it.

If there are no material gaps, say so briefly.

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

# macOS mktemp only replaces trailing Xs, so reserve a unique path first and
# then add the Markdown suffix.
RESPONSE_TMP_FILE="$(mktemp /tmp/kaisetsu.XXXXXX)"
RESPONSE_FILE="${RESPONSE_TMP_FILE}.md"
mv "$RESPONSE_TMP_FILE" "$RESPONSE_FILE"
printf '%s\n' "$RESPONSE" > "$RESPONSE_FILE"

if ! command -v open >/dev/null 2>&1; then
  printf 'kaisetsu.sh: warning: open is unavailable; response saved to %s\n' \
    "$RESPONSE_FILE" >&2
elif ! open -t "$RESPONSE_FILE" >/dev/null; then
  printf 'kaisetsu.sh: warning: could not open response file: %s\n' \
    "$RESPONSE_FILE" >&2
fi

# Emit the final result object so callers can inspect response, duration and usage.
printf '%s\n' "$RESULT_JSON"
