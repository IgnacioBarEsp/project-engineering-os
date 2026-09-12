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
**316 tests, 0 failures** — read off the command, not computed. Twelve of them are new:

- `test/companion-glossary.test.mjs` fails if `docs/companion/GLOSSARY.md` stops matching
  `apps/companion/ui/glossary.mjs`, if a term loses its short definition, if asking for an undefined term
  renders silently instead of throwing, or if a definition starts promising something undemonstrated.
- `test/companion-language.test.mjs` guards the blocker this change shipped and then removed. Inicio's
  opening sentence had ended "para que entienda tu trabajo desde la primera pregunta" — an outcome this
  project measured as a **tie** (15/15 grounded answers and 15/15 abstentions in both conditions, #94) and
  whose own evidence page lists model answer quality as not measured. It pins that sentence to its exact reviewed text, because a second review passed three near-variants
  through a pattern list — "para que tu IA trabaje mejor con tu proyecto", "para que acierte más", "para que
  no se pierda entre tus archivos" — and a golden text can only be changed on purpose. All three now fail.
  It also refuses nine families of undemonstrated claim across the rest of the interface, verifies that nine
  sentences stating a limit are present **in the interface text with comments stripped** (the same review
  moved one into a `//` comment and six tests still passed), guards the four construction paths that could
  offer a declared action under a second name, and refuses a person-content marker wrapped around a literal
  the interface wrote.

```
node scripts/render-companion-glossary.mjs --check
```

OK: the published glossary is generated from the interface module, so the screen and the page cannot drift.

## Application unit tests

```
cd apps/companion && npm test
```

**82 tests, 0 failures** on Windows, Linux and macOS.

The macOS run of CI found the one thing three local runs could not, and it was the test that was wrong
rather than the product. `os.tmpdir()` on macOS is `/var/folders/…`, a symlink to `/private/var/folders/…`,
and the preparation engine refuses a folder reached through a link. The new test handed it that path and CI
answered **"La carpeta seleccionada pasa por un vínculo."** — a refusal with a stated cause, which is the
security property working. The test resolves the link first now, the way every other harness in that
directory already did. Reading what the failure said before deciding what was broken is what kept this from
becoming a change to the engine.

The same reading pass found a latent flaw in `withBudget` that was **not** the cause: the timeout was
`unref`'d, and when the read it bounds has stopped answering that timer is the only thing that can settle
the race, so an empty event loop could let the process exit before the bound fires. It is no longer
`unref`'d; it is cleared as soon as the work settles, so it can outlive the operation by at most the budget.

**82 tests** — 78 from `main` plus four new in `qa/project-list.mjs` covering the bound on the
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
- **Contrast, heading order, keyboard reach, accessible names and the vocabulary rule on 29 screens** across
  the five profiles, at **0 findings**, each screen reporting a non-zero denominator so a vacuous pass is
  refused: 21–120 elements measured for contrast, 452–2893 characters read for the vocabulary rule, 6–27
  controls inspected — see `keyboard-and-assistive-technology.md` for what that covers and what it does not.
  This found three real, pre-existing heading defects (Inicio, the folder step and the project screen all
  went from `h1` to `h3`), corrected here.
- **A recovery rehearsal for one transaction, driven from the interface.** For the general profile: undo the
  file reading, confirm the dialog states what undoing does before it is done, confirm the application then
  refuses to claim the reading, confirm the person's own files are byte-identical, then read again and
  confirm the state returns.

## The structural contract, tested against 23 reintroduced defects

```
cd apps/companion && npm run evidence:contract
```

**23 mutations, 23 detected by the property each one names, 0 findings on the baseline**, across 9 screens
including the term-definition dialog, the privacy dialog, the minimum equivalent viewport, the empty list, a
refusing service and the window with its module chain broken (`interface-contract.json`).

Three generations of this harness. The first shipped seven mutations; the first independent review found
twelve more that nothing on the branch detected. The second review then found that three of the eighteen were
"detected" by a thirty-second harness timeout rather than by the probe they name, with their `observed` fields
`null`. Two structural corrections came out of that:

- **Navigation is structural, observation is by name.** The harness moves between screens by `[data-action]`
  selector, so renaming a label no longer breaks the harness's own navigation and the rename can be observed.
  A screen that cannot be reached is recorded rather than fatal.
- **An exception is never a detection.** A mutation that makes a probe impossible to evaluate is recorded as
  NOT detected and fails the run, because a regression in the probe would look identical.

One item moved out of the mutation list entirely. Renaming a label in the action table is not a defect — it
renames every control at once, which is the construction working — so counting it as a detected mutation
inflated the total with a case where there was nothing to detect. It is now a **construction probe** with its
own count: 1 probe, 1 held.

What the 23 cover, beyond the eighteen already listed in the first round: a declared action offered under a
second name that only assistive technology hears (`aria-label`), a declared duplicate inside a dialog, a
glossary word reaching a screen through a `placeholder`, the same through an `aria-label` present on every
screen, and the boot shell losing its stated cause.

## Five journeys through the installed application's own window

```
cd apps/companion && npm run evidence:native -- "<installed resources/app>" <evidence dir> [--sync-app]
```

**Five profiles, 0 findings, 10 unverified** (`native-journeys.json`), driven over the installed
application's debugging port against an isolated data directory, so a run never touches the projects or
history of whoever uses this machine.

The harness **refuses to run against an installation that is not this branch**, and records what it compared:

| What | Result |
| --- | --- |
| Every file under `desktop/`, `ui/`, `engine/`, `context/`, `runtime/` | **47 compared, 47 matched**, with both digests recorded for every one |
| Top-level entries of the installed application | against a closed list, 0 unexpected |
| `package.json` name, version, type, main, exports, **imports**, bin, files, dependencies | matching |
| The application's own dependency closure, file by file | 5 packages, **137 loadable files**, 0 differing |
| Presence of every other installed package | 149 installed, 144 presence-only, **0 unknown** |
| The **Electron runtime payload** the window runs on | **68 files compared, 0 differing, 0 missing** |
| The sealed npm archive | digest matching |

Scope is stated rather than implied. Excluded, each with its reason recorded in the run: the renamed
executable and its rewritten icon, version resource and licence; Electron's placeholder application, which
the packager replaces with this one; the rest of `package.json`, which `removePackageScripts` and
`removePackageKeywords` rewrite; the files of packages outside the application's own closure, which are
npm's tree hoisted there by the packager's deduplication and whose integrity is the sealed archive's digest;
and the contents of that archive, verified at use time by the application's own extractor against the pinned
whole-tree digest, which is the mechanism from #87 and #80.

Two corrections the reviews forced on this guard, both of which made it weaker before they made it right:

- A single tree digest over the pinned core refused a **correct** installation, because the packager prunes
  changelogs, readmes and lockfiles. So the comparison is by what Node can load — `.js`, `.mjs`, `.cjs`,
  `.json`, `.node`, `.wasm`, minus declared lockfiles — and everything else is recorded rather than refused.
- Comparing every installed package **by name** also refused a correct installation, with 1598 files of
  `npm` and 75 type declarations of `pdfjs-dist`: the packager hoists, and npm's vendored copies are
  different versions of names the branch also has at top level. So the file comparison is scoped to the
  closure the application itself imports, and presence is checked for everything.

**Twelve bypass attempts, twelve refused**, against a copy of the whole program directory with an untouched
copy as the passing control:

| Attempt | Result |
| --- | --- |
| An interface file modified | refused |
| A file added inside `ui/` | refused |
| An extra module at the installed app root | refused |
| `main` repointed at that module | refused |
| An `imports` map added to the installed manifest | refused |
| The pinned core modified | refused |
| `fflate` modified, which the parser worker imports | refused |
| A whole new package added | refused |
| An Electron runtime library replaced | refused |
| The sealed npm archive replaced | refused |
| A file removed from the pinned core | refused |
| A source file differing only in line endings | refused |
| Untouched control | passed, and reached the spawn |

The guard earned itself on its first run: syncing only the interface left the previous main process in
place, its asset allowlist refused the new interface module, and the window rendered nothing. A record taken
then would have described neither version.

**The archived run names commit `cb257fa` with a clean tree**, which is the commit that contains the
measured bytes. Committing this evidence afterwards moves `HEAD`, but it changes no file the guard compares:
the 47 source digests, the closure, the runtime payload and the manifest fields are all identical at
`cb257fa` and at the commit that adds these records, which is why the run was done from a clean tree
before them rather than after.

**The commit is recorded only when the tree that produced it was clean.** A second review found this field
naming `1bf3de4` beside a digest that equalled HEAD's working tree: the run had happened before the fixes
were committed. A dirty tree now records no commit at all, with `measuredSource: working tree
(uncommitted)`, the reason in `branchCommitWithheld`, and the commit at capture time in a separate field
that does not claim to contain the bytes.

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

## The debt gate, which paused the plan and was right to

Classifying the findings honestly took the plan to **7 of 5 units** and paused it, with a second trigger
saying a remediation may not introduce new debt. Both were true. What the gate demanded is an investigation
of each item, and that is what happened:

- **The guard's scope** was real debt, so it was **resolved by doing the work**: the Electron runtime
  payload, the application's dependency closure, the presence of every installed package, the sealed
  archive, `imports`, and the root entries are all compared now, and twelve bypasses are refused.
- **Ten native stages unverified** turned out to be the same finding the registry already holds from #94's
  remediation. Filing it again under a new title counted it twice. Both re-filings are **refuted** with that
  reasoning and the recurrence is recorded as an occurrence on the existing item, which is what makes the
  recurrence trigger able to see it.
- **Accessibility beyond the machine-observable half** was **refuted by reading the criterion** instead of a
  broadened version of it. The issue's seventh criterion asks for contrast, heading order, keyboard
  navigation and reflow on the new screens; all four are verified on 29 screens, each with a mutation that
  breaks it. The criterion does not ask for a screen reader. That absence is a declared limit of the evidence
  document, written in its own section, not a shortfall against the criterion.

The plan is back to **4 of 5** with each step argued in `.project-os/debt/assessments/`. The pause is history
in the registry rather than something tidied away, and the first assessment stands as filed: the registry
does not let an item's category be edited, and a misclassification is corrected by refuting the entry and
saying why, not by rewriting it.

## What none of this proves

Named, with their causes, in `states-and-degradations.md`: nobody read the new language cold, no screen
reader and no assistive-technology user was involved, ten native stages stay unverified, the identity guard
covers what it names and no more, synchronising source into the installed tree is not a release, nobody used
the interface by hand, and the folder picker and the installer's own wizard pages still need a person.
