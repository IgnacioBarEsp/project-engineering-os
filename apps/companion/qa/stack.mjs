import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import * as core from 'create-project-engineering-os';
import { createDesktopService, DESTINATIONS, MANUAL_CAUSES } from '../desktop/service.mjs';
import { normalizeSelection, DESKTOP_AGENTS, WEB_AGENT } from '../engine/preparation.mjs';
import { STACKS, STACK_IDS, NOT_OFFERED, recommend, stackDecision, offeredFor } from '../runtime/stack-catalog.mjs';
import { createStackStore, INSTALL_ARGUMENTS } from '../runtime/stack.mjs';
import { ensureIgnoreRules, IGNORE_RULES } from '../runtime/regenerable.mjs';
import { createLocalAppLauncher } from '../desktop/local-apps.mjs';

const resources = fileURLToPath(new URL('../runtime/stack/', import.meta.url));
const code = value => error => error.code === value;

async function fixture(t, profile = 'software', options = {}) {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-')));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const root = path.join(dir, 'project'), dataRoot = path.join(dir, 'app-data'); await mkdir(root);
  await writeFile(path.join(root, 'original.txt'), 'Evidence: a desktop choice may not become a web address.');
  const copied = [], opened = [];
  const service = await createDesktopService({ dataRoot, core, chooseFolder: async () => root,
    copyText: async v => copied.push(v), openExternal: async v => opened.push(v), ...options });
  const project = await service.chooseFolder();
  const selection = { name: 'Proyecto medido', role: 'developer', goal: 'Comprobar que una elección se respeta',
    profile, experience: 'guided', agents: [...DESKTOP_AGENTS, WEB_AGENT] };
  const plan = await service.previewBase({ id: project.id, selection });
  await service.applyBase({ plan: plan.id });
  const context = await service.previewContext({ id: project.id });
  await service.applyContext({ plan: context.id });
  return { dir, root, service, project, copied, opened };
}

// The defect this change exists for. Every desktop application the person could have chosen, in every state an
// installation can be in, and not one of them may reach `openExternal`. Deleting the mode guard in the service
// makes this fail, because the assertion is on the addresses actually opened and not on a returned label.
test('a desktop choice never opens an address, whatever the installation turns out to be', async t => {
  // Every state an installation can be in, including the ones this machine does not happen to produce. These are
  // `detect` doubles on purpose — what is under test here is that no address is opened in any of them; that the
  // cause each one carries is the true one is tested against the real launcher, further down.
  const launchers = {
    'not-measured': null,
    'not-installed': { detect: async () => null, open: async () => assert.fail('no debe abrir') },
    signature: { detect: async () => ({ unverified: true, label: 'Antigravity', code: 'APP_UNTRUSTED', reason: 'signature',
      message: 'La firma no verifica.', publisher: null, publisherVerified: false }), open: async () => assert.fail('no debe abrir') },
    'no-contract': { detect: async () => ({ unverified: true, label: 'OpenCode', code: 'APP_UNSUPPORTED', reason: 'no-contract',
      message: 'No declara cómo recibe una carpeta.', publisher: 'Anomaly Innovations, Inc', publisherVerified: true }),
      open: async () => assert.fail('no debe abrir') },
    'no-handler': { detect: async () => ({ unverified: true, label: 'Claude', code: 'APP_UNSUPPORTED', reason: 'no-handler',
      message: 'El sistema no entrega esa dirección a esta misma aplicación.', publisher: 'Anthropic, PBC', publisherVerified: true }),
      open: async () => assert.fail('no debe abrir') },
    'no-desktop-app': { detect: async () => ({ unverified: true, label: 'Codex', code: 'APP_UNTRUSTED', reason: 'no-desktop-app',
      message: 'No se encontró la aplicación de escritorio de Codex instalada.', publisher: 'OpenAI OpCo, LLC', publisherVerified: false }),
      open: async () => assert.fail('no debe abrir') },
    'not-measured-probe': { detect: async () => ({ unverified: true, label: 'Cursor', code: 'APP_NOT_MEASURED', reason: 'not-measured',
      message: 'No se pudo comprobar si esta aplicación está instalada en este equipo.', publisher: null, publisherVerified: false }),
      open: async () => assert.fail('no debe abrir') },
  };
  for (const [name, localApps] of Object.entries(launchers)) {
    const expected = name === 'not-measured-probe' ? 'not-measured' : name;
    const f = await fixture(t, 'software', { localApps });
    for (const agent of DESKTOP_AGENTS) {
      const preview = await f.service.handoffPreview({ id: f.project.id, agent });
      assert.equal(preview.mode, 'manual', `${agent} con ${name}`);
      assert.equal(preview.cause, expected);
      assert.equal(preview.causeMessage, MANUAL_CAUSES[expected]);
      assert.equal(preview.destination, null);
      assert.equal(preview.folderWillBeRequested, false);
      const result = await f.service.handoff({ preview: preview.id, copy: true });
      assert.equal(result.opened, 'nothing');
      assert.equal(result.cause, expected);
      assert.equal(result.projectAttached, false);
      assert.equal(result.agentActivated, false);
      assert.equal(result.agentReadProject, false);
      assert.equal(result.copied, true);
      assert.equal(f.copied.at(-1), preview.prompt);
    }
    assert.deepEqual(f.opened, [], `ninguna dirección abierta con ${name}`);
  }
});

