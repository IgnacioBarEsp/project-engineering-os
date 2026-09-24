## 1. Readiness and implementation baseline

- [x] 1.1 Capture current Node.js official LTS/EOL schedule and issue #155 propose readiness evidence in `evidence/pre-apply.md`.
- [x] 1.2 Record the pre-change active runtime surfaces and confirm no duplicate open PR or change exists in `brownfield-baseline.md` and `evidence/pre-apply.md`.

## 2. Runtime contract and enforcement

- [x] 2.1 Update root and blueprint core package engine ranges, lockfiles, runtime lock metadata, and contributor `.nvmrc` to the approved supported/recommended lines.
- [x] 2.2 Update CLI and doctor runtime checks and diagnostics to accept only supported Node 22/24 ranges and explain Node 20 EOL.
- [x] 2.3 Update generated consumer CI matrix to Node 22.22.0 and Node 24.x on Ubuntu, Windows and macOS; preserve Companion's app runtime unchanged.
- [x] 2.4 Add positive and negative unit tests for minimum, newer supported patches, EOL Node 20, below-floor versions, odd-numbered versions, and Node 26 Current.
- [x] 2.5 Extend blueprint fixture/parity checks to prove generated consumer engines and CI match the core contract.

## 3. Public policy and release metadata

- [x] 3.1 Update active README, CLI guide, compatibility policy, and generated seed runbook/matrix with the LTS policy, EOL date, recommendation, review checkpoint and Node 26 exclusion.
- [x] 3.2 Add a breaking major entry to the changelog with migration guidance and rationale from the versioning policy; do not rewrite historical release records.
- [x] 3.3 Prepare root package and lock metadata for major release 1.0.0 only through the established protected release flow, preserving package/tag/tarball consistency.

## 4. Verification and integration

- [x] 4.1 Run strict OpenSpec validation, focused runtime tests, full `npm run check`, root fixture, isolated-toolchain fixture, package parity and debt assessment; record outputs.
- [x] 4.2 Complete manual generated-consumer bootstrap inspection and adversarial review; record evidence and close findings.
- [x] 4.3 Pass cross-platform CI on exact Node 22 minimum and Node 24 recommended line without reducing required protections.

After 4.3 passes, complete archive readiness on a synchronized disposable consumer, capture its gate evidence, and archive through the official OpenSpec CLI. This is the immediate workflow step after readiness passes, not a checkbox that can be completed before the gate itself.

Post-archive closeout remains tracked on issue #155: merge the archived change only through a protected PR with required checks and a real maintainer review; then publish and verify immutable major release 1.0.0 through the protected tag/release workflow, reconcile published-version status guidance, and close #155 only after the release artifacts are verified. These future external gates are deliberately not marked complete in this change task list.
