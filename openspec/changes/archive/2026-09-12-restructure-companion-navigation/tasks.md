## 1. Baseline and readiness

- [x] 1.1 Read the installed application, the interface source and the two journey harnesses; record the
      baseline from the code rather than from summaries. `brownfield-baseline.md` locates each of the
      maintainer's four findings at a line of `app.mjs` or `service.mjs`.
- [x] 1.2 Enrich issue #97 and pass Definition of Ready with zero FAIL. **13 PASS, 0 FAIL.**
- [x] 1.3 Record the scope under the maintainer's existing delegation, and name the two criteria that need a
      person before any work claims to cover them. Named in the issue, the proposal, the design, this list,
      `TLDR.md` and `docs/companion/COLD_READING.md`; the delegation explicitly does not extend to standing
      in for a cold reader.

## 2. Structure

- [x] 2.1 Four navigation destinations, each owning a job no other one has. `Inicio`, `Tus proyectos`,
      `Preparar proyecto`, `Ayuda`, read off the installed window rather than asserted from the source
      (`native-journeys.json` → `navigation`).
- [x] 2.2 `Inicio`: one plain sentence, how it works, what is downloaded and why, what stays on this machine,
      one action. No project list. The opening sentence was rewritten after an independent review refused an
      earlier draft that claimed an outcome this project measured as a tie; `test/companion-language.test.mjs`
      now refuses nine families of that claim.
- [x] 2.3 `Tus proyectos`: only the list, each entry with its recorded state and with the word "recorded"
      carried, not implied — and at the same text size as the state it qualifies. Two read-only summaries
      read each stage's receipt, bounded per row at 1500 ms.
- [x] 2.4 `Ayuda`: the method in plain words plus the glossary, 18 terms, generated into
      `docs/companion/GLOSSARY.md` from the same module so screen and page cannot drift.
- [x] 2.5 One name per action. The label lives in a closed action table and the button helper takes no
      label, so a declared action cannot carry a second name. **Eleven actions**; eight labels unified after
      a review enumerated six reaching the project screen and three reaching the file reading.

## 3. Language

- [x] 3.1 Rewrite every interface string to the three rules, keeping every limit sentence intact. Nine of
      those sentences are asserted present verbatim by a test, so the guard cannot be satisfied by deleting
      the honest half.
- [x] 3.2 Rename "Preparar contexto para compartir" to what it does: **"Preparar un texto para pegar en tu
      chat"**. Whether a cold reader understands it is task 4.4 and is **not** verified.
- [x] 3.3 Glossary module with one definition per term, reachable as a control from **every screen where the
      word appears**, and collected under `Ayuda`. A control naming one term and opening another throws when
      the page is built; 336 controls were compared against the term they open, 0 mismatches.

## 4. Evidence

- [x] 4.1 Native journeys: **five profiles, 0 findings, 10 unverified**, in the installed window, with the
      window proved to be running this branch by digest — 47 files with both digests recorded, the top-level
      entries, the manifest fields that decide what runs, and the pinned core per file. Six bypass attempts
      refused, untouched control passed.
- [x] 4.2 Browser journeys updated to the new structure and passing on five profiles, plus **18 mutations,
      18 detected** in the structural contract harness across 7 screens.
- [x] 4.3 Contrast, heading order, keyboard navigation, accessible names and the vocabulary rule verified on
      **29 screens** across the five profiles, 0 findings. Found and fixed three pre-existing `h1`→`h3`
      jumps. Scope and limits in `evidence/keyboard-and-assistive-technology.md`.
- [~] 4.4 A cold-reading protocol for the two human criteria, shipped runnable, with both criteria recorded
      unverified until a person runs it. `docs/companion/COLD_READING.md` ships the exact questions, the pass
      condition, the recording format and the rule that a failing answer is fixed by changing the screen.
      **Nobody has run it.** Both criteria are unverified with that cause; no model was put in a person's
      place.

## 5. Closeout

- [x] 5.1 Independent adversarial review by a session that did not implement this. It returned **FAIL — 1
      blocker, 5 majors, 8 minors**, reproducing every harness itself and mutating the code seventeen times,
      twelve of which nothing on the branch detected. All six blocker/major findings are resolved and all
      eight minors addressed; `evidence/independent-review.md` keeps the verdict and everything that was
      wrong, followed by what was done about each one.
- [x] 5.2 Capture debt, classify each finding by what it is, and keep the plan's verdict honest.
- [x] 5.3 `readiness-check --phase archive` at zero FAIL, archive through the official OpenSpec CLI, and
      write the seeded `## Purpose`.
- [x] 5.4 Protected pull request, CI green, squash merge, and close #97 saying what was demonstrated and what
      was not.
