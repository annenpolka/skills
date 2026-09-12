// Machine-written research artifacts.
//
// The provider supplies semantic fields and exact inclusive source ranges; this
// module extracts the canonical quote text from the supplied frozen bytes and
// stamps identities (packet id, candidate hash, round, coverage) itself. No
// caller quote, hash or id overrides are accepted.

fn reject_unknown(fields : Map[String, Json], allowed : Array[String]) -> Unit raise Invalid {
  for pair in fields.to_array() {
    if !allowed.contains(pair.0) {
      reject("unknown_field_" + pair.0)
    }
  }
}

fn nonempty_str(fields : Map[String, Json], key : String) -> String raise Invalid {
  let value = req_str(fields, key)
  if value.is_empty() {
    reject("empty_" + key)
  }
  value
}

fn clone_object(fields : Map[String, Json]) -> Map[String, Json] {
  let out : Map[String, Json] = Map::new()
  for pair in fields.to_array() {
    out.set(pair.0, pair.1)
  }
  out
}

fn validate_question(item : Json) -> Json raise Invalid {
  let fields = as_obj(item)
  reject_unknown(fields, ["question", "decisionIfTrue", "decisionIfFalse", "kind", "priority"])
  ignore(nonempty_str(fields, "question"))
  ignore(nonempty_str(fields, "decisionIfTrue"))
  ignore(nonempty_str(fields, "decisionIfFalse"))
  let kind = nonempty_str(fields, "kind")
  if !["constraint", "counterexample", "alternative", "integration"].contains(kind) {
    reject("invalid_question_kind")
  }
  let priority = as_pos_int(req(fields, "priority"))
  if priority < 1 || priority > 5 {
    reject("invalid_question_priority")
  }
  item
}

// Extract one canonical citation from an exact inclusive range. The returned
// object carries both the canonical evidence fields and the source-ref identity
// so the quote is derived exactly once.
fn extract_citation(
  entry : Json,
  texts : Map[String, Array[Char]],
  shas : Map[String, String],
) -> Json raise Invalid {
  let fields = as_obj(entry)
  reject_unknown(fields, ["path", "fromLine", "toLine"])
  let path = req_str(fields, "path")
  if !safe_path(path) {
    reject("unsafe_evidence_path")
  }
  let chars = match texts.get(path) {
    Some(chars) => chars
    None => reject("unknown_evidence_path")
  }
  let from_line = as_pos_int(req(fields, "fromLine"))
  let to_line = as_pos_int(req(fields, "toLine"))
  if from_line > to_line {
    reject("invalid_range")
  }
  if to_line > line_count(chars) {
    reject("range_out_of_bounds")
  }
  let quote = extract_lines(chars, from_line, to_line)
  if quote.is_empty() {
    reject("empty_quote")
  }
  let sha = match shas.get(path) {
    Some(sha) => sha
    None => reject("unknown_evidence_path")
  }
  {"path": Json::string(path), "line": Json::number(from_line.to_double()),
    "endLine": Json::number(to_line.to_double()), "sha256": Json::string(sha),
    "quote": Json::string(quote)}
}

fn evidence_of(citation : Json) -> Json raise Invalid {
  let fields = as_obj(citation)
  {"path": req(fields, "path"), "quote": req(fields, "quote")}
}

