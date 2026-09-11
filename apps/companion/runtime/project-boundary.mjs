import { lstat } from 'node:fs/promises';
import { assertPath, canonicalFolder, snapshot, fail } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';

// Official tools operate within these project metadata surfaces. Reject redirection before
// the child can discover a parent root or recover journals through an external junction.
export async function verifyProjectBoundary(root, { openspec = false, signal } = {}) {
  await canonicalFolder(root);
  if (openspec) {
    // A local config or planning shape stops parent discovery in OpenSpec 1.6.0.
    // Store resolution has no registered destinations in the fresh isolated process home.
    const changes = await assertPath(root, 'openspec/changes');
    const stat = await lstat(changes).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
    const config = await snapshot(root, 'openspec/config.yaml', 65536);
    if (!stat?.isDirectory() && !config.content) fail('TOOLS_PROJECT_ROOT', 'Falta la raíz OpenSpec local de este proyecto.', 'Revisa y recupera la activación en Companion; esta entrada no usará un proyecto padre.');
  }
  for (const relative of ['openspec','.project-constructor','.project-os','.agents','.claude','.codex','.cursor','.github','.opencode']) {
    const directory = await assertPath(root, relative);
    const stat = await lstat(directory).catch(e => { if (e.code !== 'ENOENT') throw e; return null; });
    if (!stat) continue;
    if (!stat.isDirectory()) fail('TOOLS_PROJECT_PATH', 'Una carpeta de instrucciones tiene un tipo inesperado.');
    await inspectTree(directory, { signal });
  }
}
