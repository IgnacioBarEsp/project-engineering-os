import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Compares the exact build staged by the workflow with the assets GitHub stored for its draft release.
// A second Electron build is deliberately not involved: installer bytes contain build-time variation, so
// the only publishable identity is the SHA-256 recorded for this one build.
const [candidateDirectory, canonicalDirectory, evidenceDirectory] = process.argv.slice(2);
assert(candidateDirectory && canonicalDirectory && evidenceDirectory,
  'Indica directorio candidato, directorio descargado y directorio de evidencia.');

const digest = async file => {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
};
const artifact = async directory => {
  const manifestFile = path.join(directory, 'artifact-manifest.json');
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  assert.match(manifest.artifact, /^ProjectEngineeringOS-Setup-\d+\.\d+\.\d+-x64\.exe$/);
  assert.equal(manifest.platform, 'win32-x64');
  assert.equal(manifest.tree, 'clean');
  assert.equal(manifest.signed, false);
  assert.match(manifest.sha256, /^[a-f0-9]{64}$/);
  const names = [manifest.artifact, 'artifact-manifest.json', 'SHA256SUMS'];
  for (const name of names) await stat(path.join(directory, name));
  const sums = (await readFile(path.join(directory, 'SHA256SUMS'), 'utf8')).trim();
  assert.equal(sums, `${manifest.sha256}  ${manifest.artifact}`);
  assert.equal(await digest(path.join(directory, manifest.artifact)), manifest.sha256);
  return { manifest, names };
};

const candidate = await artifact(path.resolve(candidateDirectory));
const canonicalRoot = path.resolve(canonicalDirectory);
const canonical = await artifact(canonicalRoot);
assert.deepEqual(canonical.manifest, candidate.manifest, 'El manifiesto descargado no es el del build verificado.');
assert.deepEqual((await readdir(canonicalRoot)).sort(), [...canonical.names].sort(),
  'La release contiene assets adicionales o le falta uno canónico.');
for (const name of candidate.names) {
  const left = path.join(candidateDirectory, name), right = path.join(canonicalDirectory, name);
  assert.equal((await stat(right)).size, (await stat(left)).size, `${name}: tamaño descargado distinto.`);
  assert.equal(await digest(right), await digest(left), `${name}: bytes descargados distintos.`);
}

await mkdir(evidenceDirectory, { recursive: true });
await writeFile(path.join(evidenceDirectory, 'canonical-release.json'), JSON.stringify({
  status: 'PASS', artifact: candidate.manifest.artifact, version: candidate.manifest.version,
  commit: candidate.manifest.commit, bytes: candidate.manifest.bytes, sha256: candidate.manifest.sha256,
  assets: candidate.names, scope: 'Comparación de los tres assets de un draft de GitHub Release contra el único build verificado. No afirma reproducibilidad entre builds.',
}, null, 2) + '\n');
console.log(JSON.stringify({ status: 'PASS', artifact: candidate.manifest.artifact, sha256: candidate.manifest.sha256 }, null, 2));
