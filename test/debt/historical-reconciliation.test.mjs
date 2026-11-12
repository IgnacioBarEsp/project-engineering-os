import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { applyAssessmentToRegistry } from '../../src/debt/capture.mjs';
import { FLOW, TARGET, verifyInput, verifyRegistry, verifyFiles } from '../../scripts/verify-historical-debt-reconciliation.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const changes = path.join(root, 'openspec/changes');
const active = path.join(changes, FLOW, 'evidence');
const archived = path.join(changes, 'archive');
const candidates = [active, ...readdirSync(archived).filter(x => x.endsWith(`-${FLOW}`)).map(x => path.join(archived, x, 'evidence'))]
  .filter(x => existsSync(path.join(x, 'baseline-registry.json')));
assert.equal(candidates.length, 1, 'Exactly one versioned baseline, active or officially archived');
const baseline = JSON.parse(readFileSync(path.join(candidates[0], 'baseline-registry.json'), 'utf8'));
const input = JSON.parse(readFileSync(path.join(candidates[0], 'assessment-input.json'), 'utf8'));
function validRegistry() {
  const registry = structuredClone(baseline);
  applyAssessmentToRegistry({ registry, assessment: input, now: new Date(`${input.date}T12:00:00Z`) });
  return registry;
}

test('historical phase preflight accepts only approved single-ID remediation', () => {
  verifyInput(input);
  for (const altered of [
    { ...input, resolves: [{ ...input.resolves[0], id: baseline.items.find(x => x.id !== TARGET).id }] },
    { ...input, resolves: [...input.resolves, { ...input.resolves[0], id: 'debt-000000000000' }] },
    { ...input, candidates: [{}] },
    { ...input, flow: 'another-flow' },
  ]) assert.throws(() => verifyInput(altered));
});

test('historical phase validates actual pure capture semantics without unrelated mutations', () => {
  const after = validRegistry();
  verifyRegistry(baseline, after, input);
  assert.equal(after.items.filter(x => x.status === 'open').length, 36);
});

test('historical phase refuses removal, reclassification and occurrence mutation', () => {
  for (const [mutate, expected] of [
    [r => r.items.pop(), /registry identities\/order/],
    [r => { r.items.find(x => x.id !== TARGET).severity = 'major'; }, /unrelated item/],
    [r => { r.items.find(x => x.id === TARGET).occurrences.push({ flow: 'extra', date: input.date }); }, /target immutable fields/],
    [r => { r.items.find(x => x.id === TARGET).category = 'technical-debt'; }, /target immutable fields/],
    [r => { r.items.find(x => x.id === TARGET).resolution.flow = 'other'; }, /target resolution/],
    [r => { r.items.find(x => x.id === TARGET).updatedAt = '2000-01-01'; }, /target capture date/],
  ]) {
    const changed = validRegistry(); mutate(changed);
    assert.throws(() => verifyRegistry(baseline, changed, input), expected);
  }
});

test('historical phase file manifest requires exactly one new assessment and immutable old bytes', () => {
  const old = { '.project-os/debt/config.json': 'config', '.project-os/debt/registry.json': 'old', '.project-os/debt/assessments/history.json': 'history' };
  const after = { ...old, '.project-os/debt/registry.json': 'new', [`.project-os/debt/assessments/${FLOW}.json`]: 'assessment' };
  verifyFiles(old, after);
  assert.throws(() => verifyFiles(old, { ...after, '.project-os/debt/config.json': 'changed' }), /historical\/config bytes/);
  assert.throws(() => verifyFiles(old, { ...after, '.project-os/debt/assessments/history.json': 'changed' }), /historical\/config bytes/);
  assert.throws(() => verifyFiles(old, { ...after, '.project-os/debt/assessments/extra.json': 'extra' }), /exactly one new assessment/);
});
