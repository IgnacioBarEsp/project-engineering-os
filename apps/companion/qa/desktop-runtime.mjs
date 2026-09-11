import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import * as core from 'create-project-engineering-os';
import { createDesktopService } from '../desktop/service.mjs';
import { createToolchainStore } from '../runtime/toolchain.mjs';
import { renderAgentTools } from '../runtime/agent-tools.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';
import { TOOLCHAIN } from '../runtime/toolchain-pin.mjs';
import { hash } from '../engine/files.mjs';

const code = value => error => error.code === value;
const RUNTIME_METHODS = ['previewEnvironment','applyEnvironment','previewActivation','applyActivation',
  'previewCode','applyCode','searchCode','previewRepair','applyRepair'];

// The renderer can only reach these engines through the service, so the service owns the guards:
// no renderer-supplied path, no plan reused across kinds, no capability claimed when absent.
async function fixture(t, profile = 'software', { withEnvironment = true } = {}) {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-service-')));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'project'), runtimeRoot = path.join(dir, 'runtimes');
  await mkdir(root); await mkdir(runtimeRoot);
  await writeFile(path.join(root, 'original.txt'), 'Evidence about measured tokens.');
  await writeFile(path.join(root, 'budget.js'), 'export function calculateBudget(hours) { return hours * 2; }\n');
  const calls = [];
  const manager = { root: runtimeRoot,
    plan: async ids => ({ tools: ids.map(id => ({ id, status: 'missing', downloadBytes: 1 })), downloadBytes: ids.length }),
    install: async id => { calls.push(`install:${id}`); return { id }; },
    inspect: async id => ({ id, status: 'missing' }) };
  const environment = withEnvironment ? {
    core, manager, toolchains: createToolchainStore(manager), resolveEnvironment: async () => ({}),
    plan: async () => { calls.push('environment.plan'); return { id: 'engine-environment', status: 'planned', root, tools: [], downloadBytes: 0, files: [] }; },
    apply: async id => { calls.push(`environment.apply:${id}`); return { status: 'prepared', workflows: 'not-verified' }; },
    planRepair: async () => { calls.push('environment.planRepair'); return { id: 'engine-repair', status: 'planned', items: [], blocked: [], downloadBytes: 0 }; },
    repair: async id => { calls.push(`environment.repair:${id}`); return { status: 'repaired', results: [] }; },
    verify: async () => ({ status: 'prepared', workflows: 'not-verified' }),
  } : null;
  const copied = [], opened = [];
  const service = await createDesktopService({ dataRoot: path.join(dir, 'app-data'), core, environment,
    chooseFolder: async () => root, copyText: v => copied.push(v), openExternal: v => opened.push(v) });
  const project = await service.chooseFolder();
  const selection = { name: 'Proyecto', role: 'developer', goal: 'Preparar herramientas', profile, experience: 'guided', agents: ['web'] };
  const plan = await service.previewBase({ id: project.id, selection });
  await service.applyBase({ plan: plan.id });
  return { dir, root, runtimeRoot, service, project, selection, calls, copied, opened };
}

test('every runtime service method rejects unrecognized, missing and renderer-supplied inputs', async t => {
  const f = await fixture(t);
  for (const method of RUNTIME_METHODS) {
    assert.equal(typeof f.service[method], 'function', method);
    // An extra key is never ignored, including a path the renderer tries to choose.
    await assert.rejects(f.service[method]({ id: f.project.id, plan: 'x', root: f.root }), code('INPUT_INVALID'), method);
    await assert.rejects(f.service[method](null), code('INPUT_INVALID'), method);
    // A missing identity is refused by the owner of that identity, never defaulted.
    await assert.rejects(f.service[method]({}), code(method.startsWith('apply') ? 'PLAN_UNKNOWN' : 'PROJECT_UNKNOWN'), method);
  }
  await assert.rejects(f.service.previewEnvironment({ id: 'not-a-project' }), code('PROJECT_UNKNOWN'));
  await assert.rejects(f.service.searchCode({ id: f.project.id, query: '\n' }), code('QUERY_INVALID'));
});

test('a plan identity is single use and never accepted by another stage', async t => {
  const f = await fixture(t);
  const environment = await f.service.previewEnvironment({ id: f.project.id });
  assert.equal(environment.status, 'planned');
  for (const method of ['applyActivation','applyCode','applyRepair','applyEngineering']) {
    await assert.rejects(f.service[method]({ plan: environment.id }), code('PLAN_UNKNOWN'), method);
  }
  const repair = await f.service.previewRepair({ id: f.project.id });
  await assert.rejects(f.service.applyEnvironment({ plan: repair.id }), code('PLAN_UNKNOWN'));
  assert.equal((await f.service.applyEnvironment({ plan: environment.id })).result.status, 'prepared');
  await assert.rejects(f.service.applyEnvironment({ plan: environment.id }), code('PLAN_UNKNOWN'));
  assert.ok(f.calls.includes('environment.apply:engine-environment'));
  assert.equal((await f.service.applyRepair({ plan: repair.id })).result.status, 'repaired');
  assert.ok(f.calls.includes('environment.repair:engine-repair'));
});

