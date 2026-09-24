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

### Requirement: Release EOL preflight preserves files without line terminators

The release preflight SHALL reject tracked files explicitly governed by `eol=lf` when index and worktree line-ending states diverge or either state is CRLF, mixed, or unknown. It SHALL accept `none` only when both index and worktree contain no line terminator, without rewriting that file. When an immutable tag predates a compatible release-tool fix, the build and npm packaging jobs SHALL load the EOL helper, release validator and tag-source resolver from the exact protected `main` workflow commit; the GitHub Release job SHALL load the source validator, tag resolver and candidate verifier from that same commit. The workflow SHALL preserve the tag and package identity.

The current core release workflow SHALL reject prerelease package versions during build preflight, before creating a GitHub Release, until a channel-specific npm distribution-tag policy is supported.

#### Scenario: Empty or single-line files have no line ending in index or worktree

- **WHEN** a protected tag contains an empty file or a file without CR/LF and Git reports `i/none w/none`
- **THEN** the release EOL preflight accepts the file without changing its bytes
- **AND** the canonical package is still built from the protected tag

#### Scenario: A checkout contains CRLF or mixed endings

- **WHEN** a tracked file governed by `eol=lf` is checked out with CRLF or mixed line endings
- **THEN** the release preflight rejects the checkout before producing a candidate

#### Scenario: The index and worktree disagree on line-ending state

- **WHEN** a tracked file governed by `eol=lf` reports different index and worktree EOL states
- **THEN** the release preflight rejects it before producing a candidate

#### Scenario: An old protected tag uses release tooling from a newer workflow commit

- **WHEN** the release workflow constructs or verifies a candidate for an immutable tag
- **THEN** build and npm load the release helper, source validator and tag resolver from the exact workflow commit on `main`
- **AND** GitHub Release loads those validators and the candidate verifier from that same commit
- **AND** it does not rewrite the tag, historical files, or public package contents

#### Scenario: A release dispatch selects only its remote tag source

- **WHEN** the release workflow checks out and validates its requested tag
- **THEN** checkout explicitly resolves `refs/tags/<tag>` rather than an ambiguous ref
- **AND** shell commands receive the tag as quoted data rather than source text
- **AND** preflight rejects a checked-out commit that differs from the exact remote tag commit
- **AND** GitHub Release and npm deployment jobs are available only from `main`
- **AND** the candidate's manifest commit matches the checked-out tag commit
- **AND** the immutable tag ruleset blocks later updates and deletions without bypass

#### Scenario: A prerelease is requested before channel publishing is supported

- **WHEN** a release tag identifies a prerelease package version
- **THEN** build preflight fails before producing a candidate or creating a GitHub Release
- **AND** it reports that stable releases are the only supported release channel
