import {PROFILE_IDS, offeredStacks, resolveProfile, isEngineering} from '../engine/profiles.mjs';

// What technology a project gets, decided from what the person said and from the inventory already measured.
//
// Three things are deliberate here. The catalogue is data, not a lookup into the network: a technology can only
// be offered if its complete dependency closure was read, every package in it declares a licence, none of them
// runs an install script, and none of them constrains `os` or `cpu` — because a tree that differs per machine
// cannot be pinned by one digest, and a pin that is only true here would be a lie on the other two platforms.
// Second, a technology this application cannot install that way is named with its origin and its reason instead
// of being offered by a control that cannot work, or worse, left out silently. Third, recommending is decided by
// profile and inventory alone: `off` is a first-class inference level, and a person with no model has the same
// right to an explained recommendation as anyone else.
const stacks = {
  'web-interface': {
    id: 'web-interface', name: 'Interfaz web con React', relative: '.project-os/stack/web-interface',
    packages: [{ name: 'react', version: '19.2.0', license: 'MIT' }, { name: 'react-dom', version: '19.2.0', license: 'MIT' },
      { name: 'scheduler', version: '0.27.0', license: 'MIT' }],
    closure: 3, licenses: ['MIT'],
    purpose: 'Construir pantallas web con componentes.',
    downloadBytes: 1311203, installedBytes: 7576468, files: 88,
    treeHash: '07606f27e39876cabb3daf9a2d577837b980bfe0bc57105f40a3e562902ad57f',
  },
  'typed-code': {
    id: 'typed-code', name: 'TypeScript', relative: '.project-os/stack/typed-code',
    packages: [{ name: 'typescript', version: '5.9.3', license: 'Apache-2.0' }],
    closure: 1, licenses: ['Apache-2.0'],
    purpose: 'Escribir código con tipos y comprobarlo antes de ejecutarlo.',
    downloadBytes: 4377468, installedBytes: 23626590, files: 135,
    treeHash: '6b8717621a496905b68e41fbf5211d0d0cd71ff1f3dec0c588427073527cb7fe',
  },
  'http-service': {
    id: 'http-service', name: 'Servicio HTTP con Express', relative: '.project-os/stack/http-service',
    packages: [{ name: 'express', version: '5.1.0', license: 'MIT' }],
    closure: 68, licenses: ['BSD-3-Clause', 'ISC', 'MIT'],
    purpose: 'Atender peticiones desde un servidor propio.',
    downloadBytes: 743738, installedBytes: 2396995, files: 604,
    treeHash: '74c5c6549f87f0855304883d3bdfca0b1bad7253bc63dc944649015b7163cb93',
  },
};
// Named, not hidden. The maintainer asked for Flutter by name; the honest answer is where it comes from and why
// it is not installed from here, which is a result, unlike a control that pretends.
const notOffered = [
  { id: 'flutter', name: 'Flutter', from: 'Google, como SDK propio de más de un gigabyte',
    reason: 'Llega con su propio instalador y su propio proceso de actualización, no como dependencias que se puedan revisar con un lockfile, así que Companion no puede fijar lo que quedaría instalado.' },
  { id: 'unity-editor', name: 'El editor de Unity', from: 'Unity Technologies, con su propia licencia y su propio gestor de versiones',
    reason: 'Se instala desde Unity Hub aceptando su licencia, que es una decisión de la persona y no algo que otra aplicación deba aceptar por ella.' },
  { id: 'python', name: 'Python', from: 'la Python Software Foundation, como instalador del sistema',
    reason: 'No se distribuye como un cierre de dependencias de npm, y cambiar el Python del sistema es una decisión que afecta a todo el equipo, no solo a este proyecto.' },
];
function freeze(value) { for (const child of Object.values(value)) if (child && typeof child === 'object') freeze(child); return Object.freeze(value); }
for(const item of Object.values(stacks))item.profiles=PROFILE_IDS.filter(id=>offeredStacks(id).includes(item.id));
export const STACKS = freeze(stacks);
export const NOT_OFFERED = freeze(notOffered);
export const STACK_IDS = Object.freeze(Object.keys(stacks));
export const DECISIONS = Object.freeze(['chosen', 'unsure', 'too-early']);

export function offeredFor(profile,focus) {
  return offeredStacks({profile,focus}).filter(id=>STACK_IDS.includes(id));
}

const countOf = (inventory, extension) => (inventory?.files ?? []).reduce((total, file) =>
  total + (String(file.path ?? '').toLowerCase().endsWith(extension) ? 1 : 0), 0);

// The recommendation reads the profile the person chose and the inventory this application already measured.
// It never reads a file, never asks a model, and can only return ids that exist in the frozen catalogue.
export function recommend({ profile, focus, inventory } = {}) {
  const resolved=resolveProfile({profile:profile??'personal',focus});
  if (resolved.focus==='game') return { stacks: [], because: 'El editor de Unity o del motor elegido se instala aparte, con su propia licencia, y este proyecto no necesita nada más de esta lista.' };
  if (!isEngineering(resolved.profile)) return { stacks: [], because: 'Este tipo de proyecto no necesita un stack de programación: lo que hace falta ya se preparó.' };
  const interfaceFiles = countOf(inventory, '.tsx') + countOf(inventory, '.jsx');
  const typedFiles = countOf(inventory, '.ts');
  if (interfaceFiles > 0) return { stacks: ['web-interface', ...(typedFiles > 0 ? ['typed-code'] : [])],
    because: `Tu carpeta ya tiene ${interfaceFiles} ${interfaceFiles === 1 ? 'archivo' : 'archivos'} de interfaz con React.` };
  if (typedFiles > 0) return { stacks: ['typed-code'],
    because: `Tu carpeta ya tiene ${typedFiles} ${typedFiles === 1 ? 'archivo' : 'archivos'} de TypeScript.` };
  return { stacks: [], because: 'Todavía no hay código en la carpeta que indique una tecnología, así que es pronto para elegirla.' };
}

// What would happen, from the recorded decision and the measured inventory. `chosen` is what the person asked
// for; `recommended` is an offer that has to be accepted; `none` is a finished state with its reason, not a gap.
export function stackDecision(selection, inventory) {
  const decision = selection?.stack?.decision ?? 'too-early';
  if (decision === 'chosen') {
    const requested = (selection.stack.requested ?? []).filter(id => Object.hasOwn(STACKS, id));
    // Saying "you asked for this" above an empty list is a sentence with nothing behind it. A project whose kind
    // offers no technology can still answer "I know which one I want", and what it is owed then is the reason.
    if (!requested.length) return { kind: 'none', stacks: [],
      because: 'Para este tipo de proyecto no hay ninguna tecnología que esta aplicación pueda instalar con la verificación que exige. Abajo está lo que no se instala desde aquí, con su motivo.' };
    return { kind: 'chosen', stacks: requested, because: 'Lo pediste al preparar este proyecto.' };
  }
  if (decision === 'unsure') { const value = recommend({ profile: selection?.profile,focus:selection?.focus, inventory });
    return { kind: value.stacks.length ? 'recommended' : 'none', stacks: value.stacks, because: value.because }; }
  return { kind: 'none', stacks: [],
    because: 'Dijiste que todavía es pronto para elegir tecnología, así que no se instaló ninguna. Puedes decidirlo cuando el proyecto lo pida.' };
}
