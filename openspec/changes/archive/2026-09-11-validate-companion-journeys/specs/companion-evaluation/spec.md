## ADDED Requirements

### Requirement: Reproducible five-profile journey matrix
The evaluation SHALL run the complete journey on an installed application for research, software, Unity,
creative and general projects, and SHALL record the happy path, negative cases, recovery and the behaviour
when an optional tool is unavailable. It SHALL state which steps a person performed and which a script did.

#### Scenario: A profile journey is recorded
- **WHEN** the matrix runs for one profile
- **THEN** the record names the artifact, the machine, each step and its observed result
- **AND** a failure is recorded as a failure, fixed, and the affected journey is run again

#### Scenario: An optional tool is not installed
- **WHEN** a journey reaches a stage whose optional tool is unavailable
- **THEN** the record shows the stage reported as unavailable and the remaining work still usable

### Requirement: Measurement that supports only what it measures
The comparison SHALL use the same corpus and the same question set before and after preparation, keep its
raw data, and report the cost of preparing. It SHALL NOT present byte counts as token counts, claim a
reduction in hallucinations, or describe an agent-run journey as a study with users.

#### Scenario: A before/after comparison is published
- **WHEN** the measurement finishes
- **THEN** the method, the corpus, the question set, the raw results and the negative results are kept
- **AND** every reported number names what it does not support

#### Scenario: A metric cannot be observed
- **WHEN** a quantity such as model token usage is not exposed to the measurement
- **THEN** it is reported as not measured instead of being estimated from a proxy
