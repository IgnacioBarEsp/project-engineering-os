# Visual reference review

Two current Sites of the Day were opened live and observed on 11 September 2026, from the Awwwards
listing at `https://www.awwwards.com/websites/sites_of_the_day/`. Nothing was imported: no asset, no
markup, no stylesheet, no script. What follows is what was observed and what it changed in our own page.

## What was looked at

**Unseen Studio — `https://unseen.co/`.** A warm off-white ground, one large serif letterform holding the
centre, and a small centred block of text beneath it. Almost the whole viewport is empty. There is no
navigation competing for attention at first paint. Hierarchy is carried entirely by type size and by the
space around it.

**basement.studio — `https://basement.studio/`.** A near-black canvas with a thin persistent top bar of
small-capital labels, and a single saturated red word as the only colour accent in view. The expressive
weight sits in a runtime scene rather than in the layout.

## What transfers, and what does not

The discipline transfers; the technique does not, and saying so is the point of this review.

Both pages spend their budget on motion and brand expression. Ours cannot: `site/index.html` ships **zero
scripts**, makes no external request, and has to reconcile every number it prints against raw measurement
data or its own check fails. A page that must survive `verify-landing.mjs` is solving a different problem
from a studio portfolio, and copying the approach would mean adopting a runtime we deliberately do not have.

What we did take, as principles already visible in the page rather than as new work:

- **One focal element per view.** The hero carries a single orbit mark and a single statement, in the
  manner of Unseen's single letterform, instead of competing panels.
- **One accent colour, used sparingly.** A green eyebrow marks the measurement section and little else,
  which is the restraint basement.studio applies to its single red word.
- **Type-led hierarchy with generous space**, so the page reads at 240 pixels and at double text size —
  both verified — rather than depending on decoration that reflow would break.

## What we deliberately did not take

- No dark full-bleed canvas as the default. The page ships a complete dark palette for readers who ask for
  one, and both schemes are contrast-measured; it does not impose one.
- No scroll-driven motion, no WebGL, no loading sequence. They would add a runtime, and the page's claim
  is that it needs none.
- No expressive copy that outruns the evidence. Neither reference has to reconcile its adjectives with a
  raw data file; this page does.

## Limits of this review

Two references, one day, one reviewer, observed on a desktop viewport. It is a record of observations and
the decisions they led to, not a design audit, not a survey of the field, and not evidence that the
resulting page is good. No person other than the agent writing this looked at the result.
