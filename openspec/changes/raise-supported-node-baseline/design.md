## Context

The root package and blueprint currently accept `^20.20.0 || >=22.22.0`; the latter also admits non-LTS and future Current lines. The root CI matrix spends one of two runtime legs on EOL Node 20. The generated package, doctor, CLI, seed docs and contributor pin repeat this inconsistent contract. Companion's app package already requires Node 24.18.0, but that app runtime has separate ownership and is out of scope.

The project is an MIT, dependency-light CLI and blueprint. This is a runtime-policy change, not a new integration. The upstream Node.js release schedule is the authority for LTS/EOL status and dates. Node 20 reached EOL on 2026-04-30; Node 22 and 24 remain LTS lines. Node 26 is Current at this change's decision point and is not eligible for the minimum or recommendation.

## Goals / Non-Goals

**Goals:**

- Give the core and generated consumers the same LTS-only range and make the CLI, doctor, CI and active guidance enforce or explain it consistently.
- Test the minimum Node 22 line and recommended Node 24 line across Ubuntu, Windows and macOS without increasing the six-job core matrix.
- Establish an explicit upstream-support and EOL review policy, with a dated review checkpoint.
- Ship the incompatible runtime policy as a major release and preserve immutable release/tag rules.

**Non-Goals:**

- Adopting Node 26 before it becomes LTS or automatically tracking Node releases; ongoing detection belongs to issue #158.
- Changing Companion's app `engines`, the package manager, dependency quarantine, or the app's bundled runtime.
- Rewriting historical release records or archived consumer snapshots for the previously published core version.

## Decisions

1. **Use `^22.22.0 || ^24.18.0` as the supported range.** The exact floors are the issue's tested minimum for Node 22 and the established Node 24 baseline. A bounded pair of LTS major ranges avoids accidentally admitting Node 23/25 or Node 26 Current. Revisit the pair after upstream status changes. A broad `>=22.22.0` range was rejected because it also accepts unsupported odd-numbered and not-yet-LTS majors.

2. **Test exact minimum plus floating recommended LTS.** Keep Node `22.22.0` and use `24.x` in the three-OS matrix, with `.nvmrc` pinned to `24.18.0` for a reproducible contributor setup. This protects the minimum while exercising current patches on the recommended line; CI may move with Node 24 patch releases without another policy change.

3. **Apply one contract to active root and seed surfaces.** Update root and blueprint package metadata/locks, CLI and doctor, generated consumer workflow, runtime lock metadata, active runbooks/matrices and public requirements. Do not alter app Companion engine files or published-version metadata snapshots. Add negative tests for EOL Node 20, unsupported majors and below-floor versions, and positive tests for both supported LTS lines. Verify the generated fixture carries the same package engine and CI matrix.

4. **Classify as a major release.** `docs/architecture/VERSIONING.md` defines incompatible policy changes as major. Raising `engines.node` excludes currently accepted Node 20 and broad future-major installs, so release it as `1.0.0`, update package and lock versions together, and publish only through the protected release procedure. A minor-with-notice classification was rejected because it contradicts the published versioning rule.

5. **Review on 2026-10-28, not automatically adopt Node 26.** Record that date in compatibility guidance as a scheduled review aligned with Node 26's planned LTS transition; it is a review target, not a promise that upstream dates cannot move. Confirm the official schedule at review time before changing the range. The Node Release WG schedule is the source of truth: https://github.com/nodejs/Release#release-schedule.

6. **Keep recovery additive and immutable.** If any matrix leg or consumer fixture fails, do not publish. Revert the PR through normal protected integration; do not move/delete tags or mutate published artifacts. If a major package is already published and proves defective, follow the release policy with a new correcting version and deprecation only where needed.

## Risks / Trade-offs

- [Node 20 users can no longer install the new core release] → Label the change breaking in the changelog and major version, name the required LTS lines in diagnostics and migration guidance, and keep old published versions immutable.
- [A floating 24.x CI leg can change during the PR] → Record the actual CI runtime in evidence; retain exact 22.22.0 coverage and pin local contributors to 24.18.0.
- [Upstream changes the Node 26 LTS schedule] → Treat 2026-10-28 as a review checkpoint only and confirm the official schedule before any later policy change.
- [Stale engine strings remain in a generated surface] → Search active core/blueprint files, run package parity and fixture checks, and assert root/seed engine equality.
- [Major release prerequisites or tag protection block publication] → Preserve the required protections; stop release mutation and report the specific external gate rather than bypassing it.

## Migration Plan

1. Implement and verify the approved spec on a branch; update all active core and generated-consumer contract surfaces and tests.
2. Pass strict OpenSpec validation, propose/apply/archive readiness, full local checks, cross-platform CI, fixture, debt assessment and adversarial review.
3. Merge by the normal protected PR path, then publish the matching `v1.0.0` tag/tarball/npm artifact only through the protected release workflow and compare canonical artifacts.
4. Roll back before publication by a protected revert. After publication, never move the tag or overwrite the npm version; use a new correcting release and the documented deprecation procedure if required.

## Open Questions

None. The issue's maintainer-approved scope and repository versioning policy settle the runtime range and major classification; scheduled review can revise the policy only after checking upstream status.
