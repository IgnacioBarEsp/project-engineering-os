# adaptive-onboarding Specification

## Purpose
Definir cómo Project Engineering OS clasifica el inicio de un repositorio sin escribirlo y conduce cada ruta
hasta el discovery: inspección local read-only, cinco respuestas canónicas, estado versionado y determinista,
y un router que orquesta Prompt 00 y Prompt 01 bajo aprobación humana sin elegir stack ni producto.
## Requirements
### Requirement: Onboarding inspection is local, bounded and read-only
The onboarding classifier SHALL inspect repository evidence without writing the target, following symlinks,
reading arbitrary file contents, authenticating, or contacting remote services. It MUST surface incomplete
inspection instead of treating it as an empty repository.

#### Scenario: Empty folder is inspected
- **WHEN** `onboarding-plan` inspects an empty readable folder
- **THEN** it returns no brownfield evidence and performs no mutation
- **AND** the folder remains byte-for-byte unchanged

#### Scenario: Existing repository is inspected
- **WHEN** the target contains history, code, documentation, harness, tracker or automation evidence
- **THEN** the plan reports stable evidence IDs and relative paths without file contents or remote URL
- **AND** the evidence is sufficient to explain the selected route

#### Scenario: Inspection cannot prove emptiness
- **WHEN** a symlink, permission error or scan limit prevents complete inspection
- **THEN** the plan records the limitation and selects the preservation-safe route
- **AND** it does not follow, repair or remove the affected entry

### Requirement: The classifier uses at most five canonical answers
The classifier SHALL expose exactly five classification questions and SHALL normalize missing values to
`unknown`. Each answer SHALL accept a documented domain plus `unknown` and `defer`; unknown fields or values
MUST fail with recovery.

#### Scenario: Answers are incomplete
- **WHEN** an answer file omits one or more of the five fields
- **THEN** omitted fields become `unknown` and their question IDs remain pending
- **AND** classification continues without inventing an answer

#### Scenario: A decision is postponed
- **WHEN** an answer is `defer`
- **THEN** the decision appears in the deferred list and does not block a provisional route

#### Scenario: Answer contract is invalid
- **WHEN** an answer file contains a sixth field or unsupported value
- **THEN** the command fails before classification with a code and recovery that identify the answer contract

### Requirement: Brownfield evidence has precedence
The classifier SHALL select `brownfield` when strong existing-work evidence or `project=preserve` is
present, regardless of the declared guidance preference. Without preservation evidence it SHALL select
`experienced-new` only for `guidance=brief`; otherwise it SHALL use the reversible `beginner` default.

#### Scenario: Beginner adopts an existing repository
- **WHEN** evidence identifies existing work and answers request guided explanations
- **THEN** the route is `brownfield`, rebootstrap is disallowed and preservation steps come first

#### Scenario: Experienced person starts in an empty folder
- **WHEN** no preservation evidence exists and `guidance=brief`
- **THEN** the route is `experienced-new` and the plan remains local

#### Scenario: Person does not know the answers
- **WHEN** an empty folder is classified with `unknown` or `defer` answers
- **THEN** the route is provisionally `beginner` with pending or deferred decisions visible
- **AND** no tracker, architecture or remote action is chosen

### Requirement: Canonical onboarding state is deterministic and versioned
The command SHALL emit a state with schema/classifier versions, route, evidence, normalized answers,
pending questions, deferred decisions, next steps and a stable input hash. It MUST NOT include timestamps,
absolute paths, machine identity or nondeterministic ordering.

#### Scenario: Inputs are unchanged
- **WHEN** the same evidence and answers are classified repeatedly on a supported platform
- **THEN** canonical state JSON is byte-for-byte identical

#### Scenario: New evidence appears
- **WHEN** a previously empty target gains strong preservation evidence
- **THEN** the input hash changes and the next state selects `brownfield`

### Requirement: Prior state migrates without destructive writes
The state reader SHALL accept current v1 and the documented draft v0, migrate v0 in memory, and report a
receipt that identifies source hash and version transition. It MUST reject future, corrupt or unsupported
state with explicit recovery and SHALL leave the source file unchanged.

#### Scenario: Draft v0 is provided
- **WHEN** `onboarding-plan` reads a valid v0 state
- **THEN** it reuses normalized answers, records the v0-to-v1 migration and reclassifies against current evidence
- **AND** the v0 source remains unchanged for rollback

#### Scenario: Current v1 is reused
- **WHEN** a v1 state and current answers/evidence have not changed
- **THEN** the emitted canonical state matches the prior state and reports no migration

#### Scenario: State comes from a future runtime
- **WHEN** `stateFormatVersion` is greater than the supported version
- **THEN** the command fails with a future-state code and instructs the user to use the matching runtime