test('runtime stages are refused for profiles that did not request them and when the capability is absent', async t => {
  const research = await fixture(t, 'research');
  for (const method of ['previewEnvironment','previewActivation']) {
    await assert.rejects(research.service[method]({ id: research.project.id }), code('ENVIRONMENT_UNAVAILABLE'), method);
  }
  const status = await research.service.status({ id: research.project.id });
  assert.equal(status.environment.status, 'not-requested');
  assert.equal(status.code.status, 'not-requested');
  assert.equal(status.capabilities.environment, true);

  const bare = await fixture(t, 'software', { withEnvironment: false });
  const bareStatus = await bare.service.status({ id: bare.project.id });
  assert.equal(bareStatus.capabilities.environment, false);
  assert.equal(bareStatus.capabilities.codeGraph, false);
  for (const [method, expected] of [['previewEnvironment','ENVIRONMENT_UNAVAILABLE'],['previewActivation','ENVIRONMENT_UNAVAILABLE'],
    ['previewRepair','ENVIRONMENT_UNAVAILABLE'],['previewCode','GRAPH_UNAVAILABLE']]) {
    await assert.rejects(bare.service[method]({ id: bare.project.id }), code(expected), method);
  }
  await assert.rejects(bare.service.searchCode({ id: bare.project.id, query: 'calculateBudget' }), code('GRAPH_UNAVAILABLE'));
});

test('the code map stage reports honest states and refuses queries without a current map', async t => {
  const f = await fixture(t);
  const context = await f.service.previewContext({ id: f.project.id });
  await f.service.applyContext({ plan: context.id });
  const status = await f.service.status({ id: f.project.id });
  assert.equal(status.code.status, 'not-prepared');
  assert.equal(status.code.symbols, undefined);
  await assert.rejects(f.service.searchCode({ id: f.project.id, query: 'calculateBudget' }), code('GRAPH_NOT_CURRENT'));
  const plan = await f.service.previewCode({ id: f.project.id });
  assert.equal(plan.status, 'planned');
  assert.deepEqual(plan.coverage.sources.map(s => s.path), ['budget.js']);
  // Excluding the only eligible file leaves an empty scope with no plan to apply.
  const excluded = await f.service.previewContext({ id: f.project.id, exclude: ['budget.js'] });
  await f.service.applyContext({ plan: excluded.id });
  const empty = await f.service.previewCode({ id: f.project.id });
  assert.equal(empty.status, 'empty'); assert.equal(empty.id, null);
  await assert.rejects(f.service.applyCode({ plan: plan.id }), code('PLAN_STALE'));
});

test('the generated local entry pins every module it runs and the runtime identity it was built from', async t => {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-entry-')));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'project'), runtimeRoot = path.join(dir, 'runtimes');
  const nodeRoot = path.join(runtimeRoot, `node-${RUNTIME_CATALOG.node.version}-${RUNTIME_CATALOG.node.treeHash.slice(0, 12)}`, 'payload');
  await mkdir(root); await mkdir(nodeRoot, { recursive: true });
  await writeFile(path.join(nodeRoot, 'node.exe'), 'fixture executable bytes');
  const verified = { node: { root: nodeRoot, entry: path.join(nodeRoot, 'node.exe') }, git: { root: path.join(runtimeRoot, 'git') } };
  const files = await renderAgentTools(root, verified, runtimeRoot);
  const byPath = new Map(files.map(f => [f.path, f.content]));
  const settings = JSON.parse(byPath.get('.project-os/companion/tools/settings.json'));
  assert.equal(settings.rootHash, hash(root));
  assert.equal(settings.node.treeHash, RUNTIME_CATALOG.node.treeHash);
  assert.equal(settings.git.treeHash, RUNTIME_CATALOG.git.treeHash);
  assert.equal(settings.toolchain.treeHash, TOOLCHAIN.treeHash);
  const script = byPath.get('.project-os/companion/tools.ps1');
  // Every copied module the launcher will execute is pinned by hash before Node starts.
  const modules = [...byPath.keys()].filter(p => p.startsWith('.project-os/companion/tools/'));
  assert.ok(modules.length >= 18, `modules ${modules.length}`);
  for (const relative of modules) {
    const key = relative.slice('.project-os/companion/tools/'.length);
    assert.ok(script.includes(`'${key}' = '${hash(byPath.get(relative))}'`), `missing pin for ${key}`);
  }
  assert.ok(script.includes("(Get-FileHash -LiteralPath $toolPath -Algorithm SHA256).Hash -ne $toolFile.Value"));
  assert.ok(script.includes('[IO.FileAttributes]::ReparsePoint'));
  assert.ok(script.includes('$env:NODE_OPTIONS = $null') && script.includes('$env:NODE_PATH = $null'));
  // A launcher that pinned nothing would still contain the node hash, so assert the payload table exists.
  assert.match(script, /\$toolFiles = @\{/);
  assert.ok(byPath.get('.project-os/companion/TOOLS.md').includes('no los ejecutes'));
});
