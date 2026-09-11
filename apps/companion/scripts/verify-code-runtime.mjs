import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, readFile, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRuntimeManager } from '../runtime/manager.mjs';
import { createCodeGraphEngine, CODE_INDEX } from '../runtime/codegraph.mjs';

// Opt-in local QA against previously reviewed/installed official artifacts. No mock SDK.
const [runtimeRoot, output] = process.argv.slice(2);
assert(runtimeRoot && output, 'Supply the verified runtime cache and an evidence JSON path.');
const manager = await createRuntimeManager({ root: runtimeRoot });
for (const id of ['node','codegraph']) assert.equal((await manager.inspect(id)).status, 'verified');
const root = await realpath(await mkdtemp(path.join(tmpdir(), 'companion-real-code-')));
await writeFile(path.join(root, 'budget.js'), 'export function calculateProjectBudget(hours, rate) { return hours * rate; }\n');
await writeFile(path.join(root, 'Game.cs'), 'public class ResearchGame { public int ComputeScore(int evidence) { return evidence * 2; } }\n');
await mkdir(path.join(root, '.codegraph')); await writeFile(path.join(root, '.codegraph', 'user-index.txt'), 'Keep the user index.');
const engine = createCodeGraphEngine(manager), started = performance.now(), plan = await engine.plan(root, 'software');
assert.equal(plan.downloadBytes, 0);
const result = await engine.apply(plan.id), reopened = createCodeGraphEngine(manager);
assert.equal(result.status, 'verified');
const software = await reopened.search(root, 'calculateProjectBudget'), unity = await reopened.search(root, 'ResearchGame');
assert(software.hits.some(h => h.path === 'budget.js' && h.name === 'calculateProjectBudget'));
assert(unity.hits.some(h => h.path === 'Game.cs' && h.name === 'ResearchGame'));
assert.equal(await readFile(path.join(root, '.codegraph', 'user-index.txt'), 'utf8'), 'Keep the user index.');
const saved = await readFile(path.join(root, CODE_INDEX));
await writeFile(path.join(root, 'budget.js'), 'export function changedBudget() {}');
assert.equal((await reopened.verify(root)).status, 'stale');
await assert.rejects(reopened.search(root, 'calculateProjectBudget'), e => e.code === 'GRAPH_NOT_CURRENT');
assert.deepEqual(await readFile(path.join(root, CODE_INDEX)), saved);
const evidence = { date: new Date().toISOString(), status: 'PASS', root, scope: 'Actual managed Node and CodeGraph SDK; synthetic JS/C# corpus. No native UI/installer or model benchmark.',
  result, software, unity, originalIndexPreserved: true, restartQuery: true, staleSourceRefused: true, elapsedMs: Math.round(performance.now() - started) };
await writeFile(output, JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ status: evidence.status, result, output }));
