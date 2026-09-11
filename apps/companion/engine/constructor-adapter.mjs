import { randomUUID } from 'node:crypto';
import { canonicalFolder, hash, json, fail, snapshot, withLock } from './files.mjs';

// The trusted desktop process injects the pinned bundled constructor module. The renderer cannot
// select a module, executable, command or options object for the neutral CLI.
export function createConstructorAdapter(core) {
  if (typeof core?.runBootstrapOrSync !== 'function' || typeof core?.runRollback !== 'function') throw new TypeError('Pinned constructor module required');
  const plans = new Map();
  const planAt = (root, command, adoptProjectSeeds = [], controls = {}) => core.runBootstrapOrSync({ command, targetRoot: root, dryRun: true, adoptProjectSeeds }, controls);
  async function plan(target, command, controls = {}) {
      const root = await canonicalFolder(target);
      try {
        const initial = await planAt(root, command, [], controls);
        let adopted = initial.plan.adoptionCandidates ?? [];
        if (initial.incompleteTransaction) {
          // Re-review the exact prior consent, including a crash after the state was written.
          // Fresh candidates alone can lose those guards once originals are already registered.
          const transaction = initial.incompleteTransaction;
          if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,127}$/.test(transaction)) fail('RECOVERY_INVALID', 'El registro de ingeniería no es válido.');
          const journal = await snapshot(root, `.project-constructor/transactions/${transaction}/journal.json`, 4 * 1024 * 1024);
          let value;
          try { value = JSON.parse(journal.content); } catch { fail('RECOVERY_INVALID', 'No se pudo leer la operación de ingeniería interrumpida.'); }
          if (value?.id !== transaction) fail('RECOVERY_INVALID', 'El registro no corresponde a esta operación.');
          adopted = value.adoptionGuards ?? [];
        }
        // Core validates eligibility, path safety and exact hashes. These originals are shown
        // in the review; only applying its opaque handle conveys this bounded consent.
        const result = await planAt(root, command, adopted, controls), id = randomUUID();
        plans.set(id, { root, command, adopted: structuredClone(adopted), fingerprint: hash(json(result)) });
        if (plans.size > 20) plans.delete(plans.keys().next().value);
        return { id, root, status: result.plan.summary.conflicts ? 'conflict' : 'planned', plan: result.plan, preservedOriginals: adopted.map(({ target }) => target), incompleteTransaction: result.incompleteTransaction };
      } catch (error) {
        if (!error.code) throw error;
        return { root, id: null, status: 'requires-action', code: error.code, message: error.message, action: error.remediation ?? 'Revisa los requisitos de ingeniería.' };
      }
  }
  return {
    plan: (target, controls) => plan(target, 'bootstrap', controls),
    planSync: (target, controls) => plan(target, 'sync', controls),
    async apply(id, controls = {}) {
      const plan = plans.get(id); if (!plan) fail('PLAN_UNKNOWN', 'Vuelve a revisar la preparación de ingeniería.');
      return withLock(plan.root, async () => {
        controls.signal?.throwIfAborted();
        if (hash(json(await planAt(plan.root, plan.command, plan.adopted, controls))) !== plan.fingerprint) fail('PLAN_STALE', 'La preparación de ingeniería cambió después de la revisión.');
        plans.delete(id);
        return core.runBootstrapOrSync({ command: plan.command, targetRoot: plan.root, adoptProjectSeeds: plan.adopted }, controls);
      });
    },
    async verify(target, controls = {}) {
      const root = await canonicalFolder(target);
      try {
        const result = await core.runBootstrapOrSync({ command: 'sync', targetRoot: root, check: true }, controls);
        return { files: result.status === 'IN_SYNC' ? 'prepared' : 'requires-action', workflows: 'not-verified', result };
      } catch (error) {
        if (!error.code) throw error;
        return { files: 'requires-action', workflows: 'not-verified', code: error.code, message: error.message };
      }
    },
    async rollback(target, transactionId, controls = {}) {
      const root = await canonicalFolder(target);
      return withLock(root, () => core.runRollback({ targetRoot: root, transactionId }, controls));
    },
  };
}
