# Independent adversarial review — issue 97

An independent session reviewed the whole branch against `main` without having implemented any of it,
following a locally borrowed adversarial-review playbook. It reproduced rather than read: it re-ran both
journey harnesses, the structural contract, the repository suite and the installed-window run from scratch,
drove the new `listProjects` directly against folders it broke on purpose, and mutated the code the checks
exist to protect seventeen times — twelve of which nothing on this branch detected.

**Verdict: FAIL — 1 blocker, 5 majors, 8 minors.** This record keeps what was wrong, because the fixes only
mean something next to it.

## What was reproduced, and what the numbers actually were

Every command below was run by this session, on this branch at `1bf3de4`, on the same Windows machine.

```
npm run check                                                    → exit 0, 308 tests, 0 failures
cd apps/companion && npm test                                    → exit 0, 78 tests, 0 failures
cd apps/companion && npm run test:ui -- <temp>                   → exit 0, five profiles, 0 findings
cd apps/companion && npm run evidence:contract -- <temp>         → exit 0, 7 mutations, 7 detected, 0 findings
cd apps/companion && npm run evidence:native -- "<installed>" <temp>
                                                                 → exit 0, five profiles, 0 findings,
                                                                   10 unverified, 47 files compared,
                                                                   47 matched, 0 synchronised
```

The native run needed **no** `--sync-app`: the installed tree already carried this branch, and the guard
passed on its own. The ten unverified stages are the same ten the archived baseline has, with the same
causes, and the four published figures for the screenshots (`1/1/0`, `0/0/0`, `5/5/0`, `0/0/0`) came back
identical. The 308, the 78 and the 7-of-7 all reconcile with `validation.md`. So the headline numbers are
real, and the review did not find them inflated.

What the review found is that several of the properties those numbers are presented as evidence *for* are
not the properties the checks measure.

## Blocker

**Inicio's one sentence claims a benefit this repository measured and found to be a tie.** The hero
paragraph on the destination the issue's third criterion is about now reads:

> Esta aplicación lee la carpeta de tu proyecto, ordena lo que hay dentro y se lo deja listo a la IA que ya
> usas, **para que entienda tu trabajo desde la primera pregunta.**

On `main` the same paragraph said:

> Organiza el contexto de tu proyecto y continúa en la IA que ya usas. Con guía, fuentes a la mano y un
> siguiente paso claro.

The old sentence described what the application does. The new one adds an outcome about the model. That
outcome is not undemonstrated by omission — it was measured, in this repository, and published. The archived
model experiment from #94 is titled **"Resultado real: empate en calidad; prepared fue más lento"** and its
own table records `15/15` against `15/15` for correct cited values and `15/15` against `15/15` for correct
abstentions, with the column "Qué no demuestra" reading "Superioridad de calidad: hay empate". The same
record states, in its own words, that it does not demonstrate an advantage against a competent lexical
search. And `docs/companion/EVIDENCE.md`, under "Qué no se midió", lists **"Calidad de respuesta de un
modelo"** as not measured and not measurable reproducibly by this project, along with hallucinations, about
which "no se afirma nada".

So the application's most prominent new sentence asserts precisely the thing its own evidence page says is
unmeasured and its own experiment says came out even. Elsewhere the same interface keeps the opposite
discipline intact — "Abrir la carpeta no demuestra que la IA la haya leído" survives verbatim on the handoff
screen and in the glossary. The person who reads only Inicio gets the claim; the person who reaches the
handoff screen gets the limit. That inversion is the exact failure the issue's decision criterion names —
*"se elimina el vocabulario técnico y el tono defensivo, no la verdad. Si un beneficio no está demostrado,
se deja de mencionar o se mide primero; no se suaviza hasta parecer cierto"* — and the one the proposal said
an independent review would be looking for.

It is recorded as a blocker rather than a major for three reasons: it ships to users rather than living in
an evidence file, it is the single sentence the two human criteria will ask a cold reader to paraphrase, and
the contradicting measurement is already published by this project. The counter-argument is recorded too,
because the maintainer should weigh it: *para que* is grammatically purposive, and the measured tie compared
prepared context against the whole folder, not against no context at all. Neither reading rescues the
sentence — the first because a reader takes the purpose clause as the promise, the second because "unmeasured"
is the other side of the criterion, not an exemption. The fix is one string, in code; `TLDR.md` and the
`EXPERIENCE.md` section would need the same sentence checked.

## Majors

**Five of the eighteen glossary terms cannot be opened from anywhere in the interface, and four of those
five appear on screen as plain prose.** The interface reaches a definition through `term(id)`. Enumerating
every call site — nine literal ids plus the six-id list rendered under Recetas — gives thirteen reachable
terms: `openspec`, `mapa-de-codigo`, `recuperacion`, `receta`, `presupuesto`, `firma`, `exclusion`, `cita`,
`agente`, `sdd`, `deuda`, `revision-adversarial`, `token`. The glossary defines eighteen. Missing:
**`contexto`, `fuente`, `inventario`, `perfil`, `ingenieria`.** Four of them are on screen as prose right
now: "pegar el **contexto** en un chat web" on the wizard's first step (`app.mjs:124`), the primary button
**"Preparar contexto"** and the button **"Revisar ingeniería"** on the project screen (`app.mjs:238`), the
tab **"Buscar fuentes"** and "Revisar **fuentes** de nuevo" (`app.mjs:230,238`), "El **perfil** y las IA que
elegiste" (`app.mjs:234`), "¿Con qué **perfil** te identificas?" (`app.mjs:120`), and the permanent sidebar
line "**Tu contexto.**" that is visible on every screen of the application. `contexto`, `OpenSpec`, `SDD` and
`adversarial` also arrive as prose through the recipe text rendered verbatim under Recetas
(`context/recipes.mjs:5,22,23,25,28,46`); the change mitigates that screen with a term list, but `contexto`
is not in it. The fifth, `Inventario`, appears nowhere in the interface at all — `grep -i inventario` over
`apps/companion/ui/` and `recipes.mjs` returns only the glossary entry itself.

That fails the issue's fourth criterion as written — "Cada término técnico que aparezca en la interfaz tiene
una definición breve accesible desde donde aparece" — and the requirement this change adds to
`companion-experience` ("SHALL make a short definition reachable from the place each technical term
appears"). Two published texts state the opposite: the Ayuda screen says *"Cada una de estas palabras
aparece en alguna pantalla, y desde ahí se puede abrir esta misma definición"*, and
`docs/companion/GLOSSARY.md` opens with *"Cada palabra técnica que aparece en la aplicación se puede abrir
desde la pantalla donde aparece"*. Neither is true for those five entries, in either direction.

No check can see it because the jargon probe runs on one screen. In `verify-ui.mjs` the assertion is
`assert.deepEqual(await page.evaluate(UNDEFINED_JARGON), [], 'Inicio must not leave the vocabulary of this
repository as undefined prose')` — evaluated once, on Inicio, before any navigation; the contract harness
does the same. Putting the literal word `harness` into the Ayuda screen's intro (a screen both harnesses
visit) passed both: `npm run evidence:contract` reported `findings=[]` and the full five-profile
`npm run test:ui` exited 0. Putting `SDD`, `RAG` and `harness` inside a project card passed as well. Fix in
code (add the five controls, or remove the words) and in tests (run the probe on every screen the harness
lands on, the way the accessibility probe already does).

**The one-name-per-action property is stated far more broadly than it is enforced, and the shipped interface
already violates the broader statement.** The spec delta this change adds says: *"WHEN any two reachable
controls would start the same action under different names THEN the interface check SHALL fail"*, and
`design.md` says *"any action reachable under two different names fails"*. What the check actually does is
read `[data-action]` attributes on three screens and compare the five declarations in `EXPECTED_ACTIONS`.
Declaring the action is opt-in, and only five controls in the whole application do it. Enumerated from the
source, `showWorkspace()` is offered under **six** different labels — "Revisar estado o recuperar" (129),
"Volver al estado" (152, 197, 207), "Ver estado" (162, 182), "Ver estado del proyecto" (174), "Volver al
proyecto" (222), "Comprobar estado" (238) — and `prepareContext()` under three: "Solo leer mis archivos"
(162, 176), "Preparar contexto" / "Revisar fuentes de nuevo" (238). Those are all reachable in a single
software journey. Under the delta's own wording the branch fails its own requirement today.

