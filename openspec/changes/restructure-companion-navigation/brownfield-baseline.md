# Brownfield baseline

What exists before this change, read from the code rather than from summaries. Verified on `main` at
`0ba59af`.

## The interface as it stands

`apps/companion/ui` is three files served over a private `peos://` scheme whose asset allowlist lives in
`desktop/main.mjs` and rejects anything not named in it: `index.html`, `app.css`, `app.mjs` (226 lines,
one function per screen, no framework).

The sidebar holds exactly two navigation buttons:

- `#home` — labelled **"Tus proyectos ↗"**, calls `home()`.
- `#new` — labelled **"Preparar una carpeta ＋"**, resets the selection and calls `showSetup()`.

`home()` is not a project list. It renders, in this order: an eyebrow ("MENOS PREPARACIÓN. MÁS CLARIDAD."),
a hero heading, an intro paragraph, a primary button labelled **"Preparar mi proyecto ↗"** which also calls
`showSetup()`, a three-item numbered feature row, and only then the heading "Tus proyectos" with the cards.
So the maintainer's first two findings are both literally in `app.mjs:24-37`: two navigation entries with
different names for one action, and a home page wearing the list's name.

`listProjects` in `desktop/service.mjs:90` returns `{id, name, root}` and nothing else, so the list cannot
show a state even if it wanted to. The remembered history item already carries `selection`; the state of the
folder does not reach the renderer at all.

The export control is labelled **"Preparar contexto para compartir"** (`app.mjs:187`) and sits inside the
sources tab; it opens a dialog titled "Revisa antes de compartir" that shows the bytes and extracts that
would be copied. The function is right and the name is not.

There is no help destination and no glossary anywhere in the application. `Recetas` renders
`context/recipes.mjs` verbatim, which contains "revisa adversarialmente", "OpenSpec" and "SDD" with no
definition reachable from the screen. `docs/companion/EXPERIENCE.md` describes the eight-step main journey
but no navigation map.

## What the checks currently assert

Two harnesses constrain any change to the strings above.

- `scripts/verify-ui.mjs` drives the real renderer and the real engines in a headless browser with the
  native picker, clipboard and launcher injected. It asserts exact headings and exact button names, and it
  walks five profiles end to end, including `Tus proyectos` → `Abrir →` for the reopen check.
- `scripts/verify-native-journeys.mjs` drives the **installed** application's own window over its debugging
  port, against an isolated data directory. It clicks a button matching `/Tus proyectos/`, matches
  `article.project` cards by heading, and waits for the list to detach. It takes the installed
  `resources/app` directory as an argument, loads the core and `desktop/service.mjs` from there, and
  launches the installed executable beside it. Nothing in it compares the installed interface against the
  branch, so a run can silently measure an older window — the exact finding the last adversarial review
  raised about the model experiment.

## Constraints carried in

The core stays at 0.5.0 and is not republished. The required gate is `CI / required` and nothing may be
added to it or removed from it. `asar: false` means the installed `ui/` is plain text on disk, which is what
makes it possible to run the window against this branch without rebuilding the installer — and also why no
API key may ever live in the application. The debt plan stands at **4 of 5 units**, threshold 5: one more
open item in `defect`, `technical-debt`, `external-risk` or `decision-required` pauses the plan. Evidence is
public, so it carries no absolute path, account name or session identifier, and screenshots are included in
that rule — anchoring is applied in the page before the capture, because no check reads an image.
