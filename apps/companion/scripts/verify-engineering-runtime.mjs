import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, realpath, rename } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { createEnvironmentEngine } from '../runtime/environment.mjs';
import { createConstructorAdapter } from '../engine/constructor-adapter.mjs';
import { createActivationEngine } from '../runtime/activation.mjs';
import { execFile as execFileCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { isolatedEnvironment, runFixedProcess } from '../runtime/process.mjs';

const execFile = promisify(execFileCallback);

// Actual pinned tools, public core and official OpenSpec; opt-in because the cache must already
// be reviewed and populated. No runtime downloads or project scripts are needed for this probe.
const [runtimeRoot, output] = process.argv.slice(2);
assert(runtimeRoot && output, 'Supply the verified runtime cache and an evidence JSON path.');
const manager = await createRuntimeManager({ root: runtimeRoot });
for (const id of ['node','npm','git']) assert.equal((await manager.inspect(id)).status, 'verified');
const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-real-engineering-')));
const product = '{"name":"existing-landing","scripts":{"postinstall":"exit 99","build":"product-owned"},"dependencies":{}}\n';
await writeFile(path.join(root, 'package.json'), product);
await writeFile(path.join(root, 'index.html'), '<!doctype html><title>Original landing</title>\n');
const environment = createEnvironmentEngine(manager), constructor = createConstructorAdapter(environment.core), started = performance.now();
const plan = await environment.plan(root); assert.equal(plan.downloadBytes, 0); await environment.apply(plan.id);
const bootstrap = await constructor.plan(root); assert.equal(bootstrap.status, 'planned'); await constructor.apply(bootstrap.id);
const activation = createActivationEngine(environment), reviewed = await activation.plan(root);
assert.equal(reviewed.status, 'planned'); const result = await activation.apply(reviewed.id);
assert.equal(result.workflows, 'verified'); assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), product);
// New engine and fresh controls ensure this is not a remembered in-process ready result.
const reopened = createEnvironmentEngine(manager), current = await createActivationEngine(reopened).verify(root);
assert.equal(current.workflows, 'verified');
const tools = await reopened.resolveEnvironment(root), home = path.join(root, '.project-os', 'companion', 'qa-home'); await mkdir(home);
const entry = path.join(root, '.project-os/companion/tools/runtime/agent-entry.mjs');
const invoke = args => runFixedProcess({ executable: tools.node.entry, args: [entry, ...args], cwd: home,
  env: isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] }), timeoutMs: 180000, maxOutputBytes: 1024 * 1024 });
const status = JSON.parse((await invoke(['status'])).stdout); assert.equal(status.files, 'IN_SYNC'); assert.equal(status.workflows, 'PASS');
// The launcher is what a person actually runs, so exercise it rather than only its payload.
const launcher = path.join(root, '.project-os/companion/tools.ps1');
const powershell = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
// Windows system binaries are hardlinked from the component store, so the product's fixed-process
// guard does not apply to powershell.exe; this probe runs it directly with literal arguments.
const runLauncher = args => execFile(powershell, ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', launcher, ...args],
  { cwd: root, env: isolatedEnvironment({ home, pathEntries: [path.dirname(tools.node.entry)] }), windowsHide: true, shell: false, timeout: 180000, maxBuffer: 1024 * 1024 });
const launched = JSON.parse((await runLauncher(['status'])).stdout);
assert.equal(launched.files, 'IN_SYNC'); assert.equal(launched.workflows, 'PASS'); assert.equal(launched.agentReadProject, false);
// Editing any copied module the launcher is about to execute stops it before Node starts.
const module = path.join(root, '.project-os/companion/tools/runtime/core-arguments.mjs'), moduleBytes = await readFile(module);
await writeFile(module, Buffer.concat([moduleBytes, Buffer.from('\n// edited after activation\n')]));
await assert.rejects(runLauncher(['status']), e => /Una entrada local cambi/.test(e.stderr ?? e.message));
await writeFile(module, moduleBytes);
assert.equal(JSON.parse((await runLauncher(['status'])).stdout).files, 'IN_SYNC');
const version = await invoke(['openspec', '--version']); assert.equal(version.stdout.trim(), '1.6.0');
const sync = JSON.parse((await invoke(['project-os', 'sync', '--check', '--json'])).stdout); assert.equal(sync.status, 'IN_SYNC');
// Commands are restricted to the selected toolchain even if another valid-looking selection is added.
const configPath = path.join(root, '.project-constructor/config.json'), configBytes = await readFile(configPath), config = JSON.parse(configBytes);
config.toolchainRoot = 'unreviewed'; await writeFile(configPath, JSON.stringify(config));
await assert.rejects(invoke(['openspec','--version']), e => e.code === 'PROCESS_FAILED' && e.details.stderr.includes('TOOLS_CHANGED'));
await writeFile(configPath, configBytes);
// Moving the prepared folder keeps the bytes but invalidates every reviewed absolute path.
const moved = path.join(path.dirname(root), path.basename(root) + '-moved');
await rename(root, moved);
const movedHome = path.join(moved, '.project-os', 'companion', 'qa-home');
const movedInvoke = args => runFixedProcess({ executable: tools.node.entry, args: [path.join(moved, '.project-os/companion/tools/runtime/agent-entry.mjs'), ...args], cwd: movedHome,
  env: isolatedEnvironment({ home: movedHome, pathEntries: [path.dirname(tools.node.entry), path.dirname(tools.git.entry)] }), timeoutMs: 180000, maxOutputBytes: 1024 * 1024 });
await assert.rejects(movedInvoke(['status']), e => e.code === 'PROCESS_FAILED' && e.details.stderr.includes('TOOLS_MOVED'));
const relocated = await createEnvironmentEngine(manager).verify(moved);
assert.equal(relocated.status, 'requires-action'); assert.equal(relocated.code, 'ENVIRONMENT_MOVED');
assert.equal(await readFile(path.join(moved, 'package.json'), 'utf8'), product);
// Returning the folder to its reviewed location restores readiness without repreparing anything.
await rename(moved, root);
assert.equal((await createEnvironmentEngine(manager).verify(root)).status, 'prepared');
assert.equal(JSON.parse((await invoke(['status'])).stdout).workflows, 'PASS');
const evidence = { date: new Date().toISOString(), status: 'PASS', root, result, reopened: current, agentStatus: status, openspecVersion: version.stdout.trim(),
  persistentCoreCheck: sync.status, changedToolchainSelectionRejected: true, productManifestPreserved: true, elapsedMs: Math.round(performance.now() - started),
  movedFolderRequiresReview: { entry: 'TOOLS_MOVED', app: relocated.code }, restoredLocationStillReady: true,
  powershellLauncher: { status: launched.files, workflows: launched.workflows, editedModuleRejected: true },
  scope: 'Real managed tools, official OpenSpec, activation/reopen, relocation refusal, the generated PowerShell launcher and project-local child process entry points. No Companion UI/installer or model benchmark.' };
await writeFile(output, JSON.stringify(evidence, null, 2) + '\n'); console.log(JSON.stringify({ status: evidence.status, result, output }));
