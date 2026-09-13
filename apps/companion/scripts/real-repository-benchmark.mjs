import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { mkdir, open, opendir, readFile, realpath, rm, stat, writeFile, lstat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const CONTROL = new Set(['.git', '.project-os', '.project-constructor', '.codegraph', '.gitnexus', 'graphify-out']);

export const sha256 = value => createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.length > 0;
const safeRelative = value => text(value) && value.length <= 500 && !path.isAbsolute(value)
  && !/[\\:\x00-\x1f]/.test(value) && value.split('/').every(part => part && !['.', '..'].includes(part));
const contains = (haystack, needle) => haystack.toLowerCase().includes(needle.toLowerCase());

export function validateProtocol(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.protocol !== 1
      || !text(value.frozenAt) || !value.eligibility || !value.execution
      || !Array.isArray(value.corpora) || value.corpora.length < 2) {
    throw new Error('PROTOCOL_INVALID');
  }
  const eligibility = value.eligibility;
  if (!Number.isInteger(eligibility.minimumUtf8TextFiles) || eligibility.minimumUtf8TextFiles < 2000
      || !Number.isInteger(eligibility.minimumUtf8TextBytes) || eligibility.minimumUtf8TextBytes < 20 * 1024 * 1024
      || eligibility.sameLineRequired !== true || !text(eligibility.rule)) throw new Error('PROTOCOL_ELIGIBILITY_INVALID');
  const execution = value.execution;
  const methods = ['read-all', 'literal-scan', 'prepared-context'];
  if (execution.repetitions !== 3 || !Array.isArray(execution.orders) || execution.orders.length !== 3
      || execution.orders.some(order => !Array.isArray(order) || order.length !== 3
        || [...order].sort().join() !== [...methods].sort().join()) || !text(execution.cache)) throw new Error('PROTOCOL_EXECUTION_INVALID');
  const corpora = new Set(), domains = new Set(), questions = new Set();
  for (const corpus of value.corpora) {
    if (!corpus || typeof corpus !== 'object' || !safeRelative(corpus.id) || corpora.has(corpus.id)
        || !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(corpus.repository)
        || !COMMIT.test(corpus.commit) || !(corpus.subtree === '.' || safeRelative(corpus.subtree))
        || !text(corpus.domain) || domains.has(corpus.domain) || !text(corpus.license?.spdx)
        || !safeRelative(corpus.license?.path) || !Array.isArray(corpus.questions) || corpus.questions.length < 10) {
      throw new Error('PROTOCOL_CORPUS_INVALID');
    }
    corpora.add(corpus.id); domains.add(corpus.domain);
    for (const question of corpus.questions) {
      if (!question || typeof question !== 'object' || !safeRelative(question.id) || questions.has(question.id)
          || !text(question.query) || !text(question.answer) || !safeRelative(question.source) || !text(question.asks)) {
        throw new Error('PROTOCOL_QUESTION_INVALID');
      }
      questions.add(question.id);
    }
  }
  return value;
}

export async function loadFrozenProtocol(protocolPath, manifestPath) {
  const [bytes, manifestBytes] = await Promise.all([readFile(protocolPath), readFile(manifestPath)]);
  let protocol, manifest;
  try { protocol = JSON.parse(bytes); manifest = JSON.parse(manifestBytes); }
  catch { throw new Error('PROTOCOL_JSON_INVALID'); }
  if (!manifest || manifest.schemaVersion !== 1 || manifest.protocol !== path.basename(protocolPath)
      || !DIGEST.test(manifest.sha256) || !Array.isArray(manifest.guardedPaths)
      || manifest.guardedPaths.length < 3 || manifest.guardedPaths.some(item => !safeRelative(item))) {
    throw new Error('PROTOCOL_MANIFEST_INVALID');
  }
  if (sha256(bytes) !== manifest.sha256) throw new Error('PROTOCOL_DIGEST_MISMATCH');
  return { protocol: validateProtocol(protocol), manifest, bytes };
}

export function normalizeRemote(value) {
  if (!text(value)) return '';
  let normalized = value.trim().replace(/\\/g, '/').replace(/\.git$/i, '').replace(/\/$/, '');
  const ssh = normalized.match(/^git@github\.com:(.+)$/i);
  if (ssh) normalized = `https://github.com/${ssh[1]}`;
  return normalized.toLowerCase();
}

export function validateCheckoutIdentity(corpus, identity) {
  if (identity.head !== corpus.commit) throw new Error(`CHECKOUT_COMMIT_MISMATCH:${corpus.id}`);
  if (normalizeRemote(identity.remote) !== normalizeRemote(corpus.repository)) throw new Error(`CHECKOUT_REMOTE_MISMATCH:${corpus.id}`);
  if (identity.status.trim()) throw new Error(`CHECKOUT_DIRTY:${corpus.id}`);
}

