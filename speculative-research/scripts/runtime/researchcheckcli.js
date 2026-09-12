function _M0DTPB4Json4Null() {}
_M0DTPB4Json4Null.prototype.$tag = 0;
const _M0DTPB4Json4Null__ = new _M0DTPB4Json4Null();
function _M0DTPB4Json4True() {}
_M0DTPB4Json4True.prototype.$tag = 1;
const _M0DTPB4Json4True__ = new _M0DTPB4Json4True();
function _M0DTPB4Json5False() {}
_M0DTPB4Json5False.prototype.$tag = 2;
const _M0DTPB4Json5False__ = new _M0DTPB4Json5False();
function _M0DTPB4Json6Number(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPB4Json6Number.prototype.$tag = 3;
function _M0DTPB4Json6String(param0) {
  this._0 = param0;
}
_M0DTPB4Json6String.prototype.$tag = 4;
function _M0DTPB4Json5Array(param0) {
  this._0 = param0;
}
_M0DTPB4Json5Array.prototype.$tag = 5;
function _M0DTPB4Json6Object(param0) {
  this._0 = param0;
}
_M0DTPB4Json6Object.prototype.$tag = 6;
const $reinterpret_view = new DataView(new ArrayBuffer(8));
function $i64_reinterpret_f64(a) {
  $reinterpret_view.setBigUint64(0, BigInt.asUintN(64, a), false);
  return $reinterpret_view.getFloat64(0, false);
}
function _M0TPC28internal7strconv9FloatInfo(param0, param1, param2) {
  this.mantissa_bits = param0;
  this.exponent_bits = param1;
  this.bias = param2;
}
class $PanicError extends Error {}
function $panic() {
  throw new $PanicError();
}
function _M0TPB13StringBuilder(param0) {
  this.val = param0;
}
function _M0TPC16string10StringView(param0, param1, param2) {
  this.str = param0;
  this.start = param1;
  this.end = param2;
}
function $compare_int(a, b) {
  return (a >= b) - (a <= b);
}
const _M0FPB12random__seed = () => {
  if (globalThis.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    globalThis.crypto.getRandomValues(array);
    return array[0] | 0; // Convert to signed 32
  } else {
    return Math.floor(Math.random() * 0x100000000) | 0; // Fallback to Math.random
  }
};
function _M0TPB6Hasher(param0) {
  this.acc = param0;
}
function $bound_check(arr, index) {
  if (index < 0 || index >= arr.length) throw new Error("Index out of bounds");
}
function $makebytes(a, b) {
  const arr = new Uint8Array(a);
  if (b !== 0) {
    arr.fill(b);
  }
  return arr;
}
function $make_array_len_and_init(a, b) {
  const arr = new Array(a);
  arr.fill(b);
  return arr;
}
const _M0MPB7JSArray4push = (arr, val) => { arr.push(val); };
function _M0TPB8MutLocalGiE(param0) {
  this.val = param0;
}
function _M0TPB3MapGsRPB4JsonE(param0, param1, param2, param3, param4, param5, param6) {
  this.entries = param0;
  this.size = param1;
  this.capacity = param2;
  this.capacity_mask = param3;
  this.grow_at = param4;
  this.head = param5;
  this.tail = param6;
}
function _M0TPB3MapGsbE(param0, param1, param2, param3, param4, param5, param6) {
  this.entries = param0;
  this.size = param1;
  this.capacity = param2;
  this.capacity_mask = param3;
  this.grow_at = param4;
  this.head = param5;
  this.tail = param6;
}
function _M0TPB3MapGsiE(param0, param1, param2, param3, param4, param5, param6) {
  this.entries = param0;
  this.size = param1;
  this.capacity = param2;
  this.capacity_mask = param3;
  this.grow_at = param4;
  this.head = param5;
  this.tail = param6;
}
function _M0TPB3MapGsRPB5ArrayGcEE(param0, param1, param2, param3, param4, param5, param6) {
  this.entries = param0;
  this.size = param1;
  this.capacity = param2;
  this.capacity_mask = param3;
  this.grow_at = param4;
  this.head = param5;
  this.tail = param6;
}
function _M0TPB5EntryGsRPB4JsonE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGssE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGsbE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGsRPB3MapGsRPB4JsonEE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGsiE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGsRPB5ArrayGcEE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0DTPC16option6OptionGRPB5ArrayGcEE4None() {}
_M0DTPC16option6OptionGRPB5ArrayGcEE4None.prototype.$tag = 0;
const _M0DTPC16option6OptionGRPB5ArrayGcEE4None__ = new _M0DTPC16option6OptionGRPB5ArrayGcEE4None();
function _M0DTPC16option6OptionGRPB5ArrayGcEE4Some(param0) {
  this._0 = param0;
}
_M0DTPC16option6OptionGRPB5ArrayGcEE4Some.prototype.$tag = 1;
function _M0TPB8MutLocalGORPB5EntryGsRPB4JsonEE(param0) {
  this.val = param0;
}
const _M0FPB15ryu__to__string = (number) => number.toString();
const _M0MPB7JSArray3pop = (arr) => arr.pop();
function _M0DTPC16result6ResultGUiRPC16string10StringViewbERPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUiRPC16string10StringViewbERPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGUiRPC16string10StringViewbERPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUiRPC16string10StringViewbERPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(param0) {
  this._0 = param0;
}
_M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid.prototype.$tag = 7;
function _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(param0) {
  this._0 = param0;
}
_M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo.prototype.$tag = 6;
function _M0DTPC15error5Error52moonbitlang_2fcore_2fjson_2eParseError_2eInvalidChar(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPC15error5Error52moonbitlang_2fcore_2fjson_2eParseError_2eInvalidChar.prototype.$tag = 5;
function _M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof() {}
_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof.prototype.$tag = 4;
const _M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__ = new _M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof();
function _M0DTPC15error5Error54moonbitlang_2fcore_2fjson_2eParseError_2eInvalidNumber(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPC15error5Error54moonbitlang_2fcore_2fjson_2eParseError_2eInvalidNumber.prototype.$tag = 3;
function _M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eInvalidIdentEscape(param0) {
  this._0 = param0;
}
_M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eInvalidIdentEscape.prototype.$tag = 2;
function _M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded() {}
_M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded.prototype.$tag = 1;
const _M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded__ = new _M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded();
function _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(param0) {
  this._0 = param0;
}
_M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure.prototype.$tag = 0;
function _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGuRPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGuRPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGiRPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGiRPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGlRPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGlRPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGlRPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGlRPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGdRPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGdRPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPB7FailureE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPC28internal7strconv6NumberRPB7FailureE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPB7FailureE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPC28internal7strconv6NumberRPB7FailureE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok.prototype.$tag = 1;
function _M0TPC28internal7strconv6Number(param0, param1, param2, param3) {
  this.exponent = param0;
  this.mantissa = param1;
  this.negative = param2;
  this.many_digits = param3;
}
function _M0DTPC16result6ResultGdRPC15error5ErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRPC15error5ErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRPC15error5ErrorE2Ok.prototype.$tag = 1;
function $i64_clz(a) {
  a = BigInt.asUintN(64, a);
  if (a === 0n) return 64;
  const hi = Number(a >> 32n);
  if (hi !== 0) {
    return Math.clz32(hi);
  }
  return 32 + Math.clz32(Number(a & 0xffffffffn));
}
function _M0DTPC16result6ResultGlRPC15error5ErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGlRPC15error5ErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGlRPC15error5ErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGlRPC15error5ErrorE2Ok.prototype.$tag = 1;
function _M0TPC28internal7strconv7Decimal(param0, param1, param2, param3, param4) {
  this.digits = param0;
  this.digits_num = param1;
  this.decimal_point = param2;
  this.negative = param3;
  this.truncated = param4;
}
function _M0DTPC16result6ResultGRPC28internal7strconv7DecimalRPC15error5ErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPC28internal7strconv7DecimalRPC15error5ErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPC28internal7strconv7DecimalRPC15error5ErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPC28internal7strconv7DecimalRPC15error5ErrorE2Ok.prototype.$tag = 1;
function $f64_convert_i64_u(a) {
  return Number(a);
}
function _M0DTPC16option6OptionGdE4None() {}
_M0DTPC16option6OptionGdE4None.prototype.$tag = 0;
const _M0DTPC16option6OptionGdE4None__ = new _M0DTPC16option6OptionGdE4None();
function _M0DTPC16option6OptionGdE4Some(param0) {
  this._0 = param0;
}
_M0DTPC16option6OptionGdE4Some.prototype.$tag = 1;
function _M0TPC14json8Position(param0, param1) {
  this.line = param0;
  this.column = param1;
}
function _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGuRPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGuRPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0TPC14json12ParseContext(param0, param1, param2, param3) {
  this.offset = param0;
  this.input = param1;
  this.end_offset = param2;
  this.remaining_available_depth = param3;
}
function $f64_convert_i64(a) {
  return Number(BigInt.asIntN(64, a));
}
function _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGiRPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGiRPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGsRPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGsRPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok.prototype.$tag = 1;
function _M0DTPC14json5Token4Null() {}
_M0DTPC14json5Token4Null.prototype.$tag = 0;
const _M0DTPC14json5Token4Null__ = new _M0DTPC14json5Token4Null();
function _M0DTPC14json5Token4True() {}
_M0DTPC14json5Token4True.prototype.$tag = 1;
const _M0DTPC14json5Token4True__ = new _M0DTPC14json5Token4True();
function _M0DTPC14json5Token5False() {}
_M0DTPC14json5Token5False.prototype.$tag = 2;
const _M0DTPC14json5Token5False__ = new _M0DTPC14json5Token5False();
function _M0DTPC14json5Token6Number(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPC14json5Token6Number.prototype.$tag = 3;
function _M0DTPC14json5Token6String(param0) {
  this._0 = param0;
}
_M0DTPC14json5Token6String.prototype.$tag = 4;
function _M0DTPC14json5Token6LBrace() {}
_M0DTPC14json5Token6LBrace.prototype.$tag = 5;
const _M0DTPC14json5Token6LBrace__ = new _M0DTPC14json5Token6LBrace();
function _M0DTPC14json5Token6RBrace() {}
_M0DTPC14json5Token6RBrace.prototype.$tag = 6;
const _M0DTPC14json5Token6RBrace__ = new _M0DTPC14json5Token6RBrace();
function _M0DTPC14json5Token8LBracket() {}
_M0DTPC14json5Token8LBracket.prototype.$tag = 7;
const _M0DTPC14json5Token8LBracket__ = new _M0DTPC14json5Token8LBracket();
function _M0DTPC14json5Token8RBracket() {}
_M0DTPC14json5Token8RBracket.prototype.$tag = 8;
const _M0DTPC14json5Token8RBracket__ = new _M0DTPC14json5Token8RBracket();
function _M0DTPC14json5Token5Comma() {}
_M0DTPC14json5Token5Comma.prototype.$tag = 9;
const _M0DTPC14json5Token5Comma__ = new _M0DTPC14json5Token5Comma();
function _M0DTPC14json10WriteFrame5Array(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPC14json10WriteFrame5Array.prototype.$tag = 0;
function _M0DTPC14json10WriteFrame6Object(param0, param1) {
  this._0 = param0;
  this._1 = param1;
}
_M0DTPC14json10WriteFrame6Object.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB5ArrayGcERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGcERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGcERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGcERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGdRP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGdRP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0TPB9ArrayViewGUsRPB4JsonEE(param0, param1, param2) {
  this.buf = param0;
  this.start = param1;
  this.end = param2;
}
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGUssRPB5ArrayGcEERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUssRPB5ArrayGcEERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGUssRPB5ArrayGcEERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUssRPB5ArrayGcEERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGURPB3MapGsRPB5ArrayGcEERPB3MapGssEERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGURPB3MapGsRPB5ArrayGcEERPB3MapGssEERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGURPB3MapGsRPB5ArrayGcEERPB3MapGssEERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGURPB3MapGsRPB5ArrayGcEERPB3MapGssEERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB5ArrayGsERP38portable8research13researchcheck7InvalidE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGsERP38portable8research13researchcheck7InvalidE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGsERP38portable8research13researchcheck7InvalidE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGsERP38portable8research13researchcheck7InvalidE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGUsRPB3MapGssEERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUsRPB3MapGssEERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGUsRPB3MapGssEERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGUsRPB3MapGssEERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB5ArrayGUssEERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGUssEERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGUssEERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGUssEERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGURPB3MapGsRPB4JsonEsRPB5ArrayGRPB4JsonEERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGURPB3MapGsRPB4JsonEsRPB5ArrayGRPB4JsonEERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGURPB3MapGsRPB4JsonEsRPB5ArrayGRPB4JsonEERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGURPB3MapGsRPB4JsonEsRPB5ArrayGRPB4JsonEERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB4JsonsE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonsE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB4JsonsE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB4JsonsE2Ok.prototype.$tag = 1;
const _M0FP092moonbitlang_2fcore_2fbuiltin_2fStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger = { method_0: _M0IPB13StringBuilderPB6Logger13write__string, method_1: _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE, method_2: _M0IPB13StringBuilderPB6Logger11write__view, method_3: _M0IPB13StringBuilderPB6Logger11write__char };
const _M0FPB4null = _M0DTPB4Json4Null__;
const _M0FPB18double__max__value = $i64_reinterpret_f64(9218868437227405311n);
const _M0FPB18double__min__value = $i64_reinterpret_f64(18442240474082181119n);
const _M0FPC16double14not__a__number = $i64_reinterpret_f64(9221120237041090561n);
const _M0FPC16double8infinity = $i64_reinterpret_f64(9218868437227405312n);
const _M0FPC16double13neg__infinity = $i64_reinterpret_f64(18442240474082181120n);
const _M0FPC28internal7strconv14base__err__str = "invalid base";
const _M0FPC28internal7strconv15range__err__str = "value out of range";
const _M0FPC28internal7strconv16syntax__err__str = "invalid syntax";
const _M0FPC28internal7strconv17min__19digit__int = 1000000000000000000n;
const _M0FPC28internal7strconv17parse__scientificN8exp__numS240 = 0n;
const _M0FPC28internal7strconv13parse__numberN11exp__numberS221 = 0n;
const _M0FPC28internal7strconv20parse__int64_2einnerN7_2abindS645 = "";
const _M0FPC28internal7strconv12double__info = new _M0TPC28internal7strconv9FloatInfo(52, 11, -1023);
const _M0FPC28internal7strconv25min__exponent__fast__path = 18446744073709551594n;
const _M0FPC28internal7strconv25max__exponent__fast__path = 22n;
const _M0FPC28internal7strconv36max__exponent__disguised__fast__path = 37n;
const _M0FPC28internal7strconv25max__mantissa__fast__path = 9007199254740992n;
const _M0FPC28internal7strconv6powtab = [1, 3, 6, 9, 13, 16, 19, 23, 26, 29, 33, 36, 39, 43, 46, 49, 53, 56, 59];
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS962 = { _0: 0, _1: "" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS963 = { _0: 1, _1: "5" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS964 = { _0: 1, _1: "25" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS965 = { _0: 1, _1: "125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS966 = { _0: 2, _1: "625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS967 = { _0: 2, _1: "3125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS968 = { _0: 2, _1: "15625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS969 = { _0: 3, _1: "78125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS970 = { _0: 3, _1: "390625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS971 = { _0: 3, _1: "1953125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS972 = { _0: 4, _1: "9765625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS973 = { _0: 4, _1: "48828125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS974 = { _0: 4, _1: "244140625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS975 = { _0: 4, _1: "1220703125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS976 = { _0: 5, _1: "6103515625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS977 = { _0: 5, _1: "30517578125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS978 = { _0: 5, _1: "152587890625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS979 = { _0: 6, _1: "762939453125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS980 = { _0: 6, _1: "3814697265625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS981 = { _0: 6, _1: "19073486328125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS982 = { _0: 7, _1: "95367431640625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS983 = { _0: 7, _1: "476837158203125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS984 = { _0: 7, _1: "2384185791015625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS985 = { _0: 7, _1: "11920928955078125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS986 = { _0: 8, _1: "59604644775390625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS987 = { _0: 8, _1: "298023223876953125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS988 = { _0: 8, _1: "1490116119384765625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS989 = { _0: 9, _1: "7450580596923828125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS990 = { _0: 9, _1: "37252902984619140625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS991 = { _0: 9, _1: "186264514923095703125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS992 = { _0: 10, _1: "931322574615478515625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS993 = { _0: 10, _1: "4656612873077392578125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS994 = { _0: 10, _1: "23283064365386962890625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS995 = { _0: 10, _1: "116415321826934814453125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS996 = { _0: 11, _1: "582076609134674072265625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS997 = { _0: 11, _1: "2910383045673370361328125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS998 = { _0: 11, _1: "14551915228366851806640625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS999 = { _0: 12, _1: "72759576141834259033203125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1000 = { _0: 12, _1: "363797880709171295166015625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1001 = { _0: 12, _1: "1818989403545856475830078125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1002 = { _0: 13, _1: "9094947017729282379150390625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1003 = { _0: 13, _1: "45474735088646411895751953125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1004 = { _0: 13, _1: "227373675443232059478759765625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1005 = { _0: 13, _1: "1136868377216160297393798828125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1006 = { _0: 14, _1: "5684341886080801486968994140625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1007 = { _0: 14, _1: "28421709430404007434844970703125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1008 = { _0: 14, _1: "142108547152020037174224853515625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1009 = { _0: 15, _1: "710542735760100185871124267578125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1010 = { _0: 15, _1: "3552713678800500929355621337890625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1011 = { _0: 15, _1: "17763568394002504646778106689453125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1012 = { _0: 16, _1: "88817841970012523233890533447265625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1013 = { _0: 16, _1: "444089209850062616169452667236328125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1014 = { _0: 16, _1: "2220446049250313080847263336181640625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1015 = { _0: 16, _1: "11102230246251565404236316680908203125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1016 = { _0: 17, _1: "55511151231257827021181583404541015625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1017 = { _0: 17, _1: "277555756156289135105907917022705078125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1018 = { _0: 17, _1: "1387778780781445675529539585113525390625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1019 = { _0: 18, _1: "6938893903907228377647697925567626953125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1020 = { _0: 18, _1: "34694469519536141888238489627838134765625" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1021 = { _0: 18, _1: "173472347597680709441192448139190673828125" };
const _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1022 = { _0: 19, _1: "867361737988403547205962240695953369140625" };
const _M0FPC28internal7strconv19left__shift__cheats = [_M0FPC28internal7strconv19left__shift__cheatsN5tupleS962, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS963, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS964, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS965, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS966, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS967, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS968, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS969, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS970, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS971, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS972, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS973, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS974, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS975, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS976, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS977, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS978, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS979, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS980, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS981, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS982, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS983, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS984, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS985, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS986, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS987, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS988, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS989, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS990, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS991, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS992, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS993, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS994, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS995, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS996, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS997, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS998, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS999, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1000, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1001, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1002, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1003, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1004, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1005, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1006, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1007, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1008, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1009, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1010, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1011, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1012, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1013, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1014, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1015, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1016, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1017, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1018, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1019, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1020, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1021, _M0FPC28internal7strconv19left__shift__cheatsN5tupleS1022];
const _M0FPC28internal7strconv10int__pow10 = [1n, 10n, 100n, 1000n, 10000n, 100000n, 1000000n, 10000000n, 100000000n, 1000000000n, 10000000000n, 100000000000n, 1000000000000n, 10000000000000n, 100000000000000n, 1000000000000000n];
const _M0FPC28internal7strconv5table = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000, 1e+12, 1e+13, 1e+14, 1e+15, 1e+16, 1e+17, 1e+18, 1e+19, 1e+20, 1e+21, 1e+22, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const _M0FPC28internal7strconv12checked__mulN6constrS1107 = 0n;
const _M0MPC14json12ParseContext16lex__number__endN7_2abindS1089 = ".";
const _M0MPC14json12ParseContext16lex__number__endN7_2abindS1090 = "e";
const _M0MPC14json12ParseContext16lex__number__endN7_2abindS1091 = "E";
const _M0FPB4seed = _M0FPB12random__seed();
const _M0FPB18brute__force__findN6constrS8462 = 0;
const _M0FPB28boyer__moore__horspool__findN6constrS8461 = 0;
function _M0FPC15abort5abortGRPB4JsonE(msg) {
  return $panic();
}
function _M0FPC15abort5abortGuE(msg) {
  $panic();
}
function _M0FPC15abort5abortGOiE(msg) {
  return $panic();
}
function _M0MPB6Hasher8consume4(self, input) {
  const _p = (self.acc >>> 0) + ((Math.imul(input, -1028477379) | 0) >>> 0) | 0;
  const _p$2 = 17;
  self.acc = Math.imul(_p << _p$2 | (_p >>> (32 - _p$2 | 0) | 0), 668265263) | 0;
}
function _M0MPB6Hasher13combine__uint(self, value) {
  self.acc = (self.acc >>> 0) + (4 >>> 0) | 0;
  _M0MPB6Hasher8consume4(self, value);
}
function _M0MPB13StringBuilder11new_2einner(size_hint) {
  return new _M0TPB13StringBuilder("");
}
function _M0IPB13StringBuilderPB6Logger11write__char(self, ch) {
  self.val = `${self.val}${String.fromCodePoint(ch)}`;
}
function _M0MPC16uint166UInt1622is__leading__surrogate(self) {
  return _M0IP016_24default__implPB7Compare6op__geGkE(self, 55296) && _M0IP016_24default__implPB7Compare6op__leGkE(self, 56319);
}
function _M0MPC16uint166UInt1623is__trailing__surrogate(self) {
  return _M0IP016_24default__implPB7Compare6op__geGkE(self, 56320) && _M0IP016_24default__implPB7Compare6op__leGkE(self, 57343);
}
function _M0FPB32code__point__of__surrogate__pair(leading, trailing) {
  return (((Math.imul(leading - 55296 | 0, 1024) | 0) + trailing | 0) - 56320 | 0) + 65536 | 0;
}
function _M0MPC16string6String16unsafe__char__at(self, index) {
  const c1 = self.charCodeAt(index);
  if (_M0MPC16uint166UInt1622is__leading__surrogate(c1)) {
    const c2 = self.charCodeAt(index + 1 | 0);
    return _M0FPB32code__point__of__surrogate__pair(c1, c2);
  } else {
    return c1;
  }
}
function _M0MPC14byte4Byte7to__hexN14to__hex__digitS3433(i) {
  if (i < 10) {
    const _p = 48;
    const _p$2 = (i + _p | 0) & 255;
    return _p$2;
  } else {
    const _p = 97;
    const _p$2 = (i + _p | 0) & 255;
    const _p$3 = 10;
    const _p$4 = (_p$2 - _p$3 | 0) & 255;
    return _p$4;
  }
}
function _M0MPC14byte4Byte7to__hex(b) {
  const _self = _M0MPB13StringBuilder11new_2einner(0);
  const _p = 16;
  _M0IPB13StringBuilderPB6Logger11write__char(_self, _M0MPC14byte4Byte7to__hexN14to__hex__digitS3433((b / _p | 0) & 255));
  const _p$2 = 16;
  _M0IPB13StringBuilderPB6Logger11write__char(_self, _M0MPC14byte4Byte7to__hexN14to__hex__digitS3433((b % _p$2 | 0) & 255));
  const _p$3 = _self;
  return _p$3.val;
}
function _M0MPC16string10StringView11sub_2einner(self, start, end) {
  const str_len = self.str.length;
  let abs_end;
  if (end === undefined) {
    abs_end = self.end;
  } else {
    const _Some = end;
    const _end = _Some;
    abs_end = _end < 0 ? self.end + _end | 0 : self.start + _end | 0;
  }
  const abs_start = start < 0 ? self.end + start | 0 : self.start + start | 0;
  if (abs_start >= self.start && (abs_start <= abs_end && abs_end <= self.end)) {
    if (abs_start < str_len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.str.charCodeAt(abs_start))) {
      } else {
        $panic();
      }
    }
    if (abs_end < str_len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.str.charCodeAt(abs_end))) {
      } else {
        $panic();
      }
    }
    return new _M0TPC16string10StringView(self.str, abs_start, abs_end);
  } else {
    return $panic();
  }
}
function _M0MPB13StringBuilder13write__objectGdE(self, obj) {
  _M0IPC16double6DoublePB4Show6output(obj, { self: self, method_table: _M0FP092moonbitlang_2fcore_2fbuiltin_2fStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger });
}
function _M0IPB13StringBuilderPB6Logger13write__string(self, str) {
  self.val = `${self.val}${str}`;
}
function _M0MPB6Hasher7combineGsE(self, value) {
  _M0IPC16string6StringPB4Hash13hash__combine(value, self);
}
function _M0IP016_24default__implPB2Eq10not__equalGRPC16string10StringViewE(x, y) {
  return !_M0IPC16string10StringViewPB2Eq5equal(x, y);
}
function _M0IP016_24default__implPB7Compare6op__leGkE(x, y) {
  return $compare_int(x, y) <= 0;
}
function _M0IP016_24default__implPB7Compare6op__geGkE(x, y) {
  return $compare_int(x, y) >= 0;
}
function _M0MPB6Hasher9avalanche(self) {
  let acc = self.acc;
  acc = acc ^ (acc >>> 15 | 0);
  acc = Math.imul(acc, -2048144777) | 0;
  acc = acc ^ (acc >>> 13 | 0);
  acc = Math.imul(acc, -1028477379) | 0;
  acc = acc ^ (acc >>> 16 | 0);
  return acc;
}
function _M0MPB6Hasher8finalize(self) {
  return _M0MPB6Hasher9avalanche(self);
}
function _M0MPB6Hasher11new_2einner(seed) {
  return new _M0TPB6Hasher((seed >>> 0) + (374761393 >>> 0) | 0);
}
function _M0MPB6Hasher3new(seed$46$opt) {
  let seed;
  if (seed$46$opt === undefined) {
    seed = _M0FPB4seed;
  } else {
    const _Some = seed$46$opt;
    seed = _Some;
  }
  return _M0MPB6Hasher11new_2einner(seed);
}
function _M0IP016_24default__implPB4Hash4hashGsE(self) {
  const h = _M0MPB6Hasher3new(undefined);
  _M0MPB6Hasher7combineGsE(h, self);
  return _M0MPB6Hasher8finalize(h);
}
function _M0MPC16string6String11sub_2einner(self, start, end) {
  const len = self.length;
  let end$2;
  if (end === undefined) {
    end$2 = len;
  } else {
    const _Some = end;
    const _end = _Some;
    end$2 = _end < 0 ? len + _end | 0 : _end;
  }
  const start$2 = start < 0 ? len + start | 0 : start;
  if (start$2 >= 0 && (start$2 <= end$2 && end$2 <= len)) {
    if (start$2 < len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.charCodeAt(start$2))) {
      } else {
        $panic();
      }
    }
    if (end$2 < len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.charCodeAt(end$2))) {
      } else {
        $panic();
      }
    }
    return new _M0TPC16string10StringView(self, start$2, end$2);
  } else {
    return $panic();
  }
}
function _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE(self, value, start, len) {
  _M0IPB13StringBuilderPB6Logger11write__view(self, _M0MPC16string6String11sub_2einner(value, start, start + len | 0));
}
function _M0MPB4Iter4nextGUsRPB4JsonEE(self) {
  const _func = self;
  return _func();
}
function _M0MPB4Iter4nextGcE(self) {
  const _func = self;
  return _func();
}
function _M0MPC16string10StringView12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.end - self.start | 0;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= (self.end - self.start | 0)) ? new _M0TPC16string10StringView(self.str, self.start + start_offset | 0, self.start + end_offset$2 | 0) : _M0FPC15abort5abortGRPB4JsonE("Invalid index for View");
}
function _M0MPC16string10StringView9to__owned(self) {
  return self.str.substring(self.start, self.end);
}
function _M0IPC16string10StringViewPB2Eq5equal(self, other) {
  const len = self.end - self.start | 0;
  if (len === (other.end - other.start | 0)) {
    if (self.str === other.str && self.start === other.start) {
      return true;
    }
    let _tmp = 0;
    while (true) {
      const i = _tmp;
      if (i < len) {
        const _p = self.str.charCodeAt(self.start + i | 0);
        const _p$2 = other.str.charCodeAt(other.start + i | 0);
        if (_p === _p$2) {
        } else {
          return false;
        }
        _tmp = i + 1 | 0;
        continue;
      } else {
        break;
      }
    }
    return true;
  } else {
    return false;
  }
}
function _M0MPC16string6String12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= self.length) ? new _M0TPC16string10StringView(self, start_offset, end_offset$2) : _M0FPC15abort5abortGRPB4JsonE("Invalid index for View");
}
function _M0MPC16string6String4view(self, start_offset$46$opt, end_offset) {
  let start_offset;
  if (start_offset$46$opt === undefined) {
    start_offset = 0;
  } else {
    const _Some = start_offset$46$opt;
    start_offset = _Some;
  }
  return _M0MPC16string6String12view_2einner(self, start_offset, end_offset);
}
function _M0MPC16string6String24char__length__eq_2einner(self, len, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  let _tmp = start_offset;
  let _tmp$2 = 0;
  while (true) {
    const index = _tmp;
    const count = _tmp$2;
    if (index < end_offset$2 && count < len) {
      const c1 = self.charCodeAt(index);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index + 1 | 0) < end_offset$2) {
        const c2 = self.charCodeAt(index + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          _tmp = index + 2 | 0;
          _tmp$2 = count + 1 | 0;
          continue;
        } else {
          _M0FPC15abort5abortGuE("invalid surrogate pair");
        }
      }
      _tmp = index + 1 | 0;
      _tmp$2 = count + 1 | 0;
      continue;
    } else {
      return count === len && index === end_offset$2;
    }
  }
}
function _M0MPC16string6String24char__length__ge_2einner(self, len, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  let _tmp = start_offset;
  let _tmp$2 = 0;
  while (true) {
    const index = _tmp;
    const count = _tmp$2;
    if (index < end_offset$2 && count < len) {
      const c1 = self.charCodeAt(index);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index + 1 | 0) < end_offset$2) {
        const c2 = self.charCodeAt(index + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          _tmp = index + 2 | 0;
          _tmp$2 = count + 1 | 0;
          continue;
        } else {
          _M0FPC15abort5abortGuE("invalid surrogate pair");
        }
      }
      _tmp = index + 1 | 0;
      _tmp$2 = count + 1 | 0;
      continue;
    } else {
      return count >= len;
    }
  }
}
function _M0MPC16string6String31offset__of__nth__char__backward(self, n, start_offset, end_offset) {
  let _tmp = end_offset;
  let _tmp$2 = 0;
  while (true) {
    const utf16_offset = _tmp;
    const char_count = _tmp$2;
    if ((utf16_offset - 1 | 0) >= start_offset && char_count < n) {
      const c = self.charCodeAt(utf16_offset - 1 | 0);
      if (_M0MPC16uint166UInt1623is__trailing__surrogate(c)) {
        _tmp = utf16_offset - 2 | 0;
        _tmp$2 = char_count + 1 | 0;
        continue;
      } else {
        _tmp = utf16_offset - 1 | 0;
        _tmp$2 = char_count + 1 | 0;
        continue;
      }
    } else {
      return char_count < n || utf16_offset < start_offset ? undefined : utf16_offset;
    }
  }
}
function _M0MPC16string6String30offset__of__nth__char__forward(self, n, start_offset, end_offset) {
  if (start_offset >= 0 && start_offset <= end_offset) {
    let _tmp = start_offset;
    let _tmp$2 = 0;
    while (true) {
      const utf16_offset = _tmp;
      const char_count = _tmp$2;
      if (utf16_offset < end_offset && char_count < n) {
        const c = self.charCodeAt(utf16_offset);
        if (_M0MPC16uint166UInt1622is__leading__surrogate(c)) {
          _tmp = utf16_offset + 2 | 0;
          _tmp$2 = char_count + 1 | 0;
          continue;
        } else {
          _tmp = utf16_offset + 1 | 0;
          _tmp$2 = char_count + 1 | 0;
          continue;
        }
      } else {
        return char_count < n || utf16_offset >= end_offset ? undefined : utf16_offset;
      }
    }
  } else {
    return _M0FPC15abort5abortGOiE("Invalid start index");
  }
}
function _M0MPC16string6String29offset__of__nth__char_2einner(self, i, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return i >= 0 ? _M0MPC16string6String30offset__of__nth__char__forward(self, i, start_offset, end_offset$2) : _M0MPC16string6String31offset__of__nth__char__backward(self, -i | 0, start_offset, end_offset$2);
}
function _M0IPB13StringBuilderPB6Logger11write__view(self, str) {
  self.val = `${self.val}${_M0MPC16string10StringView9to__owned(str)}`;
}
function _M0FPB28boyer__moore__horspool__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const skip_table = $make_array_len_and_init(256, needle_len);
      const _bind = needle_len - 1 | 0;
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i < _bind) {
          const _tmp$2 = needle.str.charCodeAt(needle.start + i | 0) & 255;
          $bound_check(skip_table, _tmp$2);
          skip_table[_tmp$2] = (needle_len - 1 | 0) - i | 0;
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      let _tmp$2 = 0;
      while (true) {
        const i = _tmp$2;
        if (i <= (haystack_len - needle_len | 0)) {
          const _bind$2 = needle_len - 1 | 0;
          let _tmp$3 = 0;
          while (true) {
            const j = _tmp$3;
            if (j <= _bind$2) {
              const _p = i + j | 0;
              const _p$2 = haystack.str.charCodeAt(haystack.start + _p | 0);
              const _p$3 = needle.str.charCodeAt(needle.start + j | 0);
              if (_p$2 !== _p$3) {
                break;
              }
              _tmp$3 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          const _p = (i + needle_len | 0) - 1 | 0;
          const _tmp$4 = haystack.str.charCodeAt(haystack.start + _p | 0) & 255;
          $bound_check(skip_table, _tmp$4);
          _tmp$2 = i + skip_table[_tmp$4] | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FPB28boyer__moore__horspool__findN6constrS8461;
  }
}
function _M0FPB18brute__force__find(haystack, needle) {
  const haystack_len = haystack.end - haystack.start | 0;
  const needle_len = needle.end - needle.start | 0;
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const _p = 0;
      const needle_first = needle.str.charCodeAt(needle.start + _p | 0);
      const forward_len = haystack_len - needle_len | 0;
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i <= forward_len) {
          const _p$2 = haystack.str.charCodeAt(haystack.start + i | 0);
          if (_p$2 !== needle_first) {
            _tmp = i + 1 | 0;
            continue;
          }
          let _tmp$2 = 1;
          while (true) {
            const j = _tmp$2;
            if (j < needle_len) {
              const _p$3 = i + j | 0;
              const _p$4 = haystack.str.charCodeAt(haystack.start + _p$3 | 0);
              const _p$5 = needle.str.charCodeAt(needle.start + j | 0);
              if (_p$4 !== _p$5) {
                break;
              }
              _tmp$2 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FPB18brute__force__findN6constrS8462;
  }
}
function _M0MPC16string10StringView4find(self, str) {
  return (str.end - str.start | 0) <= 4 ? _M0FPB18brute__force__find(self, str) : _M0FPB28boyer__moore__horspool__find(self, str);
}
function _M0MPC16string6String6repeat(self, n) {
  if (n <= 0) {
    return "";
  } else {
    if (n === 1) {
      return self;
    } else {
      const len = self.length;
      const buf = _M0MPB13StringBuilder11new_2einner(Math.imul(len, n) | 0);
      const str = self;
      let _tmp = 0;
      while (true) {
        const _ = _tmp;
        if (_ < n) {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, str);
          _tmp = _ + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      return buf.val;
    }
  }
}
function _M0MPC15array5Array11new_2einnerGcE(capacity) {
  return [];
}
function _M0MPC15array5Array4pushGsE(self, value) {
  _M0MPB7JSArray4push(self, value);
}
function _M0MPC15array5Array4pushGcE(self, value) {
  _M0MPB7JSArray4push(self, value);
}
function _M0MPC15array5Array4pushGiE(self, value) {
  _M0MPB7JSArray4push(self, value);
}
function _M0MPC16string10StringView8contains(self, str) {
  const _bind = _M0MPC16string10StringView4find(self, str);
  return !(_bind === undefined);
}
function _M0MPC16string10StringView9is__empty(self) {
  return (self.end - self.start | 0) === 0;
}
function _M0MPC16string6String4iter(self) {
  const len = self.length;
  const index = new _M0TPB8MutLocalGiE(0);
  const _p = () => {
    if (index.val < len) {
      const c1 = self.charCodeAt(index.val);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < len) {
        const c2 = self.charCodeAt(index.val + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          const c = _M0FPB32code__point__of__surrogate__pair(c1, c2);
          index.val = index.val + 2 | 0;
          return c;
        }
      }
      index.val = index.val + 1 | 0;
      return c1;
    } else {
      return -1;
    }
  };
  return _p;
}
function _M0MPC16string10StringView9get__char(self, idx) {
  if (idx >= 0 && idx < (self.end - self.start | 0)) {
    const c = self.str.charCodeAt(self.start + idx | 0);
    if (_M0MPC16uint166UInt1622is__leading__surrogate(c)) {
      if ((idx + 1 | 0) < (self.end - self.start | 0)) {
        const _p = idx + 1 | 0;
        const next = self.str.charCodeAt(self.start + _p | 0);
        return _M0MPC16uint166UInt1623is__trailing__surrogate(next) ? _M0FPB32code__point__of__surrogate__pair(c, next) : -1;
      } else {
        return -1;
      }
    } else {
      return _M0MPC16uint166UInt1623is__trailing__surrogate(c) ? -1 : c;
    }
  } else {
    return -1;
  }
}
function _M0MPC16string6String9to__array(self) {
  const _p = _M0MPC16string6String4iter(self);
  const _p$2 = _M0MPC15array5Array11new_2einnerGcE(self.length);
  let _p$3 = _p$2;
  while (true) {
    const _p$4 = _M0MPB4Iter4nextGcE(_p);
    if (_p$4 === -1) {
      break;
    } else {
      const _p$5 = _p$4;
      const _p$6 = _p$5;
      const _p$7 = _p$3;
      _M0MPC15array5Array4pushGcE(_p$7, _p$6);
      _p$3 = _p$7;
      continue;
    }
  }
  return _p$3;
}
function _M0MPC16option6Option3mapGRPC16string10StringViewsE(self, f) {
  if (self === undefined) {
    return undefined;
  } else {
    const _Some = self;
    const _t = _Some;
    return f(_t);
  }
}
function _M0MPC13int3Int20next__power__of__two(self) {
  if (self >= 0) {
    if (self <= 1) {
      return 1;
    }
    if (self > 1073741824) {
      return 1073741824;
    }
    return (2147483647 >> (Math.clz32(self - 1 | 0) - 1 | 0)) + 1 | 0;
  } else {
    return $panic();
  }
}
function _M0MPB3Map11new_2einnerGsRPB4JsonE(capacity) {
  const capacity$2 = _M0MPC13int3Int20next__power__of__two(capacity);
  const _bind = capacity$2 - 1 | 0;
  const _bind$2 = (Math.imul(capacity$2, 13) | 0) / 16 | 0;
  const _bind$3 = $make_array_len_and_init(capacity$2, undefined);
  const _bind$4 = undefined;
  return new _M0TPB3MapGsRPB4JsonE(_bind$3, 0, capacity$2, _bind, _bind$2, _bind$4, -1);
}
function _M0MPB3Map11new_2einnerGsbE(capacity) {
  const capacity$2 = _M0MPC13int3Int20next__power__of__two(capacity);
  const _bind = capacity$2 - 1 | 0;
  const _bind$2 = (Math.imul(capacity$2, 13) | 0) / 16 | 0;
  const _bind$3 = $make_array_len_and_init(capacity$2, undefined);
  const _bind$4 = undefined;
  return new _M0TPB3MapGsbE(_bind$3, 0, capacity$2, _bind, _bind$2, _bind$4, -1);
}
function _M0MPB3Map11new_2einnerGsiE(capacity) {
  const capacity$2 = _M0MPC13int3Int20next__power__of__two(capacity);
  const _bind = capacity$2 - 1 | 0;
  const _bind$2 = (Math.imul(capacity$2, 13) | 0) / 16 | 0;
  const _bind$3 = $make_array_len_and_init(capacity$2, undefined);
  const _bind$4 = undefined;
  return new _M0TPB3MapGsiE(_bind$3, 0, capacity$2, _bind, _bind$2, _bind$4, -1);
}
function _M0MPB3Map11new_2einnerGsRPB5ArrayGcEE(capacity) {
  const capacity$2 = _M0MPC13int3Int20next__power__of__two(capacity);
  const _bind = capacity$2 - 1 | 0;
  const _bind$2 = (Math.imul(capacity$2, 13) | 0) / 16 | 0;
  const _bind$3 = $make_array_len_and_init(capacity$2, undefined);
  const _bind$4 = undefined;
  return new _M0TPB3MapGsRPB5ArrayGcEE(_bind$3, 0, capacity$2, _bind, _bind$2, _bind$4, -1);
}
function _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry) {
  const _bind = self.tail;
  if (_bind === -1) {
    self.head = entry;
  } else {
    const _tmp = self.entries;
    $bound_check(_tmp, _bind);
    const _p = _tmp[_bind];
    let _tmp$2;
    if (_p === undefined) {
      _tmp$2 = $panic();
    } else {
      const _p$2 = _p;
      _tmp$2 = _p$2;
    }
    _tmp$2.next = entry;
  }
  self.tail = idx;
  const _tmp = self.entries;
  $bound_check(_tmp, idx);
  _tmp[idx] = entry;
  self.size = self.size + 1 | 0;
}
function _M0MPB3Map20add__entry__to__tailGsbE(self, idx, entry) {
  const _bind = self.tail;
  if (_bind === -1) {
    self.head = entry;
  } else {
    const _tmp = self.entries;
    $bound_check(_tmp, _bind);
    const _p = _tmp[_bind];
    let _tmp$2;
    if (_p === undefined) {
      _tmp$2 = $panic();
    } else {
      const _p$2 = _p;
      _tmp$2 = _p$2;
    }
    _tmp$2.next = entry;
  }
  self.tail = idx;
  const _tmp = self.entries;
  $bound_check(_tmp, idx);
  _tmp[idx] = entry;
  self.size = self.size + 1 | 0;
}
function _M0MPB3Map20add__entry__to__tailGsiE(self, idx, entry) {
  const _bind = self.tail;
  if (_bind === -1) {
    self.head = entry;
  } else {
    const _tmp = self.entries;
    $bound_check(_tmp, _bind);
    const _p = _tmp[_bind];
    let _tmp$2;
    if (_p === undefined) {
      _tmp$2 = $panic();
    } else {
      const _p$2 = _p;
      _tmp$2 = _p$2;
    }
    _tmp$2.next = entry;
  }
  self.tail = idx;
  const _tmp = self.entries;
  $bound_check(_tmp, idx);
  _tmp[idx] = entry;
  self.size = self.size + 1 | 0;
}
function _M0MPB3Map20add__entry__to__tailGsRPB5ArrayGcEE(self, idx, entry) {
  const _bind = self.tail;
  if (_bind === -1) {
    self.head = entry;
  } else {
    const _tmp = self.entries;
    $bound_check(_tmp, _bind);
    const _p = _tmp[_bind];
    let _tmp$2;
    if (_p === undefined) {
      _tmp$2 = $panic();
    } else {
      const _p$2 = _p;
      _tmp$2 = _p$2;
    }
    _tmp$2.next = entry;
  }
  self.tail = idx;
  const _tmp = self.entries;
  $bound_check(_tmp, idx);
  _tmp[idx] = entry;
  self.size = self.size + 1 | 0;
}
function _M0MPB3Map10set__entryGsRPB4JsonE(self, entry, new_idx) {
  const _tmp = self.entries;
  $bound_check(_tmp, new_idx);
  _tmp[new_idx] = entry;
  const _bind = entry.next;
  if (_bind === undefined) {
    self.tail = new_idx;
    return;
  } else {
    const _Some = _bind;
    const _next = _Some;
    _next.prev = new_idx;
    return;
  }
}
function _M0MPB3Map10set__entryGsbE(self, entry, new_idx) {
  const _tmp = self.entries;
  $bound_check(_tmp, new_idx);
  _tmp[new_idx] = entry;
  const _bind = entry.next;
  if (_bind === undefined) {
    self.tail = new_idx;
    return;
  } else {
    const _Some = _bind;
    const _next = _Some;
    _next.prev = new_idx;
    return;
  }
}
function _M0MPB3Map10set__entryGsiE(self, entry, new_idx) {
  const _tmp = self.entries;
  $bound_check(_tmp, new_idx);
  _tmp[new_idx] = entry;
  const _bind = entry.next;
  if (_bind === undefined) {
    self.tail = new_idx;
    return;
  } else {
    const _Some = _bind;
    const _next = _Some;
    _next.prev = new_idx;
    return;
  }
}
function _M0MPB3Map10set__entryGsRPB5ArrayGcEE(self, entry, new_idx) {
  const _tmp = self.entries;
  $bound_check(_tmp, new_idx);
  _tmp[new_idx] = entry;
  const _bind = entry.next;
  if (_bind === undefined) {
    self.tail = new_idx;
    return;
  } else {
    const _Some = _bind;
    const _next = _Some;
    _next.prev = new_idx;
    return;
  }
}
function _M0MPB3Map10push__awayGsRPB4JsonE(self, idx, entry) {
  let _tmp = entry.psl + 1 | 0;
  let _tmp$2 = idx + 1 & self.capacity_mask;
  let _tmp$3 = entry;
  while (true) {
    const psl = _tmp;
    const idx$2 = _tmp$2;
    const entry$2 = _tmp$3;
    const _tmp$4 = self.entries;
    $bound_check(_tmp$4, idx$2);
    const _bind = _tmp$4[idx$2];
    if (_bind === undefined) {
      entry$2.psl = psl;
      _M0MPB3Map10set__entryGsRPB4JsonE(self, entry$2, idx$2);
      return;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (psl > _curr_entry.psl) {
        entry$2.psl = psl;
        _M0MPB3Map10set__entryGsRPB4JsonE(self, entry$2, idx$2);
        _tmp = _curr_entry.psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        _tmp$3 = _curr_entry;
        continue;
      } else {
        _tmp = psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        continue;
      }
    }
  }
}
function _M0MPB3Map10push__awayGsbE(self, idx, entry) {
  let _tmp = entry.psl + 1 | 0;
  let _tmp$2 = idx + 1 & self.capacity_mask;
  let _tmp$3 = entry;
  while (true) {
    const psl = _tmp;
    const idx$2 = _tmp$2;
    const entry$2 = _tmp$3;
    const _tmp$4 = self.entries;
    $bound_check(_tmp$4, idx$2);
    const _bind = _tmp$4[idx$2];
    if (_bind === undefined) {
      entry$2.psl = psl;
      _M0MPB3Map10set__entryGsbE(self, entry$2, idx$2);
      return;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (psl > _curr_entry.psl) {
        entry$2.psl = psl;
        _M0MPB3Map10set__entryGsbE(self, entry$2, idx$2);
        _tmp = _curr_entry.psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        _tmp$3 = _curr_entry;
        continue;
      } else {
        _tmp = psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        continue;
      }
    }
  }
}
function _M0MPB3Map10push__awayGsiE(self, idx, entry) {
  let _tmp = entry.psl + 1 | 0;
  let _tmp$2 = idx + 1 & self.capacity_mask;
  let _tmp$3 = entry;
  while (true) {
    const psl = _tmp;
    const idx$2 = _tmp$2;
    const entry$2 = _tmp$3;
    const _tmp$4 = self.entries;
    $bound_check(_tmp$4, idx$2);
    const _bind = _tmp$4[idx$2];
    if (_bind === undefined) {
      entry$2.psl = psl;
      _M0MPB3Map10set__entryGsiE(self, entry$2, idx$2);
      return;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (psl > _curr_entry.psl) {
        entry$2.psl = psl;
        _M0MPB3Map10set__entryGsiE(self, entry$2, idx$2);
        _tmp = _curr_entry.psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        _tmp$3 = _curr_entry;
        continue;
      } else {
        _tmp = psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        continue;
      }
    }
  }
}
function _M0MPB3Map10push__awayGsRPB5ArrayGcEE(self, idx, entry) {
  let _tmp = entry.psl + 1 | 0;
  let _tmp$2 = idx + 1 & self.capacity_mask;
  let _tmp$3 = entry;
  while (true) {
    const psl = _tmp;
    const idx$2 = _tmp$2;
    const entry$2 = _tmp$3;
    const _tmp$4 = self.entries;
    $bound_check(_tmp$4, idx$2);
    const _bind = _tmp$4[idx$2];
    if (_bind === undefined) {
      entry$2.psl = psl;
      _M0MPB3Map10set__entryGsRPB5ArrayGcEE(self, entry$2, idx$2);
      return;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (psl > _curr_entry.psl) {
        entry$2.psl = psl;
        _M0MPB3Map10set__entryGsRPB5ArrayGcEE(self, entry$2, idx$2);
        _tmp = _curr_entry.psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        _tmp$3 = _curr_entry;
        continue;
      } else {
        _tmp = psl + 1 | 0;
        _tmp$2 = idx$2 + 1 & self.capacity_mask;
        continue;
      }
    }
  }
}
function _M0MPB3Map15set__with__hashGsRPB4JsonE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGsRPB4JsonE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGsRPB4JsonE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGsRPB4JsonE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsRPB4JsonE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGsRPB4JsonE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map15set__with__hashGssE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGssE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGssE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGssE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsRPB4JsonE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGssE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map15set__with__hashGsbE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGsbE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGsbE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsbE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGsbE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsbE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGsbE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsbE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map15set__with__hashGsRPB3MapGsRPB4JsonEE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGsRPB3MapGsRPB4JsonEE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGsRPB3MapGsRPB4JsonEE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGsRPB3MapGsRPB4JsonEE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsRPB4JsonE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGsRPB3MapGsRPB4JsonEE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map15set__with__hashGsiE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGsiE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGsiE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsiE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGsiE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsiE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGsiE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsiE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map15set__with__hashGsRPB5ArrayGcEE(self, key, value, hash) {
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const psl = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      if (self.size >= self.grow_at) {
        _M0MPB3Map4growGsRPB5ArrayGcEE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGsRPB5ArrayGcEE(_bind$2, _bind$3, psl, hash, key, value);
      _M0MPB3Map20add__entry__to__tailGsRPB5ArrayGcEE(self, idx, entry);
      return undefined;
    } else {
      const _Some = _bind;
      const _curr_entry = _Some;
      if (_curr_entry.hash === hash && _curr_entry.key === key) {
        _curr_entry.value = value;
        return undefined;
      }
      if (psl > _curr_entry.psl) {
        if (self.size >= self.grow_at) {
          _M0MPB3Map4growGsRPB5ArrayGcEE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsRPB5ArrayGcEE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGsRPB5ArrayGcEE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsRPB5ArrayGcEE(self, idx, entry);
        return undefined;
      }
      _tmp = psl + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map4growGsRPB4JsonE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGsRPB4JsonE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map4growGssE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGssE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map4growGsbE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGsbE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map4growGsRPB3MapGsRPB4JsonEE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGsRPB3MapGsRPB4JsonEE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map4growGsiE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGsiE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map4growGsRPB5ArrayGcEE(self) {
  const old_head = self.head;
  const new_capacity = self.capacity << 1;
  self.entries = $make_array_len_and_init(new_capacity, undefined);
  self.capacity = new_capacity;
  self.capacity_mask = new_capacity - 1 | 0;
  const _p = self.capacity;
  self.grow_at = (Math.imul(_p, 13) | 0) / 16 | 0;
  self.size = 0;
  self.head = undefined;
  self.tail = -1;
  let _tmp = old_head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      return;
    } else {
      const _Some = x;
      const _x = _Some;
      const _next = _x.next;
      const _key = _x.key;
      const _value = _x.value;
      const _hash = _x.hash;
      _M0MPB3Map15set__with__hashGsRPB5ArrayGcEE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map3setGsRPB4JsonE(self, key, value) {
  _M0MPB3Map15set__with__hashGsRPB4JsonE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGssE(self, key, value) {
  _M0MPB3Map15set__with__hashGssE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGsbE(self, key, value) {
  _M0MPB3Map15set__with__hashGsbE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGsRPB3MapGsRPB4JsonEE(self, key, value) {
  _M0MPB3Map15set__with__hashGsRPB3MapGsRPB4JsonEE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGsiE(self, key, value) {
  _M0MPB3Map15set__with__hashGsiE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGsRPB5ArrayGcEE(self, key, value) {
  _M0MPB3Map15set__with__hashGsRPB5ArrayGcEE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map11from__arrayGsRPB4JsonE(arr) {
  const length = arr.end - arr.start | 0;
  let capacity = _M0MPC13int3Int20next__power__of__two(length);
  const _p = capacity;
  if (length > ((Math.imul(_p, 13) | 0) / 16 | 0)) {
    capacity = Math.imul(capacity, 2) | 0;
  }
  const m = _M0MPB3Map11new_2einnerGsRPB4JsonE(capacity);
  const _bind = arr.end - arr.start | 0;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const e = arr.buf[arr.start + _ | 0];
      _M0MPB3Map3setGsRPB4JsonE(m, e._0, e._1);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return m;
}
function _M0MPB3Map3getGsRPB4JsonE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return _entry.value;
      }
      if (i > _entry.psl) {
        return undefined;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map3getGssE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return _entry.value;
      }
      if (i > _entry.psl) {
        return undefined;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map3getGsRPB5ArrayGcEE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return _M0DTPC16option6OptionGRPB5ArrayGcEE4None__;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return new _M0DTPC16option6OptionGRPB5ArrayGcEE4Some(_entry.value);
      }
      if (i > _entry.psl) {
        return _M0DTPC16option6OptionGRPB5ArrayGcEE4None__;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map3getGsRPB3MapGsRPB4JsonEE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return _entry.value;
      }
      if (i > _entry.psl) {
        return undefined;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map3getGsiE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return _entry.value;
      }
      if (i > _entry.psl) {
        return undefined;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map8containsGssE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return false;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return true;
      }
      if (i > _entry.psl) {
        return false;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map8containsGsbE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return false;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return true;
      }
      if (i > _entry.psl) {
        return false;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map8containsGsRPB4JsonE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return false;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return true;
      }
      if (i > _entry.psl) {
        return false;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map8containsGsRPB3MapGsRPB4JsonEE(self, key) {
  const hash = _M0IP016_24default__implPB4Hash4hashGsE(key);
  let _tmp = 0;
  let _tmp$2 = hash & self.capacity_mask;
  while (true) {
    const i = _tmp;
    const idx = _tmp$2;
    const _tmp$3 = self.entries;
    $bound_check(_tmp$3, idx);
    const _bind = _tmp$3[idx];
    if (_bind === undefined) {
      return false;
    } else {
      const _Some = _bind;
      const _entry = _Some;
      if (_entry.hash === hash && _entry.key === key) {
        return true;
      }
      if (i > _entry.psl) {
        return false;
      }
      _tmp = i + 1 | 0;
      _tmp$2 = idx + 1 & self.capacity_mask;
      continue;
    }
  }
}
function _M0MPB3Map4iterGsRPB4JsonE(self) {
  const curr_entry = new _M0TPB8MutLocalGORPB5EntryGsRPB4JsonEE(self.head);
  const _p = () => {
    const _bind = curr_entry.val;
    if (_bind === undefined) {
      return undefined;
    } else {
      const _Some = _bind;
      const _x = _Some;
      const _key = _x.key;
      const _value = _x.value;
      const _next = _x.next;
      curr_entry.val = _next;
      return { _0: _key, _1: _value };
    }
  };
  return _p;
}
function _M0MPB3Map9to__arrayGssE(self) {
  const arr = new Array(self.size);
  let i = 0;
  let _tmp = self.head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      break;
    } else {
      const _Some = x;
      const _x = _Some;
      const _key = _x.key;
      const _value = _x.value;
      const _next = _x.next;
      arr[i] = { _0: _key, _1: _value };
      i = i + 1 | 0;
      _tmp = _next;
      continue;
    }
  }
  return arr;
}
function _M0MPB3Map9to__arrayGsbE(self) {
  const arr = new Array(self.size);
  let i = 0;
  let _tmp = self.head;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      break;
    } else {
      const _Some = x;
      const _x = _Some;
      const _key = _x.key;
      const _value = _x.value;
      const _next = _x.next;
      arr[i] = { _0: _key, _1: _value };
      i = i + 1 | 0;
      _tmp = _next;
      continue;
    }
  }
  return arr;
}
function _M0IPC14bool4BoolPB6ToJson8to__json(self) {
  if (self) {
    const _p = true;
    return _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__;
  } else {
    const _p = false;
    return _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__;
  }
}
function _M0IPC13int3IntPB6ToJson8to__json(self) {
  const _p = self + 0;
  const _p$2 = undefined;
  return new _M0DTPB4Json6Number(_p, _p$2);
}
function _M0IPC15array5ArrayPB6ToJson8to__jsonGRPB4JsonE(self) {
  const _p = new Array(self.length);
  const _p$2 = self.length;
  let _tmp = 0;
  while (true) {
    const _p$3 = _tmp;
    if (_p$3 < _p$2) {
      const _p$4 = self[_p$3];
      _p[_p$3] = _p$4;
      _tmp = _p$3 + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPB4Json5Array(_p);
}
function _M0MPB6Hasher15combine__string(self, value) {
  const _bind = value.length;
  let _tmp = 0;
  while (true) {
    const i = _tmp;
    if (i < _bind) {
      _M0MPB6Hasher13combine__uint(self, value.charCodeAt(i));
      _tmp = i + 1 | 0;
      continue;
    } else {
      return;
    }
  }
}
function _M0IPC16string6StringPB4Hash13hash__combine(self, hasher) {
  _M0MPB6Hasher15combine__string(hasher, self);
}
function _M0MPC16double6Double7to__int(self) {
  return self !== self ? 0 : self >= 2147483647 ? 2147483647 : self <= -2147483648 ? -2147483648 : self | 0;
}
function _M0MPC16double6Double5floor(_tmp) {
  return Math.floor(_tmp);
}
function _M0MPC16double6Double10to__string(self) {
  return _M0FPB15ryu__to__string(self);
}
function _M0IPC16double6DoublePB4Show6output(self, logger) {
  logger.method_table.method_0(logger.self, _M0MPC16double6Double10to__string(self));
}
function _M0MPC15array5Array11unsafe__popGRPC14json10WriteFrameE(self) {
  return _M0MPB7JSArray3pop(self);
}
function _M0MPC15array5Array3popGRPC14json10WriteFrameE(self) {
  if (self.length === 0) {
    return undefined;
  } else {
    const v = _M0MPC15array5Array11unsafe__popGRPC14json10WriteFrameE(self);
    return v;
  }
}
function _M0MPC15array5Array2atGRPB4JsonE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MPC15array5Array2atGcE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MPC15array5Array2atGiE(self, index) {
  const len = self.length;
  if (index >= 0 && index < len) {
    $bound_check(self, index);
    return self[index];
  } else {
    return $panic();
  }
}
function _M0MPC15array5Array8containsGsE(self, value) {
  const _bind = self.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const v = self[_];
      if (v === value) {
        return true;
      }
      _tmp = _ + 1 | 0;
      continue;
    } else {
      return false;
    }
  }
}
function _M0FPC28internal7strconv9base__errGUiRPC16string10StringViewbEE() {
  return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv14base__err__str));
}
function _M0FPC28internal7strconv25check__and__consume__base(view, base) {
  if (base === 0) {
    _L: {
      let rest;
      _L$2: {
        let rest$2;
        _L$3: {
          let rest$3;
          _L$4: {
            if (_M0MPC16string6String24char__length__ge_2einner(view.str, 2, view.start, view.end)) {
              const _x = _M0MPC16string6String16unsafe__char__at(view.str, _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 0, view.start, view.end));
              if (_x === 48) {
                const _x$2 = _M0MPC16string6String16unsafe__char__at(view.str, _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 1, view.start, view.end));
                switch (_x$2) {
                  case 120: {
                    const _tmp = view.str;
                    const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$2;
                    if (_bind === undefined) {
                      _tmp$2 = view.end;
                    } else {
                      const _Some = _bind;
                      _tmp$2 = _Some;
                    }
                    const _x$3 = new _M0TPC16string10StringView(_tmp, _tmp$2, view.end);
                    rest$3 = _x$3;
                    break _L$4;
                  }
                  case 88: {
                    const _tmp$3 = view.str;
                    const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$4;
                    if (_bind$2 === undefined) {
                      _tmp$4 = view.end;
                    } else {
                      const _Some = _bind$2;
                      _tmp$4 = _Some;
                    }
                    const _x$4 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, view.end);
                    rest$3 = _x$4;
                    break _L$4;
                  }
                  case 111: {
                    const _tmp$5 = view.str;
                    const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$6;
                    if (_bind$3 === undefined) {
                      _tmp$6 = view.end;
                    } else {
                      const _Some = _bind$3;
                      _tmp$6 = _Some;
                    }
                    const _x$5 = new _M0TPC16string10StringView(_tmp$5, _tmp$6, view.end);
                    rest$2 = _x$5;
                    break _L$3;
                  }
                  case 79: {
                    const _tmp$7 = view.str;
                    const _bind$4 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$8;
                    if (_bind$4 === undefined) {
                      _tmp$8 = view.end;
                    } else {
                      const _Some = _bind$4;
                      _tmp$8 = _Some;
                    }
                    const _x$6 = new _M0TPC16string10StringView(_tmp$7, _tmp$8, view.end);
                    rest$2 = _x$6;
                    break _L$3;
                  }
                  case 98: {
                    const _tmp$9 = view.str;
                    const _bind$5 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$10;
                    if (_bind$5 === undefined) {
                      _tmp$10 = view.end;
                    } else {
                      const _Some = _bind$5;
                      _tmp$10 = _Some;
                    }
                    const _x$7 = new _M0TPC16string10StringView(_tmp$9, _tmp$10, view.end);
                    rest = _x$7;
                    break _L$2;
                  }
                  case 66: {
                    const _tmp$11 = view.str;
                    const _bind$6 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$12;
                    if (_bind$6 === undefined) {
                      _tmp$12 = view.end;
                    } else {
                      const _Some = _bind$6;
                      _tmp$12 = _Some;
                    }
                    const _x$8 = new _M0TPC16string10StringView(_tmp$11, _tmp$12, view.end);
                    rest = _x$8;
                    break _L$2;
                  }
                  default: {
                    break _L;
                  }
                }
              } else {
                break _L;
              }
            } else {
              break _L;
            }
          }
          return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 16, _1: rest$3, _2: true });
        }
        return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 8, _1: rest$2, _2: true });
      }
      return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 2, _1: rest, _2: true });
    }
    return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 10, _1: view, _2: false });
  } else {
    _L: {
      let rest;
      _L$2: {
        let rest$2;
        _L$3: {
          let rest$3;
          _L$4: {
            if (_M0MPC16string6String24char__length__ge_2einner(view.str, 2, view.start, view.end)) {
              const _x = _M0MPC16string6String16unsafe__char__at(view.str, _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 0, view.start, view.end));
              if (_x === 48) {
                const _x$2 = _M0MPC16string6String16unsafe__char__at(view.str, _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 1, view.start, view.end));
                switch (_x$2) {
                  case 120: {
                    const _tmp = view.str;
                    const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$2;
                    if (_bind === undefined) {
                      _tmp$2 = view.end;
                    } else {
                      const _Some = _bind;
                      _tmp$2 = _Some;
                    }
                    const _x$3 = new _M0TPC16string10StringView(_tmp, _tmp$2, view.end);
                    if (base === 16) {
                      rest$3 = _x$3;
                      break _L$4;
                    } else {
                      break _L;
                    }
                  }
                  case 88: {
                    const _tmp$3 = view.str;
                    const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$4;
                    if (_bind$2 === undefined) {
                      _tmp$4 = view.end;
                    } else {
                      const _Some = _bind$2;
                      _tmp$4 = _Some;
                    }
                    const _x$4 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, view.end);
                    if (base === 16) {
                      rest$3 = _x$4;
                      break _L$4;
                    } else {
                      break _L;
                    }
                  }
                  case 111: {
                    const _tmp$5 = view.str;
                    const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$6;
                    if (_bind$3 === undefined) {
                      _tmp$6 = view.end;
                    } else {
                      const _Some = _bind$3;
                      _tmp$6 = _Some;
                    }
                    const _x$5 = new _M0TPC16string10StringView(_tmp$5, _tmp$6, view.end);
                    if (base === 8) {
                      rest$2 = _x$5;
                      break _L$3;
                    } else {
                      break _L;
                    }
                  }
                  case 79: {
                    const _tmp$7 = view.str;
                    const _bind$4 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$8;
                    if (_bind$4 === undefined) {
                      _tmp$8 = view.end;
                    } else {
                      const _Some = _bind$4;
                      _tmp$8 = _Some;
                    }
                    const _x$6 = new _M0TPC16string10StringView(_tmp$7, _tmp$8, view.end);
                    if (base === 8) {
                      rest$2 = _x$6;
                      break _L$3;
                    } else {
                      break _L;
                    }
                  }
                  case 98: {
                    const _tmp$9 = view.str;
                    const _bind$5 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$10;
                    if (_bind$5 === undefined) {
                      _tmp$10 = view.end;
                    } else {
                      const _Some = _bind$5;
                      _tmp$10 = _Some;
                    }
                    const _x$7 = new _M0TPC16string10StringView(_tmp$9, _tmp$10, view.end);
                    if (base === 2) {
                      rest = _x$7;
                      break _L$2;
                    } else {
                      break _L;
                    }
                  }
                  case 66: {
                    const _tmp$11 = view.str;
                    const _bind$6 = _M0MPC16string6String29offset__of__nth__char_2einner(view.str, 2, view.start, view.end);
                    let _tmp$12;
                    if (_bind$6 === undefined) {
                      _tmp$12 = view.end;
                    } else {
                      const _Some = _bind$6;
                      _tmp$12 = _Some;
                    }
                    const _x$8 = new _M0TPC16string10StringView(_tmp$11, _tmp$12, view.end);
                    if (base === 2) {
                      rest = _x$8;
                      break _L$2;
                    } else {
                      break _L;
                    }
                  }
                  default: {
                    break _L;
                  }
                }
              } else {
                break _L;
              }
            } else {
              break _L;
            }
          }
          return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 16, _1: rest$3, _2: true });
        }
        return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 8, _1: rest$2, _2: true });
      }
      return new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: 2, _1: rest, _2: true });
    }
    return base >= 2 && base <= 36 ? new _M0DTPC16result6ResultGUiRPC16string10StringViewbERPC15error5ErrorE2Ok({ _0: base, _1: view, _2: false }) : _M0FPC28internal7strconv9base__errGUiRPC16string10StringViewbEE();
  }
}
function _M0FPC28internal7strconv10range__errGuE() {
  return new _M0DTPC16result6ResultGuRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv15range__err__str));
}
function _M0FPC28internal7strconv11syntax__errGiE() {
  return new _M0DTPC16result6ResultGiRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv16syntax__err__str));
}
function _M0FPC28internal7strconv11syntax__errGuE() {
  return new _M0DTPC16result6ResultGuRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv16syntax__err__str));
}
function _M0FPC28internal7strconv11syntax__errGlE() {
  return new _M0DTPC16result6ResultGlRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv16syntax__err__str));
}
function _M0FPC28internal7strconv11syntax__errGdE() {
  return new _M0DTPC16result6ResultGdRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv16syntax__err__str));
}
function _M0FPC28internal7strconv11syntax__errGORPC28internal7strconv6NumberE() {
  return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPB7FailureE3Err(new _M0DTPC15error5Error48moonbitlang_2fcore_2fbuiltin_2eFailure_2eFailure(_M0FPC28internal7strconv16syntax__err__str));
}
function _M0EPC16string10StringViewPC28internal7strconv12fold__digitsGmE(self, init, f) {
  let ret = init;
  let len = 0;
  let str = self;
  while (true) {
    const _bind = str;
    if (_M0MPC16string6String24char__length__ge_2einner(_bind.str, 1, _bind.start, _bind.end)) {
      const _ch = _M0MPC16string6String16unsafe__char__at(_bind.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 0, _bind.start, _bind.end));
      const _tmp = _bind.str;
      const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 1, _bind.start, _bind.end);
      let _tmp$2;
      if (_bind$2 === undefined) {
        _tmp$2 = _bind.end;
      } else {
        const _Some = _bind$2;
        _tmp$2 = _Some;
      }
      const _x = new _M0TPC16string10StringView(_tmp, _tmp$2, _bind.end);
      if (_ch >= 48 && _ch <= 57) {
        len = len + 1 | 0;
        ret = f(_ch - 48 | 0, ret);
      } else {
        if (_ch !== 95) {
          break;
        }
      }
      str = _x;
      continue;
    } else {
      break;
    }
  }
  return { _0: str, _1: ret, _2: len };
}
function _M0FPC28internal7strconv13parse__digits(s, x) {
  return _M0EPC16string10StringViewPC28internal7strconv12fold__digitsGmE(s, x, (digit, acc) => BigInt.asUintN(64, BigInt.asUintN(64, acc * 10n) + BigInt.asUintN(64, BigInt(digit >>> 0))));
}
function _M0FPC28internal7strconv20try__parse__19digits(s, x) {
  let x$2 = x;
  let len = 0;
  let _tmp = s;
  while (true) {
    const s$2 = _tmp;
    let s$3;
    _L: {
      if (_M0MPC16string6String24char__length__ge_2einner(s$2.str, 1, s$2.start, s$2.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(s$2.str, _M0MPC16string6String29offset__of__nth__char_2einner(s$2.str, 0, s$2.start, s$2.end));
        if (_x >= 48 && _x <= 57) {
          const _tmp$2 = s$2.str;
          const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(s$2.str, 1, s$2.start, s$2.end);
          let _tmp$3;
          if (_bind === undefined) {
            _tmp$3 = s$2.end;
          } else {
            const _Some = _bind;
            _tmp$3 = _Some;
          }
          const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, s$2.end);
          if (BigInt.asUintN(64, x$2) < BigInt.asUintN(64, _M0FPC28internal7strconv17min__19digit__int)) {
            len = len + 1 | 0;
            x$2 = BigInt.asUintN(64, BigInt.asUintN(64, x$2 * 10n) + BigInt.asUintN(64, BigInt((_x - 48 | 0) >>> 0)));
            _tmp = _x$2;
            continue;
          } else {
            s$3 = s$2;
            break _L;
          }
        } else {
          if (_x === 95) {
            const _tmp$2 = s$2.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(s$2.str, 1, s$2.start, s$2.end);
            let _tmp$3;
            if (_bind === undefined) {
              _tmp$3 = s$2.end;
            } else {
              const _Some = _bind;
              _tmp$3 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, s$2.end);
            _tmp = _x$2;
            continue;
          } else {
            s$3 = s$2;
            break _L;
          }
        }
      } else {
        s$3 = s$2;
        break _L;
      }
    }
    return { _0: s$3, _1: x$2, _2: len };
  }
}
function _M0FPC28internal7strconv17parse__scientific(s) {
  let s$2 = s;
  let neg_exp = false;
  let rest;
  let ch;
  _L: {
    _L$2: {
      const _bind = s$2;
      if (_M0MPC16string6String24char__length__ge_2einner(_bind.str, 1, _bind.start, _bind.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(_bind.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 0, _bind.start, _bind.end));
        switch (_x) {
          case 43: {
            const _tmp = _bind.str;
            const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 1, _bind.start, _bind.end);
            let _tmp$2;
            if (_bind$2 === undefined) {
              _tmp$2 = _bind.end;
            } else {
              const _Some = _bind$2;
              _tmp$2 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, _bind.end);
            rest = _x$2;
            ch = _x;
            break _L$2;
          }
          case 45: {
            const _tmp$3 = _bind.str;
            const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 1, _bind.start, _bind.end);
            let _tmp$4;
            if (_bind$3 === undefined) {
              _tmp$4 = _bind.end;
            } else {
              const _Some = _bind$3;
              _tmp$4 = _Some;
            }
            const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, _bind.end);
            rest = _x$3;
            ch = _x;
            break _L$2;
          }
        }
      }
      break _L;
    }
    neg_exp = ch === 45;
    s$2 = rest;
  }
  _L$2: {
    const _bind = s$2;
    if (_M0MPC16string6String24char__length__ge_2einner(_bind.str, 1, _bind.start, _bind.end)) {
      const _x = _M0MPC16string6String16unsafe__char__at(_bind.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 0, _bind.start, _bind.end));
      if (_x >= 48 && _x <= 57) {
        const _bind$2 = _M0EPC16string10StringViewPC28internal7strconv12fold__digitsGmE(s$2, _M0FPC28internal7strconv17parse__scientificN8exp__numS240, (digit, exp_num) => BigInt.asIntN(64, exp_num) < BigInt.asIntN(64, 65536n) ? BigInt.asUintN(64, BigInt.asUintN(64, 10n * exp_num) + BigInt.asUintN(64, BigInt(digit))) : exp_num);
        const _s = _bind$2._0;
        const _exp_num = _bind$2._1;
        return neg_exp ? { _0: _s, _1: BigInt.asUintN(64, -_exp_num) } : { _0: _s, _1: _exp_num };
      } else {
        break _L$2;
      }
    } else {
      break _L$2;
    }
  }
  return undefined;
}
function _M0FPC28internal7strconv13parse__number(s) {
  let s$2;
  let negative;
  _L: {
    let rest;
    _L$2: {
      if (_M0MPC16string6String24char__length__ge_2einner(s.str, 1, s.start, s.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(s.str, _M0MPC16string6String29offset__of__nth__char_2einner(s.str, 0, s.start, s.end));
        switch (_x) {
          case 45: {
            const _tmp = s.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(s.str, 1, s.start, s.end);
            let _tmp$2;
            if (_bind === undefined) {
              _tmp$2 = s.end;
            } else {
              const _Some = _bind;
              _tmp$2 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, s.end);
            s$2 = _x$2;
            negative = true;
            break _L;
          }
          case 43: {
            const _tmp$3 = s.str;
            const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(s.str, 1, s.start, s.end);
            let _tmp$4;
            if (_bind$2 === undefined) {
              _tmp$4 = s.end;
            } else {
              const _Some = _bind$2;
              _tmp$4 = _Some;
            }
            const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, s.end);
            rest = _x$3;
            break _L$2;
          }
          default: {
            rest = s;
            break _L$2;
          }
        }
      } else {
        rest = s;
        break _L$2;
      }
    }
    s$2 = rest;
    negative = false;
    break _L;
  }
  if (_M0MPC16string10StringView9is__empty(s$2)) {
    return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(undefined);
  }
  const _bind = _M0FPC28internal7strconv13parse__digits(s$2, 0n);
  const _s = _bind._0;
  const _mantissa = _bind._1;
  const _consumed = _bind._2;
  let mantissa = _mantissa;
  let s$3 = _s;
  let n_digits = _consumed;
  let n_after_dot = 0;
  let exponent = 0n;
  const _bind$2 = s$3;
  if (_M0MPC16string6String24char__length__ge_2einner(_bind$2.str, 1, _bind$2.start, _bind$2.end)) {
    const _x = _M0MPC16string6String16unsafe__char__at(_bind$2.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind$2.str, 0, _bind$2.start, _bind$2.end));
    if (_x === 46) {
      const _tmp = _bind$2.str;
      const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind$2.str, 1, _bind$2.start, _bind$2.end);
      let _tmp$2;
      if (_bind$3 === undefined) {
        _tmp$2 = _bind$2.end;
      } else {
        const _Some = _bind$3;
        _tmp$2 = _Some;
      }
      const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, _bind$2.end);
      s$3 = _x$2;
      const _bind$4 = _M0FPC28internal7strconv13parse__digits(s$3, mantissa);
      const _new_s = _bind$4._0;
      const _new_mantissa = _bind$4._1;
      const _consumed_digit = _bind$4._2;
      s$3 = _new_s;
      mantissa = _new_mantissa;
      n_after_dot = _consumed_digit;
      exponent = BigInt.asUintN(64, -BigInt.asUintN(64, BigInt(n_after_dot)));
    }
  }
  n_digits = n_digits + n_after_dot | 0;
  if (n_digits === 0) {
    return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(undefined);
  }
  let rest;
  _L$2: {
    _L$3: {
      const _bind$3 = s$3;
      if (_M0MPC16string6String24char__length__ge_2einner(_bind$3.str, 1, _bind$3.start, _bind$3.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(_bind$3.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind$3.str, 0, _bind$3.start, _bind$3.end));
        switch (_x) {
          case 101: {
            const _tmp = _bind$3.str;
            const _bind$4 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind$3.str, 1, _bind$3.start, _bind$3.end);
            let _tmp$2;
            if (_bind$4 === undefined) {
              _tmp$2 = _bind$3.end;
            } else {
              const _Some = _bind$4;
              _tmp$2 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, _bind$3.end);
            rest = _x$2;
            break _L$3;
          }
          case 69: {
            const _tmp$3 = _bind$3.str;
            const _bind$5 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind$3.str, 1, _bind$3.start, _bind$3.end);
            let _tmp$4;
            if (_bind$5 === undefined) {
              _tmp$4 = _bind$3.end;
            } else {
              const _Some = _bind$5;
              _tmp$4 = _Some;
            }
            const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, _bind$3.end);
            rest = _x$3;
            break _L$3;
          }
        }
      }
      break _L$2;
    }
    const _bind$3 = _M0FPC28internal7strconv17parse__scientific(rest);
    let _bind$4;
    if (_bind$3 === undefined) {
      return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(undefined);
    } else {
      const _Some = _bind$3;
      _bind$4 = _Some;
    }
    const _new_s = _bind$4._0;
    const _exp_number = _bind$4._1;
    s$3 = _new_s;
    exponent = BigInt.asUintN(64, exponent + _exp_number);
  }
  const _bind$3 = s$3;
  if (_M0MPC16string6String24char__length__eq_2einner(_bind$3.str, 0, _bind$3.start, _bind$3.end)) {
    if (n_digits <= 19) {
      return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(new _M0TPC28internal7strconv6Number(exponent, mantissa, negative, false));
    }
    n_digits = n_digits - 19 | 0;
    let many_digits = false;
    let _tmp = s;
    while (true) {
      const s$4 = _tmp;
      _L$3: {
        let rest$2;
        let ch;
        _L$4: {
          if (_M0MPC16string6String24char__length__ge_2einner(s$4.str, 1, s$4.start, s$4.end)) {
            const _x = _M0MPC16string6String16unsafe__char__at(s$4.str, _M0MPC16string6String29offset__of__nth__char_2einner(s$4.str, 0, s$4.start, s$4.end));
            switch (_x) {
              case 48: {
                const _tmp$2 = s$4.str;
                const _bind$4 = _M0MPC16string6String29offset__of__nth__char_2einner(s$4.str, 1, s$4.start, s$4.end);
                let _tmp$3;
                if (_bind$4 === undefined) {
                  _tmp$3 = s$4.end;
                } else {
                  const _Some = _bind$4;
                  _tmp$3 = _Some;
                }
                const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, s$4.end);
                rest$2 = _x$2;
                ch = _x;
                break _L$4;
              }
              case 46: {
                const _tmp$4 = s$4.str;
                const _bind$5 = _M0MPC16string6String29offset__of__nth__char_2einner(s$4.str, 1, s$4.start, s$4.end);
                let _tmp$5;
                if (_bind$5 === undefined) {
                  _tmp$5 = s$4.end;
                } else {
                  const _Some = _bind$5;
                  _tmp$5 = _Some;
                }
                const _x$3 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, s$4.end);
                rest$2 = _x$3;
                ch = _x;
                break _L$4;
              }
              default: {
                break _L$3;
              }
            }
          } else {
            break _L$3;
          }
        }
        n_digits = n_digits - ((ch - 46 | 0) / 2 | 0) | 0;
        _tmp = rest$2;
        continue;
      }
      break;
    }
    let mantissa$2 = mantissa;
    if (n_digits > 0) {
      many_digits = true;
      mantissa$2 = 0n;
      const _bind$4 = _M0FPC28internal7strconv20try__parse__19digits(s, mantissa$2);
      const _s$2 = _bind$4._0;
      const _new_mantissa = _bind$4._1;
      const _consumed_digit = _bind$4._2;
      mantissa$2 = _new_mantissa;
      let _tmp$2;
      if (BigInt.asUintN(64, mantissa$2) >= BigInt.asUintN(64, _M0FPC28internal7strconv17min__19digit__int)) {
        _tmp$2 = _consumed_digit;
      } else {
        if (_M0MPC16string6String24char__length__ge_2einner(_s$2.str, 1, _s$2.start, _s$2.end)) {
          const _tmp$3 = _s$2.str;
          const _bind$5 = _M0MPC16string6String29offset__of__nth__char_2einner(_s$2.str, 1, _s$2.start, _s$2.end);
          let _tmp$4;
          if (_bind$5 === undefined) {
            _tmp$4 = _s$2.end;
          } else {
            const _Some = _bind$5;
            _tmp$4 = _Some;
          }
          const _x = new _M0TPC16string10StringView(_tmp$3, _tmp$4, _s$2.end);
          const _bind$6 = _M0FPC28internal7strconv20try__parse__19digits(_x, mantissa$2);
          const _new_mantissa$2 = _bind$6._1;
          const _consumed_digit$2 = _bind$6._2;
          mantissa$2 = _new_mantissa$2;
          _tmp$2 = _consumed_digit$2;
        } else {
          return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(undefined);
        }
      }
      exponent = BigInt.asUintN(64, BigInt(_tmp$2));
      exponent = BigInt.asUintN(64, exponent + _M0FPC28internal7strconv13parse__numberN11exp__numberS221);
    }
    return new _M0DTPC16result6ResultGORPC28internal7strconv6NumberRPC15error5ErrorE2Ok(new _M0TPC28internal7strconv6Number(exponent, mantissa$2, negative, many_digits));
  } else {
    return _M0FPC28internal7strconv11syntax__errGORPC28internal7strconv6NumberE();
  }
}
function _M0FPC28internal7strconv15parse__inf__nan(rest) {
  let pos;
  let rest$2;
  _L: {
    let rest$3;
    _L$2: {
      if (_M0MPC16string6String24char__length__ge_2einner(rest.str, 1, rest.start, rest.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(rest.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest.str, 0, rest.start, rest.end));
        switch (_x) {
          case 45: {
            const _tmp = rest.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest.str, 1, rest.start, rest.end);
            let _tmp$2;
            if (_bind === undefined) {
              _tmp$2 = rest.end;
            } else {
              const _Some = _bind;
              _tmp$2 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, rest.end);
            pos = false;
            rest$2 = _x$2;
            break _L;
          }
          case 43: {
            const _tmp$3 = rest.str;
            const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(rest.str, 1, rest.start, rest.end);
            let _tmp$4;
            if (_bind$2 === undefined) {
              _tmp$4 = rest.end;
            } else {
              const _Some = _bind$2;
              _tmp$4 = _Some;
            }
            const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, rest.end);
            rest$3 = _x$3;
            break _L$2;
          }
          default: {
            rest$3 = rest;
            break _L$2;
          }
        }
      } else {
        rest$3 = rest;
        break _L$2;
      }
    }
    pos = true;
    rest$2 = rest$3;
    break _L;
  }
  const _data = rest$2.str;
  const _start = rest$2.start;
  const _end = _start + (rest$2.end - rest$2.start | 0) | 0;
  let _cursor = _start;
  let accept_state = -1;
  let match_end = -1;
  _L$2: {
    _L$3: {
      if ((_cursor + 2 | 0) < _end) {
        _L$4: {
          _L$5: {
            const _p = _cursor;
            const next_char = _data.charCodeAt(_p);
            _cursor = _cursor + 1 | 0;
            if (next_char < 79) {
              if (next_char < 74) {
                if (next_char < 73) {
                  break _L$2;
                } else {
                  break _L$4;
                }
              } else {
                if (next_char > 77) {
                  break _L$5;
                } else {
                  break _L$2;
                }
              }
            } else {
              if (next_char > 104) {
                if (next_char < 110) {
                  if (next_char < 106) {
                    break _L$4;
                  } else {
                    break _L$2;
                  }
                } else {
                  if (next_char > 110) {
                    break _L$2;
                  } else {
                    break _L$5;
                  }
                }
              } else {
                break _L$2;
              }
            }
          }
          _L$6: {
            const _p = _cursor;
            const next_char = _data.charCodeAt(_p);
            _cursor = _cursor + 1 | 0;
            if (next_char < 66) {
              if (next_char < 65) {
                break _L$2;
              } else {
                break _L$6;
              }
            } else {
              if (next_char > 96) {
                if (next_char < 98) {
                  break _L$6;
                } else {
                  break _L$2;
                }
              } else {
                break _L$2;
              }
            }
          }
          _L$7: {
            const _p = _cursor;
            const next_char = _data.charCodeAt(_p);
            _cursor = _cursor + 1 | 0;
            if (next_char < 79) {
              if (next_char < 78) {
                break _L$2;
              } else {
                break _L$7;
              }
            } else {
              if (next_char > 109) {
                if (next_char < 111) {
                  break _L$7;
                } else {
                  break _L$2;
                }
              } else {
                break _L$2;
              }
            }
          }
          if (_cursor < _end) {
            break _L$2;
          } else {
            accept_state = 0;
            match_end = _cursor;
            break _L$2;
          }
        }
        _L$5: {
          const _p = _cursor;
          const next_char = _data.charCodeAt(_p);
          _cursor = _cursor + 1 | 0;
          if (next_char < 79) {
            if (next_char < 78) {
              break _L$2;
            } else {
              break _L$5;
            }
          } else {
            if (next_char > 109) {
              if (next_char < 111) {
                break _L$5;
              } else {
                break _L$2;
              }
            } else {
              break _L$2;
            }
          }
        }
        _L$6: {
          const _p = _cursor;
          const next_char = _data.charCodeAt(_p);
          _cursor = _cursor + 1 | 0;
          if (next_char < 71) {
            if (next_char < 70) {
              break _L$2;
            } else {
              break _L$6;
            }
          } else {
            if (next_char > 101) {
              if (next_char < 103) {
                break _L$6;
              } else {
                break _L$2;
              }
            } else {
              break _L$2;
            }
          }
        }
        if (_cursor < _end) {
          _L$7: {
            const _p = _cursor;
            const next_char = _data.charCodeAt(_p);
            _cursor = _cursor + 1 | 0;
            if (next_char < 74) {
              if (next_char < 73) {
                break _L$2;
              } else {
                break _L$7;
              }
            } else {
              if (next_char > 104) {
                if (next_char < 106) {
                  break _L$7;
                } else {
                  break _L$2;
                }
              } else {
                break _L$2;
              }
            }
          }
          if ((_cursor + 3 | 0) < _end) {
            _L$8: {
              const _p = _cursor;
              const next_char = _data.charCodeAt(_p);
              _cursor = _cursor + 1 | 0;
              if (next_char < 79) {
                if (next_char < 78) {
                  break _L$2;
                } else {
                  break _L$8;
                }
              } else {
                if (next_char > 109) {
                  if (next_char < 111) {
                    break _L$8;
                  } else {
                    break _L$2;
                  }
                } else {
                  break _L$2;
                }
              }
            }
            _L$9: {
              const _p = _cursor;
              const next_char = _data.charCodeAt(_p);
              _cursor = _cursor + 1 | 0;
              if (next_char < 74) {
                if (next_char < 73) {
                  break _L$2;
                } else {
                  break _L$9;
                }
              } else {
                if (next_char > 104) {
                  if (next_char < 106) {
                    break _L$9;
                  } else {
                    break _L$2;
                  }
                } else {
                  break _L$2;
                }
              }
            }
            _L$10: {
              const _p = _cursor;
              const next_char = _data.charCodeAt(_p);
              _cursor = _cursor + 1 | 0;
              if (next_char < 85) {
                if (next_char < 84) {
                  break _L$2;
                } else {
                  break _L$10;
                }
              } else {
                if (next_char > 115) {
                  if (next_char < 117) {
                    break _L$10;
                  } else {
                    break _L$2;
                  }
                } else {
                  break _L$2;
                }
              }
            }
            _L$11: {
              const _p = _cursor;
              const next_char = _data.charCodeAt(_p);
              _cursor = _cursor + 1 | 0;
              if (next_char < 90) {
                if (next_char < 89) {
                  break _L$2;
                } else {
                  break _L$11;
                }
              } else {
                if (next_char > 120) {
                  if (next_char < 122) {
                    break _L$11;
                  } else {
                    break _L$2;
                  }
                } else {
                  break _L$2;
                }
              }
            }
            if (_cursor < _end) {
              break _L$2;
            } else {
              break _L$3;
            }
          } else {
            break _L$2;
          }
        } else {
          break _L$3;
        }
      } else {
        break _L$2;
      }
    }
    accept_state = 1;
    match_end = _cursor;
    break _L$2;
  }
  switch (accept_state) {
    case 0: {
      return new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(_M0FPC16double14not__a__number);
    }
    case 1: {
      return pos ? new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(_M0FPC16double8infinity) : new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(_M0FPC16double13neg__infinity);
    }
    default: {
      return _M0FPC28internal7strconv11syntax__errGdE();
    }
  }
}
function _M0FPC28internal7strconv12checked__mul(a, b) {
  if (BigInt.asUintN(64, a) === BigInt.asUintN(64, 0n) || BigInt.asUintN(64, b) === BigInt.asUintN(64, 0n)) {
    return _M0FPC28internal7strconv12checked__mulN6constrS1107;
  }
  if (BigInt.asUintN(64, a) === BigInt.asUintN(64, 1n)) {
    return b;
  }
  if (BigInt.asUintN(64, b) === BigInt.asUintN(64, 1n)) {
    return a;
  }
  if ($i64_clz(b) === 0 || $i64_clz(a) === 0) {
    return undefined;
  }
  if (b === 0n) {
    $panic();
  }
  const quotient = BigInt.asUintN(64, BigInt.asUintN(64, 18446744073709551615n) / BigInt.asUintN(64, b));
  if (BigInt.asUintN(64, a) > BigInt.asUintN(64, quotient)) {
    return undefined;
  }
  return BigInt.asUintN(64, a * b);
}
function _M0FPC28internal7strconv19overflow__threshold(base, neg) {
  if (!neg) {
    if (base === 10) {
      return 922337203685477581n;
    } else {
      if (base === 16) {
        return 576460752303423488n;
      } else {
        const _tmp = BigInt.asUintN(64, BigInt(base));
        if (_tmp === 0n) {
          $panic();
        }
        return BigInt.asUintN(64, BigInt.asUintN(64, BigInt.asIntN(64, 9223372036854775807n) / BigInt.asIntN(64, _tmp)) + 1n);
      }
    }
  } else {
    if (base === 10) {
      return 17524406870024074036n;
    } else {
      if (base === 16) {
        return 17870283321406128128n;
      } else {
        const _tmp = BigInt.asUintN(64, BigInt(base));
        if (_tmp === 0n) {
          $panic();
        }
        return BigInt.asUintN(64, BigInt.asIntN(64, 9223372036854775808n) / BigInt.asIntN(64, _tmp));
      }
    }
  }
}
function _M0FPC28internal7strconv20parse__int64_2einner(str, base) {
  if (_M0IP016_24default__implPB2Eq10not__equalGRPC16string10StringViewE(str, new _M0TPC16string10StringView(_M0FPC28internal7strconv20parse__int64_2einnerN7_2abindS645, 0, _M0FPC28internal7strconv20parse__int64_2einnerN7_2abindS645.length))) {
    let neg;
    let rest;
    _L: {
      let rest$2;
      _L$2: {
        const _bind = _M0MPC16string10StringView12view_2einner(str, 0, undefined);
        if (_M0MPC16string6String24char__length__ge_2einner(_bind.str, 1, _bind.start, _bind.end)) {
          const _x = _M0MPC16string6String16unsafe__char__at(_bind.str, _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 0, _bind.start, _bind.end));
          switch (_x) {
            case 43: {
              const _tmp = _bind.str;
              const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 1, _bind.start, _bind.end);
              let _tmp$2;
              if (_bind$2 === undefined) {
                _tmp$2 = _bind.end;
              } else {
                const _Some = _bind$2;
                _tmp$2 = _Some;
              }
              const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, _bind.end);
              neg = false;
              rest = _x$2;
              break _L;
            }
            case 45: {
              const _tmp$3 = _bind.str;
              const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(_bind.str, 1, _bind.start, _bind.end);
              let _tmp$4;
              if (_bind$3 === undefined) {
                _tmp$4 = _bind.end;
              } else {
                const _Some = _bind$3;
                _tmp$4 = _Some;
              }
              const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, _bind.end);
              neg = true;
              rest = _x$3;
              break _L;
            }
            default: {
              rest$2 = _bind;
              break _L$2;
            }
          }
        } else {
          rest$2 = _bind;
          break _L$2;
        }
      }
      neg = false;
      rest = rest$2;
      break _L;
    }
    const _bind = _M0FPC28internal7strconv25check__and__consume__base(rest, base);
    let _bind$2;
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _bind$2 = _ok._0;
    } else {
      return _bind;
    }
    const _num_base = _bind$2._0;
    const _rest = _bind$2._1;
    const _allow_underscore = _bind$2._2;
    const overflow_threshold = _M0FPC28internal7strconv19overflow__threshold(_num_base, neg);
    let has_digit;
    if (_M0MPC16string6String24char__length__ge_2einner(_rest.str, 1, _rest.start, _rest.end)) {
      const _x = _M0MPC16string6String16unsafe__char__at(_rest.str, _M0MPC16string6String29offset__of__nth__char_2einner(_rest.str, 0, _rest.start, _rest.end));
      if (_x >= 48 && _x <= 57) {
        has_digit = true;
      } else {
        if (_x >= 97 && _x <= 122) {
          has_digit = true;
        } else {
          if (_x >= 65 && _x <= 90) {
            has_digit = true;
          } else {
            if (_M0MPC16string6String24char__length__ge_2einner(_rest.str, 2, _rest.start, _rest.end)) {
              if (_x === 95) {
                const _x$2 = _M0MPC16string6String16unsafe__char__at(_rest.str, _M0MPC16string6String29offset__of__nth__char_2einner(_rest.str, 1, _rest.start, _rest.end));
                has_digit = _x$2 >= 48 && _x$2 <= 57 ? true : _x$2 >= 97 && _x$2 <= 122 ? true : _x$2 >= 65 && _x$2 <= 90;
              } else {
                has_digit = false;
              }
            } else {
              has_digit = false;
            }
          }
        }
      }
    } else {
      has_digit = false;
    }
    if (has_digit) {
      let _tmp;
      let _tmp$2 = _rest;
      let _tmp$3 = 0n;
      let _tmp$4 = _allow_underscore;
      while (true) {
        const rest$2 = _tmp$2;
        const acc = _tmp$3;
        const allow_underscore = _tmp$4;
        let acc$2;
        let rest$3;
        let c;
        _L$2: {
          _L$3: {
            if (_M0MPC16string6String24char__length__eq_2einner(rest$2.str, 1, rest$2.start, rest$2.end)) {
              const _x = _M0MPC16string6String16unsafe__char__at(rest$2.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 0, rest$2.start, rest$2.end));
              if (_x === 95) {
                const _bind$3 = _M0FPC28internal7strconv11syntax__errGuE();
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  _ok._0;
                } else {
                  return _bind$3;
                }
              } else {
                const _tmp$5 = rest$2.str;
                const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 1, rest$2.start, rest$2.end);
                let _tmp$6;
                if (_bind$3 === undefined) {
                  _tmp$6 = rest$2.end;
                } else {
                  const _Some = _bind$3;
                  _tmp$6 = _Some;
                }
                const _x$2 = new _M0TPC16string10StringView(_tmp$5, _tmp$6, rest$2.end);
                acc$2 = acc;
                rest$3 = _x$2;
                c = _x;
                break _L$3;
              }
            } else {
              if (_M0MPC16string6String24char__length__ge_2einner(rest$2.str, 1, rest$2.start, rest$2.end)) {
                const _x = _M0MPC16string6String16unsafe__char__at(rest$2.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 0, rest$2.start, rest$2.end));
                if (_x === 95) {
                  if (allow_underscore === false) {
                    const _bind$3 = _M0FPC28internal7strconv11syntax__errGuE();
                    if (_bind$3.$tag === 1) {
                      const _ok = _bind$3;
                      _ok._0;
                    } else {
                      return _bind$3;
                    }
                  } else {
                    const _tmp$5 = rest$2.str;
                    const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 1, rest$2.start, rest$2.end);
                    let _tmp$6;
                    if (_bind$3 === undefined) {
                      _tmp$6 = rest$2.end;
                    } else {
                      const _Some = _bind$3;
                      _tmp$6 = _Some;
                    }
                    const _x$2 = new _M0TPC16string10StringView(_tmp$5, _tmp$6, rest$2.end);
                    _tmp$2 = _x$2;
                    _tmp$4 = false;
                    continue;
                  }
                } else {
                  const _tmp$5 = rest$2.str;
                  const _bind$3 = _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 1, rest$2.start, rest$2.end);
                  let _tmp$6;
                  if (_bind$3 === undefined) {
                    _tmp$6 = rest$2.end;
                  } else {
                    const _Some = _bind$3;
                    _tmp$6 = _Some;
                  }
                  const _x$2 = new _M0TPC16string10StringView(_tmp$5, _tmp$6, rest$2.end);
                  acc$2 = acc;
                  rest$3 = _x$2;
                  c = _x;
                  break _L$3;
                }
              } else {
                _tmp = acc;
                break;
              }
            }
            break _L$2;
          }
          const c$2 = c;
          let d;
          if (c$2 >= 48 && c$2 <= 57) {
            d = c$2 - 48 | 0;
          } else {
            if (c$2 >= 97 && c$2 <= 122) {
              d = c$2 + -87 | 0;
            } else {
              if (c$2 >= 65 && c$2 <= 90) {
                d = c$2 + -55 | 0;
              } else {
                const _bind$3 = _M0FPC28internal7strconv11syntax__errGiE();
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  d = _ok._0;
                } else {
                  return _bind$3;
                }
              }
            }
          }
          if (d < _num_base) {
            if (neg) {
              if (BigInt.asIntN(64, acc$2) >= BigInt.asIntN(64, overflow_threshold)) {
                const next_acc = BigInt.asUintN(64, BigInt.asUintN(64, acc$2 * BigInt.asUintN(64, BigInt(_num_base))) - BigInt.asUintN(64, BigInt(d)));
                if (BigInt.asIntN(64, next_acc) <= BigInt.asIntN(64, acc$2)) {
                  _tmp$2 = rest$3;
                  _tmp$3 = next_acc;
                  _tmp$4 = true;
                  continue;
                } else {
                  const _bind$3 = _M0FPC28internal7strconv10range__errGuE();
                  if (_bind$3.$tag === 1) {
                    const _ok = _bind$3;
                    _ok._0;
                  } else {
                    return _bind$3;
                  }
                }
              } else {
                const _bind$3 = _M0FPC28internal7strconv10range__errGuE();
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  _ok._0;
                } else {
                  return _bind$3;
                }
              }
            } else {
              if (BigInt.asIntN(64, acc$2) < BigInt.asIntN(64, overflow_threshold)) {
                const next_acc = BigInt.asUintN(64, BigInt.asUintN(64, acc$2 * BigInt.asUintN(64, BigInt(_num_base))) + BigInt.asUintN(64, BigInt(d)));
                if (BigInt.asIntN(64, next_acc) >= BigInt.asIntN(64, acc$2)) {
                  _tmp$2 = rest$3;
                  _tmp$3 = next_acc;
                  _tmp$4 = true;
                  continue;
                } else {
                  const _bind$3 = _M0FPC28internal7strconv10range__errGuE();
                  if (_bind$3.$tag === 1) {
                    const _ok = _bind$3;
                    _ok._0;
                  } else {
                    return _bind$3;
                  }
                }
              } else {
                const _bind$3 = _M0FPC28internal7strconv10range__errGuE();
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  _ok._0;
                } else {
                  return _bind$3;
                }
              }
            }
          } else {
            const _bind$3 = _M0FPC28internal7strconv11syntax__errGuE();
            if (_bind$3.$tag === 1) {
              const _ok = _bind$3;
              _ok._0;
            } else {
              return _bind$3;
            }
          }
        }
        continue;
      }
      return new _M0DTPC16result6ResultGlRPC15error5ErrorE2Ok(_tmp);
    } else {
      return _M0FPC28internal7strconv11syntax__errGlE();
    }
  } else {
    return _M0FPC28internal7strconv11syntax__errGlE();
  }
}
function _M0FPC28internal7strconv17check__underscore(str) {
  let rest;
  if (_M0MPC16string6String24char__length__ge_2einner(str.str, 1, str.start, str.end)) {
    const _x = _M0MPC16string6String16unsafe__char__at(str.str, _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 0, str.start, str.end));
    switch (_x) {
      case 43: {
        const _tmp = str.str;
        const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 1, str.start, str.end);
        let _tmp$2;
        if (_bind === undefined) {
          _tmp$2 = str.end;
        } else {
          const _Some = _bind;
          _tmp$2 = _Some;
        }
        const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, str.end);
        rest = _x$2;
        break;
      }
      case 45: {
        const _tmp$3 = str.str;
        const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 1, str.start, str.end);
        let _tmp$4;
        if (_bind$2 === undefined) {
          _tmp$4 = str.end;
        } else {
          const _Some = _bind$2;
          _tmp$4 = _Some;
        }
        const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, str.end);
        rest = _x$3;
        break;
      }
      default: {
        rest = str;
      }
    }
  } else {
    rest = str;
  }
  let rest$2;
  let allow_underscore;
  let hex;
  _L: {
    const _data = rest.str;
    const _start = rest.start;
    const _end = _start + (rest.end - rest.start | 0) | 0;
    let _cursor = _start;
    let accept_state = -1;
    let match_end = -1;
    _L$2: {
      if ((_cursor + 1 | 0) < _end) {
        const _p = _cursor;
        if (_data.charCodeAt(_p) === 48) {
          _cursor = _cursor + 1 | 0;
          _L$3: {
            _L$4: {
              _L$5: {
                const _p$2 = _cursor;
                const next_char = _data.charCodeAt(_p$2);
                _cursor = _cursor + 1 | 0;
                if (next_char < 89) {
                  if (next_char < 79) {
                    if (next_char === 66) {
                      break _L$3;
                    } else {
                      break _L$2;
                    }
                  } else {
                    if (next_char > 79) {
                      if (next_char < 88) {
                        break _L$2;
                      } else {
                        break _L$5;
                      }
                    } else {
                      break _L$4;
                    }
                  }
                } else {
                  if (next_char > 97) {
                    if (next_char < 112) {
                      if (next_char < 99) {
                        break _L$3;
                      } else {
                        if (next_char > 110) {
                          break _L$4;
                        } else {
                          break _L$2;
                        }
                      }
                    } else {
                      if (next_char > 119) {
                        if (next_char < 121) {
                          break _L$5;
                        } else {
                          break _L$2;
                        }
                      } else {
                        break _L$2;
                      }
                    }
                  } else {
                    break _L$2;
                  }
                }
              }
              accept_state = 2;
              match_end = _cursor;
              break _L$2;
            }
            accept_state = 1;
            match_end = _cursor;
            break _L$2;
          }
          accept_state = 0;
          match_end = _cursor;
          break _L$2;
        } else {
          break _L$2;
        }
      } else {
        break _L$2;
      }
    }
    switch (accept_state) {
      case 2: {
        const rest$3 = _M0MPC16string6String4view(_data, match_end, _end);
        rest$2 = rest$3;
        allow_underscore = true;
        hex = true;
        break _L;
      }
      case 1: {
        const rest$4 = _M0MPC16string6String4view(_data, match_end, _end);
        rest$2 = rest$4;
        allow_underscore = true;
        hex = false;
        break _L;
      }
      case 0: {
        const rest$5 = _M0MPC16string6String4view(_data, match_end, _end);
        rest$2 = rest$5;
        allow_underscore = true;
        hex = false;
        break _L;
      }
      default: {
        rest$2 = rest;
        allow_underscore = false;
        hex = false;
        break _L;
      }
    }
  }
  let _tmp = rest$2;
  let _tmp$2 = allow_underscore;
  let _tmp$3 = false;
  while (true) {
    const rest$3 = _tmp;
    const allow_underscore$2 = _tmp$2;
    const follow_underscore = _tmp$3;
    let rest$4;
    let c;
    let follow_underscore$2;
    _L$2: {
      if (_M0MPC16string6String24char__length__eq_2einner(rest$3.str, 0, rest$3.start, rest$3.end)) {
        return true;
      } else {
        if (_M0MPC16string6String24char__length__eq_2einner(rest$3.str, 1, rest$3.start, rest$3.end)) {
          const _x = _M0MPC16string6String16unsafe__char__at(rest$3.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 0, rest$3.start, rest$3.end));
          if (_x === 95) {
            return false;
          } else {
            const _tmp$4 = rest$3.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
            let _tmp$5;
            if (_bind === undefined) {
              _tmp$5 = rest$3.end;
            } else {
              const _Some = _bind;
              _tmp$5 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, rest$3.end);
            rest$4 = _x$2;
            c = _x;
            follow_underscore$2 = follow_underscore;
            break _L$2;
          }
        } else {
          const _x = _M0MPC16string6String16unsafe__char__at(rest$3.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 0, rest$3.start, rest$3.end));
          if (_x === 95) {
            if (allow_underscore$2 === false) {
              return false;
            } else {
              const _tmp$4 = rest$3.str;
              const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
              let _tmp$5;
              if (_bind === undefined) {
                _tmp$5 = rest$3.end;
              } else {
                const _Some = _bind;
                _tmp$5 = _Some;
              }
              const _x$2 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, rest$3.end);
              _tmp = _x$2;
              _tmp$2 = false;
              _tmp$3 = true;
              continue;
            }
          } else {
            const _tmp$4 = rest$3.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
            let _tmp$5;
            if (_bind === undefined) {
              _tmp$5 = rest$3.end;
            } else {
              const _Some = _bind;
              _tmp$5 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, rest$3.end);
            rest$4 = _x$2;
            c = _x;
            follow_underscore$2 = follow_underscore;
            break _L$2;
          }
        }
      }
    }
    if (c >= 48 && c <= 57 ? true : hex && (c >= 97 && c <= 102 ? true : c >= 65 && c <= 70)) {
      _tmp = rest$4;
      _tmp$2 = true;
      _tmp$3 = false;
      continue;
    } else {
      if (follow_underscore$2) {
        return false;
      } else {
        _tmp = rest$4;
        _tmp$2 = false;
        _tmp$3 = false;
        continue;
      }
    }
  }
}
function _M0MPC28internal7strconv7Decimal9new__priv() {
  return new _M0TPC28internal7strconv7Decimal($makebytes(800, 0), 0, 0, false, false);
}
function _M0MPC28internal7strconv7Decimal4trim(self) {
  while (true) {
    let _tmp;
    if (self.digits_num > 0) {
      const _tmp$2 = self.digits;
      const _tmp$3 = self.digits_num - 1 | 0;
      $bound_check(_tmp$2, _tmp$3);
      const _p = _tmp$2[_tmp$3];
      const _p$2 = 0;
      _tmp = _p === _p$2;
    } else {
      _tmp = false;
    }
    if (_tmp) {
      self.digits_num = self.digits_num - 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (self.digits_num === 0) {
    self.decimal_point = 0;
    return;
  } else {
    return;
  }
}
function _M0FPC28internal7strconv26parse__decimal__from__view(str) {
  const d = _M0MPC28internal7strconv7Decimal9new__priv();
  let has_dp = false;
  let has_digits = false;
  let rest;
  _L: {
    _L$2: {
      if (_M0MPC16string6String24char__length__ge_2einner(str.str, 1, str.start, str.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(str.str, _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 0, str.start, str.end));
        switch (_x) {
          case 45: {
            const _tmp = str.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 1, str.start, str.end);
            let _tmp$2;
            if (_bind === undefined) {
              _tmp$2 = str.end;
            } else {
              const _Some = _bind;
              _tmp$2 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp, _tmp$2, str.end);
            d.negative = true;
            rest = _x$2;
            break;
          }
          case 43: {
            const _tmp$3 = str.str;
            const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(str.str, 1, str.start, str.end);
            let _tmp$4;
            if (_bind$2 === undefined) {
              _tmp$4 = str.end;
            } else {
              const _Some = _bind$2;
              _tmp$4 = _Some;
            }
            rest = new _M0TPC16string10StringView(_tmp$3, _tmp$4, str.end);
            break;
          }
          default: {
            break _L$2;
          }
        }
      } else {
        break _L$2;
      }
      break _L;
    }
    rest = str;
  }
  let rest$2;
  let _tmp = rest;
  while (true) {
    const rest$3 = _tmp;
    let rest$4;
    _L$2: {
      _L$3: {
        if (_M0MPC16string6String24char__length__ge_2einner(rest$3.str, 1, rest$3.start, rest$3.end)) {
          const _x = _M0MPC16string6String16unsafe__char__at(rest$3.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 0, rest$3.start, rest$3.end));
          if (_x === 95) {
            const _tmp$2 = rest$3.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
            let _tmp$3;
            if (_bind === undefined) {
              _tmp$3 = rest$3.end;
            } else {
              const _Some = _bind;
              _tmp$3 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, rest$3.end);
            _tmp = _x$2;
            continue;
          } else {
            if (_x === 46) {
              const _tmp$2 = rest$3.str;
              const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
              let _tmp$3;
              if (_bind === undefined) {
                _tmp$3 = rest$3.end;
              } else {
                const _Some = _bind;
                _tmp$3 = _Some;
              }
              const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, rest$3.end);
              if (!has_dp) {
                has_dp = true;
                d.decimal_point = d.digits_num;
                _tmp = _x$2;
                continue;
              } else {
                const _bind$2 = _M0FPC28internal7strconv11syntax__errGuE();
                if (_bind$2.$tag === 1) {
                  const _ok = _bind$2;
                  _ok._0;
                } else {
                  return _bind$2;
                }
              }
            } else {
              if (_x >= 48 && _x <= 57) {
                const _tmp$2 = rest$3.str;
                const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$3.str, 1, rest$3.start, rest$3.end);
                let _tmp$3;
                if (_bind === undefined) {
                  _tmp$3 = rest$3.end;
                } else {
                  const _Some = _bind;
                  _tmp$3 = _Some;
                }
                const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, rest$3.end);
                has_digits = true;
                if (_x === 48 && d.digits_num === 0) {
                  d.decimal_point = d.decimal_point - 1 | 0;
                  _tmp = _x$2;
                  continue;
                }
                if (d.digits_num < d.digits.length) {
                  const _tmp$4 = d.digits;
                  const _tmp$5 = d.digits_num;
                  $bound_check(_tmp$4, _tmp$5);
                  _tmp$4[_tmp$5] = (_x - 48 | 0) & 255;
                  d.digits_num = d.digits_num + 1 | 0;
                } else {
                  if (_x !== 48) {
                    d.truncated = true;
                  }
                }
                _tmp = _x$2;
                continue;
              } else {
                rest$4 = rest$3;
                break _L$3;
              }
            }
          }
        } else {
          rest$4 = rest$3;
          break _L$3;
        }
        break _L$2;
      }
      rest$2 = rest$4;
      break;
    }
    continue;
  }
  if (has_digits) {
    if (!has_dp) {
      d.decimal_point = d.digits_num;
    }
    let rest$3;
    let rest$4;
    _L$2: {
      _L$3: {
        if (_M0MPC16string6String24char__length__ge_2einner(rest$2.str, 1, rest$2.start, rest$2.end)) {
          const _x = _M0MPC16string6String16unsafe__char__at(rest$2.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 0, rest$2.start, rest$2.end));
          switch (_x) {
            case 101: {
              const _tmp$2 = rest$2.str;
              const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 1, rest$2.start, rest$2.end);
              let _tmp$3;
              if (_bind === undefined) {
                _tmp$3 = rest$2.end;
              } else {
                const _Some = _bind;
                _tmp$3 = _Some;
              }
              const _x$2 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, rest$2.end);
              rest$4 = _x$2;
              break _L$3;
            }
            case 69: {
              const _tmp$4 = rest$2.str;
              const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(rest$2.str, 1, rest$2.start, rest$2.end);
              let _tmp$5;
              if (_bind$2 === undefined) {
                _tmp$5 = rest$2.end;
              } else {
                const _Some = _bind$2;
                _tmp$5 = _Some;
              }
              const _x$3 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, rest$2.end);
              rest$4 = _x$3;
              break _L$3;
            }
            default: {
              rest$3 = rest$2;
            }
          }
        } else {
          rest$3 = rest$2;
        }
        break _L$2;
      }
      let exp_sign = 1;
      let rest$5;
      if (_M0MPC16string6String24char__length__ge_2einner(rest$4.str, 1, rest$4.start, rest$4.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(rest$4.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$4.str, 0, rest$4.start, rest$4.end));
        switch (_x) {
          case 43: {
            const _tmp$2 = rest$4.str;
            const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$4.str, 1, rest$4.start, rest$4.end);
            let _tmp$3;
            if (_bind === undefined) {
              _tmp$3 = rest$4.end;
            } else {
              const _Some = _bind;
              _tmp$3 = _Some;
            }
            rest$5 = new _M0TPC16string10StringView(_tmp$2, _tmp$3, rest$4.end);
            break;
          }
          case 45: {
            const _tmp$4 = rest$4.str;
            const _bind$2 = _M0MPC16string6String29offset__of__nth__char_2einner(rest$4.str, 1, rest$4.start, rest$4.end);
            let _tmp$5;
            if (_bind$2 === undefined) {
              _tmp$5 = rest$4.end;
            } else {
              const _Some = _bind$2;
              _tmp$5 = _Some;
            }
            const _x$2 = new _M0TPC16string10StringView(_tmp$4, _tmp$5, rest$4.end);
            exp_sign = -1;
            rest$5 = _x$2;
            break;
          }
          default: {
            rest$5 = rest$4;
          }
        }
      } else {
        rest$5 = rest$4;
      }
      _L$4: {
        _L$5: {
          if (_M0MPC16string6String24char__length__ge_2einner(rest$5.str, 1, rest$5.start, rest$5.end)) {
            const _x = _M0MPC16string6String16unsafe__char__at(rest$5.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$5.str, 0, rest$5.start, rest$5.end));
            if (_x >= 48 && _x <= 57) {
              let exp = 0;
              let rest$6;
              let _tmp$2 = rest$5;
              while (true) {
                const rest$7 = _tmp$2;
                let rest$8;
                _L$6: {
                  if (_M0MPC16string6String24char__length__ge_2einner(rest$7.str, 1, rest$7.start, rest$7.end)) {
                    const _x$2 = _M0MPC16string6String16unsafe__char__at(rest$7.str, _M0MPC16string6String29offset__of__nth__char_2einner(rest$7.str, 0, rest$7.start, rest$7.end));
                    if (_x$2 === 95) {
                      const _tmp$3 = rest$7.str;
                      const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$7.str, 1, rest$7.start, rest$7.end);
                      let _tmp$4;
                      if (_bind === undefined) {
                        _tmp$4 = rest$7.end;
                      } else {
                        const _Some = _bind;
                        _tmp$4 = _Some;
                      }
                      const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, rest$7.end);
                      _tmp$2 = _x$3;
                      continue;
                    } else {
                      if (_x$2 >= 48 && _x$2 <= 57) {
                        const _tmp$3 = rest$7.str;
                        const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(rest$7.str, 1, rest$7.start, rest$7.end);
                        let _tmp$4;
                        if (_bind === undefined) {
                          _tmp$4 = rest$7.end;
                        } else {
                          const _Some = _bind;
                          _tmp$4 = _Some;
                        }
                        const _x$3 = new _M0TPC16string10StringView(_tmp$3, _tmp$4, rest$7.end);
                        exp = (Math.imul(exp, 10) | 0) + (_x$2 - 48 | 0) | 0;
                        _tmp$2 = _x$3;
                        continue;
                      } else {
                        rest$8 = rest$7;
                        break _L$6;
                      }
                    }
                  } else {
                    rest$8 = rest$7;
                    break _L$6;
                  }
                }
                rest$6 = rest$8;
                break;
              }
              d.decimal_point = d.decimal_point + (Math.imul(exp_sign, exp) | 0) | 0;
              rest$3 = rest$6;
            } else {
              break _L$5;
            }
          } else {
            break _L$5;
          }
          break _L$4;
        }
        const _bind = _M0FPC28internal7strconv11syntax__errGlE();
        if (_bind.$tag === 1) {
          const _ok = _bind;
          rest$3 = _ok._0;
        } else {
          return _bind;
        }
      }
    }
    if (_M0MPC16string6String24char__length__eq_2einner(rest$3.str, 0, rest$3.start, rest$3.end)) {
      _M0MPC28internal7strconv7Decimal4trim(d);
      return new _M0DTPC16result6ResultGRPC28internal7strconv7DecimalRPC15error5ErrorE2Ok(d);
    } else {
      return _M0FPC28internal7strconv11syntax__errGlE();
    }
  } else {
    return _M0FPC28internal7strconv11syntax__errGlE();
  }
}
function _M0FPC28internal7strconv20parse__decimal__priv(str) {
  return _M0FPC28internal7strconv26parse__decimal__from__view(str);
}
function _M0FPC28internal7strconv14assemble__bits(mantissa, exponent, negative) {
  const biased_exp = exponent - _M0FPC28internal7strconv12double__info.bias | 0;
  let bits = BigInt.asUintN(64, mantissa & BigInt.asUintN(64, BigInt.asUintN(64, 1n << BigInt(_M0FPC28internal7strconv12double__info.mantissa_bits & 63)) - 1n));
  const exp_bits = BigInt.asUintN(64, BigInt(biased_exp & ((1 << _M0FPC28internal7strconv12double__info.exponent_bits) - 1 | 0)));
  bits = BigInt.asUintN(64, bits | BigInt.asUintN(64, exp_bits << BigInt(_M0FPC28internal7strconv12double__info.mantissa_bits & 63)));
  if (negative) {
    bits = BigInt.asUintN(64, bits | BigInt.asUintN(64, BigInt.asUintN(64, 1n << BigInt(_M0FPC28internal7strconv12double__info.mantissa_bits & 63)) << BigInt(_M0FPC28internal7strconv12double__info.exponent_bits & 63)));
  }
  return bits;
}
function _M0MPC28internal7strconv7Decimal17should__round__up(self, d) {
  if (d < 0 || d >= self.digits_num) {
    return false;
  }
  let _tmp;
  const _tmp$2 = self.digits;
  $bound_check(_tmp$2, d);
  if (_tmp$2[d] === 5) {
    _tmp = (d + 1 | 0) === self.digits_num;
  } else {
    _tmp = false;
  }
  if (_tmp) {
    if (self.truncated) {
      return true;
    }
    let _tmp$3;
    if (d > 0) {
      const _tmp$4 = self.digits;
      const _tmp$5 = d - 1 | 0;
      $bound_check(_tmp$4, _tmp$5);
      _tmp$3 = (_tmp$4[_tmp$5] % 2 | 0) !== 0;
    } else {
      _tmp$3 = false;
    }
    return _tmp$3;
  }
  const _tmp$3 = self.digits;
  $bound_check(_tmp$3, d);
  return _tmp$3[d] >= 5;
}
function _M0MPC28internal7strconv7Decimal16rounded__integer(self) {
  if (self.decimal_point > 20) {
    return 18446744073709551615n;
  }
  let _tmp = 0n;
  let _tmp$2 = 0;
  while (true) {
    const n = _tmp;
    const i = _tmp$2;
    if (i < self.decimal_point && i < self.digits_num) {
      const _tmp$3 = BigInt.asUintN(64, n * 10n);
      const _tmp$4 = self.digits;
      $bound_check(_tmp$4, i);
      const _p = _tmp$4[i];
      _tmp = BigInt.asUintN(64, _tmp$3 + BigInt.asUintN(64, BigInt(_p)));
      _tmp$2 = i + 1 | 0;
      continue;
    } else {
      let n$2;
      let _tmp$3 = n;
      let _tmp$4 = i;
      while (true) {
        const n$3 = _tmp$3;
        const i$2 = _tmp$4;
        if (i$2 < self.decimal_point) {
          _tmp$3 = BigInt.asUintN(64, n$3 * 10n);
          _tmp$4 = i$2 + 1 | 0;
          continue;
        } else {
          n$2 = n$3;
          break;
        }
      }
      return _M0MPC28internal7strconv7Decimal17should__round__up(self, self.decimal_point) ? BigInt.asUintN(64, n$2 + 1n) : n$2;
    }
  }
}
function _M0MPC28internal7strconv7Decimal11new__digits(self, s) {
  $bound_check(_M0FPC28internal7strconv19left__shift__cheats, s);
  const new_digits = _M0FPC28internal7strconv19left__shift__cheats[s]._0;
  $bound_check(_M0FPC28internal7strconv19left__shift__cheats, s);
  const cheat_num = _M0FPC28internal7strconv19left__shift__cheats[s]._1;
  const _bind = cheat_num.length;
  let less;
  let _tmp = 0;
  while (true) {
    const i = _tmp;
    if (i < _bind) {
      if (i >= self.digits_num) {
        less = true;
        break;
      }
      const d = cheat_num.charCodeAt(i) - 48 | 0;
      const _tmp$2 = self.digits;
      $bound_check(_tmp$2, i);
      if (_tmp$2[i] !== d) {
        const _tmp$3 = self.digits;
        $bound_check(_tmp$3, i);
        less = _tmp$3[i] < d;
        break;
      }
      _tmp = i + 1 | 0;
      continue;
    } else {
      less = false;
      break;
    }
  }
  return less ? new_digits - 1 | 0 : new_digits;
}
function _M0MPC28internal7strconv7Decimal11left__shift(self, s) {
  const new_digits = _M0MPC28internal7strconv7Decimal11new__digits(self, s);
  let read_index = self.digits_num;
  let write_index = self.digits_num + new_digits | 0;
  let acc = 0n;
  read_index = read_index - 1 | 0;
  while (true) {
    if (read_index >= 0) {
      const _tmp = self.digits;
      const _tmp$2 = read_index;
      $bound_check(_tmp, _tmp$2);
      const _p = _tmp[_tmp$2];
      const d = BigInt.asUintN(64, BigInt(_p));
      acc = BigInt.asUintN(64, acc + BigInt.asUintN(64, d << BigInt(s & 63)));
      if (10n === 0n) {
        $panic();
      }
      const quo = BigInt.asUintN(64, BigInt.asIntN(64, acc) / BigInt.asIntN(64, 10n));
      const rem = Number(BigInt.asIntN(32, BigInt.asUintN(64, acc - BigInt.asUintN(64, quo * 10n)))) | 0;
      write_index = write_index - 1 | 0;
      if (write_index < self.digits.length) {
        const _tmp$3 = self.digits;
        const _tmp$4 = write_index;
        $bound_check(_tmp$3, _tmp$4);
        _tmp$3[_tmp$4] = rem & 255;
      } else {
        if (rem !== 0) {
          self.truncated = true;
        }
      }
      acc = quo;
      read_index = read_index - 1 | 0;
      continue;
    } else {
      break;
    }
  }
  while (true) {
    if (BigInt.asIntN(64, acc) > BigInt.asIntN(64, 0n)) {
      if (10n === 0n) {
        $panic();
      }
      const quo = BigInt.asUintN(64, BigInt.asIntN(64, acc) / BigInt.asIntN(64, 10n));
      const rem = Number(BigInt.asIntN(32, BigInt.asUintN(64, acc - BigInt.asUintN(64, 10n * quo)))) | 0;
      write_index = write_index - 1 | 0;
      if (write_index < self.digits.length) {
        const _tmp = self.digits;
        const _tmp$2 = write_index;
        $bound_check(_tmp, _tmp$2);
        _tmp[_tmp$2] = rem & 255;
      } else {
        if (rem !== 0) {
          self.truncated = true;
        }
      }
      acc = quo;
      continue;
    } else {
      break;
    }
  }
  self.digits_num = self.digits_num + new_digits | 0;
  if (self.digits_num > self.digits.length) {
    self.digits_num = self.digits.length;
  }
  self.decimal_point = self.decimal_point + new_digits | 0;
  _M0MPC28internal7strconv7Decimal4trim(self);
}
function _M0MPC28internal7strconv7Decimal12right__shift(self, s) {
  let read_index = 0;
  let write_index = 0;
  let acc = 0n;
  while (true) {
    if (BigInt.asUintN(64, BigInt.asUintN(64, BigInt.asUintN(64, acc) >> BigInt(s & 63))) === BigInt.asUintN(64, 0n)) {
      if (read_index >= self.digits_num) {
        while (true) {
          if (BigInt.asUintN(64, BigInt.asUintN(64, BigInt.asUintN(64, acc) >> BigInt(s & 63))) === BigInt.asUintN(64, 0n)) {
            acc = BigInt.asUintN(64, acc * 10n);
            read_index = read_index + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        break;
      }
      const _tmp = self.digits;
      const _tmp$2 = read_index;
      $bound_check(_tmp, _tmp$2);
      const d = _tmp[_tmp$2];
      acc = BigInt.asUintN(64, BigInt.asUintN(64, acc * 10n) + BigInt.asUintN(64, BigInt(d)));
      read_index = read_index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  self.decimal_point = self.decimal_point - (read_index - 1 | 0) | 0;
  const mask = BigInt.asUintN(64, BigInt.asUintN(64, 1n << BigInt(s & 63)) - 1n);
  while (true) {
    if (read_index < self.digits_num) {
      const out = BigInt.asUintN(64, BigInt.asUintN(64, acc) >> BigInt(s & 63));
      const _tmp = self.digits;
      const _tmp$2 = write_index;
      $bound_check(_tmp, _tmp$2);
      _tmp[_tmp$2] = (Number(BigInt.asIntN(32, out)) | 0) & 255;
      write_index = write_index + 1 | 0;
      acc = BigInt.asUintN(64, acc & mask);
      const _tmp$3 = self.digits;
      const _tmp$4 = read_index;
      $bound_check(_tmp$3, _tmp$4);
      const d = _tmp$3[_tmp$4];
      acc = BigInt.asUintN(64, BigInt.asUintN(64, acc * 10n) + BigInt.asUintN(64, BigInt(d)));
      read_index = read_index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  while (true) {
    if (BigInt.asUintN(64, acc) > BigInt.asUintN(64, 0n)) {
      const out = BigInt.asUintN(64, BigInt.asUintN(64, acc) >> BigInt(s & 63));
      if (write_index < self.digits.length) {
        const _tmp = self.digits;
        const _tmp$2 = write_index;
        $bound_check(_tmp, _tmp$2);
        _tmp[_tmp$2] = (Number(BigInt.asIntN(32, out)) | 0) & 255;
        write_index = write_index + 1 | 0;
      } else {
        if (BigInt.asUintN(64, out) > BigInt.asUintN(64, 0n)) {
          self.truncated = true;
        }
      }
      acc = BigInt.asUintN(64, acc & mask);
      acc = BigInt.asUintN(64, acc * 10n);
      continue;
    } else {
      break;
    }
  }
  self.digits_num = write_index;
  _M0MPC28internal7strconv7Decimal4trim(self);
}
function _M0MPC28internal7strconv7Decimal11shift__priv(self, s) {
  if (self.digits_num === 0) {
    return undefined;
  }
  let s$2 = s;
  if (s$2 > 0) {
    while (true) {
      if (s$2 > 59) {
        _M0MPC28internal7strconv7Decimal11left__shift(self, 59);
        s$2 = s$2 - 59 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0MPC28internal7strconv7Decimal11left__shift(self, s$2);
  }
  if (s$2 < 0) {
    while (true) {
      if (s$2 < -59) {
        _M0MPC28internal7strconv7Decimal12right__shift(self, 59);
        s$2 = s$2 + 59 | 0;
        continue;
      } else {
        break;
      }
    }
    _M0MPC28internal7strconv7Decimal12right__shift(self, -s$2 | 0);
    return;
  } else {
    return;
  }
}
function _M0MPC28internal7strconv7Decimal16to__double__priv(self) {
  let exponent = 0;
  let mantissa = 0n;
  if (self.digits_num === 0 || self.decimal_point < -330) {
    mantissa = 0n;
    exponent = _M0FPC28internal7strconv12double__info.bias;
    const bits = _M0FPC28internal7strconv14assemble__bits(mantissa, exponent, self.negative);
    return new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok($i64_reinterpret_f64(bits));
  }
  if (self.decimal_point > 310) {
    const _bind = _M0FPC28internal7strconv10range__errGuE();
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  while (true) {
    if (self.decimal_point > 0) {
      let n = 0;
      if (self.decimal_point >= _M0FPC28internal7strconv6powtab.length) {
        n = 60;
      } else {
        const _p = self.decimal_point;
        $bound_check(_M0FPC28internal7strconv6powtab, _p);
        n = _M0FPC28internal7strconv6powtab[_p];
      }
      _M0MPC28internal7strconv7Decimal11shift__priv(self, -n | 0);
      exponent = exponent + n | 0;
      continue;
    } else {
      break;
    }
  }
  while (true) {
    let _tmp;
    if (self.decimal_point < 0) {
      _tmp = true;
    } else {
      let _tmp$2;
      if (self.decimal_point === 0) {
        const _tmp$3 = self.digits;
        $bound_check(_tmp$3, 0);
        _tmp$2 = _tmp$3[0] < 5;
      } else {
        _tmp$2 = false;
      }
      _tmp = _tmp$2;
    }
    if (_tmp) {
      let n = 0;
      if ((-self.decimal_point | 0) >= _M0FPC28internal7strconv6powtab.length) {
        n = 60;
      } else {
        const _p = -self.decimal_point | 0;
        $bound_check(_M0FPC28internal7strconv6powtab, _p);
        n = _M0FPC28internal7strconv6powtab[_p];
      }
      _M0MPC28internal7strconv7Decimal11shift__priv(self, n);
      exponent = exponent - n | 0;
      continue;
    } else {
      break;
    }
  }
  exponent = exponent - 1 | 0;
  if (exponent < (_M0FPC28internal7strconv12double__info.bias + 1 | 0)) {
    const n = (_M0FPC28internal7strconv12double__info.bias + 1 | 0) - exponent | 0;
    _M0MPC28internal7strconv7Decimal11shift__priv(self, -n | 0);
    exponent = exponent + n | 0;
  }
  if ((exponent - _M0FPC28internal7strconv12double__info.bias | 0) >= ((1 << _M0FPC28internal7strconv12double__info.exponent_bits) - 1 | 0)) {
    const _bind = _M0FPC28internal7strconv10range__errGuE();
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  _M0MPC28internal7strconv7Decimal11shift__priv(self, _M0FPC28internal7strconv12double__info.mantissa_bits + 1 | 0);
  mantissa = _M0MPC28internal7strconv7Decimal16rounded__integer(self);
  if (BigInt.asUintN(64, mantissa) === BigInt.asUintN(64, BigInt.asUintN(64, 2n << BigInt(_M0FPC28internal7strconv12double__info.mantissa_bits & 63)))) {
    mantissa = BigInt.asUintN(64, BigInt.asIntN(64, mantissa) >> BigInt(1 & 63));
    exponent = exponent + 1 | 0;
    if ((exponent - _M0FPC28internal7strconv12double__info.bias | 0) >= ((1 << _M0FPC28internal7strconv12double__info.exponent_bits) - 1 | 0)) {
      const _bind = _M0FPC28internal7strconv10range__errGuE();
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _ok._0;
      } else {
        return _bind;
      }
    }
  }
  if (BigInt.asUintN(64, BigInt.asUintN(64, mantissa & BigInt.asUintN(64, 1n << BigInt(_M0FPC28internal7strconv12double__info.mantissa_bits & 63)))) === BigInt.asUintN(64, 0n)) {
    exponent = _M0FPC28internal7strconv12double__info.bias;
  }
  const bits = _M0FPC28internal7strconv14assemble__bits(mantissa, exponent, self.negative);
  return new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok($i64_reinterpret_f64(bits));
}
function _M0FPC28internal7strconv17pow10__fast__path(exponent) {
  const _p = exponent & 31;
  $bound_check(_M0FPC28internal7strconv5table, _p);
  return _M0FPC28internal7strconv5table[_p];
}
function _M0MPC28internal7strconv6Number14is__fast__path(self) {
  return BigInt.asIntN(64, _M0FPC28internal7strconv25min__exponent__fast__path) <= BigInt.asIntN(64, self.exponent) && (BigInt.asIntN(64, self.exponent) <= BigInt.asIntN(64, _M0FPC28internal7strconv36max__exponent__disguised__fast__path) && (BigInt.asUintN(64, self.mantissa) <= BigInt.asUintN(64, _M0FPC28internal7strconv25max__mantissa__fast__path) && !self.many_digits));
}
function _M0MPC28internal7strconv6Number15try__fast__path(self) {
  if (_M0MPC28internal7strconv6Number14is__fast__path(self)) {
    let value;
    if (BigInt.asIntN(64, self.exponent) <= BigInt.asIntN(64, _M0FPC28internal7strconv25max__exponent__fast__path)) {
      const value$2 = $f64_convert_i64_u(BigInt.asUintN(64, self.mantissa));
      value = BigInt.asIntN(64, self.exponent) < BigInt.asIntN(64, 0n) ? value$2 / _M0FPC28internal7strconv17pow10__fast__path(-(Number(BigInt.asIntN(32, self.exponent)) | 0) | 0) : value$2 * _M0FPC28internal7strconv17pow10__fast__path(Number(BigInt.asIntN(32, self.exponent)) | 0);
    } else {
      const shift = BigInt.asUintN(64, self.exponent - _M0FPC28internal7strconv25max__exponent__fast__path);
      const _tmp = self.mantissa;
      const _p = Number(BigInt.asIntN(32, shift)) | 0;
      $bound_check(_M0FPC28internal7strconv10int__pow10, _p);
      const _bind = _M0FPC28internal7strconv12checked__mul(_tmp, _M0FPC28internal7strconv10int__pow10[_p]);
      let mantissa;
      if (_bind === undefined) {
        return _M0DTPC16option6OptionGdE4None__;
      } else {
        const _Some = _bind;
        mantissa = _Some;
      }
      if (BigInt.asUintN(64, mantissa) > BigInt.asUintN(64, _M0FPC28internal7strconv25max__mantissa__fast__path)) {
        return _M0DTPC16option6OptionGdE4None__;
      }
      value = $f64_convert_i64_u(BigInt.asUintN(64, mantissa)) * _M0FPC28internal7strconv17pow10__fast__path(Number(BigInt.asIntN(32, _M0FPC28internal7strconv25max__exponent__fast__path)) | 0);
    }
    if (self.negative) {
      value = -value;
    }
    return new _M0DTPC16option6OptionGdE4Some(value);
  } else {
    return _M0DTPC16option6OptionGdE4None__;
  }
}
function _M0FPC28internal7strconv13parse__double(str) {
  if ((str.end - str.start | 0) > 0) {
    if (_M0FPC28internal7strconv17check__underscore(str)) {
      const _bind = _M0FPC28internal7strconv13parse__number(str);
      let _bind$2;
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _bind$2 = _ok._0;
      } else {
        return _bind;
      }
      if (_bind$2 === undefined) {
        return _M0FPC28internal7strconv15parse__inf__nan(str);
      } else {
        const _Some = _bind$2;
        const _num = _Some;
        const _bind$3 = _M0MPC28internal7strconv6Number15try__fast__path(_num);
        if (_bind$3.$tag === 1) {
          const _Some$2 = _bind$3;
          const _value = _Some$2._0;
          return new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(_value);
        } else {
          const _bind$4 = _M0FPC28internal7strconv20parse__decimal__priv(str);
          let _tmp;
          if (_bind$4.$tag === 1) {
            const _ok = _bind$4;
            _tmp = _ok._0;
          } else {
            return _bind$4;
          }
          return _M0MPC28internal7strconv7Decimal16to__double__priv(_tmp);
        }
      }
    } else {
      return _M0FPC28internal7strconv11syntax__errGdE();
    }
  } else {
    return _M0FPC28internal7strconv11syntax__errGdE();
  }
}
function _M0FPC14json20offset__to__position(input, offset) {
  let _tmp = 0;
  let _tmp$2 = 1;
  let _tmp$3 = 0;
  while (true) {
    const i = _tmp;
    const line = _tmp$2;
    const column = _tmp$3;
    if (i < offset) {
      const _p = input.str.charCodeAt(input.start + i | 0);
      const _p$2 = 10;
      if (_p === _p$2) {
        _tmp = i + 1 | 0;
        _tmp$2 = line + 1 | 0;
        _tmp$3 = 0;
        continue;
      } else {
        _tmp = i + 1 | 0;
        _tmp$3 = column + 1 | 0;
        continue;
      }
    } else {
      return new _M0TPC14json8Position(line, column);
    }
  }
}
function _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, shift) {
  const offset = ctx.offset + shift | 0;
  const _p = _M0MPC16string10StringView9get__char(ctx.input, offset);
  const _p$2 = 65533;
  return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE3Err(new _M0DTPC15error5Error52moonbitlang_2fcore_2fjson_2eParseError_2eInvalidChar(_M0FPC14json20offset__to__position(ctx.input, offset), _p === -1 ? _p$2 : _p));
}
function _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, shift) {
  const offset = ctx.offset + shift | 0;
  const _p = _M0MPC16string10StringView9get__char(ctx.input, offset);
  const _p$2 = 65533;
  return new _M0DTPC16result6ResultGuRPC14json10ParseErrorE3Err(new _M0DTPC15error5Error52moonbitlang_2fcore_2fjson_2eParseError_2eInvalidChar(_M0FPC14json20offset__to__position(ctx.input, offset), _p === -1 ? _p$2 : _p));
}
function _M0MPC14json12ParseContext21lex__skip__whitespace(ctx) {
  const rest = _M0MPC16string10StringView12view_2einner(ctx.input, ctx.offset, ctx.end_offset);
  const _data = rest.str;
  const _start = rest.start;
  const _end = _start + (rest.end - rest.start | 0) | 0;
  let _cursor = _start;
  let accept_state = -1;
  let match_end = -1;
  _L: {
    if (_cursor < _end) {
      _L$2: {
        const _p = _cursor;
        const next_char = _data.charCodeAt(_p);
        _cursor = _cursor + 1 | 0;
        if (next_char < 13) {
          if (next_char >= 9 && next_char <= 10) {
            break _L$2;
          } else {
            break _L;
          }
        } else {
          if (next_char > 13) {
            if (next_char === 32) {
              break _L$2;
            } else {
              break _L;
            }
          } else {
            break _L$2;
          }
        }
      }
      while (true) {
        accept_state = 0;
        match_end = _cursor;
        if (_cursor < _end) {
          _L$3: {
            const _p = _cursor;
            const next_char = _data.charCodeAt(_p);
            _cursor = _cursor + 1 | 0;
            if (next_char < 13) {
              if (next_char >= 9 && next_char <= 10) {
                break _L$3;
              } else {
                break _L;
              }
            } else {
              if (next_char > 13) {
                if (next_char === 32) {
                  break _L$3;
                } else {
                  break _L;
                }
              } else {
                break _L$3;
              }
            }
          }
          continue;
        } else {
          break _L;
        }
      }
    } else {
      break _L;
    }
  }
  if (accept_state === 0) {
    const next = _M0MPC16string6String4view(_data, match_end, _end);
    ctx.offset = ctx.end_offset - (next.end - next.start | 0) | 0;
    return;
  } else {
    return;
  }
}
function _M0MPC14json12ParseContext4make(input, max_nesting_depth) {
  return new _M0TPC14json12ParseContext(0, input, input.end - input.start | 0, max_nesting_depth);
}
function _M0MPC14json12ParseContext19expect__ascii__char(ctx, c) {
  if (ctx.offset < ctx.end_offset) {
    const _p = ctx.input;
    const _p$2 = ctx.offset;
    const c1 = _p.str.charCodeAt(_p.start + _p$2 | 0);
    ctx.offset = ctx.offset + 1 | 0;
    return c !== c1 ? _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1) : new _M0DTPC16result6ResultGuRPC14json10ParseErrorE2Ok(undefined);
  } else {
    return new _M0DTPC16result6ResultGuRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  }
}
function _M0MPC14json12ParseContext16lex__number__end(ctx, start, end) {
  const s = _M0MPC16string10StringView12view_2einner(ctx.input, start, end);
  if (!_M0MPC16string10StringView8contains(s, new _M0TPC16string10StringView(_M0MPC14json12ParseContext16lex__number__endN7_2abindS1089, 0, _M0MPC14json12ParseContext16lex__number__endN7_2abindS1089.length)) && (!_M0MPC16string10StringView8contains(s, new _M0TPC16string10StringView(_M0MPC14json12ParseContext16lex__number__endN7_2abindS1090, 0, _M0MPC14json12ParseContext16lex__number__endN7_2abindS1090.length)) && !_M0MPC16string10StringView8contains(s, new _M0TPC16string10StringView(_M0MPC14json12ParseContext16lex__number__endN7_2abindS1091, 0, _M0MPC14json12ParseContext16lex__number__endN7_2abindS1091.length)))) {
    let parsed_int;
    let _try_err;
    _L: {
      _L$2: {
        const _bind = _M0FPC28internal7strconv20parse__int64_2einner(s, 0);
        let _tmp;
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _tmp = _ok._0;
        } else {
          const _err = _bind;
          _try_err = _err._0;
          break _L$2;
        }
        parsed_int = new _M0DTPC16result6ResultGlRPC15error5ErrorE2Ok(_tmp);
        break _L;
      }
      parsed_int = new _M0DTPC16result6ResultGlRPC15error5ErrorE3Err(_try_err);
    }
    _L$2: {
      if (parsed_int.$tag === 1) {
        const _Ok = parsed_int;
        const _i = _Ok._0;
        if (BigInt.asIntN(64, _i) <= BigInt.asIntN(64, 9007199254740991n) && BigInt.asIntN(64, _i) >= BigInt.asIntN(64, 18437736874454810625n)) {
          return { _0: $f64_convert_i64(BigInt.asIntN(64, _i)), _1: undefined };
        } else {
          break _L$2;
        }
      } else {
        break _L$2;
      }
    }
    _L$3: {
      if (_M0MPC16string6String24char__length__ge_2einner(s.str, 1, s.start, s.end)) {
        const _x = _M0MPC16string6String16unsafe__char__at(s.str, _M0MPC16string6String29offset__of__nth__char_2einner(s.str, 0, s.start, s.end));
        if (_x === 45) {
          return { _0: _M0FPC16double13neg__infinity, _1: s };
        } else {
          break _L$3;
        }
      } else {
        break _L$3;
      }
    }
    return { _0: _M0FPC16double8infinity, _1: s };
  } else {
    let parsed_double;
    let _try_err;
    _L: {
      _L$2: {
        const _bind = _M0FPC28internal7strconv13parse__double(s);
        let _tmp;
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _tmp = _ok._0;
        } else {
          const _err = _bind;
          _try_err = _err._0;
          break _L$2;
        }
        parsed_double = new _M0DTPC16result6ResultGdRPC15error5ErrorE2Ok(_tmp);
        break _L;
      }
      parsed_double = new _M0DTPC16result6ResultGdRPC15error5ErrorE3Err(_try_err);
    }
    if (parsed_double.$tag === 1) {
      const _Ok = parsed_double;
      const _d = _Ok._0;
      return { _0: _d, _1: undefined };
    } else {
      _L$2: {
        if (_M0MPC16string6String24char__length__ge_2einner(s.str, 1, s.start, s.end)) {
          const _x = _M0MPC16string6String16unsafe__char__at(s.str, _M0MPC16string6String29offset__of__nth__char_2einner(s.str, 0, s.start, s.end));
          if (_x === 45) {
            return { _0: _M0FPC16double13neg__infinity, _1: s };
          } else {
            break _L$2;
          }
        } else {
          break _L$2;
        }
      }
      return { _0: _M0FPC16double8infinity, _1: s };
    }
  }
}
function _M0MPC14json12ParseContext10read__char(ctx) {
  if (ctx.offset < ctx.end_offset) {
    const _p = ctx.input;
    const _p$2 = ctx.offset;
    const c1 = _p.str.charCodeAt(_p.start + _p$2 | 0);
    ctx.offset = ctx.offset + 1 | 0;
    if (c1 >= 55296 && c1 <= 56319) {
      if (ctx.offset < ctx.end_offset) {
        const _p$3 = ctx.input;
        const _p$4 = ctx.offset;
        const c2 = _p$3.str.charCodeAt(_p$3.start + _p$4 | 0);
        if (c2 >= 56320 && c2 <= 57343) {
          ctx.offset = ctx.offset + 1 | 0;
          const c3 = ((c1 << 10) + c2 | 0) - 56613888 | 0;
          return c3;
        }
      }
    }
    return c1;
  } else {
    return -1;
  }
}
function _M0MPC14json12ParseContext31lex__decimal__exponent__integer(ctx, start) {
  while (true) {
    const _bind = _M0MPC14json12ParseContext10read__char(ctx);
    if (_bind === -1) {
      return _M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset);
    } else {
      const _Some = _bind;
      const _c = _Some;
      if (_c >= 48 && _c <= 57) {
        continue;
      }
      ctx.offset = ctx.offset - 1 | 0;
      return _M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset);
    }
  }
}
function _M0MPC14json12ParseContext28lex__decimal__exponent__sign(ctx, start) {
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _c = _Some;
    if (_c >= 48 && _c <= 57) {
      return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext31lex__decimal__exponent__integer(ctx, start));
    }
    ctx.offset = ctx.offset - 1 | 0;
    return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, 0);
  }
}
function _M0MPC14json12ParseContext22lex__decimal__exponent(ctx, start) {
  _L: {
    const _bind = _M0MPC14json12ParseContext10read__char(ctx);
    if (_bind === -1) {
      return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
    } else {
      const _Some = _bind;
      const _x = _Some;
      switch (_x) {
        case 43: {
          break _L;
        }
        case 45: {
          break _L;
        }
        default: {
          if (_x >= 48 && _x <= 57) {
            return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext31lex__decimal__exponent__integer(ctx, start));
          }
          ctx.offset = ctx.offset - 1 | 0;
          return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, 0);
        }
      }
    }
  }
  const _bind = _M0MPC14json12ParseContext28lex__decimal__exponent__sign(ctx, start);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp);
}
function _M0MPC14json12ParseContext22lex__decimal__fraction(ctx, start) {
  let _tmp;
  _L: while (true) {
    _L$2: {
      const _bind = _M0MPC14json12ParseContext10read__char(ctx);
      if (_bind === -1) {
        return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
      } else {
        const _Some = _bind;
        const _x = _Some;
        switch (_x) {
          case 101: {
            break _L$2;
          }
          case 69: {
            break _L$2;
          }
          default: {
            if (_x >= 48 && _x <= 57) {
              continue _L;
            }
            ctx.offset = ctx.offset - 1 | 0;
            return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
          }
        }
      }
    }
    const _bind = _M0MPC14json12ParseContext22lex__decimal__exponent(ctx, start);
    let _tmp$2;
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _tmp$2 = _ok._0;
    } else {
      return _bind;
    }
    return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp$2);
  }
  return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp);
}
function _M0MPC14json12ParseContext19lex__decimal__point(ctx, start) {
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _c = _Some;
    return _c >= 48 && _c <= 57 ? _M0MPC14json12ParseContext22lex__decimal__fraction(ctx, start) : _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
  }
}
function _M0MPC14json12ParseContext21lex__decimal__integer(ctx, start) {
  let _tmp;
  _L: while (true) {
    _L$2: {
      const _bind = _M0MPC14json12ParseContext10read__char(ctx);
      if (_bind === -1) {
        return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
      } else {
        const _Some = _bind;
        const _x = _Some;
        switch (_x) {
          case 46: {
            const _bind$2 = _M0MPC14json12ParseContext19lex__decimal__point(ctx, start);
            let _tmp$2;
            if (_bind$2.$tag === 1) {
              const _ok = _bind$2;
              _tmp$2 = _ok._0;
            } else {
              return _bind$2;
            }
            return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp$2);
          }
          case 101: {
            break _L$2;
          }
          case 69: {
            break _L$2;
          }
          default: {
            if (_x >= 48 && _x <= 57) {
              continue _L;
            }
            ctx.offset = ctx.offset - 1 | 0;
            return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
          }
        }
      }
    }
    const _bind = _M0MPC14json12ParseContext22lex__decimal__exponent(ctx, start);
    let _tmp$2;
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _tmp$2 = _ok._0;
    } else {
      return _bind;
    }
    return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp$2);
  }
  return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_tmp);
}
function _M0MPC14json12ParseContext16lex__hex__digits(ctx, n) {
  let _tmp;
  let _tmp$2 = 0;
  let _tmp$3 = 0;
  while (true) {
    const _ = _tmp$2;
    const r = _tmp$3;
    if (_ < n) {
      const _bind = _M0MPC14json12ParseContext10read__char(ctx);
      if (_bind === -1) {
        return new _M0DTPC16result6ResultGiRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
      } else {
        const _Some = _bind;
        const _c = _Some;
        if (_c >= 65) {
          const d = ((_c & ~32) - 65 | 0) + 10 | 0;
          if (d > 15) {
            const _bind$2 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
            if (_bind$2.$tag === 1) {
              const _ok = _bind$2;
              _ok._0;
            } else {
              return _bind$2;
            }
          }
          _tmp$2 = _ + 1 | 0;
          _tmp$3 = r << 4 | d;
          continue;
        } else {
          if (_c >= 48) {
            const d = _c - 48 | 0;
            if (d > 9) {
              const _bind$2 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
              if (_bind$2.$tag === 1) {
                const _ok = _bind$2;
                _ok._0;
              } else {
                return _bind$2;
              }
            }
            _tmp$2 = _ + 1 | 0;
            _tmp$3 = r << 4 | d;
            continue;
          } else {
            const _bind$2 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
            if (_bind$2.$tag === 1) {
              const _ok = _bind$2;
              _ok._0;
            } else {
              return _bind$2;
            }
          }
        }
      }
      _tmp$2 = _ + 1 | 0;
      continue;
    } else {
      _tmp = r;
      break;
    }
  }
  return new _M0DTPC16result6ResultGiRPC14json10ParseErrorE2Ok(_tmp);
}
function _M0MPC14json12ParseContext11lex__stringN5flushS276(_env, end) {
  const ctx = _env._2;
  const start = _env._1;
  const buf = _env._0;
  if (start.val > 0 && end > start.val) {
    _M0IPB13StringBuilderPB6Logger11write__view(buf, _M0MPC16string10StringView11sub_2einner(ctx.input, start.val, end));
    return;
  } else {
    return;
  }
}
function _M0MPC14json12ParseContext11lex__string(ctx) {
  const buf = _M0MPB13StringBuilder11new_2einner(0);
  const start = new _M0TPB8MutLocalGiE(ctx.offset);
  const _env = { _0: buf, _1: start, _2: ctx };
  _L: while (true) {
    _L$2: {
      _L$3: {
        const _bind = _M0MPC14json12ParseContext10read__char(ctx);
        if (_bind === -1) {
          return new _M0DTPC16result6ResultGsRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
        } else {
          const _Some = _bind;
          const _x = _Some;
          switch (_x) {
            case 34: {
              _M0MPC14json12ParseContext11lex__stringN5flushS276(_env, ctx.offset - 1 | 0);
              break _L;
            }
            case 10: {
              break _L$3;
            }
            case 13: {
              break _L$3;
            }
            case 92: {
              _M0MPC14json12ParseContext11lex__stringN5flushS276(_env, ctx.offset - 1 | 0);
              const _bind$2 = _M0MPC14json12ParseContext10read__char(ctx);
              if (_bind$2 === -1) {
                return new _M0DTPC16result6ResultGsRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
              } else {
                const _Some$2 = _bind$2;
                const _x$2 = _Some$2;
                switch (_x$2) {
                  case 98: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 8);
                    break;
                  }
                  case 102: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 12);
                    break;
                  }
                  case 110: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 10);
                    break;
                  }
                  case 114: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 13);
                    break;
                  }
                  case 116: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 9);
                    break;
                  }
                  case 34: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 34);
                    break;
                  }
                  case 92: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 92);
                    break;
                  }
                  case 47: {
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, 47);
                    break;
                  }
                  case 117: {
                    const _bind$3 = _M0MPC14json12ParseContext16lex__hex__digits(ctx, 4);
                    let c;
                    if (_bind$3.$tag === 1) {
                      const _ok = _bind$3;
                      c = _ok._0;
                    } else {
                      return _bind$3;
                    }
                    _M0IPB13StringBuilderPB6Logger11write__char(buf, c);
                    break;
                  }
                  default: {
                    const _bind$4 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
                    if (_bind$4.$tag === 1) {
                      const _ok = _bind$4;
                      _ok._0;
                    } else {
                      return _bind$4;
                    }
                  }
                }
              }
              start.val = ctx.offset;
              break;
            }
            default: {
              if (_x < 32) {
                const _bind$3 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  _ok._0;
                } else {
                  return _bind$3;
                }
              } else {
                continue _L;
              }
            }
          }
        }
        break _L$2;
      }
      const _bind = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _ok._0;
      } else {
        return _bind;
      }
    }
    continue;
  }
  return new _M0DTPC16result6ResultGsRPC14json10ParseErrorE2Ok(buf.val);
}
function _M0MPC14json12ParseContext9lex__zero(ctx, start) {
  _L: {
    const _bind = _M0MPC14json12ParseContext10read__char(ctx);
    if (_bind === -1) {
      return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
    } else {
      const _Some = _bind;
      const _x = _Some;
      switch (_x) {
        case 46: {
          return _M0MPC14json12ParseContext19lex__decimal__point(ctx, start);
        }
        case 101: {
          break _L;
        }
        case 69: {
          break _L;
        }
        default: {
          if (_x >= 48 && _x <= 57) {
            ctx.offset = ctx.offset - 1 | 0;
            const _bind$2 = _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, 0);
            if (_bind$2.$tag === 1) {
              const _ok = _bind$2;
              _ok._0;
            } else {
              return _bind$2;
            }
          }
          ctx.offset = ctx.offset - 1 | 0;
          return new _M0DTPC16result6ResultGUdORPC16string10StringViewERPC14json10ParseErrorE2Ok(_M0MPC14json12ParseContext16lex__number__end(ctx, start, ctx.offset));
        }
      }
    }
  }
  return _M0MPC14json12ParseContext22lex__decimal__exponent(ctx, start);
}
function _M0MPC14json12ParseContext10lex__value(ctx, allow_rbracket) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x === 123) {
      return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token6LBrace__);
    } else {
      if (_x === 91) {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token8LBracket__);
      } else {
        if (_x === 93) {
          if (allow_rbracket) {
            return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token8RBracket__);
          } else {
            return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
          }
        } else {
          if (_x === 110) {
            const _bind$2 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 117);
            if (_bind$2.$tag === 1) {
              const _ok = _bind$2;
              _ok._0;
            } else {
              return _bind$2;
            }
            const _bind$3 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 108);
            if (_bind$3.$tag === 1) {
              const _ok = _bind$3;
              _ok._0;
            } else {
              return _bind$3;
            }
            const _bind$4 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 108);
            if (_bind$4.$tag === 1) {
              const _ok = _bind$4;
              _ok._0;
            } else {
              return _bind$4;
            }
            return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token4Null__);
          } else {
            if (_x === 116) {
              const _bind$2 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 114);
              if (_bind$2.$tag === 1) {
                const _ok = _bind$2;
                _ok._0;
              } else {
                return _bind$2;
              }
              const _bind$3 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 117);
              if (_bind$3.$tag === 1) {
                const _ok = _bind$3;
                _ok._0;
              } else {
                return _bind$3;
              }
              const _bind$4 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 101);
              if (_bind$4.$tag === 1) {
                const _ok = _bind$4;
                _ok._0;
              } else {
                return _bind$4;
              }
              return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token4True__);
            } else {
              if (_x === 102) {
                const _bind$2 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 97);
                if (_bind$2.$tag === 1) {
                  const _ok = _bind$2;
                  _ok._0;
                } else {
                  return _bind$2;
                }
                const _bind$3 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 108);
                if (_bind$3.$tag === 1) {
                  const _ok = _bind$3;
                  _ok._0;
                } else {
                  return _bind$3;
                }
                const _bind$4 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 115);
                if (_bind$4.$tag === 1) {
                  const _ok = _bind$4;
                  _ok._0;
                } else {
                  return _bind$4;
                }
                const _bind$5 = _M0MPC14json12ParseContext19expect__ascii__char(ctx, 101);
                if (_bind$5.$tag === 1) {
                  const _ok = _bind$5;
                  _ok._0;
                } else {
                  return _bind$5;
                }
                return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token5False__);
              } else {
                if (_x === 45) {
                  const _bind$2 = _M0MPC14json12ParseContext10read__char(ctx);
                  if (_bind$2 === -1) {
                    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
                  } else {
                    const _Some$2 = _bind$2;
                    const _x$2 = _Some$2;
                    if (_x$2 === 48) {
                      const _bind$3 = _M0MPC14json12ParseContext9lex__zero(ctx, ctx.offset - 2 | 0);
                      let _bind$4;
                      if (_bind$3.$tag === 1) {
                        const _ok = _bind$3;
                        _bind$4 = _ok._0;
                      } else {
                        return _bind$3;
                      }
                      const _n = _bind$4._0;
                      const _repr = _bind$4._1;
                      return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6Number(_n, _M0MPC16option6Option3mapGRPC16string10StringViewsE(_repr, (repr) => _M0MPC16string10StringView9to__owned(repr))));
                    } else {
                      if (_x$2 >= 49 && _x$2 <= 57) {
                        const _bind$3 = _M0MPC14json12ParseContext21lex__decimal__integer(ctx, ctx.offset - 2 | 0);
                        let _bind$4;
                        if (_bind$3.$tag === 1) {
                          const _ok = _bind$3;
                          _bind$4 = _ok._0;
                        } else {
                          return _bind$3;
                        }
                        const _n = _bind$4._0;
                        const _repr = _bind$4._1;
                        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6Number(_n, _M0MPC16option6Option3mapGRPC16string10StringViewsE(_repr, (repr) => _M0MPC16string10StringView9to__owned(repr))));
                      }
                      return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
                    }
                  }
                } else {
                  if (_x === 48) {
                    const _bind$2 = _M0MPC14json12ParseContext9lex__zero(ctx, ctx.offset - 1 | 0);
                    let _bind$3;
                    if (_bind$2.$tag === 1) {
                      const _ok = _bind$2;
                      _bind$3 = _ok._0;
                    } else {
                      return _bind$2;
                    }
                    const _n = _bind$3._0;
                    const _repr = _bind$3._1;
                    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6Number(_n, _M0MPC16option6Option3mapGRPC16string10StringViewsE(_repr, (repr) => _M0MPC16string10StringView9to__owned(repr))));
                  } else {
                    if (_x >= 49 && _x <= 57) {
                      const _bind$2 = _M0MPC14json12ParseContext21lex__decimal__integer(ctx, ctx.offset - 1 | 0);
                      let _bind$3;
                      if (_bind$2.$tag === 1) {
                        const _ok = _bind$2;
                        _bind$3 = _ok._0;
                      } else {
                        return _bind$2;
                      }
                      const _n = _bind$3._0;
                      const _repr = _bind$3._1;
                      return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6Number(_n, _M0MPC16option6Option3mapGRPC16string10StringViewsE(_repr, (repr) => _M0MPC16string10StringView9to__owned(repr))));
                    } else {
                      if (_x === 34) {
                        const _bind$2 = _M0MPC14json12ParseContext11lex__string(ctx);
                        let s;
                        if (_bind$2.$tag === 1) {
                          const _ok = _bind$2;
                          s = _ok._0;
                        } else {
                          return _bind$2;
                        }
                        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6String(s));
                      } else {
                        const _p = _x;
                        const shift = -(_p <= 65535 ? 1 : 2) | 0;
                        return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, shift);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
function _M0MPC14json12ParseContext24lex__after__array__value(ctx) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    switch (_x) {
      case 93: {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token8RBracket__);
      }
      case 44: {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token5Comma__);
      }
      default: {
        return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
      }
    }
  }
}
function _M0MPC14json12ParseContext25lex__after__object__value(ctx) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    switch (_x) {
      case 125: {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token6RBrace__);
      }
      case 44: {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token5Comma__);
      }
      default: {
        return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
      }
    }
  }
}
function _M0MPC14json12ParseContext26lex__after__property__name(ctx) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGuRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x === 58) {
      return new _M0DTPC16result6ResultGuRPC14json10ParseErrorE2Ok(undefined);
    } else {
      return _M0MPC14json12ParseContext21invalid__char_2einnerGuE(ctx, -1);
    }
  }
}
function _M0MPC14json12ParseContext19lex__property__name(ctx) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    switch (_x) {
      case 125: {
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(_M0DTPC14json5Token6RBrace__);
      }
      case 34: {
        const _bind$2 = _M0MPC14json12ParseContext11lex__string(ctx);
        let s;
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          s = _ok._0;
        } else {
          return _bind$2;
        }
        return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6String(s));
      }
      default: {
        return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
      }
    }
  }
}
function _M0MPC14json12ParseContext20lex__property__name2(ctx) {
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  const _bind = _M0MPC14json12ParseContext10read__char(ctx);
  if (_bind === -1) {
    return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE3Err(_M0DTPC15error5Error51moonbitlang_2fcore_2fjson_2eParseError_2eInvalidEof__);
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x === 34) {
      const _bind$2 = _M0MPC14json12ParseContext11lex__string(ctx);
      let s;
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        s = _ok._0;
      } else {
        return _bind$2;
      }
      return new _M0DTPC16result6ResultGRPC14json5TokenRPC14json10ParseErrorE2Ok(new _M0DTPC14json5Token6String(s));
    } else {
      return _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, -1);
    }
  }
}
function _M0MPC14json12ParseContext12parse__value(ctx) {
  const _bind = _M0MPC14json12ParseContext10lex__value(ctx, false);
  let tok;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    tok = _ok._0;
  } else {
    return _bind;
  }
  return _M0MPC14json12ParseContext13parse__value2(ctx, tok);
}
function _M0MPC14json12ParseContext13parse__value2(ctx, tok) {
  _L: {
    switch (tok.$tag) {
      case 0: {
        return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_M0FPB4null);
      }
      case 1: {
        const _p = true;
        return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__);
      }
      case 2: {
        const _p$2 = false;
        return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_p$2 ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__);
      }
      case 3: {
        const _Number = tok;
        const _n = _Number._0;
        const _repr = _Number._1;
        return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(new _M0DTPB4Json6Number(_n, _repr));
      }
      case 4: {
        const _String = tok;
        const _s = _String._0;
        return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(new _M0DTPB4Json6String(_s));
      }
      case 5: {
        return _M0MPC14json12ParseContext13parse__object(ctx);
      }
      case 7: {
        return _M0MPC14json12ParseContext12parse__array(ctx);
      }
      case 8: {
        break _L;
      }
      case 6: {
        break _L;
      }
      default: {
        break _L;
      }
    }
  }
  return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_M0FPC15abort5abortGRPB4JsonE("unreachable"));
}
function _M0MPC14json12ParseContext12parse__array(ctx) {
  if (ctx.remaining_available_depth <= 0) {
    return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE3Err(_M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded__);
  }
  ctx.remaining_available_depth = ctx.remaining_available_depth - 1 | 0;
  const vec = [];
  let _tmp;
  const _bind = _M0MPC14json12ParseContext10lex__value(ctx, true);
  let _tmp$2;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp$2 = _ok._0;
  } else {
    return _bind;
  }
  let _tmp$3 = _tmp$2;
  _L: while (true) {
    const x = _tmp$3;
    if (x.$tag === 8) {
      ctx.remaining_available_depth = ctx.remaining_available_depth + 1 | 0;
      _tmp = new _M0DTPB4Json5Array(vec);
      break;
    } else {
      const _bind$2 = _M0MPC14json12ParseContext13parse__value2(ctx, x);
      let _tmp$4;
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        _tmp$4 = _ok._0;
      } else {
        return _bind$2;
      }
      _M0MPC15array5Array4pushGsE(vec, _tmp$4);
      const _bind$3 = _M0MPC14json12ParseContext24lex__after__array__value(ctx);
      let tok2;
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        tok2 = _ok._0;
      } else {
        return _bind$3;
      }
      switch (tok2.$tag) {
        case 9: {
          const _bind$4 = _M0MPC14json12ParseContext10lex__value(ctx, false);
          if (_bind$4.$tag === 1) {
            const _ok = _bind$4;
            _tmp$3 = _ok._0;
          } else {
            return _bind$4;
          }
          continue _L;
        }
        case 8: {
          ctx.remaining_available_depth = ctx.remaining_available_depth + 1 | 0;
          _tmp = new _M0DTPB4Json5Array(vec);
          break _L;
        }
        default: {
          _M0FPC15abort5abortGuE("unreachable");
        }
      }
    }
    continue;
  }
  return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_tmp);
}
function _M0MPC14json12ParseContext13parse__object(ctx) {
  if (ctx.remaining_available_depth <= 0) {
    return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE3Err(_M0DTPC15error5Error59moonbitlang_2fcore_2fjson_2eParseError_2eDepthLimitExceeded__);
  }
  ctx.remaining_available_depth = ctx.remaining_available_depth - 1 | 0;
  const map = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  let _tmp;
  const _bind = _M0MPC14json12ParseContext19lex__property__name(ctx);
  let _tmp$2;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp$2 = _ok._0;
  } else {
    return _bind;
  }
  let _tmp$3 = _tmp$2;
  _L: while (true) {
    const x = _tmp$3;
    switch (x.$tag) {
      case 6: {
        ctx.remaining_available_depth = ctx.remaining_available_depth + 1 | 0;
        _tmp = new _M0DTPB4Json6Object(map);
        break _L;
      }
      case 4: {
        const _String = x;
        const _name = _String._0;
        const _bind$2 = _M0MPC14json12ParseContext26lex__after__property__name(ctx);
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          _ok._0;
        } else {
          return _bind$2;
        }
        const _bind$3 = _M0MPC14json12ParseContext12parse__value(ctx);
        let _tmp$4;
        if (_bind$3.$tag === 1) {
          const _ok = _bind$3;
          _tmp$4 = _ok._0;
        } else {
          return _bind$3;
        }
        _M0MPB3Map3setGsRPB4JsonE(map, _name, _tmp$4);
        const _bind$4 = _M0MPC14json12ParseContext25lex__after__object__value(ctx);
        let _bind$5;
        if (_bind$4.$tag === 1) {
          const _ok = _bind$4;
          _bind$5 = _ok._0;
        } else {
          return _bind$4;
        }
        switch (_bind$5.$tag) {
          case 9: {
            const _bind$6 = _M0MPC14json12ParseContext20lex__property__name2(ctx);
            if (_bind$6.$tag === 1) {
              const _ok = _bind$6;
              _tmp$3 = _ok._0;
            } else {
              return _bind$6;
            }
            continue _L;
          }
          case 6: {
            ctx.remaining_available_depth = ctx.remaining_available_depth + 1 | 0;
            _tmp = new _M0DTPB4Json6Object(map);
            break _L;
          }
          default: {
            _M0FPC15abort5abortGuE("unreachable");
          }
        }
        break;
      }
      default: {
        _M0FPC15abort5abortGuE("unreachable");
      }
    }
    continue;
  }
  return new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(_tmp);
}
function _M0FPC14json13parse_2einner(input, max_nesting_depth) {
  const ctx = _M0MPC14json12ParseContext4make(input, max_nesting_depth);
  const _bind = _M0MPC14json12ParseContext12parse__value(ctx);
  let val;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    val = _ok._0;
  } else {
    return _bind;
  }
  _M0MPC14json12ParseContext21lex__skip__whitespace(ctx);
  return ctx.offset >= ctx.end_offset ? new _M0DTPC16result6ResultGRPB4JsonRPC14json10ParseErrorE2Ok(val) : _M0MPC14json12ParseContext21invalid__char_2einnerGRPB4JsonE(ctx, 0);
}
function _M0FPC14json6escape(str, escape_slash) {
  const buf = _M0MPB13StringBuilder11new_2einner(str.length);
  const _it = _M0MPC16string6String4iter(str);
  while (true) {
    const _bind = _M0MPB4Iter4nextGcE(_it);
    if (_bind === -1) {
      break;
    } else {
      const _Some = _bind;
      const _c = _Some;
      switch (_c) {
        case 34: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\\"");
          break;
        }
        case 92: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\\\");
          break;
        }
        case 47: {
          if (escape_slash) {
            _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\/");
          } else {
            _M0IPB13StringBuilderPB6Logger11write__char(buf, _c);
          }
          break;
        }
        case 10: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\n");
          break;
        }
        case 13: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\r");
          break;
        }
        case 8: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\b");
          break;
        }
        case 9: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\t");
          break;
        }
        default: {
          const code = _c;
          if (code === 12) {
            _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\f");
          } else {
            if (code < 32) {
              _M0IPB13StringBuilderPB6Logger13write__string(buf, "\\u00");
              _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0MPC14byte4Byte7to__hex(code & 255));
            } else {
              _M0IPB13StringBuilderPB6Logger11write__char(buf, _c);
            }
          }
        }
      }
      continue;
    }
  }
  return buf.val;
}
function _M0FPC14json11indent__str(level, indent) {
  if (indent === 0) {
    return "";
  } else {
    const spaces = Math.imul(indent, level) | 0;
    switch (spaces) {
      case 0: {
        return "\n";
      }
      case 1: {
        return "\n ";
      }
      case 2: {
        return "\n  ";
      }
      case 3: {
        return "\n   ";
      }
      case 4: {
        return "\n    ";
      }
      case 5: {
        return "\n     ";
      }
      case 6: {
        return "\n      ";
      }
      case 7: {
        return "\n       ";
      }
      case 8: {
        return "\n        ";
      }
      default: {
        return `\n${_M0MPC16string6String6repeat(" ", spaces)}`;
      }
    }
  }
}
function _M0MPC14json4Json17stringify_2einner(self, escape_slash, indent, replacer) {
  const buf = _M0MPB13StringBuilder11new_2einner(0);
  const stack = [];
  let depth = 0;
  let _tmp = self;
  while (true) {
    const x = _tmp;
    if (x === undefined) {
      if (stack.length === 0) {
        break;
      } else {
        const _x = stack[stack.length - 1 | 0];
        if (_x.$tag === 0) {
          const _Array = _x;
          const _arr = _Array._0;
          const _i = _Array._1;
          if (_i < _arr.length) {
            const element = _M0MPC15array5Array2atGRPB4JsonE(_arr, _i);
            _Array._1 = _i + 1 | 0;
            if (_i > 0) {
              _M0IPB13StringBuilderPB6Logger11write__char(buf, 44);
              _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            }
            _tmp = element;
            continue;
          } else {
            depth = depth - 1 | 0;
            _M0MPC15array5Array3popGRPC14json10WriteFrameE(stack);
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 93);
            _tmp = undefined;
            continue;
          }
        } else {
          const _Object = _x;
          const _iterator = _Object._0;
          const _first = _Object._1;
          const _bind = _M0MPB4Iter4nextGUsRPB4JsonEE(_iterator);
          if (_bind === undefined) {
            depth = depth - 1 | 0;
            _M0MPC15array5Array3popGRPC14json10WriteFrameE(stack);
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 125);
            _tmp = undefined;
            continue;
          } else {
            const _Some = _bind;
            const _x$2 = _Some;
            const _k = _x$2._0;
            const _v = _x$2._1;
            let v2 = _v;
            if (replacer === undefined) {
            } else {
              const _Some$2 = replacer;
              const _replacer = _Some$2;
              const _func = _replacer.f;
              const _bind$2 = _func(_k, _v);
              if (_bind$2 === undefined) {
                _tmp = undefined;
                continue;
              } else {
                const _Some$3 = _bind$2;
                const _v$2 = _Some$3;
                v2 = _v$2;
              }
            }
            if (!_first) {
              _M0IPB13StringBuilderPB6Logger11write__char(buf, 44);
              _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            }
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 34);
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json6escape(_k, escape_slash));
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 34);
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 58);
            if (indent > 0) {
              _M0IPB13StringBuilderPB6Logger11write__char(buf, 32);
            }
            _Object._1 = false;
            _tmp = v2;
            continue;
          }
        }
      }
    } else {
      const _Some = x;
      const _value = _Some;
      switch (_value.$tag) {
        case 6: {
          const _Object = _value;
          const _members = _Object._0;
          if (_members.size === 0) {
            _M0IPB13StringBuilderPB6Logger13write__string(buf, "{}");
          } else {
            depth = depth + 1 | 0;
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 123);
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            _M0MPC15array5Array4pushGsE(stack, new _M0DTPC14json10WriteFrame6Object(_M0MPB3Map4iterGsRPB4JsonE(_members), true));
          }
          break;
        }
        case 5: {
          const _Array = _value;
          const _arr = _Array._0;
          if (_arr.length === 0) {
            _M0IPB13StringBuilderPB6Logger13write__string(buf, "[]");
          } else {
            depth = depth + 1 | 0;
            _M0IPB13StringBuilderPB6Logger11write__char(buf, 91);
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json11indent__str(depth, indent));
            _M0MPC15array5Array4pushGsE(stack, new _M0DTPC14json10WriteFrame5Array(_arr, 0));
          }
          break;
        }
        case 4: {
          const _String = _value;
          const _s = _String._0;
          _M0IPB13StringBuilderPB6Logger11write__char(buf, 34);
          _M0IPB13StringBuilderPB6Logger13write__string(buf, _M0FPC14json6escape(_s, escape_slash));
          _M0IPB13StringBuilderPB6Logger11write__char(buf, 34);
          break;
        }
        case 3: {
          const _Number = _value;
          const _n = _Number._0;
          const _repr = _Number._1;
          if (_repr === undefined) {
            _M0MPB13StringBuilder13write__objectGdE(buf, _n);
          } else {
            const _Some$2 = _repr;
            const _r = _Some$2;
            _M0IPB13StringBuilderPB6Logger13write__string(buf, _r);
          }
          break;
        }
        case 1: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "true");
          break;
        }
        case 2: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "false");
          break;
        }
        default: {
          _M0IPB13StringBuilderPB6Logger13write__string(buf, "null");
        }
      }
      _tmp = undefined;
      continue;
    }
  }
  return buf.val;
}
function _M0FP38portable8research2io10as__object(value) {
  if (value.$tag === 6) {
    const _Object = value;
    const _fields = _Object._0;
    return new _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE2Ok(_fields);
  } else {
    return new _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("expected JSON object"));
  }
}
function _M0FP38portable8research2io10as__string(value) {
  if (value.$tag === 4) {
    const _String = value;
    const _text = _String._0;
    return new _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE2Ok(_text);
  } else {
    return new _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("expected JSON string"));
  }
}
function _M0FP38portable8research2io5parse(text) {
  let _try_err;
  _L: {
    const _bind = _M0FPC14json13parse_2einner(new _M0TPC16string10StringView(text, 0, text.length), 1024);
    let _tmp;
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _tmp = _ok._0;
    } else {
      const _err = _bind;
      _try_err = _err._0;
      break _L;
    }
    return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE2Ok(_tmp);
  }
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("invalid JSON"));
}
function _M0FP38portable8research2io8required(fields, key) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
  if (_bind === undefined) {
    return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(`missing field ${key}`));
  } else {
    const _Some = _bind;
    const _value = _Some;
    return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE2Ok(_value);
  }
}
function _M0FP38portable8research2io4call(host, request) {
  const _bind = _M0FP38portable8research2io5parse(host(_M0MPC14json4Json17stringify_2einner(request, false, 0, undefined)));
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io10as__object(_tmp);
  let fields;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    fields = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research2io8required(fields, "ok");
  let _bind$4;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _bind$4 = _ok._0;
  } else {
    return _bind$3;
  }
  let ok;
  switch (_bind$4.$tag) {
    case 1: {
      ok = true;
      break;
    }
    case 2: {
      ok = false;
      break;
    }
    default: {
      return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("invalid host reply"));
    }
  }
  if (ok) {
    return _M0FP38portable8research2io8required(fields, "value");
  } else {
    const _bind$5 = _M0MPB3Map3getGsRPB4JsonE(fields, "error");
    let error;
    if (_bind$5 === undefined) {
      error = "host error";
    } else {
      const _Some = _bind$5;
      const _x = _Some;
      if (_x.$tag === 4) {
        const _String = _x;
        error = _String._0;
      } else {
        error = "host error";
      }
    }
    const _bind$6 = _M0MPB3Map3getGsRPB4JsonE(fields, "code");
    let code;
    if (_bind$6 === undefined) {
      code = "";
    } else {
      const _Some = _bind$6;
      const _x = _Some;
      if (_x.$tag === 4) {
        const _String = _x;
        code = _String._0;
      } else {
        code = "";
      }
    }
    return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(code === "" ? error : `${code}: ${error}`));
  }
}
function _M0FP38portable8research2io3one(key, value) {
  const fields = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  _M0MPB3Map3setGsRPB4JsonE(fields, key, value);
  return fields;
}
function _M0FP38portable8research2io7request(op, fields) {
  _M0MPB3Map3setGsRPB4JsonE(fields, "op", new _M0DTPB4Json6String(op));
  return new _M0DTPB4Json6Object(fields);
}
function _M0FP38portable8research2io5print(host, text, stderr) {
  const fields = _M0FP38portable8research2io3one("text", new _M0DTPB4Json6String(text));
  if (stderr) {
    const _p = true;
    _M0MPB3Map3setGsRPB4JsonE(fields, "stderr", _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__);
  }
  const _bind = _M0FP38portable8research2io4call(host, _M0FP38portable8research2io7request("print", fields));
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _ok._0;
  } else {
    return _bind;
  }
  return new _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok(undefined);
}
function _M0FP38portable8research2io9as__array(value) {
  if (value.$tag === 5) {
    const _Array = value;
    const _items = _Array._0;
    return new _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(_items);
  } else {
    return new _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("expected JSON array"));
  }
}
function _M0FP38portable8research2io4failGRPB4JsonE(message) {
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(message));
}
function _M0FP38portable8research2io4failGuE(message) {
  return new _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(message));
}
function _M0FP38portable8research13researchcheck6rejectGRPB4JsonE(code) {
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE3Err(new _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(code));
}
function _M0FP38portable8research13researchcheck6rejectGuE(code) {
  return new _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE3Err(new _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(code));
}
function _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE(code) {
  return new _M0DTPC16result6ResultGRPB5ArrayGcERP38portable8research13researchcheck7InvalidE3Err(new _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(code));
}
function _M0FP38portable8research13researchcheck6rejectGiE(code) {
  return new _M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE3Err(new _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(code));
}
function _M0FP38portable8research13researchcheck6rejectGdE(code) {
  return new _M0DTPC16result6ResultGdRP38portable8research13researchcheck7InvalidE3Err(new _M0DTPC15error5Error55portable_2fresearch_2fresearchcheck_2eInvalid_2eInvalid(code));
}
function _M0FP38portable8research13researchcheck15reject__unknown(fields, allowed) {
  const _bind = _M0MPB3Map9to__arrayGssE(fields);
  const _bind$2 = _bind.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind$2) {
      const pair = _bind[_];
      if (!_M0MPC15array5Array8containsGsE(allowed, pair._0)) {
        const _bind$3 = _M0FP38portable8research13researchcheck6rejectGuE(`unknown_field_${pair._0}`);
        if (_bind$3.$tag === 1) {
          const _ok = _bind$3;
          _ok._0;
        } else {
          return _bind$3;
        }
      }
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE2Ok(undefined);
}
function _M0FP38portable8research13researchcheck7as__str(value) {
  if (value.$tag === 4) {
    const _String = value;
    const _text = _String._0;
    return new _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(_text);
  } else {
    return _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("expected_string");
  }
}
function _M0FP38portable8research13researchcheck3req(fields, key) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
  if (_bind === undefined) {
    return _M0FP38portable8research13researchcheck6rejectGRPB4JsonE(`missing_${key}`);
  } else {
    const _Some = _bind;
    const _value = _Some;
    return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(_value);
  }
}
function _M0FP38portable8research13researchcheck8req__str(fields, key) {
  const _bind = _M0FP38portable8research13researchcheck3req(fields, key);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  return _M0FP38portable8research13researchcheck7as__str(_tmp);
}
function _M0FP38portable8research13researchcheck13nonempty__str(fields, key) {
  const _bind = _M0FP38portable8research13researchcheck8req__str(fields, key);
  let value;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    value = _ok._0;
  } else {
    return _bind;
  }
  if (value === "") {
    const _bind$2 = _M0FP38portable8research13researchcheck6rejectGuE(`empty_${key}`);
    if (_bind$2.$tag === 1) {
      const _ok = _bind$2;
      _ok._0;
    } else {
      return _bind$2;
    }
  }
  return new _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(value);
}
function _M0FP38portable8research13researchcheck13clone__object(fields) {
  const out = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind = _M0MPB3Map9to__arrayGssE(fields);
  const _bind$2 = _bind.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind$2) {
      const pair = _bind[_];
      _M0MPB3Map3setGsRPB4JsonE(out, pair._0, pair._1);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return out;
}
function _M0FP38portable8research13researchcheck7as__obj(value) {
  if (value.$tag === 6) {
    const _Object = value;
    const _fields = _Object._0;
    return new _M0DTPC16result6ResultGRPB3MapGsRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok(_fields);
  } else {
    return _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("expected_object");
  }
}
function _M0FP38portable8research13researchcheck12as__pos__int(value) {
  let number;
  if (value.$tag === 3) {
    const _Number = value;
    number = _Number._0;
  } else {
    const _bind = _M0FP38portable8research13researchcheck6rejectGdE("expected_integer");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      number = _ok._0;
    } else {
      return _bind;
    }
  }
  if (number !== number || (number > _M0FPB18double__max__value || number < _M0FPB18double__min__value || _M0MPC16double6Double5floor(number) !== number)) {
    const _bind = _M0FP38portable8research13researchcheck6rejectGuE("expected_integer");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  if (number < 1 || number > 2147483647) {
    const _bind = _M0FP38portable8research13researchcheck6rejectGuE("expected_positive_integer");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  return new _M0DTPC16result6ResultGiRP38portable8research13researchcheck7InvalidE2Ok(_M0MPC16double6Double7to__int(number));
}
function _M0FP38portable8research13researchcheck18validate__question(item) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(item);
  let fields;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    fields = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck15reject__unknown(fields, ["question", "decisionIfTrue", "decisionIfFalse", "kind", "priority"]);
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "question");
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "decisionIfTrue");
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "decisionIfFalse");
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "kind");
  let kind;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    kind = _ok._0;
  } else {
    return _bind$6;
  }
  if (!_M0MPC15array5Array8containsGsE(["constraint", "counterexample", "alternative", "integration"], kind)) {
    const _bind$7 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_question_kind");
    if (_bind$7.$tag === 1) {
      const _ok = _bind$7;
      _ok._0;
    } else {
      return _bind$7;
    }
  }
  const _bind$7 = _M0FP38portable8research13researchcheck3req(fields, "priority");
  let _tmp;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    _tmp = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp);
  let priority;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    priority = _ok._0;
  } else {
    return _bind$8;
  }
  if (priority < 1 || priority > 5) {
    const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_question_priority");
    if (_bind$9.$tag === 1) {
      const _ok = _bind$9;
      _ok._0;
    } else {
      return _bind$9;
    }
  }
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(item);
}
function _M0FP38portable8research13researchcheck14extract__lines(chars, from, to) {
  const builder = _M0MPB13StringBuilder11new_2einner(0);
  const n = chars.length;
  let line = 1;
  let index = 0;
  while (true) {
    if (line < from && index < n) {
      if (_M0MPC15array5Array2atGcE(chars, index) === 10) {
        line = line + 1 | 0;
      }
      index = index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  let current = line;
  while (true) {
    if (current <= to && index < n) {
      const c = _M0MPC15array5Array2atGcE(chars, index);
      _M0IPB13StringBuilderPB6Logger11write__char(builder, c);
      if (c === 10) {
        current = current + 1 | 0;
      }
      index = index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return builder.val;
}
function _M0FP38portable8research13researchcheck11line__count(chars) {
  const n = chars.length;
  if (n === 0) {
    return 0;
  }
  let count = 0;
  let _tmp = 0;
  while (true) {
    const i = _tmp;
    if (i < n) {
      if (_M0MPC15array5Array2atGcE(chars, i) === 10) {
        count = count + 1 | 0;
      }
      _tmp = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return _M0MPC15array5Array2atGcE(chars, n - 1 | 0) === 10 ? count : count + 1 | 0;
}
function _M0FP38portable8research13researchcheck10safe__path(path) {
  if (path === "") {
    return false;
  }
  const chars = _M0MPC16string6String9to__array(path);
  if (_M0MPC15array5Array2atGcE(chars, 0) === 47) {
    return false;
  }
  const n = chars.length;
  let start = 0;
  let index = 0;
  while (true) {
    if (index <= n) {
      if (index === n || _M0MPC15array5Array2atGcE(chars, index) === 47) {
        const length = index - start | 0;
        if (length === 0) {
          return false;
        }
        if (length === 1 && _M0MPC15array5Array2atGcE(chars, start) === 46) {
          return false;
        }
        if (length === 2 && (_M0MPC15array5Array2atGcE(chars, start) === 46 && _M0MPC15array5Array2atGcE(chars, start + 1 | 0) === 46)) {
          return false;
        }
        start = index + 1 | 0;
      } else {
        const code = _M0MPC15array5Array2atGcE(chars, index);
        if (code === 92 || (code === 58 || code === 0)) {
          return false;
        }
      }
      index = index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP38portable8research13researchcheck17extract__citation(entry, texts, shas) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(entry);
  let fields;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    fields = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck15reject__unknown(fields, ["path", "fromLine", "toLine"]);
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research13researchcheck8req__str(fields, "path");
  let path;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    path = _ok._0;
  } else {
    return _bind$3;
  }
  if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
    const _bind$4 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_evidence_path");
    if (_bind$4.$tag === 1) {
      const _ok = _bind$4;
      _ok._0;
    } else {
      return _bind$4;
    }
  }
  const _bind$4 = _M0MPB3Map3getGsRPB5ArrayGcEE(texts, path);
  let chars;
  if (_bind$4.$tag === 1) {
    const _Some = _bind$4;
    chars = _Some._0;
  } else {
    const _bind$5 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("unknown_evidence_path");
    if (_bind$5.$tag === 1) {
      const _ok = _bind$5;
      chars = _ok._0;
    } else {
      return _bind$5;
    }
  }
  const _bind$5 = _M0FP38portable8research13researchcheck3req(fields, "fromLine");
  let _tmp;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _tmp = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp);
  let from_line;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    from_line = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck3req(fields, "toLine");
  let _tmp$2;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    _tmp$2 = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$2);
  let to_line;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    to_line = _ok._0;
  } else {
    return _bind$8;
  }
  if (from_line > to_line) {
    const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_range");
    if (_bind$9.$tag === 1) {
      const _ok = _bind$9;
      _ok._0;
    } else {
      return _bind$9;
    }
  }
  if (to_line > _M0FP38portable8research13researchcheck11line__count(chars)) {
    const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("range_out_of_bounds");
    if (_bind$9.$tag === 1) {
      const _ok = _bind$9;
      _ok._0;
    } else {
      return _bind$9;
    }
  }
  const quote = _M0FP38portable8research13researchcheck14extract__lines(chars, from_line, to_line);
  if (quote === "") {
    const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("empty_quote");
    if (_bind$9.$tag === 1) {
      const _ok = _bind$9;
      _ok._0;
    } else {
      return _bind$9;
    }
  }
  const _bind$9 = _M0MPB3Map3getGssE(shas, path);
  let sha;
  if (_bind$9 === undefined) {
    const _bind$10 = _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("unknown_evidence_path");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      sha = _ok._0;
    } else {
      return _bind$10;
    }
  } else {
    const _Some = _bind$9;
    sha = _Some;
  }
  const _tmp$3 = { _0: "path", _1: new _M0DTPB4Json6String(path) };
  const _p = from_line + 0;
  const _p$2 = undefined;
  const _tmp$4 = { _0: "line", _1: new _M0DTPB4Json6Number(_p, _p$2) };
  const _p$3 = to_line + 0;
  const _p$4 = undefined;
  const _bind$10 = [_tmp$3, _tmp$4, { _0: "endLine", _1: new _M0DTPB4Json6Number(_p$3, _p$4) }, { _0: "sha256", _1: new _M0DTPB4Json6String(sha) }, { _0: "quote", _1: new _M0DTPB4Json6String(quote) }];
  const _p$5 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$10, 0, 5));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$5));
}
function _M0FP38portable8research13researchcheck12evidence__of(citation) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(citation);
  let fields;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    fields = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck3req(fields, "path");
  let _tmp;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _tmp = _ok._0;
  } else {
    return _bind$2;
  }
  const _tmp$2 = { _0: "path", _1: _tmp };
  const _bind$3 = _M0FP38portable8research13researchcheck3req(fields, "quote");
  let _tmp$3;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _tmp$3 = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = [_tmp$2, { _0: "quote", _1: _tmp$3 }];
  const _p = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$4, 0, 2));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p));
}
function _M0FP38portable8research13researchcheck14is__lower__hex(code) {
  return code >= 48 && code <= 57 || code >= 97 && code <= 102;
}
function _M0FP38portable8research13researchcheck10valid__sha(text) {
  const chars = _M0MPC16string6String9to__array(text);
  if (chars.length !== 64) {
    return false;
  }
  const _bind = chars.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const c = chars[_];
      if (!_M0FP38portable8research13researchcheck14is__lower__hex(c)) {
        return false;
      }
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP38portable8research13researchcheck13bind__allowed(allowed, shas) {
  const allowed_shas = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind = allowed.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const item = allowed[_];
      const _bind$2 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        fields = _ok._0;
      } else {
        return _bind$2;
      }
      const _bind$3 = _M0FP38portable8research13researchcheck8req__str(fields, "path");
      let path;
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        path = _ok._0;
      } else {
        return _bind$3;
      }
      if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
        const _bind$4 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_allowed_path");
        if (_bind$4.$tag === 1) {
          const _ok = _bind$4;
          _ok._0;
        } else {
          return _bind$4;
        }
      }
      const _bind$4 = _M0FP38portable8research13researchcheck8req__str(fields, "sha256");
      let sha;
      if (_bind$4.$tag === 1) {
        const _ok = _bind$4;
        sha = _ok._0;
      } else {
        return _bind$4;
      }
      if (!_M0FP38portable8research13researchcheck10valid__sha(sha)) {
        const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_allowed_hash");
        if (_bind$5.$tag === 1) {
          const _ok = _bind$5;
          _ok._0;
        } else {
          return _bind$5;
        }
      }
      if (_M0MPB3Map8containsGssE(allowed_shas, path)) {
        const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_allowed_path");
        if (_bind$5.$tag === 1) {
          const _ok = _bind$5;
          _ok._0;
        } else {
          return _bind$5;
        }
      }
      _M0MPB3Map3setGssE(allowed_shas, path, sha);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$2 = _M0MPB3Map9to__arrayGssE(allowed_shas);
  const _bind$3 = _bind$2.length;
  let _tmp$2 = 0;
  while (true) {
    const _ = _tmp$2;
    if (_ < _bind$3) {
      const pair = _bind$2[_];
      const path = pair._0;
      const sha = pair._1;
      const _bind$4 = _M0MPB3Map3getGssE(shas, path);
      if (_bind$4 === undefined) {
        const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("missing_allowed_source");
        if (_bind$5.$tag === 1) {
          const _ok = _bind$5;
          _ok._0;
        } else {
          return _bind$5;
        }
      } else {
        const _Some = _bind$4;
        const _actual = _Some;
        if (!(_actual === sha)) {
          const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("allowed_source_hash_mismatch");
          if (_bind$5.$tag === 1) {
            const _ok = _bind$5;
            _ok._0;
          } else {
            return _bind$5;
          }
        }
      }
      _tmp$2 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return _M0MPB3Map9to__arrayGssE(allowed_shas).length !== _M0MPB3Map9to__arrayGssE(shas).length ? _M0FP38portable8research13researchcheck6rejectGuE("unexpected_source") : new _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE2Ok(undefined);
}
function _M0FP38portable8research13researchcheck7as__arr(value) {
  if (value.$tag === 5) {
    const _Array = value;
    const _items = _Array._0;
    return new _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research13researchcheck7InvalidE2Ok(_items);
  } else {
    return _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("expected_array");
  }
}
function _M0FP38portable8research13researchcheck13parse__source(item) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(item);
  let fields;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    fields = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck8req__str(fields, "path");
  let path;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    path = _ok._0;
  } else {
    return _bind$2;
  }
  if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
    const _bind$3 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_source_path");
    if (_bind$3.$tag === 1) {
      const _ok = _bind$3;
      _ok._0;
    } else {
      return _bind$3;
    }
  }
  const _bind$3 = _M0FP38portable8research13researchcheck8req__str(fields, "text");
  let text;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    text = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research13researchcheck8req__str(fields, "sha256");
  let sha;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    sha = _ok._0;
  } else {
    return _bind$4;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(sha)) {
    const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_source_hash");
    if (_bind$5.$tag === 1) {
      const _ok = _bind$5;
      _ok._0;
    } else {
      return _bind$5;
    }
  }
  return new _M0DTPC16result6ResultGUssRPB5ArrayGcEERP38portable8research13researchcheck7InvalidE2Ok({ _0: path, _1: sha, _2: _M0MPC16string6String9to__array(text) });
}
function _M0FP38portable8research13researchcheck14parse__sources(value) {
  const _bind = _M0FP38portable8research13researchcheck7as__arr(value);
  let items;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    items = _ok._0;
  } else {
    return _bind;
  }
  const texts = _M0MPB3Map11new_2einnerGsRPB5ArrayGcEE(8);
  const shas = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind$2 = items.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind$2) {
      const item = items[_];
      const _bind$3 = _M0FP38portable8research13researchcheck13parse__source(item);
      let _bind$4;
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        _bind$4 = _ok._0;
      } else {
        return _bind$3;
      }
      const _path = _bind$4._0;
      const _sha = _bind$4._1;
      const _chars = _bind$4._2;
      if (_M0MPB3Map8containsGssE(shas, _path)) {
        const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_source");
        if (_bind$5.$tag === 1) {
          const _ok = _bind$5;
          _ok._0;
        } else {
          return _bind$5;
        }
      }
      _M0MPB3Map3setGssE(shas, _path, _sha);
      _M0MPB3Map3setGsRPB5ArrayGcEE(texts, _path, _chars);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGURPB3MapGsRPB5ArrayGcEERPB3MapGssEERP38portable8research13researchcheck7InvalidE2Ok({ _0: texts, _1: shas });
}
function _M0FP38portable8research13researchcheck8req__arr(fields, key) {
  const _bind = _M0FP38portable8research13researchcheck3req(fields, key);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  return _M0FP38portable8research13researchcheck7as__arr(_tmp);
}
function _M0FP38portable8research13researchcheck8req__obj(fields, key) {
  const _bind = _M0FP38portable8research13researchcheck3req(fields, key);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  return _M0FP38portable8research13researchcheck7as__obj(_tmp);
}
function _M0FP38portable8research13researchcheck15build__research(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _shas = _bind$3._1;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__obj(request, "packet");
  let packet;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    packet = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research13researchcheck8req__arr(packet, "allowedSourceFiles");
  let _tmp$2;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _tmp$2 = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck13bind__allowed(_tmp$2, _shas);
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck8req__obj(request, "draft");
  let draft;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    draft = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research13researchcheck15reject__unknown(draft, ["format", "findings", "nextQuestions"]);
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    _ok._0;
  } else {
    return _bind$8;
  }
  const _bind$9 = _M0FP38portable8research13researchcheck8req__str(draft, "format");
  let _p;
  if (_bind$9.$tag === 1) {
    const _ok = _bind$9;
    _p = _ok._0;
  } else {
    return _bind$9;
  }
  const _p$2 = "source-ranges-v1";
  if (!(_p === _p$2)) {
    const _bind$10 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_draft_format");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      _ok._0;
    } else {
      return _bind$10;
    }
  }
  const _bind$10 = _M0FP38portable8research13researchcheck8req__arr(draft, "findings");
  let raw_findings;
  if (_bind$10.$tag === 1) {
    const _ok = _bind$10;
    raw_findings = _ok._0;
  } else {
    return _bind$10;
  }
  if (raw_findings.length === 0) {
    const _bind$11 = _M0FP38portable8research13researchcheck6rejectGuE("empty_findings");
    if (_bind$11.$tag === 1) {
      const _ok = _bind$11;
      _ok._0;
    } else {
      return _bind$11;
    }
  }
  const findings = [];
  const refs = [];
  let finding_index = 0;
  const _bind$11 = raw_findings.length;
  let _tmp$3 = 0;
  while (true) {
    const _ = _tmp$3;
    if (_ < _bind$11) {
      const item = raw_findings[_];
      const _bind$12 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$12.$tag === 1) {
        const _ok = _bind$12;
        fields = _ok._0;
      } else {
        return _bind$12;
      }
      const _bind$13 = _M0FP38portable8research13researchcheck15reject__unknown(fields, ["statement", "kind", "evidenceRefs", "limitations", "decisionImpact"]);
      if (_bind$13.$tag === 1) {
        const _ok = _bind$13;
        _ok._0;
      } else {
        return _bind$13;
      }
      const _bind$14 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "statement");
      let statement;
      if (_bind$14.$tag === 1) {
        const _ok = _bind$14;
        statement = _ok._0;
      } else {
        return _bind$14;
      }
      const _bind$15 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "kind");
      let kind;
      if (_bind$15.$tag === 1) {
        const _ok = _bind$15;
        kind = _ok._0;
      } else {
        return _bind$15;
      }
      if (!_M0MPC15array5Array8containsGsE(["source", "inference"], kind)) {
        const _bind$16 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_finding_kind");
        if (_bind$16.$tag === 1) {
          const _ok = _bind$16;
          _ok._0;
        } else {
          return _bind$16;
        }
      }
      const _bind$16 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "decisionImpact");
      let decision_impact;
      if (_bind$16.$tag === 1) {
        const _ok = _bind$16;
        decision_impact = _ok._0;
      } else {
        return _bind$16;
      }
      const _bind$17 = _M0FP38portable8research13researchcheck8req__arr(fields, "limitations");
      let limitations;
      if (_bind$17.$tag === 1) {
        const _ok = _bind$17;
        limitations = _ok._0;
      } else {
        return _bind$17;
      }
      const _bind$18 = limitations.length;
      let _tmp$4 = 0;
      while (true) {
        const _$2 = _tmp$4;
        if (_$2 < _bind$18) {
          const limitation = limitations[_$2];
          const _bind$19 = _M0FP38portable8research13researchcheck7as__str(limitation);
          if (_bind$19.$tag === 1) {
            const _ok = _bind$19;
            _ok._0;
          } else {
            return _bind$19;
          }
          _tmp$4 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _bind$19 = _M0FP38portable8research13researchcheck8req__arr(fields, "evidenceRefs");
      let raw_evidence;
      if (_bind$19.$tag === 1) {
        const _ok = _bind$19;
        raw_evidence = _ok._0;
      } else {
        return _bind$19;
      }
      if (raw_evidence.length === 0) {
        const _bind$20 = _M0FP38portable8research13researchcheck6rejectGuE("empty_evidence");
        if (_bind$20.$tag === 1) {
          const _ok = _bind$20;
          _ok._0;
        } else {
          return _bind$20;
        }
      }
      const evidence = [];
      let evidence_index = 0;
      const _bind$20 = raw_evidence.length;
      let _tmp$5 = 0;
      while (true) {
        const _$2 = _tmp$5;
        if (_$2 < _bind$20) {
          const entry = raw_evidence[_$2];
          const _bind$21 = _M0FP38portable8research13researchcheck17extract__citation(entry, _texts, _shas);
          let citation;
          if (_bind$21.$tag === 1) {
            const _ok = _bind$21;
            citation = _ok._0;
          } else {
            return _bind$21;
          }
          const _bind$22 = _M0FP38portable8research13researchcheck12evidence__of(citation);
          let _tmp$6;
          if (_bind$22.$tag === 1) {
            const _ok = _bind$22;
            _tmp$6 = _ok._0;
          } else {
            return _bind$22;
          }
          _M0MPC15array5Array4pushGsE(evidence, _tmp$6);
          const _bind$23 = _M0FP38portable8research13researchcheck7as__obj(citation);
          let _tmp$7;
          if (_bind$23.$tag === 1) {
            const _ok = _bind$23;
            _tmp$7 = _ok._0;
          } else {
            return _bind$23;
          }
          const record = _M0FP38portable8research13researchcheck13clone__object(_tmp$7);
          const _p$3 = finding_index + 0;
          const _p$4 = undefined;
          _M0MPB3Map3setGsRPB4JsonE(record, "findingIndex", new _M0DTPB4Json6Number(_p$3, _p$4));
          const _p$5 = evidence_index + 0;
          const _p$6 = undefined;
          _M0MPB3Map3setGsRPB4JsonE(record, "evidenceIndex", new _M0DTPB4Json6Number(_p$5, _p$6));
          _M0MPC15array5Array4pushGsE(refs, new _M0DTPB4Json6Object(record));
          evidence_index = evidence_index + 1 | 0;
          _tmp$5 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _bind$21 = [{ _0: "statement", _1: new _M0DTPB4Json6String(statement) }, { _0: "kind", _1: new _M0DTPB4Json6String(kind) }, { _0: "evidence", _1: new _M0DTPB4Json5Array(evidence) }, { _0: "limitations", _1: _M0IPC15array5ArrayPB6ToJson8to__jsonGRPB4JsonE(limitations) }, { _0: "decisionImpact", _1: new _M0DTPB4Json6String(decision_impact) }];
      const _p$3 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$21, 0, 5));
      _M0MPC15array5Array4pushGsE(findings, new _M0DTPB4Json6Object(_p$3));
      finding_index = finding_index + 1 | 0;
      _tmp$3 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$12 = _M0FP38portable8research13researchcheck8req__arr(draft, "nextQuestions");
  let raw_questions;
  if (_bind$12.$tag === 1) {
    const _ok = _bind$12;
    raw_questions = _ok._0;
  } else {
    return _bind$12;
  }
  if (raw_questions.length > 20) {
    const _bind$13 = _M0FP38portable8research13researchcheck6rejectGuE("too_many_questions");
    if (_bind$13.$tag === 1) {
      const _ok = _bind$13;
      _ok._0;
    } else {
      return _bind$13;
    }
  }
  const questions = [];
  const _bind$13 = raw_questions.length;
  let _tmp$4 = 0;
  while (true) {
    const _ = _tmp$4;
    if (_ < _bind$13) {
      const question = raw_questions[_];
      const _bind$14 = _M0FP38portable8research13researchcheck18validate__question(question);
      let _tmp$5;
      if (_bind$14.$tag === 1) {
        const _ok = _bind$14;
        _tmp$5 = _ok._0;
      } else {
        return _bind$14;
      }
      _M0MPC15array5Array4pushGsE(questions, _tmp$5);
      _tmp$4 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _p$3 = true;
  const _tmp$5 = { _0: "ok", _1: _p$3 ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _p$4 = [];
  const _tmp$6 = { _0: "errors", _1: new _M0DTPB4Json5Array(_p$4) };
  const _bind$14 = [{ _0: "findings", _1: new _M0DTPB4Json5Array(findings) }, { _0: "nextQuestions", _1: new _M0DTPB4Json5Array(questions) }];
  const _p$5 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$14, 0, 2));
  const _bind$15 = [_tmp$5, _tmp$6, { _0: "result", _1: new _M0DTPB4Json6Object(_p$5) }, { _0: "sourceRefs", _1: new _M0DTPB4Json5Array(refs) }];
  const _p$6 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$15, 0, 4));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$6));
}
function _M0FP38portable8research13researchcheck12collect__ids(items, key) {
  const out = [];
  const seen = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind = items.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const item = items[_];
      const _bind$2 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        fields = _ok._0;
      } else {
        return _bind$2;
      }
      const _bind$3 = _M0FP38portable8research13researchcheck8req__str(fields, key);
      let id;
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        id = _ok._0;
      } else {
        return _bind$3;
      }
      if (id === "") {
        const _bind$4 = _M0FP38portable8research13researchcheck6rejectGuE("empty_id");
        if (_bind$4.$tag === 1) {
          const _ok = _bind$4;
          _ok._0;
        } else {
          return _bind$4;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen, id)) {
        const _bind$4 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_id");
        if (_bind$4.$tag === 1) {
          const _ok = _bind$4;
          _ok._0;
        } else {
          return _bind$4;
        }
      }
      _M0MPB3Map3setGsbE(seen, id, true);
      _M0MPC15array5Array4pushGsE(out, id);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGRPB5ArrayGsERP38portable8research13researchcheck7InvalidE2Ok(out);
}
function _M0FP38portable8research13researchcheck11json__equal(a, b) {
  switch (a.$tag) {
    case 0: {
      if (b.$tag === 0) {
        return true;
      } else {
        return false;
      }
    }
    case 1: {
      if (b.$tag === 1) {
        return true;
      } else {
        return false;
      }
    }
    case 2: {
      if (b.$tag === 2) {
        return true;
      } else {
        return false;
      }
    }
    case 4: {
      const _String = a;
      const _x = _String._0;
      if (b.$tag === 4) {
        const _String$2 = b;
        const _y = _String$2._0;
        return _x === _y;
      } else {
        return false;
      }
    }
    case 3: {
      const _Number = a;
      const _x$2 = _Number._0;
      if (b.$tag === 3) {
        const _Number$2 = b;
        const _y = _Number$2._0;
        return _x$2 === _y;
      } else {
        return false;
      }
    }
    case 5: {
      const _Array = a;
      const _xs = _Array._0;
      if (b.$tag === 5) {
        const _Array$2 = b;
        const _ys = _Array$2._0;
        if (_xs.length !== _ys.length) {
          return false;
        } else {
          let same = true;
          let _tmp = 0;
          while (true) {
            const i = _tmp;
            if (i < _xs.length) {
              if (!_M0FP38portable8research13researchcheck11json__equal(_M0MPC15array5Array2atGRPB4JsonE(_xs, i), _M0MPC15array5Array2atGRPB4JsonE(_ys, i))) {
                same = false;
              }
              _tmp = i + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          return same;
        }
      } else {
        return false;
      }
    }
    default: {
      const _Object = a;
      const _xs$2 = _Object._0;
      if (b.$tag === 6) {
        const _Object$2 = b;
        const _ys = _Object$2._0;
        if (_M0MPB3Map9to__arrayGssE(_xs$2).length !== _M0MPB3Map9to__arrayGssE(_ys).length) {
          return false;
        } else {
          let same = true;
          const _bind = _M0MPB3Map9to__arrayGssE(_xs$2);
          const _bind$2 = _bind.length;
          let _tmp = 0;
          while (true) {
            const _ = _tmp;
            if (_ < _bind$2) {
              const pair = _bind[_];
              const _bind$3 = _M0MPB3Map3getGsRPB4JsonE(_ys, pair._0);
              if (_bind$3 === undefined) {
                same = false;
              } else {
                const _Some = _bind$3;
                const _value = _Some;
                if (!_M0FP38portable8research13researchcheck11json__equal(pair._1, _value)) {
                  same = false;
                }
              }
              _tmp = _ + 1 | 0;
              continue;
            } else {
              break;
            }
          }
          return same;
        }
      } else {
        return false;
      }
    }
  }
}
function _M0FP38portable8research13researchcheck17find__occurrences(hay, needle) {
  const out = [];
  const n = hay.length;
  const m = needle.length;
  if (m === 0 || m > n) {
    return out;
  }
  const line_at = [];
  const col_at = [];
  let line = 1;
  let line_units = 0;
  let _tmp = 0;
  while (true) {
    const i = _tmp;
    if (i < n) {
      _M0MPC15array5Array4pushGiE(line_at, line);
      _M0MPC15array5Array4pushGiE(col_at, line_units + 1 | 0);
      const c = _M0MPC15array5Array2atGcE(hay, i);
      line_units = line_units + (c > 65535 ? 2 : 1) | 0;
      if (c === 10) {
        line = line + 1 | 0;
        line_units = 0;
      }
      _tmp = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  let i = 0;
  while (true) {
    if ((i + m | 0) <= n) {
      let j = 0;
      while (true) {
        if (j < m && _M0MPC15array5Array2atGcE(hay, i + j | 0) === _M0MPC15array5Array2atGcE(needle, j)) {
          j = j + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      if (j === m) {
        _M0MPC15array5Array4pushGsE(out, { _0: _M0MPC15array5Array2atGiE(line_at, i), _1: _M0MPC15array5Array2atGiE(col_at, i) });
      }
      i = i + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return out;
}
function _M0FP38portable8research13researchcheck23validate__source__check(item, texts) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(item);
  let fields;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    fields = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck8req__str(fields, "path");
  let path;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    path = _ok._0;
  } else {
    return _bind$2;
  }
  if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
    const _bind$3 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_check_path");
    if (_bind$3.$tag === 1) {
      const _ok = _bind$3;
      _ok._0;
    } else {
      return _bind$3;
    }
  }
  const _bind$3 = _M0MPB3Map3getGsRPB5ArrayGcEE(texts, path);
  let hay;
  if (_bind$3.$tag === 1) {
    const _Some = _bind$3;
    hay = _Some._0;
  } else {
    const _bind$4 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("unknown_check_path");
    if (_bind$4.$tag === 1) {
      const _ok = _bind$4;
      hay = _ok._0;
    } else {
      return _bind$4;
    }
  }
  const _bind$4 = _M0FP38portable8research13researchcheck3req(fields, "line");
  let _tmp;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    _tmp = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp);
  let line;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    line = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck8req__str(fields, "quote");
  let quote;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    quote = _ok._0;
  } else {
    return _bind$6;
  }
  if (quote === "") {
    const _bind$7 = _M0FP38portable8research13researchcheck6rejectGuE("empty_check_quote");
    if (_bind$7.$tag === 1) {
      const _ok = _bind$7;
      _ok._0;
    } else {
      return _bind$7;
    }
  }
  const _bind$7 = _M0FP38portable8research13researchcheck8req__str(fields, "kind");
  let kind;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    kind = _ok._0;
  } else {
    return _bind$7;
  }
  if (!_M0MPC15array5Array8containsGsE(["support", "scope_limit", "counterexample"], kind)) {
    const _bind$8 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_check_kind");
    if (_bind$8.$tag === 1) {
      const _ok = _bind$8;
      _ok._0;
    } else {
      return _bind$8;
    }
  }
  const occurrences = _M0FP38portable8research13researchcheck17find__occurrences(hay, _M0MPC16string6String9to__array(quote));
  let found = false;
  const _bind$8 = occurrences.length;
  let _tmp$2 = 0;
  while (true) {
    const _ = _tmp$2;
    if (_ < _bind$8) {
      const occ = occurrences[_];
      if (occ._0 === line) {
        found = true;
      }
      _tmp$2 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return !found ? _M0FP38portable8research13researchcheck6rejectGuE("check_quote_not_at_line") : new _M0DTPC16result6ResultGuRP38portable8research13researchcheck7InvalidE2Ok(undefined);
}
function _M0FP38portable8research13researchcheck16validate__review(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _shas = _bind$3._1;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__str(request, "candidateSha256");
  let candidate;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    candidate = _ok._0;
  } else {
    return _bind$4;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(candidate)) {
    const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_candidate_hash");
    if (_bind$5.$tag === 1) {
      const _ok = _bind$5;
      _ok._0;
    } else {
      return _bind$5;
    }
  }
  const _bind$5 = _M0FP38portable8research13researchcheck8req__obj(request, "packet");
  let packet;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    packet = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck8req__obj(request, "review");
  let review;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    review = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck8req__str(packet, "packetId");
  let packet_id;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    packet_id = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research13researchcheck8req__arr(packet, "selectedFindings");
  let _tmp$2;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    _tmp$2 = _ok._0;
  } else {
    return _bind$8;
  }
  const _bind$9 = _M0FP38portable8research13researchcheck12collect__ids(_tmp$2, "findingId");
  let finding_ids;
  if (_bind$9.$tag === 1) {
    const _ok = _bind$9;
    finding_ids = _ok._0;
  } else {
    return _bind$9;
  }
  const _bind$10 = _M0FP38portable8research13researchcheck8req__arr(packet, "tasks");
  let _tmp$3;
  if (_bind$10.$tag === 1) {
    const _ok = _bind$10;
    _tmp$3 = _ok._0;
  } else {
    return _bind$10;
  }
  const _bind$11 = _M0FP38portable8research13researchcheck12collect__ids(_tmp$3, "taskId");
  let task_ids;
  if (_bind$11.$tag === 1) {
    const _ok = _bind$11;
    task_ids = _ok._0;
  } else {
    return _bind$11;
  }
  const _bind$12 = _M0FP38portable8research13researchcheck8req__arr(packet, "allowedSourceFiles");
  let _tmp$4;
  if (_bind$12.$tag === 1) {
    const _ok = _bind$12;
    _tmp$4 = _ok._0;
  } else {
    return _bind$12;
  }
  const _bind$13 = _M0FP38portable8research13researchcheck13bind__allowed(_tmp$4, _shas);
  if (_bind$13.$tag === 1) {
    const _ok = _bind$13;
    _ok._0;
  } else {
    return _bind$13;
  }
  const _bind$14 = _M0FP38portable8research13researchcheck8req__obj(packet, "peerReview");
  let packet_peer;
  if (_bind$14.$tag === 1) {
    const _ok = _bind$14;
    packet_peer = _ok._0;
  } else {
    return _bind$14;
  }
  const _bind$15 = _M0FP38portable8research13researchcheck8req__str(packet_peer, "reviewedArtifactSha256");
  let packet_hash;
  if (_bind$15.$tag === 1) {
    const _ok = _bind$15;
    packet_hash = _ok._0;
  } else {
    return _bind$15;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(packet_hash)) {
    const _bind$16 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_packet_hash");
    if (_bind$16.$tag === 1) {
      const _ok = _bind$16;
      _ok._0;
    } else {
      return _bind$16;
    }
  }
  if (!(packet_hash === candidate)) {
    const _bind$16 = _M0FP38portable8research13researchcheck6rejectGuE("packet_candidate_hash_mismatch");
    if (_bind$16.$tag === 1) {
      const _ok = _bind$16;
      _ok._0;
    } else {
      return _bind$16;
    }
  }
  const _bind$16 = _M0FP38portable8research13researchcheck3req(packet_peer, "round");
  let _tmp$5;
  if (_bind$16.$tag === 1) {
    const _ok = _bind$16;
    _tmp$5 = _ok._0;
  } else {
    return _bind$16;
  }
  const _bind$17 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$5);
  let packet_round;
  if (_bind$17.$tag === 1) {
    const _ok = _bind$17;
    packet_round = _ok._0;
  } else {
    return _bind$17;
  }
  const _bind$18 = _M0MPB3Map3getGsRPB4JsonE(packet_peer, "candidateDraft");
  if (_bind$18 === undefined) {
  } else {
    const _Some = _bind$18;
    const _x = _Some;
    if (_x.$tag === 0) {
    } else {
      const _bind$19 = _M0MPB3Map3getGsRPB4JsonE(request, "candidateValue");
      let value;
      if (_bind$19 === undefined) {
        const _bind$20 = _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("candidate_value_required");
        if (_bind$20.$tag === 1) {
          const _ok = _bind$20;
          value = _ok._0;
        } else {
          return _bind$20;
        }
      } else {
        const _Some$2 = _bind$19;
        value = _Some$2;
      }
      if (!_M0FP38portable8research13researchcheck11json__equal(_x, value)) {
        const _bind$20 = _M0FP38portable8research13researchcheck6rejectGuE("candidate_draft_mismatch");
        if (_bind$20.$tag === 1) {
          const _ok = _bind$20;
          _ok._0;
        } else {
          return _bind$20;
        }
      }
    }
  }
  const _bind$19 = _M0FP38portable8research13researchcheck8req__str(review, "packetId");
  let _p;
  if (_bind$19.$tag === 1) {
    const _ok = _bind$19;
    _p = _ok._0;
  } else {
    return _bind$19;
  }
  if (!(_p === packet_id)) {
    const _bind$20 = _M0FP38portable8research13researchcheck6rejectGuE("packet_id_mismatch");
    if (_bind$20.$tag === 1) {
      const _ok = _bind$20;
      _ok._0;
    } else {
      return _bind$20;
    }
  }
  const _bind$20 = _M0FP38portable8research13researchcheck8req__obj(review, "peerReview");
  let peer;
  if (_bind$20.$tag === 1) {
    const _ok = _bind$20;
    peer = _ok._0;
  } else {
    return _bind$20;
  }
  const _bind$21 = _M0FP38portable8research13researchcheck8req__str(peer, "reviewedArtifactSha256");
  let peer_hash;
  if (_bind$21.$tag === 1) {
    const _ok = _bind$21;
    peer_hash = _ok._0;
  } else {
    return _bind$21;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(peer_hash)) {
    const _bind$22 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_review_hash");
    if (_bind$22.$tag === 1) {
      const _ok = _bind$22;
      _ok._0;
    } else {
      return _bind$22;
    }
  }
  if (!(peer_hash === candidate)) {
    const _bind$22 = _M0FP38portable8research13researchcheck6rejectGuE("review_candidate_hash_mismatch");
    if (_bind$22.$tag === 1) {
      const _ok = _bind$22;
      _ok._0;
    } else {
      return _bind$22;
    }
  }
  const _bind$22 = _M0FP38portable8research13researchcheck3req(peer, "round");
  let _tmp$6;
  if (_bind$22.$tag === 1) {
    const _ok = _bind$22;
    _tmp$6 = _ok._0;
  } else {
    return _bind$22;
  }
  const _bind$23 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$6);
  let _tmp$7;
  if (_bind$23.$tag === 1) {
    const _ok = _bind$23;
    _tmp$7 = _ok._0;
  } else {
    return _bind$23;
  }
  if (_tmp$7 !== packet_round) {
    const _bind$24 = _M0FP38portable8research13researchcheck6rejectGuE("round_mismatch");
    if (_bind$24.$tag === 1) {
      const _ok = _bind$24;
      _ok._0;
    } else {
      return _bind$24;
    }
  }
  const _bind$24 = _M0FP38portable8research13researchcheck8req__str(peer, "disposition");
  let disposition;
  if (_bind$24.$tag === 1) {
    const _ok = _bind$24;
    disposition = _ok._0;
  } else {
    return _bind$24;
  }
  if (!_M0MPC15array5Array8containsGsE(["no_open_issues", "changes_requested", "disputed", "incomplete"], disposition)) {
    const _bind$25 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_disposition");
    if (_bind$25.$tag === 1) {
      const _ok = _bind$25;
      _ok._0;
    } else {
      return _bind$25;
    }
  }
  const _bind$25 = _M0FP38portable8research13researchcheck8req__arr(peer, "issues");
  let issues;
  if (_bind$25.$tag === 1) {
    const _ok = _bind$25;
    issues = _ok._0;
  } else {
    return _bind$25;
  }
  const _bind$26 = _M0FP38portable8research13researchcheck8req__arr(review, "reviews");
  let reviews;
  if (_bind$26.$tag === 1) {
    const _ok = _bind$26;
    reviews = _ok._0;
  } else {
    return _bind$26;
  }
  const reviewed_ids = [];
  const seen_reviews = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$27 = reviews.length;
  let _tmp$8 = 0;
  while (true) {
    const _ = _tmp$8;
    if (_ < _bind$27) {
      const item = reviews[_];
      const _bind$28 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$28.$tag === 1) {
        const _ok = _bind$28;
        fields = _ok._0;
      } else {
        return _bind$28;
      }
      const _bind$29 = _M0FP38portable8research13researchcheck8req__str(fields, "findingId");
      let finding_id;
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        finding_id = _ok._0;
      } else {
        return _bind$29;
      }
      if (!_M0MPC15array5Array8containsGsE(finding_ids, finding_id)) {
        const _bind$30 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_review_finding");
        if (_bind$30.$tag === 1) {
          const _ok = _bind$30;
          _ok._0;
        } else {
          return _bind$30;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen_reviews, finding_id)) {
        const _bind$30 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_review");
        if (_bind$30.$tag === 1) {
          const _ok = _bind$30;
          _ok._0;
        } else {
          return _bind$30;
        }
      }
      _M0MPB3Map3setGsbE(seen_reviews, finding_id, true);
      _M0MPC15array5Array4pushGsE(reviewed_ids, finding_id);
      const _bind$30 = _M0FP38portable8research13researchcheck8req__str(fields, "verdict");
      let verdict;
      if (_bind$30.$tag === 1) {
        const _ok = _bind$30;
        verdict = _ok._0;
      } else {
        return _bind$30;
      }
      if (!_M0MPC15array5Array8containsGsE(["supported", "qualified", "refuted", "unresolved"], verdict)) {
        const _bind$31 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_verdict");
        if (_bind$31.$tag === 1) {
          const _ok = _bind$31;
          _ok._0;
        } else {
          return _bind$31;
        }
      }
      const _bind$31 = _M0FP38portable8research13researchcheck8req__arr(fields, "basisFindingIds");
      let basis;
      if (_bind$31.$tag === 1) {
        const _ok = _bind$31;
        basis = _ok._0;
      } else {
        return _bind$31;
      }
      const seen_basis = _M0MPB3Map11new_2einnerGsbE(8);
      const _bind$32 = basis.length;
      let _tmp$9 = 0;
      while (true) {
        const _$2 = _tmp$9;
        if (_$2 < _bind$32) {
          const entry = basis[_$2];
          const _bind$33 = _M0FP38portable8research13researchcheck7as__str(entry);
          let basis_id;
          if (_bind$33.$tag === 1) {
            const _ok = _bind$33;
            basis_id = _ok._0;
          } else {
            return _bind$33;
          }
          if (!_M0MPC15array5Array8containsGsE(finding_ids, basis_id)) {
            const _bind$34 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_basis");
            if (_bind$34.$tag === 1) {
              const _ok = _bind$34;
              _ok._0;
            } else {
              return _bind$34;
            }
          }
          if (_M0MPB3Map8containsGsbE(seen_basis, basis_id)) {
            const _bind$34 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_basis");
            if (_bind$34.$tag === 1) {
              const _ok = _bind$34;
              _ok._0;
            } else {
              return _bind$34;
            }
          }
          _M0MPB3Map3setGsbE(seen_basis, basis_id, true);
          _tmp$9 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _bind$33 = _M0FP38portable8research13researchcheck8req__arr(fields, "sourceChecks");
      let _bind$34;
      if (_bind$33.$tag === 1) {
        const _ok = _bind$33;
        _bind$34 = _ok._0;
      } else {
        return _bind$33;
      }
      const _bind$35 = _bind$34.length;
      let _tmp$10 = 0;
      while (true) {
        const _$2 = _tmp$10;
        if (_$2 < _bind$35) {
          const check = _bind$34[_$2];
          const _bind$36 = _M0FP38portable8research13researchcheck23validate__source__check(check, _texts);
          if (_bind$36.$tag === 1) {
            const _ok = _bind$36;
            _ok._0;
          } else {
            return _bind$36;
          }
          _tmp$10 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _bind$36 = _M0FP38portable8research13researchcheck8req__arr(fields, "remainingChecks");
      let _bind$37;
      if (_bind$36.$tag === 1) {
        const _ok = _bind$36;
        _bind$37 = _ok._0;
      } else {
        return _bind$36;
      }
      const _bind$38 = _bind$37.length;
      let _tmp$11 = 0;
      while (true) {
        const _$2 = _tmp$11;
        if (_$2 < _bind$38) {
          const remaining = _bind$37[_$2];
          const _bind$39 = _M0FP38portable8research13researchcheck7as__str(remaining);
          if (_bind$39.$tag === 1) {
            const _ok = _bind$39;
            _ok._0;
          } else {
            return _bind$39;
          }
          _tmp$11 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _bind$39 = _M0FP38portable8research13researchcheck8req__str(fields, "note");
      if (_bind$39.$tag === 1) {
        const _ok = _bind$39;
        _ok._0;
      } else {
        return _bind$39;
      }
      _tmp$8 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const seen_issues = _M0MPB3Map11new_2einnerGsbE(8);
  let has_open = false;
  const _bind$28 = issues.length;
  let _tmp$9 = 0;
  while (true) {
    const _ = _tmp$9;
    if (_ < _bind$28) {
      const item = issues[_];
      const _bind$29 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        fields = _ok._0;
      } else {
        return _bind$29;
      }
      const _bind$30 = _M0FP38portable8research13researchcheck8req__str(fields, "id");
      let issue_id;
      if (_bind$30.$tag === 1) {
        const _ok = _bind$30;
        issue_id = _ok._0;
      } else {
        return _bind$30;
      }
      if (issue_id === "") {
        const _bind$31 = _M0FP38portable8research13researchcheck6rejectGuE("empty_issue_id");
        if (_bind$31.$tag === 1) {
          const _ok = _bind$31;
          _ok._0;
        } else {
          return _bind$31;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen_issues, issue_id)) {
        const _bind$31 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_issue");
        if (_bind$31.$tag === 1) {
          const _ok = _bind$31;
          _ok._0;
        } else {
          return _bind$31;
        }
      }
      _M0MPB3Map3setGsbE(seen_issues, issue_id, true);
      const _bind$31 = _M0FP38portable8research13researchcheck8req__str(fields, "findingId");
      let finding_id;
      if (_bind$31.$tag === 1) {
        const _ok = _bind$31;
        finding_id = _ok._0;
      } else {
        return _bind$31;
      }
      if (!_M0MPC15array5Array8containsGsE(finding_ids, finding_id)) {
        const _bind$32 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_issue_finding");
        if (_bind$32.$tag === 1) {
          const _ok = _bind$32;
          _ok._0;
        } else {
          return _bind$32;
        }
      }
      const _bind$32 = _M0FP38portable8research13researchcheck8req__str(fields, "state");
      let state;
      if (_bind$32.$tag === 1) {
        const _ok = _bind$32;
        state = _ok._0;
      } else {
        return _bind$32;
      }
      if (!_M0MPC15array5Array8containsGsE(["open", "disputed", "resolved"], state)) {
        const _bind$33 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_issue_state");
        if (_bind$33.$tag === 1) {
          const _ok = _bind$33;
          _ok._0;
        } else {
          return _bind$33;
        }
      }
      if (state === "open" || state === "disputed") {
        has_open = true;
      }
      const _bind$33 = _M0FP38portable8research13researchcheck8req__str(fields, "note");
      if (_bind$33.$tag === 1) {
        const _ok = _bind$33;
        _ok._0;
      } else {
        return _bind$33;
      }
      _tmp$9 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const seen_tasks = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$29 = _M0FP38portable8research13researchcheck8req__arr(review, "questionActions");
  let _bind$30;
  if (_bind$29.$tag === 1) {
    const _ok = _bind$29;
    _bind$30 = _ok._0;
  } else {
    return _bind$29;
  }
  const _bind$31 = _bind$30.length;
  let _tmp$10 = 0;
  while (true) {
    const _ = _tmp$10;
    if (_ < _bind$31) {
      const item = _bind$30[_];
      const _bind$32 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$32.$tag === 1) {
        const _ok = _bind$32;
        fields = _ok._0;
      } else {
        return _bind$32;
      }
      const _bind$33 = _M0FP38portable8research13researchcheck8req__str(fields, "taskId");
      let task_id;
      if (_bind$33.$tag === 1) {
        const _ok = _bind$33;
        task_id = _ok._0;
      } else {
        return _bind$33;
      }
      if (!_M0MPC15array5Array8containsGsE(task_ids, task_id)) {
        const _bind$34 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_question_task");
        if (_bind$34.$tag === 1) {
          const _ok = _bind$34;
          _ok._0;
        } else {
          return _bind$34;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen_tasks, task_id)) {
        const _bind$34 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_question_action");
        if (_bind$34.$tag === 1) {
          const _ok = _bind$34;
          _ok._0;
        } else {
          return _bind$34;
        }
      }
      _M0MPB3Map3setGsbE(seen_tasks, task_id, true);
      const _bind$34 = _M0FP38portable8research13researchcheck8req__str(fields, "action");
      let action;
      if (_bind$34.$tag === 1) {
        const _ok = _bind$34;
        action = _ok._0;
      } else {
        return _bind$34;
      }
      if (!_M0MPC15array5Array8containsGsE(["keep", "park", "refine"], action)) {
        const _bind$35 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_question_action");
        if (_bind$35.$tag === 1) {
          const _ok = _bind$35;
          _ok._0;
        } else {
          return _bind$35;
        }
      }
      const _bind$35 = _M0FP38portable8research13researchcheck8req__str(fields, "reason");
      if (_bind$35.$tag === 1) {
        const _ok = _bind$35;
        _ok._0;
      } else {
        return _bind$35;
      }
      _tmp$10 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$32 = _M0FP38portable8research13researchcheck8req__arr(review, "infrastructureObservations");
  if (_bind$32.$tag === 1) {
    const _ok = _bind$32;
    _ok._0;
  } else {
    return _bind$32;
  }
  const _bind$33 = _M0FP38portable8research13researchcheck8req__obj(review, "coverage");
  let coverage;
  if (_bind$33.$tag === 1) {
    const _ok = _bind$33;
    coverage = _ok._0;
  } else {
    return _bind$33;
  }
  const review_set = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$34 = reviewed_ids.length;
  let _tmp$11 = 0;
  while (true) {
    const _ = _tmp$11;
    if (_ < _bind$34) {
      const id = reviewed_ids[_];
      _M0MPB3Map3setGsbE(review_set, id, true);
      _tmp$11 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const covered = _M0MPB3Map11new_2einnerGsbE(8);
  const declared_reviewed = _M0MPB3Map11new_2einnerGsbE(8);
  let declared_reviewed_count = 0;
  const _bind$35 = _M0FP38portable8research13researchcheck8req__arr(coverage, "reviewedFindingIds");
  let _bind$36;
  if (_bind$35.$tag === 1) {
    const _ok = _bind$35;
    _bind$36 = _ok._0;
  } else {
    return _bind$35;
  }
  const _bind$37 = _bind$36.length;
  let _tmp$12 = 0;
  while (true) {
    const _ = _tmp$12;
    if (_ < _bind$37) {
      const entry = _bind$36[_];
      const _bind$38 = _M0FP38portable8research13researchcheck7as__str(entry);
      let id;
      if (_bind$38.$tag === 1) {
        const _ok = _bind$38;
        id = _ok._0;
      } else {
        return _bind$38;
      }
      if (!_M0MPC15array5Array8containsGsE(finding_ids, id)) {
        const _bind$39 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_covered_finding");
        if (_bind$39.$tag === 1) {
          const _ok = _bind$39;
          _ok._0;
        } else {
          return _bind$39;
        }
      }
      if (_M0MPB3Map8containsGsbE(covered, id)) {
        const _bind$39 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_covered_finding");
        if (_bind$39.$tag === 1) {
          const _ok = _bind$39;
          _ok._0;
        } else {
          return _bind$39;
        }
      }
      _M0MPB3Map3setGsbE(covered, id, true);
      _M0MPB3Map3setGsbE(declared_reviewed, id, true);
      declared_reviewed_count = declared_reviewed_count + 1 | 0;
      if (!_M0MPB3Map8containsGsbE(review_set, id)) {
        const _bind$39 = _M0FP38portable8research13researchcheck6rejectGuE("reviewed_coverage_mismatch");
        if (_bind$39.$tag === 1) {
          const _ok = _bind$39;
          _ok._0;
        } else {
          return _bind$39;
        }
      }
      _tmp$12 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$38 = _M0FP38portable8research13researchcheck8req__arr(coverage, "unreviewedFindingIds");
  let _bind$39;
  if (_bind$38.$tag === 1) {
    const _ok = _bind$38;
    _bind$39 = _ok._0;
  } else {
    return _bind$38;
  }
  const _bind$40 = _bind$39.length;
  let _tmp$13 = 0;
  while (true) {
    const _ = _tmp$13;
    if (_ < _bind$40) {
      const entry = _bind$39[_];
      const _bind$41 = _M0FP38portable8research13researchcheck7as__str(entry);
      let id;
      if (_bind$41.$tag === 1) {
        const _ok = _bind$41;
        id = _ok._0;
      } else {
        return _bind$41;
      }
      if (!_M0MPC15array5Array8containsGsE(finding_ids, id)) {
        const _bind$42 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_unreviewed_finding");
        if (_bind$42.$tag === 1) {
          const _ok = _bind$42;
          _ok._0;
        } else {
          return _bind$42;
        }
      }
      if (_M0MPB3Map8containsGsbE(covered, id)) {
        const _bind$42 = _M0FP38portable8research13researchcheck6rejectGuE("overlapping_coverage");
        if (_bind$42.$tag === 1) {
          const _ok = _bind$42;
          _ok._0;
        } else {
          return _bind$42;
        }
      }
      _M0MPB3Map3setGsbE(covered, id, true);
      _tmp$13 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (_M0MPB3Map9to__arrayGsbE(covered).length !== finding_ids.length) {
    const _bind$41 = _M0FP38portable8research13researchcheck6rejectGuE("coverage_gap");
    if (_bind$41.$tag === 1) {
      const _ok = _bind$41;
      _ok._0;
    } else {
      return _bind$41;
    }
  }
  const _bind$41 = reviewed_ids.length;
  let _tmp$14 = 0;
  while (true) {
    const _ = _tmp$14;
    if (_ < _bind$41) {
      const id = reviewed_ids[_];
      if (!_M0MPB3Map8containsGsbE(declared_reviewed, id)) {
        const _bind$42 = _M0FP38portable8research13researchcheck6rejectGuE("reviewed_coverage_mismatch");
        if (_bind$42.$tag === 1) {
          const _ok = _bind$42;
          _ok._0;
        } else {
          return _bind$42;
        }
      }
      _tmp$14 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$42 = _M0FP38portable8research13researchcheck8req__arr(coverage, "unreadSources");
  let unread_sources;
  if (_bind$42.$tag === 1) {
    const _ok = _bind$42;
    unread_sources = _ok._0;
  } else {
    return _bind$42;
  }
  const seen_unread = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$43 = unread_sources.length;
  let _tmp$15 = 0;
  while (true) {
    const _ = _tmp$15;
    if (_ < _bind$43) {
      const entry = unread_sources[_];
      const _bind$44 = _M0FP38portable8research13researchcheck7as__str(entry);
      let path;
      if (_bind$44.$tag === 1) {
        const _ok = _bind$44;
        path = _ok._0;
      } else {
        return _bind$44;
      }
      if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
        const _bind$45 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_unread_source");
        if (_bind$45.$tag === 1) {
          const _ok = _bind$45;
          _ok._0;
        } else {
          return _bind$45;
        }
      }
      if (!_M0MPB3Map8containsGssE(_shas, path)) {
        const _bind$45 = _M0FP38portable8research13researchcheck6rejectGuE("unread_source_not_allowed");
        if (_bind$45.$tag === 1) {
          const _ok = _bind$45;
          _ok._0;
        } else {
          return _bind$45;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen_unread, path)) {
        const _bind$45 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_unread_source");
        if (_bind$45.$tag === 1) {
          const _ok = _bind$45;
          _ok._0;
        } else {
          return _bind$45;
        }
      }
      _M0MPB3Map3setGsbE(seen_unread, path, true);
      _tmp$15 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$44 = _M0FP38portable8research13researchcheck8req__arr(coverage, "unperformedChecks");
  let _bind$45;
  if (_bind$44.$tag === 1) {
    const _ok = _bind$44;
    _bind$45 = _ok._0;
  } else {
    return _bind$44;
  }
  const _bind$46 = _bind$45.length;
  let _tmp$16 = 0;
  while (true) {
    const _ = _tmp$16;
    if (_ < _bind$46) {
      const entry = _bind$45[_];
      const _bind$47 = _M0FP38portable8research13researchcheck7as__str(entry);
      if (_bind$47.$tag === 1) {
        const _ok = _bind$47;
        _ok._0;
      } else {
        return _bind$47;
      }
      _tmp$16 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (disposition === "no_open_issues") {
    if (has_open) {
      const _bind$47 = _M0FP38portable8research13researchcheck6rejectGuE("open_issues_with_no_open_disposition");
      if (_bind$47.$tag === 1) {
        const _ok = _bind$47;
        _ok._0;
      } else {
        return _bind$47;
      }
    }
    if (declared_reviewed_count !== finding_ids.length) {
      const _bind$47 = _M0FP38portable8research13researchcheck6rejectGuE("unreviewed_with_no_open_disposition");
      if (_bind$47.$tag === 1) {
        const _ok = _bind$47;
        _ok._0;
      } else {
        return _bind$47;
      }
    }
  }
  const _p$2 = true;
  const _tmp$17 = { _0: "ok", _1: _p$2 ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _p$3 = [];
  const _bind$47 = [_tmp$17, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$3) }];
  const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$47, 0, 2));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$4));
}
function _M0FP38portable8research13researchcheck13build__review(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__obj(request, "packet");
  let packet;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    packet = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research13researchcheck8req__str(request, "candidateSha256");
  let candidate;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    candidate = _ok._0;
  } else {
    return _bind$5;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(candidate)) {
    const _bind$6 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_candidate_hash");
    if (_bind$6.$tag === 1) {
      const _ok = _bind$6;
      _ok._0;
    } else {
      return _bind$6;
    }
  }
  const _bind$6 = _M0FP38portable8research13researchcheck8req__obj(packet, "peerReview");
  let packet_peer;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    packet_peer = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck8req__str(packet_peer, "reviewedArtifactSha256");
  let _p;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    _p = _ok._0;
  } else {
    return _bind$7;
  }
  if (!(_p === candidate)) {
    const _bind$8 = _M0FP38portable8research13researchcheck6rejectGuE("packet_candidate_hash_mismatch");
    if (_bind$8.$tag === 1) {
      const _ok = _bind$8;
      _ok._0;
    } else {
      return _bind$8;
    }
  }
  const _bind$8 = _M0FP38portable8research13researchcheck3req(packet_peer, "round");
  let _tmp$2;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    _tmp$2 = _ok._0;
  } else {
    return _bind$8;
  }
  const _bind$9 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$2);
  let round;
  if (_bind$9.$tag === 1) {
    const _ok = _bind$9;
    round = _ok._0;
  } else {
    return _bind$9;
  }
  const _bind$10 = _M0FP38portable8research13researchcheck8req__obj(request, "draft");
  let draft;
  if (_bind$10.$tag === 1) {
    const _ok = _bind$10;
    draft = _ok._0;
  } else {
    return _bind$10;
  }
  const _bind$11 = _M0FP38portable8research13researchcheck15reject__unknown(draft, ["reviews", "questionActions", "infrastructureObservations", "coverage", "peerReview"]);
  if (_bind$11.$tag === 1) {
    const _ok = _bind$11;
    _ok._0;
  } else {
    return _bind$11;
  }
  if (_M0MPB3Map8containsGsRPB4JsonE(draft, "packetId")) {
    const _bind$12 = _M0FP38portable8research13researchcheck6rejectGuE("generated_field_packetId");
    if (_bind$12.$tag === 1) {
      const _ok = _bind$12;
      _ok._0;
    } else {
      return _bind$12;
    }
  }
  const _bind$12 = _M0FP38portable8research13researchcheck8req__obj(draft, "peerReview");
  let draft_peer;
  if (_bind$12.$tag === 1) {
    const _ok = _bind$12;
    draft_peer = _ok._0;
  } else {
    return _bind$12;
  }
  const _bind$13 = _M0FP38portable8research13researchcheck15reject__unknown(draft_peer, ["disposition", "issues"]);
  if (_bind$13.$tag === 1) {
    const _ok = _bind$13;
    _ok._0;
  } else {
    return _bind$13;
  }
  if (_M0MPB3Map8containsGsRPB4JsonE(draft_peer, "reviewedArtifactSha256") || (_M0MPB3Map8containsGsRPB4JsonE(draft_peer, "round") || (_M0MPB3Map8containsGsRPB4JsonE(draft_peer, "candidateDraft") || _M0MPB3Map8containsGsRPB4JsonE(draft_peer, "packetId")))) {
    const _bind$14 = _M0FP38portable8research13researchcheck6rejectGuE("generated_field_peerReview");
    if (_bind$14.$tag === 1) {
      const _ok = _bind$14;
      _ok._0;
    } else {
      return _bind$14;
    }
  }
  const _bind$14 = _M0FP38portable8research13researchcheck8req__obj(draft, "coverage");
  let draft_coverage;
  if (_bind$14.$tag === 1) {
    const _ok = _bind$14;
    draft_coverage = _ok._0;
  } else {
    return _bind$14;
  }
  const _bind$15 = _M0FP38portable8research13researchcheck15reject__unknown(draft_coverage, ["unreadSources", "unperformedChecks"]);
  if (_bind$15.$tag === 1) {
    const _ok = _bind$15;
    _ok._0;
  } else {
    return _bind$15;
  }
  if (_M0MPB3Map8containsGsRPB4JsonE(draft_coverage, "reviewedFindingIds") || _M0MPB3Map8containsGsRPB4JsonE(draft_coverage, "unreviewedFindingIds")) {
    const _bind$16 = _M0FP38portable8research13researchcheck6rejectGuE("generated_field_coverage");
    if (_bind$16.$tag === 1) {
      const _ok = _bind$16;
      _ok._0;
    } else {
      return _bind$16;
    }
  }
  const _bind$16 = _M0FP38portable8research13researchcheck8req__arr(packet, "selectedFindings");
  let _tmp$3;
  if (_bind$16.$tag === 1) {
    const _ok = _bind$16;
    _tmp$3 = _ok._0;
  } else {
    return _bind$16;
  }
  const _bind$17 = _M0FP38portable8research13researchcheck12collect__ids(_tmp$3, "findingId");
  let finding_ids;
  if (_bind$17.$tag === 1) {
    const _ok = _bind$17;
    finding_ids = _ok._0;
  } else {
    return _bind$17;
  }
  const reviews = [];
  const reviewed_ids = [];
  const seen = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$18 = _M0FP38portable8research13researchcheck8req__arr(draft, "reviews");
  let _bind$19;
  if (_bind$18.$tag === 1) {
    const _ok = _bind$18;
    _bind$19 = _ok._0;
  } else {
    return _bind$18;
  }
  const _bind$20 = _bind$19.length;
  let _tmp$4 = 0;
  while (true) {
    const _ = _tmp$4;
    if (_ < _bind$20) {
      const item = _bind$19[_];
      const _bind$21 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$21.$tag === 1) {
        const _ok = _bind$21;
        fields = _ok._0;
      } else {
        return _bind$21;
      }
      const _bind$22 = _M0FP38portable8research13researchcheck15reject__unknown(fields, ["findingId", "verdict", "note", "basisFindingIds", "sourceRefs", "remainingChecks"]);
      if (_bind$22.$tag === 1) {
        const _ok = _bind$22;
        _ok._0;
      } else {
        return _bind$22;
      }
      if (_M0MPB3Map8containsGsRPB4JsonE(fields, "sourceChecks")) {
        const _bind$23 = _M0FP38portable8research13researchcheck6rejectGuE("generated_field_sourceChecks");
        if (_bind$23.$tag === 1) {
          const _ok = _bind$23;
          _ok._0;
        } else {
          return _bind$23;
        }
      }
      const _bind$23 = _M0FP38portable8research13researchcheck13nonempty__str(fields, "findingId");
      let finding_id;
      if (_bind$23.$tag === 1) {
        const _ok = _bind$23;
        finding_id = _ok._0;
      } else {
        return _bind$23;
      }
      if (!_M0MPC15array5Array8containsGsE(finding_ids, finding_id)) {
        const _bind$24 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_review_finding");
        if (_bind$24.$tag === 1) {
          const _ok = _bind$24;
          _ok._0;
        } else {
          return _bind$24;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen, finding_id)) {
        const _bind$24 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_review");
        if (_bind$24.$tag === 1) {
          const _ok = _bind$24;
          _ok._0;
        } else {
          return _bind$24;
        }
      }
      _M0MPB3Map3setGsbE(seen, finding_id, true);
      _M0MPC15array5Array4pushGsE(reviewed_ids, finding_id);
      const checks = [];
      const _bind$24 = _M0FP38portable8research13researchcheck8req__arr(fields, "sourceRefs");
      let _bind$25;
      if (_bind$24.$tag === 1) {
        const _ok = _bind$24;
        _bind$25 = _ok._0;
      } else {
        return _bind$24;
      }
      const _bind$26 = _bind$25.length;
      let _tmp$5 = 0;
      while (true) {
        const _$2 = _tmp$5;
        if (_$2 < _bind$26) {
          const entry = _bind$25[_$2];
          const _bind$27 = _M0FP38portable8research13researchcheck7as__obj(entry);
          let ref_fields;
          if (_bind$27.$tag === 1) {
            const _ok = _bind$27;
            ref_fields = _ok._0;
          } else {
            return _bind$27;
          }
          const _bind$28 = _M0FP38portable8research13researchcheck15reject__unknown(ref_fields, ["path", "fromLine", "toLine", "kind"]);
          if (_bind$28.$tag === 1) {
            const _ok = _bind$28;
            _ok._0;
          } else {
            return _bind$28;
          }
          if (_M0MPB3Map8containsGsRPB4JsonE(ref_fields, "quote") || (_M0MPB3Map8containsGsRPB4JsonE(ref_fields, "sha256") || _M0MPB3Map8containsGsRPB4JsonE(ref_fields, "line"))) {
            const _bind$29 = _M0FP38portable8research13researchcheck6rejectGuE("generated_field_sourceRef");
            if (_bind$29.$tag === 1) {
              const _ok = _bind$29;
              _ok._0;
            } else {
              return _bind$29;
            }
          }
          const _bind$29 = _M0FP38portable8research13researchcheck8req__str(ref_fields, "path");
          let path;
          if (_bind$29.$tag === 1) {
            const _ok = _bind$29;
            path = _ok._0;
          } else {
            return _bind$29;
          }
          if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
            const _bind$30 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_check_path");
            if (_bind$30.$tag === 1) {
              const _ok = _bind$30;
              _ok._0;
            } else {
              return _bind$30;
            }
          }
          const _bind$30 = _M0MPB3Map3getGsRPB5ArrayGcEE(_texts, path);
          let chars;
          if (_bind$30.$tag === 1) {
            const _Some = _bind$30;
            chars = _Some._0;
          } else {
            const _bind$31 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("unknown_check_path");
            if (_bind$31.$tag === 1) {
              const _ok = _bind$31;
              chars = _ok._0;
            } else {
              return _bind$31;
            }
          }
          const _bind$31 = _M0FP38portable8research13researchcheck3req(ref_fields, "fromLine");
          let _tmp$6;
          if (_bind$31.$tag === 1) {
            const _ok = _bind$31;
            _tmp$6 = _ok._0;
          } else {
            return _bind$31;
          }
          const _bind$32 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$6);
          let from_line;
          if (_bind$32.$tag === 1) {
            const _ok = _bind$32;
            from_line = _ok._0;
          } else {
            return _bind$32;
          }
          const _bind$33 = _M0FP38portable8research13researchcheck3req(ref_fields, "toLine");
          let _tmp$7;
          if (_bind$33.$tag === 1) {
            const _ok = _bind$33;
            _tmp$7 = _ok._0;
          } else {
            return _bind$33;
          }
          const _bind$34 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$7);
          let to_line;
          if (_bind$34.$tag === 1) {
            const _ok = _bind$34;
            to_line = _ok._0;
          } else {
            return _bind$34;
          }
          if (from_line > to_line) {
            const _bind$35 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_range");
            if (_bind$35.$tag === 1) {
              const _ok = _bind$35;
              _ok._0;
            } else {
              return _bind$35;
            }
          }
          if (to_line > _M0FP38portable8research13researchcheck11line__count(chars)) {
            const _bind$35 = _M0FP38portable8research13researchcheck6rejectGuE("range_out_of_bounds");
            if (_bind$35.$tag === 1) {
              const _ok = _bind$35;
              _ok._0;
            } else {
              return _bind$35;
            }
          }
          const quote = _M0FP38portable8research13researchcheck14extract__lines(chars, from_line, to_line);
          if (quote === "") {
            const _bind$35 = _M0FP38portable8research13researchcheck6rejectGuE("empty_check_quote");
            if (_bind$35.$tag === 1) {
              const _ok = _bind$35;
              _ok._0;
            } else {
              return _bind$35;
            }
          }
          const _bind$35 = _M0FP38portable8research13researchcheck13nonempty__str(ref_fields, "kind");
          let kind;
          if (_bind$35.$tag === 1) {
            const _ok = _bind$35;
            kind = _ok._0;
          } else {
            return _bind$35;
          }
          const _tmp$8 = { _0: "path", _1: new _M0DTPB4Json6String(path) };
          const _p$2 = from_line + 0;
          const _p$3 = undefined;
          const _bind$36 = [_tmp$8, { _0: "line", _1: new _M0DTPB4Json6Number(_p$2, _p$3) }, { _0: "quote", _1: new _M0DTPB4Json6String(quote) }, { _0: "kind", _1: new _M0DTPB4Json6String(kind) }];
          const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$36, 0, 4));
          _M0MPC15array5Array4pushGsE(checks, new _M0DTPB4Json6Object(_p$4));
          _tmp$5 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      const _tmp$6 = { _0: "findingId", _1: new _M0DTPB4Json6String(finding_id) };
      const _bind$27 = _M0FP38portable8research13researchcheck3req(fields, "verdict");
      let _tmp$7;
      if (_bind$27.$tag === 1) {
        const _ok = _bind$27;
        _tmp$7 = _ok._0;
      } else {
        return _bind$27;
      }
      const _tmp$8 = { _0: "verdict", _1: _tmp$7 };
      const _bind$28 = _M0FP38portable8research13researchcheck3req(fields, "note");
      let _tmp$9;
      if (_bind$28.$tag === 1) {
        const _ok = _bind$28;
        _tmp$9 = _ok._0;
      } else {
        return _bind$28;
      }
      const _tmp$10 = { _0: "note", _1: _tmp$9 };
      const _bind$29 = _M0FP38portable8research13researchcheck3req(fields, "basisFindingIds");
      let _tmp$11;
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        _tmp$11 = _ok._0;
      } else {
        return _bind$29;
      }
      const _tmp$12 = { _0: "basisFindingIds", _1: _tmp$11 };
      const _tmp$13 = { _0: "sourceChecks", _1: new _M0DTPB4Json5Array(checks) };
      const _bind$30 = _M0FP38portable8research13researchcheck3req(fields, "remainingChecks");
      let _tmp$14;
      if (_bind$30.$tag === 1) {
        const _ok = _bind$30;
        _tmp$14 = _ok._0;
      } else {
        return _bind$30;
      }
      const _bind$31 = [_tmp$6, _tmp$8, _tmp$10, _tmp$12, _tmp$13, { _0: "remainingChecks", _1: _tmp$14 }];
      const _p$2 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$31, 0, 6));
      _M0MPC15array5Array4pushGsE(reviews, new _M0DTPB4Json6Object(_p$2));
      _tmp$4 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const unreviewed = [];
  const _bind$21 = finding_ids.length;
  let _tmp$5 = 0;
  while (true) {
    const _ = _tmp$5;
    if (_ < _bind$21) {
      const id = finding_ids[_];
      if (!_M0MPB3Map8containsGsbE(seen, id)) {
        _M0MPC15array5Array4pushGsE(unreviewed, new _M0DTPB4Json6String(id));
      }
      _tmp$5 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const reviewed_json = [];
  const _bind$22 = reviewed_ids.length;
  let _tmp$6 = 0;
  while (true) {
    const _ = _tmp$6;
    if (_ < _bind$22) {
      const id = reviewed_ids[_];
      _M0MPC15array5Array4pushGsE(reviewed_json, new _M0DTPB4Json6String(id));
      _tmp$6 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _tmp$7 = { _0: "reviewedFindingIds", _1: new _M0DTPB4Json5Array(reviewed_json) };
  const _tmp$8 = { _0: "unreviewedFindingIds", _1: new _M0DTPB4Json5Array(unreviewed) };
  const _bind$23 = _M0FP38portable8research13researchcheck3req(draft_coverage, "unreadSources");
  let _tmp$9;
  if (_bind$23.$tag === 1) {
    const _ok = _bind$23;
    _tmp$9 = _ok._0;
  } else {
    return _bind$23;
  }
  const _tmp$10 = { _0: "unreadSources", _1: _tmp$9 };
  const _bind$24 = _M0FP38portable8research13researchcheck3req(draft_coverage, "unperformedChecks");
  let _tmp$11;
  if (_bind$24.$tag === 1) {
    const _ok = _bind$24;
    _tmp$11 = _ok._0;
  } else {
    return _bind$24;
  }
  const _bind$25 = [_tmp$7, _tmp$8, _tmp$10, { _0: "unperformedChecks", _1: _tmp$11 }];
  const _p$2 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$25, 0, 4));
  const coverage = new _M0DTPB4Json6Object(_p$2);
  const _bind$26 = _M0FP38portable8research13researchcheck3req(packet, "packetId");
  let _tmp$12;
  if (_bind$26.$tag === 1) {
    const _ok = _bind$26;
    _tmp$12 = _ok._0;
  } else {
    return _bind$26;
  }
  const _tmp$13 = { _0: "packetId", _1: _tmp$12 };
  const _tmp$14 = { _0: "reviews", _1: new _M0DTPB4Json5Array(reviews) };
  const _bind$27 = _M0FP38portable8research13researchcheck3req(draft, "questionActions");
  let _tmp$15;
  if (_bind$27.$tag === 1) {
    const _ok = _bind$27;
    _tmp$15 = _ok._0;
  } else {
    return _bind$27;
  }
  const _tmp$16 = { _0: "questionActions", _1: _tmp$15 };
  const _bind$28 = _M0FP38portable8research13researchcheck3req(draft, "infrastructureObservations");
  let _tmp$17;
  if (_bind$28.$tag === 1) {
    const _ok = _bind$28;
    _tmp$17 = _ok._0;
  } else {
    return _bind$28;
  }
  const _tmp$18 = { _0: "infrastructureObservations", _1: _tmp$17 };
  const _tmp$19 = { _0: "coverage", _1: coverage };
  const _tmp$20 = { _0: "reviewedArtifactSha256", _1: new _M0DTPB4Json6String(candidate) };
  const _p$3 = round + 0;
  const _p$4 = undefined;
  const _tmp$21 = { _0: "round", _1: new _M0DTPB4Json6Number(_p$3, _p$4) };
  const _bind$29 = _M0FP38portable8research13researchcheck3req(draft_peer, "disposition");
  let _tmp$22;
  if (_bind$29.$tag === 1) {
    const _ok = _bind$29;
    _tmp$22 = _ok._0;
  } else {
    return _bind$29;
  }
  const _tmp$23 = { _0: "disposition", _1: _tmp$22 };
  const _bind$30 = _M0FP38portable8research13researchcheck3req(draft_peer, "issues");
  let _tmp$24;
  if (_bind$30.$tag === 1) {
    const _ok = _bind$30;
    _tmp$24 = _ok._0;
  } else {
    return _bind$30;
  }
  const _bind$31 = [_tmp$20, _tmp$21, _tmp$23, { _0: "issues", _1: _tmp$24 }];
  const _p$5 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$31, 0, 4));
  const _bind$32 = [_tmp$13, _tmp$14, _tmp$16, _tmp$18, _tmp$19, { _0: "peerReview", _1: new _M0DTPB4Json6Object(_p$5) }];
  const _p$6 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$32, 0, 6));
  const review = new _M0DTPB4Json6Object(_p$6);
  const validation = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind$33 = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp$25;
  if (_bind$33.$tag === 1) {
    const _ok = _bind$33;
    _tmp$25 = _ok._0;
  } else {
    return _bind$33;
  }
  _M0MPB3Map3setGsRPB4JsonE(validation, "sources", _tmp$25);
  _M0MPB3Map3setGsRPB4JsonE(validation, "candidateSha256", new _M0DTPB4Json6String(candidate));
  _M0MPB3Map3setGsRPB4JsonE(validation, "packet", new _M0DTPB4Json6Object(packet));
  _M0MPB3Map3setGsRPB4JsonE(validation, "review", review);
  const _bind$34 = _M0MPB3Map3getGsRPB4JsonE(request, "candidateValue");
  if (_bind$34 === undefined) {
  } else {
    const _Some = _bind$34;
    const _value = _Some;
    _M0MPB3Map3setGsRPB4JsonE(validation, "candidateValue", _value);
  }
  const _bind$35 = _M0FP38portable8research13researchcheck16validate__review(validation);
  if (_bind$35.$tag === 1) {
    const _ok = _bind$35;
    _ok._0;
  } else {
    return _bind$35;
  }
  const _p$7 = true;
  const _tmp$26 = { _0: "ok", _1: _p$7 ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _p$8 = [];
  const _bind$36 = [_tmp$26, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$8) }, { _0: "review", _1: review }];
  const _p$9 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$36, 0, 3));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$9));
}
function _M0FP38portable8research13researchcheck12finding__key(fields) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, "id");
  let primary;
  if (_bind === undefined) {
    primary = undefined;
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x.$tag === 4) {
      const _String = _x;
      const _text = _String._0;
      if (_text === "") {
        const _bind$2 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("empty_finding_id");
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          primary = _ok._0;
        } else {
          return _bind$2;
        }
      } else {
        primary = _text;
      }
    } else {
      const _bind$2 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("invalid_finding_id");
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        primary = _ok._0;
      } else {
        return _bind$2;
      }
    }
  }
  const _bind$2 = _M0MPB3Map3getGsRPB4JsonE(fields, "findingId");
  let secondary;
  if (_bind$2 === undefined) {
    secondary = undefined;
  } else {
    const _Some = _bind$2;
    const _x = _Some;
    if (_x.$tag === 4) {
      const _String = _x;
      const _text = _String._0;
      if (_text === "") {
        const _bind$3 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("empty_finding_id");
        if (_bind$3.$tag === 1) {
          const _ok = _bind$3;
          secondary = _ok._0;
        } else {
          return _bind$3;
        }
      } else {
        secondary = _text;
      }
    } else {
      const _bind$3 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("invalid_finding_id");
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        secondary = _ok._0;
      } else {
        return _bind$3;
      }
    }
  }
  if (primary === undefined) {
    if (secondary === undefined) {
      return _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("missing_finding_id");
    } else {
      const _Some = secondary;
      const _finding_id = _Some;
      return new _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(_finding_id);
    }
  } else {
    const _Some = primary;
    const _id = _Some;
    if (secondary === undefined) {
      return new _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(_id);
    } else {
      const _Some$2 = secondary;
      const _finding_id = _Some$2;
      return !(_id === _finding_id) ? _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("conflicting_finding_id") : new _M0DTPC16result6ResultGsRP38portable8research13researchcheck7InvalidE2Ok(_id);
    }
  }
}
function _M0FP38portable8research13researchcheck15build__revision(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _shas = _bind$3._1;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__obj(request, "packet");
  let packet;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    packet = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research13researchcheck8req__arr(packet, "allowedSourceFiles");
  let _tmp$2;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _tmp$2 = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck13bind__allowed(_tmp$2, _shas);
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck8req__str(request, "candidateSha256");
  let candidate_hash;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    candidate_hash = _ok._0;
  } else {
    return _bind$7;
  }
  if (!_M0FP38portable8research13researchcheck10valid__sha(candidate_hash)) {
    const _bind$8 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_candidate_hash");
    if (_bind$8.$tag === 1) {
      const _ok = _bind$8;
      _ok._0;
    } else {
      return _bind$8;
    }
  }
  const _bind$8 = _M0FP38portable8research13researchcheck8req__obj(packet, "peerReview");
  let packet_peer;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    packet_peer = _ok._0;
  } else {
    return _bind$8;
  }
  const _bind$9 = _M0FP38portable8research13researchcheck8req__str(packet_peer, "reviewedArtifactSha256");
  let _p;
  if (_bind$9.$tag === 1) {
    const _ok = _bind$9;
    _p = _ok._0;
  } else {
    return _bind$9;
  }
  if (!(_p === candidate_hash)) {
    const _bind$10 = _M0FP38portable8research13researchcheck6rejectGuE("packet_candidate_hash_mismatch");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      _ok._0;
    } else {
      return _bind$10;
    }
  }
  const _bind$10 = _M0MPB3Map3getGsRPB4JsonE(request, "candidateValue");
  let candidate_value;
  if (_bind$10 === undefined) {
    const _bind$11 = _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("candidate_value_required");
    if (_bind$11.$tag === 1) {
      const _ok = _bind$11;
      candidate_value = _ok._0;
    } else {
      return _bind$11;
    }
  } else {
    const _Some = _bind$10;
    const _value = _Some;
    const _bind$11 = _M0FP38portable8research13researchcheck7as__obj(_value);
    if (_bind$11.$tag === 1) {
      const _ok = _bind$11;
      candidate_value = _ok._0;
    } else {
      return _bind$11;
    }
  }
  const _bind$11 = ["sha256", "hash", "round", "reviewedArtifactSha256", "packetId"];
  const _bind$12 = _bind$11.length;
  let _tmp$3 = 0;
  while (true) {
    const _ = _tmp$3;
    if (_ < _bind$12) {
      const reserved = _bind$11[_];
      if (_M0MPB3Map8containsGsRPB4JsonE(candidate_value, reserved)) {
        const _bind$13 = _M0FP38portable8research13researchcheck6rejectGuE(`candidate_generated_field_${reserved}`);
        if (_bind$13.$tag === 1) {
          const _ok = _bind$13;
          _ok._0;
        } else {
          return _bind$13;
        }
      }
      _tmp$3 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$13 = _M0MPB3Map3getGsRPB4JsonE(packet_peer, "candidateDraft");
  if (_bind$13 === undefined) {
  } else {
    const _Some = _bind$13;
    const _x = _Some;
    if (_x.$tag === 0) {
    } else {
      if (!_M0FP38portable8research13researchcheck11json__equal(_x, new _M0DTPB4Json6Object(candidate_value))) {
        const _bind$14 = _M0FP38portable8research13researchcheck6rejectGuE("candidate_draft_mismatch");
        if (_bind$14.$tag === 1) {
          const _ok = _bind$14;
          _ok._0;
        } else {
          return _bind$14;
        }
      }
    }
  }
  const _bind$14 = _M0FP38portable8research13researchcheck8req__arr(candidate_value, "findings");
  let original;
  if (_bind$14.$tag === 1) {
    const _ok = _bind$14;
    original = _ok._0;
  } else {
    return _bind$14;
  }
  const index = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const positions = _M0MPB3Map11new_2einnerGsiE(8);
  let position = 0;
  const _bind$15 = original.length;
  let _tmp$4 = 0;
  while (true) {
    const _ = _tmp$4;
    if (_ < _bind$15) {
      const finding = original[_];
      const _bind$16 = _M0FP38portable8research13researchcheck7as__obj(finding);
      let fields;
      if (_bind$16.$tag === 1) {
        const _ok = _bind$16;
        fields = _ok._0;
      } else {
        return _bind$16;
      }
      const _bind$17 = _M0FP38portable8research13researchcheck12finding__key(fields);
      let id;
      if (_bind$17.$tag === 1) {
        const _ok = _bind$17;
        id = _ok._0;
      } else {
        return _bind$17;
      }
      if (_M0MPB3Map8containsGsRPB3MapGsRPB4JsonEE(index, id)) {
        const _bind$18 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_candidate_finding");
        if (_bind$18.$tag === 1) {
          const _ok = _bind$18;
          _ok._0;
        } else {
          return _bind$18;
        }
      }
      _M0MPB3Map3setGsRPB3MapGsRPB4JsonEE(index, id, _M0FP38portable8research13researchcheck13clone__object(fields));
      _M0MPB3Map3setGsiE(positions, id, position);
      position = position + 1 | 0;
      _tmp$4 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$16 = _M0FP38portable8research13researchcheck8req__obj(request, "draft");
  let draft;
  if (_bind$16.$tag === 1) {
    const _ok = _bind$16;
    draft = _ok._0;
  } else {
    return _bind$16;
  }
  const _bind$17 = _M0FP38portable8research13researchcheck15reject__unknown(draft, ["findingPatches", "issueResponses", "remainingChecks"]);
  if (_bind$17.$tag === 1) {
    const _ok = _bind$17;
    _ok._0;
  } else {
    return _bind$17;
  }
  const patch_seen = _M0MPB3Map11new_2einnerGsbE(8);
  const refs = [];
  const _bind$18 = _M0FP38portable8research13researchcheck8req__arr(draft, "findingPatches");
  let _bind$19;
  if (_bind$18.$tag === 1) {
    const _ok = _bind$18;
    _bind$19 = _ok._0;
  } else {
    return _bind$18;
  }
  const _bind$20 = _bind$19.length;
  let _tmp$5 = 0;
  while (true) {
    const _ = _tmp$5;
    if (_ < _bind$20) {
      const item = _bind$19[_];
      const _bind$21 = _M0FP38portable8research13researchcheck7as__obj(item);
      let patch;
      if (_bind$21.$tag === 1) {
        const _ok = _bind$21;
        patch = _ok._0;
      } else {
        return _bind$21;
      }
      const _bind$22 = _M0FP38portable8research13researchcheck15reject__unknown(patch, ["findingId", "statement", "limitations", "decisionImpact", "kind", "evidenceRefs"]);
      if (_bind$22.$tag === 1) {
        const _ok = _bind$22;
        _ok._0;
      } else {
        return _bind$22;
      }
      const _bind$23 = _M0FP38portable8research13researchcheck13nonempty__str(patch, "findingId");
      let finding_id;
      if (_bind$23.$tag === 1) {
        const _ok = _bind$23;
        finding_id = _ok._0;
      } else {
        return _bind$23;
      }
      const _bind$24 = _M0MPB3Map3getGsRPB3MapGsRPB4JsonEE(index, finding_id);
      let target;
      if (_bind$24 === undefined) {
        const _bind$25 = _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("unknown_patch_finding");
        if (_bind$25.$tag === 1) {
          const _ok = _bind$25;
          target = _ok._0;
        } else {
          return _bind$25;
        }
      } else {
        const _Some = _bind$24;
        target = _Some;
      }
      if (_M0MPB3Map8containsGsbE(patch_seen, finding_id)) {
        const _bind$25 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_patch_finding");
        if (_bind$25.$tag === 1) {
          const _ok = _bind$25;
          _ok._0;
        } else {
          return _bind$25;
        }
      }
      _M0MPB3Map3setGsbE(patch_seen, finding_id, true);
      const _bind$25 = _M0MPB3Map3getGsRPB4JsonE(patch, "kind");
      if (_bind$25 === undefined) {
      } else {
        const _Some = _bind$25;
        const _value = _Some;
        const _bind$26 = _M0FP38portable8research13researchcheck7as__str(_value);
        let _p$2;
        if (_bind$26.$tag === 1) {
          const _ok = _bind$26;
          _p$2 = _ok._0;
        } else {
          return _bind$26;
        }
        const _bind$27 = _M0FP38portable8research13researchcheck3req(target, "kind");
        let _tmp$6;
        if (_bind$27.$tag === 1) {
          const _ok = _bind$27;
          _tmp$6 = _ok._0;
        } else {
          return _bind$27;
        }
        const _bind$28 = _M0FP38portable8research13researchcheck7as__str(_tmp$6);
        let _p$3;
        if (_bind$28.$tag === 1) {
          const _ok = _bind$28;
          _p$3 = _ok._0;
        } else {
          return _bind$28;
        }
        if (!(_p$2 === _p$3)) {
          const _bind$29 = _M0FP38portable8research13researchcheck6rejectGuE("kind_change");
          if (_bind$29.$tag === 1) {
            const _ok = _bind$29;
            _ok._0;
          } else {
            return _bind$29;
          }
        }
      }
      const _bind$26 = _M0FP38portable8research13researchcheck13nonempty__str(patch, "statement");
      let _p$2;
      if (_bind$26.$tag === 1) {
        const _ok = _bind$26;
        _p$2 = _ok._0;
      } else {
        return _bind$26;
      }
      _M0MPB3Map3setGsRPB4JsonE(target, "statement", new _M0DTPB4Json6String(_p$2));
      const _bind$27 = _M0FP38portable8research13researchcheck8req__arr(patch, "limitations");
      let limitations;
      if (_bind$27.$tag === 1) {
        const _ok = _bind$27;
        limitations = _ok._0;
      } else {
        return _bind$27;
      }
      const _bind$28 = limitations.length;
      let _tmp$6 = 0;
      while (true) {
        const _$2 = _tmp$6;
        if (_$2 < _bind$28) {
          const limitation = limitations[_$2];
          const _bind$29 = _M0FP38portable8research13researchcheck7as__str(limitation);
          if (_bind$29.$tag === 1) {
            const _ok = _bind$29;
            _ok._0;
          } else {
            return _bind$29;
          }
          _tmp$6 = _$2 + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      _M0MPB3Map3setGsRPB4JsonE(target, "limitations", new _M0DTPB4Json5Array(limitations));
      const _bind$29 = _M0FP38portable8research13researchcheck13nonempty__str(patch, "decisionImpact");
      let _p$3;
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        _p$3 = _ok._0;
      } else {
        return _bind$29;
      }
      _M0MPB3Map3setGsRPB4JsonE(target, "decisionImpact", new _M0DTPB4Json6String(_p$3));
      const _bind$30 = _M0MPB3Map3getGsRPB4JsonE(patch, "evidenceRefs");
      if (_bind$30 === undefined) {
      } else {
        const _Some = _bind$30;
        const _value = _Some;
        const _bind$31 = _M0FP38portable8research13researchcheck7as__arr(_value);
        let raw_evidence;
        if (_bind$31.$tag === 1) {
          const _ok = _bind$31;
          raw_evidence = _ok._0;
        } else {
          return _bind$31;
        }
        if (raw_evidence.length === 0) {
          const _bind$32 = _M0FP38portable8research13researchcheck6rejectGuE("empty_evidence");
          if (_bind$32.$tag === 1) {
            const _ok = _bind$32;
            _ok._0;
          } else {
            return _bind$32;
          }
        }
        const _bind$32 = _M0MPB3Map3getGsiE(positions, finding_id);
        let finding_position;
        if (_bind$32 === undefined) {
          const _bind$33 = _M0FP38portable8research13researchcheck6rejectGiE("unknown_patch_finding");
          if (_bind$33.$tag === 1) {
            const _ok = _bind$33;
            finding_position = _ok._0;
          } else {
            return _bind$33;
          }
        } else {
          const _Some$2 = _bind$32;
          finding_position = _Some$2;
        }
        const evidence = [];
        let evidence_index = 0;
        const _bind$33 = raw_evidence.length;
        let _tmp$7 = 0;
        while (true) {
          const _$2 = _tmp$7;
          if (_$2 < _bind$33) {
            const entry = raw_evidence[_$2];
            const _bind$34 = _M0FP38portable8research13researchcheck17extract__citation(entry, _texts, _shas);
            let citation;
            if (_bind$34.$tag === 1) {
              const _ok = _bind$34;
              citation = _ok._0;
            } else {
              return _bind$34;
            }
            const _bind$35 = _M0FP38portable8research13researchcheck12evidence__of(citation);
            let _tmp$8;
            if (_bind$35.$tag === 1) {
              const _ok = _bind$35;
              _tmp$8 = _ok._0;
            } else {
              return _bind$35;
            }
            _M0MPC15array5Array4pushGsE(evidence, _tmp$8);
            const _bind$36 = _M0FP38portable8research13researchcheck7as__obj(citation);
            let _tmp$9;
            if (_bind$36.$tag === 1) {
              const _ok = _bind$36;
              _tmp$9 = _ok._0;
            } else {
              return _bind$36;
            }
            const record = _M0FP38portable8research13researchcheck13clone__object(_tmp$9);
            const _p$4 = finding_position + 0;
            const _p$5 = undefined;
            _M0MPB3Map3setGsRPB4JsonE(record, "findingIndex", new _M0DTPB4Json6Number(_p$4, _p$5));
            const _p$6 = evidence_index + 0;
            const _p$7 = undefined;
            _M0MPB3Map3setGsRPB4JsonE(record, "evidenceIndex", new _M0DTPB4Json6Number(_p$6, _p$7));
            _M0MPC15array5Array4pushGsE(refs, new _M0DTPB4Json6Object(record));
            evidence_index = evidence_index + 1 | 0;
            _tmp$7 = _$2 + 1 | 0;
            continue;
          } else {
            break;
          }
        }
        _M0MPB3Map3setGsRPB4JsonE(target, "evidence", new _M0DTPB4Json5Array(evidence));
      }
      _tmp$5 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const revised = [];
  const _bind$21 = original.length;
  let _tmp$6 = 0;
  while (true) {
    const _ = _tmp$6;
    if (_ < _bind$21) {
      const finding = original[_];
      const _bind$22 = _M0FP38portable8research13researchcheck7as__obj(finding);
      let _tmp$7;
      if (_bind$22.$tag === 1) {
        const _ok = _bind$22;
        _tmp$7 = _ok._0;
      } else {
        return _bind$22;
      }
      const _bind$23 = _M0FP38portable8research13researchcheck12finding__key(_tmp$7);
      let id;
      if (_bind$23.$tag === 1) {
        const _ok = _bind$23;
        id = _ok._0;
      } else {
        return _bind$23;
      }
      const _bind$24 = _M0MPB3Map3getGsRPB3MapGsRPB4JsonEE(index, id);
      if (_bind$24 === undefined) {
        const _bind$25 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_patch_finding");
        if (_bind$25.$tag === 1) {
          const _ok = _bind$25;
          _ok._0;
        } else {
          return _bind$25;
        }
      } else {
        const _Some = _bind$24;
        const _fields = _Some;
        _M0MPC15array5Array4pushGsE(revised, new _M0DTPB4Json6Object(_fields));
      }
      _tmp$6 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const candidate_fields = _M0FP38portable8research13researchcheck13clone__object(candidate_value);
  _M0MPB3Map3setGsRPB4JsonE(candidate_fields, "findings", new _M0DTPB4Json5Array(revised));
  const _bind$22 = _M0FP38portable8research13researchcheck8req__arr(packet_peer, "previousIssues");
  let previous_issues;
  if (_bind$22.$tag === 1) {
    const _ok = _bind$22;
    previous_issues = _ok._0;
  } else {
    return _bind$22;
  }
  const expected = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$23 = previous_issues.length;
  let _tmp$7 = 0;
  while (true) {
    const _ = _tmp$7;
    if (_ < _bind$23) {
      const issue = previous_issues[_];
      const _bind$24 = _M0FP38portable8research13researchcheck7as__obj(issue);
      let _tmp$8;
      if (_bind$24.$tag === 1) {
        const _ok = _bind$24;
        _tmp$8 = _ok._0;
      } else {
        return _bind$24;
      }
      const _bind$25 = _M0FP38portable8research13researchcheck13nonempty__str(_tmp$8, "id");
      let _tmp$9;
      if (_bind$25.$tag === 1) {
        const _ok = _bind$25;
        _tmp$9 = _ok._0;
      } else {
        return _bind$25;
      }
      _M0MPB3Map3setGsbE(expected, _tmp$9, true);
      _tmp$7 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const responses = [];
  const seen_response = _M0MPB3Map11new_2einnerGsbE(8);
  const _bind$24 = _M0FP38portable8research13researchcheck8req__arr(draft, "issueResponses");
  let _bind$25;
  if (_bind$24.$tag === 1) {
    const _ok = _bind$24;
    _bind$25 = _ok._0;
  } else {
    return _bind$24;
  }
  const _bind$26 = _bind$25.length;
  let _tmp$8 = 0;
  while (true) {
    const _ = _tmp$8;
    if (_ < _bind$26) {
      const item = _bind$25[_];
      const _bind$27 = _M0FP38portable8research13researchcheck7as__obj(item);
      let response;
      if (_bind$27.$tag === 1) {
        const _ok = _bind$27;
        response = _ok._0;
      } else {
        return _bind$27;
      }
      const _bind$28 = _M0FP38portable8research13researchcheck15reject__unknown(response, ["id", "state", "note"]);
      if (_bind$28.$tag === 1) {
        const _ok = _bind$28;
        _ok._0;
      } else {
        return _bind$28;
      }
      const _bind$29 = _M0FP38portable8research13researchcheck13nonempty__str(response, "id");
      let issue_id;
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        issue_id = _ok._0;
      } else {
        return _bind$29;
      }
      if (!_M0MPB3Map8containsGsbE(expected, issue_id)) {
        const _bind$30 = _M0FP38portable8research13researchcheck6rejectGuE("unknown_issue_response");
        if (_bind$30.$tag === 1) {
          const _ok = _bind$30;
          _ok._0;
        } else {
          return _bind$30;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen_response, issue_id)) {
        const _bind$30 = _M0FP38portable8research13researchcheck6rejectGuE("duplicate_issue_response");
        if (_bind$30.$tag === 1) {
          const _ok = _bind$30;
          _ok._0;
        } else {
          return _bind$30;
        }
      }
      _M0MPB3Map3setGsbE(seen_response, issue_id, true);
      const _bind$30 = _M0FP38portable8research13researchcheck13nonempty__str(response, "state");
      let state;
      if (_bind$30.$tag === 1) {
        const _ok = _bind$30;
        state = _ok._0;
      } else {
        return _bind$30;
      }
      if (!_M0MPC15array5Array8containsGsE(["resolved", "disputed"], state)) {
        const _bind$31 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_issue_response_state");
        if (_bind$31.$tag === 1) {
          const _ok = _bind$31;
          _ok._0;
        } else {
          return _bind$31;
        }
      }
      const _bind$31 = _M0FP38portable8research13researchcheck8req__str(response, "note");
      if (_bind$31.$tag === 1) {
        const _ok = _bind$31;
        _ok._0;
      } else {
        return _bind$31;
      }
      _M0MPC15array5Array4pushGsE(responses, new _M0DTPB4Json6Object(response));
      _tmp$8 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  if (_M0MPB3Map9to__arrayGsbE(seen_response).length !== _M0MPB3Map9to__arrayGsbE(expected).length) {
    const _bind$27 = _M0FP38portable8research13researchcheck6rejectGuE("issue_response_coverage");
    if (_bind$27.$tag === 1) {
      const _ok = _bind$27;
      _ok._0;
    } else {
      return _bind$27;
    }
  }
  const _bind$27 = _M0FP38portable8research13researchcheck8req__arr(draft, "remainingChecks");
  let remaining_checks;
  if (_bind$27.$tag === 1) {
    const _ok = _bind$27;
    remaining_checks = _ok._0;
  } else {
    return _bind$27;
  }
  const _bind$28 = remaining_checks.length;
  let _tmp$9 = 0;
  while (true) {
    const _ = _tmp$9;
    if (_ < _bind$28) {
      const check = remaining_checks[_];
      const _bind$29 = _M0FP38portable8research13researchcheck7as__str(check);
      if (_bind$29.$tag === 1) {
        const _ok = _bind$29;
        _ok._0;
      } else {
        return _bind$29;
      }
      _tmp$9 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _p$2 = true;
  const _tmp$10 = { _0: "ok", _1: _p$2 ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _p$3 = [];
  const _bind$29 = [_tmp$10, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$3) }, { _0: "candidate", _1: new _M0DTPB4Json6Object(candidate_fields) }, { _0: "issueResponses", _1: new _M0DTPB4Json5Array(responses) }, { _0: "remainingChecks", _1: new _M0DTPB4Json5Array(remaining_checks) }, { _0: "sourceRefs", _1: new _M0DTPB4Json5Array(refs) }];
  const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$29, 0, 6));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$4));
}
function _M0FP38portable8research13researchcheck16occurrence__json(occurrences) {
  const items = [];
  const _bind = occurrences.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const occ = occurrences[_];
      const _bind$2 = [{ _0: "line", _1: _M0IPC13int3IntPB6ToJson8to__json(occ._0) }, { _0: "column", _1: _M0IPC13int3IntPB6ToJson8to__json(occ._1) }];
      const _p = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$2, 0, 2));
      _M0MPC15array5Array4pushGsE(items, new _M0DTPB4Json6Object(_p));
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return items;
}
function _M0FP38portable8research13researchcheck6locate(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__arr(request, "references");
  let references;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    references = _ok._0;
  } else {
    return _bind$4;
  }
  const checks = [];
  const errors = [];
  const _bind$5 = references.length;
  let _tmp$2 = 0;
  while (true) {
    const _ = _tmp$2;
    if (_ < _bind$5) {
      const item = references[_];
      const _bind$6 = _M0FP38portable8research13researchcheck7as__obj(item);
      let fields;
      if (_bind$6.$tag === 1) {
        const _ok = _bind$6;
        fields = _ok._0;
      } else {
        return _bind$6;
      }
      const _bind$7 = _M0FP38portable8research13researchcheck8req__str(fields, "path");
      let path;
      if (_bind$7.$tag === 1) {
        const _ok = _bind$7;
        path = _ok._0;
      } else {
        return _bind$7;
      }
      if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
        const _bind$8 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_reference_path");
        if (_bind$8.$tag === 1) {
          const _ok = _bind$8;
          _ok._0;
        } else {
          return _bind$8;
        }
      }
      const _bind$8 = _M0FP38portable8research13researchcheck8req__str(fields, "quote");
      let quote;
      if (_bind$8.$tag === 1) {
        const _ok = _bind$8;
        quote = _ok._0;
      } else {
        return _bind$8;
      }
      if (quote === "") {
        const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("empty_quote");
        if (_bind$9.$tag === 1) {
          const _ok = _bind$9;
          _ok._0;
        } else {
          return _bind$9;
        }
      }
      const _bind$9 = _M0MPB3Map3getGsRPB5ArrayGcEE(_texts, path);
      let hay;
      if (_bind$9.$tag === 1) {
        const _Some = _bind$9;
        hay = _Some._0;
      } else {
        const _bind$10 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("unknown_reference_path");
        if (_bind$10.$tag === 1) {
          const _ok = _bind$10;
          hay = _ok._0;
        } else {
          return _bind$10;
        }
      }
      let anchor;
      _L: {
        _L$2: {
          const _bind$10 = _M0MPB3Map3getGsRPB4JsonE(fields, "line");
          if (_bind$10 === undefined) {
            break _L$2;
          } else {
            const _Some = _bind$10;
            const _x = _Some;
            if (_x.$tag === 0) {
              break _L$2;
            } else {
              const _bind$11 = _M0FP38portable8research13researchcheck12as__pos__int(_x);
              if (_bind$11.$tag === 1) {
                const _ok = _bind$11;
                anchor = _ok._0;
              } else {
                return _bind$11;
              }
            }
          }
          break _L;
        }
        anchor = undefined;
      }
      const occurrences = _M0FP38portable8research13researchcheck17find__occurrences(hay, _M0MPC16string6String9to__array(quote));
      let matched = false;
      if (anchor === undefined) {
        matched = !(occurrences.length === 0);
      } else {
        const _Some = anchor;
        const _line = _Some;
        const _bind$10 = occurrences.length;
        let _tmp$3 = 0;
        while (true) {
          const _$2 = _tmp$3;
          if (_$2 < _bind$10) {
            const occ = occurrences[_$2];
            if (occ._0 === _line) {
              matched = true;
            }
            _tmp$3 = _$2 + 1 | 0;
            continue;
          } else {
            break;
          }
        }
      }
      const _bind$10 = [{ _0: "matched", _1: _M0IPC14bool4BoolPB6ToJson8to__json(matched) }, { _0: "occurrences", _1: _M0IPC15array5ArrayPB6ToJson8to__jsonGRPB4JsonE(_M0FP38portable8research13researchcheck16occurrence__json(occurrences)) }];
      const _p = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$10, 0, 2));
      _M0MPC15array5Array4pushGsE(checks, new _M0DTPB4Json6Object(_p));
      if (!matched) {
        const _p$2 = "quote_not_at_anchor";
        const _bind$11 = [{ _0: "code", _1: new _M0DTPB4Json6String(_p$2) }];
        const _p$3 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$11, 0, 1));
        _M0MPC15array5Array4pushGsE(errors, new _M0DTPB4Json6Object(_p$3));
      }
      _tmp$2 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$6 = [{ _0: "ok", _1: _M0IPC14bool4BoolPB6ToJson8to__json(errors.length === 0) }, { _0: "errors", _1: _M0IPC15array5ArrayPB6ToJson8to__jsonGRPB4JsonE(errors) }, { _0: "checks", _1: _M0IPC15array5ArrayPB6ToJson8to__jsonGRPB4JsonE(checks) }];
  const _p = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$6, 0, 3));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p));
}
function _M0FP38portable8research13researchcheck5quote(request) {
  const _bind = _M0FP38portable8research13researchcheck3req(request, "sources");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck14parse__sources(_tmp);
  let _bind$3;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    _bind$3 = _ok._0;
  } else {
    return _bind$2;
  }
  const _texts = _bind$3._0;
  const _shas = _bind$3._1;
  const _bind$4 = _M0FP38portable8research13researchcheck8req__str(request, "path");
  let path;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    path = _ok._0;
  } else {
    return _bind$4;
  }
  if (!_M0FP38portable8research13researchcheck10safe__path(path)) {
    const _bind$5 = _M0FP38portable8research13researchcheck6rejectGuE("unsafe_path");
    if (_bind$5.$tag === 1) {
      const _ok = _bind$5;
      _ok._0;
    } else {
      return _bind$5;
    }
  }
  const _bind$5 = _M0FP38portable8research13researchcheck3req(request, "fromLine");
  let _tmp$2;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _tmp$2 = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$2);
  let from_line;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    from_line = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research13researchcheck3req(request, "toLine");
  let _tmp$3;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    _tmp$3 = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research13researchcheck12as__pos__int(_tmp$3);
  let to_line;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    to_line = _ok._0;
  } else {
    return _bind$8;
  }
  if (from_line > to_line) {
    const _bind$9 = _M0FP38portable8research13researchcheck6rejectGuE("invalid_range");
    if (_bind$9.$tag === 1) {
      const _ok = _bind$9;
      _ok._0;
    } else {
      return _bind$9;
    }
  }
  const _bind$9 = _M0MPB3Map3getGsRPB5ArrayGcEE(_texts, path);
  let chars;
  if (_bind$9.$tag === 1) {
    const _Some = _bind$9;
    chars = _Some._0;
  } else {
    const _bind$10 = _M0FP38portable8research13researchcheck6rejectGRPB5ArrayGcEE("unknown_path");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      chars = _ok._0;
    } else {
      return _bind$10;
    }
  }
  if (to_line > _M0FP38portable8research13researchcheck11line__count(chars)) {
    const _bind$10 = _M0FP38portable8research13researchcheck6rejectGuE("range_out_of_bounds");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      _ok._0;
    } else {
      return _bind$10;
    }
  }
  const text = _M0FP38portable8research13researchcheck14extract__lines(chars, from_line, to_line);
  const _bind$10 = _M0MPB3Map3getGssE(_shas, path);
  let sha;
  if (_bind$10 === undefined) {
    const _bind$11 = _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("unknown_path");
    if (_bind$11.$tag === 1) {
      const _ok = _bind$11;
      sha = _ok._0;
    } else {
      return _bind$11;
    }
  } else {
    const _Some = _bind$10;
    sha = _Some;
  }
  const _p = true;
  const _tmp$4 = { _0: "ok", _1: _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _p$2 = [];
  const _bind$11 = [_tmp$4, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$2) }, { _0: "path", _1: new _M0DTPB4Json6String(path) }, { _0: "line", _1: _M0IPC13int3IntPB6ToJson8to__json(from_line) }, { _0: "endLine", _1: _M0IPC13int3IntPB6ToJson8to__json(to_line) }, { _0: "quote", _1: new _M0DTPB4Json6String(text) }, { _0: "sha256", _1: new _M0DTPB4Json6String(sha) }];
  const _p$3 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$11, 0, 7));
  return new _M0DTPC16result6ResultGRPB4JsonRP38portable8research13researchcheck7InvalidE2Ok(new _M0DTPB4Json6Object(_p$3));
}
function _M0FP38portable8research13researchcheck8dispatch(value) {
  const _bind = _M0FP38portable8research13researchcheck7as__obj(value);
  let request;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    request = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research13researchcheck8req__str(request, "op");
  let op;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    op = _ok._0;
  } else {
    return _bind$2;
  }
  switch (op) {
    case "locate": {
      return _M0FP38portable8research13researchcheck6locate(request);
    }
    case "quote": {
      return _M0FP38portable8research13researchcheck5quote(request);
    }
    case "validateReview": {
      return _M0FP38portable8research13researchcheck16validate__review(request);
    }
    case "buildResearch": {
      return _M0FP38portable8research13researchcheck15build__research(request);
    }
    case "buildReview": {
      return _M0FP38portable8research13researchcheck13build__review(request);
    }
    case "buildRevision": {
      return _M0FP38portable8research13researchcheck15build__revision(request);
    }
    default: {
      return _M0FP38portable8research13researchcheck6rejectGRPB4JsonE("unknown_op");
    }
  }
}
function _M0FP38portable8research13researchcheck11error__json(code) {
  const _p = false;
  const _tmp = { _0: "ok", _1: _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _bind = [{ _0: "code", _1: new _M0DTPB4Json6String(code) }];
  const _p$2 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind, 0, 1));
  const _p$3 = [new _M0DTPB4Json6Object(_p$2)];
  const _bind$2 = [_tmp, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$3) }];
  const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$2, 0, 2));
  return _M0MPC14json4Json17stringify_2einner(new _M0DTPB4Json6Object(_p$4), false, 0, undefined);
}
function _M0FP38portable8research13researchcheck14dispatch__json(input) {
  let parsed;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0FPC14json13parse_2einner(new _M0TPC16string10StringView(input, 0, input.length), 1024);
      if (_bind.$tag === 1) {
        const _ok = _bind;
        parsed = _ok._0;
      } else {
        const _err = _bind;
        _try_err = _err._0;
        break _L$2;
      }
      break _L;
    }
    return _M0FP38portable8research13researchcheck11error__json("invalid_json");
  }
  let result;
  let _try_err$2;
  _L$2: {
    _L$3: {
      const _bind = _M0FP38portable8research13researchcheck8dispatch(parsed);
      if (_bind.$tag === 1) {
        const _ok = _bind;
        result = _ok._0;
      } else {
        const _err = _bind;
        _try_err$2 = _err._0;
        break _L$3;
      }
      break _L$2;
    }
    const _Invalid = _try_err$2;
    const _message = _Invalid._0;
    return _M0FP38portable8research13researchcheck11error__json(_message);
  }
  return _M0MPC14json4Json17stringify_2einner(result, false, 0, undefined);
}
function _M0FP38portable8research16researchcheckcli13err__envelope(code) {
  const _p = false;
  const _tmp = { _0: "ok", _1: _p ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__ };
  const _bind = [{ _0: "code", _1: new _M0DTPB4Json6String(code) }];
  const _p$2 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind, 0, 1));
  const _p$3 = [new _M0DTPB4Json6Object(_p$2)];
  const _bind$2 = [_tmp, { _0: "errors", _1: new _M0DTPB4Json5Array(_p$3) }];
  const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$2, 0, 2));
  return new _M0DTPB4Json6Object(_p$4);
}
function _M0FP38portable8research16researchcheckcli8json__ok(result) {
  if (result.$tag === 6) {
    const _Object = result;
    const _fields = _Object._0;
    const _bind = _M0MPB3Map3getGsRPB4JsonE(_fields, "ok");
    if (_bind === undefined) {
      return false;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 1) {
        return true;
      } else {
        return false;
      }
    }
  } else {
    return false;
  }
}
function _M0FP38portable8research16researchcheckcli8is__flag(name) {
  const chars = _M0MPC16string6String9to__array(name);
  return chars.length >= 2 && (_M0MPC15array5Array2atGcE(chars, 0) === 45 && _M0MPC15array5Array2atGcE(chars, 1) === 45);
}
function _M0FP38portable8research16researchcheckcli11parse__args(args) {
  if (args.length === 0) {
    const _bind = _M0FP38portable8research2io4failGuE("missing_command");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  const command = _M0MPC15array5Array2atGRPB4JsonE(args, 0);
  if (!_M0MPC15array5Array8containsGsE(["quote", "locate", "review"], command)) {
    const _bind = _M0FP38portable8research2io4failGuE("unknown_command");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  const flags = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  let index = 1;
  while (true) {
    if (index < args.length) {
      const name = _M0MPC15array5Array2atGRPB4JsonE(args, index);
      if (!_M0FP38portable8research16researchcheckcli8is__flag(name)) {
        const _bind = _M0FP38portable8research2io4failGuE("unexpected_positional");
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          return _bind;
        }
      }
      if ((index + 1 | 0) >= args.length) {
        const _bind = _M0FP38portable8research2io4failGuE("missing_flag_value");
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          return _bind;
        }
      }
      if (_M0MPB3Map8containsGssE(flags, name)) {
        const _bind = _M0FP38portable8research2io4failGuE("duplicate_flag");
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          return _bind;
        }
      }
      _M0MPB3Map3setGssE(flags, name, _M0MPC15array5Array2atGRPB4JsonE(args, index + 1 | 0));
      index = index + 2 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGUsRPB3MapGssEERP38portable8research2io7IoErrorE2Ok({ _0: command, _1: flags });
}
function _M0FP38portable8research16researchcheckcli12check__flags(flags, allowed) {
  const _bind = _M0MPB3Map9to__arrayGssE(flags);
  const _bind$2 = _bind.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind$2) {
      const pair = _bind[_];
      if (!_M0MPC15array5Array8containsGsE(allowed, pair._0)) {
        const _bind$3 = _M0FP38portable8research2io4failGuE(`unknown_flag_${pair._0}`);
        if (_bind$3.$tag === 1) {
          const _ok = _bind$3;
          _ok._0;
        } else {
          return _bind$3;
        }
      }
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok(undefined);
}
function _M0FP38portable8research16researchcheckcli10need__flag(flags, name) {
  const _bind = _M0MPB3Map3getGssE(flags, name);
  if (_bind === undefined) {
    return _M0FP38portable8research2io4failGRPB4JsonE(`missing_flag_${name}`);
  } else {
    const _Some = _bind;
    const _value = _Some;
    return new _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE2Ok(_value);
  }
}
function _M0FP38portable8research16researchcheckcli16parse__int__flag(text) {
  const chars = _M0MPC16string6String9to__array(text);
  if (chars.length === 0) {
    const _bind = _M0FP38portable8research2io4failGuE("invalid_integer");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  let index = 0;
  let negative = false;
  if (_M0MPC15array5Array2atGcE(chars, 0) === 45) {
    negative = true;
    index = 1;
  }
  if (index >= chars.length) {
    const _bind = _M0FP38portable8research2io4failGuE("invalid_integer");
    if (_bind.$tag === 1) {
      const _ok = _bind;
      _ok._0;
    } else {
      return _bind;
    }
  }
  let value = 0;
  while (true) {
    if (index < chars.length) {
      const code = _M0MPC15array5Array2atGcE(chars, index);
      if (code < 48 || code > 57) {
        const _bind = _M0FP38portable8research2io4failGuE("invalid_integer");
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          return _bind;
        }
      }
      const digit = code - 48 | 0;
      if (value > ((2147483647 - digit | 0) / 10 | 0)) {
        const _bind = _M0FP38portable8research2io4failGuE("invalid_integer");
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          return _bind;
        }
      }
      value = (Math.imul(value, 10) | 0) + digit | 0;
      index = index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok(negative ? -value | 0 : value);
}
function _M0FP38portable8research16researchcheckcli10valid__sha(text) {
  const chars = _M0MPC16string6String9to__array(text);
  if (chars.length !== 64) {
    return false;
  }
  const _bind = chars.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const c = chars[_];
      const code = c;
      if (!(code >= 48 && code <= 57 || code >= 97 && code <= 102)) {
        return false;
      }
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP38portable8research16researchcheckcli14relative__safe(path) {
  if (path === "") {
    return false;
  }
  const chars = _M0MPC16string6String9to__array(path);
  if (_M0MPC15array5Array2atGcE(chars, 0) === 47) {
    return false;
  }
  const n = chars.length;
  let start = 0;
  let index = 0;
  while (true) {
    if (index <= n) {
      if (index === n || _M0MPC15array5Array2atGcE(chars, index) === 47) {
        const length = index - start | 0;
        if (length === 0) {
          return false;
        }
        if (length === 1 && _M0MPC15array5Array2atGcE(chars, start) === 46) {
          return false;
        }
        if (length === 2 && (_M0MPC15array5Array2atGcE(chars, start) === 46 && _M0MPC15array5Array2atGcE(chars, start + 1 | 0) === 46)) {
          return false;
        }
        start = index + 1 | 0;
      } else {
        const code = _M0MPC15array5Array2atGcE(chars, index);
        if (code === 92 || (code === 58 || code === 0)) {
          return false;
        }
      }
      index = index + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return true;
}
function _M0FP38portable8research16researchcheckcli14absolute__root(path) {
  const chars = _M0MPC16string6String9to__array(path);
  return !(chars.length === 0) && _M0MPC15array5Array2atGcE(chars, 0) === 47;
}
function _M0FP38portable8research16researchcheckcli12load__record(host, path) {
  const _p = "readRecord";
  const _bind = [{ _0: "op", _1: new _M0DTPB4Json6String(_p) }, { _0: "path", _1: new _M0DTPB4Json6String(path) }];
  const _p$2 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind, 0, 2));
  return _M0FP38portable8research2io4call(host, new _M0DTPB4Json6Object(_p$2));
}
function _M0FP38portable8research16researchcheckcli18load__json__record(host, path) {
  const _bind = _M0FP38portable8research16researchcheckcli12load__record(host, path);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io10as__object(_tmp);
  let fields;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    fields = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research2io8required(fields, "text");
  let _tmp$2;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _tmp$2 = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research2io10as__string(_tmp$2);
  let _tmp$3;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    _tmp$3 = _ok._0;
  } else {
    return _bind$4;
  }
  return _M0FP38portable8research2io5parse(_tmp$3);
}
function _M0FP38portable8research16researchcheckcli12packet__root(packet) {
  const _bind = _M0FP38portable8research2io8required(packet, "frozenSourceRoot");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io10as__string(_tmp);
  let root;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    root = _ok._0;
  } else {
    return _bind$2;
  }
  if (!_M0FP38portable8research16researchcheckcli14absolute__root(root)) {
    const _bind$3 = _M0FP38portable8research2io4failGuE("invalid_source_root");
    if (_bind$3.$tag === 1) {
      const _ok = _bind$3;
      _ok._0;
    } else {
      return _bind$3;
    }
  }
  return new _M0DTPC16result6ResultGsRP38portable8research2io7IoErrorE2Ok(root);
}
function _M0FP38portable8research16researchcheckcli14allowed__files(packet) {
  const _bind = _M0FP38portable8research2io8required(packet, "allowedSourceFiles");
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io9as__array(_tmp);
  let items;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    items = _ok._0;
  } else {
    return _bind$2;
  }
  const seen = _M0MPB3Map11new_2einnerGsbE(8);
  const out = [];
  const _bind$3 = items.length;
  let _tmp$2 = 0;
  while (true) {
    const _ = _tmp$2;
    if (_ < _bind$3) {
      const item = items[_];
      const _bind$4 = _M0FP38portable8research2io10as__object(item);
      let fields;
      if (_bind$4.$tag === 1) {
        const _ok = _bind$4;
        fields = _ok._0;
      } else {
        return _bind$4;
      }
      const _bind$5 = _M0FP38portable8research2io8required(fields, "path");
      let _tmp$3;
      if (_bind$5.$tag === 1) {
        const _ok = _bind$5;
        _tmp$3 = _ok._0;
      } else {
        return _bind$5;
      }
      const _bind$6 = _M0FP38portable8research2io10as__string(_tmp$3);
      let path;
      if (_bind$6.$tag === 1) {
        const _ok = _bind$6;
        path = _ok._0;
      } else {
        return _bind$6;
      }
      if (!_M0FP38portable8research16researchcheckcli14relative__safe(path)) {
        const _bind$7 = _M0FP38portable8research2io4failGuE("unsafe_allowed_path");
        if (_bind$7.$tag === 1) {
          const _ok = _bind$7;
          _ok._0;
        } else {
          return _bind$7;
        }
      }
      const _bind$7 = _M0FP38portable8research2io8required(fields, "sha256");
      let _tmp$4;
      if (_bind$7.$tag === 1) {
        const _ok = _bind$7;
        _tmp$4 = _ok._0;
      } else {
        return _bind$7;
      }
      const _bind$8 = _M0FP38portable8research2io10as__string(_tmp$4);
      let sha;
      if (_bind$8.$tag === 1) {
        const _ok = _bind$8;
        sha = _ok._0;
      } else {
        return _bind$8;
      }
      if (!_M0FP38portable8research16researchcheckcli10valid__sha(sha)) {
        const _bind$9 = _M0FP38portable8research2io4failGuE("invalid_allowed_hash");
        if (_bind$9.$tag === 1) {
          const _ok = _bind$9;
          _ok._0;
        } else {
          return _bind$9;
        }
      }
      if (_M0MPB3Map8containsGsbE(seen, path)) {
        const _bind$9 = _M0FP38portable8research2io4failGuE("duplicate_allowed_path");
        if (_bind$9.$tag === 1) {
          const _ok = _bind$9;
          _ok._0;
        } else {
          return _bind$9;
        }
      }
      _M0MPB3Map3setGsbE(seen, path, true);
      _M0MPC15array5Array4pushGsE(out, { _0: path, _1: sha });
      _tmp$2 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGRPB5ArrayGUssEERP38portable8research2io7IoErrorE2Ok(out);
}
function _M0FP38portable8research16researchcheckcli13load__sources(host, root, allowed) {
  const sources = [];
  const _bind = allowed.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const pair = allowed[_];
      const path = pair._0;
      const expected = pair._1;
      const _p = "researchReadRecord";
      const _tmp$2 = { _0: "op", _1: new _M0DTPB4Json6String(_p) };
      const _tmp$3 = { _0: "root", _1: new _M0DTPB4Json6String(root) };
      const _tmp$4 = { _0: "path", _1: new _M0DTPB4Json6String(path) };
      const _p$2 = 33554432;
      const _p$3 = undefined;
      const _bind$2 = [_tmp$2, _tmp$3, _tmp$4, { _0: "maxBytes", _1: new _M0DTPB4Json6Number(_p$2, _p$3) }];
      const _p$4 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$2, 0, 4));
      const _bind$3 = _M0FP38portable8research2io4call(host, new _M0DTPB4Json6Object(_p$4));
      let record;
      if (_bind$3.$tag === 1) {
        const _ok = _bind$3;
        record = _ok._0;
      } else {
        return _bind$3;
      }
      const _bind$4 = _M0FP38portable8research2io10as__object(record);
      let fields;
      if (_bind$4.$tag === 1) {
        const _ok = _bind$4;
        fields = _ok._0;
      } else {
        return _bind$4;
      }
      const _bind$5 = _M0FP38portable8research2io8required(fields, "text");
      let _tmp$5;
      if (_bind$5.$tag === 1) {
        const _ok = _bind$5;
        _tmp$5 = _ok._0;
      } else {
        return _bind$5;
      }
      const _bind$6 = _M0FP38portable8research2io10as__string(_tmp$5);
      let text;
      if (_bind$6.$tag === 1) {
        const _ok = _bind$6;
        text = _ok._0;
      } else {
        return _bind$6;
      }
      const _bind$7 = _M0FP38portable8research2io8required(fields, "sha256");
      let _tmp$6;
      if (_bind$7.$tag === 1) {
        const _ok = _bind$7;
        _tmp$6 = _ok._0;
      } else {
        return _bind$7;
      }
      const _bind$8 = _M0FP38portable8research2io10as__string(_tmp$6);
      let sha;
      if (_bind$8.$tag === 1) {
        const _ok = _bind$8;
        sha = _ok._0;
      } else {
        return _bind$8;
      }
      if (!(sha === expected)) {
        const _bind$9 = _M0FP38portable8research2io4failGuE("source_hash_mismatch");
        if (_bind$9.$tag === 1) {
          const _ok = _bind$9;
          _ok._0;
        } else {
          return _bind$9;
        }
      }
      const _bind$9 = [{ _0: "path", _1: new _M0DTPB4Json6String(path) }, { _0: "text", _1: new _M0DTPB4Json6String(text) }, { _0: "sha256", _1: new _M0DTPB4Json6String(sha) }];
      const _p$5 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind$9, 0, 3));
      _M0MPC15array5Array4pushGsE(sources, new _M0DTPB4Json6Object(_p$5));
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(sources);
}
function _M0FP38portable8research16researchcheckcli13parse__packet(host, path) {
  const _bind = _M0FP38portable8research16researchcheckcli18load__json__record(host, path);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io10as__object(_tmp);
  let packet;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    packet = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research16researchcheckcli12packet__root(packet);
  let root;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    root = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research16researchcheckcli14allowed__files(packet);
  let allowed;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    allowed = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research16researchcheckcli13load__sources(host, root, allowed);
  let sources;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    sources = _ok._0;
  } else {
    return _bind$5;
  }
  return new _M0DTPC16result6ResultGURPB3MapGsRPB4JsonEsRPB5ArrayGRPB4JsonEERP38portable8research2io7IoErrorE2Ok({ _0: packet, _1: root, _2: sources });
}
function _M0FP38portable8research16researchcheckcli14dispatch__core(request) {
  return _M0FP38portable8research2io5parse(_M0FP38portable8research13researchcheck14dispatch__json(_M0MPC14json4Json17stringify_2einner(new _M0DTPB4Json6Object(request), false, 0, undefined)));
}
function _M0FP38portable8research16researchcheckcli10run__quote(host, flags) {
  const _bind = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--packet");
  let packet_path;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    packet_path = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--path");
  let source_path;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    source_path = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--from");
  let _tmp;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _tmp = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research16researchcheckcli16parse__int__flag(_tmp);
  let from_line;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    from_line = _ok._0;
  } else {
    return _bind$4;
  }
  const _bind$5 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--to");
  let _tmp$2;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _tmp$2 = _ok._0;
  } else {
    return _bind$5;
  }
  const _bind$6 = _M0FP38portable8research16researchcheckcli16parse__int__flag(_tmp$2);
  let to_line;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    to_line = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research16researchcheckcli13parse__packet(host, packet_path);
  let _bind$8;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    _bind$8 = _ok._0;
  } else {
    return _bind$7;
  }
  const _sources = _bind$8._2;
  const request = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _p = "quote";
  _M0MPB3Map3setGsRPB4JsonE(request, "op", new _M0DTPB4Json6String(_p));
  _M0MPB3Map3setGsRPB4JsonE(request, "sources", new _M0DTPB4Json5Array(_sources));
  _M0MPB3Map3setGsRPB4JsonE(request, "path", new _M0DTPB4Json6String(source_path));
  const _p$2 = from_line + 0;
  const _p$3 = undefined;
  _M0MPB3Map3setGsRPB4JsonE(request, "fromLine", new _M0DTPB4Json6Number(_p$2, _p$3));
  const _p$4 = to_line + 0;
  const _p$5 = undefined;
  _M0MPB3Map3setGsRPB4JsonE(request, "toLine", new _M0DTPB4Json6Number(_p$4, _p$5));
  return _M0FP38portable8research16researchcheckcli14dispatch__core(request);
}
function _M0FP38portable8research16researchcheckcli11run__locate(host, flags) {
  const _bind = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--packet");
  let packet_path;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    packet_path = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--refs");
  let refs_path;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    refs_path = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research16researchcheckcli13parse__packet(host, packet_path);
  let _bind$4;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _bind$4 = _ok._0;
  } else {
    return _bind$3;
  }
  const _sources = _bind$4._2;
  const _bind$5 = _M0FP38portable8research16researchcheckcli18load__json__record(host, refs_path);
  let references;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    references = _ok._0;
  } else {
    return _bind$5;
  }
  const request = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _p = "locate";
  _M0MPB3Map3setGsRPB4JsonE(request, "op", new _M0DTPB4Json6String(_p));
  _M0MPB3Map3setGsRPB4JsonE(request, "sources", new _M0DTPB4Json5Array(_sources));
  _M0MPB3Map3setGsRPB4JsonE(request, "references", references);
  return _M0FP38portable8research16researchcheckcli14dispatch__core(request);
}
function _M0FP38portable8research16researchcheckcli11run__review(host, flags) {
  const _bind = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--packet");
  let packet_path;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    packet_path = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--candidate");
  let candidate_path;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    candidate_path = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research16researchcheckcli10need__flag(flags, "--review");
  let review_path;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    review_path = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research16researchcheckcli13parse__packet(host, packet_path);
  let _bind$5;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    _bind$5 = _ok._0;
  } else {
    return _bind$4;
  }
  const _packet = _bind$5._0;
  const _sources = _bind$5._2;
  const _bind$6 = _M0FP38portable8research16researchcheckcli12load__record(host, candidate_path);
  let _tmp;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    _tmp = _ok._0;
  } else {
    return _bind$6;
  }
  const _bind$7 = _M0FP38portable8research2io10as__object(_tmp);
  let candidate_fields;
  if (_bind$7.$tag === 1) {
    const _ok = _bind$7;
    candidate_fields = _ok._0;
  } else {
    return _bind$7;
  }
  const _bind$8 = _M0FP38portable8research2io8required(candidate_fields, "sha256");
  let _tmp$2;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    _tmp$2 = _ok._0;
  } else {
    return _bind$8;
  }
  const _bind$9 = _M0FP38portable8research2io10as__string(_tmp$2);
  let candidate_sha;
  if (_bind$9.$tag === 1) {
    const _ok = _bind$9;
    candidate_sha = _ok._0;
  } else {
    return _bind$9;
  }
  const _bind$10 = _M0FP38portable8research16researchcheckcli18load__json__record(host, review_path);
  let _tmp$3;
  if (_bind$10.$tag === 1) {
    const _ok = _bind$10;
    _tmp$3 = _ok._0;
  } else {
    return _bind$10;
  }
  const _bind$11 = _M0FP38portable8research2io10as__object(_tmp$3);
  let review;
  if (_bind$11.$tag === 1) {
    const _ok = _bind$11;
    review = _ok._0;
  } else {
    return _bind$11;
  }
  const request = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _p = "validateReview";
  _M0MPB3Map3setGsRPB4JsonE(request, "op", new _M0DTPB4Json6String(_p));
  _M0MPB3Map3setGsRPB4JsonE(request, "sources", new _M0DTPB4Json5Array(_sources));
  _M0MPB3Map3setGsRPB4JsonE(request, "candidateSha256", new _M0DTPB4Json6String(candidate_sha));
  _M0MPB3Map3setGsRPB4JsonE(request, "packet", new _M0DTPB4Json6Object(_packet));
  _M0MPB3Map3setGsRPB4JsonE(request, "review", new _M0DTPB4Json6Object(review));
  const _bind$12 = _M0FP38portable8research2io8required(_packet, "peerReview");
  let _tmp$4;
  if (_bind$12.$tag === 1) {
    const _ok = _bind$12;
    _tmp$4 = _ok._0;
  } else {
    return _bind$12;
  }
  const _bind$13 = _M0FP38portable8research2io10as__object(_tmp$4);
  let peer;
  if (_bind$13.$tag === 1) {
    const _ok = _bind$13;
    peer = _ok._0;
  } else {
    return _bind$13;
  }
  const _bind$14 = _M0MPB3Map3getGsRPB4JsonE(peer, "candidateDraft");
  let has_draft;
  if (_bind$14 === undefined) {
    has_draft = false;
  } else {
    const _Some = _bind$14;
    const _x = _Some;
    if (_x.$tag === 0) {
      has_draft = false;
    } else {
      has_draft = true;
    }
  }
  if (has_draft) {
    const _bind$15 = _M0FP38portable8research2io8required(candidate_fields, "text");
    let _tmp$5;
    if (_bind$15.$tag === 1) {
      const _ok = _bind$15;
      _tmp$5 = _ok._0;
    } else {
      return _bind$15;
    }
    const _bind$16 = _M0FP38portable8research2io10as__string(_tmp$5);
    let candidate_text;
    if (_bind$16.$tag === 1) {
      const _ok = _bind$16;
      candidate_text = _ok._0;
    } else {
      return _bind$16;
    }
    const _bind$17 = _M0FP38portable8research2io5parse(candidate_text);
    let _tmp$6;
    if (_bind$17.$tag === 1) {
      const _ok = _bind$17;
      _tmp$6 = _ok._0;
    } else {
      return _bind$17;
    }
    _M0MPB3Map3setGsRPB4JsonE(request, "candidateValue", _tmp$6);
  }
  return _M0FP38portable8research16researchcheckcli14dispatch__core(request);
}
function _M0FP38portable8research16researchcheckcli3run(input, host) {
  const _bind = _M0FP38portable8research2io5parse(input);
  let _tmp;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    _tmp = _ok._0;
  } else {
    return _bind;
  }
  const _bind$2 = _M0FP38portable8research2io10as__object(_tmp);
  let request;
  if (_bind$2.$tag === 1) {
    const _ok = _bind$2;
    request = _ok._0;
  } else {
    return _bind$2;
  }
  const _bind$3 = _M0FP38portable8research2io8required(request, "args");
  let _tmp$2;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _tmp$2 = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research2io9as__array(_tmp$2);
  let raw_args;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    raw_args = _ok._0;
  } else {
    return _bind$4;
  }
  const args = [];
  const _bind$5 = raw_args.length;
  let _tmp$3 = 0;
  while (true) {
    const _ = _tmp$3;
    if (_ < _bind$5) {
      const item = raw_args[_];
      const _bind$6 = _M0FP38portable8research2io10as__string(item);
      let _tmp$4;
      if (_bind$6.$tag === 1) {
        const _ok = _bind$6;
        _tmp$4 = _ok._0;
      } else {
        return _bind$6;
      }
      _M0MPC15array5Array4pushGsE(args, _tmp$4);
      _tmp$3 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const _bind$6 = _M0FP38portable8research16researchcheckcli11parse__args(args);
  let _bind$7;
  if (_bind$6.$tag === 1) {
    const _ok = _bind$6;
    _bind$7 = _ok._0;
  } else {
    return _bind$6;
  }
  const _command = _bind$7._0;
  const _flags = _bind$7._1;
  switch (_command) {
    case "quote": {
      const _bind$8 = _M0FP38portable8research16researchcheckcli12check__flags(_flags, ["--packet", "--path", "--from", "--to"]);
      if (_bind$8.$tag === 1) {
        const _ok = _bind$8;
        _ok._0;
      } else {
        return _bind$8;
      }
      return _M0FP38portable8research16researchcheckcli10run__quote(host, _flags);
    }
    case "locate": {
      const _bind$9 = _M0FP38portable8research16researchcheckcli12check__flags(_flags, ["--packet", "--refs"]);
      if (_bind$9.$tag === 1) {
        const _ok = _bind$9;
        _ok._0;
      } else {
        return _bind$9;
      }
      return _M0FP38portable8research16researchcheckcli11run__locate(host, _flags);
    }
    case "review": {
      const _bind$10 = _M0FP38portable8research16researchcheckcli12check__flags(_flags, ["--packet", "--candidate", "--review"]);
      if (_bind$10.$tag === 1) {
        const _ok = _bind$10;
        _ok._0;
      } else {
        return _bind$10;
      }
      return _M0FP38portable8research16researchcheckcli11run__review(host, _flags);
    }
    default: {
      return _M0FP38portable8research2io4failGRPB4JsonE("unknown_command");
    }
  }
}
function _M0FP38portable8research16researchcheckcli8run__cli(input, host, _async_host, done) {
  let outcome;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0FP38portable8research16researchcheckcli3run(input, host);
      let _tmp;
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _tmp = _ok._0;
      } else {
        const _err = _bind;
        _try_err = _err._0;
        break _L$2;
      }
      outcome = new _M0DTPC16result6ResultGRPB4JsonsE2Ok(_tmp);
      break _L;
    }
    const _Io = _try_err;
    const _message = _Io._0;
    outcome = new _M0DTPC16result6ResultGRPB4JsonsE3Err(_message);
  }
  if (outcome.$tag === 1) {
    const _Ok = outcome;
    const _result = _Ok._0;
    const text = _M0MPC14json4Json17stringify_2einner(_result, false, 0, undefined);
    let _try_err$2;
    _L$2: {
      _L$3: {
        const _bind = _M0FP38portable8research2io5print(host, `${text}\n`, false);
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          const _err = _bind;
          _try_err$2 = _err._0;
          break _L$3;
        }
        break _L$2;
      }
    }
    let _tmp;
    if (_M0FP38portable8research16researchcheckcli8json__ok(_result)) {
      const _p = 0;
      const _p$2 = undefined;
      _tmp = new _M0DTPB4Json6Number(_p, _p$2);
    } else {
      const _p = 1;
      const _p$2 = undefined;
      _tmp = new _M0DTPB4Json6Number(_p, _p$2);
    }
    const _bind = [{ _0: "exitCode", _1: _tmp }];
    const _p = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind, 0, 1));
    done(_M0MPC14json4Json17stringify_2einner(new _M0DTPB4Json6Object(_p), false, 0, undefined));
    return;
  } else {
    const _Err = outcome;
    const _message = _Err._0;
    const result = _M0FP38portable8research16researchcheckcli13err__envelope(_message);
    let _try_err$2;
    _L$2: {
      _L$3: {
        const _bind = _M0FP38portable8research2io5print(host, `${_M0MPC14json4Json17stringify_2einner(result, false, 0, undefined)}\n`, false);
        if (_bind.$tag === 1) {
          const _ok = _bind;
          _ok._0;
        } else {
          const _err = _bind;
          _try_err$2 = _err._0;
          break _L$3;
        }
        break _L$2;
      }
    }
    const _p = 1;
    const _p$2 = undefined;
    const _bind = [{ _0: "exitCode", _1: new _M0DTPB4Json6Number(_p, _p$2) }, { _0: "error", _1: new _M0DTPB4Json6String(_message) }];
    const _p$3 = _M0MPB3Map11from__arrayGsRPB4JsonE(new _M0TPB9ArrayViewGUsRPB4JsonEE(_bind, 0, 2));
    done(_M0MPC14json4Json17stringify_2einner(new _M0DTPB4Json6Object(_p$3), false, 0, undefined));
    return;
  }
}
export { _M0FP38portable8research16researchcheckcli8run__cli as run_cli }
