# Decision Forensics — action weight scoring
# Input: array of action-log entries [{seq, timestamp, tool, input_summary}]
# Output: {total_weight: float, action_count: int, heaviest: {seq, weight, reason}}
#
# Weight factors:
#   - Tool type: Edit/Write > Bash > Grep/Glob
#   - Target novelty: first touch of a file > repeated touch
#   - Path significance: project src > config > tmp/scratch
#   - Time decay: recent actions weigh more

def is_tmp_path:
  test("^/tmp/") or test("^/private/tmp/") or test("scratch/");

def is_config_path:
  test("\\.(json|yaml|yml|toml|ini|conf)$") or test("config") or test("settings");

def is_src_path:
  (is_tmp_path | not) and (is_config_path | not);

def path_weight:
  if . == "" or . == "bash" then 0.3
  elif is_tmp_path then 0.1
  elif is_config_path then 0.8
  elif is_src_path then 1.0
  else 0.5
  end;

def tool_weight:
  if . == "Edit" then 1.0
  elif . == "Write" then 0.9
  elif . == "Bash" then 0.5
  elif . == "Grep" or . == "Glob" then 0.1
  else 0.3
  end;

# Main: compute total weight from unretrospected actions
. as $actions |
($actions | length) as $n |

# Track seen targets for novelty scoring
reduce $actions[] as $a (
  {seen: {}, entries: []};
  ($a.target // "") as $target |
  ($a.tool | tool_weight) as $tw |
  ($target | path_weight) as $pw |
  # Novelty: first touch = 1.0, subsequent = 0.3
  (if $target == "" or $target == "bash" then 0.5
   elif .seen[$target] then 0.3
   else 1.0
   end) as $novelty |
  # Combined weight
  ($tw * $pw * $novelty) as $weight |
  .seen[$target] = true |
  .entries += [{seq: $a.seq, weight: $weight, tool: $a.tool, target: $a.target}]
) |
.entries as $scored |

# Total weight
($scored | map(.weight) | add // 0) as $total |

# Heaviest action
($scored | sort_by(-.weight) | .[0] // {seq: 0, weight: 0}) as $heaviest |

{
  total_weight: ($total * 100 | floor / 100),
  action_count: $n,
  heaviest: {
    seq: $heaviest.seq,
    weight: ($heaviest.weight * 100 | floor / 100),
    tool: ($heaviest.tool // ""),
    target: ($heaviest.target // "")
  }
}
