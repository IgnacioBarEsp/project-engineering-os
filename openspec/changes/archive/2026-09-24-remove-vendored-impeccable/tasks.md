## 1. Remove repository-local vendor surfaces

- [x] 1.1 Remove the Impeccable skill, four associated agents, active hook, and obsolete design sidecar.
- [x] 1.2 Exclude `.impeccable/` from Git and public-tree exports while retaining the rest of `.github/`.
- [x] 1.3 Document upstream external-plugin installation and clarify core versus Companion third-party notices.

## 2. Enforce hook and notice policy

- [x] 2.1 Add an empty closed project-hook allowlist to the `check:neutrality` gate and cover hook rejection without execution.
- [x] 2.2 Make `check:package` require core production-package notice rows and exact Companion notice/lock agreement.
- [x] 2.3 Add the missing Companion SPDX license metadata and regenerate its notice summary.
- [x] 2.4 Add negative tests proving an unnoted core package and stale Companion notice fail the package gate.

## 3. Validate and archive

- [x] 3.1 Validate OpenSpec, run focused and full project checks, and record the measured line-count mismatch against the issue's original baseline claim.
- [x] 3.2 Complete adversarial review, inspect the complete diff, and run the debt assessment.
- [x] 3.3 Archive the approved change with the fixed local OpenSpec CLI after all evidence passes.
