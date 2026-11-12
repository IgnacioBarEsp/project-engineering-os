// Repository-only verification of #206 phase 1. Not a public CLI or a generic debt policy.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const FLOW = 'reconcile-historical-companion-identity-debt';
export const TARGET = 'debt-bee2fa0c0549';
const DEBT = '.project-os/debt';
const REGISTRY = `${DEBT}/registry.json`;
const CONFIG = `${DEBT}/config.json`;
const ASSESSMENTS = `${DEBT}/assessments`;
const ASSESSMENT = `${ASSESSMENTS}/${FLOW}.json`;
const sha = content => createHash('sha256').update(content).digest('hex');
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, JSON.stringify(value, null, 2) + '\n');

export function verifyInput(input) {
  assert.equal(input.schemaVersion, 1, 'input schema');
  assert.equal(input.flow, FLOW, 'input flow');
  assert.equal(input.kind, 'remediation', 'input kind');
  assert.equal(input.result, 'clean', 'input result');
  assert.deepEqual(input.candidates, [], 'input candidates');
  assert.deepEqual(input.exceptions ?? [], [], 'input exceptions');
  assert.deepEqual(input.resolves?.map(x => x.id), [TARGET], 'input exact target');
  assert.equal(typeof input.resolves[0].evidence, 'string', 'input evidence type');
  assert.ok(input.resolves[0].evidence.trim().length > 0, 'input evidence missing');
}

export function verifyRegistry(before, after, input) {
  verifyInput(input);
  assert.equal(before.items.length, 50, 'baseline total');
  assert.equal(before.items.filter(x => x.status === 'open').length, 37, 'baseline open');
  const { items: beforeItems, ...beforeMeta } = before;
  const { items: afterItems, ...afterMeta } = after;
  assert.deepEqual(afterMeta, beforeMeta, 'registry metadata');
  assert.deepEqual(afterItems.map(x => x.id), beforeItems.map(x => x.id), 'registry identities/order');
  assert.equal(afterItems.filter(x => x.status === 'open').length, 36, 'registry open');
  for (let i = 0; i < beforeItems.length; i++) {
    const original = beforeItems[i], current = afterItems[i];
    if (original.id !== TARGET) {
      assert.deepEqual(current, original, `unrelated item ${original.id}`);
      continue;
    }
    assert.equal(original.status, 'open', 'target baseline status');
    assert.equal(current.status, 'resolved', 'target resolved');
    assert.deepEqual(current.resolution, { flow: FLOW, evidence: input.resolves[0].evidence }, 'target resolution');
    assert.equal(current.updatedAt, input.date, 'target capture date');
    const immutable = ({ status, resolution, updatedAt, ...rest }) => rest;
    assert.deepEqual(immutable(current), immutable(original), 'target immutable fields');
  }
}

export function snapshot(root) {
  const files = [CONFIG, REGISTRY, ...readdirSync(path.join(root, ASSESSMENTS)).sort().map(name => `${ASSESSMENTS}/${name}`)];
  return Object.fromEntries(files.map(file => [file, sha(readFileSync(path.join(root, file)))]));
}

export function verifyFiles(before, after) {
  assert.deepEqual(Object.keys(after).sort(), [...Object.keys(before), ASSESSMENT].sort(), 'exactly one new assessment');
  for (const [file, hash] of Object.entries(before)) {
    if (file === REGISTRY) continue;
    assert.equal(after[file], hash, `historical/config bytes ${file}`);
  }
}