// The other half of the same rule, stated structurally: there is no address to open. A future change that wants
// to send a desktop choice to a web page has to write a URL again, which is a decision someone has to make.
test('the only address this application holds is the one for a web chat', () => {
  assert.deepEqual(Object.keys(DESTINATIONS), ['web']);
  for (const agent of DESKTOP_AGENTS) assert.equal(Object.hasOwn(DESTINATIONS, agent), false);
  assert.match(DESTINATIONS.web, /^https:\/\//);
});

test('a web chat still opens, and a verified desktop application still opens with the folder', async t => {
  const web = await fixture(t, 'research');
  const chat = await web.service.handoffPreview({ id: web.project.id, agent: WEB_AGENT });
  assert.equal(chat.mode, 'web');
  assert.equal(chat.destination, DESTINATIONS.web);
  const opened = await web.service.handoff({ preview: chat.id, copy: true });
  assert.equal(opened.opened, 'web');
  assert.deepEqual(web.opened, [DESTINATIONS.web]);

  const launched = [];
  const local = await fixture(t, 'software', { localApps: {
    detect: async () => ({ label: 'Codex', files: [] }),
    open: async (preview, root) => { launched.push(root); return { opened: 'local', application: 'Codex',
      projectAttached: true, agentActivated: false, agentReadProject: false }; } } });
  const preview = await local.service.handoffPreview({ id: local.project.id, agent: 'codex' });
  assert.equal(preview.mode, 'local');
  assert.equal(preview.destination, 'Codex');
  assert.equal(preview.folderWillBeRequested, true);
  const result = await local.service.handoff({ preview: preview.id, copy: false });
  assert.equal(result.opened, 'local');
  assert.equal(result.agentReadProject, false);
  assert.deepEqual(launched, [local.root]);
  assert.deepEqual(local.opened, []);
});

// The cause said on screen has to be the one that applies, and the only way to know that is to drive the REAL
// launcher through each refusal instead of injecting a `detect` that already decided. The first version of this
// suite injected `detect`, so it checked the mapping from a double and never ran a single check: an independent
// review drove the real one and found three of the resulting sentences false — a signed Claude whose scheme the
// system hands elsewhere told that nobody observed how it takes a folder, and both of Codex's refusals claiming
// its signature could not be checked when the same function had just verified it.
test('each refusal says the check that actually failed, driving the real launcher', async t => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-causes-'))); t.after(() => rm(root, { recursive: true, force: true }));
  const cli = path.join(root, 'codex.exe'), desktop = path.join(root, 'Codex.exe'), claude = path.join(root, 'claude.exe');
  for (const file of [cli, desktop, claude]) await writeFile(file, `binario de prueba ${path.basename(file)}`);

  const launcherFor = options => createLocalAppLauncher({ launch: async () => assert.fail('no debe abrir'), ...options });
  const causeOf = async (agent, options) => {
    const found = await launcherFor(options).detect(agent);
    return found === null ? { reason: null, detected: null } : { reason: found.reason, publisherVerified: found.publisherVerified, message: found.message, detected: found };
  };

  // Codex, signature and publisher fine, but no desktop application beside the command-line tool.
  const codexOk = { signature: async () => ({ status: 'Valid', publisher: 'OpenAI OpCo, LLC' }) };
  const noDesktop = await causeOf('codex', { discover: async () => [{ executable: cli }], ...codexOk });
  assert.equal(noDesktop.reason, 'no-desktop-app');
  assert.equal(noDesktop.publisherVerified, false, 'el editor se verificó, así que la pantalla no puede decir que no');
  assert.match(MANUAL_CAUSES[noDesktop.reason], /verificada/);

  // Codex complete and signed, but this version's help does not confirm that it takes a path.
  const noHelp = await causeOf('codex', { discover: async () => [{ executable: cli, desktop }], ...codexOk, help: async () => 'otra interfaz' });
  assert.equal(noHelp.reason, 'no-help-contract');
  assert.equal(noHelp.publisherVerified, true, 'la firma sí se comprobó y la pantalla tiene que poder decirlo');
  assert.match(MANUAL_CAUSES[noHelp.reason], /su editor sí se pudo comprobar/);

  // The signature itself failing is the only case that may say so.
  const badSignature = await causeOf('codex', { discover: async () => [{ executable: cli, desktop }], signature: async () => ({ status: 'NotSigned', publisher: '' }) });
  assert.equal(badSignature.reason, 'signature');
  assert.match(MANUAL_CAUSES[badSignature.reason], /no se pudo comprobar su firma/);

  // Claude signed, publisher verified, build declaring the route, but the scheme handed to another executable.
  const claudeOk = { discover: async () => [{ executable: claude }], signature: async () => ({ status: 'Valid', publisher: 'Anthropic, PBC' }) };
  const noHandler = await causeOf('claude-code', { ...claudeOk, declaration: async () => true, handler: async () => `"${path.join(root, 'otra.exe')}" "%1"` });
  assert.equal(noHandler.reason, 'no-handler');
  assert.equal(noHandler.publisherVerified, true);
  // The distinction the review found false: the route WAS observed, and a different check failed.
  assert.match(MANUAL_CAUSES[noHandler.reason], /sí declara cómo recibir una carpeta/);
  assert.doesNotMatch(MANUAL_CAUSES[noHandler.reason], /no se observó/);

  // Claude signed and registered, but this build declares no route.
  const noDeclaration = await causeOf('claude-code', { ...claudeOk, declaration: async () => false, handler: async () => `"${claude}" "%1"` });
  assert.equal(noDeclaration.reason, 'no-declaration');
  assert.match(MANUAL_CAUSES[noDeclaration.reason], /no declara cómo recibir una carpeta/);

  // An enumeration that threw measured nothing, which is not the same as finding nothing.
  const probeFailed = await causeOf('codex', { discover: async () => { throw Object.assign(Error('powershell no está'), { code: 'ENOENT' }); } });
  assert.equal(probeFailed.reason, 'not-measured');
  assert.match(MANUAL_CAUSES[probeFailed.reason], /No se pudo comprobar/);

  // And an enumeration that looked and found nothing is still the other answer.
  const nothingFound = await causeOf('codex', { discover: async () => [] });
  assert.equal(nothingFound.detected, null);

  // Every reason the launcher can produce has its own sentence, and no two share one.
  const reasons = ['signature', 'no-desktop-app', 'no-help-contract', 'no-declaration', 'no-handler', 'no-contract', 'not-measured', 'not-installed'];
  for (const reason of reasons) assert.ok(MANUAL_CAUSES[reason], `falta la frase de ${reason}`);
  assert.equal(new Set(Object.values(MANUAL_CAUSES)).size, Object.keys(MANUAL_CAUSES).length, 'dos causas comparten frase');
  assert.deepEqual(Object.keys(MANUAL_CAUSES).sort(), [...reasons].sort());
});

