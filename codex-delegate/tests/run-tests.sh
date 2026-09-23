#!/usr/bin/env bash
# Tests for scripts/codex-delegate.sh against tests/fake-codex. Usage: bash tests/run-tests.sh
set -o pipefail
here=$(cd "$(dirname "$0")" && pwd -P)
helper="$here/../scripts/codex-delegate.sh"
root=$(mktemp -d /tmp/cdg-test.XXXXXX); root=$(cd "$root" && pwd -P)
reap() { for f in "$root"/run*/turn-*/descendants.txt; do [ -f "$f" ] && kill $(cat "$f") 2>/dev/null; done; }
trap 'reap; rm -rf "$root"' EXIT
mkdir -p "$root/bin" "$root/state" "$root/home"
cp "$here/fake-codex" "$root/bin/codex"; chmod +x "$root/bin/codex"
export PATH="$root/bin:$PATH" CODEX_HOME="$root/home" FAKE_STATE="$root/state"
pass=0 fail=0
ok() { pass=$((pass + 1)); echo "ok   - $1"; }
no() { fail=$((fail + 1)); echo "FAIL - $1"; [ -n "${2:-}" ] && echo "       $2"; }
check() { if eval "$2"; then ok "$1"; else no "$1" "$2"; fi; }
argv() { tr '\0' '\n' < "$root/state/last-argv"; }
newws() { mkdir -p "$1"; printf 'x = 1\n' > "$1/a.py"; }
echo brief > "$root/brief.txt"

# 1. first turn in a non-git workspace, run dir under /tmp
newws "$root/ws1"
bash "$helper" run --run-dir "$root/run1" --workspace "$root/ws1" --model gpt-test \
  --sandbox workspace-write --brief "$root/brief.txt" > "$root/out1" 2>&1; rc=$?
r1="$root/run1/turn-1/result.json"
check "run exits 0 on completed" '[ $rc -eq 0 ]'
check "status completed" '[ "$(jq -r .status "$r1")" = completed ]'
check "thread id recorded at run level" '[ -s "$root/run1/thread_id.txt" ]'
check "ignore-user-config added" 'argv | grep -qx -- --ignore-user-config'
check "skip-git-repo-check added for non-git" 'argv | grep -qx -- --skip-git-repo-check'
check "exclude_slash_tmp added for run dir under /tmp" 'argv | grep -qx "sandbox_workspace_write.exclude_slash_tmp=true"'
check "approval pinned to never" 'argv | grep -qx "approval_policy=\"never\""'
check "sandbox passed with -s" '[ "$(argv | grep -A1 -x -- -s | tail -1)" = workspace-write ]'
check "brief passed on stdin" '[ "$(cat "$root/state/last-stdin")" = brief ]'
check "warning captured, non-JSON line tolerated" '[ "$(jq -r ".warnings[0]" "$r1")" = "Skill descriptions were shortened" ]'
check "effective cwd matches workspace" '[ "$(jq -r ".mismatches | length" "$r1")" = 0 ]'
check "usage_turn equals total on first turn" '[ "$(jq -r .usage_turn.input_tokens "$r1")" = 1000 ]'

# 2. resume reuses stored settings
tid=$(cat "$root/run1/thread_id.txt")
bash "$helper" resume --run-dir "$root/run1" --brief "$root/brief.txt" > "$root/out2" 2>&1; rc=$?
r2="$root/run1/turn-2/result.json"
check "resume completed" '[ $rc -eq 0 ] && [ "$(jq -r .status "$r2")" = completed ]'
check "resume uses exec resume <thread>" '[ "$(argv | sed -n 2,3p | tr "\n" " ")" = "resume $tid " ]'
check "resume re-passes model" 'argv | grep -qx gpt-test'
check "resume passes sandbox_mode" 'argv | grep -qx "sandbox_mode=\"workspace-write\""'
check "resume re-passes stored flags" 'argv | grep -qx -- --skip-git-repo-check && argv | grep -qx -- --ignore-user-config'
check "resume has no -s" '! argv | grep -qx -- -s'
check "usage comes from the rollout record" '[ "$(jq -r .usage_turn.input_tokens "$r2")" = 1000 ] && [ "$(jq -r .usage_total.input_tokens "$r2")" = 2000 ] && [ "$(jq -r .usage_source "$r2")" = "rollout token_usage_record" ]'
check "thread id unchanged" '[ "$(cat "$root/run1/thread_id.txt")" = "$tid" ]'

