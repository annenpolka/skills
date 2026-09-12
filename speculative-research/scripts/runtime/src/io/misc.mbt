// Small host-backed helpers: hashing, randomness, clock, temp dirs, output.
pub fn hash(host : (String) -> String, path : String) -> String raise IoError {
  as_string(call(host, request("hash", one("path", Json::string(path)))))
}

pub fn hash_text(host : (String) -> String, text : String) -> String raise IoError {
  as_string(call(host, request("hashText", one("text", Json::string(text)))))
}

pub fn random_hex(host : (String) -> String, bytes : Int) -> String raise IoError {
  as_string(call(host, request("randomHex", one("bytes", Json::number(bytes.to_double())))))
}

pub fn now(host : (String) -> String) -> String raise IoError {
  as_string(call(host, request("now", Map::new())))
}

pub fn pid(host : (String) -> String) -> Int raise IoError {
  as_int(call(host, request("pid", Map::new())))
}

pub fn temp(host : (String) -> String, parent : String?, prefix : String?) -> String raise IoError {
  let fields : Map[String, Json] = Map::new()
  put_string_opt(fields, "parent", parent)
  put_string_opt(fields, "prefix", prefix)
  as_string(call(host, request("temp", fields)))
}

pub fn sleep(host : (String) -> String, ms : Int) -> Unit raise IoError {
  ignore(call(host, request("sleep", one("ms", Json::number(ms.to_double())))))
}

pub fn print(host : (String) -> String, text : String, stderr : Bool) -> Unit raise IoError {
  let fields = one("text", Json::string(text))
  if stderr {
    fields.set("stderr", Json::boolean(true))
  }
  ignore(call(host, request("print", fields)))
}

pub fn which(host : (String) -> String, name : String) -> String? raise IoError {
  match call(host, request("which", one("name", Json::string(name)))) {
    Json::Null => None
    value => Some(as_string(value))
  }
}

pub fn zip_list(host : (String) -> String, path : String) -> Array[ZipEntry] raise IoError {
  let items = as_array(call(host, request("zipList", one("path", Json::string(path)))))
  let entries : Array[ZipEntry] = []
  for item in items {
    let fields = as_object(item)
    entries.push(
      ({
        name: as_string(required(fields, "name")),
        size: as_size(required(fields, "size")),
        is_directory: as_bool(required(fields, "isDirectory")),
      } : ZipEntry),
    )
  }
  entries
}

pub fn zip_extract(
  host : (String) -> String,
  path : String,
  name : String,
  destination : String
) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  fields.set("name", Json::string(name))
  fields.set("destination", Json::string(destination))
  ignore(call(host, request("zipExtract", fields)))
}

pub fn tar_extract(host : (String) -> String, path : String, destination : String) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  fields.set("destination", Json::string(destination))
  ignore(call(host, request("tarExtract", fields)))
}
