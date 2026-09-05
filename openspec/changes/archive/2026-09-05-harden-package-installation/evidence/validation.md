# Validation

2026-09-05, Windows, Node 24.18.0, npm 11.19.1 installed in a temporary prefix; no global workstation change.

- PASS `npm ci --ignore-scripts`: 85 packages, zero vulnerabilities; committed lockfile unchanged.
- PASS `npm run check`: 244 tests and all package, neutrality, docs, workflows and debt checks.
- PASS complete installed-tarball fixture, including official workflow generation and idempotence.
- PASS dependency audit: zero high/critical, zero exceptions.
- PASS local registry probe: one-hour-old package rejected; command-scoped exclusion accepts only the
  named package; another remains rejected; `ci` accepts the authorized lock without an exclusion,
  while preserving both configuration and lockfile bytes.
- PASS two dry-run packs: identical SHA256 c237a5a76b50170cf434eefb976f28396e1279ffa3b59d888205477bd65a468d
  on the pre-archive implementation tree. Both smoke the actual installed artifact. This is a rehearsal,
  not a released version or final release checksum.
- PASS exact local OpenSpec strict validation of the authored change.

Manual inspection: both release jobs retain canonical comparison, provenance and OIDC without token
fallback. The npm pin exceeds seven days and supports both Node minima. Guide sources are dated;
Yarn 4.18.0 was independently probed for three defaults. Its web example `1w` was not misreported as
the default. No consumer defaults change. Existing fixture tests cover transactions, recovery and
adapter capabilities; their applicability was reviewed, rather than claiming new remote authentication.

An initial pack attempt rejected a mixed-EOL migration file in the local checkout. Canonical LF was
restored without changing the committed content; the guard was retained. Rollback is a normal PR revert;
no published assets or user data are modified by this change. Required remote CI must pass before merge.
