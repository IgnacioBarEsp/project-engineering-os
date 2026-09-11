// Fixed subprocess bridge. The trusted parent validates the complete pinned toolchain before
// launch and writes this bounded request in a private, exclusively created operation folder.
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { installGitBoundary } from './git-boundary.mjs';

const requestPath = process.argv[2], outputPath = path.join(path.dirname(requestPath), 'response.json');
try {
  if (!path.isAbsolute(requestPath) || (await stat(requestPath)).size > 128 * 1024) throw Error('Invalid request');
  const request = JSON.parse(await readFile(requestPath, 'utf8'));
  if (request.version !== 1 || !path.isAbsolute(request.toolchain) || !path.isAbsolute(request.target) || !path.isAbsolute(request.git)) throw Error('Invalid request');
  // The pinned core preflight uses bare `git` and an optional status probe. A Windows cwd
  // can shadow bare Git, and status can run repository clean/process filters. This adapter
  // is confined to this subprocess: root identity uses the verified executable, status is
  // explicitly not inspected, and unexpected Git operations fail closed. Companion never
  // reports repository cleanliness from the core's optional gitDirty value.
  installGitBoundary({ target: request.target, git: request.git, cwd: path.dirname(requestPath) });
  const core = await import(pathToFileURL(path.join(request.toolchain, 'node_modules/create-project-engineering-os/src/index.mjs')).href);
  let value;
  const options = { targetRoot: request.target };
  if (request.operation === 'plan' || request.operation === 'apply') {
    if (!['bootstrap', 'sync'].includes(request.command)) throw Error('Invalid operation');
    value = await core.runBootstrapOrSync({ ...options, command: request.command, dryRun: request.operation === 'plan', check: request.check === true, adoptProjectSeeds: request.adoptProjectSeeds ?? [] });
  } else if (request.operation === 'rollback') value = await core.runRollback({ ...options, transactionId: request.transactionId });
  else if (request.operation === 'opsx-adapt') value = await core.runOpsxAdapt(options);
  else if (request.operation === 'opsx-check') value = await core.runOpsxCheck(options);
  else if (request.operation === 'generate') {
    const wrapper = await import(pathToFileURL(path.join(request.toolchain, 'node_modules/create-project-engineering-os/blueprint/core/project-constructor/openspec.mjs')).href);
    const exitCode = wrapper.runOpenSpec(['init', request.target, '--tools', 'codex,claude,cursor,github-copilot,opencode'], { binary: path.join(request.toolchain, 'node_modules/@fission-ai/openspec/bin/openspec.js') });
    if (exitCode !== 0) throw Error('Official OpenSpec generation failed');
    value = { exitCode, officialVersion: '1.6.0', generated: true };
  } else throw Error('Invalid operation');
  await writeFile(outputPath, JSON.stringify({ ok: true, value, execution: { gitRoot: 'verified-executable', gitStatus: 'not-inspected' } }), { flag: 'wx', mode: 0o600 });
} catch (error) {
  await writeFile(outputPath, JSON.stringify({ ok: false, error: { code: error.code ?? 'CORE_FAILED', message: error.message, action: error.remediation ?? 'Revisa el estado y los requisitos de ingeniería antes de reintentar.' } }), { flag: 'wx', mode: 0o600 });
}
