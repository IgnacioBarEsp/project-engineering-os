## ADDED Requirements

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
