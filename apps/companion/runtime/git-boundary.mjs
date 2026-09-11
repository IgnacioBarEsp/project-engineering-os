import childProcess from 'node:child_process';
import { syncBuiltinESMExports } from 'node:module';
import path from 'node:path';

// Install only in an owned child process before importing the fixed core. Optional status
// can execute clean/process filters, so it is deliberately not inspected or called clean.
export function installGitBoundary({ target, git, cwd }) {
  const spawnSync = childProcess.spawnSync;
  childProcess.spawnSync = (command, args, options) => {
    if (typeof command === 'string' && ['git', 'git.exe'].includes(path.basename(command).toLowerCase())) {
      if (Array.isArray(args) && args.length === 4 && args[0] === '-C' && args[1] === target && args[2] === 'rev-parse' && args[3] === '--show-toplevel') {
        return spawnSync(git, args, { ...options, cwd, env: process.env, shell: false, windowsHide: true });
      }
      if (Array.isArray(args) && args.length === 5 && args[0] === '-C' && args[1] === target && args[2] === 'status' && args[3] === '--short' && args[4] === '--untracked-files=normal') {
        return { pid: 0, status: 1, signal: null, stdout: '', stderr: 'COMPANION_GIT_STATUS_NOT_INSPECTED', output: [null, '', 'COMPANION_GIT_STATUS_NOT_INSPECTED'] };
      }
      throw Object.assign(new Error('Git operation is outside the reviewed preparation boundary'), { code: 'GIT_OPERATION_REJECTED' });
    }
    return spawnSync(command, args, options);
  };
  syncBuiltinESMExports();
}
