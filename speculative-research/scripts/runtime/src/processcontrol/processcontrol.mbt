// Async child-process controller. All lifecycle, limit, escalation and
// result-assembly decisions live here; the injected `host` is a thin Node leaf.
//
// ABI: run_process_json(requestJson, host, notify, done)
//   host(actionJson, reply)  MoonBit asks the leaf to act. The leaf may call
//                            `reply` more than once with JSON events (child
//                            output, close, timers). `reply` never raises.
//   notify(eventJson)        MoonBit -> leaf ({type:"line",text} for onLine).
//   done(resultJson)         MoonBit -> leaf final result.
//
// Leaf -> MoonBit events:
//   spawn reply: spawned | data | flush | close | childError | abort | notifyError
//   writeLog:    written | writeError
//   signal:      ok | signalError
//   schedule:    scheduled | timer | scheduleError
//   cancelTimer/destroyPipes: ok
//   cleanup:     cleanupError

priv struct Core {
  file : String
  args : Array[String]
  cwd : String?
  stdout_path : String
  stderr_path : String
  max_log_bytes : Int
  max_line_bytes : Int
  interrupt_grace_ms : Int
  terminate_grace_ms : Int
  timeout_ms : Int
  process_group : Bool
  mut finished : Bool
  mut primary_failure : String?
  mut failure_name : String
  mut timed_out : Bool
  mut interrupted : Bool
  mut forced_termination : Bool
  mut cleanup_unverified : Bool
  mut exit_code : Int?
  mut signal : String?
  mut elapsed_ms : Int
  mut child_closed : Bool
  mut line_buffer : String
  mut deadline_active : Bool
  mut terminate_active : Bool
  mut kill_active : Bool
  mut group_kill_sent : Bool
  received : Map[String, Int64]
  written : Map[String, Int64]
  pending_write : Map[String, Int64]
  summaries : Array[Json]
  termination_errors : Array[Json]
}

priv struct Config {
  file : String
  args : Array[String]
  cwd : String?
  env : Json?
  stdout_path : String
  stderr_path : String
  exclusive : Bool
  timeout_ms : Int
  interrupt_grace_ms : Int
  terminate_grace_ms : Int
  max_log_bytes : Int
  max_line_bytes : Int
  aborted : Bool
  process_group : Bool
}

fn object_of(pairs : Array[(String, Json)]) -> Json {
  let fields : Map[String, Json] = Map::new()
  for pair in pairs {
    fields.set(pair.0, pair.1)
  }
  Json::object(fields)
}

fn jstr(text : String) -> Json { Json::string(text) }

fn jint(value : Int) -> Json { Json::number(value.to_double()) }

// Cumulative byte counters use Int64 and saturate at the JSON safe-integer
// limit so a huge child output can never wrap to a negative total.
let max_count : Int64 = 9007199254740991L

fn jcount(value : Int64) -> Json { Json::number(value.to_double()) }

fn sat_add(a : Int64, b : Int64) -> Int64 {
  if a > max_count - b {
    max_count
  } else {
    a + b
  }
}

fn sat_sub(a : Int64, b : Int64) -> Int64 {
  if a < b {
    0L
  } else {
    a - b
  }
}

fn jbool(value : Bool) -> Json { Json::boolean(value) }

fn iget64(map : Map[String, Int64], key : String) -> Int64 {
  match map.get(key) {
    Some(value) => value
    None => 0L
  }
}

fn count_map64() -> Map[String, Int64] {
  let map : Map[String, Int64] = Map::new()
  map.set("stdout", 0L)
  map.set("stderr", 0L)
  map
}

fn utf8_len(text : String) -> Int {
  let mut total = 0
  for c in text {
    let code = c.to_int()
    let width = if code < 0x80 {
      1
    } else if code < 0x800 {
      2
    } else if code < 0x10000 {
      3
    } else {
      4
    }
    total = total + width
  }
  total
}

fn event_str(fields : Map[String, Json], key : String) -> String {
  match fields.get(key) {
    Some(Json::String(text)) => text
    _ => ""
  }
}

