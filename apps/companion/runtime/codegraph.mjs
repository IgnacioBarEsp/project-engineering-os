import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFolder, assertPath, snapshot, writeChecked, withLock, hash, json, fail } from '../engine/files.mjs';
import { collectSources, likelySecret, normalizeContextOptions } from '../context/sources.mjs';
import { validateQuery } from '../context/retrieval.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';

export const CODE_INDEX = '.project-os/companion/code/index.json';
const EXTENSIONS = new Set(['.js','.mjs','.cjs','.jsx','.ts','.tsx','.cs','.py']);
const LIMIT = 4 * 1024 * 1024, MAX_FILES = 250, MAX_BYTES = 8 * 1024 * 1024;
const worker = fileURLToPath(new URL('./codegraph-worker.mjs', import.meta.url));
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const short = (value, max = 500) => typeof value === 'string' && value.length > 0 && value.length <= max && !/[\x00-\x1f\x7f]/.test(value);

async function collect(root, options, controls) {
  controls.signal?.throwIfAborted();
  const corpus = await collectSources(root, options), files = [], omitted = [];
  let bytes = 0;
  for (const source of corpus.sources) {
    controls.signal?.throwIfAborted();
    if (!EXTENSIONS.has(source.extension)) continue;
    let reason = source.reason;
    if (!reason && (source.bytes > 512 * 1024 || bytes + source.bytes > MAX_BYTES || files.length >= MAX_FILES)) reason = 'code-limit';
    if (!reason && (!source.content || !source.hash)) reason = 'unreadable';
    if (!reason && likelySecret(source.content.toString('utf8'))) reason = 'possible-secret';
    if (!reason) { try { new TextDecoder('utf8', { fatal: true }).decode(source.content); } catch { reason = 'unsupported-encoding'; } }
    if (reason) omitted.push({ path: source.path, reason });
    else { files.push(source); bytes += source.bytes; }
  }
  const sources = files.map(f => ({ path: f.path, hash: f.hash, bytes: f.bytes }));
  // Bind code coverage, exclusions and scan limits too, including newly added eligible files.
  const coverage = { sources, omitted, limitations: corpus.limitations, excluded: corpus.excluded };
  return { files, coverage, bytes, config: corpus.config, fingerprint: hash(json({ coverage, config: corpus.config })) };
}

function validateOutput(value, sources) {
  const paths = new Map(sources.map(s => [s.path, s]));
  if (!value || !Array.isArray(value.nodes) || value.nodes.length > 5000 || !Array.isArray(value.edges) || value.edges.length > 10000
    || value.nodes.some(n => !n || !short(n.id, 300) || !short(n.name) || !short(n.kind, 60) || !paths.has(n.path)
      || !Number.isInteger(n.start) || n.start < 1 || !Number.isInteger(n.end) || n.end < n.start || n.end > 524289)
    || new Set(value.nodes.map(n => n.id)).size !== value.nodes.length) fail('GRAPH_OUTPUT', 'El mapa de código no produjo símbolos válidos.');
  const ids = new Set(value.nodes.map(n => n.id));
  if (value.edges.some(e => !e || !ids.has(e.from) || !ids.has(e.to) || !short(e.kind, 60))) fail('GRAPH_OUTPUT', 'Una relación no corresponde a los símbolos revisados.');
  if (value.verification?.method !== 'CodeGraph.searchNodes' || typeof value.verification.matched !== 'boolean'
    || (value.verification.query !== null && !short(value.verification.query, 200))
    || (value.verification.matched && !value.nodes.some(n => n.name === value.verification.query))
    || !value.coverage || ['filesIndexed','filesSkipped','filesErrored'].some(k => !Number.isInteger(value.coverage[k]) || value.coverage[k] < 0 || value.coverage[k] > MAX_FILES)) fail('GRAPH_OUTPUT', 'No se pudo verificar la consulta de código.');
  return value;
}

// A checksum the project itself can recompute proves nothing: anyone who can write the index
// can also re-sign it and make the app report symbols CodeGraph never produced. The seal is a
// MAC under a key kept in the app-owned runtime location, outside every project.
const SEAL_KEY = 'code-index.key';
async function sealKey(runtimeRoot) {
  if (typeof runtimeRoot !== 'string' || !runtimeRoot) fail('GRAPH_KEY', 'No se puede comprobar el mapa sin la instalación de Companion.', 'Abre el proyecto en Companion para revisar el mapa de código.');
  const absolute = await assertPath(await canonicalFolder(runtimeRoot), SEAL_KEY);
  const existing = await readFile(absolute, 'utf8').catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
  if (existing !== null) {
    const trimmed = existing.trim();
    if (!/^[a-f0-9]{64}$/.test(trimmed)) fail('GRAPH_KEY', 'La clave local del mapa de código no es válida.', 'Conserva el archivo y revisa la instalación de Companion.');
    return Buffer.from(trimmed, 'hex');
  }
  const created = randomBytes(32);
  // Exclusive creation: a concurrent writer keeps its key and this call reads it back.
  try { await writeFile(absolute, `${created.toString('hex')}\n`, { flag: 'wx', mode: 0o600 }); return created; }
  catch (error) { if (error.code !== 'EEXIST') throw error; return sealKey(runtimeRoot); }
}
const seal = (key, payload) => createHmac('sha256', key).update(json(payload)).digest('hex');
const sealMatches = (key, value) => {
  if (!digest(value?.seal)) return false;
  const expected = Buffer.from(seal(key, value.payload), 'hex');
  return timingSafeEqual(expected, Buffer.from(value.seal, 'hex'));
};

