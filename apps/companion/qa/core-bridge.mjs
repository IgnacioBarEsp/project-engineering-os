import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, cp, rm, realpath, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createCoreBridge } from '../runtime/core-bridge.mjs';
import { isolatedEnvironment } from '../runtime/process.mjs';

test('real core bridge ignores cwd Git shadowing and never invokes repository clean filters during preparation', async t => {
  const workspace = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-core-boundary-')));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const root = path.join(workspace, 'project'), runtimeRoot = path.join(workspace, 'runtimes'), home = path.join(workspace, 'home');
  await mkdir(root); await mkdir(runtimeRoot); await mkdir(home);
  const node = await realpath(process.execPath);
  const locator = process.platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'where.exe') : '/usr/bin/which';
  const git = await realpath(execFileSync(locator, ['git'], { encoding: 'utf8', windowsHide: true }).trim().split(/\r?\n/)[0]);
  const env = isolatedEnvironment({ home, pathEntries: [path.dirname(node), path.dirname(git)] });
  // The host's trusted Git may itself use hardlinks. It only sets up this synthetic fixture;
  // app-installed runtime identity/regular-file enforcement has separate artifact coverage.
  const runGit = async args => execFileSync(git, args, { cwd: home, env, encoding: 'utf8', windowsHide: true });
  await runGit(['init', '-q', root]);
  await writeFile(path.join(root, 'tracked.txt'), 'Before\n'); await runGit(['-C', root, 'add', '--', 'tracked.txt']);
  await writeFile(path.join(root, '.gitattributes'), '*.txt filter=companionreview\n');
  const filter = path.join(root, 'filter-probe.cjs'), marker = path.join(root, 'filter-executed.txt');
  await writeFile(filter, `require('node:fs').writeFileSync(${JSON.stringify(marker)},'Executed');process.stdin.pipe(process.stdout);`);
  // Controlled fixture values: Git would interpret this filter if the core ran status.
  const command = `"${node.replaceAll('\\', '/')}" "${filter.replaceAll('\\', '/')}"`;
  await runGit(['-C', root, 'config', 'filter.companionreview.clean', command]);
  await runGit(['-C', root, 'config', 'filter.companionreview.required', 'true']);
  // Same size forces Git to inspect content; a size-only difference may bypass the filter.
  await writeFile(path.join(root, 'tracked.txt'), 'After!\n');
  await runGit(['-C', root, 'status', '--short', '--untracked-files=normal']);
  assert.equal(await readFile(marker, 'utf8'), 'Executed', 'positive control: ordinary status runs the clean filter');
  await rm(marker);
  if (process.platform === 'win32') await cp(node, path.join(root, 'git.exe'), { errorOnExist: true, force: false });
  const index = await readFile(path.join(root, '.git/index'));
  const bridge = createCoreBridge({ runtimeRoot, resolveEnvironment: async () => ({ node: { entry: node }, git: { entry: git },
    // Use the real public core installed by the app's pinned dependency lock. Windows runtime
    // artifact identity is covered separately; this test exercises the actual subprocess bridge.
    toolchain: { root: fileURLToPath(new URL('../', import.meta.url)) } }) });
  const plan = await bridge.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, dryRun: true });
  assert.equal(plan.status, 'DRIFT'); assert.equal(plan.mutationPerformed, false);
  await assert.rejects(access(marker), e => e.code === 'ENOENT');
  assert.deepEqual(await readFile(path.join(root, '.git/index')), index);
  assert.equal(await readFile(path.join(root, 'tracked.txt'), 'utf8'), 'After!\n');
});
