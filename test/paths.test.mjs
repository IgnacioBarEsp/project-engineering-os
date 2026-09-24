import assert from 'node:assert/strict';
import test from 'node:test';

import { pathsInternals } from '../src/paths.mjs';

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
