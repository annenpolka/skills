// The wire result preserves observations and hypotheses as unreviewed source
// material. Matching bytes never upgrades a statement to an accepted fact.
fn success(state : Map[String, Json], result : Json, mutation : Bool) -> Json raise Invalid {
  if mutation { state.set("revision", number(increment(int(get(state, "revision"))))) }
  {"ok": true, "state": Json::object(state), "result": result}
}

fn new_task(fields : Map[String, Json], task_id : String, concept_id : String, parent : Json, turn : Int) -> Json {
  let task : Map[String, Json] = Map::new()
  for key in ["question", "decisionIfTrue", "decisionIfFalse", "kind", "priority"] {
    // question_fields has already required these exact keys.
    match fields.get(key) { Some(value) => task.set(key, value); None => () }
  }
  task.set("id", Json::string(task_id))
  task.set("conceptId", Json::string(concept_id))
  task.set("parentId", parent)
  task.set("status", "queued")
  task.set("createdTurn", number(turn))
  task.set("attempt", 0)
  Json::object(task)
}

fn duplicate_question(tasks : Array[Json], concept_id : String, question : String) -> String? raise Invalid {
  let key = normalized(question)
  for task in tasks {
    let fields = obj(task)
    if id(fields, "conceptId") == concept_id && normalized(text(fields, "question")) == key {
      return Some(id(fields, "id"))
    }
  }
  None
}

fn add(state : Map[String, Json], request : Map[String, Json]) -> Json raise Invalid {
  let roots = policy_roots(state)
  let concept = concept_fields(get(request, "concept"), roots)
  let concept_id = id(concept, "id")
  let concepts = arr(get(state, "concepts"))
  let tasks = arr(get(state, "tasks"))
  if find_id(concepts, concept_id) is Some(_) { reject("concept already exists") }
  let proposed = arr(get(request, "tasks"))
  let seen : Map[String, Bool] = Map::new()
  // Validate the whole batch, including duplicate-question entries, before
  // deriving any accepted records. An invalid late entry rejects the operation.
  for item in proposed {
    let fields = question_fields(item)
    let task_id = id(fields, "id")
    if find_id(tasks, task_id) is Some(_) { reject("task identifier already exists") }
    unique_id(seen, task_id)
  }
  let duplicates : Array[Json] = []
  let added : Array[Json] = []
  let turn = int(get(state, "turn"))
  for item in proposed {
    let fields = obj(item)
    let task_id = id(fields, "id")
    let question = text(fields, "question")
    match duplicate_question(tasks, concept_id, question) {
      Some(existing) => duplicates.push({"id": Json::string(task_id), "question": Json::string(question), "existingTaskId": Json::string(existing)})
      None => {
        let task = new_task(fields, task_id, concept_id, Json::null(), turn)
        tasks.push(task)
        added.push(task)
      }
    }
  }
  // Only the published concept fields are retained from caller input.
  concepts.push({"id": Json::string(concept_id), "title": get(concept, "title"), "premise": get(concept, "premise"), "scope": get(concept, "scope")})
  success(state, {"added": Json::array(added), "duplicates": Json::array(duplicates)}, true)
}

fn claim(state : Map[String, Json], request : Map[String, Json]) -> Json raise Invalid {
  let run_id = id(request, "runId")
  let snapshot_id = text(request, "snapshotId")
  let runs = arr(get(state, "runs"))
  if find_id(runs, run_id) is Some(_) { reject("run identifier already exists") }
  if bool(get(state, "paused")) { return success(state, Json::null(), true) }
  for run in runs {
    if text(obj(run), "status") == "running" { reject("another run is active") }
  }
  let turn = int(get(state, "turn"))
  let tasks = arr(get(state, "tasks"))
  let mut selected : Map[String, Json]? = None
  for item in tasks {
    let task = obj(item)
    if text(task, "status") != "queued" { continue }
    match selected {
      None => selected = Some(task)
      Some(previous) => {
        if turn % 5 != 4 && int(get(task, "priority")) > int(get(previous, "priority")) {
          selected = Some(task)
        }
      }
    }
  }
  let task = match selected { Some(task) => task; None => return success(state, Json::null(), true) }
  let provider = if turn % 2 == 0 { "devin" } else { "deepseek" }
  let model = if turn % 2 == 0 { "swe-2-max" } else { "opencode-go/deepseek-v4.1-flash" }
  let run : Json = {"id": Json::string(run_id), "taskId": get(task, "id"), "provider": Json::string(provider), "model": Json::string(model), "status": "running", "snapshotId": Json::string(snapshot_id)}
  task.set("attempt", number(increment(int(get(task, "attempt")))))
  task.set("status", "running")
  state.set("turn", number(increment(turn)))
  runs.push(run)
  let concept = need_id(arr(get(state, "concepts")), id(task, "conceptId"))
  success(state, {"task": Json::object(task), "concept": Json::object(concept), "run": run}, true)
}

