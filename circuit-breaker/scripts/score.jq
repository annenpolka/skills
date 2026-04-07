# Circuit Breaker — pattern scoring engine
# Input: array of buffer entries [{ts, tool, target, summary}]
# Output: {tripped: bool, pattern: string, evidence: string, scores: {...}}

def now_epoch:
  now | floor;

def parse_ts:
  # ISO8601 "2026-04-07T15:00:00Z" → epoch seconds
  strptime("%Y-%m-%dT%H:%M:%SZ") | mktime;

def time_decay($age_s; $half_life):
  # Exponential decay: e^(-ln2 * age / half_life)
  if $half_life <= 0 then 0
  elif $age_s <= 0 then 1
  else ((-0.693147 * $age_s / $half_life) | exp)
  end;

def normalize_bash_cmd:
  # Strip env vars (FOO=bar cmd → cmd), redirects, collapse whitespace
  gsub("^\\s*[A-Z_]+=\\S+\\s+"; "") |
  gsub("\\s*[12]?>\\S*"; "") |
  gsub("\\s*<\\S*"; "") |
  gsub("\\s+"; " ") |
  ltrimstr(" ") | rtrimstr(" ") |
  # Basename-ize paths (sequences starting with /)
  gsub("/[^\\s]+/(?<base>[^/\\s]+)"; .base);

# === PATTERN DETECTORS ===

def oscillation_score($now_e; $half_life; $window):
  # Group Edit/Write by target, compute time-decayed frequency
  [.[] | select(.tool == "Edit" or .tool == "Write") | select(.target != "")] as $edits |
  if ($edits | length) == 0 then {score: 0, evidence: ""}
  else
    [$edits | group_by(.target)[] |
      {
        target: .[0].target,
        score: ([.[] | (.ts | parse_ts) as $ts | time_decay($now_e - $ts; $half_life)] | add)
      }
    ] | sort_by(-.score) | .[0] as $top |
    if $top == null then {score: 0, evidence: ""}
    else {
      score: ($top.score / $window),
      evidence: "\($top.target | split("/") | last) (\($top.score | . * 100 | floor / 100) heat)"
    }
    end
  end;

def retry_score($now_e; $half_life; $window):
  # Group Bash by normalized command, compute time-decayed frequency
  [.[] | select(.tool == "Bash") |
    {ts: .ts, norm: (.summary | normalize_bash_cmd | .[0:80])}
  ] as $cmds |
  if ($cmds | length) == 0 then {score: 0, evidence: ""}
  else
    [$cmds | group_by(.norm)[] | select(length >= 2) |
      {
        cmd: .[0].norm[0:50],
        score: ([.[] | (.ts | parse_ts) as $ts | time_decay($now_e - $ts; $half_life)] | add)
      }
    ] | sort_by(-.score) | .[0] as $top |
    if $top == null then {score: 0, evidence: ""}
    else {
      score: ($top.score / $window),
      evidence: "repeated: \($top.cmd[0:40])..."
    }
    end
  end;

def spiral_score($now_e; $half_life):
  # Count consecutive Grep/Glob from the tail, not interrupted by Edit/Write
  [.[] | {tool: .tool, ts: .ts}] | reverse |
  reduce .[] as $a (
    {count: 0, done: false, heat: 0};
    if .done then .
    elif ($a.tool == "Grep" or $a.tool == "Glob") then
      .count += 1 |
      .heat += (($a.ts | parse_ts) as $ts | time_decay($now_e - $ts; $half_life))
    elif ($a.tool == "Edit" or $a.tool == "Write") then
      .done = true
    else .
    end
  ) | {
    score: (.heat / 5),  # normalize against spiral_threshold=5
    evidence: "search ×\(.count) without editing"
  };

def scope_creep_score($window):
  # Compare unique file count in first half vs second half of window
  (length / 2 | floor) as $mid |
  if $mid < 2 then {score: 0, evidence: ""}
  else
    ([.[:$mid][] | select(.target != "") | .target] | unique | length) as $first |
    ([.[$mid:][] | select(.target != "") | .target] | unique | length) as $second |
    if $first == 0 then {score: 0, evidence: ""}
    else {
      score: (if $second > $first then (($second - $first) / $window) else 0 end),
      evidence: "files: \($first)→\($second) across window"
    }
    end
  end;

# === MAIN ===

. as $buffer |
(now_epoch) as $now_e |
($buffer | length) as $n |

# Half-life: half the window in seconds (assume ~30s per action)
($n * 15) as $half_life |

($buffer | oscillation_score($now_e; $half_life; $n)) as $osc |
($buffer | retry_score($now_e; $half_life; $n)) as $ret |
($buffer | spiral_score($now_e; $half_life)) as $spi |
($buffer | scope_creep_score($n)) as $sc |

# Find the max score
[$osc, $ret, $spi, $sc] |
[
  {id: "oscillation", score: $osc.score, evidence: $osc.evidence},
  {id: "retry", score: $ret.score, evidence: $ret.evidence},
  {id: "spiral", score: $spi.score, evidence: $spi.evidence},
  {id: "scope_creep", score: $sc.score, evidence: $sc.evidence}
] | sort_by(-.score) | .[0] as $top |

{
  tripped: ($top.score >= 0.6),
  pattern: $top.id,
  score: ($top.score | . * 100 | floor / 100),
  evidence: $top.evidence,
  scores: {
    oscillation: ($osc.score | . * 100 | floor / 100),
    retry: ($ret.score | . * 100 | floor / 100),
    spiral: ($spi.score | . * 100 | floor / 100),
    scope_creep: ($sc.score | . * 100 | floor / 100)
  }
}
