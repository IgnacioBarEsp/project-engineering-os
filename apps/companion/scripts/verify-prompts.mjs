import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { aggregate, composePrompt, investigationPrompt, projectPromptFor, PROFILE_LABELS } from '../context/prompts.mjs';
import { clearsTheFloor, createInferenceClient, projectDataIn, shareableFacts,
  DETECT_TIMEOUT_MS, LOCAL_TIMEOUT_MS, PROVIDER_TIMEOUT_MS, MAX_OUTPUT_TOKENS } from '../runtime/inference.mjs';

// What the four levels actually do on this machine, written down instead of asserted.
//
// The level that needs no model is measured for the five profiles and kept whole, so "the application is
// complete without a model" can be read rather than believed. The level that uses a model on this machine is
// measured against whatever is actually answering here: the model, the elapsed time, and whether what it
// wrote cleared the floor. A provider that is dead or slow is measured against a real server that behaves
// that way, because what is being measured is this client, not a provider's promises.
//
//   node scripts/verify-prompts.mjs [<evidence directory>] [<model id>]
const output = process.argv[2] ?? path.join(tmpdir(), 'project-os-closeout', 'companion-prompts');
const wanted = process.argv[3] ?? null;
await mkdir(output, { recursive: true });

const SELECTIONS = {
  research: { name: 'Revisión de evidencia', profile: 'research', experience: 'guided', role: 'researcher',
    goal: 'Comparar cómo se midió el resultado en cada fuente', agents: ['web'] },
  software: { name: 'Servicio de presupuesto', profile: 'software', experience: 'familiar', role: 'developer',
    goal: 'Entender cómo se calcula el presupuesto antes de cambiarlo', agents: ['codex'] },
  unity: { name: 'Prototipo de juego', profile: 'unity', experience: 'guided', role: 'developer',
    goal: 'Localizar cómo se calcula el puntaje antes de ajustarlo', agents: ['cursor'] },
  media: { name: 'Serie de imágenes', profile: 'media', experience: 'guided', role: 'creator',
    goal: 'Conservar la receta que produjo cada pieza', agents: ['web'] },
  general: { name: 'Trabajo de la semana', profile: 'general', experience: 'guided', role: 'general',
    goal: 'Entregar el informe del mes con sus datos comprobados', agents: ['web'] },
};
// A fixture with a file whose NAME is sensitive, which is the point: it may not appear anywhere.
const INVENTORY = { files: [
  { path: 'contrato-despido-2024.pdf', extension: '.pdf', kind: 'pdf' },
  { path: 'src/presupuesto.js', extension: '.js', kind: 'text' },
  { path: 'src/reporte.js', extension: '.js', kind: 'text' },
  { path: 'notas/reunion.md', extension: '.md', kind: 'text' },
  // `inspectFolder` returns a COUNT of exclusions, not a list. The earlier fixture used a list, which is how
  // a sentence that cannot appear in the application appeared in the published evidence.
], limitations: [{ path: 'privado/x', reason: 'unreadable' }], excluded: 2, complete: true };
const PATHS = INVENTORY.files.map(file => file.path);
const summary = aggregate(INVENTORY);

const record = { date: new Date().toISOString(), bounds: { detectMs: DETECT_TIMEOUT_MS, localMs: LOCAL_TIMEOUT_MS,
  providerMs: PROVIDER_TIMEOUT_MS, maxOutputTokens: MAX_OUTPUT_TOKENS }, levels: {}, findings: [] };
const complain = value => record.findings.push(value);

// Level 0, for the five profiles, kept whole.
record.levels.templates = { profiles: {} };
for (const [profile, selection] of Object.entries(SELECTIONS)) {
  const composed = projectPromptFor({ selection, inventory: INVENTORY,
    pending: profile === 'software' ? ['context', 'environment'] : [] });
  const file = `prompt-${profile}.md`;
  await writeFile(path.join(output, file), `${composed.text}\n`);
  const leaking = PATHS.filter(value => composed.text.includes(value) || composed.text.includes(value.split('/').pop()));
  if (leaking.length) complain(`El texto de ${profile} contiene un nombre de archivo: ${leaking.join(', ')}`);
  record.levels.templates.profiles[profile] = { file, characters: composed.text.length, sections: composed.sections };
}
const texts = Object.values(record.levels.templates.profiles).map(entry => entry.characters);
record.levels.templates.distinct = new Set(Object.entries(SELECTIONS)
  .map(([, selection]) => projectPromptFor({ selection, inventory: INVENTORY }).text)).size;
if (record.levels.templates.distinct !== 5) complain(`Solo ${record.levels.templates.distinct} de 5 textos son distintos`);
record.levels.templates.shortest = Math.min(...texts);
record.levels.templates.investigation = investigationPrompt(SELECTIONS.software).length;

