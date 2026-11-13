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
import { CONSTRUCTOR_VERSION } from '../src/constants.mjs';
import test from 'node:test';

import {
  checkPackageAllowlist,
  checkCoreNoticeCoverage,
  checkPackageRoot,
  checkPackedFiles,
  checkRelativeMarkdownLinks,
  checkSeededIdentity,
} from '../scripts/check-package.mjs';
import { productionPackages, renderNotices } from '../apps/companion/scripts/notices.mjs';
import { compareReleaseDirectories } from '../scripts/compare-release.mjs';
import { assertStableReleaseVersion, nonCanonicalEolEntries, sha256 } from '../scripts/release-lib.mjs';
import { checkReleaseWorkflow, checkPinnedClient } from '../scripts/release-workflow-policy.mjs';
import { verifyRelease } from '../scripts/verify-release.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function packageFixture(name) {
  const root = await mkdtemp(path.join(tmpdir(), `project-os-${name}-`));
  await mkdir(path.join(root, 'config'));
  await mkdir(path.join(root, 'apps', 'companion'), { recursive: true });
  for (const relative of [
    'package.json',
    'package-lock.json',
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
    'config/npm-package-allowlist.json',
  ]) {
    await cp(path.join(packageRoot, relative), path.join(root, relative));
  }
  for (const relative of [
    'package.json',
    'package-lock.json',
    'THIRD-PARTY-NOTICES.md',
  ]) {
    await cp(
      path.join(packageRoot, 'apps', 'companion', relative),
      path.join(root, 'apps', 'companion', relative),
    );
  }
  await mkdir(path.join(root, 'bin'));
  await cp(
    path.join(packageRoot, 'bin', 'project-os.mjs'),
    path.join(root, 'bin', 'project-os.mjs'),
  );
  return root;
}