fn finish(state : Map[String, Json], request : Map[String, Json]) -> Json raise Invalid {
  let run_id = id(request, "runId")
  let run = need_id(arr(get(state, "runs")), run_id)
  if text(run, "status") != "running" { reject("run is not current and running") }
  let tasks = arr(get(state, "tasks"))
  let task = need_id(tasks, id(run, "taskId"))
  if text(task, "status") != "running" { reject("task is not running") }
  let receipt = receipt_fields(get(request, "receipt"))
  let status = text(receipt, "status")
  if status != "completed" {
    run.set("status", Json::string(status))
    run.set("receipt", Json::object(receipt))
    task.set("status", "blocked")
    return success(state, {"run": Json::object(run), "duplicates": [], "added": []}, true)
  }
  if text(receipt, "model") != text(run, "model") { reject("completed receipt model mismatch") }
  let session = text(receipt, "sessionId")
  match run.get("continuedFromRunId") {
    None => ()
    Some(value) => {
      let previous = need_id(arr(get(state, "runs")), str(value))
      if session != text(receipt_fields(get(previous, "receipt")), "sessionId") {
        reject("completed continuation session mismatch")
      }
    }
  }
  let result = obj(get(request, "result"))
  let findings = arr(get(result, "findings"))
  if findings.is_empty() { reject("completed run has no findings") }
  let proposed = arr(get(result, "nextQuestions"))
  if proposed.length() > 20 { reject("more than 20 next questions") }
  let checks = arr(get(request, "checks"))
  let concept_id = id(task, "conceptId")
  let concept = need_id(arr(get(state, "concepts")), concept_id)
  let scope = arr(get(concept, "scope"))
  let roots = policy_roots(state)
  for finding in findings { validate_finding(finding, scope, checks, roots) }
  for i = 0; i < proposed.length(); i = i + 1 {
    ignore(question_fields(proposed[i]))
    let task_id = run_id + "-next-" + (i + 1).to_string()
    identifier(task_id)
    if find_id(tasks, task_id) is Some(_) { reject("derived task identifier already exists") }
  }
  let saved_findings = arr(get(state, "findings"))
  let added_findings : Array[Json] = []
  for i = 0; i < findings.length(); i = i + 1 {
    let source = obj(findings[i])
    let finding_id = run_id + "-finding-" + (i + 1).to_string()
    if find_id(saved_findings, finding_id) is Some(_) { reject("finding identifier already exists") }
    let finding : Json = {
      "id": Json::string(finding_id), "runId": Json::string(run_id), "taskId": get(task, "id"),
      "conceptId": Json::string(concept_id), "snapshotId": get(run, "snapshotId"),
      "epistemicStatus": "unreviewed", "statement": get(source, "statement"), "kind": get(source, "kind"),
      "evidence": get(source, "evidence"), "limitations": get(source, "limitations"), "decisionImpact": get(source, "decisionImpact"),
    }
    saved_findings.push(finding)
    added_findings.push(finding)
  }
  let duplicates : Array[Json] = []
  let added : Array[Json] = []
  for i = 0; i < proposed.length(); i = i + 1 {
    let fields = obj(proposed[i])
    let task_id = run_id + "-next-" + (i + 1).to_string()
    let question = text(fields, "question")
    match duplicate_question(tasks, concept_id, question) {
      Some(existing) => duplicates.push({"id": Json::string(task_id), "question": Json::string(question), "existingTaskId": Json::string(existing), "parentId": get(task, "id")})
      None => {
        let child = new_task(fields, task_id, concept_id, get(task, "id"), int(get(state, "turn")))
        tasks.push(child)
        added.push(child)
      }
    }
  }
  task.set("status", "done")
  run.set("status", "completed")
  run.set("receipt", Json::object(receipt))
  run.set("checks", Json::array(checks))
  // Keep suppressed suggestions with the accepted run, not only in the caller's
  // transient response, so future readers can reconstruct cyclic exploration.
  run.set("duplicates", Json::array(duplicates))
  success(state, {"run": Json::object(run), "findings": Json::array(added_findings), "added": Json::array(added), "duplicates": Json::array(duplicates)}, true)
}

