## Why

Ready issues #58, #59 and #60 identify a stale publication client, an unused release-age control and missing consumer guidance. All three pass the upstream DoR (13 checks each). The maintainer authorized their completion and protected integration in the September 4 session.

## What Changes

- Pin npm 11.19.1 in upstream CI and both release build/publish jobs. It supports the published Node matrix, is older than the selected seven-day quarantine and includes the patch to explicit pack target handling. Keep OIDC and canonical artifact comparison.
- Set upstream-only release quarantine to seven days, retaining locked-install behavior and documenting a one-command, package-specific urgent exception.
- Add dated, source-backed guidance for npm, pnpm, Yarn and Bun, identifying version-dependent defaults and unsupported equivalences.

## Capabilities

### Modified Capabilities
- supply-chain-governance: reproducible client and upstream quarantine.

## Impact

Upstream workflows, local npm configuration, workflow contract checks and documentation. No consumer configuration, global workstation settings, production dependency or paid service. Rollback reverts the configuration/workflow PR without altering existing release assets.
