import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateAuditReports,
  extractAuditFindings,
  validateAuditPolicy,
} from '../scripts/audit-policy-lib.mjs';
import { collectAuditReport } from '../scripts/check-audit.mjs';
import {
  openspecEnvironment,
  runOpenSpec,
} from '../blueprint/core/project-constructor/openspec.mjs';

const cleanReport = {
  vulnerabilities: {},
  metadata: {
    vulnerabilities: {
      info: 0,
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      total: 0,
    },
  },
};

function policy(exceptions = []) {
  return {
    schemaVersion: '1.0.0',
    auditLevel: 'high',
    maximumExceptionDays: 30,
    scopes: [
      { id: 'root', path: '.', omitDev: false },
      { id: 'root-runtime', path: '.', omitDev: true },
      { id: 'consumer-blueprint', path: 'blueprint/core', omitDev: false },
    ],
    exceptions,
  };
}

function highReport(packageName = 'fast-uri') {
  return {
    vulnerabilities: {
      [packageName]: {
        severity: 'high',
        via: [{
          source: 123456,
          url: 'https://github.com/advisories/GHSA-7p8r-x3mc-p8w7',
        }],
      },
    },
    metadata: {
      vulnerabilities: { high: 1, critical: 0, total: 1 },
    },
  };
}

function reports(rootReport = cleanReport) {
  return new Map([
    ['root', rootReport],
    ['root-runtime', cleanReport],
    ['consumer-blueprint', cleanReport],
  ]);
}

test('audit policy blocks an injected high advisory', () => {
  const result = evaluateAuditReports(policy(), reports(highReport()), new Date('2026-08-18T12:00:00Z'));
  assert.equal(result.ok, false);
  assert.deepEqual(result.blocking, [{
    scope: 'root',
    package: 'fast-uri',
    advisory: 'GHSA-7P8R-X3MC-P8W7',
    severity: 'high',
  }]);
});

test('transitive audit paths do not duplicate the underlying advisory exception', () => {
  const report = highReport();
  report.vulnerabilities.ajv = {
    severity: 'high',
    via: ['fast-uri'],
  };
  report.metadata.vulnerabilities.high = 2;
  report.metadata.vulnerabilities.total = 2;
  assert.deepEqual(extractAuditFindings(report, 'root'), [{
    scope: 'root',
    package: 'fast-uri',
    advisory: 'GHSA-7P8R-X3MC-P8W7',
    severity: 'high',
  }]);
});

test('audit exception matches only its exact scope, package and advisory', () => {
  const exception = {
    scope: 'root',
    package: 'fast-uri',
    advisory: 'GHSA-7P8R-X3MC-P8W7',
    reason: 'Upstream fix is pending and the affected path is not reachable.',
    owner: 'security-owner',
    approvedBy: 'repository-owner',
    createdOn: '2026-08-18',
    expiresOn: '2026-08-25',
    recovery: 'Upgrade the fixed transitive dependency and remove this exception.',
  };
  const accepted = evaluateAuditReports(
    policy([exception]),
    reports(highReport()),
    new Date('2026-08-18T12:00:00Z'),
  );
  assert.equal(accepted.ok, true);
  assert.equal(accepted.excepted.length, 1);

  const unrelated = evaluateAuditReports(
    policy([{ ...exception, scope: 'consumer-blueprint' }]),
    reports(highReport()),
    new Date('2026-08-18T12:00:00Z'),
  );
  assert.equal(unrelated.ok, false);
  assert.equal(unrelated.blocking.length, 1);
});

test('expired, overlong and malformed exceptions fail policy validation', () => {
  const base = {
    scope: 'root',
    package: 'fast-uri',
    advisory: 'GHSA-7P8R-X3MC-P8W7',
    reason: 'Temporary upstream wait.',
    owner: 'security-owner',
    approvedBy: 'repository-owner',
    createdOn: '2026-07-01',
    expiresOn: '2026-08-01',
    recovery: 'Upgrade and remove the exception.',
  };
  const failures = validateAuditPolicy(policy([base]), new Date('2026-08-18T12:00:00Z'));
  assert.equal(failures.some((failure) => failure.includes('exceeds 30 days')), true);
  assert.equal(failures.some((failure) => failure.includes('expired exception')), true);

  const malformed = validateAuditPolicy(
    policy([{ ...base, owner: '', createdOn: '2026-02-30' }]),
    new Date('2026-07-02T12:00:00Z'),
  );
  assert.equal(malformed.some((failure) => failure.includes('incomplete exception')), true);
  assert.equal(malformed.some((failure) => failure.includes('invalid dates')), true);

  const future = validateAuditPolicy(
    policy([{ ...base, createdOn: '2026-08-20', expiresOn: '2026-08-25' }]),
    new Date('2026-08-18T12:00:00Z'),
  );
  assert.equal(future.some((failure) => failure.includes('starts in the future')), true);
});

test('missing audit metadata or registry errors cannot become PASS', () => {
  assert.throws(
    () => extractAuditFindings({ vulnerabilities: {} }, 'root'),
    /no vulnerability metadata/,
  );
  const result = evaluateAuditReports(
    policy(),
    new Map([
      ['root', { error: { summary: 'registry unavailable' } }],
      ['root-runtime', cleanReport],
      ['consumer-blueprint', cleanReport],
    ]),
  );
  assert.equal(result.ok, false);
  assert.deepEqual(result.reportFailures, ['root: registry unavailable']);

  const collected = collectAuditReport('.', { path: '.', omitDev: false }, () => ({
    status: 1,
    stdout: 'not-json',
    stderr: '',
  }), 'npm-cli.js');
  assert.match(collected.error.summary, /invalid JSON/);
});

test('OpenSpec wrapper defaults telemetry off and preserves explicit choice', () => {
  assert.equal(openspecEnvironment({ SAMPLE: '1' }).OPENSPEC_TELEMETRY, '0');
  assert.equal(
    openspecEnvironment({ OPENSPEC_TELEMETRY: '1' }).OPENSPEC_TELEMETRY,
    '1',
  );
});

test('OpenSpec wrapper rejects missing binary and propagates child status', () => {
  assert.equal(runOpenSpec([], {
    binary: 'missing',
    exists: () => false,
    writeError: () => {},
  }), 1);
  let captured;
  const status = runOpenSpec(['status'], {
    binary: 'openspec.js',
    environment: {},
    exists: () => true,
    spawn: (command, args, options) => {
      captured = { command, args, options };
      return { status: 17 };
    },
  });
  assert.equal(status, 17);
  assert.equal(captured.command, process.execPath);
  assert.deepEqual(captured.args, ['openspec.js', 'status']);
  assert.equal(captured.options.shell, false);
  assert.equal(captured.options.env.OPENSPEC_TELEMETRY, '0');
});
