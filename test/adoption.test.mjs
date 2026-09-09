import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { link, mkdir, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import { normalizeAdoptionConsent, readAdoptionConsent } from '../src/adoption.mjs';
import { runBootstrapOrSync, runRollback } from '../src/commands.mjs';
import { sha256 } from '../src/hash.mjs';
import { buildPlan, publicPlan } from '../src/plan.mjs';
import { readInstalledState } from '../src/state.mjs';
import { executePlan, findIncompleteTransaction, readTransaction, rollbackTransaction } from '../src/transaction.mjs';

const prefix = path.join(await realpath(tmpdir()), 'project-os-adoption-test-');
const ajv = new Ajv2020({ strict: true });
const validateState = ajv.compile(JSON.parse(await readFile(new URL('../blueprint/schema/state.schema.json', import.meta.url))));
const validateJournal = ajv.compile(JSON.parse(await readFile(new URL('../blueprint/schema/transaction.schema.json', import.meta.url))));
async function fixture(t, files = {}) {
  const root = await realpath(await mkdtemp(prefix));
  t.after(async () => {
    assert(path.resolve(root).startsWith(path.resolve(prefix)));
    await rm(root, { recursive: true, force: true });
  });
  for (const [target, bytes] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, target)), { recursive: true });
    await writeFile(path.join(root, target), bytes);
  }
  return root;
}
const pair = (target, bytes) => ({ target, hash: sha256(Buffer.from(bytes)) });
function blueprint(owner = 'project') {
  const entry = (target, owner, text) => ({ target, owner, id: target, source: target, content: Buffer.from(text), sourceHash: sha256(Buffer.from(text)) });
  return { activeProfiles: [], blueprintHash: 'test-blueprint', distributionHash: 'test-distribution', manifest: { schemaVersion: '1.0.0' },
    entries: [entry('original.md', owner, 'default seed\n'), entry('owned.md', 'constructor', 'owned\n')] };
}
const plan = (root, options = {}) => buildPlan({ blueprint: blueprint(), previousState: null, targetRoot: root, ...options });

for (const profile of ['software', 'unity']) {
  test(`existing ${profile}: read-only discovery, explicit adoption, repeat, edit and rollback preserve originals`, async t => {
    const originals = { 'README.md': '# Mi proyecto\r\nContenido propio.\r\n',
      'package.json': '{"name":"consumer","private":true,"scripts":{"start":"custom-product-command"},"license":"UNLICENSED"}\n',
      ...(profile === 'software' ? { 'src/app.js': 'export const result = 42;' } : { 'Assets/Game.cs': 'class Game {}', 'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.0.1f1' }) };
    const root = await fixture(t, originals);
    execFileSync('git', ['init', '--quiet', root], { windowsHide: true });
    const before = await readdir(root);
    const preview = await runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, dryRun: true });
    assert.deepEqual(await readdir(root), before);
    assert.deepEqual(preview.plan.adoptionCandidates, normalizeAdoptionConsent(Object.entries(originals).filter(([p]) => ['README.md', 'package.json'].includes(p)).map(([p, b]) => pair(p, b))));
    assert(preview.plan.summary.conflicts >= 2);
    await assert.rejects(runBootstrapOrSync({ command: 'bootstrap', targetRoot: root }), { code: 'PLAN_CONFLICT' });
    const consent = preview.plan.adoptionCandidates;
    const applied = await runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, adoptProjectSeeds: consent });
    assert.equal(applied.plan.summary.adopts, 2);
    assert.equal(validateState(await readInstalledState(root)), true, JSON.stringify(validateState.errors));
    assert.equal(validateJournal(await readTransaction(root, applied.transaction.transactionId)), true, JSON.stringify(validateJournal.errors));
    assert.equal((await runBootstrapOrSync({ command: 'sync', targetRoot: root, check: true })).status, 'IN_SYNC');
    assert.equal((await runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, adoptProjectSeeds: consent })).mutationPerformed, false);
    for (const [p, bytes] of Object.entries(originals)) assert.deepEqual(await readFile(path.join(root, p)), Buffer.from(bytes));
    const edited = '# Edición posterior del consumidor\n';
    await writeFile(path.join(root, 'README.md'), edited);
    await runBootstrapOrSync({ command: 'sync', targetRoot: root });
    const state = await readInstalledState(root);
    assert.equal(state.files['README.md'].adopted, true); assert.equal(state.files['README.md'].seeded, false);
    // Roll back the state-only sync first, then the initial constructor transaction.
    await runRollback({ targetRoot: root, transactionId: state.lastTransaction });
    await runRollback({ targetRoot: root, transactionId: applied.transaction.transactionId });
    assert.equal(await readFile(path.join(root, 'README.md'), 'utf8'), edited);
    assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), originals['package.json']);
    assert.equal(await readInstalledState(root), null);
  });
}

