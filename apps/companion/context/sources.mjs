import { Worker } from 'node:worker_threads';
import { inspectFolder } from '../engine/inventory.mjs';
import { assertPath, hash, json, fail, snapshot } from '../engine/files.mjs';

export const DEFAULT_LIMITS = Object.freeze({ fileBytes: 8 * 1024 * 1024, totalBytes: 32 * 1024 * 1024,
  textBytes: 2 * 1024 * 1024, chunks: 3000, pages: 100, timeoutMs: 10000 });
export function normalizeContextOptions(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)
      || Object.keys(input).some(k => !['limits','exclude'].includes(k))) fail('CONTEXT_OPTIONS', 'La configuración de contexto no es válida.');
  if (input.limits !== undefined && (!input.limits || typeof input.limits !== 'object' || Array.isArray(input.limits))) fail('CONTEXT_OPTIONS', 'Los límites deben ser un objeto de configuración.');
  const limits = { ...DEFAULT_LIMITS, ...input.limits };
  for (const [key, value] of Object.entries(limits)) {
    if (!(key in DEFAULT_LIMITS) || !Number.isInteger(value) || value < 1 || value > DEFAULT_LIMITS[key]) fail('CONTEXT_LIMIT', 'El límite de contexto no es válido.');
  }
  const exclude = input.exclude ?? [];
  if (!Array.isArray(exclude) || exclude.length > 100 || exclude.some(p => typeof p !== 'string' || !p
    || p.length > 500 || /[\\:\x00-\x1f]/.test(p) || p.startsWith('/') || p.split('/').some(x => ['.','..',''].includes(x)))) {
    fail('CONTEXT_EXCLUDE', 'Las exclusiones deben ser rutas relativas de archivos o carpetas.');
  }
  return { limits, exclude: [...new Set(exclude)].sort() };
}

// Instruction files written by the constructor and by official OpenSpec activation are not the
// person's documents: they are already routed to the agent, and indexing them lets generated
// boilerplate consume the whole retrieval budget before the person's own sources are reached.
// Both owners record exactly which paths they wrote, so the scope stays explicit instead of
// guessing by folder name. An unreadable record keeps the previous behaviour of indexing them.
async function managedInstructions(root) {
  const managed = new Set();
  const state = await snapshot(root, '.project-constructor/state.json', 4 * 1024 * 1024).catch(() => ({ content: null }));
  try {
    const value = JSON.parse(state.content);
    if (value && typeof value.files === 'object' && !Array.isArray(value.files)) for (const relative of Object.keys(value.files)) managed.add(relative);
  } catch { /* No constructor record, or one this version does not recognize. */ }
  const activation = await snapshot(root, '.project-os/companion/activation.json', 4 * 1024 * 1024).catch(() => ({ content: null }));
  try {
    const value = JSON.parse(activation.content);
    if (Array.isArray(value?.files)) for (const file of value.files) if (typeof file?.path === 'string') managed.add(file.path);
  } catch { /* No activation record yet. */ }
  return managed;
}

export async function collectSources(target, options = {}) {
  const config = normalizeContextOptions(options), inventory = await inspectFolder(target), sources = [];
  const managed = await managedInstructions(inventory.root), managedPaths = [];
  let bytesRead = 0;
  for (const file of inventory.files) {
    if (managed.has(file.path)) { managedPaths.push(file.path); continue; }
    const source = { path: file.path, bytes: file.bytes, hash: file.hash, extension: file.extension };
    if (/[\x00-\x1f\x7f]/.test(file.path)) source.reason = 'unsupported-filename';
    else if (config.exclude.some(p => file.path === p || file.path.startsWith(p + '/'))) source.reason = 'user-excluded';
    else if (!(file.kind === 'text' || ['.pdf','.docx','.bib','.tex','.rst','.log'].includes(file.extension))) source.reason = 'unsupported-format';
    else if (file.bytes > config.limits.fileBytes || bytesRead + file.bytes > config.limits.totalBytes) source.reason = 'byte-limit';
    else {
      await assertPath(inventory.root, file.path);
      try {
        const current = await snapshot(inventory.root, file.path, Math.min(config.limits.fileBytes, config.limits.totalBytes - bytesRead));
        if (!current.content || current.content.length !== file.bytes || (file.hash && current.hash !== file.hash)) fail('SOURCE_CHANGED', 'Un documento cambió durante la lectura.');
        source.hash = current.hash; source.content = current.content; bytesRead += current.content.length;
      } catch (error) {
        if (error.code === 'SOURCE_CHANGED') throw error;
        source.reason = 'unreadable-or-changed';
      }
    }
    sources.push(source);
  }
  managedPaths.sort();
  const fingerprint = hash(json({ inventory: inventory.fingerprint, config, managed: managedPaths, sources: sources.map(({ content, ...s }) => s) }));
  return { root: inventory.root, sources, fingerprint, config, limitations: inventory.limitations, excluded: inventory.excluded, bytesRead,
    controlPaths: inventory.controlPaths, managedInstructions: managedPaths };
}

