## ADDED Requirements

### Requirement: Upstream closes work through captured debt evidence
The upstream SHALL maintain configured policy, registry and captured assessments independently of consumer seeds. Historical imports SHALL preserve source evidence and document ownership normalization. Its validation SHALL fail if debt configuration disappears, and readiness archive SHALL require a captured assessment for each change.

#### Scenario: Previously resolved historical debt
- **WHEN** an imported finding has already been corrected by integrated changes
- **THEN** a remediation assessment SHALL resolve it with current evidence instead of deleting historical assessments

#### Scenario: Missing upstream configuration
- **WHEN** upstream debt configuration is absent
- **THEN** the upstream validation SHALL fail rather than accepting an unconfigured SKIP as health
