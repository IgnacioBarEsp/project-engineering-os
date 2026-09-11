import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, readdir, cp, rm, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { zipSync, strToU8 } from 'fflate';
import { portable } from './portable-path.mjs';

// Runs the complete journey for the five profiles against an INSTALLED application, through its own
// service layer with native capabilities injected the same way the browser journeys inject them.
// This exercises the installed engines, the installed core and the managed runtimes this machine
// downloads. It does not exercise the interface, and it is not a person using the product: the record
// says so, and nothing here should be read as a study with users.
//
//   node scripts/verify-journeys.mjs "<installed resources/app>" "<evidence directory>" [--offline]
const [installedRoot, output, ...flags] = process.argv.slice(2);
assert(installedRoot && output, 'Supply the installed resources/app directory and an evidence directory.');
const offline = flags.includes('--offline');
await mkdir(output, { recursive: true });

const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
const { createDesktopService } = await load('desktop/service.mjs');
const { createRuntimeManager } = await load('runtime/manager.mjs');
const { createEnvironmentEngine } = await load('runtime/environment.mjs');
const installedManifest = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));

const runtimeRoot = path.join(process.env.LOCALAPPDATA ?? tmpdir(), 'Project Engineering OS', 'runtimes');
// Claiming "from an empty cache" is only true of the first engineering profile: the second reuses what
// the first downloaded, exactly as a second project on the same machine would. State what was there,
// and look before the manager creates its own root, or the answer is "present" every time.
const cacheAtStart = await readdir(runtimeRoot).then(entries => entries.length ? 'populated' : 'empty', () => 'absent');
const manager = await createRuntimeManager({ root: runtimeRoot });
const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-journeys-')));
const record = { date: new Date().toISOString(),
  application: { version: installedManifest.version, root: portable(installedRoot) },
  machine: `${process.platform}-${process.arch}`, runtimeRoot: portable(runtimeRoot), cacheAtStart,
  drivenBy: 'script through the installed application service layer, with native folder choice, clipboard and external launch injected',
  notADemonstrationOf: ['the installer wizard pages', 'the application interface', 'anything a person did'],
  profiles: [], findings: [] };

function pdf(lines) {
  const stream = lines.map((text, index) => `BT /F1 12 Tf 40 ${720 - index * 24} Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`).join('\n');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [4 0 R] /Count 1 >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents 5 0 R >>',
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`];
  let out = '%PDF-1.4\n'; const offsets = [];
  objects.forEach((value, index) => { offsets.push(Buffer.byteLength(out)); out += `${index + 1} 0 obj\n${value}\nendobj\n`; });
  const start = Buffer.byteLength(out);
  out += `xref\n0 6\n0000000000 65535 f \n${offsets.map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}` +
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(out);
}

function docx(paragraphs) {
  const xml = '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraphs.map(text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`).join('') + '</w:body></w:document>';
  return Buffer.from(zipSync({ 'word/document.xml': strToU8(xml) }));
}

