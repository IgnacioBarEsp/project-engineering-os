import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, realpath, readdir, access, rename } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { zipSync } from 'fflate';
import { inspectZip, extractZip } from '../runtime/archive.mjs';
import { downloadArtifact } from '../runtime/download.mjs';
import { inspectTree } from '../runtime/tree.mjs';
import { isolatedEnvironment, runFixedProcess } from '../runtime/process.mjs';
import { hash } from '../engine/files.mjs';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';
import { createEnvironmentEngine } from '../runtime/environment.mjs';
import { TOOLCHAIN } from '../runtime/toolchain-pin.mjs';

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-runtime-')));
  t.after(() => rm(root, { recursive: true, force: true })); return root;
}
const code = wanted => error => error.code === wanted;
const zip = entries => Buffer.from(zipSync(Object.fromEntries(Object.entries(entries).map(([n, text]) => [n, Buffer.from(text)]))));

test('archive extraction verifies CRC, bounds and paths before any runtime can be activated', async t => {
  const root = await fixture(t), archive = path.join(root, 'official.zip'), target = path.join(root, 'payload');
  const bytes = zip({ 'lib/package.json': '{"name":"fixture"}', 'lib/source.js': 'const symbol = 42;'.repeat(1000), 'empty': '' });
  await writeFile(archive, bytes); await extractZip(archive, target);
  assert.equal(await readFile(path.join(target, 'empty'), 'utf8'), '');
  const tree = await inspectTree(target); assert.equal(tree.files.length, 3);
  await writeFile(path.join(target, 'extra.dll'), 'unexpected');
  assert.notEqual((await inspectTree(target)).sha256, tree.sha256);
  for (const name of ['../outside', '/absolute', 'C:/escape', 'dir\\file', 'dir/../escape', 'nul.txt', 'dir/trailing.', 'dir/trailing ', 'file:stream']) {
    assert.throws(() => inspectZip(zip({ [name]: 'bad' })), code('ARCHIVE_UNSAFE'));
  }
  assert.throws(() => inspectZip(zip({ 'Same': 'a', 'same': 'b' })), code('ARCHIVE_UNSAFE'));
  assert.throws(() => inspectZip(zip({ 'parent': 'a', 'parent/child': 'b' })), code('ARCHIVE_UNSAFE'));
  assert.throws(() => inspectZip(bytes, { maxExpandedBytes: 4 }), code('ARCHIVE_UNSAFE'));
  assert.throws(() => inspectZip(bytes, { maxEntries: 1 }), code('ARCHIVE_UNSAFE'));
  const unsafe = Buffer.from(bytes), central = unsafe.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  unsafe.writeUInt32LE(0xa1ff0000, central + 38);
  assert.throws(() => inspectZip(unsafe), code('ARCHIVE_UNSAFE'));
  const corrupt = zip({ 'data.txt': 'stored bytes' });
  const entry = inspectZip(corrupt)[0]; corrupt[entry.dataOffset] ^= 1;
  await writeFile(path.join(root, 'corrupt.zip'), corrupt);
  await assert.rejects(extractZip(path.join(root, 'corrupt.zip'), path.join(root, 'bad')));
  await assert.rejects(extractZip(archive, target), e => e.code === 'EEXIST');
  const controller = new AbortController(); controller.abort();
  await assert.rejects(extractZip(archive, path.join(root, 'cancelled'), { signal: controller.signal }), e => e.name === 'AbortError');
  await assert.rejects(access(path.join(root, 'cancelled')), e => e.code === 'ENOENT');
});

