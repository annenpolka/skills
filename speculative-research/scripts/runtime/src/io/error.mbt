// Errors surfaced by the IO helpers. Messages are generic and must never
// embed request payloads, environment contents, or secret material.
pub suberror IoError {
  Io(String)
}

// Sibling packages cannot construct `Io` directly (a foreign suberror
// constructor is read-only), but they can call `fail` to raise a user-facing
// message through this package. The generic return type lets `fail` stand in
// for any expression, so `match` arms and `let` bindings stay total.
pub fn[T] fail(message : String) -> T raise IoError {
  raise Io(message)
}
