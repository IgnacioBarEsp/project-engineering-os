# TL;DR — congress-presentation-concept-layout

The current #165 deck render clips the explanatory sentence on slides 7, 9, and 11: its x-coordinate (6.3 in)
overlaps the adjacent card, which ends at 6.4 in. Move the sentence to 6.6 in, add a regression check for all
seven concept slides, then rebuild and visually verify the complete 22-page PDF before attaching it to #165.
This is documentation-only; no product code or new published dependency is introduced.
