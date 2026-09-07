# published-release-verification Specification

## Purpose
Verify asynchronous npm publication and recover signed release evidence within finite limits while
preserving the existing tag, canonical artifacts and actual publication history.
## Requirements
### Requirement: Registry propagation has bounded verification
The verifier SHALL wait up to ten minutes for complete metadata of the exact package version, with
bounded requests and backoff. It SHALL reject permanent errors and identity divergence without false success.

#### Scenario: Publication propagates after twenty seconds
- **WHEN** npm returns missing or partial metadata, or transient HTTP/network errors, before a complete release
- **THEN** verification SHALL retry within the deadline and pass only on matching identity and provenance metadata

#### Scenario: Propagation never completes
- **WHEN** metadata remains unavailable past the deadline
- **THEN** verification SHALL fail with guidance to retry read-only verification rather than publication

#### Scenario: Identity or authority diverges
- **WHEN** a permanent HTTP error or unexpected package, version, tarball origin or integrity is observed
- **THEN** verification SHALL fail without treating the mismatch as eventual consistency

### Requirement: Existing publication recovery is read-only
The manual recovery workflow SHALL verify the existing tag, canonical GitHub assets, npm bytes, signatures
and signed attestations using only read permissions and pinned tools. It SHALL NOT publish or change a release.

#### Scenario: An already published version needs verification
- **WHEN** the maintainer supplies an existing SemVer tag
- **THEN** the workflow SHALL verify manifest identity against the remote tag, compare SHA-256 and SHA-512,
  install the exact artifact with scripts disabled and require valid npm signatures and attestations
- **AND** it SHALL emit evidence while retaining the original publication run's actual outcome

#### Scenario: Assets or verification evidence diverge
- **WHEN** assets escape the expected filenames, differ from the tag or registry, or lack valid signed evidence
- **THEN** the workflow SHALL fail before reporting success and leave remote state unchanged
