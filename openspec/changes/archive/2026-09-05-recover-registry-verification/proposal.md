## Why

Issue #74 passes all 13 DoR checks. Release run 33995560577 successfully published 0.3.0 with provenance,
then failed its twenty-second registry probe while npm was processing the package. The exact artifact
subsequently became available with valid signatures. Republishing an immutable version is not recovery.

## What Changes

- Wait up to ten minutes for complete registry metadata with bounded requests and backoff.
- Add a manual read-only workflow to verify an existing GitHub/npm release, including signed attestations.
- Document the failed probe and recovery without changing published bytes, tags or release authority.

## Capabilities

### New Capabilities
- published-release-verification: bounded propagation checks and read-only recovery evidence.

## Impact

Upstream release scripts, workflow, tests and runbook only. No runtime dependency, paid service or consumer
configuration change. Revert the implementation PR to roll back tooling; preserve published artifacts.
The maintainer explicitly delegated specification approval, execution, review and publication in this
session. This specification uses that authority; agent self-review is not independent human review.