test('downloads validate every redirect, exact length and hash; failures discard only their own partial file', async t => {
  const root = await fixture(t), body = Buffer.from('Reviewed artifact bytes');
  const artifact = { url: 'https://official.example/release.zip', origins: ['https://official.example'], bytes: body.length, sha256: hash(body) };
  const target = path.join(root, 'valid.zip');
  let calls = 0;
  await downloadArtifact(artifact, target, { transport: async (_url, options) => {
    assert.equal(options.redirect, 'manual'); assert.equal(options.credentials, 'omit');
    return ++calls === 1 ? new Response(null, { status: 302, headers: { location: '/asset.zip' } }) : new Response(body);
  } });
  assert.deepEqual(await readFile(target), body); assert.equal(calls, 2);
  for (const location of ['http://official.example/file', 'https://unreviewed.example/file', 'https://user:password@official.example/file']) {
    await assert.rejects(downloadArtifact(artifact, path.join(root, 'rejected.zip'), { transport: async () => new Response(null, { status: 302, headers: { location } }) }), code('DOWNLOAD_ORIGIN'));
  }
  for (const [content, expected] of [[body.subarray(1), 'DOWNLOAD_INTEGRITY'], [Buffer.concat([body, body]), 'DOWNLOAD_SIZE'], [Buffer.alloc(body.length), 'DOWNLOAD_INTEGRITY']]) {
    await assert.rejects(downloadArtifact(artifact, path.join(root, 'rejected.zip'), { transport: async () => new Response(content) }), code(expected));
    await assert.rejects(access(path.join(root, 'rejected.zip')), e => e.code === 'ENOENT');
  }
  await assert.rejects(downloadArtifact(artifact, target, { transport: async () => new Response(body) }), e => e.code === 'EEXIST');
  assert.deepEqual(await readFile(target), body);
  assert.deepEqual(await readdir(root), ['valid.zip']);
});

test('runtime tree traversal bounds entries and observes cancellation while enumerating', async t => {
  const root = await fixture(t);
  for (let i = 0; i < 5; i++) await mkdir(path.join(root, `empty-${i}`));
  await assert.rejects(inspectTree(root, { maxFiles: 2 }), code('RUNTIME_LIMIT'));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(inspectTree(root, { signal: controller.signal }), e => e.name === 'AbortError');
});

test('fixed subprocesses isolate inherited injection, preserve literal arguments and stop on bounds or cancellation', async t => {
  const root = await fixture(t), executable = await realpath(process.execPath);
  const env = isolatedEnvironment({ home: root, system: { ...process.env, NODE_OPTIONS: '--require=attacker', NPM_TOKEN: 'secret', GIT_CONFIG_COUNT: '1' } });
  assert.equal(env.NODE_OPTIONS, undefined); assert.equal(env.NPM_TOKEN, undefined);
  assert.equal(env.GIT_CONFIG_COUNT, '3'); assert.equal(env.GIT_CONFIG_KEY_0, 'core.fsmonitor'); assert.equal(env.GIT_CONFIG_VALUE_0, 'false');
  const literal = 'a & echo injected | < > " %PATH% $(touch x)';
  const result = await runFixedProcess({ executable, cwd: root, env, args: ['-e', 'console.log(JSON.stringify({args:process.argv.slice(1),injection:process.env.NODE_OPTIONS??null}))', literal] });
  assert.deepEqual(JSON.parse(result.stdout), { args: [literal], injection: null });
  await assert.rejects(runFixedProcess({ executable, cwd: root, env, args: ['-e', 'setInterval(()=>{},1000)'], timeoutMs: 100 }), code('PROCESS_TIMEOUT'));
  await assert.rejects(runFixedProcess({ executable, cwd: root, env, args: ['-e', 'setInterval(()=>process.stdout.write("x".repeat(4096)),1)'], maxOutputBytes: 1024 }), code('PROCESS_OUTPUT_LIMIT'));
  const controller = new AbortController();
  const running = runFixedProcess({ executable, cwd: root, env, args: ['-e', 'setInterval(()=>{},1000)'], signal: controller.signal });
  setTimeout(() => controller.abort(), 150);
  await assert.rejects(running, code('CANCELLED'));
  await assert.rejects(runFixedProcess({ executable, cwd: root, env, args: ['-e', 'process.exit(2)'] }), code('PROCESS_FAILED'));
});

