import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, realpath, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { portable } from './portable-path.mjs';
import {
  exportCorpus,
  fileIdentity,
  inspectEligibility,
  listCorpusFiles,
  loadFrozenProtocol,
  measureLiteralScan,
  measureReadAll,
  sha256,
  summarizeMethod,
  verifyCheckout,
  verifyPrecommit,
  verifyQuestions,
  writeJsonExclusive,
} from './real-repository-benchmark.mjs';

// Acceptance experiment over public repositories. It uses an already installed Companion application,
// never changes its retrieval behavior, and keeps external source excerpts out of committed evidence.
//
// node scripts/verify-real-repository-benchmark.mjs <installed resources/app> <new evidence directory>
//   <kubernetes/website checkout> <python/cpython checkout>
const [installedArgument, outputArgument, ...checkoutArguments] = process.argv.slice(2);
assert(installedArgument && outputArgument, 'Supply installed app, a new evidence directory and one checkout per frozen corpus.');
const installedRoot = await realpath(installedArgument), output = path.resolve(outputArgument);
const repoRoot = await realpath(fileURLToPath(new URL('../../../', import.meta.url)));
const protocolPath = fileURLToPath(new URL('../benchmarks/real-repositories/protocol.json', import.meta.url));
const manifestPath = fileURLToPath(new URL('../benchmarks/real-repositories/protocol.sha256.json', import.meta.url));
await mkdir(output, { recursive: true });
assert.equal((await readdir(output)).length, 0, 'Evidence directory must be empty; prior attempts are immutable.');

