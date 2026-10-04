import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { distributionId, distributionIdentity, inventoryExperimentalTree, assertPhysicalAuditCoverage,
  createExperimentalSwitchModel } from '../scripts/npm-composition-experiment.mjs';
import { probeCacheReuse } from '../scripts/http-cache-security-probe.mjs';
import { canonicalFolder } from '../engine/files.mjs';

async function fixture(t) {
  const owned = await canonicalFolder(await mkdtemp(path.join(tmpdir(), 'peos-npm-model-')));
  t.after(async () => {
    // Only this exclusively created fixture; assert canonical absolute path before removal.
    assert.equal(await canonicalFolder(owned), owned);
    assert.match(path.basename(owned), /^peos-npm-model-/);
    await rm(owned, { recursive: true });
  });
  await mkdir(path.join(owned, 'model-root'));
  const root = await canonicalFolder(path.join(owned, 'model-root'));
  const outsideRootSentinel = path.join(owned, 'outside-root-sentinel.txt');
  await writeFile(outsideRootSentinel, 'preserved-outside-model-root');
  await writeFile(path.join(root, 'outside-slot-sentinel.txt'), 'preserved');
  const slots = [];
  for (const [relative, channel, version] of [
    ['official-1', 'official', '1.0.0'], ['derived-1', 'derived', '1.0.0'],
    ['official-2', 'official', '2.0.0'], ['derived-2', 'derived', '2.0.0'],
  ]) {
    const directory = path.join(root, relative); await mkdir(directory);
    await writeFile(path.join(directory, 'fixture.txt'), relative);
    const tree = await inventoryExperimentalTree(directory);
    slots.push({ relative, identity: { channel, version, source: 'https://fixture.invalid/' + relative,
      treeHash: tree.sha256, recipeHash: channel === 'derived' ? 'a'.repeat(64) : null } });
  }
  return { root, slots, outsideRootSentinel };
}
const gates = async () => ({ audit: true, regressions: true, runtime: true });

test('synthetic official/derived identities differ at the same version; malformed identity rejected', () => {
  const identity = { channel: 'official', version: '1.0.0', treeHash: 'b'.repeat(64), source: 'https://fixture.invalid/', recipeHash: null };
  assert.notEqual(distributionId(identity), distributionId({ ...identity, channel: 'derived', recipeHash: 'a'.repeat(64) }));
  assert.throws(() => distributionIdentity({ ...identity, channel: 'unknown' }));
  assert.throws(() => distributionIdentity({ ...identity, recipeHash: 'a'.repeat(64) }));
  assert.throws(() => distributionIdentity({ ...identity, channel: 'derived', recipeHash: null }));
});

test('synthetic official -> derived -> official plus versions preserves all immutable slots', async t => {
  const { root, slots, outsideRootSentinel } = await fixture(t);
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: gates });
  const before = await inventoryExperimentalTree(root);
  for (const i of [0, 1, 3, 1, 0, 2, 0, 1, 0]) {
    const result = await model.select(distributionId(slots[i].identity), { expected: model.snapshot() });
    assert.equal(result.activeId, distributionId(slots[i].identity));
  }
  assert.equal((await inventoryExperimentalTree(root)).sha256, before.sha256);
  assert.equal(await readFile(path.join(root, 'outside-slot-sentinel.txt'), 'utf8'), 'preserved');
  assert.equal(await readFile(outsideRootSentinel, 'utf8'), 'preserved-outside-model-root');
});

for (const rejectedGate of ['audit', 'regressions', 'runtime']) {
  test('synthetic official fallback fails closed on ' + rejectedGate, async t => {
    const { root, slots } = await fixture(t);
    let allowOfficial = true;
    const model = await createExperimentalSwitchModel({ root, slots, verifyGates: async identity => ({
      audit: true, regressions: true, runtime: true, ...(identity.channel === 'official' && !allowOfficial ? { [rejectedGate]: false } : {}),
    }) });
    await model.select(distributionId(slots[0].identity), { expected: model.snapshot() });
    await model.select(distributionId(slots[1].identity), { expected: model.snapshot() });
    const prior = model.snapshot(); allowOfficial = false;
    await assert.rejects(model.select(distributionId(slots[0].identity), { expected: prior }), /gates/);
    assert.deepEqual(model.snapshot(), prior);
  });
}

test('synthetic cancellation and gate failure preserve active identity', async t => {
  const { root, slots } = await fixture(t);
  let interrupt = null;
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: async () => {
    if (interrupt) interrupt(); return gates();
  } });
  await model.select(distributionId(slots[0].identity), { expected: model.snapshot() });
  const prior = model.snapshot(), controller = new AbortController();
  interrupt = () => controller.abort();
  await assert.rejects(model.select(distributionId(slots[1].identity), { expected: prior, signal: controller.signal }));
  assert.deepEqual(model.snapshot(), prior);
  interrupt = () => { throw new Error('simulated interrupted verification'); };
  await assert.rejects(model.select(distributionId(slots[1].identity), { expected: prior }), /interrupted/);
  assert.deepEqual(model.snapshot(), prior);
});

