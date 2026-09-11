import { canonicalFolder, assertPath, fail } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';
import { RUNTIME_CATALOG } from './catalog.mjs';
import { TOOLCHAIN } from './toolchain-pin.mjs';

export function validateAgentDescriptor(id, descriptor) {
    const pin = id === 'toolchain' ? TOOLCHAIN : RUNTIME_CATALOG[id];
    const relative = id === 'toolchain' ? TOOLCHAIN.relative : `${id}-${pin.version}-${pin.treeHash.slice(0, 12)}/payload`;
    const entry = id === 'toolchain' ? 'node_modules/@fission-ai/openspec/bin/openspec.js' : pin.entry;
    // Reject descriptor edits even when they describe another internally consistent tree.
    if (descriptor?.treeHash !== pin.treeHash || descriptor?.entry !== entry
      || (id !== 'toolchain' && descriptor?.relative !== relative)) fail('TOOLS_CHANGED', 'La identidad de una herramienta cambió. Revisa el entorno en Companion.');
    return { pin, relative, entry };
}

export async function verifyAgentEnvironment(root, settings) {
  const descriptors = Object.fromEntries(['node', 'git', 'toolchain'].map(id => [id, validateAgentDescriptor(id, settings[id])]));
  const runtimeRoot = await canonicalFolder(settings.runtimeRoot), environment = {};
  for (const id of ['node', 'git', 'toolchain']) {
    const { pin, relative, entry } = descriptors[id];
    const directory = await canonicalFolder(await assertPath(id === 'toolchain' ? root : runtimeRoot, relative));
    const tree = await inspectTree(directory);
    if (tree.sha256 !== pin.treeHash || tree.bytes !== (pin.installedBytes ?? pin.bytes)) fail('TOOLS_CHANGED', 'Una herramienta cambió. Revisa el entorno en Companion.');
    environment[id] = { root: directory, entry: await assertPath(directory, entry) };
  }
  return { runtimeRoot, environment };
}
