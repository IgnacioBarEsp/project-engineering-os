// Phase-A experiment only: no IPC, production selector, downloads or runtime installation.
// Gate callbacks are test/experiment evidence, not an approval authority for a release.
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, assertPath } from '../engine/files.mjs';
import { inspectTree } from '../runtime/tree.mjs';

const digestPattern = /^[a-f0-9]{64}$/;
const digest = value => createHash('sha256').update(value).digest('hex');
const reject = message => { throw new Error(message); };

export function distributionIdentity(value) {
  if (!value || !['official', 'derived'].includes(value.channel)
    || typeof value.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(value.version)
    || typeof value.source !== 'string' || !value.source.startsWith('https://')
    || !digestPattern.test(value.treeHash ?? '')
    || (value.channel === 'derived' ? !digestPattern.test(value.recipeHash ?? '') : value.recipeHash !== null)) {
    reject('Invalid experimental distribution identity');
  }
  const source = new URL(value.source);
  if (source.protocol !== 'https:' || !source.hostname || source.username || source.password) {
    reject('Invalid experimental source');
  }
  // Fixed field order. Channel/recipe are part of identity, never inferred from version.
  return Object.freeze({ channel: value.channel, version: value.version, source: value.source,
    treeHash: value.treeHash, recipeHash: value.recipeHash });
}

export const distributionId = identity => digest(JSON.stringify(distributionIdentity(identity)));

export async function inventoryExperimentalTree(directory, controls = {}) {
  const root = await canonicalFolder(directory);
  const tree = await inspectTree(root, controls), packages = [];
  for (const entry of tree.files) {
    if (entry.path !== 'package.json' && !entry.path.endsWith('/package.json')) continue;
    const absolute = await assertPath(root, entry.path);
    // A changed manifest is not allowed to describe the hashed bytes retroactively.
    const bytes = await readFile(absolute);
    if (digest(bytes) !== entry.sha256) reject('Package changed during inventory');
    const value = JSON.parse(bytes);
    packages.push({ manifest: entry.path, name: value.name ?? null, version: value.version ?? null,
      license: value.license ?? null, sha256: entry.sha256 });
  }
  return { ...tree, packages };
}

export function assertPhysicalAuditCoverage(inventory, auditGraph) {
  if (!Array.isArray(auditGraph)) reject('Audit graph is unavailable');
  const actual = inventory.packages.map(p => JSON.stringify([p.manifest, p.name, p.version])).sort();
  const declared = auditGraph.map(p => JSON.stringify([p.manifest, p.name, p.version])).sort();
  if (actual.length !== declared.length || actual.some((v, i) => v !== declared[i])) {
    reject('Physical packages do not match the audited graph');
  }
}

export async function createExperimentalSwitchModel({ root: input, slots, verifyGates }) {
  const root = await canonicalFolder(input);
  if (!Array.isArray(slots) || typeof verifyGates !== 'function') reject('Invalid experimental model');
  const registered = new Map();
  for (const slot of slots) {
    const identity = distributionIdentity(slot.identity), id = distributionId(identity);
    if (registered.has(id)) reject('Duplicate experimental slot');
    if (typeof slot.relative !== 'string' || !slot.relative || slot.relative.startsWith('/')) reject('Invalid slot');
    const directory = await assertPath(root, slot.relative);
    if (await canonicalFolder(directory) !== directory) reject('Slot is not canonical');
    const normalized = value => process.platform === 'win32' ? value.toLowerCase() : value;
    const contains = (parent, child) => {
      const relative = path.relative(normalized(parent), normalized(child));
      return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith('..' + path.sep));
    };
    for (const prior of registered.values()) {
      if (contains(prior.directory, directory) || contains(directory, prior.directory)) reject('Experimental slots overlap');
    }
    // No writes: caller-created, owned fixture slots only.
    registered.set(id, Object.freeze({ identity, directory }));
  }
  let state = Object.freeze({ generation: 0, activeId: null });
  return Object.freeze({
    snapshot: () => ({ ...state }),
    async select(id, { expected, signal } = {}) {
      // Copy the precondition before awaiting: callers cannot retarget it while gates run.
      const requested = expected ? { generation: expected.generation, activeId: expected.activeId } : null;
      if (!requested || requested.generation !== state.generation || requested.activeId !== state.activeId) {
        reject('Stale experimental selection');
      }
      signal?.throwIfAborted();
      const slot = registered.get(id); if (!slot) reject('Unknown experimental slot');
      const tree = await inspectTree(slot.directory, { signal });
      if (tree.sha256 !== slot.identity.treeHash) reject('Experimental slot integrity failed');
      const gates = await verifyGates(slot.identity, id);
      if (!gates || gates.audit !== true || gates.regressions !== true || gates.runtime !== true) {
        reject('Destination fails current experimental gates');
      }
      signal?.throwIfAborted();
      // Reverify after async gate execution; an old receipt is not permission to switch.
      const after = await inspectTree(slot.directory, { signal });
      if (after.sha256 !== slot.identity.treeHash) reject('Experimental slot changed after review');
      if (requested.generation !== state.generation || requested.activeId !== state.activeId) {
        reject('Stale experimental selection');
      }
      signal?.throwIfAborted();
      // In-memory linearization only. This does NOT prove durable crash recovery in production.
      state = Object.freeze({ generation: state.generation + 1, activeId: id });
      return { ...state };
    },
  });
}
