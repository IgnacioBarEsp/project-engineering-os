#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson, sha256 } from './release-lib.mjs';

export async function verifyRelease(releaseRoot, { expectedCommit } = {}) {
  const root = path.resolve(releaseRoot);
  const manifest = await readJson(path.join(root, 'release-manifest.json'));
  if (expectedCommit !== undefined) {
    if (!/^[0-9a-f]{40,64}$/.test(expectedCommit)) {
      throw new Error('El commit esperado para el artefacto no es válido.');
    }
    if (manifest.commit !== expectedCommit) {
      throw new Error(`El artefacto declara ${manifest.commit}; el source verificado es ${expectedCommit}.`);
    }
  }
  const checksums = await readFile(path.join(root, 'SHA256SUMS'), 'utf8');
  const tarball = await readFile(path.join(root, manifest.tarball));
  const observed = sha256(tarball);
  const expectedLine = `${manifest.sha256}  ${manifest.tarball}`;
  if (observed !== manifest.sha256 || !checksums.split(/\r?\n/).includes(expectedLine)) {
    throw new Error(`Checksum divergente: esperado=${manifest.sha256}, observado=${observed}`);
  }
  if (!manifest.tested) throw new Error('El manifest no declara tarball probado.');
  return manifest;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const root = args[0] && !args[0].startsWith('--') ? args[0] : 'release';
  const commitIndex = args.indexOf('--commit');
  const expectedCommit = commitIndex >= 0 ? args[commitIndex + 1] : undefined;
  if (commitIndex >= 0 && !expectedCommit) throw new Error('--commit requiere un SHA.');
  const result = await verifyRelease(root, { expectedCommit });
  process.stdout.write(`PASS ${result.tarball} ${result.sha256}\n`);
}
