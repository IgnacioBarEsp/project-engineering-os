import assert from 'node:assert/strict';
import { rm as defaultRm } from 'node:fs/promises';
import path from 'node:path';

export const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
};

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export const removeDisposableRoot = async ({
  root,
  temporaryBase,
  attempts = 10,
  delayMs = 3000,
  rm = defaultRm,
  sleep = defaultSleep,
} = {}) => {
  assert(root && temporaryBase, 'Debes especificar root y temporaryBase.');
  assert(inside(temporaryBase, root), `El directorio desechable ${root} no está dentro del temporal ${temporaryBase}.`);

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await rm(root, { recursive: true, force: true });
      return { status: 'removed', path: root, attempts: attempt };
    } catch (error) {
      const isLock = error?.code === 'EBUSY' || error?.code === 'EPERM';
      if (!isLock) {
        throw error;
      }
      if (attempt >= attempts) {
        return {
          status: 'locked',
          path: root,
          attempts,
          code: error?.code,
          message: error?.message,
        };
      }
      if (delayMs > 0) {
        await sleep(delayMs);
      }
    }
  }
};