test('the technology answer is one of three, and choosing technologies is only possible with the first', () => {
  const base = { name: 'P', profile: 'software', agents: ['codex'] };
  assert.deepEqual(normalizeSelection(base).stack, undefined);
  assert.equal(stackDecision(normalizeSelection(base), null).kind, 'none');
  assert.deepEqual(normalizeSelection({ ...base, stack: { decision: 'too-early' } }).stack, { decision: 'too-early', requested: [] });
  assert.deepEqual(normalizeSelection({ ...base, stack: { decision: 'chosen', requested: ['typed-code', 'typed-code'] } }).stack,
    { decision: 'chosen', requested: ['typed-code'] });
  assert.throws(() => normalizeSelection({ ...base, stack: { decision: 'maybe' } }), code('STACK_INVALID'));
  assert.throws(() => normalizeSelection({ ...base, stack: { decision: 'unsure', requested: ['typed-code'] } }), code('STACK_INVALID'));
  assert.throws(() => normalizeSelection({ ...base, stack: { decision: 'chosen', requested: ['no-existe'] } }), code('STACK_INVALID'));
  // Offered per profile, so a research project cannot record a technology that is never offered to it.
  assert.deepEqual(offeredFor('research'), []);
  assert.throws(() => normalizeSelection({ ...base, profile: 'research', stack: { decision: 'chosen', requested: ['typed-code'] } }), code('STACK_INVALID'));
});

