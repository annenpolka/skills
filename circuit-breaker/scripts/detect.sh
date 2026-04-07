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
CONFIG_FILE="$BASE_DIR/.config"

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

# Load config (window size, thresholds)
WINDOW=8
OSCILLATION_THRESHOLD=3
RETRY_THRESHOLD=3
SPIRAL_THRESHOLD=5
if [ -f "$CONFIG_FILE" ]; then
  WINDOW=$(jq -r '.window // 8' "$CONFIG_FILE")
  OSCILLATION_THRESHOLD=$(jq -r '.oscillation_threshold // 3' "$CONFIG_FILE")
  RETRY_THRESHOLD=$(jq -r '.retry_threshold // 3' "$CONFIG_FILE")
  SPIRAL_THRESHOLD=$(jq -r '.spiral_threshold // 5' "$CONFIG_FILE")
fi

# Build action summary
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

# Append to rolling buffer
jq -n -c \
  --arg ts "$timestamp" \
  --arg tool "$tool_name" \
  --arg target "$target" \
  --arg summary "$summary" \
  '{ts: $ts, tool: $tool, target: $target, summary: $summary}' >> "$BUFFER_FILE"

# Keep only last WINDOW*2 lines (headroom)
if [ -f "$BUFFER_FILE" ]; then
  line_count=$(wc -l < "$BUFFER_FILE" | tr -d ' ')
  if [ "$line_count" -gt $((WINDOW * 3)) ]; then
    tail -n "$((WINDOW * 2))" "$BUFFER_FILE" > "$BUFFER_FILE.tmp"
    mv "$BUFFER_FILE.tmp" "$BUFFER_FILE"
  fi
fi

# Read last WINDOW entries
recent=$(tail -n "$WINDOW" "$BUFFER_FILE")

# === PATTERN DETECTION ===

tripped=""

# 1. OSCILLATION: same file edited 3+ times in window
if [[ "$tool_name" == "Edit" || "$tool_name" == "Write" ]] && [[ -n "$target" ]]; then
  file_count=$(echo "$recent" | jq -r 'select(.tool == "Edit" or .tool == "Write") | .target' | grep -cF "$target" 2>/dev/null || echo "0")
  if [ "$file_count" -ge "$OSCILLATION_THRESHOLD" ]; then
    short_target=$(basename "$target")
    tripped="oscillation: ${short_target} (${file_count} edits in ${WINDOW} actions)"
  fi
fi

# 2. RETRY: same/similar bash command 3+ times in window
if [[ "$tool_name" == "Bash" ]] && [[ -z "$tripped" ]]; then
  # Normalize: take first 80 chars of command for comparison
  cmd_prefix=$(echo "$summary" | head -c 80)
  if [ -n "$cmd_prefix" ]; then
    # Count how many recent bash commands share the same prefix
    retry_count=$(echo "$recent" | jq -r 'select(.tool == "Bash") | .summary' | head -c 80 | sort | uniq -c | sort -rn | head -1 | awk '{print $1}')
    retry_count=${retry_count:-0}
    if [ "$retry_count" -ge "$RETRY_THRESHOLD" ]; then
      tripped="retry: similar command repeated ${retry_count}× in ${WINDOW} actions"
    fi
  fi
fi

# 3. SPIRAL: N+ search operations with no edit between them
if [[ -z "$tripped" ]]; then
  # Count consecutive search ops (Grep/Glob) from the end, not interrupted by Edit/Write
  consecutive_searches=0
  while IFS= read -r line; do
    t=$(echo "$line" | jq -r '.tool')
    if [[ "$t" == "Grep" || "$t" == "Glob" ]]; then
      consecutive_searches=$((consecutive_searches + 1))
    elif [[ "$t" == "Edit" || "$t" == "Write" ]]; then
      consecutive_searches=0
    fi
  done <<< "$recent"

  if [ "$consecutive_searches" -ge "$SPIRAL_THRESHOLD" ]; then
    tripped="spiral: ${consecutive_searches} searches without editing"
  fi
fi

# === OUTPUT ===

if [ -n "$tripped" ]; then
  # Record the trip
  echo "$timestamp $tripped" >> "$BASE_DIR/.trips.log"

  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse"
  },
  "systemMessage": "STOP.\\n${tripped}"
}
EOF
fi
