import assert from 'node:assert/strict';

export function checkBoundedCollections(z) {
  for (const kind of ['array', 'set', 'map']) {
    for (const bound of ['max', 'exact']) {
      let visited = 0;
      const element = z.string().transform(value => { visited++; return value; });
      const base = kind === 'array' ? z.array(element)
        : kind === 'set' ? z.set(element) : z.map(element, z.number());
      const schema = bound === 'max' ? base.min(1).max(1)
        : kind === 'array' ? base.length(1) : base.size(1);
      const input = kind === 'array' ? ['a', 'b']
        : kind === 'set' ? new Set(['a', 'b']) : new Map([['a', 1], ['b', 2]]);
      const bad = schema.safeParse(input);
      assert.equal(bad.success, false, kind + '/' + bound);
      assert.deepEqual(bad.error.issues.map(issue => issue.code), ['too_big']);
      assert.equal(visited, 0, kind + '/' + bound + ' must reject before visiting elements');

      const valid = kind === 'array' ? ['a']
        : kind === 'set' ? new Set(['a']) : new Map([['a', 1]]);
      assert.equal(schema.safeParse(valid).success, true);
      assert.ok(visited > 0, 'legitimate elements must still be parsed');
      assert.equal(schema.safeParse(null).success, false);
    }
  }

  let nestedVisits = 0;
  const nested = z.object({ items: z.array(z.string().transform(value => {
    nestedVisits++; return value;
  })).max(1) });
  const bad = nested.safeParse({ items: ['a', 'b'] });
  assert.equal(bad.success, false);
  assert.deepEqual(bad.error.issues.map(issue => ({ code: issue.code, path: issue.path })),
    [{ code: 'too_big', path: ['items'] }]);
  assert.equal(nestedVisits, 0);
  assert.equal(nested.safeParse({ items: ['a'] }).success, true);

  const rewritten = z.array(z.number()).overwrite(values => values.slice(0, 1)).max(1);
  assert.deepEqual(rewritten.parse([1, 2]), [1]);
  assert.deepEqual(z.array(z.string()).parse(['a', 'b']), ['a', 'b']);
}

export function checkCompiledBounds(z) {
  assert.equal(typeof z.compile, 'function');
  for (const kind of ['array', 'set', 'map']) {
    let visited = 0;
    const value = () => ({ get text() { visited++; return 'valid'; } });
    const element = z.object({ text: z.string() });
    const base = kind === 'array' ? z.array(element)
      : kind === 'set' ? z.set(element) : z.map(element, z.number());
    const schema = base.min(1).max(1);
    const compiled = z.compile(schema, { strict: true });
    assert.notEqual(compiled, schema, 'must obtain a compiled clone, without silent fallback');
    const input = kind === 'array' ? [value(), value()]
      : kind === 'set' ? new Set([value(), value()])
        : new Map([[value(), 1], [value(), 2]]);
    assert.equal(compiled.safeParse(input).success, false);
    assert.equal(visited, 0, 'compiled ' + kind + ' must check the cap before reading elements');
    const valid = kind === 'array' ? [value()]
      : kind === 'set' ? new Set([value()]) : new Map([[value(), 1]]);
    assert.equal(compiled.safeParse(valid).success, true);
    assert.ok(visited > 0, 'compiled legitimate control must visit its valid element');
  }
}
