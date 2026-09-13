# companion-experience Specification

## Purpose
Define project-appropriate preparation, external AI handoff, data ownership and evidence standards for
the reusable Companion experience across research, software, games, media creation and general work.

It also defines how the experience addresses a person who has never read this repository: navigation
destinations whose jobs do not overlap, one name per action, a short definition reachable from every screen
where a technical term appears, a listed state that says whether it was recorded or verified, and evidence
about the installed application that names the source it measured.

It also defines what an application has to declare before this one hands it a folder: a contract observed in
the installation — a help line that says it takes a path, or a route its own build declares together with the
system registering that scheme to that same verified executable — never an argument that looks plausible. An
application that declares nothing is still recognised, its publisher still reported, and it is not opened.

And it defines what a project's state may claim without being re-verified: the verdict of the last real check,
saved outside the person's folder with the digest of every file it depended on, shown as current only while
those digests still match. A ready mark is a claim about the stages that project's profile requires, dated,
and accompanied by what it does not cover; every doubt resolves away from it. Secondary and destructive
actions never hold the only way to do something, removing a project from the list leaves the person's files
untouched, duplicating copies no artefact of the original, and each project says what to do next given what it
is missing.
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
SHALL NOT present the first as the second, SHALL NOT let reading those records block the screen, and SHALL
present a saved verdict as current only while every file that verdict depended on is unchanged.

#### Scenario: The list of projects renders many entries
- **WHEN** states are shown without opening each project
- **THEN** they SHALL come from recorded receipts and from a saved verdict without re-inspecting the folder,
  and the screen SHALL say per entry how the state was obtained, when, and how to verify it, at no smaller a
  size than the state it qualifies
- **AND** a recorded state SHALL NOT assert a capability that opening the project could refuse

#### Scenario: A real check has run for a project
- **WHEN** every stage that profile requires was verified against the folder
- **THEN** the verdict SHALL be saved outside the person's folder with the state of each required stage, the
  time of the check, and the digest of every file the check depended on
- **AND** the saved verdict SHALL contain no absolute path

#### Scenario: A file the verdict depended on changed after the check
- **WHEN** any digest the verdict recorded differs from the file now, or that file cannot be read
- **THEN** the entry SHALL say the project has to be checked again and SHALL NOT show the ready mark
- **AND** the entry SHALL name which stage the changed file belongs to

#### Scenario: No verdict exists, the folder moved, or the verdict could not record everything it depended on
- **WHEN** the verdict is absent, its folder digest does not match, or its digest list was truncated for size
- **THEN** the entry SHALL say the project has not been checked and SHALL NOT show the ready mark

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

### Requirement: A ready mark names the stages it is a claim about
The companion SHALL show a project as ready only when every stage that project's profile requires verified
against the folder, SHALL declare which stages those are, and SHALL state on the same screen what the mark
does not cover.

#### Scenario: A profile requires a set of stages
- **WHEN** the readiness of a project is decided
- **THEN** the required stages SHALL be those declared for its profile, and a stage whose state is unknown or
  absent SHALL count as not ready
- **AND** a stage that the profile does not request SHALL NOT make the project unready

#### Scenario: A stage of a ready project is broken on purpose
- **WHEN** a file belonging to a verified stage is edited, removed or left inconsistent
- **THEN** the project SHALL leave the ready state and the screen SHALL name the affected stage in the
  person's words rather than with an internal code

#### Scenario: The mark cannot speak for something
- **WHEN** readiness is shown without re-reading the person's files, or excludes a stage such as the code map
  or a product this application cannot verify
- **THEN** the screen SHALL say so where the mark appears, at no smaller a size than the mark

#### Scenario: A project is incomplete
- **WHEN** one or more required stages are not ready
- **THEN** the entry SHALL enumerate which ones in plain language, naming what is actually not ready rather
  than the stage that contains it
- **AND** opening the project SHALL offer the step that resolves the first of them, against that same folder
  and without discarding the answers already saved

