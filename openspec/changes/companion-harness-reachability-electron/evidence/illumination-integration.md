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
