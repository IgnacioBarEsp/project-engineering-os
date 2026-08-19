## ADDED Requirements

### Requirement: Capability support describes rendering and never claims runtime consumption
The capability matrix SHALL separate what the constructor renders from what has been proven about
consumption. `support` SHALL describe only that the constructor writes a location the harness's own official
documentation lists for that capability, in the documented format, proven by an offline fixture. Startup,
tool listing and authenticated smoke SHALL be recorded as independent signals that accept only
`not-verified` or a redacted opt-in receipt, and a configuration reference MUST NOT satisfy any of them.

#### Scenario: A cell records its runtime signals
- **WHEN** the matrix is rendered from the published seed
- **THEN** every capability declares startup, tool listing and smoke separately from its configuration
- **AND** none of the three is verified, because the constructor installs no third-party agent and authenticates nothing

#### Scenario: A configuration reference is used as a smoke signal
- **WHEN** a capability declares its fixture identifier as the value of startup, tool listing or smoke
- **THEN** the rendering fails and names the capability and the signal
- **AND** the matrix is not produced with a configuration counted as runtime proof

### Requirement: A rendered cell cites a dated official source, a fixture and a visible fallback
A `native` or `generated` capability SHALL declare a minimum version, an official https source with an ISO
consultation date, a configuration reference to an existing fixture, at least one consuming surface, a
visible fallback and a written degradation. A `documented` or `unsupported` capability SHALL keep a visible
fallback and MUST NOT claim a fixture as its configuration proof. A missing element SHALL fail the rendering
instead of degrading silently.

#### Scenario: A cell claims support without a dated source
- **WHEN** a capability declares native or generated support with no source or no consultation date
- **THEN** the rendering fails and lists the missing elements
- **AND** the matrix is not produced with an undated claim

#### Scenario: A cell claims support without a fixture
- **WHEN** a capability declares native or generated support while its configuration is not applicable
- **THEN** the rendering fails
- **AND** the capability must be degraded explicitly instead of asserted

#### Scenario: A degraded cell loses its fallback
- **WHEN** a documented or unsupported capability declares no fallback
- **THEN** the rendering fails and names the capability
- **AND** an unsupported surface never loses its visible fallback

### Requirement: A native cell may not hide a surface that cannot consume its target
Each capability SHALL declare which official surfaces of its harness consume the target and which do not. A
`native` capability MUST NOT exclude any official surface of its own harness. When surfaces diverge, the
capability SHALL be `generated`, SHALL name the excluded surfaces, and the generated matrix SHALL publish
that divergence.

#### Scenario: A harness surface has no versioned repository file
- **WHEN** one surface of a harness reads the repository target and another is configured only outside the repository
- **THEN** the capability is generated, names the excluded surfaces and keeps its fallback
- **AND** a single generic row cannot present the harness as uniformly supported

#### Scenario: A native cell excludes an official surface
- **WHEN** a capability declares native support while listing unsupported surfaces
- **THEN** the rendering fails and lists the excluded surfaces
- **AND** the capability must drop to generated to keep the divergence visible

### Requirement: A retired capability target resolves to its replacement without rewriting consumer state
The capability matrix is seed-once and owned by the consumer. When a consumer copy names a retired target
and the declared replacement is installed, the constructor SHALL deliver the capability through that
replacement, SHALL continue rendering, and SHALL publish the stale target and its replacement as a declared
degradation. It MUST NOT rewrite the consumer file. When no replacement is installed, the rendering SHALL
fail and SHALL name the expected replacement as recovery.

#### Scenario: An already bootstrapped repository receives the new runtime
- **WHEN** the consumer copy still names a retired adapter path and the replacement is installed
- **THEN** synchronization continues and reports the retired path with its replacement
- **AND** the seed-once file keeps the value the consumer owns

#### Scenario: A retired adapter is removed from an existing repository
- **WHEN** synchronization retires a managed adapter that the consumer has not edited
- **THEN** the read-only check reports an explicit deletion before any write
- **AND** the same file edited by a person reports a conflict and is preserved instead of deleted

#### Scenario: A declared target is installed by nothing
- **WHEN** a capability names a target that neither the manifest nor a declared replacement installs
- **THEN** the rendering fails
- **AND** the failure names the expected replacement when the target is a known retired path

### Requirement: A candidate harness stays unsupported until it meets the same contract
A harness outside the supported set SHALL be evaluated in an isolated candidate fixture and SHALL remain
unsupported until it declares, for each capability, a renderer target, a dated official source, a minimum
version, an existing fixture, a visible fallback and a written degradation. Resemblance to an already
supported surface MUST NOT promote a capability, and a candidate MUST NOT appear in the supported matrix.

#### Scenario: A candidate reads an instruction file the constructor already writes
- **WHEN** a candidate harness consumes a surface that a supported harness also consumes
- **THEN** the candidate stays unsupported and the shared surface does not promote any of its capabilities
- **AND** the candidate does not appear among the supported harnesses

#### Scenario: A candidate meets every promotion requirement
- **WHEN** a candidate declares renderer, dated source, minimum version, fixture, fallback and degradation for every capability
- **THEN** the promotion contract reports it as promotable with no blockers
- **AND** the contract is reachable rather than impossible by construction
