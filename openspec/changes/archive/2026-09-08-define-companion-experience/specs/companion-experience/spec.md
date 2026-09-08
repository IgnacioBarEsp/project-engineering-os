## ADDED Requirements

### Requirement: Companion preparation is appropriate to the project
The companion SHALL distinguish research/documents, software, Unity/game, media creation and general work
and SHALL explain its selected preparation in accessible task language.

#### Scenario: A person chooses a document-only folder
- **WHEN** the folder contains research documents instead of a software repository
- **THEN** the preparation contract SHALL provide local context and source navigation without requiring Git or a software framework

#### Scenario: A tool needed for a project is unavailable
- **WHEN** an external engine, model, account or supported extraction capability is missing
- **THEN** the experience SHALL identify the affected result, remaining action and fallback instead of marking it ready

### Requirement: Users retain their AI and their project data
The companion SHALL prepare reusable folders, route selected agents to verified context and preserve
user-owned files through cancellation, reapplication and uninstall.

#### Scenario: A person uses web chat
- **WHEN** the AI cannot access the local folder
- **THEN** the companion SHALL offer a reviewable context export and explain the external transfer step
- **AND** it SHALL NOT silently upload documents or claim a local integration exists

#### Scenario: A person prepares another folder
- **WHEN** the application is reopened after first installation
- **THEN** its design SHALL support a new project and health checks for previous projects without reinstalling the app

### Requirement: Quality and efficiency claims require matched evidence
The program SHALL test installation and preparation end to end, use five profile-specific fixtures and
compare matched before/after tasks with setup cost, correctness and resource consumption recorded separately.

#### Scenario: Only context size was measured
- **WHEN** no provider reports token usage or generated answers were not evaluated
- **THEN** the result SHALL label token estimates and unmeasured hallucination/quality outcomes explicitly

#### Scenario: A prototype or simulated persona was reviewed
- **WHEN** the implementing agent validates a prototype or fixture
- **THEN** evidence SHALL identify that scope without claiming independent human review or a representative user study
