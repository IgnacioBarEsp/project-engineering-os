# Reproducción del defecto original

## Expected vs actual

- Expected: the sentence on each concept slide is visible beside its explanatory card.
- Actual: on slides 7, 9, and 11, the card is painted over the first part of the sentence.
- Scope: only the alternating right-hand text column in the seven concept slides (slides 6–12).

## Baseline artifact

The PPTX in the existing #165 dossier had SHA-256
`27c8437a221ee172ce5a8da80a9f947d8b81959adb2c4ade09f42f62b09fe8f6`, not the
`d165e89849b8f1bc7a226bedac389197d952ea93922d1272552a344e61d213a0` recorded by the merged PR #175.
The current file had 22 slides; its numeric check still passed 90 figures with no mismatches. The pre-fix
geometry check did not see the defect because it excludes empty shapes from the general text-overlap pass.

The new targeted geometry assertion was run against that exact pre-fix PPTX. It failed as expected on precisely
slides 7, 9, and 11, reporting a `-0.10` inch separation between the sentence and card; no other slide failed.

## Root cause

For alternating right-column concepts, `build-deck.mjs` placed the sentence at `x = 6.3` with width `5.6`.
The left card begins at `x = 0.8` and is `5.6` inches wide, so its right edge is `x = 6.4`. The card is drawn
after the text and therefore obscures the overlapping 0.1 inch.
