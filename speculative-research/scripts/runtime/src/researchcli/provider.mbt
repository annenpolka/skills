fn provider_result(ctx : Context, provider : String) -> (String, Json) raise @io.IoError {
  let root = @io.join(ctx.run_dir, "provider")
  if provider == "deepseek" { return (root, read_json(ctx.host, @io.join(root, "result.json"))) }
  directory(ctx.host, root)
  let names = @io.list(ctx.host, root)
  if names.length() != 1 || !names[0].has_prefix("devin-acp-") || !safe_name(names[0]) { @io.fail("helper_artifact_directory") }
  let path = @io.join(root, names[0])
  directory(ctx.host, path)
  (path, read_json(ctx.host, @io.join(path, "result.json")))
}
fn parse_output(message : String) -> Json raise @io.IoError {
  let start = "<research-result>"
  let end = "</research-result>"
  let parts = message.split(start).to_array()
  if parts.length() != 2 { @io.fail("result_block_count") }
  let body = parts[1].split(end).to_array()
  if body.length() != 2 || parts[0].contains(end) { @io.fail("result_block_count") }
  @io.parse(body[0].to_owned())
}
fn truth(value : Json, key : String) -> Bool raise @io.IoError {
  field(value, key) == Json::boolean(true)
}
fn nonempty(value : Json) -> Bool {
  match value { Json::Null | Json::False => false; Json::Array(items) => !items.is_empty(); Json::String(s) => s != ""; _ => true }
}
fn helper_status(raw : Json) -> String raise @io.IoError {
  match text(raw, "status") {
    "turn_completed" | "completed" => "completed"
    "timed_out" | "timeout" => "timed_out"
    "permission_required" => "permission_required"
    "interrupted" => "interrupted"
    _ => "failed"
  }
}
fn barrier(ctx : Context, reason : String) -> Unit raise @io.IoError {
  let path = @io.join(ctx.dir, "recovery-needed.json")
  if @io.lstat(ctx.host, path) is Some(_) { return }
  save_json(ctx.host, path, {"reason":Json::string(reason), "runId":Json::string(ctx.run_id),
    "instruction":"Confirm helper and descendant shutdown before explicitly removing this barrier; retry alone must not launch."}, true)
  sync(ctx.host, ctx.dir)
}
fn finish_run(ctx : Context, receipt : Json, output : Json, checks : Array[Json]) -> Json raise @io.IoError {
  if !ctx.state_lock { acquire(ctx, "state.lock") }
  let state = load(ctx)
  let answer = ledger_call("finish", state, {"runId":Json::string(ctx.run_id), "receipt":receipt,
    "result":output, "checks":Json::array(checks)})
  publish(ctx, get(answer, "state"))
  ctx.claimed = None
  release(ctx, "state.lock")
  {"runId":Json::string(ctx.run_id), "receipt":receipt, "accepted":get(answer, "result")}
}
fn failure_receipt(ctx : Context, status : String, reason : String) -> Json raise @io.IoError {
  let claimed = ctx.claimed.unwrap_or({})
  {"status":Json::string(status), "model":get(get(claimed, "run"), "model"),
    "sessionId":Json::null(), "artifactDir":Json::string(ctx.run_dir), "usage":Json::null(), "cost":Json::null(),
    "reason":Json::string(reason)}
}
fn input_format(draft : Json) -> String {
  match draft {
    Json::Object(fields) => match fields.get("format") {
      Some(Json::String("source-ranges-v1")) => "source-ranges-v1"
      _ => "legacy-quotes"
    }
    _ => "legacy-quotes"
  }
}

// Turn a provider draft into the canonical accepted result. A source-ranges
// draft is materialized from the frozen snapshot before any evidence check; a
// legacy quote-bearing draft is passed through unchanged. Range generation is
// published through the same shared writer as the standalone research CLI so
// generated/ carries the receipt, exact hashes and overwrite/partial-write
// guards exactly once.
fn materialize(ctx : Context, draft : Json) -> Json raise @io.IoError {
  if input_format(draft) != "source-ranges-v1" {
    return draft
  }
  let allowed : Array[Json] = []
  for entry in ctx.manifest {
    allowed.push({"path": Json::string(text(entry, "path")), "sha256": get(entry, "sha256")})
  }
  let input_dir = @io.join(ctx.run_dir, "materialize-input")
  @io.mkdir(ctx.host, input_dir, true, Some(0o700), false)
  let packet_path = @io.join(input_dir, "packet.json")
  let draft_path = @io.join(input_dir, "draft.json")
  save_json(ctx.host, packet_path, {"packetId": Json::string(ctx.run_id),
    "frozenSourceRoot": Json::string(ctx.snapshot_dir), "allowedSourceFiles": Json::array(allowed)}, true)
  save_json(ctx.host, draft_path, draft, true)
  let generated = @io.join(ctx.run_dir, "generated")
  let answer = @io.as_object(@researchartifacts.research(ctx.host, packet_path, draft_path, generated))
  if @io.required(answer, "ok") != Json::boolean(true) {
    @io.fail("source_range_rejected")
  }
  @io.required(answer, "result")
}

