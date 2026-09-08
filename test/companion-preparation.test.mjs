import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile, symlink, link } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as constructor from '../src/index.mjs';
import { createPreparationEngine } from '../apps/companion/engine/preparation.mjs';
import { createConstructorAdapter } from '../apps/companion/engine/constructor-adapter.mjs';
import { inspectFolder } from '../apps/companion/engine/inventory.mjs';
import { recoverAbandonedLock } from '../apps/companion/engine/files.mjs';

// macOS exposes its temporary directory through /var -> /private/var. The fixture owns its newly
// created root and passes its canonical path; project-supplied links still exercise rejection below.
const prefix = path.join(await realpath(tmpdir()), 'project-os-companion-test-');
async function fixture(t, files = {}) {
  const root = await realpath(await mkdtemp(prefix));
  t.after(async () => {
    assert(path.resolve(root).startsWith(path.resolve(prefix)));
    await rm(root, { recursive: true, force: true });
  });
  for (const [relative, value] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), value);
  }
  return root;
}
const choice = profile => ({ profile, name: 'Proyecto de investigación ñ', agents: ['codex','web'], experience: 'guided' });
const fixtures = {
  research: { 'fuentes/Artículo.pdf': '%PDF-1.7 fixture inventory only; not a valid extracted PDF', 'notas.md': 'Hallazgos con referencias.' },
  software: { 'src/index.js': 'export const answer = 42;' },
  unity: { 'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.0.1f1', 'Assets/Main.cs': 'class Main {}', 'Library/cache.txt': 'excluded' },
  media: { 'recetas/imagen.json': '{"recipe":"illustration"}', 'reference.png': Buffer.from([1,2,3]) },
  general: { 'agenda.txt': 'Reunión y próximos pasos.' },
};
for (const [profile, originals] of Object.entries(fixtures)) {
  test(`Companion ${profile}: read-only preview, preservation, honest readiness, repeat and rollback`, async t => {
    const root = await fixture(t, originals), engine = createPreparationEngine();
    const before = await readdir(root);
    const plan = await engine.plan(root, choice(profile));
    assert.deepEqual(await readdir(root), before);
    assert.equal(plan.inventory.recommendation, profile);
    assert.equal((await engine.apply(plan.id)).status, 'prepared');
    for (const [relative,value] of Object.entries(originals)) assert.deepEqual(await readFile(path.join(root,relative)), Buffer.from(value));
    const state = await engine.verify(root);
    assert.equal(state.base, 'prepared'); assert.equal(state.inventory, 'current');
    assert.equal(state.context, 'pending'); assert.equal(state.externalTools, 'not-verified');
    const repeated = await engine.plan(root, choice(profile));
    assert(repeated.files.every(file=>file.action==='unchanged'));
    assert.deepEqual(await engine.apply(repeated.id), { status: 'unchanged', changed: 0, transaction: null });
    assert.equal((await engine.rollback(root)).status, 'rolled-back');
    assert.equal((await engine.verify(root)).base, 'not-prepared');
    for (const [relative,value] of Object.entries(originals)) assert.deepEqual(await readFile(path.join(root,relative)), Buffer.from(value));
  });
}

test('Companion scan excludes secrets, generated files and links and reports bounds', async t => {
  const root = await fixture(t, { 'safe.txt':'source', '.env':'secret', 'passwords.json':'secret', 'node_modules/private.txt':'dependency', 'deep/level/file.md':'deep' });
  const outside = await fixture(t, { 'private.txt':'outside secret' });
  await symlink(outside,path.join(root,'outside'),'junction');
  await link(path.join(outside,'private.txt'),path.join(root,'hardlink.txt'));
  const inventory = await inspectFolder(root);
  assert.equal(inventory.files.length,2);
  assert(inventory.limitations.filter(l=>l.reason==='link-not-followed').length===2);
  assert(!JSON.stringify(inventory).includes('outside secret'));
  assert((await inspectFolder(root,{entries:1})).limitations.some(l=>l.reason==='entry-limit'));
  assert((await inspectFolder(root,{depth:1})).limitations.some(l=>l.reason==='depth-limit'));
  assert((await inspectFolder(root,{fileBytes:2})).limitations.some(l=>l.reason==='byte-limit'));
  await assert.rejects(inspectFolder(root,{entries:Infinity}),{code:'SCAN_LIMIT_INVALID'});
  await assert.rejects(inspectFolder(path.join(root,'outside')),{code:'LINK_REJECTED'});
});