const PROFILES = {
  research: {
    name: 'Revision de evidencia', goal: 'Comparar como se midio el resultado en cada fuente',
    role: 'researcher', engineering: false,
    files: {
      'notas.txt': 'Pregunta de investigacion: que metodo de medicion usa cada fuente.\nEl protocolo exige registrar el instrumento antes de comparar resultados.',
      'metodo.md': '# Metodo\n\nLa medicion usa un instrumento calibrado cada semana.\nUna comparacion sin instrumento declarado no es concluyente.\n',
    },
    pdfFiles: { 'articulo.pdf': ['El grupo de control incluye treinta participantes.', 'La medicion se repitio con el mismo instrumento calibrado.'] },
    docxFiles: { 'protocolo.docx': ['El protocolo exige calibrar el instrumento antes de cada sesion.', 'Sin instrumento declarado la comparacion no es concluyente.'] },
    query: 'instrumento',
    expect: source => ['metodo.md', 'articulo.pdf', 'protocolo.docx'].includes(source),
  },
  software: {
    name: 'Servicio de presupuesto', goal: 'Entender como se calcula el presupuesto antes de cambiarlo',
    role: 'developer', engineering: true,
    files: {
      'README.md': '# Servicio de presupuesto\n\nEl calculo de presupuesto multiplica horas por tarifa.\n',
      'src/budget.js': 'export function calculateProjectBudget(hours, rate) {\n  return hours * rate;\n}\n',
      'src/report.js': 'import { calculateProjectBudget } from "./budget.js";\nexport function monthlyReport(entries) {\n  return entries.map(entry => calculateProjectBudget(entry.hours, entry.rate));\n}\n',
      'package.json': '{"name":"presupuesto-existente","version":"1.0.0","scripts":{"postinstall":"exit 99"},"dependencies":{}}\n',
      'notas.txt': 'El presupuesto se calcula multiplicando horas por tarifa.\n',
    },
    query: 'presupuesto', symbol: 'calculateProjectBudget', expect: source => source === 'README.md' || source === 'notas.txt',
  },
  unity: {
    name: 'Prototipo de juego', goal: 'Localizar como se calcula el puntaje antes de ajustarlo',
    role: 'developer', engineering: true,
    files: {
      'ProjectSettings/ProjectVersion.txt': 'm_EditorVersion: 6000.0.0f1\n',
      'Assets/Scoring.cs': 'public class ResearchGame {\n  public int ComputeScore(int evidence) { return evidence * 2; }\n}\n',
      'notas.txt': 'El puntaje se calcula duplicando la evidencia recogida en la escena.\n',
      'package.json': '{"name":"prototipo-existente","version":"0.1.0","dependencies":{}}\n',
    },
    query: 'puntaje', symbol: 'ResearchGame', expect: source => source === 'notas.txt',
  },
  media: {
    name: 'Serie de imagenes', goal: 'Conservar la receta que produjo cada pieza',
    role: 'creator', engineering: false,
    files: {
      'workflow.json': '{"prompt":"Una ilustracion original de un taller","seed":42,"steps":30}\n',
      'notas.txt': 'La receta conserva la semilla 42 para poder repetir la pieza.\n',
    },
    query: 'semilla', expect: source => source === 'notas.txt' || source === 'workflow.json',
  },
  general: {
    name: 'Trabajo de la semana', goal: 'Encontrar los acuerdos tomados sin releer todo',
    role: 'general', engineering: false,
    files: {
      'acuerdos.md': '# Acuerdos\n\nSe acordo publicar el resumen antes del viernes.\nCada acuerdo queda con su responsable.\n',
      'notas.txt': 'Pendiente: confirmar el responsable de cada acuerdo.\n',
    },
    query: 'acuerdo', expect: source => source === 'acuerdos.md' || source === 'notas.txt',
  },
};

