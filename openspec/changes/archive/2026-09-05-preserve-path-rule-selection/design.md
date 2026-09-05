## Decision

Generate `.claude/rules/project-os-<id>.md` with YAML `paths`, `.cursor/rules/project-os-<id>.mdc`
with `globs` and `alwaysApply: false`, and `.github/instructions/project-os-<id>.instructions.md` with
comma-separated `applyTo`. Official sources were checked on 2026-09-05. A wildcard is still a selector;
do not replace conditional rules with unconditional application. Existing aggregate shells become indexes.
AGENTS.md and OpenCode retain explicit textual fallback with globs and no enforcement claim.

Canonical rules remain consumer-owned. Accept portable lowercase IDs and a documented common glob subset
using slash-separated relative paths, `*`, `**`, `?`, letters, numbers, underscore, dot and hyphen. Reject
empty, absolute, traversal, control characters, commas and ambiguous syntax before writing. Multiple
patterns are separate entries. This avoids frontmatter injection and comma reinterpretation in Copilot.

Dynamic entries use the existing constructor owner and transaction/state machinery. Removed rules are
retired only when unchanged; personalized files become conflicts. Index targets stay stable for legacy
seed-once matrices. New matrices label the three collections generated and preserve separate unverified
startup/smoke signals. Offline collection fixtures compare each emitted glob list and body with canonical
rules, and reject missing/extra managed files or unconditional scoping.

## Validation

Test actual bootstrap, sync after additions/removals, repeated no-op, edits that block retirement,
rollback and malicious identifiers/globs. Check the full installed fixture and all capability contracts.
No second-agent or provider-authenticated verification is claimed.
