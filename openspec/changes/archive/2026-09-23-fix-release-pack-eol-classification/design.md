# Design: classify EOL-free files without rewriting them

## Current behavior

`git ls-files --eol` emits `w/none` for a worktree file with no CR or LF characters. The release helper currently rejects every `eol=lf` worktree state except `lf`, so it rejects both an empty file and a single-line file that has no final newline. The error is deterministic on a fresh clone; it is not a stale Windows checkout.

## Decision

`nonCanonicalEolEntries` will accept only coherent index/worktree pairs for paths with `eol=lf`: `lf/lf` and `none/none`. `none` is accepted because no line-ending translation is possible, but only when the tagged index also has no terminators. CRLF, mixed, unknown, or divergent index/worktree states fail before packing. Tests cover empty and single-line no-final-newline files independently, plus negative CRLF/mixed and divergent-state cases.

For an immutable tag whose release tooling predates this correction, the build and npm packaging jobs obtain `scripts/release-lib.mjs`, `scripts/validate-release.mjs`, and `scripts/release-source.mjs` from the exact `github.sha` of the workflow run. The GitHub Release job loads those validators plus `scripts/verify-release.mjs` from the same SHA. Each overlay fails unless `GITHUB_REF` is `refs/heads/main`, fetches that commit from `origin`, and extracts only the reviewed tools. These scripts are excluded by the package `files` allowlist, so rebuilding from the tag preserves the public artifact's identity.

Release dispatch input is untrusted data. Every checkout names `refs/tags/<input>` explicitly so an
equally named branch cannot win ref resolution. Shell steps receive the tag only through the quoted
`RELEASE_TAG` environment variable. Before a candidate or npm publish is allowed, the validator asks
`origin` for that exact tag (including annotated-tag peeling) and requires the checked-out `HEAD` to
match its commit. Every release job is conditional on dispatch from `main`. The GitHub Release and npm
jobs also use environments whose deployment policies allow only `main` and disallow administrator
bypass; the existing npm reviewer configuration is preserved. The GitHub Release job also verifies
the candidate manifest's recorded commit against the checked-out tag commit before attaching assets.
Because tags can be moved or deleted after the candidate is built, a separate active tag ruleset
blocks updates and deletions without bypass actors while preserving the existing admin-controlled
creation flow.

The current release workflow supports stable SemVer only. npm 11 requires an explicit distribution
tag for prerelease publications; allowing the GitHub Release job to run first could otherwise leave a
GitHub Release without its npm publication. The source validator therefore rejects prerelease package
versions in the build preflight. Enabling prereleases later requires a reviewed channel mapping, an
explicit npm `--tag`, GitHub prerelease metadata, and end-to-end tests; it is not inferred from an
arbitrary prerelease identifier.

## Alternatives rejected

- Editing the historical JSON or empty evidence file would rewrite unrelated evidence and still make the tag's bytes differ from the approved commit.
- Moving or recreating `v1.0.0` would violate the immutable tag contract.
- Skipping the EOL guard or publishing a locally packed tarball would bypass the canonical candidate, byte comparison, and provenance workflow.
- Comparing only the input name to `package.json` would leave the source commit unbound; a name match
  cannot prove that the checked-out files came from the named remote tag.

## Recovery

Before a GitHub Release or npm publication exists, revert the protected follow-up PR and keep `v1.0.0` unchanged. If a release is published, correct a discovered package defect only with a new immutable version; never move the existing tag.
