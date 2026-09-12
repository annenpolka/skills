// Host transport. The host callback is a synchronous (String) -> String that
// maps one request JSON string to one reply JSON string. No FFI is involved.
pub fn one(key : String, value : Json) -> Map[String, Json] {
  let fields : Map[String, Json] = Map::new()
  fields.set(key, value)
  fields
}

pub fn request(op : String, fields : Map[String, Json]) -> Json {
  fields.set("op", Json::string(op))
  Json::object(fields)
}

pub fn call(host : (String) -> String, request : Json) -> Json raise IoError {
  let fields = as_object(parse(host(request.stringify())))
  let ok = match required(fields, "ok") {
    Json::True => true
    Json::False => false
    _ => raise Io("invalid host reply")
  }
  if ok {
    required(fields, "value")
  } else {
    let error = match fields.get("error") {
      Some(Json::String(text)) => text
      _ => "host error"
    }
    let code = match fields.get("code") {
      Some(Json::String(text)) => text
      _ => ""
    }
    raise Io(if code == "" { error } else { code + ": " + error })
  }
}
