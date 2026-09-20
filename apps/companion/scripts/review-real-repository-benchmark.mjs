import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, open, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

// Independent verifier for issue 105. It deliberately does not import the benchmark runner or its
// summarizer: sharing those decisions would let the same defect approve both measurement and review.
const exec = promisify(execFile);
const repository = fileURLToPath(new URL('../../../', import.meta.url));
const change = 'measure-prepared-context-on-real-repositories';
const precommit = 'c808967cd46abc4b340d148834a24e3005cc0247';
// El ancla era `e0a29803`, el commit de la rama que midió. La integración es por squash, así que ese commit
// no está en el historial de main y el verificador dejó de poder ejecutarse sobre lo publicado. El ancla es
// ahora el commit que publicó la corrida en main, donde la evidencia ya vive archivada (#166).
const resultCommit = 'de66a2e4a1900f70452d19efb6b37f8a82dce255';
const resultFiles = ['preflight.json', 'kubernetes-website.json', 'cpython.json', 'measurement.json'];
const protocolRelative = 'apps/companion/benchmarks/real-repositories/protocol.json';

// Este verificador nacía atado a la primera corrida. Una re-medición con el mismo protocolo congelado —que es
// lo que exige la spec cuando cambia la versión medida— también tiene que poder revisarse, así que la corrida
// y el commit que la publica se pueden indicar. Sin banderas, el comportamiento es el de siempre (#166).
//   node scripts/review-real-repository-benchmark.mjs [salida.json] [--evidence <dir>] [--result-commit <sha>]
const args = process.argv.slice(2);
const flag = name => {
  const index = args.indexOf(name);
  assert.ok(index < 0 || args[index + 1], `${name} necesita un valor.`);
  return index < 0 ? null : args[index + 1];
};
const evidenceOverride = flag('--evidence');
const resultCommitOverride = flag('--result-commit');
// Revisar otra corrida sin decir contra qué commit cotejarla buscaría sus archivos en el commit de la
// primera, y moriría con un error de git sin explicación.
assert.ok(!evidenceOverride || resultCommitOverride,
  '--evidence necesita --result-commit: el commit que introduce esa corrida.');
const outputArgument = args.filter((value, index) => !value.startsWith('--')
  && !(index > 0 && args[index - 1].startsWith('--')))[0];

async function git(args) {
  return (await exec('git', ['-C', repository, ...args], { windowsHide: true,
    maxBuffer: 16 * 1024 * 1024 })).stdout.trim();
}

async function resolveEvidence() {
  const changes = path.join(repository, 'openspec', 'changes');
  const archived = await readdir(path.join(changes, 'archive')).catch(() => []);
  const candidates = [path.join(changes, change, 'evidence', 'run-01'),
    ...archived.filter(name => name.endsWith(change)).map(name => path.join(changes, 'archive', name, 'evidence', 'run-01'))];
  const found = [];
  for (const candidate of candidates) {
    if (await readFile(path.join(candidate, 'measurement.json')).catch(() => null)) found.push(candidate);
  }
  assert.equal(found.length, 1, `Expected one immutable run-01; found ${found.length}.`);
  return found[0];
}

function validateOrders(protocol, report) {
  const expectedIds = report.questions.map(question => question.id).sort();
  assert.deepEqual(expectedIds, protocol.questions.map(question => question.id).sort());
  assert.equal(report.order.length, protocol.questions.length * 3 * 3);
  for (const [methodId, method] of Object.entries(report.raw)) {
    assert.equal(method.perQuestion.length, protocol.questions.length * 3);
    const counts = Object.fromEntries(expectedIds.map(id => [id, 0]));
    for (const row of method.perQuestion) {
      assert.ok(Object.hasOwn(counts, row.id)); counts[row.id]++;
      const expectedPosition = protocol.execution.orders[row.repetition - 1].indexOf(methodId) + 1;
      assert.ok(expectedPosition > 0); assert.equal(row.orderPosition, expectedPosition);
    }
    assert.ok(Object.values(counts).every(count => count === 3));
  }
  for (const repetition of [1, 2, 3]) {
    for (const question of expectedIds) {
      const rows = report.order.filter(row => row.repetition === repetition && row.question === question);
      assert.deepEqual(rows.sort((a, b) => a.position - b.position).map(row => row.method),
        protocol.execution.orders[repetition - 1]);
    }
  }
}

