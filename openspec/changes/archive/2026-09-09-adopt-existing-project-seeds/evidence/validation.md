# Validation of existing project adoption (#85)

Date: 2026-09-09. Scope approved under the maintainer's explicit program #66 delegation. Definition of
Ready passes with documentation, harness-tooling and library-cli surfaces. This is agent-executed
evidence; no human approval, user study or installer use is inferred.

## Executed checks

- Core 0.4.0 `npm run check`: 295 passed, zero failures/skips. Package, neutrality, documentation,
  workflow and debt checks pass. The suite includes eight new adoption tests and strict JSON Schema
  validation of installed records and journals.
- Core 0.4.0 tarball fixture: PASS from an empty temporary repository. Existing package smoke and
  contract cases cover installed runtime identity, five harnesses, doctor JSON, sync and repeat behavior.
- [CI run 34376466407](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/34376466407)
  passes on source `690fc0274a7a02e24604d25621676e2ffaffed89`: Ubuntu, Windows and macOS with Node
  20.20.0/22.22.0, all Companion jobs, dependency audit and required aggregate. Companion remains pinned
  to published 0.3.0; these jobs do not claim the app already consumes the new core.
- Release preflight accepts the coherent 0.4.0 identity; registry availability check passed before
  publication. Package/blueprint self pins and changelog are aligned. No dependency or license is added.
- OpenSpec local 1.6.0 strict validation passes. Final protected CI must pass after archival edits too.

## Real Windows CLI observation

The implementer operated the actual CLI through child processes on two synthetic existing Git projects,
software and Unity. Each contained a preexisting README and package manifest, plus product-specific files.
Dry-run reported candidates, a separate reviewed target/hash file authorized exactly two adoptions, apply
returned APPLIED, read-only sync returned IN_SYNC, and rollback returned ROLLED_BACK. All original bytes
matched after rollback. The manifest retained its custom script and license. See `windows-cli.json`.

The API tests also cover consumer edits before rollback, state-only sync reversal, missing/recreated
seeds, stale/missing inputs, hardlinks and directory junctions, interrupted resume, changed consent,
before-state-commit revalidation, and old journals without guards. CLI input bounds and command scope are
tested. Public documentation distinguishes adopted files from installed scripts or activated workflows.

## Adversarial review and corrections

A separate agent reproduced five further sequences involving binary/BOM/CRLF bytes, exact file/hash
snapshots on failed resume, adoption identity, generated seeds, introduced links and repeated rollback.
Its verdict is PASS with no unresolved Blocker/Major/Minor; see `independent-review.md` for actual origin
and limits. The initial implementer suite found missing optional properties in the strict state/journal
schemas; after adding them, a second run found AJV strictRequired on the conditional field. Both were
corrected, the adoption tests now use strict AJV, and the full 295-test suite then passed. Initial failed
runs are not described as successful.

The API keeps caller consent explicit and cloned. Candidate discovery does not authorize adoption.
Project-owned files retain their bytes and seeded=false/adopted=true identity; constructor, overlay and
external owners remain ineligible. Journal guards are separate from writes and rollback never restores
or deletes adopted originals. Revalidation is not a filesystem lock against a hostile same-user process
between individual syscalls. This limitation matches the approved design.

## Documentation, debt and recovery

README and the documentation index link to the adoption guide, whose CLI/API examples and limits were
reviewed against implementation. Ownership and compatibility decisions link within two hops. Existing
historical release evidence remains historical. No token saving, external runtime activation or EXE
availability is claimed. Issue #87 owns the app's integration and environment checks; #80/#81 own the
installer and full journeys/benchmarks. Program #66 remains open.

No unresolved debt candidate remains in #85's approved scope. Its clean assessment is captured before
archive. Recover by checked transaction rollback, preserving originals and later consumer edits, or
revert the upstream PR and reinstall a previous verified artifact. Publish 0.4.0 only after protected
merge through the existing canonical artifact, checksum and OIDC pipeline; this document does not claim
that publication has already occurred.
