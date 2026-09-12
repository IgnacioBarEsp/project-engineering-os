# Validation — what was run, and what each run proves

Every command below was run on this branch, on the maintainer's Windows machine, against the installed
application or the shipping renderer. Nothing here was run against a mock of the interface.

This document was rewritten after an independent adversarial review returned FAIL. Where a claim here is
narrower than the one it replaces, that is deliberate: the review's finding was that several properties these
numbers were presented as evidence *for* were not the properties the checks measured.

## Repository checks

```
npm run check
```

`check:package`, `check:neutrality`, `check:docs`, `check:workflows`, `check:debt` and `node --test`:
**318 tests, 0 failures**. Ten of them are new:

- `test/companion-glossary.test.mjs` fails if `docs/companion/GLOSSARY.md` stops matching
  `apps/companion/ui/glossary.mjs`, if a term loses its short definition, if asking for an undefined term
  renders silently instead of throwing, or if a definition starts promising something undemonstrated.
- `test/companion-language.test.mjs` guards the blocker this change shipped and then removed. Inicio's
  opening sentence had ended "para que entienda tu trabajo desde la primera pregunta" — an outcome this
  project measured as a **tie** (15/15 grounded answers and 15/15 abstentions in both conditions, #94) and
  whose own evidence page lists model answer quality as not measured. The test refuses nine families of
  undemonstrated claim, verifies that nine specific sentences stating a limit are still present verbatim, and
  protects the construction that makes one-name-per-action unrepresentable to break. Reintroducing the exact
  sentence fails it, which was checked by mutating the file and restoring it.

```
node scripts/render-companion-glossary.mjs --check
```

OK: the published glossary is generated from the interface module, so the screen and the page cannot drift.

## Application unit tests

```
cd apps/companion && npm test
```

**82 tests, 0 failures** — 78 from `main` plus four new in `qa/project-list.mjs` covering the bound on the
project list's reads, the survival of a row's own error through the race, that one unreadable row does not
take the rest of the list, and that no absolute path travels in a row's cause.

## Five browser journeys with the real renderer and the real engines

```
cd apps/companion && npm run test:ui
```

Five profiles end to end: onboarding, the folder, the reviewed base and context writes, citations against a
PDF and a Word document, exclusions, recipes, the reviewed copy and handoff, closing and reopening, keyboard
focus return from a dialog, and CSS widths 1180, 768, 480 and 240. Only the native picker, clipboard,
launcher and IPC transport are injected.

What this change adds, reported in `browser-journeys.json`:

- **One name per action, across 9 navigable actions, collected on every screen the journey reaches.** The
  label lives in a closed action table and the button helper takes no label, so a declared action cannot
  carry two names. The check additionally fails if a declared action is missing from the page, if a control
  declares an action outside the closed set, or if the reachable set differs from the declared one. Two
  actions exist only with the managed toolchain, and the run records which of the two cases it was rather
  than reporting them missing.
- **The list is only the list, as a property rather than a selector list.** With entries on screen, the only
  text anywhere outside the project cards is the heading — every text node is walked, so a greeting
  reintroduced as a `<div>`, a `<details>` or an `<ol>` is caught, which the earlier `<p>`-and-class-names
  version was not.
- **The vocabulary rule, per screen.** For each of the 18 glossary terms, if its word appears on a screen
  outside a definition control, that screen must offer the control that opens it. Two words of this
  repository's jargon that have no definition — `harness`, `RAG` — must not appear at all. The whole
  document is inspected, including the persistent sidebar and an open dialog. The person's own text and
  generated content are excluded by kind, marked in the DOM: the check's first run reported `tokens` and
  `Contexto` because a fixture's goal and a generated prompt contained them.
- **336 definition controls checked against the term each one opens: 0 mismatches**, and a mismatched label
  now throws when the page is built.
- **Contrast, heading order, keyboard reach and accessible names on 29 screens** across the five profiles, at
  **0 findings** — see `keyboard-and-assistive-technology.md` for what that covers and what it does not.
  This found three real, pre-existing heading defects (Inicio, the folder step and the project screen all
  went from `h1` to `h3`), corrected here.
- **A recovery rehearsal for one transaction, driven from the interface.** For the general profile: undo the
  file reading, confirm the dialog states what undoing does before it is done, confirm the application then
  refuses to claim the reading, confirm the person's own files are byte-identical, then read again and
  confirm the state returns.

## The structural contract, tested against 18 reintroduced defects

```
cd apps/companion && npm run evidence:contract
```

**18 mutations, 18 detected, 0 findings on the baseline**, across 7 screens including the term-definition
dialog, the empty list and a refusing service (`interface-contract.json`). The first version of this harness
shipped seven; the independent review found twelve more that nothing on the branch detected, and those are
here with their probes widened to the property rather than the spelling:

| Mutation | Detected by |
| --- | --- |
| The navigation entry is renamed | the label lives with the action, so it cannot be broken in one place only |
| An action is offered under another name deeper in the wizard | `prepare-project` with two names |
| A control declares an action outside the closed set | `go-somewhere` undeclared |
| A greeting comes back as a `<p>`, a `<div>`, or a `<details>` | stray text outside a project card (three separate mutations) |
| Numbered steps come back as an `<ol>` | stray text outside a project card |
| A term appears on Inicio as prose | `openspec` in that screen's missing list |
| `harness` appears on the help screen | that screen's forbidden list |
| `inventario` and `perfil` appear on a screen with no control for them | that screen's missing list |
| A declared action is deleted from the page | `open-help` missing |
| The help screen stops listing every term | 5 of 18 entries |
| The project state text loses its contrast | 1.39:1 against 4.5:1 required |
| Contrast breaks inside the definition dialog | the dialog's own contrast list |
| Contrast breaks on the persistent navigation | `.nav-button` on every screen |
| A term stops being a button | terms present, none reachable by keyboard |
| A term control opens another concept's definition | the label/term comparison, and a throw when built |
| A control loses its accessible name | that screen's unnamed-control list |

Three of these were originally written against screens this harness cannot reach and were retargeted rather
than left as decorative passes; the wizard and the project screens are covered by the journey harness, which
walks real ones. One mutation — removing the topbar privacy control — was found to be a **wrong mutation**
rather than a missed detection: that action has a second control on Inicio, so the action was still offered
and reporting it missing would have been false.

## Five journeys through the installed application's own window

```
cd apps/companion && npm run evidence:native -- "<installed resources/app>" <evidence dir> [--sync-app]
```

**Five profiles, 0 findings, 10 unverified** (`native-journeys.json`), driven over the installed
application's debugging port against an isolated data directory, so a run never touches the projects or
history of whoever uses this machine.

The harness **refuses to run against a window that is not this branch**, and records what it compared:

- every file under `desktop/`, `ui/`, `engine/`, `context/` and `runtime/` — **47 files, 47 matched**, with
  **both digests recorded for every one of them**, matching or not. An earlier version recorded only
  mismatches, so a clean run named nothing;
- the installed application's top-level entries against a closed list — 0 unexpected;
- `package.json`'s name, version, type, main, exports, bin, files and dependencies — matching. The rest of
  that file is excluded because `removePackageScripts` and `removePackageKeywords` rewrite it by design;
- the **pinned core inside `node_modules`**, per file: 177 files, 0 differing, 0 missing, 0 only-installed,
  3 in the declared packager-prune list (`CHANGELOG.md`, `README.md`, a nested `package-lock.json`) and 2
  manifests compared by identity fields for the same reason. A single tree digest over the core was tried
  first and refused a correct installation over a pruned changelog, which is how a guard teaches a reader to
  ignore it;
- the branch commit and whether its tree was clean, so a reader can tell which source was measured.

The comparison now runs **before** the driver imports the installed modules. It did not before, so with
`--sync-app` the driver would keep measuring through pre-sync code while the window ran post-sync bytes.

Six bypass attempts were run against a byte-identical copy of the installed tree, with an untouched copy as
the control:

| Attempt | Result |
| --- | --- |
| A module added at the installed app root | refused |
| `package.json`'s `main` repointed at that module | refused |
| The pinned core modified inside `node_modules` | refused |
| An interface file modified | refused |
| A file added inside `ui/` | refused |
| A file removed from the pinned core | refused |
| Untouched control | passed, and reached the spawn |

The guard earned itself on its first run: syncing only the interface left the previous main process in
place, its asset allowlist refused the new interface module, and the window rendered nothing. A record taken
then would have described neither version.

What the window showed: the four destinations read off the page, a checkable citation per profile —
`articulo.pdf · página 1`, `README.md · línea 3`, `notas.txt · línea 1`, `ficha.docx · párrafo 1`,
`notas.txt · línea 1` — no horizontal overflow at 1180, 900 and 600 px, and **every one of the person's own
files byte-identical afterwards**. Three profiles keep their citation after closing and reopening; software
and Unity refuse it and the screen says why, which the check reads and records as correct behaviour while
silence stays a finding.

## Screenshots

`native-window.png`, `native-inicio.png`, `native-proyectos.png` and `native-ayuda.png` come from the
installed window. No check reads an image, so the anchoring is applied in the page before each capture and
to **every** path element rather than the first — the project list shows five. The record carries, per
capture, how many path elements were present, how many were rewritten and how many still carried a drive
letter or a users directory afterwards: `1/1/0`, `0/0/0`, `5/5/0`, `0/0/0`.

## What none of this proves

Named, with their causes, in `states-and-degradations.md`: nobody read the new language cold, no screen
reader and no assistive-technology user was involved, ten native stages stay unverified, the identity guard
covers what it names and no more, synchronising source into the installed tree is not a release, nobody used
the interface by hand, and the folder picker and the installer's own wizard pages still need a person.
