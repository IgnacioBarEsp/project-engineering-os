import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, fail } from '../engine/files.mjs';

const exec = promisify(execFile);
const publishers = { codex: ['OpenAI OpCo, LLC','OpenAI, L.L.C.'], cursor: ['Anysphere, Inc.'], 'github-copilot': ['Microsoft Corporation'],
  antigravity: ['Google LLC'], 'claude-code': ['Anthropic, PBC'], opencode: ['Anomaly Innovations, Inc https://anoma.ly/'] };
const labels = { codex: 'Codex', cursor: 'Cursor', 'github-copilot': 'Visual Studio Code', antigravity: 'Antigravity',
  'claude-code': 'Claude', opencode: 'OpenCode' };
// Recognising an application is not the same as knowing how to hand it a folder. Antigravity is listed so
// that a person who uses it is told whether it is installed and whether its publisher checks out, and it
// is deliberately never launched: this repository has not verified how its build opens a project, and
// guessing an argument would be claiming a capability nobody here observed. Remove an entry from this set
// only once a folder-open contract is verified the way Codex's is.
const noVerifiedFolderContract = new Set(['antigravity','opencode']);
// What each application has to declare before this one will hand it a folder, and how that declaration is
// read. Codex answers a help command; Claude does not answer one at all — it forwards its arguments to the
// instance already running — but its installed build declares the route it accepts, and the system has that
// route registered to the same signed executable. Both are observations of the installation, which is the
// standard this repository set for Antigravity and did not lower here.
//
// Measured on the maintainer's machine before any of this was written: Claude is signed by Anthropic, PBC and
// its build contains `code/new?folder=` built from a path it first confirms is a directory; OpenCode is signed
// by Anomaly Innovations, registers `opencode://`, forwards deep links to its renderer, and declares no route
// with a parameter. That is why one of them can be opened and the other cannot.
const PROTOCOL_ROUTE = { 'claude-code': { scheme: 'claude', declares: 'code/new?folder=',
  url: root => `claude://code/new?folder=${encodeURIComponent(root)}` } };
