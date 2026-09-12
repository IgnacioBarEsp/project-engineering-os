## Context and decisions

### Four destinations, and why "Preparar proyecto" is one of them

The issue leaves one question open: whether `Preparar proyecto` should be a permanent destination or only an
action reachable from the other two. It is a permanent destination here, and that is what makes the first
acceptance criterion satisfiable rather than merely satisfied. If the wizard were only a body action, the
name would have to differ from a navigation entry to stay distinguishable, and the person would again be
looking at two labels for one thing. With one destination named `Preparar proyecto`, every control that
starts the wizard — the sidebar entry, the button on `Inicio`, the button on an empty `Tus proyectos` —
carries that exact string. The rule is enforced by a check, not by care: the navigation labels and the
primary actions are read off the rendered page, and any action reachable under two different names fails.

That rename collides with the wizard's own apply button, which was also called "Preparar proyecto →" at the
base-review step. It becomes "Guardar esta preparación →", which is what it does: it writes the first files.
The collision is worth naming because it is the whole finding in miniature — the same words were being used
for "start the wizard" and for "commit the first write".

### What each destination owns

| Destination | Its job | What it must not contain |
| --- | --- | --- |
| `Inicio` | Welcome, one plain sentence, how it works, what is downloaded and why, what stays here, one action | A project list |
| `Tus proyectos` | The list, each entry with its recorded state | Greeting, explanation, numbered steps |
| `Preparar proyecto` | The existing wizard, unchanged except its words | — |
| `Ayuda` | The method in plain words, and the glossary | A control that changes a project |

`Inicio` gains the section the application never had: **what gets downloaded and why**. Document, creative
and general projects download nothing. Software and Unity download a reviewed, hash-pinned toolchain — Node,
Git, a bundled npm, and a code map on request — and never a model or an inference engine. That is a decision
already recorded in `EXPERIENCE.md` from the 11 September interview; until now a person could only discover
it by reaching a review screen.

### State in the list, without lying about it

`Tus projectos` must show each project's state, and the honest constraint is that a real state costs a folder
read. Verifying a project properly re-inspects the folder, re-hashes the sources and, for software, checks
the managed toolchain — that is what happens when a project is opened, and it can take minutes. Doing it for
every row on every render would make the list the slowest screen in the application.

So the list shows the **recorded** state and says that it is recorded. Two new read-only summaries,
`base.summary()` and `context.summary()`, read the receipt and the journal of each stage and nothing else:
no folder inspection, no source hashing, no index parse, no network. They answer four questions — is there a
receipt, is an operation interrupted, which profile was chosen, is there a context index — and a fifth by
failing: is the folder still there. The screen says "Estado guardado la última vez. Ábrelo para
comprobarlo.", which is true, and the word for the strongest state is "Preparado", never "Verificado".

A summary never fails a list: an unreadable or moved folder becomes that row's state, and the other rows
still render.

### Language

Three rules, in order of precedence:

1. **Truth is not negotiable.** Every sentence that states a limit stays. "Abrir no demuestra que la IA haya
   leído tu proyecto" is not defensive vocabulary; it is the one thing a person needs in that moment. What
   goes is the *register*: `harness`, "revisión adversarial", "contexto preparado" as a noun a reader is
   expected to already own, and the habit of leading with what is not claimed.
2. **Benefit before mechanism.** "Encuentra una frase y de qué archivo salió" before "recuperación léxica
   local con localizadores".
3. **Every technical term that survives is defined where it appears.** The terms that cannot be removed —
   OpenSpec, SDD, contexto, mapa de código, receta, inventario, fuente, cita, perfil, deuda, revisión
   adversarial — become an inline control that opens its own definition, and all of them are listed in the
   glossary under `Ayuda`.

The glossary is one module, `ui/glossary.mjs`, so a term has exactly one definition and the interface and the
help screen cannot drift. Adding a fourth interface file means naming it in the Electron asset allowlist and
in the browser harness's file map; the allowlist is extended by one exact path, never loosened to a prefix or
a glob.

Recipe text is left as written. It is rendered into `RECIPES.md` for a model to read as well as shown on
screen, and rewriting instructions to an assistant to sound friendlier would trade method for tone. The terms
inside it get definitions instead, which is what the criterion asks for.

### Measuring against the window that runs this branch

`asar: false` means the installed application's `ui/` is plain text. The native check therefore compares each
interface file's SHA-256 against the branch before it drives anything, records both digests, and **refuses to
run** when they differ unless `--sync-ui` is passed, in which case it copies the branch's bytes into the
installed tree and records what it replaced. This closes, for the interface, the gap the last adversarial
review found in the model experiment: a measurement that ran against an artifact older than the delivered
one. It is not a claim about the installer, which is unchanged and unrebuilt.

## Recovery and acceptance

Nothing in this change writes into a person's project folder, so there is nothing to roll back there.
Reverting the pull request restores the previous interface; prepared folders, the local history and the
downloaded tool cache are untouched, and the two new summaries only read.

Acceptance is the five native journeys at zero findings, the five browser journeys, contrast, heading order,
keyboard navigation and reflow re-verified on the new screens, and a machine check that no action is
reachable under two different navigation names. Blocker and Major findings from the independent review block
the archive. The two criteria that need a person who has never seen the application stay unverified with
their cause and with the protocol to run them; a step that needs a person still needs a person.
