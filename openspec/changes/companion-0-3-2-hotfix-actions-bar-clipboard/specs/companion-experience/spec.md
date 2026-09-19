## ADDED Requirements

### Requirement: Wizard actions remain reachable with normal motion
The Companion SHALL keep the current wizard content and actions reachable with normal and reduced
motion at 1180×820, 1160×810 and 1040×700. The final wizard action bar SHALL remain in document flow
after the animated content and outside any transformed ancestor, and SHALL require no compensatory bottom
space. In those windows it SHALL use sticky positioning. In windows at most 500 px tall or 380 px wide it
MAY stay static after the content, so that it does not cover a large share of a small viewport.
Action rows inside installation cards SHALL remain local to their cards.

#### Scenario: A short wizard screen fits the viewport
- **WHEN** a wizard screen including its final action bar fits the available viewport
- **THEN** the bar top SHALL be at or below the bottom of the preceding content
- **AND** no field, suggestion or action SHALL be covered by the bar

#### Scenario: A long screen requires scrolling
- **WHEN** a person scrolls through setup, folder, delimitation, vision, installation or completion
- **THEN** every expected field and action SHALL be reachable, including the last content before the bar
- **AND** at the bottom there SHALL be no empty reserve introduced to compensate for an out-of-flow bar
- **AND** ordinary spacing and visible status messages SHALL remain distinguishable from dead scroll space

#### Scenario: The window is small or zoomed
- **WHEN** the wizard is shown in a window at most 500 px tall or 380 px wide, such as the default window at 200 % zoom
- **THEN** every expected field and action SHALL remain reachable by scrolling and resolve to itself at its visible center
- **AND** the page SHALL not need horizontal scrolling

#### Scenario: Each primary control is hit tested
- **WHEN** the current wizard is traversed in each required viewport with each motion preference
- **THEN** the test SHALL observe each expected control after scrolling it into view and settling the entry animation
- **AND** elementFromPoint at its visible center SHALL resolve to that button or a descendant belonging to it
- **AND** both installation choices and both final copy buttons SHALL be clicked without forced clicks

#### Scenario: The initial action bar is separated from its form
- **WHEN** the person submits setup by click or Enter
- **THEN** native required-field validation and the same form handler SHALL still apply
- **AND** valid answers SHALL be retained while invalid answers SHALL not advance the wizard

#### Scenario: A field is reached with assistive technology
- **WHEN** focus reaches a field of the current wizard, including the vision editor
- **THEN** the field SHALL expose an accessible name that does not depend on its placeholder

### Requirement: The quick-install prompt claims only what was done
The master prompt of the quick installation SHALL NOT state that dependencies or tools were installed or
provisioned, because neither installation choice installs any in this version.

#### Scenario: The quick-install prompt is copied
- **WHEN** a person finishes the wizard with the quick installation and copies the master prompt
- **THEN** the copied text SHALL say that the folder was prepared and PROJECT_VISION.md was written
- **AND** it SHALL NOT say that dependencies were provisioned or installed

### Requirement: A multi-line vision does not stop the wizard
The wizard SHALL send the vision with its line breaks and SHALL derive the objective sent with the preparation
as a single line of at most 500 characters, so that a suggestion or a typed line break never makes the
installation fail.

#### Scenario: A suggestion or a line break is added to the vision
- **WHEN** a person adds a suggestion or types a line break in the vision and then chooses either installation
- **THEN** the preparation SHALL be accepted and the completion screen SHALL be reached
- **AND** PROJECT_VISION.md SHALL keep every line of the vision the person wrote
- **AND** the objective recorded by the preparation SHALL contain no line break and at most 500 characters

### Requirement: Wizard navigation reflects all current screens
The preparation navigation item SHALL declare aria-pressed true on setup, folder, delimitation, vision,
install and finished and retain its existing selection on stack-choice and ready when those routes are used.

#### Scenario: Installation or completion is shown
- **WHEN** the person reaches either installation or completion
- **THEN** Preparar proyecto SHALL remain visibly active and expose aria-pressed true

#### Scenario: A person leaves preparation
- **WHEN** the person opens Inicio, Tus proyectos or Ayuda
- **THEN** Preparar proyecto SHALL expose aria-pressed false and the destination SHALL become active

### Requirement: The hotfix regression measurement rejects missing observations
The UI and interface-contract harnesses SHALL measure the current wizard with animation enabled and
record expected and observed screens and controls. A missing visit or empty measurement SHALL fail.

#### Scenario: The fixed action bar defect is reintroduced
- **WHEN** a mutation of a disposable renderer copy restores fixed wizard actions under animated .enter
- **THEN** the interface-contract verification SHALL detect interception or invalid bar geometry on a visited screen
- **AND** a timeout, harness exception or unvisited screen SHALL not count as successful mutation detection

#### Scenario: Reduced motion hides the regression
- **WHEN** reduced motion passes but the normal-motion traversal has an unreachable expected action
- **THEN** the combined hotfix verification SHALL fail and identify the affected viewport, screen and control
