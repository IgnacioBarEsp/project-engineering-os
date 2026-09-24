import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export async function exists(absolute) {
  try {
    await access(absolute);
    return true;
  } catch {
    return false;
  }
}

export async function resolveNpmCli() {
  const candidates = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(
      path.dirname(path.dirname(process.execPath)),
      'lib',
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js',
    ),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (await exists(candidate)) return candidate;
  }
  throw new Error('No se pudo resolver npm-cli.js.');
}

export async function readJson(absolute) {
  return JSON.parse(await readFile(absolute, 'utf8'));
}

export function assertSemver(version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Versión SemVer inválida: ${version}`);
  }
}

export function assertStableReleaseVersion(version) {
  assertSemver(version);
  if (version.includes('-')) {
    throw new Error('El flujo de publicación actual solo admite versiones estables; no admite prereleases.');
  }
}

export function nonCanonicalEolEntries(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.match(/^i\/(\S+)\s+w\/(\S+)\s+attr\/([^\t]+)\t(.+)$/))
    .filter(Boolean)
    .filter((match) => /\beol=lf\b/.test(match[3])
      && !((match[1] === 'lf' && match[2] === 'lf')
        || (match[1] === 'none' && match[2] === 'none')))
    .map((match) => ({
      path: match[4],
      indexEol: match[1],
      worktreeEol: match[2],
    }));
}
