## ADDED Requirements

### Requirement: What gets installed follows what the person said about their project
Companion SHALL decide project technology from what the person stated and from the inventory it already
measured, SHALL offer only technologies whose installed tree it can pin by digest, and SHALL name a technology
it cannot install with its origin and its reason instead of offering a control that cannot work.

#### Scenario: The person asked for a technology
- **WHEN** a person states the technology they intend to use and it is offered
- **THEN** its identity, the licences of its complete dependency closure, its download size, its installed size
  and its destination SHALL be shown before anything is written
- **AND** it SHALL be installed from a reviewed lockfile with lifecycle scripts disabled, in an isolated
  environment, and the installed tree SHALL be compared against its pinned digest before being moved into place

#### Scenario: The person does not know yet, or is a beginner
- **WHEN** a person states that they do not know which technology to use
- **THEN** a recommendation SHALL be offered with a sentence explaining why it follows from their profile and
  their folder
- **AND** the recommendation SHALL be refusable, and refusing it SHALL leave preparation in the same valid state
  it had before the question was asked

#### Scenario: It is too early, or the project is not about that
- **WHEN** technology cannot yet be chosen, or the kind of project does not call for one
- **THEN** no technology SHALL be installed
- **AND** the screen SHALL state why installing nothing is the correct outcome, rather than leaving the absence
  unexplained

#### Scenario: A recommendation cannot depend on a model
- **WHEN** no model is available or the person turned inference off
- **THEN** the same recommendation and the same explanation SHALL be produced from profile and inventory alone
- **AND** a model, where present, SHALL NOT add a technology or change which one is recommended

#### Scenario: A technology that cannot be pinned
- **WHEN** a technology is distributed as its own installer or software development kit rather than as a
  reviewable dependency closure
- **THEN** it SHALL be named with where it comes from and why it is not installed from here

#### Scenario: Withdrawing what was installed
- **WHEN** a person withdraws an installed technology
- **THEN** the installed tree SHALL be measured again, removed only while it still matches its pinned digest,
  and preserved with its cause reported when it no longer does
- **AND** files the person owns, including the project's own manifest, SHALL NOT be written at any point
