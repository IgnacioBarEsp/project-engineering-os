#!/usr/bin/env node
// Exercise npm's real resolver against a deterministic, loopback-only registry.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { resolveNpmCli } from './release-lib.mjs';

const npm = await resolveNpmCli();
const root = await mkdtemp(path.join(tmpdir(), 'project-os-quarantine-'));
const cache = path.join(root, 'cache');
const json = (file, value) => writeFile(file, `${JSON.stringify(value)}\n`);
function run(args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [npm, ...args], {
      cwd, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, npm_config_cache: cache },
    });
    let output = '';
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', (chunk) => { output += chunk; });
    const timer = setTimeout(() => { child.kill(); reject(new Error('npm probe timeout')); }, 60000);
    child.on('error', (error) => { clearTimeout(timer); reject(error); });
    child.on('close', (status) => { clearTimeout(timer); resolve({ status, output }); });
  });
}
let server;
try {
  const names = ['project-os-age-probe-a', 'project-os-age-probe-b'];
  const packages = new Map();
  for (const name of names) {
    const source = path.join(root, name);
    await mkdir(source);
    await json(path.join(source, 'package.json'), { name, version: '1.0.0' });
    const packed = await run(['pack', '--json', '--ignore-scripts'], source);
    assert.equal(packed.status, 0, packed.output);
    const bytes = await readFile(path.join(source, `${name}-1.0.0.tgz`));
    packages.set(name, { bytes, integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` });
  }
  let registry;
  server = createServer((request, response) => {
    const name = request.url.split('/')[1];
    const record = packages.get(name);
    if (!record) { response.writeHead(404); response.end('{}'); return; }
    if (request.url.endsWith('.tgz')) { response.end(record.bytes); return; }
    const time = new Date(Date.now() - 3600000).toISOString();
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ name, 'dist-tags': { latest: '1.0.0' },
      time: { created: time, modified: time, '1.0.0': time },
      versions: { '1.0.0': { name, version: '1.0.0',
        dist: { tarball: `${registry}/${name}/-/${name}-1.0.0.tgz`, integrity: record.integrity } } },
    }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  registry = `http://127.0.0.1:${server.address().port}`;
  const consumer = path.join(root, 'consumer');
  await mkdir(consumer);
  await json(path.join(consumer, 'package.json'), { name: 'consumer', version: '1.0.0', private: true });
  await writeFile(path.join(consumer, '.npmrc'), 'min-release-age=7\n');
  const flags = ['--ignore-scripts', '--no-audit', '--no-fund', '--registry', registry, '--fetch-retries=0'];
  const install = ['install', '--package-lock-only', '--save-exact', ...flags];
  const blocked = await run([...install, `${names[0]}@1.0.0`], consumer);
  assert.notEqual(blocked.status, 0, 'young package unexpectedly resolved');
  assert.match(blocked.output, /ETARGET|ENOVERSIONS|No matching version/);
  const allowed = await run([...install, `${names[0]}@1.0.0`, `--min-release-age-exclude=${names[0]}`], consumer);
  assert.equal(allowed.status, 0, allowed.output);
  const other = await run([...install, `${names[1]}@1.0.0`, `--min-release-age-exclude=${names[0]}`], consumer);
  assert.notEqual(other.status, 0, 'package-specific exclusion bypassed another package');
  assert.match(other.output, /ETARGET|ENOVERSIONS|No matching version/);
  const lockBefore = await readFile(path.join(consumer, 'package-lock.json'), 'utf8');
  const locked = await run(['ci', ...flags], consumer);
  assert.equal(locked.status, 0, locked.output);
  assert.equal(await readFile(path.join(consumer, 'package-lock.json'), 'utf8'), lockBefore);
  assert.equal(JSON.parse(await readFile(path.join(consumer, 'node_modules', names[0], 'package.json'))).version, '1.0.0');
  assert.equal(await readFile(path.join(consumer, '.npmrc'), 'utf8'), 'min-release-age=7\n');
  console.log(JSON.stringify({ result: 'PASS', npm: (await run(['--version'], consumer)).output.trim(),
    rejectedYoungVersion: true, scopedException: true, unrelatedPackageStillRejected: true,
    ciAcceptsLockedYoungVersion: true, lockUnchanged: true, configUnchanged: true }));
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (path.dirname(path.resolve(root)) === path.resolve(tmpdir())) await rm(root, { recursive: true, force: true });
}
