#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { evaluateAuditReports, validateAuditPolicy } from './audit-policy-lib.mjs';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function collectAuditReport(
  root,
  scope,
  spawn = spawnSync,
  npmExecPath = process.env.npm_execpath,
) {
  if (!npmExecPath) {
    return {
      error: { summary: 'npm_execpath is unavailable; run this gate through npm run check:audit' },
      exitCode: null,
    };
  }
  const args = ['audit', '--json', `--audit-level=high`];
  if (scope.omitDev) args.push('--omit=dev');
  const execution = spawn(process.execPath, [npmExecPath, ...args], {
    cwd: path.resolve(root, scope.path),
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
    maxBuffer: 10 * 1024 * 1024,
    shell: false,
    windowsHide: true,
  });
  if (execution.error) {
    return { error: { summary: execution.error.message }, exitCode: execution.status };
  }
  let report;
  try {
    report = JSON.parse(String(execution.stdout ?? '').trim());
  } catch {
    return {
      error: { summary: `npm audit returned invalid JSON (exit ${execution.status ?? 'unknown'})` },
      exitCode: execution.status,
    };
  }
  if (report?.error) return { ...report, exitCode: execution.status };
  if (![0, 1].includes(execution.status)) {
    return {
      error: { summary: `npm audit exited ${execution.status ?? 'without status'}` },
      exitCode: execution.status,
    };
  }
  return { ...report, exitCode: execution.status };
}

export async function runAuditGate(root = packageRoot, spawn = spawnSync, now = new Date()) {
  const policyPath = path.join(root, 'config', 'dependency-audit-policy.json');
  const policy = JSON.parse(await readFile(policyPath, 'utf8'));
  const policyFailures = validateAuditPolicy(policy, now);
  if (policyFailures.length > 0) {
    return { ok: false, policyFailures, reportFailures: [], findings: [], excepted: [], blocking: [] };
  }
  const reports = new Map(
    policy.scopes.map((scope) => [scope.id, collectAuditReport(root, scope, spawn)]),
  );
  return evaluateAuditReports(policy, reports, now);
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  try {
    const result = await runAuditGate();
    for (const finding of result.excepted ?? []) {
      process.stdout.write(
        `EXCEPTION audit ${finding.scope} ${finding.package} ${finding.advisory} ${finding.severity}\n`,
      );
    }
    if (!result.ok) {
      for (const failure of result.policyFailures ?? []) process.stderr.write(`FAIL policy: ${failure}\n`);
      for (const failure of result.reportFailures ?? []) process.stderr.write(`FAIL evidence: ${failure}\n`);
      for (const finding of result.blocking ?? []) {
        process.stderr.write(
          `FAIL audit ${finding.scope} ${finding.package} ${finding.advisory} ${finding.severity}\n`,
        );
      }
      process.exitCode = 1;
    } else {
      process.stdout.write(
        `PASS dependency audit ${result.findings.length} high-or-critical findings, ${result.excepted.length} exceptions\n`,
      );
    }
  } catch (error) {
    process.stderr.write(`FAIL dependency audit: ${error.message}\n`);
    process.exitCode = 1;
  }
}
