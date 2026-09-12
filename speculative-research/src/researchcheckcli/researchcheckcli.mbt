// Read-only research evidence CLI.
//
// Loading and hashing are IO: packet/refs/review/candidate bytes come from the
// existing `readRecord` host operation and source bytes from `researchReadRecord`.
// The pure `researchcheck` package owns every decision and parser. This program
// only transports values, never writes, and never invokes a provider.

fn err_envelope(code : String) -> Json {
  {"ok": false, "errors": [{"code": Json::string(code)}]}
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

fn is_flag(name : String) -> Bool {
  let chars = name.to_array()
  chars.length() >= 2 && chars[0].to_int() == 45 && chars[1].to_int() == 45
}

fn parse_args(args : Array[String]) -> (String, Map[String, String]) raise @io.IoError {
  if args.is_empty() {
    @io.fail("missing_command")
  }
  let command = args[0]
  if !["quote", "locate", "review"].contains(command) {
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

fn parse_int_flag(text : String) -> Int raise @io.IoError {
  let chars = text.to_array()
  if chars.is_empty() {
    @io.fail("invalid_integer")
  }
  let mut index = 0
  let mut negative = false
  if chars[0].to_int() == 45 {
    negative = true
    index = 1
  }
  if index >= chars.length() {
    @io.fail("invalid_integer")
  }
  let mut value = 0
  while index < chars.length() {
    let code = chars[index].to_int()
    if code < 48 || code > 57 {
      @io.fail("invalid_integer")
    }
    let digit = code - 48
    if value > (2147483647 - digit) / 10 {
      @io.fail("invalid_integer")
    }
    value = value * 10 + digit
    index = index + 1
  }
  if negative {
    -value
  } else {
    value
  }
}

fn valid_sha(text : String) -> Bool {
  let chars = text.to_array()
  if chars.length() != 64 {
    return false
  }
  for c in chars {
    let code = c.to_int()
    if !((code >= 48 && code <= 57) || (code >= 97 && code <= 102)) {
      return false
    }
  }
  true
}

fn relative_safe(path : String) -> Bool {
  if path.is_empty() {
    return false
  }
  let chars = path.to_array()
  if chars[0].to_int() == 47 {
    return false
  }
  let n = chars.length()
  let mut start = 0
  let mut index = 0
  while index <= n {
    if index == n || chars[index].to_int() == 47 {
      let length = index - start
      if length == 0 {
        return false
      }
      if length == 1 && chars[start].to_int() == 46 {
        return false
      }
      if length == 2 && chars[start].to_int() == 46 && chars[start + 1].to_int() == 46 {
        return false
      }
      start = index + 1
    } else {
      let code = chars[index].to_int()
      if code == 92 || code == 58 || code == 0 {
        return false
      }
    }
    index = index + 1
  }
  true
}

fn absolute_root(path : String) -> Bool {
  let chars = path.to_array()
  !chars.is_empty() && chars[0].to_int() == 47
}

fn load_record(host : (String) -> String, path : String) -> Json raise @io.IoError {
  @io.call(host, {"op": "readRecord", "path": path})
}

fn load_json_record(host : (String) -> String, path : String) -> Json raise @io.IoError {
  let fields = @io.as_object(load_record(host, path))
  @io.parse(@io.as_string(@io.required(fields, "text")))
}

fn packet_root(packet : Map[String, Json]) -> String raise @io.IoError {
  let root = @io.as_string(@io.required(packet, "frozenSourceRoot"))
  if !absolute_root(root) {
    @io.fail("invalid_source_root")
  }
  root
}

fn allowed_files(packet : Map[String, Json]) -> Array[(String, String)] raise @io.IoError {
  let items = @io.as_array(@io.required(packet, "allowedSourceFiles"))
  let seen : Map[String, Bool] = Map::new()
  let out : Array[(String, String)] = []
  for item in items {
    let fields = @io.as_object(item)
    let path = @io.as_string(@io.required(fields, "path"))
    if !relative_safe(path) {
      @io.fail("unsafe_allowed_path")
    }
    let sha = @io.as_string(@io.required(fields, "sha256"))
    if !valid_sha(sha) {
      @io.fail("invalid_allowed_hash")
    }
    if seen.contains(path) {
      @io.fail("duplicate_allowed_path")
    }
    seen.set(path, true)
    out.push((path, sha))
  }
  out
}

// Every allowed file is bound (read and hash-checked) before any quote or check
// material is emitted. A failed or drifted source never produces a quote.
//
// Each frozen source read carries an explicit 32 MiB (33,554,432 byte) record
// bound. This is an IO envelope for one record, not a research cost or depth
// budget: an over-limit record fails with a structured error and is never
// truncated. Packet/refs/review/candidate JSON use the host `readRecord`
// defaults without a tool-level cap.
fn load_sources(
  host : (String) -> String,
  root : String,
  allowed : Array[(String, String)],
) -> Array[Json] raise @io.IoError {
  let sources : Array[Json] = []
  for pair in allowed {
    let path = pair.0
    let expected = pair.1
    let record = @io.call(host, {"op": "researchReadRecord", "root": root, "path": path,
      "maxBytes": 33554432})
    let fields = @io.as_object(record)
    let text = @io.as_string(@io.required(fields, "text"))
    let sha = @io.as_string(@io.required(fields, "sha256"))
    if sha != expected {
      @io.fail("source_hash_mismatch")
    }
    sources.push({"path": path, "text": text, "sha256": sha})
  }
  sources
}

fn parse_packet(
  host : (String) -> String,
  path : String,
) -> (Map[String, Json], String, Array[Json]) raise @io.IoError {
  let packet = @io.as_object(load_json_record(host, path))
  let root = packet_root(packet)
  let allowed = allowed_files(packet)
  let sources = load_sources(host, root, allowed)
  (packet, root, sources)
}

fn dispatch_core(request : Map[String, Json]) -> Json raise @io.IoError {
  @io.parse(@researchcheck.dispatch_json(Json::object(request).stringify()))
}

fn run_quote(
  host : (String) -> String,
  flags : Map[String, String],
) -> Json raise @io.IoError {
  let packet_path = need_flag(flags, "--packet")
  let source_path = need_flag(flags, "--path")
  let from_line = parse_int_flag(need_flag(flags, "--from"))
  let to_line = parse_int_flag(need_flag(flags, "--to"))
  let (_packet, _root, sources) = parse_packet(host, packet_path)
  let request : Map[String, Json] = Map::new()
  request.set("op", Json::string("quote"))
  request.set("sources", Json::array(sources))
  request.set("path", Json::string(source_path))
  request.set("fromLine", Json::number(from_line.to_double()))
  request.set("toLine", Json::number(to_line.to_double()))
  dispatch_core(request)
}

fn run_locate(
  host : (String) -> String,
  flags : Map[String, String],
) -> Json raise @io.IoError {
  let packet_path = need_flag(flags, "--packet")
  let refs_path = need_flag(flags, "--refs")
  let (_packet, _root, sources) = parse_packet(host, packet_path)
  let references = load_json_record(host, refs_path)
  let request : Map[String, Json] = Map::new()
  request.set("op", Json::string("locate"))
  request.set("sources", Json::array(sources))
  request.set("references", references)
  dispatch_core(request)
}

fn run_review(
  host : (String) -> String,
  flags : Map[String, String],
) -> Json raise @io.IoError {
  let packet_path = need_flag(flags, "--packet")
  let candidate_path = need_flag(flags, "--candidate")
  let review_path = need_flag(flags, "--review")
  let (packet, _packet_root, sources) = parse_packet(host, packet_path)
  let candidate_fields = @io.as_object(load_record(host, candidate_path))
  let candidate_sha = @io.as_string(@io.required(candidate_fields, "sha256"))
  let review = @io.as_object(load_json_record(host, review_path))
  let request : Map[String, Json] = Map::new()
  request.set("op", Json::string("validateReview"))
  request.set("sources", Json::array(sources))
  request.set("candidateSha256", Json::string(candidate_sha))
  request.set("packet", Json::object(packet))
  request.set("review", Json::object(review))
  // Only when the packet carries an inline draft do we parse the candidate text
  // from the same record whose bytes produced candidate_sha. File-only packets
  // never require the candidate to be JSON and never reread the file.
  let peer = @io.as_object(@io.required(packet, "peerReview"))
  let has_draft = match peer.get("candidateDraft") {
    Some(Json::Null) | None => false
    Some(_) => true
  }
  if has_draft {
    let candidate_text = @io.as_string(@io.required(candidate_fields, "text"))
    request.set("candidateValue", @io.parse(candidate_text))
  }
  dispatch_core(request)
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
    "quote" => {
      check_flags(flags, ["--packet", "--path", "--from", "--to"])
      run_quote(host, flags)
    }
    "locate" => {
      check_flags(flags, ["--packet", "--refs"])
      run_locate(host, flags)
    }
    "review" => {
      check_flags(flags, ["--packet", "--candidate", "--review"])
      run_review(host, flags)
    }
    _ => @io.fail("unknown_command")
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
      let text = result.stringify()
      try {
        @io.print(host, text + "\n", false)
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
