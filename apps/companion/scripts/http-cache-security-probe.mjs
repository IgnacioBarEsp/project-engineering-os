// No network access or secrets. Exercise the component API, not Companion exploitability.
export function probeCacheReuse(CachePolicy) {
  const rows = [];
  const cases = [
    ['shared-cookie', { 'cache-control': 'max-age=3600', 'set-cookie': 'session=synthetic' }, false],
    ['proxy-revalidate', { 'cache-control': 'max-age=0, proxy-revalidate' }, false],
    ['response-no-cache', { 'cache-control': 'no-cache, max-age=3600' }, false],
    ['ordinary-stale', { 'cache-control': 'max-age=1' }, true],
    ['must-revalidate-control', { 'cache-control': 'max-age=0, must-revalidate' }, false],
    ['public-cookie-control', { 'cache-control': 'public, max-age=1', 'set-cookie': 'session=synthetic' }, true],
  ];
  for (const [name, headers, expectedReuse] of cases) {
    let now = 1700000000000;
    class DeterministicPolicy extends CachePolicy { now() { return now; } }
    const original = { url: 'https://fixture.invalid/item', method: 'GET', headers: { host: 'fixture.invalid' } };
    const policy = new DeterministicPolicy(original, { status: 200, headers: {
      date: new Date(now).toUTCString(), ...headers,
    } }, { shared: true });
    now += 2000;
    const request = { ...original, headers: { host: 'fixture.invalid', 'cache-control': 'max-stale=999999' } };
    const reuse = policy.satisfiesWithoutRevalidation(request);
    const decision = policy.evaluateRequest(request);
    rows.push({ name, storable: policy.storable(), maxAge: policy.maxAge(), expectedReuse, observedReuse: reuse,
      passed: reuse === expectedReuse, returnsResponse: Boolean(decision.response),
      revalidationRequired: Boolean(decision.revalidation) });
  }
  return { experiment: 'component-api-synthetic-inputs', targetExposureProven: false,
    cases: rows, passed: rows.every(row => row.passed), failingCases: rows.filter(row => !row.passed).map(row => row.name) };
}
