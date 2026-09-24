## ADDED Requirements

### Requirement: Doctor verifies consumer-owned evidence for active technical profiles

`doctor` SHALL preserve `SKIP` for an inactive technical profile. For an active technical profile, it SHALL
read only `.project-os/evidence/technical-profile-<profile-id>.json` and return `PASS` only when the
versioned record covers exactly every automatic validation, manual evidence item and negative case, plus
rollback and closure-gate evidence, from that profile's definition in the package's
`blueprint/core/project-os/profiles.json`. The record SHALL bind to the profile identity, current effective
profile configuration and canonical profile definition with SHA-256 hashes, and declare canonical UTC
`issuedAt`/`expiresAt` instants with a validity window of at most 30 days. Every item SHALL declare `PASS`
and reference a regular in-repository artifact whose raw-byte SHA-256 matches. The doctor SHALL bound record
and artifact reads, reject traversal and paths/symlinks escaping the target root, and SHALL NOT write the
record or artifacts, execute commands from them, or claim that it independently ran or authenticated the
consumer's probes. Consumer-defined requirement lists SHALL NOT replace the packaged canonical list; there
is no generic `N/A` result. Missing, incomplete, malformed, stale, future-dated, mismatched, unknown,
duplicated, oversized or unsafe evidence SHALL remain `FAIL` with cause and recovery.

#### Scenario: An inactive technical profile remains skipped

- **WHEN** a technical profile is not in the consumer's effective active-profile list
- **THEN** `doctor` reports that profile as `SKIP`
- **AND** it does not require an evidence record for that profile

#### Scenario: A complete current profile record passes without mutation

- **WHEN** an active technical profile has a record containing exactly the canonical required evidence and
  current hashes for every in-repository artifact
- **THEN** `doctor` reports `PASS` for that profile and names the record and evidence references
- **AND** the raw record and evidence artifacts remain byte-for-byte unchanged
- **AND** a `PASS` states that integrity and completeness were checked, not that the core executed or
  authenticated the referenced validations, reviews or rollback

#### Scenario: An active profile has no complete record

- **WHEN** an active technical profile has no record or omits any required validation, manual evidence,
  negative case, rollback or closure-gate evidence
- **THEN** `doctor` reports `FAIL` with the missing items and the expected record path
- **AND** it does not infer success from profile activation, configuration or a top-level PASS alone

#### Scenario: Malformed, stale, mismatched or unsafe evidence is rejected

- **WHEN** a record has an unsupported schema, an unknown or duplicate item, a wrong profile/configuration or
  canonical-definition hash, an invalid time window, a missing/mismatched artifact hash, or an artifact path
  that traverses outside the repository or escapes through a symlink
- **THEN** `doctor` reports `FAIL` with a bounded reason and recovery
- **AND** it does not read outside the target root or mutate the evidence

#### Scenario: The record is incomplete or exceeds the bounded evidence contract

- **WHEN** the record has duplicate/unknown/missing canonical item IDs, a non-PASS item, extra properties,
  exceeds the record/artifact limits, or contains an `N/A` in place of required evidence
- **THEN** `doctor` reports `FAIL` with the affected item or limit and recovery
- **AND** it does not accept consumer-edited validation lists as a smaller canonical contract

#### Scenario: The fixed local archive runner consumes the doctor result

- **WHEN** `readiness-check --phase archive --run-local` runs against a consumer with complete active-profile
  evidence
- **THEN** its fixed `constructor-doctor-json` runner can pass the technical-profile checks
- **AND** metadata or evidence cannot select an executable, arguments or an alternate runner

#### Scenario: A consumer bootstrapped with core 0.5.0 remains fail-closed

- **WHEN** a 0.5.0-shaped consumer has an active technical profile but no current record in the new contract
- **THEN** the updated doctor accepts its existing configuration shape without an internal error
- **AND** the active profile remains `FAIL` until the consumer supplies a current, complete record
- **AND** no legacy receipt or workaround is silently rewritten or treated as the new record
