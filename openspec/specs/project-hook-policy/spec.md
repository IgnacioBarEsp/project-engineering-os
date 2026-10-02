# project-hook-policy Specification

## Purpose
This capability owns the repository policy for project-local agent hooks. It keeps `.github/hooks` empty by default and lets `check:neutrality` reject future hook entries without executing them.
## Requirements
### Requirement: Project-owned agent hooks are explicitly allowlisted

The repository's `check:neutrality` gate SHALL recursively inspect `.github/hooks` and SHALL reject every file, symbolic link, or unsupported entry that is not in a closed, code-reviewed allowlist. The current allowlist SHALL be empty. The check SHALL report the offending relative path without executing hook content.

#### Scenario: No project hook is installed

- **WHEN** `.github/hooks` is absent or contains no files
- **THEN** the hook-policy check passes

#### Scenario: A project hook is added

- **WHEN** any file or symbolic link appears under `.github/hooks` while the allowlist is empty
- **THEN** `check:neutrality` fails and identifies the path
- **AND** the check does not execute the hook
