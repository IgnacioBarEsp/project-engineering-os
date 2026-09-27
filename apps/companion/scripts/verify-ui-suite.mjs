import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// npm forwards arguments only to the last command of a shell && chain. Both suites
// must publish their raw matrix into the same requested evidence directory.
for(const script of ['verify-wizard-flow.mjs','verify-ui.mjs']){
  const result=spawnSync(process.execPath,[fileURLToPath(new URL(script,import.meta.url)),...process.argv.slice(2)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}
