import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, hash, snapshot, writeChecked, withLock, fail, json } from '../engine/files.mjs';
import { glossaryIdsIn } from '../ui/glossary.mjs';
import { createPreparationEngine, normalizeSelection } from '../engine/preparation.mjs';
import { createContextEngine } from '../context/engine.mjs';
import { createConstructorAdapter } from '../engine/constructor-adapter.mjs';
import { recipesFor } from '../context/recipes.mjs';
import { aggregate, investigationPrompt, projectPromptFor, PROFILE_LABELS } from '../context/prompts.mjs';
import { createInferenceClient, clearsTheFloor, withLocalRules, LEVELS, LEVEL_LABELS, PROVIDERS } from '../runtime/inference.mjs';
import { graphOptions } from '../context/graph-tools.mjs';
import { createActivationEngine } from '../runtime/activation.mjs';
import { createCodeGraphEngine } from '../runtime/codegraph.mjs';

const UUID = /^[a-f0-9-]{36}$/;
const ROLES = ['researcher','student','developer','freelancer','creator','general'];
// A read of a remembered folder can hang for as long as the operating system is willing to wait for a
// network share. The project list reads every row before it can render anything, so an unreachable share
// froze the whole window with no indicator and no way to stop. Exported so the bound itself can be tested
// rather than only observed.
export const SUMMARY_BUDGET_MS = 1500;
export function withBudget(work, ms) {
  let timer;
  return Promise.race([
    Promise.resolve(work).finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(Error('summary budget exceeded'), {
        code: 'FOLDER_UNREACHABLE', message: 'Esta carpeta no respondió a tiempo.',
        action: 'Puede estar en una unidad de red o desconectada. Ábrelo para comprobarlo.' })), ms);
      // Deliberately NOT unref'd. An earlier version did, reasoning that a pending timer should not hold
      // the process open — but when the read it is bounding has stopped answering, this timer is the ONLY
      // thing that can settle the race, and an unref'd timer lets the loop drain and the process exit
      // before it fires. The timer is cleared as soon as the work settles, so it can outlive the operation
      // by at most the budget, which is the bound itself.
    }),
  ]);
}
export const DESTINATIONS = Object.freeze({ web: 'https://chatgpt.com/', 'claude-code': 'https://claude.ai/',
  codex: 'https://chatgpt.com/codex', cursor: 'https://cursor.com/', 'github-copilot': 'https://github.com/copilot', opencode: 'https://opencode.ai/',
  antigravity: 'https://antigravity.google/' });
export function publicError(error) {
  if(error?.name==='AbortError')return {code:'CANCELLED',message:'La operación se detuvo a petición tuya.',action:'Se conservó el trabajo completado. Revisa el estado antes de continuar.'};
  const known = typeof error?.code === 'string' && (error.action || error.remediation);
  return { code: known ? error.code : 'OPERATION_FAILED', message: known ? error.message : 'No pudimos terminar esta acción.',
    action: known ? (error.action ?? error.remediation) : 'Conservamos tus archivos. Comprueba que la carpeta esté disponible y vuelve a intentarlo.' };
}
// A verdict is what a real check found, saved so a list can show it without running it again. The check
// re-inspects the folder, re-hashes the sources and, for software, verifies the managed toolchain — minutes
// of work that belongs to opening one project. So the check records its result together with the digest of
// every file it depended on, and the list re-reads those digests, which it already pays for because reading
// receipts is what `summary()` does.
//
// The comparison is falsifiable in one direction only: a digest set that still matches does not prove the
// project is ready now, it only fails to disprove it. Every doubt — no verdict, a moved folder, a witness
// that could not be read or had to be truncated — therefore resolves away from ready, and the screen says
// when the check ran and that it did not re-read the person's files.
export const WITNESS_LIMIT = 200, WITNESS_MAX_BYTES = 8 * 1024 * 1024, UNREADABLE = 'unreadable';
export const VERDICTS_MAX_BYTES = 8 * 1024 * 1024, WITNESS_PATH_MAX = 256;
export const REQUIRED_STAGES = Object.freeze({ research: ['base', 'context'], media: ['base', 'context'],
  general: ['base', 'context'], software: ['base', 'context', 'environment', 'engineering'],
  unity: ['base', 'context', 'environment', 'engineering'] });
export const STAGE_IDS = Object.freeze(['base', 'context', 'environment', 'engineering', 'code']);
// A code map is an addition this interface offers, and a software project with no code files has nothing to
// map, so never having created one is not a missing stage. A stale, corrupt or unrepaired one is: it is a
// claim that stopped holding, and a project carrying it is not ready.
const CODE_SOUND = ['verified', 'empty', 'not-prepared', 'not-requested'];
const reason = (...values) => values.find(value => typeof value === 'string' && value) ?? 'unknown';
export function stageReport(status) {
  const profile = status.base?.selection?.profile ?? status.project?.selection?.profile ?? null;
  const required = REQUIRED_STAGES[profile] ?? ['base', 'context'];
  const stages = [{ id: 'base', state: status.base?.base === 'prepared' && status.base?.inventory === 'current' ? 'ready'
      : status.base?.base === 'prepared' ? 'inventory-stale' : reason(status.base?.base, status.base?.status) },
    { id: 'context', state: status.context?.context === 'current' ? 'ready' : reason(status.context?.context, status.context?.status) }];
  if (required.includes('environment')) stages.push({ id: 'environment',
    state: !status.capabilities?.environment ? 'not-available'
      : status.environment?.status === 'prepared' ? 'ready' : reason(status.environment?.status) });
  if (required.includes('engineering')) stages.push({ id: 'engineering',
    state: status.engineering?.files === 'prepared' && status.engineering?.workflows === 'verified' ? 'ready'
      : status.engineering?.files !== 'prepared' ? reason(status.engineering?.files) : reason(status.engineering?.workflows) });
  const code = status.code?.status ?? 'not-requested';
  if (!CODE_SOUND.includes(code)) stages.push({ id: 'code', state: reason(code) });
  return { profile, required, stages };
}
export const pendingStages = report => report.stages.filter(stage => stage.state !== 'ready');
const relative = value => typeof value === 'string' && !!value && value.length <= WITNESS_PATH_MAX && !path.isAbsolute(value)
  && !value.split(/[\\/]/).includes('..') && !/[\x00-\x1f\x7f]/.test(value);
