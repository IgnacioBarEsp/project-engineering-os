# Runtime

## Purpose

Definir el bootstrap universal, los límites de ownership y el diagnóstico read-only que mantienen el
entorno reproducible sin elegir ni sobrescribir decisiones del producto.
## Requirements
### Requirement: Bootstrap separates universal core from product

Bootstrap SHALL install only universal governance, SDD, harness, documentation, quality and debt-control
assets. It SHALL NOT select product frameworks, databases, cloud or conditional profiles.

#### Scenario: Empty repository is bootstrapped

- **WHEN** a supported exact package version runs bootstrap
- **THEN** the universal core and empty debt state are installed transactionally
- **AND** a second run produces no unexpected drift

### Requirement: Ownership prevents silent overwrite

Every managed target SHALL declare constructor, human-overlay, project or external OpenSpec ownership.
Human or project content SHALL be preserved unless an explicit migration validates the expected hash.

#### Scenario: A managed file was edited

- **WHEN** sync detects an unexpected human hash
- **THEN** it reports a conflict before any write
- **AND** provides recovery

### Requirement: Doctor is read-only and truthful

Doctor SHALL return human and JSON results using PASS, FAIL, WARN and SKIP with cause and recovery. It
SHALL NOT install, repair, authenticate, update or reindex.

#### Scenario: A configured tool cannot authenticate

- **WHEN** authenticated smoke is required and fails
- **THEN** doctor does not infer PASS from configuration or process startup
- **AND** reports the profile-appropriate failure status

### Requirement: GitHub plans report actual provenance and target governance

The read-only GitHub plan SHALL report the actual resolved source and whether it came from the target,
blueprint seed or inline manifest. It SHALL prefer applicable target governance, SHALL NOT attribute seed
content to a nonexistent target path, and SHALL NOT mix consumer discovery into an upstream plan.

#### Scenario: Upstream governance exists in the target

- **WHEN** `github-plan` runs on the upstream with `repository-governance.json`
- **THEN** source and provenance identify that target file
- **AND** the plan contains the upstream statuses and labels with zero consumer discovery issues

#### Scenario: Consumer target has not been bootstrapped

- **WHEN** no applicable target manifest exists and the blueprint contains the default Product OS seed
- **THEN** source identifies the tracked blueprint seed and provenance identifies `blueprint-seed`
- **AND** consumer discovery resources remain available without claiming a nonexistent target file

#### Scenario: A custom source has no target or seed

- **WHEN** the blueprint declares a custom GitHub plan source that exists neither in the target nor as a seed
- **THEN** the command fails with `GITHUB_PLAN_SOURCE_MISSING`
- **AND** provides a recovery that names how to declare or add the missing manifest

#### Scenario: Human-readable output is inspected

- **WHEN** the plan is printed without JSON mode
- **THEN** it displays the resolved source and provenance kind
- **AND** continues to state that remote status is unverified and mutations are absent

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

### Requirement: The OPSX check refuses a published capability without a redacted Purpose

The read-only OPSX check SHALL inspect every published capability under `openspec/specs/*/spec.md` and SHALL
report `FAIL` when a capability declares no `## Purpose` section, declares it empty, or keeps the text that
`openspec archive` seeds there. When the specs tree exists and cannot be read, it SHALL fail closed instead
of reporting zero capabilities. When the repository has published no capability yet, it SHALL report `SKIP`
and MUST NOT infer a passing verdict. It SHALL NOT inspect the deltas under `openspec/changes/**`, which
legitimately declare no Purpose. Every failure recovery SHALL name the offending spec file and what to write
in it. The upstream documentation gate and the OPSX check SHALL derive this verdict from a single published
module, so a consumer never receives a divergent copy.

#### Scenario: An archived capability keeps the seeded text

- **WHEN** a bootstrapped repository archives a change and runs the read-only OPSX check
- **THEN** the check fails and names that capability's spec file
- **AND** the recovery states that the seeded text under `## Purpose` must be replaced by the capability's own contract

#### Scenario: A published capability declares no Purpose

- **WHEN** a capability spec has no `## Purpose` section or leaves it empty
- **THEN** the check fails for that capability alone
- **AND** every other published capability keeps its own verdict

