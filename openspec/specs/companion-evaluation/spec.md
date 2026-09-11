# companion-evaluation Specification

## Purpose
Define what counts as evidence that the Companion application works and that its public claims are true.
An evaluation covered here SHALL be reproducible from a command, SHALL state what drove it and what it
therefore does not demonstrate, and SHALL publish its method before its numbers. Its object is the
application a person installs, not the development tree.

**Use this if:** you are adding a claim about the product, or checking whether one already published is
supported by something a reader can re-run.
## Requirements
### Requirement: Reproducible five-profile journey matrix
The evaluation SHALL run the complete journey on an installed application for research, software, Unity,
creative and general projects, and SHALL record the happy path, negative cases, recovery and the behaviour
when an optional tool is unavailable. It SHALL state which steps a person performed and which a script did.

#### Scenario: A profile journey is recorded
- **WHEN** the matrix runs for one profile
- **THEN** the record names the artifact, the machine, each step and its observed result
- **AND** a failure is recorded as a failure, fixed, and the affected journey is run again

#### Scenario: A profile reaches a stage it cannot use
- **WHEN** a journey for a profile without engineering reaches the reviewed-tool stage or the code map,
  with a working engine available so the refusal can only come from the profile rule
- **THEN** each stage is refused with its own error and the record names that error rather than any rejection
- **AND** the work that does not depend on those tools, including document search, still succeeds

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