fn event_int(fields : Map[String, Json], key : String) -> Int {
  match fields.get(key) {
    Some(Json::Number(number, ..)) => number.to_int()
    _ => 0
  }
}

fn event_bool(fields : Map[String, Json], key : String) -> Bool {
  match fields.get(key) {
    Some(Json::True) => true
    _ => false
  }
}

fn active(state : Ref[Core]) -> Bool {
  match state.val.primary_failure {
    None => !state.val.finished
    Some(_) => false
  }
}

fn empty_core(
  file : String,
  args : Array[String],
  cwd : String?,
  stdout_path : String,
  stderr_path : String,
  max_log_bytes : Int,
  max_line_bytes : Int,
  interrupt_grace_ms : Int,
  terminate_grace_ms : Int,
  timeout_ms : Int,
  process_group : Bool
) -> Core {
  ({
    file: file,
    args: args,
    cwd: cwd,
    stdout_path: stdout_path,
    stderr_path: stderr_path,
    max_log_bytes: max_log_bytes,
    max_line_bytes: max_line_bytes,
    interrupt_grace_ms: interrupt_grace_ms,
    terminate_grace_ms: terminate_grace_ms,
    timeout_ms: timeout_ms,
    process_group: process_group,
    finished: false,
    primary_failure: None,
    failure_name: "Error",
    timed_out: false,
    interrupted: false,
    forced_termination: false,
    cleanup_unverified: false,
    exit_code: None,
    signal: None,
    elapsed_ms: 0,
    child_closed: false,
    line_buffer: "",
    deadline_active: false,
    terminate_active: false,
    kill_active: false,
    group_kill_sent: false,
    received: count_map64(),
    written: count_map64(),
    pending_write: count_map64(),
    summaries: [],
    termination_errors: [],
  } : Core)
}

fn invalid_core(message : String) -> Core {
  let core = empty_core("", [], None, "", "", 1, 1, 0, 0, 0, false)
  core.primary_failure = Some(message)
  core
}

fn stream_logs(core : Core, name : String) -> Json {
  object_of([
    (
      "path",
      jstr(if name == "stdout" { core.stdout_path } else { core.stderr_path }),
    ),
    ("receivedBytes", jcount(iget64(core.received, name))),
    ("writtenBytes", jcount(iget64(core.written, name))),
  ])
}

fn call_done(core : Core, done : (String) -> Unit) -> Unit {
  let fields : Map[String, Json] = Map::new()
  fields.set("exitCode", match core.exit_code {
    Some(code) => jint(code)
    None => Json::null()
  })
  fields.set("signal", match core.signal {
    Some(text) => jstr(text)
    None => Json::null()
  })
  fields.set("timedOut", jbool(core.timed_out))
  fields.set("interrupted", jbool(core.interrupted))
  fields.set("forcedTermination", jbool(core.forced_termination))
  fields.set("cleanupUnverified", jbool(core.cleanup_unverified))
  fields.set("elapsedMs", jint(core.elapsed_ms))
  let command : Array[Json] = [jstr(core.file)]
  for arg in core.args {
    command.push(jstr(arg))
  }
  fields.set("command", Json::array(command))
  fields.set("cwd", match core.cwd {
    Some(value) => jstr(value)
    None => Json::null()
  })
  fields.set(
    "limits",
    object_of([
      ("timeoutMs", jint(core.timeout_ms)),
      ("interruptGraceMs", jint(core.interrupt_grace_ms)),
      ("terminateGraceMs", jint(core.terminate_grace_ms)),
      ("maxLogBytes", jint(core.max_log_bytes)),
      ("maxLineBytes", jint(core.max_line_bytes)),
    ]),
  )
  fields.set(
    "logs",
    object_of([
      ("stdout", stream_logs(core, "stdout")),
      ("stderr", stream_logs(core, "stderr")),
    ]),
  )
  fields.set("summaries", Json::array(core.summaries))
  fields.set("terminationErrors", Json::array(core.termination_errors))
  match core.primary_failure {
    Some(message) => fields.set(
      "failure",
      object_of([("name", jstr(core.failure_name)), ("message", jstr(message))]),
    )
    None => ()
  }
  done(Json::object(fields).stringify())
}

