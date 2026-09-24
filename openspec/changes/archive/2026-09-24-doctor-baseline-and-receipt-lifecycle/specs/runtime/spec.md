## ADDED Requirements

### Requirement: Upstream doctor failures have an issue-backed exact baseline

The upstream repository SHALL keep a versioned baseline of accepted doctor failures. The baseline checker
SHALL run the read-only doctor against the current repository and SHALL compare the complete set of live
`FAIL` check IDs and profiles with the baseline. Every baseline entry SHALL identify a positive tracking
issue. `npm run check` SHALL fail when a live failure is absent from the baseline, a baseline entry still
fails after being removed, or a baseline row no longer corresponds to a live failure. The check SHALL NOT
query GitHub or mutate the baseline.

#### Scenario: The live doctor matches the accepted baseline

- **WHEN** the upstream doctor returns exactly the issue-backed failures in the baseline
- **THEN** the baseline gate passes
- **AND** it reports that the observation was read-only and offline

#### Scenario: A new doctor failure appears

- **WHEN** the doctor adds a `FAIL` whose check ID/profile pair is absent from the baseline
- **THEN** `npm run check` fails and names the new check and its cause
- **AND** the baseline is not automatically extended

#### Scenario: An unresolved failure is removed from the baseline

- **WHEN** a baseline entry is removed while the doctor still reports that failure
- **THEN** the exact-set comparison fails
- **AND** it explains that the doctor result must be fixed before retiring the baseline entry

#### Scenario: A baseline entry is stale or ambiguous

- **WHEN** an entry duplicates another ID, omits its issue reference, or no longer appears as a live failure
- **THEN** validation fails closed and identifies the invalid or obsolete entry

### Requirement: Freshness reports include expiry-bound receipts and tool decisions

`project-os freshness` SHALL combine existing tool-catalog freshness results with an allowlisted report of
local expiry-bound receipts. It SHALL distinguish fresh, due-soon, stale, missing and invalid receipt
states and SHALL show the fixed human renewal procedure. It SHALL NOT execute that procedure, contact a
remote service, authenticate, install or repair. Staleness SHALL remain informational and SHALL NOT make
the freshness command fail.

#### Scenario: A receipt is current or nearing expiry

- **WHEN** freshness reads a valid allowlisted receipt
- **THEN** it reports `fresh` or `due-soon` with its expiry timestamp and fixed renewal command
- **AND** it reports existing tool-catalog freshness entries in the same result

#### Scenario: The Product OS manifest changes after the smoke

- **WHEN** the receipt hash no longer matches the current local Product OS manifest
- **THEN** freshness reports `invalid`, not `fresh` or `due-soon`
- **AND** it performs no mutation and makes no remote request

#### Scenario: A receipt has expired

- **WHEN** a valid receipt's `expiresAt` is at or before the injected current time
- **THEN** freshness reports `stale` and prints the manual renewal procedure
- **AND** the command exits 0, performs no mutation and does not run the procedure

#### Scenario: A receipt is malformed, oversized or linked outside the target

- **WHEN** an allowlisted receipt cannot be parsed, exceeds the read limit, has invalid timestamps or
  resolves through a symlink outside the target
- **THEN** freshness reports `invalid` without reading outside the target or repairing the receipt
- **AND** it does not execute receipt content

### Requirement: The upstream GitHub Project receipt declares a bounded fixed renewal procedure

The upstream `github.project` receipt SHALL contain a config-bound PASS, canonical `issuedAt` and
`expiresAt`, and the exact read-only GitHub Project view command used to regenerate it. The validity window
SHALL be positive and at most 180 days. `doctor` SHALL validate those fields but SHALL NOT run the command
or claim it proves access after `expiresAt`.

#### Scenario: The current manual smoke matches the declared Project

- **WHEN** a person runs the fixed read-only Project view and verifies the configured owner and title
- **THEN** they may record a minimal receipt with the observed timestamp and the bounded expiry
- **AND** the receipt contains no token or issue/item content

#### Scenario: The receipt has a wrong, missing or overlong renewal command

- **WHEN** `doctor` validates an upstream GitHub Project receipt whose renewal command is not the fixed
  read-only command
- **THEN** `github.project` remains `FAIL` with an actionable cause
- **AND** neither doctor, freshness nor CI attempts to execute it

#### Scenario: Doctor validates an expired or current receipt

- **WHEN** doctor inspects a structurally valid receipt with current or expired `expiresAt`
- **THEN** it reports only the validity result for the configured Project
- **AND** the receipt and target files remain byte-for-byte unchanged
