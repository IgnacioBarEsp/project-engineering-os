#!/usr/bin/env node

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readJson } from './release-lib.mjs';
import { waitForRegistryRelease } from './registry-release.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { name, version } = await readJson(path.join(root, 'package.json'));
await waitForRegistryRelease({ name, version });
process.stdout.write(`PASS provenance metadata ${name}@${version}\n`);
