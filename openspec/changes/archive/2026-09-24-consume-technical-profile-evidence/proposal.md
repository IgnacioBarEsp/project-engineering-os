## Why

Tracks issue [#115](https://github.com/IgnacioBarEsp/project-engineering-os/issues/115).

`doctor` currently marks every active technical profile `FAIL` without looking for the consumer's completed
probes, so the fixed `readiness-check --phase archive --run-local` runner repeats an impossible failure. A
bounded evidence contract will let consumers close approved profiles while keeping missing or stale evidence
fail-closed and keeping consumer commands out of metadata.

## What Changes

- Define a versioned consumer-owned evidence receipt for each active technical profile, bound to the active
  profile configuration and the canonical profile definition shipped with the core.
- Have `doctor` check the exact required automatic validations, manual evidence, negative cases, rollback,
  closure gate, evidence freshness and in-repository artifact hashes without executing consumer commands.
- Preserve `SKIP` for inactive profiles, use `FAIL` for absent or invalid active evidence, and report `PASS`
  only for a complete, current, integrity-checked evidence record. State explicitly that this verifies the
  evidence record, not the truth or execution of a consumer's tests.
- Keep archive's local runner fixed to `constructor-doctor-json`; add negative, read-only and 0.5.0-shape
  compatibility fixtures and document how the landing workaround is retired after a corrected release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime`: active technical profiles can pass the read-only doctor only with a complete, current, profile-
  and configuration-bound evidence record; readiness continues to invoke only its fixed doctor runner.
- `public-documentation-experience`: public operational guidance documents the record, its verification
  limits, consumer compatibility, and workaround migration.

## Impact

Changes affect `src/doctor.mjs`, a packaged technical-profile evidence schema seeded through the blueprint
manifest, fixed readiness-runner regression tests, the consumer fixture and `docs/UPSTREAM_OPERATIONS.md`.
No dependency, probe command, product choice, consumer evidence write, or profile activation decision is
added.
