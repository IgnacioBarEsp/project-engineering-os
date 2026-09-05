import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { registryIdentity, readBounded, waitForRegistryRelease } from '../scripts/registry-release.mjs';
import { assertPublishedManifest, assertSignedRelease, publishedIdentity, RELEASE_REPO } from '../scripts/verify-published.mjs';
import { checkPublishedVerificationWorkflow } from '../scripts/release-workflow-policy.mjs';

const identity = publishedIdentity('v0.3.0');
const urls = registryIdentity(identity.name, identity.version);
const integrity = `sha512-${Buffer.alloc(64, 1).toString('base64')}`;
const metadata = { name: identity.name, version: identity.version,
  dist: { integrity, tarball: urls.tarball, attestations: { url: urls.attestations } } };
const manifest = { schemaVersion: 1, package: identity.name, version: identity.version,
  tarball: identity.tarball, commit: 'a'.repeat(40), sha256: 'b'.repeat(64), bytes: 20, tested: true };
const ok = (data = metadata) => new Response(JSON.stringify(data));

function clocked(fetchResponse, maxWaitMs = 600_000) {
  let time = 0, attempts = 0;
  const delays = [];
  return {
    get time() { return time; }, get attempts() { return attempts; }, delays,
    run: () => waitForRegistryRelease({ ...identity, maxWaitMs, expectedIntegrity: integrity,
      now: () => time, sleepImpl: async (ms) => { delays.push(ms); time += ms; },
      fetchImpl: async (url, options) => {
        assert.equal(url, urls.metadata);
        assert.equal(options.redirect, 'error');
        assert.ok(options.signal instanceof AbortSignal);
        return fetchResponse(++attempts, time, (ms) => { time += ms; });
      },
    }),
  };
}

test('registry waits beyond twenty seconds and retries partial metadata before success', async () => {
  const state = clocked((attempt, time) => time < 30_000 ? new Response('', { status: 404 })
    : attempt === 6 ? ok({ name: identity.name, version: identity.version, dist: { integrity } }) : ok());
  assert.deepEqual(await state.run(), metadata);
  assert.equal(state.time, 45_000);
  assert.ok(state.delays.every((ms) => ms <= 15_000));
});

test('registry retries network, request timeout, throttling and server errors', async () => {
  const state = clocked((attempt) => {
    if (attempt === 1) throw new TypeError('network');
    if (attempt === 2) throw new DOMException('request timeout', 'TimeoutError');
    if (attempt < 6) return new Response('', { status: [408, 429, 503][attempt - 3] });
    return ok();
  });
  assert.deepEqual(await state.run(), metadata);
  assert.equal(state.attempts, 6);
});

test('registry deadline is finite and missing provenance never passes', async () => {
  const state = clocked(() => ok({ ...metadata, dist: { integrity, tarball: urls.tarball } }));
  await assert.rejects(state.run(), /timed out.*read-only.*do not republish/);
  assert.equal(state.time, 600_000);
  assert.ok(state.attempts < 50);
  const late = clocked((_attempt, _time, advance) => { advance(100); return ok(); }, 100);
  await assert.rejects(late.run(), /timed out/);
  assert.equal(late.attempts, 1);
});

test('registry rejects permanent HTTP errors and malformed JSON without retry', async () => {
  for (const status of [301, 400, 401, 403, 410]) {
    const state = clocked(() => new Response('', { status }));
    await assert.rejects(state.run(), /permanent HTTP/);
    assert.equal(state.attempts, 1);
  }
  const malformed = clocked(() => new Response('{'));
  await assert.rejects(malformed.run(), SyntaxError);
  assert.equal(malformed.attempts, 1);
});

test('registry rejects package, version, URL and integrity divergence immediately', async () => {
  const bad = [
    { ...metadata, name: 'different-package' }, { ...metadata, version: '0.3.1' },
    { ...metadata, dist: { ...metadata.dist, tarball: 'https://example.com/evil.tgz' } },
    { ...metadata, dist: { ...metadata.dist, attestations: { url: `${urls.attestations}/other` } } },
    { ...metadata, dist: { ...metadata.dist, integrity: 'sha1-deadbeef' } },
    { ...metadata, dist: { ...metadata.dist, integrity: `sha512-${Buffer.alloc(64, 2).toString('base64')}` } },
  ];
  for (const data of bad) {
    const state = clocked(() => ok(data));
    await assert.rejects(state.run(), /identity|integrity/);
    assert.equal(state.attempts, 1);
  }
});

