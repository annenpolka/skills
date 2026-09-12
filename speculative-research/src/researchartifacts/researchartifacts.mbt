// Shared IO for machine-written research artifacts.
//
// This package owns loading frozen packet/source bytes, publishing immutable
// output directories and binding a preceding review, but every decision is made
// by the pure `researchcheck` package. Node transports values only.

fn relative_safe(path : String) -> Bool {
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

fn valid_hash(text : String) -> Bool {
  let chars = text.to_array()
  if chars.length() != 64 {
    return false
  }
  for c in chars {
    let code = c.to_int()
    if !((code >= 48 && code <= 57) || (code >= 97 && code <= 102)) {
      return false
    }
  }
  true
}

fn sync(host : (String) -> String, path : String) -> Unit raise @io.IoError {
  ignore(@io.call(host, {"op": "fsync", "path": Json::string(path)}))
}

fn read_record(host : (String) -> String, path : String) -> Map[String, Json] raise @io.IoError {
  @io.as_object(@io.call(host, {"op": "readRecord", "path": Json::string(path),
    "maxBytes": Json::number(67108864.0)}))
}

pub fn load_packet_sources(
  host : (String) -> String,
  packet_path : String,
) -> (Map[String, Json], String, Array[Json]) raise @io.IoError {
  let packet = @io.as_object(@io.parse(@io.read(host, packet_path)))
  let declared_root = @io.as_string(@io.required(packet, "frozenSourceRoot"))
  if !declared_root.has_prefix("/") {
    @io.fail("invalid_source_root")
  }
  // Comparisons and reads use the canonical root so a ".." spelling cannot
  // slip an output past the frozen-source guard, but a declared symlink (or
  // symlinked ancestor) is refused rather than silently resolved.
  let root = @io.realpath(host, declared_root, false)
  if @io.resolve(host, declared_root) != root {
    @io.fail("source_root_symlink")
  }
  let items = @io.as_array(@io.required(packet, "allowedSourceFiles"))
  let seen : Map[String, Bool] = Map::new()
  let sources : Array[Json] = []
  for item in items {
    let fields = @io.as_object(item)
    let path = @io.as_string(@io.required(fields, "path"))
    if !relative_safe(path) {
      @io.fail("unsafe_allowed_path")
    }
    if seen.contains(path) {
      @io.fail("duplicate_allowed_path")
    }
    seen.set(path, true)
    let expected = @io.as_string(@io.required(fields, "sha256"))
    if !valid_hash(expected) {
      @io.fail("invalid_allowed_hash")
    }
    let record = @io.as_object(@io.call(host, {"op": "researchReadRecord",
      "root": Json::string(root), "path": Json::string(path), "maxBytes": Json::number(33554432.0)}))
    let text = @io.as_string(@io.required(record, "text"))
    let sha = @io.as_string(@io.required(record, "sha256"))
    if sha != expected {
      @io.fail("source_hash_mismatch")
    }
    sources.push({"path": Json::string(path), "text": Json::string(text), "sha256": Json::string(sha)})
  }
  (packet, root, sources)
}

fn dispatch_core(request : Json) -> Json raise @io.IoError {
  @io.parse(@researchcheck.dispatch_json(request.stringify()))
}

fn is_ok(answer : Map[String, Json]) -> Bool raise @io.IoError {
  @io.required(answer, "ok") == Json::boolean(true)
}

// Model-facing JSON is written one record per line group so a native read that
// truncates very long lines still sees every finding. Values are unchanged and
// hashes are always taken from exactly these formatted bytes.
fn pretty(value : Json) -> String {
  value.stringify(indent=2) + "\n"
}

// One completion-marker path for every writer: write receipt.json exclusively
// and privately, fsync the receipt and its directory, and on any late failure
// delete only the just-created incomplete receipt so no prior output and no
// readable success marker survives.
fn write_completion_marker(
  host : (String) -> String,
  dir : String,
  receipt : Json,
) -> Unit raise @io.IoError {
  let receipt_path = @io.join(dir, "receipt.json")
  @io.write(host, receipt_path, pretty(receipt), Some(0o600), false, true)
  let persisted : Result[Unit, String] = try {
    sync(host, receipt_path)
    sync(host, dir)
    Ok(())
  } catch {
    @io.Io(message) => Err(message)
  }
  match persisted {
    Ok(_) => ()
    Err(message) => {
      try {
        @io.remove(host, receipt_path, false, true)
      } catch {
        @io.Io(_) => ()
      }
      @io.fail(message)
    }
  }
}

// Publish an immutable output directory. Every input and planned artifact must
// already be validated. receipt.json is written last and never describes itself.
fn publish(
  host : (String) -> String,
  operation : String,
  out : String,
  source_root : String,
  files : Array[(String, String)],
  labels : Map[String, Json],
) -> Json raise @io.IoError {
  let resolved = @io.resolve(host, out)
  if resolved == source_root || resolved.has_prefix(source_root + "/") {
    @io.fail("output_inside_source_root")
  }
  if @io.lstat(host, resolved) is Some(_) {
    @io.fail("output_exists")
  }
  let canonical = @io.realpath(host, resolved, true)
  if canonical != resolved {
    @io.fail("output_symlink_ancestor")
  }
  if @io.as_bool(@io.call(host, {"op": "stopped"})) {
    @io.fail("stopped_before_publication")
  }
  @io.mkdir(host, resolved, false, Some(0o700), true)
  let entries : Array[Json] = []
  for pair in files {
    let path = @io.join(resolved, pair.0)
    @io.write(host, path, pair.1, Some(0o600), false, true)
    sync(host, path)
    let record = read_record(host, path)
    entries.push({"path": Json::string(pair.0), "sha256": @io.required(record, "sha256"),
      "bytes": @io.required(record, "bytes")})
  }
  let receipt_fields = clone(labels)
  receipt_fields.set("operation", Json::string(operation))
  receipt_fields.set("files", Json::array(entries))
  let receipt = Json::object(receipt_fields)
  write_completion_marker(host, resolved, receipt)
  {"ok": true, "receipt": receipt}
}

pub fn research(
  host : (String) -> String,
  packet_path : String,
  draft_path : String,
  out : String,
) -> Json raise @io.IoError {
  let (packet, root, sources) = load_packet_sources(host, packet_path)
  let draft = @io.parse(@io.read(host, draft_path))
  let request : Json = {"op": Json::string("buildResearch"), "packet": Json::object(packet),
    "sources": Json::array(sources), "draft": draft}
  let answer = dispatch_core(request)
  let fields = @io.as_object(answer)
  if !is_ok(fields) {
    return answer
  }
  let result = @io.required(fields, "result")
  let refs = @io.required(fields, "sourceRefs")
  let labels : Map[String, Json] = Map::new()
  labels.set("inputFormat", Json::string("source-ranges-v1"))
  ignore(publish(host, "research", out, root, [
    ("draft.json", pretty(draft)),
    ("result.json", pretty(result)),
    ("source-refs.json", pretty(refs)),
  ], labels))
  answer
}

pub fn review(
  host : (String) -> String,
  packet_path : String,
  candidate_path : String,
  draft_path : String,
  out : String,
) -> Json raise @io.IoError {
  let (packet, root, sources) = load_packet_sources(host, packet_path)
  let candidate = read_record(host, candidate_path)
  let candidate_sha = @io.as_string(@io.required(candidate, "sha256"))
  let candidate_text = @io.as_string(@io.required(candidate, "text"))
  let draft = @io.parse(@io.read(host, draft_path))
  let request : Json = {"op": Json::string("buildReview"), "packet": Json::object(packet),
    "sources": Json::array(sources), "candidateSha256": Json::string(candidate_sha),
    "candidateValue": @io.parse(candidate_text), "draft": draft}
  let answer = dispatch_core(request)
  let fields = @io.as_object(answer)
  if !is_ok(fields) {
    return answer
  }
  let review_value = @io.required(fields, "review")
  let refs = review_source_refs(review_value)
  ignore(publish(host, "review", out, root, [
    ("draft.json", pretty(draft)),
    ("review.json", pretty(review_value)),
    ("source-refs.json", pretty(refs)),
  ], Map::new()))
  answer
}

fn review_source_refs(review : Json) -> Json {
  let out : Array[Json] = []
  match review {
    Json::Object(fields) => match fields.get("reviews") {
      Some(Json::Array(reviews)) => {
        for item in reviews {
          match item {
            Json::Object(entry) => {
              let finding_id = entry.get("findingId").unwrap_or(Json::null())
              match entry.get("sourceChecks") {
                Some(Json::Array(checks)) => {
                  for check in checks {
                    match check {
                      Json::Object(check_fields) => {
                        out.push({"findingId": finding_id, "path": check_fields.get("path").unwrap_or(Json::null()),
                          "line": check_fields.get("line").unwrap_or(Json::null()),
                          "quote": check_fields.get("quote").unwrap_or(Json::null()),
                          "kind": check_fields.get("kind").unwrap_or(Json::null())})
                      }
                      _ => ()
                    }
                  }
                }
                _ => ()
              }
            }
            _ => ()
          }
        }
      }
      _ => ()
    }
    _ => ()
  }
  Json::array(out)
}

pub fn revise(
  host : (String) -> String,
  packet_path : String,
  candidate_path : String,
  review_path : String,
  draft_path : String,
  out : String,
) -> Json raise @io.IoError {
  let (packet, root, sources) = load_packet_sources(host, packet_path)
  let candidate = read_record(host, candidate_path)
  let candidate_sha = @io.as_string(@io.required(candidate, "sha256"))
  let candidate_text = @io.as_string(@io.required(candidate, "text"))
  let candidate_value = @io.parse(candidate_text)
  let review_value = @io.parse(@io.read(host, review_path))
  // Bind the preceding review to this exact packet and candidate before any
  // revision is attempted. A mismatched review never produces a candidate.
  let validation : Map[String, Json] = Map::new()
  validation.set("op", Json::string("validateReview"))
  validation.set("sources", Json::array(sources))
  validation.set("candidateSha256", Json::string(candidate_sha))
  validation.set("packet", Json::object(packet))
  validation.set("review", review_value)
  match packet.get("peerReview") {
    Some(Json::Object(peer)) => match peer.get("candidateDraft") {
      Some(Json::Null) | None => ()
      Some(_) => validation.set("candidateValue", candidate_value)
    }
    _ => ()
  }
  let checked = @io.as_object(dispatch_core(Json::object(validation)))
  if !is_ok(checked) {
    return Json::object(checked)
  }
  // The next round must see the exact issue objects from the review that was
  // just bound, separate from the author's responses.
  let review_obj = @io.as_object(review_value)
  let review_peer = @io.as_object(@io.required(review_obj, "peerReview"))
  let review_issues = @io.required(review_peer, "issues")
  let packet_peer_fields = clone(@io.as_object(@io.required(packet, "peerReview")))
  packet_peer_fields.set("previousIssues", review_issues)
  let packet_with_issues = clone(packet)
  packet_with_issues.set("peerReview", Json::object(packet_peer_fields))
  let draft = @io.parse(@io.read(host, draft_path))
  let request : Json = {"op": Json::string("buildRevision"), "packet": Json::object(packet_with_issues),
    "sources": Json::array(sources), "candidateSha256": Json::string(candidate_sha),
    "candidateValue": candidate_value, "draft": draft}
  let answer = dispatch_core(request)
  let fields = @io.as_object(answer)
  if !is_ok(fields) {
    return answer
  }
  let candidate_new = @io.required(fields, "candidate")
  let responses = @io.required(fields, "issueResponses")
  let remaining = @io.required(fields, "remainingChecks")
  let refs = @io.required(fields, "sourceRefs")
  let candidate_text_out = pretty(candidate_new)
  let candidate_hash = @io.hash_text(host, candidate_text_out)
  let packet_new = revised_packet(packet_with_issues, candidate_new, candidate_hash, responses)
  ignore(publish(host, "revise", out, root, [
    ("candidate.json", candidate_text_out),
    ("packet.json", pretty(packet_new)),
    ("draft.json", pretty(draft)),
    ("source-refs.json", pretty(refs)),
  ], Map::new()))
  {"ok": true, "receipt": Json::null(), "remainingChecks": remaining}
}

fn revised_packet(
  packet : Map[String, Json],
  candidate : Json,
  candidate_hash : String,
  responses : Json,
) -> Json {
  let peer : Map[String, Json] = match packet.get("peerReview") {
    Some(Json::Object(fields)) => clone(fields)
    _ => Map::new()
  }
  let round = match peer.get("round") {
    Some(Json::Number(number, ..)) => number.to_int()
    _ => 0
  }
  peer.set("round", Json::number((round + 1).to_double()))
  peer.set("reviewedArtifactSha256", Json::string(candidate_hash))
  peer.set("candidateDraft", candidate)
  // previousIssues are preserved exactly as authored by the opponent; author
  // responses live beside them so resolution can be judged independently.
  peer.set("authorResponses", responses)
  let out = clone(packet)
  out.set("peerReview", Json::object(peer))
  Json::object(out)
}

fn clone(fields : Map[String, Json]) -> Map[String, Json] {
  let out : Map[String, Json] = Map::new()
  for pair in fields.to_array() {
    out.set(pair.0, pair.1)
  }
  out
}

fn string_field(fields : Map[String, Json], key : String) -> String raise @io.IoError {
  @io.as_string(@io.required(fields, key))
}

fn load_ledger(host : (String) -> String, dir : String) -> Json raise @io.IoError {
  let head = @io.as_object(@io.parse(@io.read(host, @io.join(dir, "HEAD.json"))))
  let revision = @io.as_int(@io.required(head, "revision"))
  let file = "generations/" + revision.to_string() + ".json"
  if revision < 0 || string_field(head, "file") != file || !valid_hash(string_field(head, "sha256")) {
    @io.fail("head_identity")
  }
  let found = @io.as_object(@io.call(host, {"op": "readRecord",
    "path": Json::string(@io.join(dir, file)), "maxBytes": Json::number(67108864.0)}))
  if string_field(found, "sha256") != string_field(head, "sha256") {
    @io.fail("generation_changed")
  }
  let state = @io.parse(string_field(found, "text"))
  if @io.as_int(@io.required(@io.as_object(state), "revision")) != revision {
    @io.fail("generation_revision")
  }
  // A matching hash and revision do not prove an internally consistent ledger;
  // run the existing state validation before trusting any stored field.
  let check_request : Json = {"op": Json::string("status"), "state": state}
  let check = @io.as_object(@io.parse(@research.dispatch_json(check_request.stringify())))
  if @io.required(check, "ok") != Json::boolean(true) {
    @io.fail("generation_state_invalid")
  }
  state
}

fn run_by_id(state : Json, run_id : String) -> Map[String, Json] raise @io.IoError {
  let mut found : Map[String, Json]? = None
  for item in @io.as_array(@io.required(@io.as_object(state), "runs")) {
    let fields = @io.as_object(item)
    if string_field(fields, "id") == run_id {
      found = Some(fields)
    }
  }
  match found {
    Some(fields) => fields
    None => @io.fail("run_not_found")
  }
}

fn push_unique(seen : Map[String, Bool], order : Array[String], path : String) -> Unit {
  if !seen.contains(path) {
    seen.set(path, true)
    order.push(path)
  }
}

fn review_brief(run_id : String) -> String {
  "# Machine review brief: source-ranges-v1 peer review\n\n" +
  "Read packet.json and candidate.json in this directory, then read the sources named by " +
  "packet.allowedSourceFiles under packet.frozenSourceRoot. The candidate, packet and copied " +
  "sources are byte-bound; do not read anything else and do not edit, execute, install or fetch. " +
  "packetId for reference: " + run_id + "\n\n" +
  "Return exactly one strict JSON object between <research-review-draft> and " +
  "</research-review-draft>, with no Markdown fences and no text outside the tags:\n\n" +
  "<research-review-draft>{...}</research-review-draft>\n\n" +
  "Top-level keys (all required):\n" +
  "- reviews: array, one entry per finding you reviewed. Entry keys: findingId (must be present " +
  "in packet.selectedFindings), verdict, note (nonempty string), basisFindingIds (array of " +
  "existing finding IDs; the reviewed finding may be its own basis), sourceRefs, remainingChecks.\n" +
  "- questionActions: array of objects {taskId, action, reason, replacement?}; taskId must be in " +
  "packet.tasks, action is keep|park|refine, and replacement is present only for refine.\n" +
  "- infrastructureObservations: array of objects {observation, evidence, reusableChange, " +
  "acceptanceIdea}; evidence is an array of strings.\n" +
  "- coverage: object {unreadSources, unperformedChecks}; both are arrays of strings. Do NOT " +
  "supply reviewedFindingIds or unreviewedFindingIds; the tool derives those. " +
  "coverage.unreadSources may contain only exact packet.allowedSourceFiles.path strings, with no " +
  "explanations; missing, uncopied or out-of-scope sources and every reason belong in " +
  "coverage.unperformedChecks. Never claim to have read an authorSourceFiles entry.\n" +
  "- peerReview: object {disposition, issues}; issues is an array of objects " +
  "{id, findingId, state, note}. Retain EVERY id present in packet.peerReview.previousIssues with " +
  "its current state, including IDs already marked resolved; a resolution is only source-backed " +
  "and independently judged, never inferred from the author's response.\n\n" +
  "reviews[].sourceRefs: array of {path, fromLine, toLine, kind}. path is relative to " +
  "frozenSourceRoot, fromLine and toLine are exact inclusive 1-based line numbers, and kind is " +
  "support|counterexample|scope_limit. The tool extracts exact quote text from the frozen bytes, " +
  "so do NOT supply quote, sha256, line, id, packetId, reviewedArtifactSha256 or round.\n" +
  "reviews[].remainingChecks: array of strings for unresolved checks.\n\n" +
  "verdict: supported|qualified|refuted|unresolved. Use qualified when support is conditional and " +
  "unresolved when evidence is insufficient. Every non-unresolved verdict needs at least one " +
  "basisFindingIds entry; the reviewed finding itself is allowed. Never invent finding IDs.\n" +
  "peerReview.disposition: no_open_issues|changes_requested|disputed|incomplete. issue state: " +
  "open|resolved|disputed. Use no_open_issues only when every selected finding is reviewed and no " +
  "open or disputed issue remains.\n\n" +
  "Review every finding in packet.selectedFindings, or honestly declare unread sources in " +
  "coverage.unreadSources with reasons in coverage.unperformedChecks. Do not fabricate completed " +
  "findings, consensus, runtime results or parent decisions.\n"
}

fn write_entry(
  host : (String) -> String,
  dir : String,
  relative : String,
  text : String,
  entries : Array[Json],
) -> Unit raise @io.IoError {
  let path = @io.join(dir, relative)
  @io.write(host, path, text, Some(0o600), false, true)
  sync(host, path)
  let record = read_record(host, path)
  entries.push({"path": Json::string(relative), "sha256": @io.required(record, "sha256"),
    "bytes": @io.required(record, "bytes")})
}

pub fn export_peer(
  host : (String) -> String,
  ledger_dir : String,
  run_id : String,
  out : String,
  extra_paths : Array[String],
) -> Json raise @io.IoError {
  let ledger_resolved = @io.realpath(host, ledger_dir, false)
  let state = load_ledger(host, ledger_dir)
  let run = run_by_id(state, run_id)
  if string_field(run, "status") != "completed" {
    @io.fail("run_not_completed")
  }
  let receipt = @io.as_object(@io.required(run, "receipt"))
  if @io.required(receipt, "cleanupVerified") != Json::boolean(true) {
    @io.fail("cleanup_not_verified")
  }
  // Canonicalize before any containment comparison so a ".." spelling cannot
  // place output inside the frozen snapshot; a symlinked snapshot is refused.
  let declared_snapshot = string_field(receipt, "snapshotDir")
  let snapshot_dir = @io.realpath(host, declared_snapshot, false)
  if @io.resolve(host, declared_snapshot) != snapshot_dir {
    @io.fail("snapshot_symlink")
  }
  let manifest_path = string_field(receipt, "manifestPath")
  let manifest_sha = string_field(receipt, "manifestSha256")
  let manifest_record = @io.as_object(@io.call(host, {"op": "readRecord",
    "path": Json::string(manifest_path), "maxBytes": Json::number(67108864.0)}))
  if string_field(manifest_record, "sha256") != manifest_sha {
    @io.fail("manifest_changed")
  }
  let manifest = @io.as_object(@io.parse(string_field(manifest_record, "text")))
  let catalog = @io.as_array(@io.required(manifest, "files"))

  let selected : Map[String, Bool] = Map::new()
  let selected_order : Array[String] = []
  let findings : Array[Json] = []
  for item in @io.as_array(@io.required(@io.as_object(state), "findings")) {
    let fields = @io.as_object(item)
    if string_field(fields, "runId") == run_id {
      findings.push(item)
      for evidence in @io.as_array(@io.required(fields, "evidence")) {
        push_unique(selected, selected_order, string_field(@io.as_object(evidence), "path"))
      }
    }
  }
  for path in extra_paths {
    if !relative_safe(path) {
      @io.fail("unsafe_include_path")
    }
    push_unique(selected, selected_order, path)
  }
  let catalog_shas : Map[String, String] = Map::new()
  for item in catalog {
    catalog_shas.set(string_field(@io.as_object(item), "path"), string_field(@io.as_object(item), "sha256"))
  }
  for path in selected_order {
    if !catalog_shas.contains(path) {
      @io.fail("include_outside_manifest")
    }
  }

  let allowed : Array[Json] = []
  for item in catalog {
    let fields = @io.as_object(item)
    if selected.contains(string_field(fields, "path")) {
      allowed.push({"path": Json::string(string_field(fields, "path")),
        "sha256": Json::string(string_field(fields, "sha256"))})
    }
  }
  let selected_findings : Array[Json] = []
  for finding in findings {
    let fields = clone(@io.as_object(finding))
    fields.set("findingId", @io.required(fields, "id"))
    selected_findings.push(Json::object(fields))
  }

  let run_task_id = string_field(run, "taskId")
  let state_tasks = @io.as_array(@io.required(@io.as_object(state), "tasks"))
  let mut concept_id = ""
  for item in state_tasks {
    let fields = @io.as_object(item)
    if string_field(fields, "id") == run_task_id {
      concept_id = string_field(fields, "conceptId")
    }
  }
  let tasks_out : Array[Json] = []
  for item in state_tasks {
    let fields = @io.as_object(item)
    if string_field(fields, "conceptId") == concept_id {
      let task = clone(fields)
      task.set("taskId", @io.required(task, "id"))
      tasks_out.push(Json::object(task))
    }
  }
  let finding_ids : Map[String, Bool] = Map::new()
  for finding in findings {
    finding_ids.set(string_field(@io.as_object(finding), "id"), true)
  }
  let prior_reviews : Array[Json] = []
  match @io.as_object(state).get("reviews") {
    Some(Json::Array(reviews)) => {
      for review in reviews {
        if finding_ids.contains(string_field(@io.as_object(review), "findingId")) {
          prior_reviews.push(review)
        }
      }
    }
    _ => ()
  }
  let locate_sources : Array[Json] = []
  for item in catalog {
    let fields = @io.as_object(item)
    let path = string_field(fields, "path")
    if selected.contains(path) {
      let found = @io.as_object(@io.call(host, {"op": "researchReadRecord",
        "root": Json::string(snapshot_dir), "path": Json::string(path), "maxBytes": Json::number(33554432.0)}))
      locate_sources.push({"path": Json::string(path), "text": @io.required(found, "text"),
        "sha256": @io.required(found, "sha256")})
    }
  }
  let references : Array[Json] = []
  for finding in findings {
    for evidence in @io.as_array(@io.required(@io.as_object(finding), "evidence")) {
      let entry = @io.as_object(evidence)
      references.push({"path": @io.required(entry, "path"), "quote": @io.required(entry, "quote")})
    }
  }
  let locate_request : Json = {"op": Json::string("locate"), "sources": Json::array(locate_sources),
    "references": Json::array(references)}
  let locate_answer = @io.as_object(@io.parse(@researchcheck.dispatch_json(locate_request.stringify())))
  if @io.required(locate_answer, "ok") != Json::boolean(true) {
    @io.fail("evidence_quote_not_located")
  }
  let locate_checks = @io.as_array(@io.required(locate_answer, "checks"))
  let source_refs : Array[Json] = []
  let mut finding_index = 0
  let mut reference_index = 0
  for finding in findings {
    let fields = @io.as_object(finding)
    let finding_id = string_field(fields, "id")
    let mut evidence_index = 0
    for evidence in @io.as_array(@io.required(fields, "evidence")) {
      let entry = @io.as_object(evidence)
      let path = string_field(entry, "path")
      let occurrences = @io.required(@io.as_object(locate_checks[reference_index]), "occurrences")
      source_refs.push({"findingId": Json::string(finding_id),
        "findingIndex": Json::number(finding_index.to_double()),
        "evidenceIndex": Json::number(evidence_index.to_double()),
        "path": Json::string(path), "quote": @io.required(entry, "quote"),
        "sha256": catalog_shas.get(path).unwrap_or(""),
        "occurrences": occurrences})
      evidence_index = evidence_index + 1
      reference_index = reference_index + 1
    }
    finding_index = finding_index + 1
  }

  // Only children this run actually produced: finish names them
  // "<runId>-next-<n>", so a later continuation run's children never leak in.
  let child_prefix = run_id + "-next-"
  let child_ids : Array[Json] = []
  for item in state_tasks {
    let fields = @io.as_object(item)
    let id = string_field(fields, "id")
    match fields.get("parentId") {
      Some(Json::String(parent)) => if parent == run_task_id && id.has_prefix(child_prefix) {
        child_ids.push(Json::string(id))
      }
      _ => ()
    }
  }
  let candidate : Json = {"findings": Json::array(findings), "proposedTaskIds": Json::array(child_ids)}
  let candidate_text = pretty(candidate)
  let candidate_sha = @io.hash_text(host, candidate_text)

  let resolved = @io.resolve(host, out)
  if @io.lstat(host, resolved) is Some(_) {
    @io.fail("output_exists")
  }
  if @io.realpath(host, resolved, true) != resolved {
    @io.fail("output_symlink_ancestor")
  }
  if resolved == snapshot_dir || resolved.has_prefix(snapshot_dir + "/") {
    @io.fail("output_inside_source_root")
  }
  // The ledger is read-only except for this run's own peer handoff directory.
  // External new directories remain available for independent retries.
  if resolved == ledger_resolved || resolved.has_prefix(ledger_resolved + "/") {
    let allowed_peer = @io.join(@io.join(@io.join(ledger_resolved, "runs"), run_id), "peer")
    if resolved != allowed_peer {
      @io.fail("output_inside_ledger")
    }
  }
  if @io.as_bool(@io.call(host, {"op": "stopped"})) {
    @io.fail("stopped_before_publication")
  }
  @io.mkdir(host, resolved, false, Some(0o700), true)
  let source_root = @io.join(resolved, "source")
  @io.mkdir(host, source_root, false, Some(0o700), true)
  let entries : Array[Json] = []
  for item in catalog {
    let fields = @io.as_object(item)
    let path = string_field(fields, "path")
    if !selected.contains(path) {
      continue
    }
    let found = @io.as_object(@io.call(host, {"op": "researchReadRecord",
      "root": Json::string(snapshot_dir), "path": Json::string(path), "maxBytes": Json::number(33554432.0)}))
    let dest = @io.join(source_root, path)
    @io.mkdir(host, @io.dirname(host, dest), true, Some(0o700), false)
    @io.write(host, dest, string_field(found, "text"), Some(0o400), false, true)
    sync(host, dest)
    let copied = read_record(host, dest)
    if string_field(copied, "sha256") != string_field(fields, "sha256") {
      @io.fail("export_copy_changed")
    }
    entries.push({"path": Json::string("source/" + path),
      "sha256": @io.required(copied, "sha256"), "bytes": @io.required(copied, "bytes")})
  }
  let producer : Json = {"provider": @io.required(run, "provider"), "model": @io.required(run, "model"),
    "sessionId": @io.required(receipt, "sessionId")}
  let opposite = if string_field(run, "provider") == "devin" { "deepseek" } else { "devin" }
  let reviewer : Json = {"provider": Json::string(opposite),
    "model": Json::string(if opposite == "devin" { "swe-2-max" } else { "opencode-go/deepseek-v4.1-flash" }),
    "sessionId": Json::null()}
  let peer : Json = {"producer": producer, "reviewer": reviewer,
    "reviewedArtifactSha256": Json::string(candidate_sha), "round": Json::number(1.0),
    "candidateDraft": candidate, "previousIssues": Json::array([])}
  let packet_fields : Map[String, Json] = Map::new()
  packet_fields.set("packetId", Json::string(run_id))
  packet_fields.set("frozenSourceRoot", Json::string(source_root))
  packet_fields.set("allowedSourceFiles", Json::array(allowed))
  packet_fields.set("authorSourceFiles", Json::array(catalog))
  packet_fields.set("selectedFindings", Json::array(selected_findings))
  packet_fields.set("tasks", Json::array(tasks_out))
  packet_fields.set("priorReviews", Json::array(prior_reviews))
  packet_fields.set("sourceRefs", Json::array(source_refs))
  packet_fields.set("aliases", Json::array([]))
  packet_fields.set("sameConceptTasks", Json::array(tasks_out))
  packet_fields.set("peerReview", peer)
  let packet = Json::object(packet_fields)

  write_entry(host, resolved, "candidate.json", candidate_text, entries)
  write_entry(host, resolved, "packet.json", pretty(packet), entries)
  write_entry(host, resolved, "review-brief.txt", review_brief(run_id), entries)
  let receipt_out : Json = {"operation": Json::string("export-peer"), "runId": Json::string(run_id),
    "files": Json::array(entries)}
  write_completion_marker(host, resolved, receipt_out)
  {"ok": true, "path": Json::string(resolved), "receipt": receipt_out}
}
