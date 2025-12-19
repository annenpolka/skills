# C#

Debug Mode instrumentation patterns for C#.

## One-liner

```csharp
#region debug:H1
System.IO.File.AppendAllText("debug.log", System.Text.Json.JsonSerializer.Serialize(new{h="H1",l="label",v=new{key=value},ts=DateTimeOffset.Now.ToUnixTimeMilliseconds()})+"\n");
#endregion
```

## Expanded

```csharp
#region debug:H1
using System.Text.Json;

var entry = new
{
    h = "H1",
    l = "user_state",
    v = new { userId = userId, cart = cart },
    ts = DateTimeOffset.Now.ToUnixTimeMilliseconds()
};

File.AppendAllText("debug.log", JsonSerializer.Serialize(entry) + "\n");
#endregion
```
