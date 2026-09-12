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
4. **The identity guard covers what it names and no more.** Every file under `desktop/`, `ui/`, `engine/`,
   `context/` and `runtime/`; the installed application's top-level entries against a closed list;
   `package.json`'s name, version, type, main, exports, bin, files and dependencies; and the pinned core
   inside `node_modules`, per file. It does **not** compare the rest of `package.json`, which the packager
   rewrites by design, nor any other package under `node_modules`, nor the Electron runtime itself. Six
   bypass attempts were run against a copy of the installed tree and all six were refused; the untouched
   control passed.
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