fn parse_config(text : String) -> Config raise @io.IoError {
  let fields = @io.as_object(@io.parse(text))
  let file = @io.as_string(@io.required(fields, "file"))
  let args : Array[String] = []
  match @io.optional_array(fields, "args") {
    Some(items) =>
      for item in items {
        args.push(@io.as_string(item))
      }
    None => ()
  }
  // An optional string overlay for the owned child, not a replacement for its
  // inherited environment. Reject malformed entries before any spawn/log IO.
  // Never include names or values in errors or the result receipt.
  let env = match fields.get("env") {
    None => None
    Some(Json::Object(values)) => {
      for key, value in values {
        if key == "" || key.contains("=") || key.contains("\u0000") {
          @io.fail("env contains an invalid name")
        }
        match value {
          Json::String(text) =>
            if text.contains("\u0000") {
              @io.fail("env contains an invalid value")
            }
          _ => @io.fail("env values must be strings")
        }
      }
      Some(Json::object(values))
    }
    _ => @io.fail("env must be an object of strings")
  }
  let timeout_ms = match @io.optional_int(fields, "timeoutMs") {
    Some(value) => value
    None => 120000
  }
  if timeout_ms < 0 {
    @io.fail("timeoutMs must not be negative")
  }
  let interrupt_grace_ms = @io.optional_int(fields, "interruptGraceMs").unwrap_or(
    30000,
  )
  if interrupt_grace_ms < 0 {
    @io.fail("interruptGraceMs must not be negative")
  }
  let terminate_grace_ms = @io.optional_int(fields, "terminateGraceMs").unwrap_or(
    5000,
  )
  if terminate_grace_ms < 0 {
    @io.fail("terminateGraceMs must not be negative")
  }
  let max_log_bytes = @io.optional_int(fields, "maxLogBytes").unwrap_or(8388608)
  if max_log_bytes <= 0 {
    @io.fail("maxLogBytes must be positive")
  }
  let max_line_bytes = @io.optional_int(fields, "maxLineBytes").unwrap_or(262144)
  if max_line_bytes <= 0 {
    @io.fail("maxLineBytes must be positive")
  }
  ({
    file: file,
    args: args,
    cwd: @io.optional_string(fields, "cwd"),
    env: env,
    stdout_path: @io.as_string(@io.required(fields, "stdoutPath")),
    stderr_path: @io.as_string(@io.required(fields, "stderrPath")),
    exclusive: @io.optional_bool(fields, "exclusive").unwrap_or(false),
    timeout_ms: timeout_ms,
    interrupt_grace_ms: interrupt_grace_ms,
    terminate_grace_ms: terminate_grace_ms,
    max_log_bytes: max_log_bytes,
    max_line_bytes: max_line_bytes,
    aborted: @io.optional_bool(fields, "aborted").unwrap_or(false),
    process_group: @io.optional_bool(fields, "processGroup").unwrap_or(false),
  } : Config)
}

fn spawn_action(cfg : Config) -> Json {
  let args : Array[Json] = []
  for arg in cfg.args {
    args.push(jstr(arg))
  }
  let fields : Map[String, Json] = Map::new()
  fields.set("op", jstr("spawn"))
  fields.set("file", jstr(cfg.file))
  fields.set("args", Json::array(args))
  match cfg.cwd {
    Some(value) => fields.set("cwd", jstr(value))
    None => ()
  }
  match cfg.env {
    Some(value) => fields.set("env", value)
    None => ()
  }
  fields.set("stdoutPath", jstr(cfg.stdout_path))
  fields.set("stderrPath", jstr(cfg.stderr_path))
  if cfg.exclusive {
    fields.set("exclusive", jbool(true))
  }
  if cfg.process_group {
    fields.set("processGroup", jbool(true))
  }
  Json::object(fields)
}

