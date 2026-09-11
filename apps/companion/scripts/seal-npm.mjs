import assert from 'node:assert/strict';
import { lstat, readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { zipSync } from 'fflate';

// The reviewed npm distribution is pinned by the digest of its complete tree, vendored dependencies
// included. Packagers deduplicate and drop nested node_modules, which prunes exactly those and leaves
// an installation that cannot prepare tools at all. Sealing the tree into a single archive is what
// stops a file filter from reaching inside it.
//
// This lives in its own module so the packaging test can exercise the real implementation against a
// tree it builds, instead of asserting that the packer's source code still contains certain words.
export async function sealNpm(source, target) {
  const entries = {};
  async function collect(relative = '') {
    for (const entry of await readdir(path.join(source, relative), { withFileTypes: true })) {
      const next = relative ? `${relative}/${entry.name}` : entry.name;
      const info = await lstat(path.join(source, next));
      assert.ok(!info.isSymbolicLink(), `La distribucion de npm contiene un vinculo: ${next}`);
      if (entry.isDirectory()) await collect(next);
      else entries[next] = new Uint8Array(await readFile(path.join(source, next)));
    }
  }
  await collect();
  const names = Object.keys(entries).sort();
  const ordered = {};
  for (const name of names) ordered[name] = entries[name];
  // A fixed timestamp keeps the archive stable between builds. The zip format cannot represent a
  // date before 1980 in local time, so this is a plain epoch well inside the range.
  await writeFile(target, Buffer.from(zipSync(ordered, { level: 6, mtime: 631152000000 })));
  return { files: names.length, bytes: (await stat(target)).size };
}

export default sealNpm;
