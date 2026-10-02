import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { stableStringify } from '../src/json.mjs';
import { doctorInternals } from '../src/doctor.mjs';
import {
  classifyGithubProjectReceipt,
  freshnessInternals,
  runFreshness,
} from '../src/freshness.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(packageRoot, 'bin', 'project-os.mjs');
const catalogSeed = path.join(packageRoot, 'blueprint/core/project-os/tool-catalog.json');
const fixedNow = new Date('2026-09-24T00:00:00.000Z');
const productConfig = {
  owner: 'IgnacioBarEsp',
  projectNumber: 3,
  title: 'Project Engineering OS',
};
const productConfigHash = createHash('sha256')
  .update(`${doctorInternals.stableStringify(productConfig)}\n`)
  .digest('hex');

function receipt(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    status: 'PASS',
    optIn: true,
    configHash: productConfigHash,
    issuedAt: '2026-09-01T00:00:00.000Z',
    expiresAt: '2027-02-28T00:00:00.000Z',
    source: 'https://github.com/users/IgnacioBarEsp/projects/3',
    verification: 'La vista devolvió el owner y título configurados; sin mutación remota.',
    renewalCommand: 'gh project view 3 --owner IgnacioBarEsp --format json',
    ...overrides,
  };
}

async function temporary(t, name) {
  const root = await mkdtemp(path.join(tmpdir(), `project-os-freshness-${name}-`));
  t.after(() => rm(root, { recursive: true, force: true }));
  const catalog = JSON.parse(await readFile(catalogSeed, 'utf8'));
  await writeJson(root, '.project-os/tool-catalog.json', catalog);
  await writeJson(root, '.project-os/github/product-os.json', productConfig);
  return root;
}

async function writeJson(root, relative, value) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, stableStringify(value));
  return absolute;
}

function run(command, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (exitCode) => resolve({ exitCode, stderr, stdout }));
  });
}

test('el clasificador distingue vigencia, ventana de 30 días y expiración exacta', () => {
  assert.equal(classifyGithubProjectReceipt(receipt(), { now: fixedNow }).state, 'fresh');
  assert.equal(classifyGithubProjectReceipt(receipt({
    expiresAt: '2026-10-24T00:00:00.000Z',
  }), { now: fixedNow }).state, 'due-soon');
  assert.equal(classifyGithubProjectReceipt(receipt({
    expiresAt: '2026-09-24T00:00:00.000Z',
  }), { now: fixedNow }).state, 'stale');
  assert.equal(classifyGithubProjectReceipt(receipt({
    expiresAt: '2026-10-24T00:00:00.001Z',
  }), { now: fixedNow }).state, 'fresh');
  assert.equal(classifyGithubProjectReceipt(receipt({
    source: 'https://github.com/orgs/ExampleOrg/projects/42',
    renewalCommand: 'gh project view 42 --owner ExampleOrg --format json',
  }), { now: fixedNow }).state, 'fresh');
});

test('el recibo rechaza shape, fechas, vigencias largas, secreto y comando fuera del allowlist', () => {
  for (const invalid of [
    receipt({ renewalCommand: 'gh project delete 3 --owner IgnacioBarEsp' }),
    receipt({ renewalCommand: 'gh project view 3 --owner IgnacioBarEsp --format json; whoami' }),
    receipt({ renewalCommand: 'gh project view 2 --owner SomeoneElse --format json' }),
    receipt({ expiresAt: '2026-09-24' }),
    receipt({ issuedAt: '2027-01-01T00:00:00.000Z' }),
    receipt({ expiresAt: '2027-08-01T00:00:00.000Z' }),
    receipt({ verification: '' }),
    receipt({ verification: 'Bearer abcdefghijklmnop' }),
    receipt({ verification: 'credential evidence: sk-abcdefghijklmnop' }),
    receipt({ verification: 'github_pat_1234567890123456' }),
    { ...receipt(), extra: true },
  ]) {
    assert.equal(classifyGithubProjectReceipt(invalid, { now: fixedNow }).state, 'invalid');
  }
  assert.equal(freshnessInternals.safeGithubProjectCommand(receipt().renewalCommand), true);
  assert.equal(freshnessInternals.safeGithubProjectCommand('gh project delete 3'), false);
});