test('a recommendation comes from profile and inventory, with its sentence, and never from a model', () => {
  const inventory = files => ({ files: files.map(name => ({ path: name })) });
  const withInterface = recommend({ profile: 'software', inventory: inventory(['src/App.tsx', 'src/main.ts']) });
  assert.deepEqual(withInterface.stacks, ['web-interface', 'typed-code']);
  assert.match(withInterface.because, /interfaz con React/);
  const typed = recommend({ profile: 'software', inventory: inventory(['src/index.ts']) });
  assert.deepEqual(typed.stacks, ['typed-code']);
  assert.match(typed.because, /TypeScript/);
  const early = recommend({ profile: 'software', inventory: inventory(['notas.md']) });
  assert.deepEqual(early.stacks, []);
  assert.match(early.because, /pronto/);
  const unity = recommend({ profile: 'unity', inventory: inventory(['Assets/Player.cs']) });
  assert.deepEqual(unity.stacks, []);
  assert.match(unity.because, /editor de Unity/);
  for (const profile of ['research', 'media', 'general']) {
    const value = recommend({ profile, inventory: inventory(['tesis.pdf']) });
    assert.deepEqual(value.stacks, []);
    assert.match(value.because, /no necesita un stack/);
  }
  // Only ids that exist in the frozen catalogue can come out, whatever the inventory says.
  for (const id of recommend({ profile: 'software', inventory: inventory(['a.tsx', 'b.ts']) }).stacks) assert.ok(Object.hasOwn(STACKS, id));
  // Recommending for an unsure answer produces an offer; refusing it is a separate act.
  const offer = stackDecision({ profile: 'software', stack: { decision: 'unsure', requested: [] } }, inventory(['a.tsx']));
  assert.equal(offer.kind, 'recommended');
  assert.deepEqual(offer.stacks, ['web-interface']);
});