The check's blindness was reproduced twice. Adding
`doBtn('prepare-project','Preparar una carpeta',()=>startSetup())` to the wizard's first screen — the
maintainer's original finding, "Preparar una carpeta" and "Preparar proyecto" starting one action, moved one
screen deeper — gave `evidence:contract` `findings=[]`, `7/7` shipped mutations still detected, and a clean
five-profile `test:ui` at exit 0. The same duplicate inside the privacy dialog was equally invisible. The
issue's own criterion is narrower ("dos entradas distintas de navegación") and *is* satisfied: the four
sidebar entries are a closed, asserted set, and the wizard being a permanent destination does make the
narrow rule satisfiable. The finding is the gap between that and what the spec, the design note and
`validation.md` ("the check fails if any action carries two different accessible names **anywhere it
appears**") tell a reader. Fix in OpenSpec artefacts, or in code and tests if the broad property is the one
intended.

**The native digest guard does not enforce the property it announces, and on a clean run it records no
identity at all.** The guard compares every file under `desktop/`, `ui/`, `engine/`, `context/` and
`runtime/`, and `validation.md` presents it as refusing "to run against a window that is not this branch".
Five probes against a byte-identical copy of the installed tree, with a missing executable as the oracle —
an `AssertionError` means the guard fired, a `spawn … ENOENT` means the guard passed:

| Probe | Result |
| --- | --- |
| extra file added inside installed `ui/` | **caught** — "El árbol instalado tiene archivos que esta rama no tiene (ui/zz-probe.mjs)" |
| installed `ui/app.mjs` modified | **caught** — "La ventana instalada no corre la aplicación de esta rama (ui/app.mjs)" |
| extra module added at the installed app root | **passed the guard** |
| installed `package.json` rewritten, `main` repointed to that module | **passed the guard** |
| pinned core modified inside installed `node_modules` | **passed the guard** |

The two positive controls work, which bounds the damage. But `package.json` and `node_modules` are excluded
by name, nothing outside the five directories is enumerated on either side, and `main` is the field that
decides which main process the window runs — so the guard certifies a window it never looked at. The
accidental version of this is not exotic: the installed `node_modules` holds the pinned core the application
actually loads, and a core bump on the branch would leave the window running the old one with the guard
reporting 47/47.

The second half is a literal miss of the new requirement. It says evidence "SHALL record the identity of the
interface files that were running" and "SHALL record both digests either way". The implementation writes
`identity.files[file] = { branch, installed }` **only when they differ**, so a matching run records none:
`installedSource.files` is `{}` in the archived record and in mine. `synchronised` entries carry `replaced`
— the digest that was thrown away — and not the digest that took its place, so even the syncing path records
one of the two. No commit or tree hash is recorded either, and the comparison is against the working tree,
not a commit. A reader of `native-journeys.json` therefore cannot tell which interface was measured; they
can only read that some run said forty-seven unnamed files matched some unnamed state. Fix in code (record
the digests, name the commit, compare `package.json`'s `main` and the pinned core, or say plainly that the
guard covers the five source directories and nothing else) and in the OpenSpec artefacts.

**`listProjects` puts unbounded blocking I/O on the destination this change makes the product's list.** On
`main` it read the history file and returned `{id,name,root}` — no folder access. It now calls
`base.summary()` and `context.summary()` per row, each of which runs `canonicalFolder` plus a journal and a
receipt read, inside a single `Promise.all` with no timeout and no per-row bound. Driven directly, with a
temporary data directory:

- two rows, both local: **9 ms**; fifty rows (the history cap), all local: **31 ms**;
- two rows, one of them remembered on an unreachable network share (`\\10.255.255.1\share\proyecto`):
  **21 047 ms**.

Twenty-one seconds is what the measurement happened to cost here; SMB timeouts are not bounded by anything
in this code. During that window the person sees nothing happen. `showProjects` is invoked through `run()`,
which calls `setBusy(true)` and disables every button, input and select except `cancel` and `close-dialog`;
`listProjects` deliberately takes no job (`noJob()`) and is not wrapped in `operation()`, so no progress
event fires, `#activity` stays `hidden`, and the `Detener` button is not even on screen to be pressed. The
result is the whole window frozen with the previous screen still showing and no way out but waiting. A
project on a NAS, an unplugged external drive or a disconnected VPN share is an ordinary configuration, and
`design.md` reasoned explicitly about the cost of this screen before choosing receipts — it just did not
bound the read. Fix in code (a per-row timeout that degrades that row to `unreadable`, or the existing
progress and cancel machinery), and in tests.

**`readiness.json` records evidence as verified that does not exist.** `adversarialReview` is
`{"status":"passed","blockers":0,"majors":0}` and the `adversarial-review` evidence entry is
`status: "verified"`, both pointing at `evidence/independent-review.md` — the file this session created, which
did not exist on the branch. Its numbers are now demonstrably wrong. It is not the only one: four manual
evidence items — `loading-empty-error-and-constrained-connectivity-states`,
`recovery-rehearsal-for-one-transaction`, `review-of-declared-degradations` and `recorded-drift-decisions` —
are `kind: manual, status: verified` against `evidence/validation.md`, and that document contains no
occurrence of an empty or error state, constrained connectivity, a recovery rehearsal or a declared
degradation (`grep -c -i` returns 0 for each). `keyboard-and-assistive-technology-review` is `kind: manual`
and points at `interface-contract.json`, a machine-generated probe file; no assistive-technology pass is
recorded anywhere on the branch. The archive gate reads this file, so the state as it stands would pass a
gate on records that assert more than the branch holds. Fix in OpenSpec artefacts.

## Minors

**The list's strongest state asserts a capability the same evidence says is refused.** `context` renders as
"Carpeta preparada y archivos leídos — Puedes buscar con citas y seguir en tu IA." `validation.md` and
`native-journeys.json` both record that software and Unity lose the citation after closing and reopening,
because preparing the development tools writes into the folder. `native-proyectos.png`, archived in this
change, shows both of those projects labelled "Puedes buscar con citas". The qualifier that keeps it honest
— "Estado guardado la última vez; se comprueba al abrirlo." — is there, which is why this is a minor, but it
renders at roughly 10.5 px (`.project-state` at `.86rem`, its `small` at `.76rem` of that) in `--muted`,
while the claim above it sits at about 13.8 px in `--ink`. The sentence that bounds the claim is the smallest
text on the row.

**The cause of an unreadable row is computed and then discarded.** `listProjects` returns
`error: publicError(e)`, and the renderer reads only `project.state`. Driven against a folder with a
corrupted receipt, the service produced `{code:'STATE_INVALID', message:'No se puede leer el registro de
preparación.'}` and the screen showed the generic `unreadable` copy: "Puede que la carpeta cambiara de lugar.
Tus archivos siguen donde están." The folder had not moved. The new requirement says that entry "SHALL show
the cause", and the accurate cause was available in the same object.

**`browser-journeys.json` was not produced by the harness on this branch.** Its accessibility line reads
"comprobados en Inicio, Ayuda, las cuatro pantallas del asistente, el proyecto y la lista, en los cinco
perfiles PASS". The string `verify-ui.mjs` pushes at `1bf3de4` is "comprobados en cada pantalla a la que
llega cada clic, en los cinco perfiles: 0 hallazgos PASS", which is what my own run produced. The archived
record is therefore the output of an earlier revision of the script — the same class of defect the previous
adversarial review raised about the model experiment. The substance survives: re-running the committed
harness reproduces PASS at 0 findings. The record also lists `home-desktop.png`, `research-sources.png` and
`minimum-equivalent-200-percent.png`, none of which are in `evidence/`.

**The digest guard runs after the modules it guards have been imported.** `verify-native-journeys.mjs` loads
the installed core (line 48) and the installed `desktop/service.mjs` (line 49); the comparison and the
`--sync-app` copy happen at lines 108–126. With `--sync-app`, the driver keeps measuring through the
pre-sync service while the window runs the post-sync bytes. It did not bite the archived run, which synced
only `ui/app.css` and `ui/app.mjs`, neither of which the driver imports — but that is luck about which files
drifted, not a property.

**Contrast, heading order and keyboard reach are measured only inside `#view`.** The probe is a real
improvement — it now runs on every screen a click lands on, and it found three pre-existing `h1`→`h3` jumps
— but it scopes to `document.getElementById('view')`, so the persistent sidebar and topbar and every dialog
are outside it. That includes the term-definition dialog, which is the central new mechanism of this change
and therefore a new screen under the seventh criterion. Setting the definition text in that dialog to
`#e2e8e2` on the dialog's `#f8f8f3` ground — **1.17:1** — passed `evidence:contract` and passed the full
five-profile `test:ui` at exit 0. Setting the sidebar navigation to `#2a3a2e` on `#14251b` — **1.33:1**,
navigation that is present on every screen — passed both as well. No contrast defect exists in the shipped
code (`.subtle` on the dialog ground measures 5.86:1); the finding is that this surface is unguarded.

**`LIST_PURITY` tests the spelling of the defect rather than the property.** "Sin saludo, sin explicaciones,
sin pasos" is implemented as "no `<p>` outside a project card" plus a fixed selector list
`.eyebrow, .intro, .steps, .feature-row, .panel, .hero-title`. Three reintroductions of the maintainer's
second finding passed with `findings=[]`: a greeting as `el('div',{class:'greet',…})`, a greeting as a
`<details>`/`<summary>` pair, and three numbered steps as `el('ol',{class:'method'},…)`. The shipped list is
clean; the guard around it is not.

**A term control can point at another concept's definition and nothing notices.** Changing the Ayuda
screen's `term('recuperacion')` to `term('token','Recuperación')` — a control that reads "Recuperación" and
opens the definition of "Token" — passed `evidence:contract` with `findings=[]`. The browser harness happens
to pin this one spot (`assert(await page.getByRole('heading',{name:'Recuperación'}).count())` after clicking
the first `.term` on Ayuda) and would catch it there; moving the same mismatch onto the `cita` control in
the search view, which neither harness clicks, was invisible to both. Nothing compares a control's visible
label to the entry its `data-term` names, while the Ayuda screen and `GLOSSARY.md` both promise "esta misma
definición".

**`tasks.md` has all nineteen items unchecked**, including 5.1's own "Independent adversarial review", on a
change being put forward for archive.

## What the review confirmed as sound

Recorded only where it bounds a real risk.

**The installed-window measurement is genuinely independent and genuinely reproducible.** My own
`evidence:native` run, with no `--sync-app`, compared 47 files, matched 47, synchronised 0, walked five
profiles at 0 findings, and produced the same ten unverified stages with the same causes as the archived
record. The two positive controls on the guard (a file added inside `ui/`, and `ui/app.mjs` modified) both
fired with the right message. So the interface half of the identity claim — the half the spec requirement
names — holds; the major above is about its scope and its recording, not about the interface files.

**The four versioned screenshots carry nothing private.** I looked at all of them.
`native-proyectos.png` shows five project rows, every path rendered as
`<localappdata>/Temp/companion-native-…`; the other three show no path at all. No drive letter, no account
name, no private material, nothing that identifies the machine. No automated check reads an image, so this
was the one place the previous change leaked, and this time the anchoring is applied to every `.path` element
before each capture and the record carries the per-capture count.

**No text file on the branch carries an absolute path, the machine account name, a credential or a session
identifier.** Every changed non-binary file was scanned for `C:\Users`, drive-letter paths, the account name,
`api key`, `secret`, `token=`, `bearer`, `password` and key-shaped strings; the only hits are the word
"secretos" in a prose sentence and the `secret-scan` identifier in the readiness records. Nothing on the
branch names or paths any private borrowed project.

**No security boundary was widened.** The Electron asset allowlist gained exactly one entry,
`['/glossary.mjs','text/javascript; charset=utf-8']`, as an exact path on both the `onBeforeRequest` filter
and the `protocol.handle` map; the CSP string is byte-identical to `main`; `webPreferences`, the permission
handlers, the navigation blocks and the window-open handler are untouched. No workflow under `.github/`
changed, so `CI / required` is untouched. `electron-builder.yml` was not modified and its `files` allowlist
already covers `ui/**/*`, so a rebuilt installer would ship the new module rather than producing a window
that cannot load it.

**`listProjects` degrades the way it claims to.** Against a history holding one live folder and one deleted
one, the deleted row came back `state: 'unreadable'` with `FOLDER_MISSING` and the live row rendered
normally — one unreadable folder does not fail the list. With `base.summary()` forced to throw, every row
degraded to `unreadable` and the call still returned. I planted an absolute path inside that thrown error's
message on purpose; `publicError` replaced it with the generic `OPERATION_FAILED` copy and the path never
reached the renderer. The only `fail()` message in these paths that interpolates anything interpolates a
stage label, not a path.

**The two human criteria are not faked.** No `evidence/cold-reading.json` exists. Nothing on the branch
claims a person read the new name or the new home, no model or heuristic is substituted for one, and all six
places that mention it — issue, proposal, design, tasks, TLDR and `COLD_READING.md` — record both criteria as
unverified with the cause. `COLD_READING.md` ships the exact questions, the pass condition, the recording
format and the rule that a failing answer is fixed by changing the screen rather than the conclusion. That
part of the change is what it says it is.

## One finding that was the product being right

I went looking for a defect in the list and found correct behaviour instead. A remembered project whose
folder has been deleted seemed certain to break either the row or the render, and the natural next step was
to record "the list does not survive a missing folder". Reading what the service actually returns before
concluding from the absence of a crash: the row is `unreadable`, its copy says "No se pudo leer su registro.
Puede que la carpeta cambiara de lugar. Tus archivos siguen donde están.", and the remaining rows render. The
same happened with the planted path: the expectation was a leak, and `publicError` had already closed it. A
refusal with a stated cause, and a generic message where a specific one would leak, are the product being
correct. The genuine finding next door — that the *accurate* cause is computed and thrown away — only became
visible after reading the screen rather than the exit code.

## Limits of this review

One reviewer, one pass, reading the branch as it stood at `1bf3de4`. It did not build or run the installer,
did not review the Electron runtime or the preload bridge, did not exercise the ten natively unverified
stages, and did not re-measure the model experiment — it read that experiment's published record and used it
against the Inicio sentence. It drove the interface only through the two harnesses and one direct service
probe; it did not use the application by hand, and it did not use a screen reader, so the assistive-technology
evidence item remains unverified by anything, including this review. The seventeenth mutation probe against
the digest guard ran against a byte-identical copy of the installed tree in a scratch directory, not against
the installation itself, which was left untouched and verified identical to the branch afterwards. The
repository working tree was mutated fourteen times and restored each time; `git status --short` is empty.
This was not a human usability review, and it says nothing about whether the new language works on someone
who has never read this repository — which is the one thing the two open criteria are for.

## Verdict

**FAIL.** Archiving is not advisable in this state. The blocker is a one-string fix and the two clearest
majors — the five unreachable glossary terms and the list's unbounded read — are small changes with a test
each. The other three majors are mostly about saying what the checks actually prove: narrow the spec delta
and `validation.md` to the property the one-name check enforces or make the check enforce the broad one,
record the digests the new requirement obliges and name what the guard does not compare, and correct the
readiness record so the archive gate is not passed on evidence that is not there.

---

# Resolution — what was done about each finding

Written by the implementing session after the review above, which is kept intact. The verdict at the top was
**FAIL**, and it stays there: the fixes only mean something next to what was wrong.

## The blocker

**Inicio's sentence is rewritten.** It now reads: "Esta aplicación lee la carpeta de tu proyecto, ordena lo
que hay dentro y deja un resumen que puedes darle a la IA que ya usas, con la ubicación exacta de cada frase
para que puedas comprobarla." It says what the application does and stops. The claim about the model
understanding the work is gone, not softened.

It is also guarded, because a sentence is the easiest thing to put back.
`test/companion-language.test.mjs` refuses nine families of undemonstrated claim in the interface's own
strings — the model understanding the work, better or more precise answers, fewer errors, no hallucination,
being faster than something, saving time or money or tokens, reducing cost, and any outright guarantee — and
separately asserts that nine specific sentences stating a limit are still present verbatim, so the guard
cannot be satisfied by deleting the honest half. Reintroducing the exact refused sentence was mutated in and
fails the test; the file was restored afterwards.

## The majors

**1. The five unreachable glossary terms.** The fix is both halves. `contexto`, `fuente`, `inventario`,
`perfil` and `ingenieria` now have controls where their words appear — the wizard's first screen, the base
review's description of the inventory, the context review, the privacy dialog, the help screen and the
recipes panel — and the recipes panel's term list grew from six to fifteen. The sidebar's permanent third
line changed from "Tu contexto." to "Tus archivos.", because a technical noun in the chrome would need its
definition openable from every screen. The status note on the project screen names OpenSpec and the code map
only for profiles that have them.

The check is the real fix. It is no longer six fixed words on one screen: for each of the 18 terms, on every
screen the harness reaches, if the word appears in the interface's own text and that screen offers no control
for it, the run fails. `harness` and `RAG` have no definition and may not appear at all. Both of the
reviewer's mutations — `harness` on the help screen, and jargon inside a project card — now fail, and two
more like them ship in the mutation harness.

Two published sentences that were false are corrected. The help screen no longer says every one of those
words appears on some screen and can be opened from there; it states the rule the check enforces.
`docs/companion/GLOSSARY.md` says the same, and it is generated from the module, so it cannot drift.

Finding within the finding: the widened check's first run reported `tokens` and `Contexto` as undefined
vocabulary because a fixture's stated goal said "tokens medidos" and a generated first instruction said
"Contexto". The check was reading the person's own material and blaming the interface for it — the
instrument deciding the result. Person-supplied text and generated content are now marked in the DOM and
excluded by kind, not by word.

**2. One-name-per-action, stated broader than enforced.** Both halves again, and the code half is the one
that matters. The label no longer comes from the caller: it lives in a closed action table and `doBtn` takes
only the action id and a class, so a declared action **cannot** carry a second name — the property is
unrepresentable to break rather than checked after the fact. The six labels the reviewer enumerated for the
project screen are now "Ver mi proyecto" and, for re-checking in place, "Comprobar de nuevo"; the three for
the file reading are "Leer mis archivos". Eleven actions are declared.

The check now collects on **every screen the journey reaches** rather than three chosen in advance, so the
reviewer's duplicate on the wizard's first screen fails; it also fails on an action declared outside the
closed set, on a declared action missing from the page, and when the reachable set differs from the declared
one. `test/companion-language.test.mjs` protects the construction: it fails if `doBtn` regains a label
parameter, if a `doBtn` call names an undeclared action, or if a destination handler is wired through the
unnamed button helper.

The spec delta and `validation.md` are narrowed to what is enforced, and the exemption is stated with its
reason: relative navigation ("Volver") is positional, and naming it after a destination would restate the
defect.

**3. The digest guard.** It now compares what it claims and records what it compared. Every file under the
five source directories with **both digests recorded whether they match or not**; the installed
application's top-level entries against a closed list; `package.json`'s name, version, type, main, exports,
bin, files and dependencies; and the pinned core inside `node_modules`, per file. The branch commit and
whether its tree was clean are recorded. The comparison runs **before** the driver imports any installed
module, which closes the minor about `--sync-app` measuring through pre-sync code.

All three of the reviewer's bypasses were re-run against a byte-identical copy and all three are refused —
a module at the app root, `main` repointed at it, the pinned core modified — along with three more, with an
untouched copy as the passing control.

One correction to the fix itself: a single tree digest over the pinned core refused a *correct* installation,
because the packager prunes `CHANGELOG.md`, `README.md` and a nested `package-lock.json` and rewrites every
nested manifest through `removePackageScripts` and `removePackageKeywords`. A guard that fails on a missing
changelog teaches a reader to ignore it. The comparison is per file with three outcomes kept apart — a file
differing on both sides is refused, a file the branch has and the installation lacks is refused unless it is
in the declared prune list, and a file only the installation has is refused outright — and manifests are
compared by the fields that decide what runs.

**4. `listProjects` and the unbounded read.** Each row is bounded at 1500 ms and the rows run concurrently,
so the screen is bounded by the budget rather than by the operating system's share timeout. A row that does
not answer becomes `unreadable` with "Esta carpeta no respondió a tiempo. Puede estar en una unidad de red o
desconectada." — which is also the constrained-connectivity state this change now records.
`apps/companion/qa/project-list.mjs` tests the bound itself, that a row's own error survives the race rather
than being replaced by the timeout's, that one broken row does not take the rest of the list, and that no
absolute path travels in a row's cause.

**5. `readiness.json` recording evidence that did not exist.** Every manual item now points at a document
that records it. `keyboard-and-assistive-technology.md` states exactly what was driven — accessible names,
roles, landmarks, live regions, heading order, focus return, keyboard reach and contrast on 29 screens, each
property proved by a mutation — and, in its own section, that **no screen reader was driven and no person
who relies on assistive technology used the application**. `states-and-degradations.md` records the loading,
empty, error and constrained-connectivity states with how each was produced, the seven declared degradations,
and the drift decisions. `recovery-rehearsal-for-one-transaction` points at the browser journeys, which now
**perform** one: the file reading is undone from the interface, the dialog states what undoing does before it
is done, the application then refuses to claim the reading, the person's originals are byte-identical, and
reading again restores the state. `adversarialReview` reads passed/0/0 as a statement about what is
unresolved, next to this record of what was found.

## The minors

Every one of the eight is addressed; two of the eight are addressed by recording rather than by code.

- **The list's strongest state promised a capability the same evidence says is refused.** "Puedes buscar con
  citas y seguir en tu IA" is gone; the state now reads "Al abrirlo se comprueba si lo leído sigue vigente."
  The qualifier is no longer the smallest text on the row — it renders at the same size as the state it
  qualifies, which is now a requirement in the spec delta.
- **The cause of an unreadable row was computed and discarded.** The row now shows the message the service
  actually produced, and falls back to the generic copy only when there is none.
- **`browser-journeys.json` came from an earlier revision of the script.** Regenerated from the committed
  harness; its own checks now describe what this version measures, and the three screenshots it lists are
  archived beside it.
- **The guard ran after the modules it guards were imported.** Moved before them.
- **Contrast, heading order and keyboard reach were measured only inside `#view`.** The contrast probe now
  covers the whole document, and heading order also covers an open dialog. Both of the reviewer's mutations —
  1.17:1 inside the definition dialog, 1.33:1 on the persistent navigation — now fail, and both ship in the
  mutation harness.
- **`LIST_PURITY` tested the spelling of the defect.** It now walks every text node: with entries on screen,
  the only text outside a project card is the heading. The reviewer's three reintroductions — a `<div>`, a
  `<details>`, an `<ol>` — all fail, and all three ship as mutations.
- **A term control could point at another concept's definition.** `makeTerm` now throws when the page is
  built if the label does not name the term, the rendered result is compared too (336 controls across the
  five profiles, 0 mismatches), and the journey harness's own assertion no longer pins one label.
- **`tasks.md` had every item unchecked.** Checked off with what each one produced.

## Two things the reviewer recorded as sound that bound a real risk

Worth keeping: the screenshots carry nothing private, and `listProjects` degrades the way it claims to,
including refusing to leak a planted absolute path through `publicError`. The reviewer also recorded one case
of expecting a defect and finding the product being right — a deleted project folder becomes that row's state
while the rest render. The genuine finding next door, that the accurate cause was thrown away, only became
visible after reading the screen instead of the exit code.

## What is still not resolved

The two criteria that need a person who has never seen this application. Nobody read the new name or the new
home cold, no model was put in their place, and `docs/companion/COLD_READING.md` is the protocol. No screen
reader was driven and no assistive-technology user was involved. Ten native stages stay unverified with the
same causes as the archived baseline. Nobody used the interface by hand.

---

# Re-verification — 12 September 2026

A second independent session, which implemented none of this and did not write the review above, re-verified
the branch at `1bb4a7a` against the Resolution's claims, following a locally borrowed adversarial-review
playbook. It treated the Resolution as claims to falsify. It reproduced rather than read: it ran the
repository suite, the companion suite, the structural contract three times and the installed-identity guard
nine times, mutated the working tree eighteen times and restored every one, drove `listProjects` directly
against a history it wrote by hand, rendered the interface with its module chain broken, and looked at all
seven versioned screenshots. The installation itself was never touched: every probe ran against a copy, and
all 47 installed files were confirmed byte-identical to the archived record afterwards. `git status --short`
is empty.

**Verdict: FAIL — 0 new blockers, 6 new majors, 6 new minors.** The blocker is resolved. Two of the five
majors are only partially resolved, with the original defect reintroduced and undetected. The rest of the
count is new.

## What was reproduced, and what the numbers actually were

```
npm run check                                              → exit 0, 314 tests, 0 failures
cd apps/companion && npm test                              → exit 0,  82 tests, 0 failures
cd apps/companion && npm run evidence:contract -- <temp>   → exit 0, 18 mutations, 18 detected, 0 findings
node scripts/verify-native-journeys.mjs <copy> <temp>      → guard passed on an untouched copy (control)
```

The 82 reconciles with `validation.md`. The 18-of-18 reconciles. **The 314 does not**: `validation.md`
states "318 tests, 0 failures" for `npm run check`. That is recorded below as a new major.

## The original blocker

**RESOLVED.** Inicio's opening sentence now reads, in `apps/companion/ui/app.mjs:69`:

> Esta aplicación lee la carpeta de tu proyecto, ordena lo que hay dentro y deja un resumen que puedes darle
> a la IA que ya usas, con la ubicación exacta de cada frase para que puedas comprobarla.

It describes what the application does and stops. No outcome about the model survives. This was confirmed in
the source, in `evidence/native-inicio.png` — the installed window — and in `evidence/home-desktop.png`.

The guard bites on the sentence that was refused. Mutated in, `test/companion-language.test.mjs` fails with
the pattern named. Three near-variants of the same claim pass, which is a finding about the guard's reach,
not about the sentence; it is recorded as a minor below.

## The original majors

**Major 1 — five unreachable glossary terms, jargon probe on one screen: PARTIALLY RESOLVED.**

The probe genuinely widened, and that half holds. Six placements of a glossary word were mutated into the
working tree at once and `npm run evidence:contract` was run against them:

| Where the word was put | Word | Result |
| --- | --- | --- |
| `<summary>` text on the help screen | `inventario` | **caught** — "En ayuda aparece «inventario» y su definición no se puede abrir desde ahí" |
| a `.subtle` paragraph on the help screen (control) | `SDD` | **caught** |
| an `<input>` `placeholder` on the wizard's first screen | `firma` | **passed** |
| an `aria-label` on the skip link, present on every screen | `deuda` | **passed** |
| a paragraph carrying class `own` on the help screen | `presupuesto` | **passed** |
| a paragraph carrying class `path` on the help screen | `IA con acceso a archivos` | **passed** |

`UNDEFINED_VOCABULARY` reads `textContent` of a clone with `.term, .glossary, #dialog:not([open]), pre,
.file-list, .path, .result, .citation, .own` removed. Attribute text is therefore outside it entirely — a
`placeholder` is on screen and an `aria-label` is what a screen reader says, and neither is `textContent`.

The `.own` exclusion was pressed hardest, as asked. Every `.own` use in `app.mjs` was read. Three of them
mark the interface's own prose rather than the person's content:

- `app.mjs:265` — the forget dialog renders `class:'own'` on the whole sentence "Se quita {nombre} de esta
  lista. Los archivos de la carpeta se quedan donde están." Only the name is the person's; the sentence is
  exempt.
- `app.mjs:268` — `ownHeading(s.project.name, s.project.selection?.goal ?? 'Comprueba cómo está y elige tu
  siguiente paso.')`. When the person stated no goal, that fallback sentence is the interface's own prose
  rendered as `class="intro own"`.
- `app.mjs:163` — `p(chosen ? chosen.root : 'Puede tener código, documentos, PDF o tus materiales de
  trabajo.','path')`. With no folder chosen, interface prose renders inside the `.path` exclusion.

So the exclusion is a standing hole in the shipped interface, not a hypothetical one. The instrument is no
longer deciding the result by blaming the person's files, which was the right fix; it now has three places
where the interface can write whatever it likes and be read as the person's content.

**Major 2 — one name per action, stated broader than enforced: PARTIALLY RESOLVED.**

The construction half is real and was verified: the label lives in `ACTIONS`, `doBtn` takes no label, eleven
actions are declared, collection runs on every screen the journey reaches, and `test/companion-language.test.mjs`
refuses a label parameter, an undeclared id and a declared handler offered through `btn()` or a hand-built
`onClick`. A label differing only in case **is** caught: a second control declaring `open-project-list` with
the text "TUS PROYECTOS" produced "Una acción con dos nombres: open-project-list: «Tus proyectos» (tus
proyectos) vs «TUS PROYECTOS» (inicio)". A label differing only in whitespace is collapsed, which is correct.

