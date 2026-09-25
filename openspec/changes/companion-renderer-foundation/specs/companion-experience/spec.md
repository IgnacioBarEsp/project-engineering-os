## MODIFIED Requirements

### Requirement: Obsidian Precision Studio theme and responsive topbar navigation
The Companion application SHALL display a dark obsidian theme (#0B0F19 background, #121826 and #1C2436 surfaces, #6366F1 and #818CF8 indigo accents, #06B6D4 cyan and #10B981 emerald for verified states), an integrated topbar with four destinations, a local SVG brand icon and a dark native Windows icon. The header SHALL show an environment indicator only when a verified runtime state supports its exact claim. Inicio SHALL explain the app in one sentence and offer one primary action.

#### Scenario: User launches the application
- **WHEN** Companion starts
- **THEN** the initial window background SHALL be #0B0F19 without a white flash
- **AND** the topbar SHALL render the brand icon and four navigation controls with complete words
- **AND** a static claim that the environment is ready SHALL NOT appear before verification.

#### Scenario: User navigates on various viewports
- **WHEN** the window width is 1180, 1024, 768, 480 or the supported 240 px minimum for content reflow
- **THEN** controls, cards and text SHALL remain accessible without horizontal overflow or clipped actions
- **AND** interactive text SHALL meet at least WCAG AA 4.5:1 contrast.

### Requirement: Wizard navigation reflects all current screens
The preparation navigation item SHALL derive its selected state from the same route entry as breadcrumb and step rail for setup, folder, delimitation, vision, install, finished and the reachable legacy review screens until those screens are replaced by the single flow.

#### Scenario: Installation, completion or review is shown
- **WHEN** the user reaches an installation, completion or reachable review screen
- **THEN** Preparar proyecto SHALL expose `aria-pressed="true"`
- **AND** the breadcrumb and current step SHALL be derived from the route entry.

#### Scenario: A person leaves preparation
- **WHEN** the person opens Inicio, Tus proyectos or Ayuda
- **THEN** Preparar proyecto SHALL expose `aria-pressed="false"` and the destination SHALL become active.
