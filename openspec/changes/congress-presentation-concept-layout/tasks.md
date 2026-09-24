# Tasks — congress-presentation-concept-layout

## 1. Reproduce and fix

- [x] 1.1 Verify the #165 proposal-readiness gate (13/13) and preserve the recorded visual failure as baseline evidence.
- [x] 1.2 Move the concept-slide right-column sentence beyond the left card, retaining the slide margin.
- [x] 1.3 Add a focused geometry regression that detects the sentence/card overlap for every concept slide.

## 2. Validate deliverables

- [x] 2.1 Rebuild the 22-slide PPTX from the corrected versioned generator and record its SHA-256.
- [x] 2.2 Run numeric and geometric checks; verify all 90 figures and zero layout collisions.
- [x] 2.3 Export an offline PDF, confirm 22 pages, render all pages, and inspect the entire deck visually.
- [x] 2.4 Record PDF metadata and both final hashes; retain the corrected PPTX/PDF in the evidence dossier and outside the npm package as downloadable documentation deliverables.

## 3. Close safely

- [x] 3.1 Complete adversarial review and a debt assessment for this bounded documentation change.
- [x] 3.2 Run repository checks and OpenSpec strict validation.
- [ ] 3.3 Preserve the corrected PPTX/PDF in the evidence dossier and link both branch artifacts from #165 with their hashes; replace these with main-branch links after merge.

Release order after these tasks: run the local archive gate, archive with the pinned OpenSpec CLI, open and
merge through a protected PR, then close #165 only after the required CI checks and acceptance conditions pass.
