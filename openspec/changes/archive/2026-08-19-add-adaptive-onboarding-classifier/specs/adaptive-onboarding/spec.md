## ADDED Requirements

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
