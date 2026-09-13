import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp,mkdir,writeFile,realpath,rm,symlink,link,stat } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { createLocalAppLauncher } from '../desktop/local-apps.mjs';

test('local app launch requires a reviewed regular signed executable and passes the selected folder literally',async t=>{
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-launch-')));t.after(()=>rm(root,{recursive:true,force:true}));
  const project=path.join(root,'project & literal'),executable=path.join(root,'app.exe'),desktop=path.join(root,'desktop.exe');
  await mkdir(project);await writeFile(executable,'signed fixture');await writeFile(desktop,'desktop fixture');
  const calls=[];let publisher='OpenAI OpCo, LLC',status='Valid',help='Usage: codex app [OPTIONS] [PATH]';
  const adapter=createLocalAppLauncher({discover:async()=>[{executable,desktop}],signature:async()=>({status,publisher}),help:async()=>help,launch:async(...args)=>calls.push(args)});
  const preview=await adapter.detect('codex');assert(preview);assert.equal(calls.length,0);
  const opened=await adapter.open(preview,project);assert.equal(opened.projectAttached,true);assert.equal(opened.agentReadProject,false);
  assert.deepEqual(calls[0],[executable,['app',project]]);
  await writeFile(executable,'modified after preview');await assert.rejects(adapter.open(preview,project),e=>e.code==='APP_CHANGED');assert.equal(calls.length,1);
  // Each refusal is reported rather than launched, and never becomes a usable candidate.
  const refuses=async()=>{const found=await adapter.detect('codex');assert.equal(found.unverified,true);
    await assert.rejects(adapter.open({...preview,files:found.files},project),e=>['APP_UNTRUSTED','APP_UNSUPPORTED'].includes(e.code));
    assert.equal(calls.length,1);};
  publisher='Untrusted Publisher';await refuses();
  publisher='OpenAI OpCo, LLC';status='NotSigned';await refuses();
  status='Valid';help='Some other interface';await refuses();
  help='Usage: codex app [OPTIONS] [PATH]';
  const link=path.join(root,'linked');await symlink(root,link,process.platform==='win32'?'junction':'dir');
  const linked=createLocalAppLauncher({discover:async()=>[{executable:path.join(link,'app.exe')}],signature:async()=>({status:'Valid',publisher:'Anysphere, Inc.'}),launch:async()=>assert.fail('must not launch')});
  assert.equal((await linked.detect('cursor')).unverified,true);await rm(link);
  for(const [agent,editor] of [['cursor','Anysphere, Inc.'],['github-copilot','Microsoft Corporation']]){
    publisher=editor;const checked=await adapter.detect(agent);assert(checked);
    await adapter.open(checked,project);assert.deepEqual(calls.at(-1),[executable,[project]]);
  }
  assert.equal(await adapter.detect('web'),null);
});

test('an installed application that cannot be verified is reported instead of silently downgraded', async t => {
  const signed = { status: 'Valid', publisher: 'Anysphere, Inc.' };
  const launcher = wrong => createLocalAppLauncher({ platform: 'win32',
    discover: async () => [{ executable: 'C:\Programs\cursor\Cursor.exe' }],
    inspectFile: async executable => ({ executable, sha256: 'a'.repeat(64) }),
    signature: async () => wrong, launch: async () => { throw new Error('must not launch'); } });
  const refused = await launcher({ status: 'Valid', publisher: 'Someone Else, Inc.' }).detect('cursor');
  assert.equal(refused.unverified, true); assert.equal(refused.code, 'APP_UNTRUSTED'); assert.equal(refused.label, 'Cursor');
  const unsigned = await launcher({ status: 'NotSigned', publisher: '' }).detect('cursor');
  assert.equal(unsigned.unverified, true);
  const accepted = await launcher(signed).detect('cursor');
  assert.equal(accepted.unverified, undefined); assert.equal(accepted.label, 'Cursor');
  // Nothing installed stays a plain absence, not a refusal.
  const absent = createLocalAppLauncher({ platform: 'win32', discover: async () => [], launch: async () => {} });
  assert.equal(await absent.detect('cursor'), null);
  assert.equal(await absent.detect('web'), null);
});