#### Scenario: The specs tree exists and cannot be read

- **WHEN** the specs root or an individual capability spec cannot be read
- **THEN** the check fails closed and names the unreadable path
- **AND** it does not report a passing verdict inferred from zero capabilities

#### Scenario: The repository has published no capability yet

- **WHEN** the repository has no specs root, or a specs root with no capability inside
- **THEN** the check reports `SKIP` and states that nothing has been published
- **AND** the read-only command reports no failure it cannot substantiate

#### Scenario: Change deltas stay outside the gate

- **WHEN** an active change declares delta specs under `openspec/changes/**` without a Purpose
- **THEN** the check ignores those deltas
- **AND** only published capabilities are inspected

### Requirement: Official workflow generation is independent of host preferences
The local wrapper SHALL isolate global OpenSpec configuration and global Codex prompt output during init and update, with core/both defaults. It SHALL preserve the user's global settings and remove only its own temporary directory. Other commands SHALL remain free of this generation-only mutation.

#### Scenario: Commands-only host
- **WHEN** the host config selects commands-only delivery
- **THEN** the official generator invoked by the wrapper SHALL still emit required repository skills and commands without writing host prompts

### Requirement: Readiness phases are observable and read-only
The CLI SHALL verify an open enriched issue, declared dependencies and project membership before propose, and complete artifacts, applicable evidence, rollback, adversarial review and configured debt before archive. It SHALL reject malformed configuration and metadata without executing metadata-supplied commands.

#### Scenario: Missing archive assessment
- **WHEN** debt is configured and a change has no captured assessment
- **THEN** readiness archive SHALL fail with the missing flow and recovery

#### Scenario: Approved conditional profile
- **WHEN** the active list matches profile flags and every activated conditional profile has an approved decision reference
- **THEN** readiness SHALL accept the profile configuration and require its applicable evidence

#### Scenario: Unapproved or incoherent activation
- **WHEN** a conditional profile has no decision or the active list disagrees with its flags
- **THEN** readiness SHALL fail and identify the profile or mismatched list

#### Scenario: Spanish prose and unresolved markers
- **WHEN** metadata contains ordinary lowercase Spanish todo
- **THEN** it SHALL remain valid prose while unresolved uppercase TODO SHALL fail with the field and canonical pattern label, without echoing secret content

### Requirement: OPSX checks preserve official ownership
The CLI SHALL check official generated workflow ownership, hashes and published spec Purpose against an explicit target without generating or modifying workflows. Missing ownership, drift, unreadable specs or unresolved Purpose SHALL fail with recovery. An empty capability tree SHALL remain SKIP for Purpose.

#### Scenario: Upstream invocation
- **WHEN** a contributor needs to check consumer OPSX artifacts
- **THEN** documentation SHALL require an explicit consumer target and the upstream SHALL NOT expose a default script that targets its own incompatible layout

### Requirement: Doctor distinguishes obligations from consumer shape
Every doctor result SHALL expose category and applicability. An explicitly declared upstream with the package identity SHALL skip consumer-shape checks and retain the original observation; it SHALL continue checking its published obligations. Consumers SHALL retain applicable layout checks.

#### Scenario: Upstream missing readiness manifest
- **WHEN** upstream lacks its Product OS manifest
- **THEN** github.project SHALL fail while consumer-only layout checks remain SKIP

#### Scenario: Consumer missing layout
- **WHEN** a consumer lacks managed state or a constructor workflow
- **THEN** its applicable checks SHALL fail

### Requirement: Structural verification has an opt-in evidence path
Doctor SHALL accept independent GitNexus and CodeGraph receipts only when codeIndexable is explicitly enabled and a receipt is opted in, successful, recent and bound to the configuration hash. It SHALL never install, start or index a tool.

#### Scenario: Valid and missing receipts
- **WHEN** one tool has valid evidence and the other has none
- **THEN** the first SHALL pass and the other SHALL fail without borrowing its evidence

#### Scenario: Disabled policy
- **WHEN** indexing is not enabled
- **THEN** the checks SHALL skip with a policy explanation that does not assert absence of source code

