// Read-only research evidence tools.
//
// This package is pure: it never reads files, never hashes bytes and never
// mutates a ledger. Callers supply source identities (path, exact UTF-8 text
// and a host-computed SHA-256). The mechanical result says only whether the
// supplied review is internally consistent; it never judges meaning or
// consensus.

priv suberror Invalid {
  Invalid(String)
}

fn[T] reject(code : String) -> T raise Invalid {
  raise Invalid(code)
}

fn as_obj(value : Json) -> Map[String, Json] raise Invalid {
  match value {
    Json::Object(fields) => fields
    _ => reject("expected_object")
  }
}

fn as_arr(value : Json) -> Array[Json] raise Invalid {
  match value {
    Json::Array(items) => items
    _ => reject("expected_array")
  }
}

fn as_str(value : Json) -> String raise Invalid {
  match value {
    Json::String(text) => text
    _ => reject("expected_string")
  }
}

fn req(fields : Map[String, Json], key : String) -> Json raise Invalid {
  match fields.get(key) {
    Some(value) => value
    None => reject("missing_" + key)
  }
}

fn req_obj(fields : Map[String, Json], key : String) -> Map[String, Json] raise Invalid {
  as_obj(req(fields, key))
}

fn req_arr(fields : Map[String, Json], key : String) -> Array[Json] raise Invalid {
  as_arr(req(fields, key))
}

fn req_str(fields : Map[String, Json], key : String) -> String raise Invalid {
  as_str(req(fields, key))
}

// A positive JSON integer: integral, finite, in the 32-bit positive range.
fn as_pos_int(value : Json) -> Int raise Invalid {
  let number = match value {
    Json::Number(number, ..) => number
    _ => reject("expected_integer")
  }
  if number.is_nan() || number.is_inf() || number.floor() != number {
    reject("expected_integer")
  }
  if number < 1.0 || number > 2147483647.0 {
    reject("expected_positive_integer")
  }
  number.to_int()
}

fn is_lower_hex(code : Int) -> Bool {
  (code >= 48 && code <= 57) || (code >= 97 && code <= 102)
}

fn valid_sha(text : String) -> Bool {
  let chars = text.to_array()
  if chars.length() != 64 {
    return false
  }
  for c in chars {
    if !is_lower_hex(c.to_int()) {
      return false
    }
  }
  true
}

// Relative POSIX source paths only: no drive letters, no backslashes, no
// absolute paths, no empty or dot segments.
fn safe_path(path : String) -> Bool {
  if path.is_empty() {
    return false
  }
  let chars = path.to_array()
  if chars[0].to_int() == 47 {
    return false
  }
  let n = chars.length()
  let mut start = 0
  let mut index = 0
  while index <= n {
    if index == n || chars[index].to_int() == 47 {
      let length = index - start
      if length == 0 {
        return false
      }
      if length == 1 && chars[start].to_int() == 46 {
        return false
      }
      if length == 2 && chars[start].to_int() == 46 && chars[start + 1].to_int() == 46 {
        return false
      }
      start = index + 1
    } else {
      let code = chars[index].to_int()
      if code == 92 || code == 58 || code == 0 {
        return false
      }
    }
    index = index + 1
  }
  true
}

fn utf16_width(c : Char) -> Int {
  if c.to_int() > 0xFFFF {
    2
  } else {
    1
  }
}

// Every overlapping occurrence, with 1-based line and UTF-16 column at the
// match start. Prefix widths are computed once; never per candidate.
fn find_occurrences(hay : Array[Char], needle : Array[Char]) -> Array[(Int, Int)] {
  let out : Array[(Int, Int)] = []
  let n = hay.length()
  let m = needle.length()
  if m == 0 || m > n {
    return out
  }
  let line_at : Array[Int] = []
  let col_at : Array[Int] = []
  let mut line = 1
  let mut line_units = 0
  for i = 0; i < n; i = i + 1 {
    line_at.push(line)
    col_at.push(line_units + 1)
    let c = hay[i]
    line_units = line_units + utf16_width(c)
    if c.to_int() == 10 {
      line = line + 1
      line_units = 0
    }
  }
  let mut i = 0
  while i + m <= n {
    let mut j = 0
    while j < m && hay[i + j] == needle[j] {
      j = j + 1
    }
    if j == m {
      out.push((line_at[i], col_at[i]))
    }
    i = i + 1
  }
  out
}

