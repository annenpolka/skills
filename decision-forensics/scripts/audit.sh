#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/decision-forensics"
RECORDS_DIR="$BASE_DIR/records"
AUDITS_DIR="$BASE_DIR/audits"

if [ ! -d "$RECORDS_DIR" ]; then
  echo '{"error": "Records directory not found. Run init.sh first."}'
  exit 1
fi

# Count records
pre_count=$(find "$RECORDS_DIR" -name 'pre-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')
post_count=$(find "$RECORDS_DIR" -name 'post-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')

# Find unpaired records
unpaired_pre=()
unpaired_post=()

for pre_file in "$RECORDS_DIR"/pre-*.json; do
  [ -f "$pre_file" ] || continue
  id=$(basename "$pre_file" | sed 's/^pre-//; s/\.json$//')
  if [ ! -f "$RECORDS_DIR/post-${id}.json" ]; then
    unpaired_pre+=("$id")
  fi
done

for post_file in "$RECORDS_DIR"/post-*.json; do
  [ -f "$post_file" ] || continue
  id=$(basename "$post_file" | sed 's/^post-//; s/\.json$//')
  if [ ! -f "$RECORDS_DIR/pre-${id}.json" ]; then
    unpaired_post+=("$id")
  fi
done

# Validate paired records
paired_count=0
validation_errors=()

for pre_file in "$RECORDS_DIR"/pre-*.json; do
  [ -f "$pre_file" ] || continue
  id=$(basename "$pre_file" | sed 's/^pre-//; s/\.json$//')
  post_file="$RECORDS_DIR/post-${id}.json"

  [ -f "$post_file" ] || continue
  paired_count=$((paired_count + 1))

  # Check pre-record structure
  if ! jq -e '.pre.intention and .pre.chosen and (.pre.rejected | length >= 1)' "$pre_file" > /dev/null 2>&1; then
    validation_errors+=("$id: pre-record missing required fields")
  fi

  # Check post-record structure
  if ! jq -e '.post.outcome' "$post_file" > /dev/null 2>&1; then
    validation_errors+=("$id: post-record missing outcome")
  fi

  # Check counterfactual count matches rejected count
  rejected_count=$(jq -r '.pre.rejected | length' "$pre_file" 2>/dev/null || echo "0")
  cf_count=$(jq -r '.post.counterfactuals | length' "$post_file" 2>/dev/null || echo "0")
  if [ "$rejected_count" != "$cf_count" ]; then
    validation_errors+=("$id: counterfactual count ($cf_count) != rejected count ($rejected_count)")
  fi
done

# Generate audit report
audit_timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
audit_file="$AUDITS_DIR/audit-$(date -u +"%Y%m%d-%H%M%S").json"

# Build JSON arrays for jq (handle empty arrays correctly)
if [ ${#unpaired_pre[@]} -eq 0 ]; then
  unpaired_pre_json='[]'
else
  unpaired_pre_json=$(printf '%s\n' "${unpaired_pre[@]}" | jq -R . | jq -s .)
fi

if [ ${#unpaired_post[@]} -eq 0 ]; then
  unpaired_post_json='[]'
else
  unpaired_post_json=$(printf '%s\n' "${unpaired_post[@]}" | jq -R . | jq -s .)
fi

if [ ${#validation_errors[@]} -eq 0 ]; then
  errors_json='[]'
else
  errors_json=$(printf '%s\n' "${validation_errors[@]}" | jq -R . | jq -s .)
fi

# Create audit report
jq -n \
  --arg timestamp "$audit_timestamp" \
  --argjson pre_count "$pre_count" \
  --argjson post_count "$post_count" \
  --argjson paired_count "$paired_count" \
  --argjson unpaired_pre "$unpaired_pre_json" \
  --argjson unpaired_post "$unpaired_post_json" \
  --argjson errors "$errors_json" \
  '{
    audit_timestamp: $timestamp,
    summary: {
      total_pre_records: $pre_count,
      total_post_records: $post_count,
      paired_records: $paired_count,
      unpaired_pre: $unpaired_pre,
      unpaired_post: $unpaired_post,
      completion_rate: (if $pre_count > 0 then (($paired_count / $pre_count * 100) | floor | tostring + "%") else "N/A" end)
    },
    validation_errors: $errors,
    verdict: (if (($errors | length) == 0) and (($unpaired_pre | length) == 0) then "PASS" else "ISSUES_FOUND" end)
  }' | tee "$audit_file"

echo ""
echo "Audit report saved to: $audit_file"
