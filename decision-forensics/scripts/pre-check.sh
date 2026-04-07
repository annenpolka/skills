#!/bin/bash
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Check if decision-forensics is active
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

# Skip Bash commands related to decision-forensics
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$input" | jq -r '.tool_input.command // empty')
  if [[ "$command" == *"decision-forensics"* || "$command" == *"scratch/decision-forensics"* ]]; then
    exit 0
  fi
fi

# === RETROSPECTIVE DEBT CHECK ===

BASE_DIR="$PWD/scratch/decision-forensics"
LOG_FILE="$BASE_DIR/action-log.jsonl"
RETRO_DIR="$BASE_DIR/retrospectives"
RETRO_INTERVAL_FILE="$BASE_DIR/.retro_interval"

# If no action log yet, no debt possible
if [ ! -f "$LOG_FILE" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

# Retrospective interval (default: 5)
RETRO_N=5
if [ -f "$RETRO_INTERVAL_FILE" ]; then
  RETRO_N=$(cat "$RETRO_INTERVAL_FILE")
fi

# Current action count
action_count=$(wc -l < "$LOG_FILE" | tr -d ' ')

# How many retrospectives should exist by now?
expected_retros=$((action_count / RETRO_N))

# How many actually exist?
actual_retros=$(find "$RETRO_DIR" -name 'retro-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')

# Debt = expected - actual
if [ "$expected_retros" -gt "$actual_retros" ]; then
  # Which retro is missing?
  missing_num=$((actual_retros + 1))
  retro_id=$(printf "retro-%03d" "$missing_num")
  start_seq=$(( (actual_retros * RETRO_N) + 1 ))
  end_seq=$((missing_num * RETRO_N))

  # Collect the actions that need retrospective (escaped for JSON)
  recent=$(sed -n "${start_seq},${end_seq}p" "$LOG_FILE" | jq -r '"  #\(.seq) [\(.tool)] \(.input_summary[:60])"' 2>/dev/null | tr '\n' '|' | sed 's/|/\\n/g' || echo "  (actions ${start_seq}-${end_seq})")

  cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "retrospective debt"
  },
  "systemMessage": "Decision Forensics [RETROSPECTIVE DEBT]: retro未払いのため行動をブロック。\\n\\nscratch/decision-forensics/retrospectives/${retro_id}.json を作成してください。\\n\\n対象アクション:\\n${recent}\\n\\n各アクションについて:\\n1. what_happened: 何をしたか\\n2. alternatives[]: 選ばなかった道 (road_not_taken + counterfactual + confidence)\\n3. drift: 意図との乖離があればnull以外\\n\\n全体について:\\n4. pattern: 俯瞰して見えたパターンや傾向 (optional)"
}
EOF
  exit 0
fi

# No debt — allow
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
