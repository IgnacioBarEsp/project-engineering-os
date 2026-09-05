#!/usr/bin/env node

import { existsSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
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
  const generation = ['init', 'update'].includes(args[0]);
  const temporary = generation ? mkdtempSync(path.join(tmpdir(), 'project-os-openspec-')) : null;
  const env = openspecEnvironment(environment);
  if (temporary) {
    env.XDG_CONFIG_HOME = path.join(temporary, 'config');
    env.CODEX_HOME = path.join(temporary, 'codex');
  }
  let execution;
  try {
    execution = spawn(process.execPath, [binary, ...args], {
      env,
      shell: false,
      stdio: 'inherit',
      windowsHide: true,
    });
  } finally {
    if (temporary && path.dirname(path.resolve(temporary)) === path.resolve(tmpdir())) {
      rmSync(temporary, { recursive: true, force: true });
    }
  }
  if (execution.error) {
    writeError(`FAIL OpenSpec local: ${execution.error.message}\n`);
    return 1;
  }
  if (Number.isInteger(execution.status)) return execution.status;
  writeError(`FAIL OpenSpec local terminó sin status (${execution.signal ?? 'sin señal'}).\n`);
  return 1;
}

if (process.argv[1] && existsSync(process.argv[1])
  && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = runOpenSpec(process.argv.slice(2));
}
