## MODIFIED Requirements

### Requirement: Companion preparation is appropriate to the project
The companion SHALL distinguish software/apps, research/science, university studies, content/documentation, work/business and personal/laboratory through six canonical profiles and their owned focuses. It SHALL read supported legacy selections without rewriting them and guide the person through exactly four preparation steps: Tu proyecto, Enfoque, Visión and Preparar, followed by Listo. It SHALL offer the two routes for later orchestration without presenting a second preparation path or claiming unverified work.

#### Scenario: A person chooses a document-only folder
- **WHEN** the folder contains research documents instead of a software repository
- **THEN** the preparation contract SHALL provide local context and source navigation without requiring Git or a software framework

#### Scenario: A tool needed for a project is unavailable
- **WHEN** an external engine, model, account or supported extraction capability is missing
- **THEN** the experience SHALL identify the affected result, remaining action and fallback instead of marking it ready

#### Scenario: A person chooses their profile
- **WHEN** the user selects one of the six supported profiles in Tu proyecto
- **THEN** Enfoque SHALL show only that profile's owned focuses, and any prior incompatible technology selection SHALL be cleared

#### Scenario: A person enters through an existing folder
- **WHEN** the native selector returns a previously prepared folder
- **THEN** Companion SHALL open its checked project view
- **AND** if the folder is new it SHALL enter Tu proyecto with the folder and measured recommendation already present, without skipping the name field

#### Scenario: A person returns through the assistant
- **WHEN** they navigate from Preparar back to Tu proyecto and forward again
- **THEN** name, folder, profile, focus, technology, vision and AI choices SHALL remain unchanged unless the person edits them
- **AND** the rail, breadcrumb and active destination SHALL identify the same one of four steps

#### Scenario: A person chooses a route in Preparar
- **WHEN** the user reaches Preparar
- **THEN** the experience SHALL present two explicit routes and a folded real plan of files to be written
- **AND** it SHALL apply nothing before the reviewed plan is approved

#### Scenario: A person inspects Listo
- **WHEN** preparation completes successfully
- **THEN** the interface SHALL state only the stages actually verified, name pending stages, display the folder, allow exact local copying of the path and master prompt, and link to the project view

## ADDED Requirements

### Requirement: The assistant has one reachable path
The renderer SHALL NOT expose the independent old review sequence as a way to prepare a new project. Each visible control that looks actionable SHALL be a keyboard-accessible button with an observed effect, and the primary control of Preparar SHALL remain visible at 1180×820 and 1024×700.

#### Scenario: A person starts on Inicio
- **WHEN** they choose to prepare a new project
- **THEN** they SHALL traverse the four declared steps without a second branch to the old review screens

#### Scenario: A decorative control is introduced
- **WHEN** a span or div is styled as a button without a button's semantics and effect
- **THEN** the interface contract SHALL fail