test('freshness combina catálogo y recibo stale, termina en 0 y no escribe archivos', async (t) => {
  const root = await temporary(t, 'stale');
  const receiptPath = await writeJson(root, '.project-os/evidence/github-project.json', receipt({
    expiresAt: '2026-09-23T00:00:00.000Z',
  }));
  const catalogPath = path.join(root, '.project-os/tool-catalog.json');
  const beforeReceipt = await readFile(receiptPath);
  const beforeCatalog = await readFile(catalogPath);

  const report = await runFreshness({ targetRoot: root, now: fixedNow });

  assert.equal(report.exitCode, 0);
  assert.equal(report.mutationPerformed, false);
  assert.equal(report.remoteAccess, false);
  assert.equal(report.catalogSource, 'target');
  assert.ok(report.pins.length > 0);
  assert.equal(report.receipts[0].state, 'stale');
  assert.match(report.receipts[0].renewalCommand, /^gh project view/);
  assert.deepEqual(await readFile(receiptPath), beforeReceipt);
  assert.deepEqual(await readFile(catalogPath), beforeCatalog);
});

test('freshness reports a missing receipt without turning diagnostic absence into a gate', async (t) => {
  const root = await temporary(t, 'missing');
  await rm(path.join(root, '.project-os/tool-catalog.json'));
  const report = await runFreshness({ targetRoot: root, now: fixedNow });
  assert.equal(report.exitCode, 0);
  assert.equal(report.receipts[0].state, 'missing');
  assert.equal(report.mutationPerformed, false);
  assert.equal(report.catalogSource, 'blueprint-seed');
});

test('freshness invalida un recibo cuyo configHash ya no corresponde al manifiesto', async (t) => {
  const root = await temporary(t, 'config-drift');
  await writeJson(root, '.project-os/evidence/github-project.json', receipt());
  await writeJson(root, '.project-os/github/product-os.json', {
    ...productConfig,
    title: 'Renamed Project',
  });

  const report = await runFreshness({ targetRoot: root, now: fixedNow });
  assert.equal(report.receipts[0].state, 'invalid');
  assert.match(report.receipts[0].reason, /no corresponde al manifiesto/);
  assert.equal(report.mutationPerformed, false);
  assert.equal(report.remoteAccess, false);
});

test('freshness rejects an oversized, malformed or outside-linked receipt', async (t) => {
  const root = await temporary(t, 'invalid');
  const relative = '.project-os/evidence/github-project.json';
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, '{ broken');
  assert.equal((await runFreshness({ targetRoot: root, now: fixedNow })).receipts[0].state, 'invalid');

  await writeFile(absolute, ' '.repeat(16 * 1024 + 1));
  assert.equal((await runFreshness({ targetRoot: root, now: fixedNow })).receipts[0].state, 'invalid');

  const outside = path.join(path.dirname(root), `outside-${path.basename(root)}.json`);
  await writeFile(outside, stableStringify(receipt()));
  try {
    await rm(absolute);
    await symlink(outside, absolute, 'file');
  } catch (error) {
    await rm(outside, { force: true });
    if (['EPERM', 'EACCES', 'ENOSYS', 'EOPNOTSUPP'].includes(error.code)) {
      t.skip(`Symlinks are unavailable: ${error.code}`);
      return;
    }
    throw error;
  }
  assert.equal((await runFreshness({ targetRoot: root, now: fixedNow })).receipts[0].state, 'invalid');
  await rm(outside, { force: true });
});

test('la ruta CLI freshness permanece read-only y nunca ejecuta el comando de renovación', async (t) => {
  const root = await temporary(t, 'cli');
  const receiptPath = await writeJson(root, '.project-os/evidence/github-project.json', receipt({
    renewalCommand: 'gh project view 3 --owner IgnacioBarEsp --format json; whoami',
  }));
  const before = await readFile(receiptPath);
  const response = await run(process.execPath, [cli, 'freshness', '--target', root, '--json']);
  assert.equal(response.exitCode, 1);
  const report = JSON.parse(response.stdout);
  assert.equal(report.receipts[0].state, 'invalid');
  assert.equal(report.mutationPerformed, false);
  assert.equal(await readFile(receiptPath, 'utf8'), before.toString('utf8'));
});