fn continue_task(state : Map[String, Json], request : Map[String, Json]) -> Json raise Invalid {
  if bool(get(state, "paused")) { reject("cannot continue while paused") }
  let run_id = id(request, "runId")
  let task_id = id(request, "taskId")
  let runs = arr(get(state, "runs"))
  if find_id(runs, run_id) is Some(_) { reject("run identifier already exists") }
  let mut previous : Map[String, Json]? = None
  for value in runs {
    let run = obj(value)
    if text(run, "status") == "running" { reject("another run is active") }
    if id(run, "taskId") == task_id { previous = Some(run) }
  }
  let task = need_id(arr(get(state, "tasks")), task_id)
  if text(task, "status") != "blocked" { reject("only blocked tasks can be continued") }
  let previous = match previous { Some(value) => value; None => reject("continuation task has no previous run") }
  ignore(continuation_source(previous, index_items(runs)))
  let run : Json = {
    "id": Json::string(run_id), "taskId": Json::string(task_id), "status": "running",
    "provider": get(previous, "provider"), "model": get(previous, "model"),
    "snapshotId": get(previous, "snapshotId"), "continuedFromRunId": get(previous, "id"),
  }
  task.set("attempt", number(increment(int(get(task, "attempt")))))
  task.set("status", "running")
  state.set("turn", number(increment(int(get(state, "turn")))))
  runs.push(run)
  let concept = need_id(arr(get(state, "concepts")), id(task, "conceptId"))
  success(state, {"task": Json::object(task), "concept": Json::object(concept), "run": run, "previousRun": Json::object(previous)}, true)
}

fn query(state : Map[String, Json], request : Map[String, Json]) -> Json raise Invalid {
  let query = normalized(str(get(request, "text")))
  let limit = match request.get("limit") { Some(value) => int(value); None => 20 }
  if limit < 1 || limit > 100 { reject("query limit outside 1..100") }
  let concepts = arr(get(state, "concepts"))
  let all_tasks = arr(get(state, "tasks"))
  let all_findings = arr(get(state, "findings"))
  let exact_task = find_id(all_tasks, query) is Some(_)
  let exact_finding = find_id(all_findings, query) is Some(_)
  let tasks : Array[Json] = []
  let findings : Array[Json] = []
  let returned_ids : Map[String, Bool] = Map::new()
  let mut task_total = 0
  let mut finding_total = 0
  for i = all_tasks.length() - 1; i >= 0; i = i - 1 {
    let task = obj(all_tasks[i])
    let concept = need_id(concepts, id(task, "conceptId"))
    let found = if exact_task {
      id(task, "id") == query
    } else {
      query.is_empty() || normalized(text(task, "question")).contains(query) || normalized(text(concept, "title")).contains(query)
    }
    if found {
      task_total = task_total + 1
      if tasks.length() < limit { tasks.push(all_tasks[i]) }
    }
  }
  for i = all_findings.length() - 1; i >= 0; i = i - 1 {
    let finding = obj(all_findings[i])
    let concept = need_id(concepts, id(finding, "conceptId"))
    let task = need_id(all_tasks, id(finding, "taskId"))
    let mut found = query.is_empty() || normalized(text(finding, "statement")).contains(query) ||
      normalized(text(finding, "decisionImpact")).contains(query) || normalized(text(concept, "title")).contains(query) ||
      normalized(text(task, "question")).contains(query)
    for evidence in arr(get(finding, "evidence")) {
      if normalized(text(obj(evidence), "path")).contains(query) { found = true }
    }
    // IDs are navigable references. Incidental mentions in newer prose must
    // never hide the actual referenced record behind the ordinary result cap.
    if exact_finding {
      found = text(finding, "id") == query
    } else if exact_task {
      found = id(finding, "taskId") == query
    }
    if found {
      finding_total = finding_total + 1
      if findings.length() < limit {
        findings.push(all_findings[i])
        returned_ids.set(text(finding, "id"), true)
      }
    }
  }
  let reviews : Array[Json] = []
  for review in reviews_of(state) {
    if returned_ids.contains(text(obj(review), "findingId")) { reviews.push(review) }
  }
  success(state, {"tasks": Json::array(tasks), "findings": Json::array(findings),
    "reviews": Json::array(reviews),
    "total": {"tasks": number(task_total), "findings": number(finding_total)},
    "truncated": {"tasks": Json::boolean(task_total > tasks.length()), "findings": Json::boolean(finding_total > findings.length())},
    "requiresRevalidation": true}, false)
}

