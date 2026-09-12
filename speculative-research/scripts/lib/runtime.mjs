// Bundled-runtime verification and loading.
//
// Normal use never compiles MoonBit: every compiled artifact and its exact
// source are hash-checked against scripts/runtime/manifest.json before any code
// is imported. A changed artifact fails closed; there is no implicit rebuild.
import {readFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const runtimeDir = fileURLToPath(new URL('../runtime/', import.meta.url));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function compiledFiles(dir) {
  return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return compiledFiles(full);
    return /\.(m?js|cjs)$/.test(entry.name) ? [path.relative(runtimeDir, full)] : [];
  }).sort();
}

let cachedManifest;

export function verifyRuntime() {
  if (cachedManifest) return cachedManifest;
  const manifest = JSON.parse(readFileSync(path.join(runtimeDir, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1) throw new Error('unsupported runtime manifest schema');
  for (const file of [...manifest.files, ...manifest.sources]) {
    const bytes = readFileSync(path.join(runtimeDir, file.path));
    if (sha(bytes) !== file.sha256) throw new Error(`bundled runtime artifact changed: ${file.path}`);
    if (file.bytes !== undefined && bytes.length !== file.bytes) throw new Error(`bundled runtime artifact size changed: ${file.path}`);
  }
  const listed = manifest.files.map(file => file.path).sort();
  const actual = compiledFiles(runtimeDir);
  if (listed.length !== actual.length || listed.some((name, i) => name !== actual[i])) {
    throw new Error('bundled runtime file set does not match its manifest');
  }
  cachedManifest = manifest;
  return manifest;
}

export async function loadTool(tool) {
  const manifest = verifyRuntime();
  const entry = manifest.entries.find(candidate => candidate.tool === tool);
  if (!entry) throw new Error(`unknown runtime tool: ${tool}`);
  const module = await import(pathToFileURL(path.join(runtimeDir, entry.file)).href);
  const callable = module[entry.export];
  if (typeof callable !== 'function') throw new Error(`runtime entry ${entry.file} does not export ${entry.export}`);
  return callable;
}

// Identity passed to the MoonBit program. It binds only this portable package's
// verified inputs, never a parent repository or shared build manifest.
export function runtimeIdentity() {
  const manifest = verifyRuntime();
  return {schemaVersion: manifest.schemaVersion, module: manifest.module,
    baseline: manifest.baseline, files: manifest.files.map(({path, sha256}) => ({path, sha256}))};
}
