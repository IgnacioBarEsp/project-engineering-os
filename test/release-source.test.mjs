import assert from 'node:assert/strict';
import test from 'node:test';

import { assertCommitMatchesRemoteTag, remoteTagCommit } from '../scripts/release-source.mjs';

const commit = 'a'.repeat(40);
const tagObject = 'b'.repeat(40);

test('release source resolves lightweight tags and only requests the exact tag ref', () => {
  let observedArgs;
  const resolved = remoteTagCommit('v1.0.0', (args) => {
    observedArgs = args;
    return `${commit}\trefs/tags/v1.0.0\n`;
  });
  assert.equal(resolved, commit);
  assert.deepEqual(observedArgs, [
    'ls-remote', 'origin', 'refs/tags/v1.0.0', 'refs/tags/v1.0.0^{}',
  ]);
});

test('release source peels annotated tags to their commit', () => {
  const resolved = remoteTagCommit('v1.0.0', () => (
    `${tagObject}\trefs/tags/v1.0.0\n${commit}\trefs/tags/v1.0.0^{}\n`
  ));
  assert.equal(resolved, commit);
});

test('release source rejects missing and unsafe tag inputs before running git', () => {
  let called = false;
  const runGit = () => { called = true; return ''; };
  assert.throws(() => remoteTagCommit('v1.0.0; touch marker', runGit), /SemVer inválida/);
  assert.throws(() => remoteTagCommit('v9.9.9', runGit), /No existe el tag remoto/);
  assert.equal(called, true);
});

test('release source rejects a checked-out commit that differs from the exact remote tag target', () => {
  assert.throws(
    () => assertCommitMatchesRemoteTag('v1.0.0', 'b'.repeat(40), () => (
      `${commit}\trefs/tags/v1.0.0\n`
    )),
    /no coincide con el commit remoto de v1\.0\.0/,
  );
  assert.doesNotThrow(() => assertCommitMatchesRemoteTag('v1.0.0', commit, () => (
    `${commit}\trefs/tags/v1.0.0\n`
  )));
});
