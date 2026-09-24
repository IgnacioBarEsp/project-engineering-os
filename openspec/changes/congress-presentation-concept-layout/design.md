# Design: concept-slide columns

## Root cause

The six concept slides alternate the explanatory sentence between left and right columns. For the right-hand
sentence, the generator used `x = 6.3` while the left card ends at `x = 6.4` (`x = 0.8`, `width = 5.6`).
The resulting 0.1-inch overlap is rendered as covered text because the card is layered over the sentence.
The general geometry checker deliberately excludes empty shapes from overlap checks to avoid flagging text
inside cards; that also hid this text-versus-card collision.

## Decision

Place the right-hand sentence at `x = 6.6`, leaving a 0.2-inch gap after the card. Keep its width at 5.6
inches, which remains within the right margin. Add a focused OOXML geometry assertion for the concept sentence
and unlabelled card on each of slides 6–12. This guards the actual layout contract without treating legitimate
text placed inside cards as an error.

## Verification

Build from the versioned generator with the pinned temporary `pptxgenjs` build tool; do not add it to package
dependencies. Check 22 slides and all 90 figures, run the geometry regression, export a local PDF, and inspect
all 22 rendered pages. Record the PPTX/PDF SHA-256 values and attach the verified PDF (and corrected PPTX) to
the already-open #165.

## Risk and recovery

The layout change is limited to three alternating concept slides. The visual render is the decisive check
because font substitution and text overflow are not captured by coordinate bounds alone. If any page still
clips or overlaps, do not attach it; adjust the generator and repeat the render. Reverting the PR restores the
previous generator and checker.
