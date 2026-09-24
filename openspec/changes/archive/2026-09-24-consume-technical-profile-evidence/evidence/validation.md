# Validation evidence

## Scope and outcomes

- `npx openspec validate consume-technical-profile-evidence --strict --no-interactive`: **PASS**.
- `node --test test/doctor.test.mjs test/readiness.test.mjs`: **42/42 PASS**, including assertions that unrelated doctor results remain visible, that the 50 MiB aggregate artifact bound is enforced, and that deeply nested invalid `activeProfiles` data yields a profile `FAIL` without losing the doctor report.
- `npm run check`: **PASS**, including package contract (168 files), neutrality, docs (12 README links and 20 spec purposes), workflows (6), debt check, and the full suite (**374/374 PASS, 0 skipped**).
- `npm run fixture`: **PASS** on the packed empty-consumer fixture.
- `node node_modules/@fission-ai/openspec/bin/openspec.js validate consume-technical-profile-evidence --strict --no-interactive`: **PASS**.
- `node bin/project-os.mjs readiness-check --phase archive --change consume-technical-profile-evidence --target . --json`: **PASS**, 16/16, `mutationPerformed: false`. The `--run-local` consumer flow is covered by the readiness integration fixture; running that flag against the upstream repository itself is not a consumer fixture and fails on its intentionally absent consumer-owned OpenSpec ownership file.
- Final Codex Security diff scan `5ffee433-8813-4e9d-8735-9fa5a690ec5c`: **complete**, 7/7 assigned review items, 0 reportable findings. It reviewed the final code snapshot after the malformed nested-profile guard. This automated scan is not human approval.
- The fixture and focused tests leave source receipts/artifacts byte-identical after doctor/readiness inspection. The readiness integration test supplies the real doctor JSON for complete `ui` and `infra-deploy` receipts and confirms the runner set remains exactly `constructor-doctor-json`, `constructor-opsx-check`, `constructor-sync-check`, and `openspec-strict`.
- The readiness integration test never runs metadata-supplied commands. Negative tests cover missing/malformed/incomplete, stale/future/impossible-time, wrong-profile/config/hash, unknown/duplicate/N/A, traversal/symlink escapes, receipt/per-file/aggregate size limits, and artifact hash mismatch.
- The 0.5.0-shaped fixture preserves the published config/profile catalog fields, stays readable without receipts, keeps inactive profiles at `SKIP`, and fails closed for an active profile with no current receipt. The inspected npm 0.5.0 tarball SHA-256 was `1259a27de80942c392e31e354e359d19451a6ffe5fecf65470e296e5a56d4348`.
- `docs/UPSTREAM_OPERATIONS.md` documents receipt creation/verification boundaries, freshness and size limits, failure recovery, 0.5.0 migration, and why the landing workaround remains until a corrected release and a separate consumer-owned change.

## Rollback / read-only evidence

Doctor and readiness only read the fixed receipt, canonical package catalog and repository-local artifact bytes; they do not create, normalize, execute or rewrite any of them. The positive doctor test snapshots the complete fixture before and after inspection and asserts byte-for-byte equality. Rollback is a protected PR revert: this change has no data migration and consumers retain their evidence and workaround. Reverting restores the earlier active-profile `FAIL`; it cannot manufacture a `PASS` or deactivate a profile.

The fixture verifies the published package path; it does not claim a production release or migration of the landing consumer. That follow-up remains release-gated and consumer-owned.