test('Companion rejects stale plans, mutable previews, collisions and edited owned files', async t => {
  const root = await fixture(t,{'notes.txt':'original'}), engine = createPreparationEngine();
  await assert.rejects(engine.plan(root,{...choice('general'),agents:[]}),{code:'AGENT_INVALID'});
  await assert.rejects(engine.plan(root,{...choice('general'),name:'bad\nname'}),{code:'NAME_INVALID'});
  const old = await engine.plan(root,choice('general'));
  await assert.rejects(createPreparationEngine().apply(old.id),{code:'PLAN_UNKNOWN'});
  await writeFile(path.join(root,'notes.txt'),'a new original');
  await assert.rejects(engine.apply(old.id),{code:'PLAN_STALE'});
  const plan = await engine.plan(root,choice('general'));
  plan.selection.profile = 'software'; plan.files[0].path='notes.txt';
  await engine.apply(plan.id);
  assert.equal((await engine.verify(root)).selection.profile,'general');
  assert.equal(await readFile(path.join(root,'notes.txt'),'utf8'),'a new original');
  await writeFile(path.join(root,'.project-os/companion/START.md'),'human edit');
  await assert.rejects(engine.plan(root,choice('general')),{code:'OWNED_FILE_CHANGED'});
  await assert.rejects(engine.rollback(root),{code:'RECOVERY_CONFLICT'});
  assert.equal(await readFile(path.join(root,'.project-os/companion/START.md'),'utf8'),'human edit');
  const collision = await fixture(t,{'.project-os/companion/START.md':'preexisting'});
  await assert.rejects(engine.plan(collision,choice('general')),{code:'NAMESPACE_COLLISION'});
});

test('Companion resumes each interruption point without duplicates and supports cancellation', async t => {
  for (const stop of [1,2,3,4]) {
    const root = await fixture(t,{'notes.txt':'preserve'}), engine = createPreparationEngine();
    const plan = await engine.plan(root,choice('general'));
    await assert.rejects(engine.apply(plan.id,{onProgress: ({completed})=>{if(completed===stop)throw new Error('simulated interruption');}}),/simulated interruption/);
    assert.equal((await engine.verify(root)).base,'interrupted');
    await assert.rejects(engine.plan(root,choice('general')),{code:'RECOVERY_REQUIRED'});
    assert.equal((await createPreparationEngine().resume(root)).status,'prepared');
    assert.equal((await engine.verify(root)).base,'prepared');
    assert.equal(await readFile(path.join(root,'notes.txt'),'utf8'),'preserve');
  }
  const root = await fixture(t), engine = createPreparationEngine(), signal = AbortSignal.abort();
  const plan = await engine.plan(root,choice('general'));
  await assert.rejects(engine.apply(plan.id,{signal}),{code:'CANCELLED'});
  assert.deepEqual(await readdir(root),[]);
});

test('Companion serializes separate engine instances and rejects live lock recovery', async t => {
  const root = await fixture(t), first = createPreparationEngine(), second = createPreparationEngine();
  const a = await first.plan(root,choice('general')), b = await second.plan(root,choice('general'));
  let release, reached;
  const started = new Promise(resolve=>reached=resolve), held = new Promise(resolve=>release=resolve);
  const running = first.apply(a.id,{onProgress:async({completed})=>{if(completed===1){reached();await held;}}});
  await started;
  try {
    await assert.rejects(second.apply(b.id),{code:'BUSY'});
    await assert.rejects(recoverAbandonedLock(root),{code:'BUSY'});
  } finally { release(); }
  await running;
  await assert.rejects(second.apply(b.id),{code:'PLAN_STALE'});
});

test('Companion keeps custom inventory limits and restores previous preparation on update rollback', async t => {
  const root = await fixture(t,{'one.txt':'first','two.txt':'second'}), engine = createPreparationEngine();
  await engine.apply((await engine.plan(root,choice('general'),{fileBytes:2})).id);
  assert.equal((await engine.verify(root)).inventory,'current');
  const before = await readFile(path.join(root,'.project-os/companion/START.md'));
  await engine.apply((await engine.plan(root,{...choice('general'),name:'Nuevo nombre'},{fileBytes:2})).id);
  assert.equal((await engine.verify(root)).selection.name,'Nuevo nombre');
  await engine.rollback(root);
  assert.deepEqual(await readFile(path.join(root,'.project-os/companion/START.md')),before);
  assert.equal((await engine.verify(root)).selection.name,choice('general').name);
});