async function record(root, key) {
  const state = await snapshot(root, CODE_INDEX, LIMIT);
  if (!state.content) return { state, value: null };
  let value; try { value = JSON.parse(state.content); } catch { fail('GRAPH_STATE', 'El mapa guardado no se puede leer.'); }
  if (value?.format === 1 && digest(value.rootHash) && value.rootHash !== hash(root)) fail('GRAPH_MOVED', 'La ubicación del mapa cambió.', 'Revisa la nueva carpeta en Companion antes de volver a preparar el mapa.');
  if (value?.format === 1 && !sealMatches(key, value)) fail('GRAPH_UNSEALED', 'Este mapa no lo produjo esta instalación de Companion.', 'Vuelve a crear el mapa de código para consultarlo con tus fuentes actuales.');
  if (value?.format !== 1 || !digest(value.rootHash)
    || value.payload?.tool !== 'codegraph@1.6.0' || !digest(value.payload.fingerprint) || !Array.isArray(value.payload.sources)
    || value.payload.sources.length > MAX_FILES || value.payload.sources.some(s => !s || !short(s.path) || !digest(s.hash)
      || !Number.isInteger(s.bytes) || s.bytes < 0 || s.bytes > 512 * 1024)) fail('GRAPH_STATE', 'El mapa guardado está incompleto o cambió.', 'Conserva el archivo y revisa su recuperación antes de reemplazarlo.');
  normalizeContextOptions(value.payload.config); validateOutput(value.payload.result, value.payload.sources);
  return { state, value: value.payload };
}

