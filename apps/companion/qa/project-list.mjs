import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as core from 'create-project-engineering-os';
import { createDesktopService, guideSteps, publicError, stageReport, withBudget, REQUIRED_STAGES, SUMMARY_BUDGET_MS } from '../desktop/service.mjs';
import { recipesFor } from '../context/recipes.mjs';
import { FORBIDDEN_WORDS, byId, glossaryIdsIn } from '../ui/glossary.mjs';

// The project list is the destination this product's list lives on, so it reads every remembered folder
// before it can render anything. A remembered folder can be on a network share, an unplugged drive or a
// disconnected VPN, and an independent review measured twenty-one seconds of frozen window for exactly that.
// These tests are about the bound, and about the one thing the list may claim without verifying: the verdict
// of the last real check, for as long as nothing that check depended on has changed.

test('a read that does not answer within the budget is refused with a cause instead of waiting', async () => {
  const started = performance.now();
  const hangs = new Promise(() => {});
  const error = await withBudget(hangs, 60).then(() => null, value => value);
  const elapsed = performance.now() - started;
  assert.ok(error, 'La lectura sin respuesta debe rechazarse, no resolverse.');
  assert.equal(error.code, 'FOLDER_UNREACHABLE');
  assert.ok(elapsed < 2000, `Tardó ${Math.round(elapsed)} ms en rendirse.`);
  const shown = publicError(error);
  assert.equal(shown.code, 'FOLDER_UNREACHABLE');
  assert.match(shown.message, /no respondió a tiempo/);
  assert.match(shown.action, /unidad de red|desconectada/);
});

test('a read that answers inside the budget is not disturbed by the bound', async () => {
  assert.equal(await withBudget(Promise.resolve('listo'), 1000), 'listo');
  assert.deepEqual(await withBudget(Promise.all([Promise.resolve(1), Promise.resolve(2)]), 1000), [1, 2]);
  // The own error has to survive the race rather than being replaced by the timeout's.
  const own = await withBudget(Promise.reject(Object.assign(Error('x'), { code: 'STATE_INVALID' })), 1000)
    .then(() => null, value => value);
  assert.equal(own.code, 'STATE_INVALID');
});

test('the budget is short enough to be a bound on a screen rather than a wait', () => {
  assert.ok(SUMMARY_BUDGET_MS > 0 && SUMMARY_BUDGET_MS <= 3000, `${SUMMARY_BUDGET_MS} ms`);
});

// Through realpath, like every other harness here. On macOS `os.tmpdir()` is `/var/folders/…`, a symlink
// to `/private/var/folders/…`, and the preparation engine refuses a folder reached through a link — a
// security property, not an obstacle. CI on macOS reported exactly that: "La carpeta seleccionada pasa por
// un vínculo." The product was right and the test was handing it a linked path.
async function fixture(t) {
  const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'peos-list-')));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const dataRoot = path.join(temp, 'history');
  const copied = [];
  const service = await createDesktopService({ dataRoot, core, chooseFolder: async () => chosen,
    copyText: async value => copied.push(value), openExternal: () => {} });
  let chosen = null;
  async function add(name, profile, contents = 'Un acuerdo que se puede citar.\n') {
    const root = path.join(temp, name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, 'notas.txt'), contents);
    chosen = root;
    const project = await service.chooseFolder();
    const selection = { name, role: 'general', goal: 'Comprobar el listado', profile,
      experience: 'guided', agents: ['web'] };
    const plan = await service.previewBase({ id: project.id, selection });
    await service.applyBase({ plan: plan.id });
    return { id: project.id, root, selection };
  }
  async function read(id) {
    const plan = await service.previewContext({ id, exclude: undefined });
    await service.applyContext({ plan: plan.id });
  }
  const verdicts = {
    async read() { return JSON.parse(await readFile(path.join(dataRoot, 'verdicts.json'), 'utf8')); },
    async write(value) { await writeFile(path.join(dataRoot, 'verdicts.json'), JSON.stringify(value)); },
  };
  const chooseNext = root => { chosen = root; };
  return { temp, dataRoot, service, add, read, verdicts, copied, chooseNext };
}
const row = (list, name) => list.find(entry => entry.name === name);
async function tree(root) {
  const out = new Map();
  async function walk(current) {
    for (const item of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) await walk(absolute);
      else out.set(path.relative(root, absolute).split(path.sep).join('/'), await readFile(absolute));
    }
  }
  await walk(root);
  return out;
}