// The catalogue states facts about its own resources — how many packages the closure has, which licences appear
// in it, and which direct packages it names. Those facts are checkable without the network, and a catalogue that
// drifts from its lockfile is a screen that lies about what it is going to install.
test('what the catalogue claims matches the reviewed lockfile it would install', async () => {
  for (const id of STACK_IDS) {
    const entry = STACKS[id];
    const manifest = JSON.parse(await readFile(path.join(resources, id, 'package.json'), 'utf8'));
    const lock = JSON.parse(await readFile(path.join(resources, id, 'stack-lock.json'), 'utf8'));
    const packages = Object.entries(lock.packages ?? {}).filter(([key]) => key);
    assert.equal(packages.length, entry.closure, `${id}: paquetes del cierre`);
    assert.deepEqual([...new Set(packages.map(([, value]) => value.license))].sort(), [...entry.licenses].sort(), `${id}: licencias`);
    for (const [key, value] of packages) {
      assert.equal(value.hasInstallScript, undefined, `${id}: ${key} ejecuta un script`);
      assert.equal(value.os, undefined, `${id}: ${key} restringe os`);
      assert.equal(value.cpu, undefined, `${id}: ${key} restringe cpu`);
      assert.ok(value.integrity, `${id}: ${key} sin integridad fijada`);
    }
    // Both directions. Every package the catalogue names has to be in the tree with that version and licence,
    // and every package the manifest asks for has to be named — so the screen can neither invent an entry nor
    // quietly omit one it is about to install.
    for (const named of entry.packages) {
      const found = packages.find(([key]) => key === `node_modules/${named.name}`);
      assert.ok(found, `${id}: ${named.name} en el lockfile`);
      assert.equal(found[1].version, named.version, `${id}: version de ${named.name}`);
      assert.equal(found[1].license, named.license, `${id}: licencia de ${named.name}`);
    }
    for (const [name, version] of Object.entries(manifest.dependencies ?? {})) {
      const named = entry.packages.find(item => item.name === name);
      assert.ok(named, `${id}: ${name} se instala y el catalogo no lo nombra`);
      assert.equal(named.version, version, `${id}: version declarada de ${name}`);
    }
    assert.ok(entry.relative.startsWith('.project-os/'), `${id}: destino fuera de lo que administra la aplicación`);
    assert.match(entry.treeHash, /^[a-f0-9]{64}$/, `${id}: digesto del árbol`);
    assert.ok(entry.installedBytes > 0 && entry.downloadBytes > 0, `${id}: tamaños medidos`);
  }
  assert.ok(NOT_OFFERED.length >= 3);
  for (const item of NOT_OFFERED) { assert.ok(item.from.length > 10); assert.ok(item.reason.length > 40);
    assert.equal(Object.hasOwn(STACKS, item.id), false, `${item.id} no puede estar ofrecido y no ofrecido a la vez`); }
});

test('a technology tree that no longer matches what was reviewed is preserved instead of removed', async t => {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-store-'))); t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createStackStore(), entry = STACKS['typed-code'];
  await mkdir(path.join(dir, entry.relative), { recursive: true });
  await writeFile(path.join(dir, entry.relative, 'node_modules-placeholder.txt'), 'no es lo revisado');
  const inspected = await store.inspect(dir, 'typed-code');
  assert.equal(inspected.status, 'requires-action');
  assert.equal(inspected.code, 'STACK_INTEGRITY');
  await assert.rejects(store.remove(dir, 'typed-code'), code('STACK_INTEGRITY'));
  assert.equal((await readFile(path.join(dir, entry.relative, 'node_modules-placeholder.txt'), 'utf8')), 'no es lo revisado');
  // An installation refuses to overwrite that folder too: what is there was not put there by this application.
  await assert.rejects(store.install(dir, 'typed-code', { node: { entry: process.execPath }, npm: { entry: process.execPath }, git: { entry: process.execPath } }),
    code('STACK_INTEGRITY'));
  await assert.rejects(store.inspect(dir, 'no-existe'), code('STACK_UNKNOWN'));
});

// The record is written from inside the folder lock, and the first version took that lock again in the writer.
// Nothing in the suite reached it, because reaching it needs a write that succeeds — and the first real
// installation through the product's own path failed with BUSY. This is the cheapest path that does reach it:
// a recorded entry whose folder is gone is dropped from the record, from inside the same lock.
test('writing the record from inside the folder lock does not deadlock on it', async t => {
  const dir = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-lock-'))); t.after(() => rm(dir, { recursive: true, force: true }));
  const store = createStackStore();
  await store.decline(dir, ['typed-code', 'web-interface']);
  assert.deepEqual((await store.summary(dir)).declined.map(item => item.id), ['typed-code', 'web-interface']);
  // A second refusal of the same technology is not recorded twice.
  await store.decline(dir, ['typed-code']);
  assert.equal((await store.summary(dir)).declined.length, 2);
  // Hand-write an installed entry whose folder was removed from outside, then let removal reconcile it.
  const record = JSON.parse(await readFile(path.join(dir, '.project-os/companion/stack.json'), 'utf8'));
  record.installed.push({ id: 'typed-code', treeHash: STACKS['typed-code'].treeHash, at: new Date().toISOString() });
  await writeFile(path.join(dir, '.project-os/companion/stack.json'), `${JSON.stringify(record)}
`);
  assert.deepEqual((await store.summary(dir)).installed.map(item => item.id), ['typed-code']);
  const reconciled = await store.remove(dir, 'typed-code');
  assert.equal(reconciled.status, 'unchanged');
  assert.deepEqual((await store.summary(dir)).installed, []);
});

