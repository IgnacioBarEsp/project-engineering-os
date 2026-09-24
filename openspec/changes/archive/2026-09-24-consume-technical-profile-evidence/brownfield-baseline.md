# Brownfield baseline

Base commit: `27a417613fa373740b51e6208c5d498e174996ca` (`main`, 2026-09-24).

## Measured current behavior

- The canonical packaged catalog is `blueprint/core/project-os/profiles.json`; consumer selection is read
  from `.project-constructor/config.json` and/or `.project-os/profiles.json`.
- `src/doctor.mjs` has a fixed list of seven technical profile IDs and reports unconditional `FAIL` for
  active ones without reading profile evidence. Inactive profiles remain `SKIP`.
- This upstream checkout activates `ui`, `auth-security` and `library-cli`; the read-only baseline
  `node bin/project-os.mjs doctor --json` reports all three as the exact technical-profile failures and a
  separate expired `github.project` receipt (`FAIL` 4 total). Other findings remain independently
  classified: 8 PASS, 2 WARN, 15 SKIP.
- The project does not track `.project-constructor/config.json`; upstream operational guidance forbids
  bootstrapping this checkout as a consumer. Consumer behavior must be exercised in isolated fixtures.
- The published `create-project-engineering-os@0.5.0` tarball was inspected directly (SHA-256
  `1259a27de80942c392e31e354e359d19451a6ffe5fecf65470e296e5a56d4348`). Its seeded config has
  `schemaVersion`, `stage`, `codeIndexable`, `activeProfiles`, `harnesses`, `githubMode` and
  `branchStrategy`; its profile catalog has `schemaVersion`, `active` and `profiles` entries with `id` and
  `active`, but no technical evidence receipt. A fixture using that shape without a new receipt must remain
  readable and `FAIL` for active technical profiles; the fixed `constructor-doctor-json` readiness runner
  currently inherits the unconditional failure.
- `src/readiness.mjs` has a fixed local runner allowlist. No consumer metadata or profile evidence is
  interpreted as a command.

## Scope boundary

This change consumes consumer-owned evidence but neither creates nor modifies it. The profile requirements
remain upstream-owned. The landing workaround is consumer-owned and cannot be removed until the corrected
core has been published and a separate landing change has been reviewed.
