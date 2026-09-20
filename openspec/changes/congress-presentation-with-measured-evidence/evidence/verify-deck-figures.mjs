// Comprueba que cada cifra del guion del congreso sale de un registro, y que el registro dice lo mismo.
// Es la regla del mazo hecha ejecutable: si una cifra no se puede recalcular desde su fuente, no entra en una
// diapositiva.
//
// Cada afirmación declara en qué diapositiva aparece, y la cifra se busca **dentro de esa diapositiva**, no en
// cualquier parte del guion. Buscar en todo el documento permitía que la cifra de una columna satisficiera la
// comprobación de otra: con eso, un registro que dijera que una vía no arregló nada seguía dando PASS.
//
//   node verify-deck-figures.mjs <repositorio> <salida.json>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [repoArgument, out] = process.argv.slice(2);
if (!repoArgument || !out) {
  console.error('Uso: node verify-deck-figures.mjs <repositorio> <salida.json>');
  process.exit(2);
}
const repo = path.resolve(repoArgument);
const read = (relative) => readFileSync(path.join(repo, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));

const DECK = 'docs/presentations/2026-09-24-congreso.md';
const ARCHIVE = 'openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence';
const NUMBERED = 20;      // las de la charla
const LIMITS = 21;        // la de límites, para el final o para preguntas
const PROVENANCE = 22;    // la tabla de procedencia
const SLIDES = PROVENANCE;
const deck = read(DECK);

