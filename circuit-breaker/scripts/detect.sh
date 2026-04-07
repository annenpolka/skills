#!/bin/bash
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Check if active
ACTIVE_FLAG="$PWD/scratch/circuit-breaker/.active"
if [ ! -f "$ACTIVE_FLAG" ]; then
  exit 0
fi

BASE_DIR="$PWD/scratch/circuit-breaker"
BUFFER_FILE="$BASE_DIR/.buffer.jsonl"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MAX_BUFFER=30

# Skip meta-writes
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
if [[ -n "$file_path" && "$file_path" == *"scratch/circuit-breaker/"* ]]; then
  exit 0
fi
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$input" | jq -r '.tool_input.command // empty')
  if [[ "$command" == *"circuit-breaker"* ]]; then
    exit 0
  fi
fi

# Build action entry
case "$tool_name" in
  Bash)
    summary=$(echo "$input" | jq -r '.tool_input.command // ""' | head -c 200)
    target="bash"
    ;;
  Write|Edit)
    target=$(echo "$input" | jq -r '.tool_input.file_path // ""')
    summary="$tool_name → $target"
    ;;
  Grep|Glob)
    target=$(echo "$input" | jq -r '.tool_input.pattern // ""')
    summary="$tool_name: $target"
    ;;
  *)
    target=""
    summary="$tool_name"
    ;;
esac

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Append to buffer
jq -n -c \
  --arg ts "$timestamp" \
  --arg tool "$tool_name" \
  --arg target "$target" \
  --arg summary "$summary" \
  '{ts: $ts, tool: $tool, target: $target, summary: $summary}' >> "$BUFFER_FILE"

# Truncate buffer if over limit
if [ -f "$BUFFER_FILE" ]; then
  line_count=$(wc -l < "$BUFFER_FILE" | tr -d ' ')
  if [ "$line_count" -gt "$MAX_BUFFER" ]; then
    tail -n "$MAX_BUFFER" "$BUFFER_FILE" > "$BUFFER_FILE.tmp"
    mv "$BUFFER_FILE.tmp" "$BUFFER_FILE"
  fi
fi

# Need at least 4 entries to detect patterns
line_count=$(wc -l < "$BUFFER_FILE" | tr -d ' ')
if [ "$line_count" -lt 4 ]; then
  exit 0
fi

# Run scoring engine
result=$(jq -s -f "$SCRIPT_DIR/score.jq" "$BUFFER_FILE" 2>/dev/null || echo '{"tripped":false}')

tripped=$(echo "$result" | jq -r '.tripped')

if [ "$tripped" = "true" ]; then
  pattern=$(echo "$result" | jq -r '.pattern')
  evidence=$(echo "$result" | jq -r '.evidence')

  # Log the trip
  echo "$timestamp $pattern ($evidence)" >> "$BASE_DIR/.trips.log"

  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse"
  },
  "systemMessage": "STOP.\\n${pattern}: ${evidence}"
}
EOF
fi
