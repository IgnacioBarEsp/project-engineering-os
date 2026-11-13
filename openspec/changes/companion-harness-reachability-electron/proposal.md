## Why

Issue #150 completes Wave 3 verification. Existing tests already cover many regressions from #142 and #144–#149, but do not cross all six profiles, both preparation choices, both motion preferences and the required three window sizes. Native Electron source-app captures need a required Windows CI job.

## What Changes

- Extend existing journeys and measure visited routes against the authoritative renderer table.
- Add explicit bounded-motion, route/rail/nav, occlusion, scroll and transformed-ancestor probes with measured denominators and targeted mutations.
- Run real Electron Windows source app in CI, verify IPC clipboard from the main process and emit provenance-bound captures.
- Reproduce historical #141 defects at a3b1efd and the #142 fix using isolated snapshots, without mutating product checkouts.
- Document the independent adversarial review protocol; keep human/independent gates pending until actual evidence.

## Capabilities

### Approved coordination amendment — f9ed23c

The [final-head amendment](coordinated-final-head-amendment.md) proposes qualifying
all seven existing phases on one identified final source, then archiving them in
their original order and integrating through one protected PR. It preserves every
phase criterion, scoped human receipt, independent review and debt history.
It does not approve historical intermediate layouts or replace the real #146/#147
maintainer journeys. Explicit approval of f9ed23c is recorded in
[the receipt](evidence/coordinated-final-head-approval.md); the protocol may begin.
Current local timeouts remain failures, not qualification.

### New Capabilities
- `companion-harness-coverage`: complete route/motion/window coverage, non-vacuous probes, negative controls and Electron source-app provenance.

### Modified Capabilities
None.

## Impact

### Approved installed-evidence harness amendment — 2667452

Qualification of e713e9a exposed two verifier defects, documented by the independent
review and a real failed installed cycle. The [new concrete amendment](installed-evidence-harness-amendment.md)
proposes an exact five-file harness/fixture/QA allowlist, one bounded correction
and incremental reconciliation; no product/CI/policy changes. The maintainer
approved2667452 separately; the literal receipt is in evidence/installed-harness-approval.md.
Apply may begin within that scope. Original qualification/human gates remain.

### Pending fixture-role budget decision after the bounded Apply

The correction frozen at662fc27 failed2/7 regressions because its business fixture
uses an unrecognized optional role. The product guard is correct. The original
approval and consumed one-variant budget remain recorded. The
[new concrete decision](fixture-role-correction-amendment.md) proposes only
analyst-to-freelancer in that fixture and one changed-input regression execution.
It is not approved or applied. It neither resets the budget nor authorizes
repeating unchanged mutation inputs, product edits or future result claims.

Companion test harnesses, CI, EVALUATION documentation. No dependencies, release, installed-app mutation, product data migration or Wave 4. Existing live-service and stubbed native-capability evidence remain explicitly distinct.
