#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/decision-forensics"

mkdir -p "$BASE_DIR/records"
mkdir -p "$BASE_DIR/audits"

touch "$BASE_DIR/.active"

echo "Decision Forensics initialized."
echo "  Base directory: $BASE_DIR"
echo "  Records: $BASE_DIR/records/"
echo "  Audits: $BASE_DIR/audits/"
echo "  Active flag: $BASE_DIR/.active (remove to deactivate)"
