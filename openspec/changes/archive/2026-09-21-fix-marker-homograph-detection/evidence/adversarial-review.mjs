// Revisión adversarial reproducible para el detector del change #162.
// Se ejecuta en un proceso nuevo y solo depende de los artefactos versionados.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const changeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(changeRoot, '..', '..', '..');
const corpus = JSON.parse(await readFile(path.join(
  repoRoot,
  'openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence/flow-comparison/evaluation.json',
), 'utf8'));
const { readinessInternals } = await import(
  pathToFileURL(path.join(repoRoot, 'src/readiness.mjs')).href,
);
const paths = (metadata) => readinessInternals.placeholderPaths(metadata);

const legitimateRejected = corpus.legitimatePhrases.filter(({ phrase }) => paths({ scope: phrase }).length);
const markersAccepted = corpus.corpus.markerSources.filter(({ marker }) => !paths({ scope: marker }).length);
assert.deepEqual(legitimateRejected, []);
assert.deepEqual(markersAccepted, []);
assert.deepEqual(paths({ change: 'fix-placeholder-homograph-detection' }), []);
assert.deepEqual(paths({ owner: 'TBD-owner' }), ['owner (reserved-marker)']);
assert.deepEqual(paths({ change: 'placeholder' }), ['change (reserved-marker)']);
assert.deepEqual(paths({ rollback: 'La reversión conserva el historial y completa la verificación.' }), []);
assert.ok(paths({ costLicenseReview: 'Complete the review or document why it is objectively not applicable before propose.' })
  .some((entry) => entry.endsWith('(replacement-instruction)')));
assert.ok(paths({ scope: 'sustituye aquí el valor' }).some((entry) => entry.endsWith('(replacement-instruction)')));
const secret = 'ghp_' + '1234567890abcdefghijklmnop';
assert.equal(JSON.stringify(paths({ scope: `TODO ${secret}` })).includes(secret), false);

console.log(JSON.stringify({
  blockers: 0,
  majors: 0,
  minors: 0,
  checks: [
    '34/34 frases legítimas no se marcan',
    '19/19 marcadores observados se rechazan',
    'excepción exacta de change y negativos fuera de change',
    'formas acentuadas y Complete the review',
    'diagnóstico no repite secretos',
  ],
}, null, 2));
