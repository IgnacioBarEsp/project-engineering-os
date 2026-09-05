import { fileURLToPath } from 'node:url';
import { isConfigured } from '../src/debt/store.mjs';
import { checkState } from '../src/debt/gates.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const checks = isConfigured(root) ? checkState({ root }).checks
  : [{ status: 'FAIL', summary: 'Upstream debt configuration is required.' }];
for (const check of checks) console.log(`${check.status} ${check.summary}`);
if (checks.some((check) => check.status === 'FAIL')) process.exitCode = 1;
