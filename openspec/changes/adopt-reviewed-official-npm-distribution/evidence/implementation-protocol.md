# Candidate implementation protocol and current proof boundaries

The maintainer approved8d335a2. Product source starts at approved2143335cc7; checkpoint6f39c43 transports
only this change and approval. No rejected upstream patch is present in this product branch.

The compiled catalog stays self-contained for generated offline agents. npm identity comprises channel,
version, source, full tree hash and recipe hash; the complete canonical digest determines the slot.
Selection and receipts have exact bounded canonical schemas. All other tool slots/contracts are kept.
Verification is at each manager acquisition in the existing trusted-operation model, not a new hash
immediately before every subprocess in unchanged stack/toolchain callers. No hostile-FS authentication
or power-loss proof is claimed.

Under the existing global lock, a journal binds its exact nonce/hash and PID, root, compiled identity,
before/after selection bytes/hashes and operation-owned stage/quarantine. Repair keeps the original
quarantine instead of deleting unknown state. A dead PID is only an additional check after ownership.
Recovery uses an exclusive per-operation claim, keeps the abandoned global lock until last and
revalidates the evidence. Interrupted pending operations restore selection-before. A completed record
indexed by the exact lock nonce permits recovery after archival but before unlock; selection-after is
accepted only after the actual receipt and full payload are reverified. Unowned locks before journaling
and interrupted recovery claims remain fail-closed/manual. No PID-only takeover or directory guessing.

One fresh pre-patch investigator and one independent candidate reviewer ran. The reviewer found two P2
correctness issues: missing destination advanced selection; finalization could strand its lock. Parent
reproduced both, retained failures, patched within scope and reran the exact triggers successfully.
No independent post-fix approval or second review cycle is claimed. See the managed reconciliation.

Observed so far: clean isolated app ci/immutable lock; root/root-runtime/blueprint/app raw audits pass
the unchanged high threshold (1/0/0/32 moderate respectively); pure identity controls4/4, real manager
install/repair case, two real interruption cases and older advisory regressions13/13 passed before the
review fixes. Post-fix focused controls/reproductions passed; extended owning checks remain pending.
The first grouped test run timed out and a historical-version packaging assertion failed; both are
retained. QA now distinguishes the candidate0.3.7 from historical assisted0.3.6 evidence. The release
installation test harness changes only its expected candidate version; no NSIS/CI/host guard changes.

Global suites, runtime matrix, packaged source/installer, resource/recovery negatives, debt/official
archive and protected green CI remain required. No fixed/adopted/released/merged/ola3-closed claim.
