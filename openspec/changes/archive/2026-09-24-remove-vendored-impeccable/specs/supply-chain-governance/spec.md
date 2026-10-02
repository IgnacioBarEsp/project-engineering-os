## ADDED Requirements

### Requirement: Every redistributable package has a verified license notice

The `check:package` gate SHALL fail closed when a production package redistributed by the core npm package or Companion artifact is missing license metadata or a notice entry matching its package identity, version and license. For Companion, the committed notice SHALL match the notice generated from the production package lock inventory, and SHALL retain the Electron-runtime and portable-tool notices.

#### Scenario: A core production package is added without a notice

- **WHEN** a production package appears in the core package lock but its name, version or license is absent or stale in `THIRD_PARTY_NOTICES.md`
- **THEN** `check:package` fails and identifies the uncovered package

#### Scenario: A Companion package notice drifts from its lockfile

- **WHEN** the Companion production package inventory changes without a matching update to `apps/companion/THIRD-PARTY-NOTICES.md`
- **THEN** `check:package` fails
- **AND** the notice check does not treat missing license metadata as a declared license

#### Scenario: Both redistributable inventories are declared

- **WHEN** production package records have license metadata and their committed notices match the current inventories
- **THEN** `check:package` passes the third-party notice checks
