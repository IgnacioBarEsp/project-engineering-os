import { open, unlink, rename, lstat, mkdir, readdir, opendir, cp } from 'node:fs/promises';
import path from 'node:path';
import { NPM_DISTRIBUTIONS, RUNTIME_CATALOG, RUNTIME_PLATFORM } from './catalog.mjs';
import { assertPath, canonicalFolder, snapshot, writeChecked, hash, json, fail, NAMESPACE } from '../engine/files.mjs';
import { inspectTree } from './tree.mjs';

export const NPM_SELECTION = 'npm-selection.json';
export const NPM_OPERATION = 'npm-operation.json';
const LOCK = `${NAMESPACE}/write.lock`, LIMIT = 65536;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(value);
function keys(value, expected, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).sort().join('|') !== [...expected].sort().join('|')) fail(code, 'El registro de distribución no tiene el esquema esperado.');
}
export function distributionIdentity(value) {
  keys(value, ['channel', 'version', 'source', 'treeHash', 'recipeHash'], 'NPM_IDENTITY');
  if (!['official', 'derived'].includes(value.channel) || !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(value.version ?? '')
      || value.version.length > 32 || typeof value.source !== 'string' || value.source.length > 2048
      || !digest(value.treeHash) || (value.channel === 'official' ? value.recipeHash !== null : !digest(value.recipeHash))) fail('NPM_IDENTITY', 'La identidad de distribución no es válida.');
  let source; try { source = new URL(value.source); } catch { fail('NPM_IDENTITY', 'La fuente de distribución no es válida.'); }
  if (source.protocol !== 'https:' || source.username || source.password || source.hash || source.search) fail('NPM_IDENTITY', 'La fuente de distribución no es válida.');
  return Object.freeze({ channel: value.channel, version: value.version, source: value.source, treeHash: value.treeHash, recipeHash: value.recipeHash });
}
export const identityOf = tool => distributionIdentity(Object.fromEntries(['channel','version','source','treeHash','recipeHash'].map(key => [key, tool[key]])));
export const distributionKey = identity => hash(json(distributionIdentity(identity)));
export const distributionSlot = identity => { const value = distributionIdentity(identity); return `npm-${value.version}-${distributionKey(value)}`; };
export function npmDistribution(key) {
  if (!digest(key)) fail('NPM_UNKNOWN', 'Esta distribución no está en el catálogo revisado.');
  const tool = NPM_DISTRIBUTIONS.find(value => distributionKey(identityOf(value)) === key);
  if (!tool) fail('NPM_UNKNOWN', 'Esta distribución no está en el catálogo revisado.');
  return tool;
}
export const defaultNpmKey = () => distributionKey(identityOf(RUNTIME_CATALOG.npm));
// This input exception belongs only to the separately reviewed 11.21.2 distribution. A future
// catalog entry must not inherit it merely by becoming the default.
const DEVELOPMENT_KEY = 'eac8d0556bad1da3835d0fd1376c546ce5840bc9191b5e92cd5ef1da02a0e835';
const DEVELOPMENT_FILES = 1944, DEVELOPMENT_BYTES = 12296462;
const AUXILIARIES = Object.freeze(['arborist','cssesc','installed-package-contents','node-gyp','node-which','nopt','pacote','qrcode-terminal','semver']
  .flatMap(name => ['', '.cmd', '.ps1'].map(extension => `node_modules/.bin/${name}${extension}`)).sort());
