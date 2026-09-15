## MODIFIED Requirements

### Requirement: Verifiable Windows artifact
The app SHALL be distributed as a Windows x64 installer whose contents are verified before publication
against an explicit allowlist, and whose identity, checksum, licenses and real signing status are published
with it. It SHALL NOT suppress or work around an operating-system warning. A release SHALL tag a clean,
protected-main source commit and SHALL compare freshly downloaded GitHub Release assets against the exact
verified build before public documentation calls that version downloadable. Every action dependency in the
publication workflow SHALL resolve to its reviewed immutable revision before the job can start.

#### Scenario: Artifact is produced
- **WHEN** the packaging script builds the installer from a clean checkout
- **THEN** verification lists the packaged files, the pinned core version and the included licenses
- **AND** an unexpected file, a development dependency or a missing license stops publication

#### Scenario: A version moves from source to GitHub Release
- **WHEN** protected CI has merged the versioned Companion source and the maintainer tags that main commit
- **THEN** the build manifest names that tag's commit and the release contains only its installer,
  `artifact-manifest.json` and `SHA256SUMS`
- **AND** a fresh download has matching filenames, bytes, manifest identity and SHA-256 before guides name
  it as the current download

#### Scenario: Signing status is reported
- **WHEN** no code-signing certificate is available
- **THEN** the published identity states that the artifact is unsigned and that Windows will warn
- **AND** no claim of a verified publisher, reputation or silent installation is made

#### Scenario: An action pin is unavailable
- **WHEN** GitHub cannot resolve an action revision named by the Companion publication workflow
- **THEN** the run stops before build or release mutation
- **AND** a correction verifies the official immutable revision and adds a regression assertion before retry
