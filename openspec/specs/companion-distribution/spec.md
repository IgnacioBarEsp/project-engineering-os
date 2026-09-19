# companion-distribution Specification

## Purpose
Define how the Companion application is distributed as a Windows artifact whose contents, identity and
signing status are verified against the produced file before publication, and how installing, updating or
removing it touches only what the installer wrote and never the person's projects, history or prepared tools.
## Requirements
### Requirement: Verifiable Windows artifact
The app SHALL be distributed as a Windows x64 installer whose contents are verified before publication
against an explicit allowlist, and whose identity, checksum, licenses and real signing status are published
with it. It SHALL NOT suppress or work around an operating-system warning. A release SHALL tag a clean,
protected-main source commit and SHALL compare freshly downloaded GitHub Release assets against the exact
verified build before public documentation calls that version downloadable. Every action dependency in the
publication workflow SHALL resolve to its reviewed immutable revision before the job can start. A failed
verification baked into an immutable tag SHALL be remediated through a new versioned source identity, never
by moving that tag.

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

#### Scenario: Authenticode probing cannot use the legacy host
- **WHEN** the Windows runner cannot autoload `Microsoft.PowerShell.Security` from legacy Windows PowerShell
- **THEN** the artifact verifier uses the runner-supported PowerShell 7 host, imports the module explicitly
  and accepts only the observed `NotSigned` status for an unsigned candidate
- **AND** a missing host, module or signature observation stops publication rather than treating it as pass

#### Scenario: A tagged verification fails before release creation
- **WHEN** an immutable Companion tag contains a verifier that fails before a draft release is created
- **THEN** that tag and its commit remain unchanged and the corrected candidate receives a new patch version
- **AND** documentation does not call either version downloadable until the new identity completes canonical
  asset comparison

#### Scenario: Disposable runner cleanup never masks the measurement
- **WHEN** the automated install, update and uninstall measurement finishes or fails on the disposable runner
- **THEN** cleanup of the disposable root retries transient file locks within a bounded budget and a
  persistent lock is declared in the run output and evidence instead of failing the measurement
- **AND** a measurement error is rethrown unchanged after cleanup, so a cleanup problem can never replace
  or attenuate what the measurement found

### Requirement: Installation that preserves the person's work
Installation SHALL be per-user, offer a destination and a shortcut, and present the license and data
notice before writing. Uninstallation SHALL remove only what the installer wrote. Automated release
evidence SHALL use paths isolated from a person's existing application, project, history and runtimes and
SHALL distinguish a silent installer assertion from a human interaction with the wizard. Uninstallation
verification SHALL await the completion of the uninstaller's asynchronous process delegation with a bounded
timeout before evaluating removal of the program directory. The installer SHALL contextually detect existing
installations in the Windows registry, offering repair, clean uninstallation or cancellation when the same
version is present, and clean upgrade or cancellation when a previous version is detected.

#### Scenario: A person installs and launches the app
- **WHEN** the installer runs on a Windows machine without Node or a terminal
- **THEN** the app starts from its shortcut and reaches its first screen

#### Scenario: A release test uses the installer silently
- **WHEN** native automation installs, updates or removes the candidate
- **THEN** every mutable test path resolves inside one fresh test root before it is passed to the installer
- **AND** the result records installation ownership and explicitly says that wizard interaction was not
  observed

#### Scenario: Uninstallation verification awaits asynchronous removal
- **WHEN** native uninstallation executes silently in the disposable runner
- **THEN** uninstallation verification awaits the removal of the program directory with a bounded timeout
  accounting for the uninstaller's asynchronous process delegation
- **AND** failure to remove the directory within the budget fails the release assertion

#### Scenario: A person reinstalls or uninstalls
- **WHEN** the app is reinstalled over an existing installation or removed
- **THEN** prepared project folders, the local project history and the managed runtimes remain intact
- **AND** removing those runtimes or that history is an explicit separate action

#### Scenario: A person runs the installer when the same version is installed
- **WHEN** the installer starts on a machine where the exact version is already recorded in the registry
- **THEN** it SHALL present a contextual dialogue offering options to repair the current installation, uninstall the program, or cancel

#### Scenario: A person runs the installer when an earlier version is installed
- **WHEN** the installer starts on a machine where an earlier version is detected
- **THEN** it SHALL present a contextual dialogue offering to update to the new version or cancel

#### Scenario: A person cancels contextual installation
- **WHEN** the user selects cancel in any contextual installer dialogue
- **THEN** the installer SHALL abort immediately without modifying files, shortcuts or registry entries

### Requirement: Release documentation alignment and screenshot provenance
Every Companion release SHALL update public documentation, release notes, installer guides and screenshot
provenance to match the published artifact version without broken links or unverified assertions.
Documentation SHALL distinguish a source candidate from a verified downloadable release.

#### Scenario: Documentation matches published candidate
- **WHEN** a new Companion candidate is prepared for publication
- **THEN** package.json, package-lock.json and release notes SHALL declare the candidate version
- **AND** installer guides and status docs SHALL distinguish that candidate from the current published download
- **AND** README.md SHALL link to the new release only after its canonical downloadable assets are verified

#### Scenario: Visual screenshots reflect integrated code
- **WHEN** the interface layout changes
- **THEN** documentation screenshots SHALL be regenerated and their SHA-256 hashes recorded with verifiable provenance

#### Scenario: The hotfix publication is deferred
- **WHEN** the maintainer decides to defer publishing the 0.3.2 candidate
- **THEN** the decision SHALL record its owner and reason and PROJECT_STATUS.md SHALL identify the known
  action-bar and clipboard defects of the actually published 0.3.1 release
- **AND** documentation SHALL NOT describe 0.3.2 as downloadable or its installer as verified without that evidence

#### Scenario: The hotfix is published
- **WHEN** the corrected 0.3.2 source completes protected integration and its existing publication workflow
- **THEN** its immutable source identity, installer, manifest and SHA-256 SHALL satisfy the existing canonical
  asset verification contract before public download guidance changes
- **AND** the release notes SHALL identify issue #142 and the core SHALL remain at 0.5.0

