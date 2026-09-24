# Runtime profile-check applicability

Purpose: distinguish consumer synchronization checks from the upstream repository's independently owned
profile policy without weakening checks on consumers.

## ADDED Requirements

### Requirement: Read-only consumer checks skip the identified upstream

The constructor SHALL return an explicit `SKIP` result with exit code 0, no plan, and no mutation when
`sync --check` or `upgrade --check` targets a repository whose `.project-os/repository-governance.json`
declares `repositoryKind: upstream` and whose `package.json` name exactly matches the constructor package.
The result SHALL state that the upstream does not consume the generated consumer layout and direct validation
to a consumer fixture. This applicability result SHALL NOT change any active profile data.

#### Scenario: Both upstream identity signals match

- **WHEN** `sync --check` or `upgrade --check` runs against the declared upstream repository
- **THEN** the result has `status: SKIP`, exit code 0, `mutationPerformed: false`, and no plan
- **AND** the output explains that the upstream does not consume the generated layout

#### Scenario: Only one upstream identity signal matches

- **WHEN** the repository-kind marker is absent or the package identity does not match
- **THEN** the command follows normal consumer validation
- **AND** a divergent profile selection returns `PROJECT_OS_PROFILE_SELECTION_DRIFT` with the configured and canonical profile IDs

#### Scenario: A read-only command checks a consumer with equal profiles

- **WHEN** a consumer's configured and canonical active-profile lists agree
- **THEN** the existing check builds its normal read-only plan and reports its established status

#### Scenario: A mutating command targets the upstream

- **WHEN** `sync --dry-run`, `sync` apply, or `upgrade --apply` targets the declared upstream repository
- **THEN** the command does not use the read-only applicability skip
- **AND** any profile-selection mismatch fails before writes

#### Scenario: The upstream's active profile choices remain unchanged

- **WHEN** the read-only checks return `SKIP`
- **THEN** the upstream profile catalog and blueprint consumer defaults remain byte-for-byte unchanged
