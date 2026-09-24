## ADDED Requirements

### Requirement: The core and generated consumer support only declared maintained Node LTS lines
The upstream core and generated consumer SHALL declare the identical Node engine range `^22.22.0 || ^24.18.0`. The project SHALL test the exact Node 22 minimum and Node 24 recommended line on Ubuntu, Windows and macOS. Runtime checks and active compatibility guidance SHALL identify Node 24 as recommended, explain that Node 20 reached EOL on 2026-04-30, and state the next dated support-policy review. Node 26 SHALL NOT be included until it is LTS and a subsequent policy review approves it.

#### Scenario: Supported minimum and recommended runtimes are reported consistently
- **WHEN** the root package, generated package, doctor, CLI and compatibility guidance are inspected
- **THEN** they agree on `^22.22.0 || ^24.18.0`
- **AND** the exact Node 22.22.0 minimum and Node 24 recommended line are represented in core CI on all three operating systems

#### Scenario: EOL or unsupported Node versions are rejected
- **WHEN** the CLI or doctor evaluates Node 20, Node 21, Node 23, Node 24 below 24.18.0, Node 25 or Node 26
- **THEN** it reports the runtime as unsupported
- **AND** the CLI recovery names Node 20's 2026-04-30 EOL date and recommends Node 24

#### Scenario: Supported LTS versions satisfy runtime checks
- **WHEN** the CLI or doctor evaluates Node 22.22.0 or later Node 22 patches, or Node 24.18.0 or later Node 24 patches
- **THEN** it reports the runtime as supported
- **AND** the generated consumer fixture contains the same engine range as the core package

#### Scenario: The support policy approaches its next review
- **WHEN** a maintainer reads the active compatibility policy
- **THEN** it states that support follows upstream Node LTS status and the minimum advances when a supported line reaches EOL
- **AND** it provides 2026-10-28 as the next review checkpoint, explicitly requiring confirmation of the current official schedule before changing the supported range
