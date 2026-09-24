#!/usr/bin/env bash
# codex-delegate helper: snapshot/compare a target, run or resume `codex exec` with pinned
# settings, and write a structured result for each turn. Requires bash 3.2+, jq, and the
# Codex CLI. See ../references/helper.md for the contract.
set -eo pipefail

PROG=$(basename "$0")
SCHEMA=codex-delegate.result.v1

# Git Bash, MSYS2, and Cygwin on Windows. A native jq.exe there writes CRLF, which leaks "\r" into
# $(...) and `read`, unless it gets --binary; a jq that rejects the flag is left as it is.
IS_WIN=0
case "$(uname -s 2>/dev/null)" in MINGW*|MSYS*|CYGWIN*) IS_WIN=1 ;; esac
JQ_FLAGS=()
[ "$IS_WIN" = 1 ] && command jq -b -n 1 >/dev/null 2>&1 && JQ_FLAGS=(-b)
jq() { command jq ${JQ_FLAGS[@]+"${JQ_FLAGS[@]}"} "$@"; }

die() { echo "$PROG: $*" >&2; exit 2; }
usage() {
  cat <<'EOF'
usage:
  codex-delegate.sh snapshot <target-dir> <new-snapshot-dir>
  codex-delegate.sh compare  <snapshot-dir> <target-dir|snapshot-dir>
  codex-delegate.sh run      --run-dir DIR --workspace DIR --model MODEL
                             --sandbox read-only|workspace-write --brief FILE
                             [--limit SECONDS] [--effort LEVEL] [--keep-user-config]
                             [--dry-run] [-- EXTRA_CODEX_ARGS...]
  codex-delegate.sh resume   --run-dir DIR --brief FILE [--limit SECONDS] [--dry-run]
  codex-delegate.sh check    --run-dir DIR [--turn N]
  codex-delegate.sh stop     --run-dir DIR
  codex-delegate.sh reap     --run-dir DIR [--turn N]
EOF
}