const treeSummary = tree => ({ files:tree.files.length, bytes:tree.bytes, sha256:tree.sha256 });
function developmentPin() {
  const tool = npmDistribution(DEVELOPMENT_KEY);
  if (defaultNpmKey() !== DEVELOPMENT_KEY || tool.installedBytes !== DEVELOPMENT_BYTES) fail('NPM_SOURCE', 'Este origen de desarrollo necesita otra revisión.');
  return tool;
}
function auxiliaryRecords(files) {
  if (!Array.isArray(files) || ![0,AUXILIARIES.length].includes(files.length)) fail('NPM_SOURCE', 'El conjunto de auxiliares no coincide con la revisión.');
  files.forEach((file,i) => {
    keys(file,['path','bytes','sha256'],'NPM_SOURCE');
    if (file.path !== AUXILIARIES[i] || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || file.bytes > 16384 || !digest(file.sha256)) fail('NPM_SOURCE','Un auxiliar no corresponde al inventario permitido.');
  });
}
export function checkNpmDevelopmentInventory(record, tree) {
  const tool = developmentPin();
  keys(record,['format','input','canonical','excluded'],'NPM_SOURCE');
  keys(record.input,['files','bytes','sha256'],'NPM_SOURCE');
  keys(record.canonical,['files','bytes','sha256'],'NPM_SOURCE');
  auxiliaryRecords(record.excluded);
  if (record.format !== 1 || tree.files.length !== DEVELOPMENT_FILES || tree.bytes !== DEVELOPMENT_BYTES || tree.sha256 !== tool.treeHash
      || json(record.canonical) !== json(treeSummary(tree))) fail('RUNTIME_INTEGRITY','La copia de npm no coincide con el árbol oficial.');
  const files = [...tree.files,...record.excluded].sort((a,b)=>a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const expected = {files:files.length,bytes:files.reduce((sum,file)=>sum+file.bytes,0),sha256:hash(JSON.stringify(files)+'\n')};
  if (json(record.input) !== json(expected)) fail('NPM_SOURCE','La cobertura del origen de npm no coincide.');
}
async function inspectDevelopmentSource(source, signal) {
  const tool = developmentPin(), bin = await assertPath(source,'node_modules/.bin');
  const info = await lstat(bin).catch(error=>{if(error.code!=='ENOENT')throw error;return null;});
  if (info) {
    if (!info.isDirectory() || info.isSymbolicLink()) fail('NPM_SOURCE','La carpeta de auxiliares no es válida.');
    let count = 0;
    for await (const {name} of await opendir(bin)) {
      signal?.throwIfAborted();
      if (++count > AUXILIARIES.length) fail('NPM_SOURCE','El conjunto de auxiliares supera el límite.');
      const relative=`node_modules/.bin/${name}`;
      if (!AUXILIARIES.includes(relative)) fail('NPM_SOURCE','El origen contiene un auxiliar desconocido.');
      const entry = await lstat(await assertPath(source,relative));
      if (!entry.isFile() || entry.isSymbolicLink() || entry.nlink !== 1 || entry.size > 16384) fail('NPM_SOURCE','Un auxiliar tiene un tipo o tamaño no permitido.');
    }
    if (![0,AUXILIARIES.length].includes(count)) fail('NPM_SOURCE','El conjunto de auxiliares está incompleto.');
  }
  const input = await inspectTree(source,{signal,maxFiles:DEVELOPMENT_FILES+AUXILIARIES.length,maxBytes:DEVELOPMENT_BYTES+AUXILIARIES.length*16384});
  const excluded = input.files.filter(file=>AUXILIARIES.includes(file.path));
  auxiliaryRecords(excluded);
  const files = input.files.filter(file=>!AUXILIARIES.includes(file.path));
  const canonical = {files,bytes:files.reduce((sum,file)=>sum+file.bytes,0),sha256:hash(JSON.stringify(files)+'\n')};
  const record = {format:1,input:treeSummary(input),canonical:treeSummary(canonical),excluded};
  checkNpmDevelopmentInventory(record,canonical);
  if (canonical.sha256 !== tool.treeHash) fail('RUNTIME_INTEGRITY','El origen de npm cambió.');
  return {record,files};
}
export async function prepareNpmDevelopmentSource(input, destination, {signal} = {}) {
  signal?.throwIfAborted();
  // Resolve only after rejecting linked source ancestors. Never change the supplied origin.
  const source = await canonicalFolder(input), parent = await canonicalFolder(path.dirname(destination));
  const target = await assertPath(parent,path.basename(destination));
  const comparable = value => process.platform==='win32' ? value.toLowerCase() : value;
  const nested = (a,b) => {const relative=path.relative(comparable(a),comparable(b));return !relative || (!relative.startsWith('..'+path.sep) && relative!=='..' && !path.isAbsolute(relative));};
  if (nested(source,target) || nested(target,source)) fail('NPM_SOURCE','Origen y copia deben ser independientes.');
  const before = await inspectDevelopmentSource(source,signal);
  signal?.throwIfAborted();
  await mkdir(target); // Exclusive ownership; an existing target or another copier fails closed.
  const paths = new Set(['']);
  for (const file of before.files) {
    const segments=file.path.split('/');
    for(let i=1;i<=segments.length;i++)paths.add(segments.slice(0,i).join('/'));
  }
  // The complete prechecked inventory supplies both files and their ancestor directories. This
  // is not a generic .bin exclusion; no unreviewed path is ever selected for copying.
  for (const name of await readdir(source)) {
    signal?.throwIfAborted();
    if (paths.has(name)) await cp(path.join(source,name),path.join(target,name),{
      recursive:true,force:false,errorOnExist:true,verbatimSymlinks:true,
      filter:from=>{signal?.throwIfAborted();return paths.has(path.relative(source,from).split(path.sep).join('/'));}});
  }
  const tree = await inspectTree(await canonicalFolder(target),{signal,maxFiles:DEVELOPMENT_FILES,maxBytes:DEVELOPMENT_BYTES});
  checkNpmDevelopmentInventory(before.record,tree);
  const after = await inspectDevelopmentSource(source,signal);
  if (json(before.record) !== json(after.record)) fail('RUNTIME_CHANGED','El origen de npm cambió durante la copia.');
  signal?.throwIfAborted();
  return before.record;
}
function selectionValue(value) {
  keys(value, ['format','generation','active','previous'], 'NPM_SELECTION');
  if (value.format !== 1 || !Number.isSafeInteger(value.generation) || value.generation < 0 || value.generation >= Number.MAX_SAFE_INTEGER) fail('NPM_SELECTION', 'La generación de la selección no es válida.');
  npmDistribution(value.active); if (value.previous !== null) npmDistribution(value.previous);
  return value;
}
function parseCanonical(content, code) {
  if (typeof content !== 'string' && !Buffer.isBuffer(content)) fail(code, 'Falta el registro de distribución.');
  let value; try { value = JSON.parse(content); } catch { fail(code, 'El registro de distribución no se puede leer.'); }
  if (json(value) !== content.toString()) fail(code, 'El registro de distribución no es canónico.');
  return value;
}
export async function readNpmSelection(root) {
  const state = await snapshot(root, NPM_SELECTION, LIMIT);
  return { ...state, value: state.content ? selectionValue(parseCanonical(state.content, 'NPM_SELECTION'))
    : { format: 1, generation: 0, active: defaultNpmKey(), previous: null } };
}
export function nextNpmSelection(before, identity) {
  npmDistribution(identity);
  return selectionValue({ format: 1, generation: before.value.generation + 1, active: identity, previous: before.value.active });
}
export function npmReceipt(tool) {
  const identity = identityOf(tool);
  return { format: 2, id: 'npm', platform: RUNTIME_PLATFORM, identity, distribution: distributionKey(identity) };
}
export function checkNpmReceipt(content, tool) {
  const value = parseCanonical(content, 'NPM_RECEIPT');
  keys(value, ['format','id','platform','identity','distribution'], 'NPM_RECEIPT');
  distributionIdentity(value.identity); npmDistribution(value.distribution);
  if (json(value) !== json(npmReceipt(tool))) fail('NPM_RECEIPT', 'El registro no corresponde a la distribución revisada.');
}
export async function pendingNpmOperation(root) { return (await snapshot(root, NPM_OPERATION, LIMIT)).hash !== null; }
function beforeFromJournal(value) {
  keys(value, ['content','hash'], 'NPM_JOURNAL');
  if (value.content === null) { if (value.hash !== null) fail('NPM_JOURNAL', 'El estado anterior no coincide.'); return { hash: null, value: { format:1,generation:0,active:defaultNpmKey(),previous:null } }; }
  if (typeof value.content !== 'string' || !digest(value.hash) || hash(value.content) !== value.hash) fail('NPM_JOURNAL', 'El estado anterior no coincide.');
  return { hash: value.hash, value: selectionValue(parseCanonical(value.content, 'NPM_JOURNAL')) };
}
function journalValue(value, root) {
  keys(value, ['format','nonce','rootHash','kind','identity','lock','before','after','repairTree'], 'NPM_JOURNAL');
  keys(value.lock, ['pid','nonce','hash'], 'NPM_JOURNAL');
  if (value.format !== 1 || !uuid(value.nonce) || value.rootHash !== hash(root) || !['install','repair','select'].includes(value.kind)
      || !Number.isInteger(value.lock.pid) || value.lock.pid < 1 || value.lock.pid > 2147483647 || !uuid(value.lock.nonce) || !digest(value.lock.hash)
      || (value.kind === 'repair' ? !digest(value.repairTree) : value.repairTree !== null)) fail('NPM_JOURNAL', 'No se puede demostrar la operación de distribución.');
  npmDistribution(value.identity);
  const before = beforeFromJournal(value.before), expected = json(nextNpmSelection(before, value.identity));
  if (value.after !== expected) fail('NPM_JOURNAL', 'La transición no corresponde a la selección anterior.');
  return value;
}
export const operationPaths = value => ({ stage: `.npm-stage-${value.nonce}`, quarantine: `.npm-retained-${value.nonce}`, history: `npm-operation-${value.nonce}.json`, claim: `.npm-recovery-${value.nonce}.lock` });
export async function beginNpmOperation(root, kind, tool, before, repairTree = null) {
  if (await pendingNpmOperation(root)) fail('NPM_RECOVERY', 'Hay una operación de npm que requiere recuperación.');
  const lock = await snapshot(root, LOCK, 4096), owner = parseCanonical(lock.content, 'NPM_JOURNAL');
  keys(owner, ['pid','nonce'], 'NPM_JOURNAL');
  if (owner.pid !== process.pid || !uuid(owner.nonce)) fail('NPM_JOURNAL', 'La operación no posee el bloqueo.');
  const identity = distributionKey(identityOf(tool));
    const value = journalValue({ format:1,nonce:owner.nonce,rootHash:hash(root),kind,identity,
    lock:{...owner,hash:lock.hash},before:{content:before.content?.toString() ?? null,hash:before.hash},
    after:json(nextNpmSelection(before,identity)),repairTree }, root);
  const content = json(value); await writeChecked(root,NPM_OPERATION,content,null,LIMIT);
  if ((await snapshot(root,NPM_OPERATION,LIMIT)).hash !== hash(content)) fail('NPM_JOURNAL', 'No se confirmó el registro de recuperación.');
  return { value, hash:hash(content), ...operationPaths(value) };
}
export async function finishNpmOperation(root, operation) {
  if ((await snapshot(root,NPM_OPERATION,LIMIT)).hash !== operation.hash) fail('NPM_JOURNAL', 'El registro de recuperación cambió.');
  if ((await snapshot(root,LOCK,4096)).hash !== operation.value.lock.hash) fail('NPM_JOURNAL', 'El bloqueo de la operación cambió.');
  const destination = await assertPath(root,operation.history);
  if (await lstat(destination).catch(e=>{if(e.code!=='ENOENT')throw e;return null;})) fail('NPM_JOURNAL', 'Ya existe un registro de esta operación.');
  await rename(await assertPath(root,NPM_OPERATION),destination);
}
export async function commitNpmSelection(root, operation, signal, onProgress = () => {}) {
  signal?.throwIfAborted();
  if ((await snapshot(root,LOCK,4096)).hash !== operation.value.lock.hash) fail('NPM_JOURNAL', 'El bloqueo de npm cambió.');
  await writeChecked(root,NPM_SELECTION,operation.value.after,operation.value.before.hash,LIMIT);
  onProgress({stage:'npm-selection-written',label:'Confirmando la selección verificada'});
  signal?.throwIfAborted();
  if ((await snapshot(root,NPM_SELECTION,LIMIT)).hash !== hash(operation.value.after)) fail('NPM_SELECTION', 'La selección no confirmó sus bytes.');
}
export async function rollbackNpmSelection(root, operation) {
  const current = await snapshot(root,NPM_SELECTION,LIMIT), { before, after } = operation.value;
  if (current.hash === before.hash) return;
  if (current.hash !== hash(after)) fail('NPM_RECOVERY', 'La selección cambió fuera de la operación; se conserva para revisión.');
  await writeChecked(root,NPM_SELECTION,before.content,current.hash,LIMIT);
  if ((await snapshot(root,NPM_SELECTION,LIMIT)).hash !== before.hash) fail('NPM_RECOVERY', 'No se confirmó la recuperación de la selección.');
}
// This is operation ownership recovery, not PID-only lock stealing. The abandoned lock remains
// in place until artifacts + previous selection have been recovered. An interrupted recovery claim
// and a lock created before our journal remain fail-closed for manual review.
export async function recoverNpmOperation(root) {
  const lock = await snapshot(root,LOCK,4096);
  let record = await snapshot(root,NPM_OPERATION,LIMIT), recordPath=NPM_OPERATION, completed=false;
  if (!record.content) {
    if (!lock.content) return {status:'not-needed'};
    const owner=parseCanonical(lock.content,'NPM_RECOVERY');keys(owner,['pid','nonce'],'NPM_RECOVERY');
    if (!uuid(owner.nonce)) fail('NPM_RECOVERY','El bloqueo no tiene una identidad de operación válida.');
    // The immutable completed record is indexed by the exact global-lock nonce. This closes
    // the crash window after journal archival but before withLock releases its lock.
    recordPath=`npm-operation-${owner.nonce}.json`;record=await snapshot(root,recordPath,LIMIT);
    if (!record.content) return {status:'unowned-lock'};
    completed=true;
  }
  const value = journalValue(parseCanonical(record.content,'NPM_JOURNAL'),root), names = operationPaths(value);
  if(value.nonce!==value.lock.nonce)fail('NPM_RECOVERY','El registro no corresponde a la operación del bloqueo.');
  if (lock.hash !== value.lock.hash || lock.content?.toString() !== json({pid:value.lock.pid,nonce:value.lock.nonce})) fail('NPM_RECOVERY', 'El bloqueo no corresponde a la operación registrada.');
  try { process.kill(value.lock.pid,0); return {status:'busy'}; } catch (error) { if(error.code!=='ESRCH')throw error; }
  const claimPath = await assertPath(root,names.claim), claim = json({nonce:value.nonce,journal:record.hash});
  let handle; try { handle=await open(claimPath,'wx',0o600); } catch(error) { if(error.code==='EEXIST')fail('NPM_RECOVERY_CLAIM','Otra recuperación posee el registro; se conserva para revisión.');throw error; }
  try {
    await handle.writeFile(claim);await handle.sync();
    if ((await snapshot(root,recordPath,LIMIT)).hash !== record.hash || (await snapshot(root,LOCK,4096)).hash !== lock.hash
        || (completed && await pendingNpmOperation(root))) fail('NPM_RECOVERY','La propiedad de recuperación cambió.');
    const tool=npmDistribution(value.identity), slot=distributionSlot(identityOf(tool)), source=await assertPath(root,slot), quarantine=await assertPath(root,names.quarantine);
    const held=await lstat(quarantine).catch(e=>{if(e.code!=='ENOENT')throw e;return null;});
    if (held) {
      if(value.kind!=='repair' || (await inspectTree(await canonicalFolder(quarantine))).sha256!==value.repairTree) fail('NPM_RECOVERY','La cuarentena cambió; se conserva intacta.');
      checkNpmReceipt((await snapshot(root,`${names.quarantine}/receipt.json`,LIMIT)).content,tool);
      if(!await lstat(source).catch(e=>{if(e.code!=='ENOENT')throw e;return null;}))await rename(quarantine,source);
    }
    // An unpublished stage is retained, never guessed to be safe or recursively removed.
    await assertPath(root,names.stage);
    if(completed) {
      const selection=await readNpmSelection(root);
      if(selection.hash===hash(value.after)) {
        checkNpmReceipt((await snapshot(root,`${slot}/receipt.json`,LIMIT)).content,tool);
        const tree=await inspectTree(await canonicalFolder(await assertPath(root,`${slot}/payload`)));
        if(tree.sha256!==tool.treeHash||tree.bytes!==tool.installedBytes)fail('NPM_RECOVERY','La distribución confirmada cambió; se conserva para revisión.');
      } else if(selection.hash!==value.before.hash) fail('NPM_RECOVERY','La selección no coincide con la operación terminada.');
    } else {
      await rollbackNpmSelection(root,{value});
      await finishNpmOperation(root,{value,hash:record.hash,...names});
    }
    await writeChecked(root,LOCK,null,lock.hash,4096);
    return {status:'recovered',retainedStage:names.stage,retainedQuarantine:held?names.quarantine:null};
  } finally {
    await handle.close();
    if((await snapshot(root,names.claim,4096)).hash===hash(claim))await unlink(claimPath);
  }
}