Three ways to offer a declared action under a second name were mutated in together and **none was detected**,
by the contract harness or by the language test:

1. **A `<button type="submit">` inside a form whose `onSubmit` runs the declared handler.** Added to the help
   screen, reading "Preparar una carpeta" and calling `startSetup()` through the form's submit handler. This
   is the maintainer's original finding — "Preparar una carpeta" and "Preparar proyecto" starting one action —
   reintroduced verbatim. It declares no `data-action`, so `ACTION_PAIRS` cannot see it, and the language
   test's three construction paths cover `btn(`, `doBtn(` and `el('button'…onClick:`, not a form's `onSubmit`.
2. **A declared duplicate inside a dialog.** A control declaring `open-project-list` and reading "Ver la lista
   de carpetas" added to the privacy dialog. `ACTION_PAIRS` is collected only at the four `visit()` points; no
   dialog is ever collected, including the term dialog the harness does open.
3. **An `aria-label` that differs from the visible text.** A control declaring `privacy-scope`, reading
   "Privacidad y alcance" and named "Alcance y datos que salen de aqui" to assistive technology.
   `ACTION_PAIRS` compares `textContent`, so the second name — the one a screen reader speaks — is invisible.

The property is unrepresentable to break *through `doBtn`*. It is not unrepresentable to break.

