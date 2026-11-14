import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { ownedCrashFixture } from './helpers/owned-crash-fixture.mjs';

const point = 'npm-quarantined';
const missing = error => error.code === 'ENOENT';
const witnessError = error => error.code === 'QA_CRASH_WITNESS';

test('owned fixture closes an active child before deleting its root', { timeout: 3000 }, async t => {
  const fixture = await ownedCrashFixture(t);
  await writeFile(path.join(fixture.root, 'project.txt'), 'owned project');
  const child = fixture.start('setInterval(()=>{},1000);');
  let release;
  const activity = fixture.run(() => new Promise(resolve => { release = resolve; }));
  const activityRejected = assert.rejects(activity, error => error.code === 'QA_DISPOSED');
  await new Promise(resolve => setImmediate(resolve));
  const closing = fixture.cleanup();
  await child.completion;
  await access(fixture.root);
  release();
  await activityRejected;
  await closing;
  assert.equal(child.closed, true);
  assert.equal(child.killRequests, 1);
  await assert.rejects(access(fixture.root), missing);
});

test('owned fixture never kills an already closed child', { timeout: 3000 }, async t => {
  const fixture = await ownedCrashFixture(t), child = fixture.start('');
  assert.equal((await fixture.waitForExit(child)).code, 0);
  assert.equal(child.closed, true);
  await fixture.cleanup();
  assert.equal(child.killRequests, 0);
  await assert.rejects(access(fixture.root), missing);
});

test('owned fixture rejects spawn error without hanging or deleting a foreign directory', { timeout: 3000 }, async t => {
  const fixture = await ownedCrashFixture(t), outside = await ownedCrashFixture(t);
  await writeFile(path.join(outside.root, 'keep.txt'), 'foreign fixture');
  assert.throws(() => fixture.start('', [], { cwd: outside.root }), error => error.code === 'QA_CWD');
  const child = fixture.start('', [], { cwd: path.join(fixture.root, 'missing-cwd') });
  await assert.rejects(fixture.waitForExit(child), missing);
  assert.equal(child.closed, true);
  await fixture.cleanup();
  assert.equal(await readFile(path.join(outside.root, 'keep.txt'), 'utf8'), 'foreign fixture');
});

test('owned fixture rejects missing and mismatched crash witnesses on nonzero exit', { timeout: 3000 }, async t => {
  const fixture = await ownedCrashFixture(t);
  for (const script of [
    'process.exit(1);',
    "recordCrashPoint('npm-published');process.kill(process.pid,'SIGKILL');",
    "__writeWitness(__witness.file,JSON.stringify({format:1,nonce:'other',pid:process.pid,point:'npm-quarantined'})+'\\n',{flag:'wx'});process.kill(process.pid,'SIGKILL');"
  ]) {
    const child = fixture.start(script, [], { point });
    await assert.rejects(fixture.waitForCrash(child), witnessError);
    assert.equal(child.closed, true);
  }
});

test('owned fixture accepts the exact witness and preserves project history until cleanup; cancellation blocks recovery', { timeout: 3000 }, async t => {
  const fixture = await ownedCrashFixture(t);
  for (const name of ['project.txt', 'history.txt']) await writeFile(path.join(fixture.root, name), name);
  const child = fixture.start("recordCrashPoint('npm-quarantined');process.kill(process.pid,'SIGKILL');", [], { point });
  const ended = await fixture.waitForCrash(child);
  assert.ok(ended.code !== 0 || ended.signal);
  for (const name of ['project.txt', 'history.txt']) assert.equal(await readFile(path.join(fixture.root, name), 'utf8'), name);
  const abort = new AbortController(); abort.abort();
  let recovered = false;
  await assert.rejects(fixture.run(() => { recovered = true; }, abort.signal), error => error.name === 'AbortError');
  assert.equal(recovered, false);
  const queuedAbort = new AbortController();
  const queued = fixture.run(() => { recovered = true; }, queuedAbort.signal);
  queuedAbort.abort();
  await assert.rejects(queued, error => error.name === 'AbortError');
  assert.equal(recovered, false);
  await fixture.cleanup();
  assert.equal(child.closed, true);
  await assert.rejects(access(fixture.root), missing);
});
