fn get(value : Json, key : String) -> Json raise @io.IoError {
  @io.required(@io.as_object(value), key)
}
fn text(value : Json, key : String) -> String raise @io.IoError {
  @io.as_string(get(value, key))
}
fn field(value : Json, key : String) -> Json raise @io.IoError {
  @io.as_object(value).get(key).unwrap_or(Json::null())
}
fn integer(value : Json, key : String) -> Int raise @io.IoError {
  @io.as_int(get(value, key))
}
fn sync(host : (String) -> String, path : String) -> Unit raise @io.IoError {
  ignore(@io.call(host, {"op":"fsync", "path":Json::string(path)}))
}
fn regular(host : (String) -> String, path : String) -> Unit raise @io.IoError {
  match @io.lstat(host, path) {
    Some(info) if info.kind == "file" => ()
    _ => @io.fail("expected_regular_file")
  }
}
fn directory(host : (String) -> String, path : String) -> Unit raise @io.IoError {
  match @io.lstat(host, path) {
    Some(info) if info.kind == "directory" => ()
    _ => @io.fail("expected_directory")
  }
}
fn record(host : (String) -> String, path : String, max : Int) -> Json raise @io.IoError {
  regular(host, path)
  @io.call(host, {"op":"readRecord", "path":Json::string(path), "maxBytes":Json::number(max.to_double())})
}
fn read_json(host : (String) -> String, path : String) -> Json raise @io.IoError {
  @io.parse(text(record(host, path, 67108864), "text"))
}
fn save_json(host : (String) -> String, path : String, value : Json, exclusive : Bool) -> Unit raise @io.IoError {
  @io.write(host, path, value.stringify() + "\n", Some(0o600), false, exclusive)
  sync(host, path)
}
fn digest(value : String) -> Bool {
  value.length() == 64 && value.iter().all(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))
}
fn ledger_call(op : String, state : Json, extras : Json) -> Json raise @io.IoError {
  let input = @io.as_object(extras)
  input.set("op", Json::string(op))
  if op != "init" { input.set("state", state) }
  let answer = @io.parse(@research.dispatch_json(Json::object(input).stringify()))
  if get(answer, "ok") != Json::boolean(true) { @io.fail(text(answer, "error")) }
  answer
}
fn load(ctx : Context) -> Json raise @io.IoError {
  directory(ctx.host, ctx.dir)
  directory(ctx.host, @io.join(ctx.dir, "generations"))
  let head = read_json(ctx.host, @io.join(ctx.dir, "HEAD.json"))
  let revision = integer(head, "revision")
  let file = "generations/" + revision.to_string() + ".json"
  if revision < 0 || text(head, "file") != file || !digest(text(head, "sha256")) { @io.fail("head_identity") }
  let found = record(ctx.host, @io.join(ctx.dir, file), 67108864)
  if text(found, "sha256") != text(head, "sha256") { @io.fail("generation_changed") }
  let state = @io.parse(text(found, "text"))
  if integer(state, "revision") != revision { @io.fail("generation_revision") }
  ignore(ledger_call("status", state, {}))
  state
}
fn publish(ctx : Context, state : Json) -> Unit raise @io.IoError {
  let revision = integer(state, "revision")
  let file = "generations/" + revision.to_string() + ".json"
  let path = @io.join(ctx.dir, file)
  let output = state.stringify() + "\n"
  let sha = @io.hash_text(ctx.host, output)
  // A failed HEAD switch can leave a generation the accepted HEAD never named.
  // Archive its exact bytes before allowing a different mutation at this revision.
  match @io.lstat(ctx.host, path) {
    None => @io.write(ctx.host, path, output, Some(0o600), false, true)
    Some(info) if info.kind == "file" => {
      let existing = @io.hash(ctx.host, path)
      if existing != sha {
        let head = read_json(ctx.host, @io.join(ctx.dir, "HEAD.json"))
        if integer(head, "revision") >= revision { @io.fail("cannot_replace_accepted_generation") }
        let archive = @io.join(ctx.dir, "orphaned-generations")
        @io.mkdir(ctx.host, archive, true, Some(0o700), false)
        let orphan = @io.join(archive, revision.to_string() + "-" + existing + "-" + ctx.owner + ".json")
        @io.rename(ctx.host, path, orphan)
        if @io.hash(ctx.host, orphan) != existing { @io.fail("orphan_changed") }
        sync(ctx.host, orphan)
        sync(ctx.host, archive)
        @io.write(ctx.host, path, output, Some(0o600), false, true)
      }
    }
    _ => @io.fail("generation_not_regular")
  }
  sync(ctx.host, path)
  sync(ctx.host, @io.join(ctx.dir, "generations"))
  let head : Json = {"revision":Json::number(revision.to_double()), "file":Json::string(file), "sha256":Json::string(sha)}
  let temporary = @io.join(ctx.dir, "HEAD-" + ctx.owner + ".tmp")
  save_json(ctx.host, temporary, head, true)
  ignore(@io.call(ctx.host, {"op":"verifyTool"}))
  @io.rename(ctx.host, temporary, @io.join(ctx.dir, "HEAD.json"))
  sync(ctx.host, ctx.dir)
}
fn acquire(ctx : Context, name : String) -> Unit raise @io.IoError {
  let path = @io.join(ctx.dir, name)
  @io.mkdir(ctx.host, path, false, Some(0o700), true)
  let saved : Result[Unit, String] = try {
    save_json(ctx.host, @io.join(path, "owner.json"), {
      "pid":Json::number(ctx.pid.to_double()), "owner":Json::string(ctx.owner),
      "phase":"preparing", "runId":Json::null(), "startedAt":Json::string(@io.now(ctx.host)),
    }, true)
    sync(ctx.host, path)
    sync(ctx.host, ctx.dir)
    Ok(())
  } catch { @io.Io(message) => Err(message) }
  match saved {
    Ok(_) => if name == "state.lock" { ctx.state_lock = true } else { ctx.tick_lock = true }
    Err(message) => @io.fail(message)
  }
}
fn release(ctx : Context, name : String) -> Unit raise @io.IoError {
  if (name == "state.lock" && !ctx.state_lock) || (name == "tick.lock" && !ctx.tick_lock) { return }
  let path = @io.join(ctx.dir, name)
  let owner = read_json(ctx.host, @io.join(path, "owner.json"))
  if text(owner, "owner") != ctx.owner || integer(owner, "pid") != ctx.pid { @io.fail("lock_ownership_changed") }
  let archive = @io.join(ctx.dir, "released-locks")
  @io.mkdir(ctx.host, archive, true, Some(0o700), false)
  directory(ctx.host, archive)
  let target = @io.join(archive, name + "-" + ctx.owner + "-" + @io.random_hex(ctx.host, 8))
  // Publish the release as one rename. Keep owner.json with the archived lock
  // even if the process stops before either directory fsync completes.
  @io.rename(ctx.host, path, target)
  // Another process may now acquire the active name. A durability error must
  // not cause cleanup to inspect or release that new owner's lock.
  if name == "state.lock" { ctx.state_lock = false } else { ctx.tick_lock = false }
  sync(ctx.host, target)
  sync(ctx.host, archive)
  sync(ctx.host, ctx.dir)
}
fn phase(ctx : Context, value : String) -> Unit raise @io.IoError {
  let path = @io.join(ctx.dir, "tick.lock/owner.json")
  let owner = @io.as_object(read_json(ctx.host, path))
  if @io.as_string(@io.required(owner, "owner")) != ctx.owner { @io.fail("tick_ownership_changed") }
  owner.set("phase", Json::string(value))
  if ctx.claimed is Some(claimed) { owner.set("runId", get(get(claimed, "run"), "id")) }
  // Atomic metadata replacement avoids manufacturing recoverable ownership
  // from a truncated lock record after a crash.
  let temporary = @io.join(ctx.dir, "tick.lock/owner.tmp")
  save_json(ctx.host, temporary, Json::object(owner), true)
  @io.rename(ctx.host, temporary, path)
  sync(ctx.host, @io.join(ctx.dir, "tick.lock"))
}
