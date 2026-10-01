export const NAV_IDS = Object.freeze(['open-start', 'open-project-list', 'prepare-project', 'open-help']);
export const WIZARD_STEPS = Object.freeze(['Tu proyecto', 'Enfoque', 'Visión', 'Preparar']);

const wizard = (breadcrumb, step) => ({breadcrumb, nav: 'prepare-project', step});
const project = breadcrumb => ({breadcrumb, nav: 'open-project-list', step: null});

export const ROUTES = Object.freeze({
  start: {breadcrumb: 'INICIO', nav: 'open-start', step: null},
  projects: project('TUS PROYECTOS'),
  help: {breadcrumb: 'AYUDA', nav: 'open-help', step: null},
  setup: wizard('PREPARAR PROYECTO / TU PROYECTO', 0),
  delimitation: wizard('PREPARAR PROYECTO / ENFOQUE', 1),
  vision: wizard('PREPARAR PROYECTO / VISIÓN', 2),
  install: wizard('PREPARAR PROYECTO / PREPARAR', 3),
  finished: wizard('PREPARAR PROYECTO / LISTO', 3),
  'base-review': project('TU PROYECTO / REVISAR PREPARACIÓN'),
  'stack-review': project('TU PROYECTO / TECNOLOGÍA'),
  'repair-review': project('TU PROYECTO / HERRAMIENTAS'),
  'environment-review': project('TU PROYECTO / HERRAMIENTAS'),
  'engineering-review': project('TU PROYECTO / DESARROLLO'),
  'activation-review': project('TU PROYECTO / MÉTODO'),
  'context-review': project('TU PROYECTO / ARCHIVOS'),
  'sync-review': project('TU PROYECTO / INSTRUCCIONES'),
  'context-final': project('TU PROYECTO / ÚLTIMA PASADA'),
  'code-review': project('TU PROYECTO / MAPA DE CÓDIGO'),
  workspace: project('TU PROYECTO / PREPARACIÓN'),
  'connection-error': {breadcrumb: 'INICIO', nav: 'open-start', step: null}
});

const WORKSPACE_TABS = Object.freeze({
  overview: 'PREPARACIÓN', search: 'ARCHIVOS', recipes: 'RECETAS', handoff: 'TU IA'
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
