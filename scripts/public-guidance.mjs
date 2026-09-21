import { createHash } from 'node:crypto';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';

// Bounded public entry surfaces, not immutable historical SDD records. Offline checks validate
// coherence and local reachability; release authenticity still requires the recorded GitHub check.
export const GUIDANCE_FILES = [
  'README.md', 'PRODUCT.md', 'docs/README.md', 'docs/USER_GUIDE.md', 'docs/CLI_GUIDE.md',
  'docs/PROJECT_STATUS.md', 'docs/REPOSITORY_MAP.md', 'docs/RELEASES.md',
  'docs/COMPATIBILITY.md', 'docs/ISOLATED_TOOLCHAIN.md', 'docs/TOOL_CATALOG.md',
  'docs/architecture/OWNERSHIP.md', 'docs/companion/DESKTOP.md',
  'docs/companion/INSTALLER.md', 'docs/companion/ARCHITECTURE.md',
  'docs/companion/GRAPH_TOOLS.md', 'docs/companion/EXPERIENCE.md',
  'docs/companion/ENVIRONMENT.md', 'docs/companion/SCREENSHOTS.md',
];

export function guidanceContractFailures(files, imageHash) {
  const failures = [];
  const readme = files['README.md'] ?? '';
  const status = files['docs/PROJECT_STATUS.md'] ?? '';
  const captures = files['docs/companion/SCREENSHOTS.md'] ?? '';
  const firstDownload = readme.indexOf('/releases/tag/companion-v');
  const firstCommand = readme.indexOf('```sh');
  if (firstDownload < 0 || firstCommand < 0 || firstDownload > firstCommand) failures.push('companion-first');
  for (const destination of ['docs/USER_GUIDE.md', 'docs/CLI_GUIDE.md', 'docs/REPOSITORY_MAP.md',
    'docs/PROJECT_STATUS.md', 'docs/companion/INSTALLER.md', 'docs/companion/SCREENSHOTS.md']) {
    if (!readme.includes(`](${destination})`)) failures.push(`entry ${destination}`);
  }
  const releaseTags = [...readme.matchAll(/\/releases\/tag\/(companion-v\d+\.\d+\.\d+)/g)].map(m => m[1]);
  if (new Set(releaseTags).size !== 1 || !status.includes(`/releases/tag/${releaseTags[0]})`)) failures.push('release identity');
  if (!/Revisión: \*\*\d{1,2} de [a-záéíóú]+ de \d{4}\*\*/.test(status) ||
    !/\*\*\d+\.\d+\.\d+ publicado\*\*/.test(status) || !status.includes('Núcleo CLI') ||
    !/\| Nueva landing \|[^\n]*página final y publicación pendientes \|/.test(status)) failures.push('delivery distinction');
  // El entorno declarado debe estar escrito. Que además sea cierto lo comprueba screenshot-provenance.mjs,
  // que exige que el motor y la forma de ejecutar de los registros aparezcan en esta misma página.
  if (!/\/tree\/[a-f0-9]{40}\)/.test(captures) || !captures.includes('ventana real de la aplicación') ||
    !captures.includes('No es una captura del instalador') || !captures.includes('Ejecución UTC')) failures.push('capture provenance');
  if (!/^[a-f0-9]{64}$/.test(imageHash ?? '') || !captures.includes(`\`${imageHash}\``)) failures.push('capture hash');
  if (!readme.includes('No es una captura del instalador')) failures.push('visible capture qualifier');
  return failures;
}

export async function inspectPublicGuidance(root) {
  const files = {}, failures = [];
  for (const relative of GUIDANCE_FILES) {
    try { files[relative] = await readFile(path.join(root, relative), 'utf8'); }
    catch { failures.push(`missing ${relative}`); }
  }
  let imageHash;
  try { imageHash = createHash('sha256').update(await readFile(path.join(root, 'docs/assets/companion-current-home.png'))).digest('hex'); }
  catch { failures.push('missing companion capture'); }
  failures.push(...guidanceContractFailures(files, imageHash));
  for (const [relative, text] of Object.entries(files)) {
    for (const [, href] of text.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^[a-z][\w+.-]*:/i.test(href) || href.startsWith('#')) continue;
      let decoded;
      try { decoded = decodeURIComponent(href.split('#')[0]); }
      catch { failures.push(`invalid link encoding ${relative}: ${href}`); continue; }
      const target = path.resolve(root, path.dirname(relative), decoded);
      const inside = path.relative(root, target);
      if (inside === '..' || inside.startsWith(`..${path.sep}`) || path.isAbsolute(inside)) { failures.push(`outside link ${relative}`); continue; }
      try { await access(target); } catch { failures.push(`link ${relative}: ${href}`); }
    }
  }
  return failures;
}
