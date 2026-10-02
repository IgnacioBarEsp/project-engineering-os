## 1. Publish the evidence contract

- [x] 1.1 Add a strict JSON Schema for the fixed profile receipt and seed it in `blueprint/manifest.json`.
- [x] 1.2 Add a helper fixture that builds records from the packaged canonical profile requirements and calculates configuration/profile/artifact hashes.

## 2. Verify technical-profile receipts in doctor

- [x] 2.1 Load canonical requirements from the package blueprint and derive the expected complete evidence set without trusting consumer requirement lists.
- [x] 2.2 Read the fixed receipt path and validate schema, IDs, duplicate/missing/unknown items, PASS-only statuses, hash bindings and the 30-day timestamp window.
- [x] 2.3 Bound receipt/artifact sizes; guard receipt and evidence paths; verify regular in-root artifact bytes and SHA-256 without writing or executing consumer data.
- [x] 2.4 Preserve inactive-profile `SKIP`, emit actionable causes/recovery for failures, and keep unrelated doctor results visible.

## 3. Prove readiness, compatibility and read-only behavior

- [x] 3.1 Add positive/negative tests for every profile evidence category, malformed/stale/future/wrong-profile and wrong-config records, unknown/duplicate entries, path traversal, symlink escape, size limits and hash mismatch.
- [x] 3.2 Add a complete UI/infra archive-readiness fixture and prove the fixed `constructor-doctor-json` runner passes it without executing metadata commands.
- [x] 3.3 Add a 0.5.0-shaped consumer fixture that remains readable and fail-closed without new receipts; prove reads leave raw evidence byte-for-byte unchanged.

## 4. Document the public contract and migration

- [x] 4.1 Document receipt fields, fixed paths, hash/freshness rules, size limits, artifact boundaries, evidence-truth limits, recovery and 0.5.0 migration in `docs/UPSTREAM_OPERATIONS.md`.
- [x] 4.2 Document that the landing workaround stays until a corrected core release and is removed only by a separate reviewed consumer change; preserve independent FAILs and the fixed runner.

## 5. Validate and close through the protected flow

- [x] 5.1 Run strict OpenSpec validation, focused doctor/readiness tests, `npm run check` and the packed consumer fixture; record outputs and read-only verification evidence.
- [x] 5.2 Complete adversarial review and a debt assessment; resolve actionable findings.
- [x] 5.3 Prepare the complete archive package with truthful readiness metadata and preserve the landing workaround migration as release-gated consumer-owned follow-up.

With every task above evidenced, run archive readiness. Once it passes, archive through the official OpenSpec CLI before creating the protected PR; that post-gate operation is deliberately not checked off in advance.
