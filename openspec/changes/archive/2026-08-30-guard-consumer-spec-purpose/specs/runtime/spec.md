## ADDED Requirements

### Requirement: The OPSX check refuses a published capability without a redacted Purpose

The read-only OPSX check SHALL inspect every published capability under `openspec/specs/*/spec.md` and SHALL
report `FAIL` when a capability declares no `## Purpose` section, declares it empty, or keeps the text that
`openspec archive` seeds there. When the specs tree exists and cannot be read, it SHALL fail closed instead
of reporting zero capabilities. When the repository has published no capability yet, it SHALL report `SKIP`
and MUST NOT infer a passing verdict. It SHALL NOT inspect the deltas under `openspec/changes/**`, which
legitimately declare no Purpose. Every failure recovery SHALL name the offending spec file and what to write
in it. The upstream documentation gate and the OPSX check SHALL derive this verdict from a single published
module, so a consumer never receives a divergent copy.

#### Scenario: An archived capability keeps the seeded text

- **WHEN** a bootstrapped repository archives a change and runs the read-only OPSX check
- **THEN** the check fails and names that capability's spec file
- **AND** the recovery states that the seeded text under `## Purpose` must be replaced by the capability's own contract

#### Scenario: A published capability declares no Purpose

- **WHEN** a capability spec has no `## Purpose` section or leaves it empty
- **THEN** the check fails for that capability alone
- **AND** every other published capability keeps its own verdict

#### Scenario: The specs tree exists and cannot be read

- **WHEN** the specs root or an individual capability spec cannot be read
- **THEN** the check fails closed and names the unreadable path
- **AND** it does not report a passing verdict inferred from zero capabilities

#### Scenario: The repository has published no capability yet

- **WHEN** the repository has no specs root, or a specs root with no capability inside
- **THEN** the check reports `SKIP` and states that nothing has been published
- **AND** the read-only command reports no failure it cannot substantiate

#### Scenario: Change deltas stay outside the gate

- **WHEN** an active change declares delta specs under `openspec/changes/**` without a Purpose
- **THEN** the check ignores those deltas
- **AND** only published capabilities are inspected
