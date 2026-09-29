## ADDED Requirements

### Requirement: Bounded native transitions
The renderer SHALL use 120/200/280 ms motion tokens with an exit curve, no ease-in and no duration above 300 ms, preserving a stable step rail during same-document transitions and no persistent transformed layout container.

#### Scenario: Normal, unsupported and reduced modes
- **WHEN** a step changes under ordinary motion, without View Transitions support or with reduced motion
- **THEN** the native API or safe fallback commits the correct screen once, and reduced mode has no active animation or transition

#### Scenario: Overlapping transition callbacks
- **WHEN** a new render supersedes a pending transition
- **THEN** the old callback cannot overwrite the new screen and focus remains reachable

### Requirement: Real activity and bounded waiting
The renderer SHALL show measured completed/total without synthetic percentages, keep stage and cancellation visible for operations longer than ten seconds, place wizard progress in its action bar and retain the 300 ms to ten second skeleton bounds.

#### Scenario: Long activity
- **WHEN** progress events advance during a delayed read longer than ten seconds
- **THEN** the shown values equal the events and Detener requests the existing safe cancellation operation

### Requirement: Verified copy and accessible notices
The renderer SHALL confirm copying only after successful native IPC, show Copiado for two seconds and announce success with at most two four-second polite status messages; errors SHALL remain actionable panels.

#### Scenario: Success followed by failure
- **WHEN** copying first succeeds and then is rejected or its transport fails
- **THEN** the clipboard matches the successful text, the second attempt does not retain a copied claim and the cause appears in the error panel

### Requirement: Measured visual language and human cold reading
The renderer SHALL restrict title gradients to Inicio and the final screen, remove idle colored shadows and decorative pulses, preserve glossary access and record cold reading from two actual unfamiliar people without substituting agents.

#### Scenario: Missing or unsuccessful human observations
- **WHEN** two literal human responses for Inicio and step one have not been collected, or those responses do not identify the project folder and existing-AI purpose
- **THEN** the evidence records the real outcome and the issue is not marked complete regardless of automatic results; after a copy change the reading is repeated with different unfamiliar people

#### Scenario: Inicio read without product context
- **WHEN** an unfamiliar person reads Inicio
- **THEN** the prominent title names project preparation and Project Engineering OS, while a short explanation links the project folder and instructions to the person's AI without claiming automatic guidance or a best-in-industry result; the page does not compete with its primary action through process, download or privacy panels

#### Scenario: Optional explanation outside Inicio
- **WHEN** a person opens Ayuda and expands its frequently asked questions
- **THEN** the method, downloads and local-file treatment are available as concise, keyboard-operable disclosures without being required to start a project

#### Scenario: Step one opened without reading Inicio
- **WHEN** a person enters the first preparation step without having read Inicio
- **THEN** a brief label identifies the tool as project preparation for their AI while the original concise guidance names the project, folder and type of work, without adding a longer explanation to the form

#### Scenario: Required folder choice in step one
- **WHEN** no project folder has been selected
- **THEN** the folder choice is visually distinguished, labeled as an action and paired with a local folder icon while the original concise guidance remains unchanged
