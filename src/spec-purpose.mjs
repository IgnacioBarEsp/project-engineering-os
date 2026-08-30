import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export const SPECS_ROOT = 'openspec/specs';

// OpenSpec siembra este texto al crear una capability durante el archive y `validate --all --strict` lo
// acepta, porque solo exige que la sección exista. Sin este gate el texto sembrado sobrevive a la revisión y
// reinstala en silencio la deuda que el Issue #25 ya había cerrado para las specs históricas.
const ARCHIVE_PLACEHOLDER = /TBD\s*-\s*created by archiving/i;
const PLACEHOLDER_OPENING = /^(?:TBD|TODO|PENDING)\b/i;
const HEADING = /^##\s+(.+?)\s*$/;
const PURPOSE_HEADING = 'Purpose';

const WRITE_PURPOSE = 'Escriba bajo `## Purpose` una o dos frases que declaren qué contrato observable posee'
  + ' la capability.';

// El gate lo consumen dos llamadores con la misma semántica: el gate de documentación del upstream y el
// comando read-only `opsx-check`, que llega a cualquier repositorio bootstrapeado. Un solo módulo evita que
// el consumidor reciba una copia divergente.
export const SPEC_PURPOSE_FAILURE_KINDS = Object.freeze([
  'purpose-empty',
  'purpose-missing',
  'purpose-placeholder',
  'spec-unreadable',
  'specs-root-unreadable',
]);

export function specPurposePath(capability) {
  return capability === SPECS_ROOT ? SPECS_ROOT : `${SPECS_ROOT}/${capability}/spec.md`;
}

export function specPurposeRecovery(failure) {
  const target = specPurposePath(failure.capability);
  switch (failure.kind) {
    case 'purpose-placeholder':
      return `Sustituya en \`${target}\` el texto que sembró el archive. ${WRITE_PURPOSE}`;
    case 'purpose-empty':
      return `Complete la sección vacía de \`${target}\`. ${WRITE_PURPOSE}`;
    case 'purpose-missing':
      return `Añada una sección \`## Purpose\` a \`${target}\`. ${WRITE_PURPOSE}`;
    case 'spec-unreadable':
      return `Restaure \`${target}\` o retire el directorio de la capability si ya no existe.`;
    default:
      return `Restaure \`${target}\`; ejecute \`openspec init\` si el árbol de specs aún no existe.`;
  }
}

function purposeBody(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((line) => HEADING.exec(line)?.[1] === PURPOSE_HEADING);
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => HEADING.test(line));
  return (end < 0 ? rest : rest.slice(0, end)).join('\n').trim();
}

export function classifySpecPurpose(content) {
  const body = purposeBody(content);
  if (body === null) return 'purpose-missing';
  if (body === '') return 'purpose-empty';
  if (ARCHIVE_PLACEHOLDER.test(body) || PLACEHOLDER_OPENING.test(body)) return 'purpose-placeholder';
  return null;
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
    const kind = classifySpecPurpose(content);
    if (kind) failures.push({ capability, kind });
  }

  return { capabilities, failures };
}
