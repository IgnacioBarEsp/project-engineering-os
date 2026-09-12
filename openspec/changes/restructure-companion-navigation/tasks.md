## 1. Baseline and readiness

- [ ] 1.1 Read the installed application, the interface source and the two journey harnesses; record the
      baseline from the code rather than from summaries.
- [ ] 1.2 Enrich issue #97 and pass Definition of Ready with zero FAIL.
- [ ] 1.3 Record the scope under the maintainer's existing delegation, and name the two criteria that need a
      person before any work claims to cover them.

## 2. Structure

- [ ] 2.1 Four navigation destinations, each owning a job no other one has.
- [ ] 2.2 `Inicio`: one plain sentence, how it works, what is downloaded and why, what stays on this machine,
      one action. No project list.
- [ ] 2.3 `Tus proyectos`: only the list, each entry with its recorded state and with the word "recorded"
      carried, not implied.
- [ ] 2.4 `Ayuda`: the method in plain words plus the glossary.
- [ ] 2.5 One name per action: rename the wizard's apply button off the destination's name and prove by check
      that no action is reachable under two different navigation names.

## 3. Language

- [ ] 3.1 Rewrite every interface string to the three rules, keeping every limit sentence intact.
- [ ] 3.2 Rename "Preparar contexto para compartir" to what it does.
- [ ] 3.3 Glossary module with one definition per term, reachable as a control from where each term appears
      and collected under `Ayuda`.

## 4. Evidence

- [ ] 4.1 Native journeys: five profiles, zero findings, in the installed window, with the window proved to
      be running this branch's interface by digest.
- [ ] 4.2 Browser journeys updated to the new structure and passing on five profiles.
- [ ] 4.3 Contrast, heading order, keyboard navigation and reflow verified on the new screens.
- [ ] 4.4 A cold-reading protocol for the two human criteria, shipped runnable, with both criteria recorded
      unverified until a person runs it.

## 5. Closeout

- [ ] 5.1 Independent adversarial review by a session that did not implement this; resolve every Blocker and
      Major, record real Minor findings including what was wrong.
- [ ] 5.2 Capture debt, classify each finding by what it is, and keep the plan's verdict honest.
- [ ] 5.3 `readiness-check --phase archive` at zero FAIL, archive through the official OpenSpec CLI, and
      write the seeded `## Purpose`.
- [ ] 5.4 Protected pull request, CI green, squash merge, and close #97 saying what was demonstrated and what
      was not.
