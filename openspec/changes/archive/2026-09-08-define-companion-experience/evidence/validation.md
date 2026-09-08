# Validation — 2026-09-08

Scope: #76 discovery, browser prototype and upstream UI profile activation. This is not evidence of a
working Companion installer, AI integration, measured token savings or a representative user study.
The maintainer explicitly delegated implementation/review/integration; the external-AI decision is a
direct interview answer. Optional external installations use detect/configure/review as a stated
assumption. No conference date or mandatory provider was invented.

## Automatic evidence

- PASS DoR: 13 checks after declaring the UI surface; issue belongs to the project and has no dependencies.
- PASS exact local OpenSpec 1.6.0, `validate --all --strict`: 10 items before archive.
- PASS `npm run check` with reviewed npm 11.19.1 and Node 24.18.0 on Windows: 271 tests, no skips/failures;
  package, neutrality, links, workflows and debt checks pass. The initial run exposed 14 tests coupled to
  upstream profile configuration. Seed-only tests now target their existing empty-consumer fixture; the
  runtime and consumer defaults are unchanged.
- PASS installed-tarball fixture: bootstrap, second run, sync, official OpenSpec initialization/adaptation,
  capability matrix and doctor. See `constructor-fixture.json`; this tests the existing CLI regression scope.
- PASS browser prototype: `prototype-results.json`, 5 profiles × 6 steps × 3 widths (320/768/1440), input
  escaping, preserved selections, heading focus, empty-AI validation/recovery, keyboard radio selection,
  error simulation/retry, reduced motion, 200% CSS zoom reflow and zero browser exceptions. CSS zoom is
  explicitly distinct from native browser zoom. A 100-character unbroken name is checked while visible
  in steps 1–4, including the review screen. Text pairs meet 4.5:1 and field borders meet 3:1.
- PASS local preview serves only the prototype routes; attempts to read package.json return 404.

Reproduce prototype checks with Playwright available to Node, or set `PROJECT_OS_PLAYWRIGHT_MODULE` to its
installed module entry, then run `node scripts/prototypes/verify-companion.mjs <evidence-directory>`.
This optional tool is not a new runtime dependency. `node scripts/prototypes/serve-companion.mjs` serves
the non-mutating preview on loopback port 30066.

## Observed review

The implementing agent inspected the actual Estudio/Plano/Papel and mobile screenshots retained beside
this report. Selected states, progress, primary action and prototype limitation remain legible; no
horizontal overflow at 320px. Estudio is the implementation recommendation under delegated judgment,
with Plano as the dark identity reference; it is not a claimed user preference study.

The independent review agent inspected the Chromium accessibility tree: named controls, selection,
heading hierarchy and validation alert description/focus are exposed. Keyboard navigation was executed.
This is semantic/keyboard review, **not** proof with a native screen reader. Loading, empty-project and
offline writing states are reviewed as the documented contract for #79–#81; the prototype has no async
write/network operation. Its actual incomplete-selection and simulated failure states were exercised.
No manual-evidence field should be read as certifying the future app or installer.

Five readiness contracts separate folder preparation, context verification and external tool availability.
Research does not assume OCR; Unity does not assume an installed editor; media does not assume a model
or GPU; web chat requires review/export; general work does not require Git. Recipes/context are scoped
by task. The benchmark protocol separates source retrieval, actual provider tokens, quality and setup
cost; unknown outcomes remain unmeasured. This reviews declared degradations, not runtime integrations.

Documentation is reachable from README → docs index → Companion experience, then links to its design,
architecture and evaluation. Consumer-specific skill names were removed from public neutral guidance;
their process informed design without copying their product policy. UI activation affects only upstream
`.project-os/profiles.json`; the universal blueprint remains unchanged.

## Recovery and limits

PASS recovery rehearsal of the existing constructor: create a temporary Git folder with an original
note, bootstrap, explicitly roll back its transaction, compare original bytes. Result APPLIED →
ROLLED_BACK and original preserved, recorded in `recovery.json`. Prototype navigation and restarting
remain reversible; its preview performs no filesystem mutation. Discovery rollback is reverting this PR
and its upstream UI activation, preserving historical evidence and all consumer folders.

No new runtime package, paid service, telemetry, uploaded document or user credential was introduced.
Desktop dependency pins/license/audit evidence, clean-Windows distribution, native accessibility, actual
handoff and before/after measurements remain owned by #77–#81. The program #66 stays open.
