## ADDED Requirements

### Requirement: Official workflow generation is independent of host preferences
The local wrapper SHALL isolate global OpenSpec configuration and global Codex prompt output during init and update, with core/both defaults. It SHALL preserve the user's global settings and remove only its own temporary directory. Other commands SHALL remain free of this generation-only mutation.

#### Scenario: Commands-only host
- **WHEN** the host config selects commands-only delivery
- **THEN** the official generator invoked by the wrapper SHALL still emit required repository skills and commands without writing host prompts

### Requirement: Readiness phases are observable and read-only
The CLI SHALL verify an open enriched issue, declared dependencies and project membership before propose, and complete artifacts, applicable evidence, rollback, adversarial review and configured debt before archive. It SHALL reject malformed configuration and metadata without executing metadata-supplied commands.

#### Scenario: Missing archive assessment
- **WHEN** debt is configured and a change has no captured assessment
- **THEN** readiness archive SHALL fail with the missing flow and recovery

#### Scenario: Approved conditional profile
- **WHEN** the active list matches profile flags and every activated conditional profile has an approved decision reference
- **THEN** readiness SHALL accept the profile configuration and require its applicable evidence

#### Scenario: Unapproved or incoherent activation
- **WHEN** a conditional profile has no decision or the active list disagrees with its flags
- **THEN** readiness SHALL fail and identify the profile or mismatched list

#### Scenario: Spanish prose and unresolved markers
- **WHEN** metadata contains ordinary lowercase Spanish todo
- **THEN** it SHALL remain valid prose while unresolved uppercase TODO SHALL fail with the field and canonical pattern label, without echoing secret content

### Requirement: OPSX checks preserve official ownership
The CLI SHALL check official generated workflow ownership, hashes and published spec Purpose against an explicit target without generating or modifying workflows. Missing ownership, drift, unreadable specs or unresolved Purpose SHALL fail with recovery. An empty capability tree SHALL remain SKIP for Purpose.

#### Scenario: Upstream invocation
- **WHEN** a contributor needs to check consumer OPSX artifacts
- **THEN** documentation SHALL require an explicit consumer target and the upstream SHALL NOT expose a default script that targets its own incompatible layout

### Requirement: Doctor distinguishes obligations from consumer shape
Every doctor result SHALL expose category and applicability. An explicitly declared upstream with the package identity SHALL skip consumer-shape checks and retain the original observation; it SHALL continue checking its published obligations. Consumers SHALL retain applicable layout checks.

#### Scenario: Upstream missing readiness manifest
- **WHEN** upstream lacks its Product OS manifest
- **THEN** github.project SHALL fail while consumer-only layout checks remain SKIP

#### Scenario: Consumer missing layout
- **WHEN** a consumer lacks managed state or a constructor workflow
- **THEN** its applicable checks SHALL fail

### Requirement: Structural verification has an opt-in evidence path
Doctor SHALL accept independent GitNexus and CodeGraph receipts only when codeIndexable is explicitly enabled and a receipt is opted in, successful, recent and bound to the configuration hash. It SHALL never install, start or index a tool.

#### Scenario: Valid and missing receipts
- **WHEN** one tool has valid evidence and the other has none
- **THEN** the first SHALL pass and the other SHALL fail without borrowing its evidence

#### Scenario: Disabled policy
- **WHEN** indexing is not enabled
- **THEN** the checks SHALL skip with a policy explanation that does not assert absence of source code
