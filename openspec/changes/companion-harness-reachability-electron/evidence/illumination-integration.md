# Final motion refinement integration — 2026-09-30

Parent #149: `0e4a19b`; #150 predecessor: `d9ce734`. Retain both the alpha-token
centralization and the new ambient/sheen tokens when resolving tokens.css.

Implemented exact body ambient and finite scoped sheen exceptions, unconditional
transition-duration limits, rejection of other repeats, finite-only journey settling,
and two additional targeted negatives (wrong-origin sheen and repeated sheen).
No prior negatives removed. Route measurements also execute the shared AMBIENT probe.

Observed by implementer on integrated local renderer:

- Companion 220/220, exit 0.
- Declared routes 20, route cells 120, targeted negatives 16, exit 0.
- Real Electron shell: all responsive/ambient/sheens checks and six CSS mutations pass,
  no failures, exit 0. Source-only; no installer, native picker or ordinary shutdown claim.
- Broad Electron journey: 18 captures, 12 exact native clipboard copies, no failures,
  exit 0; source SHA-256 `0a1cca10973347f50686fb2f4a6eafae47809038f0caa949cee1f48d941787a7`.
- Both active OpenSpec changes validate strict, exit 0.

Artifacts remain outside Git under Windows Temp, `peos-wave3-harness-final-{routes,shell,native}`.
The full UI journey is still running; no PASS is asserted for it here. Root 391/391 is
attributed to the #149 parent only, not this newly changed harness tree. Previous CI is
not evidence for these bytes; repeat protected CI before integration.

Separate-agent reviewer `/root/wave3_final_bugbot` reviewed all staged/unstaged merge
and harness modifications, ran focused QA 6/6 (exit 0), and found no actionable bugs.
It checked retained tokens, motion exceptions, finite waits and exact negative categories.
This is an agent fallback, not external Bugbot or human acceptance. Earlier independent
reports retain their original scope and identities. Human final cold reading, export
observation, visual acceptance, archive and protected merge remain open. No Wave 4 work.

## Completed UI run and new CI blocker

The full UI command subsequently completed with exit 0: 28 wizard journeys, 168/168
screens, 1876/1876 reachable controls, 56/56 exact copies, zero wizard problems; the
20-route/120-cell/16-negative matrix, profile compatibility and wizard isolation also
completed. Artifacts: `peos-wave3-harness-final-ui` in Windows Temp. The earlier
in-progress statement records the order of observations, not the final result.

Protected CI on the published refinement fails production audit, not the UI tests:
three vulnerabilities in npm's bundled brace-expansion, ip-address and undici.
Tracked separately at #204. Disposable probes of npm 11.20.0, 12.1.0 and scoped
overrides did not remedy them; repository pins and production distribution unchanged.
No audit exception, downgraded gate or successful aggregate is claimed. Closing the
wave requires resolving #204 and actual human observations, not just this UI PASS.
