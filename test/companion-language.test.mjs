import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiPath = path.join(root, 'apps', 'companion', 'ui', 'app.mjs');
const glossaryPath = path.join(root, 'apps', 'companion', 'ui', 'glossary.mjs');
const ui = await readFile(uiPath, 'utf8');
const glossarySource = await readFile(glossaryPath, 'utf8');
const { GLOSSARY, labelMatchesTerm, makeTerm } = await import(pathToFileURL(glossaryPath).href);

// The issue's decision criterion: the technical vocabulary and the defensive tone go, the truth stays. If a
// benefit is not demonstrated it is dropped or measured first, never softened until it reads as true.
//
// This guards the failure that actually happened. A draft of Inicio's opening sentence ended "para que
// entienda tu trabajo desde la primera pregunta", and an independent review refused it: this project ran a
// paired inference experiment and published a tie — 15/15 grounded answers and 15/15 abstentions in both
// conditions — and `docs/companion/EVIDENCE.md` lists model answer quality under what was not measured.
// Every pattern below is a claim about an outcome this repository has either measured as even or never
// measured at all.
const UNDEMONSTRATED = [
  [/entiend(a|e|as)\s+(tu|su|el)\s+(trabajo|proyecto|c[oó]digo)/i, 'que la IA entienda el trabajo'],
  [/mejor(es)?\s+respuestas?/i, 'mejores respuestas'],
  [/respuestas?\s+m[aá]s\s+(precisas?|exactas?|acertadas?)/i, 'respuestas más precisas'],
  [/menos\s+errores/i, 'menos errores'],
  [/no\s+(alucina|se\s+equivoca|se\s+invent)/i, 'ausencia de alucinaciones'],
  [/m[aá]s\s+r[aá]pid[oa]\s+que/i, 'ser más rápido que otra cosa'],
  [/ahorra(s|r)?\s+(tiempo|dinero|tokens|contexto)/i, 'ahorro'],
  [/reduce\s+(el\s+)?(costo|coste|gasto|consumo)/i, 'reducción de costo'],
  [/garantiza|asegura\s+que|siempre\s+funciona|sin\s+errores|100\s?%/i, 'una garantía'],
];