const witnessDigest = value => value === null || value === UNREADABLE || (typeof value === 'string' && /^[a-f0-9]{64}$/.test(value));
function validVerdict(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value) && UUID.test(value.id ?? '')
    && typeof value.rootHash === 'string' && /^[a-f0-9]{64}$/.test(value.rootHash)
    && typeof value.at === 'string' && value.at.length <= 40 && !Number.isNaN(Date.parse(value.at))
    && (value.profile === null || (typeof value.profile === 'string' && Object.hasOwn(REQUIRED_STAGES, value.profile)))
    && Array.isArray(value.required) && value.required.every(id => STAGE_IDS.includes(id))
    && Array.isArray(value.stages) && value.stages.length <= STAGE_IDS.length
    && value.stages.every(stage => !!stage && STAGE_IDS.includes(stage.id) && typeof stage.state === 'string'
      && stage.state.length <= 40 && /^[a-z-]+$/.test(stage.state))
    // Every stage the profile requires has to be present. An independent review wrote a verdict whose
    // `required` named four stages and whose `stages` was empty, and the row carried the mark: nothing was
    // not ready, because nothing was there. The spec says an absent stage counts as not ready, and this is
    // where absent is decided. A verdict with no witness is refused for the same reason: it could never be
    // disproved, so it would be a permanent mark.
    && value.required.every(id => value.stages.some(stage => stage.id === id))
    && Array.isArray(value.witness) && value.witness.length > 0 && value.witness.length <= WITNESS_LIMIT
    && value.witness.every(item => !!item && relative(item.path) && witnessDigest(item.hash) && STAGE_IDS.includes(item.stage))
    && typeof value.witnessTruncated === 'boolean';
}
// What a person is told about a stage that is not ready. The internal token never reaches a screen: every
// state a stage can report has a sentence here, and a state without one falls back to a sentence that says
// what is true — that this stage has to be checked again — instead of printing its code.
const STAGE_GUIDE = Object.freeze({
  // The title depends on the state, because the same stage fails for reasons that are not the same
  // sentence: choices that were never written, and a folder that changed after they were.
  base: { title: 'Falta guardar tus elecciones en esta carpeta', action: 'prepare-project',
    titles: { 'inventory-stale': 'Tu carpeta cambió desde que se miró por última vez' },
    causes: { 'not-prepared': 'Todavía no se ha escrito nada aquí.',
      interrupted: 'Una operación quedó a medias y hay que continuarla o deshacerla.',
      'inventory-stale': 'Lo que se guardó ya no describe lo que hay dentro. Volver a mirarla es un paso.' },
    fallback: 'Hay que revisar esta preparación de nuevo.' },
  context: { title: 'Falta leer tus archivos', action: 'read-files',
    causes: { 'not-prepared': 'Todavía no se han leído.',
      stale: 'Cambiaron después de la última lectura.',
      interrupted: 'Una lectura quedó a medias y hay que continuarla o deshacerla.' },
    fallback: 'Hay que volver a leerlos.' },
  environment: { title: 'Faltan las herramientas de desarrollo', action: 'review-development',
    causes: { 'not-prepared': 'Todavía no se han preparado.',
      'not-available': 'Esta instalación no puede comprobarlas, así que no se afirma nada sobre ellas.',
      'requires-action': 'Hay algo por resolver antes de poder usarlas.' },
    fallback: 'Hay que revisarlas de nuevo.' },
  engineering: { title: 'Faltan las instrucciones de desarrollo o falta comprobarlas', action: 'review-development',
    causes: { 'requires-action': 'Hay diferencias o conflictos por resolver.',
      'not-verified': 'Los archivos están, pero todavía no se comprobó que la herramienta responda.',
      interrupted: 'Una operación quedó a medias y hay que continuarla o deshacerla.',
      stale: 'Cambió un archivo desde que se comprobó.' },
    fallback: 'Hay que revisarlas de nuevo.' },
  code: { title: 'El mapa de tu código dejó de coincidir con tus archivos', action: 'review-code-map',
    causes: { stale: 'Tus archivos cambiaron después de crearlo.',
      corrupt: 'Su registro no se puede leer.',
      'requires-repair': 'Una herramienta que necesita quedó en mal estado.' },
    fallback: 'Hay que revisarlo de nuevo.' },
});
const causeOf = (id, state) => STAGE_GUIDE[id].causes[state] ?? STAGE_GUIDE[id].fallback;
// The text a person hands to their AI. It names no folder and no project: the AI reads the preparation in the
// folder it was given, and a guide whose text differed only by a name would make two projects look different
// without any of their work being different.
const promptFor = recipe => [`Objetivo: ${recipe.title}.`,
  'Antes de responder, lee .project-os/companion/START.md y, si existe, .project-os/companion/context/MAP.md en la carpeta de este proyecto.',
  `Necesitas: ${recipe.inputs.join('; ')}.`, 'Pasos:',
  ...recipe.steps.map((step, index) => `${index + 1}. ${step}`),
  `Entrega: ${recipe.outputs.join('; ')}.`, 'Antes de darlo por terminado, comprueba:',
  ...recipe.validation.map(check => `- ${check}`), recipe.stop].join('\n');
// Pending stages first, in the order they can be done, then the ways of working this kind of project has.
// A pending stage carries no prompt on purpose: reading your files or preparing the managed tools is work
// this application does, and handing someone text to ask an AI for it would be describing a capability the
// AI does not have.
export function guideSteps(report, recipes) {
  const steps = [];
  for (const id of [...report.required, 'code']) {
    const stage = report.stages.find(entry => entry.id === id);
    if (!stage || stage.state === 'ready' || !STAGE_GUIDE[id]) continue;
    // A project that already has its answers saved must not be sent to a blank wizard to save them again.
    // An independent review followed this step and landed on an empty form with the profile reset, having
    // left the project — for the most common state a project can be in. When the answers exist, the step
    // reviews them against this same folder; only a project that never had them starts the wizard.
    const action = id === 'base' && report.profile && stage.state !== 'not-prepared' ? 'resave-base'
      : STAGE_GUIDE[id].action;
    steps.push({ kind: 'app', stage: id, title: STAGE_GUIDE[id].titles?.[stage.state] ?? STAGE_GUIDE[id].title,
      why: causeOf(id, stage.state), action, prompt: null });
  }
  for (const recipe of recipes) steps.push({ kind: 'prompt', stage: null, title: recipe.title,
    why: `Necesitas ${recipe.inputs.join(', ').toLowerCase()}.`, action: null, prompt: promptFor(recipe) });
  return steps;
}
const text = (value, max, label) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\x00-\x1f\x7f]/.test(value)) fail('INPUT_INVALID', `Revisa ${label}.`);
  return value.trim();
};
function exact(input, keys) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).some(k=>!keys.includes(k))) fail('INPUT_INVALID', 'La solicitud contiene datos no reconocidos.');
  return input;
}
function selection(input) {
  exact(input,['name','profile','agents','experience','role','goal']);
  if (!ROLES.includes(input.role)) fail('ROLE_INVALID','Elige el perfil que te representa.');
  return { ...normalizeSelection(input), role: input.role, goal: text(input.goal,500,'el objetivo del proyecto (hasta 500 caracteres)') };
}
const fileList = plan => plan.files.map(({path: p,action,bytes})=>({path:p,action,bytes}));
// What the person hands to their AI. It used to be one template with the name and the goal in it, identical
// for the five profiles — "muy simple, vago y sin profundidad" in the maintainer's words. Now it is composed
// from the profile, the experience level, the goal, the chosen AI, the pending stages and an aggregate of file
// types, and the only thing about the folder that ever reaches it is that aggregate.
const INFERENCE_MAX_NOTES = 4000;
const projectPrompt = projectPromptFor;

