## Context and decisions

### The tension, and why neither extreme is the answer

One acceptance criterion: the state shown comes from a real check, never from the presence of a folder. The
decision criterion: a green check mark may appear only when every stage that profile needs verified for real.
Issue 97's measured constraint: the list may not re-verify, because a real check is minutes of work and the
list reads every row before it renders anything.

Verifying per row fails the third. Showing the presence of a receipt fails the first. What satisfies all
three is that **a verdict is a record, and a record can be dated and can be falsified cheaply**. The real
check already runs when a project opens; this change saves what it found, together with the digest of every
file it depended on. The list re-reads those digests — which it already pays for, because reading receipts is
what `summary()` does — and can then distinguish:

- **verified**: every required stage verified for real, and nothing the verdict depended on has changed.
- **changed**: the check ran, but something it depended on is different now, so it has to run again.
- **unverified**: the check never ran for this folder, or the folder moved.

Only the first may carry the green check mark. This is deliberately falsifiable in one direction only: a
matching digest set does not prove the project is still ready, it only fails to disprove it. That is why the
card states the date of the check and that opening the project checks again, and why every doubt — a missing
verdict, a moved folder, a witness that could not be read, a truncated witness — resolves to "le falta algo"
rather than to green.

### Where the verdict lives, and what it may contain

`verdicts.json` in Companion's own data directory, beside `projects.json`, version 1, at most 50 entries,
written under the same lock and with the same `writeChecked` compare-and-set as the history.

Not in the person's folder. Three reasons. It is Companion's opinion, not the project's content, and issue
97's boundary is that the application writes into a person's folder only what the person approved in a plan.
A verdict in the folder would travel with a copy of the folder and claim to be about the copy. And the
duplicate flow in this change would then have to decide whether to copy it, which is the defect the issue
already names.

An entry holds `{id, rootHash, at, profile, required, stages, witness, witnessTruncated}`. It holds
**no absolute path**: the folder is identified by `hash(root)`, the same digest the journals already use to
detect a moved folder, and every witness path is relative to the project root. That is a property worth
having on purpose — it means an entry can be shown in public evidence without anchoring.

### What a green check mark claims, per profile

Declared here and in the spec, so the threshold is a statement that can be argued with rather than a
constant someone chose:

| Profile | Stages a green check mark requires |
| --- | --- |
| research, media, general | base prepared with a current inventory; context current |
| software, unity | the two above, plus the managed tools prepared, the development files in sync, and OpenSpec answering |

`engineering.workflows === 'verified'` is what "OpenSpec answering" means: it comes from
`activation.verify()`, so activation is not a separate row — it is the only way that field becomes
`verified`.

The code map is **not** part of the claim, and it is not silently ignored either. A project whose code map is
stale, corrupt or needs repair is not ready. A project that never created one is ready, because a code map is
an addition the interface offers and a software project with no code files has nothing to map; refusing green
for that would make the state unreachable for a correct project. The card says the check does not cover the
code map, in the same sentence size as the state.

The person's AI is excluded for a different reason: `externalTools` is `'not-verified'` everywhere in this
codebase, by design, because this application cannot verify someone else's product. That sentence already
exists in the project screen and it stays.

### A stale inventory counts against readiness, and what that exposed

`base.verify()` reports `prepared` together with `inventory: current | stale`, and the rule above requires both.
That has a consequence worth stating rather than discovering: **any** new file in the folder makes the
inventory stale — the person's own file, or the managed files the development stages write. So a project leaves
the ready state whenever its folder changes, which is the common case rather than the exception.

The alternative was to drop `inventory: current` so the mark stays reachable without that step. That is the
instrument deciding the result: the inventory really is out of date, and what the person is told about it can
be true and useful at the same time. So the requirement stays and two things around it are fixed, both found by
an independent review that added one file to a folder and read what the screen then said:

- **The row names what is actually stale.** It used to say the project was missing "tus elecciones guardadas",
  which was false — the choices were saved. The word a row shows now depends on why the stage is not ready, and
  for this case it is the inventory, named with its own defined term rather than a paraphrase.
- **The step that resolves it does not start over.** It reviews the answers already saved against this same
  folder. Routing it to the wizard, which is where it went first, left the project and cleared every field —
  for the most common state a project can be in.

It also exposed an inconsistency between two screens of the same application: the project screen marked
`Tus elecciones` as `Preparado` with a stale inventory while the list would say the project is missing
something. The status card now applies the same rule, so both screens say the same thing about the same
project.

### What the witness covers, and what it cannot

The witness is a list of `{path, hash}` pairs recorded at verdict time, where each stage enumerates its own
files rather than the service guessing them:

- base — receipt, journal, and the three files the receipt names.
- context — receipt, journal, the three owned files, and the route files the receipt names.
- environment — its receipt.
- activation — its receipt, its journal, the files that receipt names, and the five inputs it declares.
- engineering — every managed target the core's own `check` enumerated, with the digest it observed.

Three honest limits. The witness proves nothing about the **content of the person's files**: detecting an
edited source means re-inspecting the folder, which is the minutes this change is avoiding. It proves nothing
about the **managed toolchain** either: its receipt is inside the folder but the tools are not, so removing
them would not change any digest the list can re-read — an independent review pointed out that the mark was
claiming something nothing could disprove. And a witness capped for size — more than 200 entries, a path longer
than 256 characters, or a file larger than 8 MiB — is recorded as truncated, and a truncated witness can never
be green. All three are said on the card rather than left for the reader to infer, and the toolchain one only
appears for the profiles that need it.