fn accept_process(ctx : Context, raw : String) -> Json raise @io.IoError {
  let process_envelope = @io.parse(raw)
  save_json(ctx.host, @io.join(ctx.run_dir, "process.json"), process_envelope, true)
  let claimed = ctx.claimed.unwrap_or({})
  let provider = text(get(claimed, "run"), "provider")
  let expected_model = text(get(claimed, "run"), "model")
  let mut status = "failed"
  let mut reason = "helper_process_failure"
  let mut cleanup_known = false
  let mut outer_cleanup_known = false
  let mut cleanup_observation : Json = Json::null()
  let mut cleanup_basis = "helper_and_processcontrol"
  let mut process_ok = false
  if field(process_envelope, "ok") == Json::boolean(true) {
    let event = get(process_envelope, "value")
    if text(event, "event") != "result" { @io.fail("unexpected_process_event") }
    let value = get(event, "value")
    cleanup_known = get(value, "cleanupUnverified") == Json::boolean(false) && @io.as_array(get(value, "terminationErrors")).is_empty() &&
      (field(value, "exitCode") is Json::Number(_) || field(value, "signal") is Json::String(_))
    outer_cleanup_known = cleanup_known
    if truth(value, "interrupted") || ctx.stopped { status = "interrupted" }
    else if truth(value, "timedOut") { status = "timed_out" }
    process_ok = field(value, "exitCode") == Json::number(0) && field(value, "signal") == Json::null() &&
      !truth(value, "interrupted") && !truth(value, "timedOut") && !truth(value, "forcedTermination") &&
      !nonempty(field(value, "failure")) && cleanup_known
  }
  let observed : Result[(String, Json), String] = try { Ok(provider_result(ctx, provider)) } catch { @io.Io(message) => Err(message) }
  let mut artifact_dir = ctx.run_dir
  let mut session : Json = Json::null()
  let mut model : Json = Json::string(expected_model)
  let mut usage : Json = Json::null()
  let mut cost : Json = Json::null()
  let mut final_message = ""
  let mut helper_raw : Json = Json::null()
  match observed {
    Err(message) => { reason = message; cleanup_known = false }
    Ok((path, result)) => {
      artifact_dir = path
      helper_raw = result
      session = field(result, "sessionId")
      usage = field(result, "usage")
      cost = field(result, "cost")
      if field(result, "finalMessage") is Json::String(message) { final_message = message }
      if provider == "devin" {
        if field(result, "config") is Json::Object(config) { model = config.get("model").unwrap_or(Json::null()) }
        else { model = Json::null() }
        if nonempty(field(result, "cleanupErrors")) || nonempty(field(result, "cleanupError")) || field(result, "processExitCode") == Json::null() { cleanup_known = false }
        if field(result, "config") is Json::Object(config) {
          if config.get("mode") != Some(Json::string("ask")) { process_ok = false; reason = "unexpected_devin_mode" }
        }
      } else {
        model = field(result, "model")
        if field(result, "childExitCode") == Json::null() { cleanup_known = false }
        if field(result, "agent") != Json::string("plan") || field(result, "pure") != Json::boolean(true) {
          process_ok = false; reason = "unexpected_deepseek_mode"
        }
      }
      let hs = helper_status(result)
      if status != "interrupted" && status != "timed_out" {
        status = if hs == "completed" && !process_ok { "failed" } else { hs }
      }
      if hs != "completed" { reason = text(result, "status") }
      else if status == "completed" { reason = "completed_unreviewed" }
      if status == "completed" && model != Json::string(expected_model) { status = "invalid_output"; reason = "model_identity_mismatch" }
    }
  }
  // A nested Devin process group can be independently observed absent when
  // its helper reports a signalling error. This never resolves uncertainty
  // about the separately owned outer helper group in processcontrol.
  if provider == "devin" && outer_cleanup_known && !cleanup_known && helper_raw != Json::null() {
    if field(helper_raw, "pid") is Json::Number(pid, ..) {
      if @io.is_safe_int(pid) && pid > 0.0 && pid <= 2147483647.0 {
        let observed : Result[Json, String] = try {
          Ok(@io.call(ctx.host, {"op":"researchProcessPresence", "pid":Json::number(pid)}))
        } catch { @io.Io(message) => Err(message) }
        match observed {
          Err(message) => cleanup_observation = {"pid":Json::number(pid), "leader":"unknown", "group":"unknown",
            "errors":[{"target":"observer", "code":"HOST_ERROR", "message":Json::string(message)}]}
          Ok(observation) => {
            cleanup_observation = observation
            let absent : Result[Bool, String] = try {
              Ok(get(observation, "pid") == Json::number(pid) && text(observation, "leader") == "absent" &&
                text(observation, "group") == "absent" && @io.as_array(get(observation, "errors")).is_empty())
            } catch { @io.Io(message) => Err(message) }
            if absent == Ok(true) {
              cleanup_known = true
              cleanup_basis = "independent_process_absence"
            }
          }
        }
      }
    }
  }
  if !cleanup_known {
    cleanup_basis = "unverified"
    if status == "completed" { status = "failed"; reason = "helper_cleanup_unverified" }
    barrier(ctx, "helper_cleanup_unverified")
  }
  else { phase(ctx, "collected") }
  let unchanged : Result[Unit, String] = try { verify_snapshot(ctx); Ok(()) } catch { @io.Io(message) => Err(message) }
  if unchanged is Err(message) { status = "source_changed"; reason = message }
  if ctx.stopped && status == "completed" { status = "interrupted"; reason = "caller_stopped" }
  let receipt_fields = @io.as_object({"status":Json::string(status), "model":model, "sessionId":session,
    "artifactDir":Json::string(artifact_dir), "usage":usage, "cost":cost, "reason":Json::string(reason),
    "snapshotDir":Json::string(ctx.snapshot_dir),
    "manifestPath":Json::string(ctx.manifest_path), "manifestSha256":Json::string(ctx.manifest_sha),
    "helperStatus":if helper_raw == Json::null() { Json::null() } else { field(helper_raw, "status") },
    "cleanupVerified":Json::boolean(cleanup_known), "cleanupBasis":Json::string(cleanup_basis),
    "cleanupObservation":cleanup_observation,
    "helperCleanupErrors":if helper_raw == Json::null() { Json::null() } else { field(helper_raw, "cleanupErrors") },
    "helperCleanupError":if helper_raw == Json::null() { Json::null() } else { field(helper_raw, "cleanupError") },
    "modelEvidence":Json::string(if provider == "devin" { "effective_helper_config" } else { "requested_helper_config" }),
    "reportedModel":if helper_raw == Json::null() { Json::null() } else { field(helper_raw, "reportedModel") }})
  let mut output : Json = {"findings":[], "nextQuestions":[]}
  let mut checks : Array[Json] = []
  let mut draft_format = "unavailable"
  if status == "completed" {
    let parsed : Result[(Json, Array[Json]), String] = try {
      let raw = parse_output(final_message)
      draft_format = input_format(raw)
      let canonical = materialize(ctx, raw)
      Ok((canonical, evidence(ctx, canonical)))
    } catch { @io.Io(message) => Err(message) }
    match parsed {
      Ok((parsed, matched)) => { output = parsed; checks = matched }
      Err(message) => { status = "invalid_output"; receipt_fields.set("status", Json::string(status)); receipt_fields.set("reason", Json::string(message)) }
    }
  }
  // Label the accepted run's input format; an unparsable response is unknown.
  receipt_fields.set("draftFormat", Json::string(draft_format))
  // Test pure acceptance before any generation write. A durability error must
  // remain a durability error, never become a fabricated invalid_output receipt.
  if !ctx.state_lock { acquire(ctx, "state.lock") }
  let state = load(ctx)
  if status == "completed" {
    let accepted : Result[Unit, String] = try {
      ignore(ledger_call("finish", state, {"runId":Json::string(ctx.run_id), "receipt":Json::object(receipt_fields),
        "result":output, "checks":Json::array(checks)}))
      Ok(())
    } catch { @io.Io(message) => Err(message) }
    if accepted is Err(message) {
      receipt_fields.set("status", "invalid_output")
      receipt_fields.set("reason", Json::string(message))
      save_json(ctx.host, @io.join(ctx.run_dir, "acceptance-error.json"), {"error":Json::string(message)}, true)
    }
  }
  save_json(ctx.host, @io.join(ctx.run_dir, "acceptance-input.json"), {"receipt":Json::object(receipt_fields),
    "result":output, "checks":Json::array(checks)}, true)
  let finished = finish_run(ctx, Json::object(receipt_fields), output, checks)
  let final_status = text(Json::object(receipt_fields), "status")
  let peer_export : Json = if final_status == "completed" {
    let target = @io.join(ctx.run_dir, "peer")
    let outcome : Result[Json, String] = try {
      Ok(@researchartifacts.export_peer(ctx.host, ctx.dir, ctx.run_id, target, []))
    } catch { @io.Io(message) => Err(message) }
    match outcome {
      Ok(result) => {"status": Json::string("completed"), "path": @io.required(@io.as_object(result), "path")}
      Err(message) => {"status": Json::string("failed"), "error": Json::string(message)}
    }
  } else {
    {"status": Json::string("skipped")}
  }
  let merged = @io.as_object(finished)
  merged.set("peerExport", peer_export)
  Json::object(merged)
}

