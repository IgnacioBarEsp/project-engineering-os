## 1. Fix the receipt lifecycle contract

- [x] 1.1 Define a strict upstream GitHub Project receipt shape with canonical issue/expiry timestamps, a bounded validity horizon, current config hash and fixed read-only renewal command.
- [x] 1.2 Validate the upstream receipt in doctor without executing its command; preserve current consumer receipt behavior.
- [x] 1.3 Record the successful manual Project view as a minimal current receipt with no credentials or item/issue content.

## 2. Report freshness without mutation

- [x] 2.1 Add `project-os freshness` to combine existing tool-catalog status with the fixed receipt lifecycle report.
- [x] 2.2 Add unit and integration tests for expiry boundaries, due-soon, stale-but-successful exit, config drift, malformed data, limits, symlinks and non-execution.
- [x] 2.3 Verify freshness, doctor and `npm run check` leave receipt/config bytes unchanged.

## 3. Make the upstream doctor baseline regression-sensitive

- [x] 3.1 Add a strict issue-backed baseline of current accepted doctor `FAIL` IDs/profiles.
- [x] 3.2 Add a baseline checker to `npm run check` that compares the complete live failure set without network or mutation.
- [x] 3.3 Test added, unresolved-removed, obsolete, duplicate and untracked baseline entries.

## 4. Document expected operation

- [x] 4.1 Update CLI help/guide and `docs/UPSTREAM_OPERATIONS.md` with freshness output, failure baseline policy and exact manual receipt renewal.
- [x] 4.2 Keep the later #158 review-by inventory and scheduled issue workflow as a separate extension of the same report boundary.

## 5. Validate and close through the protected flow

- [x] 5.1 Run strict OpenSpec, focused tests, `npm run check` and the packed-consumer fixture; record outputs.
- [x] 5.2 Complete adversarial review and debt assessment; resolve actionable findings.
- [x] 5.3 Prepare truthful readiness/evidence for the archive gate.

After these implementation/evidence tasks are checked, run archive readiness and the pre-archive debt gate. Only if both pass, archive with the official local OpenSpec CLI. Then open a protected PR, satisfy its required DCO/review/checks without bypassing protections, and verify the merge before closing issue #160.
