## ADDED Requirements

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
