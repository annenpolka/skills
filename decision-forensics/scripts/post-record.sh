#!/bin/bash
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Check if active
ACTIVE_FLAG="$PWD/scratch/decision-forensics/.active"
if [ ! -f "$ACTIVE_FLAG" ]; then
  exit 0
fi

# Get file path for Write/Edit tools
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Skip meta-writes to scratch/decision-forensics/
if [[ -n "$file_path" && "$file_path" == *"scratch/decision-forensics/"* ]]; then
  exit 0
fi

# Skip decision-forensics script calls
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$input" | jq -r '.tool_input.command // empty')
  if [[ "$command" == *"decision-forensics"* || "$command" == *"scratch/decision-forensics"* ]]; then
    exit 0
  fi
fi

BASE_DIR="$PWD/scratch/decision-forensics"
LOG_FILE="$BASE_DIR/action-log.jsonl"

# Build input summary
case "$tool_name" in
  Bash)
    summary=$(echo "$input" | jq -r '.tool_input.command // "N/A"' | head -c 200)
    ;;
  Write)
    summary="Write → $(echo "$input" | jq -r '.tool_input.file_path // "N/A"')"
    ;;
  Edit)
    summary="Edit → $(echo "$input" | jq -r '.tool_input.file_path // "N/A"')"
    ;;
  *)
    summary="$tool_name"
    ;;
esac

# Compute next sequence number
if [ -f "$LOG_FILE" ]; then
  seq_num=$(wc -l < "$LOG_FILE" | tr -d ' ')
  seq_num=$((seq_num + 1))
else
  seq_num=1
fi

timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Append to action log
jq -n -c \
  --argjson seq "$seq_num" \
  --arg timestamp "$timestamp" \
  --arg tool "$tool_name" \
  --arg summary "$summary" \
  '{seq: $seq, timestamp: $timestamp, tool: $tool, input_summary: $summary}' >> "$LOG_FILE"

# Retrospective enforcement is handled by pre-check.sh (debt gate).
# post-record.sh only logs actions.