test('same-byte collisions still require consent; non-project and invalid consent never become adoption', async t => {
  const root = await fixture(t, { 'original.md': 'default seed\n' });
  const candidate = pair('original.md', 'default seed\n');
  const defaultPlan = await plan(root);
  assert.equal(defaultPlan.conflicts.length, 1);
  assert.deepEqual(publicPlan(defaultPlan).adoptionCandidates, [candidate]);
  for (const owner of ['constructor', 'human-overlay', 'external-openspec']) {
    await assert.rejects(plan(root, { blueprint: blueprint(owner), adoptProjectSeeds: [candidate] }), { code: 'ADOPTION_TARGET_INELIGIBLE' });
  }
  for (const invalid of [true, null, {}, [candidate, candidate], [{ ...candidate, extra: true }], [{ ...candidate, hash: 'bad' }], [{ ...candidate, target: './original.md' }], Array(257).fill(candidate)]) {
    assert.throws(() => normalizeAdoptionConsent(invalid));
  }
  await assert.rejects(plan(root, { adoptProjectSeeds: [pair('missing.md', 'nothing')] }), { code: 'ADOPTION_TARGET_INELIGIBLE' });
  assert.deepEqual(await readdir(root), ['original.md']);
});

test('changed, missing, hardlinked and directory-linked consent fails before mutation', async t => {
  const root = await fixture(t, { 'original.md': 'original' }), consent = [pair('original.md', 'original')];
  const preview = await plan(root, { adoptProjectSeeds: consent });
  await writeFile(path.join(root, 'original.md'), 'changed');
  await assert.rejects(executePlan({ command: 'bootstrap', targetRoot: root, plan: preview }), { code: 'ADOPTION_INPUT_CHANGED' });
  assert.deepEqual(await readdir(root), ['original.md']);
  await rm(path.join(root, 'original.md'));
  await assert.rejects(plan(root, { adoptProjectSeeds: consent }), { code: 'ADOPTION_INPUT_CHANGED' });
  const other = await fixture(t, { 'source.md': 'original' });
  await link(path.join(other, 'source.md'), path.join(root, 'original.md'));
  await assert.rejects(plan(root, { adoptProjectSeeds: consent }), { code: 'ADOPTION_LINK_UNSAFE' });
  assert.deepEqual(publicPlan(await plan(root)).adoptionCandidates, []);
  await symlink(other, path.join(root, 'linked'), 'junction');
  const linkedBlueprint = blueprint(); linkedBlueprint.entries[0].target = 'linked/source.md';
  await assert.rejects(plan(root, { blueprint: linkedBlueprint, adoptProjectSeeds: [pair('linked/source.md', 'original')] }), { code: 'ADOPTION_LINK_UNSAFE' });
  assert.equal(await readFile(path.join(other, 'source.md'), 'utf8'), 'original');
});

