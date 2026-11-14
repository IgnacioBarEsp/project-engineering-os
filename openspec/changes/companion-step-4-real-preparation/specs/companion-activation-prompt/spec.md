## ADDED Requirements

### Requirement: Deterministic activation instructions
The service SHALL compose an activation prompt purely from profile, focus, vision, agents, verified done/pending stages, route and aggregate counts. It SHALL NOT add an absolute project path or infer installation from chosen route. The delegated route SHALL include three short questions and explicit checks; software uses the pinned core and doctor while other profiles do not install without a proposal.

#### Scenario: Distinct inputs produce distinct instructions
- **WHEN** profiles or focuses differ with otherwise equal inputs
- **THEN** prompts differ in setup/method and remain deterministic with no network call

#### Scenario: Partial preparation
- **WHEN** only base and context are verified
- **THEN** only those stages are described as prepared and the other required work is described as pending with concrete verification

### Requirement: Human vision and source preservation
PROJECT_VISION.md SHALL preserve the person's words and human labels, with a checking section and no generated completeness percentages. Its creation SHALL appear in the base plan and recoverable journal; an existing file SHALL be preserved, and errors SHALL NOT be swallowed. Legacy base journals SHALL remain recoverable. Generated guidance SHALL link it and preserve original sources.

#### Scenario: Structured or free vision
- **WHEN** the user saves either editor mode
- **THEN** the preview matches the saved vision and neither internal profile identifiers nor invented project facts appear
