#!/usr/bin/env bash
# scout.sh — Quick project statistics for calibrating investigation depth
# Usage: bash scout.sh <project-root>
# Output: JSON summary to stdout
#
# Compatible with bash 3.2+ (macOS default).
# Uses only POSIX tools + git (if available).

set -eu

PROJECT_ROOT="${1:-.}"

if [ ! -d "$PROJECT_ROOT" ]; then
  echo "Error: $PROJECT_ROOT is not a directory" >&2
  exit 1
fi

cd "$PROJECT_ROOT"

# --- Temp files for cached scans (cleaned up on exit) ---
file_list=$(mktemp)
manifest_list=$(mktemp)
unit_list=$(mktemp)
language_list=$(mktemp)
entrypoint_list=$(mktemp)
surface_root_list=$(mktemp)
trap 'rm -f "$file_list" "$manifest_list" "$unit_list" "$language_list" "$entrypoint_list" "$surface_root_list"' EXIT

# --- File listing (excludes common non-source directories) ---
find . \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/vendor/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/target/*' \
  -not -path '*/.venv/*' \
  -not -path '*/venv/*' \
  -not -name '*.lock' \
  -not -name 'package-lock.json' \
  -not -name 'yarn.lock' \
  -not -name 'pnpm-lock.yaml' \
  -not -name '*.min.js' \
  -not -name '*.min.css' \
  -type f 2>/dev/null > "$file_list"

total_files=$(wc -l < "$file_list" | tr -d ' ')

# --- LOC count for source files ---
source_extensions="ts tsx js jsx py rb go rs java kt swift cs cpp c h hpp php"
total_loc=0
for ext in $source_extensions; do
  count=$(find . \
    -not -path '*/.git/*' \
    -not -path '*/node_modules/*' \
    -not -path '*/vendor/*' \
    -not -path '*/__pycache__/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/.next/*' \
    -not -path '*/target/*' \
    -not -path '*/.venv/*' \
    -name "*.$ext" -type f -exec cat {} + 2>/dev/null | wc -l | tr -d ' ')
  count=${count:-0}
  total_loc=$(( total_loc + count ))
done

# --- Sort extensions by count, take top 10 ---
top_extensions=$(awk -F. '{if (NF>1) print $NF; else print "(no extension)"}' "$file_list" | sort | uniq -c | sort -rn | head -10)

# --- Directory structure (depth 2) ---
dir_tree=$(find . -maxdepth 2 -type d \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/vendor/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -name '.*' \
  2>/dev/null | sort | head -50)

# --- Detect manifests / investigation units / project type ---
find . -maxdepth 3 \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/vendor/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/target/*' \
  -not -path '*/.venv/*' \
  -not -path '*/venv/*' \
  \( -name 'package.json' -o -name 'Cargo.toml' -o -name 'go.mod' -o -name 'pyproject.toml' \
     -o -name 'setup.py' -o -name 'requirements.txt' -o -name 'Gemfile' -o -name 'pom.xml' \
     -o -name 'build.gradle' -o -name 'build.gradle.kts' -o -name '*.xcodeproj' \
     -o -name '*.xcworkspace' \) \
  2>/dev/null | sort > "$manifest_list"

root_manifest_count=0
while IFS= read -r manifest; do
  [ -n "$manifest" ] || continue

  rel="${manifest#./}"
  base=$(basename "$rel")
  kind="unknown"
  case "$base" in
    package.json) kind="node" ;;
    Cargo.toml) kind="rust" ;;
    go.mod) kind="go" ;;
    pyproject.toml|setup.py|requirements.txt) kind="python" ;;
    Gemfile) kind="ruby" ;;
    pom.xml|build.gradle|build.gradle.kts) kind="jvm" ;;
    *.xcodeproj|*.xcworkspace) kind="xcode" ;;
  esac

  printf '%s\n' "$kind" >> "$language_list"

  case "$rel" in
    */*) unit="./${rel%%/*}" ;;
    *)
      unit="."
      root_manifest_count=$(( root_manifest_count + 1 ))
      ;;
  esac

  printf '%s|%s|./%s\n' "$unit" "$kind" "$rel" >> "$unit_list"
