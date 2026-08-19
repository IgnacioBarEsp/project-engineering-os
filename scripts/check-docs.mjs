#!/usr/bin/env node

import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  extractPromptContract,
  routerContractFailures,
  routerParityFailures,
  stagePromptFailures,
} from './prompt-contract.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = await readFile(path.join(root, 'README.md'), 'utf8');
const failures = [];
const links = [...readme.matchAll(/\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g)]
  .map((match) => match[1])
  .filter((href) => !/^[a-z]+:/i.test(href));
for (const href of links) {
  try {
    await access(path.resolve(root, href));
  } catch {
    failures.push(`link ${href}`);
  }
}
for (const command of [
  'npx --yes create-project-engineering-os@0.1.6 bootstrap --target .',
  'project-os upgrade --target . --check',
  'project-os debt check --root .',
  'project-os rollback --target . --transaction <id>',
]) {
  if (!readme.includes(command)) failures.push(`command ${command}`);
}
for (const required of [
  'docs/USER_GUIDE.md',
  'docs/RECOVERY.md',
  'docs/prompts/PROMPT_ROUTER_INICIO.md',
  'docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md',
  'docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md',
  'docs/GUIA_MANUAL_USUARIO.md',
]) {
  try {
    await access(path.join(root, required));
  } catch {
    failures.push(`missing ${required}`);
  }
}

const routerSources = {
  root: 'docs/prompts/PROMPT_ROUTER_INICIO.md',
  blueprint: 'blueprint/core/docs/engineering/PROMPT_ROUTER_INICIO.md',
};
const routerContracts = {};
for (const [label, relative] of Object.entries(routerSources)) {
  try {
    routerContracts[label] = extractPromptContract(await readFile(path.join(root, relative), 'utf8'));
  } catch {
    failures.push(`unreadable ${relative}`);
  }
}
for (const [label, contract] of Object.entries(routerContracts)) {
  for (const failure of routerContractFailures(contract)) {
    failures.push(`router ${label}: ${failure}`);
  }
}
if (routerContracts.root && routerContracts.blueprint) {
  for (const failure of routerParityFailures(routerContracts.root, routerContracts.blueprint)) {
    failures.push(`router parity: ${failure}`);
  }
}
for (const [kind, relative] of [
  ['prompt-00', 'docs/prompts/PROMPT_00_BOOTSTRAP_ENTORNO.md'],
  ['prompt-00', 'blueprint/core/docs/engineering/PROMPT_00_BOOTSTRAP_ENTORNO.md'],
  ['prompt-01', 'docs/prompts/PROMPT_01_DISCOVERY_PROYECTO.md'],
  ['prompt-01', 'blueprint/core/docs/engineering/PROMPT_01_DISCOVERY_PROYECTO.md'],
]) {
  try {
    for (const failure of stagePromptFailures(kind, await readFile(path.join(root, relative), 'utf8'))) {
      failures.push(`${relative}: ${failure}`);
    }
  } catch {
    failures.push(`unreadable ${relative}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`FAIL docs: ${failures.join(', ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`PASS docs ${links.length} README links and prompt contract\n`);
}