// Only the trusted main process supplies native capabilities and the pinned core. Renderer payloads
// cannot choose a filesystem root, module, URL or executable.
export async function createDesktopService({ dataRoot, core, environment = null, localApps = null, chooseFolder, copyText, openExternal, models = null, onProgress = () => {} }) {
  await mkdir(dataRoot,{recursive:true});
  const historyRoot = await canonicalFolder(dataRoot), base = createPreparationEngine(), context = createContextEngine();
  const engineering = createConstructorAdapter(environment?.core ?? core), projects = new Map(), plans = new Map(), exports = new Map(), handoffs = new Map(), guides = new Map();
  const activation = environment ? createActivationEngine(environment) : null;
  const inferenceClient = models ?? createInferenceClient();
  const notes = new Map();
  const codeGraph = environment ? createCodeGraphEngine(environment.manager, { readOptions: root => context.configuration(root) }) : null;
  let job = null;
  async function history() {
    const state=await snapshot(historyRoot,'projects.json',256*1024);
    if (!state.content) return {state,items:[]};
    let value;try {value=JSON.parse(state.content);} catch {fail('HISTORY_INVALID','No se puede leer el historial local.','La carpeta de tus proyectos sigue intacta. Conserva el registro para recuperarlo.');}
    if (value?.version!==1 || !Array.isArray(value.items) || value.items.length>50 || value.items.some(i=>!i || !UUID.test(i.id??'') || typeof i.root!=='string' || !path.isAbsolute(i.root) || i.root.length>4096 || typeof i.name!=='string' || i.name.length>100)) fail('HISTORY_INVALID','El historial local no tiene un formato reconocido.');
    for (const item of value.items) if (item.selection) selection(item.selection);
    if (new Set(value.items.map(i=>i.id)).size!==value.items.length) fail('HISTORY_INVALID','El historial contiene identificadores repetidos.');
    return {state,items:value.items};
  }
  // Companion's own opinion about a project, kept beside the history rather than inside the person's folder:
  // this application writes into that folder only what the person approved in a plan, a verdict copied with
  // a folder would claim to be about the copy, and duplicating would then have to decide whether to copy it.
  // A corrupt or unrecognised file degrades to "no verdict", which shows every project as unchecked — the
  // safe direction. The history does not do that, and must not: losing it loses the person's projects.
  async function readVerdicts() {
    // Any failure degrades to "no verdict", not just an unparseable one: a file too large for the bound, a
    // directory where the file should be, a permission error. An independent review put a nine-megabyte
    // file there and the list stopped rendering and projects stopped opening, because the read threw from
    // outside the per-row try. `readable: false` is carried so a write does not overwrite what it could not
    // read.
    let state;
    try { state = await snapshot(historyRoot, 'verdicts.json', VERDICTS_MAX_BYTES); }
    catch { return { state: { content: null, hash: null }, items: [], readable: false }; }
    if (!state.content) return { state, items: [], readable: true };
    let value; try { value = JSON.parse(state.content); } catch { return { state, items: [], readable: true }; }
    if (value?.version !== 1 || !Array.isArray(value.items)) return { state, items: [], readable: true };
    return { state, items: value.items.filter(validVerdict).slice(0, 50), readable: true };
  }
  const witnessHash = async (root, item) => {
    try { return (await snapshot(root, item, WITNESS_MAX_BYTES)).hash; } catch { return UNREADABLE; }
  };
  // Every stage names its own files; the digests are all computed here, so no stage's verdict depends on
  // another implementation's idea of a digest. A stage that cannot even list its files — an activation
  // receipt written for a different folder, for instance — makes the witness truncated, and a truncated
  // witness can never be shown as ready.
  async function witnessFor(root, required, engineeringResult) {
    const paths = new Map(); const failed = [];
    const add = (stage, list) => { for (const item of list) if (relative(item) && !paths.has(item)) paths.set(item, stage); };
    const collect = async (stage, work) => { try { add(stage, await work()); } catch { failed.push(stage); } };
    await collect('base', () => base.witnessPaths(root));
    await collect('context', () => context.witnessPaths(root));
    if (required.includes('environment') && environment) await collect('environment', () => environment.witnessPaths());
    if (required.includes('engineering')) {
      if (activation) await collect('engineering', () => activation.witnessPaths(root));
      add('engineering', (engineeringResult?.plan?.operations ?? []).map(operation => operation.target));
    }
    const entries = [...paths].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const witness = [];
    for (const [item, stage] of entries.slice(0, WITNESS_LIMIT)) witness.push({ path: item, stage, hash: await witnessHash(root, item) });
    return { witness, truncated: entries.length > WITNESS_LIMIT || !!failed.length || witness.some(entry => entry.hash === UNREADABLE) };
  }
  async function changedStages(root, verdict) {
    const changed = new Set();
    for (const item of verdict.witness) if (await witnessHash(root, item.path) !== item.hash) changed.add(item.stage);
    return [...changed];
  }
  // Saving the verdict is a side effect of a check the person asked for, so it may not be able to fail that
  // check. An abandoned write lock in this application's own data directory used to turn every "open
  // project" into BUSY once the verdict was written from here, and a read-only data directory would do the
  // same. A verdict that could not be saved simply is not there, and the list says the project has not been
  // checked, which is true.
  async function recordVerdict(p, result, engineeringResult) {
    const report = stageReport(result);
    let entry = null;
    try {
      const { witness, truncated } = await witnessFor(p.root, report.required, engineeringResult);
      entry = { id: p.id, rootHash: hash(p.root), at: new Date().toISOString(), profile: report.profile,
        required: report.required, stages: report.stages, witness, witnessTruncated: truncated || !witness.length };
      await withLock(historyRoot, async () => {
        const { state, items, readable } = await readVerdicts();
        if (!readable) fail('VERDICT_UNREADABLE', 'No se pudo leer el registro de comprobaciones.');
        let kept = [entry, ...items.filter(item => item.id !== entry.id)].slice(0, 50);
        // The bound is on the file, not only on the number of entries: a run of large witnesses could
        // otherwise write a file the next read has to refuse.
        while (kept.length > 1 && Buffer.byteLength(json({ version: 1, items: kept })) > VERDICTS_MAX_BYTES) kept.pop();
        await writeChecked(historyRoot, 'verdicts.json', json({ version: 1, items: kept }), state.hash, VERDICTS_MAX_BYTES);
      });
      return { ...entry, saved: true };
    } catch (error) { return { ...(entry ?? { at: null, required: report.required, stages: report.stages,
      witness: [], witnessTruncated: true }), saved: false, error: publicError(error) }; }
  }
  // What the person chose about models, kept beside the history. The key is deliberately NOT here: it lives in
  // memory for the session and the screen says so. Storing a credential would mean inventing a keystore, and
  // this application packages with `asar: false` — nothing secret can live in or beside it.
  const inference = { level: 'off', provider: 'cerebras', model: '', key: null };
  async function readInference() {
    let state;
    try { state = await snapshot(historyRoot, 'inference.json', 64 * 1024); }
    catch { return { state: { content: null, hash: null }, value: null }; }
    if (!state.content) return { state, value: null };
    let value; try { value = JSON.parse(state.content); } catch { return { state, value: null }; }
    if (value?.version !== 1 || !LEVELS.includes(value.level)) return { state, value: null };
    return { state, value: { level: value.level,
      provider: Object.hasOwn(PROVIDERS, value.provider) ? value.provider : 'cerebras',
      model: typeof value.model === 'string' ? value.model.slice(0, 120) : '' } };
  }
  // What was chosen last time. It was written and never read back, so every session started at `off` while a
  // test asserted "the chosen level is remembered" by looking at bytes on disk rather than at behaviour.
  // The key is not here and is asked for again, which is the cost of not storing a credential.
  {
    const stored = await readInference();
    if (stored.value) Object.assign(inference, stored.value);
  }
  async function remember(project, chosen) {
    await withLock(historyRoot,async()=>{
      const {state,items}=await history();
      const item={id:project.id,root:project.root,name:chosen?.name??project.name,selection:chosen??project.selection??null};
      await writeChecked(historyRoot,'projects.json',json({version:1,items:[item,...items.filter(i=>i.root!==project.root)].slice(0,50)}),state.hash,256*1024);
      Object.assign(project,item);
    });
  }
  function noJob() {if(job)fail('BUSY','Hay una operación en curso.','Espera a que termine o usa Detener.');}
  async function project(id) {
    if (typeof id!=='string' || !projects.has(id)) fail('PROJECT_UNKNOWN','Vuelve a abrir el proyecto desde tu historial o elige su carpeta.');
    const p=projects.get(id);if(await canonicalFolder(p.root)!==p.root)fail('FOLDER_CHANGED','La carpeta cambió de ubicación.');return p;
  }
  async function operation(label, work) {
    noJob(); const controller=new AbortController();job={id:randomUUID(),label,controller};
    const controls={signal:controller.signal,onProgress:progress=>onProgress({label,...progress})};
    try {onProgress({label,stage:'starting'});return await work(controls);} finally {job=null;onProgress({label,stage:'idle'});}
  }
  function keepPlan(p,kind,plan,extra={}) {const id=randomUUID();plans.set(id,{project:p.id,kind,engineId:plan.id,...extra});if(plans.size>20)plans.delete(plans.keys().next().value);return id;}
  async function usePlan(id,kind) {noJob();const plan=plans.get(id);if(!plan||plan.kind!==kind)fail('PLAN_UNKNOWN','Vuelve a revisar los cambios antes de aplicarlos.');const p=await project(plan.project);plans.delete(id);return {plan,p};}
  async function status(p, controls = {}) {
    const b=await safeStage(()=>base.verify(p.root),controls), c=await safeStage(()=>context.verify(p.root),controls);
    const requested=['software','unity'].includes(b.selection?.profile??p.selection?.profile);
    const tools=environment&&requested ? await safeStage(()=>environment.verify(p.root,controls),controls) : {status:'not-requested'};
    const e=requested ? await safeStage(()=>engineering.verify(p.root,controls),controls) : {files:'not-requested',workflows:'not-requested'};
    const a=activation&&requested&&e.files==='prepared' ? await safeStage(()=>activation.verify(p.root,controls),controls) : null;
    const code=codeGraph&&requested ? await safeStage(async()=>codeGraph.verify(p.root,await context.configuration(p.root),controls),controls) : {status:'not-requested'};
    const result={project:{id:p.id,name:b.selection?.name??p.name,root:p.root,selection:b.selection??p.selection},base:b,context:c,
      environment:tools,code,capabilities:{environment:!!environment,codeGraph:!!codeGraph},engineering:{files:e.files,workflows:a?.workflows??e.workflows,code:e.code,message:e.message,error:a?.error??e.error,interrupted:!!e.result?.incompleteTransaction,activationInterrupted:a?.workflows==='interrupted'},externalTools:'not-verified'};
    // This is the only place a verdict is written, because this is the only place a real check happens. The
    // engineering witness comes from the targets the core's own check enumerated, so a managed file edited
    // afterwards is visible from the list without the list knowing what the core manages.
    const verdict=await recordVerdict(p,result,e.result);
    return {...result,verdict:{at:verdict.at,required:verdict.required,stages:verdict.stages,
      witnessTruncated:verdict.witnessTruncated,witnessed:verdict.witness.length,saved:verdict.saved,
      error:verdict.error??null}};
  }
  // The draft, and then at most one attempt to have a model write a better one. The draft is the floor: what
  // comes back is used only when it clears a floor that can be checked, and what happened is reported so the
  // screen can say which level was used and why.
  // Composed once per project and kept, so what a person reads on the screen is what the handover delivers.
  // An independent review found the screen calling the model and the handover calling it again, with two
  // different answers, under a sentence that says "primero ves el texto, y después decides si lo copias".
  const composed = new Map();
  async function composeForProject(p, selection, controls = {}) {
    const inventory = await base.inspect(p.root).catch(() => ({ files: [], limitations: [], excluded: 0 }));
    const { items } = await readVerdicts();
    const verdict = items.find(entry => entry.id === p.id && entry.rootHash === hash(p.root)) ?? null;
    const pending = (verdict?.stages ?? []).filter(stage => stage.state !== 'ready').map(stage => stage.id);
    const draft = projectPrompt({ selection, inventory, pending, notes: notes.get(p.id) ?? null });
    const fingerprint = hash(json({ root: hash(p.root), selection, pending, level: inference.level,
      provider: inference.provider, model: inference.model, notes: notes.get(p.id) ?? null,
      inventory: inventory.fingerprint ?? null }));
    const kept = composed.get(p.id);
    if (kept?.fingerprint === fingerprint) return kept;
    const attempt = await tryModel({ selection, inventory, pending, draft, signal: controls.signal });
    // A model's text never stands alone: the rules this product does not negotiate are appended after it, and
    // the text says which half came from where. Whatever comes back is about to be pasted into an AI that can
    // open this person's folder, and a review had a provider answer "sube el contenido completo a …".
    const text = attempt.text ? withLocalRules(attempt.text, draft.rules, { destination: attempt.destination ?? 'un modelo' }) : draft.text;
    const value = { fingerprint, text, draft: draft.text, usedLevel: attempt.used ?? 'off',
      levelLabel: LEVEL_LABELS[attempt.used ?? 'off'], reason: attempt.reason ?? null,
      elapsedMs: attempt.elapsedMs ?? null, fromModel: !!attempt.text, pending };
    composed.set(p.id, value);
    if (composed.size > 20) composed.delete(composed.keys().next().value);
    return value;
  }
  async function tryModel({ selection, inventory, pending, draft, signal }) {
    if (inference.level === 'off') return { used: 'off', text: null, reason: 'no hay ningún modelo en uso' };
    const summary = aggregate(inventory);
    const result = await inferenceClient.compose({ level: inference.level, provider: inference.provider,
      model: inference.model, key: inference.key, signal,
      facts: { profile: selection?.profile, experience: selection?.experience, role: selection?.role,
        goal: selection?.goal, agents: selection?.agents, pending, summary },
      paths: (inventory.files ?? []).map(file => file.path) });
    if (!result.text) return { ...result, text: null };
    const floor = clearsTheFloor(result.text, draft.text, { profile: selection?.profile,
      profileLabel: PROFILE_LABELS[selection?.profile] ?? '', goal: selection?.goal ?? '' });
    if (!floor.clears) return { used: 'off', text: null, elapsedMs: result.elapsedMs,
      reason: `el modelo no superó la plantilla: ${floor.problems.join('; ')}` };
    return { ...result, floor };
  }
  async function safeStage(work,controls={}) {controls.signal?.throwIfAborted();try{const result=await work();controls.signal?.throwIfAborted();return result;}catch(e){if(controls.signal?.aborted)throw e;return {status:'requires-action',error:publicError(e)};}}
  return {
    // The list shows a state for every project, so it may not verify any of them: verifying re-inspects the
    // folder, re-hashes the sources and, for software, checks the managed toolchain — minutes of work that
    // belongs to opening one project. What it shows instead is the verdict of the last real check, together
    // with a re-read of the digests that check depended on: `verified` only when every required stage was
    // verified for real and nothing witnessed has changed, `changed` when something has, `incomplete` when
    // the check found stages missing, `unverified` when there is no verdict for this folder. The renderer
    // says when the check ran and that this does not re-read the person's files. One unreadable or relocated
    // folder becomes that entry's own state and never keeps the rest of the list from rendering.
    //
    // Each row is bounded. Reading a receipt is a filesystem call, and a remembered folder can be on a
    // network share, an unplugged drive or a disconnected VPN — an independent review measured 21 seconds
    // for a two-row list with one project on an unreachable share, with every control disabled and no way
    // to stop. A row that does not answer within the budget becomes `unreadable` with that as its cause,
    // which is true and is what the person can act on. Rows are read concurrently, so the whole list is
    // bounded by the budget rather than by the sum of the rows.
    async listProjects(input={}) {exact(input,[]);noJob();const {items}=await history(),saved=(await readVerdicts()).items;
      return Promise.all(items.map(async i=>{
        // The selection travels with the row because duplicating reuses the person's own answers, and those
        // answers are already theirs. Nothing derived from the folder's contents is added here.
        const entry={id:i.id,name:i.name,root:i.root,profile:i.selection?.profile??null,selection:i.selection??null,
          recorded:true,checkedAt:null,missing:[],changed:[]};
        try {
          return await withBudget((async()=>{
            const [b,c]=await Promise.all([base.summary(i.root),context.summary(i.root)]);
            // A verdict belongs to the folder it was taken in. `rootHash` is the same digest the journals use
            // to refuse an operation that belongs elsewhere, so a moved or replaced folder is unverified
            // rather than inheriting someone else's result.
            const verdict=saved.find(v=>v.id===i.id&&v.rootHash===hash(i.root))??null;
            const changed=verdict&&!verdict.witnessTruncated?await changedStages(i.root,verdict):[];
            // The state travels with the stage, because "your saved choices are missing" and "the snapshot of
            // your folder is out of date" are different sentences and only one of them is true at a time.
            const missing=(verdict?.stages??[]).filter(stage=>stage.state!=='ready')
              .map(stage=>({id:stage.id,state:stage.state}));
            return {...entry,profile:b.selection?.profile??verdict?.profile??entry.profile,
              checkedAt:verdict?.at??null,missing,changed,
              state:b.interrupted||c.interrupted?'interrupted'
                :!b.prepared?'not-prepared'
                :!verdict||verdict.witnessTruncated?'unverified'
                :changed.length?'changed'
                :missing.length?'incomplete'
                :'verified'};
          })(),SUMMARY_BUDGET_MS);
        } catch (error) {return {...entry,state:'unreadable',error:publicError(error)};}
      }));},
    async chooseFolder(input={}) {exact(input,[]);return operation('Elegir carpeta',async()=>{
      const chosen=await chooseFolder();if(!chosen)return null;
      const root=await canonicalFolder(chosen), {items}=await history();
      const prior=items.find(i=>i.root===root), p=prior??{id:randomUUID(),root,name:path.basename(root)};
      projects.set(p.id,p);return {id:p.id,root,name:p.name,inspection:await base.inspect(root)};
    });},
    async openProject(input) {exact(input,['id']);noJob();const {items}=await history(),p=items.find(i=>i.id===input.id);if(!p)fail('PROJECT_UNKNOWN','El proyecto ya no está en el historial.');
      projects.set(p.id,p);return operation('Comprobar proyecto',async controls=>status(await project(p.id),controls));},
    async forgetProject(input) {exact(input,['id']);noJob();await withLock(historyRoot,async()=>{const {state,items}=await history();if(!items.some(i=>i.id===input.id))fail('PROJECT_UNKNOWN','El proyecto no está en el historial.');await writeChecked(historyRoot,'projects.json',json({version:1,items:items.filter(i=>i.id!==input.id)}),state.hash,256*1024);
      // The verdict goes with the entry. Nothing inside the person's folder is read or written here: removing
      // a project from this list is a change to this list.
      const kept=await readVerdicts();
      if(kept.items.some(v=>v.id===input.id))await writeChecked(historyRoot,'verdicts.json',json({version:1,items:kept.items.filter(v=>v.id!==input.id)}),kept.state.hash,8*1024*1024);
    });projects.delete(input.id);return {forgotten:true,projectFilesChanged:false};},
    async previewBase(input) {exact(input,['id','selection']);noJob();const p=await project(input.id),chosen=selection(input.selection);
      return operation('Revisar preparación',async()=>{const plan=await base.plan(p.root,chosen);return {id:keepPlan(p,'base',plan,{selection:chosen}),files:fileList(plan),inventory:plan.inventory,selection:chosen};});},
    async applyBase(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'base');return operation('Preparar proyecto',async controls=>{
      // Remember the folder for crash recovery, but commit the new selection only after its files.
      await remember(p);const result=await base.apply(plan.engineId,controls);await remember(p,plan.selection);return {result,status:await status(p,controls)};
    });},
    async previewEnvironment(input) {exact(input,['id']);noJob();const p=await project(input.id);
      if(!environment||!['software','unity'].includes(p.selection?.profile))fail('ENVIRONMENT_UNAVAILABLE','Este proyecto no necesita estas herramientas de desarrollo.');
      return operation('Revisar herramientas',async controls=>{const plan=await environment.plan(p.root,controls);return {...plan,id:plan.id?keepPlan(p,'environment',plan):null};});},
    async applyEnvironment(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'environment');
      if(!environment)fail('ENVIRONMENT_UNAVAILABLE','La preparación de herramientas no está disponible.');
      return operation('Preparar herramientas',async controls=>{const result=await environment.apply(plan.engineId,controls);return {result,status:await status(p,controls)};});},
    async previewRepair(input) {exact(input,['id']);noJob();const p=await project(input.id);
      if(!environment)fail('ENVIRONMENT_UNAVAILABLE','La reparación de herramientas no está disponible.');
      return operation('Revisar reparación de herramientas',async controls=>{const plan=await environment.planRepair(controls);return {...plan,id:plan.id?keepPlan(p,'repair',plan):null};});},
    async applyRepair(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'repair');
      return operation('Reparar herramientas',async controls=>{const result=await environment.repair(plan.engineId,controls);return {result,status:await status(p,controls)};});},
    async previewEngineering(input) {exact(input,['id']);noJob();const p=await project(input.id);return operation('Revisar entorno de desarrollo',async controls=>{
      const check=await engineering.verify(p.root,controls), kind=check.files==='prepared'?'sync':'bootstrap';
      const plan=await (kind==='sync'?engineering.planSync(p.root,controls):engineering.plan(p.root,controls));
      return {...plan,id:plan.id?keepPlan(p,'engineering',plan,{incompleteTransaction:plan.incompleteTransaction}):null};
    });},
    async applyEngineering(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'engineering');return operation('Preparar entorno de desarrollo',async controls=>{const result=await engineering.apply(plan.engineId,controls);return {result,status:await status(p,controls)};});},
    async previewActivation(input) {exact(input,['id']);noJob();const p=await project(input.id);
      if(!activation||!['software','unity'].includes(p.selection?.profile))fail('ENVIRONMENT_UNAVAILABLE','Este proyecto no necesita activación de desarrollo.');
      return operation('Revisar activación de OpenSpec',async controls=>{const plan=await activation.plan(p.root,controls);return {...plan,id:plan.id?keepPlan(p,'activation',plan):null};});},
    async applyActivation(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'activation');
      if(!activation)fail('ENVIRONMENT_UNAVAILABLE','La activación no está disponible.');
      return operation('Activar OpenSpec',async controls=>{const result=await activation.apply(plan.engineId,controls);return {result,status:await status(p,controls)};});},
    async rollbackEngineering(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'engineering');
      if(!plan.incompleteTransaction)fail('NOT_INTERRUPTED','No hay una operación de ingeniería interrumpida en este plan.');
      return operation('Recuperar entorno de desarrollo',async controls=>{
        const current=await engineering.plan(p.root,controls);
        if(current.incompleteTransaction!==plan.incompleteTransaction)fail('PLAN_STALE','La operación de ingeniería cambió; vuelve a revisarla.');
        const result=await engineering.rollback(p.root,plan.incompleteTransaction,controls);return {result,status:await status(p,controls)};
      });},
    async previewContext(input) {exact(input,['id','exclude']);noJob();const p=await project(input.id);
      return operation('Leer fuentes locales',async controls=>{
        const config=await context.configuration(p.root);
        if(input.exclude!==undefined)config.exclude=input.exclude;
        const plan=await context.plan(p.root,config,controls);
        return {id:keepPlan(p,'context',plan),files:fileList(plan),coverage:plan.coverage,exclude:config.exclude,agentStatus:plan.agentStatus};});},
    async applyContext(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'context');return operation('Preparar contexto',async controls=>{
      const result=await context.apply(plan.engineId,controls);return {result,status:await status(p,controls)};
    });},
    async previewCode(input) {exact(input,['id']);noJob();const p=await project(input.id);
      if(!codeGraph)fail('GRAPH_UNAVAILABLE','La preparación del mapa de código no está disponible.');
      return operation('Revisar mapa de código',async controls=>{const b=await base.verify(p.root),config=await context.configuration(p.root);
        const plan=await codeGraph.plan(p.root,b.selection?.profile,config,controls);return {...plan,id:plan.id?keepPlan(p,'code',plan):null};});},
    async applyCode(input) {exact(input,['plan']);const {p,plan}=await usePlan(input.plan,'code');
      if(!codeGraph)fail('GRAPH_UNAVAILABLE','La preparación del mapa de código no está disponible.');
      return operation('Preparar mapa de código',async controls=>{const result=await codeGraph.apply(plan.engineId,controls);return {result,status:await status(p,controls)};});},
    async searchCode(input) {exact(input,['id','query']);noJob();const p=await project(input.id);
      if(!codeGraph)fail('GRAPH_UNAVAILABLE','La búsqueda de símbolos no está disponible.');
      return operation('Buscar símbolos',async controls=>codeGraph.search(p.root,input.query,await context.configuration(p.root),controls));},
    async previewSync(input) {exact(input,['id']);noJob();const p=await project(input.id);return operation('Revisar instrucciones',async controls=>{const plan=await engineering.planSync(p.root,controls);return {...plan,id:plan.id?keepPlan(p,'engineering',plan,{incompleteTransaction:plan.incompleteTransaction}):null};});},
    async status(input) {exact(input,['id']);noJob();const p=await project(input.id);return operation('Comprobar estado',controls=>status(p,controls));},
    async recover(input) {exact(input,['id','stage','action']);noJob();const p=await project(input.id);
      if(!['base','context','activation'].includes(input.stage)||!['resume','rollback'].includes(input.action)||(input.stage==='activation'&&!activation))fail('RECOVERY_INVALID','Elige una recuperación reconocida.');
      return operation('Recuperar operación',async controls=>{const engine=input.stage==='base'?base:input.stage==='activation'?activation:context;const result=await engine[input.action](p.root,controls);
        const verified=await base.verify(p.root);if(verified.selection)await remember(p,verified.selection);
        return {result,status:await status(p,controls)};});},
    async search(input) {exact(input,['id','query']);noJob();const p=await project(input.id);return operation('Buscar fuentes',()=>context.search(p.root,input.query));},
    // How to work in this project: what it is missing, in the order it can be done, and then the ways of
    // working this kind of project has. Composed here rather than in the renderer for the same reason the
    // context export is: the text that reaches the clipboard is text this application wrote. It reads the
    // saved verdict instead of checking again, so opening this costs nothing, and it reports the glossary
    // words its own visible text uses so the screen can offer their definitions.
    async guide(input) {exact(input,['id']);noJob();const p=await project(input.id);
      const {items}=await readVerdicts(),verdict=items.find(v=>v.id===p.id&&v.rootHash===hash(p.root))??null;
      if(!verdict)fail('VERDICT_MISSING','Todavía no hay una comprobación de este proyecto.','Comprueba el proyecto para saber qué le falta.');
      const steps=guideSteps({profile:verdict.profile,required:verdict.required,stages:verdict.stages},recipesFor(verdict.profile??'general'));
      const id=randomUUID();
      guides.set(id,{project:p.id,witness:verdict.witness,steps});
      if(guides.size>10)guides.delete(guides.keys().next().value);
      // The text handed to an AI is drawn on the screen too, and it is this application's own words. An
      // independent review found `cita` and `firma` visible inside it with no way to open their definitions,
      // because the vocabulary probe excludes `pre` by element type. Whoever composes the text reports the
      // terms, so the whole panel is covered rather than only its headings.
      return {id,profile:verdict.profile,checkedAt:verdict.at,witnessTruncated:verdict.witnessTruncated,
        pending:steps.filter(step=>step.kind==='app').map(step=>step.stage),
        terms:glossaryIdsIn(steps.map(step=>`${step.title} ${step.why} ${step.prompt??''}`).join(' ')),
        steps:steps.map((step,index)=>({index,kind:step.kind,stage:step.stage,title:step.title,why:step.why,action:step.action,prompt:step.prompt}))};},
    async copyGuideStep(input) {exact(input,['guide','step']);noJob();const value=guides.get(input.guide);
      if(!value||!Number.isInteger(input.step)||input.step<0||input.step>=value.steps.length)fail('GUIDE_UNKNOWN','Vuelve a abrir la guía de este proyecto.');
      const p=await project(value.project),step=value.steps[input.step];
      if(!step.prompt)fail('GUIDE_STEP_LOCAL','Este paso se hace en esta aplicación, no en tu IA.','Usa el control que aparece en ese paso.');
      return operation('Copiar un paso de la guía',async()=>{
        for(const item of value.witness)if(await witnessHash(p.root,item.path)!==item.hash)fail('GUIDE_STALE','El proyecto cambió después de preparar esta guía.','Comprueba el proyecto de nuevo para actualizarla.');
        await copyText(step.prompt);return {copied:true,step:input.step,bytes:Buffer.byteLength(step.prompt),sent:false};});},
    // What level is in use, what it would send, and what answers on this machine. Nothing here talks to a
    // provider: detection only asks the loopback interface whether something answers.
    async inferenceStatus(input={}) {exact(input,[]);noJob();
      const local=await inferenceClient.detectLocal();
      return {level:inference.level,provider:inference.provider,model:inference.model,
        hasKey:!!inference.key,keySaved:false,
        levels:LEVELS.map(id=>({id,label:LEVEL_LABELS[id]})),
        providers:Object.entries(PROVIDERS).map(([id,value])=>({id,label:value.label,origin:value.origin})),
        local:{available:local.available,models:local.models,origin:local.origin},
        sends:['el tipo de proyecto que elegiste','tu objetivo y tu perfil','qué etapas faltan','cuántos archivos hay de cada extensión'],
        neverSends:['el contenido de cualquier archivo','el nombre o la ruta de cualquier archivo','lo que tu propia IA te haya reportado']};},
    async setInference(input) {exact(input,['level','provider','model','key']);noJob();
      if(!LEVELS.includes(input.level))fail('INFERENCE_LEVEL','Elige uno de los niveles que la pantalla ofrece.');
      if(input.level!=='off'&&input.level!=='local'&&!Object.hasOwn(PROVIDERS,input.provider))fail('INFERENCE_PROVIDER','Ese proveedor no está en la lista revisada.');
      if(input.key!==null&&(typeof input.key!=='string'||input.key.length>200))fail('INFERENCE_KEY','Revisa la clave que pegaste.');
      inference.level=input.level;
      inference.provider=Object.hasOwn(PROVIDERS,input.provider)?input.provider:inference.provider;
      inference.model=typeof input.model==='string'?input.model.slice(0,120):'';
      // Choosing the local level with no model named picks the first one answering here, so the level cannot
      // be turned on into a state that calls a provider with an empty model identifier.
      if(inference.level==='local'&&!inference.model){
        const found=await inferenceClient.detectLocal();
        inference.model=found.models[0]??'';
      }
      // The key stays in memory for this session only. It is never written anywhere.
      if(input.key!==null)inference.key=input.key||null;
      if(input.level==='off'||input.level==='local')inference.key=null;
      const current=await readInference();
      await withLock(historyRoot,async()=>{await writeChecked(historyRoot,'inference.json',
        json({version:1,level:inference.level,provider:inference.provider,model:inference.model}),current.state.hash,64*1024);});
      return {level:inference.level,provider:inference.provider,model:inference.model,hasKey:!!inference.key,keySaved:false};},
    // The prompt and where it came from: the draft always, the alternative only when it cleared the floor.
    async promptPreview(input) {exact(input,['id']);noJob();const p=await project(input.id);
      return operation('Preparar las instrucciones para tu IA',async controls=>{
        const b=await base.verify(p.root);
        const value=await composeForProject(p,b.selection??p.selection,controls);
        return {text:value.text,draft:value.draft,usedLevel:value.usedLevel,levelLabel:value.levelLabel,
          reason:value.reason,elapsedMs:value.elapsedMs,fromModel:value.fromModel,
          notes:notes.get(p.id)??null,pending:value.pending};});},
    // What the person hands to the AI they already use so it reads their folder and reports back. This is how
    // the composition gets deeper without this application opening a single file.
    async investigationPrompt(input) {exact(input,['id']);noJob();const p=await project(input.id);
      const b=await base.verify(p.root);
      return {text:investigationPrompt(b.selection??p.selection)};},
    async applyNotes(input) {exact(input,['id','notes']);noJob();const p=await project(input.id);
      if(input.notes!==null&&typeof input.notes!=='string')fail('NOTES_INVALID','Pega el texto que te devolvió tu IA.');
      if(input.notes===null||!input.notes.trim())notes.delete(p.id);
      else notes.set(p.id,input.notes.replace(/\s+$/,'').slice(0,INFERENCE_MAX_NOTES));
      if(notes.size>20)notes.delete(notes.keys().next().value);
      return {stored:notes.has(p.id),characters:notes.get(p.id)?.length??0};},
    async workspace(input) {exact(input,['id']);noJob();const p=await project(input.id);return operation('Abrir herramientas del proyecto',async()=>{
      const b=await base.verify(p.root);return {recipes:recipesFor(b.selection?.profile),graphs:await graphOptions(p.root,b.selection?.profile??'general')};});},
    async exportPreview(input) {exact(input,['id','query','maxBytes']);noJob();const p=await project(input.id);
      return operation('Preparar contexto para compartir',async()=>{const result=await context.export(p.root,input.query,{maxBytes:input.maxBytes??12000}),id=randomUUID();
        exports.set(id,{project:p.id,receiptHash:(await snapshot(p.root,'.project-os/companion/context/receipt.json')).hash,...result});if(exports.size>10)exports.delete(exports.keys().next().value);return {id,...result};});},
    async copyExport(input) {exact(input,['export']);noJob();const value=exports.get(input.export);if(!value)fail('EXPORT_UNKNOWN','Prepara y revisa el contexto de nuevo.');
      const p=await project(value.project);return operation('Copiar contexto',async()=>{const check=await context.verify(p.root);if(check.context!=='current'||value.receiptHash!==(await snapshot(p.root,'.project-os/companion/context/receipt.json')).hash)fail('CONTEXT_STALE','Actualiza la vista previa antes de compartir.');await copyText(value.text);return {copied:true,bytes:value.bytes,sent:false};});},
    async handoff(input) {exact(input,['preview','copy']);noJob();const preview=handoffs.get(input.preview);
      if(!preview||typeof input.copy!=='boolean')fail('HANDOFF_INVALID','Revisa la instrucción antes de abrir tu IA.');
      const p=await project(preview.project);
      return operation('Continuar con tu IA',async()=>{const b=await base.verify(p.root);
        if(json(b.selection)!==preview.selection||preview.receiptHash!==(await snapshot(p.root,'.project-os/companion/context/receipt.json')).hash)fail('PLAN_STALE','El proyecto cambió; revisa la instrucción inicial de nuevo.');
        const c=await context.verify(p.root);if(c.context!=='current')fail('CONTEXT_STALE','Prepara o actualiza el contexto antes de continuar.');
        const prompt=preview.prompt;
        let opened;
        if(preview.local)opened=await localApps.open(preview.local,p.root);
        else {await openExternal(DESTINATIONS[preview.agent]);opened={opened:'web',projectAttached:false,agentActivated:false,agentReadProject:false};}
        if(input.copy)await copyText(prompt);handoffs.delete(input.preview);return {...opened,copied:input.copy,prompt};
      });},
    async handoffPreview(input) {exact(input,['id','agent']);noJob();const p=await project(input.id);return operation('Revisar instrucción inicial',async controls=>{
      const b=await base.verify(p.root);if(!Object.hasOwn(DESTINATIONS,input.agent)||!b.selection?.agents.includes(input.agent))fail('HANDOFF_INVALID','Elige una IA del proyecto.');
      const id=randomUUID(),prompt=(await composeForProject(p,b.selection,controls)).text,detected=await localApps?.detect(input.agent)??null;
      // An application found but not verifiable is never launched; the person is told why.
      const local=detected?.unverified?null:detected, unverified=detected?.unverified?{label:detected.label,code:detected.code,message:detected.message}:null;
      handoffs.set(id,{project:p.id,agent:input.agent,prompt,local,selection:json(b.selection),receiptHash:(await snapshot(p.root,'.project-os/companion/context/receipt.json')).hash});
      if(handoffs.size>10)handoffs.delete(handoffs.keys().next().value);
      return {id,prompt,destination:local?.label??DESTINATIONS[input.agent],mode:local?'local':'web',projectAttached:false,folderWillBeRequested:!!local,unverified};
    });},
    async cancel(input={}) {exact(input,[]);if(job)job.controller.abort();return {requested:!!job};},
    async job(input={}) {exact(input,[]);return job?{id:job.id,label:job.label}:null;},
  };
}
