# Pre-apply — release EOL preflight follow-up for #155

Date: 2026-09-24. Base: `71b86233ee5fbd6eef0c1a838c53b504db217d1f` (`main` and protected tag `v1.0.0`).

- Issue #155 is open and its propose readiness gate passed 13/13. The issue records both the original baseline decision and the post-merge release blocker.
- PR #185 is merged; this follow-up has no duplicate open PR. The official `v1.0.0` release attempt is [run 35949205399](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/35949205399).
- That run passed tag/source validation and all 354 repository tests, then failed before uploading a candidate because two files were reported `w/none` under `eol=lf`.
- Neither GitHub Release `v1.0.0` nor npm version `1.0.0` existed at baseline. No canonical release artifact, npm publication, or provenance was created.
- Fresh-worktree reproduction at the tag commit failed with the same two paths, ruling out a stale or CRLF local checkout.
- The active tag ruleset remains in force. The follow-up does not edit or move `v1.0.0`.