### Requirement: Human and JSON plans describe the same decision
`onboarding-plan` SHALL provide a concise human plan and a machine-readable JSON result with the same route,
evidence, pending/deferred decisions, mutation status and next steps. Both forms SHALL state that remote
mutation is absent.

#### Scenario: Human output is requested
- **WHEN** the command runs without `--json`
- **THEN** it prints route, evidence summary, pending/deferred decisions, rebootstrap policy and next steps
- **AND** it states that local inspection and remote mutation are read-only/absent

#### Scenario: JSON output is requested
- **WHEN** the same command runs with `--json`
- **THEN** the JSON exposes the canonical state and `mutationPerformed=false`
- **AND** its route and decision lists equal the human plan

### Requirement: A single router prompt is the entry point of adaptive onboarding
The distribution SHALL provide one router prompt that runs the read-only classifier, reports the selected
route with its evidence, and hands control to Prompt 00 and then Prompt 01. The router SHALL delegate to
those prompts by reference and MUST NOT restate their stage instructions, run the bootstrap itself, or
choose stack, architecture, MVVM, CI/CD, tracker or remote resources.

#### Scenario: A person starts a repository with the router
- **WHEN** the router prompt is used as the first prompt in a repository
- **THEN** it classifies the folder read-only and reports route, evidence, pending questions and deferred decisions
- **AND** it names Prompt 00 and Prompt 01 as the next stages instead of repeating their instructions

#### Scenario: The router is asked to choose product technology
- **WHEN** the person asks for a framework, database, cloud, architecture or pipeline during the router
- **THEN** the router defers the decision to discovery and keeps the universal core neutral
- **AND** no product profile, tracker or remote resource is activated

### Requirement: Classification stays within five canonical questions
The router SHALL reuse the five classifier questions and MUST NOT introduce an additional classification
question. Unknown and deferred answers SHALL remain valid and SHALL keep the route provisional instead of
blocking the journey.

#### Scenario: Answers are missing
- **WHEN** the person cannot answer one of the five questions
- **THEN** the router records the question as pending or deferred and continues with a provisional route
- **AND** it does not invent an answer or ask a sixth classification question

#### Scenario: Answers are collected in a file
- **WHEN** answers are stored and passed to the classifier by flag
- **THEN** the answer file and the state file are excluded from inspection evidence
- **AND** the resulting route is not caused by the onboarding inputs themselves

### Requirement: The onboarding state is recorded only after explicit human approval
The router SHALL show the canonical state and request explicit approval before writing the onboarding state
file. Without approval it SHALL write nothing and SHALL declare the journey provisional. A recorded state
SHALL be re-validated with the classifier and MUST NOT be edited by hand.

#### Scenario: The person approves the recorded route
- **WHEN** the person approves the state shown by the router
- **THEN** the router writes the canonical state unchanged and re-validates it with the classifier
- **AND** route, answers, pending questions and deferred decisions become traceable in the repository

#### Scenario: The person does not approve
- **WHEN** approval is refused or postponed
- **THEN** no file is written and the router states that the route is provisional
- **AND** the journey may continue without inventing a recorded decision

#### Scenario: A recorded state is inconsistent
- **WHEN** the classifier rejects the recorded state as non-canonical, corrupt or produced by a future runtime
- **THEN** the router reports the failure with recovery and keeps the source file for rollback
- **AND** it regenerates the state through the classifier instead of repairing the file manually

### Requirement: Each route reaches discovery in its own order
The router SHALL conduct the beginner route through brief idea, practical organization, environment and
discovery; the experienced route through ecosystem, environment and discovery; and the brownfield route
through inventory, preservation, confirmed gaps and discovery. Every route SHALL end at discovery and SHALL
keep CI/CD, MVVM and product architecture after it.

#### Scenario: Beginner route is selected
- **WHEN** the recorded route is the beginner route
- **THEN** the router explains organization and evidence just in time and prepares only the approved local environment
- **AND** it reaches discovery without choosing a tracker, stack or architecture first

#### Scenario: Experienced route is selected
- **WHEN** the recorded route is the experienced route for a new folder
- **THEN** the router reviews ecosystem constraints and pending operational decisions without an extended explanation
- **AND** it reaches discovery with those decisions recorded

#### Scenario: Brownfield route is selected
- **WHEN** the recorded route is the brownfield route
- **THEN** the router inventories and preserves existing files, tooling, tracker and automation before proposing anything
- **AND** it proposes only confirmed gaps through a reversible diff and never a blind rebootstrap

