## MODIFIED Requirements

### Requirement: Preparation preserves ownership and supports recovery
The engine SHALL bind a plan to its folder and observed inputs, serialize writes, persist recoverable
operations including a canonical `PROJECT_VISION.md` document capturing the project's natural language
intent, and verify their hashes before reporting its own preparation complete, while preserving all
pre-existing original files without deletion.

#### Scenario: Original files and a second execution
- **WHEN** any of the five profiles is prepared twice with unchanged inputs
- **THEN** original bytes SHALL remain unchanged and the second application SHALL create no duplicate preparation

#### Scenario: Inputs or generated files change after review
- **WHEN** the plan is stale or an owned file was edited by a person
- **THEN** application or recovery SHALL stop with an actionable conflict rather than overwrite the edit

#### Scenario: Two applications or an interruption
- **WHEN** two processes apply at once or an operation stops between writes
- **THEN** only the lock owner SHALL mutate and the interrupted operation SHALL be resumable or reversible from verified evidence

#### Scenario: A persisted receipt names an arbitrary file
- **WHEN** recovery reads a malformed or forged target outside the fixed Companion namespace
- **THEN** it SHALL reject the state without changing that file

#### Scenario: Capturing natural language project vision
- **WHEN** a person describes their goal and vision during preparation
- **THEN** the engine SHALL generate `PROJECT_VISION.md` in the project root alongside `project.json` and `START.md`
- **AND** the file SHALL record the declared intent, audience and MVP scope in structured Markdown

#### Scenario: Preserving original files during source conversions
- **WHEN** an AI or automated tool processes source documents (PDFs, text files, notes) in the project
- **THEN** markdown versions SHALL be created alongside the sources without deleting or modifying the original binary files
