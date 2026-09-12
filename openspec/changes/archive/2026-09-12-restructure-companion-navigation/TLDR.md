# TLDR

**Use this if:** you want to know what changed in the Companion's structure and language, and what is still
unproved about it.

The maintainer walked the installed application and found four things. Two sidebar entries with different
names started the same action. "Tus proyectos" was not the list — it was a home page with a greeting, three
steps, and the projects last. "Preparar contexto para compartir" got the verdict "no sé para qué sirve este
apartado". And the interface spoke the vocabulary of whoever wrote it.

## What it does

- **Four destinations, each with a job no other one has.** `Inicio`, `Tus proyectos`, `Preparar proyecto`,
  `Ayuda`. The open question in the issue is answered: the wizard is a permanent destination, which is what
  makes "one name per action" satisfiable rather than merely satisfied.
- **One name per action, by construction.** The label lives in a closed table of eleven actions and the
  button helper takes no label, so a declared action cannot carry a second name. That is the second version:
  the first passed a label in, and an independent review then enumerated **six** labels reaching the project
  screen and **three** reaching the file reading. Eight labels were unified.
- **`Inicio` is the welcome it never had**: one plain sentence, how it works in four steps, and the section
  the application was missing entirely — **what gets downloaded and why**. Nothing for documents, creative
  work or general projects; a reviewed, hash-pinned toolchain for software and Unity; never a model.
- **`Tus proyectos` is only the list.** Each entry shows its recorded state, says it is recorded at the same
  text size as the state itself, and carries the cause the service gave when a row cannot be read. The reads
  are bounded at 1500 ms per row, because an unreachable network share froze the screen for 21 seconds.
- **`Ayuda` is new**: the method in plain words plus an 18-term glossary. Every technical word is a control
  that opens its definition **on the screen where the word appears**, and `docs/companion/GLOSSARY.md` is
  generated from the same module so the two cannot drift.
- **"Preparar contexto para compartir" is now "Preparar un texto para pegar en tu chat."**

## What was measured

- **Five profiles through the installed application's own window: 0 findings.** The harness refuses to run
  against an installation that is not this branch: 47 source files with both digests recorded either way,
  the top-level entries against a closed list, the manifest fields that decide what runs including `imports`,
  the application's own dependency closure file by file, the presence of every one of the 149 installed
  packages, the Electron runtime payload the window runs on, and the sealed npm archive by digest.
  **Twelve bypass attempts were refused**; an untouched copy passed.
- **Five browser journeys with the real renderer and engines: 0 findings**, including a recovery rehearsal
  driven from the interface.
- **23 deliberate mutations, 23 detected by the property each one names**, across 9 screens, plus one
  construction probe that held. Sixteen of them exist because a review found them undetected — a duplicate
  name on a screen the harness never visited, a greeting as a `<div>` or a `<details>`, `harness` as prose on
  the help screen, a term reaching a screen through a `placeholder` or an `aria-label`, a declared action
  renamed only for a screen reader or duplicated inside a dialog, contrast broken in the dialog and the
  sidebar, and the window losing the stated cause of its own worst failure.
- **Contrast, heading order, keyboard reach, accessible names and the vocabulary rule on 29 screens**, each
  reporting a non-zero denominator so a vacuous pass is refused. This found four real, pre-existing defects:
  Inicio, the folder step and the project screen all jumped from `h1` to `h3`, and four navigation entries
  broke mid-word at the minimum viewport.

## What it does not demonstrate

**Nobody read it cold.** Two of the issue's criteria ask a person who has never seen the application to read
the new name and the new home and say what they understood. No person did, and no model was put in their
place — what is being measured is precisely whether the language works on someone who did not read this
repository. Both are unverified with that cause, and
[`docs/companion/COLD_READING.md`](../../../docs/companion/COLD_READING.md) is the protocol to run them.

**No screen reader was driven, and no person who relies on assistive technology used the application.** The
machine-observable half is verified on 29 screens; `evidence/keyboard-and-assistive-technology.md` states
where the line is.

Ten native stages stay unverified with their cause — the same ten as the archived baseline. Synchronising
source into the installed tree is not a release: no installer was rebuilt, nothing was published, and the
core stays at 0.5.0. Nobody used the interface by hand.

## Two independent reviews, both FAIL, both resolved

The first returned **FAIL — 1 blocker, 5 majors, 8 minors**. The blocker was Inicio's own opening sentence:
it claimed the AI would understand your work from the first question, which this project measured as a
**tie** (15/15 against 15/15) and whose evidence page lists as not measured. That sentence is gone, and it is
now pinned to its exact reviewed text so it can only change on purpose.

A second independent session then re-verified that resolution and returned **FAIL — 6 more majors, 6 more
minors**, because two of the widest claims were only partly true: a glossary word could still reach a screen
with no control for it through a `placeholder`, an `aria-label` or a class that also styled interface prose,
and a declared action could still be offered under a second name through a form submit, inside a dialog, or
through an `aria-label`. All six routes are closed. It also found three mutations "detected" by a harness
timeout rather than by their own probe, a record naming a commit that did not contain the bytes it measured,
a published test count that was computed instead of read, and a debt classification shaped to the budget.

That last one is worth naming: refiling it honestly took the plan to **7 of 5 units and paused it**. The
pause was correct. One item was resolved by doing the work, two were refuted as double-counts of a finding
the registry already held, and one was refuted by reading the criterion instead of a broadened version of it.
The plan is back to 4 of 5 with every step argued.

`evidence/independent-review.md` keeps both verdicts and everything that was wrong, each followed by what
was done about it.
