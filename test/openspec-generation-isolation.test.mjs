import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import { cp, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {runOpenSpec} from '../blueprint/core/project-constructor/openspec.mjs';

test('wrapper executes through a symlinked project path such as macOS /var', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-wrapper-link-'));
  try {
    const actual = path.join(root, 'actual');
    const alias = path.join(root, 'alias');
    await mkdir(path.join(actual, '.project-constructor'), { recursive: true });
    await mkdir(path.join(actual, 'node_modules/@fission-ai/openspec/bin'), { recursive: true });
    await cp(new URL('../blueprint/core/project-constructor/openspec.mjs', import.meta.url), path.join(actual, '.project-constructor/openspec.mjs'));
    await cp(new URL('../blueprint/core/project-constructor/toolchain.mjs', import.meta.url), path.join(actual, '.project-constructor/toolchain.mjs'));
    await writeFile(path.join(actual, 'package.json'), JSON.stringify({devDependencies:{'@fission-ai/openspec':'1.6.0'}}));
    await writeFile(path.join(actual, 'package-lock.json'), JSON.stringify({packages:{'node_modules/@fission-ai/openspec':{version:'1.6.0'}}}));
    await writeFile(path.join(actual, 'node_modules/@fission-ai/openspec/package.json'), JSON.stringify({name:'@fission-ai/openspec',version:'1.6.0'}));
    await writeFile(path.join(actual, 'node_modules/@fission-ai/openspec/bin/openspec.js'), 'console.log("local-openspec-executed");');
    await symlink(actual, alias, process.platform === 'win32' ? 'junction' : 'dir');
    const result = spawnSync(process.execPath, [path.join(alias, '.project-constructor/openspec.mjs'), '--version'], { encoding: 'utf8', windowsHide: true });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'local-openspec-executed');
  } finally {
    if (path.dirname(path.resolve(root)) === path.resolve(tmpdir())) await rm(root, { recursive: true, force: true });
  }
});

test('init/update isolate host settings and clean only their temporary output', () => {
  for(const command of ['init','update']) {
    const environment={CODEX_HOME:'host-codex',XDG_CONFIG_HOME:'host-config',OPENSPEC_TELEMETRY:'1'};
    const before={...environment};let temporary;
    assert.equal(runOpenSpec([command],{binary:'openspec.js',environment,exists:()=>true,
      spawn:(_node,args,options)=>{
        assert.deepEqual(args,['openspec.js',command]);
        assert.notEqual(options.env.CODEX_HOME,environment.CODEX_HOME);
        temporary=path.dirname(options.env.CODEX_HOME);
        assert.ok(existsSync(temporary));
        assert.equal(existsSync(path.join(options.env.XDG_CONFIG_HOME,'openspec/config.json')),false);
        assert.equal(options.env.OPENSPEC_TELEMETRY,'1');
        return {status:0};
      }}),0);
    assert.deepEqual(environment,before);assert.equal(existsSync(temporary),false);
  }
});

test('read-only OpenSpec commands preserve host config and perform no generation isolation', () => {
  const environment={CODEX_HOME:'host-codex',XDG_CONFIG_HOME:'host-config'};
  assert.equal(runOpenSpec(['validate','--all'],{binary:'openspec.js',environment,exists:()=>true,
    spawn:(_node,_args,{env})=>{assert.deepEqual(env,{...environment,OPENSPEC_TELEMETRY:'0'});return {status:0};}}),0);
});
