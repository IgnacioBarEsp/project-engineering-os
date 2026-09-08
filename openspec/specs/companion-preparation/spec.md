# companion-preparation Specification

## Purpose
Define bounded project inspection, attributed preparation and recoverable local operations across
Companion profiles while preserving original files and separating verified readiness stages.
## Requirements
### Requirement: Folder inspection is bounded and non-mutating
The engine SHALL inventory only the selected canonical folder, exclude generated and sensitive paths,
avoid following symbolic links, and report incomplete or unsupported inspection explicitly.

#### Scenario: A document folder has no Git repository
- **WHEN** a person requests research or general preparation in a regular folder
- **THEN** inspection and base preparation SHALL work without Git, npm or a software framework

#### Scenario: A folder contains a symlink or scan limit is reached
- **WHEN** inspection encounters a link, excessive depth or too many entries
- **THEN** it SHALL report the exclusion or limit without reading through the link or claiming complete coverage

### Requirement: Preparation preserves ownership and supports recovery
The engine SHALL bind a plan to its folder and observed inputs, serialize writes, persist recoverable
operations and verify their hashes before reporting its own preparation complete.

#### Scenario: Original files and a second execution
- **WHEN** any of the five profiles is prepared twice with unchanged inputs
- **THEN** original bytes SHALL remain unchanged and the second application SHALL create no duplicate preparation

#### Scenario: Inputs or generated files change after review
- **WHEN** the plan is stale or an owned file was edited by a person
- **THEN** application or recovery SHALL stop with an actionable conflict rather than overwrite the edit

#### Scenario: Two applications or an interruption
- **WHEN** two processes apply at once or an operation stops between writes
- **THEN** only the lock owner SHALL mutate and the interrupted operation SHALL be resumable or reversible from verified evidence

#### Scenario: A persisted receipt names an arbitrary file
- **WHEN** recovery reads a malformed or forged target outside the fixed Companion namespace
- **THEN** it SHALL reject the state without changing that file

### Requirement: Readiness describes verified stages separately
The engine SHALL distinguish its base files, engineering constructor, context and external tools.

#### Scenario: A software project needs the engineering constructor
- **WHEN** the engineering stage is selected
- **THEN** its adapter SHALL use the existing constructor plan and transaction APIs, preserving their ownership and recovery behavior

#### Scenario: An external requirement has not been checked
- **WHEN** base files have been written but context or an external tool has not been verified
- **THEN** the result SHALL mark the relevant stage pending or not requested, never infer readiness from copied configuration
