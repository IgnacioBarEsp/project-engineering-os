# Independent adversarial review — issue #85

Date: 2026-09-09. Reviewer: a separate Codex agent, `review_adoption`, delegated to review the local
`codex/adopt-project-seeds` changes. This is automated independent review, not human approval.

## Scope and acceptance

Read the proposal, design, tasks and `specs/project-seed-adoption/spec.md` before implementation review.
Applied the borrowed `adversarial-review` skill. Reviewed `src/adoption.mjs`, the planner, public command
and CLI wiring, transaction application/resume/rollback, public documentation, and the adoption tests.
Also reviewed the state and transaction schema changes added by the implementer during this review.

Acceptance assessed: adoption needs exact target/hash consent; only active project-owned seeds qualify;
original bytes and consumer ownership survive installation, repeat, edits and rollback; changed inputs,
links and changed consent cannot resume material work. Existing unconsented collisions remain conflicts.
Adoption does not claim that dependencies, OpenSpec workflows or retrieval tools have been activated.

## Executed evidence

`node --test test/adoption.test.mjs`: **8 passed, 0 failed** on Windows, Node v24.18.0. The final run included
strict AJV compilation and validation of the real software/Unity installed state and journal against
the updated schemas.
`git diff --check` found no whitespace errors; Git emitted a line-ending normalization notice only.

An independently written temporary repro used the public exports from `src/index.mjs`, real Git-backed
temporary folders, the normal blueprint, real file writes and journals. It exercised these additional
sequences and asserted their results:

1. Start adoption of a README containing BOM, CRLF, NUL and a non-UTF-8 byte; interrupt after one material
   write. Retry without consent and with extra consent. Both fail. Compare every non-Git file's SHA-256
   before and after each retry, including the journal: no content or journal changes. Resume with the
   original consent and compare the adopted file as a Buffer: all original bytes remain exact.
2. After that successful adoption, remove README, sync, recreate it with new consumer content, and sync
   again. The missing state records hash null; both later states retain adopted true and seeded false.
3. Select a different project-owned file which the constructor seeded. Supply its current exact hash
   as new adoption consent. The API rejects `ADOPTION_TARGET_INELIGIBLE`; the entire file/hash map stays
   unchanged. Matching bytes do not turn a seeded record into an adopted one.
4. Obtain valid adoption candidates, then add a hardlink to the original without changing its bytes.
   Apply with the previously reviewed hash. The API rejects `ADOPTION_LINK_UNSAFE`; it creates no
   constructor metadata and leaves the complete file/hash map unchanged.
5. Interrupt a fresh adoption after two material writes. Verify that README is absent from the journal's
   material operations, edit it as the consumer, then invoke public rollback twice. Both the initial
   rollback and its idempotent repeat preserve the later consumer edit.

All five independent sequences **passed**. The temporary repro initially used an incorrect nested result
path for the repeated rollback assertion; the public result exposes `wasAlreadyRolledBack` at its root.
Correcting that review-harness assertion and rerunning the entire repro produced a clean pass. This was
not an implementation defect. Temporary fixture cleanup checked resolved paths against its dedicated
temporary prefix before recursive removal. No user project or product file was used as a fixture.

The repository tests additionally cover same-byte default collisions, invalid owners and malformed
consent, stale/missing originals, directory junctions, before-state-commit revalidation, exact interrupted
guard matching, legacy journals without guards, and bounded CLI JSON input and command scope.

## Findings

No unresolved Blocker, Major or Minor finding was confirmed in the reviewed scope.

The implementer identified and corrected the schemas' previously closed property sets while review was
running. I reviewed the resulting optional fields and reran the tests that validate generated artifacts;
I do not claim independent discovery of that correction.
The implementer's full suite subsequently exposed AJV strictRequired for the conditional adoption
field. The implementer added the field declaration inside `if` and enabled strict AJV in the adoption
tests. I reviewed that correction and reran all eight adoption tests successfully afterward.

## Limits and disposition

- These executions were on Windows. The parent change still needs its ordinary protected multi-platform
  CI, full core checks, package fixture, debt assessment and archive readiness evidence.
- The temporary repro calls the public API; the repository test covers the real CLI's JSON parsing and
  dry-run. This review does not establish Companion integration, EXE installation or tool activation.
- The implementation revalidates paths/hashes across transaction boundaries. It is not an OS lock
  against a hostile same-user process replacing files between individual filesystem calls, consistent
  with the approved design. Mutable in-process JavaScript plans and edited local journals are not a
  security boundary against an already trusted caller with filesystem access.
- No benchmark, token saving, screen-reader certification or human review is claimed here.

**Verdict: PASS.** Official archive is advisable once the parent change's remaining required checks and
evidence pass. This review supplies independent adversarial evidence; it does not replace those checks.
