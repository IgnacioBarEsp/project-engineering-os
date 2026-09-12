## ADDED Requirements

### Requirement: Each navigation destination owns one job
The companion SHALL offer navigation destinations whose jobs do not overlap, and SHALL NOT make one action
reachable from two navigation entries carrying different names.

#### Scenario: A person looks for the list of their projects
- **WHEN** they open the destination named for their projects
- **THEN** it SHALL contain the projects and their state and SHALL NOT contain a greeting, explanatory prose
  or numbered steps

#### Scenario: A person starts preparing a project from two places
- **WHEN** the same action is offered in navigation and in the body of another destination
- **THEN** both controls SHALL carry the same name

#### Scenario: A destination is renamed and a control elsewhere kept the old words
- **WHEN** any two reachable controls would start the same action under different names
- **THEN** the interface check SHALL fail rather than leave the person to discover the duplication

### Requirement: The interface explains itself without assuming its own vocabulary
The companion SHALL state what it does in language a person who has never read this project understands, and
SHALL make a short definition reachable from the place each technical term appears.

#### Scenario: A person opens the application for the first time
- **WHEN** the welcome destination renders
- **THEN** it SHALL state in one sentence what the application does without relying on a term it has not yet
  defined
- **AND** it SHALL say what is downloaded, why, and what stays on this machine

#### Scenario: A technical term cannot be removed from a screen
- **WHEN** a term such as a specification workflow, a code map or a recipe is needed on screen
- **THEN** a brief definition SHALL be reachable from that screen and the same definition SHALL appear in the
  glossary

#### Scenario: Warmth would require an undemonstrated claim
- **WHEN** rewriting a sentence would assert a benefit that has not been measured
- **THEN** the sentence SHALL drop the claim or wait for the measurement, and SHALL NOT soften it until it
  reads as demonstrated
- **AND** every sentence stating a limit of the result SHALL be preserved

### Requirement: A listed project state says how it was obtained
The companion SHALL distinguish a state read from its own records from a state verified against the folder,
and SHALL NOT present the first as the second.

#### Scenario: The list of projects renders many entries
- **WHEN** states are shown without opening each project
- **THEN** they SHALL come from recorded receipts without re-inspecting the folder, and the screen SHALL say
  the state is recorded and how to verify it

#### Scenario: A listed folder was moved or cannot be read
- **WHEN** one project's records are unreachable
- **THEN** that entry SHALL show the cause and the remaining entries SHALL still render

### Requirement: An interface measurement identifies the interface it measured
Evidence about the installed application's interface SHALL record the identity of the interface files that
were running, and SHALL NOT be reported for a window that differs from the reviewed source.

#### Scenario: The installed window carries a different interface than the change under review
- **WHEN** the digests of the installed interface files differ from the reviewed ones
- **THEN** the check SHALL refuse to produce a result unless the installed files are synchronised, and SHALL
  record both digests either way