### The verdict store may never be able to break the application

An opinion this application keeps about a project cannot be allowed to cost the person the project. Two rules,
both added after an independent review demonstrated the opposite:

- **Reading degrades.** Any failure to read `verdicts.json` — unparseable, unrecognised, larger than the
  bound, a directory where the file should be, a permission error — resolves to "no verdict", which shows
  every project as unchecked. The review put a nine-megabyte file there and the list stopped rendering *and*
  no project could be opened, because the read threw from outside the per-row guard. The history does not
  degrade and must not: losing it loses the person's projects.
- **Writing is best effort.** A verdict that cannot be saved simply is not saved; the check the person asked
  for still answers, and the row keeps the last verdict that was saved, with its date. Before this, an
  abandoned write lock in this application's own data directory — or a read-only data directory — turned
  every "open project" into `BUSY`, with no way out from the interface.

The file is bounded twice: at most 50 entries, and trimmed until the serialised file fits the same 8 MiB the
reader accepts, so a run of large witnesses cannot write a file the next read has to refuse.

### One action, one name: what happens to "eliminar"

The issue's Desired Outcome names three menu entries — duplicar, eliminar, quitar del historial — and its own
acceptance criterion says *eliminar* asks for confirmation and never deletes the person's folder: it only
removes it from the history, and says so. Those are one effect. Since issue 97 the label lives in a closed
action table and two names for one action are unrepresentable, so this cannot be built as written.

The name that survives is the one that describes the effect: **Quitar de la lista**, with the confirmation
saying the folder and its files stay where they are. Calling the same thing *eliminar* would be the exact
failure this project keeps finding: a word that promises more than the code does. Recorded here because it is
a deviation from the issue's prose, taken in favour of the issue's own criterion.

### Duplicating, and the capability deliberately not added

Open question in the issue: whether duplicating reuses the same selection or asks again. **It does both**: the
person chooses the new folder and lands in the wizard with the original's answers already filled in, and
nothing is written until they confirm the plan like any other preparation. The name arrives identical to the
original's, because it is the answer the person gave and this application is not going to invent a different
one; the field is visible and editable before anything is written, and the two rows are told apart by their
folder.

The resolution matters less than what it lets us avoid. Duplicating adds **no service capability at all**: it
reuses `chooseFolder` and `previewBase`, so there is no code path anywhere that copies a prepared folder's
artefacts. The criterion "duplicar no copia los artefactos de preparación del original" is then not a rule
being obeyed but a capability that does not exist, and the check that the new folder contains no
`.project-os/companion/` before the plan is applied is measuring that absence on disk.

### Cómo trabajar en este proyecto

Composed by the service, not the renderer, for the same reason `copyExport` is: the text that reaches the
clipboard is text this application wrote. `guide({id})` returns the profile's recipes and the pending stages
as an ordered list of steps, each with its prompt; the renderer picks a step by index and
`copyGuideStep({guide, step})` refuses if the witness changed since the guide was composed — the same
staleness rule the context export already has.

Two projects with different profiles get different steps because the recipes differ; two projects with the
same profile and different missing stages get different steps because the pending stages differ. The check
compares the rendered text of two projects rather than trusting that the composition varies.

The content of the prompts is issue #99. This composition is a placeholder in the sense that #99 will
replace where the words come from, and not in the sense that it is a stub: the steps it produces are the
stages this project is actually missing, in the order they can be done.

### Reading the list without making it the slowest screen

Every row still runs inside `withBudget(..., SUMMARY_BUDGET_MS)`, now covering the witness re-read as well as
the two summaries. A row that does not answer is `unreadable` with that cause, as before. The measurement
reports the elapsed time for the whole list with one unreachable row, so the bound is observed rather than
asserted.

### Measuring against the window that runs this branch

Unchanged from issue 97: the native check refuses to run against an installation whose bytes are not this
branch's, and `--sync-app` copies them in. The new probes are added to the shared
`apps/companion/scripts/interface-contract.mjs` so the journey harness and the mutation harness check the
same code, and each new property gets a mutation that breaks it on purpose.

The mutation that matters most for this change is the issue's own: break one stage of a verified project and
assert the row leaves the ready state and names the stage. It is run for a real stage of each kind — an
edited managed file, a removed context receipt — rather than for a synthetic flag, because a test that
survives reintroducing the defect proves nothing.

## Recovery and acceptance

Rollback is reverting the pull request: `verdicts.json` stops being read and written, the list returns to the
recorded state of issue 97, and no prepared folder or history entry is touched. A `verdicts.json` left on
disk from this version is inert for the previous one.

Accepted when: the list distinguishes complete from incomplete at a glance and names what is missing in plain
words; the green check mark appears only for a verdict whose witness still matches; the card opens the
project; no primary action lives only inside the secondary menu; the guide differs between two projects;
duplicating leaves the new folder without preparation artefacts; removing from the list leaves the person's
files byte-identical; breaking a verified stage removes the ready state and names the stage; and the rules
from issue 97 still pass on the new screens.
