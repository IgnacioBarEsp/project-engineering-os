## ADDED Requirements

### Requirement: Preserve canonical path selection
The constructor SHALL render each canonical path rule separately for Claude Code, Cursor and GitHub
Copilot with the documented selector and matching body. Aggregate surfaces for these harnesses SHALL
index scoped rules without repeating their bodies unconditionally. Unsupported harnesses SHALL retain
an explicit textual fallback without claiming enforced selection.

#### Scenario: A documentation-only rule is installed
- **WHEN** a rule declares documentation globs
- **THEN** each supported surface contains those globs and only that rule's instructions
- **AND** its conditional selector is not overridden by unconditional application

#### Scenario: A rule is removed or changed
- **WHEN** sync compares canonical rules with prior managed state
- **THEN** it retires unchanged owned files, reports conflicts for user modifications and remains idempotent
- **AND** transaction rollback restores the preceding owned outputs

#### Scenario: A rule contains an unsafe identifier or unrepresentable selector
- **WHEN** the constructor plans rendering
- **THEN** it rejects the input before writing any file instead of broadening the scope
