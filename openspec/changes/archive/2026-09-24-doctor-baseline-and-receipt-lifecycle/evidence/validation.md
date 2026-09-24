# Validation evidence

Date: 2026-09-24. Change: `doctor-baseline-and-receipt-lifecycle`; issue [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

## Automated checks

- Focused suite `node --test test/doctor.test.mjs test/freshness.test.mjs test/upstream-doctor-baseline.test.mjs`: 39 passed, 0 failed. This includes the upstream-canonical-path and consumer-legacy-path regressions.
- `npm run check`: PASS; package, neutrality, documentation, workflow, debt and upstream-baseline checks passed; 387 tests passed, 0 failed.
- `npm run fixture -- --json`: PASS on the disposable empty Git consumer. The packed tarball was 277,866 bytes (SHA-256 `100d29216e8b85457466cc17ba58e20a800e04c6a2a826b745c8ccc10160531e`). Bootstrap, second-run idempotence, sync-check, OpenSpec init, `opsx-adapt`, `opsx-check` and consumer doctor JSON all exited 0; fixture cleanup completed.
- Fixed local CLI `node node_modules/@fission-ai/openspec/bin/openspec.js validate doctor-baseline-and-receipt-lifecycle --strict --no-interactive`: valid.
- `node bin/project-os.mjs debt check --root . --json`: PASS. The existing repository state remains four open debt items in three flows; this change introduced no registry-item changes.
- `node bin/project-os.mjs debt gate --phase pre-archive --change doctor-baseline-and-receipt-lifecycle --root . --json`: PASS, 2 PASS / 0 FAIL.
- `node bin/project-os.mjs readiness-check --phase archive --change doctor-baseline-and-receipt-lifecycle --target . --json`: PASS, 16 PASS / 0 FAIL, `mutationPerformed: false`.
- Direct root-level `opsx-check` is not a passing validation for this upstream form; the required check passed in the packed consumer fixture after official OpenSpec initialization. The optional root `--run-local` readiness mode was therefore intentionally omitted as described below.

## Upstream behavior and read-only evidence

- `node bin/project-os.mjs doctor --target . --json`: exit 1 with exactly `profile.ui`, `profile.auth-security`, and `profile.library-cli` as FAIL. The expired `github.project` failure is gone; no failure was hidden or relabeled.
- `node bin/project-os.mjs freshness --target . --json`: exit 0; GitHub Project receipt `fresh`, 180 days remaining.
- SHA-256 before and after doctor, freshness, and `npm run check` was identical for `.project-os/evidence/github-project.json` (`09EBB824AC6F87E0D1FC5D27A3D49D68596BD75A0CAF10C49A98C59023B54457`) and `.project-os/github/product-os.json` (`6CAFA64BA72C788DD82714CB9AEDDF1C178E69DEAC39AA76BDB6E7215296CE60`). No command rewrote the receipt or manifest.
- Current upstream `sync --check` and `upgrade --check` each exit 0 with `SKIP` and `mutationPerformed: false`; this reflects the upstream/consumer boundary, not the historical #122 failure.
- Direct `opsx-check --target .` still reports missing upstream consumer-ownership metadata. It was not treated as a root-level pass: OPSX validation passed in the disposable consumer fixture, which runs official OpenSpec initialization before its check. The upstream self-application decision says not to generate consumer OPSX artifacts here.

The optional `readiness-check --run-local` mode was not used on the upstream root: its fixed runners invoke the raw doctor and consumer-only OPSX check there, which are intentionally non-green for this upstream shape. The exact upstream doctor set is instead validated by `npm run check`'s baseline comparator; the packed consumer fixture runs doctor and OPSX checks in their applicable context.

## Archive and post-archive verification

- Before archival, `readiness-check --phase archive`: PASS, 16 PASS / 0 FAIL; `debt gate --phase pre-archive`: PASS, 2 PASS / 0 FAIL.
- Official local OpenSpec CLI archived the change as `2026-09-24-doctor-baseline-and-receipt-lifecycle`; `specsUpdated: true`, 4 requirements added, 0 modified or removed.
- After archival, `openspec validate --all --strict --no-interactive`: 20 passed, 0 failed; `npm run check`: 387 passed, 0 failed; `npm run fixture`: PASS.
- `git diff --check`: PASS.