async function releaseFixture(name, content = 'verified tarball fixture') {
  const root = await mkdtemp(path.join(tmpdir(), `project-os-${name}-`));
  const filename = `create-project-engineering-os-${CONSTRUCTOR_VERSION}.tgz`;
  const tarball = Buffer.from(content);
  const digest = sha256(tarball);
  await writeFile(path.join(root, filename), tarball);
  await writeFile(
    path.join(root, 'release-manifest.json'),
    `${JSON.stringify({
      schemaVersion: 1,
      package: 'create-project-engineering-os',
      version: CONSTRUCTOR_VERSION,
      commit: 'a'.repeat(40),
      tarball: filename,
      sha256: digest,
      bytes: tarball.byteLength,
      fileCount: 1,
      unpackedBytes: tarball.byteLength,
      tested: true,
    }, null, 2)}\n`,
  );
  await writeFile(path.join(root, 'SHA256SUMS'), `${digest}  ${filename}\n`);
  return { root, filename, digest };
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

test('check:package rechaza redistribuciones de producción sin aviso versionado', async () => {
  const root = await packageFixture('package-notice-negative');
  const manifestPath = path.join(root, 'package.json');
  const lockPath = path.join(root, 'package-lock.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  manifest.dependencies = { 'fixture-runtime': '1.2.3' };
  lock.packages[''].dependencies = { 'fixture-runtime': '1.2.3' };
  lock.packages['node_modules/fixture-runtime'] = {
    version: '1.2.3',
    resolved: 'https://registry.npmjs.org/fixture-runtime/-/fixture-runtime-1.2.3.tgz',
    integrity: 'sha512-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==',
    license: 'MIT',
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const failures = await checkPackageRoot(root);
  assert.ok(failures.includes('production dependency notice missing: fixture-runtime@1.2.3 (MIT)'));

  lock.packages['node_modules/fixture-runtime'].dev = true;
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.ok((await checkPackageRoot(root)).includes(
    'core production dependency marked development: fixture-runtime',
  ));

  const companionLockPath = path.join(root, 'apps', 'companion', 'package-lock.json');
  const companionManifestPath = path.join(root, 'apps', 'companion', 'package.json');
  const companionManifest = JSON.parse(await readFile(companionManifestPath, 'utf8'));
  const companionLock = JSON.parse(await readFile(companionLockPath, 'utf8'));
  companionManifest.dependencies['fixture-runtime'] = '1.2.3';
  companionLock.packages[''].dependencies['fixture-runtime'] = '1.2.3';
  companionLock.packages['node_modules/fixture-runtime'] = {
    version: '1.2.3',
    license: 'MIT',
  };
  await writeFile(companionManifestPath, `${JSON.stringify(companionManifest, null, 2)}\n`);
  await writeFile(companionLockPath, `${JSON.stringify(companionLock, null, 2)}\n`);
  failures.length = 0;
  failures.push(...await checkPackageRoot(root));
  assert.ok(failures.includes(
    'Companion third-party notices differ from its production lock inventory',
  ));

  companionLock.packages['node_modules/fixture-runtime'].dev = true;
  await writeFile(companionLockPath, `${JSON.stringify(companionLock, null, 2)}\n`);
  failures.length = 0;
  failures.push(...await checkPackageRoot(root));
  assert.ok(failures.includes(
    'Companion production dependency marked development: fixture-runtime',
  ));

  const productionPackage = Object.keys(companionLock.packages).find((key) => (
    key.startsWith('node_modules/')
    && companionLock.packages[key].dev !== true
    && companionLock.packages[key].version
  ));
  companionLock.packages[productionPackage].license = 'GPL-3.0-only';
  await writeFile(companionLockPath, `${JSON.stringify(companionLock, null, 2)}\n`);
  assert.ok((await checkPackageRoot(root)).includes(
    'Companion third-party notices differ from its production lock inventory',
  ));
});

test('check:package no omite dependencias de producción sin versión o con metadatos inválidos', async () => {
  const coreLock = JSON.parse(await readFile(path.join(packageRoot, 'package-lock.json'), 'utf8'));
  coreLock.packages[''].dependencies = { 'unversioned-core-fixture': '1.0.0' };
  coreLock.packages['node_modules/unversioned-core-fixture'] = { license: 'MIT' };
  assert.ok(checkCoreNoticeCoverage(coreLock, await readFile(
    path.join(packageRoot, 'THIRD_PARTY_NOTICES.md'),
    'utf8',
  )).includes('production dependency version missing: unversioned-core-fixture'));

  const root = await packageFixture('package-unversioned-companion');
  const companionLockPath = path.join(root, 'apps', 'companion', 'package-lock.json');
  const companionManifestPath = path.join(root, 'apps', 'companion', 'package.json');
  const companionManifest = JSON.parse(await readFile(companionManifestPath, 'utf8'));
  const companionLock = JSON.parse(await readFile(companionLockPath, 'utf8'));
  companionManifest.dependencies['unversioned-companion-fixture'] = '1.0.0';
  companionLock.packages[''].dependencies['unversioned-companion-fixture'] = '1.0.0';
  companionLock.packages['node_modules/unversioned-companion-fixture'] = { license: 'MIT' };
  await writeFile(companionManifestPath, `${JSON.stringify(companionManifest, null, 2)}\n`);
  await writeFile(companionLockPath, `${JSON.stringify(companionLock, null, 2)}\n`);
  let failures = await checkPackageRoot(root);
  assert.ok(failures.includes(
    'Companion production dependency version missing: unversioned-companion-fixture',
  ));

  companionLock.packages['node_modules/unversioned-companion-fixture'] = {
    version: '1.0.0',
    license: 'MIT',
    dev: 'false',
  };
  await writeFile(companionLockPath, `${JSON.stringify(companionLock, null, 2)}\n`);
  failures = await checkPackageRoot(root);
  assert.ok(failures.includes(
    'Companion production dependency dev flag invalid: unversioned-companion-fixture',
  ));
});

test('check:package incluye transitivas de producción aunque el lockfile las marque dev', async () => {
  const coreLock = JSON.parse(await readFile(path.join(packageRoot, 'package-lock.json'), 'utf8'));
  coreLock.packages[''].dependencies = { 'fixture-runtime': '1.0.0' };
  coreLock.packages['node_modules/fixture-runtime'] = {
    version: '1.0.0',
    license: 'MIT',
    dependencies: { 'hidden-transitive': '1.0.0' },
  };
  coreLock.packages['node_modules/hidden-transitive'] = {
    version: '1.0.0',
    license: 'MIT',
    dev: true,
  };
  assert.ok(checkCoreNoticeCoverage(coreLock, await readFile(
    path.join(packageRoot, 'THIRD_PARTY_NOTICES.md'),
    'utf8',
  )).includes('production dependency notice missing: hidden-transitive@1.0.0 (MIT)'));

  const root = await packageFixture('package-transitive-dev-flag');
  const manifestPath = path.join(root, 'apps', 'companion', 'package.json');
  const lockPath = path.join(root, 'apps', 'companion', 'package-lock.json');
  const noticesPath = path.join(root, 'apps', 'companion', 'THIRD-PARTY-NOTICES.md');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  manifest.dependencies['fixture-runtime'] = '1.0.0';
  lock.packages[''].dependencies['fixture-runtime'] = '1.0.0';
  lock.packages['node_modules/fixture-runtime'] = {
    version: '1.0.0',
    license: 'MIT',
    dependencies: {
      'hidden-transitive': '1.0.0',
      'platform-neutral': '1.0.0',
    },
  };
  lock.packages['node_modules/hidden-transitive'] = {
    version: '1.0.0',
    license: 'MIT',
    dev: true,
  };
  lock.packages['node_modules/fixture-runtime/node_modules/platform-neutral'] = {
    version: '1.0.0',
    license: 'MIT',
    os: ['!darwin'],
    cpu: ['!arm64'],
    dev: true,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);

  const inventory = productionPackages(lock);
  assert.ok(inventory.some((entry) => entry.name === 'hidden-transitive'));
  assert.ok(inventory.some((entry) => entry.name === 'platform-neutral'));
  await writeFile(
    noticesPath,
    renderNotices(inventory.filter((entry) => (
      !['hidden-transitive', 'platform-neutral'].includes(entry.name)
    )), manifest.version),
  );
  assert.ok((await checkPackageRoot(root)).includes(
    'Companion third-party notices differ from its production lock inventory',
  ));
});

test('check:package falla cerrado ante mapas de dependencias explícitamente nulos', async () => {
  const lock = JSON.parse(await readFile(
    path.join(packageRoot, 'apps', 'companion', 'package-lock.json'),
    'utf8',
  ));
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    const malformed = structuredClone(lock);
    malformed.packages[''][field] = null;
    assert.throws(() => productionPackages(malformed), new RegExp(`invalid ${field} map`));
  }

  const malformedTransitive = structuredClone(lock);
  malformedTransitive.packages['node_modules/fixture-runtime'] = {
    version: '1.0.0',
    license: 'MIT',
    dependencies: null,
  };
  malformedTransitive.packages[''].dependencies = { 'fixture-runtime': '1.0.0' };
  assert.throws(
    () => productionPackages(malformedTransitive),
    /invalid dependencies map/,
  );
});

test('check:package rechaza mapas nulos del manifiesto y contrasta peerDependencies', async () => {
  const root = await packageFixture('package-manifest-map-negative');
  const manifestPath = path.join(root, 'apps', 'companion', 'package.json');
  const lockPath = path.join(root, 'apps', 'companion', 'package-lock.json');
  const originalManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const originalLock = JSON.parse(await readFile(lockPath, 'utf8'));

  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    const manifest = structuredClone(originalManifest);
    manifest[field] = null;
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    assert.ok((await checkPackageRoot(root)).includes(
      `Companion manifest ${field} invalid`,
    ));
  }

  const manifest = structuredClone(originalManifest);
  const lock = structuredClone(originalLock);
  manifest.peerDependencies = { 'fixture-peer': '^1.0.0' };
  lock.packages[''].peerDependencies = { 'fixture-peer': '^2.0.0' };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.ok((await checkPackageRoot(root)).includes(
    'Companion peerDependencies declaration differs from lock: fixture-peer',
  ));
});

test('check:package omite peers opcionales no instalados y exige los peers requeridos', async () => {
  const root = await packageFixture('package-optional-peer');
  const manifestPath = path.join(root, 'apps', 'companion', 'package.json');
  const lockPath = path.join(root, 'apps', 'companion', 'package-lock.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const lock = JSON.parse(await readFile(lockPath, 'utf8'));
  manifest.peerDependencies = { 'optional-peer': '^1.0.0' };
  lock.packages[''].peerDependencies = { 'optional-peer': '^1.0.0' };
  lock.packages[''].peerDependenciesMeta = { 'optional-peer': { optional: true } };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.deepEqual(await checkPackageRoot(root), []);

  delete lock.packages[''].peerDependenciesMeta['optional-peer'];
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.ok((await checkPackageRoot(root)).some((failure) => (
    failure.includes('production dependency lock entry missing: optional-peer')
  )));

  lock.packages[''].peerDependenciesMeta['optional-peer'] = { optional: 'true' };
  await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
  assert.ok((await checkPackageRoot(root)).some((failure) => (
    failure.includes('invalid peerDependenciesMeta entry: optional-peer')
  )));
});

test('package allowlist rechaza globs amplios y rutas del Companion o fuera de lista', async () => {
  const manifest = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
  const policy = JSON.parse(await readFile(path.join(packageRoot, 'config', 'npm-package-allowlist.json'), 'utf8'));
  assert.deepEqual(checkPackageAllowlist(manifest.files, policy), []);

  const broadEntry = 'docs/**/*.md';
  const broad = [...manifest.files, broadEntry];
  assert.ok(checkPackageAllowlist(broad, { ...policy, files: broad })
    .some((failure) => failure.includes('unsupported package allowlist entry')));

  const baseTarball = ['package.json', 'README.md', 'LICENSE', 'bin/project-os.mjs'];
  assert.deepEqual(checkPackedFiles(baseTarball, manifest.files, { requireDeclared: false }), []);
  assert.ok(checkPackedFiles([...baseTarball, 'docs/NOT_DECLARED.md'], manifest.files, { requireDeclared: false })
    .some((failure) => failure.includes('outside allowlist')));
  assert.ok(checkPackedFiles([...baseTarball, 'docs/companion/INSTALLER.md'], manifest.files, { requireDeclared: false })
    .some((failure) => failure.includes('forbidden tarball path')));
});

test('package link check reads extracted Markdown and rejects missing relative destinations', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-package-links-'));
  try {
    await mkdir(path.join(root, 'docs'));
    await writeFile(path.join(root, 'README.md'), '[guide](docs/guide.md)\n[docs](docs/)\n[web](https://example.com)\n');
    await writeFile(path.join(root, 'docs', 'guide.md'), '[home](../README.md)\n');
    const files = ['README.md', 'docs/guide.md'];
    assert.deepEqual(await checkRelativeMarkdownLinks(root, files), []);

    await writeFile(path.join(root, 'README.md'), '[missing][guide]\n\n[guide]: docs/absent.md\n<a href="docs/other-missing.md">broken</a>\n');
    assert.ok((await checkRelativeMarkdownLinks(root, files))
      .some((failure) => failure.includes('broken package link in README.md')));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
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
  const { root, filename, digest } = await releaseFixture('release-negative');
  const tarballPath = path.join(root, filename);
  assert.equal((await verifyRelease(root)).sha256, digest);
  assert.equal((await verifyRelease(root, { expectedCommit: 'a'.repeat(40) })).sha256, digest);
  await assert.rejects(
    verifyRelease(root, { expectedCommit: 'b'.repeat(40) }),
    /el source verificado/,
  );

  const manifestPath = path.join(root, 'release-manifest.json');
  const releaseManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  await writeFile(manifestPath, `${JSON.stringify({ ...releaseManifest, fileCount: 0 }, null, 2)}\n`);
  await assert.rejects(verifyRelease(root), /métricas válidas/);
  await writeFile(manifestPath, `${JSON.stringify(releaseManifest, null, 2)}\n`);

  await writeFile(tarballPath, Buffer.from('altered tarball fixture'));
  await assert.rejects(verifyRelease(root), /tamaño comprimido/);
});

test('release comparison accepts only identical canonical assets', async () => {
  const expected = await releaseFixture('release-expected');
  const observed = await releaseFixture('release-observed');
  assert.equal(
    (await compareReleaseDirectories(expected.root, observed.root)).sha256,
    expected.digest,
  );

  await writeFile(path.join(observed.root, 'unexpected.txt'), 'extra');
  await assert.rejects(
    compareReleaseDirectories(expected.root, observed.root),
    /Assets de release inesperados/,
  );
  await rm(path.join(observed.root, 'unexpected.txt'));

  await rm(path.join(observed.root, observed.filename));
  await assert.rejects(
    compareReleaseDirectories(expected.root, observed.root),
    /Assets de release inesperados/,
  );

  const different = await releaseFixture('release-different', 'different but internally valid');
  await assert.rejects(
    compareReleaseDirectories(expected.root, different.root),
    /difiere byte por byte/,
  );

  const malformed = await releaseFixture('release-malformed');
  await writeFile(path.join(malformed.root, 'release-manifest.json'), '{}\n');
  await assert.rejects(
    compareReleaseDirectories(expected.root, malformed.root),
    /nombre de tarball inválido/,
  );
});

test('release workflow policy preserves delayed approval recovery', async () => {
  const workflow = await readFile(path.join(packageRoot, '.github', 'workflows', 'release.yml'), 'utf8');
  assert.deepEqual(checkReleaseWorkflow(workflow), []);
  assert.equal(checkPinnedClient(workflow.replace('npm@11.19.1', 'npm@latest'), 2).length, 1);
  assert.equal(checkPinnedClient(workflow.replace('--global --ignore-scripts', '--global'), 2).length, 1);

  assert.equal(
    checkReleaseWorkflow(workflow.replace('retention-days: 35', 'retention-days: 7'))
      .some((failure) => failure.includes('30-day approval')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replaceAll(
      'node scripts/pack-release.mjs --output release',
      'node scripts/pack-release.mjs --output rebuilt',
    )).some((failure) => failure.includes('pack-release.mjs --output release')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'git show "$RELEASE_TOOL_SHA:scripts/release-lib.mjs" > scripts/release-lib.mjs',
      'git show "$RELEASE_TOOL_SHA:scripts/other.mjs" > scripts/release-lib.mjs',
    )).some((failure) => failure.includes('exact workflow commit on main')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'git show "$RELEASE_TOOL_SHA:scripts/validate-release.mjs" > scripts/validate-release.mjs',
      'git show "$RELEASE_TOOL_SHA:scripts/other.mjs" > scripts/validate-release.mjs',
    )).some((failure) => failure.includes('source validator and resolver')),
    true,
  );
  const loadAt = workflow.indexOf('      - name: Load reviewed release tools from workflow commit');
  const validateAt = workflow.indexOf('      - name: Validate tag and source');
  const packAt = workflow.indexOf('      - name: Pack once and smoke exact tarball');
  const misordered = `${workflow.slice(0, loadAt)}${workflow.slice(validateAt, packAt)}${workflow.slice(loadAt, validateAt)}${workflow.slice(packAt)}`;
  assert.equal(
    checkReleaseWorkflow(misordered).some((failure) => failure.includes('load the source validator and resolver')),
    true,
  );
  const verifierExtraction = '          git show "$RELEASE_TOOL_SHA:scripts/verify-release.mjs" > scripts/verify-release.mjs\n';
  const verifierCall = '          node scripts/verify-release.mjs release --commit "$SOURCE_COMMIT"';
  const verifierMisordered = workflow
    .replace(verifierExtraction, '')
    .replace(verifierCall, `${verifierCall}\n${verifierExtraction.trimEnd()}`);
  assert.equal(
    checkReleaseWorkflow(verifierMisordered).some((failure) => failure.includes('load its candidate verifier')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'node scripts/verify-release.mjs release --commit "$SOURCE_COMMIT"',
      'node scripts/verify-release.mjs release',
    )).some((failure) => failure.includes('bind candidate manifest identity')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'gh release download "$RELEASE_TAG" --dir canonical-release',
      'gh release download "$RELEASE_TAG" --dir release',
    )).some((failure) => failure.includes('release download')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'node scripts/compare-release.mjs release canonical-release',
      'node scripts/verify-release.mjs canonical-release',
    )).some((failure) => failure.includes('compare-release.mjs release canonical-release')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'npm publish ./canonical-release/*.tgz --access public --provenance',
      'npm publish ./release/*.tgz --access public --provenance',
    )).some((failure) => failure.includes('npm publish ./canonical-release')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(`${workflow}\n      - uses: actions/download-artifact@${'a'.repeat(40)}\n`)
      .some((failure) => failure.includes('workflow artifact')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'node scripts/validate-release.mjs --tag "$RELEASE_TAG" --remote',
      'node scripts/validate-release.mjs --tag "${{ inputs.tag }}" --remote',
    )).some((failure) => failure.includes('release inputs must use fully qualified tag refs')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'node scripts/validate-release.mjs --tag "$RELEASE_TAG" --remote',
      'node scripts/validate-release.mjs --tag "${{ github.event.inputs.tag }}" --remote',
    )).some((failure) => failure.includes('release inputs must use fully qualified tag refs')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'node scripts/validate-release.mjs --tag "$RELEASE_TAG" --verify-tag-source',
      'node scripts/validate-release.mjs --tag "${{ github.event.inputs[\'tag\'] }}" --verify-tag-source',
    )).some((failure) => failure.includes('release inputs must use fully qualified tag refs')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'ref: refs/tags/${{ inputs.tag }}',
      'ref: ${{ inputs.tag }}',
    )).some((failure) => failure.includes('release inputs must use fully qualified tag refs')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      'environment: github-release',
      'environment: unprotected',
    )).some((failure) => failure.includes('branch-restricted github-release environment')),
    true,
  );
  assert.equal(
    checkReleaseWorkflow(workflow.replace(
      "    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest",
      '    runs-on: ubuntu-latest',
    )).some((failure) => failure.includes('build job must run only')),
    true,
  );
});

