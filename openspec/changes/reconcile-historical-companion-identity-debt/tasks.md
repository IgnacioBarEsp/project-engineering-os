## 1. Proposal and approval

- [x] 1.1 Isolate exact main, verify no duplicate, enrich #206 preserving its original story, and pass pre-propose DoR (evidence/readiness-propose.json).
- [x] 1.2 Obtain and record explicit maintainer approval of this proposal/design/spec before Apply; do not infer approval from permission to start (evidence/spec-approval.md).

## 2. Baseline and inventory

- [x] 2.1 Revalidate base/remote issue and registry; version inventory for all 37 IDs, source hashes, provisional categories and phased priorities from the published diagnostic (evidence/inventory-37.json, apply-start-issue-state.json).
- [x] 2.2 Record exact-ID mismatch, current static guard inspection and historical installed provenance/exclusions with hashes; distinguish unmerged ola 3 work (evidence/static-identity-review.json, docs/debt/IDENTITY_RECONCILIATION_206.md).
- [x] 2.3 Prepare the one-ID assessment input, complete baseline snapshots/hashes and a phase preflight/verifier without changing generic capture behavior (evidence/assessment-input.json, baseline-registry.json, exercise.json).

## 3. Verification and capture

- [x] 3.1 Exercise valid capture, byte-identical recapture and interrupted-capture convergence in disposable copies (evidence/exercise.json).
- [x] 3.2 Exercise wrong existing/absent ID, extra resolution, removed/reclassified item, changed occurrence, changed prior assessment and changed same-flow input; record non-vacuous detection (12 named detections in evidence/exercise.json).
- [x] 3.3 Rehearse preintegration recovery using separate preserved baseline and rejected candidate copies, proving hashes and debt health without deleting assessments (evidence/exercise.json recovery).

## 4. QA and assessment

- [x] 4.1 Link the reconciled inventory from upstream documentation and pass documentation presence/links/findability/neutrality checks (66 links/two-hop routes in evidence/documentation-checks.json).
- [x] 4.2 Run constructor tests, capability-matrix, opsx/sync/doctor checks and read-only debt checks; record any bounded degradation rather than suppress it (393 tests and disposable consumer in evidence/qa.json; debt in exercise.json).
- [ ] 4.3 Run independent or clean-context adversarial review of the candidate, resolve all Blockers/Majors and finalize the assessment input before its immutable capture. If residual findings require changed scope, stop for an approved amendment rather than invent a clean result.

## 5. Official capture and closure preparation

- [ ] 5.1 Only after successful preflight and review, capture officially in the phase branch; verify 50 total/36 open, all other 49 objects unchanged, target immutable fields unchanged, prior assessment hashes and budget 4/5 unchanged; repeat identical capture.
- [ ] 5.2 Review the final diff and actual checks after capture; complete readiness metadata from evidence and strictly validate without falsely completing pending work.
- [ ] 5.3 Prepare the archive/handoff summary with accurate integration status, remaining 36 and #204 blocker; ensure issue and Project report only verified phase progress.

## Post-Apply milestones (all pending, outside the archive completion ledger)

- Run pre-archive readiness only after the above tasks actually pass, then archive/sync through local fixed OpenSpec. Archive is not integration.
- Open and attach protected PR with `Refs #206`, never umbrella autoclose; preserve pile order and #204/required-CI blocker.
- After actual green required CI and permitted merge, update #167/#206/Project with the phase result, keeping the other 36 and the umbrella open. Stop before ola 4 as required by the main handoff.

Do not mark these milestones performed merely to pass an earlier gate; record real PR, CI, archive and merge evidence when they occur.
