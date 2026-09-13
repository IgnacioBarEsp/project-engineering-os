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

// The one sentence a cold reader is asked to paraphrase, pinned exactly. A pattern list can only refuse the
// claims someone thought of: an independent review passed "para que tu IA trabaje mejor con tu proyecto",
// "para que acierte más" and "para que no se pierda entre tus archivos" through the nine regexes below.
// A golden text cannot be evaded — it can only be changed on purpose, which is the point.
const INICIO_SENTENCE = 'Esta aplicación lee la carpeta de tu proyecto, ordena lo que hay dentro y deja un '
  + 'resumen que puedes darle a la IA que ya usas, con la ubicación exacta de cada frase para que puedas '
  + 'comprobarla.';

test('the sentence a cold reader is asked to paraphrase is exactly the reviewed one', () => {
  assert.ok(ui.includes(`p('${INICIO_SENTENCE}','intro')`),
    'La frase de Inicio cambió. Cualquier cambio en ella es deliberado y necesita revisión: es la que '
    + 'afirmaba un resultado que este proyecto midió como empate, y la que una lectura en frío parafrasea.');
  // And it still has to survive the pattern list, so the golden text cannot be updated to a claim.
  for (const [pattern, name] of UNDEMONSTRATED) {
    assert.doesNotMatch(INICIO_SENTENCE, pattern, `La frase de Inicio afirma ${name}`);
  }
});

test('the interface claims no benefit this project measured as a tie or never measured', () => {
  const text = interfaceText(ui);
  for (const [pattern, name] of UNDEMONSTRATED) {
    const hit = text.match(pattern);
    assert.equal(hit, null, hit
      ? `La interfaz afirma ${name}: «…${text.slice(Math.max(0, hit.index - 70), hit.index + 70)}…»`
      : '');
  }
});

test('every sentence that states a limit of the result is still there, in the interface and not in a comment', () => {
  // These are the sentences the defensive-tone rewrite was NOT allowed to remove. They are what a person
  // needs at the moment they read them, and each one corresponds to something this project refuses to claim.
  //
  // Read from the interface text with comments stripped. An earlier version read the raw source, and an
  // independent review moved "Nunca un modelo de IA ni el motor que lo ejecuta" out of the interface and
  // into a `//` comment: six tests passed with the limit gone from the screen.
  const shown = interfaceText(ui);
  for (const kept of [
    'no demuestra que la IA la haya leído',
    'No se ha comprobado que la IA la haya leído',
    'No se presentan como documentos leídos',
    'no demuestra que la herramienta funcione',
    'Todavía no se ha enviado a ninguna IA',
    'no se envían a ninguna IA durante la preparación',
    'Nunca un modelo de IA',
    'tus documentos no se envían solos',
    // A listed project's state used to carry one sentence for every state: "Estado guardado la última vez;
    // se comprueba al abrirlo". It was replaced by a sentence per state, because the states now differ in
    // what they may claim, and every one of them still has to say where it came from and what it does not
    // cover. The replacement is pinned here so the limit cannot be dropped by dropping a branch.
    'No vuelve a leer tus archivos, ni comprueba el',
    ', las herramientas de desarrollo',
    'Se había comprobado el',
    'Ábrelo para continuar donde quedó',
    'Este estado sale de los registros de la carpeta, no de una comprobación',
    'Esta guía sale de la comprobación del',
  ]) {
    assert.ok(shown.includes(kept), `Falta la frase que declara un límite en la interfaz: «${kept}»`);
  }
});

