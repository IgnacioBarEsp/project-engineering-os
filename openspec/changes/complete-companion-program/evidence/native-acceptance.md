# Native acceptance — what was observed on the installed application

Everything here was done against the application installed on the maintainer's Windows machine from the
artifact verified in #80, version 0.1.0, driven through its **own window** rather than its service layer.
The window was reached by attaching to the packaged application's debugging port; no engine, capability or
dialog was replaced, and no fixture was injected.

## The interview answers that changed the scope

The maintainer answered the three questions that had been recorded as pending since 7 September:

- The conference is **24 September 2026**, and the application has to be ready by **20 September** so an
  interview can be rehearsed first.
- The AI that must work are **OpenCode, Claude, ChatGPT, Cursor and Antigravity**, "for now".
- Installation depth was decided together: download only the reviewed, hash-pinned toolchain, detect and
  configure what already exists, and **never install a model or an inference engine**. A mid-size local
  model is 4–8 GB against the 80 MB of the entire pinned toolchain, needs a GPU the audience may not have,
  cannot be pinned the way an archive can, and on conference network would turn a preparation measured in
  hundreds of milliseconds into an unpredictable wait.

`docs/companion/EXPERIENCE.md` now records all three as answers rather than assumptions.

## What the named AI actually are on this machine

Measured with the application's own launcher against real installations, no injection:

| AI | Installed | Signature | Result the person is given |
| --- | --- | --- | --- |
| Cursor | yes | valid, Anysphere, Inc. | opens the project folder locally |
| ChatGPT | — | not applicable | reviewed export or first instruction |
| Claude | yes | valid, Anthropic | no verified way to hand it a folder |
| OpenCode | yes | valid, Anomaly Innovations | no verified way to hand it a folder |
| Antigravity | yes | **not signed** | present, and refused: `APP_UNTRUSTED` |

Antigravity was not selectable at all before this change, so a person who uses it could not say so. It is
now offered, detected and named, and it is deliberately **never launched**: its executable is unsigned on
this machine, and its package is an Electron application rather than a Visual Studio Code derivative, so
nothing here has observed how its build takes a folder. Inventing that argument would be shipping a
capability nobody verified. A regression fixes both halves — unsigned is refused as untrusted, correctly
signed is still refused as unsupported — and neither path can reach a launch.

## The complete journey through the installed window

One profile, end to end, on a folder holding two of the person's own files:

1. Home screen offering a single main action; wizard opened from it.
2. Name, profile, goal, project type, AI and experience level, filled in the real controls.
3. The application asked the operating system for the folder. A person answered that dialog.
4. The plan was accepted and applied. The folder came back with `.project-os/companion/` — project,
   receipt, inventory, `START.md`, transaction — and `context/` with index, `MAP.md`, `RECIPES.md`,
   receipt and transaction, plus `AGENTS.md` at the root.
5. Context: method `local-lexical`, **2 sources indexed**, 5 passages, coverage complete.
6. **The person's two files were byte-identical afterwards.**
7. Search from the interface for "acuerdo" returned a checkable citation: `acuerdos.txt · línea 3`, with
   the exact line.
8. The closing screen states its own limit without being asked: "Se solicitó abrir la carpeta en Codex.
   No se ha comprobado que la IA la haya leído."

How it was driven, stated plainly: the keyboard accepted the proposed action at each step, so the plans
were accepted in their default form rather than read one by one. What landed on disk is real; an unhurried
reading of each plan by a person is not what happened.

## The folder picker is a boundary, not a missing step

Choosing the folder cannot be automated from here, and that was established by measurement rather than
assumed. Three independent attempts, all recorded because the conclusion matters:

- **UI Automation.** The picker exposes no editable name field and no confirming button. Walking its
  entire control tree from the window handle yields 53 nodes: file-list cells, the search box and the
  "New folder" command. Writing into the one editable field the shell does expose is rejected with
  "the operation was canceled by the user".
- **Synthetic keystrokes.** They require the window in the foreground, and a background process is not
  permitted to take it. Sent anyway, one keystroke reached the picker's "new folder" command and created
  an empty directory nobody asked for. It was removed.
- **The application's own stop control.** It answers "stopping when the current safe step finishes", and
  the current step is the dialog. Refusing to abandon a step half-done is correct behaviour.

That the shell resists a background process choosing files for a person is a security property, not an
obstacle to route around. So `scripts/observe-folder-dialog.ps1` observes instead of answering: it reports
that the application asked the operating system and what the prompt says, which is what can honestly be
verified. **A person choosing a folder remains part of this product's acceptance.**

## The five profiles through the installed window

`native-journeys.json` records the matrix, reproducible with `npm run evidence:native`. **Five profiles,
zero findings.** Per profile: opened from the application's own history, context prepared in the interface,
a search whose answer was known in advance, reflow at three widths, and the person's files re-hashed.

| Profile | Citation the interface returned | Resolves on disk | Files changed |
| --- | --- | --- | --- |
| Investigación | `metodo.md · línea 3` | yes | none |
| Software | `README.md · línea 3` | yes | none |
| Unity | `notas.txt · línea 1` | yes | none |
| Contenido | `notas.txt · línea 1` | yes | none |
| General | `notas.txt · línea 1` | yes | none |

A string shaped like a citation is not a citation, so each one is resolved against the file it names and
the line it points at must actually contain the term that was searched for. A plausible pointer to the
wrong place is a finding, not a pass.

**What the engine did and the interface did not.** Two steps only, and they are the two that cannot be
reached without answering the operating system's picker: choosing the folder, and applying the base
preparation — which is the moment a project first enters the history, because that is when the engine
remembers the folder for crash recovery. Everything the table above reports happened in the window.

The run uses the application's own isolated data directory, so it never touches the projects or history of
whoever is using this machine. Earlier iterations of this script produced ten findings before the selectors
matched the real interface, which is the evidence that it can fail rather than pass by construction.

## Opening a project in a local application

`local-launches.json`, reproducible with `npm run evidence:launches`. Launching puts a window on someone's
screen, so it is opt-in: without `--launch` the check verifies recognition and every refusal path and opens
nothing.

Against the applications really installed here, with nothing injected:

| Agent | Result | Refuses a changed identity |
| --- | --- | --- |
| Codex | verified, OpenAI OpCo, LLC | yes |
| Cursor | verified, Anysphere, Inc. | yes |
| Visual Studio Code | verified, Microsoft Corporation | yes |
| Antigravity | **the installed artifact does not offer it yet** | — |

"Refuses a changed identity" is checked against the real signed application: the recorded identity is
altered and `open` must fail with `APP_CHANGED` rather than launch. All three refuse.

One launch was observed. Cursor received a folder deliberately named with a space and an ampersand — if the
path were ever passed through a shell, that is where it would break — and the process count went from 0 to
1. The result reports `projectAttached: true` and `agentReadProject: false`: handing a folder to an editor
is not evidence that an assistant read it, and the record refuses to imply otherwise.

**A gap this check found.** Antigravity is installed on this machine and this working tree recognises it,
but the installed artifact was built before that change, so it reports the agent as absent. Reporting that
as "not installed" would have hidden the difference, so the record separates *not on this machine* from
*not offered by the installed build*. Verifying Antigravity natively needs a new artifact first, which is
task 3.3.

## What this does not cover yet

The installer's own wizard pages are still unexercised: reaching them means running the installer, and its
security prompts need a person for the same reason the folder picker does. Trusted local launches have not
No public release or landing deployment exists yet, and no artifact has been built from the current tree,
so nothing native exercises Antigravity, the interview answer that this change added. Those remain open
tasks here, not satisfied ones.