test('known installation locations distinguish absent executables from existing untrusted apps', async t => {
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-discovery-')));
  t.after(()=>rm(root,{recursive:true,force:true}));
  let signatures=0;
  const system={LOCALAPPDATA:root,ProgramFiles:path.join(root,'machine')};
  const launcher=createLocalAppLauncher({platform:'win32',system,
    signature:async()=>{signatures++;return {status:'NotSigned',publisher:''};},
    launch:async()=>assert.fail('discovery must not launch')});
  for(const agent of ['cursor','github-copilot'])assert.equal(await launcher.detect(agent),null);
  assert.equal(signatures,0,'nonexistent candidates never reach signature verification');
  const exe=path.join(root,'Programs','cursor','Cursor.exe');
  await mkdir(path.dirname(exe),{recursive:true});await writeFile(exe,'unsigned fixture');
  const found=await launcher.detect('cursor');
  assert.equal(found.unverified,true);assert.equal(found.code,'APP_UNTRUSTED');assert.equal(signatures,1);
  const inaccessible=createLocalAppLauncher({platform:'win32',system,
    inspectFile:async()=>{throw Object.assign(new Error('Access denied'),{code:'EACCES'});},
    launch:async()=>assert.fail('must not launch')});
  assert.equal((await inaccessible.detect('cursor')).code,'EACCES');
});

test('a recognised application with no verified folder contract is reported, never launched',async t=>{
  // Antigravity is on the maintainer's must-have list, and on the machine this was written for its
  // executable is not signed. Both facts have to reach the person without either one becoming a
  // promise: the application is recognised and reported, and it is not opened from here, because how
  // its build takes a folder has not been observed. A guess would be a fabricated capability.
  const root=await realpath(await mkdtemp(path.join(tmpdir(),'companion-antigravity-')));
  t.after(()=>rm(root,{recursive:true,force:true}));
  const executable=path.join(root,'Antigravity.exe'),project=path.join(root,'proyecto');
  await mkdir(project);await writeFile(executable,'antigravity fixture');
  let status='NotSigned',publisher='';
  const launched=[];
  const adapter=createLocalAppLauncher({discover:async()=>[{executable}],signature:async()=>({status,publisher}),
    launch:async(...args)=>launched.push(args)});

  // Unsigned, as installed here: present, and refused for the signature.
  const unsigned=await adapter.detect('antigravity');
  assert.equal(unsigned.unverified,true);assert.equal(unsigned.code,'APP_UNTRUSTED');
  assert.equal(unsigned.label,'Antigravity','La persona debe leer el nombre de la aplicación, no un identificador.');

  // Correctly signed by its publisher: still not opened, and the reason changes to say why.
  status='Valid';publisher='Google LLC';
  const signed=await adapter.detect('antigravity');
  assert.equal(signed.unverified,true);assert.equal(signed.code,'APP_UNSUPPORTED');
  assert.match(signed.message,/no declara cómo recibir una carpeta/);

  // Neither state may reach a launch, and a wrong publisher stays refused.
  await assert.rejects(adapter.open({agent:'antigravity',executable,files:[]},project),e=>e.code==='APP_UNSUPPORTED');
  publisher='Someone Else, Inc.';
  assert.equal((await adapter.detect('antigravity')).code,'APP_UNTRUSTED');
  assert.deepEqual(launched,[],'Ninguna de estas rutas puede abrir la aplicación.');
});