test('release validation rejects prereleases before creating a GitHub Release', () => {
  assert.doesNotThrow(() => assertStableReleaseVersion('1.2.3'));
  assert.throws(
    () => assertStableReleaseVersion('1.2.3-rc.1'),
    /solo admite versiones estables/,
  );
});

test('release pack acepta solo estados LF coherentes con índice y worktree', () => {
  const output = [
    'i/lf    w/lf    attr/text=auto eol=lf \tREADME.md',
    'i/lf    w/crlf  attr/text=auto eol=lf \tbin/project-os.mjs',
    'i/lf    w/mixed attr/text=auto eol=lf \tdocs/README.md',
    'i/lf    w/none  attr/text=auto eol=lf \tdata/removed-lines.json',
    'i/none  w/lf    attr/text=auto eol=lf \tdata/added-line.json',
    'i/none  w/none  attr/text=auto eol=lf \tdata/no-final-newline.json',
    'i/none  w/none  attr/text=auto eol=lf \tlogs/empty.txt',
    'i/none  w/unknown attr/text=auto eol=lf \tunknown-state.txt',
    'i/-text w/-text attr/-text             \tasset.png',
  ].join('\n');

  assert.deepEqual(nonCanonicalEolEntries(output), [
    { path: 'bin/project-os.mjs', worktreeEol: 'crlf' },
    { path: 'docs/README.md', worktreeEol: 'mixed' },
    { path: 'data/removed-lines.json', worktreeEol: 'none' },
    { path: 'data/added-line.json', worktreeEol: 'lf' },
    { path: 'unknown-state.txt', worktreeEol: 'unknown' },
  ]);
});
