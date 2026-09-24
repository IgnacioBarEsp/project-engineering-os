# Brownfield baseline — #155 release preflight

- Issue #155 remains open after its implementation PR #185 merged as `71b86233ee5fbd6eef0c1a838c53b504db217d1f`.
- Protected tag `v1.0.0` points to that merge commit. It is immutable and will not be moved.
- Release workflow run [35949205399](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35949205399) passed source/version checks and all 354 tests, then failed before the candidate artifact at `scripts/pack-release.mjs`'s EOL preflight.
- The two reported files are `.github/skills/impeccable/scripts/data/font-index.json` and the empty `openspec/changes/archive/2026-09-20-remeasure-retrieval-and-record-flow-comparison/evidence/flow-comparison/via-b/status.txt`. `git ls-files --eol` reports `i/none w/none attr/text=auto eol=lf` for both; neither contains CRLF or mixed endings.
- Package `files` is an explicit allowlist and excludes `scripts/`; `npm pack --dry-run` confirms release tooling is not part of the public tarball.
- No GitHub Release `v1.0.0` or npm package version `1.0.0` existed after the failed run. No release asset was created and no npm publish occurred.
- The existing release workflow checks out a protected tag, then runs the packaging helper from that checkout. The follow-up must supply the compatibility fix from the exact `main` workflow commit without modifying tag contents or ref identity.
