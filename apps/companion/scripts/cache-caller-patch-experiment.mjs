// Approved experiment only. No runtime caller, network, install hooks or shell patching.
import { readFile, writeFile, mkdir, mkdtemp, lstat, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, assertPath, hash, fail } from '../engine/files.mjs';
import { inspectTree } from '../runtime/tree.mjs';

const directory = new URL('../patches/make-fetch-happen/15.0.6/', import.meta.url);
const allowed = ['lib/cache/policy.js', 'lib/cache/entry.js', 'lib/cache/index.js'];
const keys = (value, names) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).sort().join('|') === [...names].sort().join('|');
const invalid = message => fail('PATCH_INVALID', message);

export function applyExactCallerPatch(source, target, patch) {
  if (!allowed.includes(target) || !keys(patch, ['schemaVersion', 'kind', 'operations']) ||
      patch.schemaVersion !== 1 || patch.kind !== 'exact-replacements' ||
      !Array.isArray(patch.operations) || !patch.operations.length || patch.operations.length > 16) invalid('Invalid caller patch.');
  let text = source.toString('utf8');
  if (!Buffer.from(text).equals(Buffer.from(source))) invalid('Non-UTF8 source.');
  let changes = 0;
  for (const operation of patch.operations) {
    if (!keys(operation, ['path', 'before', 'after']) || !allowed.includes(operation.path) ||
        typeof operation.before !== 'string' || typeof operation.after !== 'string' ||
        !operation.before.length || !operation.after.length ||
        operation.before.length > 16000 || operation.after.length > 16000 ||
        operation.before.includes('\0') || operation.after.includes('\0')) invalid('Invalid caller patch operation.');
    if (operation.path !== target) continue;
    const at = text.indexOf(operation.before);
    if (at < 0 || text.indexOf(operation.before, at + 1) !== -1) invalid('Missing or ambiguous caller preimage.');
    text = text.slice(0, at) + operation.after + text.slice(at + operation.before.length);
    changes++;
  }
  if (!changes) invalid('No declared change for caller file.');
  return Buffer.from(text);
}

// Exact original and postimage inventories are trusted source config, not caller approval.
export async function assembleCallerPatch({ originalRoot, workspaceRoot, outputName, patchBytes, signal }) {
  signal?.throwIfAborted();
  if (typeof outputName !== 'string' || !/^build-[a-z0-9-]{1,50}$/.test(outputName)) invalid('Unsafe output slot.');
  const manifestBytes = await readFile(new URL('manifest.json', directory));
  const manifest = JSON.parse(manifestBytes);
  const supplied = Buffer.from(patchBytes ?? await readFile(new URL(manifest.patchFile, directory)));
  if (supplied.length > 128000 || hash(supplied) !== manifest.patchSha256) invalid('Caller patch digest drift.');
  const patch = JSON.parse(supplied);
  const original = await canonicalFolder(originalRoot), workspace = await canonicalFolder(workspaceRoot);
  const output = await assertPath(workspace, outputName), relative = path.relative(original, output);
  if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) invalid('Output overlaps original.');
  try { await lstat(output); invalid('Slot exists.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const baseline = await inspectTree(original, { signal, maxFiles: 100, maxBytes: 2000000 });
  if (JSON.stringify(baseline.files) !== JSON.stringify(manifest.originalFiles)) invalid('Caller source drift.');
  const expected = manifest.originalFiles.map(file => manifest.postimages.find(post => post.path === file.path) ?? file);
  const stageRoot = await canonicalFolder(await mkdtemp(path.join(workspace, '.caller-patch-')));
  let published = false;
  try {
    for (const entry of baseline.files) {
      signal?.throwIfAborted();
      const input = await readFile(await assertPath(original, entry.path));
      if (input.length !== entry.bytes || hash(input) !== entry.sha256) invalid('Caller changed during application.');
      const result = allowed.includes(entry.path) ? applyExactCallerPatch(input, entry.path, patch) : input;
      const post = expected.find(file => file.path === entry.path);
      if (result.length !== post.bytes || hash(result) !== post.sha256) invalid('Caller postimage drift.');
      const destination = await assertPath(stageRoot, entry.path);
      await mkdir(path.dirname(destination), { recursive: true });
      await assertPath(stageRoot, entry.path);
      await writeFile(destination, result, { flag: 'wx', mode: 0o600 });
    }
    const derived = await inspectTree(stageRoot, { signal, maxFiles: 100, maxBytes: 2000000 });
    if (JSON.stringify(derived.files) !== JSON.stringify(expected)) invalid('Unexpected caller bytes.');
    if (JSON.stringify((await inspectTree(original, { signal, maxFiles: 100, maxBytes: 2000000 })).files) !== JSON.stringify(baseline.files)) invalid('Original caller changed.');
    signal?.throwIfAborted();
    await assertPath(workspace, outputName);
    try { await lstat(output); invalid('Slot appeared.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await rename(stageRoot, output); published = true;
    return { channel: 'derived', name: manifest.component.name, version: manifest.component.version,
      source: manifest.component.source, sourceTreeHash: baseline.sha256, patchHash: hash(supplied),
      recipeHash: hash(manifestBytes), treeHash: derived.sha256, files: derived.files, outputRoot: output,
      integrityVerified: true, securityStatus: 'unvalidated', acceptanceAuthorized: false, adoptionAuthorized: false };
  } finally {
    if (!published && /^\.caller-patch-[a-zA-Z0-9]+$/.test(path.relative(workspace, stageRoot)) &&
        await canonicalFolder(stageRoot) === stageRoot) await rm(stageRoot, { recursive: true });
  }
}
