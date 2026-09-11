import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, access } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createActivationEngine } from '../runtime/activation.mjs';
import { createToolchainStore } from '../runtime/toolchain.mjs';

const CONFIG = '.project-constructor/config.json', WORKFLOW = '.claude/commands/opsx/apply.md';
const RECEIPT = '.project-os/companion/activation.json', JOURNAL = '.project-os/companion/activation-transaction.json';
const code = value => e => e.code === value;
async function write(root, relative, value) { await mkdir(path.dirname(path.join(root, relative)), { recursive: true }); await writeFile(path.join(root, relative), value); }
async function fixture(t) {
  const home = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-activation-')));
  t.after(() => rm(home, { recursive: true, force: true }));
  const root = path.join(home, 'project'), runtimes = path.join(home, 'runtimes'); await mkdir(root); await mkdir(runtimes);
  const config = '{"schemaVersion":"1.0.0","custom":"preserve this setting"}\n';
  await write(root, CONFIG, config);
  for (const relative of ['.project-constructor/openspec.mjs', '.project-constructor/toolchain.mjs', '.project-os/openspec-ownership.json', 'openspec/config.yaml']) await write(root, relative, 'Fixture control contents\n');
  await write(root, 'package.json', '{"name":"product","scripts":{"postinstall":"never execute"}}\n');
  const calls = [], core = {
    runBootstrapOrSync: async input => { calls.push(input); return { status: 'IN_SYNC', plan: { summary: { conflicts: 0 }, operations: [] } }; },
    generate: async target => { await write(target, WORKFLOW, 'Official workflow fixture\n'); },
    runOpsxAdapt: async () => ({ status: 'PASS' }),
    runOpsxCheck: async () => ({ status: 'PASS' }),
  };
  const environment = { core, manager: { root: runtimes }, resolveEnvironment: async () => ({}), toolchains: createToolchainStore({ root: runtimes }) };
  const staging = { installToolchain: async () => {}, initializeRepository: async () => {}, renderAgentTools: async () => [] };
  return { root, config, calls, core, create: () => createActivationEngine(environment, staging) };
}

test('activation reviews before writing, preserves product/config data and revalidates generated outputs', async t => {
  const f = await fixture(t), engine = f.create(), product = await readFile(path.join(f.root, 'package.json'));
  const plan = await engine.plan(f.root); assert.equal(plan.status, 'planned');
  assert.equal(await readFile(path.join(f.root, CONFIG), 'utf8'), f.config);
  await assert.rejects(access(path.join(f.root, WORKFLOW)), e => e.code === 'ENOENT');
  const result = await engine.apply(plan.id); assert.equal(result.workflows, 'verified');
  assert.equal(JSON.parse(await readFile(path.join(f.root, CONFIG))).custom, 'preserve this setting');
  assert.deepEqual(await readFile(path.join(f.root, 'package.json')), product);
  assert.equal((await f.create().verify(f.root)).workflows, 'verified');
  await assert.rejects(engine.apply(plan.id), code('PLAN_UNKNOWN'));
  await write(f.root, WORKFLOW, 'User edited this workflow');
  assert.equal((await f.create().verify(f.root)).workflows, 'stale');
  await assert.rejects(f.create().rollback(f.root), code('RECOVERY_CONFLICT'));
  assert.equal(await readFile(path.join(f.root, WORKFLOW), 'utf8'), 'User edited this workflow');
});

test('custom workflow conflicts and stale configuration preserve originals', async t => {
  const f = await fixture(t); await write(f.root, WORKFLOW, 'Existing custom workflow');
  const engine = f.create(), conflict = await engine.plan(f.root);
  assert.equal(conflict.status, 'conflict'); assert.deepEqual(conflict.conflicts, [WORKFLOW]);
  assert.equal(await readFile(path.join(f.root, WORKFLOW), 'utf8'), 'Existing custom workflow');
  await rm(path.join(f.root, WORKFLOW)); const plan = await engine.plan(f.root);
  await write(f.root, CONFIG, '{"custom":"changed after review"}');
  await assert.rejects(engine.apply(plan.id), code('PLAN_STALE'));
  await assert.rejects(access(path.join(f.root, JOURNAL)), e => e.code === 'ENOENT');
});

test('interrupted activation resumes after restart and rollback keeps a pre-existing matching workflow', async t => {
  for (const prior of [false, true]) {
    const f = await fixture(t), engine = f.create();
    if (prior) await write(f.root, WORKFLOW, 'Official workflow fixture\n');
    const plan = await engine.plan(f.root), controller = new AbortController();
    await assert.rejects(engine.apply(plan.id, { signal: controller.signal, onProgress: () => controller.abort() }), e => e.name === 'AbortError');
    assert.equal((await f.create().verify(f.root)).workflows, 'interrupted');
    await f.create().resume(f.root); assert.equal((await f.create().verify(f.root)).workflows, 'verified');
    await f.create().rollback(f.root); assert.equal(await readFile(path.join(f.root, CONFIG), 'utf8'), f.config);
    if (prior) assert.equal(await readFile(path.join(f.root, WORKFLOW), 'utf8'), 'Official workflow fixture\n');
    else await assert.rejects(access(path.join(f.root, WORKFLOW)), e => e.code === 'ENOENT');
    await assert.rejects(access(path.join(f.root, RECEIPT)), e => e.code === 'ENOENT');
  }
});

test('a tampered recovery journal cannot redirect a workflow operation into product code', async t => {
  const f = await fixture(t), engine = f.create(), plan = await engine.plan(f.root); await engine.apply(plan.id);
  const product = await readFile(path.join(f.root, 'package.json'));
  const journal = JSON.parse(await readFile(path.join(f.root, JOURNAL))); journal.operations.find(o => o.path === WORKFLOW).path = 'package.json';
  await write(f.root, JOURNAL, JSON.stringify(journal));
  await assert.rejects(f.create().rollback(f.root), code('ACTIVATION_JOURNAL'));
  assert.deepEqual(await readFile(path.join(f.root, 'package.json')), product);
});

test('a configuration edit during preview cannot be rebound to an earlier configuration value', async t => {
  const f = await fixture(t), prior = f.core.runBootstrapOrSync;
  f.core.runBootstrapOrSync = async input => { await write(f.root, CONFIG, '{"custom":"edited during preview"}'); return prior(input); };
  await assert.rejects(f.create().plan(f.root), code('PLAN_STALE'));
  assert.equal(await readFile(path.join(f.root, CONFIG), 'utf8'), '{"custom":"edited during preview"}');
  await assert.rejects(access(path.join(f.root, JOURNAL)), e => e.code === 'ENOENT');
});
