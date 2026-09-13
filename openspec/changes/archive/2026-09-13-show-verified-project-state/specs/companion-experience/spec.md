## MODIFIED Requirements

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

## ADDED Requirements

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
