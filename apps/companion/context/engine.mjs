import { randomUUID } from 'node:crypto';
import { canonicalFolder, NAMESPACE, hash, json, fail, snapshot, writeChecked, withLock } from '../engine/files.mjs';
import { createPreparationEngine, normalizeSelection } from '../engine/preparation.mjs';
import { collectSources, buildIndex, normalizeContextOptions } from './sources.mjs';
import { retrieve, formatExport, validateQuery } from './retrieval.mjs';
import { renderRecipes } from './recipes.mjs';
import { AGENT_PATHS, ROUTE_PATHS, CANONICAL_ROUTE, ROUTE_TEXT, routeBlock, renderRoute, renderMap } from './routes.mjs';

const DIR = `${NAMESPACE}/context`, INDEX = `${DIR}/index.json`, RECEIPT = `${DIR}/receipt.json`, JOURNAL = `${DIR}/transaction.json`;
const OWNED = [INDEX, `${DIR}/MAP.md`, `${DIR}/RECIPES.md`];
const ALLOWED = [...OWNED, ...ROUTE_PATHS, RECEIPT];
const MAX_FILE = 8 * 1024 * 1024, MAX_JOURNAL = 40 * 1024 * 1024;
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const aborted = signal => { if (signal?.aborted) fail('CANCELLED', 'La operación se detuvo.', 'Puedes continuar o deshacer la preparación registrada.'); };
function parse(content) { try { return JSON.parse(content); } catch { fail('CONTEXT_STATE', 'No se puede leer el estado de contexto.'); } }
const read = (root, relative) => snapshot(root, relative, MAX_FILE);
function receipt(value) {
  if (!object(value) || value.version !== 1 || !object(value.files) || !digest(value.fingerprint)
    || Object.keys(value.files).sort().join() !== [...OWNED].sort().join() || Object.values(value.files).some(v=>!digest(v))
    || !Array.isArray(value.routes) || new Set(value.routes).size !== value.routes.length || value.routes.some(p=>!ROUTE_PATHS.includes(p))) {
    fail('CONTEXT_STATE', 'El recibo de contexto no tiene un formato reconocido.');
  }
  normalizeSelection(value.selection); normalizeContextOptions(value.config);
  if (typeof value.canonicalRouting !== 'boolean') fail('CONTEXT_STATE', 'Falta la estrategia de instrucciones.');
  const routes = selectedRoutes(value.selection, value.canonicalRouting);
  if (routes.sort().join() !== [...value.routes].sort().join()) fail('CONTEXT_STATE', 'Las rutas no corresponden a las IA elegidas.');
  return value;
}
function selectedRoutes(selection, canonical) {
  return [...new Set(selection.agents.flatMap(a=>AGENT_PATHS[a]
    ? [canonical && a !== 'cursor' ? CANONICAL_ROUTE : AGENT_PATHS[a]] : []))].sort();
}
async function canonicalRouting(root) {
  const state = await snapshot(root,'.project-constructor/state.json',4*1024*1024);
  if (!state.content) return false;
  const value = parse(state.content);
  // Presence is enough to avoid editing a possible generated mirror; require its canonical file.
  if (!object(value) || !(await read(root,CANONICAL_ROUTE)).content) fail('CORE_STATE', 'Revisa la preparación de ingeniería antes de configurar sus instrucciones.');
  return true;
}
async function readReceipt(root) {
  const state = await read(root, RECEIPT);
  return { state, value: state.content ? receipt(parse(state.content)) : null };
}
function validateJournal(value) {
  if (!object(value) || value.version !== 1 || !/^[a-f0-9-]{36}$/.test(value.id ?? '') || !digest(value.rootHash)
      || !['applying','interrupted','committed','rolled-back'].includes(value.status)
      || !Array.isArray(value.operations) || value.operations.length !== ALLOWED.length
      || value.operations.some(op=>!object(op)) || value.operations.map(o=>o.path).sort().join() !== [...ALLOWED].sort().join()) {
    fail('CONTEXT_JOURNAL', 'El registro de recuperación de contexto no es válido.');
  }
  for (const op of value.operations) {
    for (const key of ['before','after']) {
      if (op[key] === null ? op[`${key}Hash`] !== null : typeof op[key] !== 'string' || Buffer.byteLength(op[key]) > MAX_FILE || hash(op[key]) !== op[`${key}Hash`]) {
        fail('CONTEXT_JOURNAL', 'Un archivo no coincide con el registro de recuperación.');
      }
    }
  }
  const next = receipt(parse(value.operations.find(op=>op.path===RECEIPT).after));
  if (OWNED.some(p=>next.files[p] !== value.operations.find(op=>op.path===p).afterHash)) fail('CONTEXT_JOURNAL', 'El recibo no coincide con los archivos de contexto.');
  const index = parse(value.operations.find(op=>op.path===INDEX).after);
  if (index?.fingerprint !== next.fingerprint || json(index.config) !== json(next.config)) fail('CONTEXT_JOURNAL', 'La fuente del índice no coincide con el recibo.');
  for (const relative of next.routes) {
    const content = value.operations.find(op=>op.path===relative).after;
    if (typeof content !== 'string' || routeBlock(content)?.text !== ROUTE_TEXT) fail('CONTEXT_JOURNAL', 'Las rutas de la IA no coinciden con la preparación.');
  }
  return { value, next };
}
async function readJournal(root) {
  const state = await snapshot(root, JOURNAL, MAX_JOURNAL);
  return { state, ...(state.content ? validateJournal(parse(state.content)) : { value: null, next: null }) };
}
async function validateOwned(root, previous) {
  const states = {};
  for (const relative of [...OWNED, ...ROUTE_PATHS]) {
    states[relative] = await read(root, relative);
    if (OWNED.includes(relative)) {
      if (previous ? states[relative].hash !== previous.files[relative] : states[relative].hash !== null) {
        fail('CONTEXT_CONFLICT', 'Ya existe contexto modificado o sin un recibo válido.', 'Conserva esos archivos y revisa el conflicto antes de actualizar.');
      }
    } else if (previous?.routes.includes(relative) && routeBlock(states[relative].content?.toString('utf8') ?? '')?.text !== ROUTE_TEXT) {
      fail('ROUTE_CONFLICT', 'Las instrucciones de una IA se modificaron o retiraron.');
    }
  }
  return states;
}
async function baseSelection(root) {
  const state = await createPreparationEngine().verify(root);
  if (state.base !== 'prepared') fail('BASE_REQUIRED', 'Primero termina o recupera la preparación de la carpeta.');
  return state.selection;
}
async function ensureInputs(root, next) {
  if (await canonicalRouting(root) !== next.canonicalRouting) fail('CONTEXT_STALE', 'Cambió el entorno de ingeniería; revisa sus instrucciones.');
  if (json(await baseSelection(root)) !== json(next.selection)) fail('CONTEXT_STALE', 'La selección del proyecto cambió.', 'Vuelve a preparar el contexto con la selección actual.');
  const corpus = await collectSources(root, next.config);
  if (corpus.fingerprint !== next.fingerprint) fail('CONTEXT_STALE', 'Los archivos cambiaron desde que se leyó el contexto.', 'Actualiza el contexto antes de buscar, exportar o continuar.');
  return corpus;
}
async function saveJournal(root, value, beforeHash) {
  const content = json(value);
  await writeChecked(root, JOURNAL, content, beforeHash, MAX_JOURNAL);
  return hash(content);
}
async function run(root, value, next, journalHash, { signal, onProgress } = {}) {
  if (value.rootHash !== hash(root)) fail('PROJECT_MOVED', 'Esta operación pertenece a otra ubicación.');
  await ensureInputs(root, next);
  for (const op of value.operations) if (![op.beforeHash,op.afterHash].includes((await read(root,op.path)).hash)) fail('RECOVERY_CONFLICT', 'Una edición posterior impide continuar sin sobrescribirla.');
  try {
    for (let i = 0; i < value.operations.length; i++) {
      aborted(signal);
      const op = value.operations[i];
      if ((await read(root, op.path)).hash !== op.afterHash) await writeChecked(root, op.path, op.after, op.beforeHash, MAX_FILE);
      await onProgress?.({ stage: 'context-write', completed: i + 1, total: value.operations.length });
    }
    value.status = 'committed'; await saveJournal(root, value, journalHash);
  } catch (error) {
    value.status = 'interrupted'; await saveJournal(root, value, journalHash).catch(()=>{}); throw error;
  }
  return { status: 'prepared', transaction: value.id, changed: value.operations.filter(op=>op.beforeHash!==op.afterHash).length,
    agentStatus: next.canonicalRouting ? 'canonical-configured-check-sync' : 'instructions-configured', externalTools: 'not-verified' };
}

