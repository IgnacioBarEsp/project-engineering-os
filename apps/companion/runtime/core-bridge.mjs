import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPath, canonicalFolder, writeChecked, snapshot, json, fail, PreparationError } from '../engine/files.mjs';
import { runFixedProcess, isolatedEnvironment } from './process.mjs';

const worker = fileURLToPath(new URL('./core-worker.mjs', import.meta.url));
export function createCoreBridge({ runtimeRoot, resolveEnvironment }) {
  async function call(operation, input, controls = {}) {
    const target = await canonicalFolder(input.targetRoot), environment = await resolveEnvironment(target, controls);
    if (!environment?.toolchain || !environment.node || !environment.git) fail('ENVIRONMENT_MISSING', 'Primero revisa y prepara las herramientas del entorno.');
    const homeRoot = await assertPath(runtimeRoot, 'operations'); await mkdir(homeRoot, { recursive: true });
    const home = await mkdtemp(path.join(homeRoot, 'core-'));
    try {
      await writeChecked(await canonicalFolder(home), 'request.json', json({ version: 1, operation, target, toolchain: environment.toolchain.root, git: environment.git.entry,
        command: input.command, check: input.check, adoptProjectSeeds: input.adoptProjectSeeds, transactionId: input.transactionId }), null, 128 * 1024);
      // Windows resolves a bare executable in cwd before PATH. Core's internal `git` calls
      // must run from this owned operation folder; targetRoot remains an explicit argument.
      await runFixedProcess({ executable: environment.node.entry, args: [worker, path.join(home, 'request.json')], cwd: home,
        env: isolatedEnvironment({ home, pathEntries: [path.dirname(environment.node.entry), path.dirname(environment.git.entry)] }), ...controls, timeoutMs: 180000, maxOutputBytes: 2 * 1024 * 1024 });
      const result = JSON.parse((await snapshot(await canonicalFolder(home), 'response.json', 4 * 1024 * 1024)).content);
      if (!result.ok) throw new PreparationError(result.error.code, result.error.message, result.error.action);
      return result.value;
    } finally { await assertPath(runtimeRoot, `operations/${path.basename(home)}`); await rm(home, { recursive: true, force: true }); }
  }
  return {
    runBootstrapOrSync: (input, controls) => call(input.dryRun || input.check ? 'plan' : 'apply', input, controls),
    runRollback: (input, controls) => call('rollback', input, controls),
    runOpsxAdapt: (target, controls) => call('opsx-adapt', { targetRoot: target }, controls),
    runOpsxCheck: (target, controls) => call('opsx-check', { targetRoot: target }, controls),
    generate: (target, controls) => call('generate', { targetRoot: target }, controls),
  };
}