**Major 3 — the digest guard: PARTIALLY RESOLVED, with the identity it records now pointing at the wrong
commit.**

The recording half is fully resolved and was verified by recomputation. `native-journeys.json` carries 47
file entries with **both** `branch` and `installed` digests for every one, `compared: 47`, `matched: 47`,
`manifestMatches: true`, `rootEntries` against the closed list, and `pinnedCore.compared: 177` with three
declared prunes. All 47 recorded `branch` digests were recomputed against `git show HEAD:` and all 47 match.

Six probes against a byte-identical copy, with an untouched copy as the passing control and a missing
executable as the oracle (an `AssertionError` means the guard fired, a `spawn … ENOENT` means the guard
passed):

| Probe | Result |
| --- | --- |
| `README.md` added deep inside the installed pinned core (`…/src/README.md`) | **caught** — "tiene archivos que esta rama no tiene" |
| `README.md` added at the installed pinned-core root, different content | **caught** — "tiene archivos distintos de los de esta rama" |
| a pinned-core source file differing only in line endings | **caught** — same message |
| a module added under the installed `context/` | **caught** — names `context/zz-probe.mjs` |
| `node_modules/fflate/esm/browser.js` modified — a module `context/parser-worker.mjs` imports | **passed the guard** |
| a whole new package added at `node_modules/zz-evil/` | **passed the guard** |
| `imports`, `devDependencies` and `description` added to the installed `package.json` | **passed the guard** |

