## Why

Issue [#152](https://github.com/IgnacioBarEsp/project-engineering-os/issues/152) found that this repository commits a third-party agent plugin, four wrappers, and an active edit hook whose launcher can download and execute an upstream binary. Removing the vendor now restores the repository's own boundary and prevents a future project-local hook or runtime dependency from silently bypassing its declared license notices.

## What Changes

- **BREAKING** Remove the Impeccable skill, four associated agent files, project hook, and obsolete `.impeccable/design.json`; exclude generated `.impeccable` state from exports and Git.
- Document how contributors can install the upstream plugin through their agent's supported plugin mechanism without copying it into this repository.
- Make `check:neutrality` fail closed on every repository-owned hook under `.github/hooks/`; the permitted hook set is empty.
- Make `check:package` compare core production package licenses with the core notice table and verify the Companion notice against its locked production package inventory.

## Capabilities

### New Capabilities

- `project-hook-policy`: Repository-owned agent hooks require explicit, closed review; currently none are permitted.

### Modified Capabilities

- `supply-chain-governance`: Third-party notices for the core npm artifact and Companion package are checked against the versions and licenses actually redistributed.

## Impact

Affected surfaces: `.github/`, `.impeccable/`, `.gitignore`, `config/export-allowlist.json`, `CONTRIBUTING.md`, both third-party notice files, `scripts/check-package.mjs`, `scripts/check-neutrality.mjs`, and focused tests. No dependency is added, no Companion implementation or product metadata changes, and no published package or release is rewritten. Rollback is `git revert`; removed upstream material remains recoverable from Git history and can be installed externally using the documented upstream instructions.
