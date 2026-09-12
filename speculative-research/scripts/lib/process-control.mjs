// Portable child-process controller entry.
//
// The bundled MoonBit processcontrol module owns every lifecycle, limit and
// termination decision; this file only adapts it to the Node process leaf.
import {loadTool} from './runtime.mjs';
import {createProcessLeaf} from './process-leaf.mjs';

export async function runProcess(request, {signal, onLine} = {}) {
  const runProcessJson = await loadTool('process');
  const payload = signal?.aborted ? {...request, aborted: true} : request;
  let rejectRun, failure, result;
  const leaf = createProcessLeaf({signal, onLine, onFatal: error => rejectRun(error)});
  try {
    result = await new Promise((resolve, reject) => {
      rejectRun = reject;
      try {
        runProcessJson(
          JSON.stringify(payload),
          leaf.host,
          leaf.notify,
          raw => {
            let value;
            try { value = JSON.parse(raw); }
            catch (error) { reject(error); return; }
            resolve(value);
          },
        );
      } catch (error) { reject(error); }
    });
  } catch (error) { failure = error; }
  const errors = await leaf.close();
  if (failure) {
    if (errors.length) throw new AggregateError([failure, ...errors.map(error => new Error(error.message))], failure.message);
    throw failure;
  }
  if (errors.length) throw new Error('process leaf cleanup failed: ' + errors.map(error => error.message).join('; '));
  return result;
}
