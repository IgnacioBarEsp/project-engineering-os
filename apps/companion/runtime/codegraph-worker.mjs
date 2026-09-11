import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

// Only the trusted parent creates this request and the fresh source-copy directory.
// Never call the CLI: its automatic initialization can offer Git hooks.
const requestPath = process.argv[2], request = JSON.parse(await readFile(requestPath, 'utf8'));
const { default: CodeGraph } = createRequire(import.meta.url)(request.entry);
let graph;
try {
  graph = await CodeGraph.init(request.corpus, { index: false });
  const indexed = await graph.indexAll(), nodes = [], edges = [];
  for (const file of request.files) {
    for (const node of graph.getNodesInFile(file)) {
      if (nodes.length >= 5000) throw new Error('GRAPH_NODE_LIMIT');
      nodes.push({ id: node.id, name: node.name, path: node.filePath, kind: node.kind, start: node.startLine, end: node.endLine });
      for (const edge of graph.getOutgoingEdges(node.id)) {
        if (edges.length >= 10000) throw new Error('GRAPH_EDGE_LIMIT');
        edges.push({ from: edge.source, to: edge.target, kind: edge.kind });
      }
    }
  }
  const candidate = nodes.find(n => n.kind !== 'file' && n.name && n.name.length <= 200);
  const hits = candidate ? graph.searchNodes(candidate.name, { limit: 20 }) : [];
  const verified = !!candidate && hits.some(hit => hit.node.id === candidate.id);
  const ids = new Set(nodes.map(n => n.id));
  const value = { nodes, edges: edges.filter(e => ids.has(e.from) && ids.has(e.to)), verification: { method: 'CodeGraph.searchNodes', query: candidate?.name ?? null, matched: verified },
    coverage: { filesIndexed: indexed.filesIndexed, filesSkipped: indexed.filesSkipped, filesErrored: indexed.filesErrored } };
  const output = JSON.stringify(value);
  if (Buffer.byteLength(output) > 2 * 1024 * 1024) throw new Error('GRAPH_OUTPUT_LIMIT');
  await writeFile(path.join(path.dirname(requestPath), 'response.json'), output, { flag: 'wx' });
} finally { graph?.destroy(); }
