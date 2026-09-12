// Thin Node leaf for the MoonBit process controller.
//
// This module performs only side effects: spawning the owned child, writing
// private log bytes, sending signals, scheduling timers, tearing down pipes and
// forwarding events. Every lifecycle, limit, escalation and result-assembly
// decision lives in packages/dev-tools/src/processcontrol/processcontrol.mbt.
import {spawn} from 'node:child_process';
import {closeSync, openSync, writeSync} from 'node:fs';
import {StringDecoder} from 'node:string_decoder';

const describe = error => ({name: error?.name ?? 'Error', message: String(error?.message ?? error)});
const json = value => JSON.stringify(value);

export function createProcessLeaf({signal, onLine, onFatal} = {}) {
  const startedAt = performance.now();
  let child = null;
  let rawReply = () => {};
  let failedController = false, childClosed = false, closePromise = Promise.resolve();
  const sendReply = raw => {
    if(failedController)return;
    try{rawReply(raw);}catch(error){
      failedController=true;
      if(onFatal)onFatal(error);
      else void close().then(()=>{throw error;});
    }
  };
  let notifyFailed = false;
  let notifyErrorQueued = false;
  let abortAttached = false;
  let nextChunkId = 1;
  let cleaned = false;
  let groupOwned = false;
  let ownedChildPid = null;
  let terminationRequested = false;
  let groupKillSent = false;
  let teardownPromise;
  const fds = {};
  const chunks = new Map();
  const timers = new Map();

  const onAbort = () => queueMicrotask(() => sendReply(json({event: 'abort'})));

  // Report synchronously so the controller marks the run failed before it
  // considers the same line for receipt summaries.
  const queueNotifyError = message => {
    if (notifyErrorQueued) return;
    notifyErrorQueued = true;
    sendReply(json({event: 'notifyError', message}));
  };

  const notify = raw => {
    if (notifyFailed || typeof onLine !== 'function') return;
    let event;
    try { event = JSON.parse(raw); } catch { return; }
    if (event?.type !== 'line' || typeof event.text !== 'string') return;
    try { onLine(event.text); }
    catch (error) {
      notifyFailed = true;
      queueNotifyError(describe(error).message);
    }
  };

  // Idempotent terminal cleanup. Returns every failure instead of swallowing it
  // so the controller can surface it as a termination error.
  function cleanup() {
    if (cleaned) return [];
    cleaned = true;
    const errors = [];
    if (abortAttached) {
      try { signal.removeEventListener('abort', onAbort); }
      catch (error) { errors.push(describe(error)); }
      abortAttached = false;
    }
    for (const timer of timers.values()) {
      try { clearTimeout(timer); }
      catch (error) { errors.push(describe(error)); }
    }
    timers.clear();
    chunks.clear();
    for (const name of Object.keys(fds)) {
      try { closeSync(fds[name]); }
      catch (error) { errors.push(describe(error)); }
      delete fds[name];
    }
    return errors;
  }

  const reportCleanup = () => {
    for (const error of cleanup()) {
      sendReply(json({event: 'cleanupError', message: error.message}));
    }
  };

  function onData(name, bytes, decoder) {
    const chunkId = nextChunkId++;
    chunks.set(chunkId, bytes);
    try {
      const text = decoder ? decoder.write(bytes) : '';
      // The controller's reply (and any writeLog it issues) runs synchronously
      // inside this call, so the raw buffer is dead as soon as it returns.
      sendReply(json({event: 'data', name, chunkId, bytes: bytes.length, text}));
    } finally {
      chunks.delete(chunkId);
    }
  }

  function doSpawn(action) {
    try {
      for (const name of ['stdout', 'stderr']) {
        fds[name] = openSync(action[name + 'Path'], action.exclusive ? 'wx' : 'w', 0o600);
      }
      const options = {stdio: ['ignore', 'pipe', 'pipe']};
      if (typeof action.cwd === 'string') options.cwd = action.cwd;
      if (action.env !== undefined) options.env = {...process.env, ...action.env};
      // Only an explicitly requested owned group is detached; the default
      // single-child path keeps its original spawn semantics.
      if (action.processGroup === true) options.detached = true;
      child = spawn(action.file, action.args ?? [], options);
      ownedChildPid = Number.isInteger(child.pid) ? child.pid : null;
      groupOwned = action.processGroup === true && ownedChildPid !== null;
      closePromise=new Promise(resolve=>child.once('close',()=>{childClosed=true;resolve();}));
    } catch (error) {
      reportCleanup();
      sendReply(json({event: 'childError', message: describe(error).message, code: error?.code}));
      return;
    }
    const stdoutDecoder = new StringDecoder('utf8');
    child.once('spawn', () => sendReply(json({event: 'spawned'})));
    child.on('error', error => {
      reportCleanup();
      sendReply(json({event: 'childError', message: describe(error).message, code: error?.code,
        elapsedMs: Math.round(performance.now() - startedAt)}));
    });
    child.stdout?.on('data', bytes => onData('stdout', bytes, stdoutDecoder));
    child.stderr?.on('data', bytes => onData('stderr', bytes, null));
    child.once('close', (code, signalName) => {
      const tail = child.stdout ? stdoutDecoder.end() : '';
      sendReply(json({event: 'flush', name: 'stdout', text: tail, final: true}));
      const finish = () => {
        reportCleanup();
        sendReply(json({event: 'close', code: code ?? null, signal: signalName ?? null,
          elapsedMs: Math.round(performance.now() - startedAt)}));
      };
      // A queued notify failure must reach the controller before close can end
      // the run, otherwise an EOF onLine throw would look like success.
      if (notifyErrorQueued) queueMicrotask(finish);
      else finish();
    });
  }

  function doWriteLog(action) {
    const fd = fds[action.name];
    const chunk = chunks.get(action.chunkId);
    chunks.delete(action.chunkId);
    if (fd === undefined || !chunk) {
      sendReply(json({event: 'writeError', name: action.name, bytes: 0, message: 'unknown private log chunk'}));
      return;
    }
    const view = chunk.subarray(0, Math.max(0, Math.min(action.bytes, chunk.length)));
    let offset = 0;
    try {
      while (offset < view.length) {
        const written = writeSync(fd, view, offset);
        if (written <= 0) throw new Error('short private log write');
        offset += written;
      }
      sendReply(json({event: 'written', name: action.name, bytes: offset}));
    } catch (error) {
      // Acknowledge only the prefix that reached disk before the failure.
      sendReply(json({event: 'writeError', name: action.name, bytes: offset, message: describe(error).message}));
    }
  }

  function doSignal(action) {
    if (action.group === true) {
      // Group signals are forwarded to the negative owned leader PID only, and
      // only when this leaf actually spawned that detached group. The leader's
      // exit is irrelevant: descendants may outlive it.
      if (!groupOwned || ownedChildPid === null) {
        sendReply(json({event: 'signalError', message: 'owned process group is not available'}));
        return;
      }
      terminationRequested = true;
      try {
        process.kill(-ownedChildPid, action.name);
        if (action.name === 'SIGKILL') groupKillSent = true;
        sendReply(json({event: 'ok'}));
      } catch (error) {
        // A vanished group is an idempotent cleanup success; anything else is
        // retained as a termination error.
        if (error?.code === 'ESRCH') {
          if (action.name === 'SIGKILL') groupKillSent = true;
          sendReply(json({event: 'ok'}));
        } else sendReply(json({event: 'signalError', message: describe(error).message}));
      }
      return;
    }
    if (!child || child.exitCode !== null || child.signalCode !== null) {
      sendReply(json({event: 'signalError', message: 'owned child is not running'}));
      return;
    }
    terminationRequested = true;
    try {
      child.kill(action.name);
      sendReply(json({event: 'ok'}));
    } catch (error) {
      sendReply(json({event: 'signalError', message: describe(error).message}));
    }
  }

  function doSchedule(action) {
    try {
      const existing = timers.get(action.id);
      if (existing !== undefined) clearTimeout(existing);
      const timer = setTimeout(() => {
        timers.delete(action.id);
        sendReply(json({event: 'timer', id: action.id}));
      }, action.ms);
      timers.set(action.id, timer);
      sendReply(json({event: 'scheduled'}));
    } catch (error) {
      sendReply(json({event: 'scheduleError', message: describe(error).message}));
    }
  }

  function doCancelTimer(action) {
    const timer = timers.get(action.id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(action.id);
    }
    sendReply(json({event: 'ok'}));
  }

  function doDestroyPipes() {
    const errors = [];
    for (const stream of [child?.stdout, child?.stderr]) {
      if (!stream) continue;
      try { stream.destroy(); }
      catch (error) { errors.push(describe(error)); }
    }
    for (const error of errors) sendReply(json({event: 'cleanupError', message: error.message}));
    sendReply(json({event: 'ok'}));
  }

  const host = (actionJson, rawReply) => {
    setReply(rawReply);
    let action;
    try { action = JSON.parse(actionJson); }
    catch (error) {
      sendReply(json({event: 'childError', message: 'invalid leaf action: ' + describe(error).message}));
      return;
    }
    switch (action.op) {
      case 'spawn': doSpawn(action); return;
      case 'writeLog': doWriteLog(action); return;
      case 'signal': doSignal(action); return;
      case 'schedule': doSchedule(action); return;
      case 'cancelTimer': doCancelTimer(action); return;
      case 'destroyPipes': doDestroyPipes(); return;
      default:
        sendReply(json({event: 'childError', message: 'unknown leaf action: ' + String(action.op)}));
    }
  };

  function setReply(reply){rawReply=reply;}

  // Emergency resource teardown when the compiled controller itself throws.
  // Normal deadlines and signal escalation remain exclusively in MoonBit.
  function close(){
    return teardownPromise ??= closeOwned();
  }

  async function closeOwned(){
    // Capture before mutating: a controller throw sets failedController and
    // must still reap the owned group here.
    const catastrophic=failedController;
    failedController=true;
    const errors=cleanup();
    // Reap a still-running owned group on explicit/catastrophic close. A group
    // whose leader already closed is left to MoonBit's termination decisions, so
    // normal successful completion is unchanged.
    if(groupOwned&&ownedChildPid!==null&&!groupKillSent&&(catastrophic||terminationRequested||!childClosed)){
      try{process.kill(-ownedChildPid,'SIGKILL');groupKillSent=true;}
      catch(error){if(error?.code!=='ESRCH')errors.push(describe(error));}
    }
    if(child&&!childClosed){
      if(!groupOwned&&child.exitCode===null&&child.signalCode===null){
        try{if(!child.kill('SIGKILL'))errors.push({name:'Error',message:'owned child could not be signalled'});}
        catch(error){errors.push(describe(error));}
      }
      for(const stream of [child.stdout,child.stderr]){
        try{stream?.destroy();}catch(error){errors.push(describe(error));}
      }
      await closePromise;
    }
    return errors;
  }

  if (signal) {
    if (signal.aborted) onAbort();
    else {
      signal.addEventListener('abort', onAbort, {once: true});
      abortAttached = true;
    }
  }

  return {
    host,
    notify,
    close,
    dispose() { return cleanup(); },
  };
}
