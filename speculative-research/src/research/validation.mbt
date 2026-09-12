// Deliberately independent of the IO package: ledger acceptance is a pure
// transformation over a freshly parsed value. Rejection returns no new state.
priv suberror Invalid { Invalid(String) }

fn[T] reject(message : String) -> T raise Invalid { raise Invalid(message) }
fn obj(value : Json) -> Map[String, Json] raise Invalid {
  match value { Json::Object(fields) => fields; _ => reject("expected object") }
}
fn arr(value : Json) -> Array[Json] raise Invalid {
  match value { Json::Array(items) => items; _ => reject("expected array") }
}
fn str(value : Json) -> String raise Invalid {
  match value { Json::String(text) => text; _ => reject("expected string") }
}
fn bool(value : Json) -> Bool raise Invalid {
  match value { Json::True => true; Json::False => false; _ => reject("expected boolean") }
}
fn int(value : Json) -> Int raise Invalid {
  match value {
    Json::Number(n, ..) => {
      if n.is_nan() || n.is_inf() || n.floor() != n || n < 0.0 || n > 2147483647.0 {
        reject("expected nonnegative bounded integer")
      }
      n.to_int()
    }
    _ => reject("expected integer")
  }
}
fn get(fields : Map[String, Json], key : String) -> Json raise Invalid {
  match fields.get(key) { Some(value) => value; None => reject("missing field " + key) }
}
fn text(fields : Map[String, Json], key : String) -> String raise Invalid {
  let value = str(get(fields, key))
  if value.trim().is_empty() { reject("empty field " + key) }
  value
}
fn number(n : Int) -> Json { Json::number(n.to_double()) }
fn increment(n : Int) -> Int raise Invalid {
  if n == 2147483647 { reject("ledger counter capacity reached; history retained") }
  n + 1
}
fn identifier(value : String) -> Unit raise Invalid {
  if value.length() < 1 || value.length() > 100 { reject("invalid identifier length") }
  for ch in value.to_array() {
    if !((ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9') || ch == '-') {
      reject("invalid identifier")
    }
  }
}
fn id(fields : Map[String, Json], key : String) -> String raise Invalid {
  let value = text(fields, key)
  identifier(value)
  value
}
fn normalized(value : String) -> String {
  let builder = StringBuilder::new()
  for ch in value.trim().to_owned().to_array() {
    if ch >= 'A' && ch <= 'Z' {
      builder.write_stringview(ch.to_string().to_lower())
    } else {
      builder.write_char(ch)
    }
  }
  builder.to_string()
}

// A pinned project root is either an exact relative file path or a directory
// prefix that ends in '/'. The admission set is never a process global: callers
// pass the roots pinned at init, so changing an external profile after init
// cannot widen scope and a legacy ledger without a policy cannot be opened.
fn canonical_source(path : String, directory_ok : Bool) -> Unit raise Invalid {
  if path.is_empty() || path.has_prefix("/") || path.contains("\\") {
    reject("invalid source path")
  }
  if !directory_ok && path.has_suffix("/") { reject("evidence must name a file") }
  let parts = path.split("/").to_array()
  for i = 0; i < parts.length(); i = i + 1 {
    let part = parts[i].to_owned()
    if directory_ok && i == parts.length() - 1 && part.is_empty() { continue }
    let lower = part.to_lower()
    if part.is_empty() || part.has_prefix(".") || lower.contains("auth") ||
       lower.contains("credential") || lower.contains(".env") {
      reject("protected or noncanonical source path")
    }
    for ch in part.to_array() {
      if ch.to_int() < 32 || ch.to_int() == 127 { reject("control character in source path") }
    }
  }
}

fn root_pattern(value : String) -> Unit raise Invalid {
  canonical_source(value, true)
}

fn source_path(path : String, roots : Array[String], directory_ok : Bool) -> Unit raise Invalid {
  canonical_source(path, directory_ok)
  for root in roots {
    if path == root || (root.has_suffix("/") && path.has_prefix(root)) { return }
  }
  reject("source path outside pinned project roots")
}

fn in_scope(path : String, scope : Array[Json], roots : Array[String]) -> Unit raise Invalid {
  source_path(path, roots, false)
  for item in scope {
    let boundary = str(item)
    if path == boundary || (boundary.has_suffix("/") && path.has_prefix(boundary)) { return }
  }
  reject("evidence outside concept scope")
}

fn policy_roots(state : Map[String, Json]) -> Array[String] raise Invalid {
  let policy = match state.get("policy") {
    Some(value) => obj(value)
    None => reject("legacy_ledger_requires_migration: pinned project policy missing")
  }
  ignore(text(policy, "projectName"))
  let roots = arr(get(policy, "allowedRoots"))
  if roots.is_empty() { reject("pinned project roots are empty") }
  let out : Array[String] = []
  for item in roots {
    let value = str(item)
    root_pattern(value)
    out.push(value)
  }
  out
}

fn concept_fields(value : Json, roots : Array[String]) -> Map[String, Json] raise Invalid {
  let fields = obj(value)
  ignore(id(fields, "id"))
  ignore(text(fields, "title"))
  ignore(text(fields, "premise"))
  let scope = arr(get(fields, "scope"))
  if scope.is_empty() { reject("concept scope is empty") }
  for item in scope { source_path(str(item), roots, true) }
  fields
}

// Strict project profile validation. Unknown fields and noncanonical,
// traversal, hidden or credential roots are rejected before any ledger write.
pub fn profile_policy(input : String) -> String {
  let parsed = @json.parse(input) catch {
    _ => return ({"ok": false, "error": "invalid_profile_json"} : Json).stringify()
  }
  let result : Result[Json, String] = try {
    Ok(parse_profile(parsed))
  } catch {
    Invalid(message) => Err(message)
  }
  match result {
    Ok(value) => ({"ok": true, "value": value} : Json).stringify()
    Err(message) => ({"ok": false, "error": Json::string(message)} : Json).stringify()
  }
}

fn parse_profile(value : Json) -> Json raise Invalid {
  let fields = obj(value)
  let allowed = ["schemaVersion", "projectName", "allowedRoots", "devinHelper", "deepseekHelper"]
  for pair in fields.to_array() {
    if !allowed.contains(pair.0) { reject("unknown profile field " + pair.0) }
  }
  for key in allowed { ignore(get(fields, key)) }
  if int(get(fields, "schemaVersion")) != 1 { reject("unsupported profile schemaVersion") }
  let project = text(fields, "projectName")
  let root_values = arr(get(fields, "allowedRoots"))
  if root_values.is_empty() { reject("empty allowedRoots") }
  let roots : Array[Json] = []
  for item in root_values {
    let value = str(item)
    root_pattern(value)
    roots.push(Json::string(value))
  }
  let devin = text(fields, "devinHelper")
  let deepseek = text(fields, "deepseekHelper")
  if !devin.has_prefix("/") { reject("devinHelper must be an absolute path") }
  if !deepseek.has_prefix("/") { reject("deepseekHelper must be an absolute path") }
  {"projectName": Json::string(project), "allowedRoots": Json::array(roots),
    "devinHelper": Json::string(devin), "deepseekHelper": Json::string(deepseek)}
}

fn question_fields(value : Json) -> Map[String, Json] raise Invalid {
  let fields = obj(value)
  ignore(text(fields, "question"))
  ignore(text(fields, "decisionIfTrue"))
  ignore(text(fields, "decisionIfFalse"))
  if !["constraint", "counterexample", "alternative", "integration"].contains(text(fields, "kind")) {
    reject("invalid question kind")
  }
  let priority = int(get(fields, "priority"))
  if priority < 1 || priority > 5 { reject("priority outside 1..5") }
  fields
}

fn find_id(items : Array[Json], wanted : String) -> Map[String, Json]? raise Invalid {
  for item in items {
    let fields = obj(item)
    if str(get(fields, "id")) == wanted { return Some(fields) }
  }
  None
}

fn need_id(items : Array[Json], wanted : String) -> Map[String, Json] raise Invalid {
  match find_id(items, wanted) { Some(fields) => fields; None => reject("unresolved identifier") }
}

fn unique_id(seen : Map[String, Bool], value : String) -> Unit raise Invalid {
  if seen.contains(value) { reject("duplicate identifier") }
  seen.set(value, true)
}

fn index_items(items : Array[Json]) -> Map[String, Map[String, Json]] raise Invalid {
  let index : Map[String, Map[String, Json]] = Map::new()
  for item in items {
    let fields = obj(item)
    let key = text(fields, "id")
    if index.contains(key) { reject("duplicate identifier") }
    index.set(key, fields)
  }
  index
}

fn indexed(index : Map[String, Map[String, Json]], key : String) -> Map[String, Json] raise Invalid {
  match index.get(key) { Some(value) => value; None => reject("unresolved identifier") }
}

fn receipt_fields(value : Json) -> Map[String, Json] raise Invalid {
  let fields = obj(value)
  if !["completed", "failed", "timed_out", "permission_required", "interrupted", "invalid_output", "source_changed"].contains(text(fields, "status")) {
    reject("invalid receipt status")
  }
  // External receipt values are retained as data. Only status and the explicit
  // completed model/session contract affect admission; null usage is unknown.
  for key in ["model", "sessionId", "artifactDir", "usage", "cost"] { ignore(get(fields, key)) }
  fields
}

fn reviews_of(state : Map[String, Json]) -> Array[Json] raise Invalid {
  match state.get("reviews") { Some(value) => arr(value); None => [] }
}

fn reopen_count(task : Map[String, Json]) -> Int raise Invalid {
  match task.get("reopenReasons") {
    None => 0
    Some(value) => {
      let reasons = arr(value)
      for reason in reasons {
        if str(reason).trim().is_empty() { reject("empty reopen reason") }
      }
      reasons.length()
    }
  }
}

fn review_fields(value : Json, findings : Map[String, Map[String, Json]]) -> Map[String, Json] raise Invalid {
  let fields = obj(value)
  let finding_id = text(fields, "findingId")
  ignore(indexed(findings, finding_id))
  let verdict = text(fields, "verdict")
  if !["supported", "refuted", "qualified", "superseded"].contains(verdict) { reject("invalid review verdict") }
  ignore(text(fields, "note"))
  ignore(text(fields, "reviewer"))
  let basis = arr(get(fields, "basisFindingIds"))
  if basis.is_empty() { reject("review requires existing basis findings") }
  let mut has_replacement = false
  for item in basis {
    let basis_id = str(item)
    ignore(indexed(findings, basis_id))
    if basis_id != finding_id { has_replacement = true }
  }
  if verdict == "superseded" && !has_replacement { reject("superseded review requires another finding") }
  fields
}

fn continuation_source(previous : Map[String, Json], runs : Map[String, Map[String, Json]]) -> Map[String, Json] raise Invalid {
  if text(previous, "status") != "invalid_output" { reject("only invalid output can be corrected in the same session") }
  let receipt = receipt_fields(get(previous, "receipt"))
  if text(receipt, "model") != text(previous, "model") { reject("continuation source model mismatch") }
  let session = text(receipt, "sessionId")
  if !bool(get(receipt, "cleanupVerified")) { reject("continuation source cleanup is not verified") }
  match previous.get("continuedFromRunId") {
    None => ()
    Some(value) => {
      let ancestor = indexed(runs, str(value))
      let original_receipt = receipt_fields(get(ancestor, "receipt"))
      if session != text(original_receipt, "sessionId") {
        reject("failed correction cannot switch the continuation session")
      }
    }
  }
  receipt
}

fn state_fields(value : Json) -> Map[String, Json] raise Invalid {
  let state = obj(value)
  if int(get(state, "schemaVersion")) != 1 { reject("unsupported ledger schema") }
  let roots = policy_roots(state)
  let revision = int(get(state, "revision"))
  let turn = int(get(state, "turn"))
  ignore(bool(get(state, "paused")))
  let concepts = arr(get(state, "concepts"))
  let tasks = arr(get(state, "tasks"))
  let runs = arr(get(state, "runs"))
  let findings = arr(get(state, "findings"))
  if runs.length() != turn { reject("turn does not match run history") }
  let concept_index = index_items(concepts)
  let task_index = index_items(tasks)
  let run_index = index_items(runs)
  let concept_ids : Map[String, Bool] = Map::new()
  for concept in concepts { unique_id(concept_ids, id(concept_fields(concept, roots), "id")) }
  let task_ids : Map[String, Bool] = Map::new()
  let questions : Map[String, Bool] = Map::new()
  let mut running_tasks = 0
  for task in tasks {
    let fields = question_fields(task)
    unique_id(task_ids, id(fields, "id"))
    let concept_id = id(fields, "conceptId")
    if !concept_ids.contains(concept_id) { reject("task concept missing") }
    let key = concept_id + "\n" + normalized(text(fields, "question"))
    if questions.contains(key) { reject("duplicate task question in state") }
    questions.set(key, true)
    let status = text(fields, "status")
    if !["queued", "running", "done", "blocked", "parked"].contains(status) { reject("invalid task status") }
    if status == "parked" || fields.contains("parkReason") { ignore(text(fields, "parkReason")) }
    if status == "running" { running_tasks = running_tasks + 1 }
    if int(get(fields, "createdTurn")) > turn { reject("task created beyond current turn") }
    ignore(int(get(fields, "attempt")))
    ignore(reopen_count(fields))
    match get(fields, "parentId") {
      Json::Null => ()
      value => {
        let parent_id = str(value)
        let parent = indexed(task_index, parent_id)
        if !task_ids.contains(parent_id) || parent_id == id(fields, "id") || id(parent, "conceptId") != concept_id {
          reject("invalid parent lineage")
        }
      }
    }
  }
  let run_ids : Map[String, Bool] = Map::new()
  let attempts : Map[String, Int] = Map::new()
  let last_status : Map[String, String] = Map::new()
  let last_run_ids : Map[String, String] = Map::new()
  let completions : Map[String, Int] = Map::new()
  let mut running_runs = 0
  for i = 0; i < runs.length(); i = i + 1 {
    let run = runs[i]
    let fields = obj(run)
    unique_id(run_ids, id(fields, "id"))
    let task_id = id(fields, "taskId")
    let task = indexed(task_index, task_id)
    attempts.set(task_id, match attempts.get(task_id) { Some(n) => n + 1; None => 1 })
    ignore(text(fields, "snapshotId"))
    match fields.get("continuedFromRunId") {
      None => {
        if text(fields, "provider") != (if i % 2 == 0 { "devin" } else { "deepseek" }) {
          reject("provider disagrees with admission turn")
        }
      }
      Some(value) => {
        let previous_id = str(value)
        if last_run_ids.get(task_id) != Some(previous_id) { reject("continuation must refer to this task's preceding run") }
        let previous = indexed(run_index, previous_id)
        let previous_receipt = continuation_source(previous, run_index)
        for key in ["taskId", "provider", "model", "snapshotId"] {
          if text(fields, key) != text(previous, key) { reject("continuation identity mismatch") }
        }
        if text(fields, "status") == "completed" {
          let receipt = receipt_fields(get(fields, "receipt"))
          if text(receipt, "sessionId") != text(previous_receipt, "sessionId") {
            reject("historical continuation session mismatch")
          }
        }
      }
    }
    last_run_ids.set(task_id, id(fields, "id"))
    let expected = match text(fields, "provider") {
      "devin" => "swe-2-max"
      "deepseek" => "opencode-go/deepseek-v4.1-flash"
      _ => reject("invalid run provider")
    }
    if text(fields, "model") != expected { reject("invalid run model") }
    let status = text(fields, "status")
    if last_status.get(task_id) is Some("completed") {
      let completed = match completions.get(task_id) { Some(n) => n; None => 0 }
      if reopen_count(task) < completed { reject("completed task has no explicit reopen for later run") }
    }
    if status == "completed" {
      completions.set(task_id, match completions.get(task_id) { Some(n) => n + 1; None => 1 })
    }
    last_status.set(task_id, status)
    if status == "running" {
      running_runs = running_runs + 1
      if text(task, "status") != "running" || i != runs.length() - 1 { reject("run task is not current and running") }
    } else {
      let receipt = receipt_fields(get(fields, "receipt"))
      if text(receipt, "status") != status { reject("receipt status mismatch") }
      if status == "completed" {
        if text(receipt, "model") != expected { reject("historical receipt model mismatch") }
        ignore(text(receipt, "sessionId"))
        ignore(arr(get(fields, "checks")))
      }
    }
  }
  if running_runs > 1 || running_tasks != running_runs { reject("inconsistent running state") }
  for task in tasks {
    let fields = obj(task)
    let task_id = id(fields, "id")
    let attempt = match attempts.get(task_id) { Some(n) => n; None => 0 }
    if int(get(fields, "attempt")) != attempt { reject("task attempt disagrees with history") }
    let status = text(fields, "status")
    let completed = match completions.get(task_id) { Some(n) => n; None => 0 }
    let reopened = reopen_count(fields)
    let expected_reopened = if status == "done" { completed - 1 } else { completed }
    if reopened != expected_reopened { reject("reopen reasons disagree with completed history") }
    match last_status.get(task_id) {
      None => if status != "queued" && status != "parked" { reject("task status has no supporting run") }
      Some("completed") => if !["done", "queued", "parked"].contains(status) { reject("completed task status mismatch") }
      Some("running") => if status != "running" { reject("running task status mismatch") }
      Some(_) => if status != "blocked" && status != "queued" && status != "parked" { reject("failed task status mismatch") }
    }
  }
  let finding_ids : Map[String, Bool] = Map::new()
  for finding in findings {
    let fields = obj(finding)
    unique_id(finding_ids, text(fields, "id"))
    let run = indexed(run_index, id(fields, "runId"))
    let task = indexed(task_index, id(fields, "taskId"))
    if text(run, "status") != "completed" || id(run, "taskId") != id(task, "id") ||
       id(fields, "conceptId") != id(task, "conceptId") || text(fields, "snapshotId") != text(run, "snapshotId") {
      reject("inconsistent finding provenance")
    }
    if text(fields, "epistemicStatus") != "unreviewed" { reject("unsupported finding epistemic status") }
    let concept = indexed(concept_index, id(fields, "conceptId"))
    validate_finding(finding, arr(get(concept, "scope")), arr(get(run, "checks")), roots)
  }
  let finding_index = index_items(findings)
  let review_ids : Map[String, Bool] = Map::new()
  let mut previous_review_revision = 0
  for review in reviews_of(state) {
    let fields = review_fields(review, finding_index)
    unique_id(review_ids, id(fields, "id"))
    let recorded_revision = int(get(fields, "revision"))
    if recorded_revision <= previous_review_revision || recorded_revision > revision { reject("invalid review revision order") }
    previous_review_revision = recorded_revision
  }
  state
}

fn validate_finding(value : Json, scope : Array[Json], checks : Array[Json], roots : Array[String]) -> Unit raise Invalid {
  let finding = obj(value)
  ignore(text(finding, "statement"))
  ignore(text(finding, "decisionImpact"))
  if !["source", "inference"].contains(text(finding, "kind")) { reject("invalid finding kind") }
  for limitation in arr(get(finding, "limitations")) { ignore(str(limitation)) }
  let evidence = arr(get(finding, "evidence"))
  if evidence.is_empty() { reject("finding has no evidence") }
  for entry in evidence {
    let fields = obj(entry)
    let path = text(fields, "path")
    let quote = text(fields, "quote")
    in_scope(path, scope, roots)
    let mut matched = false
    for check in checks {
      let checked = obj(check)
      if text(checked, "path") == path && text(checked, "quote") == quote {
        let hash = text(checked, "sha256")
        if hash.length() != 64 { reject("invalid evidence hash") }
        for ch in hash.to_array() {
          if !((ch >= 'a' && ch <= 'f') || (ch >= '0' && ch <= '9')) { reject("invalid evidence hash") }
        }
        if !bool(get(checked, "matched")) { reject("evidence quote did not match snapshot") }
        matched = true
      }
    }
    if !matched { reject("evidence has no matching snapshot check") }
  }
}