test('synthetic changed destination and stale request cannot replace selection', async t => {
  const { root, slots } = await fixture(t);
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: gates });
  const stale = model.snapshot();
  await model.select(distributionId(slots[0].identity), { expected: stale });
  const prior = model.snapshot();
  await assert.rejects(model.select(distributionId(slots[1].identity), { expected: stale }), /Stale/);
  await writeFile(path.join(root, slots[1].relative, 'fixture.txt'), 'tampered');
  await assert.rejects(model.select(distributionId(slots[1].identity), { expected: prior }), /integrity/);
  assert.deepEqual(model.snapshot(), prior);
});

test('synthetic concurrent switch linearizes once after verification', async t => {
  const { root, slots } = await fixture(t);
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: gates });
  const expected = model.snapshot();
  const results = await Promise.allSettled([0, 1].map(i => model.select(distributionId(slots[i].identity), { expected })));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter(r => r.status === 'rejected').length, 1);
  assert.equal(model.snapshot().generation, 1);
});

test('synthetic slot escape rejected before any selection', async t => {
  const { root, slots } = await fixture(t);
  await assert.rejects(createExperimentalSwitchModel({ root, slots: [{ ...slots[0], relative: '../outside' }], verifyGates: gates }));
});

test('synthetic identities cannot alias or nest their physical slots', async t => {
  const { root, slots } = await fixture(t);
  await assert.rejects(createExperimentalSwitchModel({ root,
    slots: [slots[0], { ...slots[1], relative: slots[0].relative }], verifyGates: gates }), /overlap/);
  await mkdir(path.join(root, slots[0].relative, 'nested'));
  await assert.rejects(createExperimentalSwitchModel({ root,
    slots: [slots[0], { ...slots[1], relative: slots[0].relative + '/nested' }], verifyGates: gates }), /overlap/);
});

test('synthetic mutable expected state cannot allow a second concurrent winner', async t => {
  const { root, slots } = await fixture(t);
  const expected = { generation: 0, activeId: null };
  let completeGate;
  const delayed = new Promise(resolve => { completeGate = resolve; });
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: async identity => {
    if (identity.channel === 'derived') await delayed;
    return gates();
  } });
  const pending = model.select(distributionId(slots[1].identity), { expected });
  await model.select(distributionId(slots[0].identity), { expected });
  Object.assign(expected, model.snapshot());
  completeGate();
  await assert.rejects(pending, /Stale/);
  assert.equal(model.snapshot().generation, 1);
  assert.equal(model.snapshot().activeId, distributionId(slots[0].identity));
});

test('synthetic destination changed during gates cannot replace selection', async t => {
  const { root, slots } = await fixture(t);
  let alter = false;
  const model = await createExperimentalSwitchModel({ root, slots, verifyGates: async () => {
    if (alter) await writeFile(path.join(root, slots[1].relative, 'fixture.txt'), 'changed-during-gate');
    return gates();
  } });
  await model.select(distributionId(slots[0].identity), { expected: model.snapshot() });
  const prior = model.snapshot(); alter = true;
  await assert.rejects(model.select(distributionId(slots[1].identity), { expected: prior }), /changed after review/);
  assert.deepEqual(model.snapshot(), prior);
});

test('physical package inventory rejects omitted nested package despite apparent green audit', async t => {
  const { root } = await fixture(t);
  const directory = path.join(root, 'nested'); await mkdir(path.join(directory, 'node_modules/dependency'), { recursive: true });
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'fixture', version: '1.0.0' }));
  await writeFile(path.join(directory, 'node_modules/dependency/package.json'), JSON.stringify({ name: 'dependency', version: '1.0.0' }));
  const inventory = await inventoryExperimentalTree(directory);
  assert.equal(inventory.packages.length, 2);
  assertPhysicalAuditCoverage(inventory, inventory.packages);
  assert.throws(() => assertPhysicalAuditCoverage(inventory, inventory.packages.slice(0, 1)), /audited graph/);
  assert.throws(() => assertPhysicalAuditCoverage(inventory, [{ ...inventory.packages[0], version: '9.0.0' }, inventory.packages[1]]));
  assert.throws(() => assertPhysicalAuditCoverage(inventory, [...inventory.packages, inventory.packages[1]]));
  assert.throws(() => assertPhysicalAuditCoverage(inventory, null));
});

test('security probe rejects misleading component results and includes legitimate control cases', () => {
  class AlwaysAllows { storable() { return true; } maxAge() { return 0; }
    satisfiesWithoutRevalidation() { return true; } evaluateRequest() { return { response: {} }; } }
  const probe = probeCacheReuse(AlwaysAllows);
  assert.equal(probe.passed, false);
  assert.deepEqual(probe.failingCases, ['shared-cookie', 'proxy-revalidate', 'response-no-cache', 'must-revalidate-control']);
  assert.equal(probe.targetExposureProven, false);
});
