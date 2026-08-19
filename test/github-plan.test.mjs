import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { buildGithubPlan, githubPlanText } from '../src/github-plan.mjs';

const productSource = '.project-os/github/product-os.json';
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function seedEntry(target, source, payload) {
  return {
    content: Buffer.from(`${JSON.stringify(payload)}\n`),
    source,
    target,
  };
}

function blueprint(entries, githubPlan = null) {
  return {
    entries,
    manifest: { githubPlan },
  };
}

test('github-plan uses upstream target governance without consumer discovery', async () => {
  const governance = JSON.parse(await readFile(
    path.join(packageRoot, '.project-os', 'repository-governance.json'),
    'utf8',
  ));
  const baseBlueprint = blueprint([
    seedEntry(productSource, 'core/project-os/github/product-os.json', {
      labels: [{ name: 'type:discovery' }],
      statuses: ['Inbox'],
    }),
  ]);

  const plan = await buildGithubPlan({ baseBlueprint, targetRoot: packageRoot });
  assert.equal(plan.source, '.project-os/repository-governance.json');
  assert.equal(plan.provenance.kind, 'target');
  assert.equal(plan.resources.discoveryIssues.length, 0);
  assert.deepEqual(
    plan.resources.statuses.map((resource) => resource.desired),
    governance.project.statuses,
  );
  assert.deepEqual(
    plan.resources.labels.map((resource) => resource.desired),
    governance.labels,
  );
  assert.equal(plan.resources.projects.length, 1);
  assert.equal(plan.resources.rulesets.length, 1);
  assert.equal(plan.resources.releaseEnvironments.length, 1);
  assert.equal(plan.resources.tagRules.length, 1);
  assert.match(githubPlanText(plan), /Procedencia: target/);
});

test('github-plan attributes a consumer fallback to its tracked blueprint seed', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-github-plan-seed-'));
  const discoverySource = '.project-os/github/discovery-issues.json';
  const baseBlueprint = blueprint([
    seedEntry(productSource, 'core/project-os/github/product-os.json', {
      labels: [{ name: 'type:discovery' }],
      statuses: ['Inbox'],
    }),
    seedEntry(discoverySource, 'core/project-os/github/discovery-issues.json', {
      issues: [{ id: 'vision', title: 'Define vision' }],
    }),
  ]);

  const plan = await buildGithubPlan({ baseBlueprint, targetRoot: root });
  assert.equal(plan.source, 'blueprint/core/project-os/github/product-os.json');
  assert.deepEqual(plan.provenance, {
    kind: 'blueprint-seed',
    requestedSource: productSource,
    resolvedSource: 'blueprint/core/project-os/github/product-os.json',
  });
  assert.equal(plan.resources.discoveryIssues.length, 1);
  assert.match(githubPlanText(plan), /Procedencia: blueprint-seed/);
});

test('github-plan rejects a declared source missing from target and blueprint', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-github-plan-missing-'));
  const custom = '.project-os/github/custom.json';
  await assert.rejects(
    buildGithubPlan({
      baseBlueprint: blueprint([], { source: custom }),
      targetRoot: root,
    }),
    (error) => error?.code === 'GITHUB_PLAN_SOURCE_MISSING'
      && error?.remediation?.includes(custom),
  );
});

test('github-plan identifies inline manifest provenance', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-github-plan-inline-'));
  const plan = await buildGithubPlan({
    baseBlueprint: blueprint([], {
      discoveryIssues: [],
      labels: [],
      statuses: [],
    }),
    targetRoot: root,
  });
  assert.equal(plan.source, 'blueprint/manifest.json#githubPlan');
  assert.equal(plan.provenance.kind, 'inline-manifest');
});
