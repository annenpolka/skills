# Kotlin

Debug Mode instrumentation patterns for Kotlin (including Android).

## Standard Kotlin

### One-liner

```kotlin
// region debug:H1
java.io.File("debug.log").appendText("""{"h":"H1","l":"label","v":${org.json.JSONObject(mapOf("key" to value))},"ts":${System.currentTimeMillis()}}"""+"\n")
// endregion
```

### Expanded

```kotlin
// region debug:H1
import org.json.JSONObject
import java.io.File

File("debug.log").appendText(
    JSONObject(mapOf(
        "h" to "H1",
        "l" to "user_state",
        "v" to mapOf("userId" to userId, "cart" to cart),
        "ts" to System.currentTimeMillis()
    )).toString() + "\n"
)
// endregion
```

## Android with Context

Writing to app files directory:

```kotlin
// region debug:H1
context.openFileOutput("debug.log", Context.MODE_APPEND).bufferedWriter().use {
    it.write("""{"h":"H1","l":"label","v":${JSONObject(mapOf("key" to value))},"ts":${System.currentTimeMillis()}}""" + "\n")
}
// endregion
```

See [common.md](common.md) for retrieving logs from Android devices.
