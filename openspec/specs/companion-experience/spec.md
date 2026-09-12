# companion-experience Specification

## Purpose
Define project-appropriate preparation, external AI handoff, data ownership and evidence standards for
the reusable Companion experience across research, software, games, media creation and general work.

It also defines how the experience addresses a person who has never read this repository: navigation
destinations whose jobs do not overlap, one name per action, a short definition reachable from every screen
where a technical term appears, a listed state that says whether it was recorded or verified, and evidence
about the installed application that names the source it measured.
## Requirements
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

### Requirement: Each navigation destination owns one job
The companion SHALL offer navigation destinations whose jobs do not overlap, and SHALL NOT make one action
reachable from two navigation entries carrying different names.

#### Scenario: A person looks for the list of their projects
- **WHEN** they open the destination named for their projects
- **THEN** it SHALL contain the projects and their state and SHALL NOT contain a greeting, explanatory prose
  or numbered steps
- **AND** the check SHALL fail on any text outside a project card other than the destination's own heading,
  whatever element carries it

#### Scenario: The same destination or operation is offered from more than one screen
- **WHEN** a control offers a destination or a repeatable operation that another control also offers
- **THEN** every such control SHALL take its name from one declaration of that action, so the action cannot
  carry a second name
- **AND** the set of declared actions SHALL be closed, so removing a control SHALL NOT satisfy the check by
  omission and declaring an action outside the set SHALL fail

#### Scenario: A control only moves one step back from where the person is
- **WHEN** a control's meaning is positional rather than a destination
- **THEN** it SHALL be exempt from the naming rule, because naming it after a destination would restate the
  defect the rule exists to remove

### Requirement: The interface explains itself without assuming its own vocabulary
The companion SHALL state what it does in language a person who has never read this project understands, and
SHALL make a short definition reachable from every screen where a technical term appears.

#### Scenario: A person opens the application for the first time
- **WHEN** the welcome destination renders
- **THEN** it SHALL state in one sentence what the application does without relying on a term it has not yet
  defined
- **AND** it SHALL say what is downloaded, why, and what stays on this machine

#### Scenario: A technical term appears on a screen
- **WHEN** the word appears in the interface's own text on that screen, in any element
- **THEN** a control opening that term's definition SHALL be present on that same screen, and the same
  definition SHALL appear in the glossary
- **AND** a control opening a definition SHALL name the term it opens

#### Scenario: Vocabulary of this project has no definition to offer
- **WHEN** a word belongs to the implementer's vocabulary rather than the product's
- **THEN** it SHALL NOT appear in the interface at all

#### Scenario: Warmth would require an undemonstrated claim
- **WHEN** a sentence would assert a benefit that has not been measured, or that a measurement found to be
  even
- **THEN** the sentence SHALL drop the claim or wait for the measurement, and SHALL NOT soften it until it
  reads as demonstrated
- **AND** every sentence stating a limit of the result SHALL be preserved

### Requirement: A listed project state says how it was obtained
The companion SHALL distinguish a state read from its own records from a state verified against the folder,
SHALL NOT present the first as the second, and SHALL NOT let reading those records block the screen.

#### Scenario: The list of projects renders many entries
- **WHEN** states are shown without opening each project
- **THEN** they SHALL come from recorded receipts without re-inspecting the folder, and the screen SHALL say
  the state is recorded and how to verify it, at no smaller a size than the state it qualifies
- **AND** a recorded state SHALL NOT assert a capability that opening the project could refuse

#### Scenario: A listed folder was moved, cannot be read, or does not answer
- **WHEN** one project's records are unreachable or a read exceeds its budget
- **THEN** that entry SHALL show the cause the service reported rather than a generic guess, the remaining
  entries SHALL still render, and the screen SHALL remain bounded by the budget rather than by the
  filesystem

### Requirement: An interface measurement identifies the application it measured
Evidence about the installed application SHALL record the identity of the source that was running, SHALL
declare what that comparison does not cover, and SHALL NOT be reported for an installation that differs from
the reviewed source.

#### Scenario: The installed application carries different source than the change under review
- **WHEN** any compared file, the application's top-level entries, the fields of its manifest that decide
  what runs, or the pinned core differ from the reviewed source
- **THEN** the check SHALL refuse to produce a result unless the installation is synchronised

#### Scenario: The installed application matches the reviewed source
- **WHEN** the comparison finds no difference
- **THEN** the record SHALL still carry both digests of every compared file, the commit the comparison was
  made against, and the list of what was deliberately not compared
- **AND** the comparison SHALL happen before the measurement loads any module from the installation

