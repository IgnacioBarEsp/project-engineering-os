# Brownfield baseline — congress-presentation-concept-layout

Measured 24 September 2026 against `origin/main` at `4849001` and the existing dossier file
`congreso-2026-09-24.pptx`.

| Check | Baseline |
| --- | --- |
| Issue | #165 OPEN; issue readiness gate passes 13/13 |
| Existing delivery | PR #175 merged; 22-slide PPTX and 22-page PDF export exist locally |
| Current PPTX SHA-256 | `27c8437a221ee172ce5a8da80a9f947d8b81959adb2c4ade09f42f62b09fe8f6` |
| Hash in merged PR evidence | `d165e89849b8f1bc7a226bedac389197d952ea93922d1272552a344e61d213a0` (does not match current file) |
| Numeric check on current PPTX | 22 slides, 90 figures, 0 problems |
| Existing geometry check | 22 slides, 0 problems; misses overlap with unlabelled card backgrounds |
| Visual check on PDF export | Slides 7, 9, and 11 have text hidden behind the left card; do not attach this export |
| Root cause | Right-column sentence starts at x=6.3 in; card ends at x=6.4 in |

The measurements and claims are not re-run by this change. The correction concerns artifact layout and its
verification only.
