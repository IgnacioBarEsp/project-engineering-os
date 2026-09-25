import test from 'node:test';
import assert from 'node:assert/strict';
import {NAV_IDS, ROUTES, WIZARD_STEPS, routeFor, routeIds} from '../ui/lib/router.mjs';
import {createScreenState} from '../ui/lib/state.mjs';

test('every route has exactly one known destination and a valid wizard step', () => {
  assert.equal(NAV_IDS.length, 4);
  assert.deepEqual(routeIds(), Object.keys(ROUTES));
  for (const [id, route] of Object.entries(ROUTES)) {
    assert.ok(route.breadcrumb, id);
    assert.ok(NAV_IDS.includes(route.nav), id);
    assert.ok(route.step === null || (Number.isInteger(route.step) && route.step >= 0 && route.step < WIZARD_STEPS.length), id);
    assert.deepEqual(routeFor(id), route);
  }
  assert.throws(() => routeFor('unknown'), /Ruta sin declarar/);
  assert.equal(routeFor('workspace', {tab: 'handoff'}).breadcrumb, 'TU PROYECTO / TU IA');
  assert.throws(() => routeFor('workspace', {tab: 'unknown'}), /Pestaña sin declarar/);
});

test('screen state notifies only its subscribers and can unsubscribe', () => {
  const state = createScreenState({home: {selected: false}, wizard: {step: 0}});
  const seen = [];
  const unsubscribe = state.subscribe('wizard', (next, previous) => seen.push([previous.step, next.step]));
  state.update('home', {selected: true});
  state.update('wizard', {step: 1});
  state.set('wizard', state.get('wizard'));
  unsubscribe();
  state.update('wizard', {step: 2});
  assert.deepEqual(seen, [[0, 1]]);
  assert.deepEqual(state.get('home'), {selected: true});
});
