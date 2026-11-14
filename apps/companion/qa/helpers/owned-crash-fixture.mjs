import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtemp, realpath, lstat, open, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

const STDERR_LIMIT = 65536, RECORD_LIMIT = 4096, CLOSE_LIMIT = 5000;
const error = (code, message) => Object.assign(new Error(message), { code });
const sameFile = (a, b) => a.dev === b.dev && a.ino === b.ino;
const regular = s => s.isFile() && !s.isSymbolicLink() && s.nlink === 1n;

async function boundedRecord(file) {
  const before = await lstat(file, { bigint: true });
  if (!regular(before) || before.size > BigInt(RECORD_LIMIT)) throw error('QA_RECORD', 'Not a bounded regular fixture record.');
  const handle = await open(file, 'r');
  try {
    const held = await handle.stat({ bigint: true });
    if (!regular(held) || !sameFile(before, held)) throw error('QA_RECORD', 'Fixture record changed before read.');
    const buffer = Buffer.alloc(RECORD_LIMIT + 1), { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    const after = await handle.stat({ bigint: true });
    if (bytesRead > RECORD_LIMIT || !sameFile(held, after) || held.size !== after.size || held.mtimeNs !== after.mtimeNs) throw error('QA_RECORD', 'Fixture record changed during read.');
    const current = await lstat(file, { bigint: true });
    if (!regular(current) || !sameFile(after, current)) throw error('QA_RECORD', 'Fixture record was replaced.');
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally { await handle.close(); }
}

async function beforeDeadline(promise, deadline) {
  const remaining = deadline - Date.now();
  if (remaining <= 0) throw error('QA_CLEANUP_TIMEOUT', 'Owned work did not close within five seconds; root retained.');
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(error('QA_CLEANUP_TIMEOUT', 'Owned work did not close within five seconds; root retained.')), remaining); })]);
  } finally { clearTimeout(timer); }
}

