#!/usr/bin/env node
// The Companion defines each term once, in `apps/companion/ui/glossary.mjs`, because the screen where a term
// appears and the page that collects them must not drift apart. This renders the published document from
// that single source; `test/companion-glossary.test.mjs` fails if the file on disk stops matching.
//
//   node scripts/render-companion-glossary.mjs [--check]

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const GLOSSARY_DOC = path.join(root, 'docs', 'companion', 'GLOSSARY.md');
const MODULE = path.join(root, 'apps', 'companion', 'ui', 'glossary.mjs');

export async function renderGlossary() {
  const { GLOSSARY } = await import(pathToFileURL(MODULE).href);
  const rows = GLOSSARY.map(entry => `### ${entry.term}\n\n${entry.short}${entry.detail ? `\n\n${entry.detail}` : ''}`);
  return `# Glosario de Companion

Cada palabra técnica que aparece en la aplicación se puede abrir desde la pantalla donde aparece, y todas
están reunidas en **Ayuda**. Esta página publica las mismas definiciones para quien lee la documentación sin
tener la aplicación abierta.

**Úsalo si:** encontraste una palabra en la interfaz o en una receta y quieres saber qué significa aquí.

Las definiciones se generan desde \`apps/companion/ui/glossary.mjs\`, que es la única fuente. No edites esta
página a mano: ejecuta \`node scripts/render-companion-glossary.mjs\`.

## Términos

${rows.join('\n\n')}

## Relacionado

- [Experiencia de Companion](EXPERIENCE.md): los cuatro destinos de la aplicación y el recorrido completo.
- [Evidencia](EVIDENCE.md): qué se midió y qué no.
- [Documentación](../README.md): índice general.
`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const rendered = await renderGlossary();
  if (process.argv.includes('--check')) {
    const current = await readFile(GLOSSARY_DOC, 'utf8').catch(() => null);
    if (current !== rendered) {
      process.stderr.write('FAIL glossary: docs/companion/GLOSSARY.md no coincide con ui/glossary.mjs\n');
      process.exitCode = 1;
    } else process.stdout.write('OK glossary\n');
  } else {
    await writeFile(GLOSSARY_DOC, rendered);
    process.stdout.write(`escrito ${path.relative(root, GLOSSARY_DOC)}\n`);
  }
}
