#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/decision-forensics"
LOG_FILE="$BASE_DIR/action-log.jsonl"
RETRO_DIR="$BASE_DIR/retrospectives"
AUDITS_DIR="$BASE_DIR/audits"

if [ ! -f "$LOG_FILE" ]; then
  echo '{"error": "Action log not found. Run init.sh first."}'
  exit 1
fi

total_actions=$(wc -l < "$LOG_FILE" | tr -d ' ')
retro_files=$(find "$RETRO_DIR" -name 'retro-*.json' -type f 2>/dev/null | sort)
total_retros=$(echo "$retro_files" | grep -c . 2>/dev/null || echo "0")

# Collect all covered action seqs
covered_seqs=()
validation_errors=()

if [ -n "$retro_files" ]; then
  while IFS= read -r retro_file; do
    [ -f "$retro_file" ] || continue
    retro_id=$(basename "$retro_file" .json)

    # Check JSON validity
    if ! jq empty "$retro_file" 2>/dev/null; then
      validation_errors+=("$retro_id: invalid JSON")
      continue
    fi

    # Check required fields
    if ! jq -e '.entries and .covers' "$retro_file" > /dev/null 2>&1; then
      validation_errors+=("$retro_id: missing entries or covers field")
      continue
    fi

    # Check entries have required fields
    entry_count=$(jq -r '.entries | length' "$retro_file")
    for ((i=0; i<entry_count; i++)); do
      if ! jq -e ".entries[$i].what_happened and .entries[$i].alternatives" "$retro_file" > /dev/null 2>&1; then
        validation_errors+=("$retro_id: entry $i missing what_happened or alternatives")
      fi
    done

    # Collect covered sequences
    for seq in $(jq -r '.covers[]' "$retro_file" 2>/dev/null); do
      covered_seqs+=("$seq")
    done
  done <<< "$retro_files"
fi

# Find uncovered actions
uncovered=()
for ((s=1; s<=total_actions; s++)); do
  found=false
  for cs in "${covered_seqs[@]+"${covered_seqs[@]}"}"; do
    if [ "$cs" = "$s" ]; then
      found=true
      break
    fi
  done
  if [ "$found" = false ]; then
    uncovered+=("$s")
  fi
done

# Generate audit report
audit_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
audit_file="$AUDITS_DIR/audit-$(date -u +"%Y%m%d-%H%M%S").json"

if [ ${#uncovered[@]} -eq 0 ]; then
  uncovered_json='[]'
else
  uncovered_json=$(printf '%s\n' "${uncovered[@]}" | jq -R 'tonumber' | jq -s .)
fi

if [ ${#validation_errors[@]} -eq 0 ]; then
  errors_json='[]'
else
  errors_json=$(printf '%s\n' "${validation_errors[@]}" | jq -R . | jq -s .)
fi

covered_count=${#covered_seqs[@]}

jq -n \
  --arg timestamp "$audit_timestamp" \
  --argjson total_actions "$total_actions" \
  --argjson total_retros "$total_retros" \
  --argjson covered_count "$covered_count" \
  --argjson uncovered "$uncovered_json" \
  --argjson errors "$errors_json" \
  '{
    audit_timestamp: $timestamp,
    summary: {
      total_actions: $total_actions,
      total_retrospectives: $total_retros,
      actions_covered: $covered_count,
      actions_uncovered: $uncovered,
      coverage_rate: (if $total_actions > 0 then (($covered_count / $total_actions * 100) | floor | tostring + "%") else "N/A" end)
    },
    validation_errors: $errors,
    verdict: (if (($errors | length) == 0) and (($uncovered | length) == 0) then "PASS" else "ISSUES_FOUND" end)
  }' | tee "$audit_file"

echo ""
echo "Audit report saved to: $audit_file"
