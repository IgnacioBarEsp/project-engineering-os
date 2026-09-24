#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import pathPosix from 'node:path/posix';
import { fileURLToPath } from 'node:url';

import { readJson, resolveNpmCli } from './release-lib.mjs';

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
const MAX_PACKAGE_FILES = 10_000;
const MAX_TARBALL_BYTES = 32 * 1024 * 1024;
const MAX_UNPACKED_BYTES = 128 * 1024 * 1024;
const MAX_PROCESS_OUTPUT_BYTES = 16 * 1024 * 1024;
const permittedPackageDirectories = new Set(['bin/', 'blueprint/', 'schema/', 'src/']);
const permittedDocumentationDirectories = new Set([
  'docs/adr/',
  'docs/architecture/',
  'docs/prompts/',
  'docs/security/',
]);
const forbiddenPackagePaths = [
  'docs/companion/',
  'docs/stitch uxui/',
  'docs/assets/',
  'docs/PROJECT_STATUS.md',
  'docs/RELEASES.md',
  'docs/USER_GUIDE.md',
  'docs/presentations/',
];
const permittedRootFiles = new Set([
  'CHANGELOG.md',
  'LICENSE',
  'MANAGED_FILES_NOTICE.md',
  'README.md',
  'THIRD_PARTY_NOTICES.md',
]);

function run(command, args, cwd, { timeoutMs = 120_000 } = {}) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    let outputBytes = 0;
    let settled = false;
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const timer = setTimeout(() => finishError(new Error(`${path.basename(command)} timed out`)), timeoutMs);
    const append = (target, chunk) => {
      outputBytes += chunk.length;
      if (outputBytes > MAX_PROCESS_OUTPUT_BYTES) {
        finishError(new Error(`${path.basename(command)} output exceeded its limit`));
        return target;
      }
      return target + chunk.toString();
    };
    const finishError = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.kill();
      reject(error);
    };
    child.stdout.on('data', (chunk) => { stdout = append(stdout, chunk); });
    child.stderr.on('data', (chunk) => { stderr = append(stderr, chunk); });
    child.on('error', finishError);
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr });
    });
  });
}

function safePackagePath(value) {
  if (typeof value !== 'string' || value.length === 0 || value.includes('\\')) return false;
  if (value.startsWith('/') || /^[A-Za-z]:/.test(value)) return false;
  const segments = value.split('/');
  return !segments.some((segment, index) => (
    segment === '.' || segment === '..'
    || (segment.length === 0 && index !== segments.length - 1)
    || (segment.length === 0 && index === segments.length - 1 && !value.endsWith('/'))
  ));
}

function pathMatchesFiles(pathname, declaredFiles) {
  if (pathname === 'package.json') return true;
  return declaredFiles.some((entry) => (
    entry.endsWith('/') ? pathname.startsWith(entry) : pathname === entry
  ));
}

export function checkPackageAllowlist(manifestFiles, policy) {
  const failures = [];
  if (!Array.isArray(manifestFiles)) failures.push('package files must be an array');
  if (policy?.schemaVersion !== 1 || !Array.isArray(policy.files)
    || !Array.isArray(policy.implicitFiles) || policy.implicitFiles.length !== 1
    || policy.implicitFiles[0] !== 'package.json') {
    failures.push('invalid npm package allowlist policy');
    return failures;
  }
  if (JSON.stringify(manifestFiles) !== JSON.stringify(policy.files)) {
    failures.push('package files differ from config/npm-package-allowlist.json');
  }
  if (new Set(policy.files).size !== policy.files.length) failures.push('duplicate package allowlist entry');

  for (const entry of policy.files) {
    if (!safePackagePath(entry) || /[*?{}\[\]!]/.test(entry)) {
      failures.push(`unsafe or unsupported package allowlist entry ${entry}`);
      continue;
    }
    if (entry.startsWith('docs/')) {
      if (forbiddenPackagePaths.some((prefix) => (
        prefix.endsWith('/') ? entry.startsWith(prefix) : entry === prefix
      ))) {
        failures.push(`forbidden documentation path ${entry}`);
      } else if (entry.endsWith('/')) {
        if (!permittedDocumentationDirectories.has(entry)) {
          failures.push(`unapproved documentation directory ${entry}`);
        }
      } else if (!entry.endsWith('.md')) {
        failures.push(`non-Markdown documentation file ${entry}`);
      }
      continue;
    }
    if (permittedPackageDirectories.has(entry) || permittedRootFiles.has(entry)) continue;
    failures.push(`unapproved package path ${entry}`);
  }

  for (const required of [
    ...permittedPackageDirectories,
    ...permittedDocumentationDirectories,
    ...permittedRootFiles,
  ]) {
    if (!policy.files.includes(required)) failures.push(`allowlist missing ${required}`);
  }
  return failures;
}

