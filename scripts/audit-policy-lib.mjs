const severityRank = new Map([
  ['info', 0],
  ['low', 1],
  ['moderate', 2],
  ['high', 3],
  ['critical', 4],
]);

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function utcDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return Number.NaN;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (Number.isNaN(timestamp)) return Number.NaN;
  return new Date(timestamp).toISOString().slice(0, 10) === value
    ? timestamp
    : Number.NaN;
}

function advisoryIdentity(via) {
  if (!via || typeof via !== 'object') return null;
  const ghsa = String(via.url ?? '').match(/GHSA-[0-9A-Za-z-]+/i)?.[0];
  if (ghsa) return ghsa.toUpperCase();
  if (Number.isInteger(via.source) || nonEmptyString(via.source)) {
    return `npm:${String(via.source)}`;
  }
  return null;
}

export function validateAuditPolicy(policy, now = new Date()) {
  const failures = [];
  if (policy?.schemaVersion !== '1.0.0') failures.push('schemaVersion must be 1.0.0');
  if (policy?.auditLevel !== 'high') failures.push('auditLevel must be high');
  if (!Number.isInteger(policy?.maximumExceptionDays) || policy.maximumExceptionDays < 1) {
    failures.push('maximumExceptionDays must be a positive integer');
  }
  if (!Array.isArray(policy?.scopes) || policy.scopes.length === 0) {
    failures.push('scopes must be a non-empty array');
  }
  const scopeIds = new Set();
  for (const scope of policy?.scopes ?? []) {
    if (
      !nonEmptyString(scope?.id)
      || !/^[a-z0-9][a-z0-9-]*$/.test(scope.id)
      || !['.', 'blueprint/core'].includes(scope?.path)
      || typeof scope?.omitDev !== 'boolean'
    ) {
      failures.push(`invalid scope ${scope?.id ?? '<missing>'}`);
      continue;
    }
    if (scopeIds.has(scope.id)) failures.push(`duplicate scope ${scope.id}`);
    scopeIds.add(scope.id);
  }
  if (!Array.isArray(policy?.exceptions)) {
    failures.push('exceptions must be an array');
    return failures;
  }

  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const exceptionKeys = new Set();
  for (const exception of policy.exceptions) {
    const label = `${exception?.scope ?? '<scope>'}/${exception?.package ?? '<package>'}/${exception?.advisory ?? '<advisory>'}`;
    if (
      !scopeIds.has(exception?.scope)
      || !nonEmptyString(exception?.package)
      || !nonEmptyString(exception?.advisory)
      || !nonEmptyString(exception?.reason)
      || !nonEmptyString(exception?.owner)
      || !nonEmptyString(exception?.approvedBy)
      || !nonEmptyString(exception?.recovery)
    ) {
      failures.push(`incomplete exception ${label}`);
    }
    const created = utcDay(exception?.createdOn);
    const expires = utcDay(exception?.expiresOn);
    if (Number.isNaN(created) || Number.isNaN(expires) || expires < created) {
      failures.push(`invalid dates for exception ${label}`);
    } else {
      const lifetimeDays = Math.round((expires - created) / 86_400_000) + 1;
      if (lifetimeDays > policy.maximumExceptionDays) {
        failures.push(`exception exceeds ${policy.maximumExceptionDays} days: ${label}`);
      }
      if (created > today) failures.push(`exception starts in the future: ${label}`);
      if (expires < today) failures.push(`expired exception ${label}`);
    }
    const key = `${exception?.scope}\u0000${exception?.package}\u0000${exception?.advisory}`;
    if (exceptionKeys.has(key)) failures.push(`duplicate exception ${label}`);
    exceptionKeys.add(key);
  }
  return failures;
}

export function extractAuditFindings(report, scope, threshold = 'high') {
  const minimum = severityRank.get(threshold);
  if (
    minimum === undefined
    || !report?.vulnerabilities
    || typeof report.vulnerabilities !== 'object'
    || !report?.metadata?.vulnerabilities
    || typeof report.metadata.vulnerabilities !== 'object'
  ) {
    throw new Error(`Audit report for ${scope} has no vulnerability metadata.`);
  }
  const vulnerabilities = report.vulnerabilities;
  const resolvesToIdentifiedAdvisory = (packageName, visited = new Set()) => {
    if (visited.has(packageName)) return false;
    const vulnerability = vulnerabilities[packageName];
    if (!vulnerability) return false;
    const nextVisited = new Set(visited).add(packageName);
    if ((vulnerability.via ?? []).some((via) => advisoryIdentity(via))) return true;
    return (vulnerability.via ?? []).some((via) => (
      typeof via === 'string' && resolvesToIdentifiedAdvisory(via, nextVisited)
    ));
  };
  const findings = [];
  for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
    const rank = severityRank.get(vulnerability?.severity);
    if (rank === undefined || rank < minimum) continue;
    const identities = new Set(
      (vulnerability.via ?? []).map(advisoryIdentity).filter(Boolean),
    );
    if (identities.size === 0) {
      const resolved = (vulnerability.via ?? []).some((via) => (
        typeof via === 'string' && resolvesToIdentifiedAdvisory(via)
      ));
      if (!resolved) identities.add(`unidentified:${packageName}`);
    }
    for (const advisory of identities) {
      findings.push({
        scope,
        package: packageName,
        advisory,
        severity: vulnerability.severity,
      });
    }
  }
  const declaredHigh = Number(report.metadata.vulnerabilities.high ?? 0)
    + Number(report.metadata.vulnerabilities.critical ?? 0);
  if (declaredHigh > 0 && findings.length === 0) {
    throw new Error(`Audit report for ${scope} declares high risk without an identifiable advisory.`);
  }
  return findings.sort((left, right) => (
    `${left.scope}/${left.package}/${left.advisory}`
      .localeCompare(`${right.scope}/${right.package}/${right.advisory}`)
  ));
}

export function evaluateAuditReports(policy, reports, now = new Date()) {
  const policyFailures = validateAuditPolicy(policy, now);
  if (policyFailures.length > 0) {
    return { ok: false, policyFailures, findings: [], excepted: [], blocking: [] };
  }
  const findings = [];
  const reportFailures = [];
  for (const scope of policy.scopes) {
    const report = reports.get(scope.id);
    if (!report || report.error) {
      reportFailures.push(`${scope.id}: ${report?.error?.summary ?? 'audit evidence missing'}`);
      continue;
    }
    try {
      findings.push(...extractAuditFindings(report, scope.id, policy.auditLevel));
    } catch (error) {
      reportFailures.push(error.message);
    }
  }
  const excepted = [];
  const blocking = [];
  for (const finding of findings) {
    const exception = policy.exceptions.find((candidate) => (
      candidate.scope === finding.scope
      && candidate.package === finding.package
      && candidate.advisory === finding.advisory
    ));
    (exception ? excepted : blocking).push(finding);
  }
  return {
    ok: reportFailures.length === 0 && blocking.length === 0,
    policyFailures,
    reportFailures,
    findings,
    excepted,
    blocking,
  };
}
