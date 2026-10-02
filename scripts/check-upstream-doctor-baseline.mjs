import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectDoctorReport } from '../src/doctor.mjs';
import { runFreshness } from '../src/freshness.mjs';
import { assertNoSymlinkEscape, readBoundedFile, resolveInside } from '../src/paths.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const BASELINE_PATH = '.project-os/doctor-failure-baseline.json';
const BASELINE_MAX_BYTES = 32 * 1024;
const ID_PATTERN = /^[a-z0-9][a-z0-9.-]{0,127}$/;
const PROFILE_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;

function exactKeys(value, expected) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.keys(value).length === expected.length
    && expected.every((key) => Object.hasOwn(value, key));
}

export function validateDoctorFailureBaseline(baseline) {
  const errors = [];
  if (!exactKeys(baseline, ['schemaVersion', 'entries'])) {
    return ['El baseline debe contener solo schemaVersion y entries.'];
  }
  if (baseline.schemaVersion !== '1.0.0' || !Array.isArray(baseline.entries)) {
    return ['El baseline requiere schemaVersion 1.0.0 y entries.'];
  }
  const seen = new Set();
  for (const [index, entry] of baseline.entries.entries()) {
    if (!exactKeys(entry, ['id', 'profile', 'issue'])) {
      errors.push(`entries[${index}] debe contener solo id, profile e issue.`);
      continue;
    }
    if (typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) {
      errors.push(`entries[${index}].id no es un identificador válido.`);
    }
    if (typeof entry.profile !== 'string' || !PROFILE_PATTERN.test(entry.profile)) {
      errors.push(`entries[${index}].profile no es válido.`);
    }
    if (!Number.isSafeInteger(entry.issue) || entry.issue < 1) {
      errors.push(`entries[${index}].issue debe ser un número positivo.`);
    }
    if (typeof entry.id === 'string' && typeof entry.profile === 'string') {
      const key = `${entry.id}\u0000${entry.profile}`;
      if (seen.has(key)) errors.push(`entries[${index}] duplica ${entry.id} (${entry.profile}).`);
      seen.add(key);
    }
  }
  return errors;
}

export function compareDoctorFailureBaseline(report, baseline) {
  const errors = validateDoctorFailureBaseline(baseline);
  if (errors.length > 0) return { ok: false, errors, actual: [], expected: [] };

  const actual = report.results
    .filter((entry) => entry.status === 'FAIL')
    .map(({ id, profile, cause }) => ({ id, profile: profile ?? 'universal', cause }))
    .sort((left, right) => `${left.id}\u0000${left.profile}`.localeCompare(`${right.id}\u0000${right.profile}`));
  const expected = [...baseline.entries]
    .map(({ id, profile }) => ({ id, profile }))
    .sort((left, right) => `${left.id}\u0000${left.profile}`.localeCompare(`${right.id}\u0000${right.profile}`));
  const actualKeys = new Set(actual.map(({ id, profile }) => `${id}\u0000${profile}`));
  const expectedKeys = new Set(expected.map(({ id, profile }) => `${id}\u0000${profile}`));
  const newFailures = actual.filter(({ id, profile }) => !expectedKeys.has(`${id}\u0000${profile}`));
  const obsoleteEntries = expected.filter(({ id, profile }) => !actualKeys.has(`${id}\u0000${profile}`));

  for (const failure of newFailures) {
    errors.push(`FAIL no declarado: ${failure.id} (${failure.profile}) — ${failure.cause}`);
  }
  for (const entry of obsoleteEntries) {
    errors.push(`Baseline obsoleto: ${entry.id} (${entry.profile}) ya no falla; reconcilie la entrada después de verificar la resolución.`);
  }
  return { ok: errors.length === 0, errors, actual, expected };
}

async function readBaseline(root) {
  const absolute = resolveInside(root, BASELINE_PATH, 'baseline del doctor upstream');
  await assertNoSymlinkEscape(root, BASELINE_PATH);
  const bytes = await readBoundedFile(absolute, BASELINE_MAX_BYTES, 'baseline del doctor upstream');
  return JSON.parse(bytes.toString('utf8'));
}

export async function checkUpstreamDoctorBaseline({ root = ROOT, now = new Date() } = {}) {
  const baseline = await readBaseline(root);
  const [doctor, freshness] = await Promise.all([
    collectDoctorReport({ target: root }),
    runFreshness({ targetRoot: root, now }),
  ]);
  const comparison = compareDoctorFailureBaseline(doctor, baseline);
  const projectReceipt = freshness.receipts.find((receipt) => receipt.id === 'github.project');
  const errors = [...comparison.errors];
  if (!projectReceipt || !['fresh', 'due-soon'].includes(projectReceipt.state)) {
    errors.push(`El recibo github.project no está en estado fresco: ${projectReceipt?.state ?? 'ausente'}.`);
  }
  return {
    ok: errors.length === 0,
    errors,
    expectedFailureCount: comparison.expected.length,
    actualFailureCount: comparison.actual.length,
    mutationPerformed: false,
    remoteAccess: false,
  };
}

async function main() {
  const result = await checkUpstreamDoctorBaseline();
  if (result.ok) {
    console.log(`PASS upstream doctor baseline: ${result.actualFailureCount} issue-backed failures match; mutation=no; remote access=no.`);
    return;
  }
  console.error('FAIL upstream doctor baseline:');
  for (const error of result.errors) console.error(`- ${error}`);
  console.error('Recovery: investigate the live doctor result; fix it or update the issue-backed baseline only after verified resolution.');
  process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