export function checkPackedFiles(files, declaredFiles, { requireDeclared = true } = {}) {
  const failures = [];
  const seen = new Set();
  for (const rawPath of files) {
    const pathname = typeof rawPath === 'string' ? rawPath : rawPath?.path;
    if (!safePackagePath(pathname)) {
      failures.push(`unsafe tarball path ${String(pathname)}`);
      continue;
    }
    if (seen.has(pathname)) failures.push(`duplicate tarball path ${pathname}`);
    seen.add(pathname);
    if (forbiddenPackagePaths.some((prefix) => (
      prefix.endsWith('/') ? pathname.startsWith(prefix) : pathname === prefix
    ))) {
      failures.push(`forbidden tarball path ${pathname}`);
    } else if (!pathMatchesFiles(pathname, declaredFiles)) {
      failures.push(`tarball path outside allowlist ${pathname}`);
    }
  }
  for (const required of ['package.json', 'README.md', 'LICENSE', 'bin/project-os.mjs']) {
    if (!seen.has(required)) failures.push(`tarball missing required path ${required}`);
  }
  if (requireDeclared) {
    for (const entry of declaredFiles) {
      if (entry.endsWith('/')) {
        if (![...seen].some((pathname) => pathname.startsWith(entry))) {
          failures.push(`declared package directory is empty ${entry}`);
        }
      } else if (!seen.has(entry)) {
        failures.push(`declared package path is missing ${entry}`);
      }
    }
  }
  return failures;
}

function markdownDestinations(markdown) {
  const destinations = [];
  const inline = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\s*\)/g;
  const reference = /^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))(?:\s+.*)?$/gm;
  const htmlAttributes = /\b(?:href|src)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  for (const match of markdown.matchAll(inline)) destinations.push(match[1] ?? match[2]);
  for (const match of markdown.matchAll(reference)) destinations.push(match[1] ?? match[2]);
  for (const match of markdown.matchAll(htmlAttributes)) destinations.push(match[1] ?? match[2] ?? match[3]);
  return destinations;
}

function packagePathIndex(filePaths) {
  const files = new Set(filePaths);
  const directories = new Set(['.']);
  for (const pathname of filePaths) {
    let directory = pathPosix.dirname(pathname);
    while (directory !== '.' && directory !== '/') {
      directories.add(directory);
      directory = pathPosix.dirname(directory);
    }
  }
  return { files, directories };
}

function packageTargetExists(target, { files, directories }) {
  return files.has(target) || directories.has(target.replace(/\/$/, ''));
}

export async function checkRelativeMarkdownLinks(extractedPackageRoot, filePaths) {
  const failures = [];
  const index = packagePathIndex(filePaths);
  for (const pathname of filePaths.filter((value) => value.toLowerCase().endsWith('.md'))) {
    let markdown;
    try {
      markdown = await readFile(path.join(extractedPackageRoot, ...pathname.split('/')), 'utf8');
    } catch (error) {
      failures.push(`cannot read packaged Markdown ${pathname}: ${error.message}`);
      continue;
    }
    for (const rawDestination of markdownDestinations(markdown)) {
      const destination = rawDestination.trim().replace(/&amp;/g, '&');
      if (destination.length === 0 || destination.startsWith('#') || destination.startsWith('//')
        || /^[a-z][a-z0-9+.-]*:/i.test(destination)) continue;
      const destinationPath = destination.split(/[?#]/, 1)[0];
      if (destinationPath.length === 0) continue;
      let decoded;
      try {
        decoded = decodeURIComponent(destinationPath);
      } catch {
        failures.push(`malformed relative link in ${pathname}: ${destination}`);
        continue;
      }
      const target = pathPosix.normalize(pathPosix.join(pathPosix.dirname(pathname), decoded));
      if (target === '..' || target.startsWith('../') || target.startsWith('/')) {
        failures.push(`relative link escapes package in ${pathname}: ${destination}`);
      } else if (!packageTargetExists(target, index)) {
        failures.push(`broken package link in ${pathname}: ${destination}`);
      }
    }
  }
  return failures;
}

async function listExtractedFiles(directory, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      result.push(...await listExtractedFiles(path.join(directory, entry.name), relative));
    } else if (entry.isFile()) {
      result.push(relative.replaceAll('\\', '/'));
    } else {
      throw new Error(`Tipo de archivo inesperado en tarball: ${relative}`);
    }
  }
  return result;
}

