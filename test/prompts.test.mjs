import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  ROUTER_QUESTION_IDS,
  ROUTER_ROUTE_IDS,
  extractPromptContract,
  routerContractFailures,
  routerParityFailures,
  stagePromptFailures,
} from '../scripts/prompt-contract.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT_ROUTER = 'docs/prompts/PROMPT_ROUTER_INICIO.md';
const BLUEPRINT_ROUTER = 'blueprint/core/docs/engineering/PROMPT_ROUTER_INICIO.md';
const STAGE_PROMPTS = [
  ['prompt-00', 'docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md'],
  ['prompt-00', 'blueprint/core/docs/engineering/PROMPT_00_BOOTSTRAP_ENTORNO.md'],
  ['prompt-01', 'docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md'],
  ['prompt-01', 'blueprint/core/docs/engineering/PROMPT_01_DISCOVERY_PROYECTO.md'],
];

function read(relative) {
  return readFile(path.join(packageRoot, relative), 'utf8');
}

const VALID_ROUTER = [
  'Preguntas de clasificación: project, guidance, tracker, agent, remoteSetup. No añadas una sexta.',
  'Ruta beginner: idea breve, organización práctica, entorno, discovery.',
  'Ruta experienced-new: ecosistema, entorno, discovery.',
  'Ruta brownfield: inventario, preservación, gaps confirmados, discovery.',
  'Ejecuta project-os onboarding-plan y registra .project-os/onboarding-state.json.',
  'Este paso exige aprobación humana explícita.',
  'Entrega PROMPT_00_BOOTSTRAP_ENTORNO.md y después PROMPT_01_DISCOVERY_PROYECTO.md.',
  'Relevo entre chats: entrega ruta, gates y rollback sin secretos.',
  'Recuperación: sin estado registrado repite la clasificación.',
  'Después del discovery: CI/CD, MVVM y arquitectura del producto.',
].join('\n');

test('router prompts declare the classifier contract in root and blueprint', async () => {
  const rootContract = extractPromptContract(await read(ROOT_ROUTER));
  const blueprintContract = extractPromptContract(await read(BLUEPRINT_ROUTER));

  assert.deepEqual(routerContractFailures(rootContract), []);
  assert.deepEqual(routerContractFailures(blueprintContract), []);
  assert.deepEqual(rootContract.questions, [...ROUTER_QUESTION_IDS]);
  assert.equal(rootContract.questions.length, 5);
  assert.deepEqual(
    rootContract.routes.map((route) => route.id).sort(),
    [...ROUTER_ROUTE_IDS].sort(),
  );
  for (const route of rootContract.routes) {
    assert.equal(route.steps.at(-1), 'discovery');
  }
});

test('root and blueprint routers keep parity without byte equality', async () => {
  const rootText = await read(ROOT_ROUTER);
  const blueprintText = await read(BLUEPRINT_ROUTER);

  assert.notEqual(rootText, blueprintText);
  assert.deepEqual(
    routerParityFailures(extractPromptContract(rootText), extractPromptContract(blueprintText)),
    [],
  );
});

test('stage prompts consume the recorded route in root and blueprint', async () => {
  for (const [kind, relative] of STAGE_PROMPTS) {
    assert.deepEqual(stagePromptFailures(kind, await read(relative)), [], relative);
  }
});

test('a router that drops a route or adds a sixth question fails the contract', () => {
  assert.deepEqual(routerContractFailures(extractPromptContract(VALID_ROUTER)), []);

  const withoutBrownfield = VALID_ROUTER
    .split('\n')
    .filter((line) => !line.startsWith('Ruta brownfield:'))
    .join('\n');
  assert.deepEqual(
    routerContractFailures(extractPromptContract(withoutBrownfield)),
    ['missing-route brownfield'],
  );

  const sixthQuestion = VALID_ROUTER.replace(
    'project, guidance, tracker, agent, remoteSetup.',
    'project, guidance, tracker, agent, remoteSetup, budget.',
  );
  assert.deepEqual(
    routerContractFailures(extractPromptContract(sixthQuestion)),
    ['questions project,guidance,tracker,agent,remoteSetup,budget'],
  );
});

test('a router that loses a gate, a reference or ends before discovery fails', () => {
  const withoutGate = VALID_ROUTER.replace('Este paso exige aprobación humana explícita.', 'Escribe el estado.');
  assert.deepEqual(
    routerContractFailures(extractPromptContract(withoutGate)),
    ['missing-marker aprobación humana'],
  );

  const withoutPrompt01 = VALID_ROUTER.replace('y después PROMPT_01_DISCOVERY_PROYECTO.md.', 'y termina.');
  assert.deepEqual(
    routerContractFailures(extractPromptContract(withoutPrompt01)),
    ['missing-reference PROMPT_01_DISCOVERY_PROYECTO.md'],
  );

  const stopsBeforeDiscovery = VALID_ROUTER.replace(
    'Ruta brownfield: inventario, preservación, gaps confirmados, discovery.',
    'Ruta brownfield: inventario, preservación, gaps confirmados, bootstrap.',
  );
  assert.deepEqual(
    routerContractFailures(extractPromptContract(stopsBeforeDiscovery)),
    ['route-does-not-end-in-discovery brownfield'],
  );
});

test('a router that restates stage instructions fails the contract', () => {
  const duplicated = `${VALID_ROUTER}\nEjecuta npm ci y npm run project-os:check.`;
  assert.deepEqual(
    routerContractFailures(extractPromptContract(duplicated)),
    [
      'duplicated-stage-instruction npm run project-os:check',
      'duplicated-stage-instruction npm ci',
    ],
  );
});

test('parity fails when only one version changes a route order', () => {
  const changed = VALID_ROUTER.replace(
    'Ruta experienced-new: ecosistema, entorno, discovery.',
    'Ruta experienced-new: entorno, ecosistema, discovery.',
  );
  assert.deepEqual(
    routerParityFailures(extractPromptContract(VALID_ROUTER), extractPromptContract(changed)),
    ['routes-differ'],
  );
});

test('a stage prompt that reopens classification fails its markers', () => {
  assert.deepEqual(
    stagePromptFailures('prompt-01', 'Entrevista desde cero sin leer nada.'),
    [
      'missing-marker .project-os/onboarding-state.json',
      'missing-marker reutiliza ruta',
      'missing-marker confirma solo lo que cambió',
    ],
  );
  assert.deepEqual(stagePromptFailures('prompt-99', 'texto'), ['unknown-stage-prompt prompt-99']);
});

test('the blueprint manifest ships the router as a managed file', async () => {
  const manifest = JSON.parse(await read('blueprint/manifest.json'));
  const entry = manifest.files.find((file) => file.id === 'prompt-router');
  assert.ok(entry, 'prompt-router entry is missing');
  assert.equal(entry.source, 'core/docs/engineering/PROMPT_ROUTER_INICIO.md');
  assert.equal(entry.target, 'docs/engineering/PROMPT_ROUTER_INICIO.md');
  assert.equal(entry.owner, 'constructor');
  assert.equal(entry.required, true);
  assert.ok((await read(`blueprint/${entry.source}`)).length > 0);
});
