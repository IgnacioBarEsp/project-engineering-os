## ADDED Requirements

### Requirement: Compatible explicit instruction routes
The destination catalog SHALL include GEMINI.md, .kiro/steering/project-os.md and .windsurfrules. New Claude instructions SHALL import AGENTS.md; selected shared agents SHALL use the cross-agent file. Existing v1 receipts and interrupted transactions SHALL remain readable and recoverable, without implicit migration on read or modification of surrounding user text.

#### Scenario: Upgrade an old Claude context
- **WHEN** a v1 project is opened then explicitly previews and applies updated routes
- **THEN** opening changes no files and application updates only owned blocks while preserving adjacent text

#### Scenario: Legacy interruption
- **WHEN** a v1 interrupted context operation is resumed or rolled back
- **THEN** its original closed path set and hashes are checked and recovery does not reinterpret it as a v2 operation