function validateAccounting(report) {
  const value = report.accounting;
  assert.ok(value.sourceInventoryBytes > 0 && value.sourceCollectionBytes > 0 && value.indexBytesPerOpen > 0);
  assert.equal(value.sourceValidationBytes, value.sourceInventoryBytes + value.sourceCollectionBytes);
  assert.equal(value.indexOpens, 2);
  assert.equal(value.indexBytes, value.indexBytesPerOpen * value.indexOpens);
  assert.equal(value.bytesReadPerQuestion, value.sourceValidationBytes + value.indexBytes);
  assert.equal(value.filesOpenedPerQuestion,
    value.sourceFilesFirstPass + value.sourceFilesSecondPass + value.indexFilesOpened);
  assert.ok(report.raw['prepared-context'].perQuestion.every(row => row.bytesRead === value.bytesReadPerQuestion
    && row.filesOpened === value.filesOpenedPerQuestion));
}

function validateIdentities(protocol, preflight, measurement, reports, guardedHashes = null) {
  // El arnés graba como «precommit» el HEAD con el que midió, así que en una re-medición es otro commit. Lo
  // que tiene que coincidir entre las tres piezas es ese commit, y lo que prueba que nada se tocó son los
  // hashes de los archivos congelados, que no dependen de ningún historial.
  const declared = preflight.protocol.precommit;
  assert.match(declared, /^[a-f0-9]{40}$/);
  assert.equal(measurement.protocol.precommit, declared);
  assert.equal(preflight.protocol.sha256, protocolDigest);
  assert.equal(measurement.protocol.sha256, protocolDigest);
  if (guardedHashes) {
    for (const [relative, hash] of Object.entries(preflight.protocol.guardedFiles ?? {})) {
      assert.equal(hash, guardedHashes[relative], `Guarded input differs from the reviewed tree: ${relative}`);
    }
  }
  for (const corpus of protocol.corpora) {
    const before = preflight.corpora.find(item => item.repository === corpus.repository);
    const aggregate = measurement.corpora.find(item => item.id === corpus.id);
    const report = reports[corpus.id];
    assert.ok(before && aggregate && report);
    assert.equal(before.commit, corpus.commit);
    assert.equal(aggregate.commit, corpus.commit);
    assert.equal(report.corpus.commit, corpus.commit);
    assert.equal(report.protocol.precommit, declared);
  }
}

const CORPUS_LABELS = { 'kubernetes-website': 'Kubernetes', cpython: 'CPython' };
const METHOD_LABELS = { 'read-all': 'Abrir todo', 'literal-scan': 'Barrido literal',
  'prepared-context': 'Contexto preparado' };

// La fila publicada de un método, tal como tiene que aparecer en la página.
function publicationRow(corpusId, method) {
  const grouped = value => String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `| ${CORPUS_LABELS[corpusId]} | ${METHOD_LABELS[method.id]} | ${method.questionsAnsweredEveryTime} / 10 | ${grouped(method.bytesReturnedTotal)} | ${grouped(method.bytesReadPerQuestion[0])} |`;
}

// Buscar cada fila suelta no basta: con dos mediciones publicadas, cuatro de las seis filas son idénticas
// entre corridas —solo cambian las dos de contexto preparado—, así que borrar una fila de una tabla la
// encontraría en la otra. Se exige que las seis convivan en una misma tabla.
function validatePublication(documentation, landing, measurement) {
  const rows = measurement.corpora.flatMap(corpus => corpus.methods.map(method => ({
    id: `${corpus.id}/${method.id}`, row: publicationRow(corpus.id, method),
  })));
  for (const { id, row } of rows) {
    assert.ok(documentation.includes(row), `Public documentation drifted from ${id}.`);
  }
  const tables = documentation.split(/\n\s*\n/);
  const complete = tables.filter(table => rows.every(({ row }) => table.includes(row)));
  assert.equal(complete.length, 1,
    `The measured run has to be published as one table with its six rows; found ${complete.length}.`);
  assert.ok(landing.includes('contexto preparado obtuvo <strong>0 / 10</strong> en ambos'));
  assert.ok(landing.includes('45 de 2654 fuentes observadas en Kubernetes'));
  assert.ok(landing.includes('42 de 2753 en CPython'));
  // La spec exige que una medición publicada nombre la versión medida, y la landing publica una.
  const version = measurement.application?.version;
  assert.ok(!version || /versión <strong>\d+\.\d+\.\d+<\/strong>/.test(landing),
    'La landing publica el resultado sin nombrar ninguna versión medida.');
}

