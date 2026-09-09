## ADDED Requirements

### Requirement: Explicit bounded adoption consent
The constructor SHALL report eligible project-owned seed candidates in read-only plans and SHALL require
an explicit bounded list of exact target and SHA-256 pairs to adopt them. It SHALL reject malformed,
duplicate, stale, missing, linked, unknown or non-project targets without changing project content.

#### Scenario: Existing software or Unity project without consent
- **WHEN** a folder contains an unregistered project-owned seed, even with the blueprint's bytes
- **THEN** dry-run reports its target and hash as a candidate, keeps a collision and writes nothing

#### Scenario: Reviewed consent matches existing bytes
- **WHEN** the user provides exact target/hash pairs for eligible regular single-link files
- **THEN** the plan shows non-material adoption and registers project ownership with seeded false
- **AND** it preserves every original byte, including package scripts and product-specific files

#### Scenario: Unsafe or unrelated consent
- **WHEN** consent is malformed, refers to a missing path, mismatched hash, link, constructor, overlay or external entry
- **THEN** the operation fails before applying content and provides a recoverable diagnostic

### Requirement: Adoption remains consumer ownership
The constructor SHALL preserve adoption identity across subsequent sync and SHALL NOT interpret adoption
as installation or activation of the dependencies, scripts or workflows described by a seed.

#### Scenario: Repeated operation and consumer edit
- **WHEN** adoption completes and the consumer edits an adopted file before a normal sync
- **THEN** sync preserves the edited bytes and records continued adopted project ownership
- **AND** an unchanged second operation is idempotent

### Requirement: Checked recovery preserves adopted originals
The constructor SHALL retain exact adoption guards in its journal, validate them before new or resumed
material work and before committing state, and reject changed consent or inputs. Rollback SHALL act only
on constructor transaction writes and state, leaving adopted originals untouched.

#### Scenario: Interrupted operation resumes only its reviewed adoption
- **WHEN** a write is interrupted and the same adoption inputs and hashes remain valid
- **THEN** the constructor resumes its material operations with the original adoption guards
- **AND** omitted or altered consent, changed originals or newly introduced links prevent resume

#### Scenario: Rollback after consumer modification
- **WHEN** the consumer requests rollback after adoption or an interrupted installation
- **THEN** existing adopted originals, including later consumer edits, remain untouched
- **AND** installed constructor content and state are recovered under their existing hash contract
