# Validation

2026-09-05, Windows, Node 24.18.0, reviewed npm 11.19.1, exact local OpenSpec 1.6.0.

- PASS full check: 248 tests, package contract, neutrality, docs, workflows and debt policy.
- PASS full installed-tarball fixture: bootstrap, official generation, scoped collection contracts,
  sync idempotence, ownership, adapter and OPSX checks.
- PASS audit: zero high/critical findings and no exceptions.
- PASS exact local strict validation of the authored change before implementation; final all-spec check
  accompanies the protected PR after official archive.
- Offline tests inspect the documented selector syntax and correct body for each supported surface,
  and reject missing files or unconditional Cursor scope. The complete fixture checks actual installed
  files rather than only in-memory rendering.
- Lifecycle tests add a rule, remove a rule, repeat sync, roll back exact prior content and reject
  modified retirement and an unmanaged collision without writes.
- Six malformed ID/selector cases fail before mutation. A custom blueprint without a rule collection
  retains the legacy textual fallback rather than rendering links to absent files.

Manual inspection: canonical source remains seed-once, dynamic files use existing ownership/journal
machinery, and readable indexes avoid unconditional bodies. The portability limit and rollback's
preservation of the user-owned source are documented. Fixture results do not claim startup or model
adherence. Required remote CI remains the integration gate. No paid service, credentials or dependency.
