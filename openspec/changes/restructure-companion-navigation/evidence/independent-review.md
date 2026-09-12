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