fn build_research(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, shas) = parse_sources(req(request, "sources"))
  let packet = req_obj(request, "packet")
  bind_allowed(req_arr(packet, "allowedSourceFiles"), shas)
  let draft = req_obj(request, "draft")
  reject_unknown(draft, ["format", "findings", "nextQuestions"])
  if req_str(draft, "format") != "source-ranges-v1" {
    reject("invalid_draft_format")
  }
  let raw_findings = req_arr(draft, "findings")
  if raw_findings.is_empty() {
    reject("empty_findings")
  }
  let findings : Array[Json] = []
  let refs : Array[Json] = []
  let mut finding_index = 0
  for item in raw_findings {
    let fields = as_obj(item)
    reject_unknown(fields, ["statement", "kind", "evidenceRefs", "limitations", "decisionImpact"])
    let statement = nonempty_str(fields, "statement")
    let kind = nonempty_str(fields, "kind")
    if !["source", "inference"].contains(kind) {
      reject("invalid_finding_kind")
    }
    let decision_impact = nonempty_str(fields, "decisionImpact")
    let limitations = req_arr(fields, "limitations")
    for limitation in limitations {
      ignore(as_str(limitation))
    }
    let raw_evidence = req_arr(fields, "evidenceRefs")
    if raw_evidence.is_empty() {
      reject("empty_evidence")
    }
    let evidence : Array[Json] = []
    let mut evidence_index = 0
    for entry in raw_evidence {
      let citation = extract_citation(entry, texts, shas)
      evidence.push(evidence_of(citation))
      let record = clone_object(as_obj(citation))
      record.set("findingIndex", Json::number(finding_index.to_double()))
      record.set("evidenceIndex", Json::number(evidence_index.to_double()))
      refs.push(Json::object(record))
      evidence_index = evidence_index + 1
    }
    findings.push({"statement": Json::string(statement), "kind": Json::string(kind),
      "evidence": Json::array(evidence), "limitations": limitations,
      "decisionImpact": Json::string(decision_impact)})
    finding_index = finding_index + 1
  }
  let raw_questions = req_arr(draft, "nextQuestions")
  if raw_questions.length() > 20 {
    reject("too_many_questions")
  }
  let questions : Array[Json] = []
  for question in raw_questions {
    questions.push(validate_question(question))
  }
  {"ok": true, "errors": [],
    "result": {"findings": Json::array(findings), "nextQuestions": Json::array(questions)},
    "sourceRefs": Json::array(refs)}
}

fn build_review(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, _shas) = parse_sources(req(request, "sources"))
  let packet = req_obj(request, "packet")
  let candidate = req_str(request, "candidateSha256")
  if !valid_sha(candidate) {
    reject("invalid_candidate_hash")
  }
  let packet_peer = req_obj(packet, "peerReview")
  if req_str(packet_peer, "reviewedArtifactSha256") != candidate {
    reject("packet_candidate_hash_mismatch")
  }
  let round = as_pos_int(req(packet_peer, "round"))

  let draft = req_obj(request, "draft")
  reject_unknown(draft, ["reviews", "questionActions", "infrastructureObservations", "coverage", "peerReview"])
  if draft.contains("packetId") {
    reject("generated_field_packetId")
  }
  let draft_peer = req_obj(draft, "peerReview")
  reject_unknown(draft_peer, ["disposition", "issues"])
  if draft_peer.contains("reviewedArtifactSha256") || draft_peer.contains("round") ||
    draft_peer.contains("candidateDraft") || draft_peer.contains("packetId") {
    reject("generated_field_peerReview")
  }
  let draft_coverage = req_obj(draft, "coverage")
  reject_unknown(draft_coverage, ["unreadSources", "unperformedChecks"])
  if draft_coverage.contains("reviewedFindingIds") || draft_coverage.contains("unreviewedFindingIds") {
    reject("generated_field_coverage")
  }

  let finding_ids = collect_ids(req_arr(packet, "selectedFindings"), "findingId")
  let reviews : Array[Json] = []
  let reviewed_ids : Array[String] = []
  let seen : Map[String, Bool] = Map::new()
  for item in req_arr(draft, "reviews") {
    let fields = as_obj(item)
    reject_unknown(fields, ["findingId", "verdict", "note", "basisFindingIds", "sourceRefs", "remainingChecks"])
    if fields.contains("sourceChecks") {
      reject("generated_field_sourceChecks")
    }
    let finding_id = nonempty_str(fields, "findingId")
    if !finding_ids.contains(finding_id) {
      reject("unknown_review_finding")
    }
    if seen.contains(finding_id) {
      reject("duplicate_review")
    }
    seen.set(finding_id, true)
    reviewed_ids.push(finding_id)

    let checks : Array[Json] = []
    for entry in req_arr(fields, "sourceRefs") {
      let ref_fields = as_obj(entry)
      reject_unknown(ref_fields, ["path", "fromLine", "toLine", "kind"])
      if ref_fields.contains("quote") || ref_fields.contains("sha256") || ref_fields.contains("line") {
        reject("generated_field_sourceRef")
      }
      let path = req_str(ref_fields, "path")
      if !safe_path(path) {
        reject("unsafe_check_path")
      }
      let chars = match texts.get(path) {
        Some(chars) => chars
        None => reject("unknown_check_path")
      }
      let from_line = as_pos_int(req(ref_fields, "fromLine"))
      let to_line = as_pos_int(req(ref_fields, "toLine"))
      if from_line > to_line {
        reject("invalid_range")
      }
      if to_line > line_count(chars) {
        reject("range_out_of_bounds")
      }
      let quote = extract_lines(chars, from_line, to_line)
      if quote.is_empty() {
        reject("empty_check_quote")
      }
      let kind = nonempty_str(ref_fields, "kind")
      checks.push({"path": Json::string(path), "line": Json::number(from_line.to_double()),
        "quote": Json::string(quote), "kind": Json::string(kind)})
    }
    reviews.push({"findingId": Json::string(finding_id), "verdict": req(fields, "verdict"),
      "note": req(fields, "note"), "basisFindingIds": req(fields, "basisFindingIds"),
      "sourceChecks": Json::array(checks), "remainingChecks": req(fields, "remainingChecks")})
  }

  let unreviewed : Array[Json] = []
  for id in finding_ids {
    if !seen.contains(id) {
      unreviewed.push(Json::string(id))
    }
  }
  let reviewed_json : Array[Json] = []
  for id in reviewed_ids {
    reviewed_json.push(Json::string(id))
  }
  let coverage : Json = {"reviewedFindingIds": Json::array(reviewed_json),
    "unreviewedFindingIds": Json::array(unreviewed),
    "unreadSources": req(draft_coverage, "unreadSources"),
    "unperformedChecks": req(draft_coverage, "unperformedChecks")}
  let review : Json = {"packetId": req(packet, "packetId"), "reviews": Json::array(reviews),
    "questionActions": req(draft, "questionActions"),
    "infrastructureObservations": req(draft, "infrastructureObservations"),
    "coverage": coverage,
    "peerReview": {"reviewedArtifactSha256": Json::string(candidate),
      "round": Json::number(round.to_double()),
      "disposition": req(draft_peer, "disposition"), "issues": req(draft_peer, "issues")}}

  let validation : Map[String, Json] = Map::new()
  validation.set("sources", req(request, "sources"))
  validation.set("candidateSha256", Json::string(candidate))
  validation.set("packet", Json::object(packet))
  validation.set("review", review)
  match request.get("candidateValue") {
    Some(value) => validation.set("candidateValue", value)
    None => ()
  }
  ignore(validate_review(validation))
  {"ok": true, "errors": [], "review": review}
}

