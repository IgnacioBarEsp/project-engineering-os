import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, realpath, link, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { applyExactCachePatch, assembleCachePatch } from '../scripts/http-cache-patch-experiment.mjs';

const valid = () => ({ schemaVersion: 1, kind: 'exact-replacements',
  operations: [{ path: 'index.js', before: 'before', after: 'after' }] });
test('data replacement is exact, not fuzzy or executable', () => {
  assert.equal(applyExactCachePatch(Buffer.from('before\n'), valid()).toString(), 'after\n');
  assert.throws(() => applyExactCachePatch(Buffer.from(' BEFORE\n'), valid()), { code: 'PATCH_INVALID' });
  assert.throws(() => applyExactCachePatch(Buffer.from('before before'), valid()), { code: 'PATCH_INVALID' });
});
for (const target of ['../index.js', '/index.js', 'other.js', 'C:/index.js', 'index.js/../x', 'index.js\\x']) {
  test(`reject patch path ${target}`, () => {
    const patch = valid(); patch.operations[0].path = target;
    assert.throws(() => applyExactCachePatch(Buffer.from('before'), patch), { code: 'PATCH_INVALID' });
  });
}
test('reject added executable instructions and malformed grammar', () => {
  for (const mutate of [p => { p.command = 'node attacker'; }, p => { p.operations[0].eval = 'evil()'; },
      p => { p.operations[0].after = ''; }, p => { p.operations = []; },
      p => { p.kind = 'shell'; }, p => { p.operations[0].before = '\0'; }]) {
    const patch = valid(); mutate(patch);
    assert.throws(() => applyExactCachePatch(Buffer.from('before'), patch), { code: 'PATCH_INVALID' });
  }
  assert.throws(() => applyExactCachePatch(Buffer.from([255]), valid()), { code: 'PATCH_INVALID' });
});
async function fixture(t) {
  const parent = await realpath(await mkdtemp(path.join(tmpdir(), 'peos-cache-patch-test-')));
  const workspace = path.join(parent, 'workspace'), original = path.join(parent, 'original');
  await mkdir(workspace); await mkdir(original);
  await writeFile(path.join(parent, 'sentinel'), 'untouched');
  await writeFile(path.join(original, 'index.js'), 'untrusted input');
  t.after(async () => {
    assert.equal(await readFile(path.join(parent, 'sentinel'), 'utf8'), 'untouched');
    const resolved = await realpath(parent);
    assert.equal(resolved, parent);
    assert.equal(path.dirname(resolved), await realpath(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('peos-cache-patch-test-'));
    await rm(resolved, { recursive: true });
  });
  return { parent, workspace, original };
}
test('reject source drift before publishing or changing originals', async t => {
  const f = await fixture(t);
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test' }), { code: 'PATCH_INVALID' });
  assert.deepEqual(await readdir(f.workspace), []);
  assert.equal(await readFile(path.join(f.original, 'index.js'), 'utf8'), 'untrusted input');
});
test('reject changed patch digest and unsafe output before writing', async t => {
  const f = await fixture(t);
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test',
    patchBytes: Buffer.from(JSON.stringify(valid())) }), { code: 'PATCH_INVALID' });
  for (const outputName of ['../build-test', '/build-test', 'original', 'build-test/x']) {
    await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName }), { code: 'PATCH_INVALID' });
  }
  assert.deepEqual(await readdir(f.workspace), []);
});
test('cancel preserves original and no output', async t => {
  const f = await fixture(t), controller = new AbortController(); controller.abort();
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test', signal: controller.signal }), { name: 'AbortError' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('reject additional source file', async t => {
  const f = await fixture(t); await writeFile(path.join(f.original, 'extra.js'), 'extra');
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test' }), { code: 'PATCH_INVALID' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('reject source hardlink', async t => {
  const f = await fixture(t); await link(path.join(f.original, 'index.js'), path.join(f.original, 'hardlink.js'));
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test' }), { code: 'LINK_REJECTED' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('reject source directory junction/symlink', async t => {
  const f = await fixture(t);
  await symlink(f.workspace, path.join(f.original, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test' }), { code: 'LINK_REJECTED' });
  assert.deepEqual(await readdir(f.workspace), []);
});
test('never overwrite an existing slot', async t => {
  const f = await fixture(t); await mkdir(path.join(f.workspace, 'build-test'));
  await writeFile(path.join(f.workspace, 'build-test', 'baseline'), 'preserve');
  await assert.rejects(assembleCachePatch({ originalRoot: f.original, workspaceRoot: f.workspace, outputName: 'build-test' }), { code: 'PATCH_INVALID' });
  assert.equal(await readFile(path.join(f.workspace, 'build-test', 'baseline'), 'utf8'), 'preserve');
});
