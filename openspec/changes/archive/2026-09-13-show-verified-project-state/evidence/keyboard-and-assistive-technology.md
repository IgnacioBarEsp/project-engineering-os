# Keyboard and assistive-technology review — what was driven, and what was not

This is the evidence `readiness.json` points at for the `ui` profile's
`keyboard-and-assistive-technology-review`. It is the same document the previous change shipped, updated for
the screens and controls this change adds, and it keeps the same line: what a machine can honestly verify, and
what it cannot stand in for.

## What this change adds to the surface being checked

- The project card is now the control that opens the project. Its accessible name is the project's own name
  followed by the interface's name for the action, carried in a screen-reader-only span — so a person
  listening hears which row they are on, while the interface's own name for the action stays single. The
  `ROW_ACTION_PAIRS` probe removes the person's content before reading the name, and one row action carrying
  two names fails the check.
- Each row has a secondary disclosure (`<details>`/`<summary>`) whose visible label is `⋯` and whose spoken
  name is `Más acciones` plus the project's name. It is keyboard-reachable and counted among the focusable
  controls on that screen.
- The guidance inside a project is an ordered list with an `h3` per step, so the project screen's outline is
  `h1 → h2 → h3` with no skipped level, checked on every screen including this one.
- The text handed to an AI is a `<pre>` block with its own control; the control's name is the same on every
  step and does not collide with the context export's control, which was renamed apart deliberately.

## What was driven, and how

Both harnesses read the accessibility tree — names, roles, landmarks, live regions, pressed state — rather
than the pixels, because that is what an assistive technology actually consumes. `ACCESSIBLE_NAMES` in
`apps/companion/scripts/interface-contract.mjs` resolves a control's name the way a screen reader would:
`aria-label`, then `aria-labelledby` against the element it names, then the control's own text, then its
associated `<label>`, then `title`.

On **36 screens across the five profiles** in the browser journeys and **10 screens** in the mutation
harness — every screen a click lands on, plus the term-definition dialog and the minimum-width viewport —
with **0 findings**:

- **Every visible control has an accessible name**, including the card that opens a project and the `⋯`
  disclosure, whose visible text alone would not name anything.
- **The navigation carries a name**, checked on every screen rather than assumed from the markup.
- **Every screen has at least one live region.** The guidance's copy control writes into `#notice`
  (`role="status"`), so what was copied and how many bytes is announced rather than only drawn.
- **The dialog carries an accessible name**, and the term a control opens is the term it names: **385
  definition controls** checked across the five profiles, 0 mismatches.
- **Heading order has no skipped levels and exactly one `h1` per screen**, now including the project screen
  with the guidance's `h3` steps, and the list where each card's heading is the card's own control.
- **Every control that opens a definition is a real `button`**, focusable and keyboard-activatable — including
  the ones inside a project card's state sentence, which sit above the card's click overlay on purpose: an
  overlay that swallowed them would put a word on screen with no way to open its definition.
- **Focus returns where it came from** after a dialog is dismissed with `Escape`, driven at 480 px in all five
  profiles.
- **Contrast** meets 4.5:1 for normal text and 3:1 for large text, measured on the rendered page across the
  whole document, in every screen walked. A stylesheet mutation that shrinks the state's qualifier below the
  state's own size is detected by its own probe.
- **Colour is not the only carrier of the new states**: each state has a word, and the mark is an additional
  signal rather than the signal. A mark on a project that is not ready is detected by mutation.

## What a machine did not and cannot do

- **No screen reader was driven.** Not NVDA, not JAWS, not Narrator. Reading the accessibility tree tells you
  a control has a name and a role; it does not tell you the announcement makes sense in sequence. In
  particular, nobody verified by listening that hearing a project's name followed by `Abrir este proyecto`
  reads as one control rather than two, or that `⋯` plus `Más acciones` lands well in a list of several rows.
- **No person who relies on assistive technology used this application.** That is the review this item is
  ultimately about, and nothing here substitutes for it.
- **Nobody judged whether the guidance reads as a sequence.** The steps are ordered and numbered by CSS
  counter; whether a person listening can tell step 2 from step 3 was not verified.
- **Zoom and reflow** are covered at CSS widths 1180, 768, 480 and 240 px with no horizontal overflow.
  Text-only zoom and OS-level scaling were not tested.
- **No colour-vision-deficiency simulation** was run on the new mark.

## The line

What is verified here is the machine-observable half: names, roles, landmarks, live regions, heading
structure, focus behaviour, keyboard reach and contrast, on every screen, with each property proved by a
mutation that breaks it. What is **not** verified is whether the result works for a person using assistive
technology. Those two are not the same thing, and this record does not let the first stand in for the second.
