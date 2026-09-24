## ADDED Requirements

### Requirement: CLI and recovery guides explain sync results and exit codes

The public CLI and recovery guides SHALL explain `IN_SYNC`, `DRIFT` and `PROVENANCE_MISMATCH`, document exit codes 0 (success), 1 (drift), 2 (invalid) and 3 (transaction), and give a safe next step for each sync-check result.

#### Scenario: A contributor reads the public CLI guide

- **WHEN** a contributor needs to interpret a command's result or exit status
- **THEN** the guide names all four codes and their meanings
- **AND** it explains that provenance mismatch succeeds without proposing a repair while real drift fails

#### Scenario: A contributor follows recovery guidance

- **WHEN** a sync check reports repository drift or a provenance mismatch
- **THEN** the recovery guide directs the contributor to review real operations before applying changes
- **AND** it states that a provenance-only mismatch is informational and leaves target state unchanged
