import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { canonicalFolder, assertPath, snapshot, writeChecked, json, hash, fail } from '../engine/files.mjs';
import { verifyAgentEnvironment } from './agent-integrity.mjs';
import { projectOpenSpecArguments } from './openspec-arguments.mjs';
import { projectCoreArguments } from './core-arguments.mjs';
import { verifyProjectBoundary } from './project-boundary.mjs';
import { isolatedEnvironment, runFixedProcess } from './process.mjs';
import { createCoreBridge } from './core-bridge.mjs';
import { createCodeGraphEngine } from './codegraph.mjs';

// This module is copied to the project, together with its small source dependencies. It never
// loads an app installation or installs packages. The generated PowerShell launcher checks Node
// before starting it; callers invoking Node directly own the initial Node trust/environment.
try {
  const root = await canonicalFolder(fileURLToPath(new URL('../../../../', import.meta.url)));
  const settings = JSON.parse((await snapshot(root, '.project-os/companion/tools/settings.json', 16384)).content);
  if (settings?.format !== 1 || settings.rootHash !== hash(root)) fail('TOOLS_MOVED', 'Reabre esta carpeta en Companion para revisar su nueva ubicación.');
  const config = JSON.parse((await snapshot(root, '.project-constructor/config.json', 65536)).content);
  if (config.toolchainRoot !== '.project-os/toolchain') fail('TOOLS_CHANGED', 'La selección de herramientas cambió. Revisa el entorno en Companion.');
  const [operation, ...supplied] = process.argv.slice(2);
  let args = supplied;
  if (!['status','openspec','project-os','code'].includes(operation) || args.length > 50 || args.some(a => a.length > 2000 || /[\x00-\x1f\x7f]/.test(a))) fail('TOOL_COMMAND', 'Usa status, openspec, project-os o code con argumentos concretos.');
  if (operation === 'openspec') args = await projectOpenSpecArguments(root, args);
  if (operation === 'project-os') args = projectCoreArguments(args);
  const { runtimeRoot, environment } = await verifyAgentEnvironment(root, settings);
  const controller = new AbortController(); process.once('SIGINT', () => controller.abort());
  const controls = { signal: controller.signal };
  if (operation !== 'code') await verifyProjectBoundary(root, { openspec: operation === 'openspec', ...controls });
  if (operation === 'status') {
    const core = createCoreBridge({ runtimeRoot, resolveEnvironment: async () => environment });
    const sync = await core.runBootstrapOrSync({ command: 'sync', targetRoot: root, check: true }, controls), opsx = await core.runOpsxCheck(root, controls);
    console.log(json({ tools: 'verified', files: sync.status, workflows: opsx.status, gitStatus: 'not-inspected', agentReadProject: false }));
    if (sync.status !== 'IN_SYNC' || opsx.status !== 'PASS') process.exitCode = 1;
  } else if (operation === 'code') {
    if (args.length !== 1) fail('QUERY_INVALID', 'Pasa una consulta de símbolos entre comillas.');
    const context = await snapshot(root, '.project-os/companion/context/receipt.json', 1024 * 1024);
    const config = context.content ? JSON.parse(context.content).config : {};
    // The runtime root is only trusted here because verifyAgentEnvironment already proved it
    // holds the pinned trees; the map seal is read from that same app-owned location.
    console.log(json(await createCodeGraphEngine({ root: runtimeRoot }).search(root, args[0], config, controls)));
  } else {
    // Product scripts are never used as aliases. These commands address the pinned owners.
    const forbidden = args.some(a => /^(--target|--blueprint|--inject-failure-after)(=|$)/.test(a));
    if (forbidden) fail('TOOL_TARGET', 'Esta entrada está vinculada a la carpeta preparada.');
    const operations = await assertPath(runtimeRoot, 'operations'); await mkdir(operations, { recursive: true });
    const home = await mkdtemp(path.join(operations, 'agent-'));
    try {
      let executableArgs, cwd = home;
      if (operation === 'openspec') {
        if (!args.length) args.push('--help');
        // The official wrapper isolates generation preferences; no global OpenSpec fallback.
        executableArgs = [await assertPath(root, '.project-constructor/openspec.mjs'), ...args]; cwd = root;
        const pinnedWrapper = await snapshot(environment.toolchain.root, 'node_modules/create-project-engineering-os/blueprint/core/project-constructor/openspec.mjs');
        if ((await snapshot(root, '.project-constructor/openspec.mjs')).hash !== pinnedWrapper.hash) fail('TOOLS_CHANGED', 'El wrapper de OpenSpec cambió. Revisa el entorno antes de ejecutarlo.');
        const pinnedResolver = await snapshot(environment.toolchain.root, 'node_modules/create-project-engineering-os/blueprint/core/project-constructor/toolchain.mjs');
        if ((await snapshot(root, '.project-constructor/toolchain.mjs')).hash !== pinnedResolver.hash) fail('TOOLS_CHANGED', 'El selector de herramientas cambió.');
      } else {
        // Mutating commands require the agent's own reviewed project workflow. This transport
        // does not grant publication, credentials or permission to bypass readiness checks.
        if (!args.length) args.push('--help');
        const request = await canonicalFolder(home);
        await writeChecked(request, 'request.json', json({ target: root, git: environment.git.entry, toolchain: environment.toolchain.root, args }), null, 128 * 1024);
        executableArgs = [fileURLToPath(new URL('./agent-worker.mjs', import.meta.url)), path.join(home, 'request.json')];
      }
      const result = await runFixedProcess({ executable: environment.node.entry, args: executableArgs, cwd,
        env: isolatedEnvironment({ home, pathEntries: [path.dirname(environment.node.entry), path.dirname(environment.git.entry)] }), ...controls, timeoutMs: 180000, maxOutputBytes: 4 * 1024 * 1024 });
      process.stdout.write(result.stdout); process.stderr.write(result.stderr);
    } finally { await assertPath(runtimeRoot, `operations/${path.basename(home)}`); await rm(home, { recursive: true, force: true }); }
  }
} catch (error) {
  process.stderr.write(json({ status: 'FAIL', code: error.code ?? 'TOOLS_FAILED', message: error.message, action: error.action ?? 'Reabre el proyecto en Companion para revisar el entorno.', diagnostic: error.details }));
  process.exitCode = 1;
}
