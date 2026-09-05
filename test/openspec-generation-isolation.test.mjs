import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {runOpenSpec} from '../blueprint/core/project-constructor/openspec.mjs';

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
