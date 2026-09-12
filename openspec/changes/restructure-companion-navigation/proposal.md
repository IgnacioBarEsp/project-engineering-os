## Why

Issue [#97](https://github.com/IgnacioBarEsp/project-engineering-os/issues/97).

The maintainer walked the installed application and found four concrete faults. Two sidebar entries with
different names start the same action. "Tus proyectos" is not the project list — it is a home page with a
greeting, three explanatory steps, and the projects last. "Preparar contexto para compartir" was read aloud
as "no sé para qué sirve este apartado". And the interface speaks the vocabulary of the person who wrote it:
`harness`, "revisión adversarial", "contexto preparado", "lo que sí se afirma y lo que no".

The defensive tone came from a correct discipline — three adversarial reviews punished claims without
evidence — applied in the wrong place. Honesty does not require aridity. The rule this change follows is
that the **vocabulary and the defensiveness go, the truth stays**: an undemonstrated benefit is dropped or
measured, never softened until it reads as true.

## What Changes

- Four navigation destinations, each with a job no other one has: `Inicio`, `Tus proyectos`,
  `Preparar proyecto`, `Ayuda`. One name per action, and the button that starts the wizard carries exactly
  the destination's name wherever it appears.
- `Inicio` becomes the welcome: one sentence a person understands, how the application works, what gets
  downloaded and why, what stays on this machine, and the one action that starts.
- `Tus proyectos` becomes only the list. Each entry shows its recorded state, and says that a recorded
  state is not a verified one.
- `Ayuda` is new: the method in plain words plus a glossary. Every technical term the interface still needs
  is a control that opens its own definition where it appears, and all of them are collected in the glossary.
- "Preparar contexto para compartir" is renamed to what it does. Two of the issue's criteria ask a person
  who does not know the application to read the new name and the new home cold. **No person did.** Both are
  recorded as unverified with their cause, and the protocol for the maintainer to run them in a few minutes
  ships with the change rather than being described.
- The five native journeys and the browser journeys are updated in the same change, and the native check now
  refuses to run against a window whose interface does not match the branch.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `companion-experience`: adds the navigation contract, the plain-language contract and the glossary
  obligation to the existing experience capability.

## Impact

`apps/companion/ui`, a read-only summary added to the desktop service and its two engines, the asset
allowlist in the Electron main process, `docs/companion/EXPERIENCE.md`, a new glossary document and the two
journey checks. No change to the published core 0.5.0, the required CI gate `CI / required`, branch
protection, the installer's file allowlist or any security boundary: the new interface file is added to the
existing allowlist explicitly rather than by widening it.

Risk: the language rewrite touches nearly every string, so selectors in the existing checks break. That is
mitigated by updating both journey checks in this change and by running them against the installed
application. Second risk: warmth drifting into a claim. Mitigated by the decision rule above, by keeping
every existing limit sentence, and by an independent adversarial review that looks for exactly that.

Rollback reverts the pull request. The interface returns to its previous structure; no prepared project,
history entry or downloaded tool is touched, because nothing in this change writes into a person's folder.

The maintainer delegated implementation, testing, DCO commits, independent adversarial review and protected
integration for this scope. That delegation does not extend to standing in for a person who has never seen
the application: the two criteria that require a cold human reader stay unverified, with the protocol to run
them, and nothing in this change claims a usability study.
