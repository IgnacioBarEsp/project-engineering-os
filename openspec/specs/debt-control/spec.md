# Debt Control

## Purpose

Definir cómo se verifica, presupuesta y conserva la deuda residual para impedir que un cierre SDD o una
operación del constructor oculte riesgos pendientes.
## Requirements
### Requirement: Residual findings are classified, not narrated

Every SDD close SHALL capture an immutable assessment, including a clean result. Warnings and scanner
output SHALL remain candidates until evidence classifies, refutes, resolves or exceptions them.

#### Scenario: A candidate cannot be verified

- **WHEN** current evidence does not establish impact
- **THEN** it is not charged as technical debt
- **AND** the assessment records the classification and evidence

### Requirement: Budget pauses the owning plan

Verified Blockers/Majors, expired exceptions, recurrence, five residual flows or budget threshold SHALL
trigger one idempotent remediation issue. Only cross-cutting critical debt SHALL pause all plans.

#### Scenario: A plan reaches its budget

- **WHEN** the registry evaluation reaches the configured threshold
- **THEN** pre-propose blocks ordinary product work for that plan
- **AND** permits remediation, security, incident or rollback work

### Requirement: Debt data survives runtime operations

Policy, registry and assessments SHALL remain project-owned and SHALL NOT be deleted by constructor
upgrade or rollback unless they were explicit operations with verified backups.

#### Scenario: Constructor upgrade is rolled back

- **WHEN** a package upgrade transaction is reverted
- **THEN** debt data outside the operation remains byte-identical
- **AND** pause state is still derived from the registry

### Requirement: Upstream closes work through captured debt evidence
The upstream SHALL maintain configured policy, registry and captured assessments independently of consumer seeds. Historical imports SHALL preserve source evidence and document ownership normalization. Its validation SHALL fail if debt configuration disappears, and readiness archive SHALL require a captured assessment for each change.

#### Scenario: Previously resolved historical debt
- **WHEN** an imported finding has already been corrected by integrated changes
- **THEN** a remediation assessment SHALL resolve it with current evidence instead of deleting historical assessments

#### Scenario: Missing upstream configuration
- **WHEN** upstream debt configuration is absent
- **THEN** the upstream validation SHALL fail rather than accepting an unconfigured SKIP as health

