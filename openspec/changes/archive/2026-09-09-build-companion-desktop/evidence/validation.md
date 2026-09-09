# Validation of #79

Date: 2026-09-09. The maintainer expressly delegated #66 implementation, review and integration.
The approved spec precedes this implementation. Definition of Ready: 13 PASS after #78 / PR #84.

## Automated behavior

- Core `npm run check`: 287 PASS; package, neutrality, documentation, workflow and debt checks passed.
  The source scanner now excludes nested ignored dependency directories while still checking adjacent
  app sources; a regression proves a simulated secret beside dependencies remains detectable.
- Core tarball fixture: PASS. No app runtime dependency is added to the neutral core package.
- Desktop service: nine PASS, using the pinned published core. Five profiles, original preservation,
  history/reopen, invalid handles/payloads, stale plans/exports/handoff, cancellation, exclusions through
  sync, failed-selection history and interrupted real constructor resume/rollback.
- Context suite: fourteen cases, with the existing PDF/DOCX/source/Unicode/interruption regressions.
  The combined app suite is required by all three Companion CI jobs.
- Browser verification: all five journeys pass with the shipping renderer and real service/engines.
  Research checks actual PDF page and DOCX paragraph citations; software/Unity run the real constructor
  and canonical sync. Search, recipe, reviewed copy/handoff, exclusions, history, original preservation,
  no source markup execution and zero renderer exceptions are checked.
- Core dependency audit: zero high/critical findings and zero exceptions. Full private-app npm audit,
  including development dependencies: zero reported vulnerabilities at verification time.
- Local OpenSpec 1.6.0 strict validation passes. Protected remote CI remains required before merge.

The browser test injects native picker, clipboard, external launch and transport only. It is not a native
installer or Electron sandbox exploit test. Screenshots mask temporary machine paths for publication;
fixtures and document excerpts are synthetic. No private maintainer documents are used or published.

## Native Windows observation

The actual Electron window was operated with the Windows computer-use API, including its native folder
dialog. A synthetic research project was named, given an objective and chat-web choice, and its temporary
folder selected. The reviewed four base operations and nine context operations completed through the UI.
The window showed the actual one-source, one-fragment, 193-byte extraction before saving, then the project
workspace with prepared configuration/context. Source files were not replaced. This verifies native
folder selection and preparation, not installer distribution or external AI activation.

The first development launch exposed an ESM startup deadlock from awaiting app readiness at the module
top level. It was corrected to an app-ready callback; the window then appeared and the native journey
completed. The initial workflow also placed Next below the visible area; preparation actions now remain
visible at ordinary window sizes, returning to document flow at constrained zoom/height.

UI Automation exposed labeled fields, groups, buttons and source-search controls. Keyboard entry and
native dialog confirmation were exercised. The helper's direct value-setting and cached element actions
were occasionally unavailable; focus was checked visually before typing and state refreshed. No screen
reader certification or full assistive-technology audit is inferred. The user interacted with the machine
during later search inspection, so further native input was deferred; the browser journey verifies search.

## Accessibility, visual ground truth and states

Actual screenshots were inspected against the approved Estudio direction: dark navigation, light work
surface, editorial heading, restrained green primary action, visible stages and clear local-data scope.
The Awwwards references in `../visual-references.md` inform hierarchy and spacious composition. The app
uses semantic controls and restrained transitions; the expressive landing comparison remains in #81.
No third-party artwork, font or code was copied and no award-level equivalence is claimed.

Browser checks cover 1180, 768, 480 and 240 CSS-pixel widths (240 models a 480-wide window at 200% scale),
including a 98-character unbroken title, reduced motion, Escape and restored focus. They do not replace
the packaged application's native zoom check. Empty history, pending stages, stale context, failed copy,
source exclusions, unknown handles, interrupted work and original-preserving recovery are exercised.
The local UI has no network-dependent content; source/engine work remains local and provider launch is
an explicit separate action. In native preparation, actual progress appears before completion.

Calculated WCAG text contrast ratios for the authored color pairs: body 14.95:1, secondary 5.86:1,
primary action 7.63:1, sidebar secondary 8.69:1, status 7.89:1, error 9.05:1. Each exceeds 4.5:1.
These calculations are bounded checks, not a claim of complete WCAG conformance.

## Adversarial findings and resolution

Initial independent review reproduced lost exclusions after sync, uncommitted objectives in history,
unrecoverable interrupted engineering, hidden modal errors, overflow of long names and an incorrect MAP
path. All were corrected and independently revalidated. The later review also tested opaque handoff
consent against alteration, staleness and replay. A browser-test race against the asynchronous dialog
close event was fixed with a condition wait, not an arbitrary delay. See `independent-final.md` for its
actual origin, PASS and limits. This is agent review, not human approval.

The implementer's browser pass additionally found focus lost by disabling a trigger before opening its
dialog; the trigger is now captured first. Tests exercise this with the real asynchronous service.

## Debt, recovery and remaining program work

No unresolved candidate remains in the approved #79 scope. Assessment is clean. Recovery restores only
hash-validated owned changes and rejects intervening edits. Upstream rollback reverts this PR, preserving
consumer originals, journals and project history. Distribution, provisioning and runtime activation,
existing-file adoption #85, full installer/agent journeys, landing and model benchmarks remain separate
program work. #66 must stay open; no token saving, universal compatibility, signing or perfection is claimed.