check "commands listed in the result" '[ "$(jq -r ".commands | type" "$r2")" = array ]'
check "rollout tool calls listed for the turn only" '[ "$(jq -r ".tool_calls | length" "$r2")" = 1 ] && jq -r ".tool_calls[0].input" "$r2" | grep -q "sed -n"'
check "full tool calls and the limit are recorded" '[ -s "$root/run1/turn-2/tool_calls.jsonl" ] && [ "$(jq -r .limit_seconds "$r2")" = 1800 ]'
check "tool call truncation is flagged" '[ "$(jq -r ".tool_calls[0].truncated" "$r2")" = false ] && [ "$(jq -r ".tool_calls[0].input_length" "$r2")" -gt 0 ]'
dry=$(bash "$helper" resume --run-dir "$root/run1" --brief "$root/brief.txt" --dry-run 2>&1)
check "resume dry run has a single stdin marker" '[ "$(echo "$dry" | grep -o " - " | wc -l | tr -d " ")" = 1 ]'
bash "$helper" resume --run-dir "$root/run1" --brief "$root/brief.txt" > /dev/null 2>&1
check "resume dry run matches the executed command" '[ "${dry% < *}" = "$(cat "$root/run1/turn-3/command.txt")" ]'
bash "$helper" check --run-dir "$root/run1" > /dev/null 2>&1; rc=$?
check "check on a finished turn exits 0" '[ $rc -eq 0 ]'
bash "$helper" check --run-dir "$root/run1" --turn 1 > /dev/null 2>&1
check "re-checking an earlier turn keeps its own turn" '[ "$(jq -r .usage_total.input_tokens "$r1")" = 1000 ] && [ "$(jq -r ".tool_calls | length" "$r1")" = 1 ]'

# 3. startup error on a later resume keeps the recorded thread id
FAKE_MODE=startup bash "$helper" resume --run-dir "$root/run1" --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
r3="$root/run1/turn-4/result.json"
check "startup error exits nonzero" '[ $rc -ne 0 ]'
check "status startup_error" '[ "$(jq -r .status "$r3")" = startup_error ]'
check "run-level thread id survives" '[ "$(cat "$root/run1/thread_id.txt")" = "$tid" ]'

# 4. failed turn
newws "$root/ws4"
FAKE_MODE=fail bash "$helper" run --run-dir "$root/run4" --workspace "$root/ws4" --model m \
  --sandbox read-only --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "failed turn exits nonzero with status failed" '[ $rc -ne 0 ] && [ "$(jq -r .status "$root/run4/turn-1/result.json")" = failed ]'
check "failure message captured" 'jq -e ".failures | index(\"boom\")" "$root/run4/turn-1/result.json" >/dev/null'
check "read-only adds no tmp exclusion" '! argv | grep -q exclude_slash_tmp'

# 5. watchdog timeout records descendants
newws "$root/ws5"
FAKE_MODE=hang bash "$helper" run --run-dir "$root/run5" --workspace "$root/ws5" --model m \
  --sandbox read-only --brief "$root/brief.txt" --limit 2 > /dev/null 2>&1; rc=$?
r5="$root/run5/turn-1/result.json"
check "timeout gives status interrupted" '[ "$(jq -r .status "$r5")" = interrupted ] && [ "$(jq -r .timed_out "$r5")" = true ]'
check "descendants recorded" '[ -s "$root/run5/turn-1/descendants.txt" ]'
check "surviving child listed" '[ "$(jq -r ".leftover_pids | length" "$r5")" -ge 1 ]'
check "interrupted turn still reports its usage" '[ "$(jq -r .usage_turn.input_tokens "$r5")" = 1000 ]'
check "descendants record command lines" 'grep -q "sleep 300" "$root/run5/turn-1/descendants.txt"'
bash "$helper" reap --run-dir "$root/run5" > "$root/reap5" 2>&1; rc=$?
check "reap signals matching leftovers" '[ $rc -eq 0 ] && grep -q "^signaled" "$root/run5/turn-1/reap.log"'
check "leftovers gone after reap" '[ "$(jq -r ".leftover_pids | length" "$r5")" = 0 ]'
reap

# 6. settings mismatch and denial count
newws "$root/ws6"
FAKE_MODE=mismatch bash "$helper" run --run-dir "$root/run6" --workspace "$root/ws6" --model m \
  --sandbox read-only --brief "$root/brief.txt" > /dev/null 2>&1
check "sandbox mismatch detected" '[ "$(jq -r .status "$root/run6/turn-1/result.json")" = settings_mismatch ]'
newws "$root/ws7"
FAKE_MODE=denial bash "$helper" run --run-dir "$root/run7" --workspace "$root/ws7" --model m \
  --sandbox read-only --brief "$root/brief.txt" > /dev/null 2>&1
check "denial counted" '[ "$(jq -r .denial_count "$root/run7/turn-1/result.json")" = 1 ]'

# 7. refusals happen before any dispatch
rm -f "$root/state/last-argv"
bash "$helper" run --run-dir "$root/run8" --workspace "$root/ws7" --model m --sandbox read-only \
  --brief "$root/brief.txt" -- -c 'approval_policy="on-request"' > /dev/null 2>&1; rc=$?
