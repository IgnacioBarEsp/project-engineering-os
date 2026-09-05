import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { classifyOnboarding } from '../src/onboarding.mjs';
import { stableStringify } from '../src/json.mjs';
import { hash, planTracker, PROVIDERS, REQUEST_PATH, STATE_PATH, validateRequest } from '../src/tracker/model.mjs';
import { createTransport } from '../src/tracker/providers.mjs';
import { applyTracker, rollbackTracker, verifyTracker } from '../src/tracker/workflow.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin/project-os.mjs');
const ghRequest = { schemaVersion: 1, provider: 'github-projects', action: 'create',
  connection: { owner: 'example', ownerType: 'user' }, name: 'Research workspace', description: 'Reviewed setup' };
async function write(rootDir, relative, value) {
  const destination = path.join(rootDir, relative);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, stableStringify(value));
}
async function fixture(request = ghRequest, answers = { tracker: 'none', remoteSetup: 'review-later' }) {
  const targetRoot = await mkdtemp(path.join(tmpdir(), 'project-os-tracker-'));
  execFileSync('git', ['init', '-q'], { cwd: targetRoot, windowsHide: true });
  execFileSync('git', ['remote', 'add', 'origin', 'https://github.com/example/project.git'], { cwd: targetRoot, windowsHide: true });
  await write(targetRoot, STATE_PATH, classifyOnboarding({ answers, evidence: [] }));
  if (request) await write(targetRoot, REQUEST_PATH, request);
  return { targetRoot, plan: await planTracker({ targetRoot }) };
}
function approval(plan, rollback = false) {
  return { schemaVersion: 1, planDigest: plan.digest, actor: 'Operator', expiresAt: new Date(Date.now() + 3600000).toISOString(),
    operations: rollback ? [{ id: 'project.rollback', scopes: PROVIDERS[plan.request.provider].write }]
      : plan.operations.map(({ id, scopes }) => ({ id, scopes: [...scopes] })) };
}
async function snapshot(targetRoot) {
  const result = {};
  for (const entry of await readdir(targetRoot, { recursive: true, withFileTypes: true })) {
    if (entry.isFile()) {
      const absolute = path.join(entry.parentPath ?? entry.path, entry.name);
      result[path.relative(targetRoot, absolute)] = hash((await readFile(absolute)).toString('base64'));
    }
  }
  return result;
}
function githubFixture() {
  let revision = 0;
  const state = { project: null, requests: [], writes: [], failAfterCreate: false, failSmoke: false };
  const project = () => ({ id: 'PVT_created', title: ghRequest.name, shortDescription: '',
    updatedAt: new Date(1700000000000 + revision++ * 1000).toISOString(), public: false, closed: false,
    owner: { login: 'example' }, items: { totalCount: 0 }, fields: { totalCount: 0, nodes: [] }, views: { totalCount: 0, nodes: [] } });
  state.seed = () => { state.project = project(); return state.project; };
  state.dependencies = { env: { PROJECT_OS_GITHUB_TOKEN: 'fixture-token' }, fetchImpl: async (url, options) => {
    assert.equal(url.origin, 'https://api.github.com'); assert.equal(url.pathname, '/graphql');
    assert.equal(options.redirect, 'error'); assert.equal(options.headers.authorization, 'Bearer fixture-token');
    const { query, variables } = JSON.parse(options.body); state.requests.push(query);
    if (query.includes('owner:user')) return Response.json({ data: { owner: { id: 'U_owner', projectsV2: {
      nodes: state.project ? [{ id: state.project.id, title: state.project.title }] : [], pageInfo: { hasNextPage: false, endCursor: null },
    } } } });
    if (query.includes('createProjectV2(')) {
      state.writes.push('create'); state.seed();
      if (state.failAfterCreate) throw Error('sensitive-response-fixture');
      return Response.json({ data: { createProjectV2: { projectV2: { id: state.project.id } } } });
    }
    if (query.includes('updateProjectV2(')) {
      state.writes.push('configure'); state.project.shortDescription = variables.input.shortDescription;
      state.project.updatedAt = new Date(1700000000000 + revision++ * 1000).toISOString();
      return Response.json({ data: { updateProjectV2: { projectV2: { id: state.project.id } } } });
    }
    if (query.includes('deleteProjectV2(')) {
      state.writes.push('delete'); state.project = null;
      return Response.json({ data: { deleteProjectV2: { clientMutationId: null } } });
    }
    if (state.failSmoke && state.writes.includes('configure')) throw Error('sensitive-response-fixture');
    return Response.json({ data: { node: state.project } });
  } };
  return state;
}

