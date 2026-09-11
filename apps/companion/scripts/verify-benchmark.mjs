import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, readdir, rm, realpath, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { zipSync, strToU8 } from 'fflate';

// Compares two retrieval methods over the same corpus and the same question set, using the INSTALLED
// application for the prepared method. It compares retrieval, not products and not people.
//
// What it measures: whether the expected source is surfaced, how many bytes the method returns, how
// many files must be opened, and whether the result carries a locator that can be checked against the
// original. Preparation is measured in time and in bytes written.
//
// What it does not measure: model token usage, which is not exposed here and is reported as not
// measured rather than estimated from bytes. Nothing about hallucinations is claimed: the method
// cannot observe them.
//
//   node scripts/verify-benchmark.mjs "<installed resources/app>" "<evidence directory>"
const [installedRoot, output] = process.argv.slice(2);
assert(installedRoot && output, 'Supply the installed resources/app directory and an evidence directory.');
await mkdir(output, { recursive: true });

const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
const { createDesktopService } = await load('desktop/service.mjs');

function pdf(pages) {
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
  const kids = [];
  for (const lines of pages) {
    const stream = lines.map((text, index) => `BT /F1 12 Tf 40 ${720 - index * 24} Td (${text.replace(/[()\\]/g, '\\$&')}) Tj ET`).join('\n');
    const n = objects.length + 1;
    kids.push(`${n} 0 R`);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${n + 1} 0 R >>`,
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
  }
  objects[1] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let out = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((value, index) => { offsets.push(Buffer.byteLength(out)); out += `${index + 1} 0 obj\n${value}\nendobj\n`; });
  const start = Buffer.byteLength(out);
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets.slice(1).map(n => `${String(n).padStart(10, '0')} 00000 n \n`).join('') +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`;
  return Buffer.from(out);
}
function docx(paragraphs) {
  const xml = '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
    paragraphs.map(text => `<w:p><w:r><w:t>${text}</w:t></w:r></w:p>`).join('') + '</w:body></w:document>';
  return Buffer.from(zipSync({ 'word/document.xml': strToU8(xml) }));
}

// The corpus mixes what a person actually keeps: notes, a specification, a report as a PDF and a
// protocol as a Word document. The questions have a single known source each.
const CORPUS = {
  'notas.txt': 'Reunion del lunes. Se acordo publicar el resumen antes del viernes.\n' +
    'El responsable de cada acuerdo queda anotado junto al acuerdo.\n' +
    'Pendiente: confirmar quien firma la version final.\n'.repeat(3),
  'especificacion.md': '# Especificacion\n\n' +
    'El limite de reintentos es tres, despues de los cuales la operacion se declara incompleta.\n' +
    'La operacion conserva el trabajo ya terminado y ofrece reintentar.\n' +
    'El identificador de cada operacion se registra con su fecha.\n'.repeat(4),
  'decisiones.md': '# Decisiones\n\n' +
    'Se eligio almacenamiento local porque el proyecto no admite servicios de pago obligatorios.\n' +
    'La alternativa evaluada fue un servicio gestionado, descartada por costo y dependencia.\n'.repeat(4),
  'registro.log': Array.from({ length: 120 }, (_, index) => `2026-09-${String((index % 28) + 1).padStart(2, '0')} operacion ${index} completada`).join('\n') + '\n',
};
const PDF_PAGES = [
  ['Informe de resultados', 'El grupo de control incluye treinta participantes.'],
  ['La medicion se repitio con el mismo instrumento calibrado cada semana.', 'El margen de error declarado es de dos por ciento.'],
];
const DOCX_PARAGRAPHS = [
  'Protocolo de revision',
  'Cada revision independiente registra su veredicto antes de integrar.',
  'Un hallazgo bloqueante detiene la integracion hasta resolverlo.',
];

const QUESTIONS = [
  { id: 'acuerdo-resumen', query: 'resumen', source: 'notas.txt', answer: 'antes del viernes' },
  { id: 'limite-reintentos', query: 'reintentos', source: 'especificacion.md', answer: 'tres' },
  { id: 'motivo-almacenamiento', query: 'almacenamiento', source: 'decisiones.md', answer: 'servicios de pago' },
  { id: 'alternativa-descartada', query: 'alternativa', source: 'decisiones.md', answer: 'servicio gestionado' },
  { id: 'tamano-grupo', query: 'participantes', source: 'informe.pdf', answer: 'treinta' },
  { id: 'instrumento', query: 'instrumento', source: 'informe.pdf', answer: 'calibrado' },
  { id: 'margen-error', query: 'margen', source: 'informe.pdf', answer: 'dos por ciento' },
  { id: 'veredicto-revision', query: 'veredicto', source: 'protocolo.docx', answer: 'antes de integrar' },
  { id: 'hallazgo-bloqueante', query: 'bloqueante', source: 'protocolo.docx', answer: 'detiene la integracion' },
  { id: 'operacion-incompleta', query: 'incompleta', source: 'especificacion.md', answer: 'se declara incompleta' },
];

const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-benchmark-')));
const root = path.join(temp, 'corpus');
await mkdir(root);
for (const [name, content] of Object.entries(CORPUS)) await writeFile(path.join(root, name), content);
await writeFile(path.join(root, 'informe.pdf'), pdf(PDF_PAGES));
await writeFile(path.join(root, 'protocolo.docx'), docx(DOCX_PARAGRAPHS));

async function corpusFiles(directory, relative = '', found = []) {
  for (const entry of await readdir(path.join(directory, relative), { withFileTypes: true })) {
    const next = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) { if (!next.startsWith('.project-os')) await corpusFiles(directory, next, found); }
    else found.push(next);
  }
  return found;
}
const files = await corpusFiles(root);
const sizes = new Map();
for (const relative of files) sizes.set(relative, (await stat(path.join(root, relative))).size);
const corpusBytes = [...sizes.values()].reduce((total, value) => total + value, 0);