export function createContextEngine() {
  const plans = new Map();
  async function current(target) {
    const root = await canonicalFolder(target), prior = await readJournal(root);
    if (['applying','interrupted'].includes(prior.value?.status)) fail('CONTEXT_INTERRUPTED', 'Termina o deshaz la operación de contexto interrumpida.');
    const previous = await readReceipt(root);
    if (!previous.value) fail('CONTEXT_MISSING', 'El contexto todavía no se ha preparado.');
    await validateOwned(root, previous.value); await ensureInputs(root, previous.value);
    const index = parse((await read(root, INDEX)).content);
    if (!object(index) || index.version !== 1 || index.method !== 'local-lexical' || !Array.isArray(index.chunks)
      || index.chunks.length > 3000 || !Array.isArray(index.sources) || index.sources.length > 10000
      || !Array.isArray(index.limitations) || index.fingerprint !== previous.value.fingerprint
      || index.chunks.some(c=>!object(c) || typeof c.text !== 'string' || typeof c.path !== 'string' || !digest(c.hash)
        || !['line','page','paragraph'].includes(c.kind) || !Number.isInteger(c.start) || c.start < 1 || c.end !== c.start)) {
      fail('CONTEXT_STATE', 'El índice de contexto no tiene un formato reconocido.');
    }
    return { root, index, previous: previous.value };
  }
  return {
    async plan(target, options = {}, controls = {}) {
      aborted(controls.signal);
      const root = await canonicalFolder(target), selection = await baseSelection(root), previous = await readReceipt(root), prior = await readJournal(root);
      if (['applying','interrupted'].includes(prior.value?.status)) fail('CONTEXT_INTERRUPTED', 'Continúa o deshaz la operación interrumpida primero.');
      const states = await validateOwned(root, previous.value);
      for (const relative of ROUTE_PATHS) {
        if (states[relative].content) {
          try { new TextDecoder('utf-8', { fatal: true }).decode(states[relative].content); }
          catch { fail('ROUTE_ENCODING', 'Un archivo de instrucciones necesita convertirse a UTF-8 antes de integrarlo.'); }
        }
      }
      const corpus = await collectSources(root, options), index = await buildIndex(corpus, controls);
      const canonical = await canonicalRouting(root), routes = selectedRoutes(selection, canonical);
      if (previous.value && previous.value.canonicalRouting !== canonical) fail('ROUTE_STRATEGY_CHANGED', 'La preparación de ingeniería cambió la propiedad de las instrucciones.', 'Deshaz las rutas anteriores antes de adoptar el entorno de ingeniería.');
      const contents = { [INDEX]: json(index), [`${DIR}/MAP.md`]: renderMap(index, selection), [`${DIR}/RECIPES.md`]: renderRecipes(selection.profile) };
      for (const relative of ROUTE_PATHS) {
        const existing = states[relative].content?.toString('utf8') ?? null;
        // Mirrored blocks belong to the constructor, including a block copied by its last sync.
        contents[relative] = canonical && ['AGENTS.md','CLAUDE.md','.github/copilot-instructions.md'].includes(relative)
          ? existing : renderRoute(relative, existing, routes.includes(relative), previous.value?.routes.includes(relative));
      }
      const next = { version: 1, selection, fingerprint: corpus.fingerprint, config: corpus.config, routes, canonicalRouting: canonical,
        files: Object.fromEntries(OWNED.map(p=>[p,hash(contents[p])])) };
      contents[RECEIPT] = json(next); states[RECEIPT] = previous.state;
      const operations = ALLOWED.map(p=>({ path: p, before: states[p].content?.toString('utf8') ?? null, beforeHash: states[p].hash,
        after: contents[p], afterHash: contents[p] === null ? null : hash(contents[p]) }));
      if (operations.some(op=>op.after !== null && Buffer.byteLength(op.after) > MAX_FILE)) fail('CONTEXT_LIMIT', 'El contexto es demasiado grande; reduce la carpeta o excluye fuentes.');
      const id = randomUUID(), journal = { version: 1, id, status: 'applying', rootHash: hash(root), operations };
      if (Buffer.byteLength(json(journal)) > MAX_JOURNAL) fail('CONTEXT_LIMIT', 'La recuperación supera el límite; elige un conjunto de documentos más pequeño.');
      plans.set(id, { root, journal, next, journalHash: prior.state.hash });
      if (plans.size > 10) plans.delete(plans.keys().next().value);
      return { id, selection, coverage: { complete: index.complete, sources: structuredClone(index.sources), limitations: index.limitations,
        excluded: index.excluded, chunks: index.chunks.length, textBytes: index.textBytes },
        files: operations.map(op=>({ path: op.path, action: op.beforeHash===op.afterHash ? 'unchanged' : op.after===null ? 'remove' : op.before===null ? 'create' : 'update',
          before: op.path===INDEX ? null : op.before, after: op.path===INDEX ? null : op.after, bytes: op.after===null ? 0 : Buffer.byteLength(op.after) })),
        agentStatus: canonical ? 'canonical-planned-sync-required' : 'planned', externalTools: 'not-verified' };
    },
    async apply(id, controls = {}) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'La vista previa venció. Revisa el contexto otra vez.');
      aborted(controls.signal);
      return withLock(plan.root, async () => {
        await ensureInputs(plan.root, plan.next);
        for (const op of plan.journal.operations) if ((await read(plan.root,op.path)).hash !== op.beforeHash) fail('PLAN_STALE', 'Un destino cambió después de la revisión.');
        if ((await snapshot(plan.root,JOURNAL,MAX_JOURNAL)).hash !== plan.journalHash) fail('PLAN_STALE', 'Otra operación cambió el contexto.');
        if (plan.journal.operations.every(op=>op.beforeHash===op.afterHash)) { plans.delete(id); return { status: 'unchanged', changed: 0 }; }
        const journalHash = await saveJournal(plan.root, plan.journal, plan.journalHash); plans.delete(id);
        return run(plan.root, plan.journal, plan.next, journalHash, controls);
      });
    },
    async resume(target, controls = {}) {
      const root = await canonicalFolder(target);
      return withLock(root, async () => {
        const { value, next, state } = await readJournal(root);
        if (!['applying','interrupted'].includes(value?.status)) fail('NOT_INTERRUPTED', 'No hay una operación de contexto pendiente.');
        return run(root, value, next, state.hash, controls);
      });
    },
    async rollback(target) {
      const root = await canonicalFolder(target);
      return withLock(root, async () => {
        const { value, state } = await readJournal(root);
        if (!value || value.status === 'rolled-back') return { status: 'unchanged', changed: 0 };
        if (value.rootHash !== hash(root)) fail('PROJECT_MOVED', 'Esta operación pertenece a otra ubicación.');
        for (const op of value.operations) if (![op.beforeHash,op.afterHash].includes((await read(root,op.path)).hash)) fail('RECOVERY_CONFLICT', 'Conserva las ediciones posteriores antes de recuperar.');
        for (const op of [...value.operations].reverse()) if ((await read(root,op.path)).hash===op.afterHash && op.beforeHash!==op.afterHash) await writeChecked(root,op.path,op.before,op.afterHash,MAX_FILE);
        value.status = 'rolled-back'; await saveJournal(root,value,state.hash);
        return { status: 'rolled-back', transaction: value.id };
      });
    },
    async verify(target) {
      try {
        const { index, previous } = await current(target);
        return { context: 'current', coverage: index.complete ? 'complete' : 'partial', sources: index.sources.length, chunks: index.chunks.length,
          selection: previous.selection, agentStatus: previous.canonicalRouting ? 'canonical-configured-check-sync' : 'instructions-configured', externalTools: 'not-verified' };
      } catch (error) {
        const states = { CONTEXT_MISSING: 'not-prepared', CONTEXT_STALE: 'stale', CONTEXT_INTERRUPTED: 'interrupted' };
        if (states[error.code]) return { context: states[error.code], action: error.action, externalTools: 'not-verified' };
        throw error;
      }
    },
    async search(target, query, options) {
      validateQuery(query); const { index } = await current(target); return retrieve(index, query, options);
    },
    async export(target, query, options = {}) {
      validateQuery(query); const { index } = await current(target); return formatExport(retrieve(index, query, { maxResults: 20 }), options);
    },
  };
}