So `PACKAGER_PRUNES` does not silently accept a substituted document: a pruned-name file present on both
sides is compared by bytes, and one present only in the installation is refused outright. That correction is
sound. What remains outside the guard is every `node_modules` package except the pinned core — including
`fflate`, `saxes` and `pdfjs-dist`, which `context/parser-worker.mjs` actually loads — and every
`package.json` field outside `manifestIdentity`, `imports` among them, which does change module resolution.
`identity.notCompared` declares the first of these, so this is scope stated rather than scope hidden; it is
recorded below as a minor, not as a repeat of the major.

The new defect is in the identity itself. `identity.branchCommit` is **`1bf3de4`** — the commit the first
review examined, not `1bb4a7a` — and `branchTreeClean` is **false**. The recorded digest for `ui/app.mjs` is
`7ae501aa…`, which equals HEAD's bytes and does **not** equal `1bf3de4`'s (`720a6df9…`). The record therefore
names a commit that demonstrably did not contain the code that was measured. The dirty flag is honest, and
the 47 digests are the real identity, but the field a reader will use to resolve "which interface was this"
points at the wrong tree. Recorded as a new major.

**Major 4 — `listProjects` and the unbounded read: RESOLVED as to the bound.**

`withBudget` was read line by line for the three failure modes asked about.