test('an application that declares how it takes a folder is opened through exactly what it declared', async t => {
  // Claude does not answer a help command — it forwards its arguments to the instance already running — so
  // the contract cannot be read the way Codex's is. What the installed build does declare is a route,
  // `claude://code/new?folder=`, built from a path it first confirms is a directory, and the system has that
  // scheme registered to that same signed executable. Both are observations of the installation, which is the
  // standard this repository set for Antigravity. Everything below is the shape of those two observations.
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-claude-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const executable = path.join(root, 'claude.exe'), project = path.join(root, 'mi proyecto & notas');
  await mkdir(project); await writeFile(executable, 'claude fixture');
  const launched = [];
  let declares = true, registered = `"${executable}" "%1"`, publisher = 'Anthropic, PBC', status = 'Valid';
  const adapter = createLocalAppLauncher({ discover: async () => [{ executable }],
    signature: async () => ({ status, publisher }), declaration: async () => declares,
    handler: async () => registered, launch: async (...args) => launched.push(args) });

  const found = await adapter.detect('claude-code');
  assert.equal(found.unverified, undefined);
  assert.equal(found.label, 'Claude');
  assert.equal(found.files[0].publisher, 'Anthropic, PBC');

  // Opened with the route it declared, with the folder encoded, and with nothing else.
  await adapter.open(found, project);
  assert.equal(launched.length, 1);
  const [command, args] = launched[0];
  assert.equal(command, await realpath(executable));
  assert.equal(args.length, 1, 'Un solo argumento: la dirección que la aplicación declaró aceptar.');
  const url = new URL(args[0]);
  assert.equal(url.protocol, 'claude:');
  assert.equal(`${url.host}${url.pathname}`, 'code/new');
  assert.equal(url.searchParams.get('folder'), await realpath(project),
    'La carpeta viaja codificada y sin perder un espacio ni un ampersand.');
  assert.deepEqual([...url.searchParams.keys()], ['folder'],
    'Un solo parámetro: nada se añade a la dirección que la aplicación declaró.');

  // Each observation on its own is enough to refuse, and none of them opens anything.
  declares = false;
  assert.equal((await adapter.detect('claude-code')).code, 'APP_UNSUPPORTED');
  assert.match((await adapter.detect('claude-code')).message, /no declara cómo recibir una carpeta/);
  declares = true;
  registered = '"C:\\Windows\\System32\\notepad.exe" "%1"';
  assert.match((await adapter.detect('claude-code')).message, /no entrega esa dirección a esta misma aplicación/);
  registered = '';
  assert.equal((await adapter.detect('claude-code')).code, 'APP_UNSUPPORTED');
  registered = `"${executable}" "%1"`;
  status = 'NotSigned';
  assert.equal((await adapter.detect('claude-code')).code, 'APP_UNTRUSTED');
  status = 'Valid'; publisher = 'Otra Empresa, S.A.';
  assert.equal((await adapter.detect('claude-code')).code, 'APP_UNTRUSTED');

  // A refusal never becomes an opening.
  await assert.rejects(adapter.open({ agent: 'claude-code', executable, files: [] }, project),
    error => ['APP_UNTRUSTED', 'APP_UNSUPPORTED', 'APP_CHANGED'].includes(error.code));
  assert.equal(launched.length, 1, 'Solo la primera, la que cumplia las seis comprobaciones.');
});

test('an application that declares nothing is recognised and never opened', async t => {
  // OpenCode, measured on the maintainer's machine: signed by Anomaly Innovations, registers `opencode://`,
  // forwards deep links to its renderer, and declares no route that takes a folder. Its signature verifying
  // is one fact and being openable is another, and the person gets both.
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-opencode-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const executable = path.join(root, 'OpenCode.exe'), project = path.join(root, 'proyecto');
  await mkdir(project); await writeFile(executable, 'opencode fixture');
  const launched = [];
  const adapter = createLocalAppLauncher({ discover: async () => [{ executable }],
    signature: async () => ({ status: 'Valid', publisher: 'Anomaly Innovations, Inc https://anoma.ly/' }),
    launch: async (...args) => launched.push(args) });

  const found = await adapter.detect('opencode');
  assert.equal(found.unverified, true);
  assert.equal(found.code, 'APP_UNSUPPORTED');
  assert.equal(found.label, 'OpenCode');
  assert.match(found.message, /no declara cómo recibir una carpeta/);
  await assert.rejects(adapter.open({ agent: 'opencode', executable, files: [] }, project),
    error => error.code === 'APP_UNSUPPORTED');
  assert.deepEqual(launched, [], 'Sin contrato observado no hay apertura, y esa es una respuesta válida.');
});

