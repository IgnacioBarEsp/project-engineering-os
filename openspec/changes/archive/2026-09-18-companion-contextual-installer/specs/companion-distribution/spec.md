## MODIFIED Requirements

### Requirement: Installation that preserves the person's work
Installation SHALL be per-user, offer a destination and a shortcut, and present the license and data
notice before writing. Uninstallation SHALL remove only what the installer wrote. Automated release
evidence SHALL use paths isolated from a person's existing application, project, history and runtimes and
SHALL distinguish a silent installer assertion from a human interaction with the wizard. Uninstallation
verification SHALL await the completion of the uninstaller's asynchronous process delegation with a bounded
timeout before evaluating removal of the program directory. The installer SHALL contextually detect existing
installations in the Windows registry, offering repair, clean uninstallation or cancellation when the same
version is present, and clean upgrade or cancellation when a previous version is detected.

#### Scenario: A person installs and launches the app
- **WHEN** the installer runs on a Windows machine without Node or a terminal
- **THEN** the app starts from its shortcut and reaches its first screen

#### Scenario: A release test uses the installer silently
- **WHEN** native automation installs, updates or removes the candidate
- **THEN** every mutable test path resolves inside one fresh test root before it is passed to the installer
- **AND** the result records installation ownership and explicitly says that wizard interaction was not
  observed

#### Scenario: Uninstallation verification awaits asynchronous removal
- **WHEN** native uninstallation executes silently in the disposable runner
- **THEN** uninstallation verification awaits the removal of the program directory with a bounded timeout
  accounting for the uninstaller's asynchronous process delegation
- **AND** failure to remove the directory within the budget fails the release assertion

#### Scenario: A person reinstalls or uninstalls
- **WHEN** the app is reinstalled over an existing installation or removed
- **THEN** prepared project folders, the local project history and the managed runtimes remain intact
- **AND** removing those runtimes or that history is an explicit separate action

#### Scenario: A person runs the installer when the same version is installed
- **WHEN** the installer starts on a machine where the exact version is already recorded in the registry
- **THEN** it SHALL present a contextual dialogue offering options to repair the current installation, uninstall the program, or cancel

#### Scenario: A person runs the installer when an earlier version is installed
- **WHEN** the installer starts on a machine where an earlier version is detected
- **THEN** it SHALL present a contextual dialogue offering to update to the new version or cancel

#### Scenario: A person cancels contextual installation
- **WHEN** the user selects cancel in any contextual installer dialogue
- **THEN** the installer SHALL abort immediately without modifying files, shortcuts or registry entries
