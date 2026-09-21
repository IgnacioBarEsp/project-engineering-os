## MODIFIED Requirements

### Requirement: Readiness phases are observable and read-only
The CLI SHALL verify an open enriched issue, declared dependencies and project membership before propose, and complete artifacts, applicable evidence, rollback, adversarial review and configured debt before archive. It SHALL reject malformed configuration and metadata without executing metadata-supplied commands. Marker detection SHALL reject observed instructions addressed to whoever fills a template, SHALL NOT reject prose whose verb is merely homographic with an instruction, and SHALL scope any identifier-specific exception to the `change` field.

#### Scenario: Missing archive assessment
- **WHEN** debt is configured and a change has no captured assessment
- **THEN** readiness archive SHALL fail with the missing flow and recovery

#### Scenario: Approved conditional profile
- **WHEN** the active list matches profile flags and every activated conditional profile has an approved decision reference
- **THEN** readiness SHALL accept the profile configuration and require its applicable evidence

#### Scenario: Unapproved or incoherent activation
- **WHEN** a conditional profile has no decision or the active list disagrees with its flags
- **THEN** readiness SHALL fail and identify the profile or mismatched list

#### Scenario: Spanish prose and unresolved markers
- **WHEN** metadata contains ordinary lowercase Spanish todo
- **THEN** it SHALL remain valid prose while unresolved uppercase TODO SHALL fail with the field and canonical pattern label, without echoing secret content

#### Scenario: Spanish indicative homographic with a template imperative
- **WHEN** metadata states a fact with a verb that is also an imperative, such as a rollback that preserves history or a check that completes verification
- **THEN** readiness SHALL accept the statement as prose
- **AND** an observed instruction that names the slot to fill SHALL still fail with the replacement-instruction label

#### Scenario: Seeded English instruction remains unresolved
- **WHEN** metadata retains any replacement or completion instruction from the seeded pre-propose or readiness examples
- **THEN** readiness SHALL reject every affected field, including the instruction to complete the cost and license review

#### Scenario: A change identifier names the defect it fixes
- **WHEN** the `change` field is a valid multi-segment kebab-case identifier containing a reserved marker word
- **THEN** readiness SHALL accept that identifier
- **AND** the same marker outside the `change` field, or standing alone as the change identifier, SHALL still fail with its canonical label

#### Scenario: Historical metadata is re-evaluated
- **WHEN** the revised detector is applied to archived schema 1.0.0 metadata that previously passed
- **THEN** no archived change SHALL newly fail marker detection
