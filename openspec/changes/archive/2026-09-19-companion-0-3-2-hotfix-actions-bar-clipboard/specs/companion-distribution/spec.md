## MODIFIED Requirements

### Requirement: Release documentation alignment and screenshot provenance
Every Companion release SHALL update public documentation, release notes, installer guides and screenshot
provenance to match the published artifact version without broken links or unverified assertions.
Documentation SHALL distinguish a source candidate from a verified downloadable release.

#### Scenario: Documentation matches published candidate
- **WHEN** a new Companion candidate is prepared for publication
- **THEN** package.json, package-lock.json and release notes SHALL declare the candidate version
- **AND** installer guides and status docs SHALL distinguish that candidate from the current published download
- **AND** README.md SHALL link to the new release only after its canonical downloadable assets are verified

#### Scenario: Visual screenshots reflect integrated code
- **WHEN** the interface layout changes
- **THEN** documentation screenshots SHALL be regenerated and their SHA-256 hashes recorded with verifiable provenance

#### Scenario: The hotfix publication is deferred
- **WHEN** the maintainer decides to defer publishing the 0.3.2 candidate
- **THEN** the decision SHALL record its owner and reason and PROJECT_STATUS.md SHALL identify the known
  action-bar and clipboard defects of the actually published 0.3.1 release
- **AND** documentation SHALL NOT describe 0.3.2 as downloadable or its installer as verified without that evidence

#### Scenario: The hotfix is published
- **WHEN** the corrected 0.3.2 source completes protected integration and its existing publication workflow
- **THEN** its immutable source identity, installer, manifest and SHA-256 SHALL satisfy the existing canonical
  asset verification contract before public download guidance changes
- **AND** the release notes SHALL identify issue #142 and the core SHALL remain at 0.5.0
