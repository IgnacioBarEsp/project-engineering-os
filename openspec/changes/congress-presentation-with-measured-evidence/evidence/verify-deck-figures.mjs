// Comprueba que cada cifra del guion del congreso sale de un registro, y que el registro dice lo mismo.
// Es la regla del mazo hecha ejecutable: si una cifra no se puede recalcular desde su fuente, no entra en una
// diapositiva.
//
//   node verify-deck-figures.mjs <repositorio> <salida.json>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [repoArgument, out] = process.argv.slice(2);
const repo = path.resolve(repoArgument);
const read = (relative) => readFileSync(path.join(repo, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));

const DECK = 'docs/presentations/2026-09-24-congreso.md';
const ARCHIVE = 'openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence';
const deck = read(DECK);

const evaluation = json(`${ARCHIVE}/flow-comparison/evaluation.json`);
const timing = json(`${ARCHIVE}/flow-comparison/timing.json`);
const measurement = json(`${ARCHIVE}/after/run-02/measurement.json`);
const kubernetes = json(`${ARCHIVE}/after/run-02/kubernetes-website.json`);
const cpython = json(`${ARCHIVE}/after/run-02/cpython.json`);
const start = json(`${ARCHIVE}/after/documented-start.json`);
const contrast = json(`${ARCHIVE}/after/harness-contrast-detail.json`);
const evidencePage = read('docs/companion/EVIDENCE.md');

const arm = (name) => evaluation.arms[name];
const passes = (name) => arm(name).legitimateTotal - arm(name).legitimateRejected;
const contrastLines = [...contrast.assertion.matchAll(/\+\s+'([^']+)'/g)].map((match) => match[1]);
const unreachable = contrastLines.filter((line) => /no se puede pulsar/.test(line));
const distinctControls = new Set(unreachable.map((line) => line.split(': ')[1].split(' no se puede')[0]));
const preparedAnswers = (report) => report.methods.find((method) => method.id === 'prepared-context').questionsAnsweredEveryTime;
const literalAnswers = (report) => report.methods.find((method) => method.id === 'literal-scan').questionsAnsweredEveryTime;

// Cada entrada: qué afirma el guion, qué dice el registro y dónde. `shown` es el texto que la diapositiva
// enseña; tiene que aparecer literalmente en el guion.
const claims = [
  { id: 'via-a-frases', shown: '33 de 34', value: `${passes('via-a')} de ${arm('via-a').legitimateTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'via-a-marcadores', shown: '19 de 19', value: `${arm('via-a').markersRejected} de ${arm('via-a').markersTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'via-b-frases', shown: '34 de 34', value: `${passes('via-b')} de ${arm('via-b').legitimateTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'via-b-marcadores', shown: '18 de 19', value: `${arm('via-b').markersRejected} de ${arm('via-b').markersTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'base-frases', shown: '2 de 34', value: `${passes('base')} de ${arm('base').legitimateTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'base-marcadores', shown: '16 de 19', value: `${arm('base').markersRejected} de ${arm('base').markersTotal}`, source: 'flow-comparison/evaluation.json' },
  { id: 'via-a-reloj', shown: '8 minutos 44 segundos', value: `8 minutos 44 segundos`, source: 'flow-comparison/timing.json',
    check: () => Math.round(timing.vias.A.elapsedMs / 1000) === 8 * 60 + 44 },
  { id: 'via-b-reloj', shown: '31 minutos 3 segundos', value: '31 minutos 3 segundos', source: 'flow-comparison/timing.json',
    check: () => Math.round(timing.vias.B.elapsedMs / 1000) === 31 * 60 + 3 },
  { id: 'preparado-kubernetes', shown: '0 de 20', value: `${preparedAnswers(kubernetes)}+${preparedAnswers(cpython)} de 20`,
    source: 'run-02/kubernetes-website.json y cpython.json',
    check: () => preparedAnswers(kubernetes) === 0 && preparedAnswers(cpython) === 0 },
  { id: 'literal-veinte', shown: '20 de 20', value: `${literalAnswers(kubernetes) + literalAnswers(cpython)} de 20`,
    source: 'run-02/kubernetes-website.json y cpython.json',
    check: () => literalAnswers(kubernetes) + literalAnswers(cpython) === 20 },
  { id: 'fuentes-indexadas', shown: '45 de 2654', value: `${kubernetes.preparation.coverage.indexed} de ${kubernetes.preparation.coverage.sources}`,
    source: 'run-02/kubernetes-website.json' },
  { id: 'version-medida', shown: 'versión publicada de hoy', value: measurement.application.version, source: 'run-02/measurement.json',
    check: () => measurement.application.version === '0.3.2' },
  { id: 'contraste-hallazgos', shown: '**360**', value: String(contrastLines.length), source: 'after/harness-contrast-detail.json',
    check: () => contrastLines.length === 360 },
  { id: 'contraste-controles', shown: 'siete botones', value: `${distinctControls.size} controles distintos`, source: 'after/harness-contrast-detail.json',
    check: () => distinctControls.size === 7 },
  { id: 'arranque-pasos', shown: 'código 0', value: `${start.summary.passed} de ${start.summary.documentedSteps} pasos`,
    source: 'after/documented-start.json',
    check: () => start.summary.passed === start.summary.documentedSteps && start.summary.verdict === 'PASS' },
  { id: 'microcorpus', shown: '**10 de 10**', value: 'la página de evidencia publica 10 / 10 para el contexto preparado',
    source: 'docs/companion/EVIDENCE.md',
    check: () => /\| Contexto preparado por la app \| \*\*10 \/ 10\*\* \| \*\*10 \/ 10\*\*/.test(evidencePage) },
];

const failures = [];
for (const claim of claims) {
  if (!deck.includes(claim.shown)) {
    failures.push(`${claim.id}: el guion no enseña «${claim.shown}»`);
    continue;
  }
  const ok = claim.check ? claim.check() : deck.includes(claim.value);
  if (!ok) failures.push(`${claim.id}: el registro ${claim.source} no confirma «${claim.shown}» (dice ${claim.value})`);
}

// La tabla de procedencia del guion tiene que existir y nombrar los registros que se usan.
for (const marker of ['De dónde sale cada cifra', 'flow-comparison', 'harness-contrast', 'EVIDENCE.md']) {
  if (!deck.includes(marker)) failures.push(`la tabla de procedencia no menciona «${marker}»`);
}

// La regla simétrica: si aparece el número bueno, aparece el adverso.
if (deck.includes('10 de 10') && !deck.includes('0 de 20')) {
  failures.push('el guion presenta el microcorpus sin el resultado de los repositorios grandes');
}

const record = { schemaVersion: 1, date: new Date().toISOString(), deck: DECK,
  claims: claims.map(({ id, shown, source }) => ({ id, shown, source })),
  checked: claims.length, failures,
  summary: { checked: claims.length, failures: failures.length, verdict: failures.length ? 'FAIL' : 'PASS' } };
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(path.resolve(out), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify(record.summary, null, 2));
if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1; }
