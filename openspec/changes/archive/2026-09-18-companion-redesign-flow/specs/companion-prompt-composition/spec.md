## MODIFIED Requirements

### Requirement: The prompt is composed from what the application already knows
The companion SHALL compose the text it hands to an AI from the project's profile, delimitation subtype,
natural language vision, the chosen installation modality (quick bundled vs delegated to AI), the stages that
are not ready and an aggregate of the folder's file types, instructing the external AI to engage in an
accessible 3-question interview, convert source documents to Markdown preserving originals for token
efficiency, and verify the workspace end to end before declaring readiness.

#### Scenario: Two projects of different profiles are compared
- **WHEN** the composed text of two profiles is compared
- **THEN** they SHALL differ in what they instruct, compared as text rather than as length
- **AND** the same inputs SHALL always produce the same text, so the difference is attributable to the inputs

#### Scenario: The folder's contents inform the prompt
- **WHEN** the inventory is used
- **THEN** only an aggregate of extension, kind and count SHALL be derived from it, and no file path SHALL
  enter that aggregate

#### Scenario: A stage of the project is not ready
- **WHEN** the composition runs for a project with pending stages
- **THEN** the text SHALL say which are pending and SHALL NOT instruct the AI to assume they are done

#### Scenario: Master prompt for delegated AI installation
- **WHEN** the user selects the delegated AI installation option
- **THEN** the composed master prompt SHALL instruct the AI to read `PROJECT_VISION.md`, conduct a non-technical 3-question interview, research modern industry tooling, configure them via repository engineering commands, and execute an end-to-end verification suite

#### Scenario: Master prompt for quick bundled installation
- **WHEN** the user selects the quick bundled installation option
- **THEN** the composed master prompt SHALL acknowledge pre-installed base dependencies and instruct the AI on continuing application implementation directly
