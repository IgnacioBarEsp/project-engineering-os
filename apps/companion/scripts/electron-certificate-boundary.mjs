import assert from 'node:assert/strict';
import {createHash, randomBytes, X509Certificate} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {copyFile, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import https from 'node:https';
import {fileURLToPath} from 'node:url';
import {getHeapStatistics} from 'node:v8';
import {isolatedEnvironment, runFixedProcess} from '../runtime/process.mjs';

// This development-only verifier has no product/IPC entry point. Both identities
// are exact supplier binaries; the affected one is solely an offline comparison.
const IDENTITIES = Object.freeze({
  candidate: {version: '44.9.1', sha256: '1432afee01d6a788f11cb6649efd271923e1e490beef688c24d31f47965013aa'},
  baseline: {version: '44.1.1', sha256: '11246b242f4fb967283b6d50d5800fa30e7c3f43d47353a6d20fc8d6ac07b87f'},
});
const FIXTURES = Object.freeze({
  'trusted.pem': 'd139e5cb2c945d4daa0467396c09ce92f38e5b09a5cc40bf0f62c1277d83eb0b',
  'trusted.key': '37b95aa0fc33e8b675f96bdd593ccfe68d27b2078a5bbfad53a8bbb75d31c8e0',
  'untrusted.pem': '0b2e9d2125696fb13f079c74aa8d6b87778b4fefc420fe3d2933ecd1a9d834fd',
  'untrusted.key': '0011e17be7e8e8776def4213253cc9763483c7b46a556aa06a5ca23b9db1396d',
  'blocked-intermediate.pem': '4fff198fb2c913407a63f13a6884bfe5781ced50f6b129e83a6595180a4fcb3c',
  'provenance.json': '5d90560a13e54efbd4c1b63b47abdb48646273043eca076c924e067201d9cdbd',
});
const SELF = fileURLToPath(import.meta.url);
const PROBE = '--peos-certificate-boundary-probe';
const BODY = 'peos-certificate-boundary-ok';
const TRANSPORTS = ['tls', 'https', 'fetch'];
const CONDITIONS = ['trusted', 'untrusted', 'blocked-chain'];
const CASE_MS = 20000, PROCESS_MS = 120000;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function regular(file, limit = Infinity) {
  const resolved = path.resolve(file), {root} = path.parse(resolved);
  let current = root;
  for (const name of resolved.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, name);
    const info = await lstat(current);
    assert.ok(!info.isSymbolicLink(), 'Linked probe input: ' + current);
  }
  const info = await lstat(resolved);
  assert.ok(info.isFile() && info.nlink === 1 && info.size <= limit, 'Unsafe probe input: ' + resolved);
  return await realpath(resolved);
}
async function digest(file) {
  const h = createHash('sha256');
  for await (const chunk of createReadStream(file)) h.update(chunk);
  return h.digest('hex');
}
async function fixtureData(directory) {
  assert.deepEqual((await readdir(directory)).sort(), Object.keys(FIXTURES).sort(), 'Exact fixture inventory');
  const data = {};
  for (const [name, expected] of Object.entries(FIXTURES)) {
    const file = await regular(path.join(directory, name), 16384);
    data[name] = await readFile(file);
    assert.equal(hash(data[name]), expected, 'Fixture drift: ' + name);
  }
  const trusted = new X509Certificate(data['trusted.pem']);
  const untrusted = new X509Certificate(data['untrusted.pem']);
  const blocked = new X509Certificate(data['blocked-intermediate.pem']);
  assert.equal(trusted.subject, trusted.issuer);
  assert.equal(trusted.ca, true);
  assert.equal(untrusted.ca, false);
  assert.notEqual(untrusted.subject, untrusted.issuer);
  assert.equal(untrusted.issuer, blocked.subject);
  assert.equal(untrusted.verify(blocked.publicKey), false);
  for (const cert of [trusted, untrusted, blocked]) {
    assert.ok(Date.parse(cert.validFrom) <= Date.now() && Date.now() < Date.parse(cert.validTo), 'Expired/not-yet-valid probe fixture');
  }
  for (const cert of [trusted, untrusted]) {
    assert.equal(cert.checkHost('localhost'), 'localhost');
    assert.equal(cert.checkIP('127.0.0.1'), '127.0.0.1');
  }
  return data;
}
function errorRecord(error, depth = 0, seen = new Set()) {
  if (!error || typeof error !== 'object' || depth > 6 || seen.has(error)) return null;
  seen.add(error);
  return {
    name: String(error.name ?? '').slice(0, 100),
    code: typeof error.code === 'string' ? error.code.slice(0, 100) : null,
    message: String(error.message ?? '').slice(0, 2000),
    cause: errorRecord(error.cause, depth + 1, seen),
    errors: Array.isArray(error.errors) ? error.errors.slice(0, 8).map(e => errorRecord(e, depth + 1, seen)) : [],
  };
}
function codes(record) {
  if (!record) return [];
  return [...(record.code ? [record.code] : []), ...codes(record.cause), ...record.errors.flatMap(codes)];
}
function expectedCode(mode, condition) {
  if (condition === 'trusted') return null;
  if (condition === 'untrusted') return 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
  return mode === 'baseline' ? 'CERT_SIGNATURE_FAILURE' : 'CERT_REVOKED';
}
async function boundedBody(response) {
  let value = '';
  for await (const chunk of response) {
    value += chunk.toString('utf8');
    assert.ok(Buffer.byteLength(value) <= 256, 'Oversized loopback response');
  }
  return value;
}
async function exercise(transport, condition, data) {
  const trusted = condition === 'trusted';
  const certificate = trusted ? data['trusted.pem'] : condition === 'blocked-chain'
    ? Buffer.concat([data['untrusted.pem'], data['blocked-intermediate.pem']]) : data['untrusted.pem'];
  const key = data[trusted ? 'trusted.key' : 'untrusted.key'];
  const sockets = new Set(), controller = new AbortController();
  let server, timer, phase = 'server-setup';
  try {
    server = transport === 'tls'
      ? tls.createServer({key, cert: certificate}, socket => socket.end(BODY))
      : https.createServer({key, cert: certificate}, (_request, response) => response.end(BODY));
    server.on('connection', socket => { sockets.add(socket); socket.once('close', () => sockets.delete(socket)); });
    server.on('tlsClientError', (_error, socket) => socket.destroy());
    await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
    assert.equal(server.address().address, '127.0.0.1');
    const port = server.address().port;
    phase = 'client-certificate-verification';
    const request = (async () => {
      if (transport === 'fetch') {
        const response = await globalThis.fetch('https://127.0.0.1:' + port + '/', {
          signal: controller.signal, redirect: 'error',
        });
        assert.equal(response.status, 200);
        const body = await response.text();
        assert.ok(Buffer.byteLength(body) <= 256);
        return {body, authenticated: true};
      }
      if (transport === 'https') {
        return await new Promise((resolve, reject) => {
          const request = https.get({hostname: '127.0.0.1', port, servername: 'localhost', path: '/',
            rejectUnauthorized: true, ...(trusted ? {ca: data['trusted.pem']} : {}),
            agent: false, signal: controller.signal}, response => {
            const authenticated = response.socket.authorized;
            void boundedBody(response).then(body => resolve({body, authenticated}), reject);
          });
          request.once('error', reject);
        });
      }
      return await new Promise((resolve, reject) => {
        const socket = tls.connect({host: '127.0.0.1', port, servername: 'localhost',
          rejectUnauthorized: true, ...(trusted ? {ca: data['trusted.pem']} : {}), signal: controller.signal});
        let body = '';
        socket.on('data', chunk => { body += chunk.toString('utf8'); if (Buffer.byteLength(body) > 256) socket.destroy(new Error('Oversized loopback response')); });
        socket.once('end', () => resolve({body, authenticated: socket.authorized}));
        socket.once('error', reject);
      });
    })();
    const timeout = new Promise((_resolve, reject) => {
      timer = setTimeout(() => { const error = Object.assign(new Error('Certificate case exceeded20s'), {code: 'CASE_TIMEOUT'}); controller.abort(error); reject(error); }, CASE_MS);
    });
    const value = await Promise.race([request, timeout]);
    assert.equal(value.body, BODY);
    assert.equal(value.authenticated, true);
    return {ok: true, phase, error: null};
  } catch (error) {
    return {ok: false, phase, error: errorRecord(error)};
  } finally {
    clearTimeout(timer);
    controller.abort();
    for (const socket of sockets) socket.destroy();
    if (server?.listening) await new Promise(resolve => server.close(resolve));
  }
}
async function childProbe() {
  assert.equal(process.argv.filter(value => value === PROBE).length, 1);
  const args = process.argv.slice(process.argv.indexOf(PROBE) + 1);
  assert.equal(args.length, 4);
  const [mode, home, nonce, sourceSha256] = args;
  assert.ok(Object.hasOwn(IDENTITIES, mode));
  assert.match(nonce, /^[a-f0-9]{64}$/);
  assert.equal(process.type, 'browser', 'A production Electron main process is required');
  assert.equal(process.versions.electron, IDENTITIES[mode].version);
  assert.ok(!process.env.ELECTRON_RUN_AS_NODE && !process.env.NODE_TLS_REJECT_UNAUTHORIZED);
  const {app, BrowserWindow} = await import('electron');
  app.setPath('userData', path.join(home, 'userdata'));
  app.disableHardwareAcceleration();
  const record = {schemaVersion: 1, mode, nonce, completed: false, declaredCases: 9, cases: [],
    sourceSha256, versions: {...process.versions}, executable: process.execPath,
    heapLimitBytes: getHeapStatistics().heap_size_limit,
    executableSha256: await digest(await regular(process.execPath)), fixtureHashes: FIXTURES,
    scope: 'Production Electron main; loopback only; strict Node TLS/HTTPS/fetch; no Chromium-network or exploit claim'};
  const target = path.join(home, 'probe-report.json');
  let exitCode = 1;
  try {
    assert.equal(record.executableSha256, IDENTITIES[mode].sha256);
    assert.ok(record.heapLimitBytes <= 256 * 1024 * 1024, 'Probe JS heap exceeds256MiB');
    assert.equal(await digest(await regular(SELF)), sourceSha256);
    const directory = path.join(home, 'fixtures'), data = await fixtureData(directory);
    assert.equal(process.env.NODE_EXTRA_CA_CERTS, path.join(directory, 'trusted.pem'));
    await app.whenReady();
    assert.equal(BrowserWindow.getAllWindows().length, 0);
    for (const transport of TRANSPORTS) for (const condition of CONDITIONS) {
      const started = Date.now(), observed = await exercise(transport, condition, data);
      const expected = expectedCode(mode, condition), actualCodes = [...new Set(codes(observed.error))];
      const passed = expected === null ? observed.ok
        : !observed.ok && observed.phase === 'client-certificate-verification'
          && actualCodes.length === 1 && actualCodes[0] === expected;
      record.cases.push({id: transport + '/' + condition, transport, condition, expectedCode: expected,
        passed, elapsedMs: Date.now() - started, actualCodes, ...observed});
      await writeFile(target, JSON.stringify(record, null, 2) + '\n');
      if (!passed) throw new Error('Declared certificate boundary failed: ' + transport + '/' + condition);
    }
    assert.equal(record.cases.length, 9);
    assert.equal(BrowserWindow.getAllWindows().length, 0);
    record.completed = true; exitCode = 0;
  } catch (error) { record.failure = errorRecord(error); }
  await writeFile(target, JSON.stringify(record, null, 2) + '\n');
  process.stdout.write(JSON.stringify({nonce, completed: record.completed, cases: record.cases.length}) + '\n',
    () => app.exit(exitCode));
}
export async function verifyElectronCertificateBoundary({executablePath, output, mode = 'candidate'}) {
  assert.equal(process.platform, 'win32');
  assert.ok(Object.hasOwn(IDENTITIES, mode), 'Only the two frozen official identities are permitted');
  const executable = await regular(executablePath);
  assert.equal(await digest(executable), IDENTITIES[mode].sha256, 'Unreviewed Electron executable');
  const sourceSha256 = await digest(await regular(SELF));
  const source = fileURLToPath(new URL('../qa/fixtures/electron-certificates/', import.meta.url));
  await fixtureData(source);
  await mkdir(output, {recursive: true});
  const reportFile = path.join(output, mode + '-certificate-boundary.json');
  const home = await realpath(await mkdtemp(path.join(os.tmpdir(), 'peos-cert-boundary-')));
  const nonce = randomBytes(32).toString('hex');
  let run, failure, report;
  try {
    await mkdir(path.join(home, 'fixtures'));
    await mkdir(path.join(home, 'userdata'));
    for (const name of Object.keys(FIXTURES)) await copyFile(path.join(source, name), path.join(home, 'fixtures', name));
    const env = isolatedEnvironment({home});
    env.NODE_EXTRA_CA_CERTS = path.join(home, 'fixtures', 'trusted.pem');
    try {
      run = await runFixedProcess({executable, args: ['--js-flags=--max-old-space-size=192 --max-semi-space-size=8', SELF, PROBE,
        mode, home, nonce, sourceSha256], cwd: home, env, timeoutMs: PROCESS_MS, maxOutputBytes: 1024 * 1024});
    } catch (error) { failure = error; run = error.details ?? {code: error.code, message: error.message}; }
    try { report = JSON.parse(await readFile(path.join(home, 'probe-report.json'), 'utf8')); }
    catch (error) { failure ??= error; }
    const receipt = {schemaVersion: 1, at: new Date().toISOString(), mode, run, report: report ?? null,
      executableSha256: await digest(executable), sourceSha256, fixtureHashes: FIXTURES,
      observedComplete: !failure && report?.completed === true,
      parentFailure: failure ? errorRecord(failure) : null};
    await writeFile(reportFile, JSON.stringify(receipt, null, 2) + '\n', {flag: 'wx'});
    assert.equal(receipt.executableSha256, IDENTITIES[mode].sha256, 'Observed executable drift');
    assert.equal(await digest(SELF), sourceSha256, 'Observed verifier drift');
    await fixtureData(source);
    if (failure) throw failure;
    assert.equal(report.nonce, nonce);
    assert.equal(report.mode, mode);
    assert.equal(report.versions.electron, IDENTITIES[mode].version);
    assert.equal(report.sourceSha256, sourceSha256);
    assert.equal(report.declaredCases, 9);
    assert.equal(report.completed, true);
    assert.equal(report.cases.length, 9);
    assert.deepEqual(report.cases.map(c => c.id), TRANSPORTS.flatMap(t => CONDITIONS.map(c => t + '/' + c)));
    assert.ok(report.cases.every(c => c.passed === true && c.elapsedMs < CASE_MS));
    return {passed: true, mode, cases: 9, reportFile, reportSha256: hash(await readFile(reportFile)),
      executableSha256: IDENTITIES[mode].sha256, sourceSha256, versions: report.versions};
  } finally {
    assert.equal(path.dirname(home), await realpath(os.tmpdir()));
    assert.ok(path.basename(home).startsWith('peos-cert-boundary-'));
    await rm(home, {recursive: true, force: true});
  }
}
if (process.versions.electron && process.argv.includes(PROBE)) await childProbe();
