## Why

Issue #150 completes Wave 3 verification. Existing tests already cover many regressions from #142 and #144–#149, but do not cross all six profiles, both preparation choices, both motion preferences and the required three window sizes. Native Electron source-app captures need a required Windows CI job.

## What Changes

- Extend existing journeys and measure visited routes against the authoritative renderer table.
- Add explicit bounded-motion, route/rail/nav, occlusion, scroll and transformed-ancestor probes with measured denominators and targeted mutations.
- Run real Electron Windows source app in CI, verify IPC clipboard from the main process and emit provenance-bound captures.
- Reproduce historical #141 defects at a3b1efd and the #142 fix using isolated snapshots, without mutating product checkouts.
- Document the independent adversarial review protocol; keep human/independent gates pending until actual evidence.

## Capabilities

### New Capabilities
- `companion-harness-coverage`: complete route/motion/window coverage, non-vacuous probes, negative controls and Electron source-app provenance.

### Modified Capabilities
None.

## Impact

Companion test harnesses, CI, EVALUATION documentation. No dependencies, release, installed-app mutation, product data migration or Wave 4. Existing live-service and stubbed native-capability evidence remain explicitly distinct.
