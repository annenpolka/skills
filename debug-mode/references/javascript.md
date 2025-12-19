# JavaScript / TypeScript

Debug Mode instrumentation patterns for Web and Node.js.

## HTTP Method (Browser + Node.js)

Requires collector server running. Works in browser and Node.js.

### One-liner

```javascript
//#region debug:H1
fetch('http://localhost:4567',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({h:'H1',l:'label',v:{key:value},ts:Date.now()})}).catch(()=>{});
//#endregion
```

### Expanded

```javascript
//#region debug:H1
fetch('http://localhost:4567', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    h: 'H1',
    l: 'user_state',
    v: { userId, cart, timestamp: new Date().toISOString() },
    ts: Date.now()
  })
}).catch(() => {});
//#endregion
```

## File Method (Node.js only)

Direct file write. Does NOT work in browser.

### One-liner

```javascript
//#region debug:H1
require('fs').appendFileSync('debug.log',JSON.stringify({h:'H1',l:'label',v:{key:value},ts:Date.now()})+'\n');
//#endregion
```

### Expanded

```javascript
//#region debug:H1
const fs = require('fs');
fs.appendFileSync('debug.log', JSON.stringify({
  h: 'H1',
  l: 'user_state',
  v: { userId, cart },
  ts: Date.now()
}) + '\n');
//#endregion
```
