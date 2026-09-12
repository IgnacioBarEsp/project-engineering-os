# States, degradations and the decisions that drifted

The three records `readiness.json` points at for `loading-empty-error-and-constrained-connectivity-states`,
`review-of-declared-degradations` and `recorded-drift-decisions`. They are here rather than folded into
`validation.md` because an independent review checked and found that document contained none of them.

## Loading, empty, error and constrained connectivity

Driven in `npm run evidence:contract`, against the real renderer with the service replaced by fixed answers,
and reported under `states` in `interface-contract.json`.

| State | How it was produced | What the screen does |
| --- | --- | --- |
| **Loading** | Every operation goes through `run()`, which disables every control and sets `aria-busy` on the main region; `#activity` appears with the step's own name and a `Detener` button whenever the engine reports progress. | Driven throughout both journey harnesses: each click waits for `aria-busy` to clear before the next, so a screen that never settles fails the run instead of being clicked through. |
| **Empty** | The project list with an empty history. | "Aún no hay proyectos en esta lista." plus the one action that starts — asserted, not assumed (`states.empty.offersTheAction`). |
| **Error** | `listProjects` refused with `HISTORY_INVALID`. | The `role="alert"` panel appears with the message and the recovery action, and the destination still renders (`states.error.feedbackVisible`). |
| **Constrained connectivity** | A row whose folder is on a network path that does not answer. | The row reads "Esta carpeta no respondió a tiempo. Puede estar en una unidad de red o desconectada. Ábrelo para comprobarlo.", the other rows render normally, and the whole list is bounded by 1500 ms rather than by the operating system's share timeout (`states.unreachableRowShowsItsCause`). |
| **The window cannot load its own module** | The static server refused `glossary.mjs`, which `app.mjs` imports. | The shell in `index.html` says what happened, that nothing was written to disk, and what to do — and the renderer removes it on its first render. Before this round the same failure left an empty panel with no navigation and no stated cause, which a second review found by breaking the module chain on purpose. |

That last one is a defect this change introduced and then fixed. Reading a receipt per row is a filesystem
call, and an independent review measured **21 047 ms** for a two-row list with one project on an unreachable
share — the whole window frozen, every control disabled, no indicator and no `Detener` on screen, where
`main` did no folder I/O at all on that screen. The reads are now bounded per row and run concurrently, so
the screen is bounded by the budget. `apps/companion/qa/project-list.mjs` tests the bound itself, the
survival of a row's own error through the race, and that one broken row does not take the rest of the list.

## Declared degradations

Each of these is a thing this change does not demonstrate, with the cause rather than a silence.

1. **Nobody read the new language cold.** Two of the issue's criteria ask a person who has never seen the
   application to read the new export name and the new home and say what they understood. No person did, and
   no model was put in their place — what is being measured is precisely whether the language works on
   someone who did not read this repository. `docs/companion/COLD_READING.md` ships the protocol, the exact
   questions, the pass condition and the recording format.
2. **No assistive technology was driven by a person, and no screen reader at all.** The machine-observable
   half is verified on 29 screens; `keyboard-and-assistive-technology.md` states the line.
3. **Ten native stages stay unverified**, the same ten as the archived baseline, with the same causes: the
   application refuses a plan that went stale while another stage ran — it says "Vuelve a revisar los
   cambios antes de aplicarlos", which is correct — and the review control is not on the screen the harness
   can reach. The capability itself is covered by the service-layer journeys from #81.
4. **The identity guard covers what it names and no more.** It compares every file under `desktop/`, `ui/`,
   `engine/`, `context/` and `runtime/`; the installed application's top-level entries against a closed list;
   `package.json`'s name, version, type, main, exports, imports, bin, files and dependencies; the
   application's own dependency closure file by file; the presence of every other installed package; the
   Electron runtime payload the window runs on; and the sealed npm archive by digest. **Twelve** bypass
   attempts were run against a copy of the whole program directory and all twelve were refused; the
   untouched control passed. What it does not compare, each with its reason recorded in the run: the renamed
   executable and its rewritten icon, version resource and licence; Electron's placeholder application; the
   rest of `package.json`; the files of packages outside the closure, which are npm's tree and whose
   integrity is the sealed archive's digest; and that archive's contents, which the application's own
   extractor verifies against the pinned whole-tree digest when it uses them.
5. **Synchronising source into the installed tree is not a release.** No installer was rebuilt and nothing
   was published. A distributable artifact still comes from `npm run pack` on a clean commit, and the
   maintainer's machine now runs this branch's source rather than the bytes of the published 0.1.0 installer.
6. **The interface was not used by hand.** Both harnesses drive it; nobody clicked through it unhurried.
7. **The folder picker and the installer's own wizard pages still need a person**, established by
   measurement in #94 and unchanged here.

