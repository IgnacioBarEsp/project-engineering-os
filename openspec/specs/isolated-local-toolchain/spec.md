# isolated-local-toolchain Specification

## Purpose
Keep engineering dependencies in an explicitly selected project-local location while preserving the
product's manifests and dependencies. Align the pinned OpenSpec wrapper and read-only diagnostics on
the same verified package identity and provide recovery without automatic relocation or global fallback.
## Requirements
### Requirement: Explicit local toolchain selection
The constructor SHALL support an optional normalized project-relative toolchainRoot in consumer
configuration and SHALL retain the project-root layout when it is absent. It SHALL reject malformed,
oversized, escaping, reserved or linked location configuration without silently selecting another runtime.

#### Scenario: Existing product keeps its own dependencies
- **WHEN** the consumer selects an isolated local toolchain containing the pinned engineering packages
- **THEN** the wrapper and engineering diagnostics use that location
- **AND** they do not rewrite the product manifest, lockfile or installed dependencies

#### Scenario: Legacy project omits the option
- **WHEN** the configuration does not declare toolchainRoot
- **THEN** resolution retains the traditional project-root installation

#### Scenario: Invalid or absent selected location
- **WHEN** the declared location is unsafe or the selected installation is missing
- **THEN** the wrapper and diagnostics report the failure with a recovery action
- **AND** they do not use a global or alternative package as fallback

### Requirement: Checked and executed OpenSpec identities agree
The local wrapper, OPSX checks and doctor SHALL resolve the same selected OpenSpec package and exact
version. Engineering checks SHALL inspect manifest, lock, installed metadata and expected entry paths
without running the selected CLI or consumer scripts.

#### Scenario: Exact isolated installation
- **WHEN** the selected local manifest, lock, installed package and entry demonstrate the pinned version
- **THEN** the OpenSpec identity checks pass and the wrapper can invoke that same package entry
- **AND** official generation retains preference isolation and the telemetry opt-out behavior

#### Scenario: Version or entry divergence
- **WHEN** a declared, locked or installed version differs or the expected CLI entry is missing or unsafe
- **THEN** the identity check fails and the wrapper refuses execution
- **AND** doctor and opsx-check leave the project unchanged

### Requirement: Recovery preserves consumer ownership
Changing or reverting the selected toolchain SHALL NOT automatically move, overwrite or remove files
from either toolchain or the product. Existing generated workflow ownership SHALL remain with OpenSpec.

#### Scenario: Return to a previously prepared location
- **WHEN** the consumer explicitly restores the previous selection and its exact local packages remain
- **THEN** checks and the wrapper use that location again
- **AND** both dependency locations and product originals remain intact