async function git(checkout, args, options = {}) {
  const result = await exec('git', ['-C', checkout, ...args], { windowsHide: true, maxBuffer: 64 * 1024 * 1024, ...options });
  return result.stdout.trim();
}

export async function verifyCheckout(corpus, checkout) {
  const root = await realpath(checkout);
  const pathspec = corpus.subtree === '.' ? '.' : corpus.subtree;
  const identity = {
    head: await git(root, ['rev-parse', 'HEAD']),
    remote: await git(root, ['remote', 'get-url', 'origin']),
    status: await git(root, ['status', '--porcelain', '--untracked-files=all', '--', pathspec]),
  };
  validateCheckoutIdentity(corpus, identity);
  return { root, ...identity };
}

export async function verifyPrecommit(repoRoot, guardedPaths) {
  const root = await realpath(repoRoot);
  for (const relative of guardedPaths) await git(root, ['ls-files', '--error-unmatch', '--', relative]);
  const unstaged = await git(root, ['diff', '--name-only', '--', ...guardedPaths]);
  const staged = await git(root, ['diff', '--cached', '--name-only', '--', ...guardedPaths]);
  if (unstaged || staged) throw new Error('PRECOMMIT_DIRTY');
  const head = await git(root, ['rev-parse', 'HEAD']);
  const files = {};
  for (const relative of guardedPaths) files[relative] = sha256(await readFile(path.join(root, relative)));
  return { commit: head, files };
}

