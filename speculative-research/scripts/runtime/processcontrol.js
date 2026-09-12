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
function _M0TPB5EntryGsRPB4JsonE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
function _M0TPB5EntryGslE(param0, param1, param2, param3, param4, param5) {
  this.prev = param0;
  this.next = param1;
  this.psl = param2;
  this.hash = param3;
  this.key = param4;
  this.value = param5;
}
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
function _M0TPC13ref3RefGRP38portable8research14processcontrol4CoreE(param0) {
  this.val = param0;
}
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
function _M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4None() {}
_M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4None.prototype.$tag = 0;
const _M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4None__ = new _M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4None();
function _M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4Some(param0) {
  this._0 = param0;
}
_M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4Some.prototype.$tag = 1;
function _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0DTPC16result6ResultGORPB4JsonRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPB4JsonRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGORPB4JsonRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGORPB4JsonRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0TP38portable8research14processcontrol4Core(param0, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13, param14, param15, param16, param17, param18, param19, param20, param21, param22, param23, param24, param25, param26, param27, param28, param29, param30, param31) {
  this.file = param0;
  this.args = param1;
  this.cwd = param2;
  this.stdout_path = param3;
  this.stderr_path = param4;
  this.max_log_bytes = param5;
  this.max_line_bytes = param6;
  this.interrupt_grace_ms = param7;
  this.terminate_grace_ms = param8;
  this.timeout_ms = param9;
  this.process_group = param10;
  this.finished = param11;
  this.primary_failure = param12;
  this.failure_name = param13;
  this.timed_out = param14;
  this.interrupted = param15;
  this.forced_termination = param16;
  this.cleanup_unverified = param17;
  this.exit_code = param18;
  this.signal = param19;
  this.elapsed_ms = param20;
  this.child_closed = param21;
  this.line_buffer = param22;
  this.deadline_active = param23;
  this.terminate_active = param24;
  this.kill_active = param25;
  this.group_kill_sent = param26;
  this.received = param27;
  this.written = param28;
  this.pending_write = param29;
  this.summaries = param30;
  this.termination_errors = param31;
}
function _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigRP38portable8research2io7IoErrorE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigRP38portable8research2io7IoErrorE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigRP38portable8research2io7IoErrorE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigRP38portable8research2io7IoErrorE2Ok.prototype.$tag = 1;
function _M0TP38portable8research14processcontrol6Config(param0, param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13) {
  this.file = param0;
  this.args = param1;
  this.cwd = param2;
  this.env = param3;
  this.stdout_path = param4;
  this.stderr_path = param5;
  this.exclusive = param6;
  this.timeout_ms = param7;
  this.interrupt_grace_ms = param8;
  this.terminate_grace_ms = param9;
  this.max_log_bytes = param10;
  this.max_line_bytes = param11;
  this.aborted = param12;
  this.process_group = param13;
}
function _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE3Err(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE3Err.prototype.$tag = 0;
function _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE2Ok(param0) {
  this._0 = param0;
}
_M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE2Ok.prototype.$tag = 1;
const _M0FP092moonbitlang_2fcore_2fbuiltin_2fStringBuilder_24as_24_40moonbitlang_2fcore_2fbuiltin_2eLogger = { method_0: _M0IPB13StringBuilderPB6Logger13write__string, method_1: _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE, method_2: _M0IPB13StringBuilderPB6Logger11write__view, method_3: _M0IPB13StringBuilderPB6Logger11write__char };
const _M0MPC16string6String4trimN7_2abindS5911 = "\t\n\r ";
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
const _M0FP38portable8research14processcontrol10max__count = 9007199254740991n;
const _M0FP38portable8research14processcontrol13parse__configN7_2abindS288 = "=";
const _M0FP38portable8research14processcontrol13parse__configN7_2abindS289 = "\u0000";
const _M0FP38portable8research14processcontrol13parse__configN7_2abindS290 = "\u0000";
const _M0FP38portable8research14processcontrol13process__textN7_2abindS394 = "\n";
const _M0FP38portable8research14processcontrol13deliver__lineN7_2abindS400 = "";
const _M0FPB4seed = _M0FPB12random__seed();
const _M0FPB18brute__force__findN6constrS8462 = 0;
const _M0FPB28boyer__moore__horspool__findN6constrS8461 = 0;
const _M0FP38portable8research14processcontrol18run__process__jsonN6constrS438 = "process control aborted before start";
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
function _M0MPC16string6String4find(self, str) {
  return _M0MPC16string10StringView4find(new _M0TPC16string10StringView(self, 0, self.length), str);
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
function _M0MPC15array5Array4pushGsE(self, value) {
  _M0MPB7JSArray4push(self, value);
}
function _M0MPC16string10StringView8contains(self, str) {
  const _bind = _M0MPC16string10StringView4find(self, str);
  return !(_bind === undefined);
}
function _M0MPC16string6String8contains(self, str) {
  return _M0MPC16string10StringView8contains(new _M0TPC16string10StringView(self, 0, self.length), str);
}
function _M0MPC16string10StringView14contains__char(self, c) {
  const len = self.end - self.start | 0;
  if (len > 0) {
    const c$2 = c;
    if (c$2 <= 65535) {
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i < len) {
          if (self.str.charCodeAt(self.start + i | 0) === c$2) {
            return true;
          }
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
    } else {
      if (len >= 2) {
        const adj = c$2 - 65536 | 0;
        const high = 55296 + (adj >> 10) | 0;
        const low = 56320 + (adj & 1023) | 0;
        let _tmp = 0;
        while (true) {
          const i = _tmp;
          if (i < (len - 1 | 0)) {
            if (self.str.charCodeAt(self.start + i | 0) === high) {
              const _p = i + 1 | 0;
              if (self.str.charCodeAt(self.start + _p | 0) === low) {
                return true;
              }
              _tmp = i + 2 | 0;
              continue;
            }
            _tmp = i + 1 | 0;
            continue;
          } else {
            break;
          }
        }
      } else {
        return false;
      }
    }
    return false;
  } else {
    return false;
  }
}
function _M0MPC16string10StringView19trim__start_2einner(self, chars) {
  let _tmp = self;
  while (true) {
    const x = _tmp;
    if (_M0MPC16string6String24char__length__eq_2einner(x.str, 0, x.start, x.end)) {
      return x;
    } else {
      const _c = _M0MPC16string6String16unsafe__char__at(x.str, _M0MPC16string6String29offset__of__nth__char_2einner(x.str, 0, x.start, x.end));
      const _tmp$2 = x.str;
      const _bind = _M0MPC16string6String29offset__of__nth__char_2einner(x.str, 1, x.start, x.end);
      let _tmp$3;
      if (_bind === undefined) {
        _tmp$3 = x.end;
      } else {
        const _Some = _bind;
        _tmp$3 = _Some;
      }
      const _x = new _M0TPC16string10StringView(_tmp$2, _tmp$3, x.end);
      if (_M0MPC16string10StringView14contains__char(chars, _c)) {
        _tmp = _x;
        continue;
      } else {
        return x;
      }
    }
  }
}
function _M0MPC16string10StringView17trim__end_2einner(self, chars) {
  let _tmp = self;
  while (true) {
    const x = _tmp;
    if (_M0MPC16string6String24char__length__eq_2einner(x.str, 0, x.start, x.end)) {
      return x;
    } else {
      const _c = _M0MPC16string6String16unsafe__char__at(x.str, _M0MPC16string6String29offset__of__nth__char_2einner(x.str, -1, x.start, x.end));
      const _x = new _M0TPC16string10StringView(x.str, x.start, _M0MPC16string6String29offset__of__nth__char_2einner(x.str, -1, x.start, x.end));
      if (_M0MPC16string10StringView14contains__char(chars, _c)) {
        _tmp = _x;
        continue;
      } else {
        return x;
      }
    }
  }
}
function _M0MPC16string10StringView12trim_2einner(self, chars) {
  return _M0MPC16string10StringView17trim__end_2einner(_M0MPC16string10StringView19trim__start_2einner(self, chars), chars);
}
function _M0MPC16string6String12trim_2einner(self, chars) {
  return _M0MPC16string10StringView12trim_2einner(new _M0TPC16string10StringView(self, 0, self.length), chars);
}
function _M0MPC16string6String4trim(self, chars$46$opt) {
  let chars;
  if (chars$46$opt === undefined) {
    chars = new _M0TPC16string10StringView(_M0MPC16string6String4trimN7_2abindS5911, 0, _M0MPC16string6String4trimN7_2abindS5911.length);
  } else {
    const _Some = chars$46$opt;
    chars = _Some;
  }
  return _M0MPC16string6String12trim_2einner(self, chars);
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
function _M0MPB3Map15set__with__hashGslE(self, key, value, hash) {
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
        _M0MPB3Map4growGslE(self);
        _tmp = 0;
        _tmp$2 = hash & self.capacity_mask;
        continue;
      }
      const _bind$2 = self.tail;
      const _bind$3 = undefined;
      const entry = new _M0TPB5EntryGslE(_bind$2, _bind$3, psl, hash, key, value);
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
          _M0MPB3Map4growGslE(self);
          _tmp = 0;
          _tmp$2 = hash & self.capacity_mask;
          continue;
        }
        _M0MPB3Map10push__awayGsRPB4JsonE(self, idx, _curr_entry);
        const _bind$2 = self.tail;
        const _bind$3 = undefined;
        const entry = new _M0TPB5EntryGslE(_bind$2, _bind$3, psl, hash, key, value);
        _M0MPB3Map20add__entry__to__tailGsRPB4JsonE(self, idx, entry);
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
function _M0MPB3Map4growGslE(self) {
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
      _M0MPB3Map15set__with__hashGslE(self, _key, _value, _hash);
      _tmp = _next;
      continue;
    }
  }
}
function _M0MPB3Map3setGsRPB4JsonE(self, key, value) {
  _M0MPB3Map15set__with__hashGsRPB4JsonE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
}
function _M0MPB3Map3setGslE(self, key, value) {
  _M0MPB3Map15set__with__hashGslE(self, key, value, _M0IP016_24default__implPB4Hash4hashGsE(key));
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
function _M0MPB3Map3getGslE(self, key) {
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
function _M0MPB3Map5iter2GsRPB4JsonE(self) {
  return _M0MPB3Map4iterGsRPB4JsonE(self);
}
function _M0MPB5Iter24nextGsRPB4JsonE(self) {
  return _M0MPB4Iter4nextGUsRPB4JsonEE(self);
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
function _M0FPC13ref3newGRP38portable8research14processcontrol4CoreE(x) {
  return new _M0TPC13ref3RefGRP38portable8research14processcontrol4CoreE(x);
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
function _M0FP38portable8research2io10as__number(value) {
  if (value.$tag === 3) {
    const _Number = value;
    const _number = _Number._0;
    return new _M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE2Ok(_number);
  } else {
    return new _M0DTPC16result6ResultGdRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("expected JSON number"));
  }
}
function _M0FP38portable8research2io13is__safe__int(number) {
  return !(number !== number) && (!(number > _M0FPB18double__max__value || number < _M0FPB18double__min__value) && (_M0MPC16double6Double5floor(number) === number && Math.abs(number) <= 9007199254740991));
}
function _M0FP38portable8research2io7as__int(value) {
  const _bind = _M0FP38portable8research2io10as__number(value);
  let number;
  if (_bind.$tag === 1) {
    const _ok = _bind;
    number = _ok._0;
  } else {
    return _bind;
  }
  if (!_M0FP38portable8research2io13is__safe__int(number)) {
    return new _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("invalid JSON integer"));
  }
  if (number < -2147483648 || number > 2147483647) {
    return new _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("integer out of range"));
  }
  return new _M0DTPC16result6ResultGiRP38portable8research2io7IoErrorE2Ok(_M0MPC16double6Double7to__int(number));
}
function _M0FP38portable8research2io13optional__int(fields, key) {
  _L: {
    const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
    if (_bind === undefined) {
      break _L;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 0) {
        break _L;
      } else {
        const _bind$2 = _M0FP38portable8research2io7as__int(_x);
        let _tmp;
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          _tmp = _ok._0;
        } else {
          return _bind$2;
        }
        return new _M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE2Ok(_tmp);
      }
    }
  }
  return new _M0DTPC16result6ResultGOiRP38portable8research2io7IoErrorE2Ok(undefined);
}
function _M0FP38portable8research2io16optional__string(fields, key) {
  _L: {
    const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
    if (_bind === undefined) {
      break _L;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 0) {
        break _L;
      } else {
        const _bind$2 = _M0FP38portable8research2io10as__string(_x);
        let _tmp;
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          _tmp = _ok._0;
        } else {
          return _bind$2;
        }
        return new _M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE2Ok(_tmp);
      }
    }
  }
  return new _M0DTPC16result6ResultGOsRP38portable8research2io7IoErrorE2Ok(undefined);
}
function _M0FP38portable8research2io8as__bool(value) {
  switch (value.$tag) {
    case 1: {
      return new _M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE2Ok(true);
    }
    case 2: {
      return new _M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE2Ok(false);
    }
    default: {
      return new _M0DTPC16result6ResultGbRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo("expected JSON boolean"));
    }
  }
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
function _M0FP38portable8research2io14optional__bool(fields, key) {
  _L: {
    const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
    if (_bind === undefined) {
      break _L;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 0) {
        break _L;
      } else {
        const _bind$2 = _M0FP38portable8research2io8as__bool(_x);
        let _tmp;
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          _tmp = _ok._0;
        } else {
          return _bind$2;
        }
        return new _M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE2Ok(_tmp);
      }
    }
  }
  return new _M0DTPC16result6ResultGObRP38portable8research2io7IoErrorE2Ok(-1);
}
function _M0FP38portable8research2io15optional__array(fields, key) {
  _L: {
    const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
    if (_bind === undefined) {
      break _L;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 0) {
        break _L;
      } else {
        const _bind$2 = _M0FP38portable8research2io9as__array(_x);
        let _tmp;
        if (_bind$2.$tag === 1) {
          const _ok = _bind$2;
          _tmp = _ok._0;
        } else {
          return _bind$2;
        }
        return new _M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(new _M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4Some(_tmp));
      }
    }
  }
  return new _M0DTPC16result6ResultGORPB5ArrayGRPB4JsonERP38portable8research2io7IoErrorE2Ok(_M0DTPC16option6OptionGRPB5ArrayGRPB4JsonEE4None__);
}
function _M0FP38portable8research2io4failGuE(message) {
  return new _M0DTPC16result6ResultGuRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(message));
}
function _M0FP38portable8research2io4failGORPB4JsonE(message) {
  return new _M0DTPC16result6ResultGORPB4JsonRP38portable8research2io7IoErrorE3Err(new _M0DTPC15error5Error39portable_2fresearch_2fio_2eIoError_2eIo(message));
}
function _M0FP38portable8research14processcontrol10object__of(pairs) {
  const fields = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind = pairs.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind) {
      const pair = pairs[_];
      _M0MPB3Map3setGsRPB4JsonE(fields, pair._0, pair._1);
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  return new _M0DTPB4Json6Object(fields);
}
function _M0FP38portable8research14processcontrol4jstr(text) {
  return new _M0DTPB4Json6String(text);
}
function _M0FP38portable8research14processcontrol4jint(value) {
  const _p = value + 0;
  const _p$2 = undefined;
  return new _M0DTPB4Json6Number(_p, _p$2);
}
function _M0FP38portable8research14processcontrol6jcount(value) {
  const _p = $f64_convert_i64(BigInt.asIntN(64, value));
  const _p$2 = undefined;
  return new _M0DTPB4Json6Number(_p, _p$2);
}
function _M0FP38portable8research14processcontrol5jbool(value) {
  return value ? _M0DTPB4Json4True__ : _M0DTPB4Json5False__;
}
function _M0FP38portable8research14processcontrol6iget64(map, key) {
  const _bind = _M0MPB3Map3getGslE(map, key);
  if (_bind === undefined) {
    return 0n;
  } else {
    const _Some = _bind;
    return _Some;
  }
}
function _M0FP38portable8research14processcontrol12count__map64() {
  const map = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  _M0MPB3Map3setGslE(map, "stdout", 0n);
  _M0MPB3Map3setGslE(map, "stderr", 0n);
  return map;
}
function _M0FP38portable8research14processcontrol9utf8__len(text) {
  let total = 0;
  const _it = _M0MPC16string6String4iter(text);
  while (true) {
    const _bind = _M0MPB4Iter4nextGcE(_it);
    if (_bind === -1) {
      break;
    } else {
      const _Some = _bind;
      const _c = _Some;
      const code = _c;
      const width = code < 128 ? 1 : code < 2048 ? 2 : code < 65536 ? 3 : 4;
      total = total + width | 0;
      continue;
    }
  }
  return total;
}
function _M0FP38portable8research14processcontrol10event__str(fields, key) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
  if (_bind === undefined) {
    return "";
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x.$tag === 4) {
      const _String = _x;
      return _String._0;
    } else {
      return "";
    }
  }
}
function _M0FP38portable8research14processcontrol10event__int(fields, key) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
  if (_bind === undefined) {
    return 0;
  } else {
    const _Some = _bind;
    const _x = _Some;
    if (_x.$tag === 3) {
      const _Number = _x;
      const _number = _Number._0;
      return _M0MPC16double6Double7to__int(_number);
    } else {
      return 0;
    }
  }
}
function _M0FP38portable8research14processcontrol11event__bool(fields, key) {
  const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, key);
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
}
function _M0FP38portable8research14processcontrol11empty__core(file, args, cwd, stdout_path, stderr_path, max_log_bytes, max_line_bytes, interrupt_grace_ms, terminate_grace_ms, timeout_ms, process_group) {
  return new _M0TP38portable8research14processcontrol4Core(file, args, cwd, stdout_path, stderr_path, max_log_bytes, max_line_bytes, interrupt_grace_ms, terminate_grace_ms, timeout_ms, process_group, false, undefined, "Error", false, false, false, false, undefined, undefined, 0, false, "", false, false, false, false, _M0FP38portable8research14processcontrol12count__map64(), _M0FP38portable8research14processcontrol12count__map64(), _M0FP38portable8research14processcontrol12count__map64(), [], []);
}
function _M0FP38portable8research14processcontrol13invalid__core(message) {
  const core = _M0FP38portable8research14processcontrol11empty__core("", [], undefined, "", "", 1, 1, 0, 0, 0, false);
  core.primary_failure = message;
  return core;
}
function _M0FP38portable8research14processcontrol12stream__logs(core, name) {
  return _M0FP38portable8research14processcontrol10object__of([{ _0: "path", _1: _M0FP38portable8research14processcontrol4jstr(name === "stdout" ? core.stdout_path : core.stderr_path) }, { _0: "receivedBytes", _1: _M0FP38portable8research14processcontrol6jcount(_M0FP38portable8research14processcontrol6iget64(core.received, name)) }, { _0: "writtenBytes", _1: _M0FP38portable8research14processcontrol6jcount(_M0FP38portable8research14processcontrol6iget64(core.written, name)) }]);
}
function _M0FP38portable8research14processcontrol10call__done(core, done) {
  const fields = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  const _bind = core.exit_code;
  let _tmp;
  if (_bind === undefined) {
    _tmp = _M0DTPB4Json4Null__;
  } else {
    const _Some = _bind;
    const _code = _Some;
    _tmp = _M0FP38portable8research14processcontrol4jint(_code);
  }
  _M0MPB3Map3setGsRPB4JsonE(fields, "exitCode", _tmp);
  const _bind$2 = core.signal;
  let _tmp$2;
  if (_bind$2 === undefined) {
    _tmp$2 = _M0DTPB4Json4Null__;
  } else {
    const _Some = _bind$2;
    const _text = _Some;
    _tmp$2 = _M0FP38portable8research14processcontrol4jstr(_text);
  }
  _M0MPB3Map3setGsRPB4JsonE(fields, "signal", _tmp$2);
  _M0MPB3Map3setGsRPB4JsonE(fields, "timedOut", _M0FP38portable8research14processcontrol5jbool(core.timed_out));
  _M0MPB3Map3setGsRPB4JsonE(fields, "interrupted", _M0FP38portable8research14processcontrol5jbool(core.interrupted));
  _M0MPB3Map3setGsRPB4JsonE(fields, "forcedTermination", _M0FP38portable8research14processcontrol5jbool(core.forced_termination));
  _M0MPB3Map3setGsRPB4JsonE(fields, "cleanupUnverified", _M0FP38portable8research14processcontrol5jbool(core.cleanup_unverified));
  _M0MPB3Map3setGsRPB4JsonE(fields, "elapsedMs", _M0FP38portable8research14processcontrol4jint(core.elapsed_ms));
  const command = [_M0FP38portable8research14processcontrol4jstr(core.file)];
  const _bind$3 = core.args;
  const _bind$4 = _bind$3.length;
  let _tmp$3 = 0;
  while (true) {
    const _ = _tmp$3;
    if (_ < _bind$4) {
      const arg = _bind$3[_];
      _M0MPC15array5Array4pushGsE(command, _M0FP38portable8research14processcontrol4jstr(arg));
      _tmp$3 = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  _M0MPB3Map3setGsRPB4JsonE(fields, "command", new _M0DTPB4Json5Array(command));
  const _bind$5 = core.cwd;
  let _tmp$4;
  if (_bind$5 === undefined) {
    _tmp$4 = _M0DTPB4Json4Null__;
  } else {
    const _Some = _bind$5;
    const _value = _Some;
    _tmp$4 = _M0FP38portable8research14processcontrol4jstr(_value);
  }
  _M0MPB3Map3setGsRPB4JsonE(fields, "cwd", _tmp$4);
  _M0MPB3Map3setGsRPB4JsonE(fields, "limits", _M0FP38portable8research14processcontrol10object__of([{ _0: "timeoutMs", _1: _M0FP38portable8research14processcontrol4jint(core.timeout_ms) }, { _0: "interruptGraceMs", _1: _M0FP38portable8research14processcontrol4jint(core.interrupt_grace_ms) }, { _0: "terminateGraceMs", _1: _M0FP38portable8research14processcontrol4jint(core.terminate_grace_ms) }, { _0: "maxLogBytes", _1: _M0FP38portable8research14processcontrol4jint(core.max_log_bytes) }, { _0: "maxLineBytes", _1: _M0FP38portable8research14processcontrol4jint(core.max_line_bytes) }]));
  _M0MPB3Map3setGsRPB4JsonE(fields, "logs", _M0FP38portable8research14processcontrol10object__of([{ _0: "stdout", _1: _M0FP38portable8research14processcontrol12stream__logs(core, "stdout") }, { _0: "stderr", _1: _M0FP38portable8research14processcontrol12stream__logs(core, "stderr") }]));
  const _p = core.summaries;
  _M0MPB3Map3setGsRPB4JsonE(fields, "summaries", new _M0DTPB4Json5Array(_p));
  const _p$2 = core.termination_errors;
  _M0MPB3Map3setGsRPB4JsonE(fields, "terminationErrors", new _M0DTPB4Json5Array(_p$2));
  const _bind$6 = core.primary_failure;
  if (_bind$6 === undefined) {
  } else {
    const _Some = _bind$6;
    const _message = _Some;
    _M0MPB3Map3setGsRPB4JsonE(fields, "failure", _M0FP38portable8research14processcontrol10object__of([{ _0: "name", _1: _M0FP38portable8research14processcontrol4jstr(core.failure_name) }, { _0: "message", _1: _M0FP38portable8research14processcontrol4jstr(_message) }]));
  }
  done(_M0MPC14json4Json17stringify_2einner(new _M0DTPB4Json6Object(fields), false, 0, undefined));
}
function _M0FP38portable8research14processcontrol13parse__config(text) {
  const _bind = _M0FP38portable8research2io5parse(text);
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
  const _bind$3 = _M0FP38portable8research2io8required(fields, "file");
  let _tmp$2;
  if (_bind$3.$tag === 1) {
    const _ok = _bind$3;
    _tmp$2 = _ok._0;
  } else {
    return _bind$3;
  }
  const _bind$4 = _M0FP38portable8research2io10as__string(_tmp$2);
  let file;
  if (_bind$4.$tag === 1) {
    const _ok = _bind$4;
    file = _ok._0;
  } else {
    return _bind$4;
  }
  const args = [];
  const _bind$5 = _M0FP38portable8research2io15optional__array(fields, "args");
  let _bind$6;
  if (_bind$5.$tag === 1) {
    const _ok = _bind$5;
    _bind$6 = _ok._0;
  } else {
    return _bind$5;
  }
  if (_bind$6.$tag === 1) {
    const _Some = _bind$6;
    const _items = _Some._0;
    const _bind$7 = _items.length;
    let _tmp$3 = 0;
    while (true) {
      const _ = _tmp$3;
      if (_ < _bind$7) {
        const item = _items[_];
        const _bind$8 = _M0FP38portable8research2io10as__string(item);
        let _tmp$4;
        if (_bind$8.$tag === 1) {
          const _ok = _bind$8;
          _tmp$4 = _ok._0;
        } else {
          return _bind$8;
        }
        _M0MPC15array5Array4pushGsE(args, _tmp$4);
        _tmp$3 = _ + 1 | 0;
        continue;
      } else {
        break;
      }
    }
  }
  const _bind$7 = _M0MPB3Map3getGsRPB4JsonE(fields, "env");
  let env;
  if (_bind$7 === undefined) {
    env = undefined;
  } else {
    const _Some = _bind$7;
    const _x = _Some;
    if (_x.$tag === 6) {
      const _Object = _x;
      const _values = _Object._0;
      const _it = _M0MPB3Map5iter2GsRPB4JsonE(_values);
      while (true) {
        const _bind$8 = _M0MPB5Iter24nextGsRPB4JsonE(_it);
        if (_bind$8 === undefined) {
          break;
        } else {
          const _Some$2 = _bind$8;
          const _x$2 = _Some$2;
          const _key = _x$2._0;
          const _value = _x$2._1;
          if (_key === "" || (_M0MPC16string6String8contains(_key, new _M0TPC16string10StringView(_M0FP38portable8research14processcontrol13parse__configN7_2abindS288, 0, _M0FP38portable8research14processcontrol13parse__configN7_2abindS288.length)) || _M0MPC16string6String8contains(_key, new _M0TPC16string10StringView(_M0FP38portable8research14processcontrol13parse__configN7_2abindS289, 0, _M0FP38portable8research14processcontrol13parse__configN7_2abindS289.length)))) {
            const _bind$9 = _M0FP38portable8research2io4failGuE("env contains an invalid name");
            if (_bind$9.$tag === 1) {
              const _ok = _bind$9;
              _ok._0;
            } else {
              return _bind$9;
            }
          }
          if (_value.$tag === 4) {
            const _String = _value;
            const _text = _String._0;
            if (_M0MPC16string6String8contains(_text, new _M0TPC16string10StringView(_M0FP38portable8research14processcontrol13parse__configN7_2abindS290, 0, _M0FP38portable8research14processcontrol13parse__configN7_2abindS290.length))) {
              const _bind$9 = _M0FP38portable8research2io4failGuE("env contains an invalid value");
              if (_bind$9.$tag === 1) {
                const _ok = _bind$9;
                _ok._0;
              } else {
                return _bind$9;
              }
            }
          } else {
            const _bind$9 = _M0FP38portable8research2io4failGuE("env values must be strings");
            if (_bind$9.$tag === 1) {
              const _ok = _bind$9;
              _ok._0;
            } else {
              return _bind$9;
            }
          }
          continue;
        }
      }
      env = new _M0DTPB4Json6Object(_values);
    } else {
      const _bind$8 = _M0FP38portable8research2io4failGORPB4JsonE("env must be an object of strings");
      if (_bind$8.$tag === 1) {
        const _ok = _bind$8;
        env = _ok._0;
      } else {
        return _bind$8;
      }
    }
  }
  const _bind$8 = _M0FP38portable8research2io13optional__int(fields, "timeoutMs");
  let _bind$9;
  if (_bind$8.$tag === 1) {
    const _ok = _bind$8;
    _bind$9 = _ok._0;
  } else {
    return _bind$8;
  }
  let timeout_ms;
  if (_bind$9 === undefined) {
    timeout_ms = 120000;
  } else {
    const _Some = _bind$9;
    timeout_ms = _Some;
  }
  if (timeout_ms < 0) {
    const _bind$10 = _M0FP38portable8research2io4failGuE("timeoutMs must not be negative");
    if (_bind$10.$tag === 1) {
      const _ok = _bind$10;
      _ok._0;
    } else {
      return _bind$10;
    }
  }
  const _bind$10 = _M0FP38portable8research2io13optional__int(fields, "interruptGraceMs");
  let _p;
  if (_bind$10.$tag === 1) {
    const _ok = _bind$10;
    _p = _ok._0;
  } else {
    return _bind$10;
  }
  const _p$2 = 30000;
  let interrupt_grace_ms;
  if (_p === undefined) {
    interrupt_grace_ms = _p$2;
  } else {
    const _p$3 = _p;
    interrupt_grace_ms = _p$3;
  }
  if (interrupt_grace_ms < 0) {
    const _bind$11 = _M0FP38portable8research2io4failGuE("interruptGraceMs must not be negative");
    if (_bind$11.$tag === 1) {
      const _ok = _bind$11;
      _ok._0;
    } else {
      return _bind$11;
    }
  }
  const _bind$11 = _M0FP38portable8research2io13optional__int(fields, "terminateGraceMs");
  let _p$3;
  if (_bind$11.$tag === 1) {
    const _ok = _bind$11;
    _p$3 = _ok._0;
  } else {
    return _bind$11;
  }
  const _p$4 = 5000;
  let terminate_grace_ms;
  if (_p$3 === undefined) {
    terminate_grace_ms = _p$4;
  } else {
    const _p$5 = _p$3;
    terminate_grace_ms = _p$5;
  }
  if (terminate_grace_ms < 0) {
    const _bind$12 = _M0FP38portable8research2io4failGuE("terminateGraceMs must not be negative");
    if (_bind$12.$tag === 1) {
      const _ok = _bind$12;
      _ok._0;
    } else {
      return _bind$12;
    }
  }
  const _bind$12 = _M0FP38portable8research2io13optional__int(fields, "maxLogBytes");
  let _p$5;
  if (_bind$12.$tag === 1) {
    const _ok = _bind$12;
    _p$5 = _ok._0;
  } else {
    return _bind$12;
  }
  const _p$6 = 8388608;
  let max_log_bytes;
  if (_p$5 === undefined) {
    max_log_bytes = _p$6;
  } else {
    const _p$7 = _p$5;
    max_log_bytes = _p$7;
  }
  if (max_log_bytes <= 0) {
    const _bind$13 = _M0FP38portable8research2io4failGuE("maxLogBytes must be positive");
    if (_bind$13.$tag === 1) {
      const _ok = _bind$13;
      _ok._0;
    } else {
      return _bind$13;
    }
  }
  const _bind$13 = _M0FP38portable8research2io13optional__int(fields, "maxLineBytes");
  let _p$7;
  if (_bind$13.$tag === 1) {
    const _ok = _bind$13;
    _p$7 = _ok._0;
  } else {
    return _bind$13;
  }
  const _p$8 = 262144;
  let max_line_bytes;
  if (_p$7 === undefined) {
    max_line_bytes = _p$8;
  } else {
    const _p$9 = _p$7;
    max_line_bytes = _p$9;
  }
  if (max_line_bytes <= 0) {
    const _bind$14 = _M0FP38portable8research2io4failGuE("maxLineBytes must be positive");
    if (_bind$14.$tag === 1) {
      const _ok = _bind$14;
      _ok._0;
    } else {
      return _bind$14;
    }
  }
  const _bind$14 = _M0FP38portable8research2io16optional__string(fields, "cwd");
  let _tmp$3;
  if (_bind$14.$tag === 1) {
    const _ok = _bind$14;
    _tmp$3 = _ok._0;
  } else {
    return _bind$14;
  }
  const _tmp$4 = _tmp$3;
  const _bind$15 = _M0FP38portable8research2io8required(fields, "stdoutPath");
  let _tmp$5;
  if (_bind$15.$tag === 1) {
    const _ok = _bind$15;
    _tmp$5 = _ok._0;
  } else {
    return _bind$15;
  }
  const _bind$16 = _M0FP38portable8research2io10as__string(_tmp$5);
  let _tmp$6;
  if (_bind$16.$tag === 1) {
    const _ok = _bind$16;
    _tmp$6 = _ok._0;
  } else {
    return _bind$16;
  }
  const _tmp$7 = _tmp$6;
  const _bind$17 = _M0FP38portable8research2io8required(fields, "stderrPath");
  let _tmp$8;
  if (_bind$17.$tag === 1) {
    const _ok = _bind$17;
    _tmp$8 = _ok._0;
  } else {
    return _bind$17;
  }
  const _bind$18 = _M0FP38portable8research2io10as__string(_tmp$8);
  let _tmp$9;
  if (_bind$18.$tag === 1) {
    const _ok = _bind$18;
    _tmp$9 = _ok._0;
  } else {
    return _bind$18;
  }
  const _tmp$10 = _tmp$9;
  const _bind$19 = _M0FP38portable8research2io14optional__bool(fields, "exclusive");
  let _p$9;
  if (_bind$19.$tag === 1) {
    const _ok = _bind$19;
    _p$9 = _ok._0;
  } else {
    return _bind$19;
  }
  const _p$10 = false;
  const _tmp$11 = _p$9 === -1 ? _p$10 : _p$9;
  const _bind$20 = _M0FP38portable8research2io14optional__bool(fields, "aborted");
  let _p$11;
  if (_bind$20.$tag === 1) {
    const _ok = _bind$20;
    _p$11 = _ok._0;
  } else {
    return _bind$20;
  }
  const _p$12 = false;
  const _tmp$12 = _p$11 === -1 ? _p$12 : _p$11;
  const _bind$21 = _M0FP38portable8research2io14optional__bool(fields, "processGroup");
  let _p$13;
  if (_bind$21.$tag === 1) {
    const _ok = _bind$21;
    _p$13 = _ok._0;
  } else {
    return _bind$21;
  }
  const _p$14 = false;
  return new _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigRP38portable8research2io7IoErrorE2Ok(new _M0TP38portable8research14processcontrol6Config(file, args, _tmp$4, env, _tmp$7, _tmp$10, _tmp$11, timeout_ms, interrupt_grace_ms, terminate_grace_ms, max_log_bytes, max_line_bytes, _tmp$12, _p$13 === -1 ? _p$14 : _p$13));
}
function _M0FP38portable8research14processcontrol13spawn__action(cfg) {
  const args = [];
  const _bind = cfg.args;
  const _bind$2 = _bind.length;
  let _tmp = 0;
  while (true) {
    const _ = _tmp;
    if (_ < _bind$2) {
      const arg = _bind[_];
      _M0MPC15array5Array4pushGsE(args, _M0FP38portable8research14processcontrol4jstr(arg));
      _tmp = _ + 1 | 0;
      continue;
    } else {
      break;
    }
  }
  const fields = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  _M0MPB3Map3setGsRPB4JsonE(fields, "op", _M0FP38portable8research14processcontrol4jstr("spawn"));
  _M0MPB3Map3setGsRPB4JsonE(fields, "file", _M0FP38portable8research14processcontrol4jstr(cfg.file));
  _M0MPB3Map3setGsRPB4JsonE(fields, "args", new _M0DTPB4Json5Array(args));
  const _bind$3 = cfg.cwd;
  if (_bind$3 === undefined) {
  } else {
    const _Some = _bind$3;
    const _value = _Some;
    _M0MPB3Map3setGsRPB4JsonE(fields, "cwd", _M0FP38portable8research14processcontrol4jstr(_value));
  }
  const _bind$4 = cfg.env;
  if (_bind$4 === undefined) {
  } else {
    const _Some = _bind$4;
    const _value = _Some;
    _M0MPB3Map3setGsRPB4JsonE(fields, "env", _value);
  }
  _M0MPB3Map3setGsRPB4JsonE(fields, "stdoutPath", _M0FP38portable8research14processcontrol4jstr(cfg.stdout_path));
  _M0MPB3Map3setGsRPB4JsonE(fields, "stderrPath", _M0FP38portable8research14processcontrol4jstr(cfg.stderr_path));
  if (cfg.exclusive) {
    _M0MPB3Map3setGsRPB4JsonE(fields, "exclusive", _M0FP38portable8research14processcontrol5jbool(true));
  }
  if (cfg.process_group) {
    _M0MPB3Map3setGsRPB4JsonE(fields, "processGroup", _M0FP38portable8research14processcontrol5jbool(true));
  }
  return new _M0DTPB4Json6Object(fields);
}
function _M0FP38portable8research14processcontrol24push__termination__error(state, message) {
  _M0MPC15array5Array4pushGsE(state.val.termination_errors, _M0FP38portable8research14processcontrol10object__of([{ _0: "name", _1: _M0FP38portable8research14processcontrol4jstr("Error") }, { _0: "message", _1: _M0FP38portable8research14processcontrol4jstr(message) }]));
}
function _M0FP38portable8research14processcontrol16reconcile__write(state, fields) {
  const name = _M0FP38portable8research14processcontrol10event__str(fields, "name");
  let _tmp;
  const _p = "stdout";
  if (!(name === _p)) {
    const _p$2 = "stderr";
    _tmp = !(name === _p$2);
  } else {
    _tmp = false;
  }
  if (_tmp) {
    return undefined;
  }
  const pending = _M0FP38portable8research14processcontrol6iget64(state.val.pending_write, name);
  if (BigInt.asUintN(64, pending) === BigInt.asUintN(64, 0n)) {
    return undefined;
  }
  _M0MPB3Map3setGslE(state.val.pending_write, name, 0n);
  let acked = BigInt.asUintN(64, BigInt(_M0FP38portable8research14processcontrol10event__int(fields, "bytes")));
  if (BigInt.asIntN(64, acked) < BigInt.asIntN(64, 0n)) {
    acked = 0n;
  }
  if (BigInt.asIntN(64, acked) > BigInt.asIntN(64, pending)) {
    acked = pending;
  }
  const _p$2 = _M0FP38portable8research14processcontrol6iget64(state.val.written, name);
  const base = BigInt.asIntN(64, _p$2) < BigInt.asIntN(64, pending) ? 0n : BigInt.asUintN(64, _p$2 - pending);
  const _tmp$2 = state.val.written;
  const _p$3 = acked;
  _M0MPB3Map3setGslE(_tmp$2, name, BigInt.asIntN(64, base) > BigInt.asIntN(64, BigInt.asUintN(64, _M0FP38portable8research14processcontrol10max__count - _p$3)) ? _M0FP38portable8research14processcontrol10max__count : BigInt.asUintN(64, base + _p$3));
}
function _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, action) {
  host(_M0MPC14json4Json17stringify_2einner(action, false, 0, undefined), (raw) => {
    _M0FP38portable8research14processcontrol12reply__event(state, host, notify, done, raw);
  });
}
function _M0FP38portable8research14processcontrol12reply__event(state, host, notify, done, raw) {
  let parsed;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0FP38portable8research2io5parse(raw);
      let _tmp;
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _tmp = _ok._0;
      } else {
        const _err = _bind;
        _try_err = _err._0;
        break _L$2;
      }
      const _bind$2 = _M0FP38portable8research2io10as__object(_tmp);
      if (_bind$2.$tag === 1) {
        const _ok = _bind$2;
        parsed = _ok._0;
      } else {
        const _err = _bind$2;
        _try_err = _err._0;
        break _L$2;
      }
      break _L;
    }
    parsed = undefined;
  }
  if (parsed === undefined) {
    _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "invalid child process event");
    return;
  } else {
    const _Some = parsed;
    const _fields = _Some;
    _M0FP38portable8research14processcontrol13handle__event(state, host, notify, done, _fields);
    return;
  }
}
function _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, message) {
  if (state.val.finished) {
    return undefined;
  }
  const _bind = state.val.primary_failure;
  if (_bind === undefined) {
  } else {
    return undefined;
  }
  state.val.primary_failure = message;
  state.val.failure_name = "Error";
  _M0FP38portable8research14processcontrol13cancel__timer(state, host, notify, done, "deadline");
  _M0FP38portable8research14processcontrol12send__signal(state, host, notify, done, "SIGINT");
  _M0FP38portable8research14processcontrol15schedule__timer(state, host, notify, done, "terminate", state.val.interrupt_grace_ms);
}
function _M0FP38portable8research14processcontrol13cancel__timer(state, host, notify, done, id) {
  let active_now;
  switch (id) {
    case "deadline": {
      active_now = state.val.deadline_active;
      break;
    }
    case "terminate": {
      active_now = state.val.terminate_active;
      break;
    }
    case "kill": {
      active_now = state.val.kill_active;
      break;
    }
    default: {
      active_now = false;
    }
  }
  if (active_now) {
    switch (id) {
      case "deadline": {
        state.val.deadline_active = false;
        break;
      }
      case "terminate": {
        state.val.terminate_active = false;
        break;
      }
      case "kill": {
        state.val.kill_active = false;
        break;
      }
    }
    _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, _M0FP38portable8research14processcontrol10object__of([{ _0: "op", _1: _M0FP38portable8research14processcontrol4jstr("cancelTimer") }, { _0: "id", _1: _M0FP38portable8research14processcontrol4jstr(id) }]));
    return;
  } else {
    return;
  }
}
function _M0FP38portable8research14processcontrol15schedule__timer(state, host, notify, done, id, ms) {
  switch (id) {
    case "deadline": {
      state.val.deadline_active = true;
      break;
    }
    case "terminate": {
      state.val.terminate_active = true;
      break;
    }
    case "kill": {
      state.val.kill_active = true;
      break;
    }
  }
  _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, _M0FP38portable8research14processcontrol10object__of([{ _0: "op", _1: _M0FP38portable8research14processcontrol4jstr("schedule") }, { _0: "id", _1: _M0FP38portable8research14processcontrol4jstr(id) }, { _0: "ms", _1: _M0FP38portable8research14processcontrol4jint(ms) }]));
}
function _M0FP38portable8research14processcontrol12send__signal(state, host, notify, done, name) {
  const fields = _M0MPB3Map11new_2einnerGsRPB4JsonE(8);
  _M0MPB3Map3setGsRPB4JsonE(fields, "op", _M0FP38portable8research14processcontrol4jstr("signal"));
  _M0MPB3Map3setGsRPB4JsonE(fields, "name", _M0FP38portable8research14processcontrol4jstr(name));
  if (state.val.process_group) {
    _M0MPB3Map3setGsRPB4JsonE(fields, "group", _M0FP38portable8research14processcontrol5jbool(true));
  }
  _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, new _M0DTPB4Json6Object(fields));
}
function _M0FP38portable8research14processcontrol13handle__event(state, host, notify, done, fields) {
  if (state.val.finished) {
    return undefined;
  }
  const _bind = _M0FP38portable8research14processcontrol10event__str(fields, "event");
  switch (_bind) {
    case "spawned": {
      _M0FP38portable8research14processcontrol15handle__spawned(state, host, notify, done);
      return;
    }
    case "data": {
      _M0FP38portable8research14processcontrol12handle__data(state, host, notify, done, fields);
      return;
    }
    case "flush": {
      _M0FP38portable8research14processcontrol13handle__flush(state, host, notify, done, fields);
      return;
    }
    case "close": {
      _M0FP38portable8research14processcontrol13handle__close(state, host, notify, done, fields);
      return;
    }
    case "childError": {
      _M0FP38portable8research14processcontrol20handle__child__error(state, host, notify, done, fields);
      return;
    }
    case "abort": {
      state.val.interrupted = true;
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "process control interrupted by signal");
      return;
    }
    case "notifyError": {
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, `onLine callback failed: ${_M0FP38portable8research14processcontrol10event__str(fields, "message")}`);
      return;
    }
    case "timer": {
      _M0FP38portable8research14processcontrol13handle__timer(state, host, notify, done, fields);
      return;
    }
    case "written": {
      _M0FP38portable8research14processcontrol16reconcile__write(state, fields);
      return;
    }
    case "ok": {
      return;
    }
    case "scheduled": {
      return;
    }
    case "signalError": {
      _M0FP38portable8research14processcontrol24push__termination__error(state, _M0FP38portable8research14processcontrol10event__str(fields, "message"));
      return;
    }
    case "cleanupError": {
      _M0FP38portable8research14processcontrol24push__termination__error(state, _M0FP38portable8research14processcontrol10event__str(fields, "message"));
      return;
    }
    case "writeError": {
      _M0FP38portable8research14processcontrol16reconcile__write(state, fields);
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, `private log write failed: ${_M0FP38portable8research14processcontrol10event__str(fields, "message")}`);
      return;
    }
    case "scheduleError": {
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, `timer scheduling failed: ${_M0FP38portable8research14processcontrol10event__str(fields, "message")}`);
      return;
    }
    default: {
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "unknown child process event");
      return;
    }
  }
}
function _M0FP38portable8research14processcontrol20handle__child__error(state, host, notify, done, fields) {
  state.val.elapsed_ms = _M0FP38portable8research14processcontrol10event__int(fields, "elapsedMs");
  const _bind = state.val.primary_failure;
  if (_bind === undefined) {
    state.val.primary_failure = _M0FP38portable8research14processcontrol10event__str(fields, "message");
    state.val.failure_name = "Error";
  }
  _M0FP38portable8research14processcontrol11finish__run(state, host, notify, done);
}
function _M0FP38portable8research14processcontrol11finish__run(state, host, notify, done) {
  if (state.val.finished) {
    return undefined;
  }
  state.val.finished = true;
  _M0FP38portable8research14processcontrol13cancel__timer(state, host, notify, done, "deadline");
  _M0FP38portable8research14processcontrol13cancel__timer(state, host, notify, done, "terminate");
  _M0FP38portable8research14processcontrol13cancel__timer(state, host, notify, done, "kill");
  _M0FP38portable8research14processcontrol10call__done(state.val, done);
}
function _M0FP38portable8research14processcontrol13handle__close(state, host, notify, done, fields) {
  if (state.val.child_closed) {
    return undefined;
  }
  state.val.child_closed = true;
  state.val.elapsed_ms = _M0FP38portable8research14processcontrol10event__int(fields, "elapsedMs");
  const _tmp = state.val;
  let _tmp$2;
  _L: {
    _L$2: {
      const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, "code");
      if (_bind === undefined) {
        break _L$2;
      } else {
        const _Some = _bind;
        const _x = _Some;
        if (_x.$tag === 3) {
          const _Number = _x;
          const _number = _Number._0;
          _tmp$2 = _M0MPC16double6Double7to__int(_number);
        } else {
          break _L$2;
        }
      }
      break _L;
    }
    _tmp$2 = undefined;
  }
  _tmp.exit_code = _tmp$2;
  const _tmp$3 = state.val;
  let _tmp$4;
  _L$2: {
    _L$3: {
      const _bind = _M0MPB3Map3getGsRPB4JsonE(fields, "signal");
      if (_bind === undefined) {
        break _L$3;
      } else {
        const _Some = _bind;
        const _x = _Some;
        if (_x.$tag === 4) {
          const _String = _x;
          const _text = _String._0;
          _tmp$4 = _text;
        } else {
          break _L$3;
        }
      }
      break _L$2;
    }
    _tmp$4 = undefined;
  }
  _tmp$3.signal = _tmp$4;
  if (state.val.process_group) {
    const _bind = state.val.primary_failure;
    if (_bind === undefined) {
    } else {
      if (!state.val.group_kill_sent) {
        state.val.group_kill_sent = true;
        _M0FP38portable8research14processcontrol12send__signal(state, host, notify, done, "SIGKILL");
      }
    }
  }
  _M0FP38portable8research14processcontrol11finish__run(state, host, notify, done);
}
function _M0FP38portable8research14processcontrol12handle__data(state, host, notify, done, fields) {
  const name = _M0FP38portable8research14processcontrol10event__str(fields, "name");
  let _tmp;
  const _p = "stdout";
  if (!(name === _p)) {
    const _p$2 = "stderr";
    _tmp = !(name === _p$2);
  } else {
    _tmp = false;
  }
  if (_tmp) {
    return undefined;
  }
  const chunk_id = _M0FP38portable8research14processcontrol10event__int(fields, "chunkId");
  const byte_len = BigInt.asUintN(64, BigInt(_M0FP38portable8research14processcontrol10event__int(fields, "bytes")));
  const text = _M0FP38portable8research14processcontrol10event__str(fields, "text");
  const cap = BigInt.asUintN(64, BigInt(state.val.max_log_bytes));
  const _p$2 = _M0FP38portable8research14processcontrol6iget64(state.val.received, name);
  const received = BigInt.asIntN(64, _p$2) > BigInt.asIntN(64, BigInt.asUintN(64, _M0FP38portable8research14processcontrol10max__count - byte_len)) ? _M0FP38portable8research14processcontrol10max__count : BigInt.asUintN(64, _p$2 + byte_len);
  _M0MPB3Map3setGslE(state.val.received, name, received);
  const prev = _M0FP38portable8research14processcontrol6iget64(state.val.written, name);
  const remaining = BigInt.asUintN(64, cap - prev);
  const allowed = BigInt.asIntN(64, remaining) > BigInt.asIntN(64, 0n) ? (BigInt.asIntN(64, remaining) < BigInt.asIntN(64, byte_len) ? remaining : byte_len) : 0n;
  if (BigInt.asIntN(64, allowed) > BigInt.asIntN(64, 0n)) {
    _M0MPB3Map3setGslE(state.val.written, name, BigInt.asUintN(64, prev + allowed));
    _M0MPB3Map3setGslE(state.val.pending_write, name, allowed);
    _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, _M0FP38portable8research14processcontrol10object__of([{ _0: "op", _1: _M0FP38portable8research14processcontrol4jstr("writeLog") }, { _0: "name", _1: _M0FP38portable8research14processcontrol4jstr(name) }, { _0: "chunkId", _1: _M0FP38portable8research14processcontrol4jint(chunk_id) }, { _0: "bytes", _1: _M0FP38portable8research14processcontrol6jcount(allowed) }]));
  }
  if (BigInt.asIntN(64, received) > BigInt.asIntN(64, cap)) {
    _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, `${name} exceeded private log limit`);
  }
  let _tmp$2;
  if (name === "stdout") {
    const _p$3 = state.val.primary_failure;
    _tmp$2 = _p$3 === undefined ? !state.val.finished : false;
  } else {
    _tmp$2 = false;
  }
  if (_tmp$2) {
    _M0FP38portable8research14processcontrol13process__text(state, host, notify, done, text);
    return;
  } else {
    return;
  }
}
function _M0FP38portable8research14processcontrol13process__text(state, host, notify, done, text) {
  if (text === "") {
    return undefined;
  }
  let buffer = `${state.val.line_buffer}${text}`;
  let running = true;
  while (true) {
    let _tmp;
    if (running) {
      const _p = state.val.primary_failure;
      _tmp = _p === undefined ? !state.val.finished : false;
    } else {
      _tmp = false;
    }
    if (_tmp) {
      const _bind = _M0MPC16string6String4find(buffer, new _M0TPC16string10StringView(_M0FP38portable8research14processcontrol13process__textN7_2abindS394, 0, _M0FP38portable8research14processcontrol13process__textN7_2abindS394.length));
      if (_bind === undefined) {
        running = false;
      } else {
        const _Some = _bind;
        const _index = _Some;
        const line = _M0MPC16string10StringView9to__owned(_M0MPC16string6String11sub_2einner(buffer, 0, _index));
        buffer = _M0MPC16string10StringView9to__owned(_M0MPC16string6String11sub_2einner(buffer, _index + 1 | 0, undefined));
        _M0FP38portable8research14processcontrol13deliver__line(state, host, notify, done, line);
      }
      continue;
    } else {
      break;
    }
  }
  const _p = state.val.primary_failure;
  if (_p === undefined ? !state.val.finished : false) {
    if (_M0FP38portable8research14processcontrol9utf8__len(buffer) > state.val.max_line_bytes) {
      state.val.line_buffer = "";
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "stdout line exceeded parser limit");
      return;
    } else {
      state.val.line_buffer = buffer;
      return;
    }
  } else {
    state.val.line_buffer = "";
    return;
  }
}
function _M0FP38portable8research14processcontrol13deliver__line(state, host, notify, done, line) {
  if (_M0FP38portable8research14processcontrol9utf8__len(line) > state.val.max_line_bytes) {
    _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "stdout line exceeded parser limit");
    return undefined;
  }
  notify(_M0MPC14json4Json17stringify_2einner(_M0FP38portable8research14processcontrol10object__of([{ _0: "type", _1: _M0FP38portable8research14processcontrol4jstr("line") }, { _0: "text", _1: _M0FP38portable8research14processcontrol4jstr(line) }]), false, 0, undefined));
  const _p = state.val.primary_failure;
  if (!(_p === undefined ? !state.val.finished : false)) {
    return undefined;
  }
  if (_M0IPC16string10StringViewPB2Eq5equal(_M0MPC16string6String4trim(line, undefined), new _M0TPC16string10StringView(_M0FP38portable8research14processcontrol13deliver__lineN7_2abindS400, 0, _M0FP38portable8research14processcontrol13deliver__lineN7_2abindS400.length))) {
    return undefined;
  }
  let parsed;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0FP38portable8research2io5parse(line);
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
    parsed = undefined;
  }
  if (parsed === undefined) {
    return;
  } else {
    const _Some = parsed;
    const _value = _Some;
    _M0FP38portable8research14processcontrol17consider__summary(state, host, notify, done, _value);
    return;
  }
}
function _M0FP38portable8research14processcontrol17consider__summary(state, host, notify, done, value) {
  if (value.$tag === 6) {
    const _Object = value;
    const _fields = _Object._0;
    const _bind = _M0MPB3Map3getGsRPB4JsonE(_fields, "receipt");
    if (_bind === undefined) {
      return;
    } else {
      const _Some = _bind;
      const _x = _Some;
      if (_x.$tag === 4) {
        _M0MPC15array5Array4pushGsE(state.val.summaries, value);
        if (state.val.summaries.length > 8) {
          _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "too many process receipt summaries");
          return;
        } else {
          return;
        }
      } else {
        return;
      }
    }
  } else {
    return;
  }
}
function _M0FP38portable8research14processcontrol13handle__flush(state, host, notify, done, fields) {
  let _tmp;
  if (_M0FP38portable8research14processcontrol10event__str(fields, "name") === "stdout") {
    const _p = state.val.primary_failure;
    _tmp = _p === undefined ? !state.val.finished : false;
  } else {
    _tmp = false;
  }
  if (_tmp) {
    _M0FP38portable8research14processcontrol13process__text(state, host, notify, done, _M0FP38portable8research14processcontrol10event__str(fields, "text"));
    let _tmp$2;
    const _p = state.val.primary_failure;
    if (_p === undefined ? !state.val.finished : false) {
      _tmp$2 = _M0FP38portable8research14processcontrol11event__bool(fields, "final");
    } else {
      _tmp$2 = false;
    }
    if (_tmp$2) {
      const residual = state.val.line_buffer;
      state.val.line_buffer = "";
      const _p$2 = "";
      if (!(residual === _p$2)) {
        _M0FP38portable8research14processcontrol13deliver__line(state, host, notify, done, residual);
        return;
      } else {
        return;
      }
    } else {
      return;
    }
  } else {
    return;
  }
}
function _M0FP38portable8research14processcontrol15handle__spawned(state, host, notify, done) {
  _M0FP38portable8research14processcontrol15schedule__timer(state, host, notify, done, "deadline", state.val.timeout_ms);
}
function _M0FP38portable8research14processcontrol13handle__timer(state, host, notify, done, fields) {
  const _bind = _M0FP38portable8research14processcontrol10event__str(fields, "id");
  switch (_bind) {
    case "deadline": {
      state.val.deadline_active = false;
      state.val.timed_out = true;
      _M0FP38portable8research14processcontrol11begin__stop(state, host, notify, done, "process exceeded scenario check deadline");
      return;
    }
    case "terminate": {
      state.val.terminate_active = false;
      state.val.forced_termination = true;
      state.val.cleanup_unverified = true;
      _M0FP38portable8research14processcontrol12send__signal(state, host, notify, done, "SIGTERM");
      _M0FP38portable8research14processcontrol15schedule__timer(state, host, notify, done, "kill", state.val.terminate_grace_ms);
      return;
    }
    case "kill": {
      state.val.kill_active = false;
      state.val.forced_termination = true;
      state.val.cleanup_unverified = true;
      if (state.val.process_group) {
        state.val.group_kill_sent = true;
      }
      _M0FP38portable8research14processcontrol12send__signal(state, host, notify, done, "SIGKILL");
      _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, _M0FP38portable8research14processcontrol10object__of([{ _0: "op", _1: _M0FP38portable8research14processcontrol4jstr("destroyPipes") }]));
      return;
    }
    default: {
      return;
    }
  }
}
function _M0FP38portable8research14processcontrol18run__process__json(request, host, notify, done) {
  let outcome;
  let _try_err;
  _L: {
    _L$2: {
      const _bind = _M0FP38portable8research14processcontrol13parse__config(request);
      let _tmp;
      if (_bind.$tag === 1) {
        const _ok = _bind;
        _tmp = _ok._0;
      } else {
        const _err = _bind;
        _try_err = _err._0;
        break _L$2;
      }
      outcome = new _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE2Ok(_tmp);
      break _L;
    }
    const _Io = _try_err;
    const _message = _Io._0;
    outcome = new _M0DTPC16result6ResultGRP38portable8research14processcontrol6ConfigsE3Err(_message);
  }
  if (outcome.$tag === 0) {
    const _Err = outcome;
    const _message = _Err._0;
    _M0FP38portable8research14processcontrol10call__done(_M0FP38portable8research14processcontrol13invalid__core(_message), done);
    return;
  } else {
    const _Ok = outcome;
    const _cfg = _Ok._0;
    const core = _M0FP38portable8research14processcontrol11empty__core(_cfg.file, _cfg.args, _cfg.cwd, _cfg.stdout_path, _cfg.stderr_path, _cfg.max_log_bytes, _cfg.max_line_bytes, _cfg.interrupt_grace_ms, _cfg.terminate_grace_ms, _cfg.timeout_ms, _cfg.process_group);
    if (_cfg.aborted) {
      core.interrupted = true;
      core.primary_failure = _M0FP38portable8research14processcontrol18run__process__jsonN6constrS438;
      _M0FP38portable8research14processcontrol10call__done(core, done);
      return;
    } else {
      const state = _M0FPC13ref3newGRP38portable8research14processcontrol4CoreE(core);
      _M0FP38portable8research14processcontrol12send__action(state, host, notify, done, _M0FP38portable8research14processcontrol13spawn__action(_cfg));
      return;
    }
  }
}
export { _M0FP38portable8research14processcontrol18run__process__json as run_process_json }
