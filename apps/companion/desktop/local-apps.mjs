import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, realpath, readdir } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, fail } from '../engine/files.mjs';

const exec = promisify(execFile);
const publishers = { codex: ['OpenAI OpCo, LLC','OpenAI, L.L.C.'], cursor: ['Anysphere, Inc.'], 'github-copilot': ['Microsoft Corporation'] };
const labels = { codex: 'Codex', cursor: 'Cursor', 'github-copilot': 'Visual Studio Code' };
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
export function createLocalAppLauncher({ system = process.env, platform = process.platform, discover, signature, inspectFile = regularFile, help, launch } = {}) {
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
  async function check(agent, candidate) {
    if (!publishers[agent]) fail('APP_UNSUPPORTED','No hay una apertura local revisada para esta IA.');
    const files = [];
    for (const executable of [candidate.executable,...(candidate.desktop?[candidate.desktop]:[])]) {
      const before = await inspectFile(executable), signed = await readSignature(before.executable), after = await inspectFile(executable);
      if (signed.status !== 'Valid' || !publishers[agent].includes(signed.publisher) || before.sha256 !== after.sha256) fail('APP_UNTRUSTED','La firma o el editor de la aplicación no se pudo verificar.');
      files.push({...after,publisher:signed.publisher});
    }
    if (agent==='codex'&&!candidate.desktop) fail('APP_UNTRUSTED','No se encontró la aplicación de escritorio de Codex instalada.');
    if (agent==='codex'&&!/Usage: codex app[^\r\n]*\[PATH\]/.test(await supportedHelp(files[0].executable))) fail('APP_UNSUPPORTED','Esta versión de Codex no confirmó cómo abrir una carpeta.');
    return { agent, ...candidate, files, label:labels[agent] };
  }
  return {
    async detect(agent) {
      if(!publishers[agent])return null;
      const found=await candidates(agent).catch(()=>[]);
      // "Not installed" and "installed but not verifiable" are different answers for the person:
      // the second one means an application is there and this app refused to launch it.
      let refused=null;
      for(const candidate of found){try{return await check(agent,candidate);}catch(error){refused??=error;}}
      if(refused)return {agent,label:labels[agent],unverified:true,code:refused.code??'APP_UNTRUSTED',message:refused.message};
      return null;
    },
    async open(reviewed, target) {
      const root=await canonicalFolder(target), current=await check(reviewed.agent,reviewed);
      if(JSON.stringify(current.files)!==JSON.stringify(reviewed.files))fail('APP_CHANGED','La aplicación cambió después de la revisión.','Vuelve a revisar la apertura con tu IA.');
      const args=reviewed.agent==='codex'?['app',root]:[root];
      await start(current.files[0].executable,args);
      return {opened:'local',application:current.label,projectAttached:true,agentActivated:false,agentReadProject:false};
    },
  };
}
