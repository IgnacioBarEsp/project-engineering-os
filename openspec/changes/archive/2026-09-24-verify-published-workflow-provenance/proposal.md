## Why

Issue: [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155).

The published-release verifier currently compares npm's signed provenance publisher commit with the source commit recorded by the protected tag. For a release dispatched from `main`, npm correctly records the `main` workflow commit; conflating that with the tag commit makes verification reject a valid, byte-identical publication.

## What Changes

- Verify the signed SLSA subject against the canonical GitHub Release tarball while treating the publisher workflow commit and protected tag source commit as distinct identities.
- Resolve the SLSA invocation to its exact successful GitHub Actions run and attempt on `main`, and require the release validation, canonical-asset comparison, publish, and provenance steps to have succeeded.
- Continue requiring the release manifest's source commit to match the immutable remote tag and the npm tarball to match the canonical release bytes.
- Keep verification read-only; do not move the tag, modify the release, or republish the package.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `distribution`: define separate verification of signed publisher-workflow provenance and protected source-tag identity.

## Impact

- Affected: `scripts/verify-published.mjs`, `test/registry-release.test.mjs`, and the distribution OpenSpec requirement.
- No package dependencies, release assets, tags, or published versions change.
- Verification gains read-only GitHub Actions run/job API requests using the existing authenticated `gh` client; missing, mismatched, or incomplete run evidence fails closed.
