## ADDED Requirements

### Requirement: The upstream SDD CLI is locally reproducible

The upstream repository SHALL declare `@fission-ai/openspec` version `1.6.0` as an exact development
dependency and SHALL resolve the same version in its lockfile. A clean `npm ci` SHALL expose the local
OpenSpec binary without relying on a global installation, a floating version, another checkout or an
absolute workstation path. Any install-script permission SHALL be scoped to that exact package and version.
OpenSpec SHALL NOT become a runtime dependency of the published package, and the packaged artifact SHALL
continue to contain no duplicated OpenSpec source or generated dependency tree.

#### Scenario: A clean clone installs the SDD CLI

- **WHEN** a contributor or agent runs `npm ci` in a clean clone or worktree
- **THEN** `node_modules/.bin/openspec` exists and reports version `1.6.0`
- **AND** the workflow does not resolve a global or floating fallback

#### Scenario: The public package remains runtime-neutral

- **WHEN** the upstream package is packed and its manifest is inspected
- **THEN** OpenSpec appears only in the development graph
- **AND** the public tarball contains neither OpenSpec source nor an embedded dependency tree

#### Scenario: The development graph is audited

- **WHEN** the supply-chain gate evaluates the clean locked installation
- **THEN** every high or critical advisory is either absent or governed by an exact unexpired exception
- **AND** missing audit metadata cannot be interpreted as PASS
