# companion-environment Specification

## Purpose
Define how Companion installs, verifies and recovers the reviewed local runtimes and profile tools a
prepared project needs, so readiness is reported only after real execution and the person keeps usable
context, entry points and originals when a tool, download or location changes. This extends to the technology
a particular project needs, which follows from what the person said rather than from one list for everyone:
asked for, recommended with its reason, or deliberately deferred — and installing nothing is a finished answer
with an explanation, not a gap. Only what can be pinned by the digest of its installed tree is offered; what
cannot is named with its origin and its reason instead of being offered by a control that cannot work.
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

### Requirement: What gets installed follows what the person said about their project
Companion SHALL decide project technology from what the person stated and from the inventory it already
measured, SHALL offer only technologies whose installed tree it can pin by digest, and SHALL name a technology
it cannot install with its origin and its reason instead of offering a control that cannot work.

#### Scenario: The person asked for a technology
- **WHEN** a person states the technology they intend to use and it is offered
- **THEN** its identity, the licences of its complete dependency closure, its download size, its installed size
  and its destination SHALL be shown before anything is written
- **AND** it SHALL be installed from a reviewed lockfile with lifecycle scripts disabled, in an isolated
  environment, and the installed tree SHALL be compared against its pinned digest before being moved into place

#### Scenario: The person does not know yet, or is a beginner
- **WHEN** a person states that they do not know which technology to use
- **THEN** a recommendation SHALL be offered with a sentence explaining why it follows from their profile and
  their folder
- **AND** the recommendation SHALL be refusable, and refusing it SHALL leave preparation in the same valid state
  it had before the question was asked

#### Scenario: It is too early, or the project is not about that
- **WHEN** technology cannot yet be chosen, or the kind of project does not call for one
- **THEN** no technology SHALL be installed
- **AND** the screen SHALL state why installing nothing is the correct outcome, rather than leaving the absence
  unexplained

#### Scenario: A recommendation cannot depend on a model
- **WHEN** no model is available or the person turned inference off
- **THEN** the same recommendation and the same explanation SHALL be produced from profile and inventory alone
- **AND** a model, where present, SHALL NOT add a technology or change which one is recommended

#### Scenario: A technology that cannot be pinned
- **WHEN** a technology is distributed as its own installer or software development kit rather than as a
  reviewable dependency closure
- **THEN** it SHALL be named with where it comes from and why it is not installed from here

#### Scenario: Withdrawing what was installed
- **WHEN** a person withdraws an installed technology
- **THEN** the installed tree SHALL be measured again, removed only while it still matches its pinned digest,
  and preserved with its cause reported when it no longer does
- **AND** files the person owns, including the project's own manifest, SHALL NOT be written at any point

