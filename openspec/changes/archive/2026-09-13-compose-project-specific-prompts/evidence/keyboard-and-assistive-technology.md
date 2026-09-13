# Keyboard and assistive-technology review — what was driven, and what was not

This is the evidence `readiness.json` points at for the `ui` profile's
`keyboard-and-assistive-technology-review`. It keeps the same line as the previous two changes: what a machine
can honestly verify, and what it cannot stand in for.

## What this change adds to the surface being checked

One screen — the handover tab — grows three panels: the composed instructions, who wrote them and what each
level sends, and the text for the person's own AI. Concretely:

- A group of level controls that behave as a choice: each carries `aria-pressed`, and the one that needs a
  model on this machine is **disabled with its reason in text** when nothing answers, rather than hidden.
- A password field for a key, with `autocomplete="off"`, whose label says the key is not saved anywhere.
- Two lists, «Qué se envía» and «Qué nunca se envía», each under its own `h3`, so the outline of the screen is
  `h1 → h2 → h3` with no skipped level.
- Two `<pre>` blocks — the composed instructions and the text for the person's AI — each with `tabindex="0"`
  and an accessible name, so a keyboard can reach and scroll them.
- A textarea inside the dialog for pasting back what their AI answered, with its own label and a note saying
  where that text goes.

## What was driven, and how

Both harnesses read the accessibility tree rather than the pixels. On **36 screens across the five profiles**
in the browser journeys and **9 screens** in the mutation harness, with **0 findings**:

- Every visible control has an accessible name, including the level controls and the key field.
- The heading order has no skipped levels and exactly one `h1` per screen, with the new panels included.
- Contrast meets 4.5:1 for normal text and 3:1 for large text across the whole document, including the new
  disabled control and the monospaced instruction blocks.
- Every glossary word that reaches the new screen has a control on that screen that opens its definition.
  **This is where the stricter reading of that rule paid**: an independent review showed the probe could be
  evaded when two list items sat next to each other in `textContent`, and fixing it found `perfil` uncovered
  on this very screen — and then a second, older one: the tab named `Recetas` had no definition reachable from
  two of the four tabs. Both are fixed.
- Focus returns where it came from after the dialog that shows the text for the person's AI is dismissed.

## What a machine did not and cannot do

- **No screen reader was driven.** Nobody listened to whether the level group reads as a choice, whether the
  disabled level's reason is announced with it, or whether a 2 700-character instruction block inside a `<pre>`
  is navigable by someone who cannot see its shape. That last one is the least covered part of this change.
- **No person who relies on assistive technology used this application.**
- **Nobody judged the screen for someone who does not know what a model is.** The panel explains what each
  level sends, but whether the choice between four levels is understandable was not verified with a person.
- **No colour-vision-deficiency simulation** was run on the chosen-level highlight, which is why the chosen
  level also carries `aria-pressed` and a border rather than colour alone.
- Zoom and reflow are covered at 1180, 768, 480 and 240 px with no horizontal overflow of the page. The
  instruction block scrolls inside its own container on purpose, which is the rule for wide content, but no
  person judged whether that is comfortable.

## The line

What is verified here is the machine-observable half, on every screen, with each property proved by a mutation
that breaks it. What is **not** verified is whether the result works for a person using assistive technology.
This record does not let the first stand in for the second.