// One logical finding key shared by indexing and reconstruction. Ledger
// findings carry `id`; legacy/exported drafts may carry `findingId`. Both are
// accepted, but a conflict or malformed alias rejects and the original fields
// are never rewritten.
fn finding_key(fields : Map[String, Json]) -> String raise Invalid {
  let primary = match fields.get("id") {
    Some(Json::String(text)) => if text.is_empty() { reject("empty_finding_id") } else { Some(text) }
    Some(_) => reject("invalid_finding_id")
    None => None
  }
  let secondary = match fields.get("findingId") {
    Some(Json::String(text)) => if text.is_empty() { reject("empty_finding_id") } else { Some(text) }
    Some(_) => reject("invalid_finding_id")
    None => None
  }
  match (primary, secondary) {
    (Some(id), Some(finding_id)) => if id != finding_id { reject("conflicting_finding_id") } else { id }
    (Some(id), None) => id
    (None, Some(finding_id)) => finding_id
    (None, None) => reject("missing_finding_id")
  }
}

fn build_revision(request : Map[String, Json]) -> Json raise Invalid {
  let (texts, shas) = parse_sources(req(request, "sources"))
  let packet = req_obj(request, "packet")
  bind_allowed(req_arr(packet, "allowedSourceFiles"), shas)
  let candidate_hash = req_str(request, "candidateSha256")
  if !valid_sha(candidate_hash) {
    reject("invalid_candidate_hash")
  }
  let packet_peer = req_obj(packet, "peerReview")
  if req_str(packet_peer, "reviewedArtifactSha256") != candidate_hash {
    reject("packet_candidate_hash_mismatch")
  }
  let candidate_value = match request.get("candidateValue") {
    Some(value) => as_obj(value)
    None => reject("candidate_value_required")
  }
  // Provider-authored generated identity never survives into the next candidate.
  for reserved in ["sha256", "hash", "round", "reviewedArtifactSha256", "packetId"] {
    if candidate_value.contains(reserved) {
      reject("candidate_generated_field_" + reserved)
    }
  }
  match packet_peer.get("candidateDraft") {
    Some(Json::Null) | None => ()
    Some(draft) => if !json_equal(draft, Json::object(candidate_value)) {
      reject("candidate_draft_mismatch")
    }
  }

  let original = req_arr(candidate_value, "findings")
  let index : Map[String, Map[String, Json]] = Map::new()
  let positions : Map[String, Int] = Map::new()
  let mut position = 0
  for finding in original {
    let fields = as_obj(finding)
    let id = finding_key(fields)
    if index.contains(id) {
      reject("duplicate_candidate_finding")
    }
    index.set(id, clone_object(fields))
    positions.set(id, position)
    position = position + 1
  }

  let draft = req_obj(request, "draft")
  reject_unknown(draft, ["findingPatches", "issueResponses", "remainingChecks"])
  let patch_seen : Map[String, Bool] = Map::new()
  let refs : Array[Json] = []
  for item in req_arr(draft, "findingPatches") {
    let patch = as_obj(item)
    reject_unknown(patch, ["findingId", "statement", "limitations", "decisionImpact", "kind", "evidenceRefs"])
    let finding_id = nonempty_str(patch, "findingId")
    let target = match index.get(finding_id) {
      Some(fields) => fields
      None => reject("unknown_patch_finding")
    }
    if patch_seen.contains(finding_id) {
      reject("duplicate_patch_finding")
    }
    patch_seen.set(finding_id, true)
    match patch.get("kind") {
      Some(value) => if as_str(value) != as_str(req(target, "kind")) {
        reject("kind_change")
      }
      None => ()
    }
    target.set("statement", Json::string(nonempty_str(patch, "statement")))
    let limitations = req_arr(patch, "limitations")
    for limitation in limitations {
      ignore(as_str(limitation))
    }
    target.set("limitations", Json::array(limitations))
    target.set("decisionImpact", Json::string(nonempty_str(patch, "decisionImpact")))
    match patch.get("evidenceRefs") {
      Some(value) => {
        let raw_evidence = as_arr(value)
        if raw_evidence.is_empty() {
          reject("empty_evidence")
        }
        let finding_position = match positions.get(finding_id) {
          Some(value) => value
          None => reject("unknown_patch_finding")
        }
        let evidence : Array[Json] = []
        let mut evidence_index = 0
        for entry in raw_evidence {
          let citation = extract_citation(entry, texts, shas)
          evidence.push(evidence_of(citation))
          let record = clone_object(as_obj(citation))
          record.set("findingIndex", Json::number(finding_position.to_double()))
          record.set("evidenceIndex", Json::number(evidence_index.to_double()))
          refs.push(Json::object(record))
          evidence_index = evidence_index + 1
        }
        target.set("evidence", Json::array(evidence))
      }
      None => ()
    }
  }

  let revised : Array[Json] = []
  for finding in original {
    let id = finding_key(as_obj(finding))
    match index.get(id) {
      Some(fields) => revised.push(Json::object(fields))
      None => reject("unknown_patch_finding")
    }
  }
  let candidate_fields = clone_object(candidate_value)
  candidate_fields.set("findings", Json::array(revised))

  let previous_issues = req_arr(packet_peer, "previousIssues")
  let expected : Map[String, Bool] = Map::new()
  for issue in previous_issues {
    expected.set(nonempty_str(as_obj(issue), "id"), true)
  }
  let responses : Array[Json] = []
  let seen_response : Map[String, Bool] = Map::new()
  for item in req_arr(draft, "issueResponses") {
    let response = as_obj(item)
    reject_unknown(response, ["id", "state", "note"])
    let issue_id = nonempty_str(response, "id")
    if !expected.contains(issue_id) {
      reject("unknown_issue_response")
    }
    if seen_response.contains(issue_id) {
      reject("duplicate_issue_response")
    }
    seen_response.set(issue_id, true)
    let state = nonempty_str(response, "state")
    if !["resolved", "disputed"].contains(state) {
      reject("invalid_issue_response_state")
    }
    ignore(req_str(response, "note"))
    responses.push(Json::object(response))
  }
  if seen_response.to_array().length() != expected.to_array().length() {
    reject("issue_response_coverage")
  }

  let remaining_checks = req_arr(draft, "remainingChecks")
  for check in remaining_checks {
    ignore(as_str(check))
  }
  {"ok": true, "errors": [], "candidate": Json::object(candidate_fields),
    "issueResponses": Json::array(responses), "remainingChecks": Json::array(remaining_checks),
    "sourceRefs": Json::array(refs)}
}
