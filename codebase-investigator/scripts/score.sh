#!/usr/bin/env bash
# score.sh — Score investigation output for Evidence Protocol compliance (Tier 1)
#
# Usage:
#   bash score.sh <output-file>
#
# Output: JSON with per-criterion scores, total, pass/fail, and warnings
set -euo pipefail

MIN_FINDINGS=5

# --- Helpers ---

count_pattern() {
  local file="$1" pattern="$2"
  local n
  n="$(grep -cE "$pattern" "$file" 2>/dev/null)" || true
  echo "${n:-0}"
}

count_pattern_ic() {
  local file="$1" pattern="$2"
  local n
  n="$(grep -ciE "$pattern" "$file" 2>/dev/null)" || true
  echo "${n:-0}"
}

# --- Tier 1 Criteria ---

count_unique_file_citations() {
  # Match file:line patterns, deduplicate, count unique
  local file="$1"
  local n
  n="$(grep -oE '[a-zA-Z0-9_./-]+\.[a-z]{1,5}:[0-9]+' "$file" 2>/dev/null | sort -u | wc -l)" || true
  echo "${n:-0}" | tr -d ' '
}

count_file_paths() {
  # Match file path references in evidence lines
  local file="$1"
  count_pattern "$file" '(根拠ファイル|Evidence|根拠).*[a-zA-Z0-9_/-]+\.[a-z]{1,5}'
}

count_commands() {
  local file="$1"
  local glob_grep bash_cmd jp_cmd
  glob_grep=$(count_pattern_ic "$file" '(Glob|Grep):')
  bash_cmd=$(count_pattern_ic "$file" 'Bash:')
  jp_cmd=$(count_pattern_ic "$file" '実行コマンド')
  echo $(( glob_grep + bash_cmd + jp_cmd ))
}

count_findings() {
  local file="$1"
  local jp en
  jp=$(count_pattern "$file" '結論.*\[')
  en=$(count_pattern_ic "$file" '\*\*(Verified|Inference|Hypothesis|Unverified)\*\*')
  echo $(( jp + en ))
}

count_phases() {
  local file="$1"
  count_pattern "$file" '##\s*Phase\s*[1-6]'
}

count_substantive_uncertainties() {
  # Count uncertainty declarations, excluding empty ones (なし, N/A, none, —)
  local file="$1"
  local total empty
  total=$(count_pattern_ic "$file" '(未確認|Unconfirmed|未確認事項)')
  empty=$(count_pattern_ic "$file" '(未確認事項|未確認|Unconfirmed)[::]\s*(なし|N/A|none|—)$')
  local result=$(( total - empty ))
  if [ "$result" -lt 0 ]; then result=0; fi
  echo "$result"
}

count_substantive_counter_evidence() {
  # Count counter-evidence declarations, excluding empty ones
  local file="$1"
  local total empty
  total=$(count_pattern_ic "$file" '(反証|Counter-evidence|反証候補)')
  empty=$(count_pattern_ic "$file" '(反証候補|反証|Counter-evidence)[::]\s*(なし|N/A|none|—)$')
  local result=$(( total - empty ))
  if [ "$result" -lt 0 ]; then result=0; fi
  echo "$result"
}

# --- Scoring ---

score_tier1() {
  local file="$1"

  local file_citations file_paths commands findings phases uncertainties counter_evidence
  file_citations=$(count_unique_file_citations "$file")
  file_paths=$(count_file_paths "$file")
  commands=$(count_commands "$file")
  findings=$(count_findings "$file")
  phases=$(count_phases "$file")
  uncertainties=$(count_substantive_uncertainties "$file")
  counter_evidence=$(count_substantive_counter_evidence "$file")

  # Score calculation
  local s_file_path=0 s_line_num=0 s_command=0 s_uncertainty=0 s_counter=0

  # File path citations: ≥1 per finding → 3pts
  if [ "$findings" -gt 0 ] && [ "$file_paths" -ge "$findings" ]; then
    s_file_path=3
  elif [ "$file_paths" -gt 0 ]; then
    s_file_path=1
  fi

  # Line number citations (unique): ≥1 per finding → 2pts
  if [ "$findings" -gt 0 ] && [ "$file_citations" -ge "$findings" ]; then
    s_line_num=2
  elif [ "$file_citations" -gt 0 ]; then
    s_line_num=1
  fi

  # Command log: every finding has command → 2pts
  if [ "$findings" -gt 0 ] && [ "$commands" -ge "$findings" ]; then
    s_command=2
  elif [ "$commands" -gt 0 ]; then
    s_command=1
  fi

  # Uncertainty declared (substantive): ≥1 per phase → 2pts
  if [ "$phases" -gt 0 ] && [ "$uncertainties" -ge "$phases" ]; then
    s_uncertainty=2
  elif [ "$uncertainties" -gt 0 ]; then
    s_uncertainty=1
  fi

  # Counter-evidence (substantive): ≥1 per phase → 3pts
  if [ "$phases" -gt 0 ] && [ "$counter_evidence" -ge "$phases" ]; then
    s_counter=3
  elif [ "$counter_evidence" -gt 0 ]; then
    s_counter=1
  fi

  local total=$(( s_file_path + s_line_num + s_command + s_uncertainty + s_counter ))
  local pass="false"
  if [ "$total" -ge 10 ]; then
    pass="true"
  fi

  # Warnings
  local warnings=""
  if [ "$findings" -lt "$MIN_FINDINGS" ]; then
    warnings="${warnings:+$warnings, }\"too_few_findings: $findings (minimum $MIN_FINDINGS)\""
    pass="false"
  fi
  if [ "$phases" -lt 3 ]; then
    warnings="${warnings:+$warnings, }\"too_few_phases: $phases (minimum 3)\""
  fi
  if [ "$uncertainties" -eq 0 ]; then
    warnings="${warnings:+$warnings, }\"no_substantive_uncertainties\""
  fi
  if [ "$counter_evidence" -eq 0 ]; then
    warnings="${warnings:+$warnings, }\"no_substantive_counter_evidence\""
  fi

  cat <<EOF
{
  "raw": {
    "unique_file_citations": $file_citations,
    "file_paths": $file_paths,
    "commands": $commands,
    "findings": $findings,
    "phases": $phases,
    "substantive_uncertainties": $uncertainties,
    "substantive_counter_evidence": $counter_evidence
  },
  "scores": {
    "file_path_citation": $s_file_path,
    "line_number_citation": $s_line_num,
    "command_log": $s_command,
    "uncertainty_declared": $s_uncertainty,
    "counter_evidence_attempted": $s_counter
  },
  "tier1_total": $total,
  "tier1_max": 12,
  "pass": $pass,
  "warnings": [$warnings]
}
EOF
}

# --- Main ---

main() {
  if [ $# -lt 1 ]; then
    echo "Usage: score.sh <output-file>" >&2
    exit 1
  fi

  if [ ! -f "$1" ]; then
    echo "Error: File not found: $1" >&2
    exit 1
  fi
  score_tier1 "$1"
}

main "$@"
