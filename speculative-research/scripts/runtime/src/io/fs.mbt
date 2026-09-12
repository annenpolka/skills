// Filesystem helpers. Every helper is a thin typed wrapper over a host op.
// Optional values are explicit Option parameters so callers (including the
// probe) can forward them without argument-sugar restrictions.
pub struct FileInfo {
  kind : String
  size : Double
  mode : Int
}

pub struct ZipEntry {
  name : String
  size : Double
  is_directory : Bool
}

fn file_info(value : Json) -> FileInfo? raise IoError {
  match value {
    Json::Null => None
    _ => {
      let fields = as_object(value)
      Some(
        ({
          kind: as_string(required(fields, "type")),
          size: as_size(required(fields, "size")),
          mode: as_int(required(fields, "mode")),
        } : FileInfo),
      )
    }
  }
}

pub fn read(host : (String) -> String, path : String) -> String raise IoError {
  as_string(call(host, request("read", one("path", Json::string(path)))))
}

pub fn write(
  host : (String) -> String,
  path : String,
  text : String,
  mode : Int?,
  append : Bool,
  exclusive : Bool
) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  fields.set("text", Json::string(text))
  put_int_opt(fields, "mode", mode)
  if append {
    fields.set("append", Json::boolean(true))
  }
  if exclusive {
    fields.set("exclusive", Json::boolean(true))
  }
  ignore(call(host, request("write", fields)))
}

pub fn mkdir(
  host : (String) -> String,
  path : String,
  recursive : Bool,
  mode : Int?,
  exclusive : Bool
) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  if recursive {
    fields.set("recursive", Json::boolean(true))
  }
  put_int_opt(fields, "mode", mode)
  if exclusive {
    fields.set("exclusive", Json::boolean(true))
  }
  ignore(call(host, request("mkdir", fields)))
}

pub fn stat(host : (String) -> String, path : String) -> FileInfo? raise IoError {
  file_info(call(host, request("stat", one("path", Json::string(path)))))
}

pub fn lstat(host : (String) -> String, path : String) -> FileInfo? raise IoError {
  file_info(call(host, request("lstat", one("path", Json::string(path)))))
}

pub fn list(host : (String) -> String, path : String) -> Array[String] raise IoError {
  let items = as_array(call(host, request("list", one("path", Json::string(path)))))
  let names : Array[String] = []
  for item in items {
    names.push(as_string(item))
  }
  names
}

pub fn realpath(host : (String) -> String, path : String, allow_missing : Bool) -> String raise IoError {
  let fields = one("path", Json::string(path))
  if allow_missing {
    fields.set("allowMissing", Json::boolean(true))
  }
  as_string(call(host, request("realpath", fields)))
}

pub fn resolve(host : (String) -> String, path : String) -> String raise IoError {
  as_string(call(host, request("resolve", one("path", Json::string(path)))))
}

pub fn relative(host : (String) -> String, base : String, path : String) -> String raise IoError {
  let fields = one("base", Json::string(base))
  fields.set("path", Json::string(path))
  as_string(call(host, request("relative", fields)))
}

pub fn dirname(host : (String) -> String, path : String) -> String raise IoError {
  as_string(call(host, request("dirname", one("path", Json::string(path)))))
}

pub fn basename(host : (String) -> String, path : String) -> String raise IoError {
  as_string(call(host, request("basename", one("path", Json::string(path)))))
}

pub fn copy(host : (String) -> String, src : String, dst : String, recursive : Bool) -> Unit raise IoError {
  let fields = one("src", Json::string(src))
  fields.set("dst", Json::string(dst))
  if recursive {
    fields.set("recursive", Json::boolean(true))
  }
  ignore(call(host, request("copy", fields)))
}

pub fn rename(host : (String) -> String, src : String, dst : String) -> Unit raise IoError {
  let fields = one("src", Json::string(src))
  fields.set("dst", Json::string(dst))
  ignore(call(host, request("rename", fields)))
}

pub fn remove(
  host : (String) -> String,
  path : String,
  recursive : Bool,
  missing_ok : Bool
) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  if recursive {
    fields.set("recursive", Json::boolean(true))
  }
  if missing_ok {
    fields.set("missingOk", Json::boolean(true))
  }
  ignore(call(host, request("remove", fields)))
}

pub fn chmod(host : (String) -> String, path : String, mode : Int) -> Unit raise IoError {
  let fields = one("path", Json::string(path))
  fields.set("mode", Json::number(mode.to_double()))
  ignore(call(host, request("chmod", fields)))
}

pub fn symlink(host : (String) -> String, src : String, dst : String) -> Unit raise IoError {
  let fields = one("src", Json::string(src))
  fields.set("dst", Json::string(dst))
  ignore(call(host, request("symlink", fields)))
}
