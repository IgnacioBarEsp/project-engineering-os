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

### ADDED Requirement: Visual excellence, purposeful motion and human microcopy
The companion and public landing page SHALL provide fluid cubic-bezier transitions, non-blocking activity loaders, accessible contrast and empathetic microcopy without technical jargon, and SHALL observe the user's motion preferences.

#### Scenario: A person navigates between preparation steps
- **WHEN** the user advances or returns between wizard steps
- **THEN** the interface SHALL render smooth vertical and opacity transitions with cubic-bezier deceleration curves
- **AND** the transition SHALL be suppressed when prefers-reduced-motion is requested

#### Scenario: An operation is in progress
- **WHEN** the project is being indexed, configured or prepared
- **THEN** the interface SHALL present visual feedback with non-blocking progress indicators and shimmering loaders

#### Scenario: The public landing page is rendered
- **WHEN** a visitor loads the public landing page
- **THEN** the layout SHALL present Obsidian Precision Studio styling with zero external network requests, zero JavaScript scripts, and WCAG AA/AAA accessible contrast
