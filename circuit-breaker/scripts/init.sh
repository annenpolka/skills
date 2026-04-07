#!/bin/bash
set -euo pipefail

BASE_DIR="$PWD/scratch/circuit-breaker"

mkdir -p "$BASE_DIR"

touch "$BASE_DIR/.active"

# Default config
if [ ! -f "$BASE_DIR/.config" ]; then
  cat > "$BASE_DIR/.config" << 'EOF'
{
  "window": 8,
  "oscillation_threshold": 3,
  "retry_threshold": 3,
  "spiral_threshold": 5
}
EOF
fi

echo "Circuit Breaker initialized."
echo "  Base directory: $BASE_DIR"
echo "  Config: $BASE_DIR/.config"
echo "  Active flag: $BASE_DIR/.active"
