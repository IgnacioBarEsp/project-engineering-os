import { assertPath, snapshot, writeChecked } from '../engine/files.mjs';

// What Companion puts inside `.project-os` and can rebuild from a pin: the engineering toolchain and any project
// technology. Both are large — thirteen and up to twenty-three megabytes — and both are verified by comparing a
// digest against a pin, never by their history, so committing them into someone's repository costs a lot and
// proves nothing.
//
// Until now nothing said so, and the decision sat in the debt registry unanswered while the folders got heavier.
// Installing a technology is what made it concrete: a person who prepares a project and commits it would push a
// `node_modules` they never chose to version.
//
// Two deliberate limits. The rules live at `.project-os/.gitignore`, inside what this application administers,
// so nothing the person owns is written; and an existing file is never touched, because a person who wrote rules
// there decided something and this is not the place to overrule them.
const IGNORE_PATH = '.project-os/.gitignore';
export const IGNORE_RULES = [
  '# Escrito por Project Engineering OS Companion.',
  '# Estas carpetas se regeneran y se comprueban por su digesto, no por su historial:',
  '# pesan decenas de megabytes y versionarlas no demuestra nada.',
  '# Si prefieres versionarlas, borra las dos líneas de abajo; no se vuelven a escribir.',
  '/toolchain/',
  '/stack/',
  '',
].join('\n');

export async function ensureIgnoreRules(root) {
  await assertPath(root, IGNORE_PATH);
  const current = await snapshot(root, IGNORE_PATH, 65536);
  if (current.content !== null) return { written: false, reason: 'ya existe un archivo ahí y es de quien lo escribió' };
  await writeChecked(root, IGNORE_PATH, IGNORE_RULES, null, 65536);
  return { written: true, path: IGNORE_PATH };
}
