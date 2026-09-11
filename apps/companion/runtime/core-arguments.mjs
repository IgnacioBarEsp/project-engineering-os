import { fail } from '../engine/files.mjs';

// The full core CLI includes GitHub, global probes and commands with other path semantics.
// This persistent transport exposes only operations already reviewed by Companion's bridge.
export function projectCoreArguments(args) {
  if (!args.length) return ['--help'];
  if (args.length === 1 && ['--help','-h','--version','-v'].includes(args[0])) return [...args];
  const [command, ...options] = args;
  const allowed = { sync: ['--check','--dry-run','--json'], 'opsx-check': ['--json'], 'opsx-adapt': ['--json'] };
  if (!Object.hasOwn(allowed, command) || options.some(a => !allowed[command].includes(a)) || new Set(options).size !== options.length) {
    fail('TOOL_COMMAND', 'Esta entrada admite sync, opsx-check y opsx-adapt con opciones locales.', 'Usa status para comprobar el entorno. Otros comandos del núcleo necesitan su propia revisión de ejecución y permisos.');
  }
  return [...args];
}
