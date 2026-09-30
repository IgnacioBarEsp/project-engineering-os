## ADDED Requirements

### Requirement: Bounded native transitions
Interaction-state and navigation motion SHALL use 120/200/280 ms tokens with an exit curve, no ease-in and no duration above 300 ms, preserving a stable step rail during same-document transitions and no persistent transformed layout container. The ambient-background and finite illumination exceptions defined below SHALL NOT lengthen interaction-state transitions or state feedback.

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
The renderer SHALL restrict text gradients to Inicio and the final title, use one continuous local indigo/cyan ambient background across the full application window, preserve glossary access and record cold reading from two actual unfamiliar people without substituting agents. Only the non-interactive ambient background may loop; controls, text, state feedback and navigation retain the bounded motion rules.

#### Scenario: Missing or unsuccessful human observations
- **WHEN** two literal human responses for Inicio and step one have not been collected, or those responses do not identify the project folder and existing-AI purpose
- **THEN** the evidence records the real outcome and the issue is not marked complete regardless of automatic results; after a copy change the reading is repeated with different unfamiliar people

#### Scenario: Inicio read without product context
- **WHEN** an unfamiliar person reads Inicio
- **THEN** the prominent title names project preparation and Project Engineering OS, while a short explanation links the project folder and instructions to the person's AI without claiming automatic guidance or a best-in-industry result; the page does not compete with its primary action through process, download or privacy panels

#### Scenario: Concrete preparation benefits across window sizes
- **WHEN** a person opens Inicio at a wide or compact window size
- **THEN** three concise benefits describe reviewing software changes documented with OpenSpec, preparing without a terminal and reviewing how to resume or undo preparation, using only implemented capabilities rather than unmeasured accuracy or efficiency claims; wide windows show them beside the primary copy, compact windows place them after the start actions, and they have no simulated completion metrics or claim to automatically capture all AI changes

#### Scenario: Continuous application background
- **WHEN** the person opens any route, wizard step, project tab, menu or dialog, scrolls, or resizes the window
- **THEN** the shared background covers the entire client viewport including the brand, navigation and privacy action without a content-column mask or seam; it is independent of route rendering, introduces no scroll range or transformed layout ancestor, cannot capture pointer events and does not imply activity or a verified status

#### Scenario: Ambient motion and reduced mode
- **WHEN** ordinary motion is enabled or the person requests reduced motion
- **THEN** the shared non-interactive background changes color through a single slow twenty-second opacity cycle, while controls and navigation retain finite shared motion tokens; reduced motion stops the ambient cycle and all interaction animations, leaving the same continuous static gradient rather than removing the background

#### Scenario: Deliberate illumination of brand and primary actions
- **WHEN** Inicio or the final title enters, or an enabled primary action is hovered or receives keyboard-visible focus anywhere in Companion
- **THEN** the gradient title or a non-interactive button overlay receives one restrained left-to-right illumination pass lasting 900 ms; only Project Engineering OS, not the preceding word con, is accented in Inicio, and the shared primary-action style covers start, wizard progression, reviewed actions, project search and continuation dialogs without additional labels or handlers
- **AND** illumination does not loop, apply to destructive/secondary controls, obscure the label, convey a completed operation, affect geometry or delay clicks; reduced motion and disabled actions have no illumination

#### Scenario: Optional explanation outside Inicio
- **WHEN** a person opens Ayuda and expands its frequently asked questions
- **THEN** the method, downloads and local-file treatment are available as concise, keyboard-operable disclosures without being required to start a project

#### Scenario: Step one opened without reading Inicio
- **WHEN** a person enters the first preparation step without having read Inicio
- **THEN** a brief label identifies the tool as project preparation for their AI and the heading leads directly to the labeled name, folder and type fields, without the redundant subtitle or a longer explanation; any terminology still shown retains its local definition

#### Scenario: Required folder choice in step one
- **WHEN** no project folder has been selected
- **THEN** the folder choice is visually distinguished, labeled as an action and paired with a local folder icon, with no redundant subtitle between the heading and form
