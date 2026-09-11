import { createHash } from 'node:crypto';
import { opendir, lstat, open } from 'node:fs/promises';
import path from 'node:path';
import { assertPath, hash, fail } from '../engine/files.mjs';

export async function inspectTree(root, { signal, maxFiles = 12000, maxBytes = 600 * 1024 * 1024 } = {}) {
  const files = []; let total = 0, entries = 0;
  await assertPath(root);
  const changed = () => fail('RUNTIME_CHANGED', 'La herramienta cambió durante su comprobación.');
  async function visit(relative, depth = 0) {
    signal?.throwIfAborted();
    const absoluteDirectory = path.join(root, relative), directoryStat = await lstat(absoluteDirectory);
    if (depth > 64 || !directoryStat.isDirectory() || directoryStat.isSymbolicLink()) fail('RUNTIME_LIMIT', 'La instalación contiene una carpeta no admitida.');
    // Validate ancestors once as they are traversed, rather than for every descendant. This
    // is bounded enumeration, not an OS lock against another process editing the same tree.
    const directory = await opendir(absoluteDirectory);
    for await (const { name } of directory) {
      signal?.throwIfAborted();
      if (++entries > maxFiles * 2) fail('RUNTIME_LIMIT', 'La instalación tiene demasiados archivos.');
      if (/[\\:\x00]/.test(name) || name === '.' || name === '..') fail('RUNTIME_LIMIT', 'La instalación contiene una ruta no admitida.');
      const child = relative ? `${relative}/${name}` : name, absolute = path.join(root, child), stat = await lstat(absolute);
      if (stat.isSymbolicLink() || (stat.isFile() && stat.nlink > 1)) fail('LINK_REJECTED', 'La herramienta contiene un vínculo no admitido.');
      if (stat.isDirectory()) await visit(child, depth + 1);
      else {
        if (!stat.isFile() || files.length >= maxFiles || (total += stat.size) > maxBytes) fail('RUNTIME_LIMIT', 'La instalación supera los límites del paquete revisado.');
        const digest = createHash('sha256'), handle = await open(absolute, 'r'); let bytes = 0;
        const matches = current => current.isFile() && current.nlink === 1 && current.dev === stat.dev && current.ino === stat.ino && current.size === stat.size;
        try {
          if (!matches(await handle.stat())) changed();
          const buffer = Buffer.alloc(64 * 1024);
          while (true) {
            signal?.throwIfAborted();
            const { bytesRead } = await handle.read(buffer, 0, Math.min(buffer.length, stat.size - bytes + 1), null);
            if (!bytesRead) break;
            bytes += bytesRead; if (bytes > stat.size) changed(); digest.update(buffer.subarray(0, bytesRead));
          }
          if (!matches(await handle.stat())) changed();
        } finally { await handle.close(); }
        const after = await lstat(absolute);
        if (after.isSymbolicLink() || !matches(after) || bytes !== stat.size) changed();
        files.push({ path: child, bytes, sha256: digest.digest('hex') });
      }
    }
  }
  await visit(''); await assertPath(root); files.sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { files, bytes: total, sha256: hash(JSON.stringify(files) + '\n') };
}
