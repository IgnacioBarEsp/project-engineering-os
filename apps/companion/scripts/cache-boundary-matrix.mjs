// Component behavior only; fixed time, no network or product-exposure claims.
import { measureCacheReuse } from './http-cache-reuse-matrix.mjs';

export function measureCacheBoundary(Policy) {
  const baseline = measureCacheReuse(Policy), cases = [...baseline.cases], base = 1700000000000;
  const request = { url: 'https://fixture.invalid/item', method: 'GET', headers: { host: 'fixture.invalid', 'x-variant': 'one' } };
  for (const restored of [false, true]) {
    for (const [name, cc, expectedMaxAge] of [
      ['quoted-valid', 'Max-Age="100"', 100], ['zero-valid', 'max-age=0', 0],
      ['duplicate', 'max-age=1, MAX-AGE=3600', 0], ['invalid-suffix', 'max-age=100junk', 0],
      ['invalid-negative', 'max-age=-100', 0], ['invalid-fraction', 'max-age=1.5', 0],
      ['invalid-empty', 'max-age=""', 0], ['missing-duration', 'max-age', 0],
      ['mixed-precedence', 'Max-Age=3600, S-Maxage="1"', 1],
    ]) {
      class Fixed extends Policy { now() { return base; } }
      let policy = new Fixed(request, { status: 200, headers: { 'cache-control': cc, date: new Date(base).toUTCString() } });
      if (restored) {
        const state = JSON.parse(JSON.stringify(policy.toObject()));
        // Legacy v1 parsed maps can contain mixed-case keys independently of resh.
        state.rescc = Object.fromEntries(Object.entries(state.rescc).map(([key, value]) => [key.toUpperCase(), value]));
        policy = Fixed.fromObject(state);
      }
      const observed = { maxAge: policy.maxAge() };
      cases.push({ name: `${name}-${restored ? 'legacy-restored' : 'constructed'}`, classification: 'directive-boundary',
        input: { cc, restored }, expected: { maxAge: expectedMaxAge }, observed, passed: observed.maxAge === expectedMaxAge });
    }
    for (const ignoreCargoCult of [false, true]) {
      let now = base;
      class Fixed extends Policy { now() { return now; } }
      let policy = new Fixed(request, { status: 200, headers: { date: new Date(base).toUTCString(),
        'cache-control': 'pre-check=0, post-check=0, no-cache, no-store, must-revalidate, max-age=1, stale-if-error=60' } }, { ignoreCargoCult });
      if (restored) policy = Fixed.fromObject(JSON.parse(JSON.stringify(policy.toObject())));
      now += 2000;
      const query = { ...request, headers: { ...request.headers, 'cache-control': 'max-stale' } };
      const reuse = policy.satisfiesWithoutRevalidation(query);
      cases.push({ name: `explicit-cargo-cult-${ignoreCargoCult}-${restored}`, classification: 'explicit-override-control',
        input: { ignoreCargoCult, restored }, expected: { reuse: ignoreCargoCult }, observed: { reuse }, passed: reuse === ignoreCargoCult });
    }
  }
  for (const [name, change] of [
    ['url', { url: 'https://fixture.invalid/other' }], ['method', { method: 'POST' }],
    ['host', { headers: { host: 'other.invalid', 'x-variant': 'one' } }],
    ['vary', { headers: { host: 'fixture.invalid', 'x-variant': 'two' } }],
    ['request-no-cache', { headers: { ...request.headers, 'cache-control': 'NO-CACHE=""' } }],
    ['request-no-store', { headers: { ...request.headers, 'cache-control': 'No-Store' } }],
    ['pragma', { headers: { ...request.headers, pragma: 'No-Cache' } }],
  ]) {
    class Fixed extends Policy { now() { return base + 2000; } }
    const policy = new Fixed(request, { status: 200, headers: { vary: 'x-variant',
      'cache-control': 'max-age=0, stale-if-error=60', date: new Date(base).toUTCString() } });
    const query = { ...request, ...change }, reuse = policy._allowsReuseForRequest?.(query) ?? null;
    cases.push({ name: `eligibility-${name}`, classification: 'request-boundary', expected: { reuse: false },
      observed: { reuse }, passed: reuse === false });
  }
  // Confirmed review regressions are retained even when they make a frozen recipe fail.
  // Quoted extension contents are not independent Cache-Control directives.
  for (const [name, cc, age, cookie, expected] of [
    ['quoted-extension-public', 'max-age=100, extension="text, Public, text"', 0, true, { maxAge: 0, reuse: false }],
    ['quoted-extension-duration', 'max-age=100, extension="text, MAX-AGE=1"', 0, false, { maxAge: 100, reuse: true }],
    ['quoted-extension-swr', 'max-age=0, extension="text, Stale-While-Revalidate=60"', 2, false, { reuse: false }],
    ['quoted-extension-sie', 'max-age=0, extension="text, Stale-If-Error=60"', 2, false, { errorReuse: false }],
    ['actual-public-control', 'max-age=100, public', 0, true, { maxAge: 100, reuse: true }],
    ['ordinary-quoted-extension-control', 'max-age=100, extension="ordinary,text"', 0, false, { maxAge: 100, reuse: true }],
  ]) {
    let now = base;
    class Fixed extends Policy { now() { return now; } }
    const policy = new Fixed(request, { status: 200, headers: { 'cache-control': cc,
      date: new Date(base).toUTCString(), ...(cookie ? { 'set-cookie': 'fixture=1' } : {}) } }, { shared: true });
    now += age * 1000;
    const observed = { maxAge: policy.maxAge(), reuse: !!policy.evaluateRequest(request).response,
      errorReuse: !policy.revalidatedPolicy(request, { status: 500, headers: {} }).modified };
    cases.push({ name, classification: cookie ? 'conservative-policy-representation' : 'valid-directive-representation',
      input: { cc, age, cookie }, expected, observed,
      passed: Object.entries(expected).every(([key, value]) => observed[key] === value) });
  }
  {
    class Fixed extends Policy { now() { return base; } }
    const policy = new Fixed(request, { status: 200, headers: { 'cache-control': 'max-age=100', etag: '"fixture"' } });
    const reuse = !!policy.evaluateRequest({ ...request, headers: { ...request.headers, pragma: 'No-Cache' } }).response;
    cases.push({ name: 'ordinary-request-pragma-case', classification: 'request-boundary', expected: { reuse: false },
      observed: { reuse }, passed: reuse === false });
    const updated = policy.revalidatedPolicy({ ...request, url: 'https://fixture.invalid/other' },
      { status: 304, headers: { etag: '"fixture"' } });
    cases.push({ name: 'component-304-url-mismatch', classification: 'revalidation-request-boundary', expected: { matches: false },
      observed: { matches: updated.matches }, passed: updated.matches === false });
    const heuristic = new Fixed(request, { status: 200, headers: { date: new Date(base).toUTCString(),
      'last-modified': new Date(base - 1000000).toUTCString(), etag: '"fixture"' } });
    const expired = heuristic.revalidatedPolicy(request, { status: 304, headers: { etag: '"fixture"',
      expires: new Date(base - 1000).toUTCString() } }).policy;
    const observed = { maxAge: expired.maxAge(), reuse: !!expired.evaluateRequest(request).response };
    cases.push({ name: '304-introduces-past-expires', classification: 'revalidation-expiry-boundary',
      expected: { maxAge: 0, reuse: false }, observed, passed: observed.maxAge === 0 && observed.reuse === false });
  }
  return { ...baseline, cases, passed: cases.every(row => row.passed),
    failingCases: cases.filter(row => !row.passed).map(row => row.name) };
}