test('tracker plan is offline/read-only and preserves canonical tracker restrictions', async () => {
  const { targetRoot } = await fixture(null);
  const before = await snapshot(targetRoot);
  const plan = await planTracker({ targetRoot });
  assert.equal(plan.suggestion, 'github-projects'); assert.equal(plan.status, 'needs-input');
  assert.deepEqual(await snapshot(targetRoot), before);
  for (const answers of [{ tracker: 'existing' }, { tracker: 'unknown' }, { tracker: 'jira' }, { tracker: 'none', remoteSetup: 'local-only' }]) {
    await write(targetRoot, STATE_PATH, classifyOnboarding({ answers, evidence: [] }));
    await write(targetRoot, REQUEST_PATH, ghRequest);
    assert.equal((await planTracker({ targetRoot })).status, 'needs-input');
  }
});

test('tracker rejects altered, stale, expanded and context-changed approvals before credentials', async () => {
  const { targetRoot, plan } = await fixture();
  const dependencies = { env: new Proxy({}, { get() { assert.fail('credential access before local validation'); } }) };
  const before = await snapshot(targetRoot);
  await assert.rejects(applyTracker({ targetRoot, plan }, dependencies), { code: 'TRACKER_SCHEMA' });
  const wider = approval(plan); wider.operations[0].scopes.push('admin:org');
  await assert.rejects(applyTracker({ targetRoot, plan, approval: wider }, dependencies), { code: 'TRACKER_APPROVAL_SCOPE' });
  const changed = structuredClone(plan); changed.request.description = 'different';
  await assert.rejects(applyTracker({ targetRoot, plan: changed, approval: approval(plan) }, dependencies), { code: 'TRACKER_PLAN' });
  const stale = await planTracker({ targetRoot, createdAt: new Date(Date.now() - 90000000).toISOString() });
  await assert.rejects(applyTracker({ targetRoot, plan: stale, approval: approval(stale) }, dependencies), { code: 'TRACKER_STALE' });
  assert.deepEqual(await snapshot(targetRoot), before);
  await write(targetRoot, REQUEST_PATH, { ...ghRequest, description: 'context changed' });
  await assert.rejects(applyTracker({ targetRoot, plan, approval: approval(plan) }, dependencies), { code: 'TRACKER_CONTEXT' });
});

test('GitHub create, configuration, read smoke, idempotent replay and owned rollback', async () => {
  const input = await fixture(); const remote = githubFixture();
  const first = await applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies);
  assert.equal(first.status, 'PASS'); assert.equal(first.smoke.kind, 'project-items-read');
  assert.equal(first.configuration, 'PASS'); assert.equal(first.existence, 'PASS');
  assert.deepEqual(remote.writes, ['create', 'configure']);
  const replay = await applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies);
  assert.equal(replay.replay, true); assert.equal(replay.mutationPerformed, false);
  const before = await snapshot(input.targetRoot);
  assert.equal((await verifyTracker(input, remote.dependencies)).status, 'PASS');
  assert.deepEqual(await snapshot(input.targetRoot), before);
  const journal = await readFile(path.join(input.targetRoot, first.receipt), 'utf8');
  assert.ok(!journal.includes('fixture-token')); assert.ok(!journal.includes('authorization'));
  await assert.rejects(rollbackTracker({ ...input, approval: approval(input.plan) }, remote.dependencies), { code: 'TRACKER_APPROVAL_SCOPE' });
  assert.equal((await rollbackTracker({ ...input, approval: approval(input.plan, true) }, remote.dependencies)).status, 'PASS');
  assert.equal((await rollbackTracker({ ...input, approval: approval(input.plan, true) }, remote.dependencies)).replay, true);
  assert.deepEqual(remote.writes, ['create', 'configure', 'delete']);
});

test('tracker refuses duplicate creation, uncertain retry and concurrent lock', async () => {
  const input = await fixture(); const remote = githubFixture(); remote.seed();
  await assert.rejects(applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies), { code: 'TRACKER_RECONCILE' });
  assert.deepEqual(remote.writes, []);
  remote.project = null; remote.failAfterCreate = true;
  await assert.rejects(applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies), { code: 'TRACKER_REMOTE_UNCERTAIN' });
  await assert.rejects(applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies), { code: 'TRACKER_RECONCILE' });
  assert.deepEqual(remote.writes, ['create']);
  const result = await verifyTracker(input, remote.dependencies); assert.equal(result.existence, 'UNVERIFIED');
  const fresh = await fixture(); await write(fresh.targetRoot, '.project-os/tracker-transactions/active.lock', { pid: 1 });
  await assert.rejects(applyTracker({ ...fresh, approval: approval(fresh.plan) }, remote.dependencies), { code: 'TRACKER_LOCKED' });
});