test('the list shows the verdict of the last real check, and one broken row does not take the rest', async t => {
  const f = await fixture(t);
  const live = await f.add('Proyecto vivo', 'general');
  const gone = await f.add('Proyecto borrado', 'research');

  // Nothing has been read yet, so both rows say a stage is missing and neither claims to be ready.
  const before = await f.service.listProjects();
  assert.equal(before.length, 2);
  assert.deepEqual(before.map(entry => entry.state).sort(), ['incomplete', 'incomplete']);
  assert.deepEqual(before.map(entry => entry.profile).sort(), ['general', 'research']);
  assert.deepEqual(row(before, 'Proyecto vivo').missing, [{ id: 'context', state: 'not-prepared' }],
    'La fila lleva la etapa y por qué no está lista, porque la palabra que se muestra depende del motivo.');
  assert.ok(before.every(entry => entry.checkedAt), 'La fila lleva cuándo se comprobó.');
  assert.ok(before.every(entry => entry.recorded === true), 'La fila declara que su estado es el registrado.');

  // Reading the files finishes the last stage this profile requires, and only then is the row ready.
  await f.read(live.id);
  const ready = row(await f.service.listProjects(), 'Proyecto vivo');
  assert.equal(ready.state, 'verified');
  assert.deepEqual(ready.missing, []);
  assert.deepEqual(ready.changed, []);

  await rm(gone.root, { recursive: true, force: true });
  const after = await f.service.listProjects();
  const missing = row(after, 'Proyecto borrado'), survivor = row(after, 'Proyecto vivo');
  assert.equal(missing.state, 'unreadable', 'Una carpeta que ya no está es el estado de su fila.');
  assert.ok(missing.error?.message, 'La fila ilegible lleva su causa, no una suposición.');
  assert.equal(survivor.state, 'verified', 'Una fila rota no se lleva el resto del listado.');
  // No absolute path reaches the renderer through the row's cause.
  for (const entry of after) {
    assert.doesNotMatch(JSON.stringify(entry.error ?? {}), /[A-Za-z]:[\\/]/,
      'Una ruta absoluta no puede viajar en la causa de una fila.');
  }
});

test('a ready row stops being ready when a file the check depended on changes, and says which stage', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto comprobado', 'general');
  await f.read(project.id);
  assert.equal(row(await f.service.listProjects(), 'Proyecto comprobado').state, 'verified');

  const map = path.join(project.root, '.project-os/companion/context/MAP.md');
  const original = await readFile(map);
  await writeFile(map, Buffer.concat([original, Buffer.from('\nUna línea que nadie revisó.\n')]));
  const changed = row(await f.service.listProjects(), 'Proyecto comprobado');
  assert.equal(changed.state, 'changed');
  assert.deepEqual(changed.changed, ['context'], 'La fila nombra la etapa del archivo que cambió.');

  // Restoring the exact bytes makes it ready again: the comparison is of content, not of a timestamp.
  await writeFile(map, original);
  assert.equal(row(await f.service.listProjects(), 'Proyecto comprobado').state, 'verified');

  // A file the check depended on that disappears is a change too, in the stage that owned it.
  await rm(map, { force: true });
  assert.deepEqual(row(await f.service.listProjects(), 'Proyecto comprobado').changed, ['context']);
});

