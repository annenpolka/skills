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

# Skip meta-writes
if [[ -n "$file_path" && "$file_path" == *"scratch/decision-forensics/"* ]]; then
  exit 0
fi

# Skip decision-forensics script calls
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$input" | jq -r '.tool_input.command // empty')
  if [[ "$command" == *"decision-forensics"* || "$command" == *".decision-forensics"* ]]; then
    exit 0
  fi
fi

PENDING="$PWD/scratch/decision-forensics/pending.json"
RECORDS_DIR="$PWD/scratch/decision-forensics/records"

# Only process if pending declaration exists
if [ ! -f "$PENDING" ]; then
  exit 0
fi

# Extract ID and expected_actions from pending record
id=$(jq -r '.id // "unknown"' "$PENDING")
expected=$(jq -r '.pre.expected_actions // 1' "$PENDING")

COUNTER_FILE="$PWD/scratch/decision-forensics/.action_count"

# Initialize or increment action counter
if [ -f "$COUNTER_FILE" ]; then
  current=$(cat "$COUNTER_FILE")
else
  current=0
fi
current=$((current + 1))
echo "$current" > "$COUNTER_FILE"

# Archive: copy on each action, move (consume) on final action
if [ "$current" -ge "$expected" ]; then
  mv "$PENDING" "$RECORDS_DIR/pre-${id}.json"
  rm -f "$COUNTER_FILE"
else
  cp "$PENDING" "$RECORDS_DIR/pre-${id}.json"
fi

# Count completed pre-records for auto-audit trigger
record_count=$(find "$RECORDS_DIR" -name 'pre-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')

# Build audit reminder if threshold reached (every 5 records)
audit_msg=""
if [ "$((record_count % 5))" -eq 0 ] && [ "$record_count" -gt 0 ]; then
  audit_msg="\\n\\n[AUTO-AUDIT] ${record_count}件のDecision Recordが蓄積されました。audit.shを実行して整合性を検証してください。"
fi

# Build remaining actions info
remaining_msg=""
if [ "$current" -lt "$expected" ]; then
  remaining_msg=" (残り$((expected - current))アクション)"
fi

# Prompt agent to create post-record
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse"
  },
  "systemMessage": "Decision Forensics [post-action${remaining_msg}]: 行動完了。以下を scratch/decision-forensics/records/post-${id}.json に記録してください:\\n\\n1. post.outcome: 実際の結果\\n2. post.counterfactuals: 棄却した全候補について反実仮想予測 (alternative, prediction, confidence 0-1)\\n3. post.drift: intentionと結果に乖離があれば報告 (declared_intention, actual_outcome, divergence, explanation)。なければnull${audit_msg}"
}
EOF