test('tracker rollback preserves later content and preexisting project identity', async () => {
  const input = await fixture(); const remote = githubFixture();
  await applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies);
  remote.project.items.totalCount = 1;
  await assert.rejects(rollbackTracker({ ...input, approval: approval(input.plan, true) }, remote.dependencies), { code: 'TRACKER_REMOTE_DRIFT' });
  assert.equal((await applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies)).status, 'FAIL');
  assert.deepEqual(remote.writes, ['create', 'configure']);
  const request = { schemaVersion: 1, provider: 'github-projects', action: 'configure', connection: ghRequest.connection,
    project: remote.project.id, description: 'Updated', before: { name: ghRequest.name, description: ghRequest.description } };
  const existing = await fixture(request, { tracker: 'github-projects', remoteSetup: 'review-later' });
  const applied = await applyTracker({ ...existing, approval: approval(existing.plan) }, remote.dependencies);
  assert.equal(applied.status, 'PASS');
  await rollbackTracker({ ...existing, approval: approval(existing.plan, true) }, remote.dependencies);
  assert.equal(remote.project.shortDescription, ghRequest.description);
  assert.equal(remote.project.items.totalCount, 1); assert.ok(!remote.writes.includes('delete'));
});

for (const provider of ['azure-boards', 'jira']) {
  test(`${provider} configures only the explicit existing project and restores description`, async () => {
    const connection = provider === 'jira' ? { site: 'https://example.atlassian.net' } : { organization: 'example' };
    const request = { schemaVersion: 1, provider, connection, action: 'configure', project: '12345',
      description: 'New', before: { name: 'Existing', description: 'Original' } };
    const input = await fixture(request, { tracker: provider, remoteSetup: 'review-later' });
    let value = 'Original'; const writes = []; const paths = [];
    const dependencies = { env: { PROJECT_OS_AZURE_TOKEN: 'azure-fixture', PROJECT_OS_JIRA_TOKEN: 'jira-fixture', PROJECT_OS_JIRA_EMAIL: 'fixture@example.invalid' },
      fetchImpl: async (url, options) => {
        paths.push(url.pathname);
        assert.equal(url.origin, provider === 'jira' ? connection.site : 'https://dev.azure.com');
        if (options.method !== 'GET') {
          assert.equal(options.method, provider === 'jira' ? 'PUT' : 'PATCH');
          assert.deepEqual(Object.keys(JSON.parse(options.body)), ['description']);
          value = JSON.parse(options.body).description; writes.push(value);
          return Response.json({ id: '12345' });
        }
        if (url.pathname.endsWith('/teams')) return Response.json({ value: [] });
        if (url.pathname.endsWith('/statuses')) return Response.json([]);
        return Response.json({ id: '12345', name: 'Existing', description: value, state: 'wellFormed',
          key: 'EXAMPLE', projectTypeKey: 'software', style: 'classic', visibility: 'private' });
      } };
    const result = await applyTracker({ ...input, approval: approval(input.plan) }, dependencies);
    assert.equal(result.status, 'PASS');
    await rollbackTracker({ ...input, approval: approval(input.plan, true) }, dependencies);
    assert.deepEqual(writes, ['New', 'Original']); assert.equal(value, 'Original');
    assert.ok(paths.some((entry) => entry.endsWith(provider === 'jira' ? '/statuses' : '/teams')));
  });
}

