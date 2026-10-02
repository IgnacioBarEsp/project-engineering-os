# Brownfield baseline

Base commit: `6763040d42158bd0b06839b10993fd9a13eb2d75` (`main`, 2026-09-24).

## Measured current behavior

- `blueprint/manifest.json` defaults and `blueprint/core/project-constructor/config.json` select
  `documentation,harness-tooling`.
- `.project-os/profiles.json` selects `documentation,harness-tooling,ui,auth-security,library-cli`;
  each conditional active profile references an existing decision document.
- `.project-os/repository-governance.json` declares `repositoryKind: upstream`; `package.json` identifies
  `create-project-engineering-os`.
- No tracked `.project-constructor/config.json` exists in this upstream checkout, as required by
  `docs/UPSTREAM_OPERATIONS.md`.
- Before this change, `node bin/project-os.mjs sync --check` and `node bin/project-os.mjs upgrade --check`
  both stop with `PROJECT_OS_PROFILE_SELECTION_DRIFT` and exit 2 before building a plan.
- A consumer fixture with equal configured/canonical lists succeeds; a deliberate consumer mismatch must
  continue to fail with `PROJECT_OS_PROFILE_SELECTION_DRIFT`.

## Scope boundary

The upstream doctor currently reports technical-profile and GitHub receipt failures tracked by #115 and
#160. This change does not alter the doctor, profiles, receipt state, or readiness policy. Archive-local
checks are run against the documented bootstrapped consumer fixture, not by bootstrapping this upstream.