async function build(profile, definition) {
  const root = path.join(temp, profile);
  await mkdir(root, { recursive: true });
  for (const [relative, content] of Object.entries(definition.files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  for (const [relative, lines] of Object.entries(definition.pdfFiles ?? {})) await writeFile(path.join(root, relative), pdf(lines));
  for (const [relative, lines] of Object.entries(definition.docxFiles ?? {})) await writeFile(path.join(root, relative), docx(lines));
  return root;
}

const finding = (profile, stage, detail) => { record.findings.push({ profile, stage, detail }); };

for (const [profile, definition] of Object.entries(PROFILES)) {
  const started = performance.now();
  const root = await build(profile, definition);
  const steps = [], copied = [], opened = [];
  const step = (name, result) => { steps.push({ name, result }); return result; };
  const engineering = definition.engineering && !offline;
  // Every profile gets a real engine. Passing null for the profiles without engineering would make the
  // refusal below overdetermined: the service refuses on a missing engine OR on the profile, and a test
  // that cannot tell which one fired is not testing the product.
  const environment = createEnvironmentEngine(manager);
  const service = await createDesktopService({ dataRoot: path.join(temp, `${profile}-history`), core, environment,
    chooseFolder: async () => root, copyText: value => copied.push(value), openExternal: value => opened.push(value) });

  const project = await service.chooseFolder();
  step('choose folder', { files: project.inspection.files.length, recommended: project.inspection.recommendation });
  const selection = { name: definition.name, role: definition.role, goal: definition.goal, profile,
    experience: 'guided', agents: ['web'] };
  const base = await service.previewBase({ id: project.id, selection });
  step('review preparation', { files: base.files.length });
  await service.applyBase({ plan: base.id });

  if (engineering) {
    const tools = await service.previewEnvironment({ id: project.id });
    step('review tools', { status: tools.status, downloadBytes: tools.downloadBytes, tools: tools.tools?.map(t => `${t.id}:${t.status}`) });
    if (tools.status === 'planned') {
      await service.applyEnvironment({ plan: tools.id });
      step('prepare tools', { status: 'prepared' });
      const plan = await service.previewEngineering({ id: project.id });
      step('review engineering', { status: plan.status, preserved: plan.preservedOriginals });
      if (plan.status !== 'planned') finding(profile, 'engineering', `plan status ${plan.status}`);
      else {
        await service.applyEngineering({ plan: plan.id });
        const activation = await service.previewActivation({ id: project.id });
        step('review activation', { status: activation.status, files: activation.files?.length });
        if (activation.status === 'planned') {
          const applied = await service.applyActivation({ plan: activation.id });
          step('activate workflows', { workflows: applied.result.workflows, files: applied.result.files });
          if (applied.result.workflows !== 'verified') finding(profile, 'activation', `workflows ${applied.result.workflows}`);
        } else finding(profile, 'activation', `plan status ${activation.status}`);
      }
    } else finding(profile, 'tools', `plan status ${tools.status}: ${tools.message ?? ''}`);
  }

  const context = await service.previewContext({ id: project.id });
  step('review sources', { sources: context.coverage.sources.length, chunks: context.coverage.chunks,
    managedInstructions: context.coverage.managedInstructions?.length ?? 0, complete: context.coverage.complete,
    // A partial coverage that does not say why is a number nobody can act on.
    limitations: context.coverage.limitations ?? [],
    // `complete` is false when anything was left out, and a false with no reason is unusable.
    excluded: context.coverage.excluded ?? null,
    notIndexed: (context.coverage.sources ?? []).filter(source => source.status !== 'indexed')
      .map(source => `${source.path}:${source.status}`) });
  await service.applyContext({ plan: context.id });

  const found = await service.search({ id: project.id, query: definition.query });
  const sources = [...new Set(found.hits.map(hit => hit.path))];
  step('search sources', { hits: found.hits.length, sources, locators: found.hits.map(hit => `${hit.kind} ${hit.start}`).slice(0, 3) });
  if (!found.hits.length) finding(profile, 'search', `no hits for "${definition.query}"`);
  else if (!sources.some(definition.expect)) finding(profile, 'search', `hits did not include the expected source: ${sources.join(', ')}`);

  if (engineering && record.findings.some(f => f.profile === profile)) {
    // Skipping after an earlier failure is deliberate, but a silently shorter matrix would read as a
    // profile that passed fewer stages rather than one that stopped.
    step('code map skipped', { reason: 'una etapa anterior dejo un hallazgo en este perfil' });
  } else if (engineering) {
    const map = await service.previewCode({ id: project.id });
    // The code map installs a tool of its own. The published claim is that every tool arrives with its
    // identity, licence, size and destination visible, so the record keeps what the plan disclosed.
    step('review code map', { status: map.status, files: map.coverage?.sources?.length,
      discloses: map.tools?.map(tool => `${tool.id}@${tool.version ?? '?'}:${tool.status}`) ?? [],
      downloadBytes: map.downloadBytes ?? 0 });
    if (map.status === 'planned') {
      const applied = await service.applyCode({ plan: map.id });
      step('create code map', { status: applied.status.code.status, symbols: applied.status.code.symbols });
      const symbols = await service.searchCode({ id: project.id, query: definition.symbol });
      step('search symbols', { hits: symbols.hits.map(hit => `${hit.name} ${hit.path}:${hit.start}`) });
      if (!symbols.hits.some(hit => hit.name === definition.symbol)) finding(profile, 'code map', `symbol ${definition.symbol} not found`);
    } else finding(profile, 'code map', `plan status ${map.status}: ${map.message ?? ''}`);
  }

  // Negative cases. The correct behaviour is refusal or an honest degraded state, never a silent pass.
  const negatives = {};
  const witness = Object.keys(definition.files)[0];
  const before = await readFile(path.join(root, witness));
  await writeFile(path.join(root, witness), Buffer.concat([before, Buffer.from('\ncambio posterior\n')]));
  negatives.changedSource = (await service.status({ id: project.id })).context.context;
  assert.equal(negatives.changedSource, 'stale', 'Una fuente modificada debe dejar el contexto desactualizado.');
  await assert.rejects(service.search({ id: project.id, query: definition.query }), error => error.code === 'CONTEXT_STALE');
  negatives.searchRefusedWhenStale = true;
  await writeFile(path.join(root, witness), before);
  const refreshed = await service.previewContext({ id: project.id });
  await service.applyContext({ plan: refreshed.id });
  negatives.recoveredByRegenerating = (await service.status({ id: project.id })).context.context;
  assert.equal(negatives.recoveredByRegenerating, 'current', 'Regenerar debe devolver el contexto al dia.');

  const index = path.join(root, '.project-os/companion/context/index.json');
  const saved = await readFile(index);
  await writeFile(index, 'corrupto');
  // No default. An earlier version of this journey filled in the expected answer with `?? 'requires-action'`
  // while reading a field the product leaves undefined for this case, so it printed the right-looking
  // state no matter what the product did. The degraded state lives on `status`, and that is what is read.
  const corrupt = (await service.status({ id: project.id })).context;
  negatives.corruptIndex = corrupt.context ?? corrupt.status;
  negatives.corruptIndexError = corrupt.error?.code ?? null;
  assert.notEqual(corrupt.context, 'current', 'Un indice corrupto no puede informarse al dia.');
  assert.ok(['requires-action', 'corrupt', 'requires-repair', 'not-prepared'].includes(negatives.corruptIndex),
    `Un indice corrupto debe pedir revision, no informar ${negatives.corruptIndex}.`);
  await writeFile(index, saved);
  negatives.recoveredFromCorrupt = (await service.status({ id: project.id })).context.context;
  assert.equal(negatives.recoveredFromCorrupt, 'current', 'Restaurar el indice debe recuperar el contexto.');

  if (!engineering) {
    // The engine is real here, so the refusal can only come from the profile rule. The exact code is
    // asserted: accepting any rejection would accept a crash as evidence of an honest refusal.
    await assert.rejects(service.previewEnvironment({ id: project.id }),
      error => error.code === 'ENVIRONMENT_UNAVAILABLE',
      'Un perfil sin ingenieria debe rechazar la etapa de herramientas con ENVIRONMENT_UNAVAILABLE.');
    negatives.optionalToolRefused = 'ENVIRONMENT_UNAVAILABLE';
    // The genuinely optional tool is the code map, which downloads a 52 MB binary of its own. A profile
    // that cannot use it must be refused by the product, not merely left without an engine.
    await assert.rejects(service.previewCode({ id: project.id }),
      error => error.code === 'GRAPH_PROFILE',
      'Un perfil sin codigo debe rechazar el mapa de codigo con GRAPH_PROFILE.');
    negatives.codeMapRefused = 'GRAPH_PROFILE';
    const stillUsable = await service.search({ id: project.id, query: definition.query });
    assert.ok(stillUsable.hits.length > 0, 'La busqueda documental debe seguir funcionando sin herramientas.');
    negatives.documentSearchStillUsable = true;
  }
  // A recovery that quietly rewrites the person's own files is not a recovery. Assert the sources are
  // byte-identical to how the journey found them, rather than assuming the restore was faithful.
  // A prepared project copied elsewhere. The two kinds of state must behave differently, and the
  // journey asserts the difference rather than assuming one answer for both.
  //
  // The document index is addressed by content: the copy holds the same bytes and its citations are
  // relative, so reporting it current at the new path is correct, not a leak. The code map and the
  // tool receipt are bound to a location, because they name absolute paths on this machine, and those
  // must refuse until they are reviewed again. An earlier version of this check asserted that the
  // context went stale, which would have demanded the wrong behaviour from the product.
  const moved = `${root}-movido`;
  await cp(root, moved, { recursive: true });
  const elsewhere = await createDesktopService({ dataRoot: path.join(temp, `${profile}-movido`), core, environment,
    chooseFolder: async () => moved, copyText: () => {}, openExternal: () => {} });
  const movedProject = await elsewhere.chooseFolder();
  const movedStatus = await elsewhere.status({ id: movedProject.id });
  negatives.movedProjectContext = movedStatus.context.context ?? movedStatus.context.status;
  assert.equal(negatives.movedProjectContext, 'current',
    'El indice documental se direcciona por contenido: una copia identica debe seguir al dia.');
  if (engineering) {
    negatives.movedProjectCodeMap = movedStatus.code.status;
    assert.notEqual(negatives.movedProjectCodeMap, 'verified',
      'El mapa de codigo esta atado a su ubicacion: no puede informarse verificado en la ruta nueva.');
  }
  await rm(moved, { recursive: true, force: true });

  const intact = await readFile(path.join(root, witness));
  assert.ok(intact.equals(before), 'La fuente de la persona debe quedar identica byte a byte tras recuperar.');
  negatives.sourcesByteIdenticalAfterRecovery = true;
  step('negative cases', negatives);

  const handoff = await service.handoffPreview({ id: project.id, agent: 'web' });
  step('handoff preview', { mode: handoff.mode, projectAttached: handoff.projectAttached, copied: copied.length, opened: opened.length });
  if (handoff.projectAttached !== false) finding(profile, 'handoff', 'a web handoff claimed the project was attached');

  const reopened = await createDesktopService({ dataRoot: path.join(temp, `${profile}-history`), core, environment,
    chooseFolder: async () => null, copyText: () => {}, openExternal: () => {} });
  const history = await reopened.listProjects();
  const status = await reopened.openProject({ id: history[0].id });
  step('reopen from history', { projects: history.length, base: status.base.base, context: status.context.context,
    engineering: status.engineering.files, workflows: status.engineering.workflows, code: status.code.status });

  record.profiles.push({ profile, name: definition.name, engineering, root: portable(root), steps,
    elapsedMs: Math.round(performance.now() - started) });
  console.log(`${profile}: ${steps.length} pasos, ${record.findings.filter(f => f.profile === profile).length} hallazgos`);
}

record.summary = {
  profiles: record.profiles.length,
  findings: record.findings.length,
  engineeringProfiles: record.profiles.filter(profile => profile.engineering).map(profile => profile.profile),
  scope: 'Recorrido completo por perfil sobre la aplicacion instalada, a traves de su capa de servicio. No demuestra el asistente del instalador, la interfaz, ni que una persona lo haya hecho.',
};
await writeFile(path.join(output, 'journeys.json'), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
await rm(temp, { recursive: true, force: true });