export async function ownedCrashFixture(t) {
  const parent = await realpath(tmpdir()), root = await realpath(await mkdtemp(path.join(parent, 'npm-identity-')));
  const identity = await lstat(root, { bigint: true }), nonce = randomUUID();
  const ownerFile = path.join(root, '.qa-crash-owner.json'), owner = JSON.stringify({ format: 1, nonce }) + '\n';
  await writeFile(ownerFile, owner, { flag: 'wx', mode: 0o600 });
  const children = new Set(), pending = new Set();
  let disposing = false, cleanupPromise;

  async function run(operation, signal = t.signal) {
    if (disposing) throw error('QA_DISPOSED', 'The owned fixture is closing.');
    signal?.throwIfAborted();
    const work = Promise.resolve().then(() => {
      if (disposing) throw error('QA_DISPOSED', 'The owned fixture is closing.');
      signal?.throwIfAborted();
      return operation();
    }); pending.add(work);
    try {
      const value = await work;
      signal?.throwIfAborted();
      if (disposing) throw error('QA_DISPOSED', 'The owned fixture closed during an operation.');
      return value;
    } finally { pending.delete(work); }
  }

  function start(script, args = [], { point = null, cwd = root } = {}) {
    if (disposing) throw error('QA_DISPOSED', 'The owned fixture is closing.');
    t.signal?.throwIfAborted();
    const relative = path.relative(root, path.resolve(cwd));
    if (relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) throw error('QA_CWD', 'A child must use its fixture directory.');
    const witnessFile = path.join(root, '.qa-crash-' + randomUUID() + '.json');
    const expected = { format: 1, nonce, point };
    const prelude = "import { writeFileSync as __writeWitness } from 'node:fs';\n" +
      "const __witness = " + JSON.stringify({ file: witnessFile, ...expected }) + ";\n" +
      "function recordCrashPoint(point) { __writeWitness(__witness.file, JSON.stringify({format:1,nonce:__witness.nonce,pid:process.pid,point})+'\\n',{flag:'wx',mode:0o600}); }\n";
    const child = spawn(process.execPath, ['--input-type=module', '-e', prelude + script, ...args],
      { cwd, windowsHide: true, shell: false, stdio: ['ignore', 'ignore', 'pipe'] });
    const record = { child, point, witnessFile, expected, closed: false, failure: null, stderr: [], stderrBytes: 0, killRequests: 0 };
    children.add(record);
    record.completion = new Promise(resolve => {
      child.on('error', cause => { record.failure ??= cause; });
      child.stderr.on('data', chunk => {
        record.stderrBytes += chunk.length;
        if (record.stderrBytes > STDERR_LIMIT) {
          record.failure ??= error('QA_STDERR_LIMIT', 'Fixture child stderr exceeded64KiB.');
          if (child.exitCode === null && child.signalCode === null) { record.killRequests++; child.kill('SIGKILL'); }
        } else record.stderr.push(chunk);
      });
      child.once('close', (code, signal) => {
        record.closed = true;
        resolve({ code, signal, stderr: Buffer.concat(record.stderr).toString('utf8') });
      });
    });
    return record;
  }

  function owned(record) {
    if (!children.has(record)) throw error('QA_CHILD', 'This fixture does not own that child handle.');
  }

  async function waitForExit(record, signal = t.signal) {
    owned(record);
    return run(async () => {
      const ended = await record.completion;
      signal?.throwIfAborted();
      if (record.failure) throw record.failure;
      return ended;
    }, signal);
  }

  async function waitForCrash(record, signal = t.signal) {
    const ended = await waitForExit(record, signal);
    return run(async () => {
      signal?.throwIfAborted();
      const detail = ended.stderr ? '\nChild stderr: ' + ended.stderr : '';
      if (ended.code === 0 && ended.signal === null) throw error('QA_CRASH_WITNESS', 'The child was not interrupted.' + detail);
      let witness;
      try { witness = await boundedRecord(record.witnessFile); }
      catch (cause) { throw error('QA_CRASH_WITNESS', 'Missing or invalid crash witness: ' + cause.message + detail); }
      const expected = JSON.stringify({ format: 1, nonce, pid: record.child.pid, point: record.point }) + '\n';
      if (typeof record.point !== 'string' || witness !== expected) throw error('QA_CRASH_WITNESS', 'The crash witness does not match this fixture, child and point.' + detail);
      signal?.throwIfAborted();
      return ended;
    }, signal);
  }

  async function proveRoot() {
    if (path.dirname(root) !== parent || !path.basename(root).startsWith('npm-identity-') || await realpath(root) !== root) throw error('QA_ROOT', 'Fixture root identity changed; root retained.');
    const current = await lstat(root, { bigint: true });
    if (!current.isDirectory() || current.isSymbolicLink() || !sameFile(identity, current) || await boundedRecord(ownerFile) !== owner) throw error('QA_ROOT', 'Fixture root ownership changed; root retained.');
  }

  function cleanup() {
    if (cleanupPromise) return cleanupPromise;
    disposing = true;
    cleanupPromise = (async () => {
      const deadline = Date.now() + CLOSE_LIMIT;
      for (const record of children) {
        if (!record.closed && record.child.exitCode === null && record.child.signalCode === null) {
          record.killRequests++;
          if (!record.child.kill('SIGKILL')) throw error('QA_CHILD_CLOSE', 'Cannot terminate the owned child; root retained.');
        }
      }
      await beforeDeadline(Promise.all([...children].map(record => record.completion)), deadline);
      while (pending.size) await beforeDeadline(Promise.allSettled([...pending]), deadline);
      if ([...children].some(record => !record.closed)) throw error('QA_CHILD_CLOSE', 'An owned child is not closed; root retained.');
      await proveRoot();
      await rm(root, { recursive: true, force: false });
    })();
    return cleanupPromise;
  }
  t.after(cleanup);
  return { root, run, start, waitForExit, waitForCrash, cleanup };
}
