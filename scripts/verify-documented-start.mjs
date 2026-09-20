import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// El arranque que el README le pide a quien llega por primera vez. Hasta ahora nadie lo comprobaba: si uno de
// los seis pasos dejara de funcionar contra el paquete publicado, el repositorio no se enteraría (#166).
//
// Los pasos no se copian aquí: se leen del propio README, para que comprobar y documentar no puedan
// separarse. Cambiar el bloque publicado cambia lo que esta comprobación ejecuta.
//
// Necesita red hacia el registro de npm y descarga el paquete publicado, así que no entra en `npm run check`,
// que es offline. Si el registro no responde, esto informa que no pudo ejecutarse; no informa que pasó.
//
//   node scripts/verify-documented-start.mjs <salida.json>

// El bloque `sh` del README que contiene el bootstrap publicado: sus líneas son los pasos, en su orden.
export function documentedSteps(readme) {
  const blocks = [...readme.matchAll(/```sh\n([\s\S]*?)```/g)].map((match) => match[1]);
  const block = blocks.find((text) => /create-project-engineering-os@\d+\.\d+\.\d+ bootstrap/.test(text));
  if (!block) return [];
  // Un comentario del bloque no es un paso: ejecutarlo produciría un fallo que el arranque no tiene.
  return block.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
}

// Leer la salida del doctor. Un esquema que no se reconoce daría cero comprobaciones y cero FAIL, y eso no es
// «ningún FAIL»: es no haber mirado. Se separa para poder probarlo sin ejecutar el doctor.
export function readDoctor(report) {
  const findings = [];
  if (!report) {
    return { record: { parsed: false, checks: null, fails: [] },
      findings: ['El doctor no devolvió un JSON legible; no se puede afirmar que no haya FAIL.'] };
  }
  const checks = Array.isArray(report.checks) ? report.checks
    : Array.isArray(report.results) ? report.results : null;
  if (!checks) findings.push('El doctor devolvió un JSON sin lista de comprobaciones reconocible; no se inspeccionó ninguna.');
  else if (!checks.length) findings.push('El doctor no reportó ninguna comprobación; no se puede afirmar que no haya FAIL.');
  const fails = (checks ?? []).filter((check) => check?.status === 'FAIL').map((check) => check.id ?? check.name);
  if (fails.length) findings.push(`El doctor del proyecto recién sembrado reporta ${fails.length} FAIL: ${fails.join(', ')}.`);
  return { record: { parsed: true, checks: checks ? checks.length : null, fails }, findings };
}

// Un registro no ejecutado no es un PASS. Se separa para poder probar la regla sin tocar la red.
export function verdict({ unreachableRegistry = false, findings = [] } = {}) {
  if (unreachableRegistry) return 'NO EJECUTADA';
  return findings.length ? 'FAIL' : 'PASS';
}

// Solo fallos de red. El nombre del registro aparece en casi cualquier error de npm —un 404 por una versión
// inexistente lo lleva—, y tomarlo por «sin red» convertiría un arranque roto en «no se pudo comprobar».
const OFFLINE = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENETUNREACH|getaddrinfo|network timed out/i;