// A trailing terminator does not create a phantom empty line, but a real blank
// line between terminators is retained.
fn line_count(chars : Array[Char]) -> Int {
  let n = chars.length()
  if n == 0 {
    return 0
  }
  let mut count = 0
  for i = 0; i < n; i = i + 1 {
    if chars[i].to_int() == 10 {
      count = count + 1
    }
  }
  if chars[n - 1].to_int() == 10 {
    count
  } else {
    count + 1
  }
}

// Concatenate lines [from, to] preserving every original character, including
// the line terminators of each included line.
fn extract_lines(chars : Array[Char], from : Int, to : Int) -> String {
  let builder = StringBuilder::new()
  let n = chars.length()
  let mut line = 1
  let mut index = 0
  while line < from && index < n {
    if chars[index].to_int() == 10 {
      line = line + 1
    }
    index = index + 1
  }
  let mut current = line
  while current <= to && index < n {
    let c = chars[index]
    builder.write_char(c)
    if c.to_int() == 10 {
      current = current + 1
    }
    index = index + 1
  }
  builder.to_string()
}

fn parse_source(item : Json) -> (String, String, Array[Char]) raise Invalid {
  let fields = as_obj(item)
  let path = req_str(fields, "path")
  if !safe_path(path) {
    reject("unsafe_source_path")
  }
  let text = req_str(fields, "text")
  let sha = req_str(fields, "sha256")
  if !valid_sha(sha) {
    reject("invalid_source_hash")
  }
  (path, sha, text.to_array())
}

fn parse_sources(value : Json) -> (Map[String, Array[Char]], Map[String, String]) raise Invalid {
  let items = as_arr(value)
  let texts : Map[String, Array[Char]] = Map::new()
  let shas : Map[String, String] = Map::new()
  for item in items {
    let (path, sha, chars) = parse_source(item)
    if shas.contains(path) {
      reject("duplicate_source")
    }
    shas.set(path, sha)
    texts.set(path, chars)
  }
  (texts, shas)
}

fn occurrence_json(occurrences : Array[(Int, Int)]) -> Array[Json] {
  let items : Array[Json] = []
  for occ in occurrences {
    items.push({"line": occ.0, "column": occ.1})
  }
  items
}

fn locate(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, _shas) = parse_sources(req(request, "sources"))
  let references = req_arr(request, "references")
  let checks : Array[Json] = []
  let errors : Array[Json] = []
  for item in references {
    let fields = as_obj(item)
    let path = req_str(fields, "path")
    if !safe_path(path) {
      reject("unsafe_reference_path")
    }
    let quote = req_str(fields, "quote")
    if quote.is_empty() {
      reject("empty_quote")
    }
    let hay = match texts.get(path) {
      Some(chars) => chars
      None => reject("unknown_reference_path")
    }
    let anchor : Int? = match fields.get("line") {
      None | Some(Json::Null) => None
      Some(value) => Some(as_pos_int(value))
    }
    let occurrences = find_occurrences(hay, quote.to_array())
    let mut matched = false
    match anchor {
      None => matched = !occurrences.is_empty()
      Some(line) => {
        for occ in occurrences {
          if occ.0 == line {
            matched = true
          }
        }
      }
    }
    checks.push({"matched": matched, "occurrences": occurrence_json(occurrences)})
    if !matched {
      errors.push({"code": "quote_not_at_anchor"})
    }
  }
  {"ok": errors.is_empty(), "errors": errors, "checks": checks}
}

