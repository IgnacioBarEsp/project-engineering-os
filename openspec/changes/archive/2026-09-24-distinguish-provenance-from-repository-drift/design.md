## Context

Consumer state stores a `packageHash` alongside blueprint, configuration, active-profile and state-format metadata. `buildPlan` currently folds a state-only package hash change into `hasDrift`; `sync --check` then returns `DRIFT`/1, and the CLI prints only `state=update`. This confuses distributor identity with consumer repository changes and can fail the documented `project-os:check` chain.

The existing allowlisted distribution identity remains intact. This change only alters read-only sync-check classification and its diagnostics; mutating sync, upgrade, state schema and transaction execution keep their current behavior.

## Goals / Non-Goals

**Goals:**

- Make tracked state differences actionable in JSON and human output.
- Treat a package-hash-only difference, under the issue's same-version/blueprint/configuration/profile/state-format conditions, as an informational result with successful exit.
- Preserve exit code 1 for actual file, configuration or other state drift.
- Document statuses, exit codes and recovery.

**Non-Goals:**

- Removing or weakening `packageHash` verification.
- Changing state schema/version, applying a state repair during check, or modifying transaction/upgrade behavior.
- Implementing the command manifest assigned to issue #157.

## Decisions

1. **Represent state metadata deltas as a stable JSON list.** Each changed field has `field`, `saved` and `observed` values. Keep this separate from file operations so a caller can tell metadata drift from planned file writes. Human output uses the same values and field names. Alternatives were embedding metadata in synthetic operations (misrepresents file writes) or printing only a generic state flag (not actionable).

2. **Classify only read-only `sync --check` as `PROVENANCE_MISMATCH`.** It applies only when `packageHash` is the sole reported state-field change, no managed operations/conflicts/incomplete transaction exist, and the saved/observed package version, blueprint hash, configuration hash, active profiles and state format match. Report exit code 0, `hasDrift: false`, an empty operations list and an informational message. Other checks and applying commands retain their established behavior. A new exit code was rejected because automation should not fail when no repository repair is needed; a human/agent still sees a distinct status and warning.

3. **Retain the pre-migration state-format value for diagnostics.** Existing v0/v1 state is normalized before planning. The first state migration's `from` value is the persisted value, while the proposed state holds the current format. A pending state migration counts as a state update so `sync --check` reports `DRIFT` and a mutating sync can persist the already-defined migration; the schema and migration mapping do not change.

4. **Keep documentation in the current change and command-manifest publication in #157.** `CLI_GUIDE.md` and `RECOVERY.md` define the stable public behavior here. The separate #157 command manifest will consume the four exit-code meanings when that issue is implemented; this change does not advance its scope.

## Risks / Trade-offs

- [Consumers may assume only two status strings] → Keep `IN_SYNC` and `DRIFT` semantics, use exit 0 for the new informational status, document it, and add JSON/human contract tests.
- [Misclassification could hide real drift] → Require no material file changes, conflicts or incomplete transaction and require `packageHash` to be the sole state delta plus all identity guard fields to match.
- [Older state was migrated before comparison] → Derive saved format from the first migration record and cover legacy-state diagnostics.

## Migration Plan

No consumer migration is required. Checks remain read-only. If the implementation misclassifies any real drift, revert the PR; consumer state and files are unchanged by `sync --check`.

## Open Questions

None. The status and exit behavior are resolved above.