### Requirement: Prompt 00 and Prompt 01 consume the recorded route without reopening it
Prompt 00 SHALL read the recorded onboarding state, adapt order and depth to the route, and SHALL still
finish Stage A without asking for stack or the complete product. Prompt 01 SHALL read the recorded state and
the Prompt 00 handoff and SHALL reuse confirmed facts instead of restarting the interview.

#### Scenario: Prompt 00 runs after the router
- **WHEN** Prompt 00 starts with a recorded route
- **THEN** it adapts the environment work to that route and reports Stage A evidence
- **AND** it does not ask for framework, database, cloud, UI or the complete product

#### Scenario: Prompt 01 runs after Prompt 00
- **WHEN** Prompt 01 starts with a recorded state and an approved Stage A
- **THEN** it reuses route, confirmed answers and open decisions and only confirms what changed
- **AND** it does not ask again for facts already recorded

### Requirement: Handoff and recovery keep the journey traceable across chats
The router SHALL define a handoff block that carries route, decision status, pending and deferred decisions,
approved version, executed commands, pending human gates, rollback and prohibitions, without secrets. It
SHALL define recovery for a missing state, an unusable state, and evidence that changed after the bootstrap.

#### Scenario: Work continues in a new chat
- **WHEN** the context is loaded or the stage changes
- **THEN** the router produces a handoff that lets a new chat continue from the recorded decisions
- **AND** the handoff contains no secret values

#### Scenario: Evidence changes after the bootstrap
- **WHEN** the classifier runs again after the bootstrap and now reports the brownfield route
- **THEN** the router treats that result as a description of the current repository
- **AND** the recorded route of the journey is not overwritten silently

#### Scenario: The recorded state is missing
- **WHEN** no recorded state exists in a new chat
- **THEN** the router repeats classification and approval instead of assuming a route
- **AND** it does not continue to Prompt 00 with an invented decision

### Requirement: Root and blueprint prompts keep a verified shared contract
The root prompt and its blueprint mirror MAY differ in length and wording but SHALL declare the same routes,
the same five questions, the same references to the classifier, the recorded state, Prompt 00 and Prompt 01,
and the same human gate, handoff and recovery markers. A bootstrapped repository SHALL receive the router as
a managed file reachable within two links from its entry points.

#### Scenario: Both versions are compared
- **WHEN** the shared prompt contract is extracted from the root and blueprint router
- **THEN** both expose the same routes, questions, references and gate markers
- **AND** a version that drops a route or adds a sixth question fails the contract

#### Scenario: A repository is bootstrapped
- **WHEN** the constructor bootstraps an empty repository
- **THEN** the router is written as a managed file under the engineering documentation
- **AND** it is reachable within two links from the repository README or agent guide

### Requirement: Offline tracker planning preserves context
The CLI SHALL plan without network, authentication or writes. Plans SHALL bind current local request,
onboarding state, origin, target, exact operations and a bounded expiry. Existing or unknown trackers SHALL
NOT be replaced; GitHub MAY be suggested only for a GitHub origin and an explicit absence of a tracker.

#### Scenario: No confirmed tracker decision
- **WHEN** the canonical tracker answer is unknown, deferred or existing
- **THEN** the plan SHALL preserve that state and request missing context rather than create a default

### Requirement: Tracker writes require exact separate approval
Apply SHALL validate current plan and explicit per-operation/scopes approval before authentication. It
SHALL allow only private GitHub Project creation or description configuration of explicit existing GitHub,
Azure Boards or Jira Cloud projects, and SHALL reject unsupported or expanded operations.

#### Scenario: Tampered or stale plan
- **WHEN** a payload, local source, expiry or approval scope differs from the approved contract
- **THEN** apply SHALL fail before any credential use or remote request

### Requirement: Tracker execution preserves attributable evidence
Execution SHALL use bounded fixed-origin provider requests, an exclusive local lock and durable intent
journal, then re-read remote state. It SHALL distinguish local configuration, existence and read smoke,
without storing credentials. A repeated completed apply SHALL avoid duplicate writes; uncertain mutations
SHALL require reconciliation rather than automatic retry.

#### Scenario: Interrupted creation
- **WHEN** a create request may have reached the provider but no completed receipt exists
- **THEN** the next apply SHALL block and retain the journal for reconciliation

### Requirement: Tracker rollback respects ownership and drift
Rollback SHALL require separate approval and remote revalidation. It SHALL only restore a description
still matching the recorded write or delete an unchanged, empty GitHub Project created by that receipt.
It SHALL never delete a preexisting tracker or overwrite concurrent user changes.

#### Scenario: Project changed after creation
- **WHEN** the created project's configuration or contents differ from its receipt
- **THEN** rollback SHALL refuse deletion and report reconciliation without mutating remote state

