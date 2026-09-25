export const NAV_IDS = Object.freeze(['open-start', 'open-project-list', 'prepare-project', 'open-help']);
export const WIZARD_STEPS = Object.freeze(['Tu proyecto', 'Enfoque', 'Visión', 'Preparar']);

const wizard = (breadcrumb, step) => ({breadcrumb, nav: 'prepare-project', step});
const project = breadcrumb => ({breadcrumb, nav: 'open-project-list', step: null});

export const ROUTES = Object.freeze({
  start: {breadcrumb: 'INICIO', nav: 'open-start', step: null},
  projects: project('TUS PROYECTOS'),
  help: {breadcrumb: 'AYUDA', nav: 'open-help', step: null},
  setup: wizard('PREPARAR PROYECTO / TU PROYECTO', 0),
  folder: wizard('PREPARAR PROYECTO / CARPETA', 0),
  delimitation: wizard('PREPARAR PROYECTO / ENFOQUE', 1),
  vision: wizard('PREPARAR PROYECTO / VISIÓN', 2),
  install: wizard('PREPARAR PROYECTO / PREPARAR', 3),
  finished: wizard('PREPARAR PROYECTO / LISTO', 3),
  'stack-choice': wizard('PREPARAR PROYECTO / ENFOQUE', 1),
  ready: wizard('PREPARAR PROYECTO / LISTO', 3),
  'base-review': wizard('PREPARAR PROYECTO / REVISAR PREPARACIÓN', 3),
  'stack-review': wizard('PREPARAR PROYECTO / TECNOLOGÍA', 3),
  'repair-review': wizard('PREPARAR PROYECTO / HERRAMIENTAS', 3),
  'environment-review': wizard('PREPARAR PROYECTO / HERRAMIENTAS', 3),
  'engineering-review': wizard('PREPARAR PROYECTO / DESARROLLO', 3),
  'activation-review': wizard('PREPARAR PROYECTO / MÉTODO', 3),
  'context-review': wizard('PREPARAR PROYECTO / ARCHIVOS', 3),
  'sync-review': wizard('PREPARAR PROYECTO / INSTRUCCIONES', 3),
  'context-final': wizard('PREPARAR PROYECTO / ÚLTIMA PASADA', 3),
  'code-review': wizard('PREPARAR PROYECTO / MAPA DE CÓDIGO', 3),
  workspace: project('TU PROYECTO / ESTADO'),
  'connection-error': {breadcrumb: 'INICIO', nav: 'open-start', step: null}
});

const WORKSPACE_TABS = Object.freeze({
  overview: 'ESTADO', search: 'ARCHIVOS', recipes: 'RECETAS', handoff: 'TU IA'
});

export function routeFor(page, {tab = 'overview'} = {}) {
  const route = ROUTES[page];
  if (!route) throw new Error(`Ruta sin declarar: ${page}`);
  if (page === 'workspace') {
    const label = WORKSPACE_TABS[tab];
    if (!label) throw new Error(`Pestaña sin declarar: ${tab}`);
    return {...route, breadcrumb: `TU PROYECTO / ${label}`};
  }
  return route;
}

export function routeIds() { return Object.keys(ROUTES); }