test('a verdict does not travel to another folder and a truncated witness is never ready', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto mudado', 'general');
  await f.read(project.id);
  assert.equal(row(await f.service.listProjects(), 'Proyecto mudado').state, 'verified');

  const saved = await f.verdicts.read();
  const entry = saved.items.find(item => item.id === project.id);
  assert.ok(entry, 'El veredicto se guardó junto al historial.');
  assert.equal(JSON.stringify(entry).includes(project.root), false, 'El veredicto no guarda rutas absolutas.');
  assert.doesNotMatch(JSON.stringify(entry), /[A-Za-z]:[\\/]/, 'Ningún campo del veredicto es una ruta absoluta.');
  assert.ok(entry.witness.length >= 5 && entry.witness.every(item => !path.isAbsolute(item.path)));

  // The folder digest is what refuses a verdict taken somewhere else, the same way the journals refuse an
  // operation that belongs to another location.
  await f.verdicts.write({ version: 1, items: [{ ...entry, rootHash: 'f'.repeat(64) }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto mudado').state, 'unverified');

  // A witness that could not record everything it depended on cannot support a ready mark.
  await f.verdicts.write({ version: 1, items: [{ ...entry, witnessTruncated: true }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto mudado').state, 'unverified');

  // An unrecognised file degrades to "no verdict" instead of breaking the list.
  await f.verdicts.write({ version: 2, items: 'no' });
  assert.equal(row(await f.service.listProjects(), 'Proyecto mudado').state, 'unverified');
});

test('removing a project from the list drops its verdict and leaves every file byte-identical', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto que se quita', 'general');
  await f.read(project.id);
  const before = await tree(project.root);
  assert.ok(before.size >= 5, `Se comparan ${before.size} archivos.`);

  const result = await f.service.forgetProject({ id: project.id });
  assert.equal(result.forgotten, true);
  assert.equal(result.projectFilesChanged, false);
  assert.equal((await f.service.listProjects()).length, 0);
  assert.equal((await f.verdicts.read()).items.some(item => item.id === project.id), false);

  const after = await tree(project.root);
  assert.deepEqual([...after.keys()].sort(), [...before.keys()].sort(), 'No se quitó ni se añadió ningún archivo.');
  for (const [relative, bytes] of before) {
    assert.ok(after.get(relative).equals(bytes), `${relative} cambió de contenido.`);
  }
});

test('duplicating reuses the answers and carries none of the original preparation', async t => {
  const f = await fixture(t);
  const original = await f.add('Proyecto original', 'general');
  await f.read(original.id);

  // What the interface does to duplicate: choose a folder and reuse the answers. There is no service call
  // that copies a prepared folder, which is why nothing can be copied by accident.
  const copy = path.join(f.temp, 'copia');
  await mkdir(copy);
  await writeFile(path.join(copy, 'otras-notas.txt'), 'Otro acuerdo, en otra carpeta.\n');
  f.chooseNext(copy);
  const chosen = await f.service.chooseFolder();
  assert.notEqual(chosen.id, original.id);
  await assert.rejects(stat(path.join(copy, '.project-os/companion')), { code: 'ENOENT' },
    'La carpeta nueva no recibe los artefactos del original.');

  const plan = await f.service.previewBase({ id: chosen.id, selection: { ...original.selection, name: 'Proyecto copiado' } });
  await f.service.applyBase({ plan: plan.id });
  const mine = JSON.parse(await readFile(path.join(copy, '.project-os/companion/receipt.json'), 'utf8'));
  const theirs = JSON.parse(await readFile(path.join(original.root, '.project-os/companion/receipt.json'), 'utf8'));
  assert.equal(mine.selection.profile, theirs.selection.profile, 'Las respuestas se reusan.');
  assert.notEqual(mine.inventoryFingerprint, theirs.inventoryFingerprint,
    'La preparación nueva lleva sus propios resúmenes, no los del original.');
  assert.equal((await tree(copy)).has('.project-os/companion/context/index.json'), false,
    'No se copió lo que el original había leído.');
});

test('the guidance says what is missing, differs between projects, and refuses a stale copy', async t => {
  const f = await fixture(t);
  const pending = await f.add('Proyecto pendiente', 'general');
  const done = await f.add('Proyecto al día', 'research');
  await f.read(done.id);

  const first = await f.service.guide({ id: pending.id });
  const second = await f.service.guide({ id: done.id });
  assert.deepEqual(first.pending, ['context'], 'Enumera la etapa que falta.');
  assert.deepEqual(second.pending, [], 'Un proyecto al día no inventa pendientes.');
  assert.notDeepEqual(first.steps.map(step => step.title), second.steps.map(step => step.title),
    'Dos proyectos distintos no muestran el mismo texto.');
  // What is missing comes first, in words, and never as the internal token.
  assert.equal(first.steps[0].kind, 'app');
  assert.match(first.steps[0].title, /Falta leer tus archivos/);
  assert.match(first.steps[0].why, /Todavía no se han leído/);
  for (const step of [...first.steps, ...second.steps]) {
    assert.doesNotMatch(`${step.title} ${step.why}`, /not-prepared|requires-action|not-verified|inventory-stale/,
      'Ningún código interno llega a la pantalla.');
  }
  // A step this application performs carries no text for an AI, because handing someone a prompt for it
  // would describe a capability their AI does not have.
  assert.equal(first.steps[0].prompt, null);
  assert.equal(first.steps[0].action, 'read-files');
  await assert.rejects(f.service.copyGuideStep({ guide: first.id, step: 0 }), { code: 'GUIDE_STEP_LOCAL' });

  const promptStep = second.steps.findIndex(step => step.kind === 'prompt');
  assert.ok(promptStep >= 0, 'Hay pasos con texto para dar a la IA.');
  assert.equal((await f.service.copyGuideStep({ guide: second.id, step: promptStep })).copied, true);
  assert.equal(f.copied.length, 1);
  assert.equal(f.copied[0], second.steps[promptStep].prompt);
  // The text names no folder and no project: a guide that differed only by a name would make two projects
  // look different without any of their work being different.
  assert.equal(f.copied[0].includes(done.root), false);
  assert.equal(f.copied[0].includes('Proyecto al día'), false);

  await writeFile(path.join(done.root, '.project-os/companion/context/MAP.md'), 'reescrito\n');
  await assert.rejects(f.service.copyGuideStep({ guide: second.id, step: promptStep }), { code: 'GUIDE_STALE' });
});

// The guidance is composed outside the renderer, so its words are the interface's own words even though the
// screen did not write them. Two properties follow from that: it may not use a word this project refuses to
// put on screen, and it has to report which of its words have a definition so the screen can offer them.
test('the composed guidance carries no forbidden word and declares the terms it uses', () => {
  for (const profile of Object.keys(REQUIRED_STAGES)) {
    const report = { profile, required: REQUIRED_STAGES[profile],
      stages: REQUIRED_STAGES[profile].map(id => ({ id, state: 'not-prepared' })) };
    const steps = guideSteps(report, recipesFor(profile));
    assert.ok(steps.length > REQUIRED_STAGES[profile].length, `${profile}: ${steps.length} pasos`);
    // Including the text handed to an AI: it is drawn on the screen and it is this application's own words.
    const visible = steps.map(step => `${step.title} ${step.why} ${step.prompt ?? ''}`).join(' ');
    for (const [name, form, caseSensitive] of FORBIDDEN_WORDS) {
      assert.doesNotMatch(visible, new RegExp(`(^|[^\\p{L}])(${form})([^\\p{L}]|$)`, caseSensitive ? 'u' : 'iu'),
        `${profile}: la guía usa "${name}", que no tiene definición y no debe aparecer`);
    }
    // Every glossary word the visible text uses is reported, so the screen can put its definition there.
    const declared = glossaryIdsIn(visible);
    assert.deepEqual([...new Set(declared)], declared, `${profile}: términos repetidos`);
    for (const id of declared) assert.ok(byId.has(id), `${profile}: término inexistente ${id}`);
    // And the prompts name no folder: a guide that differed only by a path would look different per project.
    for (const step of steps) if (step.prompt) assert.equal(/[A-Za-z]:[\\/]/.test(step.prompt), false, step.prompt);
  }
});

test('a verdict that could never be disproved, or that is missing a required stage, is refused', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto con veredicto raro', 'general');
  await f.read(project.id);
  const saved = await f.verdicts.read();
  const entry = saved.items.find(item => item.id === project.id);
  assert.equal(row(await f.service.listProjects(), 'Proyecto con veredicto raro').state, 'verified');

  // A verdict whose `required` names a stage its `stages` does not carry: nothing is not ready because
  // nothing is there. The spec says an absent stage counts as not ready, and this is where absent is decided.
  await f.verdicts.write({ version: 1, items: [{ ...entry, stages: [] }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto con veredicto raro').state, 'unverified');
  await f.verdicts.write({ version: 1, items: [{ ...entry, required: ['base', 'context', 'environment'] }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto con veredicto raro').state, 'unverified');

  // A verdict with no witness could never be disproved, so it would be a permanent mark.
  await f.verdicts.write({ version: 1, items: [{ ...entry, witness: [] }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto con veredicto raro').state, 'unverified');

  // A date that cannot be read is not a date. The row would otherwise show the mark next to the sentence
  // that says the state does not come from a check.
  await f.verdicts.write({ version: 1, items: [{ ...entry, at: 'cuando sea' }] });
  assert.equal(row(await f.service.listProjects(), 'Proyecto con veredicto raro').state, 'unverified');
});

test('a verdict store that cannot be read degrades instead of taking the list and the project with it', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto con registro roto', 'general');
  await f.read(project.id);

  // Larger than the bound the reader accepts: the read throws, and it used to throw from outside the
  // per-row guard, so the whole list stopped rendering and no project could be opened.
  await writeFile(path.join(f.dataRoot, 'verdicts.json'), 'x'.repeat(9 * 1024 * 1024));
  const listed = await f.service.listProjects();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].state, 'unverified', 'Un registro ilegible deja el proyecto sin comprobar, no rompe la lista.');
  const status = await f.service.openProject({ id: project.id });
  assert.equal(status.base.base, 'prepared', 'El proyecto se abre aunque su registro de comprobaciones no se pueda leer.');
  assert.equal(status.verdict.saved, false, 'Y el estado dice que el veredicto no se pudo guardar.');
  assert.ok(status.verdict.error?.message, 'Con su causa.');
});

test('a check still answers when this application cannot write its own record', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto con candado', 'general');
  // An abandoned lock in Companion's own data directory, left by a crash. Writing the verdict from inside
  // the check used to turn opening any project into BUSY, with no way out from the interface.
  await mkdir(path.join(f.dataRoot, '.project-os/companion'), { recursive: true });
  await writeFile(path.join(f.dataRoot, '.project-os/companion/write.lock'),
    JSON.stringify({ pid: 1, at: Date.now() }));
  const status = await f.service.openProject({ id: project.id });
  assert.equal(status.base.base, 'prepared');
  assert.equal(status.verdict.saved, false);
  // The row keeps the last verdict that WAS saved, dated, instead of losing the project: a check that could
  // not be recorded simply was not recorded, and nothing new is claimed.
  const listed = (await f.service.listProjects())[0];
  assert.equal(listed.state, 'incomplete');
  assert.notEqual(listed.state, 'verified');
  assert.ok(listed.checkedAt, 'La fila sigue diciendo de cuándo es el veredicto que muestra.');
});

test('the list stays inside its budget with several projects, one of them unreadable', async t => {
  const f = await fixture(t);
  for (const [name, profile] of [['Uno', 'general'], ['Dos', 'research'], ['Tres', 'media'], ['Cuatro', 'general']]) {
    const project = await f.add(name, profile);
    await f.read(project.id);
  }
  const gone = await f.add('Cinco', 'general');
  await rm(gone.root, { recursive: true, force: true });
  const started = performance.now();
  const listed = await f.service.listProjects();
  const elapsed = Math.round(performance.now() - started);
  assert.equal(listed.length, 5);
  assert.equal(listed.filter(entry => entry.state === 'verified').length, 4);
  assert.equal(listed.find(entry => entry.name === 'Cinco').state, 'unreadable');
  // The bound is per row and the rows are read concurrently, so the whole list is bounded by the budget
  // rather than by the sum of its rows. The number is printed, not only asserted: a bound nobody measured
  // is a promise.
  console.log(`lista de ${listed.length} filas, una ilegible, con testigo releído: ${elapsed} ms (presupuesto ${SUMMARY_BUDGET_MS} ms por fila)`);
  assert.ok(elapsed < SUMMARY_BUDGET_MS * 2, `La lista tardó ${elapsed} ms.`);
});

test('a project whose answers are already saved is never sent to a blank wizard', async t => {
  const f = await fixture(t);
  const project = await f.add('Proyecto con carpeta cambiada', 'general');
  await f.read(project.id);
  assert.equal(row(await f.service.listProjects(), 'Proyecto con carpeta cambiada').state, 'verified');

  // One more file in the person's folder, which is the most common way a project stops being ready.
  await writeFile(path.join(project.root, 'otra-nota.txt'), 'Algo que escribí después.\n');
  await f.service.openProject({ id: project.id });
  const listed = row(await f.service.listProjects(), 'Proyecto con carpeta cambiada');
  assert.equal(listed.state, 'incomplete');
  // The row says what is actually out of date. It is not that the choices are missing: they are saved, and
  // what changed is the folder they describe. Reading the files again is pending for the same reason.
  assert.deepEqual(listed.missing, [{ id: 'base', state: 'inventory-stale' }, { id: 'context', state: 'stale' }]);

  const guide = await f.service.guide({ id: project.id });
  assert.equal(guide.steps[0].stage, 'base');
  assert.match(guide.steps[0].title, /Tu carpeta cambió/);
  assert.equal(guide.steps[0].action, 'resave-base',
    'Un proyecto con respuestas guardadas se revisa contra su misma carpeta, no en un asistente en blanco.');

  // Only a project that never had answers starts the wizard.
  const blank = guideSteps({ profile: null, required: ['base', 'context'],
    stages: [{ id: 'base', state: 'not-prepared' }, { id: 'context', state: 'not-prepared' }] }, recipesFor('general'));
  assert.equal(blank[0].action, 'prepare-project');
  assert.match(blank[0].title, /Falta guardar tus elecciones/);
});

test('the ready mark is refused whenever a required stage is not ready', () => {
  const ready = { base: { base: 'prepared', inventory: 'current', selection: { profile: 'research' } },
    context: { context: 'current' }, capabilities: { environment: false }, code: { status: 'not-requested' } };
  assert.deepEqual(stageReport(ready).stages.map(stage => stage.state), ['ready', 'ready']);

  const stale = stageReport({ ...ready, base: { ...ready.base, inventory: 'stale' } });
  assert.deepEqual(stale.stages[0], { id: 'base', state: 'inventory-stale' });

  // A stage that reported nothing recognisable is not ready either: the doubt resolves away from the mark.
  const silent = stageReport({ ...ready, context: { status: 'requires-action' } });
  assert.equal(silent.stages[1].state, 'requires-action');
  assert.equal(stageReport({ ...ready, context: {} }).stages[1].state, 'unknown');

  // Software needs its managed tools and its development files, and an installation that cannot verify them
  // says so rather than passing them over.
  const software = { ...ready, base: { ...ready.base, selection: { profile: 'software' } },
    environment: { status: 'prepared' }, engineering: { files: 'prepared', workflows: 'verified' } };
  assert.deepEqual(stageReport(software).required, ['base', 'context', 'environment', 'engineering']);
  assert.deepEqual(stageReport({ ...software, capabilities: { environment: true } }).stages.map(stage => stage.state),
    ['ready', 'ready', 'ready', 'ready']);
  assert.equal(stageReport(software).stages[2].state, 'not-available');
  assert.equal(stageReport({ ...software, capabilities: { environment: true },
    engineering: { files: 'prepared', workflows: 'not-verified' } }).stages[3].state, 'not-verified');

  // A code map that was never created is not a missing stage; one that stopped holding is.
  assert.equal(stageReport({ ...ready, code: { status: 'not-prepared' } }).stages.length, 2);
  assert.equal(stageReport({ ...ready, code: { status: 'empty' } }).stages.length, 2);
  assert.deepEqual(stageReport({ ...ready, code: { status: 'stale' } }).stages.at(-1), { id: 'code', state: 'stale' });
  assert.deepEqual(stageReport({ ...ready, code: { status: 'corrupt' } }).stages.at(-1), { id: 'code', state: 'corrupt' });
});
