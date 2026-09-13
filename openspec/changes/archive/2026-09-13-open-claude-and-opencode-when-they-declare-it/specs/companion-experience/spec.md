## ADDED Requirements

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
