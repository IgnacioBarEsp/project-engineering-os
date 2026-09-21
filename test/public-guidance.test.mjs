import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { GUIDANCE_FILES, guidanceContractFailures, inspectPublicGuidance } from '../scripts/public-guidance.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = Object.fromEntries(await Promise.all(GUIDANCE_FILES.map(async name => [name, await readFile(path.join(root, name), 'utf8')])));
const hash = createHash('sha256').update(await readFile(path.join(root, 'docs/assets/companion-current-home.png'))).digest('hex');
test('public routes, current source and published download remain distinguishable', async () => {
  assert.deepEqual(await inspectPublicGuidance(root), []);
});
for (const [name, file, mutate, expected] of [
  ['CLI promoted ahead of Companion', 'README.md', text => '```sh\nexample\n```\n' + text, 'companion-first'],
  ['download differs from recorded release', 'README.md', text => text.replaceAll(/companion-v\d+\.\d+\.\d+/g, 'companion-v99.0.0'), 'release identity'],
  ['missing technical route', 'README.md', text => text.replaceAll('](docs/CLI_GUIDE.md)', '](docs/README.md)'), 'entry docs/CLI_GUIDE.md'],
  ['capture presented without its limit', 'README.md', text => text.replaceAll('No es una captura del instalador', 'Captura'), 'visible capture qualifier'],
  ['capture has no immutable source', 'docs/companion/SCREENSHOTS.md', text => text.replace(/\/tree\/[a-f0-9]{40}/, '/tree/main'), 'capture provenance'],
  ['browser capture declared as real window', 'docs/companion/SCREENSHOTS.md', text => text.replaceAll('ventana real de la aplicación', 'renderer real en navegador'), 'capture provenance'],
  ['integrated source presented as delivered', 'docs/PROJECT_STATUS.md', text => text.replaceAll('página final y publicación pendientes', 'página final publicada'), 'delivery distinction'],
]) {
  test(`rejects ${name}`, () => {
    assert.ok(guidanceContractFailures({ ...files, [file]: mutate(files[file]) }, hash).includes(expected));
  });
}
test('rejects altered image bytes', () => {
  assert.ok(guidanceContractFailures(files, '0'.repeat(64)).includes('capture hash'));
});
test('reports broken local links and missing surfaces', async () => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'peos-public-guidance-'));
  try {
    await writeFile(path.join(fixture, 'README.md'), '[Missing](missing.md)\n[Malformed](%nothex)\n[Outside](../outside.md)');
    const failures = await inspectPublicGuidance(fixture);
    assert.ok(failures.includes('link README.md: missing.md'));
    assert.ok(failures.includes('missing docs/USER_GUIDE.md'));
    assert.ok(failures.includes('invalid link encoding README.md: %nothex'));
    assert.ok(failures.includes('outside link README.md'));
  } finally { await rm(fixture, { recursive: true, force: true }); }
});
