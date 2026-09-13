## ADDED Requirements

### Requirement: A stated destination is never substituted for another
The program SHALL decide where a person continues from what that person chose, not from what happens to be
installed, SHALL NOT open a web destination for someone who chose a desktop application, and SHALL NOT hold a
web address for a desktop application at all, so that the substitution is absent rather than merely unreached.

#### Scenario: A desktop application is chosen and can be opened
- **WHEN** the chosen application declares how it receives a folder and every verification for it passes
- **THEN** the application SHALL be opened with the folder
- **AND** the screen SHALL continue to state that opening it does not demonstrate that the AI read the project

#### Scenario: A desktop application is chosen and cannot be opened
- **WHEN** the chosen application is absent, or cannot be verified, or declares no folder route
- **THEN** nothing SHALL be launched and no address SHALL be opened
- **AND** the instruction SHALL be copied and the person SHALL be told to open the application themselves
- **AND** the reason SHALL be the one that applies, told apart from the other reasons

#### Scenario: A web chat is chosen
- **WHEN** the person chose a web chat rather than a desktop application
- **THEN** the web chat MAY be opened and the instruction copied

#### Scenario: An application present without verifiable provenance
- **WHEN** an application is installed but its signature or publisher cannot be verified
- **THEN** it SHALL still be refused with its cause, and this requirement SHALL NOT weaken that refusal

#### Scenario: Acceptance measures the substitution cannot return
- **WHEN** native and launch evidence is recorded
- **THEN** it SHALL record, for every desktop application present on the machine, that no address was opened
- **AND** deliberate removal of the rule SHALL be detected by a named check rather than by review
