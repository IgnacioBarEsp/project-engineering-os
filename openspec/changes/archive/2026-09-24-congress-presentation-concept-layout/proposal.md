# Fix the congress-deck concept-column overlap

## Why

Issue [#165](https://github.com/IgnacioBarEsp/project-engineering-os/issues/165) remains open for the final
offline PDF. A fresh render of the PPTX in the evidence dossier showed that the large explanatory sentence is
partly covered by its adjacent card on slides 7, 9, and 11. The existing bounds checker skipped unlabelled
background shapes, so it passed despite the visible occlusion. The PPTX hash also differs from the hash in the
merged evidence, so the current output needs a fresh, traceable build and visual validation.

## What Changes

- Correct the alternating concept-slide grid so the explanatory sentence has a visible gap from the card.
- Extend the deck geometry check to fail if that sentence overlaps its card on any of slides 6–12.
- Rebuild the deck from its versioned generator, verify the 22-page PDF visually, publish both artifacts next
  to the presentation script outside the npm package, and record their hashes in #165.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `public-documentation-experience`: a public slide deck keeps concept explanations unobscured and readable.

## Scope and rollback

This is a documentation artifact and its archived generator/checker; it does not change product behavior,
application UI, measurements, dependencies in the published package, or the claims in the deck. The binary
deliverables are outside `package.json`'s published-file allowlist. Rollback is a revert of this PR; the
original PPTX and first PDF export remain preserved locally as recoverable review artifacts.
