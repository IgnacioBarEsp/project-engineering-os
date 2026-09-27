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
