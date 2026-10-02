# Validation evidence

## Specification and issue gates

- Issue #122 pre-propose: PASS, 13 PASS / 0 FAIL, including project membership and closed dependencies.
- Fixed OpenSpec CLI: `npx openspec validate classify-upstream-profile-drift --strict --no-interactive` → valid.
- Focused regression: `node --test --test-name-pattern='checks read-only omiten el upstream' test/constructor.integration.test.mjs` → 1 pass / 0 fail.

## Runtime behavior

- On this upstream checkout, `sync --check --json` and `upgrade --check --json` each return exit 0, `status: SKIP`, `mutationPerformed: false`, no plan, and a reason directing the operator to a consumer fixture.
- Integration coverage confirms the result is read-only; neither active profiles nor files change.
- The same two commands retain `PROJECT_OS_PROFILE_SELECTION_DRIFT` when only one upstream identity signal is present. Diagnostics retain both profile lists.
- `sync --dry-run`, `sync` apply, and `upgrade --apply` do not use the skip and fail before writes on the divergent profile selection.
- `npm run fixture -- --keep --json` on the packed release candidate passed its empty-consumer workflow: bootstrap, second-run idempotence, sync check, OpenSpec init/adapt/check, and doctor. The captured machine-readable output is `consumer-fixture.json`; doctor had zero FAILs, OPSX was PASS, and the consumer sync check was successful (`PROVENANCE_MISMATCH` with exit 0 because the fixture used the packed package identity).
- Archive readiness local runners run against the bootstrapped consumer fixture, not the upstream. The first fixture run confirmed the `doctor-json-check`, `opsx-check`, `openspec-strict`, and `sync-check` runners all pass.

## Documentation and ownership review

- `docs/UPSTREAM_OPERATIONS.md` now states the exact two-signal applicability rule and distinguishes read-only checks from mutating operations.
- `docs/SELF_APPLICATION.md` retains the 2026-09-18 `a3b1efd` conflict measurement as historical evidence and no longer presents it as current check behavior.
- No profile list, activation decision, consumer default, package dependency, or state schema changed.

## Full suite

`npm run check` → PASS: package contract (167 files), public-tree neutrality, docs (12 README links and 20
spec purposes), 6 workflows, debt registry/policy, and **365 tests / 365 pass / 0 fail**. The integration
suite includes the exact-profile-drift regression and transaction rollback rehearsal.

The final packed-consumer fixture run also passed. Its tarball SHA-256 is
`1977106f86f277b3c4de9517a866b42ae0f76fbac784cb246041fe42532a6fb8`; all 12 captured fixture commands
returned 0. The doctor reported 0 FAILs, OPSX was PASS, and the check's JSON evidence is
`consumer-fixture.json`.

The archive gate passed both contexts without mutation:

- Upstream static archive readiness: PASS, 16/16, with a valid `clean` debt assessment.
- `readiness-check --phase archive --change classify-upstream-profile-drift --run-local` against the
  bootstrapped consumer fixture: PASS, 20/20. Its fixed `doctor-json-check`, `openspec-strict`, `opsx-check`,
  and `sync-check` runners all exited 0. The fixture sync result was `PROVENANCE_MISMATCH` with exit 0, so
  provenance remained informational rather than repository drift.
- Debt capture: PASS, `clean`, zero candidates, no registry changes; `npm run check:debt` remained PASS.
