## ADDED Requirements

### Requirement: A tooling change justified by supply-chain risk is measured before it is adopted

A decision to change the package manager, registry client or install toolchain SHALL be recorded as a
versioned decision record before any surface migrates. The record SHALL compare at least three candidates
across install-script defaults, release-age quarantine, exotic-source blocking, lockfile determinism,
publishing provenance, runner availability and compatibility with the declared engine range, citing an
official source and a consultation date per datum. It SHALL enumerate the attack vectors that no candidate
mitigates, so the decision cannot rest on a gain that does not exist. It SHALL give each affected surface a
separate recommendation and rollback, and SHALL record a final state of adopt, reject or defer with a dated
review condition. A control that already exists in the incumbent tool MUST NOT be counted as a reason to
migrate.

#### Scenario: A candidate offers a control the incumbent already has

- **WHEN** the comparison finds that the incumbent exposes the same control with a different default
- **THEN** the record classifies the difference as configuration rather than capability
- **AND** the missing configuration becomes its own work item instead of a reason to migrate

#### Scenario: A candidate is incompatible with the declared engine range

- **WHEN** a candidate does not support a version inside the published `engines` range
- **THEN** the record treats that as disqualifying for the affected surface before any security comparison
- **AND** names the surface and the excluded versions

#### Scenario: One surface migrates and another does not

- **WHEN** the surfaces reach different conclusions
- **THEN** each recommendation stands alone with its own rollback
- **AND** the record counts maintaining more than one toolchain as a cost rather than omitting it

#### Scenario: The decision rejects the change

- **WHEN** the final state is reject or defer
- **THEN** the record still states the review condition and its date
- **AND** the hardening it identifies for the incumbent is recorded as separate work
