# Code review: scoped path rules

The implementing agent applied the engineering code-review dimensions to the final diff. This is a
separate review pass, not an independent agent or human review. Maintainer integration authorization
comes from the completion session; technical checks remain required.

## Findings resolved

- A legacy blueprint without the collection anchor could receive broken index links. The renderer now
  checks available owned targets and a regression test verifies the textual fallback.
- A test initially inspected an internal `items` field instead of public `operations`; it now checks
  the actual reported conflict, file contents and complete read-only snapshot.
- IDs are restricted before path construction; selectors are quoted as JSON-compatible YAML and
  comma-bearing patterns are rejected rather than reinterpreted by Cursor/Copilot.
- An unconditional Cursor flag and missing per-rule file are explicit negative cases. Retirement and
  collision handling remain in the existing transaction engine, including rollback after deletion.

## Review result

No unresolved blocker or major in scope. Loops are bounded by local canonical rules; no network is used.
Historical path-rule debt is resolved with captured evidence. The unverified provider runtime signals
and legacy seed-once matrix behavior are documented limitations, not false PASS results.
