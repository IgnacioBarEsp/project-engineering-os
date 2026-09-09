## Decision and compatibility

Approved on 2026-09-09 under the maintainer's explicit #66 delegation, following issue #85 DoR PASS.
Add optional `adoptProjectSeeds: [{target, hash}]` to buildPlan/runBootstrapOrSync. The CLI reads the same
array from `--adopt-project-seeds <json-file>` for bootstrap or sync. No wildcard, boolean or implicit
adoption. Candidates in publicPlan are a convenience for review, not permission. Existing callers retain
their behavior. Validate exact normalized paths, unique entries and lowercase SHA-256; bound CLI input
to 64 KiB and consent to 256 entries. Inapplicable consent fails rather than silently broadening scope.

## Ownership and state

Only active blueprint entries with owner `project` may be adopted. The path must exist as a regular,
single-link file, with no symbolic link in its path. Owner mismatches remain conflicts. The approved hash
must match the observed bytes. Adoption records `seeded: false, adopted: true` and the existing hash; its
plan operation is `adopt`, non-material. Subsequent sync preserves adoption identity and treats edits as
consumer edits. Repeated consent may match an already adopted record; it never converts a seeded file or
non-project record into an adoption. A missing consent target is an error, not permission to create it.

## Transaction boundary

Persist exact adopted target/hash guards in the transaction journal, separate from material operations.
Validate guards before creating a new journal, before material work on resume and before state commit.
The guard list must match the interrupted journal; a caller cannot remove or change consent to resume.
Recheck strict path and link constraints along with hashes. Old journals without guards retain compatibility.
Rollback acts only on material operations and state; adopted files are not backed up, rewritten or removed,
including originals edited by their owner after adoption. This is a preflight/revalidation contract, not an
OS lock against a hostile process replacing filesystem entries between individual syscalls.

## Public CLI and distribution

Existing manifests retain their scripts, dependencies, license and stack byte for byte. Adoption is not
proof that scripts, OpenSpec or an index are activated. The app environment flow handles that separately.
The feature is additive in the pre-1.0 core release; release identity and canonical artifact verification
remain governed by the existing release pipeline. MIT, no new costs/dependencies or telemetry. Activate
the local library-cli quality profile with this compatibility, licensing and recovery decision.

## Verification

Use synthetic existing software/Unity folders with README, package and product files. Test read-only
candidate discovery, explicit review, exact bytes, repeat, installed sync, CLI input validation, same-hash
collisions without permission, invalid owners, missing/stale paths, links, interrupted apply/resume and
rollback. Run the core suite, package fixture and multi-platform CI. Independent adversarial review checks
authorization and recovery before official archive. No unmeasured token saving or runtime activation claim.
