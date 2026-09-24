import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { pathsInternals, readBoundedFile } from '../src/paths.mjs';

test('readBoundedFile rejects a non-regular path before opening it', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'project-os-bounded-path-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  await assert.rejects(
    readBoundedFile(root, 64, 'entrada'),
    (error) => error.code === 'EVIDENCE_NOT_REGULAR',
  );
});

test('readBoundedHandle stops at limit plus one when a file grows after fstat', async () => {
  const limit = 64;
  const grownContent = Buffer.alloc(4096, 0x61);
  let totalBytesRead = 0;
  const handle = {
    async stat() {
      return { isFile: () => true, size: 1 };
    },
    async read(buffer, offset, length, position) {
      const bytesRead = Math.min(length, grownContent.length - position, 7);
      grownContent.copy(buffer, offset, position, position + bytesRead);
      totalBytesRead += bytesRead;
      return { bytesRead };
    },
  };

  await assert.rejects(
    pathsInternals.readBoundedHandle(handle, limit, 'recibo'),
    (error) => error.code === 'EVIDENCE_SIZE_LIMIT',
  );
  assert.equal(totalBytesRead, limit + 1);
});
