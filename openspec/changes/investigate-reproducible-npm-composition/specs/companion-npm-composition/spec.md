## ADDED Requirements

### Requirement: Approval-bounded feasibility phase
The investigation SHALL execute only after explicit approval of this proposal, design and specification. A strategy selection SHALL NOT count as approval of unseen requirements. The phase SHALL remain limited to experimental composition and evidence; it SHALL NOT adopt or publish a derived npm distribution, close issue204, infer green required CI or start wave4.

#### Scenario: Maintainer selects an alternative
- **WHEN** the maintainer authorizes preparing a reproducible npm proposal
- **THEN** the contributor SHALL prepare and validate the agreement without executing candidate construction
- **AND** Apply SHALL remain blocked until approval of that actual agreement is recorded

#### Scenario: Experiment finishes successfully
- **WHEN** all feasibility assertions pass
- **THEN** the report SHALL label the result experimental and viable with its exact scope
- **AND** adoption SHALL require a subsequent approved agreement and all existing release protections

### Requirement: Immutable recipe with explicit derivation
Each composition SHALL declare a fixed official npm11.21.0 source identity, each dependency version/source/integrity, the original manifest, allowed metadata differences, assembler identity and recipe digest. The candidate SHALL reconstruct its physical dependency graph from pinned inputs without preserving an unreviewed bundled tree, changing upstream code or hand-editing vendored packages. The experiment SHALL evaluate at most three distinct frozen recipes.

#### Scenario: Recipe is constructed
- **WHEN** a compatible officially corrected component set is identified
- **THEN** its complete inputs and manifest differences SHALL be frozen before constructing candidate bytes
- **AND** the candidate SHALL retain input provenance, license texts and a distinct experimental derivation identity

#### Scenario: Source or scope cannot satisfy the recipe
- **WHEN** a digest differs, no verifiable correction exists, upstream code requires a local patch, a new manager is needed or more than three distinct recipes are required
- **THEN** the candidate SHALL stop with preserved evidence and a not-viable or inconclusive result
- **AND** a changed scope SHALL require a new explicit decision rather than automatic patching or relaxed checks

### Requirement: Complete physical audit and demonstrated correction
A candidate SHALL inventory every included package and executable source file, match its physical nested/bundled graph against the audited graph and reject uncovered bytes. It SHALL retain full production audit results at the existing high threshold, exact auditor identity and advisory observations. The candidate SHALL NOT be the sole authority auditing itself. Feasibility acceptance SHALL require no high/critical finding and verifiable correction/regression evidence for every known affected issue.

#### Scenario: A dependency exists outside the declared audit graph
- **WHEN** an included nested or bundled package is missing or inconsistent in the graph assessed by audit
- **THEN** the candidate SHALL fail closed
- **AND** a green audit exit code SHALL NOT override that failure

#### Scenario: Advisory range no longer includes a candidate version
- **WHEN** a version update removes an audit finding without evidence that the affected behavior is corrected
- **THEN** the report SHALL mark the security conclusion inconclusive and the candidate not apt for adoption
- **AND** a regression for the affected behavior or equally explicit correction evidence SHALL be required

### Requirement: Reproducible builds from equal inputs
Two builds of one frozen recipe SHALL use separate owned roots and caches and produce byte-identical source/dependency trees, inventory and canonical tree digest. Inputs, outputs, logs and failed attempts SHALL be preserved separately; a normalization SHALL NOT remove executable files or hide dependency differences.

#### Scenario: Same recipe is built independently
- **WHEN** two builds finish with identical frozen inputs
- **THEN** their complete physical file hashes and canonical tree digests SHALL match
- **AND** any mismatch SHALL fail reproducibility rather than being edited away

### Requirement: Preserved runtime and installation contract
The harness SHALL use fixed Node binaries and an absolute npm entry without a shell, isolated config/cache/environment, disabled lifecycle scripts/bin-links/workspaces, pinned official registry, existing release-age policy/exclusions and bounded execution. It SHALL validate version and fixed-lock installation under Node22.22.0,24.18.0 and managed24.20.0 without silently changing supported runtime or fixture locks. It SHALL keep payload verification before any adoption of experimental outputs.

#### Scenario: Dependency attempts to execute an install hook
- **WHEN** a fixture package contains a lifecycle script
- **THEN** candidate installation SHALL not execute that script or create executable bin-links
- **AND** argument/environment assertions and an execution sentinel SHALL prove the controls were exercised

#### Scenario: Failure or interrupted repair occurs
- **WHEN** network, timeout, cancellation, corrupt cache, wrong digest or repair interruption prevents verified completion
- **THEN** the experiment SHALL retain a non-success result and not publish an unchecked payload
- **AND** owned baselines, outside-root sentinels and unrelated user/host paths SHALL remain unchanged

#### Scenario: Candidate rejects supported Node or a fixture fails separately
- **WHEN** the candidate fails on a supported Node baseline or a fixed fixture cannot install
- **THEN** the evidence SHALL identify the exact failing runtime/input and candidate suitability SHALL remain unproven
- **AND** the experiment SHALL not upgrade Node, weaken release-age policy or change fixture locks to manufacture acceptance

### Requirement: Explicit boundaries, ownership and disposition
The phase SHALL preserve tracked production runtime sources, catalogs, official locks, release notices, audit policy, OpenSpec pin and protections. Mutable work SHALL remain inside validated disposable roots, with unchanged outside-root sentinels. The report SHALL include provenance/license review, resource measurements, owner, residual risk and viable/not-viable disposition. Issue208 SHALL remain a separate root/blueprint obligation.

#### Scenario: Experimental report is prepared
- **WHEN** the investigation emits its disposition
- **THEN** the report SHALL distinguish fresh execution from historical evidence, record all failures and unchanged-boundary hashes, and retain issue204 open
- **AND** any proposed adoption SHALL require its own approved spec, installation/repair evidence, review, debt assessment, official archive and green protected CI

#### Scenario: npm candidate passes while braces remains blocked
- **WHEN** npm feasibility checks pass but root or blueprint audit still fails under issue208
- **THEN** the report SHALL state that required CI and wave3 remain blocked
- **AND** the experiment SHALL not alter OpenSpec, hide dev dependencies, add audit exceptions or modify protections
