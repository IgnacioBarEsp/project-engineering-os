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
  the top-level entries against a closed list, the manifest fields that decide what runs, and the pinned core
  compared per file. Six bypass attempts were refused; an untouched copy passed.
- **Five browser journeys with the real renderer and engines: 0 findings**, including a recovery rehearsal
  driven from the interface.
- **18 deliberate mutations, 18 detected**, across 7 screens. Twelve of them exist because a review found
  them undetected: a duplicate name on a screen the harness never visited, a greeting reintroduced as a
  `<div>` or a `<details>`, `harness` as prose on the help screen, a term control opening another concept's
  definition, and contrast broken in the dialog and the sidebar.
- **Contrast, heading order, keyboard reach, accessible names and the vocabulary rule on 29 screens.** This
  found three real, pre-existing defects: Inicio, the folder step and the project screen all jumped from `h1`
  to `h3`.

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

## The review

An independent adversarial review returned **FAIL — 1 blocker, 5 majors, 8 minors**. The blocker was
Inicio's own opening sentence: it claimed the AI would understand your work from the first question, which
this project measured as a **tie** (15/15 against 15/15) and whose evidence page lists as not measured. That
sentence is gone and a test refuses nine families of that claim. Every blocker and major is resolved and
every minor addressed; `evidence/independent-review.md` keeps the verdict and everything that was wrong,
followed by what was done about each one.
