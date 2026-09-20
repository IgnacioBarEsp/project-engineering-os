// Criterio 4 de la prueba 2 (#166): que las pruebas de cada vía **detecten** una regresión. En el árbol de
// cada vía se restaura el detector original y se ejecuta su propia suite: si pasa, sus pruebas no cubren lo
// que arregló y la regresión entraría sin que nadie se entere. El árbol se deja como estaba.
//   node evaluate-regression.mjs <base> <via-a> <via-b> <salida.json>
import { spawnSync } from 'node:child_process';
import { copyFileSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [base, viaA, viaB, out] = process.argv.slice(2);
const baselineReadiness = path.join(path.resolve(base), 'src', 'readiness.mjs');
const result = { date: new Date().toISOString(),
  method: 'En el árbol de cada vía se restaura el detector original y se ejecuta su propia suite de readiness. Si pasa, sus pruebas no cubren lo que arregló.',
  arms: {} };

const suite = (tree) => {
  const run = spawnSync(process.execPath, ['--test', 'test/readiness.test.mjs'],
    { cwd: tree, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024, timeout: 10 * 60 * 1000 });
  const number = (label) => Number((run.stdout.match(new RegExp(`^[^\\n]*${label} (\\d+)`, 'm')) ?? [])[1] ?? 0);
  const failures = [...run.stdout.matchAll(/^not ok \d+ - (.+)$/gm)].map(match => match[1].trim()).slice(0, 6);
  return { exitCode: run.status, tests: number('tests'), pass: number('pass'), fail: number('fail'), failures };
};

for (const [name, treeArgument] of [['via-a', viaA], ['via-b', viaB]]) {
  const tree = path.resolve(treeArgument);
  const readiness = path.join(tree, 'src', 'readiness.mjs');
  const saved = readFileSync(readiness);
  const withTheirFix = suite(tree);
  let withOldDetector;
  try {
    copyFileSync(baselineReadiness, readiness);
    withOldDetector = suite(tree);
  } finally {
    writeFileSync(readiness, saved);
  }
  result.arms[name] = { withTheirFix, withOldDetector,
    detectsRegression: withTheirFix.exitCode === 0 && withOldDetector.exitCode !== 0 };
}

mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result.arms, null, 2));