test('registry inputs and streamed body sizes have hard limits', async () => {
  for (const maxWaitMs of [0, -1, Infinity, 600_001, 1.5]) {
    await assert.rejects(waitForRegistryRelease({ ...identity, maxWaitMs }), /wait must/);
  }
  assert.throws(() => registryIdentity('../other', '0.3.0'), /identity/);
  assert.equal(registryIdentity('@scope/name', '1.2.3').metadata,
    'https://registry.npmjs.org/%40scope%2Fname/1.2.3');
  await assert.rejects(readBounded(new Response('12345'), 4), /size limit/);
  assert.equal((await readBounded(new Response('1234'), 4)).toString(), '1234');
});

test('published tag validation rejects shell and path arguments before any execution', () => {
  for (const tag of ['main', '--help', 'v1.2.3/../../x', 'v1.2.3;whoami', 'v1.2.3\n', 'v$(id)', 'v1.2.3"']) {
    assert.throws(() => publishedIdentity(tag), /SemVer/);
  }
  assert.equal(publishedIdentity('v1.2.3-rc.1').version, '1.2.3-rc.1');
});

test('canonical manifest confines filenames and rejects tag, byte and test-evidence drift', () => {
  assert.doesNotThrow(() => assertPublishedManifest(manifest, identity, manifest.commit));
  for (const change of [
    { tarball: '../private' }, { tarball: 'C:\\private' }, { package: 'other' }, { version: '0.3.1' },
    { commit: 'c'.repeat(40) }, { tested: 'true' }, { bytes: -1 }, { bytes: 40 * 1024 * 1024 }, { sha256: 'bad' },
  ]) assert.throws(() => assertPublishedManifest({ ...manifest, ...change }, identity, manifest.commit), /manifest/);
});

function signedFixture() {
  const predicateType = 'https://slsa.dev/provenance/v1';
  const statement = { predicateType, subject: [{ name: `pkg:npm/${identity.name}@${identity.version}`,
    digest: { sha512: Buffer.alloc(64, 1).toString('hex') } }],
  predicate: { buildDefinition: {
    externalParameters: { workflow: { repository: `https://github.com/${RELEASE_REPO}`, path: '.github/workflows/release.yml' } },
    resolvedDependencies: [{ uri: `git+https://github.com/${RELEASE_REPO}@refs/heads/main`, digest: { gitCommit: manifest.commit } }],
  } } };
  const audit = { invalid: [], missing: [], verified: [{ name: identity.name, version: identity.version,
    registry: 'https://registry.npmjs.org/', attestations: { url: urls.attestations },
    attestationBundles: [{ predicateType, bundle: { dsseEnvelope: {
      payload: Buffer.from(JSON.stringify(statement)).toString('base64'),
    } } }],
  }] };
  return { audit, statement };
}

test('signed release requires successful audit and attestation for the exact artifact', () => {
  const { audit } = signedFixture();
  assert.doesNotThrow(() => assertSignedRelease(audit, identity, manifest, integrity));
  for (const change of [{ invalid: ['bad'] }, { missing: ['absent'] }, { verified: [] },
    { verified: [{ ...audit.verified[0], attestationBundles: [] }] }]) {
    assert.throws(() => assertSignedRelease({ ...audit, ...change }, identity, manifest, integrity), /signature|provenance/);
  }
  audit.verified[0].attestationBundles[0].bundle.dsseEnvelope.payload = Buffer.from('private-malformed-output').toString('base64');
  assert.throws(() => assertSignedRelease(audit, identity, manifest, integrity), (error) =>
    error.message === 'Verification evidence is not valid JSON.');
});

test('signed provenance binds subject digest, repository and commit', () => {
  for (const mutate of [
    (s) => { s.subject[0].digest.sha512 = 'a'.repeat(128); },
    (s) => { s.predicate.buildDefinition.externalParameters.workflow.repository = 'https://github.com/other/repo'; },
    (s) => { s.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit = 'c'.repeat(40); },
  ]) {
    const { audit, statement } = signedFixture();
    mutate(statement);
    audit.verified[0].attestationBundles[0].bundle.dsseEnvelope.payload = Buffer.from(JSON.stringify(statement)).toString('base64');
    assert.throws(() => assertSignedRelease(audit, identity, manifest, integrity), /Signed provenance differs/);
  }
});

test('published verification workflow rejects write permission, publishing and inline tag interpolation', async () => {
  const workflow = await readFile(new URL('../.github/workflows/verify-published.yml', import.meta.url), 'utf8');
  assert.deepEqual(checkPublishedVerificationWorkflow(workflow), []);
  for (const changed of [workflow.replace('contents: read', 'contents: write'),
    `${workflow}\n      - run: npm publish\n`, `${workflow}\n    id-token: write\n`,
    workflow.replace('"$RELEASE_TAG"', '"${{ inputs.tag }}"'),
    workflow.replace('npm@11.19.1', 'npm@latest')]) {
    assert.ok(checkPublishedVerificationWorkflow(changed).length > 0);
  }
});