export function createCodeGraphEngine(manager, { executeWorker, readOptions } = {}) {
  const plans = new Map();
  async function execute(root, corpus, tools, controls) {
    if (executeWorker) return executeWorker(corpus, controls); // Trusted test adapter only, never IPC.
    const operations = await assertPath(manager.root, 'operations'); await mkdir(operations, { recursive: true });
    const stage = await mkdtemp(path.join(operations, 'code-')), stageRoot = await canonicalFolder(stage), copies = path.join(stage, 'sources');
    try {
      await mkdir(copies); const copyRoot = await canonicalFolder(copies);
      for (const file of corpus.files) { controls.signal?.throwIfAborted(); await writeChecked(copyRoot, file.path, file.content, null, 512 * 1024); }
      await writeChecked(stageRoot, 'request.json', json({ entry: tools.codegraph.entry, corpus: copies, files: corpus.files.map(f => f.path) }), null, 256 * 1024);
      await runFixedProcess({ executable: tools.node.entry, args: ['--liftoff-only', '--disable-warning=ExperimentalWarning', '--max-old-space-size=512', worker, path.join(stage, 'request.json')],
        cwd: stage, env: isolatedEnvironment({ home: stage, pathEntries: [path.dirname(tools.node.entry)] }), ...controls, timeoutMs: 120000, maxOutputBytes: 1024 * 1024 });
      return JSON.parse((await snapshot(stageRoot, 'response.json', 2 * 1024 * 1024)).content);
    } finally { await assertPath(manager.root, `operations/${path.basename(stage)}`); await rm(stage, { recursive: true, force: true }); }
  }
  async function current(root, options, controls) {
    let saved;
    try { saved = await record(root, await sealKey(manager?.root)); }
    catch (error) { if (controls.signal?.aborted) throw error; return { status: ['GRAPH_MOVED','GRAPH_UNSEALED','GRAPH_KEY'].includes(error.code) ? 'requires-repair' : 'corrupt', message: error.message, action: error.action }; }
    const corpus = await collect(root, options, controls);
    if (!saved.value) return { status: corpus.files.length ? 'not-prepared' : 'empty', message: corpus.files.length ? 'Todavía no se preparó el mapa de código.' : 'No hay código compatible dentro del alcance revisado.' };
    if (saved.value.fingerprint !== corpus.fingerprint || json(saved.value.sources) !== json(corpus.coverage.sources)) return { status: 'stale', message: 'El código o las exclusiones cambiaron. Actualiza el mapa antes de consultarlo.' };
    return { status: saved.value.result.verification.matched ? 'verified' : 'empty', message: saved.value.result.verification.matched ? undefined : 'CodeGraph no encontró símbolos verificables en estas fuentes.', value: saved.value };
  }
  return {
    async plan(target, profile, options = {}, controls = {}) {
      if (!['software','unity'].includes(profile)) fail('GRAPH_PROFILE', 'Este mapa está pensado para proyectos de software o Unity.');
      const root = await canonicalFolder(target);
      const check = await current(root, options, controls);
      if (['corrupt','requires-repair'].includes(check.status)) return { id: null, ...check };
      const saved = await record(root, await sealKey(manager.root)), corpus = await collect(root, options, controls);
      if (!corpus.files.length) return { id: null, status: 'empty', coverage: corpus.coverage, message: 'Todavía no hay código compatible para crear un mapa. Puedes usar la búsqueda documental.' };
      const runtime = await manager.plan(['node','codegraph'], controls);
      if (runtime.tools.some(t => t.status === 'requires-action')) return { id: null, status: 'requires-repair', tools: runtime.tools, message: 'Una herramienta necesita reparación antes de crear el mapa.' };
      const id = randomUUID(); plans.set(id, { root, fingerprint: corpus.fingerprint, config: corpus.config, beforeHash: saved.state.hash });
      if (plans.size > 10) plans.delete(plans.keys().next().value);
      return { id, status: 'planned', tools: runtime.tools, downloadBytes: runtime.downloadBytes, coverage: corpus.coverage, bytes: corpus.bytes,
        files: [{ path: CODE_INDEX, action: saved.state.content ? 'update' : 'create' }] };
    },
    async apply(id, controls = {}) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'Revisa el mapa de código antes de prepararlo.');
      const checkOptions = async () => { if (readOptions && json(normalizeContextOptions(await readOptions(plan.root))) !== json(plan.config)) fail('PLAN_STALE', 'Las exclusiones cambiaron después de revisar el mapa.'); };
      await checkOptions();
      const corpus = await collect(plan.root, plan.config, controls);
      const key = await sealKey(manager.root);
      if (corpus.fingerprint !== plan.fingerprint || (await record(plan.root, key)).state.hash !== plan.beforeHash) fail('PLAN_STALE', 'El código cambió después de la revisión.');
      plans.delete(id); const tools = {};
      for (const tool of ['node','codegraph']) tools[tool] = await manager.install(tool, controls);
      controls.onProgress?.({ stage: 'code', label: 'Buscando símbolos y relaciones en copias del código' });
      const result = validateOutput(await execute(plan.root, corpus, tools, controls), corpus.coverage.sources);
      const payload = { tool: 'codegraph@1.6.0', fingerprint: corpus.fingerprint, config: corpus.config, sources: corpus.coverage.sources, coverage: corpus.coverage, result };
      controls.signal?.throwIfAborted();
      await withLock(plan.root, async () => {
        await checkOptions();
        if ((await collect(plan.root, plan.config, controls)).fingerprint !== plan.fingerprint) fail('PLAN_STALE', 'El código cambió mientras se preparaba el mapa.');
        await writeChecked(plan.root, CODE_INDEX, json({ format: 1, rootHash: hash(plan.root), seal: seal(key, payload), payload }), plan.beforeHash, LIMIT);
      });
      return { status: result.verification.matched ? 'verified' : 'empty', symbols: result.nodes.length, relations: result.edges.length, verification: result.verification, coverage: result.coverage };
    },
    async verify(target, options = {}, controls = {}) {
      const result = await current(await canonicalFolder(target), options, controls);
      return { status: result.status, message: result.message, action: result.action, symbols: result.value?.result.nodes.length, relations: result.value?.result.edges.length,
        coverage: result.value?.coverage, method: 'verified-codegraph-snapshot', externalMcp: false };
    },
    async search(target, query, options = {}, controls = {}) {
      const terms = validateQuery(query), result = await current(await canonicalFolder(target), options, controls);
      if (result.status !== 'verified') fail('GRAPH_NOT_CURRENT', result.message ?? 'Primero prepara un mapa que tenga símbolos verificables.');
      const value = result.value, sourceMap = new Map(value.sources.map(s => [s.path, s]));
      const hits = value.result.nodes.map(n => ({ ...n, score: terms.reduce((s,t) => s + (n.name.toLowerCase().includes(t) ? 3 : 0) + (n.path.toLowerCase().includes(t) ? 1 : 0), 0), hash: sourceMap.get(n.path).hash }))
        .filter(n => n.score).sort((a,b) => b.score - a.score || a.path.localeCompare(b.path) || a.start - b.start).slice(0, 12);
      const ids = new Set(hits.map(h => h.id));
      return { method: 'verified-codegraph-snapshot', query, hits, relations: value.result.edges.filter(e => ids.has(e.from) || ids.has(e.to)).slice(0, 30),
        note: hits.length ? 'Símbolos extraídos por CodeGraph; abre las líneas originales para verificar el comportamiento. Las relaciones son aproximaciones estáticas.' : 'No se encontraron símbolos coincidentes. Prueba la búsqueda documental.', tokenCount: null };
    },
  };
}