// The door third-party code comes through. An independent review removed `--ignore-scripts`, `--bin-links=false`,
// the pinned registry and the release-age floor one at a time, and every one of the 118 tests stayed green —
// and then removed the verification between the network and the person's folder, which also survived, because
// the declared mutation emptied `verifyStackTree` rather than deleting the call inside `install`. Both are SHALL
// clauses of this change's spec, so both are asserted here against what actually gets executed.
test('installing runs npm with the arguments that keep code from running, and verifies before it moves anything', async t => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-install-'))); t.after(() => rm(root, { recursive: true, force: true }));
  const entry = STACKS['typed-code'];
  const tools = { node: { entry: process.execPath }, npm: { entry: path.join(root, 'npm-cli.js') }, git: { entry: process.execPath } };

  // The arguments, exactly, with no double deciding them for us.
  const calls = [];
  const honest = createStackStore({ run: async call => { calls.push(call);
    // Produce a payload that is not what the pin describes, which is the situation this guard exists for.
    await writeFile(path.join(call.cwd, 'lo-que-bajo-de-la-red.txt'), 'bytes que nadie reviso');
    return { stdout: '', stderr: '' }; } });
  await assert.rejects(honest.install(root, 'typed-code', tools), code('STACK_INTEGRITY'),
    'un arbol que no coincide con su pin no puede llegar a la carpeta de la persona');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].executable, process.execPath);
  assert.deepEqual(calls[0].args, [tools.npm.entry, ...INSTALL_ARGUMENTS]);
  for (const required of ['ci', '--ignore-scripts', '--bin-links=false', '--registry=https://registry.npmjs.org', '--min-release-age=7']) {
    assert.ok(calls[0].args.includes(required), `falta ${required}: con eso se ejecuta o se sustituye codigo de terceros`);
  }
  // The environment npm runs in is its own, so neither the person's configuration nor the project's enters.
  assert.ok(calls[0].env.HOME.startsWith(root), 'npm tiene que correr con su propio HOME dentro del area de trabajo');
  assert.equal(calls[0].env.USERPROFILE, calls[0].env.HOME);

  // Nothing reached the destination, and no record claims it did.
  assert.equal(await stat(path.join(root, entry.relative)).then(() => true, () => false), false);
  assert.deepEqual((await honest.summary(root)).installed, []);
  // And no staging folder was left behind.
  const leftovers = (await readdir(path.join(root, '.project-os', 'stack')).catch(() => [])).filter(name => name.startsWith('.stack-stage-'));
  assert.deepEqual(leftovers, [], 'una instalacion rechazada no puede dejar su carpeta de trabajo');
});

// The decision the debt registry had been carrying unanswered, made concrete by this change: a person who
// prepares a project and commits it would push a node_modules they never chose to version. The rules name only
// what this application regenerates and verifies by digest, they live inside what it administers, and a file a
// person wrote there is never touched — because writing rules there is a decision, and it was already theirs.
test('what regenerates says so, and rules the person wrote are never overwritten', async t => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-ignore-'))); t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.project-os'), { recursive: true });
  const written = await ensureIgnoreRules(root);
  assert.equal(written.written, true);
  const rules = await readFile(path.join(root, '.project-os/.gitignore'), 'utf8');
  assert.equal(rules, IGNORE_RULES);
  for (const folder of ['/toolchain/', '/stack/']) assert.ok(rules.includes(folder), `falta ${folder}`);
  // Only what this application regenerates. The receipts are small and worth keeping in a history.
  assert.equal(rules.includes('/companion/'), false, 'los recibos no se ocultan: son pequeños y dicen qué se preparó');
  // Said in words the person can act on, including how to undo it.
  assert.match(rules, /borra las dos líneas/);

  // A second call changes nothing, and a file the person wrote is theirs.
  const again = await ensureIgnoreRules(root);
  assert.equal(again.written, false);
  assert.equal(await readFile(path.join(root, '.project-os/.gitignore'), 'utf8'), IGNORE_RULES);
  await writeFile(path.join(root, '.project-os/.gitignore'), '# lo quiero versionar\n');
  const respected = await ensureIgnoreRules(root);
  assert.equal(respected.written, false);
  assert.equal(await readFile(path.join(root, '.project-os/.gitignore'), 'utf8'), '# lo quiero versionar\n');
});

