import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {MUTATIONS,TARGET_PATHS,SUITE_PATHS,validateMutationTargets,inspectTestResult,detectedByBehavior}
  from './service-mutation-cases.mjs';

// Run only in an owned disposable source copy. Mutants are restored after each
// case and in finally; setup/parse/timeout failures never count as detections.
const output=process.argv[2]??path.join(tmpdir(),'project-os-closeout','companion-service-mutations');
await mkdir(output,{recursive:true});
const companion=fileURLToPath(new URL('../',import.meta.url));
const targets=Object.fromEntries(Object.entries(TARGET_PATHS).map(([id,p])=>[id,path.join(companion,p)]));
const originals={};
for(const [id,file]of Object.entries(targets))originals[id]=await readFile(file,'utf8');
const sha=text=>createHash('sha256').update(text).digest('hex');
const record={date:new Date().toISOString(),targets:TARGET_PATHS,
  inputHashes:Object.fromEntries(Object.entries(originals).map(([id,bytes])=>[id,sha(bytes)])),
  note:'La detección se atribuye a una prueba de comportamiento del baseline válido, no al exit code.',
  baselines:[],mutations:[]};
const touched=new Set(),baselines=new Map();
function run(suite) {
  const started=new Date().toISOString();
  const result=spawnSync(process.execPath,['--test','--test-reporter=spec',suite],
    {cwd:companion,encoding:'utf8',windowsHide:true,env:{...process.env,FORCE_COLOR:'0'}});
  const raw={started,finished:new Date().toISOString(),status:result.status,signal:result.signal,
    error:result.error?.message??null,stdout:result.stdout??'',stderr:result.stderr??''};
  return {...raw,...inspectTestResult(raw)};
}
try {
  // Preflight the entire declared set before touching a source or running a suite.
  record.preflight=validateMutationTargets(MUTATIONS,originals);
  for(const suite of new Set(Object.values(SUITE_PATHS))) {
    const baseline=run(suite);record.baselines.push({suite,...baseline});baselines.set(suite,baseline);
    assert.equal(baseline.status,0,`${suite} tiene que pasar sin mutar.`);
    assert.ok(!baseline.setupFailure&&baseline.passed.length,`${suite}: baseline incompleto o ilegible.`);
  }
  for(const mutation of MUTATIONS) {
    const target=mutation.file??'service',file=targets[target],original=originals[target];
    assert.equal(await readFile(file,'utf8'),original,`Drift antes de ${mutation.id}`);
    validateMutationTargets([mutation],{[target]:original});
    try {
      touched.add(file);await writeFile(file,original.replace(mutation.from,mutation.to));
      const result=run(SUITE_PATHS[target]),detected=detectedByBehavior(result,baselines.get(SUITE_PATHS[target]));
      record.mutations.push({id:mutation.id,target,reason:mutation.reason,detected,
        caughtBy:detected?result.failed:[],by:detected?null:result.setupFailure?'setup, parse, cancelación o timeout'
          :result.failed.length?'fallo fuera del baseline':'ninguna prueba de comportamiento falló',...result});
    } finally {
      await writeFile(file,original);
      assert.equal(await readFile(file,'utf8'),original,`Restauración de ${mutation.id}`);
    }
  }
} catch(error) {record.error={message:error.message,stack:error.stack};}
finally {
  const restoreErrors=[];
  for(const file of touched) {
    const id=Object.keys(targets).find(id=>targets[id]===file);
    try {if(await readFile(file,'utf8')!==originals[id])await writeFile(file,originals[id]);}
    catch(error){restoreErrors.push({file,message:error.message});}
  }
  if(restoreErrors.length)record.restoreErrors=restoreErrors;
}
record.outputHashes=Object.fromEntries(await Promise.all(Object.entries(targets).map(async([id,file])=>
  [id,await readFile(file,'utf8').then(sha,()=>null)])));
record.restored=Object.keys(originals).every(id=>record.outputHashes[id]===record.inputHashes[id]);
record.summary={declared:MUTATIONS.length,mutations:record.mutations.length,
  detected:record.mutations.filter(x=>x.detected).length,restored:record.restored,
  completed:!record.error&&record.mutations.length===MUTATIONS.length};
await writeFile(path.join(output,'service-mutations.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify(record.summary,null,2));
if(!record.summary.completed||!record.restored||record.summary.detected!==MUTATIONS.length) {
  console.error(JSON.stringify({error:record.error,missed:record.mutations.filter(x=>!x.detected).map(x=>({id:x.id,by:x.by})),
    restoreErrors:record.restoreErrors},null,2));process.exitCode=1;
}