test('tracker rejects unsafe origins, aliases, unsupported operations and credential-shaped fields', async () => {
  for (const request of [
    { ...ghRequest, token: 'secret' }, { ...ghRequest, provider: 'other' },
    { ...ghRequest, provider: 'jira', connection: { site: 'https://example.atlassian.net.evil.invalid' } },
    { ...ghRequest, provider: 'jira', connection: { site: 'https://example.atlassian.net' } },
    { ...ghRequest, description: 'x'.repeat(257) },
    { ...ghRequest, description: 'password=fixture-secret' },
  ]) assert.throws(() => validateRequest(request));
  const { targetRoot } = await fixture(null); const outside = await mkdtemp(path.join(tmpdir(), 'project-os-tracker-alias-'));
  await write(outside, 'request.json', ghRequest);
  await symlink(outside, path.join(targetRoot, 'alias'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(planTracker({ targetRoot, requestPath: 'alias/request.json' }), { code: 'TRACKER_SYMLINK' });
  await assert.rejects(planTracker({ targetRoot, requestPath: '../outside.json' }), { code: 'PATH_TRAVERSAL' });
});

test('tracker transport bounds responses, blocks redirects and never exposes remote error bodies', async () => {
  const make = (fetchImpl) => createTransport('github-projects', ghRequest.connection, { env: { PROJECT_OS_GITHUB_TOKEN: 'fixture-token' }, fetchImpl });
  const denied = make(async () => new Response('sensitive fixture-token', { status: 403 }));
  await assert.rejects(denied('GET', '/graphql'), (error) => error.code === 'TRACKER_REMOTE_HTTP' && !error.message.includes('fixture-token'));
  const large = make(async () => new Response('x'.repeat(262145)));
  await assert.rejects(large('GET', '/graphql'), { code: 'TRACKER_REMOTE_LIMIT' });
  const redirect = make(async (_url, options) => { assert.equal(options.redirect, 'error'); throw Error('redirect secret'); });
  await assert.rejects(redirect('GET', '/graphql'), { code: 'TRACKER_REMOTE_UNCERTAIN' });
  await assert.rejects(redirect('GET', '//evil.invalid'), { code: 'TRACKER_REMOTE_ROUTE' });
});

test('tracker CLI exposes public workflow and rejects missing or cross-command options', async () => {
  const { targetRoot } = await fixture(null);
  const run = (args) => spawnSync(process.execPath, [cli, 'tracker', ...args, '--target', targetRoot, '--json'], { encoding: 'utf8', windowsHide: true });
  const plan = run(['plan']); assert.equal(plan.status, 0, plan.stderr); assert.equal(JSON.parse(plan.stdout).suggestion, 'github-projects');
  assert.notEqual(run(['apply']).status, 0);
  assert.notEqual(run(['verify', '--approval', 'a.json']).status, 0);
});

test('tracker rejects remote precondition drift, wrong identities and sensitive descriptions', async () => {
  const remote = githubFixture(); remote.seed();
  const request = { schemaVersion: 1, provider: 'github-projects', action: 'configure', connection: ghRequest.connection,
    project: remote.project.id, description: 'Updated', before: { name: ghRequest.name, description: 'Wrong prior value' } };
  const input = await fixture(request, { tracker: 'github-projects' });
  await assert.rejects(applyTracker({ ...input, approval: approval(input.plan) }, remote.dependencies), { code: 'TRACKER_REMOTE_DRIFT' });
  remote.project.shortDescription = 'password=fixture-secret';
  await assert.rejects(verifyTracker(input, remote.dependencies), { code: 'TRACKER_SENSITIVE' });
  remote.project.shortDescription = ''; remote.project.id = 'PVT_another';
  await assert.rejects(verifyTracker(input, remote.dependencies), { code: 'TRACKER_REMOTE_CONTRACT' });
  assert.deepEqual(remote.writes, []);
});

test('Azure operation polling is bounded and never follows the response URL', async () => {
  const request = { schemaVersion: 1, provider: 'azure-boards', action: 'configure', connection: { organization: 'example' },
    project: '12345', description: 'Updated', before: { name: 'Existing', description: 'Before' } };
  const input = await fixture(request, { tracker: 'azure-boards' }); let value = 'Before', polls = 0;
  const dependencies = { env: { PROJECT_OS_AZURE_TOKEN: 'fixture' }, fetchImpl: async (url, options) => {
    assert.equal(url.origin, 'https://dev.azure.com');
    if (options.method === 'PATCH') return Response.json({ id: 'operation-id', status: 'queued', url: 'https://evil.invalid/' });
    if (url.pathname.includes('/operations/')) {
      polls += 1; if (polls === 2) value = 'Updated';
      return Response.json({ id: 'operation-id', status: polls === 2 ? 'succeeded' : 'inProgress' });
    }
    if (url.pathname.endsWith('/teams')) return Response.json({ value: [] });
    return Response.json({ id: '12345', name: 'Existing', description: value, state: 'wellFormed' });
  } };
  assert.equal((await applyTracker({ ...input, approval: approval(input.plan) }, dependencies)).status, 'PASS');
  assert.equal(polls, 2);
});
