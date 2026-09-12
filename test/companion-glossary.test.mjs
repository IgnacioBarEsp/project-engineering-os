import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { renderGlossary, GLOSSARY_DOC } from '../scripts/render-companion-glossary.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modulePath = path.join(root, 'apps', 'companion', 'ui', 'glossary.mjs');
const { GLOSSARY, byId, makeTerm } = await import(pathToFileURL(modulePath).href);

test('the published glossary is the interface glossary, not a second copy of it', async () => {
  assert.equal(await readFile(GLOSSARY_DOC, 'utf8'), await renderGlossary(),
    'Ejecuta node scripts/render-companion-glossary.mjs tras cambiar ui/glossary.mjs');
});

test('every term is defined once, with a short answer a person can read in a hurry', () => {
  assert.ok(GLOSSARY.length >= 10, 'El glosario debe cubrir el vocabulario que sobrevive en la interfaz.');
  assert.equal(new Set(GLOSSARY.map(entry => entry.id)).size, GLOSSARY.length);
  assert.equal(new Set(GLOSSARY.map(entry => entry.term.toLowerCase())).size, GLOSSARY.length);
  for (const entry of GLOSSARY) {
    assert.match(entry.id, /^[a-z][a-z0-9-]*$/);
    assert.ok(entry.short.length > 20 && entry.short.length <= 200, `${entry.id}: ${entry.short.length} caracteres`);
    assert.ok(entry.short.trim().endsWith('.'), `${entry.id} debe ser una frase completa`);
  }
});

// A definition that quietly names something else is worse than no definition: the reader leaves with the
// wrong word explained. An unknown id has to stop the render rather than produce an empty control.
test('asking for a term that does not exist fails instead of rendering nothing', () => {
  const term = makeTerm(() => ({}), () => {});
  assert.throws(() => term('no-existe'), /Término sin definición: no-existe/);
  assert.ok(byId.get('openspec'));
});

// The rule the issue sets: warmth may not buy a claim. These are the words that would turn a definition into
// a promise the application has never demonstrated.
test('no definition promises something the application has not demonstrated', () => {
  const forbidden = /\b(garantiza|asegura que|siempre funciona|sin errores|100\s?%|el mejor|más rápido que)\b/i;
  for (const entry of GLOSSARY) {
    const text = `${entry.short} ${entry.detail ?? ''}`;
    assert.doesNotMatch(text, forbidden, `${entry.id} promete algo que no se ha medido`);
  }
});
