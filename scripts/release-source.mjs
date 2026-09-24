import { assertSemver } from './release-lib.mjs';

export function remoteTagCommit(tag, runGit = undefined) {
  if (typeof tag !== 'string' || !tag.startsWith('v')) {
    throw new Error(`Tag de release inválido: ${String(tag)}`);
  }
  assertSemver(tag.slice(1));

  if (!runGit) {
    throw new Error('Falta el lector Git para verificar el tag remoto.');
  }
  const tagRef = `refs/tags/${tag}`;
  const output = runGit([
    'ls-remote', 'origin', tagRef, `${tagRef}^{}`,
  ]);
  const commits = new Map(
    output.trim().split(/\r?\n/).filter(Boolean).map((line) => {
      const match = line.match(/^([0-9a-f]{40,64})\s+(refs\/tags\/v[^\s]+(?:\^\{\})?)$/);
      if (!match) throw new Error('Git devolvió una referencia remota de tag inválida.');
      return [match[2], match[1]];
    }),
  );
  const commit = commits.get(`${tagRef}^{}`) ?? commits.get(tagRef);
  if (!commit) throw new Error(`No existe el tag remoto ${tag}.`);
  return commit;
}

export function assertCommitMatchesRemoteTag(tag, checkedOutCommit, runGit) {
  const expectedCommit = remoteTagCommit(tag, runGit);
  if (checkedOutCommit !== expectedCommit) {
    throw new Error(
      `El commit comprobado ${checkedOutCommit} no coincide con el commit remoto de ${tag} (${expectedCommit}).`,
    );
  }
}
