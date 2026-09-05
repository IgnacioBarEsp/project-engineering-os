#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertSemver, readJson, resolveNpmCli, sha256 } from './release-lib.mjs';
import { readBounded, registryIdentity, waitForRegistryRelease } from './registry-release.mjs';
import { verifyRelease } from './verify-release.mjs';
import { UPSTREAM_NPM_VERSION } from './release-workflow-policy.mjs';

export const RELEASE_REPO = 'IgnacioBarEsp/project-engineering-os';
export const RELEASE_PACKAGE = 'create-project-engineering-os';
const PROVENANCE = 'https://slsa.dev/provenance/v1';

function parseEvidenceJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('Verification evidence is not valid JSON.');
  }
}

export function publishedIdentity(tag) {
  if (typeof tag !== 'string' || !tag.startsWith('v')) throw new Error('Expected a SemVer tag prefixed with v.');
  const version = tag.slice(1);
  assertSemver(version);
  return { name: RELEASE_PACKAGE, version, tarball: `${RELEASE_PACKAGE}-${version}.tgz` };
}

export function assertPublishedManifest(manifest, identity, commit) {
  if (manifest?.schemaVersion !== 1 || manifest.package !== identity.name
    || manifest.version !== identity.version || manifest.tarball !== identity.tarball
    || !/^[a-f0-9]{40}$/.test(commit) || manifest.commit !== commit
    || !/^[a-f0-9]{64}$/.test(manifest.sha256) || manifest.tested !== true
    || !Number.isSafeInteger(manifest.bytes) || manifest.bytes < 1 || manifest.bytes > 32 * 1024 * 1024) {
    throw new Error('Canonical manifest differs from the requested tag or artifact identity.');
  }
}

export function assertSignedRelease(audit, identity, manifest, integrity) {
  if (!Array.isArray(audit.invalid) || audit.invalid.length !== 0
    || !Array.isArray(audit.missing) || audit.missing.length !== 0) {
    throw new Error('npm signature verification is missing or invalid.');
  }
  const verified = audit.verified?.find((entry) => entry.name === identity.name
    && entry.version === identity.version && entry.registry === 'https://registry.npmjs.org/');
  const provenance = verified?.attestationBundles?.find((entry) => entry.predicateType === PROVENANCE);
  if (!provenance || verified.attestations?.url !== registryIdentity(identity.name, identity.version).attestations) {
    throw new Error('npm did not verify signed provenance for the requested release.');
  }
  // Parse only bundles returned by a successful cryptographic npm audit, never unsigned registry claims.
  const statement = parseEvidenceJson(Buffer.from(provenance.bundle.dsseEnvelope.payload, 'base64').toString('utf8'));
  const expectedDigest = Buffer.from(integrity.slice('sha512-'.length), 'base64').toString('hex');
  const definition = statement.predicate?.buildDefinition;
  if (statement.predicateType !== PROVENANCE
    || !statement.subject?.some((entry) => entry.name === `pkg:npm/${identity.name}@${identity.version}`
      && entry.digest?.sha512 === expectedDigest)
    || definition?.externalParameters?.workflow?.repository !== `https://github.com/${RELEASE_REPO}`
    || definition.externalParameters.workflow.path !== '.github/workflows/release.yml'
    || !definition.resolvedDependencies?.some((entry) =>
      entry.uri?.startsWith(`git+https://github.com/${RELEASE_REPO}@`)
      && entry.digest?.gitCommit === manifest.commit)) {
    throw new Error('Signed provenance differs from the canonical artifact or source commit.');
  }
}

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8', windowsHide: true, timeout: 120_000, maxBuffer: 8 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'], ...options,
    }).trim();
  } catch {
    // Child output can contain local configuration or credentials; expose only the failing operation.
    throw new Error(`Published release verification failed during ${command === 'gh' ? 'GitHub read' : 'npm verification'}.`);
  }
}

function remoteTagCommit(tag) {
  const api = (endpoint) => parseEvidenceJson(run('gh', ['api', `repos/${RELEASE_REPO}/git/${endpoint}`]));
  let object = api(`ref/tags/${tag}`).object;
  for (let depth = 0; depth < 5; depth += 1) {
    if (!/^[a-f0-9]{40}$/.test(object?.sha)) break;
    if (object.type === 'commit') return object.sha;
    if (object.type !== 'tag') break;
    object = api(`tags/${object.sha}`).object;
  }
  throw new Error('Remote tag does not resolve to a bounded commit identity.');
}

