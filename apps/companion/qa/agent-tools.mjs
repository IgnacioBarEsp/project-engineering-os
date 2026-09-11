import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, realpath, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { projectOpenSpecArguments } from '../runtime/openspec-arguments.mjs';
import { verifyAgentEnvironment } from '../runtime/agent-integrity.mjs';
import { RUNTIME_CATALOG } from '../runtime/catalog.mjs';
import { TOOLCHAIN } from '../runtime/toolchain-pin.mjs';
import { inspectTree } from '../runtime/tree.mjs';
import { projectCoreArguments } from '../runtime/core-arguments.mjs';
import { verifyProjectBoundary } from '../runtime/project-boundary.mjs';

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-agent-')));
  t.after(() => rm(root, { recursive: true, force: true })); return root;
}
const rejected = e => e.code === 'TOOL_TARGET';

test('persistent core excludes probes, debt and alternate roots; project metadata cannot redirect through junctions', async t => {
  for (const args of [['doctor'],['readiness-check','--run-local'],['debt','capture','--root','elsewhere'],['sync','--target','elsewhere'],['sync','--blueprint=elsewhere'],['upgrade','--apply'],['opsx-adapt','--config','elsewhere']]) {
    assert.throws(() => projectCoreArguments(args), e => e.code === 'TOOL_COMMAND');
  }
  assert.deepEqual(projectCoreArguments(['sync','--check','--json']),['sync','--check','--json']);
  const home = await fixture(t), root = path.join(home,'child'), external = path.join(home,'external');
  await mkdir(root); await mkdir(external); await mkdir(path.join(home,'openspec','changes'),{recursive:true});
  await assert.rejects(verifyProjectBoundary(root,{openspec:true}),e=>e.code==='TOOLS_PROJECT_ROOT');
  await mkdir(path.join(root,'openspec','changes'),{recursive:true});
  await verifyProjectBoundary(root,{openspec:true});
  await writeFile(path.join(external,'sentinel.txt'),'Keep outside metadata');
  await mkdir(path.join(root,'.project-constructor'));
  const link = path.join(root,'.project-constructor','opsx-transactions');
  await symlink(external,link,process.platform==='win32'?'junction':'dir');
  await assert.rejects(verifyProjectBoundary(root),e=>e.code==='LINK_REJECTED');
  assert.equal(await readFile(path.join(external,'sentinel.txt'),'utf8'),'Keep outside metadata');
  await rm(link); // Remove only the link before fixture cleanup.
});

test('persistent OpenSpec pins init/update to the prepared project and rejects alternate path/store/config controls', async t => {
  const home = await fixture(t), root = path.join(home, 'project'), other = path.join(home, 'other');
  await mkdir(root); await mkdir(other);
  for (const command of ['init', 'update']) {
    assert.deepEqual(await projectOpenSpecArguments(root, [command]), [command, root]);
    assert.deepEqual(await projectOpenSpecArguments(root, [command, '.']), [command, root]);
    assert.deepEqual(await projectOpenSpecArguments(root, [command, '--', root]), [command, root]);
    for (const args of [[other], ['../other'], ['--', other], ['.', other], ['--path', other], ['--path='+other], ['--store-path', other], ['--config='+other]]) {
      await assert.rejects(projectOpenSpecArguments(root, [command, ...args]), rejected);
    }
  }
  for (const args of [
    ['list', '--store', 'external'], ['status', '--store-path='+other], ['validate', '--store-path', other],
    ['archive','change','--store','external'], ['new','change','../outside'], ['new','change','safe','--store=external'],
    ['instructions','apply','--change','../../elsewhere'], ['templates','--schema',other],
    ['store','setup','--path',other], ['config','edit'], ['completion','install'], ['feedback','sent elsewhere'],
    ['--no-color','init',other], ['init','--tools=codex',other], ['init','--force='+other],
    ['status','--change'], ['status','--change=--store=external'],
  ]) await assert.rejects(projectOpenSpecArguments(root,args), rejected);
  assert.deepEqual(await projectOpenSpecArguments(root,['init','--tools','codex','--profile=core','.']),['init','--tools','codex','--profile','core',root]);
  assert.deepEqual(await projectOpenSpecArguments(root,['status','--change=reviewed-change','--json']),['status','--change','reviewed-change','--json']);
  assert.deepEqual(await projectOpenSpecArguments(root,['validate','--all','--strict','--json']),['validate','--all','--strict','--json']);
  assert.deepEqual(await projectOpenSpecArguments(root,['archive','reviewed-change','--yes']),['archive','reviewed-change','--yes']);
});

test('settings cannot re-pin Node, Git or toolchain to an attacker-controlled tree or entry', async t => {
  const root = await fixture(t), runtimeRoot = path.join(root,'runtimes'); await mkdir(runtimeRoot);
  const settings = { runtimeRoot };
  for (const id of ['node','git','toolchain']) {
    const pin = id === 'toolchain' ? TOOLCHAIN : RUNTIME_CATALOG[id];
    const relative = id === 'toolchain' ? TOOLCHAIN.relative : `${id}-${pin.version}-${pin.treeHash.slice(0,12)}/payload`;
    const directory = path.join(id === 'toolchain' ? root : runtimeRoot, relative);
    await mkdir(directory,{recursive:true}); await writeFile(path.join(directory,'injected.mjs'),'throw new Error("must never run")');
    settings[id] = { treeHash: (await inspectTree(directory)).sha256, entry: 'injected.mjs', ...(id === 'toolchain' ? {} : { relative }) };
  }
  await assert.rejects(verifyAgentEnvironment(root, settings), e => e.code === 'TOOLS_CHANGED');
  // Each descriptor is checked against code pins before touching any runtime bytes.
  const { validateAgentDescriptor } = await import('../runtime/agent-integrity.mjs');
  for (const id of ['node','git','toolchain']) {
    assert.throws(() => validateAgentDescriptor(id, settings[id]), e => e.code === 'TOOLS_CHANGED');
    const pin = id === 'toolchain' ? TOOLCHAIN : RUNTIME_CATALOG[id];
    const expected = { treeHash: pin.treeHash, entry: id === 'toolchain' ? 'node_modules/@fission-ai/openspec/bin/openspec.js' : pin.entry,
      ...(id === 'toolchain' ? {} : { relative: `${id}-${pin.version}-${pin.treeHash.slice(0,12)}/payload` }) };
    assert.doesNotThrow(() => validateAgentDescriptor(id,expected));
    assert.throws(() => validateAgentDescriptor(id,{...expected,treeHash:settings[id].treeHash}),e=>e.code==='TOOLS_CHANGED');
    assert.throws(() => validateAgentDescriptor(id,{...expected,entry:'injected.mjs'}),e=>e.code==='TOOLS_CHANGED');
    settings[id]=expected;
  }
  // Correct claimed pins still cannot authorize different bytes.
  await assert.rejects(verifyAgentEnvironment(root, settings), e => e.code === 'TOOLS_CHANGED');
});
