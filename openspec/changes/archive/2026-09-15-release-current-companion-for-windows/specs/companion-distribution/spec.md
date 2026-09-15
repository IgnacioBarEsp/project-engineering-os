## MODIFIED Requirements

### Requirement: Verifiable Windows artifact
The app SHALL be distributed as a Windows x64 installer whose contents are verified before publication
against an explicit allowlist, and whose identity, checksum, licenses and real signing status are published
with it. It SHALL NOT suppress or work around an operating-system warning. A release SHALL tag a clean,
protected-main source commit and SHALL compare freshly downloaded GitHub Release assets against the exact
verified build before public documentation calls that version downloadable.

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

### Requirement: Installation that preserves the person's work
Installation SHALL be per-user, offer a destination and a shortcut, and present the license and data
notice before writing. Uninstallation SHALL remove only what the installer wrote. Automated release
evidence SHALL use paths isolated from a person's existing application, project, history and runtimes and
SHALL distinguish a silent installer assertion from a human interaction with the wizard.

#### Scenario: A person installs and launches the app
- **WHEN** the installer runs on a Windows machine without Node or a terminal
- **THEN** the app starts from its shortcut and reaches its first screen

#### Scenario: A release test uses the installer silently
- **WHEN** native automation installs, updates or removes the candidate
- **THEN** every mutable test path resolves inside one fresh test root before it is passed to the installer
- **AND** the result records installation ownership and explicitly says that wizard interaction was not
  observed

#### Scenario: A person reinstalls or uninstalls
- **WHEN** the app is reinstalled over an existing installation or removed
- **THEN** prepared project folders, the local project history and the managed runtimes remain intact
- **AND** removing those runtimes or that history is an explicit separate action
