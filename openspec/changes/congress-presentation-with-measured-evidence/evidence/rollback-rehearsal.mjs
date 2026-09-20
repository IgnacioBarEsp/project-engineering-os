// Ensayo de rollback del change #165 en un árbol de trabajo aparte.
//   node rollback-165.mjs <repositorio> <commit base> <ruta corta> <salida.json>
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const [repoArgument, base, workPath, out] = process.argv.slice(2);
const repo = path.resolve(repoArgument);
const git = (cwd, ...args) => execFileSync('git', ['-C', cwd, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
const head = git(repo, 'rev-parse', 'HEAD');

const record = {
  date: new Date().toISOString(),
  method: 'git worktree aparte en una ruta corta, git revert --no-commit de los commits del change sobre HEAD, y comprobaciones en el árbol revertido.',
  range: `${base}..${head}`,
  steps: [],
  findings: [],
};
const step = (name, ok, detail = null) => {
  record.steps.push({ name, ok, detail });
  if (!ok) record.findings.push(`${name}${detail ? `: ${detail}` : ''}`);
};

const clean = () => {
  spawnSync('git', ['-C', repo, 'worktree', 'remove', '--force', workPath], { encoding: 'utf8' });
  spawnSync('git', ['-C', repo, 'worktree', 'prune'], { encoding: 'utf8' });
  if (existsSync(workPath)) spawnSync('cmd', ['/c', 'rmdir', '/s', '/q', workPath.split('/').join('\\')], { encoding: 'utf8' });
};

clean();
git(repo, 'worktree', 'add', '--detach', workPath, head);
try {
  const revert = spawnSync('git', ['-C', workPath, 'revert', '--no-commit', `${base}..${head}`], { encoding: 'utf8' });
  const reverted = revert.status === 0 ? git(workPath, 'diff', '--cached', '--name-only').split('\n').filter(Boolean).length : 0;
  step('El revert de los commits del change aplica sin conflictos', revert.status === 0,
    `exit ${revert.status}, ${reverted} rutas revertidas`);

  const added = ['docs/presentations/2026-09-24-congreso.md',
    'openspec/changes/congress-presentation-with-measured-evidence'];
  const present = added.filter(file => existsSync(path.join(workPath, file)));
  step('Desaparecen el guion y el change', present.length === 0,
    present.length ? present.join(', ') : 'ninguno presente');

  const index = readFileSync(path.join(workPath, 'docs', 'README.md'), 'utf8');
  step('El índice de documentación deja de enlazar el guion', !index.includes('presentations/2026-09-24-congreso.md'),
    'sin enlace al guion');

  // Ninguna medición publicada cambia al revertir: el guion solo citaba registros que ya existían.
  const evidence = readFileSync(path.join(workPath, 'docs', 'companion', 'EVIDENCE.md'), 'utf8');
  step('Las mediciones publicadas siguen intactas', evidence.includes('0 / 10') && evidence.includes('versión 0.3.2 instalada'),
    'la página de evidencia conserva las dos corridas');

  const diff = git(workPath, 'diff', base, '--stat');
  step(`El árbol revertido no difiere de ${base}`, diff === '', diff === '' ? 'git diff --stat vacío' : diff.split('\n').slice(-1)[0]);

  const checks = [];
  for (const script of ['scripts/check-docs.mjs', 'scripts/check-neutrality.mjs']) {
    const result = spawnSync(process.execPath, [script], { cwd: workPath, encoding: 'utf8', windowsHide: true });
    checks.push({ script, exitCode: result.status, output: (result.stdout || result.stderr || '').trim().split('\n').pop() });
  }
  step('check-docs y check-neutrality pasan en el árbol revertido', checks.every(check => check.exitCode === 0),
    checks.map(check => check.output).join('; '));
} finally {
  clean();
}

record.note = 'Revertir retira el guion y sus comprobaciones. No cambia ninguna medición publicada: el guion solo '
  + 'cita registros que ya existían antes de este change. El rango no puede incluir el commit que guarda este '
  + 'mismo registro, que es el último del change y solo añade este archivo: revertirlo lo retira a él y nada más.';
record.summary = { steps: record.steps.length, passed: record.steps.filter(step => step.ok).length, findings: record.findings.length };
mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
writeFileSync(path.resolve(out), JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({ range: record.range, ...record.summary, findings: record.findings }, null, 2));
