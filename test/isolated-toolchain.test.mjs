import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, rmdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import Ajv from 'ajv';
import { inspectLocalPackage, readProjectManifest, resolveLocalToolchain, resolvePinnedOpenSpec, validateToolchainRoot } from '../blueprint/core/project-constructor/toolchain.mjs';
import { checkLocalOpenSpec } from '../src/opsx-check.mjs';
import { runBootstrapOrSync } from '../src/commands.mjs';

const name = '@fission-ai/openspec';
const contract = { package: name, version: '1.6.0' };
const selected = '.project-os/toolchain';
async function write(root, relative, content) {
  const file = path.join(root, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}
async function json(root, relative, value) { await write(root, relative, JSON.stringify(value)); }
async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-toolchain-'));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(tmpdir()));
    assert.ok(path.basename(root).startsWith('project-os-toolchain-'));
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, '.project-constructor'));
  for (const file of ['openspec.mjs', 'toolchain.mjs']) {
    await cp(new URL(`../blueprint/core/project-constructor/${file}`, import.meta.url), path.join(root, '.project-constructor', file));
  }
  return root;
}
async function install(root, location = '.') {
  const target = path.join(root, location);
  await json(target, 'package.json', { name: 'engineering-tools', devDependencies: { [name]: '1.6.0' } });
  await json(target, 'package-lock.json', { name: 'engineering-tools', lockfileVersion: 3, packages: { [`node_modules/${name}`]: { version: '1.6.0' } } });
  await json(target, `node_modules/${name}/package.json`, { name, version: '1.6.0' });
  await write(target, `node_modules/${name}/bin/openspec.js`, `console.log(${JSON.stringify(location)});`);
}
async function snapshot(root, relative = '') {
  const entries = await readdir(path.join(root, relative), { withFileTypes: true });
  const output = {};
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) Object.assign(output, await snapshot(root, child));
    else output[child] = createHash('sha256').update(await readFile(path.join(root, child))).digest('hex');
  }
  return output;
}
function invoke(root) {
  return spawnSync(process.execPath, [path.join(root, '.project-constructor/openspec.mjs'), '--version'], {
    cwd: root, encoding: 'utf8', windowsHide: true, timeout: 10_000,
  });
}

test('isolated wrapper and read-only check select the same entry; switching preserves both installations', async t => {
  const root = await fixture(t);
  await install(root);
  await install(root, selected);
  const initial = await snapshot(root);
  for (const choice of [selected, '.', selected]) {
    await json(root, '.project-constructor/config.json', choice === '.' ? {} : { toolchainRoot: choice });
    const before = await snapshot(root);
    const location = resolveLocalToolchain(root);
    assert.equal(location.relative, choice);
    const checked = await checkLocalOpenSpec(root, contract);
    assert.equal(checked.status, 'PASS', checked.cause);
    assert.equal(checked.evidence.bin, resolvePinnedOpenSpec(root));
    const execution = invoke(root);
    assert.equal(execution.status, 0, execution.stderr);
    assert.equal(execution.stdout.trim(), choice);
    assert.deepEqual(await snapshot(root), before);
  }
  const final = await snapshot(root);
  delete final[path.join('.project-constructor', 'config.json')];
  assert.deepEqual(final, initial);
});

test('explicit missing installation never falls back to a healthy product-root package', async t => {
  const root = await fixture(t);
  await install(root);
  await json(root, '.project-constructor/config.json', { toolchainRoot: selected });
  const before = await snapshot(root);
  const checked = await checkLocalOpenSpec(root, contract);
  assert.equal(checked.status, 'FAIL');
  assert.match(checked.cause, /missing/);
  const execution = invoke(root);
  assert.equal(execution.status, 1);
  assert.equal(execution.stdout, '');
  assert.match(execution.stderr, /no está verificado/);
  assert.match(execution.stderr, /Revisa toolchainRoot y restaura/);
  assert.deepEqual(await snapshot(root), before);
});

test('declared, locked and installed identity, and the actual entry are all required', async t => {
  const root = await fixture(t);
  await json(root, '.project-constructor/config.json', { toolchainRoot: selected });
  const target = path.join(root, selected);
  for (const change of [
    () => json(target, 'package.json', { devDependencies: { [name]: '^1.6.0' } }),
    () => json(target, 'package-lock.json', { packages: { [`node_modules/${name}`]: { version: '1.5.0' } } }),
    () => json(target, `node_modules/${name}/package.json`, { name: 'unrelated', version: '1.6.0' }),
    () => json(target, `node_modules/${name}/package.json`, { name, version: '9.0.0' }),
    () => rm(path.join(target, `node_modules/${name}/bin/openspec.js`)),
  ]) {
    await install(root, selected);
    await change();
    await write(target, 'node_modules/.bin/openspec.cmd', 'a shim alone is not the package entry');
    const before = await snapshot(root);
    assert.equal((await checkLocalOpenSpec(root, contract)).status, 'FAIL');
    assert.equal(invoke(root).status, 1);
    assert.deepEqual(await snapshot(root), before);
  }
  await install(root, selected);
  assert.equal((await checkLocalOpenSpec(root, { ...contract, version: '9.0.0' })).status, 'FAIL');
  assert.equal((await checkLocalOpenSpec(root, { ...contract, package: 'unrelated' })).status, 'FAIL');
});

