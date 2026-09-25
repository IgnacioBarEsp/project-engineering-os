## ADDED Requirements

### Requirement: Renderer modules remain small and local
The Companion renderer SHALL load native ES modules without a build step or framework dependency. Every source file under `ui/` SHALL have fewer than 400 lines, and the renderer SHALL create dynamic content with DOM nodes and text rather than `innerHTML`.

#### Scenario: The renderer starts from the packaged protocol
- **WHEN** `peos://app/index.html` loads with the production CSP
- **THEN** Inicio SHALL render with no missing module, blocked inline style or network request
- **AND** every reachable action and glossary term SHALL retain its declared name and control.

### Requirement: Routes own navigation state
The renderer SHALL declare each reachable page in one route table that supplies its breadcrumb, topbar destination and wizard step. The active topbar control, breadcrumb and step rail SHALL be computed from that entry and SHALL not disagree on a screen.

#### Scenario: A user traverses current and transitional screens
- **WHEN** a user opens Inicio, Ayuda, Tus proyectos, any current wizard screen or a reachable review screen
- **THEN** exactly one topbar destination SHALL be active
- **AND** its breadcrumb and, when applicable, its step rail SHALL describe that same route.

#### Scenario: A declared route is not rendered by a journey
- **WHEN** the interface harness completes its route traversal
- **THEN** it SHALL fail with the missing route names rather than report success with an empty or partial denominator.

### Requirement: Application layout keeps actions reachable
The renderer SHALL use a fixed-height application grid with a 56 px header and one scroll container. A wizard action footer SHALL be a sibling of the content in document flow, sticky at the bottom where space permits. No fixed or sticky control SHALL have a transformed, filtered or perspective ancestor.

#### Scenario: A wizard screen is viewed with motion enabled
- **WHEN** any current wizard screen is shown at 1180×820, 1024×700, 768×700 or 480×540
- **THEN** its last content and actions SHALL be reachable without horizontal scrolling or dead scroll space
- **AND** element hit testing SHALL resolve each visible control to itself or its descendant.

### Requirement: Design resources are local and declared
The renderer SHALL use layered CSS with all hexadecimal colors in `tokens.css`, local SVG icons in a declared sprite and no emoji icons. The `peos://` asset allowlist SHALL equal the renderer file inventory and SHALL reject undeclared paths. Styles and fonts SHALL obey the production CSP.

#### Scenario: An asset is added or removed
- **WHEN** the asset inventory test compares `ui/` with the protocol allowlist
- **THEN** any missing, extra or wrongly typed asset SHALL fail with its path.

#### Scenario: A screen is inspected
- **WHEN** Inicio, Ayuda or a reachable transitional screen is measured at 1180, 1024, 768 and 480 px widths
- **THEN** text and interactive controls SHALL reach at least WCAG AA 4.5:1 contrast
- **AND** the viewport SHALL have no horizontal overflow.
