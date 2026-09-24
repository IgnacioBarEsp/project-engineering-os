## Context

Issue #160 concerns the upstream's self-diagnostic signal, not consumer profile configuration. After #115
merged, the current doctor reports four failures: `profile.ui`, `profile.auth-security`, and
`profile.library-cli` because the upstream has no current consumer evidence receipts, and
`github.project` because its local read-only smoke receipt expired. The upstream's receipt was refreshed
manually with `gh project view 3 --owner IgnacioBarEsp --format json`; that read returned the configured
Project 3, its owner and title, and made no remote change.

The program orders #160 before #158. This change therefore establishes receipt lifecycle reporting and
reuses the existing tool-catalog freshness results; #158 can later add `reviewBy` decisions and its
scheduled issue workflow without moving the receipt contract or making stale results block normal doctor
use.

## Goals / Non-Goals

### Goals

- Make the current upstream doctor result explicit and regression-sensitive without querying GitHub in CI.
- Report stale, due-soon and valid expiry-bound receipts together with existing tool-catalog freshness.
- Keep doctor, freshness and the baseline check read-only and non-authenticating.
- Keep renewal instructions fixed, reviewable and non-executable.
- Preserve all current profile choices and the fixed receipt contracts from #115.

### Non-Goals

- Do not deactivate profiles or manufacture technical-profile receipts for the upstream.
- Do not revise #122's profile-selection behavior or alter its compatibility policy.
- Do not make doctor or CI execute a GitHub command, authenticate, refresh a receipt, install a tool or
  repair a baseline.
- Do not add the scheduled workflow or its issue-write permission from #158.
- Do not assert that the receipt proves anything beyond the read-only Project view observed at its issue
  and expiry times.

## Decisions

### 1. Keep the upstream failure baseline local to upstream governance

Store the baseline under `.project-os/`, outside the packaged blueprint. Each entry has an exact doctor
check ID, profile and positive issue number. The check compares the complete set of observed `FAIL`
`(id, profile)` pairs with the complete declared set. An extra failure, a still-failing check removed from
the baseline, or an obsolete baseline row causes `npm run check` to fail with a recovery message. This
avoids wildcard allowances and avoids trusting a manually copied doctor transcript. The check is offline;
issue links are references, not a runtime GitHub lookup.

The baseline is not permission to hide a failure. A maintainer removes an entry only after the live doctor
no longer emits that `FAIL`; the equality check enforces that order. The current three profile entries
reference #115, which records their fixed evidence contract and the reason the upstream has no consumer
receipts.

### 2. Add a read-only freshness report with one fixed receipt source

`project-os freshness --target <path> [--json]` returns the existing tool-catalog freshness items and a
fixed allowlisted GitHub Project receipt item. It reports `fresh`, `due-soon`, `stale`, `missing` or
`invalid`; a stale item is diagnostic and does not change the command's success exit code. A malformed
catalog or receipt remains visible in the item status and summary.

The receipt reader confines access to `.project-os/evidence/github-project.json`, rejects symlinks and
oversized data, and never follows a path supplied by the receipt. The receipt declares canonical
`issuedAt`/`expiresAt`, a 180-day maximum validity window, the current config hash and the exact fixed
renewal command. Freshness recomputes the canonical hash of the bounded local Product OS manifest and
reports a mismatch as `invalid`, so an unexpired receipt cannot appear fresh after its configuration
changes. The command is displayed as data only. No command string is ever passed to a process runner.

The report reuses tool-catalog status rather than introducing a second interpretation of `verifiedOn`.
Its `pins`/catalog section is intentionally forward-compatible; #158 will add its review-by inventory
and can keep the same report boundary.

### 3. Keep doctor and CI local and read-only

The GitHub Project doctor check validates the fixed receipt's status, config hash, freshness timestamps,
validity horizon and fixed renewal procedure. `npm run check` runs doctor locally and compares its
failures to the baseline; it does not invoke the renewal command or contact GitHub. A successful manual
smoke is the only operation in this change that reads the remote Project, and it is not repeated in CI.

### 4. Preserve evidence limits

The receipt records the exact Project URL, owner, title, read-only command, `issuedAt` and `expiresAt`.
It contains no token, item data, issue content or claim of write access. A `PASS` means only that a manual
view matched the configured Project at the recorded time; it is not authentication of future access.

## Test Strategy

Testing follows a unit / integration / manual-evidence pyramid.

- Baseline unit tests cover exact match, a new failure, a removed-but-still-failing row, an obsolete row,
  duplicate IDs, malformed shape and missing issue references.
- Freshness unit tests cover just-before / at / just-after expiry, the 30-day due-soon boundary, malformed
  timestamps, oversized and malformed receipts, symlink escape, and a renewal string outside the fixed
  allowlist. Stale data must still return exit 0 and no mutation.
- Integration tests run the real upstream doctor through the baseline check, assert the checked-in
  baseline matches exactly, and snapshot receipt/config files before and after doctor, freshness and the
  baseline check.
- Repository gates include focused tests, strict OpenSpec, `npm run check`, the packed-consumer fixture,
  archive readiness and the pre-archive debt gate.
- Manual evidence is the successful `gh project view 3 --owner IgnacioBarEsp --format json` result. The
  saved receipt is minimized and the command is verified to be descriptive, not invoked by the product.

Coverage target: exercise every status and fail-closed branch of the baseline comparator and receipt
classifier; the manual smoke is the only network-dependent evidence.

## Risks / Trade-offs

- An issue-backed baseline can normalize real debt. Exact-set comparison, one issue per entry, the visible
  doctor result and an update-only-after-resolution rule make the debt explicit rather than hiding it.
- A fixed receipt command is repository-specific. It stays in upstream evidence, outside the universal
  blueprint, and is exact-checked before display.
- Tool-catalog freshness and receipt freshness have different source formats. The report preserves their
  own status semantics instead of flattening them into a misleading single boolean.

## Rollback

Revert the protected PR. No remote resource, profile selection or consumer receipt is mutated by the
change. The renewed local upstream receipt is preserved as historical evidence; rollback does not delete
or regenerate it.
