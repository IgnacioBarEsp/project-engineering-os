import { ONBOARDING_QUESTIONS, ONBOARDING_ROUTES } from '../src/onboarding.mjs';

export const ROUTER_QUESTION_IDS = Object.freeze(
  ONBOARDING_QUESTIONS.map((question) => question.id),
);
export const ROUTER_ROUTE_IDS = Object.freeze([...ONBOARDING_ROUTES]);
export const ROUTER_REFERENCES = Object.freeze([
  'onboarding-plan',
  '.project-os/onboarding-state.json',
  'PROMPT_00_BOOTSTRAP_ENTORNO.md',
  'PROMPT_01_DISCOVERY_PROYECTO.md',
]);
export const ROUTER_MARKERS = Object.freeze([
  'aprobación humana',
  'relevo entre chats',
  'recuperación',
  'después del discovery',
]);
export const ROUTER_FORBIDDEN = Object.freeze([
  'npm run project-os:check',
  'npm ci',
  'openspec:init',
]);
export const STAGE_PROMPT_MARKERS = Object.freeze({
  'prompt-00': Object.freeze([
    '.project-os/onboarding-state.json',
    'no reabras la clasificación',
    'preguntes por stack',
    'prompt_01',
  ]),
  'prompt-01': Object.freeze([
    '.project-os/onboarding-state.json',
    'reutiliza ruta',
    'confirma solo lo que cambió',
  ]),
});

const QUESTION_LINE = /^Preguntas de clasificación:\s*([^.\n]+)\./m;
const ROUTE_LINE = /^Ruta ([a-z][a-z-]*):[ \t]*([^\n]+?)\.[ \t]*$/gm;
const FINAL_STEP = 'discovery';

function normalize(text) {
  return String(text).replace(/\r\n/g, '\n');
}

// Los documentos son prosa ajustada a 110 columnas: un marcador puede quedar partido por un salto de
// línea. La búsqueda de marcadores usa el texto con espacios colapsados; las líneas de contrato
// (preguntas y rutas) siguen leyéndose con estructura de línea.
function flatten(text) {
  return normalize(text).replace(/\s+/g, ' ');
}

function splitList(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function extractPromptContract(text) {
  const content = normalize(text);
  const flat = flatten(content);
  const lower = flat.toLowerCase();
  const questionMatch = content.match(QUESTION_LINE);
  const routes = [...content.matchAll(ROUTE_LINE)].map((match) => ({
    id: match[1],
    steps: splitList(match[2]),
  }));
  return {
    questions: questionMatch ? splitList(questionMatch[1]) : [],
    routes,
    references: ROUTER_REFERENCES.filter((reference) => flat.includes(reference)),
    markers: ROUTER_MARKERS.filter((marker) => lower.includes(marker)),
    forbidden: ROUTER_FORBIDDEN.filter((entry) => lower.includes(entry)),
  };
}

export function routerContractFailures(contract) {
  const failures = [];
  if (contract.questions.join(',') !== ROUTER_QUESTION_IDS.join(',')) {
    failures.push(`questions ${contract.questions.join(',') || 'missing'}`);
  }
  const routeIds = contract.routes.map((route) => route.id);
  const duplicated = routeIds.filter((id, index) => routeIds.indexOf(id) !== index);
  if (duplicated.length > 0) failures.push(`duplicated-route ${duplicated.join(',')}`);
  for (const id of ROUTER_ROUTE_IDS) {
    if (!routeIds.includes(id)) failures.push(`missing-route ${id}`);
  }
  for (const id of routeIds) {
    if (!ROUTER_ROUTE_IDS.includes(id)) failures.push(`unknown-route ${id}`);
  }
  for (const route of contract.routes) {
    if (route.steps.length < 3) failures.push(`short-route ${route.id}`);
    if (route.steps.at(-1) !== FINAL_STEP) failures.push(`route-does-not-end-in-discovery ${route.id}`);
  }
  for (const reference of ROUTER_REFERENCES) {
    if (!contract.references.includes(reference)) failures.push(`missing-reference ${reference}`);
  }
  for (const marker of ROUTER_MARKERS) {
    if (!contract.markers.includes(marker)) failures.push(`missing-marker ${marker}`);
  }
  for (const entry of contract.forbidden) {
    failures.push(`duplicated-stage-instruction ${entry}`);
  }
  return failures;
}

export function routerParityFailures(rootContract, blueprintContract) {
  const failures = [];
  if (rootContract.questions.join(',') !== blueprintContract.questions.join(',')) {
    failures.push('questions-differ');
  }
  const asText = (contract) => contract.routes
    .map((route) => `${route.id}:${route.steps.join('|')}`)
    .sort()
    .join(';');
  if (asText(rootContract) !== asText(blueprintContract)) failures.push('routes-differ');
  if (rootContract.references.join(',') !== blueprintContract.references.join(',')) {
    failures.push('references-differ');
  }
  if (rootContract.markers.join(',') !== blueprintContract.markers.join(',')) {
    failures.push('markers-differ');
  }
  return failures;
}

export function stagePromptFailures(kind, text) {
  const markers = STAGE_PROMPT_MARKERS[kind];
  if (!markers) return [`unknown-stage-prompt ${kind}`];
  const lower = flatten(text).toLowerCase();
  return markers
    .filter((marker) => !lower.includes(marker))
    .map((marker) => `missing-marker ${marker}`);
}
