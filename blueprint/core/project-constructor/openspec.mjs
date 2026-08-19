#!/usr/bin/env node

import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export function openspecEnvironment(environment = process.env) {
  const next = { ...environment };
  if (!Object.prototype.hasOwnProperty.call(environment, 'OPENSPEC_TELEMETRY')) {
    next.OPENSPEC_TELEMETRY = '0';
  }
  return next;
}

export function resolveOpenSpecBinary(moduleUrl = import.meta.url) {
  const projectRoot = path.resolve(path.dirname(fileURLToPath(moduleUrl)), '..');
  return path.join(
    projectRoot,
    'node_modules',
    '@fission-ai',
    'openspec',
    'bin',
    'openspec.js',
  );
}

export function runOpenSpec(args, {
  binary = resolveOpenSpecBinary(),
  environment = process.env,
  exists = existsSync,
  spawn = spawnSync,
  writeError = (message) => process.stderr.write(message),
} = {}) {
  if (!exists(binary)) {
    writeError('FAIL OpenSpec local no está instalado; ejecuta npm ci --ignore-scripts.\n');
    return 1;
  }
  const execution = spawn(process.execPath, [binary, ...args], {
    env: openspecEnvironment(environment),
    shell: false,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (execution.error) {
    writeError(`FAIL OpenSpec local: ${execution.error.message}\n`);
    return 1;
  }
  if (Number.isInteger(execution.status)) return execution.status;
  writeError(`FAIL OpenSpec local terminó sin status (${execution.signal ?? 'sin señal'}).\n`);
  return 1;
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  process.exitCode = runOpenSpec(process.argv.slice(2));
}
