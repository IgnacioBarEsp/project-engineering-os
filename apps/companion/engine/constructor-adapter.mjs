import { randomUUID } from 'node:crypto';
import { canonicalFolder, hash, json, fail, withLock } from './files.mjs';

// The trusted desktop process injects the pinned bundled constructor module. The renderer cannot
// select a module, executable, command or options object for the neutral CLI.
export function createConstructorAdapter(core) {
  if (typeof core?.runBootstrapOrSync !== 'function' || typeof core?.runRollback !== 'function') throw new TypeError('Pinned constructor module required');
  const plans = new Map();
  const planAt = root => core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: root, dryRun: true });
  return {
    async plan(target) {
      const root = await canonicalFolder(target);
      try {
        const result = await planAt(root), id = randomUUID();
        plans.set(id, { root, fingerprint: hash(json(result)) });
        if (plans.size > 20) plans.delete(plans.keys().next().value);
        return { id, root, status: result.plan.summary.conflicts ? 'conflict' : 'planned', plan: result.plan, incompleteTransaction: result.incompleteTransaction };
      } catch (error) {
        if (!error.code) throw error;
        return { root, id: null, status: 'requires-action', code: error.code, message: error.message, action: error.remediation ?? 'Revisa los requisitos de ingeniería.' };
      }
    },
    async apply(id) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'Vuelve a revisar la preparación de ingeniería.');
      return withLock(plan.root, async () => {
        if (hash(json(await planAt(plan.root))) !== plan.fingerprint) fail('PLAN_STALE', 'La preparación de ingeniería cambió después de la revisión.');
        plans.delete(id);
        return core.runBootstrapOrSync({ command: 'bootstrap', targetRoot: plan.root });
      });
    },
    async verify(target) {
      const root = await canonicalFolder(target);
      try {
        const result = await core.runBootstrapOrSync({ command: 'sync', targetRoot: root, check: true });
        return { files: result.status === 'IN_SYNC' ? 'prepared' : 'requires-action', workflows: 'not-verified', result };
      } catch (error) {
        if (!error.code) throw error;
        return { files: 'requires-action', workflows: 'not-verified', code: error.code, message: error.message };
      }
    },
    async rollback(target, transactionId) {
      const root = await canonicalFolder(target);
      return withLock(root, () => core.runRollback({ targetRoot: root, transactionId }));
    },
  };
}
