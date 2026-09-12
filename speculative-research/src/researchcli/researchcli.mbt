priv struct Context {
  host : (String) -> String
  async_host : (String, (String) -> Unit) -> Unit
  done : (String) -> Unit
  root : String
  dir : String
  profile : String
  node : String
  owner : String
  pid : Int
  mut state_lock : Bool
  mut tick_lock : Bool
  mut stopped : Bool
  mut finished : Bool
  mut claimed : Json?
  mut run_id : String
  mut run_dir : String
  mut manifest : Array[Json]
  mut manifest_sha : String
  mut snapshot_dir : String
  mut manifest_path : String
  mut session : String?
}
fn respond(ctx : Context, value : Result[Json, String]) -> Unit {
  if ctx.finished { return }
  let mut error : String? = match value { Err(message) => Some(message); _ => None }
  for name in ["state.lock", "tick.lock"] {
    try { release(ctx, name) } catch {
      @io.Io(message) => error = Some(match error { Some(before) => before + "; cleanup: " + message; None => message })
    }
  }
  let output : Json = match error {
    Some(message) => {"ok":false, "error":Json::string(message)}
    None => {"ok":true, "result":match value { Ok(result) => result; _ => Json::null() }}
  }
  try { @io.print(ctx.host, output.stringify() + "\n", false) } catch { @io.Io(message) => error = Some(message) }
  ctx.finished = true
  (ctx.done)(({"exitCode":Json::number(if error is Some(_) { 1 } else { 0 }),
    "error":match error { Some(message) => Json::string(message); None => Json::null() }} : Json).stringify())
}
fn initialize(ctx : Context) -> Json raise @io.IoError {
  if @io.lstat(ctx.host, @io.join(ctx.dir, "HEAD.json")) is Some(_) { @io.fail("already_initialized") }
  if ctx.profile == "" { @io.fail("init_requires_profile") }
  let raw = read_json(ctx.host, @io.resolve(ctx.host, ctx.profile))
  let decision = @io.as_object(@io.parse(@research.profile_policy(raw.stringify())))
  if @io.required(decision, "ok") != Json::boolean(true) { @io.fail(text(Json::object(decision), "error")) }
  let profile = @io.as_object(@io.required(decision, "value"))
  let profile_json = Json::object(profile)
  let helper_devin = @io.realpath(ctx.host, text(profile_json, "devinHelper"), false)
  let helper_deepseek = @io.realpath(ctx.host, text(profile_json, "deepseekHelper"), false)
  regular(ctx.host, helper_devin)
  regular(ctx.host, helper_deepseek)
  @io.mkdir(ctx.host, ctx.dir, true, Some(0o700), false)
  directory(ctx.host, ctx.dir)
  acquire(ctx, "state.lock")
  if @io.lstat(ctx.host, @io.join(ctx.dir, "HEAD.json")) is Some(_) { @io.fail("already_initialized") }
  for name in ["generations", "runs"] { @io.mkdir(ctx.host, @io.join(ctx.dir, name), false, Some(0o700), false) }
  let config : Json = {"schemaVersion":1,
    "devinHelper":Json::string(helper_devin),
    "deepseekHelper":Json::string(helper_deepseek)}
  save_json(ctx.host, @io.join(ctx.dir, "config.json"), config, true)
  let answer = ledger_call("init", Json::null(), {})
  let state = @io.as_object(get(answer, "state"))
  state.set("policy", {"projectName": get(profile_json, "projectName"), "allowedRoots": get(profile_json, "allowedRoots")})
  state.set("projectConfig", config)
  publish(ctx, Json::object(state))
  get(ledger_call("status", Json::object(state), {}), "result")
}
fn mutate(ctx : Context, op : String, extras : Json) -> Json raise @io.IoError {
  acquire(ctx, "state.lock")
  let state = load(ctx)
  let answer = ledger_call(op, state, extras)
  publish(ctx, get(answer, "state"))
  get(answer, "result")
}
fn context_for(claimed : Json, state : Json) -> Json raise @io.IoError {
  let selected : Array[Json] = []
  let ancestors : Array[String] = []
  let task = get(claimed, "task")
  let mut parent = field(task, "parentId")
  let tasks = @io.as_array(get(state, "tasks"))
  while parent is Json::String(id) {
    if ancestors.contains(id) { @io.fail("task_ancestry_cycle") }
    ancestors.push(id)
    let mut next : Json = Json::null()
    for candidate in tasks { if text(candidate, "id") == id { next = field(candidate, "parentId") } }
    parent = next
  }
  let relevant : Array[Json] = []
  for finding in @io.as_array(get(state, "findings")) {
    if text(finding, "conceptId") == text(task, "conceptId") { relevant.push(finding) }
  }
  // Bound context, not the durable ledger; expose omitted count and parent IDs.
  for id in ancestors {
    for i = relevant.length() - 1; i >= 0 && selected.length() < 12; i = i - 1 {
      if text(relevant[i], "taskId") == id { selected.push(relevant[i]) }
    }
  }
  for i = relevant.length() - 1; i >= 0 && selected.length() < 12; i = i - 1 {
    if !selected.contains(relevant[i]) { selected.push(relevant[i]) }
  }
  let review_context : Array[Json] = []
  let selected_ids = selected.map(item => text(item, "id"))
  let mut reviews_omitted = 0
  if field(state, "reviews") is Json::Array(reviews) {
    for i = reviews.length()-1; i >= 0; i = i-1 {
      if selected_ids.contains(text(reviews[i], "findingId")) {
        if review_context.length() < 24 { review_context.push(reviews[i]) }
        else { reviews_omitted = reviews_omitted+1 }
      }
    }
  }
  let shown_parents : Array[Json] = []
  for i, id in ancestors { if i < 12 { shown_parents.push(Json::string(id)) } }
  {"parentTaskIds":Json::array(shown_parents), "omittedParentTaskIds":Json::number((ancestors.length()-shown_parents.length()).to_double()),
    "findings":Json::array(selected), "reviews":Json::array(review_context), "omittedReviews":Json::number(reviews_omitted.to_double()),
    "omittedFindings":Json::number((relevant.length() - selected.length()).to_double()),
    "notice":"Prior findings are unreviewed data from older frozen snapshots. Recheck exact quotes against this run's snapshot before using them."}
}
fn prepare_tick(ctx : Context, continuation : String?) -> Json? raise @io.IoError {
  let initial = load(ctx)
  if get(initial, "paused") == Json::boolean(true) {
    if continuation is Some(_) { @io.fail("cannot_continue_while_paused") }
    return None
  }
  if @io.lstat(ctx.host, @io.join(ctx.dir, "recovery-needed.json")) is Some(_) { @io.fail("recovery_requires_confirmed_helper_shutdown") }
  acquire(ctx, "tick.lock")
  acquire(ctx, "state.lock")
  let state = load(ctx)
  if get(state, "paused") == Json::boolean(true) {
    if continuation is Some(_) { @io.fail("cannot_continue_while_paused") }
    return None
  }
  ctx.run_id = "run-" + @io.random_hex(ctx.host, 12)
  let answer = match continuation {
    Some(task_id) => ledger_call("continue", state, {"taskId":Json::string(task_id), "runId":Json::string(ctx.run_id)})
    None => ledger_call("claim", state, {"runId":Json::string(ctx.run_id), "snapshotId":Json::string("snapshot-" + ctx.run_id)})
  }
  let claimed = get(answer, "result")
  if claimed == Json::null() { return None }
  publish(ctx, get(answer, "state"))
  ctx.claimed = Some(claimed)
  ctx.run_dir = @io.join(ctx.dir, "runs/" + ctx.run_id)
  phase(ctx, "preparing")
  release(ctx, "state.lock")
  let correction = match continuation {
    Some(_) => reuse_snapshot(ctx, claimed, state)
    None => { snapshot(ctx, claimed); "" }
  }
  let policy = @io.as_object(get(state, "policy"))
  let project = match policy.get("projectName") {
    Some(Json::String(name)) if name != "" => name
    _ => "this project"
  }
  let prompt = brief(claimed, project) + "\nWrite the findings, decision impact, limitations and final prose in Japanese. Preserve exact source quotes unchanged.\nPrior context:\n" + context_for(claimed, state).stringify() + correction
  @io.write(ctx.host, @io.join(ctx.run_dir, "brief.txt"), prompt, Some(0o600), false, true)
  sync(ctx.host, @io.join(ctx.run_dir, "brief.txt"))
  let request = action(ctx, claimed)
  save_json(ctx.host, @io.join(ctx.run_dir, "launch.json"), request, true)
  ignore(@io.call(ctx.host, {"op":"verifyTool"}))
  if ctx.stopped || @io.as_bool(@io.call(ctx.host, {"op":"stopped"})) { @io.fail("stopped_before_launch") }
  phase(ctx, "launch_pending")
  Some(request)
}
fn augment_query(ctx : Context, state : Json, answer : Json) -> Json raise @io.IoError {
  let result = @io.as_object(@io.parse(answer.stringify()))
  let findings = @io.as_array(@io.required(result, "findings"))
  for finding in findings {
    let fields = @io.as_object(finding)
    let checks : Array[Json] = []
    let evidence_paths = @io.as_array(get(finding, "evidence")).map(item => text(item, "path"))
    for run in @io.as_array(get(state, "runs")) {
      if text(run, "id") == text(finding, "runId") {
        fields.set("runReceipt", field(run, "receipt"))
        if field(run, "checks") is Json::Array(items) {
          for check in items { if evidence_paths.contains(text(check, "path")) { checks.push(check) } }
        }
      }
    }
    let sources : Array[Json] = []
    let seen : Array[String] = []
    let mut overall = "matching"
    for check in checks {
      let path = text(check, "path")
      if seen.contains(path) { continue }
      seen.push(path)
      let mut current_hash : Json = Json::null()
      let observed : Result[String, String] = try {
        if @io.lstat(ctx.host, @io.join(ctx.root, path)) is None { Ok("missing") }
        else {
          let found = source_record(ctx, ctx.root, path)
          current_hash = get(found, "sha256")
          Ok(if current_hash == get(check, "sha256") { "matching" } else { "changed" })
        }
      } catch { @io.Io(_) => Err("unavailable") }
      let status = match observed { Ok(value) => value; Err(value) => value }
      if status != "matching" { overall = if overall == "matching" { status } else if overall == status { overall } else { "unavailable" } }
      sources.push({"path":Json::string(path), "snapshotSha256":get(check, "sha256"), "currentSha256":current_hash, "status":Json::string(status)})
    }
    if sources.is_empty() { overall = "unavailable" }
    fields.set("currentSourceStatus", Json::string(overall))
    fields.set("currentSources", Json::array(sources))
    fields.set("requiresRevalidation", true)
  }
  Json::object(result)
}
fn read_command(ctx : Context, command : String, argument : String) -> Json raise @io.IoError {
  let state = load(ctx)
  let answer = get(ledger_call(command, state, if command == "query" { {"text":Json::string(argument)} } else { {} }), "result")
  if command == "query" { return augment_query(ctx, state, answer) }
  let fields = @io.as_object(answer)
  fields.set("recoveryRequired", Json::boolean(@io.lstat(ctx.host, @io.join(ctx.dir, "recovery-needed.json")) is Some(_)))
  fields.set("tickLocked", Json::boolean(@io.lstat(ctx.host, @io.join(ctx.dir, "tick.lock")) is Some(_)))
  Json::object(fields)
}
fn run_command(ctx : Context, args : Array[String]) -> Json raise @io.IoError {
  let command = args[0]
  match command {
    "init" => initialize(ctx)
    "status" => read_command(ctx, "status", "")
    "query" => read_command(ctx, "query", args[1])
    "add" | "review" => mutate(ctx, command, read_json(ctx.host, @io.resolve(ctx.host, args[1])))
    "pause" | "resume" => mutate(ctx, command, {})
    "retry" | "unpark" => mutate(ctx, command, {"taskId":Json::string(args[1])})
    "park" | "reopen" => mutate(ctx, command, {"taskId":Json::string(args[1]), "reason":Json::string(args[2])})
    "recover" => recover(ctx)
    _ => @io.fail("unknown_command")
  }
}
pub fn run_cli(input : String, host : (String) -> String, async_host : (String, (String) -> Unit) -> Unit, done : (String) -> Unit) -> Unit {
  let setup : Result[(Context, Array[String]), String] = try {
    let request = @io.parse(input)
    let root = @io.realpath(host, text(request, "root"), false)
    let raw_args = @io.as_array(get(request, "args"))
    let args : Array[String] = []
    let mut dir = @io.join(root, ".runtime/research")
    let mut profile = ""
    let mut has_dir = false
    let mut has_profile = false
    let mut index = 0
    while index < raw_args.length() {
      let argument = @io.as_string(raw_args[index])
      if argument == "--dir" {
        if has_dir || index + 1 >= raw_args.length() { @io.fail("invalid_dir_option") }
        dir = @io.resolve(host, @io.as_string(raw_args[index+1]))
        has_dir = true
        index = index + 2
      } else if argument == "--profile" {
        if has_profile || index + 1 >= raw_args.length() { @io.fail("invalid_profile_option") }
        profile = @io.as_string(raw_args[index+1])
        has_profile = true
        index = index + 2
      } else { args.push(argument); index = index + 1 }
    }
    if args.is_empty() { @io.fail("usage: research init --profile FILE|add FILE|status|query TEXT|tick|continue ID|pause|resume|retry ID|park ID REASON|unpark ID|review FILE|reopen ID REASON|recover [--dir PATH]") }
    if !["init", "add", "status", "query", "tick", "pause", "resume", "retry", "park", "unpark", "review", "reopen", "continue", "recover"].contains(args[0]) { @io.fail("unknown_command") }
    if args[0] == "init" && !has_profile { @io.fail("init_requires_profile") }
    if args[0] != "init" && has_profile { @io.fail("profile_only_for_init") }
    let count = if ["park", "reopen"].contains(args[0]) { 3 } else if ["add", "query", "retry", "unpark", "review", "continue"].contains(args[0]) { 2 } else { 1 }
    if args.length() != count { @io.fail("invalid_arguments") }
    let ctx : Context = {host, async_host, done, root, dir, profile, node:text(request, "node"), owner:@io.random_hex(host, 16), pid:@io.pid(host),
      state_lock:false, tick_lock:false, stopped:false, finished:false, claimed:None, run_id:"", run_dir:"", manifest:[], manifest_sha:"", snapshot_dir:"", manifest_path:"", session:None}
    Ok((ctx, args))
  } catch { @io.Io(message) => Err(message) }
  match setup {
    Err(message) => {
      try { @io.print(host, ({"ok":false, "error":Json::string(message)} : Json).stringify() + "\n", false) } catch { @io.Io(_) => () }
      done(({"exitCode":1, "error":Json::string(message)} : Json).stringify())
    }
    Ok((ctx, args)) => {
      if args[0] != "tick" && args[0] != "continue" {
        respond(ctx, try { Ok(run_command(ctx, args)) } catch { @io.Io(message) => Err(message) })
        return
      }
      (ctx.async_host)(({"op":"watchStop"} : Json).stringify(), _ => ctx.stopped = true)
      let prepared : Result[Json?, String] = try { Ok(prepare_tick(ctx, if args[0] == "continue" { Some(args[1]) } else { None })) } catch { @io.Io(message) => Err(message) }
      match prepared {
        Err(message) => {
          if ctx.claimed is Some(_) {
            let failure : Result[Json, String] = try {
              if @io.lstat(ctx.host, ctx.run_dir) is None { @io.mkdir(ctx.host, ctx.run_dir, false, Some(0o700), true) }
              save_json(ctx.host, @io.join(ctx.run_dir, "preparation-error.json"), {"error":Json::string(message)}, true)
              Ok(finish_run(ctx, failure_receipt(ctx, if ctx.stopped { "interrupted" } else { "failed" }, message), {"findings":[], "nextQuestions":[]}, []))
            } catch { @io.Io(problem) => Err(message + "; persistence: " + problem) }
            respond(ctx, failure)
          } else { respond(ctx, Err(message)) }
        }
        Ok(None) => respond(ctx, Ok({"status":"idle"}))
        Ok(Some(action)) => (ctx.async_host)(action.stringify(), raw => {
          if ctx.finished { return }
          let accepted = try { Ok(accept_process(ctx, raw)) } catch { @io.Io(message) => Err(message) }
          respond(ctx, accepted)
        })
      }
    }
  }
}
