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
The comparison SHALL use the same corpus and the same question set before and after preparation, keep its raw
data, and report the cost of preparing. A large-repository comparison SHALL name at least two public
repositories from different domains, pin each one by commit, verify the declared eligibility thresholds,
freeze its source-backed questions behind a versioned digest before the first run, and give all compared
methods the same corpus scope, query and instructions. It SHALL report returned bytes and content bytes read as
separate named quantities, SHALL publish favourable, neutral and unfavourable outcomes by the same rule, and
SHALL NOT present byte counts as token counts, claim a reduction in hallucinations, or describe an agent-run
journey as a study with users. A published measurement SHALL name the version it measured and the identity of
the installation it ran against, and SHALL be re-run under the same frozen protocol before a later version is
described by it. Each run SHALL be published beside the earlier ones rather than replacing them.

#### Scenario: A before/after comparison is published
- **WHEN** the measurement finishes
- **THEN** the method, the corpus, the question set, the raw results and the negative results are kept
- **AND** every reported number names what it does not support

#### Scenario: A metric cannot be observed
- **WHEN** a quantity such as model token usage is not exposed to the measurement
- **THEN** it is reported as not measured instead of being estimated from a proxy

#### Scenario: A real-repository protocol is frozen
- **WHEN** the first comparison over a real repository is requested
- **THEN** the repository, exact commit, subtree, license, eligibility evidence, questions, known sources and
  answers SHALL already exist in a versioned protocol with a declared digest
- **AND** a digest mismatch, wrong checkout or failed size threshold SHALL stop before any method runs

#### Scenario: Three retrieval methods receive symmetric inputs
- **WHEN** opening the corpus, a competent literal scan and prepared context answer a frozen question
- **THEN** all three SHALL receive the same corpus boundary and query without the expected source or answer
- **AND** the evidence SHALL distinguish surfacing the expected source, returning the known answer and
  providing each method's natural locator

#### Scenario: Prepared retrieval validates freshness
- **WHEN** the installed application rereads source content before searching its index
- **THEN** source-validation bytes and index bytes SHALL be reported separately and included in the named
  prepared-read total

#### Scenario: The product does not win
- **WHEN** prepared context ties or loses against either baseline on any reported measure
- **THEN** the raw result and the public summary SHALL retain that outcome without changing product behavior,
  questions, corpora or scoring first

#### Scenario: A published version is newer than the measurement
- **WHEN** a released version differs from the one a published measurement names
- **THEN** the page SHALL keep saying which version was measured, and SHALL NOT describe the newer version by
  that result
- **AND** a re-run under the unchanged protocol, questions and commits SHALL be published beside the earlier
  run, whatever it shows

### Requirement: A compared task is declared before it runs
A comparison between two ways of working SHALL fix one task and its acceptance criteria in a versioned record
with a declared digest before either run starts. Both runs SHALL keep their artifacts. The record SHALL report
only what was observed — files touched, tests that pass and fail, defects found by whom and when, traceable
steps, and whether the result can be reverted — SHALL NOT report token counts unless a provider reported them,
SHALL NOT let the agent that produced an answer judge its quality, and SHALL state in its own words that one
task does not demonstrate a general advantage.

#### Scenario: The task is chosen after seeing a result
- **WHEN** the task or its acceptance criteria change after either run has started
- **THEN** the comparison is void and SHALL be re-declared and re-run rather than published

#### Scenario: One task is read as a general claim
- **WHEN** the comparison is published or presented
- **THEN** the record SHALL carry the statement that a single task demonstrates what happened in that task and
  nothing beyond it

### Requirement: A corrected check is measured against what the previous one missed
When a check is corrected because it certified a defective state as clean, the corrected check SHALL be run
against the commit that was certified and against the corrected commit, and the contrast SHALL be recorded. The
record SHALL name what the earlier check reported, what the corrected one reports, and SHALL state plainly when
the corrected check does not detect the missed defect.

#### Scenario: The corrected check detects the missed defect
- **WHEN** the corrected check runs against the previously certified commit
- **THEN** the defects the earlier check reported as absent SHALL appear as findings, named individually

#### Scenario: The corrected check still misses it
- **WHEN** the corrected check reports no finding on the previously certified commit
- **THEN** the record SHALL say so and SHALL NOT present the correction as demonstrated