fn quote(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, shas) = parse_sources(req(request, "sources"))
  let path = req_str(request, "path")
  if !safe_path(path) {
    reject("unsafe_path")
  }
  let from_line = as_pos_int(req(request, "fromLine"))
  let to_line = as_pos_int(req(request, "toLine"))
  if from_line > to_line {
    reject("invalid_range")
  }
  let chars = match texts.get(path) {
    Some(chars) => chars
    None => reject("unknown_path")
  }
  if to_line > line_count(chars) {
    reject("range_out_of_bounds")
  }
  let text = extract_lines(chars, from_line, to_line)
  let sha = match shas.get(path) {
    Some(sha) => sha
    None => reject("unknown_path")
  }
  {"ok": true, "errors": [], "path": path, "line": from_line, "endLine": to_line,
    "quote": text, "sha256": sha}
}

fn collect_ids(items : Array[Json], key : String) -> Array[String] raise Invalid {
  let out : Array[String] = []
  let seen : Map[String, Bool] = Map::new()
  for item in items {
    let fields = as_obj(item)
    let id = req_str(fields, key)
    if id.is_empty() {
      reject("empty_id")
    }
    if seen.contains(id) {
      reject("duplicate_id")
    }
    seen.set(id, true)
    out.push(id)
  }
  out
}

fn bind_allowed(allowed : Array[Json], shas : Map[String, String]) -> Unit raise Invalid {
  let allowed_shas : Map[String, String] = Map::new()
  for item in allowed {
    let fields = as_obj(item)
    let path = req_str(fields, "path")
    if !safe_path(path) {
      reject("unsafe_allowed_path")
    }
    let sha = req_str(fields, "sha256")
    if !valid_sha(sha) {
      reject("invalid_allowed_hash")
    }
    if allowed_shas.contains(path) {
      reject("duplicate_allowed_path")
    }
    allowed_shas.set(path, sha)
  }
  for pair in allowed_shas.to_array() {
    let path = pair.0
    let sha = pair.1
    match shas.get(path) {
      None => reject("missing_allowed_source")
      Some(actual) => if actual != sha { reject("allowed_source_hash_mismatch") }
    }
  }
  if allowed_shas.to_array().length() != shas.to_array().length() {
    reject("unexpected_source")
  }
}

// Structural JSON equality: object key order is irrelevant, array order is
// significant, and numbers compare by value. Used to bind an optional inline
// candidate draft to the candidate parsed from the same byte-hashed read.
fn json_equal(a : Json, b : Json) -> Bool {
  match (a, b) {
    (Json::Null, Json::Null) => true
    (Json::True, Json::True) => true
    (Json::False, Json::False) => true
    (Json::String(x), Json::String(y)) => x == y
    (Json::Number(x, ..), Json::Number(y, ..)) => x == y
    (Json::Array(xs), Json::Array(ys)) => {
      if xs.length() != ys.length() {
        false
      } else {
        let mut same = true
        for i = 0; i < xs.length(); i = i + 1 {
          if !json_equal(xs[i], ys[i]) {
            same = false
          }
        }
        same
      }
    }
    (Json::Object(xs), Json::Object(ys)) => {
      if xs.to_array().length() != ys.to_array().length() {
        false
      } else {
        let mut same = true
        for pair in xs.to_array() {
          match ys.get(pair.0) {
            Some(value) => if !json_equal(pair.1, value) { same = false }
            None => same = false
          }
        }
        same
      }
    }
    _ => false
  }
}

fn validate_source_check(item : Json, texts : Map[String, Array[Char]]) -> Unit raise Invalid {
  let fields = as_obj(item)
  let path = req_str(fields, "path")
  if !safe_path(path) {
    reject("unsafe_check_path")
  }
  let hay = match texts.get(path) {
    Some(chars) => chars
    None => reject("unknown_check_path")
  }
  let line = as_pos_int(req(fields, "line"))
  let quote = req_str(fields, "quote")
  if quote.is_empty() {
    reject("empty_check_quote")
  }
  let kind = req_str(fields, "kind")
  if !["support", "scope_limit", "counterexample"].contains(kind) {
    reject("invalid_check_kind")
  }
  let occurrences = find_occurrences(hay, quote.to_array())
  let mut found = false
  for occ in occurrences {
    if occ.0 == line {
      found = true
    }
  }
  if !found {
    reject("check_quote_not_at_line")
  }
}

