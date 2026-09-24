import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import test from 'node:test';

import {
  checkUpstreamDoctorBaseline,
  compareDoctorFailureBaseline,
  validateDoctorFailureBaseline,
} from '../scripts/check-upstream-doctor-baseline.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function report(entries) {
  return {
    results: entries.map(({ id, profile, cause = 'expected cause' }) => ({
      id, profile, cause, status: 'FAIL',
    })),
  };
}

const expected = {
  schemaVersion: '1.0.0',
  entries: [
    { id: 'profile.auth-security', profile: 'auth-security', issue: 115 },
    { id: 'profile.library-cli', profile: 'library-cli', issue: 115 },
    { id: 'profile.ui', profile: 'ui', issue: 115 },
  ],
};

test('el baseline pasa solo con igualdad exacta del conjunto de FAIL', () => {
  const exact = report(expected.entries);
  assert.deepEqual(validateDoctorFailureBaseline(expected), []);
  assert.equal(compareDoctorFailureBaseline(exact, expected).ok, true);
  assert.equal(compareDoctorFailureBaseline(report([
    ...expected.entries,
    { id: 'github.project', profile: 'universal', cause: 'unexpected receipt expiry' },
  ]), expected).ok, false);
});

test('quitar del baseline un FAIL que sigue vivo falla; resolverlo exige reconciliar baseline', () => {
  const omitted = { ...expected, entries: expected.entries.slice(1) };
  const unapproved = compareDoctorFailureBaseline(report(expected.entries), omitted);
  assert.equal(unapproved.ok, false);
  assert.ok(unapproved.errors.some((error) => /FAIL no declarado.*profile\.auth-security/.test(error)));

  const resolved = compareDoctorFailureBaseline(report(expected.entries.slice(1)), expected);
  assert.equal(resolved.ok, false);
  assert.ok(resolved.errors.some((error) => /Baseline obsoleto.*profile\.auth-security/.test(error)));
});

test('baseline inválido rechaza duplicados, issue ausente y propiedades desconocidas', () => {
  assert.ok(validateDoctorFailureBaseline({
    schemaVersion: '1.0.0',
    entries: [expected.entries[0], expected.entries[0]],
  }).some((error) => /duplica/.test(error)));
  assert.ok(validateDoctorFailureBaseline({
    schemaVersion: '1.0.0',
    entries: [{ id: 'profile.ui', profile: 'ui' }],
  }).some((error) => /issue/.test(error)));
  assert.ok(validateDoctorFailureBaseline({
    ...expected,
    permissive: true,
  }).some((error) => /solo schemaVersion y entries/.test(error)));
});

test('el baseline versionado coincide con el upstream y la comprobación conserva sus datos', async () => {
  const baselineBytes = await readFile(path.join(root, '.project-os/doctor-failure-baseline.json'));
  const receiptBytes = await readFile(path.join(root, '.project-os/evidence/github-project.json'));
  const configBytes = await readFile(path.join(root, '.project-os/github/product-os.json'));

  const result = await checkUpstreamDoctorBaseline({ root });

  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.expectedFailureCount, 3);
  assert.equal(result.actualFailureCount, 3);
  assert.equal(result.mutationPerformed, false);
  assert.equal(result.remoteAccess, false);
  assert.deepEqual(await readFile(path.join(root, '.project-os/doctor-failure-baseline.json')), baselineBytes);
  assert.deepEqual(await readFile(path.join(root, '.project-os/evidence/github-project.json')), receiptBytes);
  assert.deepEqual(await readFile(path.join(root, '.project-os/github/product-os.json')), configBytes);
});