### Requirement: A secondary menu never holds the only way to do something
The companion SHALL keep every primary action reachable outside a secondary menu, SHALL open a project from
its own card, and SHALL NOT let a row control carry more than one name.

#### Scenario: A person wants to open a project from the list
- **WHEN** the list renders
- **THEN** the project's card SHALL be the control that opens it, and no second control SHALL offer opening
  under another name

#### Scenario: An action is secondary or destructive
- **WHEN** it duplicates a preparation or removes a project from the list
- **THEN** it MAY live inside the secondary menu, and the check SHALL fail if any primary action is reachable
  only from there, read from the rendered page rather than from review by eye

#### Scenario: A row control is declared
- **WHEN** a control acts on one listed project
- **THEN** its name SHALL come from one declaration of that row action, the set of row actions SHALL be
  closed, and a name that only assistive technology hears SHALL count as a name

### Requirement: Removing a project from the list keeps the person's files
The companion SHALL ask for confirmation before removing a project from its list, SHALL say that only the
list entry is removed, and SHALL NOT modify or delete anything in the person's folder.

#### Scenario: A person removes a project from the list
- **WHEN** they confirm the removal
- **THEN** the entry SHALL disappear from the list and every file in that folder SHALL remain byte-identical,
  verified on disk rather than by intent
- **AND** the confirmation SHALL have said that before the person accepted it

### Requirement: Duplicating a preparation never copies the original's artefacts
The companion SHALL let a person start a new project from another project's answers, and SHALL NOT copy any
preparation artefact of the original, which records that folder's paths and digests.

#### Scenario: A person duplicates a prepared project
- **WHEN** they choose the folder for the copy
- **THEN** the answers of the original SHALL be offered already filled in, nothing SHALL be written until the
  plan is approved like any other preparation, and the new folder SHALL contain none of the original's
  preparation artefacts, verified on disk
- **AND** the new project's own preparation SHALL carry its own digests rather than the original's

### Requirement: A project says how to work in it
The companion SHALL show, inside each project, what to do next given that project's profile and what it is
missing, and SHALL NOT present the same text for two projects whose profile or pending stages differ.

#### Scenario: A person opens a project that is missing stages
- **WHEN** the guidance renders
- **THEN** it SHALL list the steps in the order they can be done, each with the text to give an AI, composed
  by the application rather than by the screen
- **AND** the text offered for copying SHALL be refused when the project changed after it was composed

#### Scenario: Two different projects are compared
- **WHEN** two projects differ in profile or in which stages are pending
- **THEN** their guidance SHALL differ, compared as rendered text rather than assumed from the composition

### Requirement: An application is handed a folder only through what it declares
The companion SHALL hand a folder to a local application only when that application's own installation
declares how it receives one, SHALL treat a declaration as an observation of the installed software rather
than of documentation, and SHALL NOT construct an argument or address that the installation does not declare.

#### Scenario: An application declares a command-line contract
- **WHEN** its own help output declares that it accepts a path
- **THEN** the folder MAY be handed to it as that argument

#### Scenario: An application declares an address instead of a command line
- **WHEN** the installed build declares a route that takes a folder and the system registers that scheme to
  that same verified executable
- **THEN** the folder MAY be handed to it through exactly that route, with the folder encoded
- **AND** both facts SHALL be re-read between the review and the launch, and either one missing SHALL refuse
  the opening with its own reason

#### Scenario: An application declares nothing
- **WHEN** no contract is observed in the installation
- **THEN** the application SHALL still be recognised and its publisher reported, it SHALL NOT be opened, and
  the reviewed export SHALL remain the answer offered instead

#### Scenario: Reading a declaration could cost more than it is worth
- **WHEN** the declaration is read from the application's own resources
- **THEN** the read SHALL be bounded in size and SHALL stop at the first match, and a resource that cannot be
  read SHALL refuse the opening rather than allow it

#### Scenario: An application is opened
- **WHEN** the opening succeeds
- **THEN** the screen SHALL NOT state or imply that the AI read the project

