# Brownfield baseline

What existed before this change, taken from the code rather than from summaries.

## The application

`apps/companion` ships an Electron application with its own package and release cycle, never seeded into
the neutral core. Its engine prepares a folder, indexes documents into a citable context, and for software
and Unity profiles installs a hash-pinned toolchain — Node 24.20.0, MinGit, a bundled npm and, on request,
CodeGraph 1.6.0 — each verified by URL, size, SHA-256 and a whole-tree digest before use.

Three changes landed immediately before this one:

- **#87** activated and verified the per-profile environment: relocation and interruption detection, an
  HMAC-sealed code map index, ownership-recorded instruction files kept out of the document corpus, and a
  worker startup allowance so a readable PDF is not charged the parser budget.
- **#80** packaged the application as a per-user Windows installer: an allowlisted file set, the reviewed
  npm distribution shipped as a sealed archive that no file filter can thin out, and an artifact verifier
  that walks the whole installed tree and compares each bundled tool against its catalog pin.
- **#81** ran five profile journeys through the installed application's **service layer**, measured
  retrieval against a synthetic corpus, and published a landing page. Its adversarial review returned FAIL
  with four blockers, three of them because the measurement had been built so the product could not lose;
  correcting it moved a baseline from 5/10 to 8/10.

## What the program still lacked

Issue #66's closing criteria were not met by those three. Specifically:

- **No journey had ever driven the installed application's interface.** #81's ran through the service
  layer, with the folder choice injected; the interface was covered only by browser journeys against a
  development harness.
- **No measurement had ever involved a model.** #81 compared retrieval methods deterministically and said
  so; a claim about what preparing a project does for an assistant had no evidence either way.
- **Nothing was published.** No release existed, no landing was deployed, and the page said so.
- **The interview was unanswered.** `docs/companion/EXPERIENCE.md` recorded the conference date, the
  required AI and the depth of external installation as pending, with provisional assumptions in their
  place.
- **Antigravity was not offered at all**, so a person who used it could not say so.

## Constraints carried in

The core stays at 0.5.0 and is not republished. The required CI gate is `CI / required` and nothing may be
added to it or taken from it. Branch protection, DCO sign-off and the debt budget apply unchanged; the
plan stood at 4 of 5 units on entry. Evidence is public, so it carries no absolute path, account name or
credential — a rule this change broke once, in a screenshot, and repaired at the point of capture.