// One name per action is enforced by construction: the label lives in the action table and `doBtn` takes no
// label. These tests protect that construction, because reintroducing a label parameter would make the whole
// property opt-in again.
// The controls that act on one listed project follow the same construction, and the reason is the same: a
// label parameter would make the property opt-in again. These read the source, because what they protect is
// the shape of the code rather than the rendered result, which the two harnesses check.
test('every control for a row action takes its label from the row action table', () => {
  const table = ui.match(/const ROW_ACTIONS=\{[\s\S]*?\n\};/);
  assert.ok(table, 'La tabla de acciones de fila tiene que existir.');
  const declared = [...table[0].matchAll(/'([a-z][a-z-]*)':\{label:/g)].map(match => match[1]);
  assert.deepEqual(declared, ['open-project', 'duplicate-project', 'forget-project'],
    `Las acciones de fila declaradas son ${declared.join(', ')}.`);
  const used = [...ui.matchAll(/rowBtn\('([a-z-]+)'/g)].map(match => match[1]);
  assert.ok(used.length >= 3, `Solo se usaron ${used.length} controles de fila.`);
  for (const id of used) assert.ok(declared.includes(id), `rowBtn usa una acción sin declarar: ${id}`);
  // The helper may not accept a label, and no control may declare a row action by hand.
  const helper = ui.match(/const rowBtn=\([^)]*\)=>/);
  assert.ok(helper, 'El constructor de controles de fila tiene que existir.');
  assert.equal(/\blabel\b/.test(helper[0]), false, `rowBtn no puede recibir una etiqueta: ${helper[0]}`);
  const byHand = [...ui.matchAll(/'data-row-action':\s*'([a-z-]+)'/g)].map(match => match[1]);
  assert.deepEqual(byHand, [], `Una acción de fila se declaró fuera de rowBtn: ${byHand.join(', ')}`);
});

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
  // The third and fourth construction paths. `doBtn` and `btn` are not the only ways to make a button: a raw
  // element with its own click handler, or a form whose submit handler runs the action, would evade both the
  // DOM checks (neither declares an action) and the rule above. An independent review used the form path to
  // reintroduce the maintainer's original finding verbatim — "Preparar una carpeta" next to
  // "Preparar proyecto", one action — and nothing on the branch detected it.
  for (const handler of new Set(handlers)) {
    for (const [what, pattern] of [
      ['un botón construido a mano', `el\\('button'[^\\n]{0,240}?onClick:\\s*(?:async\\s*)?\\(\\)\\s*=>\\s*\\{?\\s*(?:await\\s+)?${handler}\\(\\s*\\)`],
      ['el envío de un formulario', `onSubmit:[^\\n]{0,300}?${handler}\\(\\s*\\)`],
    ]) {
      assert.deepEqual([...body.matchAll(new RegExp(pattern, 'g'))].map(hit => hit[0].slice(0, 110)), [],
        `${handler} se ofrece desde ${what}, que ninguna comprobación del DOM puede ver.`);
    }
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

// The person-content marker is a claim about whose words these are, and a claim can be abused: marking the
// interface's own prose would exempt it from the vocabulary rule. An independent review found three places
// where the previous class-based marker did exactly that by accident. A machine cannot tell a lie in the
// marker from the truth, but it can insist the marker only ever wraps a VALUE — something read from state,
// from the project or from the plan — and never a string the interface wrote.
test('the person-content marker never wraps a literal the interface wrote', () => {
  const calls = [...ui.matchAll(/\bown\((.{0,80}?)[,)]/g)].map(match => match[1].trim());
  assert.ok(calls.length >= 6, `Solo se encontraron ${calls.length} usos del marcador.`);
  for (const argument of calls) {
    assert.doesNotMatch(argument, /^['"`]/,
      `El marcador de contenido de la persona envuelve un literal: own(${argument}…). `
      + 'Solo puede envolver un valor que venga de la persona, del proyecto o del plan.');
  }
  // And the marker has to be the attribute, not a class that also styles something.
  assert.match(ui, /'data-content':\s*'person'/, 'El marcador es un atributo, no una clase.');
  assert.doesNotMatch(ui, /class:\s*'own'|class:\s*`own|intro own/,
    'Una clase no puede volver a ser el marcador: una clase es una decisión de estilo.');
});
