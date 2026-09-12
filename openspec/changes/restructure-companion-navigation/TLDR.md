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
  makes "one name per action" satisfiable instead of merely satisfied — every control that starts it carries
  that exact name.
- **`Inicio` is the welcome it never had**: one plain sentence, how it works in four steps, and the section
  the application was missing entirely — **what gets downloaded and why**. Nothing for documents, creative
  work or general projects; a reviewed, hash-pinned toolchain for software and Unity; never a model.
- **`Tus proyectos` is only the list.** Each entry shows its recorded state and says that it is recorded.
  Two new read-only summaries read each stage's receipt without re-inspecting the folder, because verifying
  every row properly would make the list the slowest screen in the application.
- **`Ayuda` is new**: the method in plain words plus an 18-term glossary. Every technical term that survives
  on screen is a control that opens its own definition where it appears, and `docs/companion/GLOSSARY.md` is
  generated from the same module, so the screen and the page cannot drift.
- **"Preparar contexto para compartir" is now "Preparar un texto para pegar en tu chat."**

## What was measured

- **Five profiles through the installed application's own window: 0 findings.** The harness now refuses to
  run against a window that is not this branch — it compares the digest of all 47 source files and stops if
  any differ. That guard earned itself immediately: syncing only the interface left the previous main
  process, whose asset allowlist refused the new module, and the window rendered nothing.
- **Five browser journeys with the real renderer and engines: 0 findings**, plus four new structural checks.
- **Seven deliberate mutations, seven detected.** Rename the nav entry and keep the body button, put a
  greeting back in the list, turn a term into prose, delete a declared action, truncate the glossary, wreck
  the state text's contrast, turn a term into a `<span>` — each is caught by its own probe and by no other.
- **Contrast, heading order and keyboard reach on every screen a click lands on.** This found three real,
  pre-existing defects: Inicio, the folder step and the project screen all jumped from `h1` to `h3`. Fixed.

## What it does not demonstrate

**Nobody read it cold.** Two of the issue's criteria ask a person who has never seen the application to read
the new name and the new home and say what they understood. No person did, and no agent was put in their
place — what is being measured is precisely whether the language works on someone who did not read this
repository. Both criteria are unverified with that cause, and
[`docs/companion/COLD_READING.md`](../../../docs/companion/COLD_READING.md) is the protocol to run them in a
few minutes.

Ten native stages stay unverified with their cause — the same ten as the archived baseline. The application
refuses a plan that went stale while another stage ran, which is correct behaviour, and the review control is
not on the screen the harness can reach.

Syncing source into the installed tree is not a release. No installer was rebuilt and nothing was published;
the core stays at 0.5.0.

The independent adversarial review's verdict, including what it found wrong, is in
`evidence/independent-review.md`.