function mutation(attempts, id, mutate, verify) {
  let detected = false;
  try { verify(mutate()); } catch { detected = true; }
  assert.equal(detected, true, `Adversarial mutation survived: ${id}`);
  attempts.push({ id, detected: true });
}

const evidence = evidenceOverride ? path.resolve(repository, evidenceOverride) : await resolveEvidence();
const anchorCommit = resultCommitOverride ?? resultCommit;
// La ruta publicada se deriva de la evidencia que se está revisando: archivar un change la mueve, y una ruta
// escrita a mano volvería a quedarse atrás.
const publishedPath = path.relative(repository, evidence).split(path.sep).join('/');
// `merge-base --is-ancestor` sale con 1 cuando no lo es y con otro código cuando algo va mal. Un SHA mal
// escrito o un objeto ausente no pueden degradar la verificación en silencio.
const ancestor = async (sha, of) => {
  try { await git(['merge-base', '--is-ancestor', sha, of]); return true; } catch (error) {
    // execFile deja el código de salida en `code`; un 1 significa «no es ancestro». Cualquier otro valor
    // —incluido un código de error como ENOENT— es un fallo de verdad y no puede pasar por «no lo es».
    if (error?.code === 1 || error?.status === 1) return false;
    throw new Error(`No se pudo comparar ${sha} con ${of}: ${String(error?.message ?? error).split('\n')[0]}`);
  }
};
assert.ok(await ancestor(anchorCommit, 'HEAD'),
  `El commit que publica la corrida no está en este historial: ${anchorCommit}`);

// Los insumos congelados se comparan **siempre contra el precompromiso**, que es lo que les da sentido. El
// objeto existe aunque el squash lo dejara fuera del historial de main, así que `git rev-parse` lo resuelve.
// Compararlos contra el commit que publica la corrida no probaría nada: ese commit los contiene por
// definición.
for (const relative of [protocolRelative,
  'apps/companion/benchmarks/real-repositories/protocol.sha256.json',
  'apps/companion/scripts/real-repository-benchmark.mjs',
  'apps/companion/scripts/verify-real-repository-benchmark.mjs']) {
  const workingBlob = await git(['hash-object', path.join(repository, ...relative.split('/'))]);
  const frozenBlob = await git(['rev-parse', `${precommit}:${relative}`]);
  assert.equal(workingBlob, frozenBlob, `Precommitted input changed: ${relative}`);
}

// El orden —que las preguntas se congelaran antes de medir— es lo único que el historial no sostiene cuando
// la integración fue por squash. Se registra como lo que es, no como una garantía.
const precommitInHistory = await ancestor(precommit, anchorCommit);

// Prueba de contenido, independiente de cualquier historial: el protocolo es el que declara su manifiesto.
const manifest = JSON.parse(await readFile(path.join(repository,
  'apps', 'companion', 'benchmarks', 'real-repositories', 'protocol.sha256.json'), 'utf8'));
const protocolDigest = manifest.sha256;
const guardedHashes = {};
for (const relative of manifest.guardedPaths) {
  guardedHashes[relative] = createHash('sha256')
    .update(await readFile(path.join(repository, ...relative.split('/')))).digest('hex');
}
assert.equal(guardedHashes[protocolRelative], protocolDigest,
  'El protocolo no coincide con el digest que declara su manifiesto.');
for (const file of resultFiles) {
  const workingBlob = await git(['hash-object', path.join(evidence, file)]);
  const publishedBlob = await git(['rev-parse', `${anchorCommit}:${publishedPath}/${file}`]);
  assert.equal(workingBlob, publishedBlob, `Published raw result changed: ${file}`);
}

const protocol = JSON.parse(await readFile(path.join(repository, ...protocolRelative.split('/')), 'utf8'));
const preflight = JSON.parse(await readFile(path.join(evidence, 'preflight.json'), 'utf8'));
const measurement = JSON.parse(await readFile(path.join(evidence, 'measurement.json'), 'utf8'));
const reports = Object.fromEntries(await Promise.all(protocol.corpora.map(async corpus => [corpus.id,
  JSON.parse(await readFile(path.join(evidence, `${corpus.id}.json`), 'utf8'))])));
