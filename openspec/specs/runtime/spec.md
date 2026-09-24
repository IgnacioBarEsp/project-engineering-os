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
The CLI SHALL verify an open enriched issue, declared dependencies and project membership before propose, and complete artifacts, applicable evidence, rollback, adversarial review and configured debt before archive. It SHALL reject malformed configuration and metadata without executing metadata-supplied commands. Marker detection SHALL reject observed instructions addressed to whoever fills a template, SHALL NOT reject prose whose verb is merely homographic with an instruction, and SHALL scope any identifier-specific exception to the `change` field.

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

#### Scenario: Spanish indicative homographic with a template imperative
- **WHEN** metadata states a fact with a verb that is also an imperative, such as a rollback that preserves history or a check that completes verification
- **THEN** readiness SHALL accept the statement as prose
- **AND** an observed instruction that names the slot to fill SHALL still fail with the replacement-instruction label

#### Scenario: Seeded English instruction remains unresolved
- **WHEN** metadata retains any replacement or completion instruction from the seeded pre-propose or readiness examples
- **THEN** readiness SHALL reject every affected field, including the instruction to complete the cost and license review

#### Scenario: A change identifier names the defect it fixes
- **WHEN** the `change` field is a valid multi-segment kebab-case identifier containing a reserved marker word
- **THEN** readiness SHALL accept that identifier
- **AND** the same marker outside the `change` field, or standing alone as the change identifier, SHALL still fail with its canonical label

#### Scenario: Historical metadata is re-evaluated
- **WHEN** the revised detector is applied to archived schema 1.0.0 metadata that previously passed
- **THEN** no archived change SHALL newly fail marker detection

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

### Requirement: Preserve canonical path selection
The constructor SHALL render each canonical path rule separately for Claude Code, Cursor and GitHub
Copilot with the documented selector and matching body. Aggregate surfaces for these harnesses SHALL
index scoped rules without repeating their bodies unconditionally. Unsupported harnesses SHALL retain
an explicit textual fallback without claiming enforced selection.

#### Scenario: A documentation-only rule is installed
- **WHEN** a rule declares documentation globs
- **THEN** each supported surface contains those globs and only that rule's instructions
- **AND** its conditional selector is not overridden by unconditional application

#### Scenario: A rule is removed or changed
- **WHEN** sync compares canonical rules with prior managed state
- **THEN** it retires unchanged owned files, reports conflicts for user modifications and remains idempotent
- **AND** transaction rollback restores the preceding owned outputs

#### Scenario: A rule contains an unsafe identifier or unrepresentable selector
- **WHEN** the constructor plans rendering
- **THEN** it rejects the input before writing any file instead of broadening the scope

### Requirement: The core and generated consumer support only declared maintained Node LTS lines
The upstream core and generated consumer SHALL declare the identical Node engine range `^22.22.0 || ^24.18.0`. The project SHALL test the exact Node 22 minimum and Node 24 recommended line on Ubuntu, Windows and macOS. Runtime checks and active compatibility guidance SHALL identify Node 24 as recommended, explain that Node 20 reached EOL on 2026-04-30, and state the next dated support-policy review. Node 26 SHALL NOT be included until it is LTS and a subsequent policy review approves it.

#### Scenario: Supported minimum and recommended runtimes are reported consistently
- **WHEN** the root package, generated package, doctor, CLI and compatibility guidance are inspected
- **THEN** they agree on `^22.22.0 || ^24.18.0`
- **AND** the exact Node 22.22.0 minimum and Node 24 recommended line are represented in core CI on all three operating systems

#### Scenario: EOL or unsupported Node versions are rejected
- **WHEN** the CLI or doctor evaluates Node 20, Node 21, Node 23, Node 24 below 24.18.0, Node 25 or Node 26
- **THEN** it reports the runtime as unsupported
- **AND** the CLI recovery names Node 20's 2026-04-30 EOL date and recommends Node 24

#### Scenario: Supported LTS versions satisfy runtime checks
- **WHEN** the CLI or doctor evaluates Node 22.22.0 or later Node 22 patches, or Node 24.18.0 or later Node 24 patches
- **THEN** it reports the runtime as supported
- **AND** the generated consumer fixture contains the same engine range as the core package

#### Scenario: The support policy approaches its next review
- **WHEN** a maintainer reads the active compatibility policy
- **THEN** it states that support follows upstream Node LTS status and the minimum advances when a supported line reaches EOL
- **AND** it provides 2026-10-28 as the next review checkpoint, explicitly requiring confirmation of the current official schedule before changing the supported range

### Requirement: Read-only sync distinguishes package provenance from repository drift

`sync --check` SHALL report `PROVENANCE_MISMATCH` instead of `DRIFT` when the only difference in tracked state metadata is `packageHash`, and the saved and observed package version, blueprint hash, configuration hash, active profiles and state format match. This result SHALL exit with code 0, identify the saved and observed `packageHash`, and SHALL NOT propose operations or mutate the consumer. File, configuration or any other tracked state difference SHALL remain `DRIFT` with exit code 1. The plan SHALL expose changed metadata fields and saved/observed values in both human-readable and JSON output.

#### Scenario: Only package provenance differs

- **WHEN** a consumer has no file or configuration drift and `sync --check` observes only a different `packageHash` from a CLI with the same version, blueprint, configuration, active profiles and state format
- **THEN** the result is `PROVENANCE_MISMATCH` with exit code 0
- **AND** the plan reports `packageHash` with its saved and observed values
- **AND** it contains no proposed operations and does not change the target

#### Scenario: A managed file has drifted alongside a provenance difference

- **WHEN** a consumer file differs from its managed state and `sync --check` also observes a different `packageHash`
- **THEN** the result remains `DRIFT` with exit code 1
- **AND** the plan identifies the file operation and the `packageHash` state difference

#### Scenario: Active profiles differ

- **WHEN** `sync --check` observes a different active-profile list from the value saved in consumer state
- **THEN** the result is `DRIFT` with exit code 1
- **AND** human and JSON output name `activeProfiles` and include both values

#### Scenario: A state-only field differs

- **WHEN** `sync --check` observes a difference in `blueprintHash`, `configurationHash` or `stateFormatVersion`
- **THEN** human and JSON output name each changed field and include its saved and observed values
- **AND** the check does not describe the difference only as `state=update`

#### Scenario: The project-level check runs against provenance mismatch

- **WHEN** `npm run project-os:check` encounters only a package provenance mismatch
- **THEN** the sync check exits successfully and the remaining read-only checks continue
- **AND** an actual repository drift still makes the project-level check fail

