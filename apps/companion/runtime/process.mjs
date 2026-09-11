import { spawn } from 'node:child_process';
import path from 'node:path';
import { lstat, realpath } from 'node:fs/promises';
import { fail, PreparationError } from '../engine/files.mjs';

export function isolatedEnvironment({ home, pathEntries = [], platform = process.platform, system = process.env }) {
  const windows = system.SystemRoot ?? system.SYSTEMROOT ?? 'C:\\Windows';
  return {
    ...(platform === 'win32' ? { SystemRoot: windows, WINDIR: windows, COMSPEC: path.join(windows, 'System32', 'cmd.exe'), PATHEXT: '.COM;.EXE;.BAT;.CMD' } : {}),
    PATH: [...pathEntries, ...(platform === 'win32' ? [path.join(windows, 'System32')] : ['/usr/bin', '/bin'])].join(platform === 'win32' ? ';' : ':'),
    HOME: home, USERPROFILE: home, APPDATA: path.join(home, 'AppData', 'Roaming'), LOCALAPPDATA: path.join(home, 'AppData', 'Local'),
    TEMP: home, TMP: home, TMPDIR: home, XDG_CONFIG_HOME: path.join(home, '.config'), XDG_CACHE_HOME: path.join(home, '.cache'),
    CI: '1', NO_COLOR: '1', FORCE_COLOR: '0', DO_NOT_TRACK: '1', CODEGRAPH_TELEMETRY: '0',
    CODEGRAPH_NO_UPDATE_CHECK: '1', CODEGRAPH_NO_DOWNLOAD: '1', NODE_DISABLE_COMPILE_CACHE: '1',
    OPENSPEC_TELEMETRY: '0', GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: platform === 'win32' ? 'NUL' : '/dev/null',
    GIT_TERMINAL_PROMPT: '0', GCM_INTERACTIVE: 'never',
    // Local Git configuration can invoke a filesystem monitor even during status. These
    // command-scope values override repository settings without modifying them.
    GIT_CONFIG_COUNT: '3', GIT_CONFIG_KEY_0: 'core.fsmonitor', GIT_CONFIG_VALUE_0: 'false',
    GIT_CONFIG_KEY_1: 'core.hooksPath', GIT_CONFIG_VALUE_1: path.join(home, 'disabled-hooks'),
    GIT_CONFIG_KEY_2: 'core.untrackedCache', GIT_CONFIG_VALUE_2: 'false',
  };
}

// Internal primitive: named trusted operations choose executable, arguments, cwd and environment.
// Nothing from this function is exposed over IPC. Spawn always bypasses the shell.
export async function runFixedProcess({ executable, args, cwd, env, signal, timeoutMs = 120000, maxOutputBytes = 1024 * 1024 }) {
  signal?.throwIfAborted();
  if (!path.isAbsolute(executable) || !path.isAbsolute(cwd) || !Array.isArray(args)
    || args.some(v => typeof v !== 'string' || v.includes('\0'))) fail('PROCESS_INVALID', 'La operación de herramienta no es válida.');
  const stat = await lstat(executable);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink > 1 || await realpath(executable) !== executable) fail('PROCESS_UNTRUSTED', 'La herramienta dejó de ser un archivo regular verificado.');
  return new Promise((resolve, reject) => {
    const output = [], errors = []; let bytes = 0, failure, ended = false, timer;
    const child = spawn(executable, args, { cwd, env, windowsHide: true, shell: false, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    const stop = (code, message) => {
      if (ended || failure) return;
      failure = new PreparationError(code, message, 'Se conservó el trabajo completado. Revisa el estado antes de volver a intentarlo.');
      if (!child.pid || child.exitCode !== null) return;
      if (process.platform === 'win32') {
        const killer = spawn(path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'taskkill.exe'), ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, shell: false, stdio: 'ignore' });
        killer.on('error', () => { if (!ended) child.kill('SIGKILL'); });
        killer.on('exit', code => { if (code && !ended) child.kill('SIGKILL'); });
      } else { try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); } }
    };
    const abort = () => stop('CANCELLED', 'La preparación se detuvo a petición tuya.');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    timer = setTimeout(() => stop('PROCESS_TIMEOUT', 'La herramienta tardó más de lo permitido.'), timeoutMs);
    const collect = destination => chunk => {
      bytes += chunk.length;
      if (bytes > maxOutputBytes) stop('PROCESS_OUTPUT_LIMIT', 'La herramienta produjo más salida de la permitida.');
      else destination.push(chunk);
    };
    child.stdout.on('data', collect(output)); child.stderr.on('data', collect(errors));
    const finish = error => {
      if (ended) return; ended = true; clearTimeout(timer); signal?.removeEventListener('abort', abort);
      if (error || failure) { reject(failure ?? error); return; }
      const stdout = Buffer.concat(output).toString('utf8'), stderr = Buffer.concat(errors).toString('utf8');
      if (child.exitCode !== 0) {
        const error = new PreparationError('PROCESS_FAILED', 'Una herramienta no pudo completar la preparación.', 'Revisa el diagnóstico de esta etapa y vuelve a intentarlo.');
        error.details = { exitCode: child.exitCode, stdout, stderr }; reject(error);
      } else resolve({ exitCode: 0, stdout, stderr });
    };
    child.on('error', finish); child.on('close', () => finish());
  });
}
