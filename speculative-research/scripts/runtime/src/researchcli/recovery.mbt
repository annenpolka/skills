fn abandon_dead_lock(ctx : Context, name : String) -> Json? raise @io.IoError {
  let path = @io.join(ctx.dir, name)
  if @io.lstat(ctx.host, path) is None { return None }
  directory(ctx.host, path)
  let observed : Result[(Json, Int), String] = try {
    let owner = read_json(ctx.host, @io.join(path, "owner.json"))
    let pid = integer(owner, "pid")
    if pid <= 0 || text(owner, "owner") == "" { @io.fail("invalid_lock_owner") }
    Ok((owner, pid))
  } catch { @io.Io(_) => Err("lock_owner_unknown_requires_manual_inspection: " + name) }
  let (owner, pid) = match observed { Ok(value) => value; Err(message) => @io.fail(message) }
  if @io.alive(ctx.host, pid) { @io.fail("lock_owner_alive_or_unverified") }
  let archive = @io.join(ctx.dir, "abandoned-locks")
  @io.mkdir(ctx.host, archive, true, Some(0o700), false)
  @io.rename(ctx.host, path, @io.join(archive, name + "-" + ctx.owner))
  sync(ctx.host, archive)
  sync(ctx.host, ctx.dir)
  Some(owner)
}
fn recover(ctx : Context) -> Json raise @io.IoError {
  directory(ctx.host, ctx.dir)
  ignore(abandon_dead_lock(ctx, "state.lock"))
  acquire(ctx, "state.lock")
  let previous = abandon_dead_lock(ctx, "tick.lock")
  acquire(ctx, "tick.lock")
  let state = load(ctx)
  let recovered : Array[Json] = []
  for run in @io.as_array(get(state, "runs")) {
    if text(run, "status") != "running" { continue }
    ctx.run_id = text(run, "id")
    ctx.run_dir = @io.join(ctx.dir, "runs/" + ctx.run_id)
    ctx.claimed = Some({"run":run})
    let safe = match previous {
      Some(owner) => field(owner, "runId") == Json::string(ctx.run_id) &&
        [Json::string("preparing"), Json::string("collected")].contains(field(owner, "phase"))
      None => false
    }
    if !safe { barrier(ctx, "interrupted_owner_helper_shutdown_unverified") }
    @io.mkdir(ctx.host, ctx.run_dir, true, Some(0o700), false)
    let receipt = failure_receipt(ctx, "interrupted", if safe { "dead_owner_no_active_helper" } else { "dead_owner_helper_shutdown_unverified" })
    save_json(ctx.host, @io.join(ctx.run_dir, "recovery-" + ctx.owner + ".json"), receipt, true)
    recovered.push(finish_run(ctx, receipt, {"findings":[], "nextQuestions":[]}, []))
  }
  {"recovered":Json::array(recovered), "recoveryRequired":Json::boolean(@io.lstat(ctx.host, @io.join(ctx.dir, "recovery-needed.json")) is Some(_))}
}
