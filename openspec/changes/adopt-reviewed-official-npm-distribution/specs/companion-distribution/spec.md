## ADDED Requirements

### Requirement: Distribution closure and actual artifact evidence
The new Companion candidate SHALL preserve and verify the exact official npm tree and its licenses
through packaging. Its manifest, catalog, notices, receipt and installer evidence SHALL agree with the
candidate source. Experimental seal/runtime tests SHALL NOT substitute for verifying the real installer,
installation/repair/restart behavior, resource comparison or canonical release assets.

#### Scenario: Packager prunes bundled files or identity differs
- **WHEN** installer contents omit or change any reviewed npm file or advertise another identity
- **THEN** artifact verification SHALL stop publication
- **AND** no unverified runtime SHALL be activated to compensate

#### Scenario: New candidate is prepared but not released
- **WHEN** 0.3.7 has not completed protected tagging and canonical asset comparison
- **THEN** documentation SHALL continue naming the actually published0.3.6 download
- **AND** tests SHALL not describe a source candidate as a downloaded verified release

### Requirement: Coordinated protected integration without duplicated corrections
The product integration SHALL include the exact already approved214source and this separately approved
adoption in one fully verified head. Each change SHALL retain its review/debt/archive scope. No issue
closure, archive, merge or waived check SHALL be inferred from a commit or partial test.

#### Scenario: A preexisting component check is green but whole CI is pending
- **WHEN** zod local checks pass while required remote CI or Companion remains pending/failed
- **THEN** integration and issue closure SHALL wait for current required CI green
- **AND** prior CI results SHALL retain their own SHA/date rather than approving the new head

#### Scenario: Joint source supersedes the zod-only draft
- **WHEN** the joint approved source completes official archives, independent final review and protected merge
- **THEN** the original draft MAY be closed as superseded with preserved history
- **AND** issue and board completion SHALL reflect real integrated closure, with the existing UI PR pile preserved
