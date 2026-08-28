import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { inspectSpecPurposes } from '../scripts/spec-purpose.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function capability(root, name, lines) {
  const directory = path.join(root, 'openspec', 'specs', name);
  await mkdir(directory, { recursive: true });
  if (lines) await writeFile(path.join(directory, 'spec.md'), `${lines.join('\n')}\n`);
}

test('cada capability publicada declara un Purpose redactado', async () => {
  const { capabilities, failures } = await inspectSpecPurposes(packageRoot);

  assert.deepEqual(failures, []);
  assert.ok(capabilities.includes('adaptive-onboarding'));
  assert.ok(capabilities.includes('public-documentation-experience'));
});

test('rechaza placeholder de archive, Purpose vacío, spec ilegible y sección ausente', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-spec-purpose-'));
  await capability(root, 'archived', [
    '# archived Specification',
    '',
    '## Purpose',
    'TBD - created by archiving change add-archived. Update Purpose after archive.',
    '## Requirements',
  ]);
  await capability(root, 'empty', ['# empty', '', '## Purpose', '', '## Requirements']);
  await capability(root, 'headless', null);
  await capability(root, 'missing', ['# missing', '', '## Requirements']);
  await capability(root, 'valid', [
    '# valid',
    '',
    '## Purpose',
    'Definir un contrato observable para la capacidad.',
    '## Requirements',
  ]);

  assert.deepEqual(await inspectSpecPurposes(root), {
    capabilities: ['archived', 'empty', 'headless', 'missing', 'valid'],
    failures: [
      { kind: 'purpose-placeholder', capability: 'archived' },
      { kind: 'purpose-empty', capability: 'empty' },
      { kind: 'spec-unreadable', capability: 'headless' },
      { kind: 'purpose-missing', capability: 'missing' },
    ],
  });
});

test('un árbol de specs ausente falla cerrado en vez de reportar cero capabilities', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-spec-purpose-absent-'));

  assert.deepEqual(await inspectSpecPurposes(root), {
    capabilities: [],
    failures: [{ kind: 'specs-root-unreadable', capability: 'openspec/specs' }],
  });
});
