# supply-chain-governance Specification

## Purpose
Define cómo Project Engineering OS verifica dependencias, limita excepciones temporales, atribuye señales
de scanners y aplica un default local de privacidad a las herramientas que administra.
## Requirements
### Requirement: CI blocks unaccepted high dependency risk

The repository SHALL audit the root lockfile, the root production-only dependency set and the consumer
blueprint lockfile. The required CI result SHALL fail when any scope contains a `high` or `critical`
advisory that is not covered by a valid exact exception, and SHALL NOT convert registry or parser failure
into PASS.

#### Scenario: A high advisory enters a declared dependency

- **WHEN** an audited scope reports a `high` or `critical` advisory without a valid exception
- **THEN** the dependency-audit job exits non-zero
- **AND** the aggregate required check rejects the workflow

#### Scenario: Audit evidence is unavailable

- **WHEN** npm audit cannot return parseable vulnerability metadata for an audited scope
- **THEN** the gate reports the affected scope and exits non-zero
- **AND** it does not claim that dependencies are clean

### Requirement: Audit exceptions are exact and temporary

An audit exception SHALL identify scope, package and advisory exactly. It SHALL record reason, owner,
approver, creation date, expiration date and recovery, SHALL NOT exceed the policy lifetime, and SHALL
stop suppressing a finding when incomplete or expired.

#### Scenario: A current approved exception matches one finding

- **WHEN** scope, package and advisory match an approved unexpired exception within the maximum lifetime
- **THEN** that finding is reported as excepted
- **AND** unrelated findings remain blocking

#### Scenario: An exception is expired or malformed

- **WHEN** an exception lacks required governance metadata, exceeds its maximum lifetime or has expired
- **THEN** policy validation fails before the audit can pass

### Requirement: Project-owned OpenSpec commands use a private default

Generated repositories SHALL run Project Engineering OS-owned OpenSpec scripts with
`OPENSPEC_TELEMETRY=0` when the environment does not declare that variable. The wrapper SHALL preserve an
explicit user value, SHALL run the pinned local OpenSpec binary without a shell and SHALL NOT write global
OpenSpec configuration.

#### Scenario: A generated repository uses the default

- **WHEN** a user invokes an `openspec:*` package script without setting `OPENSPEC_TELEMETRY`
- **THEN** the pinned local OpenSpec process receives `OPENSPEC_TELEMETRY=0`
- **AND** no global preference is changed

#### Scenario: A user explicitly opts in

- **WHEN** the environment already declares `OPENSPEC_TELEMETRY=1`
- **THEN** the wrapper forwards that value unchanged

### Requirement: Third-party signals retain evidence and attribution

The repository SHALL keep a versioned triage for material scanner signals and SHALL distinguish package
runtime dependencies from development dependencies declared inside the generated consumer template.
Documentation SHALL state the governed telemetry path and the direct-invocation limit.

#### Scenario: A reader reviews a scanner alert

- **WHEN** a scanner attributes a blueprint dependency to the published package
- **THEN** the linked triage provides the verified dependency surface, verdict and rationale
- **AND** the cost and license guide links to that record

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

