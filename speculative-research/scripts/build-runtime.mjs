// Explicit build/release helper for the portable speculative-research skill.
//
// This is the ONLY place that runs the MoonBit compiler. Normal use never calls
// it: scripts/*.mjs verify the already-bundled runtime manifest and refuse to
// rebuild. Run it deliberately when the MoonBit sources change:
//
//   node scripts/build-runtime.mjs
//
// It compiles the pinned MoonBit entries to JavaScript, copies the compiled
// artifacts and the exact maintainable sources into scripts/runtime/, and writes
// a deterministic input/artifact hash manifest used for verification.
import {mkdirSync, rmSync, cpSync, readdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const skillRoot = fileURLToPath(new URL('..', import.meta.url));
const srcRoot = path.join(skillRoot, 'src');
const runtimeDir = path.join(skillRoot, 'scripts', 'runtime');
const buildDir = path.join(skillRoot, '_build');
const MOON = process.env.MOON ?? 'moon';

const ENTRIES = [
  {tool: 'research', pkg: 'researchcli', file: 'researchcli.js', export: 'run_cli'},
  {tool: 'research-artifacts', pkg: 'researchartifactscli', file: 'researchartifactscli.js', export: 'run_cli'},
  {tool: 'research-evidence', pkg: 'researchcheckcli', file: 'researchcheckcli.js', export: 'run_cli'},
  {tool: 'process', pkg: 'processcontrol', file: 'processcontrol.js', export: 'run_process_json'},
];
const SOURCE_PACKAGES = ['io', 'research', 'researchcli', 'researchcheck', 'researchcheckcli',
  'researchartifacts', 'researchartifactscli', 'processcontrol'];

// Extraction files changed from the accepted baseline. Everything else is
// byte-identical to the origin commit; the manifest records both.
const ADAPTED = new Set([
  'src/research/validation.mbt', 'src/research/research.mbt',
  'src/researchcli/researchcli.mbt', 'src/researchcli/snapshot.mbt',
  'src/researchcli/moon.pkg.json', 'src/researchcheckcli/moon.pkg.json',
  'src/researchartifacts/moon.pkg.json', 'src/researchartifactscli/moon.pkg.json',
  'src/processcontrol/moon.pkg.json',
]);

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const shaFile = file => sha(readFileSync(file));

function run(args, cwd) {
  const result = spawnSync(MOON, args, {cwd, encoding: 'utf8', timeout: 300000, shell: false});
  if (result.error || result.signal || result.status !== 0) {
    throw new Error(`moon ${args.join(' ')} failed: ${result.error?.message ?? result.signal ?? result.status}\n${result.stdout ?? ''}${result.stderr ?? ''}`);
  }
  return (result.stdout ?? '').trim();
}

function firstLine(args) {
  const result = spawnSync(MOON, args, {encoding: 'utf8', timeout: 60000, shell: false});
  if (result.error || result.status !== 0) throw new Error(`moon ${args.join(' ')} failed`);
  return (result.stdout ?? '').trim().split('\n')[0];
}

function mooncVersion() {
  const moonc = path.join(path.dirname(MOON), 'moonc');
  const result = spawnSync(moonc, ['-v'], {encoding: 'utf8', timeout: 60000, shell: false});
  if (result.error || result.status !== 0) return 'unknown';
  return (result.stdout ?? '').trim().split('\n')[0];
}

function walk(dir) {
  return readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}

// Packaged tests are distributed for verification but are not runtime inputs:
// normal use never requires them and verifyRuntime does not hash them.
function packagedTests() {
  const dir = path.join(skillRoot, 'tests');
  return walk(dir).filter(file => file.endsWith('.test.mjs')).map(file => {
    const bytes = readFileSync(file);
    return {path: `tests/${path.relative(dir, file).split(path.sep).join('/')}`, sha256: sha(bytes), bytes: bytes.length};
  }).sort((a, b) => a.path.localeCompare(b.path));
}

run(['check', ...ENTRIES.map(e => `src/${e.pkg}`), '--target', 'js', '--deny-warn'], skillRoot);
for (const entry of ENTRIES) run(['build', `src/${entry.pkg}`, '--target', 'js', '--release', '--deny-warn'], skillRoot);

rmSync(runtimeDir, {recursive: true, force: true});
mkdirSync(path.join(runtimeDir, 'src'), {recursive: true});

const artifacts = [];
for (const entry of ENTRIES) {
  const built = path.join(buildDir, 'js', 'release', 'build', entry.pkg, `${entry.pkg}.js`);
  const bytes = readFileSync(built);
  if (bytes.length === 0) throw new Error(`empty compiled artifact: ${entry.pkg}`);
  writeFileSync(path.join(runtimeDir, entry.file), bytes);
  artifacts.push({path: entry.file, role: 'artifact', sha256: sha(bytes), bytes: bytes.length});
}

const sources = [];
for (const pkg of SOURCE_PACKAGES) {
  const from = path.join(srcRoot, pkg);
  for (const file of walk(from)) {
    const relative = path.relative(srcRoot, file);
    if (!/\.(mbt|mbtp)$/.test(relative) && !/(^|\/)moon\.pkg(?:\.json)?$/.test(relative)) continue;
    const bytes = readFileSync(file);
    const dest = path.join(runtimeDir, 'src', relative);
    mkdirSync(path.dirname(dest), {recursive: true});
    writeFileSync(dest, bytes);
    const sourcePath = `src/${relative}`.split(path.sep).join('/');
    sources.push({path: sourcePath, origin: ADAPTED.has(sourcePath) ? 'adapted' : 'verbatim', sha256: sha(bytes), bytes: bytes.length});
  }
}

const manifest = {
  schemaVersion: 1,
  module: 'portable/research',
  toolchain: {moon: firstLine(['version']), moonc: mooncVersion(), target: 'js'},
  baseline: {repository: 'accepted-baseline', commit: 'b9c5f5abaecd11984374a3251147b1d073c0e539',
    extraction: 'portable speculative-research skill; scope pinned from profile, no game-wide tooling'},
  entries: ENTRIES.map(entry => ({tool: entry.tool, file: entry.file, export: entry.export,
    sha256: artifacts.find(a => a.path === entry.file).sha256})),
  files: artifacts.sort((a, b) => a.path.localeCompare(b.path)),
  sources: sources.sort((a, b) => a.path.localeCompare(b.path)),
  tests: packagedTests(),
};
if (JSON.stringify(manifest).includes(skillRoot)) throw new Error('manifest must not embed an absolute skill path');
writeFileSync(path.join(runtimeDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
process.stdout.write(`bundled ${artifacts.length} artifacts, ${sources.length} sources, ${manifest.tests.length} packaged tests into scripts/runtime\n`);
