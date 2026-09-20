// Evaluación independiente de las dos vías de la prueba 2 (#166), contra los criterios del protocolo
// congelado. No lee los informes de las vías: importa el detector de cada árbol y lo somete al mismo corpus.
//
// El corpus no se escribe a mano. Las frases legítimas se extraen de los documentos reales del repositorio
// base, y los marcadores, de las plantillas sembradas más los cuatro que nombra el criterio 3 y las dos formas
// acentuadas. Así, la medición se puede repetir y auditar.
//
//   node evaluate.mjs <base> <via-a> <via-b> <salida.json>
import { readFileSync, readdirSync, statSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [baseArgument, viaAArgument, viaBArgument, out] = process.argv.slice(2);
const base = path.resolve(baseArgument);
const viaA = path.resolve(viaAArgument);
const viaB = path.resolve(viaBArgument);

// La mitad castellana del cuarto patrón original: la que produce los falsos positivos.
const SPANISH = /\b(?:reemplaza|sustituye|completa|conserva)\s+(?:con|aqui|aquí|este|esta|el|la)\b/i;

// Los documentos que nombra el issue #162: instrucciones, entrada pública, guías, semilla y specs activas.
const DOCUMENT_ROOTS = ['AGENTS.md', 'README.md', 'PRODUCT.md', 'CONTRIBUTING.md', 'docs', 'openspec/specs',
  'blueprint/core/docs', 'blueprint/core/AGENTS.md'];
const TEMPLATE_ROOTS = ['blueprint/core/docs/engineering/templates'];

function walk(root, relative, onFile) {
  const absolute = path.join(root, relative);
  if (!existsSync(absolute)) return;
  if (statSync(absolute).isDirectory()) {
    for (const entry of readdirSync(absolute)) walk(root, path.join(relative, entry), onFile);
    return;
  }
  onFile(relative.split(path.sep).join('/'), absolute);
}

export function legitimatePhrases(root) {
  const found = [];
  for (const entry of DOCUMENT_ROOTS) {
    walk(root, entry, (relative, absolute) => {
      if (!/\.(md|json|mjs)$/.test(relative)) return;
      for (const line of readFileSync(absolute, 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (SPANISH.test(trimmed)) found.push({ file: relative, phrase: trimmed.slice(0, 200) });
      }
    });
  }
  return found;
}

// Marcadores de verdad. Los de las plantillas se leen literalmente de ellas: citar una cadena que no se midió
// sería exactamente el defecto que este change denuncia.
export function realMarkers(root) {
  const fromTemplates = [];
  for (const entry of TEMPLATE_ROOTS) {
    walk(root, entry, (relative, absolute) => {
      if (!relative.endsWith('.json')) return;
      const collect = (value) => {
        if (typeof value === 'string') {
          if (/^(Replace with|Complete the|Fill in)\b/.test(value)) fromTemplates.push({ source: relative, marker: value });
          return;
        }
        if (value && typeof value === 'object') for (const child of Object.values(value)) collect(child);
      };
      try { collect(JSON.parse(readFileSync(absolute, 'utf8'))); } catch { /* plantilla ilegible */ }
    });
  }
  const named = ['reemplaza con el valor', '<nombre del cambio>', 'TODO', '[completar]']
    .map((marker) => ({ source: 'criterio 3 del protocolo', marker }));
  // La forma acentuada: `\b` en JavaScript no conoce la `í`, así que este marcador escrito en castellano
  // correcto se colaba antes del cambio. Las dos vías dijeron haberlo cerrado.
  const accented = ['sustituye aquí el valor', 'reemplaza aquí']
    .map((marker) => ({ source: 'escape acentuado', marker }));
  const all = [...fromTemplates, ...named, ...accented];
  const seen = new Set();
  return all.filter((item) => (seen.has(item.marker) ? false : seen.add(item.marker)));
}

function archivedMetadata(root) {
  const archive = path.join(root, 'openspec', 'changes', 'archive');
  const records = [];
  if (!existsSync(archive)) return records;
  for (const entry of readdirSync(archive)) {
    const file = path.join(archive, entry, 'readiness.json');
    if (!existsSync(file)) continue;
    try { records.push({ change: entry, metadata: JSON.parse(readFileSync(file, 'utf8')) }); } catch { /* ilegible */ }
  }
  return records;
}

async function detectorOf(tree) {
  const module = await import(pathToFileURL(path.join(tree, 'src', 'readiness.mjs')).href);
  const { placeholderPaths } = module.readinessInternals;
  return {
    flags: (value) => placeholderPaths({ campo: value }).length > 0,
    detail: (value) => placeholderPaths({ campo: value }).map(String).join(' | ').slice(0, 200),
    paths: (metadata) => placeholderPaths(metadata).map(String),
  };
}

const legitimate = legitimatePhrases(base);
const markers = realMarkers(base);
const archived = archivedMetadata(base);
const result = {
  schemaVersion: 1,
  date: new Date().toISOString(),
  method: 'Se importa el detector de cada árbol y se somete al mismo corpus, extraído del repositorio base. Ninguna cifra sale de los informes de las vías.',
  corpus: {
    legitimate: legitimate.length,
    markers: markers.length,
    markerSources: markers.map((item) => ({ source: item.source, marker: item.marker })),
    archivedChanges: archived.length,
  },
  legitimatePhrases: legitimate,
  arms: {},
};

for (const [name, tree] of [['base', base], ['via-a', viaA], ['via-b', viaB]]) {
  const detector = await detectorOf(tree);
  const rejected = legitimate.filter((item) => detector.flags(item.phrase));
  const accepted = markers.filter((item) => !detector.flags(item.marker));
  const archivedFlagged = archived
    .map((record) => ({ change: record.change, paths: detector.paths(record.metadata).slice(0, 3) }))
    .filter((entry) => entry.paths.length > 0);
  result.arms[name] = {
    legitimateTotal: legitimate.length,
    legitimateRejected: rejected.length,
    legitimateRejectedSamples: rejected.slice(0, 4).map((item) => ({ file: item.file, phrase: item.phrase.slice(0, 120) })),
    markersTotal: markers.length,
    markersRejected: markers.length - accepted.length,
    markersAccepted: accepted,
    namingSample: detector.detail('reemplaza con el valor'),
    namesToken: /replacement-instruction|reserved-marker|marker|placeholder/i.test(detector.detail('reemplaza con el valor')),
    archivedFlagged,
  };
}

mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(path.resolve(out), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({
  corpus: { legitimas: legitimate.length, marcadores: markers.length, archivados: archived.length },
  resumen: Object.fromEntries(Object.entries(result.arms).map(([name, value]) => [name, {
    legitimasQuePasan: `${value.legitimateTotal - value.legitimateRejected} de ${value.legitimateTotal}`,
    marcadoresRechazados: `${value.markersRejected} de ${value.markersTotal}`,
    archivadosMarcados: value.archivedFlagged.length,
  }])),
}, null, 2));
