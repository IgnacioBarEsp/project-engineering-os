import { randomUUID } from 'node:crypto';
import { lstat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { assertPath, canonicalFolder, snapshot, fail } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';

// Callers supply compiled slot/receipt identity, never renderer paths. Enumeration rejects
// links/hardlinks before a directory can be renamed or recursively removed.
export async function reviewCacheRepair(root, slot, identity, controls = {}, receiptPath = `${slot}/receipt.json`) {
  await canonicalFolder(root);
  if (!/^[a-z0-9][a-z0-9.-]{0,120}$/.test(slot)) fail('REPAIR_SLOT', 'La ubicación de reparación no es válida.');
  const directory = await canonicalFolder(await assertPath(root, slot));
  const receipt = await snapshot(root, receiptPath, 65536);
  let value; try { value = JSON.parse(receipt.content); } catch { fail('REPAIR_RECEIPT', 'No se puede demostrar que esta carpeta sea una instalación administrada.', 'Conserva la carpeta para revisión manual; no se eliminará.'); }
  if (!value || Object.entries(identity).some(([key, expected]) => value[key] !== expected)) fail('REPAIR_RECEIPT', 'El recibo no autoriza reparar esta instalación.', 'Conserva la carpeta para revisión manual; no se eliminará.');
  const tree = await inspectTree(directory, controls);
  return { root, slot, identity, receiptPath, receiptHash: receipt.hash, treeHash: tree.sha256, bytes: tree.bytes };
}

// Must run under the same manager write lock as installation. A failed replacement restores
// the corrupt cache for a fresh review; a crash may retain quarantine, never a ready partial tree.
export async function replaceReviewedCache(plan, install, controls = {}) {
  const current = await reviewCacheRepair(plan.root, plan.slot, plan.identity, controls, plan.receiptPath);
  if (current.receiptHash !== plan.receiptHash || current.treeHash !== plan.treeHash) fail('PLAN_STALE', 'La instalación cambió después de revisar su reparación.');
  controls.signal?.throwIfAborted();
  const source = await assertPath(plan.root, plan.slot), quarantineName = `.repair-${randomUUID()}`;
  const quarantine = await assertPath(plan.root, quarantineName);
  await rename(source, quarantine);
  let installed;
  try { installed = await install(); }
  catch (error) {
    await assertPath(plan.root, plan.slot); await assertPath(plan.root, quarantineName);
    const appeared = await lstat(source).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
    if (!appeared) await rename(quarantine, source);
    throw error;
  }
  // No cleanup following an unexpected edit, even after a successful replacement. The install
  // already succeeded, so a problem while inspecting the quarantine keeps the folder and is
  // reported alongside the repair; it never turns a completed repair into a failure.
  try {
    const directory = await canonicalFolder(await assertPath(plan.root, quarantineName));
    if ((await inspectTree(directory)).sha256 !== plan.treeHash) return { ...installed, repaired: true, retainedQuarantine: quarantineName };
    if (path.dirname(directory) !== plan.root || path.basename(directory) !== quarantineName) fail('REPAIR_SLOT', 'La carpeta de recuperación cambió.');
    await rm(directory, { recursive: true, force: true });
  } catch (error) {
    return { ...installed, repaired: true, retainedQuarantine: quarantineName, retainedBecause: error.code ?? 'UNKNOWN' };
  }
  return { ...installed, repaired: true };
}
