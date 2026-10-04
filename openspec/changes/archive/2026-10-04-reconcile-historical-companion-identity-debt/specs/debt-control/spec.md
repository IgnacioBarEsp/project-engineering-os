## MODIFIED Requirements

### Requirement: Upstream closes work through captured debt evidence

The upstream SHALL maintain configured policy, registry and captured assessments independently of consumer seeds. Historical imports SHALL preserve source evidence and document ownership normalization. Its validation SHALL fail if debt configuration disappears, and readiness archive SHALL require a captured assessment for each change. Historical reconciliation SHALL identify the intended existing registry ID explicitly, preserve prior immutable assessments and unrelated items, and distinguish historical evidence from current verification. A partial reconciliation SHALL NOT imply completion of its remaining remediation backlog.

#### Scenario: Previously resolved historical debt

- **WHEN** an imported finding has already been corrected by integrated changes
- **THEN** a remediation assessment SHALL resolve it with current evidence instead of deleting historical assessments

#### Scenario: Missing upstream configuration

- **WHEN** upstream debt configuration is absent
- **THEN** the upstream validation SHALL fail rather than accepting an unconfigured SKIP as health

#### Scenario: Changed candidate title leaves an original ID open

- **WHEN** a historical remediation resolved an equivalent finding under a different fingerprint and the intended original item remains open
- **THEN** the new approved remediation SHALL resolve the original by its exact ID using the existing capture operation
- **AND** it SHALL leave the equivalent resolved item, matching algorithm and historical assessments unchanged

#### Scenario: One-item reconciliation in a larger backlog

- **WHEN** the approved reconciliation targets one of 37 open items in a 50-item registry
- **THEN** verification SHALL require all 50 IDs to remain, precisely the intended item to change to resolved, and the other 49 objects to remain identical
- **AND** all other fields of the intended item, other than status, resolution and updatedAt, SHALL remain identical
- **AND** the remaining 36 items SHALL remain open and the umbrella issue SHALL NOT be closed by this phase

#### Scenario: Capture is repeated or interrupted

- **WHEN** the same approved input is captured again after a completed capture
- **THEN** the assessment and registry SHALL remain byte-identical and the operation SHALL report no-op
- **WHEN** the assessment was recorded but the registry update was interrupted
- **THEN** recapturing the same input SHALL converge without deletion or rewriting of evidence

#### Scenario: A valid ID is outside the approved scope

- **WHEN** the phase input resolves another existing ID or includes any additional resolution
- **THEN** the phase-specific preflight SHALL reject that input before capture
- **AND** a post-capture verifier SHALL reject a mutated result affecting any unrelated item
- **AND** this SHALL NOT be represented as a new rejection rule of the generic debt CLI

#### Scenario: Identity or historical evidence is invalid

- **WHEN** the capture input refers to an absent ID or changes input for a previously captured flow
- **THEN** the capture SHALL fail without overwriting prior evidence or registry bytes
- **WHEN** a phase result changes an old assessment, configuration, budget, occurrence or item classification
- **THEN** the phase verification SHALL fail rather than accept a partial match as success

#### Scenario: Installed evidence is historical

- **WHEN** current static inspection confirms retained guard mechanisms but the installed journey evidence comes from an older recorded commit
- **THEN** the reconciliation SHALL identify both provenances and the guard's declared exclusions
- **AND** it SHALL NOT claim a fresh installer run, complete package-byte coverage, human acceptance or binary identity with the current installation

#### Scenario: Candidate recovery before integration

- **WHEN** the phase capture fails its invariants before integration
- **THEN** recovery SHALL preserve the rejected candidate and its assessments separately while selecting a verified baseline copy for resumed work
- **AND** the rehearsal SHALL demonstrate baseline hashes and read-only debt health without deleting historical evidence
- **AND** it SHALL NOT claim a supported post-merge reopen command or restore only the registry while leaving contradictory resolution evidence active

#### Scenario: Protected integration is externally blocked

- **WHEN** local reconciliation checks pass but required CI fails on an unresolved upstream dependency audit
- **THEN** the phase SHALL retain its evidence and explicit integration blocker
- **AND** it SHALL NOT weaken protections, merge red, mark the umbrella completed or declare its owning handoff finished
