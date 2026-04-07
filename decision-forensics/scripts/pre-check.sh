#!/bin/bash
set -euo pipefail

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name')

# Check if decision-forensics is active
ACTIVE_FLAG="$PWD/scratch/decision-forensics/.active"
if [ ! -f "$ACTIVE_FLAG" ]; then
  # Not active, passthrough
  exit 0
fi

# Get file path for Write/Edit tools
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Skip decision-forensics meta-writes (records, flags, etc.)
if [[ -n "$file_path" && "$file_path" == *"scratch/decision-forensics/"* ]]; then
  exit 0
fi

# Skip Bash commands related to decision-forensics scripts
if [[ "$tool_name" == "Bash" ]]; then
  command=$(echo "$input" | jq -r '.tool_input.command // empty')
  if [[ "$command" == *"decision-forensics"* || "$command" == *".decision-forensics"* ]]; then
    exit 0
  fi
fi

# Check for pending declaration
PENDING="$PWD/scratch/decision-forensics/pending.json"
if [ ! -f "$PENDING" ]; then
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "pre-declarationが見つかりません"
  },
  "systemMessage": "Decision Forensics [pre-check DENY]: pre-declarationが見つかりません。行動前に scratch/decision-forensics/pending.json を作成してください。\n\n必須フィールド:\n- id (UUID)\n- timestamp (ISO8601)\n- pre.intention (これから何をするか)\n- pre.chosen.description + pre.chosen.rationale (選んだ手法とその理由)\n- pre.rejected[] (最低1個。各にdescription + rationale)\n- pre.context (文脈・制約)"
}
EOF
  exit 0
fi

# Check JSON syntax first
if ! jq empty "$PENDING" 2>/dev/null; then
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "pending.jsonが不正なJSON"
  },
  "systemMessage": "Decision Forensics [pre-check DENY]: pending.jsonが不正なJSONです。正しいJSON形式で書き直してください。"
}
EOF
  exit 0
fi

# Validate pending.json structure
if ! jq -e '
  .pre.intention and
  .pre.context and
  .pre.chosen.description and
  .pre.chosen.rationale and
  (.pre.rejected | type == "array") and
  (.pre.rejected | length >= 1) and
  (.pre.rejected | all(.description and .rationale))
' "$PENDING" > /dev/null 2>&1; then
  cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "pending.jsonのバリデーションエラー"
  },
  "systemMessage": "Decision Forensics [pre-check DENY]: pending.jsonのバリデーションエラー。\n\n以下のフィールドが全て必要です:\n- pre.intention\n- pre.chosen.description + pre.chosen.rationale\n- pre.rejected (配列, 最低1要素, 各にdescription + rationale)\n- pre.context"
}
EOF
  exit 0
fi

# Declaration exists and valid — allow action
echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
