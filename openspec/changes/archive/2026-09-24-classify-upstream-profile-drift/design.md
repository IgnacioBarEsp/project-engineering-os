## Context

On `main` at `6763040`, the blueprint defaults in `blueprint/manifest.json` and the seeded
`.project-constructor/config.json` are `documentation,harness-tooling`. The upstream-owned
`.project-os/profiles.json` activates those base profiles plus `ui`, `auth-security`, and `library-cli`,
each backed by an existing decision. The repository has no `.project-constructor/config.json`: upstream
operations explicitly prohibit bootstrapping this repository as if it were a consumer.

`materializeHarnessBlueprint` currently loads the consumer defaults and compares them to the canonical
project-owned profile catalog. That comparison is valid for a consumer, but invalid for the upstream's
separately-owned policy. Both `sync --check` and `upgrade --check` consequently return
`PROJECT_OS_PROFILE_SELECTION_DRIFT` before a plan. The doctor already uses the pair of
`repositoryKind: upstream` and package identity to classify consumer-shape checks.

## Goals / Non-Goals

**Goals:**

- Return an explicit successful `SKIP` for upstream read-only `sync --check` and `upgrade --check`.
- Require both the upstream governance marker and exact package identity.
- Keep consumer profile drift fail-closed, with the same IDs, cause, and remediation.
- Keep `sync --dry-run`, `sync` apply, and `upgrade --apply` on the strict planning path.
- Make the no-plan/no-mutation result visible in JSON and human output.

**Non-Goals:**

- Changing upstream profile activation, decisions, or consumer defaults.
- Running bootstrap or mutating sync/upgrade on the upstream.
- Suppressing independent consumer ownership conflicts or changing doctor behavior from #115.
- Making a generic consumer with one upstream marker or a matching package name eligible for SKIP.

## Decisions

1. **Use two independent identity signals.** A target is the upstream only if
   `.project-os/repository-governance.json` declares `repositoryKind: upstream` and `package.json` names
   `create-project-engineering-os`. This matches the existing doctor contract. Missing or nonmatching
   values retain normal consumer behavior; malformed JSON fails closed.

2. **Skip only read-only checks, before plan construction.** `sync --check` and `upgrade --check` have no
   consumer layout to validate in the upstream. They return `status: SKIP`, exit 0, `mutationPerformed: false`,
   no plan, and a reason directing verification to consumer fixtures. Skipping before planning avoids
   misreporting known upstream-owned files as consumer conflicts and avoids requiring constructor state.

3. **Keep all other modes strict.** `sync` apply, `sync --dry-run`, and `upgrade --apply` do not use the
   skip. A mismatch still fails before any writes. A consumer with either upstream signal missing continues
   through normal planning and retains `PROJECT_OS_PROFILE_SELECTION_DRIFT`.

4. **Do not merge active-profile sources.** The blueprint defaults remain the safe consumer defaults; the
   upstream's project-owned active list and decision references remain intact. The skip encodes ownership,
   not permission to disable profiles or change generated defaults.

5. **Verify consumer behavior in fixtures.** The upstream is not bootstrapped for this test. Integration
   fixtures cover baseline consumer behavior, divergent profiles, both identity signals, and mutation mode.

## Risks / Trade-offs

- [A target is misidentified as upstream] → Require both the repository-kind declaration and exact package
  identity, and test each missing-signal case.
- [The check hides a consumer drift or mutation] → Restrict it to the two explicit `--check` paths and add
  tests proving consumer mismatch and mutating commands still fail without writes.
- [Users mistake SKIP for a green consumer check] → Emit a human-readable reason and machine-readable
  `skipReason`; document that consumer fixtures are the source of validation evidence.

## Migration Plan

No migration is required. Checks remain read-only, and active profile data is unchanged. If the skip is
misclassified, revert the protected PR; normal strict checking resumes without transforming consumer state.

## Open Questions

None. The issue's DoR records the upstream-specific applicability decision and its evidence.
