// Mide el detector de marcadores contra el corpus congelado de #166.
// Uso: node evidence/measure-markers.mjs [raiz] [salida.json]
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(process.argv[2] || process.cwd());
const output = path.resolve(process.argv[3] || path.join(
  root,
  'openspec/changes/fix-marker-homograph-detection/evidence/after/marker-measurement.json',
));
const corpusPath = path.join(
  root,
  'openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence/flow-comparison/evaluation.json',
);
const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'));
const { readinessInternals } = await import(
  pathToFileURL(path.join(root, 'src/readiness.mjs')).href,
);

const flags = (value) => readinessInternals.placeholderPaths({ scope: value }).length > 0;
const detail = (value) => readinessInternals.placeholderPaths({ scope: value });
const legitimateRejected = corpus.legitimatePhrases.filter(({ phrase }) => flags(phrase));
const markersAccepted = corpus.corpus.markerSources.filter(({ marker }) => !flags(marker));

const archiveRoot = path.join(root, 'openspec/changes/archive');
const archivedFlagged = [];
if (existsSync(archiveRoot)) {
  for (const entry of readdirSync(archiveRoot)) {
    const readinessPath = path.join(archiveRoot, entry, 'readiness.json');
    if (!existsSync(readinessPath)) continue;
    const metadata = JSON.parse(readFileSync(readinessPath, 'utf8'));
    const paths = readinessInternals.placeholderPaths(metadata);
    if (paths.length > 0) archivedFlagged.push({ change: entry, paths: paths.slice(0, 3) });
  }
}

const result = {
  schemaVersion: 1,
  date: new Date().toISOString(),
  method: 'Corpus congelado de #166, detector importado del árbol bajo prueba; no se reutilizan informes de otra vía.',
  corpus: {
    legitimateTotal: corpus.legitimatePhrases.length,
    markersTotal: corpus.corpus.markerSources.length,
    archivedChanges: corpus.corpus.archivedChanges,
  },
  detector: {
    legitimateRejected: legitimateRejected.length,
    legitimateRejectedSamples: legitimateRejected.slice(0, 4),
    markersRejected: corpus.corpus.markerSources.length - markersAccepted.length,
    markersAccepted,
    archivedFlagged,
    namingSample: detail('reemplaza con el valor'),
    changeIdentifier: detail('fix-placeholder-homograph-detection'),
    malformedReserved: {
      owner: detail('TBD-owner'),
      change: detail('placeholder'),
    },
  },
  acceptance: {
    legitimate: legitimateRejected.length === 0,
    markers: markersAccepted.length === 0,
    archivedMetadata: archivedFlagged.length === 0,
  },
};

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({
  legitimas: `${result.corpus.legitimateTotal - result.detector.legitimateRejected} de ${result.corpus.legitimateTotal}`,
  marcadoresRechazados: `${result.detector.markersRejected} de ${result.corpus.markersTotal}`,
  archivadosMarcados: result.detector.archivedFlagged.length,
}, null, 2));
