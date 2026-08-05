import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { checkPackageRoot, checkSeededIdentity } from '../scripts/check-package.mjs';
import { nonCanonicalEolEntries, sha256 } from '../scripts/release-lib.mjs';
import { verifyRelease } from '../scripts/verify-release.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function packageFixture(name) {
  const root = await mkdtemp(path.join(tmpdir(), `project-os-${name}-`));
  for (const relative of [
    'package.json',
    'package-lock.json',
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
  ]) {
    await cp(path.join(packageRoot, relative), path.join(root, relative));
  }
  await mkdir(path.join(root, 'bin'));
  await cp(
    path.join(packageRoot, 'bin', 'project-os.mjs'),
    path.join(root, 'bin', 'project-os.mjs'),
  );
  return root;
}

test('package contract rechaza bin ausente y licencia incompatible', async () => {
  const root = await packageFixture('package-negative');
  await rm(path.join(root, 'bin', 'project-os.mjs'));
  let failures = await checkPackageRoot(root);
  assert.equal(failures.includes('missing bin/project-os.mjs'), true);

  await cp(
    path.join(packageRoot, 'bin', 'project-os.mjs'),
    path.join(root, 'bin', 'project-os.mjs'),
  );
  const lockPath = path.join(root, 'package-lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  const dependency = Object.keys(lock.packages).find((name) => name !== '');
  lock.packages[dependency].license = 'GPL-3.0-only';
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  failures = await checkPackageRoot(root);
  assert.equal(
    failures.some((failure) => failure.includes(`dependency license ${dependency}`)),
    true,
  );
});

test('blueprint identity rechaza el par sembrado desincronizado', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-blueprint-'));
  const core = path.join(root, 'blueprint', 'core');
  await mkdir(core, { recursive: true });
  for (const relative of ['package.json', 'package-lock.json']) {
    await cp(
      path.join(packageRoot, 'blueprint', 'core', relative),
      path.join(core, relative),
    );
  }
  const { version } = JSON.parse(
    await readFile(path.join(packageRoot, 'package.json'), 'utf8'),
  );
  assert.deepEqual(await checkSeededIdentity(core, version), []);

  // La regresión de 0.1.5: el manifest sembrado sube de versión y el lock se queda atrás,
  // así que el `npm ci` del inicio rápido aborta con EUSAGE en cada repositorio nuevo.
  const lockPath = path.join(core, 'package-lock.json');
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  lock.packages[''].devDependencies['create-project-engineering-os'] = '0.0.1';
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.equal(
    (await checkSeededIdentity(core, version)).some((failure) => (
      failure.startsWith('blueprint lock range create-project-engineering-os')
    )),
    true,
  );

  const manifestPath = path.join(core, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.devDependencies['@fission-ai/openspec'] = '1.7.0';
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  assert.equal(
    (await checkSeededIdentity(core, version)).some((failure) => (
      failure.startsWith('blueprint allowScripts @fission-ai/openspec@1.6.0')
    )),
    true,
  );
});

test('release verifier rejects an altered tarball', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-release-negative-'));
  const filename = 'create-project-engineering-os-0.1.6.tgz';
  const tarballPath = path.join(root, filename);
  const original = Buffer.from('verified tarball fixture');
  const digest = sha256(original);
  await writeFile(tarballPath, original);
  await writeFile(
    path.join(root, 'release-manifest.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      package: 'create-project-engineering-os',
      version: '0.1.6',
      commit: 'a'.repeat(40),
      tarball: filename,
      sha256: digest,
      bytes: original.byteLength,
      tested: true,
    }, null, 2)}\n`,
  );
  await writeFile(path.join(root, 'SHA256SUMS'), `${digest}  ${filename}\n`);
  assert.equal((await verifyRelease(root)).sha256, digest);

  await writeFile(tarballPath, Buffer.from('altered tarball fixture'));
  await assert.rejects(verifyRelease(root), /Checksum divergente/);
});

test('release pack rechaza CRLF o mixed cuando el atributo exige LF', () => {
  const output = [
    'i/lf    w/lf    attr/text=auto eol=lf \tREADME.md',
    'i/lf    w/crlf  attr/text=auto eol=lf \tbin/project-os.mjs',
    'i/lf    w/mixed attr/text=auto eol=lf \tdocs/README.md',
    'i/-text w/-text attr/-text             \tasset.png',
  ].join('\n');

  assert.deepEqual(nonCanonicalEolEntries(output), [
    { path: 'bin/project-os.mjs', worktreeEol: 'crlf' },
    { path: 'docs/README.md', worktreeEol: 'mixed' },
  ]);
});