test('interrupted adoption binds consent and inputs; resume and rollback keep originals', async t => {
  const root = await fixture(t, { 'original.md': 'original' }), consent = [pair('original.md', 'original')];
  const initial = await plan(root, { adoptProjectSeeds: consent });
  await assert.rejects(executePlan({ command: 'bootstrap', targetRoot: root, plan: initial, injectFailureAfter: 1 }), { code: 'INJECTED_FAILURE' });
  const journal = await findIncompleteTransaction(root);
  assert.deepEqual(journal.adoptionGuards, consent);
  assert(!journal.operations.some(item => item.target === 'original.md'));
  const resumed = await plan(root, { adoptProjectSeeds: consent, resumeJournal: journal });
  await assert.rejects(executePlan({ command: 'bootstrap', targetRoot: root, plan: { ...resumed, adoptionGuards: [] }, resumeJournal: journal }), { code: 'TRANSACTION_ADOPTION_CHANGED' });
  await writeFile(path.join(root, 'original.md'), 'changed');
  await assert.rejects(plan(root, { adoptProjectSeeds: consent, resumeJournal: journal }), { code: 'ADOPTION_INPUT_CHANGED' });
  await writeFile(path.join(root, 'original.md'), 'original');
  assert.equal((await executePlan({ command: 'bootstrap', targetRoot: root, plan: resumed, resumeJournal: journal })).resumed, true);
  await writeFile(path.join(root, 'original.md'), 'later owner edit');
  await rollbackTransaction({ targetRoot: root, transactionId: journal.id });
  assert.equal(await readFile(path.join(root, 'original.md'), 'utf8'), 'later owner edit');
  assert.equal(await readInstalledState(root), null);
});

test('adoption is checked again before state commit after a concurrent source edit', async t => {
  const root = await fixture(t, { 'original.md': 'original' });
  const approved = await plan(root, { adoptProjectSeeds: [pair('original.md', 'original')] });
  const item = approved.materialItems[0], bytes = item.desiredContent;
  Object.defineProperty(item, 'desiredContent', { get() { writeFileSync(path.join(root, 'original.md'), 'concurrent owner edit'); return bytes; } });
  await assert.rejects(executePlan({ command: 'bootstrap', targetRoot: root, plan: approved }), { code: 'ADOPTION_INPUT_CHANGED' });
  assert.equal(await readInstalledState(root), null);
  const journal = await findIncompleteTransaction(root);
  await rollbackTransaction({ targetRoot: root, transactionId: journal.id });
  assert.equal(await readFile(path.join(root, 'original.md'), 'utf8'), 'concurrent owner edit');
});

test('older journals without adoption guards remain resumable', async t => {
  const root = await fixture(t);
  await assert.rejects(executePlan({ command: 'bootstrap', targetRoot: root, plan: await plan(root), injectFailureAfter: 1 }), { code: 'INJECTED_FAILURE' });
  const journal = await findIncompleteTransaction(root); delete journal.adoptionGuards;
  await writeFile(path.join(root, '.project-constructor/transactions', journal.id, 'journal.json'), JSON.stringify(journal));
  const legacy = await readTransaction(root, journal.id);
  const resumed = await plan(root, { resumeJournal: legacy });
  assert.equal((await executePlan({ command: 'bootstrap', targetRoot: root, plan: resumed, resumeJournal: legacy })).resumed, true);
});

test('CLI accepts a bounded reviewed JSON list and rejects invalid scope or input', async t => {
  const root = await fixture(t, { 'README.md': '# Existing\n' });
  execFileSync('git', ['init', '--quiet', root], { windowsHide: true });
  const inputs = await fixture(t, { 'consent.json': JSON.stringify([pair('README.md', '# Existing\n')]) });
  const file = path.join(inputs, 'consent.json');
  const cli = (...args) => execFileSync(process.execPath, ['bin/project-os.mjs', ...args, '--json'], { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  const result = JSON.parse(cli('bootstrap', '--target', root, '--dry-run', '--adopt-project-seeds', file));
  assert.equal(result.plan.summary.adopts, 1); assert.equal(result.mutationPerformed, false);
  assert.throws(() => cli('doctor', '--target', root, '--adopt-project-seeds', file), error => JSON.parse(error.stderr).code === 'CLI_ADOPTION_SCOPE');
  await writeFile(file, '{broken'); await assert.rejects(readAdoptionConsent(file), { code: 'ADOPTION_CONSENT_INVALID' });
  await writeFile(file, ' '.repeat(64 * 1024 + 1)); await assert.rejects(readAdoptionConsent(file), { code: 'ADOPTION_CONSENT_INVALID' });
});
