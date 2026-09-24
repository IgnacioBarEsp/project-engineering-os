# Brownfield baseline

Date: 2026-09-24. Issue: [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155).

The protected release workflow runs from `main` and separately checks out the requested source tag. Trusted npm publishing therefore records the `main` workflow commit in SLSA provenance; the release manifest records the source-tag commit. The existing verifier incorrectly required those commits to be equal, even when the tarball bytes, signature and manifest-to-tag binding were valid.

The `v1.0.0` tag remains at `71b86233ee5fbd6eef0c1a838c53b504db217d1f`. The canonical release tarball is 506,213 bytes with SHA-256 `a13218806ed340d1cc7618e26d3105e7aa42a45ff615c34eecb0abbd7e16bbdc`; its published npm integrity and signature audit are recorded in `evidence/validation.md`. Before this change, the independent verifier rejected the publication solely because of the workflow-commit/source-commit conflation.

This follow-up changes only the verifier, its regression tests and the distribution contract. It does not modify the release workflow, package contents, tag, GitHub Release, npm version, or consumer-owned files. The repository's existing upstream debt state is assessed separately and is not attributed to this change.
