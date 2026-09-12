// JSON accessors used by every IO helper. Each failure is a generic IoError;
// field values are never echoed back to callers.
pub fn parse(text : String) -> Json raise IoError {
  @json.parse(text) catch { _ => raise Io("invalid JSON") }
}

pub fn as_object(value : Json) -> Map[String, Json] raise IoError {
  match value {
    Json::Object(fields) => fields
    _ => raise Io("expected JSON object")
  }
}

pub fn as_array(value : Json) -> Array[Json] raise IoError {
  match value {
    Json::Array(items) => items
    _ => raise Io("expected JSON array")
  }
}

pub fn as_string(value : Json) -> String raise IoError {
  match value {
    Json::String(text) => text
    _ => raise Io("expected JSON string")
  }
}

pub fn as_number(value : Json) -> Double raise IoError {
  match value {
    Json::Number(number, ..) => number
    _ => raise Io("expected JSON number")
  }
}

pub fn is_safe_int(number : Double) -> Bool {
  !number.is_nan() && !number.is_inf() && number.floor() == number && number.abs() <= 9007199254740991.0
}

pub fn as_int(value : Json) -> Int raise IoError {
  let number = as_number(value)
  if !is_safe_int(number) { raise Io("invalid JSON integer") }
  if number < -2147483648.0 || number > 2147483647.0 { raise Io("integer out of range") }
  number.to_int()
}

// Sizes travel as JSON numbers and stay Double so values above the 32-bit Int
// range (for example a multi-GB sparse file) survive; they must still be exact
// safe nonnegative integers.
pub fn as_size(value : Json) -> Double raise IoError {
  let number = as_number(value)
  if !is_safe_int(number) || number < 0.0 { raise Io("invalid JSON size") }
  number
}

pub fn as_bool(value : Json) -> Bool raise IoError {
  match value {
    Json::True => true
    Json::False => false
    _ => raise Io("expected JSON boolean")
  }
}

pub fn required(fields : Map[String, Json], key : String) -> Json raise IoError {
  match fields.get(key) {
    Some(value) => value
    None => raise Io("missing field " + key)
  }
}

pub fn optional_string(fields : Map[String, Json], key : String) -> String? raise IoError {
  match fields.get(key) {
    Some(Json::Null) | None => None
    Some(value) => Some(as_string(value))
  }
}

pub fn optional_int(fields : Map[String, Json], key : String) -> Int? raise IoError {
  match fields.get(key) {
    Some(Json::Null) | None => None
    Some(value) => Some(as_int(value))
  }
}

pub fn optional_bool(fields : Map[String, Json], key : String) -> Bool? raise IoError {
  match fields.get(key) {
    Some(Json::Null) | None => None
    Some(value) => Some(as_bool(value))
  }
}

pub fn optional_array(fields : Map[String, Json], key : String) -> Array[Json]? raise IoError {
  match fields.get(key) {
    Some(Json::Null) | None => None
    Some(value) => Some(as_array(value))
  }
}

pub fn put_string_opt(fields : Map[String, Json], key : String, value : String?) -> Unit {
  match value {
    Some(text) => fields.set(key, Json::string(text))
    None => ()
  }
}

pub fn put_int_opt(fields : Map[String, Json], key : String, value : Int?) -> Unit {
  match value {
    Some(number) => fields.set(key, Json::number(number.to_double()))
    None => ()
  }
}

pub fn put_bool_opt(fields : Map[String, Json], key : String, value : Bool?) -> Unit {
  match value {
    Some(flag) => fields.set(key, Json::boolean(flag))
    None => ()
  }
}
