# Changelog

All notable changes follow [Semantic Versioning](https://semver.org/).

## 0.1.5 - 2026-08-04

- Migrate project ownership metadata from the former GitHub handle to `IgnacioBarEsp`.
- Point `repository`, `bugs` and `homepage` at the current owner so the npm listing resolves.
- Restore code ownership rules and the release owner guard, which no longer matched after the rename.
- Record authorship in `LICENSE` and `author` under the maintainer's legal name.

## 0.1.4 - 2026-07-23

- Allow a feature to archive after it captures pre-existing minor debt; the resulting pause governs
  subsequent work in the owner plan.
- Keep `NO GENERAR MAS DEUDA TECNICA` strict for remediation flows.
- Persist a newly created GitHub remediation-issue backreference from the `gh` URL even when issue
  listing is eventually consistent, so the immediate handoff is accurate.

## 0.1.3 - 2026-07-23

- Correct state metadata drift immediately after an upgrade.
- Require normal `sync --check` and `upgrade --check` to converge without a second state mutation.

## 0.1.2 - 2026-07-23

- Fail release packing when a legacy checkout violates the canonical LF policy.
- Name offending paths and recover through a fresh worktree/clone instead of reporting a false PASS.

## 0.1.1 - 2026-07-23

- First stable npm/npx release through Trusted Publishing OIDC.
- Correct relative tarball publication and make GitHub Release recovery idempotent.
- Enforce canonical LF export identity across Windows, macOS and Linux.
- Move public workflows to current Node 24-based immutable action releases.

## 0.1.0 - 2026-07-23

- Partial GitHub-only release candidate; npm promotion failed before publishing and this version must not
  be consumed.
- Reproducible environment bootstrap, harness parity, OpenSpec SDD and read-only doctor.
- Integrated `project-os debt` control loop with immutable assessments and per-plan budgets.
- Deterministic consumer upgrades, transactional recovery and optional pull-request handoff.

No version is considered released until its Git tag, GitHub Release tarball, checksum, npm artifact and
provenance have the same verified identity.
