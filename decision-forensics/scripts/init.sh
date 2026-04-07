#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/decision-forensics"

mkdir -p "$BASE_DIR/retrospectives"
mkdir -p "$BASE_DIR/audits"

touch "$BASE_DIR/.active"

# Default retrospective interval
if [ ! -f "$BASE_DIR/.retro_interval" ]; then
  echo "5" > "$BASE_DIR/.retro_interval"
fi

echo "Decision Forensics (Ghost Protocol) initialized."
echo "  Base directory: $BASE_DIR"
echo "  Action log: $BASE_DIR/action-log.jsonl"
echo "  Retrospectives: $BASE_DIR/retrospectives/"
echo "  Retro interval: $(cat "$BASE_DIR/.retro_interval") actions"
echo "  Active flag: $BASE_DIR/.active (remove to deactivate)"