## Recorded drift decisions

Decisions taken while implementing that differ from what the issue or the design first said.

- **`Preparar proyecto` is a permanent destination.** The issue left this open. Making the wizard a
  destination is what makes "one name per action" satisfiable rather than merely satisfied: every control
  that starts it carries that exact name, and there is no second label to distinguish it from a navigation
  entry.
- **The label lives with the action.** The first implementation passed a label into the button helper, and a
  review then enumerated **six** labels reaching the project screen and **three** reaching the file reading.
  The helper now takes no label: it reads it from a closed action table, so two names for one action is
  unrepresentable rather than merely checked. Eight labels were unified as a result — "Ver mi proyecto",
  "Leer mis archivos", "Comprobar de nuevo", "Revisar desarrollo".
- **Relative navigation is exempt, and the spec says so.** "Volver" means one step back from here; its
  meaning is positional. Giving it a destination's name would be the opposite of the fix.
- **The state in the list is the recorded one.** Verifying a project properly re-inspects the folder and, for
  software, checks the managed toolchain. That belongs to opening one project, so the list shows what the
  receipts say and the screen says so, at the same text size as the state it qualifies.
- **Recipe text was left as written.** It is rendered into `RECIPES.md` for a model to read as well as shown
  on screen, and rewriting instructions to an assistant to sound friendlier would trade method for tone. The
  terms inside it get definitions instead, in a panel on that screen.
- **The status note names OpenSpec and the code map only where they exist.** A document or creative project
  has neither, and putting those words on its screen would be jargon with nothing behind it.
- **The sidebar's third line changed from "Tu contexto." to "Tus archivos."** It is on every screen, so a
  technical noun there would need its definition openable from every screen.
- **The vocabulary check excludes the person's own content.** Its first run reported `tokens` and `Contexto`
  as undefined jargon because a fixture's stated goal said "tokens medidos" and a generated prompt said
  "Contexto". The check was reading the person's material and blaming the interface for it, which is the
  instrument deciding the result. Person-supplied text and generated content are now marked in the DOM and
  excluded by kind.

## Corrections a second review forced on this record

A second independent session re-verified the resolution of the first review's findings and returned FAIL
with six more majors. Three of them were about this document's neighbours rather than about the product, and
they are corrected where they were wrong:

- **The published test count was computed, not read.** `validation.md` said 318 where `npm run check`
  produced 314, by adding ten to a previous figure that already contained four of them. It now says what
  the command says, and the sentence carries how it was obtained.
- **The identity record named a commit that did not contain the bytes it measured.** Fixed in code: a
  commit is recorded only when the tree that produced it was clean.
- **The debt classification was shaped to the budget.** Seven candidates, all in the one category that
  consumes none. Corrected by investigation: one resolved by doing the work, three refuted with their
  reasoning, and the plan went to 7/5 and paused before it came back to 4/5. `validation.md` records that
  sequence, and the registry keeps the pause.

Two were standing holes in the shipped interface that this record had described as closed:

- **A glossary word could still reach a screen with no control for it**, through a `placeholder`, an
  `aria-label`, or an element carrying the classes `own` or `path` — and three places in the interface were
  already writing their own prose inside those classes: the forget dialog's whole sentence, the project
  screen's fallback goal, and the folder card's fallback description. The marker is now an attribute on
  exactly the person's words, the probe reads attribute text as screen text, and a test refuses the marker
  wrapped around a literal.
- **A declared action could still be offered under a second name**, through a form's submit handler, inside
  a dialog, or through an `aria-label` that differs from the visible text. The first was the maintainer's
  original finding reintroduced verbatim. All three are now caught: the probe collects on dialogs, compares
  the spoken name as well as the visible one, and the source guard covers a fourth construction path.

## Degradations added by this round

8. **The bound on a list row abandons the read it gave up on.** `withBudget` stops waiting; it does not
   cancel. With more genuinely hung rows than the filesystem threadpool has slots, the screen still renders
   inside the budget but the next filesystem action can queue behind the abandoned handles. This could not
   be reproduced on this machine — an unreachable UNC path answers `FOLDER_MISSING` in about 4 ms — so it is
   reasoned from the code rather than measured, and it is recorded that way.
9. **The probes are text and DOM checks, not a type system.** One name per action is unrepresentable to
   break through the action table, and four construction paths are guarded by source checks over one file;
   a control built some fifth way would evade them. The identity between a label and a person's intent is
   not machine-derivable at all: two intents may share an implementation, the author declares which is
   which, and a person reviews that declaration.
10. **The vocabulary rule cannot detect a lie in the marker.** Marking the interface's own prose as the
    person's content would exempt it. A test insists the marker only ever wraps a value read from state,
    never a literal — which catches the accident, not a deliberate misuse.
