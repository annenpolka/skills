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

# === COMMIT GATE: every git commit requires retrospective ===

# Only gate on Bash with git commit
if [[ "$tool_name" != "Bash" ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

command=$(echo "$input" | jq -r '.tool_input.command // empty')
if [[ "$command" != *"git commit"* ]]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

# --- This is a git commit. Check for unretrospected actions ---

BASE_DIR="$PWD/scratch/decision-forensics"
LOG_FILE="$BASE_DIR/action-log.jsonl"
RETRO_DIR="$BASE_DIR/retrospectives"
LAST_RETRO_SEQ_FILE="$BASE_DIR/.last_retro_seq"

if [ ! -f "$LOG_FILE" ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

last_retro_seq=0
if [ -f "$LAST_RETRO_SEQ_FILE" ]; then
  last_retro_seq=$(cat "$LAST_RETRO_SEQ_FILE")
fi

total_actions=$(wc -l < "$LOG_FILE" | tr -d ' ')
unretrospected=$((total_actions - last_retro_seq))

if [ "$unretrospected" -le 0 ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
fi

# Unretrospected actions exist → deny commit until retro is written
existing_retros=$(find "$RETRO_DIR" -name 'retro-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')
retro_num=$((existing_retros + 1))
retro_id=$(printf "retro-%03d" "$retro_num")
start_seq=$((last_retro_seq + 1))

recent=$(tail -n "$unretrospected" "$LOG_FILE" | jq -r '"  #\(.seq) [\(.tool)] \(.input_summary[:60])"' 2>/dev/null | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' '|' | sed 's/|/\\n/g' || echo "  (actions ${start_seq}-${total_actions})")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "commit requires retrospective"
  },
  "systemMessage": "Decision Forensics [COMMIT GATE]: commit前にretrospectiveを書いてください。\\n\\nscratch/decision-forensics/retrospectives/${retro_id}.json を作成してください。\\n\\n対象アクション (#${start_seq}-${total_actions}, ${unretrospected}件):\\n${recent}\\n\\n各アクションについて:\\n1. what_happened: 何をしたか\\n2. alternatives[]: 選ばなかった道 (road_not_taken + counterfactual + confidence)\\n3. drift: 意図との乖離があればnull以外\\n\\n全体について:\\n4. pattern: 俯瞰して見えたパターンや傾向 (optional)\\n\\nretrospective作成後:\\necho ${total_actions} > scratch/decision-forensics/.last_retro_seq"
}
EOF
