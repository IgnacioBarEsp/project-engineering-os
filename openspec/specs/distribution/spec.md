# Distribution

## Purpose

Definir una identidad de release verificable y una distribución pública neutral, reproducible y con
privilegios mínimos.
## Requirements
### Requirement: A release has one verifiable identity

The release SHALL bind package version, commit, tag, tested tarball, SHA-256, GitHub Release, npm artifact
and provenance. It SHALL create and test one canonical candidate before GitHub publication. After a delayed
npm approval, it SHALL rebuild only a verification copy from the same protected tag in a workspace that
passes the tag's repository gates, compare all release assets byte for byte, and publish only the canonical
tarball downloaded from the GitHub Release.

#### Scenario: Release candidate is published

- **WHEN** the protected release workflow receives an approved SemVer tag
- **THEN** it packs and tests one canonical tarball
- **AND** the GitHub publication job consumes that exact workflow artifact and checksum

#### Scenario: Delayed npm approval preserves identity

- **WHEN** the npm environment approves a release after the workflow candidate is no longer available
- **THEN** the npm job downloads the tarball, manifest and checksum from the GitHub Release for the protected tag
- **AND** it rebuilds and tests a verification copy from that tag in a repository-compatible output path
- **AND** it publishes only the GitHub Release tarball when both directories have exactly the same files and bytes

#### Scenario: Verification and canonical workspaces remain distinct

- **WHEN** the npm job reconstructs a protected tag and downloads its existing GitHub Release
- **THEN** the reconstructed copy and canonical download occupy distinct directories
- **AND** repository neutrality passes before the canonical download creates its temporary directory
- **AND** the publish argument resolves only to the canonical download

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
- **AND** CI rejects a package-spec, reconstructed-copy or GitHub-shorthand interpretation

### Requirement: Public exports are neutral

The public tree SHALL be generated from an allowlist and SHALL reject consumer-specific domain rules,
absolute user paths, secrets, duplicate runtimes and incidental files. Text identity SHALL use canonical
LF hashing and the repository SHALL enforce LF checkouts so Windows, macOS and Linux do not report
line-ending-only drift.

#### Scenario: Forbidden content is present

- **WHEN** the neutrality checker finds a forbidden path, term or secret pattern
- **THEN** CI fails before packaging
- **AND** reports the file without printing a secret value

#### Scenario: A checkout changes only text line endings

- **WHEN** an exported text file is checked out with CRLF instead of LF
- **THEN** canonical export identity remains unchanged
- **AND** any non-line-ending content change still fails the comparison

### Requirement: Workflows use minimum privilege

PR CI SHALL run read-only without secrets. Release jobs SHALL use explicit permissions, immutable action
SHAs and OIDC; they SHALL NOT use `pull_request_target` or a persistent npm token fallback.

#### Scenario: A workflow action uses a floating tag

- **WHEN** supply-chain validation finds a non-SHA action reference
- **THEN** the check fails
- **AND** requires a verified commit reference

### Requirement: Release authority is explicit and technically enforced
Contributor guidance SHALL distinguish independent review from execution and review explicitly delegated
by the maintainer. Release evidence SHALL record its actual origin without manufacturing human approval,
and required CI, protected integration and canonical artifact provenance SHALL remain enforced.

#### Scenario: Maintainer delegates a bounded release
- **WHEN** the maintainer explicitly authorizes an agent to complete review, integration and publication
- **THEN** the release SHALL record that delegation and actual automated/manual evidence
- **AND** the agent SHALL NOT present self-review as independent review or bypass required technical checks

#### Scenario: Additive minor release
- **WHEN** a new release is published
- **THEN** root metadata, seeded exact dependency, lockfile, changelog and current install examples SHALL agree
- **AND** published artifacts SHALL retain their immutable identity and provenance