test('Companion refuses to resume after source drift and rollback preserves those source edits', async t => {
  const root = await fixture(t,{'notes.txt':'original'}), engine = createPreparationEngine();
  const plan = await engine.plan(root,choice('general'));
  await assert.rejects(engine.apply(plan.id,{onProgress:()=>{throw Error('stop');}}),/stop/);
  await writeFile(path.join(root,'notes.txt'),'new human source');
  await assert.rejects(engine.resume(root),{code:'PLAN_STALE'});
  await engine.rollback(root);
  assert.equal(await readFile(path.join(root,'notes.txt'),'utf8'),'new human source');
  assert.equal((await engine.verify(root)).base,'not-prepared');
});

test('Companion consistently reads and updates a bounded journal larger than one managed file', async t => {
  const root = await fixture(t,{'notes.txt':'preserve'}), engine = createPreparationEngine();
  await assert.rejects(engine.apply((await engine.plan(root,choice('general'))).id,{onProgress:()=>{throw Error('stop');}}),/stop/);
  const file = path.join(root,'.project-os/companion/transaction.json');
  const journal = JSON.parse(await readFile(file,'utf8'));
  // Unknown metadata is inert, forward-compatible data; use it to exercise the accepted journal bound
  // without constructing thousands of filesystem fixtures in every CI platform.
  journal.extension = 'x'.repeat(2 * 1024 * 1024);
  await writeFile(file,JSON.stringify(journal));
  await engine.resume(root);
  assert.equal((await engine.verify(root)).base,'prepared');
  await engine.rollback(root);
  assert.equal((await engine.verify(root)).base,'not-prepared');
  assert.equal(await readFile(path.join(root,'notes.txt'),'utf8'),'preserve');
});

test('Companion reports malformed lock records and namespace collisions without raw type errors', async t => {
  const root = await fixture(t,{'.project-os/companion/write.lock':'null'});
  const file = path.join(root,'.project-os/companion/write.lock');
  for (const value of ['null','[]','{"pid":9007199254740991,"nonce":"invalid"}','{}']) {
    await writeFile(file,value);
    await assert.rejects(recoverAbandonedLock(root),error=>error.code==='LOCK_INVALID' && typeof error.action==='string');
    assert.equal(await readFile(file,'utf8'),value);
  }
});

test('Companion rejects forged recovery paths and state symlinks without touching originals', async t => {
  const root = await fixture(t,{'original.txt':'keep'}), engine = createPreparationEngine();
  await engine.apply((await engine.plan(root,choice('general'))).id);
  const journalPath=path.join(root,'.project-os/companion/transaction.json');
  const journal=JSON.parse(await readFile(journalPath,'utf8'));
  journal.operations[0].path='original.txt';
  await writeFile(journalPath,JSON.stringify(journal));
  await assert.rejects(engine.rollback(root),{code:'JOURNAL_INVALID'});
  assert.equal(await readFile(path.join(root,'original.txt'),'utf8'),'keep');
  const linked = await fixture(t), outside = await fixture(t,{'keep.txt':'outside'});
  await symlink(outside,path.join(linked,'.project-os'),'junction');
  await assert.rejects(engine.plan(linked,choice('general')),{code:'LINK_REJECTED'});
  assert.deepEqual(await readdir(outside),['keep.txt']);
});

test('Companion constructor adapter uses real neutral plan/apply/check/rollback and exposes requirements', async t => {
  const root=await fixture(t,{'original.txt':'original'}), adapter=createConstructorAdapter(constructor);
  assert.equal((await adapter.plan(root)).status,'requires-action');
  execFileSync('git',['init','-q',root],{windowsHide:true});
  const plan=await adapter.plan(root);
  assert.equal(plan.status,'planned');
  const applied=await adapter.apply(plan.id);
  assert.equal(applied.status,'APPLIED');
  const verified=await adapter.verify(root);
  assert.equal(verified.files,'prepared'); assert.equal(verified.workflows,'not-verified');
  await adapter.rollback(root,applied.transaction.transactionId);
  assert.equal(await readFile(path.join(root,'original.txt'),'utf8'),'original');
  const collision=await fixture(t,{'package.json':'{"name":"existing-product"}'});
  execFileSync('git',['init','-q',collision],{windowsHide:true});
  assert.equal((await adapter.plan(collision)).status,'conflict');
  assert.equal(await readFile(path.join(collision,'package.json'),'utf8'),'{"name":"existing-product"}');
});
