# companion-desktop Specification

## Purpose
Define the accessible local desktop workflow for preparing, checking and recovering selected project
folders, with isolated native privileges and reviewed handoff to the person's existing AI.
## Requirements
### Requirement: Guided local project preparation
Companion SHALL provide a Spanish visual workflow for choosing experience, profile, AI and a native
selected project folder, reviewing changes and observing actual preparation results.

#### Scenario: A person prepares a folder
- **WHEN** a person completes the selections and applies a reviewed plan
- **THEN** the UI reports verified base/context/engineering stages separately and preserves original files

#### Scenario: Preparation cannot finish
- **WHEN** a prerequisite, conflict, cancellation or interruption prevents completion
- **THEN** the UI explains the next action and supports checked recovery without claiming success

### Requirement: Scoped desktop privileges
The application SHALL isolate the renderer and expose only validated operations on explicitly selected
or remembered project handles, with project data rendered as text and no arbitrary execution or networking.

#### Scenario: Untrusted UI or project input
- **WHEN** a payload contains an unknown handle, invalid command/path/URL or markup in project data
- **THEN** the main process rejects unauthorized operations and source text does not become executable UI

### Requirement: Reusable accessible workspace
Companion SHALL retain local project history and offer status, attributed search, recipes and a reviewable
handoff to the selected external AI, usable by keyboard and with reduced motion and enlarged text.

#### Scenario: Return to a project
- **WHEN** a person reopens a remembered project
- **THEN** the app checks its current state and supports source search or an actionable refresh

#### Scenario: External AI
- **WHEN** a person requests handoff
- **THEN** the app uses a supported destination and reviewed context without claiming unobserved agent activation

#### Scenario: Keyboard and motion preferences
- **WHEN** the app is used with keyboard, 200 percent zoom or reduced motion
- **THEN** controls remain reachable and understandable, errors remain visible and dialogs have a usable focus lifecycle
