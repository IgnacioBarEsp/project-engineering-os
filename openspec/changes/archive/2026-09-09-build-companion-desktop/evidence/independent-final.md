# Independent adversarial revalidation — #79

Date: 2026-09-09. Reviewer: separate agent `revalidate_companion_desktop`, applying the
borrowed adversarial-review skill. Scope: `build-companion-desktop`, against the working
implementation on `codex/companion-desktop`; this is neither human approval nor an installer audit.

## Contract and inspection

Read proposal, design, companion-desktop requirements and tasks before reviewing the implementation. Inspected
desktop service, Electron entry point, preload, shipping renderer/CSS, service tests, browser verifier
and changes to base selection, context configuration and the public-source neutrality scan.

The contract separates base/context/engineering readiness and leaves installer distribution (#80),
full native journeys and benchmarks (#81), and existing-file adoption to subsequent work. Current UI
does not claim OpenSpec activation, a loaded external agent, attached folders or executed graph tools.
Main/preload inspection found fixed local assets, restrictive CSP, isolated sandboxed renderer, exact
sender validation, named IPC methods, native-selected/history handles and fixed provider URLs.

## Executed evidence

- `node --test apps/companion/qa/desktop.mjs`: 9 tests passed, zero failed (26.8 seconds).
  This includes real published-core bootstrap/sync, persistent exclusions, stale selection/history,
  opaque reviewed handoff, cancellation and real interrupted engineering resume/rollback.
- Independent recovery reproduction: `APPLIED` after resume and `ROLLED_BACK` after rollback;
  synthetic original document preserved in both cases.
- Independent handoff abuse reproduction: modifying returned prompt/destination cannot change the
  stored reviewed text or destination. Extra URL fields, nonboolean copy and successful-preview replay
  are rejected. Source changes, refreshed receipts and exclusion changes expire consent before any
  clipboard/open operation. `copy: false` opens the fixed destination without copying. Starting prompt
  uses the actual `.project-os/companion/context/MAP.md` location.
- Negative renderer reproduction: failed export copy closes the modal, exposes an accessible alert
  and restores its launch button's focus. Escape focus restoration remains stable after 100 ms.
- Long-name reproduction: 98-character project title causes no document overflow at 480 or 240 CSS
  pixels, on home and workspace.
- Five-profile renderer/service verification passed on a temporary copy of `verify-ui.mjs` with
  conditional focus waits replacing immediate assertions, then independently passed again from the
  actual repository verifier after the owner applied those waits (run started 10:58:51 UTC): research
  PDF/DOCX citations; software and
  Unity constructor composition; media and general flows; exclusions, recipes, preview/copy/handoff,
  reopening, reduced motion, 1180/768/480/240 CSS widths, original-file preservation and zero renderer
  exceptions. Native picker, clipboard, external launch and IPC were injected, as explicitly declared
  by the verifier. Project writes and source parsing used the real engines.

## Findings

| Severity | Finding | Evidence and resolution |
| --- | --- | --- |
| Minor, resolved | Browser verifier raced the asynchronous dialog `close` event. | Unmodified verifier once read `Cerrar ×` immediately after Escape. Waiting for the expected active element passed all five profiles; an independent focused reproduction confirmed stable focus after the event and 100 ms later. Owner replaced both immediate post-Escape assertions with conditional waits, without arbitrary delays. Reviewer inspected the change and reran the actual repository verifier: all five profiles passed. |

No unresolved Blocker or Major was found in the bounded revalidation. Previously reported exclusion,
stale history/goal, engineering recovery, hidden error, long-name and MAP-path failures were not
reproduced after their fixes.

## Limits and verdict

This review used synthetic temporary projects and headless Edge, not shared native windows or private
documents. It does not establish native Electron/installer permission enforcement, assistive-technology
certification, live AI activation, measured token savings or all-format document coverage. Those claims
require their separately scoped evidence. No implementation files were edited by this reviewer.

**PASS**: no unresolved Blocker, Major or Minor in this bounded review. The discovered test
synchronization issue was corrected and independently revalidated. Archiving #79 is advisable after
completing the change's normal evidence, debt/readiness and protected-integration requirements. This
verdict does not close the separate installer or end-to-end program issues.