// Every file decoded as UTF-8 with no parser at all. This is what a method without a parser actually
// receives. Readability is measured, never assumed from the extension: deciding by extension would be
// deciding the comparison in advance. On this corpus the PDF carries its text streams uncompressed, so
// a byte scan does read it; the Word document is deflated, so it does not.
const decoded = new Map();
for (const relative of files) decoded.set(relative, (await readFile(path.join(root, relative))).toString('utf8'));
const corpusText = files.map(relative => decoded.get(relative)).join('\n');
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());
const readableSource = question => contains(decoded.get(question.source) ?? '', question.answer);

// Baseline one: open every file and keep everything. The upper bound a method without an index pays.
const readEverything = { id: 'read-all', description: 'Abrir todos los archivos del corpus para estar seguro',
  bytesRead: corpusBytes };
readEverything.perQuestion = QUESTIONS.map(question => {
  const answerPresent = contains(corpusText, question.answer);
  return {
    id: question.id,
    // It returns the whole corpus, so the expected source is always among what came back. That is not a
    // retrieval result: it does not discriminate between sources, and the summary says so rather than
    // letting a trivial 10/10 read as a score.
    found: true, discriminates: false,
    answerPresent, readable: readableSource(question),
    contextBytes: corpusBytes, filesOpened: files.length,
    // Whoever opened the files knows which file each answer came from, but not where inside it.
    locator: answerPresent, locatorKind: 'file',
  };
});

// Baseline two: a literal scan over the bytes of the same files, returning matching lines with their
// file and line number. This is `grep -a -n -r`, which is what a competent agent with a shell runs. It
// reads every file, including the ones a parser would be needed to render.
const literal = { id: 'literal-scan', description: 'Barrido literal sobre los bytes de los mismos archivos, como grep -a -n -r',
  bytesRead: corpusBytes };
