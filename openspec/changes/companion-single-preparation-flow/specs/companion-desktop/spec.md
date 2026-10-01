## MODIFIED Requirements

### Requirement: Guided local project preparation
Companion SHALL provide a Spanish visual workflow for choosing one of six profiles and its owned focus, an AI and a native selected project folder, reviewing a real plan and observing actual preparation results through one four-step assistant. It SHALL preserve answers while moving back and forth without writing into the selected folder before plan approval.

#### Scenario: A person prepares a folder
- **WHEN** a person completes the selections and applies a reviewed plan
- **THEN** the UI SHALL report verified base/context/engineering stages separately and preserve original files
- **AND** it SHALL NOT claim an unexecuted stage is complete

#### Scenario: Preparation cannot finish
- **WHEN** a prerequisite, conflict, cancellation or interruption prevents completion
- **THEN** the UI SHALL explain the next action and support checked recovery without claiming success

## ADDED Requirements

### Requirement: App-owned bounded draft survives restart
The desktop service SHALL save at most one versioned assistant draft in its own data directory through validated IPC. The draft SHALL have a closed shape and byte limit, SHALL contain only wizard answers and the selected folder reference, and SHALL NOT read document contents, request credentials or write to the selected project folder. Loading a draft SHALL validate its folder and step prerequisites before restoring a project handle. This does not imply detection of secrets pasted by the person into their own answers.

#### Scenario: A person closes the app in Visión
- **WHEN** they reopen Companion with a valid saved draft
- **THEN** it SHALL offer to continue with their answers and the same folder, without creating project files

#### Scenario: The window closes immediately after an edit
- **WHEN** a normal native close arrives before the debounce interval ends
- **THEN** the main process SHALL await the pending renderer draft save before closing
- **AND** a failed save SHALL leave the window and the person's answers available

#### Scenario: The draft is corrupt or its folder moved
- **WHEN** the saved bytes exceed the bound, fail schema validation or no longer name the same canonical folder
- **THEN** the service SHALL refuse to treat it as a valid draft, preserve the suspect bytes and give an actionable recovery path

#### Scenario: A renderer supplies a forged draft field
- **WHEN** save receives an unknown key, invalid step, outside folder handle or oversized text
- **THEN** it SHALL reject before writing to app data or any project folder