const temp = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-real-repositories-')));
let failure = null;
try {
  const frozen = await loadFrozenProtocol(protocolPath, manifestPath);
  assert.equal(checkoutArguments.length, frozen.protocol.corpora.length, 'Supply checkouts in frozen corpus order.');
  const precommit = await verifyPrecommit(repoRoot, frozen.manifest.guardedPaths);
  const checkoutById = Object.fromEntries(frozen.protocol.corpora.map((corpus, index) => [corpus.id, checkoutArguments[index]]));
  const anchors = [['<repo>', repoRoot], ...frozen.protocol.corpora.map(corpus => [`<checkout:${corpus.id}>`, checkoutById[corpus.id]])];
  const staged = [];

  // Finish every eligibility and ground-truth check before running the first method. A bad second corpus
  // must not leave a selectively useful first result behind.
  for (const corpus of frozen.protocol.corpora) {
    const checkout = await verifyCheckout(corpus, checkoutById[corpus.id]);
    const exported = await exportCorpus(corpus, checkout.root, path.join(temp, `export-${corpus.id}`));
    const inventory = await listCorpusFiles(exported);
    const eligibility = await inspectEligibility(exported, inventory.files, frozen.protocol.eligibility);
    const questions = await verifyQuestions(exported, corpus.questions, frozen.protocol.eligibility.sameLineRequired);
    const license = await readFile(path.join(checkout.root, ...corpus.license.path.split('/')));
    staged.push({ corpus, checkout, root: exported, files: inventory.files,
      preflight: { repository: corpus.repository, commit: checkout.head, subtree: corpus.subtree, domain: corpus.domain,
        license: { ...corpus.license, sha256: sha256(license) }, eligibility,
        skippedLinks: inventory.skippedLinks, questions } });
  }

  const installedModules = ['package.json', 'desktop/service.mjs', 'context/engine.mjs', 'context/sources.mjs',
    'context/retrieval.mjs', 'engine/inventory.mjs'];
  const installedPackage = JSON.parse(await readFile(path.join(installedRoot, 'package.json'), 'utf8'));
  const protocolIdentity = { sha256: frozen.manifest.sha256, frozenAt: frozen.protocol.frozenAt,
    precommit: precommit.commit, guardedFiles: precommit.files };
  await writeJsonExclusive(path.join(output, 'preflight.json'), {
    schemaVersion: 1, date: new Date().toISOString(), protocol: protocolIdentity,
    installedApplication: { version: installedPackage.version, root: portable(installedRoot, anchors),
      files: await fileIdentity(installedRoot, installedModules) },
    corpora: staged.map(item => ({ ...item.preflight, checkout: portable(item.checkout.root, anchors) })),
    noMethodRanBeforeThisRecord: true,
  });

  const load = relative => import(pathToFileURL(path.join(installedRoot, relative)).href);
  const core = await load('node_modules/create-project-engineering-os/src/index.mjs');
  const { createDesktopService } = await load('desktop/service.mjs');
  const { inspectFolder } = await load('engine/inventory.mjs');
  const { collectSources } = await load('context/sources.mjs');
  const reports = [];

  for (const item of staged) {
    const { corpus, root, files } = item;
    const service = await createDesktopService({ dataRoot: path.join(temp, `history-${corpus.id}`), core,
      chooseFolder: async () => root, copyText: () => {}, openExternal: () => {} });
    const project = await service.chooseFolder(), preparationStarted = performance.now();
    const base = await service.previewBase({ id: project.id, selection: { name: `Corpus ${corpus.id}`,
      role: 'researcher', goal: 'Comparar recuperacion con fuentes verificables', profile: 'research',
      experience: 'guided', agents: ['web'] } });
    await service.applyBase({ plan: base.id });
    const context = await service.previewContext({ id: project.id });
    await service.applyContext({ plan: context.id });
    const preparationMs = performance.now() - preparationStarted;

    const contextRoot = path.join(root, '.project-os', 'companion', 'context');
    const indexPath = path.join(contextRoot, 'index.json'), receiptPath = path.join(contextRoot, 'receipt.json');
    const [indexBytes, receipt] = await Promise.all([stat(indexPath).then(value => value.size),
      readFile(receiptPath, 'utf8').then(JSON.parse)]);
    const inventoryAccounting = await inspectFolder(root);
    const sourceAccounting = await collectSources(root, receipt.config);
    const sourceFilesFirstPass = inventoryAccounting.files.filter(source => source.hash !== null).length;
    const sourceFilesSecondPass = sourceAccounting.sources.filter(source => source.content).length;
    // context.current reads the index once while validating owned files and once to parse it for retrieval.
    // The installed module hash is in preflight; a later implementation needs a new protocol/accounting rule.
    const accounting = { sourceInventoryBytes: inventoryAccounting.bytesRead,
      sourceCollectionBytes: sourceAccounting.bytesRead, sourceValidationBytes: inventoryAccounting.bytesRead + sourceAccounting.bytesRead,
      indexBytesPerOpen: indexBytes, indexOpens: 2, indexBytes: indexBytes * 2,
      bytesReadPerQuestion: inventoryAccounting.bytesRead + sourceAccounting.bytesRead + indexBytes * 2,
      sourceFilesFirstPass, sourceFilesSecondPass, indexFilesOpened: 2,
      filesOpenedPerQuestion: sourceFilesFirstPass + sourceFilesSecondPass + 2,
      excludes: 'Directory metadata and small control-state reads are not counted; these are content bytes opened by the installed algorithm, not physical disk I/O.' };

    const methods = {
      'read-all': { id: 'read-all', description: 'Abrir todos los archivos del corpus', perQuestion: [] },
      'literal-scan': { id: 'literal-scan', description: 'Barrido literal sobre los bytes, equivalente a grep -a -n -r', perQuestion: [] },
      'prepared-context': { id: 'prepared-context', description: 'Busqueda sobre el contexto preparado por la aplicacion instalada', perQuestion: [] },
    };
    const executionOrder = [];
    for (let repetition = 0; repetition < frozen.protocol.execution.repetitions; repetition++) {
      const order = frozen.protocol.execution.orders[repetition];
      for (const question of corpus.questions) {
        for (let position = 0; position < order.length; position++) {
          const method = order[position]; executionOrder.push({ repetition: repetition + 1, question: question.id, position: position + 1, method });
          if (method === 'read-all') {
            const measured = await measureReadAll(root, files, [question]);
            methods[method].perQuestion.push({ ...measured.perQuestion[0], repetition: repetition + 1, orderPosition: position + 1 });
          } else if (method === 'literal-scan') {
            const measured = await measureLiteralScan(root, files, [question]);
            methods[method].perQuestion.push({ ...measured.perQuestion[0], repetition: repetition + 1, orderPosition: position + 1 });
          } else {
            const started = performance.now(), result = await service.search({ id: project.id, query: question.query });
            const hits = result.hits ?? [], match = hits.find(hit => hit.path === question.source);
            const bytesReturned = hits.reduce((total, hit) => total + Buffer.byteLength(hit.text), 0);
            const answerPresent = Boolean(match && match.text && match.text.toLowerCase().includes(question.answer.toLowerCase()));
            methods[method].perQuestion.push({ id: question.id, repetition: repetition + 1, orderPosition: position + 1,
              found: Boolean(match), discriminates: true, answerPresent,
              locator: answerPresent && Boolean(match.kind) && Number.isInteger(match.start), locatorKind: 'passage',
              contextBytes: bytesReturned, bytesReturned, bytesRead: accounting.bytesReadPerQuestion,
              filesOpened: accounting.filesOpenedPerQuestion, elapsedMs: performance.now() - started,
              hits: hits.map(hit => ({ path: hit.path, kind: hit.kind, start: hit.start, end: hit.end,
                bytes: Buffer.byteLength(hit.text), textSha256: sha256(hit.text) })) });
          }
        }
      }
    }

    for (const method of Object.values(methods)) {
      assert.equal(method.perQuestion.length, corpus.questions.length * frozen.protocol.execution.repetitions);
      assert.ok(method.perQuestion.every(row => Number.isFinite(row.bytesRead) && row.bytesRead >= 0
        && Number.isFinite(row.bytesReturned) && row.bytesReturned >= 0
        && Number.isInteger(row.filesOpened) && row.filesOpened >= 0));
    }
    const coverage = { complete: context.coverage.complete, sources: context.coverage.sources.length,
      indexed: context.coverage.sources.filter(source => source.status === 'indexed').length,
      partial: context.coverage.sources.filter(source => source.status === 'partial').length,
      unavailable: context.coverage.sources.filter(source => source.status === 'unavailable').length,
      limitations: context.coverage.limitations, excluded: context.coverage.excluded,
      chunks: context.coverage.chunks, textBytes: context.coverage.textBytes };
    const report = { schemaVersion: 1, corpus: item.preflight, protocol: protocolIdentity,
      application: { version: installedPackage.version }, preparation: { elapsedMs: preparationMs,
        bytesWritten: await treeBytes(path.join(root, '.project-os')), coverage }, accounting,
      cache: frozen.protocol.execution.cache, order: executionOrder,
      questions: corpus.questions.map(question => ({ ...question })),
      methods: Object.values(methods).map(method => summarizeMethod(method)), raw: methods,
      notMeasured: { modelTokenUsage: 'No provider participates; token usage is not measured or estimated from bytes.',
        modelAnswerQuality: 'No model generates answers in this retrieval comparison.',
        hallucinations: 'The method cannot observe hallucinations.',
        physicalDiskIo: 'Content bytes opened by the algorithm are counted; filesystem metadata, cache and physical I/O are not.' },
      limits: ['One installed application version on one Windows machine.',
        'Public repositories are fixed samples, not a claim about all repositories.',
        'Retrieval uses frozen literal queries; autonomous query selection is not measured.',
        'Warm operating-system cache is not controlled; elapsed time is descriptive and each method occupies every order position.',
        'Partial coverage and unsupported formats are product outcomes and are not repaired for this experiment.'] };
    await writeJsonExclusive(path.join(output, `${corpus.id}.json`), report);
    reports.push(report);
    console.log(JSON.stringify({ corpus: corpus.id, eligibility: item.preflight.eligibility,
      preparation: report.preparation, methods: report.methods }, null, 2));
  }

  await writeJsonExclusive(path.join(output, 'measurement.json'), { schemaVersion: 1,
    date: new Date().toISOString(), protocol: protocolIdentity, application: { version: installedPackage.version },
    corpora: reports.map(report => ({ id: frozen.protocol.corpora.find(corpus => corpus.repository === report.corpus.repository).id,
      repository: report.corpus.repository, commit: report.corpus.commit,
      eligibility: report.corpus.eligibility, preparation: report.preparation, methods: report.methods })),
    outcomeRule: 'Raw favourable, neutral and unfavourable outcomes are retained without changing the product, protocol or score.' });
} catch (error) {
  failure = error;
  const code = /^[A-Z0-9_-]+/.exec(String(error?.message ?? 'EXPERIMENT_FAILED'))?.[0] ?? 'EXPERIMENT_FAILED';
  await writeJsonExclusive(path.join(output, 'failure.json'), { schemaVersion: 1, date: new Date().toISOString(), code }).catch(() => {});
} finally {
  const parent = await realpath(tmpdir());
  assert.equal(path.dirname(temp), parent); assert.ok(path.basename(temp).startsWith('companion-real-repositories-'));
  await rm(temp, { recursive: true, force: true });
}
if (failure) throw failure;

async function treeBytes(directory) {
  let bytes = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const next = path.join(directory, entry.name);
    bytes += entry.isDirectory() ? await treeBytes(next) : (await stat(next)).size;
  }
  return bytes;
}
