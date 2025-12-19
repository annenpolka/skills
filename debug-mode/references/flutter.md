# Flutter (Dart)

Debug Mode instrumentation patterns for Flutter/Dart.

## Basic

### One-liner

```dart
// region debug:H1
import 'dart:convert';
import 'dart:io';
File('debug.log').writeAsStringSync(jsonEncode({'h':'H1','l':'label','v':{'key':value},'ts':DateTime.now().millisecondsSinceEpoch})+'\n', mode: FileMode.append);
// endregion
```

### Expanded

```dart
// region debug:H1
import 'dart:convert';
import 'dart:io';

final entry = {
  'h': 'H1',
  'l': 'user_state',
  'v': {'userId': userId, 'cart': cart},
  'ts': DateTime.now().millisecondsSinceEpoch,
};

File('debug.log').writeAsStringSync(
  jsonEncode(entry) + '\n',
  mode: FileMode.append,
);
// endregion
```

## With path_provider

Writing to app documents directory:

```dart
// region debug:H1
import 'package:path_provider/path_provider.dart';

Future<void> debugProbe(String h, String l, Map<String, dynamic> v) async {
  final dir = await getApplicationDocumentsDirectory();
  final file = File('${dir.path}/debug.log');
  final entry = jsonEncode({
    'h': h,
    'l': l,
    'v': v,
    'ts': DateTime.now().millisecondsSinceEpoch,
  });
  await file.writeAsString('$entry\n', mode: FileMode.append);
}

await debugProbe('H1', 'user_state', {'userId': userId, 'cart': cart});
// endregion
```

See [common.md](common.md) for retrieving logs from mobile devices.