function run(root, commandRoot, args, expectedExit = 0) {
  const r = spawnSync(process.execPath, [path.join(commandRoot, 'bin/project-os.mjs'), ...args, '--root', root, '--json'], {
    cwd: commandRoot, encoding: 'utf8', windowsHide: true, timeout: 30_000, maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(r.error, undefined, 'CLI execution error is not a passing detection');
  assert.equal(r.status, expectedExit, `${args.join(' ')}: ${r.stdout}\n${r.stderr}`);
  return { exitCode: r.status, stdout: r.stdout, stderr: r.stderr, parsed: expectedExit === 0 ? JSON.parse(r.stdout) : null };
}

function capture(root, commandRoot, inputFile, date, expectedExit = 0) {
  return run(root, commandRoot, ['debt', 'capture', '--flow', FLOW, '--input', inputFile, '--now', date], expectedExit);
}

function verifyBudget(root, commandRoot) {
  const result = run(root, commandRoot, ['debt', 'check']);
  assert.equal(result.parsed.verdict, 'PASS');
  const plan = result.parsed.evaluation.plans['upstream-core'];
  assert.equal(plan.budget, 4, 'budget unchanged');
  assert.equal(plan.threshold, 5, 'threshold unchanged');
  assert.equal(plan.flowsWithResidualDebt, 3, 'flows unchanged');
  return result;
}

// Fail for the named property; an unrelated exception/timeout cannot count as detection.
function rejection(name, operation, expected) {
  assert.throws(operation, expected, name);
  return { name, detected: true, expected: String(expected) };
}

function exercise(root, evidence) {
  const inputFile = path.join(evidence, 'assessment-input.json');
  const input = json(inputFile);
  verifyInput(input);
  const baseline = json(path.join(evidence, 'baseline-registry.json'));
  assert.deepEqual(json(path.join(root, REGISTRY)), baseline, 'root still at approved baseline');
  const beforeFiles = snapshot(root);
  const temp = mkdtempSync(path.join(tmpdir(), 'peos-206-reconciliation-'));
  function copy(name) {
    const target = path.join(temp, name);
    mkdirSync(path.join(target, '.project-os'), { recursive: true });
    cpSync(path.join(root, DEBT), path.join(target, DEBT), { recursive: true });
    return target;
  }
  const positiveRoot = copy('positive');
  const first = capture(positiveRoot, root, inputFile, input.date);
  assert.deepEqual(first.parsed.capture.changes, [{ action: 'resolved', id: TARGET }], 'exact CLI change');
  const afterRegistry = json(path.join(positiveRoot, REGISTRY));
  verifyRegistry(baseline, afterRegistry, input);
  const afterFiles = snapshot(positiveRoot);
  verifyFiles(beforeFiles, afterFiles);
  assert.deepEqual(json(path.join(positiveRoot, ASSESSMENT)), input, 'captured input exact');
  const budget = verifyBudget(positiveRoot, root);
  const second = capture(positiveRoot, root, inputFile, input.date);
  assert.equal(second.parsed.capture.noop, true, 'second capture no-op');
  assert.deepEqual(snapshot(positiveRoot), afterFiles, 'second run byte identical');

  const interruptedRoot = copy('interrupted');
  cpSync(path.join(positiveRoot, ASSESSMENT), path.join(interruptedRoot, ASSESSMENT));
  const resumed = capture(interruptedRoot, root, inputFile, input.date);
  verifyRegistry(baseline, json(path.join(interruptedRoot, REGISTRY)), input);
  assert.deepEqual(snapshot(interruptedRoot), afterFiles, 'interruption convergence');

  const negatives = [];
  const wrongExisting = structuredClone(input);
  wrongExisting.resolves[0].id = baseline.items.find(x => x.id !== TARGET && x.status === 'open').id;
  negatives.push(rejection('wrong existing ID rejected by preflight', () => verifyInput(wrongExisting), /input exact target/));
  const extra = structuredClone(input);
  extra.resolves.push(structuredClone(wrongExisting.resolves[0]));
  negatives.push(rejection('additional resolution rejected by preflight', () => verifyInput(extra), /input exact target/));

  const invalidRoot = copy('absent-id');
  const absent = structuredClone(input);
  absent.resolves[0].id = 'debt-000000000000';
  const absentFile = path.join(temp, 'absent-input.json');
  writeJson(absentFile, absent);
  const absentRun = capture(invalidRoot, root, absentFile, input.date, 2);
  assert.match(absentRun.stdout, /item inexistente/);
  assert.deepEqual(snapshot(invalidRoot), beforeFiles, 'absent ID causes no file writes');
  negatives.push({ name: 'absent ID rejected by actual CLI without mutation', detected: true, run: absentRun });

  const changedInput = { ...input, notes: `${input.notes} changed` };
  const changedFile = path.join(temp, 'changed-input.json');
  writeJson(changedFile, changedInput);
  const changedRun = capture(positiveRoot, root, changedFile, input.date, 2);
  assert.match(changedRun.stdout, /inmutable/);
  assert.deepEqual(snapshot(positiveRoot), afterFiles, 'changed input causes no writes');
  negatives.push({ name: 'changed same-flow input rejected by CLI', detected: true, run: changedRun });

  for (const [name, alter, expected] of [
    ['removed item', r => r.items.pop(), /registry identities\/order/],
    ['unrelated classification', r => { const item = r.items.find(x => x.id !== TARGET); item.category = item.category === 'technical-debt' ? 'optional-improvement' : 'technical-debt'; }, /unrelated item/],
    ['target occurrence', r => { r.items.find(x => x.id === TARGET).occurrences.push({ flow: 'unapproved', date: input.date }); }, /target immutable fields/],
    ['target classification', r => { r.items.find(x => x.id === TARGET).severity = 'major'; }, /target immutable fields/],
    ['wrong target resolution', r => { r.items.find(x => x.id === TARGET).resolution.flow = 'other'; }, /target resolution/],
  ]) {
    const altered = structuredClone(afterRegistry);
    alter(altered);
    negatives.push(rejection(name, () => verifyRegistry(baseline, altered, input), expected));
  }
  const oldPath = Object.keys(beforeFiles).find(file => file.startsWith(`${ASSESSMENTS}/`));
  negatives.push(rejection('historical assessment changed', () => verifyFiles(beforeFiles, { ...afterFiles, [oldPath]: 'bad' }), /historical\/config bytes/));
  negatives.push(rejection('configuration changed', () => verifyFiles(beforeFiles, { ...afterFiles, [CONFIG]: 'bad' }), /historical\/config bytes/));

  // A real rejected candidate is retained; recovery selects a separate baseline, not a registry-only revert.
  const rejectedRoot = copy('rejected-wrong-id');
  const wrongFile = path.join(temp, 'wrong-existing-input.json');
  writeJson(wrongFile, wrongExisting);
  capture(rejectedRoot, root, wrongFile, input.date);
  negatives.push(rejection('wrong actual capture caught after mutation', () => verifyRegistry(baseline, json(path.join(rejectedRoot, REGISTRY)), input), /unrelated item|target resolved/));
  const rejectedFiles = snapshot(rejectedRoot);
  const recoveredRoot = copy('recovered-baseline');
  assert.deepEqual(snapshot(recoveredRoot), beforeFiles, 'recovered baseline exact');
  const recoveryHealth = verifyBudget(recoveredRoot, root);
  assert.deepEqual(snapshot(rejectedRoot), rejectedFiles, 'rejected candidate preserved');
  assert.deepEqual(snapshot(root), beforeFiles, 'exercise did not mutate working branch');
  const result = { recordedAt: new Date().toISOString(), flow: FLOW, scope: 'Actual core CLI on disposable copies; not an installed Companion run',
    beforeFiles, afterFiles, first, second, resumed, budget, negatives,
    summary: { total: 50, beforeOpen: 37, afterOpen: 36, otherObjectsIdentical: 49, negativeDetections: negatives.length, negativeFailures: 0, phaseBranchMutations: 0 },
    recovery: { status: 'PASS', strategy: 'Separate preserved baseline/rejected candidate; no post-merge reopen claim',
      baselineHash: beforeFiles[REGISTRY], recoveredHash: snapshot(recoveredRoot)[REGISTRY], rejectedAssessmentPreserved: existsSync(path.join(rejectedRoot, ASSESSMENT)), recoveryHealth },
    disposableDirectories: Object.fromEntries(['positive', 'interrupted', 'absent-id', 'rejected-wrong-id', 'recovered-baseline'].map(name => [name, name])),
    note: 'All disposable copies retained outside repository. Absolute user paths omitted from versioned report.' };
  writeJson(path.join(evidence, 'exercise.json'), result);
  console.log(JSON.stringify({ ...result.summary, preservedDisposableRoot: temp, recovery: result.recovery.status }));
}

function verifyActual(root, evidence) {
  const input = json(path.join(evidence, 'assessment-input.json'));
  const baseline = json(path.join(evidence, 'baseline-registry.json'));
  const beforeFiles = json(path.join(evidence, 'exercise.json')).beforeFiles;
  verifyRegistry(baseline, json(path.join(root, REGISTRY)), input);
  verifyFiles(beforeFiles, snapshot(root));
  assert.deepEqual(json(path.join(root, ASSESSMENT)), input, 'actual assessment exact input');
  const budget = verifyBudget(root, root);
  return { recordedAt: new Date().toISOString(), verdict: 'PASS', flow: FLOW, total: 50, open: 36, otherObjectsIdentical: 49,
    immutableTargetFieldsUnchanged: true, historicalAssessmentsUnchanged: Object.keys(beforeFiles).length - 2, files: snapshot(root), budget };
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invoked) {
  const [mode, evidenceArg] = process.argv.slice(2);
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  assert.ok(['--exercise', '--verify'].includes(mode), 'Use --exercise or --verify <evidence-directory>. This verifier never captures into the repository.');
  assert.ok(evidenceArg, 'Evidence directory required');
  const evidence = path.resolve(root, evidenceArg);
  const relative = path.relative(root, evidence);
  assert.ok(relative && !relative.startsWith('..') && !path.isAbsolute(relative), 'Evidence must remain within repository');
  if (mode === '--exercise') exercise(root, evidence);
  else {
    const result = verifyActual(root, evidence);
    writeJson(path.join(evidence, 'actual-capture-verification.json'), result);
    console.log(JSON.stringify({ verdict: result.verdict, total: result.total, open: result.open, otherObjectsIdentical: result.otherObjectsIdentical, historicalAssessmentsUnchanged: result.historicalAssessmentsUnchanged }));
  }
}