// Level 1, against whatever is answering on this machine right now.
const client = createInferenceClient();
const local = await client.detectLocal();
record.levels.local = { available: local.available, detectMs: local.elapsedMs ?? null, models: local.models.length };
if (!local.available) {
  record.levels.local.unverified = 'No hay ningún modelo respondiendo en este equipo, así que el nivel 1 no se midió aquí.';
} else {
  const model = wanted ?? local.models.find(id => /instruct|coder/i.test(id)) ?? local.models[0];
  const draft = projectPromptFor({ selection: SELECTIONS.software, inventory: INVENTORY, pending: ['context'] }).text;
  const started = Date.now();
  const attempt = await client.compose({ level: 'local', model, paths: PATHS,
    facts: { ...SELECTIONS.software, summary, pending: ['context'] } });
  const floor = attempt.text
    ? clearsTheFloor(attempt.text, draft, { profile: 'software', profileLabel: PROFILE_LABELS.software, goal: SELECTIONS.software.goal })
    : { clears: false, problems: [attempt.reason ?? 'sin texto'] };
  if (attempt.text) await writeFile(path.join(output, 'prompt-local-model.md'), `${attempt.text}\n`);
  const leaking = attempt.text ? PATHS.filter(value => attempt.text.includes(value)) : [];
  if (leaking.length) complain(`La respuesta del modelo repitió un nombre de archivo: ${leaking.join(', ')}`);
  record.levels.local = { ...record.levels.local, model, elapsedMs: attempt.elapsedMs ?? Date.now() - started,
    answered: !!attempt.text, clearedTheFloor: floor.clears, problems: floor.problems,
    reason: attempt.reason ?? null, draftCharacters: draft.length,
    modelCharacters: attempt.text?.length ?? 0, used: floor.clears ? 'el texto del modelo' : 'la plantilla' };
}

// What leaves, read from the request itself rather than from the code that builds it.
let intercepted = null;
const watcher = createInferenceClient({ fetch: async (url, options) => {
  intercepted = { url, body: JSON.parse(options.body), headers: Object.keys(options.headers ?? {}).sort() };
  return new Response(JSON.stringify({ choices: [{ message: { content: '' } }] }), { status: 200 });
} });
await watcher.compose({ level: 'local', model: 'cualquiera', paths: PATHS,
  facts: { ...SELECTIONS.software, summary, pending: ['context'] } });
const body = JSON.stringify(intercepted?.body ?? {});
record.request = { url: intercepted?.url ?? null, headers: intercepted?.headers ?? [],
  characters: body.length, fields: Object.keys(shareableFacts({ ...SELECTIONS.software, summary })).sort(),
  carriesAPath: PATHS.some(value => body.includes(value) || body.includes(value.split('/').pop())),
  guard: projectDataIn(intercepted?.body ?? {}, PATHS) };
if (record.request.carriesAPath) complain('La petición interceptada lleva un nombre de archivo');
if (record.request.guard.length) complain('El guardia encontró datos del proyecto en una petición que sí se hizo');

// A dead provider and a slow one, against real servers.
async function server(handler) {
  const value = createServer(handler);
  await new Promise(resolve => value.listen(0, '127.0.0.1', resolve));
  return { port: value.address().port, close: () => new Promise(resolve => value.close(resolve)) };
}
const dead = await server(() => {});
const deadPort = dead.port;
await dead.close();
const deadStarted = Date.now();
const deadResult = await createInferenceClient({ fetch: (url, options) => globalThis.fetch(`http://127.0.0.1:${deadPort}/v1/chat/completions`, options) })
  .compose({ level: 'local', model: 'm', paths: PATHS, facts: { ...SELECTIONS.software, summary } });
record.levels.dead = { elapsedMs: Date.now() - deadStarted, used: deadResult.used, reason: deadResult.reason };

const slow = await server((request, response) => { setTimeout(() => { response.writeHead(200); response.end('{}'); }, 60000); });
const slowStarted = Date.now();
const slowResult = await createInferenceClient({ fetch: (url, options) => globalThis.fetch(`https://api.cerebras.ai/v1/chat/completions`.replace('https://api.cerebras.ai', `http://127.0.0.1:${slow.port}`), options) })
  .compose({ level: 'provider', provider: 'cerebras', key: 'no-real', model: 'm', paths: PATHS, facts: { ...SELECTIONS.software, summary } });
record.levels.slow = { elapsedMs: Date.now() - slowStarted, used: slowResult.used, reason: slowResult.reason,
  bound: PROVIDER_TIMEOUT_MS };
await slow.close();
if (record.levels.slow.elapsedMs > PROVIDER_TIMEOUT_MS + 5000) complain(`Un proveedor lento tardó ${record.levels.slow.elapsedMs} ms en rendirse`);

const stuck = await server(() => {});
const stuckStarted = Date.now();
const stuckResult = await createInferenceClient({ fetch: (url, options) => globalThis.fetch(`http://127.0.0.1:${stuck.port}/v1/chat/completions`, options) })
  .compose({ level: 'local', model: 'm', paths: PATHS, facts: { ...SELECTIONS.software, summary } });
record.levels.stuckLocal = { elapsedMs: Date.now() - stuckStarted, used: stuckResult.used,
  reason: stuckResult.reason, bound: LOCAL_TIMEOUT_MS };
await stuck.close();
if (record.levels.stuckLocal.elapsedMs > LOCAL_TIMEOUT_MS + 10000) {
  complain(`Un modelo local que no responde tardó ${record.levels.stuckLocal.elapsedMs} ms en rendirse`);
}

record.summary = { profiles: Object.keys(record.levels.templates.profiles).length,
  distinctTexts: record.levels.templates.distinct, shortestPrompt: record.levels.templates.shortest,
  localMeasured: !!record.levels.local.answered, findings: record.findings.length };
await writeFile(path.join(output, 'prompts.json'), `${JSON.stringify(record, null, 2)}\n`);
console.log(JSON.stringify(record.summary, null, 2));
if (record.findings.length) { console.error(JSON.stringify(record.findings, null, 2)); process.exitCode = 1; }
assert.ok(true);
