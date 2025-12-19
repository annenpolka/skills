---
name: debug-mode
description: |
  Structured printf debugging skill for diagnosing and fixing bugs with runtime evidence.
  Use when: (1) User says "debug", "investigate bug", "why isn't this working",
  (2) User reports unexpected behavior or errors,
  (3) User wants evidence-based debugging instead of guesswork.
  Core principle: Observe first, fix later. Never propose fixes before analyzing logs.
---

# Debug Mode

Structured debugging with runtime evidence.
**Don't guess. Observe.**

## Core Principles

1. **No fix without logs** - Reading code alone is not enough
2. **Multiple hypotheses** - At least 3, ideally 5
3. **Evidence-based judgment** - CONFIRMED / REJECTED / INCONCLUSIVE
4. **Verify before cleanup** - Keep instrumentation until fix is confirmed

## Workflow

```
Problem → Setup → Hypotheses → Instrumentation → Clear Logs
    → Reproduce → Analyze → Fix → Verify → Cleanup
```

## Step 1: Understand the Problem

Gather from user (ask if unclear):
- Symptom (expected vs actual)
- Reproduction steps
- Recent changes

## Step 2: Setup Logging

Choose based on environment. See [references/common.md](references/common.md) for log format and region syntax.

Language-specific patterns:
- [JavaScript/TypeScript](references/javascript.md)
- [Python](references/python.md)
- [Ruby](references/ruby.md)
- [Go](references/go.md)
- [Rust](references/rust.md)
- [Java](references/java.md)
- [Kotlin](references/kotlin.md)
- [Swift](references/swift.md)
- [React Native](references/react-native.md)
- [Flutter](references/flutter.md)
- [C/C++](references/c-cpp.md)
- [C#](references/csharp.md)

**Web (JavaScript/TypeScript with browser):** Start collector server

```bash
node -e "require('http').createServer((q,s)=>{s.setHeader('Access-Control-Allow-Origin','*');s.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');s.setHeader('Access-Control-Allow-Headers','Content-Type');if(q.method==='OPTIONS'){s.writeHead(204).end();return}let b='';q.on('data',c=>b+=c);q.on('end',()=>{require('fs').appendFileSync('debug.log',b+'\n');s.writeHead(204).end()})}).listen(4567,()=>console.log('Collector: http://localhost:4567'))"
```

**Server-side only (Node.js, Python, Ruby, Go, etc.):** Direct file write, no server needed.

## Step 3: Generate Hypotheses

**Generate 3-5 hypotheses. Don't fixate on one.**

```markdown
## Hypotheses

### H1: [Title]
- Cause: ...
- Verify: Check value X before/after Y

### H2: [Title]
- Cause: ...
- Verify: ...

### H3: [Title]
- Cause: ...
- Verify: ...
```

## Step 4: Generate Instrumentation

Insert logging for each hypothesis. **3-8 locations.**

**Instrumentation points:**
- Function entry (arguments)
- Function exit (return value)
- Before/after critical operations
- Branch paths (which if/else was taken)
- Before/after state mutations

**Required: Wrap with `#region debug:{hypothesisId}`**

See language-specific reference files above for templates.

## Step 5: Clear Old Logs

```bash
rm -f debug.log
```

## Step 6: Request Reproduction

```markdown
## Reproduction Steps

1. Confirm logging is set up (collector running if needed)
2. Confirm `debug.log` is deleted
3. Start/restart the app
4. [Specific steps to trigger the bug]
5. Let me know when done
```

## Step 7: Analyze Logs

```bash
cat debug.log | jq .                              # View all
jq 'select(.h == "H1")' debug.log                 # Filter by hypothesis
cat debug.log | jq -s 'group_by(.h)'              # Group by hypothesis
tail -f debug.log | jq .                          # Realtime
```

Evaluate each hypothesis:

| Verdict | Meaning |
|---------|---------|
| CONFIRMED | Logs clearly support this hypothesis |
| REJECTED | Logs contradict this hypothesis |
| INCONCLUSIVE | Insufficient data |

## Step 8: Fix

**Only when a hypothesis is CONFIRMED.**

- Minimal diff
- **Keep instrumentation in place**

**If all REJECTED:** New hypotheses from different subsystems → Step 3.

## Step 9: Verify

```markdown
1. `rm -f debug.log`
2. Restart the app
3. Same operation
4. Let me know when done
```

Compare before/after logs.

## Step 10: Cleanup

**Only after user confirms fix works.**

```bash
grep -rn "#region debug:" src/
```

Remove instrumentation, delete `debug.log`, stop collector.

## Log Format

NDJSON (one JSON per line):

```jsonl
{"h":"H1","l":"state_before","v":{"userId":"123"},"ts":1702567890123}
```

| Field | Meaning |
|-------|---------|
| h | Hypothesis ID |
| l | Label |
| v | Value |
| ts | Timestamp (ms) |

## Forbidden

- ❌ Proposing fixes before analyzing logs
- ❌ Only one hypothesis
- ❌ Removing instrumentation before verification
- ❌ "Probably this" guesswork
- ❌ setTimeout/sleep as a "fix"

## References

- [references/common.md](references/common.md) - Log format, region syntax, mobile log retrieval
- [references/javascript.md](references/javascript.md) - JavaScript/TypeScript
- [references/python.md](references/python.md) - Python
- [references/ruby.md](references/ruby.md) - Ruby
- [references/go.md](references/go.md) - Go
- [references/rust.md](references/rust.md) - Rust
- [references/java.md](references/java.md) - Java
- [references/kotlin.md](references/kotlin.md) - Kotlin/Android
- [references/swift.md](references/swift.md) - Swift/iOS
- [references/react-native.md](references/react-native.md) - React Native
- [references/flutter.md](references/flutter.md) - Flutter/Dart
- [references/c-cpp.md](references/c-cpp.md) - C/C++
- [references/csharp.md](references/csharp.md) - C#
