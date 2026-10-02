import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { CONSTRUCTOR_VERSION } from '../../src/constants.mjs';

function hash(content) {
  return createHash('sha256').update(content).digest('hex');
}

async function write(root, relative, content) {
  const absolute = path.join(root, ...relative.split('/'));
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, content);
}

async function json(root, relative, value) {
  await write(root, relative, `${JSON.stringify(value, null, 2)}\n`);
}

export function healthyDoctorRunner(calls = [], overrides = {}) {
  return async (_spec, { id }) => {
    calls.push(id);
    const outputs = {
      nodeVersion: 'v22.22.0\n',
      npmVersion: '10.9.2\n',
      gitRoot: 'true\n',
      gitStatus: '',
      ghVersion: 'gh version 2.75.0\n',
      gitVersion: 'git version 2.50.0\n',
      ...overrides,
    };
    return { ok: true, exitCode: 0, stdout: outputs[id] ?? '', stderr: '', timedOut: false };
  };
}

export async function healthyDoctorParity() {
  return {
    exitCode: 0,
    plan: {
      hasDrift: false,
      summary: {
        conflicts: 0,
        creates: 0,
        deletes: 0,
        preserves: 1,
        stateUpdate: false,
        updates: 0,
      },
    },
  };
}

export async function createHealthyDoctorFixture(t, { graphify = false, literalSecret = false } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'project-constructor-doctor-'));
  t.after(async () => {
    await rm(root, { force: true, recursive: true });
  });
  await mkdir(path.join(root, '.git'), { recursive: true });
  await json(root, 'package.json', {
    name: 'fixture-project',
    private: true,
    devDependencies: {
      '@fission-ai/openspec': '1.6.0',
      'create-project-engineering-os': CONSTRUCTOR_VERSION,
    },
  });
  await json(root, 'package-lock.json', {
    name: 'fixture-project',
    lockfileVersion: 3,
    packages: {
      '': {
        name: 'fixture-project',
        devDependencies: {
          '@fission-ai/openspec': '1.6.0',
          'create-project-engineering-os': CONSTRUCTOR_VERSION,
        },
      },
      'node_modules/@fission-ai/openspec': { version: '1.6.0' },
      'node_modules/create-project-engineering-os': {
        name: 'create-project-engineering-os',
        version: CONSTRUCTOR_VERSION,
      },
    },
  });
  await json(root, 'node_modules/@fission-ai/openspec/package.json', {
    name: '@fission-ai/openspec',
    version: '1.6.0',
  });
  await json(root, 'node_modules/create-project-engineering-os/package.json', {
    name: 'create-project-engineering-os',
    version: CONSTRUCTOR_VERSION,
  });
  await write(root, 'node_modules/@fission-ai/openspec/bin/openspec.js', "throw new Error('doctor must not execute this');\n");
  await write(root, 'node_modules/create-project-engineering-os/bin/project-os.mjs', "throw new Error('doctor must not execute this');\n");
  const agents = '# Universal agent guide\n';
  await write(root, 'AGENTS.md', agents);
  await json(root, '.project-constructor/state.json', {
    packageName: 'create-project-engineering-os',
    packageVersion: CONSTRUCTOR_VERSION,
    schemaVersion: '1.0.0',
    files: [{ target: 'AGENTS.md', owner: 'constructor', hash: hash(agents) }],
  });
  await json(root, '.project-constructor/config.json', {
    activeProfiles: ['documentation', 'harness-tooling'],
    codeIndexable: false,
    requiredEnvironmentVariables: [],
  });
  await json(root, '.project-os/profiles.json', {
    active: ['documentation', 'harness-tooling'],
    profiles: [],
  });
  await json(root, '.project-os/mcp.json', {
    servers: [{
      id: graphify ? 'graphify' : 'context-docs',
      active: true,
      command: 'connector',
      token: literalSecret
        ? ['ghp', '_', '1234567890abcdefghijklmnop'].join('')
        : '${CONTEXT_DOCS_TOKEN}',
    }],
  });
  await json(root, '.project-os/debt/config.json', {
    schemaVersion: 1,
    budget: { threshold: 5, minorUnits: 1, escalatedMinorUnits: 2 },
    triggers: { flowsWithResidualDebt: 5, recurrenceFlows: 3 },
    github: { mode: 'off' },
    plans: [{ id: 'product-roadmap', title: 'Product roadmap' }],
    planRouting: { labelMap: {}, default: 'product-roadmap' },
    allowlistLabels: ['debt-remediation', 'security', 'incident', 'rollback'],
  });
  await json(root, '.project-os/debt/registry.json', { schemaVersion: 1, items: [] });
  await json(root, '.project-os/github/product-os.json', { labels: [], fields: [], statuses: [] });
  await write(root, '.github/workflows/project-constructor.yml', 'name: Project Constructor\n');
  return root;
}
