// Experimental only: no production caller, network, lifecycle scripts or external patch executor.
import { readFile, writeFile, mkdtemp, lstat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, assertPath, hash, fail } from '../engine/files.mjs';
import { inspectTree } from '../runtime/tree.mjs';

const patchDirectory = new URL('../patches/http-cache-semantics/4.3.0/', import.meta.url);
const manifestBytes = await readFile(new URL('manifest.json', patchDirectory));
const manifest = JSON.parse(manifestBytes);
const defaultPatch = await readFile(new URL(manifest.patchFile, patchDirectory));
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join('|') === [...keys].sort().join('|');
const invalid = message => fail('PATCH_INVALID', message);
const sameFiles = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const expectedOriginal = manifest.originalFiles;
const expectedDerived = expectedOriginal.map(file => file.path === 'index.js' ? manifest.postimage : file);

// Data grammar only. No eval, shell, executable patch instructions, fuzz or path resolution.
export function applyExactCachePatch(source, patch) {
  if (!exactKeys(patch, ['schemaVersion', 'kind', 'operations']) ||
      patch.schemaVersion !== 1 || patch.kind !== 'exact-replacements' ||
      !Array.isArray(patch.operations) || patch.operations.length < 1 || patch.operations.length > 16) invalid('Invalid patch grammar.');
  let text = source.toString('utf8');
  if (!Buffer.from(text).equals(Buffer.from(source))) invalid('Non-UTF8 source.');
  for (const operation of patch.operations) {
    if (!exactKeys(operation, ['path', 'before', 'after']) || operation.path !== 'index.js' ||
        typeof operation.before !== 'string' || typeof operation.after !== 'string' ||
        !operation.before.length || !operation.after.length ||
        operation.before.includes('\0') || operation.after.includes('\0') ||
        operation.before.length > 16000 || operation.after.length > 16000) invalid('Invalid patch operation or allowlist.');
    const at = text.indexOf(operation.before);
    if (at < 0 || text.indexOf(operation.before, at + 1) !== -1) invalid('Exact preimage is missing or ambiguous.');
    text = text.slice(0, at) + operation.after + text.slice(at + operation.before.length);
  }
  return Buffer.from(text);
}

// Caller owns a disposable workspace. This constructs a new slot, not a security-approved payload.
// A receipt proves byte identity only; semantic/audit/runtime gates remain separate and mandatory.
// This bounds filesystem operations, not an OS sandbox against a concurrent local adversary.
export async function assembleCachePatch({ originalRoot, workspaceRoot, outputName, patchBytes = defaultPatch, signal }) {
  signal?.throwIfAborted();
  if (typeof outputName !== 'string' || !/^build-[a-z0-9-]{1,50}$/.test(outputName)) invalid('Unsafe output slot.');
  const original = await canonicalFolder(originalRoot), workspace = await canonicalFolder(workspaceRoot);
  const output = await assertPath(workspace, outputName);
  const back = path.relative(original, output);
  if (!back || (!back.startsWith('..' + path.sep) && back !== '..' && !path.isAbsolute(back))) invalid('Output overlaps original.');
  try { await lstat(output); invalid('Output slot already exists.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  // Freeze supplied bytes before the first asynchronous input inspection.
  const supplied = Buffer.from(patchBytes);
  if (supplied.length > 128000 || hash(supplied) !== manifest.patchSha256) invalid('Patch digest differs from frozen recipe.');
  const patch = JSON.parse(supplied);
  const baseline = await inspectTree(original, { signal, maxFiles: 4, maxBytes: 100000 });
  if (!sameFiles(baseline.files, expectedOriginal)) invalid('Official input files or preimages drifted.');
  const stage = await mkdtemp(path.join(workspace, '.cache-patch-'));
  const stageRoot = await canonicalFolder(stage);
  let accepted = false;
  try {
    for (const entry of expectedOriginal) {
      signal?.throwIfAborted();
      const inputPath = await assertPath(original, entry.path);
      const input = await readFile(inputPath);
      if (input.length !== entry.bytes || hash(input) !== entry.sha256) invalid('Input changed during application.');
      const result = entry.path === 'index.js' ? applyExactCachePatch(input, patch) : input;
      const expected = expectedDerived.find(file => file.path === entry.path);
      if (result.length !== expected.bytes || hash(result) !== expected.sha256) invalid('Postimage differs from frozen recipe.');
      await writeFile(await assertPath(stageRoot, entry.path), result, { flag: 'wx', mode: 0o600 });
    }
    const derived = await inspectTree(stageRoot, { signal, maxFiles: 4, maxBytes: 100000 });
    if (!sameFiles(derived.files, expectedDerived)) invalid('Derived tree has out-of-allowlist bytes.');
    const finalOriginal = await inspectTree(original, { signal, maxFiles: 4, maxBytes: 100000 });
    if (!sameFiles(finalOriginal.files, baseline.files)) invalid('Original changed before acceptance.');
    signal?.throwIfAborted();
    await assertPath(workspace, outputName);
    try { await lstat(output); invalid('Output slot appeared during application.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await rename(stageRoot, output);
    accepted = true;
    return { channel: 'derived', name: manifest.component.name, version: manifest.component.version,
      source: manifest.component.source, sourceTreeHash: baseline.sha256, patchHash: hash(supplied),
      recipeHash: hash(manifestBytes), treeHash: derived.sha256, files: derived.files,
      outputRoot: output, licenseHash: expectedOriginal[0].sha256, integrityVerified: true,
      securityStatus: 'unvalidated', acceptanceAuthorized: false, adoptionAuthorized: false };
  } finally {
    // Delete only our exact freshly allocated staging directory, after canonical containment check.
    if (!accepted) {
      const relative = path.relative(workspace, stageRoot);
      if (/^\.cache-patch-[a-zA-Z0-9]+$/.test(relative) && await canonicalFolder(stageRoot) === stageRoot) {
        await rm(stageRoot, { recursive: true });
      }
    }
  }
}
