## ADDED Requirements

### Requirement: Release authority is explicit and technically enforced
Contributor guidance SHALL distinguish independent review from execution and review explicitly delegated
by the maintainer. Release evidence SHALL record its actual origin without manufacturing human approval,
and required CI, protected integration and canonical artifact provenance SHALL remain enforced.

#### Scenario: Maintainer delegates a bounded release
- **WHEN** the maintainer explicitly authorizes an agent to complete review, integration and publication
- **THEN** the release SHALL record that delegation and actual automated/manual evidence
- **AND** the agent SHALL NOT present self-review as independent review or bypass required technical checks

#### Scenario: Additive minor release
- **WHEN** a new release is published
- **THEN** root metadata, seeded exact dependency, lockfile, changelog and current install examples SHALL agree
- **AND** published artifacts SHALL retain their immutable identity and provenance