done < "$manifest_list"

unit_count=$(cut -d'|' -f1 "$unit_list" | sed '/^$/d' | sort -u | wc -l | tr -d ' ')
language_count=$(sort -u "$language_list" | sed '/^$/d' | wc -l | tr -d ' ')

project_type="unknown"
if [ "$unit_count" -gt 1 ]; then
  if [ "$language_count" -gt 1 ]; then
    project_type="polyglot-monorepo"
  else
    project_type="monorepo"
  fi
elif [ "$root_manifest_count" -gt 1 ] && [ "$language_count" -gt 1 ]; then
  project_type="polyglot"
elif [ -s "$language_list" ]; then
  project_type=$(head -1 "$language_list")
fi

# --- Candidate entrypoints for flow tracing ---
awk '
  /(^|\/)(main|index|app|server|cli)\.(ts|tsx|js|jsx|py|rb|go|rs|java|kt|swift|cs|cpp|c|php)$/ { print; next }
  /(^|\/)__main__\.py$/ { print }
' "$file_list" | sort -u | head -20 > "$entrypoint_list"

# --- Surface roots for exhaustive coverage ---
: > "$surface_root_list"

if [ -s "$unit_list" ]; then
  cut -d'|' -f1 "$unit_list" | sed '/^$/d' | sort -u | while IFS= read -r unit; do
    [ -n "$unit" ] || continue
    printf 'unit-root|%s\n' "$unit" >> "$surface_root_list"
  done
fi

