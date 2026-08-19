## MODIFIED Requirements

### Requirement: A release has one verifiable identity

The release SHALL bind package version, commit, tag, tested tarball, SHA-256, GitHub Release, npm artifact
and provenance. It SHALL create and test one canonical candidate before GitHub publication. After a delayed
npm approval, it SHALL rebuild only a verification copy from the same protected tag, compare all release
assets byte for byte, and publish only the canonical tarball downloaded from the GitHub Release.

#### Scenario: Release candidate is published

- **WHEN** the protected release workflow receives an approved SemVer tag
- **THEN** it packs and tests one canonical tarball
- **AND** the GitHub publication job consumes that exact workflow artifact and checksum

#### Scenario: Delayed npm approval preserves identity

- **WHEN** the npm environment approves a release after the workflow candidate is no longer available
- **THEN** the npm job downloads the tarball, manifest and checksum from the GitHub Release for the protected tag
- **AND** it rebuilds and tests a verification copy from that tag
- **AND** it publishes only the GitHub Release tarball when both directories have exactly the same files and bytes

#### Scenario: Release assets are missing or different

- **WHEN** the GitHub Release omits, adds or changes an expected asset
- **THEN** the workflow fails before `npm publish`
- **AND** recovery keeps the tag and version unchanged while the divergence is investigated

#### Scenario: A release retry finds existing immutable assets

- **WHEN** a previous run created the GitHub Release but stopped before npm publication
- **THEN** recovery verifies the existing tarball, manifest and checksum byte for byte
- **AND** publishes only when they match the newly validated candidate for the same immutable tag

#### Scenario: npm receives the local tarball

- **WHEN** the workflow invokes `npm publish`
- **THEN** the canonical GitHub Release tarball argument is an explicitly relative filesystem path
- **AND** CI rejects a package-spec or GitHub-shorthand interpretation