const DECLARATION_MAX_BYTES = 256 * 1024 * 1024, DECLARATION_MAX_MS = 15000;
function cleanEnvironment(system) {
  const allow = new Set(['systemroot','windir','systemdrive','userprofile','appdata','localappdata','temp','tmp','programfiles','programfiles(x86)','programdata','username','userdomain','homedrive','homepath','comspec']);
  return Object.fromEntries(Object.entries(system).filter(([key]) => allow.has(key.toLowerCase())));
}
async function regularFile(executable) {
  if (!path.isAbsolute(executable) || !executable.toLowerCase().endsWith('.exe')) fail('APP_UNTRUSTED','La aplicación no tiene un ejecutable admitido.');
  let cursor = executable, first = true;
  while (true) {
    const stat = await lstat(cursor);
    if (stat.isSymbolicLink() || (first && (!stat.isFile() || stat.nlink > 1)) || (!first && !stat.isDirectory())) fail('APP_UNTRUSTED','La aplicación pasa por un vínculo o un archivo no admitido.');
    const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent; first = false;
  }
  const resolved = await realpath(executable);
  if (resolved.toLowerCase() !== path.resolve(executable).toLowerCase()) fail('APP_UNTRUSTED','La ubicación de la aplicación cambió.');
  const digest = createHash('sha256'); let bytes = 0;
  for await (const chunk of createReadStream(resolved)) { bytes += chunk.length; if (bytes > 512*1024*1024) fail('APP_UNTRUSTED','El ejecutable supera el límite de comprobación.'); digest.update(chunk); }
  return { executable: resolved, sha256: digest.digest('hex') };
}
export function createLocalAppLauncher({ system = process.env, platform = process.platform, discover, signature, inspectFile = regularFile, help, launch, declaration, handler } = {}) {
  const environment = cleanEnvironment(system);
  const powershell = path.join(system.SystemRoot ?? system.SYSTEMROOT ?? 'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
  const ps = async (script, extra = {}) => (await exec(powershell,['-NoLogo','-NoProfile','-NonInteractive','-Command',script],
    { env: { ...environment, ...extra }, windowsHide:true, shell:false, timeout:20000, maxBuffer:65536 })).stdout;
  const readSignature = signature ?? (async executable => JSON.parse(await ps("$ErrorActionPreference='Stop'; $s=Get-AuthenticodeSignature -LiteralPath $env:COMPANION_SIGNATURE_TARGET; @{status=[string]$s.Status; publisher=if($s.SignerCertificate){$s.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName,$false)}else{''}} | ConvertTo-Json -Compress",{ COMPANION_SIGNATURE_TARGET:executable })));
  const candidates = discover ?? (async agent => {
    if (platform !== 'win32') return [];
    const local = system.LOCALAPPDATA, program = system.ProgramFiles ?? system.PROGRAMFILES;
    if (agent === 'cursor') return [local && path.join(local,'Programs','cursor','Cursor.exe'),program && path.join(program,'cursor','Cursor.exe')].filter(Boolean).map(executable=>({executable}));
    if (agent === 'github-copilot') return [local && path.join(local,'Programs','Microsoft VS Code','Code.exe'),program && path.join(program,'Microsoft VS Code','Code.exe')].filter(Boolean).map(executable=>({executable}));
    if (agent === 'antigravity') return [local && path.join(local,'Programs','antigravity','Antigravity.exe'),program && path.join(program,'antigravity','Antigravity.exe')].filter(Boolean).map(executable=>({executable}));
    // Squirrel keeps one directory per installed version; enumerate a bounded set and let the checks decide.
    if (agent === 'claude-code') {
      if (!local) return [];
      const home = path.join(local,'AnthropicClaude');
      // Ordered by their numbers. Sorting the names put `app-1.9.0` above `app-1.52386.3`, so with more than
      // five installed versions the real one could fall outside the window and the application would be
      // reported as not installed.
      const segments = name => name.slice(4).split('.').map(Number);
      const versions = (await readdir(home,{withFileTypes:true}).catch(()=>[]))
        .filter(entry=>entry.isDirectory()&&/^app-[0-9][0-9.]{0,20}$/.test(entry.name))
        .map(entry=>entry.name)
        .sort((a,b)=>{const x=segments(a),y=segments(b);
          for(let i=0;i<Math.max(x.length,y.length);i+=1){const d=(y[i]??0)-(x[i]??0);if(d)return d;}return 0;})
        .slice(0,5);
      return versions.map(name=>({executable:path.join(home,name,'claude.exe')}));
    }
    if (agent === 'opencode') return [local && path.join(local,'Programs','@opencode-aidesktop','OpenCode.exe')]
      .filter(Boolean).map(executable=>({executable}));
    if (agent !== 'codex' || !program) return [];
    const data = JSON.parse((await ps("@(Get-AppxPackage -Name OpenAI.Codex | Select-Object -ExpandProperty InstallLocation) | ConvertTo-Json -Compress")) || '[]');
    const packages=(Array.isArray(data)?data:[data]).filter(p=>typeof p==='string' && path.dirname(p).toLowerCase()===path.join(program,'WindowsApps').toLowerCase()
      && /^OpenAI\.Codex_[0-9.]+_x64__2p2nqsd0c76g0$/.test(path.basename(p))).slice(0,5);
    if(!local)return [];
    // Codex's own versioned per-user CLI is executable outside MSIX activation. Enumerate
    // only bounded known slots; never resolve its PATH alias or run an installer fallback.
    const bin=path.join(local,'OpenAI','Codex','bin');
    const slots=(await readdir(bin,{withFileTypes:true}).catch(()=>[])).filter(e=>e.isDirectory()&&/^[a-f0-9]{16}$/.test(e.name)).slice(0,20);
    return packages.flatMap(p=>slots.map(s=>({executable:path.join(bin,s.name,'codex.exe'),desktop:path.join(p,'app','Codex.exe')})));
  });
  const start = launch ?? (async (executable,args) => new Promise((resolve,reject)=>{
    const child = spawn(executable,args,{cwd:path.dirname(executable),env:environment,shell:false,windowsHide:true,detached:true,stdio:'ignore'});
    child.once('error',reject);child.once('spawn',()=>{child.unref();resolve();});
  }));
  const supportedHelp = help ?? (async executable => (await exec(executable,['app','--help'],{cwd:path.dirname(executable),env:environment,shell:false,windowsHide:true,timeout:15000,maxBuffer:65536})).stdout);
  // The route the installed build declares, read from its own resources in bounded chunks and stopped at the
  // first match. Measured at 11 ms against Claude's 36.1 MiB bundle: the route sits at byte 7 457 548, so
  // about 8 MiB are read before it is found.
  const readsDeclaration = declaration ?? (async (executable, needle) => {
    const bundle = path.join(path.dirname(executable),'resources','app.asar');
    // Bounded three ways — bytes, time and the first match — and it fails closed. A missing or unreadable
    // bundle is not a declaration, and its error may not reach a screen: an independent review watched an
    // ENOENT carrying an absolute path with the account name in it get painted in the interface.
    const deadline = Date.now() + DECLARATION_MAX_MS;
    let carry = '', bytes = 0;
    try {
      for await (const chunk of createReadStream(bundle,{highWaterMark:1<<20})) {
        bytes += chunk.length;
        if (bytes > DECLARATION_MAX_BYTES || Date.now() > deadline) return false;
        const text = carry + chunk.toString('latin1');
        if (text.includes(needle)) return true;
        carry = text.slice(-needle.length);
      }
    } catch { return false; }
    return false;
  });
  // What the system says will receive that scheme. A handler pointing anywhere else is not this application's
  // contract, so the opening is refused rather than guessed at.
  const readsHandler = handler ?? (async scheme => {
    const script = "$ErrorActionPreference='Stop'; (Get-ItemProperty -LiteralPath ('HKCU:\\Software\\Classes\\' + $env:COMPANION_SCHEME + '\\shell\\open\\command') -Name '(default)')."
      + "'(default)'";
    return (await ps(script,{ COMPANION_SCHEME: scheme })).trim();
  });
  async function check(agent, candidate) {
    if (!publishers[agent]) fail('APP_UNSUPPORTED','No hay una apertura local revisada para esta IA.');
    const files = [], verified = [];
    // A refusal after the signature verified carries the publisher, so the screen can say "signed by X, and
    // still not opened from here, because …" instead of one sentence for two very different situations.
    const refuse = (code, message, action) => {
      try { fail(code, message, action); }
      catch (error) { error.publisher = verified[0] ?? null; throw error; }
    };
    for (const executable of [candidate.executable,...(candidate.desktop?[candidate.desktop]:[])]) {
      const before = await inspectFile(executable), signed = await readSignature(before.executable), after = await inspectFile(executable);
      if (signed.status !== 'Valid' || !publishers[agent].includes(signed.publisher) || before.sha256 !== after.sha256) fail('APP_UNTRUSTED','La firma o el editor de la aplicación no se pudo verificar.');
      files.push({...after,publisher:signed.publisher});
      verified.push(signed.publisher);
    }
    if (agent==='codex'&&!candidate.desktop) fail('APP_UNTRUSTED','No se encontró la aplicación de escritorio de Codex instalada.');
    if (agent==='codex'&&!/Usage: codex app[^\r\n]*\[PATH\]/.test(await supportedHelp(files[0].executable))) fail('APP_UNSUPPORTED','Esta versión de Codex no confirmó cómo abrir una carpeta.');
    const route = PROTOCOL_ROUTE[agent];
    if (route) {
      // Two observations, both of the installation, both re-read at launch: the build declares the route, and
      // the system hands that scheme to this same verified executable.
      if (!await readsDeclaration(files[0].executable, route.declares)) {
        refuse('APP_UNSUPPORTED','Esta versión de la aplicación no declara cómo recibir una carpeta.','Ábrela desde la propia aplicación, o comparte el contexto exportado.');
      }
      const registered = await readsHandler(route.scheme).catch(()=>'');
      const target = (registered.match(/"([^"]+\.exe)"/i)?.[1] ?? registered.split(' ')[0] ?? '').trim();
      if (!target || path.resolve(target).toLowerCase() !== path.resolve(files[0].executable).toLowerCase()) {
        refuse('APP_UNSUPPORTED','El sistema no entrega esa dirección a esta misma aplicación.','Ábrela desde la propia aplicación, o comparte el contexto exportado.');
      }
    }
    // Checked after the signature so the person learns both facts: whether the publisher verified, and
    // that this application still will not be opened from here.
    if (noVerifiedFolderContract.has(agent)) refuse('APP_UNSUPPORTED','Esta aplicación no declara cómo recibir una carpeta, así que no se abre desde aquí.','Abre la carpeta del proyecto desde la propia aplicación, o comparte el contexto exportado.');
    return { agent, ...candidate, files, label:labels[agent], publisher:files[0].publisher };
  }
  return {
    async detect(agent) {
      if(!publishers[agent])return null;
      const found=await candidates(agent).catch(()=>[]);
      // "Not installed" and "installed but not verifiable" are different answers for the person:
      // the second one means an application is there and this app refused to launch it.
      let refused=null;
      for(const candidate of found){try{return await check(agent,candidate);}catch(error){
        // A candidate is a known location, not proof of an installation. Ignore only a missing
        // primary executable from the filesystem inspection; missing desktop companions, signature
        // helpers, permissions and invalid signatures remain refusals.
        if(error.code==='ENOENT' && error.syscall==='lstat' && error.path===candidate.executable)continue;
        // The most informative refusal wins. Keeping the first meant that with several installed versions a
        // person read the reason for the one the system does not even point at.
        if(!refused || (refused.code==='APP_UNTRUSTED' && error.code==='APP_UNSUPPORTED'))refused=error;
      }}
      // Both facts, never one standing in for the other. An independent review found the interface telling
      // a person that OpenCode's publisher could not be verified — it verifies — because the only refusal the
      // screen knew how to describe was Antigravity's, whose signature really does fail here.
      if(refused)return {agent,label:labels[agent],unverified:true,code:refused.code??'APP_UNTRUSTED',
        message:refused.message,publisher:refused.publisher??null,
        publisherVerified:refused.code==='APP_UNSUPPORTED'&&!!refused.publisher};
      return null;
    },
    async open(reviewed, target) {
      const root=await canonicalFolder(target), current=await check(reviewed.agent,reviewed);
      if(JSON.stringify(current.files)!==JSON.stringify(reviewed.files))fail('APP_CHANGED','La aplicación cambió después de la revisión.','Vuelve a revisar la apertura con tu IA.');
      const args=reviewed.agent==='codex'?['app',root]:PROTOCOL_ROUTE[reviewed.agent]?[PROTOCOL_ROUTE[reviewed.agent].url(root)]:[root];
      await start(current.files[0].executable,args);
      return {opened:'local',application:current.label,projectAttached:true,agentActivated:false,agentReadProject:false};
    },
  };
}
