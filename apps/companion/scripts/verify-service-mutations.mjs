import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// A test that survives reintroducing the defect proves nothing. The interface has a mutation harness of its
// own; this is the same discipline for the part that decides what a project's state is, which no screen
// mutation can reach: the verdict, its witness, the threshold for the ready mark and the staleness rule of
// the guidance.
//
// Each mutation is a textual patch applied to the real source file, with the test suite run against it and
// the file restored afterwards — including when this script fails, so a crash cannot leave a mutated engine
// behind. Detection is credited to the TEST THAT FAILED, never to a non-zero exit alone: a harness that
// timed out would produce the same exit code, and an earlier review of this repository found three
// mutations credited to exactly that.
//
//   node scripts/verify-service-mutations.mjs [<evidence directory>]
const output = process.argv[2] ?? path.join(tmpdir(), 'project-os-closeout', 'companion-service-mutations');
await mkdir(output, { recursive: true });
const companion = fileURLToPath(new URL('../', import.meta.url));
const target = path.join(companion, 'desktop', 'service.mjs');
const suite = path.join('qa', 'project-list.mjs');

const MUTATIONS = [
  { id: 'the-witness-never-reports-a-change',
    reason: 'la comparación de resúmenes deja de encontrar diferencias, así que un proyecto sigue listo después de cambiar un archivo del que dependía',
    from: '    for (const item of verdict.witness) if (await witnessHash(root, item.path) !== item.hash) changed.add(item.stage);',
    to: '    for (const item of verdict.witness) if (false && await witnessHash(root, item.path) !== item.hash) changed.add(item.stage);' },
  { id: 'a-verdict-is-accepted-without-checking-its-folder',
    reason: 'el veredicto se acepta sin comprobar que fue tomado en esta carpeta',
    from: "            const verdict=saved.find(v=>v.id===i.id&&v.rootHash===hash(i.root))??null;",
    to: "            const verdict=saved.find(v=>v.id===i.id)??null;" },
  { id: 'a-truncated-witness-can-still-be-shown-as-ready',
    reason: 'un veredicto que no pudo registrar todo lo que dependía de él puede mostrarse como listo',
    from: "                :!verdict||verdict.witnessTruncated?'unverified'",
    to: "                :!verdict?'unverified'" },
  { id: 'the-ready-mark-ignores-a-stale-inventory',
    reason: 'la palomita deja de exigir que el inventario de la carpeta siga vigente',
    from: "  const stages = [{ id: 'base', state: status.base?.base === 'prepared' && status.base?.inventory === 'current' ? 'ready'",
    to: "  const stages = [{ id: 'base', state: status.base?.base === 'prepared' ? 'ready'" },
  { id: 'the-guidance-stops-refusing-a-stale-copy',
    reason: 'copiar un paso deja de rechazarse cuando el proyecto cambió después de componer la guía',
    from: "        for(const item of value.witness)if(await witnessHash(p.root,item.path)!==item.hash)fail('GUIDE_STALE'",
    to: "        for(const item of value.witness)if(false&&await witnessHash(p.root,item.path)!==item.hash)fail('GUIDE_STALE'" },
  { id: 'a-verdict-missing-a-required-stage-is-accepted',
    reason: 'un veredicto cuyo `required` nombra una etapa que su `stages` no lleva se acepta, así que nada está pendiente porque nada está',
    from: "    && value.required.every(id => value.stages.some(stage => stage.id === id))",
    to: "    && value.required.every(id => true || value.stages.some(stage => stage.id === id))" },
  { id: 'a-verdict-with-no-witness-is-accepted',
    reason: 'un veredicto sin testigo se acepta, y como nada puede desmentirlo la marca sería permanente',
    from: "    && Array.isArray(value.witness) && value.witness.length > 0 && value.witness.length <= WITNESS_LIMIT",
    to: "    && Array.isArray(value.witness) && value.witness.length <= WITNESS_LIMIT" },
  { id: 'an-unreadable-verdict-store-takes-the-list-with-it',
    reason: 'un registro de comprobaciones que no se puede leer vuelve a romper la lista y a impedir abrir cualquier proyecto',
    from: "    catch { return { state: { content: null, hash: null }, items: [], readable: false }; }",
    to: "    catch (error) { throw error; }" },
  { id: 'a-verdict-that-cannot-be-written-fails-the-check',
    reason: 'no poder guardar el veredicto vuelve a tumbar la comprobación que la persona pidió',
    from: "      witness: [], witnessTruncated: true }), saved: false, error: publicError(error) }; }",
    to: "      witness: [], witnessTruncated: true }), saved: false, error: (() => { throw error; })() }; }" },
  { id: 'the-guidance-sends-a-prepared-project-to-a-blank-wizard',
    reason: 'el paso que resuelve una carpeta cambiada vuelve a mandar a la persona al asistente, que abandona el proyecto y borra sus respuestas',
    from: "    const action = id === 'base' && report.profile && stage.state !== 'not-prepared' ? 'resave-base'",
    to: "    const action = id === 'base' && false ? 'resave-base'" },
  { id: 'a-required-stage-that-reports-nothing-counts-as-ready',
    reason: 'una etapa que no reportó nada reconocible se cuenta como lista en vez de resolverse en contra de la marca',
    from: "const reason = (...values) => values.find(value => typeof value === 'string' && value) ?? 'unknown';",
    to: "const reason = (...values) => values.find(value => typeof value === 'string' && value) ?? 'ready';" },
];

const run = () => {
  const result = spawnSync(process.execPath, ['--test', suite],
    { cwd: companion, encoding: 'utf8', windowsHide: true });
  const text = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const failed = [];
  let listing = false;
  for (const line of text.split('\n')) {
    if (line.includes('failing tests:')) { listing = true; continue; }
    const value = line.trim();
    if (!listing || !value.startsWith('✖') || value.includes('failing tests')) continue;
    const name = value.slice(1).trim().split(' (')[0];
    if (name && !failed.includes(name)) failed.push(name);
  }
  return { status: result.status, failed, crashed: result.status === null };
};

const original = await readFile(target, 'utf8');
const record = { date: new Date().toISOString(), target: 'apps/companion/desktop/service.mjs', suite,
  note: 'La detección se atribuye a la prueba que falló, no al código de salida.', mutations: [] };
try {
  const baseline = run();
  assert.equal(baseline.status, 0, `La suite tiene que pasar sin mutar: ${baseline.failed.join(', ')}`);
  record.baseline = { status: baseline.status, failed: baseline.failed };
  for (const mutation of MUTATIONS) {
    assert.ok(original.includes(mutation.from), `La mutación ${mutation.id} no encontró su punto de inserción.`);
    await writeFile(target, original.replace(mutation.from, mutation.to));
    const result = run();
    record.mutations.push({ id: mutation.id, reason: mutation.reason,
      detected: result.failed.length > 0, caughtBy: result.failed, exitCode: result.status,
      by: result.failed.length ? null : result.crashed ? 'la suite no pudo ejecutarse' : 'ninguna prueba falló' });
    await writeFile(target, original);
  }
} finally {
  await writeFile(target, original);
}
record.restored = (await readFile(target, 'utf8')) === original;
record.summary = { mutations: record.mutations.length,
  detected: record.mutations.filter(entry => entry.detected).length, restored: record.restored };
await writeFile(path.join(output, 'service-mutations.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify(record.summary, null, 2));
const missed = record.mutations.filter(entry => !entry.detected);
if (missed.length || !record.restored) {
  console.error(JSON.stringify(missed.map(entry => `${entry.id}: ${entry.by}`), null, 2));
  process.exitCode = 1;
}