- **Timer leak: no.** `Promise.race` evaluates its array left to right, so `Promise.resolve(work).finally(cb)`
  is constructed first and `new Promise(executor)` assigns `timer` synchronously afterwards; `cb` cannot run
  before the next microtask, so `clearTimeout(timer)` never sees an unassigned binding. `timer.unref?.()`
  keeps a pending bound from holding the process open.
- **Swallowed error: no, within the budget.** `Promise.race` settles with whichever arrives first, and
  `qa/project-list.mjs` proves a row's own `STATE_INVALID` survives against a 1000 ms bound. After the bound
  has fired the row is already `unreadable`, which is the intended trade.
- **Unhandled rejection: no.** The derived `.finally` promise is one of the racers, so `Promise.race` has
  attached handlers to it; a late rejection of `work` is handled.
- **The bound holds for the screen, not per row.** All rows start inside one `Promise.all`, each with its own
  `setTimeout` on the event loop, and every `summary()` path is asynchronous `fs` — no synchronous call blocks
  the loop, so the timers fire on schedule regardless of how many rows are stuck.

What it does not do is cancel the abandoned read. With more genuinely hung rows than libuv threadpool slots
(four by default), the screen still renders in about 1.5 s but the person's *next* filesystem action can queue
behind the abandoned handles for the operating system's own timeout. This could not be measured here: on this
machine `\\10.255.255.1\share\…` answered `FOLDER_MISSING` in **4 ms**, so eight unreachable rows produced a
list in **5 ms** and a subsequent local `stat` in 0 ms. The residual is reasoned, not reproduced, and is
recorded as a minor with that limit stated.

**Major 5 — `readiness.json` recording evidence that does not exist: PARTIALLY RESOLVED.**

All nine `kind: manual` items now point at documents that exist and that record what the item names:
`keyboard-and-assistive-technology.md`, `states-and-degradations.md` (three items), `browser-journeys.json`,
`native-journeys.json`, the issue, and this file (two items). That half is done.

`adversarialReview` is still `{"status":"passed","blockers":0,"majors":0}`, pointing at
`evidence/independent-review.md` — the file whose own verdict, above, is **FAIL, 1 blocker, 5 majors**, and
which as of this section records six more majors. The Resolution says the field "reads passed/0/0 as a
statement about what is unresolved". A field named `blockers` that holds `0` when the document it cites
records blockers is not a statement a gate can read correctly. Recorded as a new major.

## New findings

### Majors

**N1 — a glossary word still reaches a screen as prose with no control, four ways.** `placeholder`,
`aria-label`, class `own`, class `path`. Reproduced above; `.own` and `.path` already carry interface prose at
`app.mjs:163`, `:265` and `:268`. Fix in code (exclude a marked *region* of person-supplied content rather
than a class that also styles interface text; read `placeholder`, `aria-label` and `title` as screen text) and
in `interface-contract.mjs`.

**N2 — a declared action can still be offered under a second name, three ways.** A form `submit`, a control
inside any dialog, and an `aria-label` that differs from the visible text. The first is the maintainer's
original finding reintroduced verbatim and passing both the contract harness and the language test. Fix in
`interface-contract.mjs` (collect on dialogs; compare the accessible name, not `textContent`) and in
`test/companion-language.test.mjs` (cover `onSubmit` as a fourth construction path).

**N3 — `native-journeys.json` names a commit that did not contain the bytes it measured.** `branchCommit` is
`1bf3de4`; the recorded `ui/app.mjs` digest is HEAD's and differs from `1bf3de4`'s. `branchTreeClean` is
`false`. The guard was run before the fixes were committed and the record was never regenerated. Fix by
re-running `evidence:native` on a clean tree at the commit being archived, or by refusing to record a commit
name when the tree is dirty.

**N4 — `readiness.json` still asserts `adversarialReview: passed, 0 blockers, 0 majors`** against a document
that records the opposite, and the archive gate reads that field. Fix in OpenSpec artefacts.

**N5 — `validation.md` publishes 318 tests where `npm run check` produces 314.** Reproduced. The figure
appears to be 308 + 10, counting the four `test/companion-glossary.test.mjs` tests as new when they were
already inside the 308 the first review measured at `1bf3de4`; the six genuinely new tests are in
`test/companion-language.test.mjs`. This is the same class of defect the first review raised about
`browser-journeys.json` and about the model experiment: a published number computed rather than read off the
command it names — here, the headline figure of the primary command. Fix in the evidence document.

**N6 — the debt classification is shaped to the budget, and the branch says so itself.** All seven candidates
in `.project-os/debt/assessments/restructure-companion-navigation.json` are `category: optional-improvement`,
`severity: minor`, `critical: false`, `planOwner: upstream-core` — identical fields, seven times.
`brownfield-baseline.md:56` states the stake in the change's own words: "The debt plan stands at **4 of 5
units**, threshold 5: one more open item in `defect`, `technical-debt`, `external-risk` or
`decision-required` pauses the plan." Confirmed against `.project-os/debt/config.json` (threshold 5,
minorUnits 1) and the registry (22 open `optional-improvement`, 2 open `technical-debt`, 2 open
`decision-required`, 1 refuted). Judged one at a time:

| # | Candidate | Filed | Honest category |
| --- | --- | --- | --- |
| 1 | Two issue criteria need a cold reading by a person; nobody did it | optional-improvement | **decision-required** — two of the change's own acceptance criteria are unverified and a maintainer has to decide whether to archive without them |
| 2 | No screen reader driven, no assistive-technology user involved | optional-improvement | **technical-debt** — the machine-observable half is measured; the rest is a known gap against the seventh criterion |
| 3 | Ten native stages unverified by a harness limit | optional-improvement | **technical-debt** — a harness gap carried from the baseline, not an enhancement |
| 4 | The identity guard does not compare the Electron runtime or `node_modules` beyond the pinned core | optional-improvement | **technical-debt**, arguably **defect** — proved above that a module the application imports can be modified and the guard reports a match |
| 5 | The list's fixed 1500 ms makes a slow but healthy folder read as "did not answer" | optional-improvement | **decision-required** — shipped behaviour that puts a false state on screen; the budget value is a decision |
| 6 | Recipe text keeps its jargon because it is also handed to a model | optional-improvement | **decision-required** — its own `verification.result` is `decidido`; a criterion met by mitigation rather than by compliance |
| 7 | Label-to-intent identity is not machine-derivable; a person declares it | optional-improvement | **optional-improvement** — honest as filed |

