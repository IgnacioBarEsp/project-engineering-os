import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, writeFile, realpath, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { createLocalAppLauncher } from '../desktop/local-apps.mjs';
import { portable } from './portable-path.mjs';
import { digest as hash, responseSchema, renderLines, renderPrompt, scoreResponse, parseTransport, summarize } from './model-benchmark.mjs';

// Optional acceptance experiment, never called by the application or CI. Uses an existing Codex
// account only when explicitly invoked with its executable. Codex owns authentication; this script
// never reads credentials. No model or inference engine is installed and no desktop app is opened.
// node scripts/verify-model-benchmark.mjs <installed resources/app> <output> <absolute codex.exe>
const [installedRoot, destination, executable] = process.argv.slice(2);
assert(installedRoot && destination && executable && path.isAbsolute(executable), 'Supply installed app, output and an absolute reviewed Codex executable.');
const output=path.resolve(destination);await mkdir(output,{recursive:true});
assert(!(await readdir(output)).some(name=>/^(protocol|model-benchmark|run-\d+-)/.test(name)), 'Existing experiment evidence must not be overwritten. Choose a new attempt directory.');
const exec=promisify(execFile);
const launcher=createLocalAppLauncher();
const reviewed=await launcher.detect('codex');
assert(reviewed && !reviewed.unverified && path.resolve(reviewed.executable).toLowerCase()===path.resolve(executable).toLowerCase(), 'Executable must match the known installed, regular, signed OpenAI CLI.');
const model='gpt-5.5';
const subjects=[
  {profile:'research',file:'investigacion.md',lines:['# Ensayo ficticio Lirio','El grupo de control incluye 47 participantes.','La medicion ocurre cada nueve dias.'],query:'participantes',question:'¿Cuantas personas incluye el grupo de control?',answer:'47',unknown:'¿Quien financia el ensayo?',unknownQuery:'financiador'},
  {profile:'software',file:'software.md',lines:['# Servicio ficticio Bruma','El limite de reintentos es 7.','El identificador de cada operacion se conserva durante 13 dias.'],query:'reintentos',question:'¿Cual es el limite de reintentos?',answer:'7',unknown:'¿Cual es la latencia p99 del servicio?',unknownQuery:'latencia'},
  {profile:'unity',file:'videojuego.md',lines:['# Juego ficticio Isleta','La velocidad maxima del personaje es 11 metros por segundo.','El salto se activa con la tecla J.'],query:'velocidad',question:'¿Cual es la velocidad maxima del personaje en metros por segundo?',answer:'11',unknown:'¿Que valor tiene la gravedad del mundo?',unknownQuery:'gravedad'},
  {profile:'creative',file:'creacion.md',lines:['# Cortometraje ficticio Cobre','La entrega usa 23 fotogramas por segundo.','La mezcla final tiene dos canales.'],query:'fotogramas',question:'¿Cuantos fotogramas por segundo usa la entrega?',answer:'23',unknown:'¿Que semilla se uso para generar imagenes?',unknownQuery:'semilla'},
  {profile:'general',file:'trabajo.md',lines:['# Encargo ficticio Nube','La tarifa acordada es 37 unidades por hora.','La entrega se revisa el tercer lunes del mes.'],query:'tarifa',question:'¿Cuantas unidades por hora son la tarifa acordada?',answer:'37',unknown:'¿Que porcentaje de impuestos se aplica?',unknownQuery:'impuestos'},
];
// Non-answer background prevents a vacuous one-line corpus. No hidden format disadvantage: the full
// baseline gets all human-readable text with line locators, including everything the retriever sees.
const corpus=Object.fromEntries(subjects.map(s=>[s.file,[...s.lines,...Array.from({length:18},(_,i)=>`Registro auxiliar ${i+1}: revision de coherencia del material ficticio ${s.profile}.`)].join('\n')+'\n']));
const questions=subjects.flatMap(s=>[
  {id:`${s.profile}-known`,profile:s.profile,question:s.question,query:s.query,expected:s.answer,source:s.file,quote:s.lines[1],line:2},
  {id:`${s.profile}-unknown`,profile:s.profile,question:s.unknown,query:s.unknownQuery,expected:null,source:null,quote:null,line:null},
]).map((q,i)=>({...q,id:`q${String(i+1).padStart(2,'0')}`}));
const temp=await realpath(await mkdtemp(path.join(tmpdir(),'companion-inference-')));
const root=path.join(temp,'corpus'),sandbox=path.join(temp,'inference');await mkdir(root);await mkdir(sandbox);
const repo=fileURLToPath(new URL('../../../',import.meta.url));
const anchors=[['<experiment>',temp],['<repo>',repo],['<installed-app>',installedRoot]];
const writeRecord=(file,value)=>writeFile(path.join(output,file),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
for(const [name,text]of Object.entries(corpus))await writeFile(path.join(root,name),text);
const load=relative=>import(pathToFileURL(path.join(installedRoot,relative)).href);
const core=await load('node_modules/create-project-engineering-os/src/index.mjs');
const {createDesktopService}=await load('desktop/service.mjs');
const service=await createDesktopService({dataRoot:path.join(temp,'history'),core,chooseFolder:async()=>root,copyText:()=>{},openExternal:()=>{}});
const project=await service.chooseFolder(),started=performance.now();
const base=await service.previewBase({id:project.id,selection:{name:'Corpus sintetico pareado',role:'researcher',goal:'Responder con citas y abstenerse cuando no haya respaldo',profile:'research',experience:'guided',agents:['web']}});
await service.applyBase({plan:base.id});const context=await service.previewContext({id:project.id});await service.applyContext({plan:context.id});
const preparationMs=performance.now()-started;
async function treeBytes(directory){let bytes=0;for(const item of await readdir(directory,{withFileTypes:true})){const next=path.join(directory,item.name);bytes+=item.isDirectory()?await treeBytes(next):(await stat(next)).size;}return bytes;}
const preparationBytes=await treeBytes(path.join(root,'.project-os'));
const full=renderLines(Object.entries(corpus).flatMap(([file,text])=>text.trimEnd().split('\n').map((text,i)=>({file,line:i+1,text}))));
const retrieved=new Map();const searches=[];
for(const q of questions){const before=performance.now(),result=await service.search({id:project.id,query:q.query});
  searches.push({id:q.id,elapsedMs:performance.now()-before,hits:result.hits});
  for(const hit of result.hits??[]){assert.equal(hit.kind,'line','This plain text fixture must return line locators');
    hit.text.split('\n').forEach((text,i)=>{const line=hit.start+i;assert.equal(corpus[hit.path]?.split('\n')[line-1],text,'Retrieved citation must resolve to the original text');retrieved.set(`${hit.path}:${line}`,{file:hit.path,line,text});});}}
const prepared=renderLines(retrieved.values());
const prompts={full:renderPrompt(questions,full),prepared:renderPrompt(questions,prepared)};
const schemaFile=path.join(sandbox,'schema.json');await writeFile(schemaFile,JSON.stringify(responseSchema));
const identity={model,reasoningEffort:'low',temperature:null,temperatureNote:'No expuesto por Codex exec; mismo valor predeterminado en ambas condiciones.',outputBudget:null,outputBudgetNote:'No expuesto; mismo esquema, instrucciones y timeout de 180 segundos por lote.',cliVersion:(await exec(executable,['--version'],{windowsHide:true,shell:false})).stdout.trim(),cliSha256:hash(await readFile(executable)),cli:portable(executable,anchors),publisher:reviewed.files[0].publisher,signature:'Valid',application:{root:portable(installedRoot,anchors),version:JSON.parse(await readFile(path.join(installedRoot,'package.json'),'utf8')).version,core:JSON.parse(await readFile(path.join(installedRoot,'node_modules/create-project-engineering-os/package.json'),'utf8')).version},source:{commit:(await exec('git',['rev-parse','HEAD'],{cwd:repo,windowsHide:true})).stdout.trim(),runnerSha256:hash(await readFile(fileURLToPath(import.meta.url))),rubricSha256:hash(await readFile(fileURLToPath(new URL('./model-benchmark.mjs',import.meta.url))))}};
identity.application.modules={};
for(const name of ['desktop/service.mjs','context/engine.mjs','context/retrieval.mjs','context/sources.mjs']){
  identity.application.modules[name]=hash(await readFile(path.join(installedRoot,name)));
}
const protocol={version:2,frozenAt:new Date().toISOString(),identity,questions,
  corpus:Object.fromEntries(Object.entries(corpus).map(([file,text])=>[file,{sha256:hash(text),bytes:Buffer.byteLength(text),text}])),
  prompts,promptHashes:Object.fromEntries(Object.entries(prompts).map(([k,v])=>[k,hash(v)])),responseSchema,
  rubric:{answer:'Exact numeric string, without normalization; units or extra prose are incorrect.',citation:'Exact source:Lline and exact quote, checked against original corpus.',order:'Match by opaque id; order has no score. Missing/duplicate/unknown ids or schema violations invalidate the trial.',abstention:'For unanswerable questions, abstain=true and answer/citation/quote all empty.',toolUse:'Any item type except reasoning or agent_message invalidates the trial; raw response and usage retained.',failure:'No retry; failed trials retained and excluded from quality/latency summaries, separately counted.'},
  preparation:{elapsedMs:preparationMs,bytesWritten:preparationBytes},searches,
  contextBytes:{full:Buffer.byteLength(full),prepared:Buffer.byteLength(prepared)},order:['full','prepared','prepared','full','full','prepared']};
await writeRecord('protocol.json',protocol);
const runs=[];
for(const [i,condition]of ['full','prepared','prepared','full','full','prepared'].entries()){
  const answerFile=path.join(sandbox,`answer-${i}.json`),beganAt=new Date().toISOString(),t0=performance.now();
  const args=['exec','--ignore-user-config','--ephemeral','--sandbox','read-only','--skip-git-repo-check','--cd',sandbox,'--model',model,'-c','model_reasoning_effort="low"','-c','web_search="disabled"','--output-schema',schemaFile,'--output-last-message',answerFile,'--json','-'];
  console.log(`Running ${i+1}/6: ${condition}`);
  // Resolve on process failure too: discard neither transport nor partial answers. The callback's
  // Error.message may embed absolute paths and stderr, so public errors are structured codes only.
  const result=await new Promise(resolve=>{const child=execFile(executable,args,{windowsHide:true,shell:false,timeout:180000,maxBuffer:4*1024*1024},(error,stdout,stderr)=>resolve({error,stdout,stderr}));child.stdin.on('error',()=>{});child.stdin.end(prompts[condition]);});
  const elapsedMs=performance.now()-t0;
  await writeFile(path.join(sandbox,`transport-${i+1}.json`),JSON.stringify({stdout:result.stdout,stderr:result.stderr}));
  const transport=parseTransport(result.stdout),errors=[...transport.errors];
  if(result.error)errors.push(`CLI failure: ${result.error.killed?'timeout':result.error.code??'unknown'}`);
  const rawResponse=await readFile(answerFile,'utf8').catch(()=>null);
  let response=null;try{response=JSON.parse(rawResponse);}catch{errors.push('Response is not valid JSON');}
  const evaluated=scoreResponse(response,questions);errors.push(...evaluated.errors);
  const scores=errors.length?[]:evaluated.scores,valid=errors.length===0;
  const usage=transport.usageEvents.length===1?transport.usageEvents[0].usage:null;
  const run={order:i+1,repetition:Math.floor(i/2)+1,condition,beganAt,elapsedMs,promptSha256:protocol.promptHashes[condition],
    contextBytes:protocol.contextBytes[condition],valid,usage,usageEvents:transport.usageEvents,
    rawResponse,response,assistantMessages:transport.assistantMessages,itemTypes:transport.itemTypes,
    scores,failures:errors,localTransport:portable(path.join(sandbox,`transport-${i+1}.json`),anchors),
    transportSha256:hash(result.stdout),stderrSha256:hash(result.stderr)};runs.push(run);
  // Synthetic answers are retained verbatim; refuse unexpected private material before publication.
  const publicText=JSON.stringify(run);
  assert(!/(?:[A-Za-z]:[\\/]|sk-[A-Za-z0-9_-]{16,}|Bearer\s+[A-Za-z0-9_.-]{16,}|"(?:thread_id|session_id|account_id)"\s*:)/.test(publicText),'Private data detected; raw evidence kept locally, public write refused');
  await writeRecord(`run-${i+1}-${condition}.json`,run);
  console.log(JSON.stringify({order:i+1,condition,valid,usage,failures:errors,groundedCorrect:scores.filter(s=>s.groundedCorrect).length,appropriateAbstentions:scores.filter(s=>s.appropriateAbstention).length}));
}
const report={protocolVersion:2,date:new Date().toISOString(),identity,protocolSha256:hash(await readFile(path.join(output,'protocol.json'))),preparation:protocol.preparation,contextBytes:protocol.contextBytes,methods:['full','prepared'].map(condition=>summarize(runs,condition)),limits:['Corpus sintetico pequeno; no demuestra resultados generales ni comodidad humana.','Cinco temas de perfil usan el mismo recuperador documental; no se mide aqui la modificacion de codigo ni generacion multimedia.','La rubrica mecanica valida valores, citas y abstenciones; no sustituye una evaluacion experta de prosa.','Modelo solicitado por alias del servicio, no por un snapshot inmutable; el transporte no devuelve identidad efectiva del modelo.','Cache de proveedor no controlable; se conserva su contador por ejecucion y no se declara cache fria.','Orden alternado, misma cuenta, mismo modelo solicitado, mismo esquema y parametros expuestos.','Los tokens de entrada incluyen instrucciones del CLI: no equivalen exclusivamente al contexto del proyecto.','Consultas lexicales escritas antes de inferir; la seleccion autonoma de consultas por una persona o un agente no se evalua.'],runs};
await writeRecord('model-benchmark.json',report);
assert(runs.every(r=>r.valid),'At least one inference trial failed; retained in evidence.');
console.log(JSON.stringify(report.methods,null,2));
// Keep the experiment fixture for independent inspection; it contains only synthetic material.
