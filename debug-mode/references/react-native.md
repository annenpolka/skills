# React Native

Debug Mode instrumentation patterns for React Native.

## HTTP Method (Recommended)

Same as web JavaScript. Requires collector server running.

### One-liner

```javascript
//#region debug:H1
fetch('http://localhost:4567',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({h:'H1',l:'label',v:{key:value},ts:Date.now()})}).catch(()=>{});
//#endregion
```

**Note:** Use your dev machine's IP instead of `localhost` when running on physical device:

```javascript
fetch('http://192.168.1.100:4567', ...)
```

## AsyncStorage (Persisted on Device)

```javascript
//#region debug:H1
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.getItem('debug.log').then(log => {
  const entry = JSON.stringify({h:'H1',l:'label',v:{key:value},ts:Date.now()}) + '\n';
  AsyncStorage.setItem('debug.log', (log || '') + entry);
});
//#endregion
```

See [common.md](common.md) for retrieving logs from mobile devices.