test('the real declaration reader finds the route, misses what is not there, and fails closed', async t => {
  // Three of the six checks survived a deliberate mutation until an independent review tried them, and the
  // worst of the three was this one: every test injected `declaration`, so the reader that actually opens the
  // other application's bundle was never run. These build real bundles and run it.
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-declaration-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const needle = 'code/new?folder=';
  const make = async (name, contents) => {
    const home = path.join(root, name, 'resources');
    await mkdir(home, { recursive: true });
    await writeFile(path.join(home, 'app.asar'), contents);
    const executable = path.join(root, name, 'claude.exe');
    await writeFile(executable, 'stub');
    return executable;
  };
  const launcher = createLocalAppLauncher({
    signature: async () => ({ status: 'Valid', publisher: 'Anthropic, PBC' }),
    handler: async () => `"${path.join(root, 'declares', 'claude.exe')}" "%1"`,
    launch: async () => {} });
  const detectOf = async executable => createLocalAppLauncher({
    discover: async () => [{ executable }],
    signature: async () => ({ status: 'Valid', publisher: 'Anthropic, PBC' }),
    handler: async () => `"${executable}" "%1"`, launch: async () => {} }).detect('claude-code');

  // Declared, and far enough in that the reader has to keep going.
  const filler = 'x'.repeat(3 * 1024 * 1024);
  assert.equal((await detectOf(await make('declares', `${filler}JIn(){return \`claude://${needle}\`}${filler}`))).unverified, undefined);

  // Not declared: something that looks similar is not the route.
  const near = (await detectOf(await make('near-miss', `${filler}code/new?source=desktop_action${filler}`)));
  assert.equal(near.unverified, true);
  assert.match(near.message, /no declara cómo recibir una carpeta/);

  // Split exactly across the reader's chunk boundary: the carry between chunks is what makes this work, and
  // without it the route would be invisible precisely when it straddles a megabyte.
  const chunk = 1024 * 1024;
  const half = Math.floor(needle.length / 2);
  const straddling = 'y'.repeat(chunk - half) + needle + 'y'.repeat(1024);
  assert.equal((await detectOf(await make('straddles', straddling))).unverified, undefined,
    'La aguja partida entre dos trozos tiene que encontrarse igual.');

  // No bundle at all, and a directory where the bundle should be: both are "no declaration", and neither may
  // reach a person as a filesystem error carrying an absolute path.
  const missing = path.join(root, 'no-bundle', 'claude.exe');
  await mkdir(path.dirname(missing), { recursive: true }); await writeFile(missing, 'stub');
  const absent = await detectOf(missing);
  assert.equal(absent.code, 'APP_UNSUPPORTED');
  assert.doesNotMatch(absent.message ?? '', /[A-Za-z]:[\\/]/, 'Ninguna ruta absoluta puede llegar a la pantalla.');
  const asDirectory = path.join(root, 'bundle-is-a-directory', 'claude.exe');
  await mkdir(path.join(path.dirname(asDirectory), 'resources', 'app.asar'), { recursive: true });
  await writeFile(asDirectory, 'stub');
  assert.equal((await detectOf(asDirectory)).code, 'APP_UNSUPPORTED');
});

test('bytes that change between the two readings, or a file with another name, refuse the opening', async t => {
  // The other two checks the review mutated without anything noticing.
  const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-bytes-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const executable = path.join(root, 'Cursor.exe');
  await writeFile(executable, 'cursor fixture');
  const launched = [];
  let call = 0;
  // The same file, read twice, answering with different bytes: an update that lands between the signature
  // check and the decision has to refuse, not race.
  const changing = createLocalAppLauncher({ discover: async () => [{ executable }],
    signature: async () => ({ status: 'Valid', publisher: 'Anysphere, Inc.' }),
    inspectFile: async value => ({ executable: value, sha256: String(call++).padStart(64, '0') }),
    launch: async (...args) => launched.push(args) });
  const changed = await changing.detect('cursor');
  assert.equal(changed.unverified, true);
  assert.equal(changed.code, 'APP_UNTRUSTED');
  assert.deepEqual(launched, []);

  // A hard link to the same bytes is a second name for one file, and a second name is a way to swap what runs
  // under a path that was already reviewed.
  const linked = path.join(root, 'Linked.exe');
  await link(executable, linked).catch(() => null);
  const stats = await stat(linked).catch(() => null);
  if (stats && stats.nlink > 1) {
    const hardLinked = createLocalAppLauncher({ discover: async () => [{ executable: linked }],
      signature: async () => ({ status: 'Valid', publisher: 'Anysphere, Inc.' }),
      launch: async (...args) => launched.push(args) });
    const refused = await hardLinked.detect('cursor');
    assert.equal(refused.unverified, true);
    assert.equal(refused.code, 'APP_UNTRUSTED');
    assert.deepEqual(launched, [], 'Un segundo nombre para el mismo archivo no abre nada.');
  }
});