test('a record on disk cannot name something this application does not offer', async t => {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-stack-record-'))); t.after(() => rm(root, { recursive: true, force: true }));
  const store = createStackStore();
  await mkdir(path.join(root, '.project-os', 'companion'), { recursive: true });
  const forged = { format: 1, root, installed: [{ id: 'TEXTO ARBITRARIO PUESTO EN EL ARCHIVO', treeHash: 'x', at: '2026-09-13T00:00:00.000Z' },
    { id: 'typed-code', treeHash: STACKS['typed-code'].treeHash, at: '2026-09-13T00:00:00.000Z' }], declined: [{ id: 'tampoco-existe', at: '2026-09-13T00:00:00.000Z' }] };
  await writeFile(path.join(root, '.project-os/companion/stack.json'), JSON.stringify(forged));
  const summary = await store.summary(root);
  assert.deepEqual(summary.installed.map(item => item.id), ['typed-code'], 'un id que el catalogo no conoce no llega a una pantalla');
  assert.deepEqual(summary.declined, []);
  // A record that is not a record at all is refused rather than half-read.
  for (const broken of ['{', '[]', '{"format":2,"root":"x","installed":[],"declined":[]}', '{"format":1,"root":"x","installed":{},"declined":[]}']) {
    await writeFile(path.join(root, '.project-os/companion/stack.json'), broken);
    await assert.rejects(store.summary(root), code('STACK_RECORD'));
  }
});

test('refusing a recommendation records the refusal, installs nothing, and leaves the project as ready as before', async t => {
  const f = await fixture(t, 'software');
  await writeFile(path.join(f.root, 'App.tsx'), 'export default function App(){return null}');
  const plan = await f.service.previewStack({ id: f.project.id });
  assert.equal(plan.kind, 'none');
  assert.deepEqual(plan.items, []);
  assert.match(plan.because, /pronto/);
  assert.equal(plan.id, null);
  assert.equal(plan.notOffered.length, NOT_OFFERED.length);

  // With the answer recorded as "I do not know", the same folder produces an offer that can be refused.
  const chosen = await f.service.previewBase({ id: f.project.id, selection: { name: 'Proyecto medido', role: 'developer',
    goal: 'Comprobar que una elección se respeta', profile: 'software', experience: 'guided', agents: ['codex'],
    stack: { decision: 'unsure', requested: [] } } });
  await f.service.applyBase({ plan: chosen.id });
  // Taken here, with the answer recorded and before the question is asked, so what is compared afterwards is the
  // effect of refusing and nothing else.
  const before = await f.service.status({ id: f.project.id });
  assert.deepEqual(before.stack, { installed: [], declined: [] });
  const offer = await f.service.previewStack({ id: f.project.id });
  assert.equal(offer.kind, 'recommended');
  assert.deepEqual(offer.items.map(item => item.id), ['web-interface']);
  const item = offer.items[0];
  for (const field of ['name', 'purpose', 'licenses', 'downloadBytes', 'installedBytes', 'destination', 'packages']) assert.ok(item[field], `falta ${field}`);
  const declined = await f.service.declineStack({ plan: offer.id });
  assert.deepEqual(declined.declined.map(entry => entry.id), ['web-interface']);
  assert.deepEqual(declined.status.stack.installed, []);
  // The verdict a refusal leaves behind is the one the project already had. Saying no cannot make it worse.
  const after = await f.service.status({ id: f.project.id });
  assert.deepEqual(after.verdict.stages, before.verdict.stages);
  assert.deepEqual(after.stack.installed, []);
  assert.equal(after.stack.declined[0].id, 'web-interface');
  await assert.rejects(f.service.applyStack({ plan: offer.id }), code('PLAN_UNKNOWN'));
});
