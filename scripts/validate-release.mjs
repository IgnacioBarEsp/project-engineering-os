#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { assertStableReleaseVersion, readJson } from './release-lib.mjs';
import { assertCommitMatchesRemoteTag } from './release-source.mjs';
import { isSupportedNode, supportedNodeRemediation } from '../src/runtime-support.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const tagIndex = args.indexOf('--tag');
const tag = tagIndex >= 0 ? args[tagIndex + 1] : process.env.GITHUB_REF_NAME;
const remote = args.includes('--remote');
const verifyTagSource = remote || args.includes('--verify-tag-source');
const packageJson = await readJson(path.join(root, 'package.json'));
assertStableReleaseVersion(packageJson.version);
if (!tag || tag !== `v${packageJson.version}`) {
  throw new Error(`El tag ${tag ?? '<missing>'} no coincide con v${packageJson.version}.`);
}
if (verifyTagSource) {
  const runGit = (argsForGit) => execFileSync(
    'git', argsForGit, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const actualCommit = execFileSync(
    'git', ['rev-parse', '--verify', 'HEAD^{commit}'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  ).trim();
  assertCommitMatchesRemoteTag(tag, actualCommit, runGit);
}
const changelog = await readFile(path.join(root, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## ${packageJson.version}`)) {
  throw new Error(`CHANGELOG no contiene ## ${packageJson.version}.`);
}
if (remote && !isSupportedNode(process.versions.node)) {
  throw new Error(`Publicación requiere un runtime soportado. ${supportedNodeRemediation()}`);
}
if (remote) {
  if (process.env.GITHUB_REPOSITORY !== 'IgnacioBarEsp/project-engineering-os') {
    throw new Error('La identidad OIDC no pertenece al repositorio aprobado.');
  }
  if (!process.env.GITHUB_WORKFLOW_REF?.includes('/.github/workflows/release.yml@')) {
    throw new Error('La identidad OIDC no pertenece al workflow release.yml aprobado.');
  }
}
process.stdout.write(`PASS release preflight ${packageJson.name}@${packageJson.version}\n`);
