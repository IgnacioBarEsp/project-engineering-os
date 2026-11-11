import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { z } from 'zod';
import { ChangeSchema } from '../node_modules/@fission-ai/openspec/dist/core/schemas/change.schema.js';
import { Validator } from '../node_modules/@fission-ai/openspec/dist/core/validation/validator.js';
import { VALIDATION_MESSAGES } from '../node_modules/@fission-ai/openspec/dist/core/validation/constants.js';
import { checkBoundedCollections, checkCompiledBounds } from './helpers/zod-bounded-collections.mjs';

const require = createRequire(import.meta.url);
const cjs = require('zod').z;

for (const [name, implementation] of [['ESM', z], ['CJS', cjs]]) {
  test('official Zod ' + name + ' preserves bounds, paths and legitimate transformations',
    () => checkBoundedCollections(implementation));
  test('official Zod ' + name + ' compiled bounds reject before visiting valid elements',
    () => checkCompiledBounds(implementation));
}

test('OpenSpec ChangeSchema enforces its actual min/max and retains error semantics', () => {
  let visits = 0;
  const delta = () => ({
    spec: 'routing',
    operation: 'REMOVED',
    get description() { visits++; return 'Remove an obsolete requirement from the project'; },
  });
  const base = {
    name: 'bounded-dependency-refresh',
    why: 'The project needs a reproducible update with compatible validation and retained evidence.',
    whatChanges: 'Refresh the reviewed validation dependency.',
  };
  const bad = ChangeSchema.safeParse({ ...base, deltas: Array.from({ length: 11 }, delta) });
  assert.equal(bad.success, false);
  assert.equal(visits, 0);
  assert.deepEqual(bad.error.issues.map(issue => ({
    code: issue.code, path: issue.path, message: issue.message,
  })), [{ code: 'too_big', path: ['deltas'], message: VALIDATION_MESSAGES.CHANGE_TOO_MANY_DELTAS }]);
  assert.equal(ChangeSchema.safeParse({ ...base, deltas: [delta()] }).success, true);
  assert.ok(visits > 0);
  const empty = ChangeSchema.safeParse({ ...base, deltas: [] });
  assert.equal(empty.success, false);
  assert.deepEqual(empty.error.issues[0].path, ['deltas']);
  assert.equal(empty.error.issues[0].message, VALIDATION_MESSAGES.CHANGE_NO_DELTAS);
});

test('real OpenSpec Validator reads a valid change and reports its capped delta error', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'peos-zod-validator-'));
  try {
    const reports = [];
    for (const count of [1, 11]) {
      const dir = path.join(root, 'change-' + count);
      await mkdir(dir, { recursive: true });
      const proposal = path.join(dir, 'proposal.md');
      await writeFile(proposal, '# Change\n\n## Why\n\n' +
        'A reproducible dependency update needs compatible validation and preserved project behavior.\n\n' +
        '## What Changes\n\n- Remove obsolete requirements.\n');
      for (let index = 0; index < count; index++) {
        const capability = path.join(dir, 'specs', 'capability-' + index);
        await mkdir(capability, { recursive: true });
        await writeFile(path.join(capability, 'spec.md'),
          '## ADDED Requirements\n\n### Requirement: Reviewed behavior ' + index +
          '\nThe system SHALL preserve a reviewed input.\n\n#### Scenario: Valid input\n' +
          '- **WHEN** a valid input is submitted\n- **THEN** the reviewed behavior is preserved\n');
      }
      reports.push(await new Validator(true).validateChange(proposal));
    }
    assert.equal(reports[0].valid, true, JSON.stringify(reports[0]));
    assert.equal(reports[1].valid, false);
    assert.ok(reports[1].issues.some(issue => issue.level === 'ERROR' &&
      issue.path === 'deltas' && issue.message === VALIDATION_MESSAGES.CHANGE_TOO_MANY_DELTAS));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