literal.perQuestion = [];
for (const question of QUESTIONS) {
  const term = question.query.toLowerCase();
  const returned = [];
  let opened = 0, found = false;
  for (const relative of files) {
    opened++;
    const lines = (decoded.get(relative) ?? '').split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!line.toLowerCase().includes(term)) return;
      // grep prints the file and the line number with every match, so the locator costs nothing extra
      // and is counted for the baseline exactly as it is counted for the prepared context.
      returned.push(`${relative}:${index + 1}:${line}`);
      if (relative === question.source) found = true;
    });
  }
  const text = returned.join('\n');
  const answerPresent = contains(text, question.answer);
  literal.perQuestion.push({ id: question.id, found, answerPresent, readable: readableSource(question),
    contextBytes: Buffer.byteLength(text), filesOpened: opened,
    locator: answerPresent, locatorKind: 'file-line' });
}

// The prepared method: the installed application's own preparation and search.
const service = await createDesktopService({ dataRoot: path.join(temp, 'history'), core,
  chooseFolder: async () => root, copyText: () => {}, openExternal: () => {} });
const project = await service.chooseFolder();
const preparationStarted = performance.now();
const base = await service.previewBase({ id: project.id, selection: { name: 'Corpus de medicion',
  role: 'researcher', goal: 'Responder preguntas con fuentes verificables', profile: 'research',
  experience: 'guided', agents: ['web'] } });
await service.applyBase({ plan: base.id });
const context = await service.previewContext({ id: project.id });
await service.applyContext({ plan: context.id });
const preparationMs = Math.round(performance.now() - preparationStarted);
async function written(directory, total = 0) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const next = path.join(directory, entry.name);
    total = entry.isDirectory() ? await written(next, total) : total + (await stat(next)).size;
  }
  return total;
}
const preparationBytes = await written(path.join(root, '.project-os'));

// The prepared method does not open the sources, but it is not free: it reads the index the application
// wrote. Counting that as zero files and zero bytes would flatter it, so both are measured.
async function indexTree(directory, seen = { files: 0, bytes: 0 }) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const next = path.join(directory, entry.name);
    if (entry.isDirectory()) await indexTree(next, seen);
    else { seen.files += 1; seen.bytes += (await stat(next)).size; }
  }
  return seen;
}
const index = await indexTree(path.join(root, '.project-os/companion/context'));

const prepared = { id: 'prepared-context', description: 'Busqueda sobre el contexto preparado por la aplicacion instalada',
  bytesRead: index.bytes };