fn send_action(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  action : Json
) -> Unit {
  host(action.stringify(), raw => reply_event(state, host, notify, done, raw))
}

fn send_signal(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  name : String
) -> Unit {
  let fields : Map[String, Json] = Map::new()
  fields.set("op", jstr("signal"))
  fields.set("name", jstr(name))
  if state.val.process_group {
    fields.set("group", jbool(true))
  }
  send_action(state, host, notify, done, Json::object(fields))
}

fn schedule_timer(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  id : String,
  ms : Int
) -> Unit {
  match id {
    "deadline" => state.val.deadline_active = true
    "terminate" => state.val.terminate_active = true
    "kill" => state.val.kill_active = true
    _ => ()
  }
  send_action(
    state,
    host,
    notify,
    done,
    object_of([("op", jstr("schedule")), ("id", jstr(id)), ("ms", jint(ms))]),
  )
}

fn cancel_timer(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  id : String
) -> Unit {
  let active_now = match id {
    "deadline" => state.val.deadline_active
    "terminate" => state.val.terminate_active
    "kill" => state.val.kill_active
    _ => false
  }
  if active_now {
    match id {
      "deadline" => state.val.deadline_active = false
      "terminate" => state.val.terminate_active = false
      "kill" => state.val.kill_active = false
      _ => ()
    }
    send_action(
      state,
      host,
      notify,
      done,
      object_of([("op", jstr("cancelTimer")), ("id", jstr(id))]),
    )
  }
}

fn begin_stop(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  message : String
) -> Unit {
  if state.val.finished {
    return
  }
  match state.val.primary_failure {
    Some(_) => return
    None => ()
  }
  state.val.primary_failure = Some(message)
  state.val.failure_name = "Error"
  cancel_timer(state, host, notify, done, "deadline")
  send_signal(state, host, notify, done, "SIGINT")
  schedule_timer(
    state,
    host,
    notify,
    done,
    "terminate",
    state.val.interrupt_grace_ms,
  )
}

fn finish_run(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit
) -> Unit {
  if state.val.finished {
    return
  }
  state.val.finished = true
  cancel_timer(state, host, notify, done, "deadline")
  cancel_timer(state, host, notify, done, "terminate")
  cancel_timer(state, host, notify, done, "kill")
  call_done(state.val, done)
}

fn deliver_line(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  line : String
) -> Unit {
  if utf8_len(line) > state.val.max_line_bytes {
    begin_stop(state, host, notify, done, "stdout line exceeded parser limit")
    return
  }
  notify(object_of([("type", jstr("line")), ("text", jstr(line))]).stringify())
  if !active(state) {
    return
  }
  if line.trim() == "" {
    return
  }
  let parsed = try {
    Some(@io.parse(line))
  } catch {
    _ => None
  }
  match parsed {
    Some(value) => consider_summary(state, host, notify, done, value)
    None => ()
  }
}

fn consider_summary(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  value : Json
) -> Unit {
  match value {
    Json::Object(fields) =>
      match fields.get("receipt") {
        Some(Json::String(_)) => {
          state.val.summaries.push(value)
          if state.val.summaries.length() > 8 {
            begin_stop(
              state,
              host,
              notify,
              done,
              "too many process receipt summaries",
            )
          }
        }
        _ => ()
      }
    _ => ()
  }
}

fn process_text(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  text : String
) -> Unit {
  if text == "" {
    return
  }
  let mut buffer = state.val.line_buffer + text
  let mut running = true
  while running && active(state) {
    match buffer.find("\n") {
      Some(index) => {
        let line = buffer[:index].to_owned()
        buffer = buffer[(index + 1):].to_owned()
        deliver_line(state, host, notify, done, line)
      }
      None => running = false
    }
  }
  if active(state) {
    if utf8_len(buffer) > state.val.max_line_bytes {
      state.val.line_buffer = ""
      begin_stop(state, host, notify, done, "stdout line exceeded parser limit")
    } else {
      state.val.line_buffer = buffer
    }
  } else {
    state.val.line_buffer = ""
  }
}

