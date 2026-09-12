# Validation — what was run, and what each run proves

Every command below was run on this branch, on the maintainer's Windows machine, against the installed
application or the shipping renderer. Nothing here was run against a mock of the interface.

## Repository checks

```
npm run check
```

`check:package`, `check:neutrality`, `check:docs`, `check:workflows`, `check:debt` and `node --test`:
**308 tests, 0 failures**. That includes four new ones in `test/companion-glossary.test.mjs`, which fail if
`docs/companion/GLOSSARY.md` stops matching `apps/companion/ui/glossary.mjs`, if a term loses its short
definition, if asking for an undefined term renders silently instead of throwing, or if a definition starts
promising something the application has not demonstrated.

```
node scripts/render-companion-glossary.mjs --check
```

OK: the published glossary is generated from the interface module, so the screen and the page cannot drift.

## Application unit tests

```
cd apps/companion && npm test
```

**78 tests, 0 failures**, unchanged in count from `main`. They cover the packaged file allowlist, the
installer's own steps, the sealed npm distribution, download and archive verification, subprocess isolation,
receipt forgery and relocation.

## Five browser journeys with the real renderer and the real engines

```
cd apps/companion && npm run test:ui
```

Five profiles — research, software, Unity, media, general — end to end: onboarding, the folder, the reviewed
base and context writes, citations against a PDF and a Word document, exclusions, recipes, the reviewed copy
and handoff, closing and reopening, keyboard focus return from a dialog, and CSS widths 1180, 768, 480 and
240. Only the native picker, clipboard, launcher and IPC transport are injected; the renderer and engines are
the shipping ones.

Added in this change, and reported in `browser-journeys.json`:

- **One name per action across five navigable actions.** Every control that offers a navigable action
  declares which one, and the check fails if any action carries two different accessible names anywhere it
  appears, or if a declared action is missing from the page — so satisfying it by deleting a control does not
  work either.
- **The list is only the list.** With an entry on screen, no paragraph outside a project card and none of the
  home page's furniture.
- **No undefined vocabulary on Inicio.** After removing every control that opens a definition, the remaining
  prose contains no `harness`, `RAG`, `SDD`, `contexto`, `adversarial` or `OpenSpec`.
- **The glossary lists every defined term**, compared against the module rather than a hard-coded number.
- **Contrast, heading order and keyboard reach on every screen a click lands on**, in all five profiles, at
  0 findings. This found three real, pre-existing heading defects — Inicio went from `h1` straight to `h3`,
  and so did the folder step and the project screen — which are corrected in this change.

## The structural contract, tested against seven reintroduced defects

```
cd apps/companion && npm run evidence:contract
```

A check that survives reintroducing the defect proves nothing, so each property is also asserted against a
deliberate mutation of a copy of the interface. **7 mutations, 7 detected, 0 findings on the baseline**
(`interface-contract.json`). Each was caught by its own probe and by no other:

| Mutation | Detected by |
| --- | --- |
| The navigation entry is renamed while the body button keeps the old name | `prepare-project: "Preparar una carpeta" vs "Preparar proyecto"` |
| A greeting comes back into the project list | one stray paragraph and `.intro` furniture |
| A term appears on Inicio as prose instead of a control | `OpenSpec` in the undefined-vocabulary list |
| A declared action is deleted from the page | `open-help` missing |
| The help screen stops listing every term | 5 of 18 entries |
| The project state text loses its contrast | 1.39:1 against 4.5:1 required, on `.project-state` |
| A term stops being a button and becomes text | 4 terms present, 0 reachable by keyboard |

## Five journeys through the installed application's own window

```
cd apps/companion && npm run evidence:native -- "<installed resources/app>" <evidence dir> [--sync-app]
```

**Five profiles, 0 findings, 10 unverified** (`native-journeys.json`), driven over the installed
application's debugging port against an isolated data directory, so a run never touches the projects or
history of whoever uses this machine.

New in this change: the harness **refuses to run against a window that is not this branch**. It compares the
SHA-256 of every file under `desktop/`, `ui/`, `engine/`, `context/` and `runtime/` — 47 files — and stops
unless they all match, recording the comparison either way. `--sync-app` copies the branch's bytes in and
records what they replaced. `package.json` is excluded because the packager rewrites it by design.

That guard earned itself on the first run: syncing only the interface left the previous main process in
place, its asset allowlist refused the new interface module, and the window rendered nothing. A record taken
then would have described neither version.

What the window showed: the four destinations read off the page (`Inicio`, `Tus proyectos`,
`Preparar proyecto`, `Ayuda`), a checkable citation per profile — `articulo.pdf · página 1`,
`README.md · línea 3`, `notas.txt · línea 1`, `ficha.docx · párrafo 1`, `notas.txt · línea 1` — no horizontal
overflow at 1180, 900 and 600 px, and **every one of the person's own files byte-identical afterwards**.

Three profiles keep their citation after closing and reopening. Software and Unity refuse it, and the screen
says why: preparing the development tools writes into the folder, so a context that noticed its sources
changed is right to decline until it is regenerated. The check reads the reason and records a refusal with a
stated cause as correct, while silence stays a finding.

## Screenshots

`native-window.png`, `native-inicio.png`, `native-proyectos.png` and `native-ayuda.png` come from the
installed window. No check reads an image, so the anchoring is applied in the page before each capture and to
**every** path element rather than the first one — the project list shows five. The record carries, per
capture, how many path elements were present, how many were rewritten and how many still carried a drive
letter or a users directory afterwards: `1/1/0`, `0/0/0`, `5/5/0`, `0/0/0`.

## What none of this proves

The installer's own wizard pages and the operating system's folder picker still need a person; that was
established by measurement in #94 and is unchanged here. The native window still does not exercise the
engineering apply, the OpenSpec activation or the code map: the application refuses a plan that went stale
while another stage ran, which is correct behaviour, and the review control is not on the screen the harness
can reach. Ten stages stay unverified with their cause, the same ten as the archived baseline.

Syncing the installed tree is not a release. A distributable installer still comes from `npm run pack` on a
clean commit, and this change does not rebuild or republish one.

Two of the issue's criteria need a person who has never seen the application. Nobody read it cold. Both are
unverified with their cause, and [the protocol](../../../../docs/companion/COLD_READING.md) to run them in a
few minutes ships with the change.
