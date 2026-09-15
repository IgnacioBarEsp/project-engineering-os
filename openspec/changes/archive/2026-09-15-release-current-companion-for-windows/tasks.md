## 1. Source and candidate

- [x] 1.1 Bump only the private Companion manifest and lockfile to 0.2.0; record release notes and preserve core 0.5.0.
- [x] 1.2 Add a bounded native installer/update/uninstall evidence runner and manual release workflow on a disposable Windows runner.
- [x] 1.3 Exercise negative path guards and artifact checks; keep build output outside the checkout.

## 2. Verification and source delivery

- [x] 2.1 Run app QA, root checks, Windows artifact verification and source/lockfile integrity checks.
- [x] 2.2 Record source-candidate evidence, adversarial review, debt assessment and rollback; resolve Blockers/Majors.
- [x] 2.3 Prepare archive readiness and hand the source-preparation PR to protected CI; actual publication remains subsequent work.

## 3. Handoff

- [x] 3.1 Record that actual tag, workflow dispatch, canonical asset comparison and docs reconciliation remain in subsequent #117 changes; do not call 0.2.0 published here.
