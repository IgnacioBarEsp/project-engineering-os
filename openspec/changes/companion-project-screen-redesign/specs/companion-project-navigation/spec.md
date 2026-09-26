## ADDED Requirements

### Requirement: Honest deferred project list
The renderer SHALL preserve the list service and its row verdicts, sort rows by most recent check, show verdict qualifications at the same size, and render a skeleton only after 300 ms of unresolved loading, replacing it by results or an actionable error within 10 seconds.

#### Scenario: Fast and slow responses
- **WHEN** a controlled list response resolves before 300 ms or remains pending after that delay
- **THEN** only the slow response shows skeleton rows, no stale ready mark appears, and completion removes every skeleton

#### Scenario: Isolated unreadable row
- **WHEN** five project rows include one unavailable folder
- **THEN** the unavailable row retains its cause, the other rows retain their service verdicts and the existing bounded-read test passes

### Requirement: Single segmented project destination
The renderer SHALL show the person's name, folder, profile and focus, current verdict and one recheck action, then four keyboard-operable segments Estado, Archivos, Recetas and Tu IA with aria-pressed and a closed internal URL for the open project.

#### Scenario: Keyboard navigation and exclusive content
- **WHEN** the person activates a segment by keyboard or returns to its internal URL
- **THEN** exactly one segment is pressed, only that content is mounted, the breadcrumb matches and keyboard focus stays usable

#### Scenario: Foreign or invalid route
- **WHEN** a hash names an unknown tab or another project
- **THEN** it does not open another project or invoke a service mutation

#### Scenario: Native same-document identity
- **WHEN** the main-frame URL gains an internal fragment
- **THEN** IPC and the draft-close hook continue accepting that exact application document, while queries, another window/frame, origin, port, credentials or path remain rejected

### Requirement: Existing interface contracts remain non-vacuous
The renderer SHALL offer guidance first, deduplicate operations across its overview, retain reviewed exports, recipes, AI settings and folded recovery, and preserve all interface probes and negative mutations.

#### Scenario: Responsive and adversarial verification
- **WHEN** the screen is walked at 1180, 1024, 768 and 480 pixels and the negative controls are injected
- **THEN** there is no horizontal overflow, contrast remains AA, original mutations are detected and each offered operation appears once
