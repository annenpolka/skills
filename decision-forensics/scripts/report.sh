#!/bin/bash
set -euo pipefail

RECORDS_DIR="$PWD/scratch/decision-forensics/records"

if [ ! -d "$RECORDS_DIR" ]; then
  echo "No records directory found. Run init.sh first."
  exit 1
fi

# Collect all pre-record IDs (sorted by filename)
pre_files=$(find "$RECORDS_DIR" -name 'pre-*.json' -type f 2>/dev/null | sort)

if [ -z "$pre_files" ]; then
  echo "No decision records found."
  exit 0
fi

echo "# Decision Forensics Report"
echo ""
echo "Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

record_num=0
while IFS= read -r pre_file; do
  [ -f "$pre_file" ] || continue
  record_num=$((record_num + 1))

  id=$(basename "$pre_file" | sed 's/^pre-//; s/\.json$//')
  post_file="$RECORDS_DIR/post-${id}.json"

  # Pre-record fields
  timestamp=$(jq -r '.timestamp // "N/A"' "$pre_file")
  intention=$(jq -r '.pre.intention // "N/A"' "$pre_file")
  chosen_desc=$(jq -r '.pre.chosen.description // "N/A"' "$pre_file")
  chosen_rationale=$(jq -r '.pre.chosen.rationale // "N/A"' "$pre_file")
  context=$(jq -r '.pre.context // "N/A"' "$pre_file")

  echo "---"
  echo ""
  echo "## #${record_num}: ${id}"
  echo "**Time**: ${timestamp}"
  echo ""
  echo "### Intention"
  echo "${intention}"
  echo ""
  echo "### Chosen"
  echo "- **What**: ${chosen_desc}"
  echo "- **Why**: ${chosen_rationale}"
  echo ""
  echo "### Rejected"

  # Iterate rejected alternatives
  rejected_count=$(jq -r '.pre.rejected | length' "$pre_file" 2>/dev/null || echo "0")
  for ((i=0; i<rejected_count; i++)); do
    rej_desc=$(jq -r ".pre.rejected[$i].description // \"N/A\"" "$pre_file")
    rej_rationale=$(jq -r ".pre.rejected[$i].rationale // \"N/A\"" "$pre_file")
    echo "- ~~${rej_desc}~~ — ${rej_rationale}"
  done
  echo ""

  echo "### Context"
  echo "${context}"
  echo ""

  # Post-record (if exists)
  if [ -f "$post_file" ]; then
    outcome=$(jq -r '.post.outcome // "N/A"' "$post_file")
    echo "### Outcome"
    echo "${outcome}"
    echo ""

    # Counterfactuals
    cf_count=$(jq -r '.post.counterfactuals | length' "$post_file" 2>/dev/null || echo "0")
    if [ "$cf_count" -gt 0 ]; then
      echo "### Counterfactuals"
      for ((i=0; i<cf_count; i++)); do
        cf_alt=$(jq -r ".post.counterfactuals[$i].alternative // \"N/A\"" "$post_file")
        cf_pred=$(jq -r ".post.counterfactuals[$i].prediction // \"N/A\"" "$post_file")
        cf_conf=$(jq -r ".post.counterfactuals[$i].confidence // \"N/A\"" "$post_file")
        echo "- **If**: ${cf_alt}"
        echo "  - **Then**: ${cf_pred} (confidence: ${cf_conf})"
      done
      echo ""
    fi

    # Drift
    drift=$(jq -r '.post.drift' "$post_file")
    if [ "$drift" != "null" ] && [ "$drift" != "" ]; then
      declared=$(jq -r '.post.drift.declared_intention // "N/A"' "$post_file")
      actual=$(jq -r '.post.drift.actual_outcome // "N/A"' "$post_file")
      divergence=$(jq -r '.post.drift.divergence // "N/A"' "$post_file")
      explanation=$(jq -r '.post.drift.explanation // "N/A"' "$post_file")
      echo "### ⚠ Drift Detected"
      echo "- **Declared**: ${declared}"
      echo "- **Actual**: ${actual}"
      echo "- **Divergence**: ${divergence}"
      echo "- **Explanation**: ${explanation}"
      echo ""
    else
      echo "### Drift: None"
      echo ""
    fi
  else
    echo "### Outcome: *(post-record pending)*"
    echo ""
  fi

done <<< "$pre_files"

# Summary
total_pre=$(echo "$pre_files" | wc -l | tr -d ' ')
total_post=$(find "$RECORDS_DIR" -name 'post-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')
echo "---"
echo ""
echo "## Summary"
echo "- **Total decisions**: ${total_pre}"
echo "- **Completed (with post-record)**: ${total_post}"
echo "- **Pending post-record**: $((total_pre - total_post))"