test('configuration is bounded and unsafe locations fail before constructor mutation', async t => {
  const root = await fixture(t);
  const git = spawnSync('git', ['init', '--quiet'], { cwd: root, encoding: 'utf8', windowsHide: true });
  assert.equal(git.status, 0, git.stderr);
  for (const value of ['', '.', '..', '../outside', '/absolute', 'C:/tools', 'a\\b', 'a//b', 'a/./b', 'a/../b', '.git/tools', 'x/.PROJECT-CONSTRUCTOR', 'tools/', 'tools.', 'tools ', 'a\u0000b', null, 4, {}, 'a'.repeat(2049)]) {
    assert.throws(() => validateToolchainRoot(value), { code: 'TOOLCHAIN_LOCATION_INVALID' });
    await json(root, '.project-constructor/config.json', { toolchainRoot: value });
    const before = await snapshot(root);
    assert.equal((await checkLocalOpenSpec(root, contract)).status, 'FAIL');
    assert.equal(invoke(root).status, 1);
    await assert.rejects(runBootstrapOrSync({ targetRoot: root, command: 'sync', check: true }), /toolchainRoot/);
    assert.deepEqual(await snapshot(root), before);
  }
  for (const content of ['{invalid', '[]', 'null', JSON.stringify({ padding: 'x'.repeat(65536) })]) {
    await write(root, '.project-constructor/config.json', content);
    assert.throws(() => resolveLocalToolchain(root), { code: 'TOOLCHAIN_METADATA_INVALID' });
    assert.equal(invoke(root).status, 1);
  }
});

test('schema and runtime agree on portable location validation', async () => {
  const schema = JSON.parse(await readFile(new URL('../blueprint/schema/config.schema.json', import.meta.url)));
  const validate = new Ajv({ strict: true }).compile(schema.properties.toolchainRoot);
  for (const value of [selected, 'références/工具', 'tools-2/local', '.GIT/tools', 'a/.PROJECT-CONSTRUCTOR',
    'a\u2028b', 'a\u2029b', '', '.', '..', '../out', '/absolute', 'C:/tools', 'a\\b', 'a//b', 'a/./b', 'a/../b',
    'tools/', 'tools.', 'tools ', 'a\u0000b', null, 4, {}, 'a'.repeat(2049)]) {
    let accepted = true;
    try { validateToolchainRoot(value); } catch { accepted = false; }
    assert.equal(validate(value), accepted, JSON.stringify(value));
  }
});

test('root classification metadata is subject to the same bounded read as selected packages', async t => {
  const root = await fixture(t);
  await json(root, 'package.json', { name: 'create-project-engineering-os', padding: 'x'.repeat(16 * 1024 * 1024) });
  assert.throws(() => readProjectManifest(root), { code: 'TOOLCHAIN_METADATA_INVALID' });
});

test('linked selected locations and package entries outside the selected tree are rejected', async t => {
  const root = await fixture(t);
  const outside = await fixture(t);
  await install(outside);
  await mkdir(path.join(root, '.project-os'));
  await symlink(outside, path.join(root, selected), process.platform === 'win32' ? 'junction' : 'dir');
  await json(root, '.project-constructor/config.json', { toolchainRoot: selected });
  assert.throws(() => resolveLocalToolchain(root), { code: 'TOOLCHAIN_LOCATION_INVALID' });
  // Remove only this known link, not its target.
  await rm(path.join(root, selected));
  await install(root, selected);
  const packageRoot = path.join(root, selected, `node_modules/${name}`);
  await rm(path.join(packageRoot, 'bin/openspec.js'));
  await rmdir(path.join(packageRoot, 'bin'));
  await symlink(path.join(outside, `node_modules/${name}/bin`), path.join(packageRoot, 'bin'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => resolvePinnedOpenSpec(root), { code: 'TOOLCHAIN_PATH_UNSAFE' });
  assert.equal((await checkLocalOpenSpec(root, contract)).status, 'FAIL');
  assert.equal(invoke(root).status, 1);
});

test('metadata cannot impersonate a package through a link outside its selected installation', async t => {
  const root = await fixture(t);
  const outside = await fixture(t);
  await install(outside);
  await json(root, '.project-constructor/config.json', { toolchainRoot: selected });
  await mkdir(path.join(root, selected), { recursive: true });
  await symlink(path.join(outside, 'node_modules'), path.join(root, selected, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.throws(() => inspectLocalPackage(resolveLocalToolchain(root), name, '1.6.0'), { code: 'TOOLCHAIN_PATH_UNSAFE' });
});