export function parseSource(bytes, extension, limits) {
  return new Promise(resolve => {
    const worker = new Worker(new URL('./parser-worker.mjs', import.meta.url), { workerData: { bytes, extension, limits },
      resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16 }, stdout: true, stderr: true });
    // Drain parser diagnostics without logging document content or host paths.
    worker.stdout.resume(); worker.stderr.resume();
    let settled = false;
    const finish = result => { if (settled) return; settled = true; clearTimeout(timer); void worker.terminate(); resolve(result); };
    const timer = setTimeout(() => finish({ sections: [], issues: [{ reason: 'parser-timeout' }] }), limits.timeoutMs);
    worker.once('message', finish);
    worker.once('error', () => finish({ sections: [], issues: [{ reason: 'parser-failed' }] }));
    worker.once('exit', () => finish({ sections: [], issues: [{ reason: 'parser-failed' }] }));
  });
}

// A small recognizer, not a guarantee that a document contains no sensitive or personal information.
export const likelySecret = text => /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|AKIA[A-Z0-9]{16})\b|(?:api[_-]?key|password|access[_-]?token)\s*["']?\s*[:=]\s*["'][^"'\s]{8,}["']/i.test(text);

export async function buildIndex(corpus, { signal, onProgress } = {}) {
  const sources = [], chunks = [];
  let used = 0;
  for (let i = 0; i < corpus.sources.length; i++) {
    if (signal?.aborted) fail('CANCELLED', 'La lectura se detuvo.');
    const { content, ...source } = corpus.sources[i];
    source.issues = source.reason ? [{ reason: source.reason }] : [];
    if (content && !source.reason) {
      if (used >= corpus.config.limits.textBytes || chunks.length >= corpus.config.limits.chunks) source.issues.push({ reason: 'index-limit' });
      else {
        const parsed = await parseSource(content, source.extension, { ...corpus.config.limits, textBytes: corpus.config.limits.textBytes - used });
        if (signal?.aborted) fail('CANCELLED', 'La lectura se detuvo.');
        if (likelySecret(content.toString('utf8')) || parsed.sections.some(s => likelySecret(s.text))) source.issues.push({ reason: 'possible-secret' });
        else {
          source.issues.push(...parsed.issues);
          let truncated = false;
          for (const section of parsed.sections) {
            for (let offset = 0; offset < section.text.length;) {
              let end = Math.min(offset + 1400, section.text.length);
              if (end < section.text.length && /[\uD800-\uDBFF]/.test(section.text[end - 1])) end--;
              const text = section.text.slice(offset, end), bytes = Buffer.byteLength(text);
              if (used + bytes > corpus.config.limits.textBytes || chunks.length >= corpus.config.limits.chunks) { truncated = true; break; }
              chunks.push({ path: source.path, hash: source.hash, kind: section.kind, start: section.start, end: section.end, text }); used += bytes; offset = end;
            }
            if (truncated) break;
          }
          if (truncated) source.issues.push({ reason: 'index-limit' });
        }
      }
    }
    source.status = source.issues.length ? chunks.some(c => c.path === source.path) ? 'partial' : 'unavailable' : 'indexed';
    sources.push(source);
    await onProgress?.({ stage: 'context', completed: i + 1, total: corpus.sources.length });
  }
  return { version: 1, fingerprint: corpus.fingerprint, config: corpus.config, method: 'local-lexical',
    sources, chunks, limitations: corpus.limitations, excluded: corpus.excluded, controlPaths: corpus.controlPaths,
    managedInstructions: corpus.managedInstructions ?? [], textBytes: used,
    complete: !corpus.limitations.length && !corpus.excluded && sources.every(s => s.status === 'indexed') };
}
