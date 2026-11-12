# Phase1 revalidation on integrated official npm — #206 / PR#207

Base maincde47a5aed22077818f852d7677310ae4dfe9511 already integrates#204/#214/#152 through protected
PRs with required CI green. Existing phase1head9feea659 received that main by normal merge,
241372a34883fd94ae1fe0d6056ffdbd799fe202, without conflicts or a new implementation patch.

The original reviewed verifier/tests and captured assessment are byte-identical to9feea659.
This revalidation does not recapture, rearchive, reopen, broaden the matching algorithm, or reinterpret
Bugbot's a6127ce review as a fresh review of another head. Earlier approvals, official captures,
negative/recovery results and all historical files remain unchanged.

## Fresh read-only current-state proof

The existing reviewed verifier exports verifyRegistry/verifyFiles/snapshot were called using the
actual current main snapshot (76assessments) and this branch (77). They passed:
50IDs,37→36open, only debt-bee2fa0c0549 resolved with the original exact input/date/evidence;
all49other objects and every76baselineassessment/config byte preserved.
The original captured phase1assessment still exactly equals its approved input.

The old CLI --verify receipt is intentionally bound to its historical73-assessment snapshot. It was
not overwritten or misreported as a fresh77-assessment execution. The read-only adapter supplies the
fresh actual baseline to the same existing verifier functions; no source or relaxed predicate was added.
No capture/exercise/--verify CLI mode or write to repo evidence occurred during this check.
Source stayed clean throughout.

Actual current native identity guard source remains SHA256
e1d35a40ff2fda7948ff3b660b97a019ad9f807ee3c6acc9316af8110a8a70c5, matching the original static
review. Separately scoped#204's real installed candidate/VM evidence does not become a new#206human
or installer run; this phase still reconciles a duplicate of an already implemented guard.

- Debt tests **62/62**, no skip/cancel/failure.
- Fixed local OpenSpec1.6.0 canonical specs **21/21**.
- docs/neutrality/read-only debt PASS, budget4/5 and3residualflows unchanged.
- No app/runtime/core/lock/config diff against the integrated main; PRdiff stays phase1only.

Managed targetPath C:/Users/RitualDesktop/.codex/worktrees/206-post-npm-main/project-engineering-os,
storage persistent, read with read_codex_security_artifact:
| Artifact | SHA256 |
| --- | --- |
| artifacts/207-revalidation/run.mjs | 99410babb9251ad1f26d7daa18ab62c3be22387c12d0dafa6e8fb5d7c1a18fea |
| artifacts/207-revalidation/result.json | ca89d56737ceea3dd8f5df4595e7836342ab5d16f2c3749d1a426db2ef95bbf9 |

Current protected CI at the final PRhead is still a separate gate. Only then mayphase1integrate.
#206 stays OPEN for36other records; no Done/umbrella closure, no policy exception, no fifth npm patch,
no claim of zero debt or completion of ola3, and no ola4 work. Original failed CI37171002125 remains
at its original9feea659 SHA; withdrawn braces advisories are not the current blocker.
