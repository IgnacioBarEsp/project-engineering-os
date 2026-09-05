import path from 'node:path';
import { stableStringify } from '../json.mjs';
import { fail, planTracker, readDocument, REQUEST_PATH } from './model.mjs';
import { applyTracker, rollbackTracker, verifyTracker } from './workflow.mjs';

export const TRACKER_HELP = `Uso:
  project-os tracker plan [--target <ruta>] [--request <ruta>] [--json]
  project-os tracker apply --plan <ruta> --approval <ruta> [--target <ruta>] [--json]
  project-os tracker verify --plan <ruta> [--target <ruta>] [--json]
  project-os tracker rollback --plan <ruta> --approval <ruta> [--target <ruta>] [--json]

Las rutas de documentos son relativas al target. plan es offline y read-only; su salida JSON es el plan.
verify consulta el proveedor y no escribe. apply/rollback requieren aprobación explícita por operación.
Credenciales solo mediante PROJECT_OS_GITHUB_TOKEN, PROJECT_OS_AZURE_TOKEN o
PROJECT_OS_JIRA_TOKEN + PROJECT_OS_JIRA_EMAIL. Consulte docs/TRACKERS.md.
`;
export async function runTrackerCli(argv) {
  if (argv.includes('--help') || argv.includes('-h')) { process.stdout.write(TRACKER_HELP); return 0; }
  const [command, ...args] = argv;
  const allowed = command === 'plan' ? ['--target', '--request', '--json']
    : command === 'verify' ? ['--target', '--plan', '--json'] : ['--target', '--plan', '--approval', '--json'];
  if (!['plan', 'apply', 'verify', 'rollback'].includes(command)) fail('COMMAND', 'Subcomando tracker inválido.');
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!allowed.includes(key) || Object.hasOwn(options, key)) fail('OPTION', 'Opción desconocida o duplicada.');
    if (key === '--json') options[key] = true;
    else {
      const value = args[++index];
      if (!value || value.startsWith('--')) fail('OPTION', 'Falta valor para una opción.');
      options[key] = value;
    }
  }
  const targetRoot = path.resolve(options['--target'] ?? '.');
  let result;
  if (command === 'plan') result = await planTracker({ targetRoot, requestPath: options['--request'] ?? REQUEST_PATH });
  else {
    if (!options['--plan'] || (['apply', 'rollback'].includes(command) && !options['--approval'])) fail('OPTION', 'Falta el plan o la aprobación de la operación.');
    const plan = (await readDocument(targetRoot, options['--plan'])).value;
    const approval = options['--approval'] ? (await readDocument(targetRoot, options['--approval'])).value : undefined;
    result = await ({ apply: applyTracker, verify: verifyTracker, rollback: rollbackTracker }[command])({ targetRoot, plan, approval });
  }
  if (options['--json']) process.stdout.write(stableStringify(result));
  else if (command === 'plan') process.stdout.write([
    `Tracker: ${result.status}; sugerencia: ${result.suggestion ?? 'ninguna'}`,
    ...result.pending, ...result.operations.map((op) => `${op.id}: ${op.scopes.join(', ')}`),
    result.dataSent, result.cost, result.rollback, 'Use --json para guardar el plan completo y revisarlo antes de aprobar.', '',
  ].join('\n'));
  else process.stdout.write(`${result.status}: ${result.receipt ?? result.reconciliation ?? 'verificación remota'}\n`);
  return result.status === 'FAIL' ? 1 : 0;
}
