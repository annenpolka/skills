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
RETRO_DIR="$BASE_DIR/retrospectives"
RETRO_INTERVAL_FILE="$BASE_DIR/.retro_interval"

# Retrospective interval (default: 5)
if [ -f "$RETRO_INTERVAL_FILE" ]; then
  RETRO_N=$(cat "$RETRO_INTERVAL_FILE")
else
  RETRO_N=5
fi

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

# Check if retrospective is due
if [ "$((seq_num % RETRO_N))" -eq 0 ]; then
  # Calculate which actions this retrospective covers
  start_seq=$((seq_num - RETRO_N + 1))
  retro_id=$(printf "retro-%03d" $((seq_num / RETRO_N)))

  # Collect recent actions for the message
  recent=$(tail -n "$RETRO_N" "$LOG_FILE" | jq -r '"  #\(.seq) [\(.tool)] \(.input_summary)"')

  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse"
  },
  "systemMessage": "Decision Forensics [RETROSPECTIVE DUE]: 直近${RETRO_N}件のアクションが完了しました。\\n\\n対象アクション:\\n${recent}\\n\\nscratch/decision-forensics/retrospectives/${retro_id}.json を作成してください:\\n\\n各アクションについて:\\n1. what_happened: 何をしたか\\n2. alternatives[]: 選ばなかった道 (road_not_taken + counterfactual + confidence)\\n3. drift: 意図との乖離があればnull以外\\n\\n全体について:\\n4. pattern: ${RETRO_N}件を俯瞰して見えたパターンや傾向 (optional)"
}
EOF
fi