fn handle_spawned(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit
) -> Unit {
  schedule_timer(state, host, notify, done, "deadline", state.val.timeout_ms)
}

fn handle_data(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  let name = event_str(fields, "name")
  if name != "stdout" && name != "stderr" {
    return
  }
  let chunk_id = event_int(fields, "chunkId")
  let byte_len = event_int(fields, "bytes").to_int64()
  let text = event_str(fields, "text")
  let cap = state.val.max_log_bytes.to_int64()
  let received = sat_add(iget64(state.val.received, name), byte_len)
  state.val.received.set(name, received)
  let prev = iget64(state.val.written, name)
  let remaining = cap - prev
  let allowed = if remaining > 0L {
    if remaining < byte_len {
      remaining
    } else {
      byte_len
    }
  } else {
    0L
  }
  if allowed > 0L {
    state.val.written.set(name, prev + allowed)
    state.val.pending_write.set(name, allowed)
    send_action(
      state,
      host,
      notify,
      done,
      object_of([
        ("op", jstr("writeLog")),
        ("name", jstr(name)),
        ("chunkId", jint(chunk_id)),
        ("bytes", jcount(allowed)),
      ]),
    )
  }
  if received > cap {
    begin_stop(
      state,
      host,
      notify,
      done,
      name + " exceeded private log limit",
    )
  }
  if name == "stdout" && active(state) {
    process_text(state, host, notify, done, text)
  }
}

fn handle_flush(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  if event_str(fields, "name") == "stdout" && active(state) {
    process_text(state, host, notify, done, event_str(fields, "text"))
    if active(state) && event_bool(fields, "final") {
      let residual = state.val.line_buffer
      state.val.line_buffer = ""
      if residual != "" {
        deliver_line(state, host, notify, done, residual)
      }
    }
  }
}

fn handle_close(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  if state.val.child_closed {
    return
  }
  state.val.child_closed = true
  state.val.elapsed_ms = event_int(fields, "elapsedMs")
  state.val.exit_code = match fields.get("code") {
    Some(Json::Number(number, ..)) => Some(number.to_int())
    _ => None
  }
  state.val.signal = match fields.get("signal") {
    Some(Json::String(text)) => Some(text)
    _ => None
  }
  // A terminating run must not let descendants that ignore stdio escape just
  // because the owned leader exited cooperatively. MoonBit decides here to
  // issue one final group SIGKILL; a normal successful close stays untouched.
  if state.val.process_group {
    match state.val.primary_failure {
      Some(_) =>
        if !state.val.group_kill_sent {
          state.val.group_kill_sent = true
          send_signal(state, host, notify, done, "SIGKILL")
        }
      None => ()
    }
  }
  finish_run(state, host, notify, done)
}

fn handle_child_error(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  state.val.elapsed_ms = event_int(fields, "elapsedMs")
  match state.val.primary_failure {
    Some(_) => ()
    None => {
      state.val.primary_failure = Some(event_str(fields, "message"))
      state.val.failure_name = "Error"
    }
  }
  finish_run(state, host, notify, done)
}

fn handle_timer(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  match event_str(fields, "id") {
    "deadline" => {
      state.val.deadline_active = false
      state.val.timed_out = true
      begin_stop(
        state,
        host,
        notify,
        done,
        "process exceeded scenario check deadline",
      )
    }
    "terminate" => {
      state.val.terminate_active = false
      state.val.forced_termination = true
      state.val.cleanup_unverified = true
      send_signal(state, host, notify, done, "SIGTERM")
      schedule_timer(
        state,
        host,
        notify,
        done,
        "kill",
        state.val.terminate_grace_ms,
      )
    }
    "kill" => {
      state.val.kill_active = false
      state.val.forced_termination = true
      state.val.cleanup_unverified = true
      if state.val.process_group {
        state.val.group_kill_sent = true
      }
      send_signal(state, host, notify, done, "SIGKILL")
      send_action(
        state,
        host,
        notify,
        done,
        object_of([("op", jstr("destroyPipes"))]),
      )
    }
    _ => ()
  }
}