canon_dir() { (cd "$1" 2>/dev/null && pwd -P); }
canon_new() {  # canonical form of a path that may not exist yet: resolve its nearest existing ancestor
  local p=$1 rest="" d
  case "$p" in /*) ;; *) p="$PWD/$p" ;; esac
  while [ ! -d "$p" ]; do
    [ -e "$p" ] && return 1
    rest="/$(basename "$p")$rest"; p=$(dirname "$p")
  done
  d=$(canon_dir "$p") || return 1
  case "$rest" in */../*|*/./*|*/..|*/.) return 1 ;; esac
  printf '%s%s\n' "${d%/}" "$rest"
}
under() { case "$1/" in "$2"/*) return 0 ;; *) return 1 ;; esac; }
thread_of() { jq -rR 'fromjson? | select(.type=="thread.started") | .thread_id' "$1" 2>/dev/null | head -1; }

# ---------------------------------------------------------------- snapshot / compare
list_tree() {  # $1 = directory; prints sorted "TYPE MODE ./path" lines
  local t; t=$(mktemp -d)
  (cd "$1" && {
    find . -mindepth 1 -type d -exec sh -c 'for p; do echo "d $p"; done' _ {} +
    find . -mindepth 1 -type f -exec sh -c 'for p; do echo "f $p"; done' _ {} +
    find . -mindepth 1 -type l -exec sh -c 'for p; do echo "l $p"; done' _ {} +
    find . -mindepth 1 ! -type d ! -type f ! -type l -exec sh -c 'for p; do echo "o $p"; done' _ {} +
  } > "$t/types"
  find . -mindepth 1 -exec sh -c '
      if stat -c %a / >/dev/null 2>&1; then stat -c "%a %n" "$@"; else stat -f "%Lp %N" "$@"; fi' _ {} + \
    > "$t/modes")
  awk 'NR==FNR { i=index($0," "); mode[substr($0,i+1)]=substr($0,1,i-1); next }
       { i=index($0," "); p=substr($0,i+1); print substr($0,1,i-1), mode[p], p }' "$t/modes" "$t/types" \
    | LC_ALL=C sort -k3
  rm -rf "$t"
}
sum_tree() {  # $1 = directory; prints sorted "HASH  ./path" for regular files
  # sed: Git Bash's sha256sum marks binary mode as "HASH *./path"
  (cd "$1" && find . -type f -exec sh -c \
    'if command -v sha256sum >/dev/null 2>&1; then sha256sum "$@"; else shasum -a 256 "$@"; fi' _ {} + \
    | sed -E 's/^([0-9a-f]+) \*/\1  /' | LC_ALL=C sort -k2)
}
cmd_snapshot() {
  [ $# -eq 2 ] || { usage >&2; exit 2; }
  local target out; target=$(canon_dir "$1") || die "target is not a directory: $1"
  [ ! -e "$2" ] || die "snapshot directory already exists: $2"
  out=$(canon_new "$2") || die "cannot resolve the snapshot directory: $2"
  under "$out" "$target" && die "snapshot directory must be outside the target"
  mkdir -p "$(dirname "$out")" && mkdir "$out" && chmod 700 "$out"
  echo "$target" > "$out/target.txt"
  list_tree "$target" > "$out/paths.txt"
  sum_tree "$target" > "$out/sha256.txt"
  mkdir "$out/copy"
  (cd "$target" && tar cf - --exclude=.git .) | (cd "$out/copy" && tar xpf -)
  echo "snapshot: $out ($(wc -l < "$out/paths.txt" | tr -d ' ') paths)"
}
cmd_compare() {
  [ $# -eq 2 ] || { usage >&2; exit 2; }
  local a b bpaths bsums bcopy tmp rc=0
  a=$(canon_dir "$1") || die "not a directory: $1"; [ -f "$a/paths.txt" ] || die "not a snapshot: $1"
  b=$(canon_dir "$2") || die "not a directory: $2"
  tmp=$(mktemp -d)
  if [ -f "$b/paths.txt" ] && [ -d "$b/copy" ]; then
    bpaths=$b/paths.txt; bsums=$b/sha256.txt; bcopy=$b/copy
  else
    list_tree "$b" > "$tmp/paths.txt"; sum_tree "$b" > "$tmp/sha256.txt"
    bpaths=$tmp/paths.txt; bsums=$tmp/sha256.txt; bcopy=$b
  fi
  if ! diff "$a/paths.txt" "$bpaths" > "$tmp/paths.diff"; then
    rc=1; echo "== paths added (>), removed (<), or changed type/mode"; grep '^[<>]' "$tmp/paths.diff"
  fi
  if ! diff "$a/sha256.txt" "$bsums" > "$tmp/sums.diff"; then
    rc=1; echo "== file contents changed"
    grep '^[<>]' "$tmp/sums.diff" | sed -E 's/^[<>] [0-9a-f]+  //' | LC_ALL=C sort -u > "$tmp/changed"
    cat "$tmp/changed"
    while IFS= read -r p; do
      case "$p" in ./.git/*|./.git) continue ;; esac
      p=${p#./}
      [ -f "$a/copy/$p" ] && [ -f "$bcopy/$p" ] || continue
      echo "== diff $p"; diff -u "$a/copy/$p" "$bcopy/$p" || true
    done < "$tmp/changed"
  fi
  rm -rf "$tmp"
  [ $rc -eq 0 ] && echo "identical: paths, types, modes, and file contents"
  return $rc
}

# ---------------------------------------------------------------- run / resume / check
# Processes. POSIX: pgrep and ps. On Windows, MSYS/Cygwin processes come from /proc, and native
# Windows processes (codex.exe and the commands it starts) from the Win32 process tree, recorded
# as "w<WINPID>". A signal to the MSYS launcher does not reach them, so they end with taskkill.
children() {
  if command -v pgrep >/dev/null 2>&1; then pgrep -P "$1" 2>/dev/null || true
  elif [ -r "/proc/$1/ppid" ]; then
    local d pp; for d in /proc/[0-9]*; do
      { read -r pp < "$d/ppid"; } 2>/dev/null || continue
      [ "$pp" = "$1" ] && echo "${d#/proc/}"
    done
  fi
  return 0
}
descendants() { local c; for c in $(children "$1"); do echo "$c"; descendants "$c"; done; }
proc_cmd() {  # current command line of a PID; empty when it is gone
  if [ "$IS_WIN" = 1 ]; then
    [ -r "/proc/$1/cmdline" ] && tr '\0' ' ' < "/proc/$1/cmdline" 2>/dev/null | sed 's/ $//'
  else ps -o command= -p "$1" 2>/dev/null; fi
  return 0
}
win_procs() {  # every Windows process as "WINPID<TAB>PARENT<TAB>CREATED<TAB>COMMANDLINE"
  MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' powershell.exe -NoProfile -NonInteractive -Command \
    '[Console]::OutputEncoding = [Text.Encoding]::UTF8; Get-CimInstance Win32_Process | ForEach-Object {
       $c = if ($_.CreationDate) { $_.CreationDate.ToFileTimeUtc() } else { 0 }
       "{0}`t{1}`t{2}`t{3}" -f $_.ProcessId, $_.ParentProcessId, $c, "$($_.CommandLine)".Trim() }' 2>/dev/null \
    | tr -d '\r'
}
win_tree() {  # $1 = root WINPIDs, $2 = WINPIDs to leave out; prints "WINPID COMMANDLINE" per descendant
  win_procs | awk -F '\t' -v roots="$1" -v skip="$2" '
    { p = $1; par[p] = $2; st[p] = $3 + 0; cmd[p] = substr($0, length($1) + length($2) + length($3) + 4); ord[n++] = p }
    END {
      k = split(roots, r, " "); for (i = 1; i <= k; i++) { keep[r[i]] = 1; out[r[i]] = 1 }
      k = split(skip, s, " "); for (i = 1; i <= k; i++) out[s[i]] = 1
      do { ch = 0
        for (i = 0; i < n; i++) { p = ord[i]; q = par[p]   # a reused parent PID is newer than the child
          if (!(p in keep) && (q in keep) && p != q && (q in st) && st[p] >= st[q]) { keep[p] = 1; ch = 1 } }
      } while (ch)
      for (i = 0; i < n; i++) { p = ord[i]; if ((p in keep) && !(p in out)) print p, cmd[p] }
    }'
}
record_descendants() {  # $1 = pid, $2 = file; writes "PID COMMAND" lines ("w<WINPID> COMMAND" for native Windows)
  local p w list wins=""
  list=$(descendants "$1")
  { for p in $list; do printf '%s %s\n' "$p" "$(proc_cmd "$p")"; done
    if [ "$IS_WIN" = 1 ]; then
      for p in "$1" $list; do w=$(cat "/proc/$p/winpid" 2>/dev/null) && wins="$wins $w"; done
      [ -z "$wins" ] || win_tree "$wins" "$wins" | sed 's/^/w/'
    fi
  } > "$2"
}
terminate_launcher() {  # $1 = launcher pid. On Windows also ends its Win32 process tree
  local w
  if [ "$IS_WIN" = 1 ] && w=$(cat "/proc/$1/winpid" 2>/dev/null); then
    MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' taskkill /T /F /PID "$w" >/dev/null 2>&1 || true
  fi
  kill -TERM "$1" 2>/dev/null || true
}
leftovers() {  # $1 = descendants file; prints each recorded ID that is still alive (by PID)
  local p _ wins=""
  grep -q '^w' "$1" && wins=$(win_procs | cut -f1)
  while read -r p _; do
    [ -n "$p" ] || continue
    case "$p" in
      w*) printf '%s\n' "$wins" | grep -qx "${p#w}" && echo "$p" ;;
      *) kill -0 "$p" 2>/dev/null && echo "$p" ;;
    esac
  done < "$1"
  return 0
}
latest_turn() { local n=0; while [ -d "$1/turn-$((n + 1))" ]; do n=$((n + 1)); done; echo $n; }
rollout_for() {
  [ -n "$1" ] || return 0
  find "${CODEX_HOME:-$HOME/.codex}/sessions" -name "rollout-*-$1.jsonl" 2>/dev/null | head -1
}

check_turn() {  # $1 = run dir, $2 = turn number; writes turn-N/result.json and prints status
  local rd=$1 n=$2 td="$1/turn-$2" settings="$1/settings.json"
  local code tid rollout ctx=null denials=null prev=null alive="[]" tools="[]" usagerec=null turnid
  [ -d "$td" ] || die "no such turn: $td"
  code=$(cat "$td/exit_code.txt" 2>/dev/null || echo null)
  tid=$(thread_of "$td/events.jsonl")
  rollout=$(rollout_for "$tid")
  if [ -n "$rollout" ]; then
    if [ -s "$td/turn_id.txt" ]; then turnid=$(cat "$td/turn_id.txt")
    else
      local before; before=$(cat "$td/turn_contexts_before.txt" 2>/dev/null || echo 0)
      turnid=$(jq -r 'select(.type=="turn_context") | .payload.turn_id // empty' "$rollout" | sed -n "$((before + 1))p")
      [ -n "$turnid" ] && echo "$turnid" > "$td/turn_id.txt"
    fi
    if [ -n "$turnid" ]; then
      jq -nc --arg t "$turnid" 'foreach inputs as $l (false;
          if $l.type == "turn_context" then ($l.payload.turn_id == $t) else . end;
          if . then $l else empty end)' "$rollout" > "$td/.segment.jsonl"
    else : > "$td/.segment.jsonl"; fi
    ctx=$(jq -c 'select(.type=="turn_context") | .payload | {cwd, model, effort, approval_policy,
      approvals_reviewer, sandbox_policy}' "$td/.segment.jsonl" | head -1)
    [ -n "$ctx" ] || ctx=null
    usagerec=$(jq -c 'select(.type=="token_usage_record")
        | {turn: .payload.turn_token_usage, thread: .payload.thread_token_usage}' "$td/.segment.jsonl" | tail -1)
    [ -n "$usagerec" ] || usagerec=null
    jq -c 'select(.type=="response_item" and ((.payload.type // "") | test("call$"))) | .payload' \
      "$td/.segment.jsonl" > "$td/tool_calls.jsonl"
    tools=$(jq -c 'select(.type=="response_item" and ((.payload.type // "") | test("call$")))
               | .payload | ((.input // .arguments // .action // "") | tostring) as $in
               | {type, name, input: $in[0:400], input_length: ($in | length), truncated: (($in | length) > 400)}' \
      "$td/.segment.jsonl" | jq -sc '.')
    denials=$(jq -c 'select(.type=="response_item" and ((.payload.type // "") | test("call")))' "$td/.segment.jsonl" \
      | grep -cE 'operation not permitted|Permission denied|Read-only file system|require_escalated|Access (to the path .* )?is denied|UnauthorizedAccess|blocked by policy' || true)
    rm -f "$td/.segment.jsonl"
  fi
  [ "$n" -gt 1 ] && [ -s "$rd/turn-$((n - 1))/result.json" ] && prev=$(jq -c '.usage_total' "$rd/turn-$((n - 1))/result.json")
  if [ -f "$td/descendants.txt" ]; then
    alive=$(leftovers "$td/descendants.txt" | jq -R 'tonumber? // .' | jq -sc '.')
  fi
  # A file rather than <(...): a native Windows jq cannot open the MSYS /proc/<pid>/fd path.
  jq -cR 'fromjson? // empty' "$td/events.jsonl" > "$td/.events.json" 2>/dev/null || : > "$td/.events.json"
  jq -n --arg schema "$SCHEMA" --argjson turn "$n" --arg code "$code" --arg tid "$tid" \
    --arg rollout "$rollout" --argjson ctx "$ctx" --argjson denials "${denials:-null}" \
    --argjson prev "$prev" --argjson alive "$alive" --argjson tools "$tools" --argjson usagerec "$usagerec" \
    --argjson timed_out "$([ -e "$td/timed-out" ] && echo true || echo false)" \
    --argjson stopped "$([ -e "$td/stopped" ] && echo true || echo false)" \
    --argjson limit "$(cat "$td/limit.txt" 2>/dev/null || echo null)" \
    --slurpfile settings "$settings" \
    --slurpfile events "$td/.events.json" '
    # Windows spellings of one directory: drive with either slash, /c/..., /cygdrive/c/...
    def normpath: gsub("\\\\"; "/") | sub("^/(cygdrive/)?(?<d>[A-Za-z])/"; "\(.d):/")
      | if test("^[A-Za-z]:/") then ascii_downcase else . end
      | if length > 1 and endswith("/") then .[:-1] else . end;
    $settings[0] as $s
    | ($events | map(.type)) as $types
    | ([$events[] | select(.type=="turn.failed" or .type=="error")
        | (.error.message // .message // (.error|tostring))]) as $failures
    | ([$events[] | select(.type=="item.completed" and .item.type=="error") | .item.message]) as $warnings
    | ([$events[] | select(.type=="turn.completed") | .usage] | last) as $usage
    | ([$events[] | select(.type=="item.completed" and .item.type=="command_execution")
        | {command: .item.command, exit_code: .item.exit_code}]) as $commands
    | ($types | last) as $last_event
    | {cwd: $s.workspace, model: $s.model, approval_policy: "never", sandbox: $s.sandbox} as $expected
    | (if $ctx == null then ["no turn_context found in the rollout"] else
        [ (if ($ctx.cwd | normpath) != ($expected.cwd | normpath) then "cwd \($ctx.cwd) != \($expected.cwd)" else empty end),
          (if $ctx.model != $expected.model then "model \($ctx.model) != \($expected.model)" else empty end),
          (if $ctx.approval_policy != "never" then "approval_policy \($ctx.approval_policy) != never" else empty end),
          (if $ctx.sandbox_policy.type != $expected.sandbox then "sandbox \($ctx.sandbox_policy.type) != \($expected.sandbox)" else empty end) ]
       end) as $mismatches
    | ($code | tonumber? // null) as $exit
    | {
        schema: $schema, turn: $turn, thread_id: (if $tid == "" then null else $tid end),
        status: (
          if $tid == "" then "startup_error"
          elif $timed_out or $stopped or ($last_event != "turn.completed" and $last_event != "turn.failed") then "interrupted"
          elif ($failures | length) > 0 or $exit != 0 then "failed"
          elif ($mismatches | length) > 0 then "settings_mismatch"
          else "completed" end),
        exit_code: $exit, limit_seconds: $limit, timed_out: $timed_out, stopped: $stopped, last_event: $last_event,
        failures: $failures, warnings: $warnings,
        expected: $expected, effective: $ctx, mismatches: $mismatches,
        commands: $commands, tool_calls: $tools, denial_count: $denials, leftover_pids: $alive,
        usage_total: (if $usagerec != null then $usagerec.thread else $usage end),
        usage_turn: (if $usagerec != null then $usagerec.turn
                     elif $usage == null then null elif $prev == null then $usage
                     else ($usage | with_entries(.value -= ($prev[.key] // 0))) end),
        usage_source: (if $usagerec != null then "rollout token_usage_record"
                       elif $usage != null then "turn.completed" else null end),
        rollout: (if $rollout == "" then null else $rollout end),
        paths: {brief: "\($s.run_dir)/turn-\($turn)/brief.txt", events: "\($s.run_dir)/turn-\($turn)/events.jsonl",
                stderr: "\($s.run_dir)/turn-\($turn)/stderr.log", last_message: "\($s.run_dir)/turn-\($turn)/last-message.txt"}
      }' > "$td/result.json.tmp"
  rm -f "$td/.events.json"
  mv "$td/result.json.tmp" "$td/result.json"
  jq -r '.status' "$td/result.json"
}

dispatch() {  # $1 = run dir, $2 = turn number, $3 = limit, $4 = dry-run flag, rest = codex args
  local rd=$1 n=$2 limit=$3 dry=$4; shift 4
  local td="$rd/turn-$n" ws pid code status tid
  ws=$(jq -r '.workspace' "$rd/settings.json")
  if [ "$dry" = 1 ]; then printf 'cd %q &&' "$ws"; printf ' %q' codex "$@"; printf ' < %q\n' "$BRIEF"; return 0; fi
  [ -d "$ws" ] || die "workspace missing: $ws"
  mkdir "$td" && chmod 700 "$td"
  echo $$ > "$td/helper.pid"
  echo "$limit" > "$td/limit.txt"
  local prior; prior=$(rollout_for "$(cat "$rd/thread_id.txt" 2>/dev/null || true)")
  if [ -n "$prior" ]; then grep -c '"type":"turn_context"' "$prior" > "$td/turn_contexts_before.txt" || true
  else echo 0 > "$td/turn_contexts_before.txt"; fi
  cp "$BRIEF" "$td/brief.txt"
  { printf 'cd %q &&' "$ws"; printf ' %q' codex "$@"; printf '\n'; } > "$td/command.txt"
  (cd "$ws" && exec codex "$@" < "$td/brief.txt" > "$td/events.jsonl" 2> "$td/stderr.log") &
  pid=$!; echo "$pid" > "$td/launcher.pid"
  ( i=0; while kill -0 "$pid" 2>/dev/null; do
      if [ "$i" -ge "$limit" ]; then record_descendants "$pid" "$td/descendants.txt"
        touch "$td/timed-out"; terminate_launcher "$pid"; break; fi
      sleep 1; i=$((i + 1)); done ) >/dev/null 2>&1 &
  set +e; wait "$pid"; code=$?; set -e
  echo "$code" > "$td/exit_code.txt"
  tid=$(thread_of "$td/events.jsonl")
  echo "$tid" > "$td/thread_id.txt"
  if [ "$n" -eq 1 ] && [ -n "$tid" ]; then echo "$tid" > "$rd/thread_id.txt"; fi
  status=$(check_turn "$rd" "$n")
  echo "turn $n: $status  result=$td/result.json"
  [ "$status" = completed ]
}

win_sandbox_setting() {  # the user's [windows] sandbox value; reads only that key of config.toml
  local cfg="${CODEX_HOME:-$HOME/.codex}/config.toml"
  [ -f "$cfg" ] || return 0
  tr -d '\r' < "$cfg" | awk '
    BEGIN { top = 1 }
    /^[[:space:]]*\[/ { top = 0; t = ($0 ~ /^[[:space:]]*\[windows\][[:space:]]*(#.*)?$/); next }
    (t && /^[[:space:]]*sandbox[[:space:]]*=/) || (top && /^[[:space:]]*windows\.sandbox[[:space:]]*=/) {
      sub(/^[^=]*=[[:space:]]*/, ""); sub(/[[:space:]]*(#.*)?$/, ""); gsub(/["'\'']/, ""); print; exit }' \
    | grep -E '^[A-Za-z_-]+$' || true
}

forbidden_extra() {
  local a
  for a in "$@"; do
    case "$a" in
      -s|--sandbox|--sandbox=*|-m|--model|--model=*|-C|--cd|--cd=*|--json|-o|--output-last-message*|\
      --ephemeral|--last|--dangerously-bypass-approvals-and-sandbox|--dangerously-bypass-hook-trust|\
      --ignore-user-config|--skip-git-repo-check)
        die "extra argument $a is set by the helper or not allowed" ;;
      *approval_policy*|*sandbox_mode*|*danger-full-access*|*model_reasoning_effort*)
        die "extra argument $a is set by the helper or not allowed" ;;
    esac
  done
}

cmd_run() {
  local rd="" ws="" model="" sandbox="" limit=1800 effort="" keep=0 dry=0 auto=() extra=() rdc tmpd
  BRIEF=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --run-dir) rd=$2; shift 2 ;; --workspace) ws=$2; shift 2 ;; --model) model=$2; shift 2 ;;
      --sandbox) sandbox=$2; shift 2 ;; --brief) BRIEF=$2; shift 2 ;; --limit) limit=$2; shift 2 ;;
      --effort) effort=$2; shift 2 ;; --keep-user-config) keep=1; shift ;; --dry-run) dry=1; shift ;;
      --) shift; extra=("$@"); break ;; *) usage >&2; die "unknown argument: $1" ;;
    esac
  done
  [ -n "$rd" ] && [ -n "$ws" ] && [ -n "$model" ] && [ -n "$sandbox" ] && [ -n "$BRIEF" ] \
    || { usage >&2; die "run needs --run-dir, --workspace, --model, --sandbox, and --brief"; }
  case "$sandbox" in read-only|workspace-write) ;; *) die "sandbox must be read-only or workspace-write" ;; esac
  case "$limit" in ''|*[!0-9]*) die "--limit must be whole seconds" ;; esac
  [ -f "$BRIEF" ] || die "brief not found: $BRIEF"
  ws=$(canon_dir "$ws") || die "workspace is not a directory"
  forbidden_extra ${extra[@]+"${extra[@]}"}
  [ ! -e "$rd/settings.json" ] || die "run directory already holds a thread; use resume"
  rdc=$(canon_new "$rd") || die "cannot resolve the run directory: $rd"
  under "$rdc" "$ws" && die "run directory must be outside the workspace"
  if [ "$dry" = 0 ]; then mkdir -p "$rdc" && chmod 700 "$rdc"; fi
  [ "$keep" = 1 ] || auto+=(--ignore-user-config)
  # --ignore-user-config also drops [windows] sandbox, and without it every command is rejected
  # ("blocked by policy", observed). It picks the sandbox implementation, not the sandbox mode.
  if [ "$IS_WIN" = 1 ] && [ "$keep" = 0 ]; then
    case " ${extra[*]-} " in *windows.sandbox*) ;; *)
      local wsb; wsb=$(win_sandbox_setting)
      if [ -n "$wsb" ]; then auto+=(-c "windows.sandbox=\"$wsb\"")
      else echo "$PROG: warning: no [windows] sandbox in config.toml; Codex will reject every command" \
        "(pass -- -c 'windows.sandbox=\"elevated\"' or set up the Windows sandbox)" >&2; fi ;;
    esac
  fi
  git -C "$ws" rev-parse --is-inside-work-tree >/dev/null 2>&1 || auto+=(--skip-git-repo-check)
  if [ "$sandbox" = workspace-write ]; then
    [ "$keep" = 1 ] && auto+=(-c 'sandbox_workspace_write.writable_roots=[]' -c 'sandbox_workspace_write.network_access=false')
    under "$rdc" "$(canon_dir /tmp)" && auto+=(-c 'sandbox_workspace_write.exclude_slash_tmp=true')
    tmpd=$(canon_dir "${TMPDIR:-/nonexistent}" 2>/dev/null || true)
    [ -n "$tmpd" ] && under "$rdc" "$tmpd" && auto+=(-c 'sandbox_workspace_write.exclude_tmpdir_env_var=true')
  fi
  local pinned=(-m "$model" -c 'approval_policy="never"')
  [ -n "$effort" ] && pinned+=(-c "model_reasoning_effort=\"$effort\"")
  if [ "$dry" = 0 ]; then
    local argsjson
    argsjson=$( { [ ${#auto[@]} -gt 0 ] && printf '%s\0' "${auto[@]}"; [ ${#extra[@]} -gt 0 ] && printf '%s\0' "${extra[@]}"; true; } \
      | jq -Rs 'split("\u0000") | .[:-1]')
    jq -n --arg ws "$ws" --arg rd "$rdc" --arg model "$model" --arg sandbox "$sandbox" --arg effort "$effort" \
      --argjson keep "$([ "$keep" = 1 ] && echo true || echo false)" --argjson args "$argsjson" \
      '{workspace: $ws, run_dir: $rd, model: $model, sandbox: $sandbox,
        effort: (if $effort == "" then null else $effort end), keep_user_config: $keep,
        args: $args}' > "$rdc/settings.json.tmp"
    mv "$rdc/settings.json.tmp" "$rdc/settings.json"
  fi
  if [ "$dry" = 1 ]; then
    printf 'cd %q &&' "$ws"
    printf ' %q' codex exec ${auto[@]+"${auto[@]}"} ${extra[@]+"${extra[@]}"} "${pinned[@]}" -s "$sandbox" --json -o "$rd/turn-1/last-message.txt" -
    printf ' < %q\n' "$BRIEF"; return 0
  fi
  dispatch "$rdc" 1 "$limit" 0 exec ${auto[@]+"${auto[@]}"} ${extra[@]+"${extra[@]}"} "${pinned[@]}" \
    -s "$sandbox" --json -o "$rdc/turn-1/last-message.txt" -
}

cmd_resume() {
  local rd="" limit=1800 dry=0 n tid prev_pid args=() model sandbox effort
  BRIEF=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --run-dir) rd=$2; shift 2 ;; --brief) BRIEF=$2; shift 2 ;; --limit) limit=$2; shift 2 ;;
      --dry-run) dry=1; shift ;; *) usage >&2; die "unknown argument: $1" ;;
    esac
  done
  [ -n "$rd" ] && [ -n "$BRIEF" ] || { usage >&2; die "resume needs --run-dir and --brief"; }
  case "$limit" in ''|*[!0-9]*) die "--limit must be whole seconds" ;; esac
  [ -f "$BRIEF" ] || die "brief not found: $BRIEF"
  rd=$(canon_dir "$rd") || die "run directory not found"
  [ -f "$rd/settings.json" ] || die "no settings.json in $rd; start with run"
  tid=$(cat "$rd/thread_id.txt" 2>/dev/null || true)
  [ -n "$tid" ] || die "no thread ID recorded in $rd/thread_id.txt"
  n=$(latest_turn "$rd")
  prev_pid=$(cat "$rd/turn-$n/launcher.pid" 2>/dev/null || true)
  [ -n "$prev_pid" ] && kill -0 "$prev_pid" 2>/dev/null && die "turn $n is still running (pid $prev_pid)"
  while IFS= read -r a; do args+=("$a"); done < <(jq -r '.args[]' "$rd/settings.json")
  model=$(jq -r '.model' "$rd/settings.json"); sandbox=$(jq -r '.sandbox' "$rd/settings.json")
  effort=$(jq -r '.effort // ""' "$rd/settings.json")
  local pinned=(-m "$model" -c 'approval_policy="never"' -c "sandbox_mode=\"$sandbox\"")
  [ -n "$effort" ] && pinned+=(-c "model_reasoning_effort=\"$effort\"")
  n=$((n + 1))
  dispatch "$rd" "$n" "$limit" "$dry" exec resume "$tid" ${args[@]+"${args[@]}"} "${pinned[@]}" \
    --json -o "$rd/turn-$n/last-message.txt" -
}

