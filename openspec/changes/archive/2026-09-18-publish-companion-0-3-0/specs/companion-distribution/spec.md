# companion-distribution Specification Delta

## Purpose
Define public release assets, documentation alignment and screenshot provenance for Companion releases.

## ADDED Requirements

### Requirement: Release documentation alignment and screenshot provenance
Every Companion release SHALL update public documentation, release notes, installer guides and screenshot provenance to match the published artifact version without broken links or unverified assertions.

#### Scenario: Documentation matches published candidate
- **WHEN** a new Companion candidate is prepared for publication
- **THEN** package.json, package-lock.json, release notes, installer guides and status docs SHALL declare the matching version
- **AND** README.md SHALL link to the corresponding release tag

#### Scenario: Visual screenshots reflect integrated code
- **WHEN** the interface layout changes
- **THEN** documentation screenshots SHALL be regenerated and their SHA-256 hashes recorded with verifiable provenance
