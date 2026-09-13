import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  inspectEligibility,
  listCorpusFiles,
  loadFrozenProtocol,
  measureLiteralScan,
  measureReadAll,
  normalizeRemote,
  sha256,
  summarizeMethod,
  validateCheckoutIdentity,
  validateProtocol,
  verifyQuestions,
} from '../scripts/real-repository-benchmark.mjs';

const benchmark = fileURLToPath(new URL('../benchmarks/real-repositories/', import.meta.url));
const protocolText = await readFile(path.join(benchmark, 'protocol.json'), 'utf8');
const prefix = path.join(await realpath(tmpdir()), 'companion-real-benchmark-test-');
async function fixture(t) {
  const root = await realpath(await mkdtemp(prefix));
  t.after(async () => {
    assert.equal(path.dirname(root), await realpath(tmpdir())); assert.ok(path.basename(root).startsWith('companion-real-benchmark-test-'));
    await rm(root, { recursive: true, force: true });
  });
  return root;
}

test('the durable protocol matches its declared digest and fixes the complete experiment', async () => {
  const durable = await readFile(path.join(benchmark, 'protocol.json'));
  const frozen = await loadFrozenProtocol(path.join(benchmark, 'protocol.json'), path.join(benchmark, 'protocol.sha256.json'));
  assert.equal(sha256(durable), frozen.manifest.sha256);
  assert.equal(frozen.protocol.corpora.length, 2);
  assert.equal(frozen.protocol.corpora.flatMap(corpus => corpus.questions).length, 20);
  assert.equal(frozen.protocol.execution.repetitions, 3);
});

test('changing a frozen question without its declaration is rejected', async t => {
  const root = await fixture(t), original = await readFile(path.join(benchmark, 'protocol.json'));
  const manifest = { schemaVersion: 1, protocol: 'protocol.json', sha256: sha256(original),
    guardedPaths: ['one/file', 'two/file', 'three/file'] };
  await writeFile(path.join(root, 'protocol.json'), original);
  await writeFile(path.join(root, 'protocol.sha256.json'), JSON.stringify(manifest));
  await loadFrozenProtocol(path.join(root, 'protocol.json'), path.join(root, 'protocol.sha256.json'));
  const changed = JSON.parse(original); changed.corpora[0].questions[0].answer = 'changed-after-running';
  await writeFile(path.join(root, 'protocol.json'), JSON.stringify(changed));
  await assert.rejects(loadFrozenProtocol(path.join(root, 'protocol.json'), path.join(root, 'protocol.sha256.json')),
    /PROTOCOL_DIGEST_MISMATCH/);
});

test('wrong commit, remote and dirty subtree each stop checkout validation', () => {
  const corpus = validateProtocol(JSON.parse(protocolText)).corpora[0];
  const identity = { head: corpus.commit, remote: `${corpus.repository}.git`, status: '' };
  validateCheckoutIdentity(corpus, identity);
  assert.equal(normalizeRemote(`git@github.com:kubernetes/website.git`), normalizeRemote(corpus.repository));
  assert.throws(() => validateCheckoutIdentity(corpus, { ...identity, head: '0'.repeat(40) }), /CHECKOUT_COMMIT_MISMATCH/);
  assert.throws(() => validateCheckoutIdentity(corpus, { ...identity, remote: 'https://github.com/example/other' }), /CHECKOUT_REMOTE_MISMATCH/);
  assert.throws(() => validateCheckoutIdentity(corpus, { ...identity, status: ' M content/en/file.md' }), /CHECKOUT_DIRTY/);
});

test('eligibility is based on actual UTF-8 bytes, while binary files remain in the corpus', async t => {
  const root = await fixture(t); await mkdir(path.join(root, 'nested'));
  await writeFile(path.join(root, 'one.unknown'), 'plain text');
  await writeFile(path.join(root, 'nested', 'two.bin'), 'also text');
  await writeFile(path.join(root, 'opaque.md'), Buffer.from([0, 255, 0]));
  const inventory = await listCorpusFiles(root);
  const eligible = await inspectEligibility(root, inventory.files, { minimumUtf8TextFiles: 2, minimumUtf8TextBytes: 10 });
  assert.deepEqual({ files: eligible.files, text: eligible.utf8TextFiles }, { files: 3, text: 2 });
  await assert.rejects(inspectEligibility(root, inventory.files, { minimumUtf8TextFiles: 3, minimumUtf8TextBytes: 10 }),
    /CORPUS_NOT_SUBSTANTIAL/);
});

test('ground truth must contain query and answer on the same source line', async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'source.txt'), 'query and known answer\n');
  const question = { id: 'q', source: 'source.txt', query: 'query', answer: 'known answer' };
  assert.equal((await verifyQuestions(root, [question], true))[0].queryAndAnswerLine, 1);
  await writeFile(path.join(root, 'source.txt'), 'query\nknown answer\n');
  await assert.rejects(verifyQuestions(root, [question], true), /QUESTION_SOURCE_MISMATCH/);
});

test('both baselines open the same files and report measured output rather than a forced winner', async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'source.txt'), 'needle carries answer\n');
  await writeFile(path.join(root, 'other.bin'), Buffer.from([1, 2, 3]));
  const { files } = await listCorpusFiles(root), questions = [{ id: 'q', source: 'source.txt', query: 'needle', answer: 'answer' }];
  const all = await measureReadAll(root, files, questions), literal = await measureLiteralScan(root, files, questions);
  assert.equal(all.perQuestion[0].filesOpened, files.length);
  assert.equal(literal.perQuestion[0].filesOpened, files.length);
  assert.equal(literal.perQuestion[0].answerPresent, true);
  assert.equal(summarizeMethod(literal).questionsAnsweredEveryTime, 1);
  questions[0].answer = 'missing';
  assert.equal((await measureLiteralScan(root, files, questions)).perQuestion[0].answerPresent, false);
});
