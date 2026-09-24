## 1. Applicability decision and runtime behavior

- [x] 1.1 Add a fail-closed upstream identity check requiring repository kind and exact package identity.
- [x] 1.2 Return explicit no-plan `SKIP` results for `sync --check` and `upgrade --check` only.
- [x] 1.3 Preserve strict consumer and mutating-command behavior with regression tests.

## 2. Documentation and evidence

- [x] 2.1 Document upstream check applicability and fixture-based validation.
- [x] 2.2 Run strict OpenSpec validation and the profile-selection constructor tests.
- [x] 2.3 Run the full local suite and packed-consumer fixture; capture their outputs.
- [x] 2.4 Complete adversarial review and capture the debt assessment.

Run archive readiness against a bootstrapped consumer fixture and archive only after it passes. Then commit with DCO sign-off and use a protected PR. Do not merge unless required cross-platform CI and the repository's review policy are satisfied.