test('a forged cache receipt cannot authorize changed executable bytes', async t => {
  const root = await fixture(t), manager = await createRuntimeManager({ root }), tool = RUNTIME_CATALOG.node;
  assert.equal((await manager.inspect('node')).status, 'missing');
  const slot = path.join(root, `node-${tool.version}-${tool.treeHash.slice(0, 12)}`);
  await mkdir(path.join(slot, 'payload'), { recursive: true });
  await writeFile(path.join(slot, 'payload', 'node.exe'), 'forged executable');
  await writeFile(path.join(slot, 'receipt.json'), JSON.stringify({ format: 1, id: 'node', version: tool.version, platform: 'win32-x64', treeHash: tool.treeHash }));
  const result = await manager.inspect('node'); assert.equal(result.status, 'requires-action'); assert.equal(result.code, 'RUNTIME_INTEGRITY');
  if (process.platform === 'win32' && process.arch === 'x64') await assert.rejects(manager.install('node'), code('RUNTIME_INTEGRITY'));
  assert.equal(await readFile(path.join(slot, 'payload', 'node.exe'), 'utf8'), 'forged executable');
});

test('a prepared folder that moved or was copied requires a new review before it can be reported ready', async t => {
  const home = await fixture(t), root = path.join(home, 'project'), moved = path.join(home, 'moved');
  const runtimes = path.join(home, 'runtimes'); await mkdir(runtimes);
  await mkdir(path.join(root, '.project-os/companion'), { recursive: true });
  const engine = createEnvironmentEngine(await createRuntimeManager({ root: runtimes }));
  assert.equal((await engine.verify(root)).status, 'not-prepared');
  const receipt = path.join(root, '.project-os/companion/environment.json');
  const record = { format: 1, root: await realpath(root), state: 'prepared', stage: 'tools', core: TOOLCHAIN.core, openspec: TOOLCHAIN.openspec };
  await writeFile(receipt, JSON.stringify(record));
  // Tool bytes are missing here, so a same-location project reports the runtime gap, never readiness.
  const sameLocation = await engine.verify(root);
  assert.equal(sameLocation.status, 'requires-action'); assert.notEqual(sameLocation.code, 'ENVIRONMENT_MOVED');
  await rename(root, moved);
  const relocated = await engine.verify(moved);
  assert.equal(relocated.status, 'requires-action'); assert.equal(relocated.code, 'ENVIRONMENT_MOVED');
  assert.match(relocated.action, /prepara de nuevo/);
  // A copy left at the reviewed path cannot borrow the moved folder's readiness either.
  assert.equal(JSON.parse(await readFile(path.join(moved, '.project-os/companion/environment.json'), 'utf8')).root, record.root);
  // Planning still reads the relocated receipt, otherwise a moved project could never be repaired.
  if (process.platform === 'win32' && process.arch === 'x64') {
    const plan = await engine.plan(moved);
    assert.equal(plan.status, 'planned');
    assert.deepEqual(plan.files.find(f => f.path === '.project-os/companion/environment.json'), { path: '.project-os/companion/environment.json', action: 'update' });
  } else {
    // Elsewhere the platform stops the plan, but never the relocated receipt.
    await assert.rejects(engine.plan(moved), e => e.code === 'PLATFORM_UNSUPPORTED');
  }
  for (const broken of ['not json', JSON.stringify({ format: 2, root: moved, state: 'prepared' }), JSON.stringify({ format: 1, root: moved, state: 'invented' }), JSON.stringify({ format: 1, root: 42, state: 'prepared' })]) {
    await writeFile(path.join(moved, '.project-os/companion/environment.json'), broken);
    const result = await engine.verify(moved);
    assert.equal(result.status, 'requires-action'); assert.equal(result.code, 'ENVIRONMENT_RECEIPT');
    await assert.rejects(engine.plan(moved), code('ENVIRONMENT_RECEIPT'));
  }
});