export async function verifyPublished(tag) {
  const identity = publishedIdentity(tag);
  const npm = await resolveNpmCli();
  if (run(process.execPath, [npm, '--version']) !== UPSTREAM_NPM_VERSION) {
    throw new Error(`Use the reviewed npm ${UPSTREAM_NPM_VERSION} client for signature verification.`);
  }
  const commit = remoteTagCommit(tag);
  const assets = await mkdtemp(path.join(tmpdir(), 'project-os-published-assets-'));
  run('gh', ['release', 'download', tag, '--repo', RELEASE_REPO, '--dir', assets,
    '--pattern', identity.tarball, '--pattern', 'release-manifest.json', '--pattern', 'SHA256SUMS']);
  const manifest = await readJson(path.join(assets, 'release-manifest.json'));
  // Validate the exact filename before the shared checker reads any manifest-controlled path.
  assertPublishedManifest(manifest, identity, commit);
  await verifyRelease(assets);
  const canonical = await readFile(path.join(assets, identity.tarball));
  if (canonical.length !== manifest.bytes) throw new Error('Canonical byte count differs.');
  const integrity = `sha512-${createHash('sha512').update(canonical).digest('base64')}`;
  const metadata = await waitForRegistryRelease({ ...identity, expectedIntegrity: integrity });
  const response = await fetch(metadata.dist.tarball, { redirect: 'error', signal: AbortSignal.timeout(30_000) });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Registry tarball returned HTTP ${response.status}. Retry read-only verification.`);
  }
  const archive = await readBounded(response, manifest.bytes);
  if (!archive.equals(canonical) || sha256(archive) !== manifest.sha256) {
    throw new Error('Registry and canonical tarball bytes differ.');
  }
  const target = await mkdtemp(path.join(tmpdir(), 'project-os-published-install-'));
  await writeFile(path.join(target, 'package.json'), JSON.stringify({
    name: 'project-os-release-verification', version: '1.0.0', private: true,
  }));
  const npmRun = (args) => run(process.execPath, [npm, ...args], { cwd: target, timeout: 180_000 });
  npmRun(['install', '--save-exact', '--ignore-scripts', '--no-audit', '--registry=https://registry.npmjs.org',
    '--min-release-age=7', `--min-release-age-exclude=${identity.name}`, `${identity.name}@${identity.version}`]);
  const lock = await readJson(path.join(target, 'package-lock.json'));
  const installed = lock.packages?.[`node_modules/${identity.name}`];
  if (installed?.integrity !== integrity || installed.version !== identity.version
    || installed.resolved !== metadata.dist.tarball) throw new Error('Installed artifact differs from verified identity.');
  const audit = parseEvidenceJson(npmRun(['audit', 'signatures', '--json', '--include-attestations',
    '--registry=https://registry.npmjs.org']));
  assertSignedRelease(audit, identity, manifest, integrity);
  const installedPackage = await readJson(path.join(target, 'node_modules', identity.name, 'package.json'));
  if (installedPackage.name !== identity.name || installedPackage.version !== identity.version) {
    throw new Error('Installed package identity differs.');
  }
  const result = { status: 'PASS', tag, package: identity.name, version: identity.version,
    commit, bytes: manifest.bytes, sha256: manifest.sha256, integrity,
    signatures: 'verified', provenance: 'verified artifact and source commit',
    release: `https://github.com/${RELEASE_REPO}/releases/tag/${tag}` };
  await writeFile(path.join(assets, 'verification.json'), `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

if (process.argv[1] && await realpath(process.argv[1]) === await realpath(fileURLToPath(import.meta.url))) {
  try {
    if (process.argv.length !== 4 || process.argv[2] !== '--tag') throw new Error('Usage: verify-published.mjs --tag vX.Y.Z');
    process.stdout.write(`${JSON.stringify(await verifyPublished(process.argv[3]), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`FAIL ${error.message}\n`);
    process.exitCode = 1;
  }
}