export async function checkPackageContents(root) {
  const failures = [];
  const result = (fileCount = null, unpackedBytes = null, bytes = null) => (
    { failures, fileCount, unpackedBytes, bytes }
  );
  const manifest = await readJson(path.join(root, 'package.json'));
  const policy = await readJson(path.join(root, 'config', 'npm-package-allowlist.json'));
  failures.push(...checkPackageAllowlist(manifest.files, policy));
  if (failures.length > 0) return result();

  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'project-os-package-check-'));
  const extractedRoot = path.join(temporaryRoot, 'extract');
  try {
    await mkdir(extractedRoot);
    const npmCli = await resolveNpmCli();
    const packedResult = await run(process.execPath, [
      npmCli,
      'pack',
      '--json',
      '--pack-destination',
      temporaryRoot,
    ], root);
    if (packedResult.code !== 0) {
      failures.push(`npm pack failed: ${(packedResult.stderr || packedResult.stdout).trim()}`);
      return result();
    }
    let packed;
    try {
      packed = JSON.parse(packedResult.stdout);
    } catch {
      failures.push('npm pack returned invalid JSON');
      return result();
    }
    if (!Array.isArray(packed) || packed.length !== 1 || !Array.isArray(packed[0]?.files)
      || typeof packed[0]?.filename !== 'string') {
      failures.push('npm pack did not produce one inspectable tarball');
      return result();
    }
    const metadata = packed[0];
    const metadataPaths = metadata.files.map((file) => file.path);
    failures.push(...checkPackedFiles(metadataPaths, policy.files));
    if (path.basename(metadata.filename) !== metadata.filename || !metadata.filename.endsWith('.tgz')) {
      failures.push(`unsafe npm tarball filename ${metadata.filename}`);
      return result(metadata.entryCount, metadata.unpackedSize, metadata.size);
    }
    if (!Number.isSafeInteger(metadata.entryCount) || metadata.entryCount !== metadataPaths.length
      || metadata.entryCount < 1 || metadata.entryCount > MAX_PACKAGE_FILES) {
      failures.push('npm pack entry count differs from its file inventory');
    }
    if (!Number.isSafeInteger(metadata.unpackedSize) || metadata.unpackedSize < 1
      || metadata.unpackedSize > MAX_UNPACKED_BYTES) {
      failures.push('npm pack unpacked size is invalid');
    }
    if (!Number.isSafeInteger(metadata.size) || metadata.size < 1 || metadata.size > MAX_TARBALL_BYTES) {
      failures.push('npm pack tarball size is invalid');
    }
    if (failures.length > 0) return result(metadata.entryCount, metadata.unpackedSize, metadata.size);

    const tarballPath = path.join(temporaryRoot, metadata.filename);
    const listing = await run('tar', ['-tzf', tarballPath], root);
    if (listing.code !== 0) {
      failures.push(`cannot list npm tarball: ${(listing.stderr || listing.stdout).trim()}`);
      return result(metadata.entryCount, metadata.unpackedSize, metadata.size);
    }
    const archiveEntries = listing.stdout.split(/\r?\n/).filter(Boolean);
    const archiveFailures = [];
    for (const entry of archiveEntries) {
      const member = entry.replace(/\/$/, '');
      if (member === 'package') continue;
      if (!member.startsWith('package/')) {
        archiveFailures.push(`tarball member outside package/: ${entry}`);
        continue;
      }
      const relative = member.slice('package/'.length);
      if (!safePackagePath(relative)) archiveFailures.push(`unsafe tarball member ${entry}`);
    }
    if (archiveFailures.length > 0) {
      failures.push(...archiveFailures);
      return result(metadata.entryCount, metadata.unpackedSize, metadata.size);
    }

    const extracted = await run('tar', ['-xzf', tarballPath, '-C', extractedRoot], root);
    if (extracted.code !== 0) {
      failures.push(`cannot extract npm tarball: ${(extracted.stderr || extracted.stdout).trim()}`);
      return result(metadata.entryCount, metadata.unpackedSize, metadata.size);
    }
    const packageDirectory = path.join(extractedRoot, 'package');
    const extractedPaths = await listExtractedFiles(packageDirectory);
    const extractedSet = new Set(extractedPaths);
    const metadataSet = new Set(metadataPaths);
    for (const pathname of metadataSet) {
      if (!extractedSet.has(pathname)) failures.push(`npm inventory path missing from tarball ${pathname}`);
    }
    for (const pathname of extractedSet) {
      if (!metadataSet.has(pathname)) failures.push(`unreported tarball path ${pathname}`);
    }
    failures.push(...await checkRelativeMarkdownLinks(packageDirectory, extractedPaths));
    return result(metadata.entryCount, metadata.unpackedSize, metadata.size);
  } catch (error) {
    failures.push(`package content inspection failed: ${error.message}`);
    return result();
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

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

  try {
    const policy = await readJson(path.join(root, 'config', 'npm-package-allowlist.json'));
    failures.push(...checkPackageAllowlist(manifest.files, policy));
  } catch (error) {
    failures.push(`package allowlist: ${error.message}`);
  }

  for (const relative of [
    'LICENSE',
    'MANAGED_FILES_NOTICE.md',
    'THIRD_PARTY_NOTICES.md',
    'bin/project-os.mjs',
    'config/npm-package-allowlist.json',
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
  const packageFailures = await checkPackageRoot(packageRoot);
  const inventory = await checkPackageContents(packageRoot);
  const failures = [
    ...packageFailures,
    ...inventory.failures,
    ...(await checkSeededIdentity(
      path.join(packageRoot, 'blueprint', 'core'),
      manifest.version,
    )),
  ];
  if (failures.length > 0) {
    process.stderr.write(`FAIL package contract: ${failures.join(', ')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `PASS package contract ${manifest.name}@${manifest.version}: `
      + `${inventory.fileCount} files, ${inventory.unpackedBytes} unpacked bytes, `
      + `${inventory.bytes} compressed bytes\n`,
    );
  }
}