fn validate_review(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, shas) = parse_sources(req(request, "sources"))
  let candidate = req_str(request, "candidateSha256")
  if !valid_sha(candidate) {
    reject("invalid_candidate_hash")
  }
  let packet = req_obj(request, "packet")
  let review = req_obj(request, "review")

  let packet_id = req_str(packet, "packetId")
  let finding_ids = collect_ids(req_arr(packet, "selectedFindings"), "findingId")
  let task_ids = collect_ids(req_arr(packet, "tasks"), "taskId")
  bind_allowed(req_arr(packet, "allowedSourceFiles"), shas)

  let packet_peer = req_obj(packet, "peerReview")
  let packet_hash = req_str(packet_peer, "reviewedArtifactSha256")
  if !valid_sha(packet_hash) {
    reject("invalid_packet_hash")
  }
  if packet_hash != candidate {
    reject("packet_candidate_hash_mismatch")
  }
  let packet_round = as_pos_int(req(packet_peer, "round"))

  // Optional inline candidate draft. When present it must structurally equal
  // the candidate parsed from the same read whose bytes produced candidateSha256.
  match packet_peer.get("candidateDraft") {
    Some(Json::Null) | None => ()
    Some(draft) => {
      let value = match request.get("candidateValue") {
        Some(value) => value
        None => reject("candidate_value_required")
      }
      if !json_equal(draft, value) {
        reject("candidate_draft_mismatch")
      }
    }
  }

  if req_str(review, "packetId") != packet_id {
    reject("packet_id_mismatch")
  }
  let peer = req_obj(review, "peerReview")
  let peer_hash = req_str(peer, "reviewedArtifactSha256")
  if !valid_sha(peer_hash) {
    reject("invalid_review_hash")
  }
  if peer_hash != candidate {
    reject("review_candidate_hash_mismatch")
  }
  if as_pos_int(req(peer, "round")) != packet_round {
    reject("round_mismatch")
  }
  let disposition = req_str(peer, "disposition")
  if !["no_open_issues", "changes_requested", "disputed", "incomplete"].contains(disposition) {
    reject("invalid_disposition")
  }
  let issues = req_arr(peer, "issues")

  let reviews = req_arr(review, "reviews")
  let reviewed_ids : Array[String] = []
  let seen_reviews : Map[String, Bool] = Map::new()
  for item in reviews {
    let fields = as_obj(item)
    let finding_id = req_str(fields, "findingId")
    if !finding_ids.contains(finding_id) {
      reject("unknown_review_finding")
    }
    if seen_reviews.contains(finding_id) {
      reject("duplicate_review")
    }
    seen_reviews.set(finding_id, true)
    reviewed_ids.push(finding_id)
    let verdict = req_str(fields, "verdict")
    if !["supported", "qualified", "refuted", "unresolved"].contains(verdict) {
      reject("invalid_verdict")
    }
    let basis = req_arr(fields, "basisFindingIds")
    let seen_basis : Map[String, Bool] = Map::new()
    for entry in basis {
      let basis_id = as_str(entry)
      if !finding_ids.contains(basis_id) {
        reject("unknown_basis")
      }
      if seen_basis.contains(basis_id) {
        reject("duplicate_basis")
      }
      seen_basis.set(basis_id, true)
    }
    for check in req_arr(fields, "sourceChecks") {
      validate_source_check(check, texts)
    }
    for remaining in req_arr(fields, "remainingChecks") {
      ignore(as_str(remaining))
    }
    ignore(req_str(fields, "note"))
  }

  let seen_issues : Map[String, Bool] = Map::new()
  let mut has_open = false
  for item in issues {
    let fields = as_obj(item)
    let issue_id = req_str(fields, "id")
    if issue_id.is_empty() {
      reject("empty_issue_id")
    }
    if seen_issues.contains(issue_id) {
      reject("duplicate_issue")
    }
    seen_issues.set(issue_id, true)
    let finding_id = req_str(fields, "findingId")
    if !finding_ids.contains(finding_id) {
      reject("unknown_issue_finding")
    }
    let state = req_str(fields, "state")
    if !["open", "disputed", "resolved"].contains(state) {
      reject("invalid_issue_state")
    }
    if state == "open" || state == "disputed" {
      has_open = true
    }
    ignore(req_str(fields, "note"))
  }

  let seen_tasks : Map[String, Bool] = Map::new()
  for item in req_arr(review, "questionActions") {
    let fields = as_obj(item)
    let task_id = req_str(fields, "taskId")
    if !task_ids.contains(task_id) {
      reject("unknown_question_task")
    }
    if seen_tasks.contains(task_id) {
      reject("duplicate_question_action")
    }
    seen_tasks.set(task_id, true)
    let action = req_str(fields, "action")
    if !["keep", "park", "refine"].contains(action) {
      reject("invalid_question_action")
    }
    ignore(req_str(fields, "reason"))
  }

  ignore(req_arr(review, "infrastructureObservations"))

  let coverage = req_obj(review, "coverage")
  // Binding is two-directional: a declared reviewed ID must have a review and
  // every dispatched review must be declared reviewed. Otherwise a real review
  // could be relabelled unreviewed while still passing the partition.
  let review_set : Map[String, Bool] = Map::new()
  for id in reviewed_ids {
    review_set.set(id, true)
  }
  let covered : Map[String, Bool] = Map::new()
  let declared_reviewed : Map[String, Bool] = Map::new()
  let mut declared_reviewed_count = 0
  for entry in req_arr(coverage, "reviewedFindingIds") {
    let id = as_str(entry)
    if !finding_ids.contains(id) {
      reject("unknown_covered_finding")
    }
    if covered.contains(id) {
      reject("duplicate_covered_finding")
    }
    covered.set(id, true)
    declared_reviewed.set(id, true)
    declared_reviewed_count = declared_reviewed_count + 1
    if !review_set.contains(id) {
      reject("reviewed_coverage_mismatch")
    }
  }
  for entry in req_arr(coverage, "unreviewedFindingIds") {
    let id = as_str(entry)
    if !finding_ids.contains(id) {
      reject("unknown_unreviewed_finding")
    }
    if covered.contains(id) {
      reject("overlapping_coverage")
    }
    covered.set(id, true)
  }
  if covered.to_array().length() != finding_ids.length() {
    reject("coverage_gap")
  }
  for id in reviewed_ids {
    if !declared_reviewed.contains(id) {
      reject("reviewed_coverage_mismatch")
    }
  }

  // unreadSources is the provider's self-reported unread set. A path may appear
  // here even though this validator was supplied its bytes; reading here is not
  // evidence the provider read it. The field is bounded to unique, safe
  // relative paths within the packet's allowed set.
  let unread_sources = req_arr(coverage, "unreadSources")
  let seen_unread : Map[String, Bool] = Map::new()
  for entry in unread_sources {
    let path = as_str(entry)
    if !safe_path(path) {
      reject("unsafe_unread_source")
    }
    if !shas.contains(path) {
      reject("unread_source_not_allowed")
    }
    if seen_unread.contains(path) {
      reject("duplicate_unread_source")
    }
    seen_unread.set(path, true)
  }
  for entry in req_arr(coverage, "unperformedChecks") {
    ignore(as_str(entry))
  }

  if disposition == "no_open_issues" {
    if has_open {
      reject("open_issues_with_no_open_disposition")
    }
    if declared_reviewed_count != finding_ids.length() {
      reject("unreviewed_with_no_open_disposition")
    }
  }

  {"ok": true, "errors": []}
}

fn dispatch(value : Json) -> Json raise Invalid {
  let request = as_obj(value)
  let op = req_str(request, "op")
  match op {
    "locate" => locate(request)
    "quote" => quote(request)
    "validateReview" => validate_review(request)
    "buildResearch" => build_research(request)
    "buildReview" => build_review(request)
    "buildRevision" => build_revision(request)
    _ => reject("unknown_op")
  }
}

fn error_json(code : String) -> String {
  ({"ok": false, "errors": [{"code": Json::string(code)}]} : Json).stringify()
}

pub fn dispatch_json(input : String) -> String {
  let parsed = @json.parse(input) catch { _ => return error_json("invalid_json") }
  let result = dispatch(parsed) catch { Invalid(message) => return error_json(message) }
  result.stringify()
}