// El guion partido por diapositivas: `## 13. Demo A…` abre la 13 y la cierra la siguiente cabecera. Las dos
// últimas no van numeradas en el guion, pero son diapositivas del mazo y se comprueban como tales.
const sections = new Map();
let current = null;
for (const line of deck.split('\n')) {
  const heading = line.match(/^## (\d+)\.\s/);
  if (heading) current = Number(heading[1]);
  else if (/^## /.test(line)) {
    if (/límites/i.test(line)) current = LIMITS;
    else if (/de dónde sale cada cifra/i.test(line)) current = PROVENANCE;
    else current = null;
  }
  if (current) sections.set(current, (sections.get(current) ?? '') + line + '\n');
}
const slide = (number) => sections.get(number) ?? '';

const evaluation = json(`${ARCHIVE}/flow-comparison/evaluation.json`);
const timing = json(`${ARCHIVE}/flow-comparison/timing.json`);
const resultado = read(`${ARCHIVE}/flow-comparison/resultado.md`);
const promptA = read(`${ARCHIVE}/flow-comparison/prompt-via-a.md`);
const promptB = read(`${ARCHIVE}/flow-comparison/prompt-via-b.md`);
const measurement = json(`${ARCHIVE}/after/run-02/measurement.json`);
const kubernetes = json(`${ARCHIVE}/after/run-02/kubernetes-website.json`);
const cpython = json(`${ARCHIVE}/after/run-02/cpython.json`);
const start = json(`${ARCHIVE}/after/documented-start.json`);
const contrast = json(`${ARCHIVE}/after/harness-contrast-detail.json`);
const contrastRun = json(`${ARCHIVE}/after/harness-contrast.json`);
const evidencePage = read('docs/companion/EVIDENCE.md');

const arm = (name) => evaluation.arms[name];
const passes = (name) => `${arm(name).legitimateTotal - arm(name).legitimateRejected} de ${arm(name).legitimateTotal}`;
const markers = (name) => `${arm(name).markersRejected} de ${arm(name).markersTotal}`;
const answers = (report, method) => report.methods.find((entry) => entry.id === method).questionsAnsweredEveryTime;
const both = (method) => `${answers(kubernetes, method) + answers(cpython, method)} de 20`;
const coverage = (report) => `${report.preparation.coverage.indexed} de ${report.preparation.coverage.sources}`;
const minutes = (ms) => {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)} min ${String(total % 60).padStart(2, '0')} s`;
};
const contrastLines = [...contrast.assertion.matchAll(/\+\s+'([^']+)'/g)].map((match) => match[1]);
const unreachable = contrastLines.filter((line) => /no se puede pulsar/.test(line));
const distinctControls = new Set(unreachable.map((line) => line.split(': ')[1].split(' no se puede')[0]));
const distinctMessages = new Set(contrastLines.map((line) => line.split(' · ').slice(1).join(' · ')));
const contexts = new Set(contrastLines.map((line) => line.split(' · ')[0]));
const coveredByBarrier = unreachable.filter((line) => /div\.actions/.test(line)).length;

// `shown` es lo que el guion enseña y `value` lo que dice el registro: tienen que ser la misma cadena, y tiene
// que aparecer en la diapositiva declarada. Así, si el registro cambia, la comprobación falla.
const claims = [
  { id: 'via-a-frases', slide: 13, shown: '33 de 34', value: passes('via-a') },
  { id: 'via-a-marcadores', slide: 13, shown: '19 marcadores', value: `${arm('via-a').markersRejected} marcadores` },
  { id: 'via-a-reloj', slide: 13, shown: '8 minutos 44 segundos', value: minutes(timing.vias.A.elapsedMs).replace('min', 'minutos').replace(' s', ' segundos').replace('44', '44') },
  { id: 'via-a-archivos', slide: 13, shown: '2 archivos, 111 líneas añadidas y 14 borradas',
    value: '2 archivos, 111 líneas añadidas y 14 borradas',
    check: () => resultado.includes('111 añadidas, 14 borradas') },
  { id: 'via-b-frases', slide: 14, shown: '34 de 34', value: passes('via-b') },
  { id: 'via-b-marcadores', slide: 14, shown: '18 de 19', value: markers('via-b') },
  { id: 'via-b-reloj', slide: 14, shown: '31 minutos 3 segundos',
    value: '31 minutos 3 segundos', check: () => Math.round(timing.vias.B.elapsedMs / 1000) === 31 * 60 + 3 },
  { id: 'via-b-archivos', slide: 14, shown: '28 archivos, 1822 líneas añadidas y 4 borradas',
    value: '28 archivos, 1822 líneas añadidas y 4 borradas',
    check: () => resultado.includes('1822 añadidas, 4 borradas') },
  { id: 'parrafo-literal', slide: 13, shown: 'las marca\n> como plantilla sin rellenar. Arréglalo.',
    value: 'el párrafo literal de los dos prompts',
    check: () => {
      const paragraph = promptA.split('---')[1].trim().split('\n\n')[0].replace(/\s+/g, ' ');
      const inDeck = slide(13).replace(/^> ?/gm, '').replace(/\s+/g, ' ');
      return inDeck.includes(paragraph) && promptB.includes('Sigue el flujo completo del repositorio');
    } },
  { id: 'base-frases', slide: 15, shown: '2 de 34', value: passes('base') },
  { id: 'base-marcadores', slide: 15, shown: '16 de 19', value: markers('base') },
  { id: 'microcorpus', slide: 16, shown: '6812 bytes', value: '6812 bytes',
    check: () => /\| Contexto preparado por la app \| \*\*10 \/ 10\*\* \| \*\*10 \/ 10\*\*/.test(evidencePage)
      && evidencePage.includes('6812 bytes') && slide(16).includes('10 de 10') && slide(16).includes('8 de 10') },
  { id: 'abrir-todo', slide: 17, shown: '| Abrir todo el corpus | **20 de 20** |', value: both('read-all'),
    check: () => both('read-all') === '20 de 20' && slide(17).includes('| Abrir todo el corpus | **20 de 20** |') },
  { id: 'literal', slide: 17, shown: '| Buscar literal, `grep` | **20 de 20** |', value: both('literal-scan'),
    check: () => both('literal-scan') === '20 de 20' },
  { id: 'preparado', slide: 17, shown: '| Contexto preparado | **0 de 20** |', value: both('prepared-context'),
    check: () => both('prepared-context') === '0 de 20' },
  { id: 'cobertura-kubernetes', slide: 17, shown: '45 de 2654', value: coverage(kubernetes) },
  { id: 'cobertura-cpython', slide: 17, shown: '42 de 2753', value: coverage(cpython) },
  { id: 'version-medida', slide: 17, shown: 'la versión publicada de hoy', value: '0.3.2',
    check: () => measurement.application.version === '0.3.2' && evidencePage.includes('versión 0.3.2 instalada') },
  { id: 'contraste-mensajes', slide: 18, shown: '66\nproblemas distintos', value: String(distinctMessages.size),
    check: () => distinctMessages.size === 66 && slide(18).includes('problemas distintos') },
  { id: 'contraste-contextos', slide: 18, shown: '23 combinaciones', value: `${contexts.size} combinaciones` },
  { id: 'contraste-renglones', slide: 18, shown: '360 renglones', value: `${contrastLines.length} renglones` },
  { id: 'contraste-cero', slide: 18, shown: 'con cero hallazgos', value: 'cero hallazgos',
    check: () => contrastRun.summary.findings === 0 && contrastRun.runs.some((run) => run.label.startsWith('arnes-de-a3b1efd') && run.passed) },
  { id: 'contraste-controles', slide: 18, shown: 'siete controles', value: `${distinctControls.size} controles`,
    check: () => distinctControls.size === 7 },
  { id: 'contraste-barra', slide: 18, shown: 'en seis de los siete', value: `${coveredByBarrier} de ${unreachable.length}`,
    check: () => coveredByBarrier === 36 && unreachable.length === 42 },
  { id: 'arranque-pasos', slide: 19, shown: 'seis pasos', value: `${start.summary.documentedSteps} pasos`,
    check: () => start.summary.documentedSteps === 6 && start.summary.passed === 6 && start.summary.verdict === 'PASS' },
  { id: 'arranque-doctor', slide: 19, shown: '29 comprobaciones', value: `${start.doctor.checks} comprobaciones`,
    check: () => start.doctor.checks === 29 && start.doctor.fails.length === 0 },
];

const failures = [];
for (const claim of claims) {
  const where = slide(claim.slide);
  if (!where) { failures.push(`${claim.id}: no existe la diapositiva ${claim.slide}`); continue; }
  if (!where.includes(claim.shown.split('\n')[0])) {
    failures.push(`${claim.id}: la diapositiva ${claim.slide} no enseña «${claim.shown.split('\n')[0]}»`);
    continue;
  }
  const ok = claim.check ? claim.check() : claim.shown === claim.value;
  if (!ok) failures.push(`${claim.id}: el registro dice «${claim.value}» y la diapositiva ${claim.slide} enseña «${claim.shown.split('\n')[0]}»`);
}

// El guion tiene que ser un guion, no una lista de cifras que satisfaga las comprobaciones.
const numbered = [...deck.matchAll(/^## (\d+)\.\s/gm)].map((match) => Number(match[1]));
if (numbered.length !== NUMBERED) failures.push(`el guion tiene ${numbered.length} diapositivas numeradas y deberían ser ${NUMBERED}`);
if (!sections.has(LIMITS)) failures.push('falta la diapositiva de límites');
if (!sections.has(PROVENANCE)) failures.push('falta la diapositiva de procedencia');

// La regla simétrica, atada a su sitio: el resultado adverso vive en la 17, no en una nota al pie.
if (!slide(17).includes('0 de 20')) failures.push('la diapositiva 17 no presenta el resultado adverso');
if (!slide(16).includes('10 de 10')) failures.push('la diapositiva 16 no presenta el microcorpus');

// Lo que no se midió tiene que estar declarado.
for (const limit of ['tokens', 'Alucinaciones', 'otros productos', 'Ahorro de tiempo']) {
  if (!slide(LIMITS).includes(limit)) failures.push(`la diapositiva de límites no declara «${limit}»`);
}

// Y la tabla de procedencia tiene que nombrar sus fuentes, en su propia diapositiva.
for (const marker of ['flow-comparison', 'harness-contrast', 'EVIDENCE.md', 'run-02']) {
  if (!slide(PROVENANCE).includes(marker)) failures.push(`la tabla de procedencia no menciona «${marker}»`);
}

const record = { schemaVersion: 1, date: new Date().toISOString(), deck: DECK, slides: SLIDES,
  claims: claims.map(({ id, slide: number, shown }) => ({ id, slide: number, shown: shown.split('\n')[0] })),
  checked: claims.length, failures,
  summary: { checked: claims.length, failures: failures.length, verdict: failures.length ? 'FAIL' : 'PASS' } };
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(path.resolve(out), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1; }
