import test from 'node:test';
import assert from 'node:assert/strict';
import {routeTraversal} from '../scripts/route-traversal.mjs';

test('route traversal compares actual visits with a closed, nonempty declaration', () => {
  assert.deepEqual(routeTraversal(['start', 'help'], ['start', 'help', 'start']).problems, []);
  assert.deepEqual(routeTraversal(['start', 'help'], ['start']).missing, ['help']);
  assert.match(routeTraversal(['start', 'help'], ['start']).problems.join('\n'), /help/);
  const added = routeTraversal(['start', 'help', 'unvisited-route'], ['start', 'help']);
  assert.deepEqual(added.missing, ['unvisited-route']);
  assert.match(added.problems.join('\n'), /unvisited-route/);
  assert.ok(routeTraversal([], []).problems.length);
  assert.deepEqual(routeTraversal(['start', 'help'], []).missing, ['start', 'help']);
  assert.deepEqual(routeTraversal(['start'], ['start', 'undeclared']).unexpected, ['undeclared']);
  assert.match(routeTraversal(['start', 'start'], ['start']).problems.join('\n'), /repetidas/);
});
