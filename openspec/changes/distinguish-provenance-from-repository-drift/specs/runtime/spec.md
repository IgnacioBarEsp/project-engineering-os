## ADDED Requirements

### Requirement: Read-only sync distinguishes package provenance from repository drift

`sync --check` SHALL report `PROVENANCE_MISMATCH` instead of `DRIFT` when the only difference in tracked state metadata is `packageHash`, and the saved and observed package version, blueprint hash, configuration hash, active profiles and state format match. This result SHALL exit with code 0, identify the saved and observed `packageHash`, and SHALL NOT propose operations or mutate the consumer. File, configuration or any other tracked state difference SHALL remain `DRIFT` with exit code 1. The plan SHALL expose changed metadata fields and saved/observed values in both human-readable and JSON output.

#### Scenario: Only package provenance differs

- **WHEN** a consumer has no file or configuration drift and `sync --check` observes only a different `packageHash` from a CLI with the same version, blueprint, configuration, active profiles and state format
- **THEN** the result is `PROVENANCE_MISMATCH` with exit code 0
- **AND** the plan reports `packageHash` with its saved and observed values
- **AND** it contains no proposed operations and does not change the target

#### Scenario: A managed file has drifted alongside a provenance difference

- **WHEN** a consumer file differs from its managed state and `sync --check` also observes a different `packageHash`
- **THEN** the result remains `DRIFT` with exit code 1
- **AND** the plan identifies the file operation and the `packageHash` state difference

#### Scenario: Active profiles differ

- **WHEN** `sync --check` observes a different active-profile list from the value saved in consumer state
- **THEN** the result is `DRIFT` with exit code 1
- **AND** human and JSON output name `activeProfiles` and include both values

#### Scenario: A state-only field differs

- **WHEN** `sync --check` observes a difference in `blueprintHash`, `configurationHash` or `stateFormatVersion`
- **THEN** human and JSON output name each changed field and include its saved and observed values
- **AND** the check does not describe the difference only as `state=update`

#### Scenario: The project-level check runs against provenance mismatch

- **WHEN** `npm run project-os:check` encounters only a package provenance mismatch
- **THEN** the sync check exits successfully and the remaining read-only checks continue
- **AND** an actual repository drift still makes the project-level check fail
