import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export const SPECS_ROOT = 'openspec/specs';

// OpenSpec siembra este texto al crear una capability durante el archive y `validate --all --strict` lo
// acepta, porque solo exige que la sección exista. Sin este gate el placeholder sobrevive a la revisión y
// reinstala en silencio la deuda que el Issue #25 ya había cerrado para las specs históricas.
const ARCHIVE_PLACEHOLDER = /TBD\s*-\s*created by archiving/i;
const PLACEHOLDER_OPENING = /^(?:TBD|TODO|PENDING)\b/i;
const HEADING = /^##\s+(.+?)\s*$/;
const PURPOSE_HEADING = 'Purpose';

function purposeBody(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => HEADING.exec(line)?.[1] === PURPOSE_HEADING);
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => HEADING.test(line));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n').trim();
}

export async function inspectSpecPurposes(root) {
  const specsRoot = path.join(root, ...SPECS_ROOT.split('/'));
  let entries;
  try {
    entries = await readdir(specsRoot, { withFileTypes: true });
  } catch {
    // Un árbol de specs ilegible no puede demostrar que cada capability declara su propósito.
    return { capabilities: [], failures: [{ kind: 'specs-root-unreadable', capability: SPECS_ROOT }] };
  }

  const capabilities = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const failures = [];

  for (const capability of capabilities) {
    let content;
    try {
      content = await readFile(path.join(specsRoot, capability, 'spec.md'), 'utf8');
    } catch {
      failures.push({ kind: 'spec-unreadable', capability });
      continue;
    }
    const body = purposeBody(content);
    if (body === null) {
      failures.push({ kind: 'purpose-missing', capability });
      continue;
    }
    if (body === '') {
      failures.push({ kind: 'purpose-empty', capability });
      continue;
    }
    if (ARCHIVE_PLACEHOLDER.test(body) || PLACEHOLDER_OPENING.test(body)) {
      failures.push({ kind: 'purpose-placeholder', capability });
    }
  }

  return { capabilities, failures };
}
