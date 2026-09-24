## 1. Provenance and run verification

- [x] 1.1 Add pure validation for signed artifact digest, main release-workflow identity, resolved workflow SHA, and bounded run invocation.
- [x] 1.2 Resolve and validate the exact GitHub Actions run and attempt, including required jobs and successful security-critical steps.
- [x] 1.3 Keep remote tag, manifest commit, canonical asset, and npm tarball checks independent and fail-closed.

## 2. Regression and completion evidence

- [x] 2.1 Add tests for valid distinct workflow/tag commits and for mismatched, incomplete, unsuccessful, or malformed run evidence.
- [x] 2.2 Run the complete package suite and strict OpenSpec validation, then re-run the published-release verifier for `v1.0.0`.
- [x] 2.3 Record evidence, complete adversarial/debt assessment, and archive the OpenSpec change.
