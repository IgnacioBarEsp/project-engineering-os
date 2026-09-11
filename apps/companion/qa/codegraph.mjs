import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash, createHmac, randomBytes } from 'node:crypto';
import { json } from '../engine/files.mjs';
import { createCodeGraphEngine, CODE_INDEX } from '../runtime/codegraph.mjs';

const code = expected => error => error.code === expected;
async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-code-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'budget.js'), 'export function calculateBudget(hours) { return hours * 2; }\n');
  await writeFile(path.join(root, 'Game.cs'), 'public class ResearchGame { public int Points() { return 2; } }\n');
  await mkdir(path.join(root, '.codegraph')); await writeFile(path.join(root, '.codegraph', 'owned-by-user.txt'), 'Keep');
  await writeFile(path.join(root, 'private.js'), 'const password = "do-not-index-this-value";\n');
  await mkdir(path.join(root, 'node_modules')); await writeFile(path.join(root, 'node_modules', 'dependency.js'), 'throw Error("must not execute");');
  let calls = 0, beforeOutput, options = {};
  const runtimeRoot = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-code-runtime-')));
  t.after(() => rm(runtimeRoot, { recursive: true, force: true }));
  const manager = { root: runtimeRoot, plan: async ids => ({ tools: ids.map(id => ({ id, status: 'missing' })), downloadBytes: 10 }),
    install: async id => { calls++; return { id }; } };
  const executeWorker = async corpus => {
    const nodes = corpus.files.map((f,i) => ({ id: 'node:'+i, name: f.extension === '.cs' ? 'ResearchGame' : 'calculateBudget', path: f.path, kind: 'function', start: 1, end: 1 }));
    await beforeOutput?.();
    return { nodes, edges: [], verification: { method: 'CodeGraph.searchNodes', query: nodes[0]?.name ?? null, matched: nodes.length > 0 }, coverage: { filesIndexed: nodes.length, filesSkipped: 0, filesErrored: 0 } };
  };
  return { root, runtimeRoot, create: () => createCodeGraphEngine(manager, { executeWorker, readOptions: async () => options }),
    calls: () => calls, hook: fn => { beforeOutput = fn; }, options: value => { options = value; } };
}

test('code map reviews safe copies, verifies symbol provenance and survives engine restart without touching user indexes', async t => {
  const f = await fixture(t), engine = f.create(), plan = await engine.plan(f.root, 'unity');
  assert.equal(f.calls(), 0); assert.equal(plan.coverage.sources.length, 2);
  assert.deepEqual(plan.coverage.omitted, [{ path: 'private.js', reason: 'possible-secret' }]);
  await assert.rejects(access(path.join(f.root, CODE_INDEX)), e => e.code === 'ENOENT');
  assert.equal((await engine.apply(plan.id)).status, 'verified');
  const result = await f.create().search(f.root, 'calculateBudget');
  assert.equal(result.hits[0].path, 'budget.js'); assert.match(result.hits[0].hash, /^[a-f0-9]{64}$/);
  assert.equal(result.tokenCount, null); assert.equal((await f.create().verify(f.root)).status, 'verified');
  assert.equal(await readFile(path.join(f.root, '.codegraph', 'owned-by-user.txt'), 'utf8'), 'Keep');
  await assert.rejects(engine.apply(plan.id), code('PLAN_UNKNOWN'));
  await writeFile(path.join(f.root, 'budget.js'), 'export function otherBudget() {}');
  assert.equal((await f.create().verify(f.root)).status, 'stale');
  await assert.rejects(f.create().search(f.root, 'calculateBudget'), code('GRAPH_NOT_CURRENT'));
});

test('changed code or exclusions reject a reviewed graph before or after the worker; interruption preserves prior map', async t => {
  const f = await fixture(t), engine = f.create();
  const first = await engine.plan(f.root, 'software'); await engine.apply(first.id);
  const original = await readFile(path.join(f.root, CODE_INDEX));
  const changedOptions = await engine.plan(f.root, 'software'); f.options({ exclude: ['budget.js'] });
  await assert.rejects(engine.apply(changedOptions.id), code('PLAN_STALE')); f.options({});
  const controller = new AbortController(), cancelled = await engine.plan(f.root, 'software');
  f.hook(() => controller.abort());
  await assert.rejects(engine.apply(cancelled.id, { signal: controller.signal }), e => e.name === 'AbortError');
  assert.deepEqual(await readFile(path.join(f.root, CODE_INDEX)), original);
  const changed = await engine.plan(f.root, 'software');
  f.hook(() => writeFile(path.join(f.root, 'budget.js'), 'export function changedDuringIndex() {}'));
  await assert.rejects(engine.apply(changed.id), code('PLAN_STALE'));
  assert.deepEqual(await readFile(path.join(f.root, CODE_INDEX)), original);
});

test('empty scope, corrupt map and unsupported profile never become ready or overwrite a map', async t => {
  const f = await fixture(t), engine = f.create();
  assert.equal((await engine.plan(f.root, 'software', { exclude: ['budget.js','Game.cs','private.js'] })).status, 'empty');
  await assert.rejects(engine.plan(f.root, 'research'), code('GRAPH_PROFILE'));
  const plan = await engine.plan(f.root, 'software'); await engine.apply(plan.id);
  const file = path.join(f.root, CODE_INDEX), original = await readFile(file), saved = JSON.parse(original);
  // The project cannot re-seal what it edits: the key lives in the app-owned runtime location.
  const forged = structuredClone(saved);
  forged.payload.result.nodes = [{ id: 'node:0', name: 'verifyAdminPassword', path: 'budget.js', kind: 'function', start: 1, end: 1 }];
  forged.payload.result.verification = { method: 'CodeGraph.searchNodes', query: 'verifyAdminPassword', matched: true };
  forged.payload.result.coverage = { filesIndexed: 1, filesSkipped: 0, filesErrored: 0 };
  forged.payload.sources = forged.payload.sources.filter(s => s.path === 'budget.js');
  const forgedSeals = [createHmac('sha256', randomBytes(32)).update(json(forged.payload)).digest('hex'),
    createHash('sha256').update(json(forged.payload)).digest('hex'), saved.seal];
  for (const seal of forgedSeals) {
    await writeFile(file, json({ ...forged, seal }));
    const state = await engine.verify(f.root);
    assert.equal(state.status, 'requires-repair'); assert.equal(state.symbols, undefined);
    await assert.rejects(engine.search(f.root,'verifyAdminPassword'),code('GRAPH_NOT_CURRENT'));
  }
  // A correctly sealed map is still rejected when its shape leaves the reviewed sources.
  const key = Buffer.from((await readFile(path.join(f.runtimeRoot,'code-index.key'),'utf8')).trim(),'hex');
  const escaped = structuredClone(saved); escaped.payload.result.nodes[0].path = '../../unreviewed.js';
  escaped.seal = createHmac('sha256', key).update(json(escaped.payload)).digest('hex');
  await writeFile(file, json(escaped));
  assert.equal((await engine.verify(f.root)).status, 'corrupt');
  assert.equal((await engine.plan(f.root, 'software')).status, 'corrupt');
  await assert.rejects(engine.search(f.root,'calculateBudget'),code('GRAPH_NOT_CURRENT'));
  // Restoring the original sealed map returns the real symbols without repreparing.
  await writeFile(file, original);
  assert.equal((await engine.verify(f.root)).status, 'verified');
  assert.ok((await engine.search(f.root,'calculateBudget')).hits.some(h => h.name === 'calculateBudget'));
});
