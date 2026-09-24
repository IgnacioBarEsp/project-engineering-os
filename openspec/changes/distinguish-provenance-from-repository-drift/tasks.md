## 1. State diagnosis and status classification

- [x] 1.1 Add a deterministic state-field delta helper that reports saved and observed values for the required metadata, including the persisted pre-migration state format.
- [x] 1.2 Classify package-hash-only `sync --check` results as `PROVENANCE_MISMATCH` with exit 0, no proposed operations, and no target mutation; preserve `DRIFT`/1 for real drift.
- [x] 1.3 Render the status and field deltas consistently in human and JSON output without changing mutating sync or upgrade behavior.

## 2. Regression evidence

- [x] 2.1 Add automated fixtures for package-hash-only provenance mismatch, true managed-file drift, active-profile differences and state-format diagnostics.
- [x] 2.2 Verify the consumer `npm run project-os:check` chain continues after provenance mismatch and still fails on real drift.
- [x] 2.3 Run focused tests, the full test suite and repository checks; record the two-origin fixture evidence.

## 3. Documentation and review

- [x] 3.1 Document sync results, exit codes 0–3 and recovery steps in `docs/CLI_GUIDE.md` and `docs/RECOVERY.md`.
- [x] 3.2 Perform adversarial review, classify findings, and run the configured debt assessment.
- [ ] 3.3 Pass the full local check suite, strict OpenSpec validation and archive-local checks; record manual two-origin evidence.
- [ ] 3.4 Pass required cross-platform CI and security checks on the protected PR; record the run evidence.

After 3.4 passes, complete archive readiness and archive with the official fixed OpenSpec CLI. Then push the
archived change in a signed-off commit, merge only through the protected PR flow, and verify issue closure.
