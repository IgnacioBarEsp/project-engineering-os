import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdtemp, readFile, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { productionPackages, renderNotices } from './notices.mjs';

// Builds the Windows artifact for the private app. It writes the third-party notices from the
// lockfile, runs the pinned packager and records what was produced. It never signs, never
// publishes and never reads anything outside this package.
const run = promisify(execFile);
const app = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(app, 'package.json'), 'utf8'));
const lock = JSON.parse(await readFile(path.join(app, 'package-lock.json'), 'utf8'));

async function digest(file) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

const packages = productionPackages(lock);
assert.ok(packages.length > 0, 'The lockfile declares no production packages.');
await writeFile(path.join(app, 'THIRD-PARTY-NOTICES.md'), renderNotices(packages, manifest.version));

// Build outside the repository: the output is a large artifact that must never enter the working
// tree, and a fresh directory avoids inheriting a handle left by an interrupted build.
const output = process.argv[2] ? path.resolve(process.argv[2]) : await mkdtemp(path.join(tmpdir(), 'project-os-companion-build-'));
const builder = path.join(app, 'node_modules', 'electron-builder', 'cli.js');
// Literal arguments, no shell, no publishing, and no signing configuration is supplied.
const built = await run(process.execPath, [builder, '--win', '--x64', '--publish', 'never', '--config.directories.output', output],
  { cwd: app, windowsHide: true, shell: false, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' } });
process.stdout.write(built.stdout.slice(-4000));

const installer = path.join(output, `ProjectEngineeringOS-Setup-${manifest.version}-x64.exe`);
const size = (await stat(installer)).size;
// A recorded commit is an identity claim: someone must be able to check out that commit and get this
// application. A dirty tree breaks that, so it is refused rather than published as if it were clean.
const commit = (await run('git', ['rev-parse', 'HEAD'], { cwd: app, windowsHide: true })).stdout.trim();
const dirty = (await run('git', ['status', '--porcelain'], { cwd: app, windowsHide: true })).stdout.trim();
if (dirty) {
  const changes = dirty.split(/\r?\n/).slice(0, 20).join('\n');
  const message = `El árbol tiene cambios sin confirmar, así que el commit ${commit.slice(0, 12)} no describe este artefacto:\n${changes}`;
  if (!process.env.PROJECT_OS_ALLOW_DIRTY_BUILD) {
    throw new Error(`${message}\nConfirma los cambios antes de construir una identidad publicable, o define PROJECT_OS_ALLOW_DIRTY_BUILD=1 para una construcción de trabajo cuyo manifiesto quedará marcado como dirty.`);
  }
  console.error(`${message}\nSe continúa porque PROJECT_OS_ALLOW_DIRTY_BUILD está definido; el manifiesto quedará marcado como dirty y no es publicable.`);
}
const record = {
  product: 'Project Engineering OS Companion',
  version: manifest.version,
  commit,
  tree: dirty ? 'dirty' : 'clean',
  platform: 'win32-x64',
  artifact: path.basename(installer),
  bytes: size,
  sha256: await digest(installer),
  core: manifest.dependencies['create-project-engineering-os'],
  electron: manifest.devDependencies.electron,
  packager: `electron-builder ${manifest.devDependencies['electron-builder']}`,
  packages: packages.length,
  signed: false,
  signingNote: 'Sin certificado de editor. Windows advertirá al ejecutarlo; esa advertencia es correcta y no se evita.',
  built: new Date().toISOString(),
};
await writeFile(path.join(output, 'artifact-manifest.json'), JSON.stringify(record, null, 2) + '\n');
await writeFile(path.join(output, 'SHA256SUMS'), `${record.sha256}  ${record.artifact}\n`);
console.log(JSON.stringify({ output, artifact: installer, bytes: size, sha256: record.sha256 }, null, 2));