fn deepseek_config(ctx : Context) -> Json raise @io.IoError {
  // OpenCode 1.18.30 asks read permission with a path relative to its
  // enclosing Git worktree (or / without Git), not to the session cwd.
  let git = @io.spawn(ctx.host, "git", ["rev-parse", "--show-toplevel"], Some(ctx.snapshot_dir),
    Some({"LC_ALL":"C"}), None, None, None, false, false, Some(10000), false)
  let worktree = if git.status == Some(0) && git.signal == None {
    @io.realpath(ctx.host, git.stdout.trim().to_owned(), false)
  } else if git.status == Some(128) && git.signal == None && git.stderr.contains("not a git repository") {
    "/"
  } else { @io.fail("deepseek_worktree_unavailable") }
  let relative = @io.relative(ctx.host, worktree, ctx.snapshot_dir)
  if relative == "" || relative.has_prefix("../") || relative.has_prefix("/") ||
    relative.contains("*") || relative.contains("?") || relative.contains("\\") {
    @io.fail("deepseek_unsafe_permission_path")
  }
  let reads : Map[String, Json] = {"*":"deny"}
  reads.set(relative, "allow")
  reads.set(relative + "/**", "allow")
  let policy : Json = {"*":"deny", "read":Json::object(reads),
    "bash":"deny", "edit":"deny", "glob":"deny", "grep":"deny", "list":"deny",
    "task":"deny", "skill":"deny", "lsp":"deny", "webfetch":"deny", "websearch":"deny",
    "question":"deny", "external_directory":"deny", "todowrite":"deny"}
  // Agent overrides are needed as well as global defaults. Disable read's
  // implicit LSP warm-up separately from the model-visible lsp tool.
  {"permission":policy, "agent":{"plan":{"permission":policy}}, "lsp":false}
}

