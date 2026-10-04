// Deterministic component API matrix. No network, UI claims or Companion exploit simulation.
export function measureCacheReuse(CachePolicy) {
  const rows = [];
  const base = 1700000000000;
  function row(name, { cc = 'max-age=1, stale-while-revalidate=60, stale-if-error=60',
      shared = true, headers = {}, requestHeaders = {}, incoming = 'max-stale=999',
      elapsed = 2000, serialized = false, revalidate, expected, classification = 'normative' } = {}) {
    let now = base;
    class FixedPolicy extends CachePolicy { now() { return now; } }
    const request = { url: 'https://fixture.invalid/item', method: 'GET',
      headers: { host: 'fixture.invalid', ...requestHeaders } };
    const responseHeaders = { date: new Date(base).toUTCString(), etag: '"fixture"', ...headers };
    if (cc !== null) responseHeaders['cache-control'] = cc;
    let policy = new FixedPolicy(request, { status: 200, headers: responseHeaders }, { shared });
    if (serialized) policy = FixedPolicy.fromObject(JSON.parse(JSON.stringify(policy.toObject())));
    const originalSerializationKeys = Object.keys(policy.toObject()).sort();
    if (revalidate) {
      now += 1000;
      policy = policy.revalidatedPolicy(request, { status: revalidate.status,
        headers: { etag: '"fixture"', ...revalidate.headers } }).policy;
    }
    now += elapsed;
    const query = { ...request, headers: { ...request.headers } };
    if (incoming !== null) query.headers['cache-control'] = incoming;
    const decision = policy.evaluateRequest(query);
    const error = policy.revalidatedPolicy(query, { status: 500, headers: {} });
    let disconnected;
    try { disconnected = policy.revalidatedPolicy(query, undefined).policy === policy; }
    catch (error) { disconnected = error.message === 'Response headers missing' ? false : error.message; }
    const observed = {
      reuse: policy.satisfiesWithoutRevalidation(query), response: Boolean(decision.response),
      synchronous: decision.revalidation?.synchronous ?? null,
      swr: policy.useStaleWhileRevalidate(), sie: policy._useStaleIfError(),
      errorReuse: error.policy === policy, disconnectedReuse: disconnected,
      serializationCompatible: JSON.stringify(originalSerializationKeys) === JSON.stringify(Object.keys(policy.toObject()).sort()),
    };
    const passed = Object.entries(expected).every(([key, value]) => observed[key] === value) && observed.serializationCompatible;
    rows.push({ name, classification, input: { cc, shared, headers, requestHeaders, incoming, elapsed, serialized, revalidate },
      expected, observed, passed, storable: policy.storable(), maxAge: policy.maxAge(), ttl: policy.timeToLive() });
  }
  const deny = { reuse: false, response: false, synchronous: true, swr: false, sie: false, errorReuse: false, disconnectedReuse: false };
  const allow = { reuse: true, response: true, synchronous: null, swr: true, sie: true, errorReuse: true, disconnectedReuse: true };
  for (const shared of [true, false]) for (const serialized of [false, true]) for (const incoming of ['max-stale=999', 'max-stale']) {
    const suffix = `${shared ? 'shared' : 'private'}-${serialized ? 'restored' : 'constructed'}-${incoming === 'max-stale' ? 'unbounded' : 'finite'}`;
    for (const directive of ['no-cache', 'No-CaChE', 'no-cache=""', 'must-revalidate', 'Must-Revalidate',
        'no-store', 'No-Store', 'proxy-revalidate', 's-maxage=1']) {
      const restricted = !['proxy-revalidate', 's-maxage=1'].includes(directive) || shared;
      row(`${directive}-${suffix}`, { cc: `max-age=1, ${directive}, stale-while-revalidate=60, stale-if-error=60`,
        shared, serialized, incoming, expected: restricted ? deny : allow });
    }
    row(`ordinary-${suffix}`, { shared, serialized, incoming, expected: allow, classification: 'legitimate-control' });
    row(`cookies-${suffix}`, { shared, serialized, incoming, headers: { 'set-cookie': 'session=synthetic' },
      expected: shared ? deny : allow, classification: shared ? 'conservative-component-policy' : 'legitimate-control' });
  }
  for (const optIn of ['public', 'immutable']) row(`cookie-${optIn}-opt-in`, {
    cc: `max-age=1, ${optIn}, stale-while-revalidate=60, stale-if-error=60`,
    headers: { 'set-cookie': 'session=synthetic' }, expected: allow, classification: 'legitimate-control' });
  row('shared-private-directive', { cc: 'private, max-age=1, stale-while-revalidate=60, stale-if-error=60', expected: deny });
  row('shared-auth-no-permission', { requestHeaders: { authorization: 'synthetic' }, expected: deny });
  row('shared-auth-public', { requestHeaders: { authorization: 'synthetic' },
    cc: 'public, max-age=1, stale-while-revalidate=60, stale-if-error=60', expected: allow, classification: 'legitimate-control' });
  row('private-auth', { shared: false, requestHeaders: { authorization: 'synthetic' }, expected: allow, classification: 'legitimate-control' });
  row('original-request-no-store', { requestHeaders: { 'cache-control': 'no-store' }, expected: deny });
  row('request-no-cache', { incoming: 'no-cache, max-stale', expected: { reuse: false, response: false, errorReuse: false, disconnectedReuse: false } });
  row('request-mixed-no-cache', { incoming: 'No-Cache, max-stale', expected: { reuse: false, response: false, errorReuse: false, disconnectedReuse: false } });
  row('vary-star', { headers: { vary: '*' }, expected: { reuse: false, response: false, errorReuse: false, disconnectedReuse: false } });
  row('vary-matching', { headers: { vary: 'accept' }, requestHeaders: { accept: 'text/plain' }, expected: allow, classification: 'legitimate-control' });
  row('fresh-unrestricted', { cc: 'max-age=3600', elapsed: 2000,
    expected: { reuse: true, response: true, synchronous: null, swr: false, sie: true, errorReuse: true }, classification: 'legitimate-control' });
  row('fresh-smaxage', { cc: 'max-age=3600, s-maxage=100, stale-while-revalidate=60', elapsed: 2000,
    expected: { reuse: true, response: true, swr: true, sie: true, errorReuse: true }, classification: 'legitimate-control' });
  row('fresh-must-existing-strictness', { cc: 'max-age=3600, must-revalidate', elapsed: 2000,
    expected: { reuse: false, response: false, swr: false, sie: true, errorReuse: true }, classification: 'existing-stricter-evaluate-control' });
  row('finite-boundary-equal', { cc: 'max-age=1', elapsed: 2000, incoming: 'max-stale=1',
    expected: { reuse: false, response: false }, classification: 'existing-strict-boundary-control' });
  row('finite-boundary-inside', { cc: 'max-age=1', elapsed: 1999, incoming: 'max-stale=1',
    expected: { reuse: true, response: true }, classification: 'legitimate-control' });
  row('finite-boundary-outside', { cc: 'max-age=1', elapsed: 2001, incoming: 'max-stale=1',
    expected: { reuse: false, response: false }, classification: 'legitimate-control' });
  row('swr-only-route', { incoming: null,
    expected: { reuse: false, response: true, synchronous: false, swr: true, errorReuse: true }, classification: 'legitimate-control' });
  row('swr-window-exact-expiry', { elapsed: 61000, incoming: null,
    expected: { reuse: false, response: false, swr: false, sie: false, errorReuse: false }, classification: 'legitimate-control' });
  for (const status of [304, 200]) {
    for (const [name, cc, headers, classification] of [
      ['no-cache', 'no-cache, max-age=1, stale-while-revalidate=60, stale-if-error=60', {}, 'normative'],
      ['cookie', 'max-age=1, stale-while-revalidate=60, stale-if-error=60', { 'set-cookie': 'session=synthetic' }, 'conservative-component-policy'],
      ['smaxage', 's-maxage=1, max-age=1, stale-while-revalidate=60, stale-if-error=60', {}, 'normative'],
    ]) row(`revalidation-${status}-introduce-${name}`, { cc: status === 304 ? null : 'max-age=1',
      revalidate: { status, headers: { 'cache-control': cc, ...headers } }, expected: deny, classification });
    row(`revalidation-${status}-remove-no-cache`, { cc: 'no-cache, max-age=1',
      revalidate: { status, headers: { 'cache-control': 'max-age=1, stale-while-revalidate=60, stale-if-error=60' } },
      expected: allow, classification: 'legitimate-control' });
  }
  // Required discovery controls: unresolved behavior must block acceptance, not vanish
  // behind passing lower-case directives or successful exact patch application.
  row('mixed-smaxage-earlier-expiry', { cc: 'max-age=3600, S-Maxage=1, stale-while-revalidate=60, stale-if-error=60',
    expected: deny, classification: 'scope-limit-expiry-parsing' });
  row('304-introduces-vary-star', { cc: 'max-age=1, stale-while-revalidate=60, stale-if-error=60',
    revalidate: { status: 304, headers: { vary: '*' } },
    expected: { reuse: false, response: false, errorReuse: false, disconnectedReuse: false },
    classification: 'scope-limit-304-metadata' });
  for (const operation of ['evaluateRequest', 'useStaleWhileRevalidate', '_useStaleIfError', 'revalidatedPolicy']) {
    let armed = false, count = 0;
    class BoundaryPolicy extends CachePolicy { now() { return base + (armed ? (count++ === 0 ? 999 : 1000) : 0); } }
    const request = { url: 'https://fixture.invalid/item', method: 'GET', headers: { host: 'fixture.invalid' } };
    const policy = new BoundaryPolicy(request, { status: 200, headers: { date: new Date(base).toUTCString(),
      'cache-control': 'max-age=1, s-maxage=1, stale-while-revalidate=60, stale-if-error=60' } });
    armed = true;
    const query = { ...request, headers: { host: 'fixture.invalid', 'cache-control': 'max-stale=999' } };
    const reuse = operation === 'evaluateRequest' ? Boolean(policy.evaluateRequest(query).response)
      : operation === 'revalidatedPolicy' ? policy.revalidatedPolicy(query, { status: 500, headers: {} }).policy === policy
        : policy[operation]();
    rows.push({ name: `clock-crosses-expiry-${operation}`, classification: 'temporal-restriction-boundary',
      input: { firstAgeSeconds: 0.999, laterAgeSeconds: 1, operation }, expected: { reuse: false },
      observed: { reuse }, passed: !reuse });
  }
  row('smaxage-still-fresh-boundary', { cc: 'max-age=1, s-maxage=1, stale-while-revalidate=60, stale-if-error=60',
    elapsed: 999, expected: allow, classification: 'legitimate-control' });
  row('smaxage-expired-boundary', { cc: 'max-age=1, s-maxage=1, stale-while-revalidate=60, stale-if-error=60',
    elapsed: 1000, expected: deny, classification: 'normative' });
  return { scope: 'component-api-only', exposureProven: false, cases: rows,
    passed: rows.every(row => row.passed), failingCases: rows.filter(row => !row.passed).map(row => row.name),
    limitations: ['No claim of complete RFC conformance or whole npm correction.', 'Header names must follow the documented lowercase API contract.', 'ignoreCargoCult remains an explicit upstream override; npm caller paths must be validated separately.'] };
}
