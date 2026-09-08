import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Only this public prototype is served; never expose the repository or arbitrary paths.
export function servePrototype(port = 0) {
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'GET' || !['/', '/companion.html'].includes(req.url)) {
      res.writeHead(404).end('Not found');
      return;
    }
    try {
      const html = await readFile(new URL('./companion.html', import.meta.url));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(html);
    } catch {
      res.writeHead(500).end('Prototype unavailable');
    }
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await servePrototype(30066);
  console.log(`Companion prototype: http://127.0.0.1:${server.address().port}`);
}
