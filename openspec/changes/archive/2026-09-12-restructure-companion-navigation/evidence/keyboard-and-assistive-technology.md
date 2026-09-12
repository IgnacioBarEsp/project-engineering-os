# Keyboard and assistive-technology review — what was driven, and what was not

This is the evidence `readiness.json` points at for the `ui` profile's
`keyboard-and-assistive-technology-review`. It says plainly what was driven by machine, what a machine
cannot stand in for, and where the line is — because an earlier version of this branch pointed that item at
a probe file and called it an assistive-technology review, and an independent review refused that.

## What was driven, and how

Both harnesses read the accessibility tree — names, roles, landmarks, live regions, pressed state — rather
than the pixels, because that is what an assistive technology actually consumes. `ACCESSIBLE_NAMES` in
`apps/companion/scripts/interface-contract.mjs` resolves a control's name the way a screen reader would:
`aria-label`, then `aria-labelledby` against the element it names, then the control's own text, then its
associated `<label>`, then `title`.

On **29 screens across the five profiles** — every screen a click lands on, plus the term-definition dialog —
with **0 findings**:

- **Every visible control has an accessible name.** Mutating one away (removing the search button's text)
  is detected; it is mutation `a-control-loses-its-accessible-name` in `interface-contract.json`.
- **The navigation carries a name.** `<nav aria-label="Navegación principal">`, checked on every screen
  rather than assumed from the markup.
- **Every screen has at least one live region**, so progress and errors are announced rather than only
  drawn: `#activity` is `role="status" aria-live="polite"`, `#feedback` is `role="alert"`, `#notice` is
  `role="status"`.
- **The dialog carries an accessible name** through `aria-labelledby="dialog-title"`, and the title is
  non-empty when it opens. Asserted on the term dialog in all five profiles.
- **Each project tab declares whether it is the active one** with `aria-pressed`, so the current tab is not
  conveyed by colour alone.
- **Heading order has no skipped levels and exactly one `h1` per screen**, including inside the dialog.
  This found three real, pre-existing defects — Inicio, the folder step and the project screen all went from
  `h1` straight to `h3` — which are corrected in this change.
- **Every control that opens a definition is a real `button`, focusable and keyboard-activatable.** 336
  such controls were checked across the five profiles, each against the term its `data-term` names: **0
  mismatches**. A control that says one word and opens another concept's definition now throws when the page
  is built, and is also detected in the rendered result.
- **Focus returns where it came from.** Opening the privacy dialog with the keyboard, dismissing it with
  `Escape`, and asserting focus is back on the control that opened it — driven at 480 px in all five
  profiles.
- **Contrast** meets 4.5:1 for normal text and 3:1 for large text, measured on the rendered page with the
  effective background resolved by walking up to the first opaque one, **across the whole document** rather
  than the main region. That widening came from this review: the persistent sidebar and every dialog were
  outside the earlier probe, and both were shown to accept an illegible contrast without failing.

## What a machine did not and cannot do

- **No screen reader was driven.** Not NVDA, not JAWS, not Narrator. Reading the accessibility tree tells
  you a control has a name and a role; it does not tell you that the announcement makes sense in sequence,
  that the reading order matches the visual order for a person listening to it, or that a live region fires
  at a useful moment rather than interrupting.
- **No person who relies on assistive technology used this application.** That is the review this item is
  ultimately about, and nothing here substitutes for it.
- **Reduced motion** is asserted (the entry animation is `none` under `prefers-reduced-motion`), but no
  vestibular-sensitive person judged the result.
- **Zoom and reflow** are covered at CSS widths 1180, 768, 480 and 240 px with no horizontal overflow, which
  is the 400 % reflow requirement expressed in width. Text-only zoom and OS-level scaling were not tested.
- **Colour is not the only carrier** of the project states by construction — each state has a word — but no
  colour-vision-deficiency simulation was run.

## What the criterion actually asks

Worth stating precisely, because both reviews and this session's first draft broadened it. The issue's
seventh criterion reads: *"Contraste, orden de encabezados, navegación por teclado y reflujo se mantienen
verificados en las pantallas nuevas."* Four things, and all four are verified above on 29 screens, each with
a mutation that breaks it and fails. The criterion does not ask for a screen reader or for a person who uses
assistive technology.

That is not an argument for stopping here. It is the difference between a criterion that is met and a review
that is complete, and this document is where the second one is bounded.

## The line

What is verified here is the machine-observable half: names, roles, landmarks, live regions, heading
structure, focus behaviour, keyboard reach and contrast, on every screen, with each property proved by a
mutation that breaks it. What is **not** verified is whether the result works for a person using assistive
technology. Those two are not the same thing, and this record does not let the first stand in for the second.
