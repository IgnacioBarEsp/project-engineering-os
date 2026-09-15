import assert from 'node:assert/strict';
import { access as defaultAccess, rm as defaultRm } from 'node:fs/promises';
import path from 'node:path';

export const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
};

const defaultSleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const defaultPresent = async file => defaultAccess(file).then(() => true, () => false);

export const waitForRemoval = async (
  target,
  {
    timeoutMs = 60000,
    intervalMs = 500,
    check = defaultPresent,
    sleep = defaultSleep,
  } = {}
) => {
  assert(target, 'Debes especificar target.');
  const deadline = Date.now() + timeoutMs;
  while (await check(target)) {
    if (Date.now() >= deadline) {
      return false;
    }
    if (intervalMs > 0) {
      await sleep(intervalMs);
    }
  }
  return true;
};

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