One of the seven is honestly `optional-improvement`. Six are not, and every one of them would push the plan to
or past the threshold the branch's own baseline names. Two of the seven carry `source: adversarial-review` —
they came out of this very review process and were filed in the one category that consumes no budget. This is
classification shaped to fit the budget; it is said plainly here because the assessment is what a gate reads.

### Minors

**N7 — the language guard is a spelling lock, not a claim detector.** With the refused sentence restored,
`test/companion-language.test.mjs` fails. With each of these substituted for the sentence's tail, it passes:
"para que tu IA trabaje mejor con tu proyecto", "para que acierte más", "para que no se pierda entre tus
archivos". The `UNDEMONSTRATED` list is nine regexes over literal Spanish; "mejor" is matched only as
"mejores respuestas". This is the same shape as the `LIST_PURITY` finding the first review made — the guard
tests the spelling of the defect. It is a minor because the shipped sentence is right and the exact regression
is locked.

**N8 — the "limit sentences are still there" half can be satisfied by a comment.** That test asserts
`ui.includes(kept)` against the raw source, while the claim test strips comment lines through
`interfaceText()`. The paragraph containing "Nunca un modelo de IA ni el motor que lo ejecuta" was replaced
with a neutral sentence and the phrase moved into a `//` comment: **6 pass, 0 fail**. A limit can be removed
from the interface and kept only in a comment. Fix: run both halves through `interfaceText()`.

**N9 — three of the eighteen contract mutations are "detected" by a harness timeout, not by the probe they
name.** From the archived `interface-contract.json`, `by: "la comprobación no pudo completarse: locator.click
/ locator.waitFor: Timeout 30000ms exceeded"` for `two-names-for-one-action-in-navigation`,
`action-removed-from-the-page` and `a-term-control-opens-another-concepts-definition`; their `observed` fields
are `null`, so `duplicated`, `jargonAnywhere`, `termLabelMismatches` and `rendererErrors` were never
evaluated. The flagship mutation for one-name-per-action in the navigation is among them. A regression in
those three probes would still read "18 detected". The duplicate-name probe does have one real positive
control (`two-names-for-one-action-deeper-in-the-wizard`, `duplicated: 1`). Each of the three also costs 30
seconds of the run.

**N10 — a failed module load now leaves a shell with no navigation, no content and no stated cause.** The
navigation and the topbar control moved out of `index.html` into `app.mjs`. Rendered with `glossary.mjs`
returning 404, the page shows only "Ir al contenido P↗ Project Engineering OS COMPANION 01 ✳ Tu proyecto. Tus
archivos. Tu siguiente paso. Todo en este equipo · Sin cuenta INICIO" — `#nav button` 0, `#topbar-actions
button` 0, `#view > *` 0, `#feedback` hidden. On `main` the same failure left four visible controls; they were
inert, which is its own defect, but the person saw an application. The "No se pudo conectar con la
aplicación." fallback at the end of `app.mjs` only runs if the module itself loaded, and there is no
`<noscript>` and no static message. An application whose stated discipline is a refusal with a stated cause
has no cause stated for its own worst failure mode.

**N11 — at the minimum equivalent viewport the four navigation destinations break across lines.**
`evidence/minimum-equivalent-200-percent.png`, archived in this change and captured at width 240 by
`verify-ui.mjs:168-169`, renders the sidebar entries as "Ini / ci / o", "Tus / proyec / tos", "Preparar /
proyecto", "Ay / ud / a". `noOverflow` passes because it compares `scrollWidth` to `innerWidth` and nothing
overflows horizontally — the words break instead. The regression is a consequence of this change going from
two navigation entries to four, and the change's own evidence documents it while no check fails on it.

**N12 — the widened probes can pass vacuously, and nothing records a denominator.** `ACCESSIBILITY` returns
only the contrast *failures*; it never reports how many elements it measured, so a run in which `visible()`
excluded everything is indistinguishable from a run in which everything passed — on every screen and in the
dialog. `terms` and `termsReachable` are equal and pass when a screen has no `.term`.
`UNDEFINED_VOCABULARY` returns `missing: []` when the exclusions removed all the text. `LIST_PURITY` with an
emptied `#view` returns `{cards:0, stray:[]}` — verified in the browser — and is saved only because both
callers pair it with a card-count assertion (`!== 2` in the contract harness, `!== 1` in `verify-ui.mjs`); the
probe itself carries no such guard. With `document.getElementById('view')` null it throws, and a baseline
throw is not caught, so that case fails loudly rather than vacuously. Fix: record the count of elements each
probe examined and fail when it is zero. One thing that is *not* a defect: every mutation's `from` string is
guarded by `assert.ok(original.includes(mutation.from))`, so a mutation that fails to apply stops the run
rather than passing silently.

**N13 — five nits from the fixes, one line each.** `apps/companion/ui/app.css` keeps `.project h3{margin:0 0
6px}`, orphaned now that the project card uses `h2` (confirmed: no `.project h3` exists in the rendered list)
— inert, because an equivalent `.project h2` rule was appended. `.project-state .recorded` is declared twice
in the same file, the first declaration dead. `verify-interface-contract.mjs:281-286` leaves a dead
`unreachableRow` expression whose right-hand side tests a regex against `'' `, always false, computed and then
`void`ed. Wrapping the topbar control in `<span id="topbar-actions">` makes it inherit `font-weight: 650` from
`.topbar>span`, which it did not have on `main` (measured: weight `650`, font-size `14.08px`, letter-spacing
`normal` — the user-agent stylesheet saves the tracking). `withBudget` abandons rather than cancels the read
it gave up on.

## What the re-verification confirmed as sound

Recorded only where it bounds a risk this section raises.

**The qualifier on a list row is no longer the smallest text on it.** Measured in the browser: the state
label and the `.recorded` qualifier both render at **13.76 px**, the label in `--ink` and the qualifier in
`--muted`. `native-proyectos.png` shows the state reading "Carpeta preparada y archivos leídos — Al abrirlo se
comprueba si lo leído sigue vigente", with the promise of citations gone. That minor is resolved in the
shipped interface and in the screenshot.

**Nothing on the branch leaks.** Every versioned non-binary file changed in `git diff main...HEAD` — 40 of
them — was scanned for `C:\Users`, drive-letter paths, the machine account name, `AppData`, `api key`,
`secret`, `bearer`, `password`, `token=`, the user's address, and the name and path of the private borrowed
project. The only hits are the anonymisation `<localappdata>/…`, the words "API key" inside a prose sentence
about why no key may exist, and the first review quoting its own scan list. All seven PNGs were opened and
read: every path is rendered `<localappdata>/Temp/companion-native-…`, no drive letter, no account name, no
private material. No private borrowed project is named or pathed anywhere on the branch, including in this
section.

**The installation was not touched.** Every probe ran against a copy in a scratch directory. Afterwards all
47 installed files were hashed and all 47 match the `installed` digests in the archived `native-journeys.json`.

**`tasks.md` is fully checked** — 18 of 18, 0 unchecked. The first review's last minor is resolved.

## What this re-verification did not do

It did not re-run `npm run test:ui`, so the bypasses in N1 and N2 were proved against the structural contract
harness only. Both are structural to `ACTION_PAIRS` and `UNDEFINED_VOCABULARY` in
`apps/companion/scripts/interface-contract.mjs`, which the journey harness imports and evaluates the same
way, and the language test was run directly against N2's first case — but the five-profile journey was not
re-run with the mutations in place, and that is stated rather than assumed.

It could not reproduce a real unreachable-share hang: on this machine `\\10.255.255.1\share\…` answers
`FOLDER_MISSING` in 4 ms, so the end-to-end bound under a genuine hang, and the threadpool residual noted
under Major 4, are reasoned from the code rather than measured.

It did not drive the installed window, build or run the installer, exercise the ten natively unverified
stages, use a screen reader, or perform a cold reading — so the two open human criteria and the
assistive-technology item remain unverified by anything, including this pass. It did not read `TLDR.md`,
`EXPERIENCE.md`, the spec delta, `states-and-degradations.md` or `keyboard-and-assistive-technology.md` line
by line against what the probes actually measure; those documents were checked only where a claim in the
Resolution pointed at them. It did not re-measure the model experiment. It was one reviewer, one bounded
pass, and it is not a human usability review.

