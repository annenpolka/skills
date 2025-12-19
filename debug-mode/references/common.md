# Common Instrumentation Reference

Debug Mode で使用する共通フォーマットと設定。

## Log Format

NDJSON (1行1JSON):

```json
{"h":"H1","l":"label","v":{"key":"value"},"ts":1702567890123}
```

| Field | Meaning |
|-------|---------|
| h | Hypothesis ID (H1, H2, ...) |
| l | Label (what this log represents) |
| v | Value (any JSON-serializable data) |
| ts | Timestamp in milliseconds |

## Region Syntax

言語別のデバッグ計装を囲むリージョン構文:

| Language | Start | End |
|----------|-------|-----|
| JS/TS | `//#region debug:H1` | `//#endregion` |
| Python | `# region debug:H1` | `# endregion` |
| Ruby | `# region debug:H1` | `# endregion` |
| Go | `// region debug:H1` | `// endregion` |
| Rust | `// region debug:H1` | `// endregion` |
| Java/Kotlin | `// region debug:H1` | `// endregion` |
| Swift | `// region debug:H1` | `// endregion` |
| C/C++ | `// region debug:H1` | `// endregion` |
| Dart | `// region debug:H1` | `// endregion` |
| C# | `#region debug:H1` | `#endregion` |

## Log Collector Server

ブラウザやモバイルデバイスからログを収集するための HTTP サーバー:

```bash
node -e "require('http').createServer((q,s)=>{s.setHeader('Access-Control-Allow-Origin','*');s.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');s.setHeader('Access-Control-Allow-Headers','Content-Type');if(q.method==='OPTIONS'){s.writeHead(204).end();return}let b='';q.on('data',c=>b+=c);q.on('end',()=>{require('fs').appendFileSync('debug.log',b+'\n');s.writeHead(204).end()})}).listen(4567,()=>console.log('Collector: http://localhost:4567'))"
```

## Log Analysis

```bash
cat debug.log | jq .                              # View all
jq 'select(.h == "H1")' debug.log                 # Filter by hypothesis
cat debug.log | jq -s 'group_by(.h)'              # Group by hypothesis
tail -f debug.log | jq .                          # Realtime
```

## Retrieving Logs from Mobile Devices

### iOS

```bash
# Via Xcode
# Window > Devices and Simulators > Select device > Download Container

# Via libimobiledevice
idevice_id -l
ideviceinstaller -l
```

Or add a "Export Logs" button in debug builds that shares the file.

### Android

```bash
adb shell run-as com.yourapp cat /data/data/com.yourapp/files/debug.log > debug.log

# Or from external storage (if saved there)
adb pull /sdcard/Android/data/com.yourapp/files/debug.log
```

### React Native / Flutter

Use the HTTP method with collector server when possible - logs go directly to your dev machine.
