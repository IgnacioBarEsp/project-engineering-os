## Release decision

Use 0.3.0 for additive tracker commands, per-path rules and upstream control/hardening changes. Existing
consumer seed-once policy and github-plan behavior remain intact. Update only executable current-version
examples; preserve historical findings and version-introduced statements.

## Authorization and integration

Keep strict required CI / required, admin enforcement, protected tags, npm environment, exact artifact
comparison and OIDC. Document independent review separately from agent self-review explicitly delegated
by the maintainer. A contributor cannot grant that delegation to itself. Do not fake GitHub reviews.

## Validation and publication

Validate identity, lock, full installed fixture, all tests, dependency audit, canonical pack and strict
OpenSpec; record manual privacy/asset inspection and captured debt. Merge protected PR, tag its main
commit, dispatch existing workflow, approve the already-authorized environment and verify registry
version/integrity/provenance against canonical GitHub assets. Do not overwrite a release.

## Recovery

Before publication revert the PR/tag only when appropriate and unpublished. After publication retain the
immutable version and diagnose through a new patch release; consumers can pin the preceding version and
use their ordinary transaction rollback. Preserve historical debt evidence and consumer files.