const documentation = await readFile(path.join(repository, 'docs', 'companion', 'EVIDENCE.md'), 'utf8');
const landing = await readFile(path.join(repository, 'site', 'index.html'), 'utf8');

for (const corpus of protocol.corpora) {
  const report = reports[corpus.id];
  validateOrders({ ...corpus, execution: protocol.execution }, report);
  validateAccounting(report);
}
validateIdentities(protocol, preflight, measurement, reports, guardedHashes);
validatePublication(documentation, landing, measurement);

const attempts = [];
mutation(attempts, 'question-changed-after-precommit', () => {
  const changed = structuredClone(protocol); changed.corpora[0].questions[0].answer = 'changed'; return changed;
}, changed => assert.deepEqual(changed, protocol));
mutation(attempts, 'one-method-favoured-by-question-or-order', () => {
  const changed = structuredClone(reports['kubernetes-website']);
  changed.raw['literal-scan'].perQuestion[0].id = changed.raw['literal-scan'].perQuestion[1].id;
  return changed;
}, changed => validateOrders({ ...protocol.corpora[0], execution: protocol.execution }, changed));
mutation(attempts, 'source-rereads-omitted-from-accounting', () => {
  const changed = structuredClone(reports.cpython); changed.accounting.sourceCollectionBytes = 0; return changed;
}, validateAccounting);
mutation(attempts, 'corpus-commit-adulterated', () => {
  const changed = structuredClone(measurement); changed.corpora[0].commit = '0'.repeat(40); return changed;
}, changed => validateIdentities(protocol, preflight, changed, reports));
mutation(attempts, 'published-result-differs-from-raw-data', () => {
  // La fila de la corrida que se está revisando, no la primera que aparezca: la página publica dos corridas.
  const corpus = measurement.corpora[0];
  const method = corpus.methods.find(item => item.id === 'prepared-context');
  const row = publicationRow(corpus.id, method);
  const other = method.questionsAnsweredEveryTime === 10 ? 0 : 10;
  const changed = documentation.replace(row, row.replace(`${method.questionsAnsweredEveryTime} / 10`, `${other} / 10`));
  assert.notEqual(changed, documentation, 'La mutación no encontró la fila publicada de esta corrida.');
  return changed;
}, changed => validatePublication(changed, landing, measurement));

const result = { schemaVersion: 1, date: new Date().toISOString(), independence:
  'The verifier imports none of the benchmark runner or summarizer decisions. Frozen inputs are anchored to the precommit blobs; raw outputs are anchored to the commit named below, which is the one that introduces them.',
anchors: { precommit, resultCommit: anchorCommit, evidence: publishedPath,
  applicationVersion: measurement.application?.version ?? null,
  rawOutputs: `Los cuatro JSON se cotejaron contra los blobs de ${anchorCommit.slice(0, 7)}. Ese commit es el que introduce esa corrida: si pertenece a una rama sin integrar, la comprobación dice que los archivos no han cambiado desde que se escribieron, no que estén publicados en main.`,
  ordering: precommitInHistory
    ? 'El precompromiso es ancestro del commit que publica la corrida en este historial.'
    : `El precompromiso ${precommit.slice(0, 7)} no es ancestro de ${anchorCommit.slice(0, 7)} en este historial, porque la integración del protocolo fue por squash. Que las preguntas se congelaran antes de medir no lo sostiene el historial: lo atestigua el PR #113, que conserva c808967c antes que e0a29803. Lo que sí se comprueba aquí es el contenido: los insumos congelados contra los blobs del precompromiso y el protocolo contra el digest de su manifiesto.` },
reviewed: { corpora: protocol.corpora.length,
  questions: protocol.corpora.reduce((total, corpus) => total + corpus.questions.length, 0),
  rawObservations: Object.values(reports).reduce((total, report) => total
    + Object.values(report.raw).reduce((sum, method) => sum + method.perQuestion.length, 0), 0) },
attempts, verdict: 'PASS', blockers: 0, majors: 0 };

if (outputArgument) {
  const destination = path.resolve(outputArgument);
  await mkdir(path.dirname(destination), { recursive: true });
  const handle = await open(destination, 'wx');
  try { await handle.writeFile(JSON.stringify(result, null, 2) + '\n'); } finally { await handle.close(); }
}
console.log(JSON.stringify(result, null, 2));