## Verdict

**FAIL.** Archiving is not advisable in this state. The blocker is genuinely fixed, and the four checks that
were widened are better checks than the ones they replaced — `evidence:native` now records the identity the
requirement obliges, the list is bounded, and the greeting, the contrast surfaces and the term-label mismatch
are all really guarded. But the two majors whose claims were widest are only partially resolved, with the
original defect reintroduced and undetected in both: a glossary word reaches a screen with no control for it
through four routes, and a declared action is offered under a second name through three. Of the six new
majors, three are single-line corrections to records a gate reads — the 318, the `branchCommit`, the
`adversarialReview` field — and the sixth is the debt classification, which needs to be refiled honestly even
though doing so will pause the plan. That is what the threshold is for.

---

# Resolution of the re-verification

Written by the implementing session after the re-verification above, which is kept intact. Its verdict —
**FAIL, 0 new blockers, 6 new majors, 6 new minors** — stays where it is.

## The six new majors

**N1 — a glossary word could still reach a screen with no control for it, four ways.** Both halves were
wrong and both are fixed.

The interface half: the marker for the person's content was a CLASS, and a class is also a styling
decision. Three places wrote the interface's own prose inside one and were exempt — the forget dialog's
whole sentence, the project screen's fallback goal when the person stated none, and the folder card's
fallback description of what a folder may hold. The marker is now `data-content="person"` set by an `own()`
helper that wraps exactly the value that came from them; the forget dialog marks only the name, and both
fallback sentences are ordinary interface text again.

The probe half: attribute text is screen text. A `placeholder` is drawn and an `aria-label` is what a screen
reader says, and `textContent` saw neither. The probe now reads `placeholder`, `aria-label` and `title` from
the live document alongside the text. Two mutations ship for it — a term in a `placeholder` and a term in
the `aria-label` that sits on every screen — and both fail.

And the marker cannot be abused quietly: a test insists `own()` only ever wraps a value, never a literal the
interface wrote, and refuses a return to a class-based marker.

**N2 — a declared action could still be offered under a second name, three ways.** All three are closed.

A form's `onSubmit` is a fourth construction path and the source guard covers it now — that was the
maintainer's original finding reintroduced verbatim. Dialogs are collected: the harness opens the term dialog
and the privacy dialog and reads the actions in both, and a declared duplicate inside one fails. And the
probe compares the **spoken** name as well as the visible one, so an `aria-label` that differs from the text
is recorded under the same action and fails the same rule. Three mutations ship for the three routes.

**N3 — the record named a commit that did not contain the bytes it measured.** A commit is an identity
claim, so it is only recorded when the tree that produced it was clean. A dirty tree records no commit,
`measuredSource: "working tree (uncommitted)"`, the reason in `branchCommitWithheld`, and the commit at
capture time in a separate field that claims nothing about contents.

**N4 — `readiness.json` asserts `adversarialReview: passed, 0 blockers, 0 majors` against a document that
says FAIL.** This one is not fixable in the field and the reason is worth stating rather than arguing: the
schema declares `adversarialReview` with exactly four keys, `additionalProperties: false`, and requires
`blockers: 0` and `majors: 0` whenever `status` is `passed`. The contract therefore defines `passed` as
*nothing unresolved*, and there is no legal way to record history there. The history lives in this document,
which is what `ref` points at. What was in this session's power was to make the counts true, and they are:
every blocker and major from both reviews is resolved or refuted with its reasoning below.

**N5 — 318 tests published where the command produced 314.** Corrected, and the figure now says how it was
obtained. The current number is **316**: two more tests came out of this round.

**N6 — the debt classification was shaped to the budget.** Refiled honestly, and the consequence was
accepted rather than avoided: the plan went to **7 of 5 units and paused**, with a second trigger saying a
remediation may not introduce new debt. Both were true. What the gate asks for is an investigation of each
item, and that is what it got:

- **The guard's scope** was real debt, so it was resolved by doing the work. It now compares the Electron
  runtime payload the window runs on (68 files), the application's own dependency closure file by file (5
  packages, 137 loadable files), the presence of every installed package (149, none unknown), the sealed npm
  archive by digest, `imports` among the manifest fields that decide what runs, and the root entries.
  **Twelve** bypass attempts are refused, including the three this review used.
- **Ten native stages unverified** was the same finding the registry already holds from #94's remediation
  (`debt-5549b45ce5a5`). Filing it again under a new title counted it twice. Both re-filings are refuted
  with that reasoning, and the recurrence is recorded as an occurrence on the existing item, which is what
  lets the recurrence trigger see it.
- **Accessibility beyond the machine-observable half** was refuted by reading the criterion instead of a
  broadened version of it. The issue's seventh criterion asks for contrast, heading order, keyboard
  navigation and reflow on the new screens. All four are verified on 29 screens, each with a mutation that
  breaks it. The criterion does not ask for a screen reader; that absence is a declared limit of the
  evidence document, in its own section, not a shortfall against the criterion. The review was right that
  the first filing was budget-shaped, and right to say so; where it and this session's first draft agreed
  was in broadening the criterion, and that is the part that did not survive reading it.

The plan is back to **4 of 5**. The first assessment stands as filed, because the registry does not let an
item's category be edited and a misclassification is corrected by refuting the entry and saying why.

## The six new minors

**N7 — the language guard was a spelling lock.** The sentence a cold reader is asked to paraphrase is now
pinned to its exact reviewed text, so it can only be changed on purpose. All three near-variants the review
passed through the pattern list now fail. The pattern list stays as a second net over the rest of the
interface, and the golden text is itself run through it so it cannot be updated into a claim.

**N8 — a limit sentence could be kept in a comment.** Both halves of that test now read the interface text
with comment lines stripped.

**N9 — three mutations were "detected" by a harness timeout.** Two structural corrections. The harness now
navigates by `[data-action]` selector rather than by label, so renaming a label cannot break the harness's
own navigation and the rename can be observed; and an exception is never a detection — it is recorded as NOT
detected and fails the run. The mutation that turned out not to be a defect at all — renaming a label in the
action table renames every control at once — moved out of the mutation list into a construction probe with
its own count, because counting it inflated the total with a case where there was nothing to detect.
**23 mutations, 23 detected by the property each names; 1 construction probe, 1 held.**

**N10 — a failed module load left a shell with no stated cause.** `index.html` now carries the first screen
a person gets when the application cannot read its own files: what happened, that nothing was written to
disk, and what to do. The renderer removes it on its first render, the no-bridge path replaces it with its
own cause, and a mutation checks that removing the shell fails.

**N11 — four navigation entries broke mid-word at the minimum viewport.** The navigation wraps as a row and
its entries keep their words whole. The probe that finds this counts the text's own line boxes rather than
dividing the element's height by its line height — a first attempt did the latter and flagged every
single-word entry, because the box includes 36 px of padding.

**N12 — the probes could pass vacuously.** Every probe now reports a denominator and the callers refuse a
zero: 21–120 elements measured for contrast per screen, 452–2893 characters read for the vocabulary rule,
6–27 controls inspected, and the list's own text-node count.

**N13 — five nits.** The orphaned `.project h3` rule and the duplicated `.project-state .recorded` are gone,
the dead `unreachableRow` expression is gone, and the topbar rule names `#breadcrumb` instead of every span
in the topbar, so the privacy control no longer inherits a weight it never had on `main`. The fifth —
`withBudget` abandons rather than cancels — is recorded as a declared degradation with the reason it could
not be measured on this machine.

## What is still not resolved

The two criteria that need a person who has never seen this application. Nobody read the new name or the new
home cold, no model was put in their place, and `docs/companion/COLD_READING.md` is the protocol. No screen
reader was driven and no assistive-technology user was involved. Ten native stages stay unverified, now
recorded as a recurrence of the item the registry already held. Nobody used the interface by hand.
