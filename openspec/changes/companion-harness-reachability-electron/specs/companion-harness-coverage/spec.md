## ADDED Requirements

### Requirement: Complete observable coverage
The harness SHALL exercise six canonical profiles and two preparation choices in both motion modes at 1180x820, 1024x700 and 480x540, retain existing journeys and fail when any declared route is unvisited.

#### Scenario: Missing route or movement cell
- **WHEN** a route or one required profile, choice, motion or viewport cell is omitted
- **THEN** coverage fails with the missing identity instead of reporting a successful smaller denominator

### Requirement: Non-vacuous interaction properties
Each relevant screen SHALL report measured controls, motion declarations, route context, scrolling and positioned ancestors; occluded controls, dead scrolling, unsafe containing blocks and decorative controls SHALL fail the applicable probe.

#### Scenario: Targeted mutation
- **WHEN** a profile receives another profile's focuses, navigation loses selection, the rail disagrees, a control is decorative, or motion exceeds its limit
- **THEN** the corresponding assertion detects the deliberate defect and an unrelated timeout does not count

### Requirement: Native Windows evidence
A required CI job SHALL run the source app in Electron Windows, visit Inicio and step one, exercise real copy IPC and read the actual clipboard in the main process, and emit captures with traceable provenance and no renderer errors.

#### Scenario: Missing native result
- **WHEN** the Windows job fails, is skipped or cannot launch the app
- **THEN** the required aggregate is not successful and no native PASS evidence is emitted

### Requirement: Historical falsification and independent review
The change SHALL record isolated execution at a3b1efd and the #142 hotfix and require an independent adversarial report before archive.

#### Scenario: Historical broken and fixed trees
- **WHEN** the same defect probes run against both immutable trees
- **THEN** documented old defects are detected, the corresponding fixed controls pass, and source identities are preserved

### Requirement: Approved final-head closure protocol
Subject to explicit maintainer approval of the coordinated-final-head amendment,
the seven Wave 3 phases SHALL be qualified on one identified final source while
preserving each phase's criteria, human receipt scope, review, debt and ordered
official archive. They SHALL integrate through a protected joint PR only after
all applicable gates and current required CI pass. Before that approval the new
protocol SHALL remain unapplied.

#### Scenario: Scoped approval or unresolved qualification
- **WHEN** an earlier view has a scoped human receipt but an intermediate layout differs, or the current candidate has a failed, timed-out or missing check
- **THEN** the receipt is reused only for its verified unchanged surface, unresolved checks remain open, and no phase is archived or declared integrated

#### Scenario: Outstanding real maintainer journeys
- **WHEN** the coordination amendment is approved but the real #146 or Software A/B #147 journey has not been observed on a qualified candidate
- **THEN** approval of the protocol, an agent, a capture or a VM does not satisfy that human gate

#### Scenario: Protected final integration
- **WHEN** every phase gate is complete and the phases have been archived officially in their original order
- **THEN** the joint PR still requires current green required CI and normal branch protection, and actual integrated trees and original PR states are verified before closure claims

### Requirement: Approved installed-evidence harness correction
Subject to explicit approval of the installed-evidence harness amendment, only its
five named verifier/fixture/QA files SHALL change. New native fixture writes SHALL
use the six canonical profiles while retaining separate legacy-read controls.
Every declared service mutation SHALL have exactly one current target and attribute
detection to behavior tests, with immutable originals restored after every case.
Before approval this corrective expansion SHALL remain unapplied.

#### Scenario: Retired write identity or missing mutation target
- **WHEN** a new fixture supplies a retired profile alias, or a mutation target is absent or duplicated
- **THEN** qualification fails with its actual cause, setup errors do not count as detections, and the product's validation is not relaxed

#### Scenario: Corrected installed qualification
- **WHEN** the approved bounded correction is frozen and the canonical VM cycle runs with separately identified product and verifier sources
- **THEN** only completed observations count, originals and raw failures are retained, and human acceptance or protected integration is not inferred
