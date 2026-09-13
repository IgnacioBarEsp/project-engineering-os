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
const targets = { service: path.join(companion, 'desktop', 'service.mjs'),
  inference: path.join(companion, 'runtime', 'inference.mjs'),
  prompts: path.join(companion, 'context', 'prompts.mjs'),
  handoff: path.join(companion, 'desktop', 'service.mjs'),
  launcher: path.join(companion, 'desktop', 'local-apps.mjs'),
  stack: path.join(companion, 'runtime', 'stack.mjs'),
  regenerable: path.join(companion, 'runtime', 'regenerable.mjs'),
  catalog: path.join(companion, 'runtime', 'stack-catalog.mjs'),
  selection: path.join(companion, 'engine', 'preparation.mjs') };
const suites = { service: path.join('qa', 'project-list.mjs'), inference: path.join('qa', 'prompts.mjs'),
  prompts: path.join('qa', 'prompts.mjs'), handoff: path.join('qa', 'stack.mjs'),
  launcher: path.join('qa', 'stack.mjs'), regenerable: path.join('qa', 'stack.mjs'),
  stack: path.join('qa', 'stack.mjs'), catalog: path.join('qa', 'stack.mjs'),
  selection: path.join('qa', 'stack.mjs') };

const MUTATIONS = [
  // The defect issue 100 exists for: a stated desktop choice being replaced by a web page. Each of these puts
  // the substitution back in a different way — the mode decided by what is installed instead of by what was
  // chosen, the branch that opens an address, and the address itself.
  { id: 'the-mode-is-decided-by-what-is-installed', file: 'handoff',
    reason: 'el modo vuelve a salir de si hay aplicación verificada, así que elegir escritorio sin poder abrirla manda a un navegador',
    from: "      const mode=web?'web':local?'local':'manual';",
    to: "      const mode=local?'local':'web';" },
  // Written as a behaviour change, not as a parse error. The first version of this mutation deleted the `else if`
  // and left two `else` clauses in a row, which made the suite fail to load — and a suite that cannot run credits
  // no test with anything. The harness said so by naming the file instead of a test, which is exactly what it is
  // there for.
  { id: 'a-desktop-choice-reaches-the-branch-that-opens-an-address', file: 'handoff',
    reason: 'la rama manual vuelve a abrir una dirección, así que elegir escritorio sin poder abrirla termina en un navegador',
    from: "        else opened={opened:'nothing',cause:preview.cause,projectAttached:false,agentActivated:false,agentReadProject:false};",
    to: "        else {await openExternal(DESTINATIONS.web);opened={opened:'web',projectAttached:false,agentActivated:false,agentReadProject:false};}" },
  { id: 'the-desktop-applications-get-their-web-addresses-back', file: 'handoff',
    reason: 'vuelven las URL por aplicación de escritorio, que es lo que hacía posible la sustitución',
    from: "export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/' });",
    to: "export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/', codex: 'https://chatgpt.com/codex', 'claude-code': 'https://claude.ai/', cursor: 'https://cursor.com/', 'github-copilot': 'https://github.com/copilot', opencode: 'https://opencode.ai/', antigravity: 'https://antigravity.google/' });" },
  { id: 'a-launcher-that-was-never-asked-is-reported-as-not-installed', file: 'handoff',
    reason: 'no haber podido comprobar se informa como no estar instalada, que es concluir de una ausencia que uno mismo creó',
    from: "      const cause=mode!=='manual'?null:!localApps?'not-measured':!detected?'not-installed'",
    to: "      const cause=mode!=='manual'?null:!detected?'not-installed'" },
  // The sentence a person reads when the application they chose will not open. An independent review drove the
  // real launcher through six distinguishable refusals and found three of the resulting sentences false, so each
  // of these puts back the thing that made them false.
  { id: 'the-cause-is-deduced-from-whether-a-publisher-came-attached', file: 'handoff',
    reason: 'la causa vuelve a deducirse de si el rechazo traia editor, y situaciones distintas se aplastan en dos frases',
    from: "        :Object.hasOwn(MANUAL_CAUSES,unverified.reason??'')?unverified.reason:'signature';",
    to: "        :unverified.publisherVerified?'no-contract':'signature';" },
  { id: 'a-refusal-stops-naming-the-check-that-failed', file: 'launcher',
    reason: 'el rechazo deja de llevar que comprobacion fallo, asi que quien escribe la frase tiene que adivinarla',
    from: "      catch (error) { error.publisher = verified[0] ?? null; error.reason = reason; throw error; }",
    to: "      catch (error) { error.publisher = verified[0] ?? null; throw error; }" },
  { id: 'the-codex-refusal-arrives-without-the-publisher-already-verified', file: 'launcher',
    reason: 'vuelve a usar fail en vez de refuse, asi que la pantalla dice que no se pudo comprobar una firma que si se comprobo',
    from: "    if (agent==='codex'&&!candidate.desktop) refuse('no-desktop-app','APP_UNTRUSTED'",
    to: "    if (agent==='codex'&&!candidate.desktop) fail('APP_UNTRUSTED'" },
  { id: 'an-enumeration-that-threw-is-reported-as-nothing-found', file: 'launcher',
    reason: 'una sonda caida vuelve a informarse como que la aplicacion no esta instalada, que es concluir de una ausencia propia',
    from: "      const found=await candidates(agent).catch(error=>{probeFailed=error;return [];});",
    to: "      const found=await candidates(agent).catch(()=>[]);" },
  // What protects the person's folder when something does get installed.
  { id: 'the-installed-tree-is-accepted-without-comparing-its-digest', file: 'stack',
    reason: 'lo instalado deja de compararse contra su pin, así que un árbol distinto del revisado se acepta y se puede borrar',
    from: "  if (tree.sha256 !== entry.treeHash || tree.bytes !== entry.installedBytes) {",
    to: "  if (false) {" },
  { id: 'a-technology-can-be-installed-outside-what-the-application-administers', file: 'catalog',
    reason: 'un destino deja de estar dentro de .project-os, así que una instalación escribe donde la persona guarda su trabajo',
    from: "    id: 'typed-code', name: 'TypeScript', relative: '.project-os/stack/typed-code',",
    to: "    id: 'typed-code', name: 'TypeScript', relative: 'node_modules-typed-code'," },
  { id: 'the-record-writer-takes-the-lock-it-is-already-holding', file: 'stack',
    reason: 'el escritor del registro vuelve a tomar el candado de la carpeta, y cualquier instalacion real muere con BUSY',
    from: "    await writeChecked(root, RECORD, content, beforeHash, MAX_RECORD);",
    to: "    await withLock(root, () => writeChecked(root, RECORD, content, beforeHash, MAX_RECORD));" },
  { id: 'npm-runs-with-lifecycle-scripts-enabled', file: 'stack',
    reason: 'se instala permitiendo que cada paquete ejecute codigo durante la instalacion',
    from: "export const INSTALL_ARGUMENTS = Object.freeze(['ci', '--ignore-scripts', '--bin-links=false',",
    to: "export const INSTALL_ARGUMENTS = Object.freeze(['ci', '--bin-links=false'," },
  { id: 'the-registry-stops-being-pinned', file: 'stack',
    reason: 'un mirror configurado puede sustituir los paquetes que el lockfile fijo',
    from: "  '--workspaces=false', '--registry=https://registry.npmjs.org', '--min-release-age=7', '--fund=false', '--audit=false']);",
    to: "  '--workspaces=false', '--fund=false', '--audit=false']);" },
  { id: 'what-came-from-the-network-is-moved-without-being-verified', file: 'stack',
    reason: 'lo que acaba de bajar de la red se renombra a la carpeta de la persona sin compararse contra su pin',
    from: "          const verified = await verifyStackTree(entry, await canonicalFolder(payload), controls);",
    to: "          const verified = { treeHash: entry.treeHash, bytes: entry.installedBytes, files: entry.files };" },
  { id: 'the-ignore-rules-overwrite-what-the-person-wrote', file: 'regenerable',
    reason: 'las reglas de ignore pisan un archivo que la persona escribio, que es decidir por ella en su propio repositorio',
    from: "  if (current.content !== null) return { written: false, reason: 'ya existe un archivo ahí y es de quien lo escribió' };",
    to: "  if (false) return { written: false, reason: 'ya existe un archivo ahí y es de quien lo escribió' };" },
  { id: 'the-record-accepts-a-name-the-catalogue-does-not-know', file: 'stack',
    reason: 'un registro forjado pinta texto arbitrario en la pantalla del proyecto',
    from: "  value.installed = value.installed.filter(item => Object.hasOwn(STACKS, item.id));",
    to: "  value.installed = value.installed.filter(() => true);" },
  { id: 'the-recommendation-stops-depending-on-the-folder', file: 'catalog',
    reason: 'la recomendación deja de leer el inventario y recomienda lo mismo a cualquiera',
    from: "  const interfaceFiles = countOf(inventory, '.tsx') + countOf(inventory, '.jsx');",
    to: "  const interfaceFiles = 1;" },
  { id: 'technologies-can-be-recorded-without-having-been-chosen', file: 'selection',
    reason: 'se pueden registrar tecnologías con una respuesta que no las pidió, así que una recomendación se vuelve una petición',
    from: "    if (value.decision !== 'chosen' && requested.length) fail('STACK_INVALID', 'Solo se pueden elegir tecnologías si dijiste que ya sabes cuál quieres.', 'Vuelve al asistente y responde la pregunta de tecnología.');",
    to: "" },
  // What decides whether a person's material can leave this machine. An independent review got a file name
  // into a request with nothing but a different capitalisation, so these are the ones that matter most.
  { id: 'the-guard-stops-refusing-a-payload-with-project-data', file: 'inference',
    reason: 'el guardia deja de mirar el cuerpo, así que una ruta del proyecto puede viajar hacia un modelo',
    from: "      const leaking = projectDataIn(body, paths);",
    to: "      const leaking = [];" },
  { id: 'the-guard-compares-without-normalising', file: 'inference',
    reason: 'el guardia vuelve a comparar tal cual, así que un nombre con otra caja o con otra normalización pasa',
    from: "const comparable = value => String(value).normalize('NFC').toLowerCase();",
    to: "const comparable = value => String(value);" },
  { id: 'the-outbound-shape-passes-its-input-through', file: 'inference',
    reason: 'los datos que viajan dejan de construirse campo por campo y se reenvía lo que llegue',
    from: "export function shareableFacts(input = {}) {",
    to: "export function shareableFacts(input = {}) { if (input) return input;" },
  { id: 'a-model-answer-replaces-the-rules', file: 'inference',
    reason: 'lo que devuelve un modelo vuelve a quedarse solo, sin las reglas que esta aplicación impone',
    from: '    modelText.trim(), rules.trim()].join(',
    to: '    modelText.trim()].join(' },
  { id: 'the-floor-accepts-anything-long-enough', file: 'inference',
    reason: 'el piso vuelve a medir solo el largo, así que un texto sobre cualquier otra cosa lo supera',
    from: "    if (covered < 3) problems.push('no cubre qué preparar, cómo trabajar y qué reglas seguir');",
    to: "    if (covered < 0) problems.push('no cubre qué preparar, cómo trabajar y qué reglas seguir');" },
  { id: 'the-aggregate-carries-the-paths', file: 'prompts',
    reason: 'el agregado del inventario deja de ser un agregado y lleva la lista de archivos con sus rutas',
    from: "  return {\n    total: inventory?.files?.length ?? 0,",
    to: "  return {\n    files: inventory?.files ?? [],\n    total: inventory?.files?.length ?? 0," },
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

const run = (suite) => {
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

const originals = {};
for (const [name, file] of Object.entries(targets)) originals[name] = await readFile(file, 'utf8');
const record = { date: new Date().toISOString(),
  targets: Object.fromEntries(Object.entries(targets).map(([name, file]) => [name, path.relative(companion, file).split(path.sep).join('/')])),
  note: 'La detección se atribuye a la prueba que falló, no al código de salida.', mutations: [] };
try {
  // Two named targets can be the same file read for different reasons, and several targets can share one suite,
  // so the baseline runs each distinct suite once instead of once per target.
  for (const suite of new Set(Object.values(suites))) {
    const baseline = run(suite);
    assert.equal(baseline.status, 0, `${suite} tiene que pasar sin mutar: ${baseline.failed.join(', ')}`);
  }
  record.baseline = { suites: [...new Set(Object.values(suites))] };
  for (const mutation of MUTATIONS) {
    const which = mutation.file ?? 'service';
    const file = targets[which], original = originals[which];
    assert.ok(original.includes(mutation.from), `La mutación ${mutation.id} no encontró su punto de inserción.`);
    await writeFile(file, original.replace(mutation.from, mutation.to));
    const result = run(suites[which]);
    record.mutations.push({ id: mutation.id, target: which, reason: mutation.reason,
      detected: result.failed.length > 0, caughtBy: result.failed, exitCode: result.status,
      by: result.failed.length ? null : result.crashed ? 'la suite no pudo ejecutarse' : 'ninguna prueba falló' });
    await writeFile(file, original);
  }
} finally {
  for (const [name, file] of Object.entries(targets)) await writeFile(file, originals[name]);
}
record.restored = (await Promise.all(Object.entries(targets)
  .map(async ([name, file]) => (await readFile(file, 'utf8')) === originals[name]))).every(Boolean);
record.summary = { mutations: record.mutations.length,
  detected: record.mutations.filter(entry => entry.detected).length, restored: record.restored };
await writeFile(path.join(output, 'service-mutations.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify(record.summary, null, 2));
const missed = record.mutations.filter(entry => !entry.detected);
if (missed.length || !record.restored) {
  console.error(JSON.stringify(missed.map(entry => `${entry.id}: ${entry.by}`), null, 2));
  process.exitCode = 1;
}
