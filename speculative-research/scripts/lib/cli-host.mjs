// Node leaf bindings for the bundled MoonBit research programs.
//
// This mirrors the accepted dev-tools host seam but is self-contained: the only
// external prerequisites at normal use are Node 24+ and the provider helpers
// named by the pinned project profile.
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {readFileSync} from 'node:fs';
import os from 'node:os';
import {createHost} from './io-host.mjs';
import {readRecord} from './record-leaf.mjs';
import {readSnapshotRecord} from './research-leaf.mjs';
import {loadTool, verifyRuntime, runtimeIdentity} from './runtime.mjs';
import {runProcess} from './process-control.mjs';

const encode = value => JSON.stringify({ok: true, value});
const failed = error => JSON.stringify({ok: false, error: error?.message ?? String(error), code: error?.code ?? 'EIO'});

export async function runMoonCli(tool, args = process.argv.slice(2), options = {}) {
  const run = await loadTool(tool);
  return await runCliProgram({run}, args, {...options, tool});
}

export async function runCliProgram({run}, args = [], options = {}) {
  const root = options.root ?? process.cwd();
  const base = options.host ?? createHost({root});
  const controller = new AbortController();
  const stop = () => controller.abort();
  const processRunner = options.runProcess ?? runProcess;
  const pending = new Set();
  let settled = false, resolveRun, rejectRun;
  const completion = new Promise((resolve, reject) => { resolveRun = resolve; rejectRun = reject; });
  const finish = (error, value) => {
    if (settled) return;
    settled = true;
    controller.abort();
    if (error) rejectRun(error); else resolveRun(value);
  };
  if (options.signals !== false) { process.on('SIGINT', stop); process.on('SIGTERM', stop); }
  if (options.signal?.aborted) stop(); else options.signal?.addEventListener('abort', stop, {once: true});

  const syncHost = text => {
    try {
      if (settled) throw new Error('research program already finished');
      const request = JSON.parse(text);
      if (request.op === 'verifyTool') { verifyRuntime(); return encode(true); }
      if (options.verifyEachCall !== false) verifyRuntime();
      if (request.op === 'readRecord') return encode(readRecord(path.resolve(root, request.path), request.maxBytes));
      if (request.op === 'researchReadRecord') return encode(readSnapshotRecord(request.root, request.path, request.maxBytes));
      if (request.op === 'monotonic') return encode(performance.now());
      if (request.op === 'stopped') return encode(controller.signal.aborted);
      if (request.op === 'runtimeInfo') return encode({platform: os.platform(), release: os.release(), arch: os.arch(), node: process.version});
      if (request.op === 'stdinText') return encode(readFileSync(0, 'utf8'));
      return base(text);
    } catch (error) { return failed(error); }
  };

  const asyncHost = (text, reply) => {
    if (settled) return;
    const deliver = raw => {
      if (settled) return;
      try { reply(raw); } catch (error) { finish(error); }
    };
    const task = Promise.resolve().then(async () => {
      if (settled) return;
      verifyRuntime();
      const action = JSON.parse(text);
      if (action.op === 'process') {
        const value = await processRunner(action.request, {
          signal: action.cleanup ? undefined : controller.signal,
          onLine: action.events ? line => deliver(encode({event: 'line', line})) : undefined,
        });
        verifyRuntime();
        return {event: 'result', value};
      }
      if (action.op === 'watchStop') {
        if (!controller.signal.aborted) await new Promise(resolve => controller.signal.addEventListener('abort', resolve, {once: true}));
        return {event: 'stop'};
      }
      if (action.op === 'sleep') {
        await delay(action.ms, undefined, {signal: controller.signal});
        return null;
      }
      throw new Error('unknown asynchronous host operation');
    }).then(value => deliver(encode(value)), error => deliver(failed(error)))
      .catch(error => finish(error)).finally(() => pending.delete(task));
    pending.add(task);
  };

  let result, primaryFailure, failedRun = false;
  try {
    try {
      verifyRuntime();
      run(JSON.stringify({root, args, node: process.execPath, toolBuild: runtimeIdentity()}), syncHost, asyncHost, raw => {
        try { finish(null, JSON.parse(raw)); } catch (error) { finish(error); }
      });
    } catch (error) { finish(error); }
    result = await completion;
  } catch (error) {
    failedRun = true; primaryFailure = error;
  } finally {
    controller.abort();
    await Promise.allSettled([...pending]);
    if (options.signals !== false) { process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop); }
    options.signal?.removeEventListener('abort', stop);
  }
  if (failedRun) throw primaryFailure;
  return result;
}
