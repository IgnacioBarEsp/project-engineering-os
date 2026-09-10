## Why

Issue #89 supports #87: existing product manifests must remain intact, but OpenSpec verification and the
local wrapper currently assume all engineering dependencies live in the product's root node_modules.
An explicitly selected local toolchain must satisfy the same checks without modifying product dependencies.

## What Changes

- Add optional `toolchainRoot` to consumer constructor configuration; omission retains the root layout.
- Share bounded local resolution between the distributed wrapper, OPSX checks and doctor.
- Check manifest, lock, installation and actual CLI entry at the selected location with no global fallback.
- Document explicit installation and recovery, preserving all consumer manifests and dependencies.

## Capabilities

### New Capabilities
- `isolated-local-toolchain`: explicit local toolchain resolution and consistent verification.

### Modified Capabilities
None. Existing root-layout behavior remains available by default.

## Impact

Configuration schema, a constructor-owned resolver, wrapper, neutral diagnostics and tests. No new
dependency or provider. Companion #87 owns downloads, reviewed installation and portable launchers.
This change does not install, move or delete dependencies and does not silently merge product manifests.

Risk: divergent resolution or path escape could execute a different CLI from the one checked. Use one
resolver with exact local paths and identities; read-only commands never repair or invoke the selected CLI.
Rollback restores the prior configuration/release through reviewed ownership rules, preserving directories.
Approved under the maintainer's explicit program #66 delegation after #89 Definition of Ready PASS.