fn push_termination_error(state : Ref[Core], message : String) -> Unit {
  state.val.termination_errors.push(
    object_of([("name", jstr("Error")), ("message", jstr(message))]),
  )
}

// Reconcile the optimistic cap reservation with what the leaf actually wrote.
// `written` was pre-charged by the reserved amount; the leaf replies with the
// bytes it really persisted, which may be a partial prefix followed by a later
// write error.
fn reconcile_write(state : Ref[Core], fields : Map[String, Json]) -> Unit {
  let name = event_str(fields, "name")
  if name != "stdout" && name != "stderr" {
    return
  }
  let pending = iget64(state.val.pending_write, name)
  if pending == 0L {
    return
  }
  state.val.pending_write.set(name, 0L)
  let mut acked = event_int(fields, "bytes").to_int64()
  if acked < 0L {
    acked = 0L
  }
  if acked > pending {
    acked = pending
  }
  let base = sat_sub(iget64(state.val.written, name), pending)
  state.val.written.set(name, sat_add(base, acked))
}

fn handle_event(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  fields : Map[String, Json]
) -> Unit {
  if state.val.finished {
    return
  }
  match event_str(fields, "event") {
    "spawned" => handle_spawned(state, host, notify, done)
    "data" => handle_data(state, host, notify, done, fields)
    "flush" => handle_flush(state, host, notify, done, fields)
    "close" => handle_close(state, host, notify, done, fields)
    "childError" => handle_child_error(state, host, notify, done, fields)
    "abort" => {
      state.val.interrupted = true
      begin_stop(state, host, notify, done, "process control interrupted by signal")
    }
    "notifyError" =>
      begin_stop(
        state,
        host,
        notify,
        done,
        "onLine callback failed: " + event_str(fields, "message"),
      )
    "timer" => handle_timer(state, host, notify, done, fields)
    "written" => reconcile_write(state, fields)
    "ok" | "scheduled" => ()
    "signalError" =>
      push_termination_error(state, event_str(fields, "message"))
    "cleanupError" =>
      push_termination_error(state, event_str(fields, "message"))
    "writeError" => {
      reconcile_write(state, fields)
      begin_stop(
        state,
        host,
        notify,
        done,
        "private log write failed: " + event_str(fields, "message"),
      )
    }
    "scheduleError" =>
      begin_stop(
        state,
        host,
        notify,
        done,
        "timer scheduling failed: " + event_str(fields, "message"),
      )
    _ => begin_stop(state, host, notify, done, "unknown child process event")
  }
}

fn reply_event(
  state : Ref[Core],
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit,
  raw : String
) -> Unit {
  let parsed = try {
    Some(@io.as_object(@io.parse(raw)))
  } catch {
    _ => None
  }
  match parsed {
    Some(fields) => handle_event(state, host, notify, done, fields)
    None => begin_stop(state, host, notify, done, "invalid child process event")
  }
}

pub fn run_process_json(
  request : String,
  host : (String, (String) -> Unit) -> Unit,
  notify : (String) -> Unit,
  done : (String) -> Unit
) -> Unit {
  let outcome : Result[Config, String] = try {
    Ok(parse_config(request))
  } catch {
    @io.Io(message) => Err(message)
  }
  match outcome {
    Err(message) => call_done(invalid_core(message), done)
    Ok(cfg) => {
      let core = empty_core(
        cfg.file,
        cfg.args,
        cfg.cwd,
        cfg.stdout_path,
        cfg.stderr_path,
        cfg.max_log_bytes,
        cfg.max_line_bytes,
        cfg.interrupt_grace_ms,
        cfg.terminate_grace_ms,
        cfg.timeout_ms,
        cfg.process_group,
      )
      if cfg.aborted {
        core.interrupted = true
        core.primary_failure = Some("process control aborted before start")
        call_done(core, done)
      } else {
        let state = @ref.new(core)
        send_action(state, host, notify, done, spawn_action(cfg))
      }
    }
  }
}
