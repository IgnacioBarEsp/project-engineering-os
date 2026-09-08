# Baseline — 2026-09-08

Main ab0b58a after PR #82, constructor 0.3.0. 271 core tests pass; UI profile activated only upstream.
The six-step prototype has no file writes. Core plan/transaction APIs exist and retain Git-root checks
and ownership collisions. No Companion engine, context extractor, app package or installer exists yet.
This change must not make consumer policies inherit the upstream UI profile or add app dependencies to npm core.
