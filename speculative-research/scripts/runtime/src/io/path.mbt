// Pure POSIX-style path joining. Resolution against the host root is a host op.
pub fn join(a : String, b : String) -> String {
  if a == "" { return b }
  if b == "" { return a }
  if a.has_suffix("/") && b.has_prefix("/") { return a + b[1:].to_owned() }
  if a.has_suffix("/") || b.has_prefix("/") { return a + b }
  a + "/" + b
}

pub fn join_all(parts : Array[String]) -> String {
  let mut out = ""
  for part in parts {
    out = join(out, part)
  }
  out
}
