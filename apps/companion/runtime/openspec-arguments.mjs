import path from 'node:path';
import { canonicalFolder, fail } from '../engine/files.mjs';

// Reviewed against the fixed official 1.6.0 command definitions. This project transport
// intentionally excludes global config, stores, feedback and completion installation.
// `view` is excluded too: it opens an interactive dashboard and has no --no-interactive,
// so through a non-interactive child process it would block until the timeout.
const flag = null, name = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/;
const common = { '--help': flag, '-h': flag, '--no-color': flag };
const json = { '--json': flag }, interactive = { '--no-interactive': flag };
const schema = { '--schema': name }, change = { '--change': name };
const validation = { ...json, ...interactive, '--strict': flag };
const show = { ...json, ...interactive, '--requirements': flag, '--no-scenarios': flag, '--requirement': /^[1-9]\d{0,5}$/, '-r': /^[1-9]\d{0,5}$/ };
const commands = {
  init: { positional: 'folder', options: { '--tools': /^(all|none|[a-z][a-z0-9-]*(,[a-z][a-z0-9-]*)*)$/, '--force': flag, '--profile': /^(core|custom)$/ } },
  update: { positional: 'folder', options: { '--force': flag } },
  list: { options: { ...json, '--specs': flag, '--changes': flag, '--sort': /^(recent|name)$/ } },
  status: { options: { ...json, ...schema, ...change } },
  instructions: { positional: 'name', options: { ...json, ...schema, ...change } },
  templates: { options: { ...json, ...schema } }, schemas: { options: json },
  archive: { positional: 'name', options: { ...json, '--yes': flag, '-y': flag, '--skip-specs': flag } },
  validate: { positional: 'name', options: { ...validation, '--all': flag, '--changes': flag, '--specs': flag, '--type': /^(change|spec)$/, '--concurrency': /^[1-9]\d?$/ } },
  show: { positional: 'name', options: { ...show, '--type': /^(change|spec)$/, '--deltas-only': flag, '--requirements-only': flag } },
  'new change': { positional: 'name', required: true, options: { ...json, ...schema, '--description': /^.{1,2000}$/, '--goal': /^.{1,2000}$/ } },
  'change show': { positional: 'name', options: { ...json, ...interactive, '--deltas-only': flag, '--requirements-only': flag } },
  'change list': { options: { ...json, '--long': flag } },
  'change validate': { positional: 'name', options: validation },
  'spec show': { positional: 'name', options: show }, 'spec list': { options: { ...json, '--long': flag } },
  'spec validate': { positional: 'name', options: validation },
  'schema which': { positional: 'name', options: { ...json, '--all': flag } },
  'schema validate': { positional: 'name', options: { ...json, '--verbose': flag } },
};
const reject = () => fail('TOOL_TARGET', 'Esta entrada de OpenSpec está vinculada a la carpeta preparada.', 'Usa los subcomandos locales documentados; revisa por separado cualquier cambio de carpeta, store o configuración global.');

export async function projectOpenSpecArguments(root, supplied) {
  if (!supplied.length) return ['--help'];
  if (supplied.length === 1 && ['--help', '-h', '--version', '-V'].includes(supplied[0])) return [...supplied];
  const args = [...supplied], command = args.shift();
  const key = ['new', 'change', 'spec', 'schema'].includes(command) ? `${command} ${args.shift()}` : command;
  const rule = commands[key]; if (!rule) reject();
  const output = key.split(' '), options = { ...common, ...rule.options }; let positional = false, end = false;
  while (args.length) {
    const arg = args.shift();
    if (arg === '--' && !end) { end = true; continue; }
    if (arg.startsWith('-') && !end) {
      const equal = arg.indexOf('='), option = equal < 0 ? arg : arg.slice(0, equal);
      if (!Object.hasOwn(options, option)) reject();
      const format = options[option]; output.push(option);
      if (format === null) { if (equal >= 0) reject(); }
      else {
        const value = equal < 0 ? args.shift() : arg.slice(equal + 1);
        if (typeof value !== 'string' || !format.test(value) || /[\x00-\x1f\x7f]/.test(value) || value.startsWith('-')) reject();
        output.push(value);
      }
    } else {
      if (!rule.positional || positional) reject(); positional = true;
      if (rule.positional === 'folder') {
        if (await canonicalFolder(path.resolve(root, arg)) !== root) reject();
        output.push(root);
      } else { if (!name.test(arg)) reject(); output.push(arg); }
    }
  }
  if (rule.required && !positional && !output.includes('--help') && !output.includes('-h')) reject();
  if (rule.positional === 'folder' && !positional) output.push(root);
  return output;
}
