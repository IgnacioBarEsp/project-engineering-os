## 1. Baseline and readiness

- [x] 1.1 Run the propose-phase readiness gate for issue 98 and record the result. **13 PASS, 0 FAIL.**
- [x] 1.2 Write the brownfield baseline from the code on `main` at 48557fe, not from memory: what the list
      shows today, what a real check costs, which receipts exist, and what the current checks assert.
- [x] 1.3 Record in the design which stages a green check mark requires per profile, and what it excludes.
      **Three exclusions named on the card: the person's files, the code map, the managed tools.**
- [x] 1.4 Resolve the issue's open question about duplicating, with the reason, in the design. **Both: the
      folder is chosen now and the answers arrive filled in and editable.**
- [x] 1.5 Record the deviation from the issue's prose about "eliminar", with the criterion it follows.

## 2. The verdict

- [x] 2.1 Add `witnessPaths(root)` to the preparation engine, the context engine, the environment engine and
      the activation engine: each returns the files it owns, read from its own receipt rather than from a
      list kept elsewhere. **The service hashes them all, so no stage depends on another's idea of a digest.**
- [x] 2.2 Build the engineering witness from the targets the core's own `check` enumerated.
- [x] 2.3 Add the verdict store beside `projects.json`: version 1, at most 50 entries, same lock and same
      compare-and-set, no absolute path in any field. **Bounded twice: 50 entries and 8 MiB of file.**
- [x] 2.4 Write the verdict as a side effect of the real check in `status()`, with the required stages for
      that profile, the state of each, the witness and the time. **Best effort: a verdict that cannot be
      saved never fails the check the person asked for.**
- [x] 2.5 Decide the row state in `listProjects` from the verdict plus a re-read of the witness, with every
      doubt resolving away from green, and keep the whole read inside `SUMMARY_BUDGET_MS`. **71 ms measured
      for five rows, one of them unreadable.**
- [x] 2.6 Tests: a verdict round-trips; an edited witnessed file turns `verified` into `changed`; a moved
      folder turns it into `unverified`; a truncated witness can never be green; a missing required stage
      yields the stage list and not a green check mark. **Plus, after the review: a verdict with no stages,
      no witness or an unreadable date; a store too large to read; a data directory that cannot be written.**

## 3. The list and the project

- [x] 3.1 The card opens the project, and `Abrir →` disappears rather than becoming a second name.
- [x] 3.2 Add the closed row-action table so a row control cannot carry two names either, and a probe that
      checks the set matches. **Three declared row actions; `rowBtn` takes no label.**
- [x] 3.3 Add the secondary menu with duplicating and removing from the list, and keep opening outside it.
- [x] 3.4 Say per card, at the same size as the state, what the check covered, when it ran, and that it does
      not re-read the person's files.
- [x] 3.5 Name the missing stages in the person's words, from the verdict, with no internal code on screen.
      **The word depends on why the stage is not ready: a stale inventory is not missing choices.**
- [x] 3.6 Duplicating: prefill the wizard with the original's answers against a newly chosen folder, adding
      no service capability that copies anything.
- [x] 3.7 Add "Cómo trabajar en este proyecto": composed by the service from the recipes and the pending
      stages, ordered, with a copy control per step and the staleness rule of the context export.
- [x] 3.8 Update the glossary and `docs/companion/EXPERIENCE.md` for the new states and the menu rule.

## 4. Evidence

- [x] 4.1 Extend the shared probes: row actions, the green-check rule, the menu rule, the guide's difference
      between two projects, and one control per action per screen.
- [x] 4.2 Add one mutation per new property to the mutation harness, including breaking a real stage of a
      verified project, and record detected versus not detected. **39 mutations, 39 detected, on 9 named
      screens, plus 11 service mutations, 11 detected, each credited to the test that failed.**
- [x] 4.3 Run the five native journeys against the installed window behind the identity guard, with the
      commit recorded only when the tree is clean. **5 profiles, 0 findings, 10 unverified stages.**
- [x] 4.4 Measure the list with one unreachable row and report the elapsed time, not the bound. **71 ms.**
- [x] 4.5 Prove on disk that duplicating leaves no `.project-os/companion/` in the new folder and that
      removing from the list leaves every file byte-identical.
- [x] 4.6 Independent adversarial review by a subagent that did not implement this change; resolve every
      blocker and major, record real minors. **FAIL: 1 blocker, 9 majors, 7 minors and a question. All
      resolved or recorded; the full verdict is in `evidence/independent-review.md`.**
- [x] 4.7 Capture the findings into the debt registry with the category each one actually has. **Two
      optional improvements, one defect resolved in this change, one duplicate of an item already tracked.
      Budget unchanged at 4/5.**

## 5. Closeout

- [x] 5.1 `openspec validate --all --strict` green. **20 of 20.**
- [x] 5.2 `readiness-check --phase archive` with 0 FAIL.
- [x] 5.3 Archive with the official CLI and write the seeded `## Purpose`.
- [x] 5.4 DCO-signed commits and a pull request against the protected branch, integrated by squash **only
      after `CI / required` is green**; nothing in this change touches that gate, branch protection or the
      installer's file list.
- [x] 5.5 Close the issue saying what was demonstrated and what was not.