prepared.perQuestion = [];
for (const question of QUESTIONS) {
  const result = await service.search({ id: project.id, query: question.query });
  const hits = result.hits ?? [];
  const bytes = hits.reduce((total, hit) => total + Buffer.byteLength(hit.text), 0);
  const match = hits.find(hit => hit.path === question.source);
  const answerPresent = Boolean(match && contains(match.text, question.answer));
  prepared.perQuestion.push({ id: question.id, found: Boolean(match), discriminates: true,
    answerPresent, readable: true, contextBytes: bytes, filesOpened: index.files,
    locator: answerPresent && Boolean(match.kind) && Number.isInteger(match.start),
    locatorKind: 'passage', locatorText: match ? `${match.kind} ${match.start}` : null });
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length / 2;
  return sorted.length % 2 ? sorted[Math.floor(middle)] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function summarize(method) {
  const entries = method.perQuestion;
  return {
    id: method.id, description: method.description,
    questions: entries.length,
    surfacedExpectedSource: entries.filter(entry => entry.found).length,
    // A method that returns everything surfaces the expected source by construction. Saying so beside
    // the number stops a trivial 10/10 from being read as a retrieval score.
    discriminates: entries.every(entry => entry.discriminates !== false),
    // The strictest count, and the one the published comparison leads with: the method returned text
    // that actually contains the known answer. Surfacing a file is not answering a question.
    answerInReturnedText: entries.filter(entry => entry.answerPresent).length,
    sourceReadableWithoutAParser: entries.filter(entry => entry.readable).length,
    withLocator: entries.filter(entry => entry.locator).length,
    locatorKind: [...new Set(entries.map(entry => entry.locatorKind))].join('+'),
    contextBytesTotal: entries.reduce((total, entry) => total + entry.contextBytes, 0),
    contextBytesMedian: median(entries.map(entry => entry.contextBytes)),
    // What the method had to read to produce those answers, which is not the same as what it returned.
    bytesReadPerQuestion: method.bytesRead,
    filesOpenedTotal: entries.reduce((total, entry) => total + entry.filesOpened, 0),
  };
}

const summaries = [summarize(readEverything), summarize(literal), summarize(prepared)];
const preparedSummary = summaries.find(entry => entry.id === 'prepared-context');
// Real assertions, so this script can fail. They cover the claims the product makes about itself; they
// deliberately do not assert that a baseline loses, because a measurement that cannot come out against
// the product is not a measurement.
assert.equal(preparedSummary.answerInReturnedText, QUESTIONS.length,
  'El contexto preparado dejo de devolver la respuesta conocida en alguna pregunta.');
assert.equal(preparedSummary.withLocator, QUESTIONS.length,
  'El contexto preparado dejo de devolver un localizador comprobable en alguna pregunta.');
assert.equal(preparedSummary.surfacedExpectedSource, QUESTIONS.length,
  'El contexto preparado dejo de encontrar la fuente correcta en alguna pregunta.');
assert.ok(preparationBytes > 0 && preparationMs > 0, 'La preparacion no registro costo alguno.');
for (const summary of summaries) {
  assert.ok(summary.answerInReturnedText <= summary.questions, `${summary.id} reporta mas respuestas que preguntas.`);
  assert.ok(summary.withLocator <= summary.answerInReturnedText,
    `${summary.id} reporta localizadores para respuestas que no devolvio.`);
}

const report = {
  date: new Date().toISOString(),
  application: JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8')).version,
  machine: `${process.platform}-${process.arch}`,
  corpus: { files: files.length, bytes: corpusBytes, sizes: Object.fromEntries(sizes) },
  questions: QUESTIONS.map(({ id, query, source, answer }) => ({ id, query, source, answer })),
  preparation: { elapsedMs: preparationMs, bytesWritten: preparationBytes,
    note: 'Costo pagado una vez por proyecto. Se vuelve a pagar cuando las fuentes cambian.' },
  methods: summaries,
  raw: { readEverything: readEverything.perQuestion, literal: literal.perQuestion, prepared: prepared.perQuestion },
  notMeasured: {
    modelTokenUsage: 'No lo expone esta medicion. No se estima a partir de bytes.',
    answerQualityByAModel: 'No se evalua: seria juez y parte, y no es reproducible.',
    hallucinations: 'El metodo no puede observarlas. No se afirma nada sobre ellas.',
    otherProducts: 'No se compara con otro producto.',
  },
  limits: [
    'Compara metodos de recuperacion sobre un corpus sintetico, no dos productos ni dos personas.',
    'Un corpus de este tamano no predice el comportamiento en repositorios grandes.',
    'El PDF de este corpus lleva sus flujos de texto sin comprimir, asi que un barrido literal si lo lee. Con un PDF comprimido o escaneado el resultado seria otro.',
    'El documento de Word si es opaco a un barrido literal: sus partes van deflacionadas.',
    'Las tres vias leen el corpus completo o un indice de tamano comparable. Difieren en lo que devuelven, no en lo que leen.',
    'Los bytes son bytes. No son tokens y no se presentan como tokens.',
  ],
};
await writeFile(path.join(output, 'benchmark.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ corpus: report.corpus.bytes, preparation: report.preparation, methods: report.methods }, null, 2));
await rm(temp, { recursive: true, force: true });
