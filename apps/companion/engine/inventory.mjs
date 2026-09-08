import { lstat, opendir } from 'node:fs/promises';
import path from 'node:path';
import { canonicalFolder, hash, json, fail, readBounded } from './files.mjs';

const EXCLUDED = new Set(['.git','.project-os','.project-constructor',
  'node_modules','library','temp','obj','bin','build','dist','coverage','.venv','venv','__pycache__','.next',
  '.ssh','.aws','.azure','.gnupg','.kube','models','checkpoints','loras','output','outputs']);
const PRIVATE = /(^\.env($|\.)|(?:credential|secret|token|password)s?(?:[._-]|$)|\.(?:pem|key|p12|pfx|keystore)$)/i;
const TEXT = new Set(['.md','.txt','.csv','.json','.yaml','.yml','.toml','.xml','.js','.mjs','.cjs','.ts','.tsx','.jsx','.css','.html','.cs','.py','.shader','.unity','.asset']);
export const PROFILE_IDS = Object.freeze(['research','software','unity','media','general']);
// Scope is explicit and constant: these are policy/control surfaces, not source documents.
export const CONTROL_PATHS = Object.freeze(['.project-os', '.project-constructor', '.codegraph', '.gitnexus',
  'graphify-out', 'AGENTS.md', 'CLAUDE.md', '.cursor/rules/project-os-companion.mdc', '.github/copilot-instructions.md']);

export function normalizeScanLimits(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)
      || Object.keys(options).some(key=>!['entries','depth','fileBytes','totalBytes'].includes(key))) fail('SCAN_LIMIT_INVALID', 'La configuración de inspección no es válida.');
  const limits = { entries: 3000, depth: 8, fileBytes: 2 * 1024 * 1024, totalBytes: 24 * 1024 * 1024, ...options };
  for (const [key, max] of Object.entries({ entries: 10000, depth: 20, fileBytes: 16 * 1024 * 1024, totalBytes: 64 * 1024 * 1024 })) {
    if (!Number.isInteger(limits[key]) || limits[key] < 1 || limits[key] > max) fail('SCAN_LIMIT_INVALID', 'El límite de inspección no es válido.');
  }
  return limits;
}

export async function inspectFolder(target, options = {}) {
  const limits = normalizeScanLimits(options);
  const root = await canonicalFolder(target), files = [], limitations = [];
  let visited = 0, bytesRead = 0, excluded = 0, stopped = false;
  async function walk(relative, depth) {
    const absolute = path.join(root, relative);
    if ((await lstat(absolute)).isSymbolicLink()) { limitations.push({ path: relative, reason: 'link-not-followed' }); return; }
    const directory = await opendir(absolute).catch(error => {
      limitations.push({ path: relative, reason: 'directory-unreadable', code: error.code }); return null;
    });
    if (!directory) return;
    for await (const entry of directory) {
      // Preparation metadata must not invalidate the user-input plan that creates it.
      const rel = relative ? `${relative}/${entry.name}` : entry.name;
      if (CONTROL_PATHS.some(p=>p.toLowerCase()===rel.toLowerCase())) continue;
      // Creating a route parent must not consume the budget of the corpus it routes to.
      if (!['.github','.cursor','.cursor/rules'].includes(rel.toLowerCase()) && ++visited > limits.entries) { stopped = true; break; }
      if (PRIVATE.test(entry.name) || EXCLUDED.has(entry.name.toLowerCase())) { excluded++; continue; }
      let stat;
      try { stat = await lstat(path.join(root, rel)); } catch (error) { limitations.push({ path: rel, reason: 'unreadable', code: error.code }); continue; }
      if (stat.isSymbolicLink() || (stat.isFile() && stat.nlink > 1)) { limitations.push({ path: rel, reason: 'link-not-followed' }); continue; }
      if (stat.isDirectory()) {
        if (depth >= limits.depth) limitations.push({ path: rel, reason: 'depth-limit' });
        else await walk(rel, depth + 1);
        if (stopped) break;
        continue;
      }
      if (!stat.isFile()) { limitations.push({ path: rel, reason: 'unsupported-file-type' }); continue; }
      const extension = path.extname(entry.name).toLowerCase();
      const file = { path: rel, extension, bytes: stat.size, modified: stat.mtimeMs, hash: null, kind: TEXT.has(extension) ? 'text' : extension === '.pdf' ? 'pdf' : 'binary' };
      if (file.kind === 'text' && stat.size <= limits.fileBytes && bytesRead + stat.size <= limits.totalBytes) {
        try {
          const latest = await lstat(path.join(root, rel));
          if (!latest.isFile() || latest.isSymbolicLink() || latest.nlink > 1 || latest.size > limits.fileBytes) throw new Error('changed');
          const content = await readBounded(path.join(root, rel), Math.min(limits.fileBytes, limits.totalBytes - bytesRead));
          bytesRead += content.length;
          if (content.length > limits.fileBytes || bytesRead > limits.totalBytes) { limitations.push({ path: rel, reason: 'byte-limit' }); stopped = true; }
          else file.hash = hash(content);
        } catch { limitations.push({ path: rel, reason: 'read-failed-or-changed' }); }
      } else if (file.kind === 'text') limitations.push({ path: rel, reason: 'byte-limit' });
      files.push(file);
      if (stopped) break;
    }
  }
  await walk('', 0);
  if (visited > limits.entries) limitations.push({ path: '', reason: 'entry-limit' });
  files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  limitations.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const names = files.map(f => f.path.toLowerCase());
  const recommendation = names.some(n => n === 'projectsettings/projectversion.txt') ? 'unity'
    : names.some(n => /(^|\/)(comfy|workflow|recipe|receta)/.test(n)) && files.some(f => ['.png','.mp4','.wav','.safetensors'].includes(f.extension)) ? 'media'
    : files.some(f => ['.js','.mjs','.ts','.tsx','.cs','.py','.html'].includes(f.extension)) ? 'software'
    : files.some(f => ['.pdf','.docx','.bib'].includes(f.extension)) ? 'research' : 'general';
  return { root, files, limitations, excluded, bytesRead, complete: !limitations.length, recommendation,
    fingerprint: hash(json({ files, limitations, excluded })), limits, controlPaths: CONTROL_PATHS };
}
