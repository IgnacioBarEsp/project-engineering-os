# companion-environment Specification

## Purpose
Define how Companion installs, verifies and recovers the reviewed local runtimes and profile tools a
prepared project needs, so readiness is reported only after real execution and the person keeps usable
context, entry points and originals when a tool, download or location changes.
## Requirements
### Requirement: Reviewed local tool preparation
Companion SHALL present a bounded plan identifying required and optional tools, their purpose, pinned
identity, license, download size and destination before installation. It SHALL preserve product files
and execute only trusted named operations on selected project handles.

#### Scenario: New or existing engineering project
- **WHEN** a person applies the reviewed software or Unity preparation plan
- **THEN** exact engineering dependencies are installed in the selected isolated toolchain
- **AND** product manifests, lockfiles, dependencies and existing Git history remain intact

#### Scenario: Invalid download or executable
- **WHEN** an artifact has a wrong hash, unsafe archive entry, unexpected identity or unsupported platform
- **THEN** activation fails with an actionable explanation and no unverified executable is launched

### Requirement: Verified readiness and persistent use
Companion SHALL verify official pinned OpenSpec execution, workflow adaptation and current tool identity
before reporting engineering readiness. It SHALL provide local agent entry points usable after the app closes.

#### Scenario: Preparation completed
- **WHEN** all required engineering operations and their checks succeed
- **THEN** status identifies current verified tools and workflows and routes the AI to usable local commands
- **AND** configuration, plan and output identity are recorded without inferring external-agent activation

#### Scenario: A previously prepared project changed
- **WHEN** a relevant configuration, output, runtime or receipt is missing, corrupt or changed
- **THEN** status reports the affected stage as requiring verification or repair instead of ready

### Requirement: Appropriate and verifiable context by profile
Companion SHALL retain attributed document retrieval and pertinent recipes for all five profiles and
SHALL activate optional structural code retrieval only from reviewed eligible sources with real query evidence.

#### Scenario: Research, creative or general project
- **WHEN** a person prepares one of these profiles
- **THEN** local sources, coverage limits and applicable recipes are available without compulsory code tools or models

#### Scenario: Software or Unity code context selected
- **WHEN** the approved CodeGraph worker indexes eligible sources
- **THEN** a real symbol query verifies the index and results map to current original source paths and hashes
- **AND** indexing does not execute project code, install Git hooks or replace another tool's existing index

#### Scenario: Engineering activation wrote its own instruction files
- **WHEN** the constructor and official activation have written the instruction files they own
- **THEN** those owned files are reported as left out instead of competing for the retrieval budget
- **AND** the person's own documents stay indexed and searchable with their citations

#### Scenario: Empty or stale code sources
- **WHEN** no eligible code exists or indexed originals have changed
- **THEN** the app reports the coverage or refresh action and does not claim a current working graph

### Requirement: Recoverable bounded execution
Downloads, extraction and tool processes SHALL be bounded, cancelable and scoped to app-owned locations.
Companion SHALL retain recoverable progress and preserve originals during interruption, retry and cleanup.

#### Scenario: Offline or interrupted preparation
- **WHEN** a download or tool operation cannot finish
- **THEN** the app reports incomplete stages, retains usable existing context and offers a reviewed retry
- **AND** partial artifacts never become ready runtimes

#### Scenario: Original or plan changed before apply
- **WHEN** a reviewed source, adoption hash, location or expected output no longer matches
- **THEN** apply or recovery refuses the stale plan without overwriting intervening changes

### Requirement: Accessible external AI handoff
Companion SHALL offer a supported trusted local-app launch or an explicit web/context fallback, with
reviewable prompts and source exports. Tool preparation and handoff SHALL remain usable with keyboard,
reduced motion and enlarged text, without requiring terminal commands from the person.

#### Scenario: Supported installed AI
- **WHEN** a person chooses to open a verified supported local application
- **THEN** the folder is passed through its supported interface with fixed literal arguments
- **AND** the UI reports what was opened without claiming the AI has read the project

#### Scenario: Only web chat is available
- **WHEN** a local folder launch cannot be supported
- **THEN** the app offers reviewed context and explains the remaining copy or attachment step
- **AND** it does not silently send messages or upload sources

#### Scenario: Cancel, error or retry by keyboard
- **WHEN** preparation changes state while keyboard navigation, zoom or reduced motion is active
- **THEN** progress, errors and recovery controls remain understandable and focus remains usable

