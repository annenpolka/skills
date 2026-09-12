// Synchronous, generic IO transport for the MoonBit dev-tools seam.
//
// createHost({root, ...optional}) returns a callback (requestJson) -> replyJson.
// It is transport, not a sandbox: it performs no business rules and never
// echoes request payloads, environment contents, or secret material back to
// the caller. Error replies carry a generic message plus a stable code.
import {
  readFileSync, writeFileSync, mkdirSync, statSync, lstatSync, readdirSync,
  realpathSync, cpSync, renameSync, rmSync, rmdirSync, chmodSync, symlinkSync, openSync,
  closeSync, readSync, fsyncSync, mkdtempSync, accessSync, existsSync,
  constants as fsConstants,
} from 'node:fs';
import {createHash, randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {tmpdir, homedir} from 'node:os';
import path from 'node:path';
import {readRecord,textRecord} from './record-leaf.mjs';
import {readRange,hashRange} from './range-leaf.mjs';
import {inspectResearchProcess} from './research-leaf.mjs';

const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_MAX_BUFFER = 64 * 1024 * 1024;
const MAX_SLEEP_MS = 3600000;
const MAX_RANDOM_BYTES = 4096;

function genericMessage(code) {
  switch (code) {
    case 'ENOENT': return 'not found';
    case 'EEXIST': return 'already exists';
    case 'EACCES':
    case 'EPERM': return 'permission denied';
    case 'ETIMEDOUT': return 'timed out';
    case 'EISDIR': return 'is a directory';
    case 'ENOTDIR': return 'not a directory';
    case 'ENOTEMPTY': return 'directory not empty';
    case 'ESRCH': return 'no such process';
    case 'EILSEQ': return 'invalid encoded data';
    default: return 'io operation failed';
  }
}

function codeOf(error) {
  if (error && typeof error === 'object' && typeof error.code === 'string') return error.code;
  return 'EIO';
}

function readStreamedSha256(file) {
  const fd = openSync(file, 'r');
  try {
    const hash = createHash('sha256');
    const buffer = Buffer.allocUnsafe(1 << 20);
    let count;
    while ((count = readSync(fd, buffer, 0, buffer.length, null)) > 0) {
      hash.update(buffer.subarray(0, count));
    }
    return hash.digest('hex');
  } finally {
    closeSync(fd);
  }
}

export function createHost(options = {}) {
  const root = path.resolve(options.root ?? process.cwd());
  const cwdDefault = options.cwd ? path.resolve(root, options.cwd) : root;
  const envDefault = options.env ?? process.env;
  const timeoutDefault = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBufferDefault = options.maxBuffer ?? DEFAULT_MAX_BUFFER;

  const expand = value => {
    if (value === '~') return homedir();
    if (value.startsWith('~/')) return path.join(homedir(), value.slice(2));
    return value;
  };
  const resolvePath = value => path.resolve(root, expand(value));
  const ok = value => JSON.stringify({ok: true, value});
  const fail = (error, code) => JSON.stringify({ok: false, error, code});

  const operations = {
    read: request => ok(readFileSync(resolvePath(request.path), 'utf8')),
    readRange: request => ok(readRange(resolvePath(request.path),request.offset,request.maxBytes)),
    hashRange: request => ok(hashRange(resolvePath(request.path),request.offset,request.bytes)),
    fsync: request => {
      const fd=openSync(resolvePath(request.path),fsConstants.O_RDONLY|fsConstants.O_NOFOLLOW);
      try{fsyncSync(fd);return ok(null);}
      finally{closeSync(fd);}
    },
    write: request => {
      const target = resolvePath(request.path);
      const flags = `${request.append ? 'a' : 'w'}${request.exclusive ? 'x' : ''}`;
      writeFileSync(target, request.text ?? '', {flag: flags, mode: request.mode});
      if (request.mode !== undefined) chmodSync(target, request.mode);
      return ok(null);
    },
    mkdir: request => {
      const target = resolvePath(request.path);
      if (request.exclusive && existsSync(target)) return fail(genericMessage('EEXIST'), 'EEXIST');
      mkdirSync(target, {recursive: Boolean(request.recursive), mode: request.mode});
      return ok(null);
    },
    stat: request => statOp(resolvePath(request.path), statSync),
    lstat: request => statOp(resolvePath(request.path), lstatSync),
    list: request => ok(readdirSync(resolvePath(request.path)).sort()),
    realpath: request => realpathOp(resolvePath(request.path), Boolean(request.allowMissing)),
    resolve: request => ok(resolvePath(request.path)),
    relative: request => ok(path.relative(resolvePath(request.base), resolvePath(request.path))),
    dirname: request => ok(path.dirname(resolvePath(request.path))),
    basename: request => ok(path.basename(expand(request.path))),
    copy: request => {
      cpSync(realpathSync(resolvePath(request.src)), resolvePath(request.dst), {recursive: Boolean(request.recursive),dereference:true});
      return ok(null);
    },
    rename: request => {
      renameSync(resolvePath(request.src), resolvePath(request.dst));
      return ok(null);
    },
    remove: request => {
      if(request.emptyDirectory){
        if(request.recursive)return fail('empty directory removal cannot be recursive','EINVAL');
        try{rmdirSync(resolvePath(request.path));}
        catch(error){if(!(request.missingOk&&error.code==='ENOENT'))throw error;}
        return ok(null);
      }
      rmSync(resolvePath(request.path), {recursive: Boolean(request.recursive), force: Boolean(request.missingOk)});
      return ok(null);
    },
    chmod: request => {
      chmodSync(resolvePath(request.path), request.mode);
      return ok(null);
    },
    symlink: request => {
      symlinkSync(resolvePath(request.src), resolvePath(request.dst));
      return ok(null);
    },
    hash: request => ok(readStreamedSha256(resolvePath(request.path))),
    hashText: request => ok(createHash('sha256').update(request.text ?? '', 'utf8').digest('hex')),
    randomHex: request => {
      const bytes = request.bytes;
      if (!Number.isInteger(bytes) || bytes < 0 || bytes > MAX_RANDOM_BYTES) return fail('invalid byte count', 'EINVAL');
      return ok(randomBytes(bytes).toString('hex'));
    },
    now: () => ok(new Date().toISOString()),
    readRecord: request => ok(readRecord(resolvePath(request.path),request.maxBytes)),
    textRecord: request => ok(textRecord(request.text)),
    pid: () => ok(process.pid),
    temp: request => {
      const parent = request.parent ? resolvePath(request.parent) : tmpdir();
      return ok(mkdtempSync(path.join(parent, request.prefix ?? 'rw-')));
    },
    sleep: request => {
      const ms = request.ms;
      if (!Number.isInteger(ms) || ms < 0 || ms > MAX_SLEEP_MS) return fail('invalid sleep duration', 'EINVAL');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
      return ok(null);
    },
    print: request => {
      if (request.stderr) process.stderr.write(request.text ?? '');
      else process.stdout.write(request.text ?? '');
      return ok(null);
    },
    which: request => whichOp(request.name),
    spawn: request => spawnOp(request),
    kill: request => {
      try {
        process.kill(request.pid, request.signal ?? 'SIGTERM');
        return ok(null);
      } catch (error) { return fail(genericMessage(codeOf(error)), codeOf(error)); }
    },
    researchProcessPresence: request => ok(inspectResearchProcess(request.pid)),
    alive: request => {
      try { process.kill(request.pid, 0); return ok(true); }
      catch (error) { return error.code === 'EPERM' ? ok(true) : ok(false); }
    },
  };

  function statOp(target, fn) {
    try {
      const info = fn(target);
      const type = info.isFile() ? 'file' : info.isDirectory() ? 'directory' : info.isSymbolicLink() ? 'symlink' : 'other';
      return ok({type, size: info.size, mode: info.mode});
    } catch (error) {
      if (error.code === 'ENOENT') return ok(null);
      return fail(genericMessage(codeOf(error)), codeOf(error));
    }
  }

  function realpathOp(target, allowMissing) {
    try {
      return ok(realpathSync(target));
    } catch (error) {
      if (!allowMissing || error.code !== 'ENOENT') return fail(genericMessage(codeOf(error)), codeOf(error));
      const suffix = [];
      let cursor = target;
      while (true) {
        try {
          return ok(path.join(realpathSync(cursor), ...suffix));
        } catch (nested) {
          if (nested.code !== 'ENOENT') return fail(genericMessage(codeOf(nested)), codeOf(nested));
          const parent = path.dirname(cursor);
          if (parent === cursor) return fail(genericMessage('ENOENT'), 'ENOENT');
          suffix.unshift(path.basename(cursor));
          cursor = parent;
        }
      }
    }
  }

  function whichOp(name) {
    if (typeof name !== 'string' || name === '') return ok(null);
    if (name.includes('/')) {
      const candidate = resolvePath(name);
      try { accessSync(candidate, fsConstants.X_OK); return ok(candidate); }
      catch { return ok(null); }
    }
    for (const directory of String(envDefault.PATH ?? '').split(path.delimiter)) {
      if (!directory) continue;
      const candidate = path.join(directory, name);
      try { accessSync(candidate, fsConstants.X_OK); return ok(candidate); }
      catch { /* keep searching */ }
    }
    return ok(null);
  }

  function childEnvironment(overlay) {
    if (!overlay || typeof overlay !== 'object') return envDefault;
    return {...envDefault, ...overlay};
  }

  function resolveExecutable(file, env, baseDir) {
    if (typeof file !== 'string' || file === '') return null;
    if (file.includes('/')) {
      const expanded = expand(file);
      const candidate = path.isAbsolute(expanded) ? expanded : path.resolve(baseDir ?? root, expanded);
      try { accessSync(candidate, fsConstants.X_OK); return candidate; }
      catch { return null; }
    }
    for (const directory of String((env ?? envDefault).PATH ?? '').split(path.delimiter)) {
      if (!directory) continue;
      const candidate = path.join(directory, file);
      try { accessSync(candidate, fsConstants.X_OK); return candidate; }
      catch { /* keep searching */ }
    }
    return null;
  }

  function spawnOp(request) {
    if (request.input !== undefined && request.stdinFile) {
      return fail('input and stdinFile are mutually exclusive', 'EINVAL');
    }
    const timeout = Number.isInteger(request.timeoutMs) ? request.timeoutMs : timeoutDefault;
    const maxBuffer=request.maxBuffer??maxBufferDefault;
    if(!Number.isSafeInteger(maxBuffer)||maxBuffer<=0)return fail('invalid command output budget','EINVAL');
    if(request.envPathPrefix!==undefined&&typeof request.envPathPrefix!=='string')return fail('invalid executable path prefix','EINVAL');
    const env={...childEnvironment(request.env)};
    if(request.envPathPrefix!==undefined)env.PATH=request.envPathPrefix+path.delimiter+(env.PATH??'');
    const spawnOptions = {
      cwd: request.cwd ? resolvePath(request.cwd) : cwdDefault,
      env,
      shell: false,
      timeout,
      maxBuffer,
    };
    let inputFd;
    let outputFd;
    const closeFds = () => {
      if (inputFd !== undefined) closeSync(inputFd);
      if (outputFd !== undefined) closeSync(outputFd);
    };
    if (request.inherit) {
      spawnOptions.stdio = 'inherit';
    } else {
      let stdin = 'pipe';
      if (request.stdinFile) {
        try {
          inputFd = openSync(resolvePath(request.stdinFile), 'r');
        } catch (error) {
          return fail(genericMessage(codeOf(error)), codeOf(error));
        }
        stdin = inputFd;
      } else if (request.input !== undefined) {
        spawnOptions.input = request.input;
      }
      let stdout = 'pipe';
      if (request.stdoutFile) {
        const flags = `${request.appendOutput ? 'a' : 'w'}${request.exclusive ? 'x' : ''}`;
        try {
          outputFd = openSync(resolvePath(request.stdoutFile), flags, 0o600);
        } catch (error) {
          closeFds();
          return fail(genericMessage(codeOf(error)), codeOf(error));
        }
        stdout = outputFd;
      }
      spawnOptions.stdio = [stdin, stdout, 'pipe'];
    }
    let result;
    try {
      result = spawnSync(request.file, Array.isArray(request.args) ? request.args : [], spawnOptions);
    } finally {
      closeFds();
    }
    if (result.error && !request.rawResult) {
      const code = codeOf(result.error);
      return fail(genericMessage(code), code);
    }
    const raw = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.alloc(0);
    const captured = !request.inherit && !request.stdoutFile;
    return ok({
      status: result.status,
      signal: result.signal,
      stdout: raw.toString('utf8'),
      stderr: Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : String(result.stderr ?? ''),
      stdoutSha256: captured ? createHash('sha256').update(raw).digest('hex') : null,
      ...(request.rawResult?{error:result.error?{message:result.error.message,code:codeOf(result.error)}:null}:{}),
    });
  }

  return function host(requestJson) {
    try {
      const request = JSON.parse(requestJson);
      const handler = operations[request && request.op];
      if (!handler) return fail('unknown operation', 'EUNKNOWN');
      return handler(request);
    } catch (error) {
      return fail(genericMessage(codeOf(error)), codeOf(error));
    }
  };
}