fn status(state : Map[String, Json]) -> Json raise Invalid {
  let counts : Map[String, Json] = Map::new()
  for key in ["concepts", "tasks", "findings", "runs"] { counts.set(key, number(arr(get(state, key)).length())) }
  for key in ["queued", "blocked", "running", "done", "parked"] {
    let mut count = 0
    for task in arr(get(state, "tasks")) {
      if text(obj(task), "status") == key { count = count + 1 }
    }
    counts.set(key, number(count))
  }
  for key in ["paused", "revision", "turn"] { counts.set(key, get(state, key)) }
  success(state, Json::object(counts), false)
}

fn dispatch(request : Map[String, Json]) -> Json raise Invalid {
  let op = text(request, "op")
  if op == "init" {
    return {"ok": true, "state": {"schemaVersion": 1, "revision": 0, "paused": false, "turn": 0,
      "concepts": [], "tasks": [], "findings": [], "runs": [], "reviews": []}, "result": Json::null()}
  }
  let state = state_fields(get(request, "state"))
  match op {
    "add" => add(state, request)
    "claim" => claim(state, request)
    "finish" => finish(state, request)
    "continue" => continue_task(state, request)
    "query" => query(state, request)
    "status" => status(state)
    "pause" | "resume" => {
      state.set("paused", Json::boolean(op == "pause"))
      success(state, {"paused": get(state, "paused")}, true)
    }
    "retry" => {
      let task = need_id(arr(get(state, "tasks")), id(request, "taskId"))
      if text(task, "status") != "blocked" { reject("only blocked tasks can be retried") }
      task.set("status", "queued")
      success(state, {"task": Json::object(task)}, true)
    }
    "park" => {
      let task = need_id(arr(get(state, "tasks")), id(request, "taskId"))
      let reason = text(request, "reason")
      if !["queued", "blocked"].contains(text(task, "status")) { reject("only queued or blocked tasks can be parked") }
      task.set("status", "parked")
      task.set("parkReason", Json::string(reason))
      success(state, {"task": Json::object(task)}, true)
    }
    "unpark" => {
      let task = need_id(arr(get(state, "tasks")), id(request, "taskId"))
      if text(task, "status") != "parked" { reject("only parked tasks can be unparked") }
      task.set("status", "queued")
      success(state, {"task": Json::object(task)}, true)
    }
    "review" => {
      let fields = review_fields(Json::object(request), index_items(arr(get(state, "findings"))))
      let revision = increment(int(get(state, "revision")))
      let review_id = "review-" + revision.to_string()
      let reviews = reviews_of(state)
      if find_id(reviews, review_id) is Some(_) { reject("review identifier already exists") }
      let review : Json = {
        "id": Json::string(review_id), "revision": number(revision),
        "findingId": get(fields, "findingId"), "verdict": get(fields, "verdict"),
        "note": get(fields, "note"), "basisFindingIds": get(fields, "basisFindingIds"), "reviewer": get(fields, "reviewer"),
      }
      reviews.push(review)
      state.set("reviews", Json::array(reviews))
      success(state, {"review": review}, true)
    }
    "reopen" => {
      let task = need_id(arr(get(state, "tasks")), id(request, "taskId"))
      let reason = text(request, "reason")
      if text(task, "status") != "done" { reject("only done tasks can be reopened") }
      let reasons = match task.get("reopenReasons") { Some(value) => arr(value); None => [] }
      reasons.push(Json::string(reason))
      task.set("reopenReasons", Json::array(reasons))
      task.set("status", "queued")
      success(state, {"task": Json::object(task)}, true)
    }
    _ => reject("unknown ledger operation")
  }
}

pub fn dispatch_json(input : String) -> String {
  let parsed = @json.parse(input) catch { _ => return ({"ok": false, "error": "invalid JSON"} : Json).stringify() }
  let result = dispatch(obj(parsed)) catch {
    Invalid(message) => return ({"ok": false, "error": Json::string(message)} : Json).stringify()
  }
  result.stringify()
}
