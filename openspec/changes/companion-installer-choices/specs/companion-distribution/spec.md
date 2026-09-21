## MODIFIED Requirements

### Requirement: Installation that preserves the person's work
Installation SHALL be per-user, offer a destination, a Start-menu shortcut and an explicit desktop-shortcut
choice initially selected, and present the license and data notice before writing. An assisted installer
SHALL offer an initially selected Finish-page choice to open the installed app; the user can clear either
choice before continuing. Uninstallation SHALL remove only what the installer wrote, including the
product-owned desktop shortcut when one exists. Automated release evidence SHALL use paths isolated from a
person's existing application, project, history and runtimes and SHALL distinguish a silent installer
assertion from a human interaction with the wizard. Silent installation SHALL apply the desktop choice's
documented default without presenting or requiring the custom page, and SHALL NOT be described as an
observation that a person made that choice or opened the app. Uninstallation verification SHALL await the
completion of the uninstaller's asynchronous process delegation with a bounded timeout before evaluating
removal of the program directory. The installer SHALL contextually detect existing installations in the
Windows registry, offering repair, clean uninstallation or cancellation when the same version is present,
and clean upgrade or cancellation when a previous version is detected.

#### Scenario: A person installs and launches the app
- **WHEN** the assisted installer runs on a Windows machine without Node or a terminal
- **THEN** it offers a marked desktop-shortcut choice and a marked Finish-page launch choice
- **AND** after the person keeps both choices and completes the wizard, the desktop shortcut starts the app
  and it reaches its first screen

#### Scenario: A person declines optional installer choices
- **WHEN** the person clears the desktop-shortcut or Finish-page launch choice before completing an
  assisted installation
- **THEN** the installer respectively leaves no product desktop shortcut or does not open the app at Finish
- **AND** installation ownership, Start-menu shortcut and the person's data protections remain unchanged

#### Scenario: A release test uses the installer silently
- **WHEN** native automation installs, updates or removes the candidate with `/S`
- **THEN** every mutable test path resolves inside one fresh test root before it is passed to the installer
  except the product-owned desktop link on the declared disposable Windows user profile
- **AND** the default desktop link exists after installation or update and is absent after uninstallation,
  while the result explicitly says that wizard interaction and Finish-page selection were not observed

#### Scenario: Uninstallation verification awaits asynchronous removal
- **WHEN** native uninstallation executes silently in the disposable runner
- **THEN** uninstallation verification awaits the removal of the program directory with a bounded timeout
  accounting for the uninstaller's asynchronous process delegation
- **AND** failure to remove the directory within the budget fails the release assertion

#### Scenario: A person reinstalls or uninstalls
- **WHEN** the app is reinstalled over an existing installation or removed
- **THEN** prepared project folders, the local project history and the managed runtimes remain intact
- **AND** removing those runtimes or that history is an explicit separate action

#### Scenario: A person changes the desktop choice during repair or update
- **WHEN** an assisted repair or update reaches the desktop-shortcut choice
- **THEN** choosing it creates or retains only the product-owned desktop link and clearing it removes only
  that link
- **AND** neither branch modifies unrelated desktop entries, project folders, history or runtimes

#### Scenario: A person runs the installer when the same version is installed
- **WHEN** the installer starts on a machine where the exact version is already recorded in the registry
- **THEN** it SHALL present a contextual dialogue offering options to repair the current installation,
  uninstall the program, or cancel

#### Scenario: A person runs the installer when an earlier version is installed
- **WHEN** the installer starts on a machine where an earlier version is detected
- **THEN** it SHALL present a contextual dialogue offering to update to the new version or cancel

#### Scenario: A person cancels contextual installation
- **WHEN** the user selects cancel in any contextual installer dialogue
- **THEN** the installer SHALL abort immediately without modifying files, shortcuts or registry entries

## ADDED Requirements

### Requirement: Consistent Spanish assisted installer
The assisted NSIS installer SHALL present its standard pages, controls, Finish-page choice, license/data
notice and Companion-specific contextual messages in Spanish. It SHALL use a fixed Spanish installer
language rather than a language-selection dialog, and release evidence SHALL record what an actual Windows
installer displayed before claiming consistency.

#### Scenario: A person opens a fresh assisted installer
- **WHEN** a fresh candidate installer is opened interactively in a declared disposable Windows environment
- **THEN** the standard destination, desktop-choice, installation-progress and Finish-page controls appear
  in Spanish alongside the existing Spanish license and contextual messages
- **AND** the evidence records the candidate identity, Windows environment and pages actually observed

#### Scenario: The baseline differs from the candidate
- **WHEN** a real current baseline or candidate displays an unexpected mixed-language standard control
- **THEN** the validation fails and records the observed text and artifact identity
- **AND** the change does not claim a consistent Spanish installer until a corrected candidate is observed