export async function exportCorpus(corpus, checkout, destination) {
  const root = await realpath(checkout), output = path.resolve(destination);
  await mkdir(output, { recursive: false });
  const archive = path.join(path.dirname(output), `${corpus.id}.tar`);
  const args = ['archive', '--format=tar', `--output=${archive}`, corpus.commit];
  if (corpus.subtree !== '.') args.push(corpus.subtree);
  await git(root, args);
  await exec('tar', ['-xf', archive, '-C', output], { windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  await rm(archive);
  return realpath(corpus.subtree === '.' ? output : path.join(output, ...corpus.subtree.split('/')));
}

export async function listCorpusFiles(root) {
  const resolved = await realpath(root), files = [], skippedLinks = [];
  async function walk(relative = '') {
    const directory = await opendir(path.join(resolved, relative));
    for await (const entry of directory) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      if (!relative && CONTROL.has(entry.name.toLowerCase())) continue;
      const info = await lstat(path.join(resolved, ...next.split('/')));
      if (info.isSymbolicLink() || (info.isFile() && info.nlink > 1)) { skippedLinks.push(next); continue; }
      if (info.isDirectory()) await walk(next);
      else if (info.isFile()) files.push({ path: next, bytes: info.size });
    }
  }
  await walk();
  files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  skippedLinks.sort((a, b) => a.localeCompare(b, 'en'));
  return { root: resolved, files, skippedLinks };
}

export async function inspectEligibility(root, files, requirements) {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let utf8TextFiles = 0, utf8TextBytes = 0, corpusBytes = 0;
  for (const file of files) {
    const bytes = await readFile(path.join(root, ...file.path.split('/'))); corpusBytes += bytes.length;
    try {
      const decoded = decoder.decode(bytes);
      if (!decoded.includes('\u0000')) { utf8TextFiles++; utf8TextBytes += bytes.length; }
    } catch { /* Binary or unsupported encoding: still part of the corpus, not of the eligibility count. */ }
  }
  const result = { files: files.length, corpusBytes, utf8TextFiles, utf8TextBytes,
    required: { minimumUtf8TextFiles: requirements.minimumUtf8TextFiles,
      minimumUtf8TextBytes: requirements.minimumUtf8TextBytes },
    eligible: utf8TextFiles >= requirements.minimumUtf8TextFiles && utf8TextBytes >= requirements.minimumUtf8TextBytes };
  if (!result.eligible) throw new Error('CORPUS_NOT_SUBSTANTIAL');
  return result;
}

export async function verifyQuestions(root, questions, sameLineRequired = true) {
  const verified = [];
  for (const question of questions) {
    const absolute = path.join(root, ...question.source.split('/'));
    const source = await readFile(absolute, 'utf8');
    const lines = source.split(/\r\n|\n|\r/), line = lines.findIndex(value => contains(value, question.query) && contains(value, question.answer));
    if (!contains(source, question.query) || !contains(source, question.answer) || (sameLineRequired && line < 0)) {
      throw new Error(`QUESTION_SOURCE_MISMATCH:${question.id}`);
    }
    verified.push({ id: question.id, source: question.source, sourceSha256: sha256(source),
      queryAndAnswerLine: line < 0 ? null : line + 1 });
  }
  return verified;
}

async function openCorpus(root, files, visitor) {
  let bytesRead = 0, filesOpened = 0;
  for (const file of files) {
    const bytes = await readFile(path.join(root, ...file.path.split('/')));
    bytesRead += bytes.length; filesOpened++;
    await visitor(file, bytes);
  }
  return { bytesRead, filesOpened };
}

export async function measureReadAll(root, files, questions) {
  const perQuestion = [];
  for (const question of questions) {
    const started = performance.now(); let answerPresent = false;
    const opened = await openCorpus(root, files, (file, bytes) => {
      if (file.path === question.source && contains(bytes.toString('utf8'), question.answer)) answerPresent = true;
    });
    perQuestion.push({ id: question.id, found: true, discriminates: false, answerPresent,
      locator: answerPresent, locatorKind: 'file', contextBytes: opened.bytesRead,
      bytesReturned: opened.bytesRead, bytesRead: opened.bytesRead, filesOpened: opened.filesOpened,
      elapsedMs: performance.now() - started });
  }
  return { id: 'read-all', description: 'Abrir todos los archivos del corpus', perQuestion };
}

export async function measureLiteralScan(root, files, questions) {
  const perQuestion = [];
  for (const question of questions) {
    const started = performance.now(), returned = []; let found = false, answerPresent = false;
    const opened = await openCorpus(root, files, (file, bytes) => {
      bytes.toString('utf8').split(/\r\n|\n|\r/).forEach((line, index) => {
        if (!contains(line, question.query)) return;
        returned.push(`${file.path}:${index + 1}:${line}`);
        if (file.path === question.source) { found = true; if (contains(line, question.answer)) answerPresent = true; }
      });
    });
    const output = returned.join('\n');
    perQuestion.push({ id: question.id, found, discriminates: true, answerPresent,
      locator: answerPresent, locatorKind: 'file-line', matches: returned.length,
      returnedSha256: sha256(output), contextBytes: Buffer.byteLength(output), bytesReturned: Buffer.byteLength(output),
      bytesRead: opened.bytesRead, filesOpened: opened.filesOpened, elapsedMs: performance.now() - started });
  }
  return { id: 'literal-scan', description: 'Barrido literal sobre los bytes, equivalente a grep -a -n -r', perQuestion };
}

export function summarizeMethod(method) {
  const rows = method.perQuestion, elapsed = rows.map(row => row.elapsedMs).sort((a, b) => a - b);
  const sum = key => rows.reduce((total, row) => total + row[key], 0);
  const median = values => values.length % 2 ? values[Math.floor(values.length / 2)]
    : (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
  const ids = [...new Set(rows.map(row => row.id))];
  return { id: method.id, description: method.description, observations: rows.length,
    questions: ids.length, repetitions: ids.length ? rows.length / ids.length : 0,
    questionsAnsweredEveryTime: ids.filter(id => rows.filter(row => row.id === id).every(row => row.answerPresent)).length,
    questionsLocatedEveryTime: ids.filter(id => rows.filter(row => row.id === id).every(row => row.locator)).length,
    surfacedExpectedSource: rows.filter(row => row.found).length,
    discriminates: rows.every(row => row.discriminates !== false),
    answerInReturnedText: rows.filter(row => row.answerPresent).length,
    withLocator: rows.filter(row => row.locator).length,
    locatorKinds: [...new Set(rows.map(row => row.locatorKind))],
    bytesReturnedTotal: sum('bytesReturned'), bytesReturnedMedian: median(rows.map(row => row.bytesReturned).sort((a, b) => a - b)),
    bytesReadTotal: sum('bytesRead'), bytesReadPerQuestion: [...new Set(rows.map(row => row.bytesRead))],
    filesOpenedTotal: sum('filesOpened'),
    elapsedMs: { total: sum('elapsedMs'), median: median(elapsed), min: elapsed[0], max: elapsed.at(-1) } };
}

export async function writeJsonExclusive(destination, value) {
  await mkdir(path.dirname(destination), { recursive: true });
  const handle = await open(destination, 'wx');
  try { await handle.writeFile(JSON.stringify(value, null, 2) + '\n'); }
  finally { await handle.close(); }
}

export async function fileIdentity(root, relatives) {
  const result = {};
  for (const relative of relatives) {
    const absolute = path.join(root, ...relative.split('/'));
    result[relative] = { sha256: sha256(await readFile(absolute)), bytes: (await stat(absolute)).size };
  }
  return result;
}