find . -maxdepth 2 -type d \
  -not -path '*/.git/*' \
  -not -path '*/node_modules/*' \
  -not -path '*/vendor/*' \
  -not -path '*/__pycache__/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -not -path '*/.next/*' \
  -not -path '*/target/*' \
  -not -path '*/.venv/*' \
  -not -path '*/venv/*' \
  \( -name 'src' -o -name 'app' -o -name 'lib' -o -name 'packages' -o -name 'services' \
     -o -name 'clients' -o -name 'server' -o -name 'backend' -o -name 'frontend' \
     -o -name 'cmd' -o -name 'internal' -o -name 'tests' -o -name 'test' \
     -o -name '__tests__' -o -name 'docs' -o -name 'doc' -o -name 'config' \
     -o -name 'configs' -o -name '.github' -o -name '.circleci' \) \
  2>/dev/null | sort | while IFS= read -r dir; do
    [ -n "$dir" ] || continue
    base=$(basename "$dir")
    surface="source"
    case "$base" in
      tests|test|__tests__) surface="tests" ;;
      docs|doc) surface="docs" ;;
      config|configs|.github|.circleci) surface="config-or-ci" ;;
      *) surface="source" ;;
    esac
    printf '%s|%s\n' "$surface" "$dir" >> "$surface_root_list"
  done

if [ ! -s "$surface_root_list" ]; then
  printf 'unit-root|.\n' > "$surface_root_list"
fi

sort -u "$surface_root_list" -o "$surface_root_list"

# --- Git info (if available) ---
git_info=""
if command -v git >/dev/null 2>&1 && [ -d ".git" ]; then
  # Get first commit without --reverse (avoids SIGPIPE on large repos)
  first_commit_hash=$(git rev-list --max-parents=0 HEAD 2>/dev/null | head -1)
  first_commit=""
  if [ -n "$first_commit_hash" ]; then
    first_commit=$(git log -1 --format='%ai' "$first_commit_hash" 2>/dev/null)
  fi
  first_commit=${first_commit:-unknown}
  last_commit=$(git log -1 --format='%ai' 2>/dev/null)
  last_commit=${last_commit:-unknown}
  commit_count=$(git rev-list --count HEAD 2>/dev/null)
  commit_count=${commit_count:-0}
  recent_commits=$(git log --since="3 months ago" --oneline 2>/dev/null | wc -l | tr -d ' ')
  recent_commits=${recent_commits:-0}
  contributors=$(git shortlog -sn HEAD 2>/dev/null | wc -l | tr -d ' ')
  contributors=${contributors:-0}
  git_info=$(cat <<GITEOF
  "git": {
    "first_commit": "$first_commit",
    "last_commit": "$last_commit",
    "total_commits": $commit_count,
    "recent_commits_3mo": $recent_commits,
    "contributors": $contributors
  },
GITEOF
)
fi

# --- Test file count ---
test_files=$(find . \
  -not -path '*/node_modules/*' \
  -not -path '*/vendor/*' \
  -not -path '*/.git/*' \
  \( -name '*.test.*' -o -name '*.spec.*' -o -name '*_test.*' -o -name 'test_*' -o -name '*Tests.swift' -o -name '*Test.kt' \) \
  -type f 2>/dev/null | wc -l | tr -d ' ')

# --- Config file count ---
config_files=$(find . -maxdepth 3 \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  \( -name '*.config.*' -o -name '*.rc' -o -name '.env*' -o -name '*.toml' \
     -o -name '*.yaml' -o -name '*.yml' -o -name 'Dockerfile*' -o -name 'Makefile' \) \
  -type f 2>/dev/null | wc -l | tr -d ' ')

# --- TODO/FIXME count ---
todo_count=$(grep -r --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
  --include='*.py' --include='*.go' --include='*.rs' --include='*.rb' --include='*.java' \
  --include='*.kt' --include='*.swift' \
  --include='*.cpp' --include='*.c' --include='*.h' \
  -E 'TODO|FIXME|HACK|XXX' . 2>/dev/null | wc -l | tr -d ' ')
todo_count=${todo_count:-0}

# --- Output JSON ---
cat <<EOF
{
  "project_root": "$(pwd)",
  "project_type": "$project_type",
  "total_files": $total_files,
  "total_source_loc": $total_loc,
  "test_files": $test_files,
  "config_files": $config_files,
  "todo_fixme_count": $todo_count,
  $git_info
  "top_extensions": [
$(echo "$top_extensions" | while read count ext; do
  echo "    {\"extension\": \"$ext\", \"count\": $count},"
done | sed '$ s/,$//')
  ],
  "candidate_entrypoints": [
$(sed 's/.*/    "&",/' "$entrypoint_list" | sed '$ s/,$//')
  ],
  "manifest_files": [
$(sed 's/.*/    "&",/' "$manifest_list" | sed '$ s/,$//')
  ],
  "investigation_units": [
$(sort -u "$unit_list" | while IFS='|' read -r unit kind manifest; do
  [ -n "$unit" ] || continue
  echo "    {\"path\": \"$unit\", \"kind\": \"$kind\", \"manifest\": \"$manifest\"},"
done | sed '$ s/,$//')
  ],
  "surface_roots": [
$(while IFS='|' read -r surface path; do
  [ -n "$surface" ] || continue
  echo "    {\"surface\": \"$surface\", \"path\": \"$path\"},"
done < "$surface_root_list" | sed '$ s/,$//')
  ],
  "ignored_boundaries": [
    "./.git",
    "./node_modules",
    "./vendor",
    "./__pycache__",
    "./dist",
    "./build",
    "./.next",
    "./target",
    "./.venv",
    "./venv"
  ],
  "size_category": "$(
    if [ "$total_loc" -lt 5000 ]; then echo "small"
    elif [ "$total_loc" -lt 50000 ]; then echo "medium"
    else echo "large"
    fi
  )",
  "directories_depth2": [
$(echo "$dir_tree" | while IFS= read -r dir; do
  echo "    \"$dir\","
done | sed '$ s/,$//')
  ]
}
EOF
