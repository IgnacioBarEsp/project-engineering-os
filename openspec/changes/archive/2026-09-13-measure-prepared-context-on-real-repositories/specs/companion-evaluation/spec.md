## MODIFIED Requirements

### Requirement: Measurement that supports only what it measures
The comparison SHALL use the same corpus and the same question set before and after preparation, keep its raw
data, and report the cost of preparing. A large-repository comparison SHALL name at least two public
repositories from different domains, pin each one by commit, verify the declared eligibility thresholds,
freeze its source-backed questions behind a versioned digest before the first run, and give all compared
methods the same corpus scope, query and instructions. It SHALL report returned bytes and content bytes read as
separate named quantities, SHALL publish favourable, neutral and unfavourable outcomes by the same rule, and
SHALL NOT present byte counts as token counts, claim a reduction in hallucinations, or describe an agent-run
journey as a study with users.

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
