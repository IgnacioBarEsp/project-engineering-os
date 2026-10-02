## Why

Tracks issue [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

The upstream doctor currently reports three active technical profiles without their consumer-owned
evidence receipts and one expired GitHub Project receipt. #115 now provides a fail-closed contract for
those technical receipts; this change does not duplicate or bypass it. The remaining operational gap is
that the upstream has no issue-backed baseline to distinguish these known results from a new regression,
and the GitHub Project receipt expired without a freshness report or documented renewal procedure.

## What Changes

- Add a versioned upstream-only baseline that lists each accepted doctor `FAIL` by check ID, profile and
  tracking issue. `npm run check` compares it with the live read-only doctor result and fails on a new or
  unexplained failure, without making a network request.
- Add read-only `project-os freshness` output that brings the existing tool-catalog freshness entries
  together with expiring local evidence receipts. Stale data is reported, not repaired or treated as a
  command failure. This is the receipt foundation for the later fixed-decision inventory in #158.
- Declare a bounded, fixed renewal procedure for the upstream GitHub Project receipt. The command is
  descriptive data and is never executed by doctor, freshness or `npm run check`.
- Renew the GitHub Project receipt from a successful manual read-only smoke, with only the configured
  project URL, owner, title and timestamps retained.
- Document the expected upstream doctor result, the baseline update rule and manual receipt renewal.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime`: upstream doctor failures are compared with an issue-backed baseline; freshness combines
  tool-catalog state and fixed expiry-bound receipts without mutation or remote access.
- `public-documentation-experience`: the upstream runbook explains the accepted doctor state and how to
  renew a GitHub Project receipt safely.

## Impact

Changes affect `src/doctor.mjs`, a read-only freshness module and CLI route, an upstream-only baseline
check, tests, the local GitHub Project receipt, and `docs/UPSTREAM_OPERATIONS.md`. No dependency, scheduled
workflow, remote mutation, profile change or consumer-owned data migration is added. The later #158 change
can extend the same report with dated pinned decisions; its scheduled issue-writing workflow remains out
of scope here. Issue #122 is closed; on this upstream checkout, `sync --check` and `upgrade --check`
return exit 0 with `SKIP` and `mutationPerformed: false`, because the upstream does not consume the
managed consumer layout. That historical failure is not part of this change's current baseline.
