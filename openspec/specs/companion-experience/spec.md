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

### Requirement: Obsidian Precision Studio theme and responsive topbar navigation
The Companion application SHALL display a dark obsidian theme (#0B0F19 background, #121826 surface card, #6366F1 indigo accents, #06B6D4 cyan and #10B981 emerald highlights), an integrated topbar navigation header with responsive pills and brand icon, action cards on the home screen, and a dark multi-size native Windows icon.

#### Scenario: User launches the application
- **WHEN** the Companion desktop application starts
- **THEN** the initial window background SHALL be #0B0F19 without white or light flickering
- **AND** the topbar header SHALL render the SVG brand icon, status indicator, and navigation pills

#### Scenario: User navigates on various viewports
- **WHEN** the user resizes the window down to 240px or expands up to 1180px
- **THEN** all controls, cards, and textual content SHALL remain accessible without horizontal overflow or clipped actions
- **AND** color contrast SHALL satisfy WCAG AA/AAA thresholds across all interactive elements

### Requirement: Wizard actions remain reachable with normal motion
The Companion SHALL keep the current wizard content and actions reachable with normal and reduced
motion at 1180×820, 1160×810 and 1040×700. The final wizard action bar SHALL remain in document flow
after the animated content and outside any transformed ancestor, and SHALL require no compensatory bottom
space. In those windows it SHALL use sticky positioning. In windows at most 500 px tall or 380 px wide it
MAY stay static after the content, so that it does not cover a large share of a small viewport.
Action rows inside installation cards SHALL remain local to their cards.

#### Scenario: A short wizard screen fits the viewport
- **WHEN** a wizard screen including its final action bar fits the available viewport
- **THEN** the bar top SHALL be at or below the bottom of the preceding content
- **AND** no field, suggestion or action SHALL be covered by the bar

#### Scenario: A long screen requires scrolling
- **WHEN** a person scrolls through setup, folder, delimitation, vision, installation or completion
- **THEN** every expected field and action SHALL be reachable, including the last content before the bar
- **AND** at the bottom there SHALL be no empty reserve introduced to compensate for an out-of-flow bar
- **AND** ordinary spacing and visible status messages SHALL remain distinguishable from dead scroll space

#### Scenario: The window is small or zoomed
- **WHEN** the wizard is shown in a window at most 500 px tall or 380 px wide, such as the default window at 200 % zoom or the minimum window
- **THEN** every expected field and action SHALL remain reachable by scrolling and resolve to itself at its visible center
- **AND** the page SHALL not need horizontal scrolling

#### Scenario: Each primary control is hit tested
- **WHEN** the current wizard is traversed in each required viewport with each motion preference
- **THEN** the test SHALL observe each expected control after scrolling it into view and settling the entry animation
- **AND** elementFromPoint at its visible center SHALL resolve to that button or a descendant belonging to it
- **AND** both installation choices and both final copy buttons SHALL be clicked without forced clicks

#### Scenario: The initial action bar is separated from its form
- **WHEN** the person submits setup by click or Enter
- **THEN** native required-field validation and the same form handler SHALL still apply
- **AND** valid answers SHALL be retained while invalid answers SHALL not advance the wizard

#### Scenario: A field is reached with assistive technology
- **WHEN** focus reaches a field of the current wizard, including the vision editor
- **THEN** the field SHALL expose an accessible name that does not depend on its placeholder

### Requirement: The quick-install prompt claims only what was done
The master prompt of the quick installation SHALL NOT state that dependencies or tools were installed or
provisioned, because neither installation choice installs any in this version.

#### Scenario: The quick-install prompt is copied
- **WHEN** a person finishes the wizard with the quick installation and copies the master prompt
- **THEN** the copied text SHALL say that the folder was prepared and PROJECT_VISION.md was written
- **AND** it SHALL NOT say that dependencies were provisioned or installed

### Requirement: A multi-line vision does not stop the wizard
The wizard SHALL send the vision with its line breaks and SHALL derive the objective sent with the preparation
as a single line of at most 500 characters, so that a suggestion or a typed line break never makes the
installation fail. When the vision leaves no text for the objective, the objective already chosen SHALL be kept.

#### Scenario: A suggestion or a line break is added to the vision
- **WHEN** a person adds a suggestion or types a line break in the vision and then chooses either installation
- **THEN** the preparation SHALL be accepted and the completion screen SHALL be reached
- **AND** PROJECT_VISION.md SHALL keep every line of the vision the person wrote
- **AND** the objective recorded by the preparation SHALL contain no line break and at most 500 characters

#### Scenario: The vision leaves no text for the objective
- **WHEN** a person empties the vision or leaves only a heading mark in it, on the first visit or after returning from the installation step, and then chooses an installation
- **THEN** the preparation SHALL be accepted and the completion screen SHALL be reached
- **AND** the objective recorded by the preparation SHALL be the one chosen in the first step
- **AND** PROJECT_VISION.md SHALL state that objective

### Requirement: Wizard navigation reflects all current screens
The preparation navigation item SHALL declare aria-pressed true on setup, folder, delimitation, vision,
install and finished and retain its existing selection on stack-choice and ready when those routes are used.

#### Scenario: Installation or completion is shown
- **WHEN** the person reaches either installation or completion
- **THEN** Preparar proyecto SHALL remain visibly active and expose aria-pressed true

#### Scenario: A person leaves preparation
- **WHEN** the person opens Inicio, Tus proyectos or Ayuda
- **THEN** Preparar proyecto SHALL expose aria-pressed false and the destination SHALL become active

### Requirement: The hotfix regression measurement rejects missing observations
The UI and interface-contract harnesses SHALL measure the current wizard with animation enabled and
record expected and observed screens and controls. A missing visit or empty measurement SHALL fail.

#### Scenario: The fixed action bar defect is reintroduced
- **WHEN** a mutation of a disposable renderer copy restores fixed wizard actions under animated .enter
- **THEN** the interface-contract verification SHALL detect interception or invalid bar geometry on a visited screen
- **AND** a timeout, harness exception or unvisited screen SHALL not count as successful mutation detection

#### Scenario: Reduced motion hides the regression
- **WHEN** reduced motion passes but the normal-motion traversal has an unreachable expected action
- **THEN** the combined hotfix verification SHALL fail and identify the affected viewport, screen and control

