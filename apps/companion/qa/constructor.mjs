import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as core from 'create-project-engineering-os';
import { createConstructorAdapter } from '../engine/constructor-adapter.mjs';

async function fixture(t) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-adoption-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root], { windowsHide: true });
  return root;
}

test('reviewed existing software and Unity projects preserve manifests, dependencies and product bytes', async t => {
  for (const unity of [false, true]) {
    const root = await fixture(t), adapter = createConstructorAdapter(core);
    const originals = {
      'package.json': '{"name":"existing-product","scripts":{"test":"do-not-execute"},"private":true}\n',
      'package-lock.json': '{"name":"existing-product","lockfileVersion":3,"packages":{}}\n',
      '.gitignore': 'Library/\nproduct-private/\n',
      [unity ? 'Assets/Game.cs' : 'src/product.js']: unity ? 'class Game { void Play() {} }' : 'export const product = 42;',
      'node_modules/existing/marker.txt': 'Owned product dependency',
    };
    for (const [relative, content] of Object.entries(originals)) {
      await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await writeFile(path.join(root, relative), content);
    }
    const plan = await adapter.plan(root);
    assert.equal(plan.status, 'planned');
    assert.ok(plan.preservedOriginals.includes('package.json'));
    assert.ok(plan.plan.operations.some(o => o.target === 'package.json' && o.operation === 'adopt'));
    for (const [relative, content] of Object.entries(originals)) assert.equal(await readFile(path.join(root, relative), 'utf8'), content);
    await adapter.apply(plan.id);
    assert.equal((await adapter.verify(root)).files, 'prepared');
    for (const [relative, content] of Object.entries(originals)) assert.equal(await readFile(path.join(root, relative), 'utf8'), content);
    await assert.rejects(adapter.apply(plan.id), e => e.code === 'PLAN_UNKNOWN');
    const sync = await adapter.planSync(root); await adapter.apply(sync.id);
    for (const [relative, content] of Object.entries(originals)) assert.equal(await readFile(path.join(root, relative), 'utf8'), content);
  }
});

test('modified reviewed original is refused and constructor-owned conflicts remain conflicts', async t => {
  const root = await fixture(t), adapter = createConstructorAdapter(core);
  await writeFile(path.join(root, 'package.json'), '{"private":true}');
  const plan = await adapter.plan(root);
  await writeFile(path.join(root, 'package.json'), '{"private":true,"name":"changed"}');
  await assert.rejects(adapter.apply(plan.id), e => e.code === 'ADOPTION_INPUT_CHANGED');
  assert.match(await readFile(path.join(root, 'package.json'), 'utf8'), /changed/);
  await writeFile(path.join(root, 'AGENTS.md'), 'User-owned instructions must not be replaced.');
  const conflicted = await adapter.plan(root);
  assert.equal(conflicted.status, 'conflict');
  assert.ok(!conflicted.preservedOriginals.includes('AGENTS.md'));
});

test('restart re-reviews interrupted adoption guards and rollback never rewrites the original', async t => {
  for (const resume of [true, false]) {
    const root = await fixture(t);
    await writeFile(path.join(root, 'package.json'), '{"private":true,"name":"original"}');
    const candidates = (await core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, dryRun: true })).plan.adoptionCandidates;
    await assert.rejects(core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, adoptProjectSeeds: candidates, injectFailureAfter: 1 }));
    const adapter = createConstructorAdapter(core), plan = await adapter.plan(root);
    assert.equal(plan.status, 'planned'); assert.ok(plan.incompleteTransaction);
    assert.ok(plan.preservedOriginals.includes('package.json'));
    if (resume) await adapter.apply(plan.id);
    else await adapter.rollback(root, plan.incompleteTransaction);
    assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), '{"private":true,"name":"original"}');
  }
});

test('a recovery journal edited inside the project cannot widen adoption to a file the core does not own', async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'package.json'), '{"private":true,"name":"original"}');
  const candidates = (await core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, dryRun: true })).plan.adoptionCandidates;
  await assert.rejects(core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, adoptProjectSeeds: candidates, injectFailureAfter: 1 }));
  const adapter = createConstructorAdapter(core), interrupted = (await adapter.plan(root)).incompleteTransaction;
  assert.ok(interrupted);
  const secret = path.join(root, 'secret-notes.txt');
  await writeFile(secret, 'A user file the constructor never writes.');
  const journalPath = path.join(root, '.project-constructor/transactions', interrupted, 'journal.json');
  const journal = JSON.parse(await readFile(journalPath, 'utf8'));
  // The journal lives in the project, so treat it as attacker-writable: widen it and re-check.
  const planted = [...(journal.adoptionGuards ?? []),
    { target: 'secret-notes.txt', hash: createHash('sha256').update(await readFile(secret)).digest('hex') }];
  await writeFile(journalPath, JSON.stringify({ ...journal, adoptionGuards: planted }));
  const replanned = await adapter.plan(root).catch(error => ({ status: 'rejected', code: error.code }));
  assert.ok(!replanned.preservedOriginals?.includes('secret-notes.txt'), JSON.stringify(replanned));
  assert.equal(await readFile(secret, 'utf8'), 'A user file the constructor never writes.');
  if (replanned.status === 'planned') await adapter.apply(replanned.id);
  assert.equal(await readFile(secret, 'utf8'), 'A user file the constructor never writes.');
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), '{"private":true,"name":"original"}');
});
