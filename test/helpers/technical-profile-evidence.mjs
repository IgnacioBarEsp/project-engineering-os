import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { PACKAGE_ROOT } from '../../src/constants.mjs';
import { doctorInternals } from '../../src/doctor.mjs';

const PROFILE_CATALOG_PATH = 'blueprint/core/project-os/profiles.json';
const DEFAULT_CONFIG_PATH = 'blueprint/core/project-constructor/config.json';

function hash(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function sourceJson(relative) {
  return JSON.parse(await readFile(path.join(PACKAGE_ROOT, ...relative.split('/')), 'utf8'));
}

async function readTargetJson(root, relative) {
  try {
    return JSON.parse(await readFile(path.join(root, ...relative.split('/')), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

async function writeTargetJson(root, relative, value) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`);
}

async function writeEvidenceArtifact(root, profileId, kind, index, canonicalId = '') {
  const relative = `.project-os/evidence/artifacts/${profileId}/${kind}-${index}.txt`;
  const absolute = path.join(root, ...relative.split('/'));
  const content = Buffer.from(`Consumer-owned evidence\n${profileId}\n${kind}\n${canonicalId}\n`);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
  return { path: relative, sha256: hash(content) };
}

export async function configureTechnicalProfiles(root, profileIds, { writeReceipts = true } = {}) {
  const canonicalCatalog = await sourceJson(PROFILE_CATALOG_PATH);
  const baseConfig = await sourceJson(DEFAULT_CONFIG_PATH);
  const existingConfig = await readTargetJson(root, '.project-constructor/config.json');
  const config = existingConfig ?? baseConfig;
  const previousActive = Array.isArray(config.activeProfiles)
    ? config.activeProfiles
    : Array.isArray(canonicalCatalog.active)
      ? canonicalCatalog.active
      : [];
  const activeProfiles = [...new Set([...previousActive, ...profileIds])];
  config.activeProfiles = activeProfiles;

  const active = new Set(activeProfiles);
  const catalog = structuredClone(canonicalCatalog);
  catalog.active = activeProfiles;
  catalog.profiles = catalog.profiles.map((profile) => {
    const next = { ...profile, active: active.has(profile.id) };
    if (next.active && !['documentation', 'harness-tooling'].includes(next.id)) {
      next.activationDecision ??= `docs/decisions/${next.id}.md`;
    }
    return next;
  });

  await writeTargetJson(root, '.project-constructor/config.json', config);
  await writeTargetJson(root, '.project-os/profiles.json', catalog);

  const records = new Map();
  for (const profileId of profileIds) {
    const definition = catalog.profiles.find((profile) => profile.id === profileId);
    const canonicalDefinition = canonicalCatalog.profiles.find((profile) => profile.id === profileId);
    if (!definition) throw new Error(`Unknown fixture profile: ${profileId}`);
    const makeItems = async (kind, ids) => Promise.all(ids.map(async (id, index) => ({
      id,
      status: 'PASS',
      artifact: await writeEvidenceArtifact(root, profileId, kind, index, id),
    })));
    const record = {
      schemaVersion: '1.0.0',
      profileId,
      configHash: hash(`${doctorInternals.stableStringify(doctorInternals.technicalProfileConfigProjection(
        profileId,
        config,
        catalog,
        '.project-os/profiles.json',
        active,
      ))}\n`),
      profileHash: hash(`${doctorInternals.stableStringify(canonicalDefinition)}\n`),
      issuedAt: new Date(Date.now() - 60_000).toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      automaticValidations: await makeItems('automatic', definition.automaticValidations),
      manualEvidence: await makeItems('manual', definition.manualEvidence),
      negativeCases: await makeItems('negative', definition.negativeCases),
      rollback: {
        status: 'PASS',
        artifact: await writeEvidenceArtifact(root, profileId, 'rollback', 0),
      },
      closureGate: {
        status: 'PASS',
        artifact: await writeEvidenceArtifact(root, profileId, 'closure', 0),
      },
    };
    records.set(profileId, record);
    if (writeReceipts) {
      await writeTargetJson(
        root,
        `.project-os/evidence/technical-profile-${profileId}.json`,
        record,
      );
    }
  }
  return { activeProfiles, config, catalog, canonicalCatalog, records };
}

export { hash as technicalEvidenceHash };
