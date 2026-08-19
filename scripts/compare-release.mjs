#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';
import { verifyRelease } from './verify-release.mjs';

async function releaseFiles(releaseRoot) {
  const root = path.resolve(releaseRoot);
  const manifest = await readJson(path.join(root, 'release-manifest.json'));
  if (
    typeof manifest.tarball !== 'string'
    || path.basename(manifest.tarball) !== manifest.tarball
    || !manifest.tarball.endsWith('.tgz')
  ) {
    throw new Error('El manifest declara un nombre de tarball inválido.');
  }

  const entries = await readdir(root, { withFileTypes: true });
  if (entries.some((entry) => !entry.isFile())) {
    throw new Error(`El directorio ${root} contiene entradas que no son archivos.`);
  }
  const observed = entries.map((entry) => entry.name).sort();
  const expected = ['SHA256SUMS', 'release-manifest.json', manifest.tarball].sort();
  if (JSON.stringify(observed) !== JSON.stringify(expected)) {
    throw new Error(
      `Assets de release inesperados en ${root}: esperados=${expected.join(',')}; `
      + `observados=${observed.join(',')}`,
    );
  }
  await verifyRelease(root);
  return { root, manifest, files: expected };
}

export async function compareReleaseDirectories(expectedRoot, observedRoot) {
  const expected = await releaseFiles(expectedRoot);
  const observed = await releaseFiles(observedRoot);
  if (JSON.stringify(expected.files) !== JSON.stringify(observed.files)) {
    throw new Error('Los directorios de release no contienen los mismos nombres de archivo.');
  }

  for (const filename of expected.files) {
    const [expectedBytes, observedBytes] = await Promise.all([
      readFile(path.join(expected.root, filename)),
      readFile(path.join(observed.root, filename)),
    ]);
    if (!expectedBytes.equals(observedBytes)) {
      throw new Error(`El asset ${filename} difiere byte por byte.`);
    }
  }
  return expected.manifest;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const expectedRoot = process.argv[2];
  const observedRoot = process.argv[3];
  if (!expectedRoot || !observedRoot) {
    throw new Error('Uso: compare-release.mjs <directorio-esperado> <directorio-observado>');
  }
  const result = await compareReleaseDirectories(expectedRoot, observedRoot);
  process.stdout.write(`PASS identidad de release ${result.tarball} ${result.sha256}\n`);
}