// Only the Spanish the interface shows. Comments carry the reasoning, including the refused sentence itself.
function interfaceText(source) {
  return source.split(/\r?\n/).filter(line => !/^\s*\/\//.test(line)).join('\n');
}

test('the interface claims no benefit this project measured as a tie or never measured', () => {
  const text = interfaceText(ui);
  for (const [pattern, name] of UNDEMONSTRATED) {
    const hit = text.match(pattern);
    assert.equal(hit, null, hit
      ? `La interfaz afirma ${name}: «…${text.slice(Math.max(0, hit.index - 70), hit.index + 70)}…»`
      : '');
  }
});

test('every sentence that states a limit of the result is still there', () => {
  // These are the sentences the defensive-tone rewrite was NOT allowed to remove. They are what a person
  // needs at the moment they read them, and each one corresponds to something this project refuses to claim.
  for (const kept of [
    'no demuestra que la IA la haya leído',
    'No se ha comprobado que la IA la haya leído',
    'No se presentan como documentos leídos',
    'no demuestra que la herramienta funcione',
    'Todavía no se ha enviado a ninguna IA',
    'no se envían a ninguna IA durante la preparación',
    'Nunca un modelo de IA',
    'tus documentos no se envían solos',
    'Estado guardado la última vez; se comprueba al abrirlo',
  ]) {
    assert.ok(ui.includes(kept), `Falta la frase que declara un límite: «${kept}»`);
  }
});

// One name per action is enforced by construction: the label lives in the action table and `doBtn` takes no
// label. These tests protect that construction, because reintroducing a label parameter would make the whole
// property opt-in again.
test('every control for a navigable action takes its label from the action table', () => {
  const table = ui.match(/const ACTIONS=\{[\s\S]*?\n\};/);
  assert.ok(table, 'La tabla de acciones tiene que existir.');
  const declared = [...table[0].matchAll(/'([a-z][a-z-]*)':\{label:/g)].map(match => match[1]);
  assert.ok(declared.length >= 8, `Solo se declararon ${declared.length} acciones.`);
  const used = [...ui.matchAll(/doBtn\('([a-z-]+)'/g)].map(match => match[1]);
  assert.ok(used.length > 0);
  for (const id of used) assert.ok(declared.includes(id), `doBtn usa una acción sin declarar: ${id}`);
  // A label passed to doBtn would be a second name for the action; the signature must not accept one.
  assert.match(ui, /const doBtn=\(id,cls='secondary'\)=>/,
    'doBtn no puede volver a aceptar una etiqueta: ahí es donde nacieron los dos nombres para una acción.');
  assert.deepEqual([...ui.matchAll(/doBtn\('[a-z-]+',\s*'(?!secondary|primary|quiet|danger|nav-button)/g)], [],
    'doBtn solo recibe la acción y una clase.');
});

test('no declared action is ever offered through the unnamed button helper', () => {
  // `btn(...)` takes a label from its caller, so offering a declared action through it is how a second name
  // for one action gets in — and no DOM check can see it, because such a control declares no action at all.
  //
  // An earlier version of this test covered only the five destination handlers, which left the project
  // screen, the file reading, the development review, the code map and the tool repair unguarded. The list
  // is derived from the action table itself, so a twelfth action cannot be added and forgotten here.
  //
  // A control OFFERS an action when the action is its whole behaviour AND it is called the way the table
  // calls it: with no arguments. Two real controls taught this rule its shape. `forget()` removes a project
  // and then refreshes the list, and its button is named for deleting, not for navigating. And
  // "Revisar con estas exclusiones" calls the same function as "Leer mis archivos" but passes the
  // exclusions — same code, different operation, and it needs its own name. Flagging either would have
  // pushed a correct control into a declaration that misnames it, which is the defect inverted.
  const table = ui.match(/const ACTIONS=\{[\s\S]*?\n\};/)[0];
  const handlers = [...table.matchAll(/run:\(\)=>([A-Za-z]+)\(/g)].map(match => match[1]);
  assert.ok(handlers.length >= 8, `Solo se derivaron ${handlers.length} manejadores de la tabla.`);
  const body = ui.slice(ui.indexOf('};', ui.indexOf('const ACTIONS=')) + 2);
  for (const handler of new Set(handlers)) {
    const offers = new RegExp(`(do)?btn\\((?:'[^']*'|\`[^\`]*\`),\\s*(?:async\\s*)?\\(\\)\\s*=>\\s*\\{?\\s*(?:await\\s+)?${handler}\\(\\s*\\)`, 'g');
    for (const hit of body.matchAll(offers)) {
      assert.ok(hit[0].startsWith('doBtn('),
        `${handler} es una acción declarada y se ofrece por btn() en «${hit[0].slice(0, 90)}»; usa doBtn.`);
    }
  }
  // The third construction path. `doBtn` and `btn` are not the only ways to make a button: a raw element
  // with its own click handler would evade both the DOM checks (it declares no action) and the rule above.
  // The interface builds raw buttons only for form submits and the project tabs, and none of them may offer
  // a declared action.
  for (const handler of new Set(handlers)) {
    const raw = new RegExp(`el\\('button'[^\\n]{0,240}?onClick:\\s*(?:async\\s*)?\\(\\)\\s*=>\\s*\\{?\\s*(?:await\\s+)?${handler}\\(\\s*\\)`, 'g');
    assert.deepEqual([...body.matchAll(raw)].map(hit => hit[0].slice(0, 90)), [],
      `${handler} se ofrece desde un botón construido a mano, que ninguna comprobación del DOM puede ver.`);
  }

  // The rule has to bite: a control that offers a declared action under its own label must fail.
  const planted = `${body}\nconst x=btn('Ver el mapa',()=>reviewCode());`;
  const offers = /(do)?btn\((?:'[^']*'|`[^`]*`),\s*(?:async\s*)?\(\)\s*=>\s*\{?\s*(?:await\s+)?reviewCode\(\s*\)/g;
  assert.ok([...planted.matchAll(offers)].some(hit => !hit[0].startsWith('doBtn(')),
    'La regla no detecta un control que ofrece una acción declarada con su propia etiqueta.');
});

test('a control cannot be built naming one term and opening another', () => {
  const term = makeTerm(() => ({}), () => {});
  assert.throws(() => term('recuperacion', 'Token'), /no nombra el término/);
  assert.throws(() => term('no-existe'), /Término sin definición/);
  // The accepted forms: the term itself, a declared alias, or the term followed by more words.
  assert.ok(labelMatchesTerm(GLOSSARY.find(e => e.id === 'openspec'), 'OpenSpec 1.6.0'));
  assert.ok(labelMatchesTerm(GLOSSARY.find(e => e.id === 'receta'), 'recetas'));
  assert.ok(!labelMatchesTerm(GLOSSARY.find(e => e.id === 'receta'), 'Token'));
});

test('every term declares how its word appears, as a usable pattern', () => {
  for (const entry of GLOSSARY) {
    assert.ok(Array.isArray(entry.forms) && entry.forms.length, `${entry.id} no declara forms`);
    for (const form of entry.forms) {
      assert.doesNotThrow(() => new RegExp(form, 'u'), `${entry.id}: forma inválida ${form}`);
    }
    // The term's own name has to be one of the ways its word appears, or the check could never see it.
    const matches = entry.forms.some(form => new RegExp(`^(${form})$`, entry.caseSensitive ? 'u' : 'iu')
      .test(entry.term) || new RegExp(`(${form})`, entry.caseSensitive ? 'u' : 'iu').test(entry.term));
    assert.ok(matches, `${entry.id}: ninguna forma coincide con su propio término «${entry.term}»`);
  }
  assert.match(glossarySource, /FORBIDDEN_WORDS/, 'La jerga sin definición se declara aparte.');
});