check "approval override refused" '[ $rc -eq 2 ] && [ ! -e "$root/state/last-argv" ]'
bash "$helper" run --run-dir "$root/run8" --workspace "$root/nope" --model m --sandbox read-only \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "missing workspace refused" '[ $rc -eq 2 ] && [ ! -e "$root/state/last-argv" ]'
bash "$helper" run --run-dir "$root/ws7/run" --workspace "$root/ws7" --model m --sandbox read-only \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "run dir inside workspace refused" '[ $rc -eq 2 ] && [ ! -e "$root/ws7/run" ]'
bash "$helper" run --run-dir "$root/run8" --workspace "$root/ws7" --model m --sandbox danger-full-access \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "danger-full-access refused" '[ $rc -eq 2 ]'
bash "$helper" run --run-dir "$root/run1" --workspace "$root/ws1" --model m --sandbox read-only \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "reusing a run dir refused" '[ $rc -eq 2 ]'

# 8. git workspace, extra args, dry run
newws "$root/ws9"; git -C "$root/ws9" init -q
out=$(bash "$helper" run --run-dir "$root/run9" --workspace "$root/ws9" --model m --sandbox read-only \
  --brief "$root/brief.txt" --dry-run -- -c 'mcp_servers={}' 2>&1); rc=$?
check "dry run prints the command and writes nothing" '[ $rc -eq 0 ] && [ ! -e "$root/run9" ] && echo "$out" | grep -q "codex exec"'
check "git workspace has no skip-git-repo-check" '! echo "$out" | grep -q skip-git-repo-check'
check "extra args precede pinned approval" 'echo "$out" | grep -q "mcp_servers=.*approval_policy"'

# 9. stop
newws "$root/ws10"
FAKE_MODE=hang bash "$helper" run --run-dir "$root/run10" --workspace "$root/ws10" --model m \
  --sandbox read-only --brief "$root/brief.txt" > /dev/null 2>&1 &
bgpid=$!
for _ in 1 2 3 4 5 6 7 8 9 10; do [ -s "$root/run10/turn-1/launcher.pid" ] && break; sleep 0.5; done
sleep 1
bash "$helper" check --run-dir "$root/run10" > /dev/null 2>&1; rc=$?
check "check on a running turn exits 3" '[ $rc -eq 3 ]'
bash "$helper" stop --run-dir "$root/run10" > /dev/null 2>&1; rc=$?
wait $bgpid
check "stop signals the launcher and marks interrupted" '[ $rc -eq 0 ] && [ "$(jq -r .status "$root/run10/turn-1/result.json")" = interrupted ]'
reap

# 10. snapshot and compare
t="$root/target"; mkdir -p "$t/sub dir"; printf 'a\n' > "$t/sub dir/f 1.txt"; printf 'b\n' > "$t/g.txt"
bash "$helper" snapshot "$t" "$root/snap" > /dev/null 2>&1; rc=$?
check "snapshot created" '[ $rc -eq 0 ] && [ -s "$root/snap/paths.txt" ] && [ -f "$root/snap/copy/g.txt" ]'
bash "$helper" compare "$root/snap" "$t" > "$root/cmp0" 2>&1; rc=$?
check "identical target compares equal" '[ $rc -eq 0 ]'
printf 'A\n' > "$t/sub dir/f 1.txt"; chmod 600 "$t/g.txt"; mkdir "$t/empty"
bash "$helper" compare "$root/snap" "$t" > "$root/cmp1" 2>&1; rc=$?
check "changes detected" '[ $rc -eq 1 ]'
check "content diff shown for path with spaces" 'grep -q "^+A" "$root/cmp1"'
check "mode change detected" 'grep -q "g.txt" "$root/cmp1"'
check "empty directory detected" 'grep -q "d .* ./empty" "$root/cmp1"'
bash "$helper" snapshot "$t" "$t/snapdir" > /dev/null 2>&1; rc=$?
check "snapshot inside target refused" '[ $rc -eq 2 ] && [ ! -e "$t/snapdir" ]'
bash "$helper" snapshot "$t" "$root/new/run/baseline" > /dev/null 2>&1; rc=$?
check "snapshot creates missing parents" '[ $rc -eq 0 ] && [ -f "$root/new/run/baseline/paths.txt" ]'
bash "$helper" snapshot "$t" "$t/../target/x" > /dev/null 2>&1; rc=$?
check "dot-dot path into the target refused" '[ $rc -eq 2 ] && [ ! -e "$t/x" ]'
newws "$root/ws11"
bash "$helper" run --run-dir "$root/new/run" --workspace "$root/ws11" --model m --sandbox read-only \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "run accepts a run dir that already holds a baseline" '[ $rc -eq 0 ] && [ -f "$root/new/run/settings.json" ]'
bash "$helper" run --run-dir "$root/ws11/deep/run" --workspace "$root/ws11" --model m --sandbox read-only \
  --brief "$root/brief.txt" > /dev/null 2>&1; rc=$?
check "nested new run dir inside workspace refused" '[ $rc -eq 2 ] && [ ! -e "$root/ws11/deep" ]'

echo "passed $pass, failed $fail"
[ "$fail" -eq 0 ]
