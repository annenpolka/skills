// Subprocess helpers. Nonzero exits are preserved in SpawnResult so callers
// can decide; run() is the checked variant that rejects them.
pub struct SpawnResult {
  status : Int?
  signal : String?
  stdout : String
  stderr : String
  stdout_sha256 : String?
}

fn spawn_result(
  host : (String) -> String,
  file : String,
  args : Array[String],
  cwd : String?,
  env : Map[String, String]?,
  input : String?,
  stdin_file : String?,
  stdout_file : String?,
  append_output : Bool,
  exclusive : Bool,
  timeout_ms : Int?,
  inherit_stdio : Bool
) -> SpawnResult raise IoError {
  match (input, stdin_file) {
    (Some(_), Some(_)) => raise Io("input and stdinFile are mutually exclusive")
    _ => ()
  }
  let fields = one("file", Json::string(file))
  let encoded : Array[Json] = []
  for arg in args {
    encoded.push(Json::string(arg))
  }
  fields.set("args", Json::array(encoded))
  put_string_opt(fields, "cwd", cwd)
  match env {
    Some(overlay) => {
      let map : Map[String, Json] = Map::new()
      overlay.each((key, value) => map.set(key, Json::string(value)))
      fields.set("env", Json::object(map))
    }
    None => ()
  }
  put_string_opt(fields, "input", input)
  put_string_opt(fields, "stdinFile", stdin_file)
  put_string_opt(fields, "stdoutFile", stdout_file)
  if append_output {
    fields.set("appendOutput", Json::boolean(true))
  }
  if exclusive {
    fields.set("exclusive", Json::boolean(true))
  }
  put_int_opt(fields, "timeoutMs", timeout_ms)
  if inherit_stdio {
    fields.set("inherit", Json::boolean(true))
  }
  let value = as_object(call(host, request("spawn", fields)))
  {
    status: optional_int(value, "status"),
    signal: optional_string(value, "signal"),
    stdout: as_string(required(value, "stdout")),
    stderr: as_string(required(value, "stderr")),
    stdout_sha256: optional_string(value, "stdoutSha256"),
  }
}

pub fn spawn(
  host : (String) -> String,
  file : String,
  args : Array[String],
  cwd : String?,
  env : Map[String, String]?,
  input : String?,
  stdin_file : String?,
  stdout_file : String?,
  append_output : Bool,
  exclusive : Bool,
  timeout_ms : Int?,
  inherit_stdio : Bool
) -> SpawnResult raise IoError {
  spawn_result(host, file, args, cwd, env, input, stdin_file, stdout_file, append_output, exclusive, timeout_ms, inherit_stdio)
}

pub fn run(
  host : (String) -> String,
  file : String,
  args : Array[String],
  cwd : String?,
  env : Map[String, String]?,
  input : String?,
  stdin_file : String?,
  stdout_file : String?,
  append_output : Bool,
  exclusive : Bool,
  timeout_ms : Int?,
  inherit_stdio : Bool
) -> SpawnResult raise IoError {
  let result = spawn_result(host, file, args, cwd, env, input, stdin_file, stdout_file, append_output, exclusive, timeout_ms, inherit_stdio)
  match result.signal {
    Some(_) => raise Io("command terminated by signal")
    None => ()
  }
  match result.status {
    Some(0) => result
    Some(code) => raise Io("command failed with status " + code.to_string())
    None => raise Io("command did not report a status")
  }
}

pub fn spawn_detached(
  host : (String) -> String,
  file : String,
  args : Array[String],
  cwd : String?,
  env : Map[String, String]?,
  log : String
) -> Int raise IoError {
  let fields = one("file", Json::string(file))
  let encoded : Array[Json] = []
  for arg in args {
    encoded.push(Json::string(arg))
  }
  fields.set("args", Json::array(encoded))
  put_string_opt(fields, "cwd", cwd)
  match env {
    Some(overlay) => {
      let map : Map[String, Json] = Map::new()
      overlay.each((key, value) => map.set(key, Json::string(value)))
      fields.set("env", Json::object(map))
    }
    None => ()
  }
  fields.set("log", Json::string(log))
  as_int(call(host, request("spawnDetached", fields)))
}

pub fn kill(host : (String) -> String, pid : Int, signal : String?) -> Unit raise IoError {
  let fields = one("pid", Json::number(pid.to_double()))
  put_string_opt(fields, "signal", signal)
  ignore(call(host, request("kill", fields)))
}

pub fn alive(host : (String) -> String, pid : Int) -> Bool raise IoError {
  as_bool(call(host, request("alive", one("pid", Json::number(pid.to_double())))))
}

pub fn port(
  host : (String) -> String,
  port : Int,
  host_name : String?,
  timeout_ms : Int?
) -> Bool raise IoError {
  let fields = one("port", Json::number(port.to_double()))
  put_string_opt(fields, "host", host_name)
  put_int_opt(fields, "timeoutMs", timeout_ms)
  as_bool(call(host, request("port", fields)))
}
