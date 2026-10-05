import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, realpath, link, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { applyExactCallerPatch, assembleCallerPatch } from '../scripts/cache-caller-patch-experiment.mjs';

const targets = ['lib/cache/policy.js', 'lib/cache/entry.js', 'lib/cache/index.js'];
const patch = () => ({ schemaVersion: 1, kind: 'exact-replacements',
  operations: targets.map(path => ({ path, before: 'before', after: 'after' })) });
for (const target of targets) test(`exact caller replacement ${target}`, () => {
  assert.equal(applyExactCallerPatch(Buffer.from('before'), target, patch()).toString(), 'after');
  assert.throws(() => applyExactCallerPatch(Buffer.from('before before'), target, patch()), { code: 'PATCH_INVALID' });
  assert.throws(() => applyExactCallerPatch(Buffer.from(' BEFORE'), target, patch()), { code: 'PATCH_INVALID' });
});
for (const target of ['../index.js', 'lib/index.js', '/lib/cache/policy.js', 'lib\\cache\\policy.js', 'C:/x', 'lib/cache/../index.js']) {
  test(`reject non-allowlisted caller path ${target}`, () => {
    assert.throws(() => applyExactCallerPatch(Buffer.from('before'), target, patch()), { code: 'PATCH_INVALID' });
    const input = patch(); input.operations[0].path = target;
    assert.throws(() => applyExactCallerPatch(Buffer.from('before'), targets[1], input), { code: 'PATCH_INVALID' });
  });
}
test('reject caller executable grammar, invalid data and missing target', () => {
  for (const mutate of [p => { p.command = 'evil'; }, p => { p.operations[0].eval = 'evil'; },
      p => { p.operations[0].after = '\0'; }, p => { p.operations[0].before = ''; },
      p => { p.operations = []; }, p => { p.kind = 'shell'; }]) {
    const input = patch(); mutate(input);
    assert.throws(() => applyExactCallerPatch(Buffer.from('before'), targets[0], input), { code: 'PATCH_INVALID' });
  }
  assert.throws(() => applyExactCallerPatch(Buffer.from([255]), targets[0], patch()), { code: 'PATCH_INVALID' });
  const input = patch(); input.operations = input.operations.slice(1);
  assert.throws(() => applyExactCallerPatch(Buffer.from('before'), targets[0], input), { code: 'PATCH_INVALID' });
});

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'peos-caller-patch-test-')));
  const original = path.join(root, 'original'), workspace = path.join(root, 'workspace');
  await mkdir(original); await mkdir(workspace);
  await writeFile(path.join(original, 'index.js'), 'untrusted source');
  await writeFile(path.join(root, 'sentinel'), 'untouched');
  t.after(async () => {
    assert.equal(await readFile(path.join(root, 'sentinel'), 'utf8'), 'untouched');
    assert.equal(await realpath(root), root);
    assert.equal(path.dirname(root), await realpath(tmpdir()));
    assert.ok(path.basename(root).startsWith('peos-caller-patch-test-'));
    await rm(root, { recursive: true });
  });
  return { original, workspace };
}
test('caller assembler rejects full-source drift before writing', async t => {
  const f = await fixture(t);
  await assert.rejects(assembleCallerPatch({ ...f, originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: 'build-test' }), { code: 'PATCH_INVALID' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('caller assembler rejects patch drift and output escape', async t => {
  const f = await fixture(t);
  await assert.rejects(assembleCallerPatch({ originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: 'build-test', patchBytes: Buffer.from(JSON.stringify(patch())) }), { code: 'PATCH_INVALID' });
  await assert.rejects(assembleCallerPatch({ originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: '../build-test' }), { code: 'PATCH_INVALID' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('caller cancellation and existing slot preserve data', async t => {
  const f = await fixture(t), control = new AbortController(); control.abort();
  await assert.rejects(assembleCallerPatch({ originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: 'build-test', signal: control.signal }), { name: 'AbortError' });
  await mkdir(path.join(f.workspace, 'build-test'));
  await writeFile(path.join(f.workspace, 'build-test', 'keep'), 'keep');
  await assert.rejects(assembleCallerPatch({ originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: 'build-test' }), { code: 'PATCH_INVALID' });
  assert.equal(await readFile(path.join(f.workspace, 'build-test', 'keep'), 'utf8'), 'keep');
});
for (const type of ['hardlink', 'junction']) test(`caller source ${type} is rejected`, async t => {
  const f = await fixture(t);
  if (type === 'hardlink') await link(path.join(f.original, 'index.js'), path.join(f.original, 'alias.js'));
  else await symlink(f.workspace, path.join(f.original, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(assembleCallerPatch({ originalRoot: f.original, workspaceRoot: f.workspace,
    outputName: 'build-test' }), { code: 'LINK_REJECTED' });
  assert.deepEqual(await readdir(f.workspace), []);
});