export async function verifyDocumentedStart(repo) {
  const readme = await readFile(path.join(repo, 'README.md'), 'utf8');
  const steps = documentedSteps(readme);
  const declaredVersion = (steps[0]?.match(/create-project-engineering-os@(\d+\.\d+\.\d+)/) ?? [])[1] ?? null;

  const record = {
    schemaVersion: 1,
    date: new Date().toISOString(),
    source: 'README.md',
    packageVersion: declaredVersion,
    network: 'Requiere el registro de npm. Una ejecución sin red se reporta como no ejecutada, nunca como PASS.',
    platform: `${process.platform} ${os.release()}`,
    node: process.versions.node,
    steps: [],
    findings: [],
  };
  const finding = (value) => record.findings.push(value);
  if (!steps.length) finding('El README no publica un bloque de arranque con create-project-engineering-os; no hay nada que comprobar.');

  // shell: true porque npm y npx son scripts en Windows. El comando viene del README del propio repositorio.
  const run = (command, cwd) => {
    const started = Date.now();
    const result = spawnSync(command, { cwd, encoding: 'utf8', shell: true, windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';
    return {
      stdout,
      stderr,
      step: {
        command,
        exitCode: result.status,
        elapsedMs: Date.now() - started,
        signal: result.signal ?? null,
        error: result.error ? String(result.error.message).split('\n')[0] : null,
        tail: stdout.trim().split('\n').slice(-3).join(' | ').slice(0, 400),
        stderrTail: stderr.trim().split('\n').slice(-3).join(' | ').slice(0, 400),
      },
    };
  };

  let workspace = null;
  try {
    workspace = await mkdtemp(path.join(os.tmpdir(), 'peos-documented-start-'));
    // La documentación dice «en una carpeta Git vacía»: el arranque se comprueba en esa condición.
    const init = run('git init -q', workspace);
    record.steps.push({ ...init.step, documented: false, note: 'Condición previa que el README enuncia en prosa.' });
    if (init.step.exitCode !== 0) finding('No se pudo preparar la carpeta Git vacía que el README pide.');

    for (const command of steps) {
      const { step, stderr, stdout } = run(command, workspace);
      record.steps.push({ ...step, documented: true });
      if (step.exitCode === 0) continue;
      if (OFFLINE.test(`${stderr} ${stdout} ${step.error ?? ''}`)) {
        record.unreachableRegistry = true;
        finding(`No se pudo ejecutar: el registro de npm no respondió en «${command}».`);
      } else {
        finding(`El paso documentado «${command}» salió con código ${step.exitCode}.`);
      }
      break; // Los pasos siguientes dependen del anterior; seguir mediría otra cosa.
    }

    // El doctor puede salir con código 0 y aun así reportar FAIL; el arranque documentado promete cero.
    // Si el README deja de publicar el paso del doctor, esta puerta no se ejecuta. No es un fallo —se
    // comprueba lo documentado—, pero el registro tiene que decir que no se miró, no callar.
    const documentsDoctor = steps.some((command) => /project-os:doctor/.test(command));
    const ranDoctor = record.steps.some((step) => /project-os:doctor/.test(step.command) && step.exitCode === 0);
    if (!documentsDoctor) record.doctor = { documented: false, note: 'El README no publica el paso del doctor; no se inspeccionó.' };
    if (ranDoctor) {
      const { stdout, step } = run('npm run project-os:doctor -- --json', workspace);
      const start = stdout.indexOf('{');
      let report = null;
      if (start >= 0) { try { report = JSON.parse(stdout.slice(start)); } catch { report = null; } }
      const reading = readDoctor(report);
      record.doctor = { exitCode: step.exitCode, ...reading.record };
      for (const value of reading.findings) finding(value);
    }
  } catch (error) {
    finding(`La comprobación no pudo completarse: ${String(error.message).split('\n')[0].slice(0, 300)}`);
  } finally {
    if (workspace) await rm(workspace, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(() => {});
  }

  const documentedRun = record.steps.filter((step) => step.documented);
  record.summary = {
    documentedSteps: steps.length,
    executed: documentedRun.length,
    passed: documentedRun.filter((step) => step.exitCode === 0).length,
    findings: record.findings.length,
    verdict: verdict(record),
  };
  return record;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [output] = process.argv.slice(2);
  if (!output) {
    console.error('Indica el archivo de salida: node scripts/verify-documented-start.mjs <salida.json>');
    process.exit(2);
  }
  const repo = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
  const record = await verifyDocumentedStart(repo);
  await writeFile(output, JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record.summary, null, 2));
  if (record.findings.length) {
    console.error(JSON.stringify(record.findings, null, 2));
    process.exitCode = 1;
  }
}
