import assert from 'node:assert/strict';
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as core from 'create-project-engineering-os';
import { createDesktopService, publicError, withBudget, SUMMARY_BUDGET_MS } from '../desktop/service.mjs';

// The project list is the destination this product's list lives on, so it reads every remembered folder
// before it can render anything. A remembered folder can be on a network share, an unplugged drive or a
// disconnected VPN, and an independent review measured twenty-one seconds of frozen window for exactly that.
// These tests are about the bound, not about the happy path.

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

test('the list carries a recorded state and a profile per row, and one broken row does not take the rest', async () => {
  // Through realpath, like every other harness here. On macOS `os.tmpdir()` is `/var/folders/…`, a symlink
  // to `/private/var/folders/…`, and the preparation engine refuses a folder reached through a link — a
  // security property, not an obstacle. CI on macOS reported exactly that: "La carpeta seleccionada pasa por
  // un vínculo." The product was right and this test was handing it a linked path.
  const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'peos-list-')));
  try {
    const live = path.join(temp, 'vivo'), gone = path.join(temp, 'borrado');
    await mkdir(live); await mkdir(gone);
    await writeFile(path.join(live, 'notas.txt'), 'Un acuerdo que se puede citar.\n');
    await writeFile(path.join(gone, 'notas.txt'), 'Otro archivo.\n');
    let chosen = live;
    const service = await createDesktopService({ dataRoot: path.join(temp, 'history'), core,
      chooseFolder: async () => chosen, copyText: () => {}, openExternal: () => {} });
    for (const [root, name, profile] of [[live, 'Proyecto vivo', 'general'], [gone, 'Proyecto borrado', 'research']]) {
      chosen = root;
      const project = await service.chooseFolder();
      const plan = await service.previewBase({ id: project.id, selection: { name, role: 'general',
        goal: 'Comprobar el listado', profile, experience: 'guided', agents: ['web'] } });
      await service.applyBase({ plan: plan.id });
    }
    // Nothing has been read yet, so both rows are prepared and neither claims a citation.
    const before = await service.listProjects();
    assert.equal(before.length, 2);
    assert.deepEqual(before.map(entry => entry.state).sort(), ['prepared', 'prepared']);
    assert.deepEqual(before.map(entry => entry.profile).sort(), ['general', 'research']);
    assert.ok(before.every(entry => entry.recorded === true), 'La fila declara que su estado es el registrado.');

    await rm(gone, { recursive: true, force: true });
    const after = await service.listProjects();
    const missing = after.find(entry => entry.name === 'Proyecto borrado');
    const survivor = after.find(entry => entry.name === 'Proyecto vivo');
    assert.equal(missing.state, 'unreadable', 'Una carpeta que ya no está es el estado de su fila.');
    assert.ok(missing.error?.message, 'La fila ilegible lleva su causa, no una suposición.');
    assert.equal(survivor.state, 'prepared', 'Una fila rota no se lleva el resto del listado.');
    // No absolute path reaches the renderer through the row's cause.
    for (const entry of after) {
      assert.doesNotMatch(JSON.stringify(entry.error ?? {}), /[A-Za-z]:[\\/]/,
        'Una ruta absoluta no puede viajar en la causa de una fila.');
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