cmd_check() {
  local rd="" n=""
  while [ $# -gt 0 ]; do
    case "$1" in --run-dir) rd=$2; shift 2 ;; --turn) n=$2; shift 2 ;; *) usage >&2; die "unknown argument: $1" ;; esac
  done
  rd=$(canon_dir "$rd") || die "run directory not found"
  [ -n "$n" ] || n=$(latest_turn "$rd")
  [ "$n" -ge 1 ] || die "no turns in $rd"
  local hp lp
  hp=$(cat "$rd/turn-$n/helper.pid" 2>/dev/null || true); lp=$(cat "$rd/turn-$n/launcher.pid" 2>/dev/null || true)
  if [ ! -f "$rd/turn-$n/result.json" ] && { { [ -n "$hp" ] && kill -0 "$hp" 2>/dev/null; } || { [ -n "$lp" ] && kill -0 "$lp" 2>/dev/null; }; }; then
    echo "turn $n: running"; return 3
  fi
  echo "turn $n: $(check_turn "$rd" "$n")  result=$rd/turn-$n/result.json"
}

cmd_stop() {
  local rd="" n pid td
  while [ $# -gt 0 ]; do case "$1" in --run-dir) rd=$2; shift 2 ;; *) usage >&2; die "unknown argument: $1" ;; esac; done
  rd=$(canon_dir "$rd") || die "run directory not found"
  n=$(latest_turn "$rd"); td="$rd/turn-$n"
  pid=$(cat "$td/launcher.pid" 2>/dev/null || true)
  [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null || die "turn $n is not running"
  record_descendants "$pid" "$td/descendants.txt"; touch "$td/stopped"; terminate_launcher "$pid"
  if [ "$IS_WIN" = 1 ]; then echo "ended the Windows process tree of $pid and sent SIGTERM; descendants recorded in $td/descendants.txt"
  else echo "sent SIGTERM to $pid; descendants recorded in $td/descendants.txt"; fi
}

cmd_reap() {
  local rd="" n="" td p cmdline now wins=""
  while [ $# -gt 0 ]; do
    case "$1" in --run-dir) rd=$2; shift 2 ;; --turn) n=$2; shift 2 ;; *) usage >&2; die "unknown argument: $1" ;; esac
  done
  rd=$(canon_dir "$rd") || die "run directory not found"
  [ -n "$n" ] || n=$(latest_turn "$rd")
  td="$rd/turn-$n"; [ -f "$td/descendants.txt" ] || die "no descendants recorded for turn $n"
  grep -q '^w' "$td/descendants.txt" && wins=$(win_procs)
  while read -r p cmdline; do
    [ -n "$p" ] || continue
    case "$p" in
      w*) now=$(printf '%s\n' "$wins" | awk -F '\t' -v p="${p#w}" '$1 == p {
            print substr($0, length($1) + length($2) + length($3) + 4); exit }') ;;
      *) now=$(proc_cmd "$p") ;;
    esac
    if [ -z "$now" ]; then echo "gone $p"
    elif [ "$now" != "$cmdline" ]; then echo "skipped $p (now: $now)"
    else case "$p" in  # Windows has no SIGTERM for a native process; taskkill /F ends it
      w*) MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' taskkill /F /PID "${p#w}" >/dev/null 2>&1 ;;
      *) kill -TERM "$p" 2>/dev/null ;;
    esac && echo "signaled $p $cmdline" || echo "gone $p"; fi
  done < "$td/descendants.txt" | tee -a "$td/reap.log"
  sleep 1
  echo "turn $n: $(check_turn "$rd" "$n")  result=$td/result.json"
}

case "${1:-}" in
  snapshot) shift; cmd_snapshot "$@" ;;
  compare) shift; cmd_compare "$@" ;;
  run) shift; cmd_run "$@" ;;
  resume) shift; cmd_resume "$@" ;;
  check) shift; cmd_check "$@" ;;
  stop) shift; cmd_stop "$@" ;;
  reap) shift; cmd_reap "$@" ;;
  -h|--help|help) usage ;;
  *) usage >&2; exit 2 ;;
esac
