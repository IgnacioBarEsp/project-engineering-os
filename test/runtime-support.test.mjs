import assert from 'node:assert/strict';
import test from 'node:test';

import { assertSupportedNode } from '../src/cli.mjs';
import { doctorInternals } from '../src/doctor.mjs';
import {
  isSupportedNode,
  SUPPORTED_NODE_RANGE,
} from '../src/runtime-support.mjs';

test('the shared engine range accepts only the supported Node 22 and 24 LTS floors', () => {
  assert.equal(SUPPORTED_NODE_RANGE, '^22.22.0 || ^24.18.0');
  for (const version of ['v22.22.0', '22.22.1', '22.23.0', '24.18.0', 'v24.19.1', '24.18.0+vendor.1']) {
    assert.equal(isSupportedNode(version), true, version);
    assert.equal(doctorInternals.isSupportedNode(version), true, version);
    assert.doesNotThrow(() => assertSupportedNode(version), version);
  }
});

test('the CLI and doctor reject EOL, below-floor, non-LTS and malformed Node versions', () => {
  for (const version of [
    '20.20.0',
    '21.9.0',
    '22.21.9',
    '23.0.0',
    '24.17.99',
    '25.0.0',
    '26.0.0',
    '24.18.0-rc.1',
    '24.18garbage',
  ]) {
    assert.equal(isSupportedNode(version), false, version);
    assert.equal(doctorInternals.isSupportedNode(version), false, version);
    assert.throws(
      () => assertSupportedNode(version),
      (error) => error.code === 'NODE_VERSION_UNSUPPORTED'
        && error.message.includes('2026-04-30')
        && error.message.includes('Node 24.18.0+ (recomendado)')
        && error.remediation.includes('Node 22.22.0')
        && error.remediation.includes('Node 24.18.0'),
      version,
    );
  }
});