fn action(ctx : Context, claimed : Json) -> Json raise @io.IoError {
  let config = read_json(ctx.host, @io.join(ctx.dir, "config.json"))
  let provider = text(get(claimed, "run"), "provider")
  let helper = text(config, if provider == "devin" { "devinHelper" } else { "deepseekHelper" })
  if !helper.has_prefix("/") { @io.fail("helper_requires_absolute_path") }
  regular(ctx.host, helper)
  let snapshot = ctx.snapshot_dir
  let brief_path = @io.join(ctx.run_dir, "brief.txt")
  let args : Array[String] = if provider == "devin" {
    [helper, "--cd", snapshot, "--brief", brief_path, "--model", "swe-2-max", "--mode", "ask", "--timeout", "1800", "--output-root", @io.join(ctx.run_dir, "provider")]
  } else {
    [helper, "--cd", snapshot, "--brief", brief_path, "--model", "opencode-go/deepseek-v4.1-flash", "--agent", "plan", "--pure", "--timeout", "30m", "--out-dir", @io.join(ctx.run_dir, "provider")]
  }
  if ctx.session is Some(session) { args.push("--session"); args.push(session) }
  let executable = if provider == "devin" {
    match @io.which(ctx.host, "python3") { Some(path) => path; None => @io.fail("python3_unavailable") }
  } else { ctx.node }
  let request = @io.as_object({"file":Json::string(executable), "args":Json::array(args.map(Json::string)),
    "cwd":Json::string(snapshot), "timeoutMs":1920000, "interruptGraceMs":15000, "terminateGraceMs":5000,
    "maxLogBytes":8388608, "maxLineBytes":4194304, "exclusive":true, "processGroup":true,
    "stdoutPath":Json::string(@io.join(ctx.run_dir, "helper-stdout.log")),
    "stderrPath":Json::string(@io.join(ctx.run_dir, "helper-stderr.log"))})
  if provider == "deepseek" {
    request.set("env", {"OPENCODE_CONFIG_CONTENT":Json::string(deepseek_config(ctx).stringify())})
  }
  {"op":"process", "request":Json::object(request)}
}
