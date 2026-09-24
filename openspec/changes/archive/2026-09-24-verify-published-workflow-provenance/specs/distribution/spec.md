## ADDED Requirements

### Requirement: Published verification distinguishes workflow and tag identities

The read-only published-release verifier SHALL cryptographically verify the npm signature and SLSA provenance for the exact published package and canonical GitHub Release tarball. It SHALL require the signed provenance subject digest to match the canonical tarball, its publisher workflow repository and path to be the reviewed release workflow on `main`, and its workflow commit to match the exact successful GitHub Actions `workflow_dispatch` run and attempt named by the attestation. The verifier SHALL require release jobs to complete in build, GitHub Release, then npm publication order, and require their source-validation, canonical-asset-comparison, publication, and registry-provenance steps to succeed in order, with canonical comparison preceding publication. Separately, it SHALL require the release manifest source commit to match the immutable remote tag commit. It SHALL NOT equate the publisher workflow commit with the protected source-tag commit.

#### Scenario: A manually dispatched release has distinct workflow and tag commits

- **WHEN** npm returns a cryptographically verified provenance statement for a package whose workflow dispatch ran from protected `main`
- **AND** the statement subject matches the canonical release tarball and the referenced run and required steps succeeded
- **AND** the canonical manifest commit matches the requested immutable tag
- **THEN** published verification succeeds even when the workflow commit differs from the tag commit

#### Scenario: The signed workflow run does not match the provenance

- **WHEN** the attestation invocation identifies a missing, unsuccessful, non-dispatch, non-`main`, or different workflow run or attempt
- **OR** the signed workflow commit differs from the run's head commit
- **THEN** published verification fails closed

#### Scenario: The published artifact or source tag differs

- **WHEN** the signed subject digest differs from the canonical release tarball
- **OR** the release manifest source commit differs from the remote tag commit
- **OR** a required source-validation, canonical-comparison, publication, or provenance step did not succeed
- **THEN** published verification fails closed without modifying the tag, release, or registry
