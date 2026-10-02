## Why

As described in [issue #122](https://github.com/IgnacioBarEsp/project-engineering-os/issues/122),
the upstream's project-owned active profile choices intentionally differ from blueprint defaults for a
new consumer. The read-only check currently treats that ownership distinction as consumer drift.

The upstream repository is the source of the constructor and deliberately does not consume its generated
consumer layout. Its `.project-os/profiles.json` therefore contains upstream-owned approved profile choices,
while the blueprint defaults describe the safe profile set for a new consumer. Comparing those distinct
ownership domains makes read-only `sync --check` and `upgrade --check` fail before they can report whether
the consumer-shaped operation applies. The upstream identity is already declared in
`.project-os/repository-governance.json` and the package manifest.

## What Changes

- Classify read-only `sync --check` and `upgrade --check` as `SKIP` for this upstream only when both the
  `repositoryKind: upstream` marker and the exact package identity match.
- Return a successful, explicit no-plan/no-mutation result for that non-applicable check.
- Preserve profile-selection validation, mismatch diagnostics, and all mutation behavior for consumers.
- Document why the upstream skip is safe and where the equivalent behavior must be checked.

## Capabilities

### Modified Capabilities

- `runtime`: read-only consumer synchronization checks identify the upstream as not applicable without
  weakening consumer validation or mutating operations.
- `public-documentation-experience`: upstream operation guidance explains the skip and directs validation
  to consumer fixtures.

## Impact

Changes affect constructor command orchestration, CLI human output, constructor integration tests, and
upstream-operation documentation. No profile selection, consumer default, state schema, package dependency,
or mutating command behavior changes. Existing seed-once conflicts are not suppressed for consumer targets.
