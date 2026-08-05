#!/usr/bin/env node

import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageName = 'create-project-engineering-os';
const allowedLicenses = new Set([
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'CC0-1.0',
  'ISC',
  'MIT',
]);

export async function checkPackageRoot(root) {
  const failures = [];
  let manifest;
  let lock;
  try {
    manifest = await readJson(path.join(root, 'package.json'));
    lock = await readJson(path.join(root, 'package-lock.json'));
  } catch (error) {
    return [`metadata: ${error.message}`];
  }

  if (manifest.name !== 'create-project-engineering-os') failures.push('package name');
  if (manifest.private === true) failures.push('private package');
  if (manifest.license !== 'MIT') failures.push('package license');
  if (manifest.publishConfig?.access !== 'public') failures.push('public access');
  if (manifest.publishConfig?.provenance !== true) failures.push('provenance flag');
  if (manifest.bin?.['create-project-engineering-os'] !== 'bin/project-os.mjs') {
    failures.push('create bin');
  }
  if (manifest.bin?.['project-os'] !== 'bin/project-os.mjs') failures.push('project-os bin');
  if (Object.hasOwn(manifest.bin ?? {}, 'project-constructor')) {
    failures.push('legacy bin without fixture');
  }
  if (lock.name !== manifest.name || lock.version !== manifest.version) failures.push('lock identity');
  if (lock.packages?.['']?.license !== 'MIT') failures.push('lock license');

  for (const relative of [
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
    'bin/project-os.mjs',
  ]) {
    try {
      await access(path.join(root, relative));
    } catch {
      failures.push(`missing ${relative}`);
    }
  }

  for (const [name, record] of Object.entries(lock.packages ?? {})) {
    if (name === '') continue;
    if (!record.license || !allowedLicenses.has(record.license)) {
      failures.push(`dependency license ${name}: ${record.license ?? 'missing'}`);
    }
  }
  return failures;
}

// `directory` holds a seeded pair: the blueprint source under blueprint/core, or the package.json
// and package-lock.json a bootstrap just wrote into a consumer repository.
export async function checkSeededIdentity(directory, expectedVersion) {
  const failures = [];
  let manifest;
  let lock;
  try {
    manifest = await readJson(path.join(directory, 'package.json'));
    lock = await readJson(path.join(directory, 'package-lock.json'));
  } catch (error) {
    return [`blueprint metadata: ${error.message}`];
  }

  const lockRoot = lock.packages?.[''];
  if (!lockRoot) return ['blueprint lock is not lockfile v3'];

  const declared = manifest.devDependencies ?? {};
  const locked = lockRoot.devDependencies ?? {};

  // npm ci refuses to install when the seeded pair disagrees; reproduce that rule offline so a
  // release cannot ship a repository whose first documented command fails.
  for (const [name, pinned] of Object.entries(declared)) {
    if (locked[name] !== pinned) {
      failures.push(`blueprint lock range ${name}: ${locked[name] ?? 'missing'} != ${pinned}`);
    }
    const entry = lock.packages?.[`node_modules/${name}`];
    if (!entry) {
      failures.push(`blueprint lock entry missing ${name}`);
    } else if (entry.version !== pinned) {
      failures.push(`blueprint lock version ${name}: ${entry.version} != ${pinned}`);
    }
  }
  for (const name of Object.keys(locked)) {
    if (!Object.hasOwn(declared, name)) failures.push(`blueprint lock extra ${name}`);
  }

  // The seeded repository must pin the exact runtime that generated it. The entry carries no
  // integrity: the blueprint ships inside the very tarball that hash would describe.
  if (declared[packageName] !== expectedVersion) {
    failures.push(
      `blueprint pin ${packageName}: ${declared[packageName] ?? 'missing'} != ${expectedVersion}`,
    );
  }
  const selfEntry = lock.packages?.[`node_modules/${packageName}`];
  const expectedResolved =
    `https://registry.npmjs.org/${packageName}/-/${packageName}-${expectedVersion}.tgz`;
  if (selfEntry && selfEntry.resolved !== expectedResolved) {
    failures.push(`blueprint resolved ${packageName}: ${selfEntry.resolved ?? 'missing'}`);
  }

  // allowScripts names a pinned "<name>@<version>"; a bumped dependency must not silently unpin it.
  for (const key of Object.keys(manifest.allowScripts ?? {})) {
    const separator = key.lastIndexOf('@');
    const name = key.slice(0, separator);
    const version = key.slice(separator + 1);
    if (declared[name] !== version) {
      failures.push(`blueprint allowScripts ${key}: devDependency is ${declared[name] ?? 'absent'}`);
    }
  }
  return failures;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const manifest = await readJson(path.join(packageRoot, 'package.json'));
  const failures = [
    ...(await checkPackageRoot(packageRoot)),
    ...(await checkSeededIdentity(
      path.join(packageRoot, 'blueprint', 'core'),
      manifest.version,
    )),
  ];
  if (failures.length > 0) {
    process.stderr.write(`FAIL package contract: ${failures.join(', ')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`PASS package contract ${manifest.name}@${manifest.version}\n`);
  }
}
