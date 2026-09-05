## ADDED Requirements

### Requirement: Pinned upstream package client
The upstream SHALL use one exact compatible npm version for CI installation, release construction and trusted publication, preserve canonical tarball comparison and OIDC provenance, and document its review cadence.

#### Scenario: A client pin is refreshed
- **WHEN** the selected npm version changes
- **THEN** upstream checks and exact-tarball fixtures run with that version before protected integration
- **AND** the publication workflow retains its identity token and has no persistent token fallback

### Requirement: Explicit upstream resolution quarantine
The upstream SHALL declare a seven-day minimum release age for new package resolution, document measured locked-install behavior and provide a package-specific command-scoped urgent exception without changing consumer or global configuration.

#### Scenario: A newly published version is requested
- **WHEN** a version within the quarantine window is resolved without an exclusion
- **THEN** resolution rejects it
- **AND** a documented exact-version operation with an exclusion for that package permits the urgent case while other packages remain subject to the quarantine

### Requirement: Dated package-manager guidance
Public documentation SHALL identify install-script, release-age and origin controls with their version-dependent defaults, primary sources and consultation date, without choosing a manager for consumers or presenting these controls as complete protection.

#### Scenario: A consumer evaluates installation policy
- **WHEN** the consumer reads the documentation index
- **THEN** the hardening guide is reachable within two links and distinguishes configuration from guarantees
