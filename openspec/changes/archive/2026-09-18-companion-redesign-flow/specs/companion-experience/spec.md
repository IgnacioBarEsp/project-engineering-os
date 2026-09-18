## MODIFIED Requirements

### Requirement: Companion preparation is appropriate to the project
The companion SHALL distinguish software engineering, science/research, university studies, content
documentation, agile prototypes/MVPs, personal/flexible exploration and automation scripting/bots across 7
canonical profiles while preserving backwards compatibility with legacy profiles, and SHALL guide the
person through a 4-step preparation sequence offering a choice between immediate bundled installation and
delegated orchestration by their preferred AI.

#### Scenario: A person chooses a document-only folder
- **WHEN** the folder contains research documents instead of a software repository
- **THEN** the preparation contract SHALL provide local context and source navigation without requiring Git or a software framework

#### Scenario: A tool needed for a project is unavailable
- **WHEN** an external engine, model, account or supported extraction capability is missing
- **THEN** the experience SHALL identify the affected result, remaining action and fallback instead of marking it ready

#### Scenario: A person chooses their engineering profile
- **WHEN** the user selects one of the 7 supported profiles in Step 1
- **THEN** the interface SHALL dynamically present tailored architecture and delimitation subtypes in Step 2

#### Scenario: A person chooses the installation route in Step 4
- **WHEN** the user reaches Step 4
- **THEN** the experience SHALL present two explicit options: Quick Bundled Installation and Delegated AI Installation
- **AND** both options SHALL produce a verified project folder and a complementary master prompt for external LLMs

#### Scenario: A person inspects the final project screen
- **WHEN** preparation completes successfully
- **THEN** the interface SHALL display a verified completion indicator, fast local path copying, and a 1-click clipboard trigger for the master AI prompt
