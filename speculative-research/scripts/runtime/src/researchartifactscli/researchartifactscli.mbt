// CLI entry for machine-written research artifacts.
//
// Argument parsing, output replacement and file publication live here; every
// schema and citation decision is owned by `researchcheck`/`researchartifacts`.

fn err_envelope(code : String) -> Json {
  {"ok": false, "errors": [{"code": Json::string(code)}]}
}

fn is_flag(name : String) -> Bool {
  let chars = name.to_array()
  chars.length() >= 2 && chars[0].to_int() == 45 && chars[1].to_int() == 45
}

fn parse_args(args : Array[String]) -> (String, Map[String, String]) raise @io.IoError {
  if args.is_empty() {
    @io.fail("missing_command")
  }
  let command = args[0]
  if !["research", "review", "revise", "export-peer"].contains(command) {
    @io.fail("unknown_command")
  }
  let flags : Map[String, String] = Map::new()
  let mut index = 1
  while index < args.length() {
    let name = args[index]
    if !is_flag(name) {
      @io.fail("unexpected_positional")
    }
    if index + 1 >= args.length() {
      @io.fail("missing_flag_value")
    }
    if flags.contains(name) {
      @io.fail("duplicate_flag")
    }
    flags.set(name, args[index + 1])
    index = index + 2
  }
  (command, flags)
}

fn check_flags(flags : Map[String, String], allowed : Array[String]) -> Unit raise @io.IoError {
  for pair in flags.to_array() {
    if !allowed.contains(pair.0) {
      @io.fail("unknown_flag_" + pair.0)
    }
  }
}

fn need_flag(flags : Map[String, String], name : String) -> String raise @io.IoError {
  match flags.get(name) {
    Some(value) => value
    None => @io.fail("missing_flag_" + name)
  }
}

fn run(input : String, host : (String) -> String) -> Json raise @io.IoError {
  let request = @io.as_object(@io.parse(input))
  let raw_args = @io.as_array(@io.required(request, "args"))
  let args : Array[String] = []
  for item in raw_args {
    args.push(@io.as_string(item))
  }
  let (command, flags) = parse_args(args)
  match command {
    "research" => {
      check_flags(flags, ["--packet", "--draft", "--out"])
      @researchartifacts.research(host, need_flag(flags, "--packet"),
        need_flag(flags, "--draft"), need_flag(flags, "--out"))
    }
    "review" => {
      check_flags(flags, ["--packet", "--candidate", "--draft", "--out"])
      @researchartifacts.review(host, need_flag(flags, "--packet"),
        need_flag(flags, "--candidate"), need_flag(flags, "--draft"), need_flag(flags, "--out"))
    }
    "revise" => {
      check_flags(flags, ["--packet", "--candidate", "--review", "--draft", "--out"])
      @researchartifacts.revise(host, need_flag(flags, "--packet"),
        need_flag(flags, "--candidate"), need_flag(flags, "--review"),
        need_flag(flags, "--draft"), need_flag(flags, "--out"))
    }
    "export-peer" => {
      check_flags(flags, ["--ledger", "--run", "--out", "--include"])
      let extra : Array[String] = match flags.get("--include") {
        Some(path) => {
          let values : Array[String] = []
          for item in @io.as_array(@io.parse(@io.read(host, path))) {
            values.push(@io.as_string(item))
          }
          values
        }
        None => []
      }
      @researchartifacts.export_peer(host, need_flag(flags, "--ledger"),
        need_flag(flags, "--run"), need_flag(flags, "--out"), extra)
    }
    _ => @io.fail("unknown_command")
  }
}

fn json_ok(result : Json) -> Bool {
  match result {
    Json::Object(fields) => match fields.get("ok") {
      Some(Json::True) => true
      _ => false
    }
    _ => false
  }
}

pub fn run_cli(
  input : String,
  host : (String) -> String,
  _async_host : (String, (String) -> Unit) -> Unit,
  done : (String) -> Unit,
) -> Unit {
  let outcome : Result[Json, String] = try {
    Ok(run(input, host))
  } catch {
    @io.Io(message) => Err(message)
  }
  match outcome {
    Ok(result) => {
      try {
        @io.print(host, result.stringify() + "\n", false)
      } catch {
        @io.Io(_) => ()
      }
      done(({"exitCode": if json_ok(result) { 0 } else { 1 }} : Json).stringify())
    }
    Err(message) => {
      let result = err_envelope(message)
      try {
        @io.print(host, result.stringify() + "\n", false)
      } catch {
        @io.Io(_) => ()
      }
      done(({"exitCode": 1, "error": Json::string(message)} : Json).stringify())
    }
  }
}
