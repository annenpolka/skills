#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/decision-forensics"
LOG_FILE="$BASE_DIR/action-log.jsonl"
RETRO_DIR="$BASE_DIR/retrospectives"

if [ ! -f "$LOG_FILE" ]; then
  echo "No action log found. Run init.sh first."
  exit 1
fi

total_actions=$(wc -l < "$LOG_FILE" | tr -d ' ')
total_retros=$(find "$RETRO_DIR" -name 'retro-*.json' -type f 2>/dev/null | wc -l | tr -d ' ')

echo "# Decision Forensics Report (Ghost Protocol)"
echo ""
echo "Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# Action log summary
echo "## Action Log"
echo ""
echo "| # | Time | Tool | Summary |"
echo "|---|------|------|---------|"

while IFS= read -r line; do
  seq=$(echo "$line" | jq -r '.seq')
  ts=$(echo "$line" | jq -r '.timestamp')
  tool=$(echo "$line" | jq -r '.tool')
  summary=$(echo "$line" | jq -r '.input_summary' | head -c 80)
  echo "| ${seq} | ${ts} | ${tool} | ${summary} |"
done < "$LOG_FILE"

echo ""

# Retrospectives
retro_files=$(find "$RETRO_DIR" -name 'retro-*.json' -type f 2>/dev/null | sort)

if [ -n "$retro_files" ]; then
  echo "## Retrospectives"
  echo ""

  while IFS= read -r retro_file; do
    [ -f "$retro_file" ] || continue
    retro_id=$(basename "$retro_file" .json)

    covers=$(jq -r '.covers | map(tostring) | join(", ")' "$retro_file" 2>/dev/null || echo "N/A")
    echo "---"
    echo ""
    echo "### ${retro_id} (actions: ${covers})"
    echo ""

    # Entries
    entry_count=$(jq -r '.entries | length' "$retro_file" 2>/dev/null || echo "0")
    for ((i=0; i<entry_count; i++)); do
      entry_seq=$(jq -r ".entries[$i].seq // \"?\"" "$retro_file")
      what=$(jq -r ".entries[$i].what_happened // \"N/A\"" "$retro_file")
      echo "**#${entry_seq}**: ${what}"

      # Alternatives
      alt_count=$(jq -r ".entries[$i].alternatives | length" "$retro_file" 2>/dev/null || echo "0")
      for ((j=0; j<alt_count; j++)); do
        road=$(jq -r ".entries[$i].alternatives[$j].road_not_taken // \"N/A\"" "$retro_file")
        cf=$(jq -r ".entries[$i].alternatives[$j].counterfactual // \"N/A\"" "$retro_file")
        conf=$(jq -r ".entries[$i].alternatives[$j].confidence // \"N/A\"" "$retro_file")
        echo "  - ~~${road}~~ → ${cf} (confidence: ${conf})"
      done

      # Drift
      drift=$(jq -r ".entries[$i].drift" "$retro_file")
      if [ "$drift" != "null" ] && [ "$drift" != "" ] && [ "$drift" != "N/A" ]; then
        echo "  - **DRIFT**: $(jq -r ".entries[$i].drift.divergence // \"N/A\"" "$retro_file")"
      fi
      echo ""
    done

    # Pattern
    pattern=$(jq -r '.pattern // empty' "$retro_file")
    if [ -n "$pattern" ] && [ "$pattern" != "null" ]; then
      echo "**Pattern**: ${pattern}"
      echo ""
    fi
  done
fi

# Summary
echo "---"
echo ""
echo "## Summary"
echo "- **Total actions logged**: ${total_actions}"
echo "- **Retrospectives completed**: ${total_retros}"
covered=0
if [ -n "$retro_files" ]; then
  while IFS= read -r rf; do
    n=$(jq -r '.covers | length' "$rf" 2>/dev/null || echo "0")
    covered=$((covered + n))
  done <<< "$retro_files"
fi
echo "- **Actions covered by retrospectives**: ${covered}/${total_actions}"
