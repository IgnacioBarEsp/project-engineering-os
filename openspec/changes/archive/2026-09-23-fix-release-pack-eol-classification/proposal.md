# Correct release EOL classification for #155

## Why

The implementation for #155 is merged and the protected `v1.0.0` tag exists, but the official release workflow cannot produce its candidate artifact. On a clean checkout of that tag, `git ls-files --eol` reports `w/none` for a single-line JSON file without a final newline and for an empty historical evidence file. `nonCanonicalEolEntries` treats every state other than `lf` as a violation, so it rejects files that have no line terminator and therefore cannot contain CRLF or mixed endings.

The release workflow checks out the immutable tag, so a fix merged after `v1.0.0` cannot be read from that tag. It must load the corrected release helper, source validator, and tag resolver from the exact protected `main` workflow revision for both candidate construction and delayed npm verification.

## Scope

- Accept `i/none w/none` when the path is explicitly governed by `eol=lf`, while rejecting divergent index/worktree states and CRLF, mixed or unknown states.
- Bind the release helper, source validator and tag resolver used by both packaging jobs to the exact
  workflow commit on `main`.
- Make release dispatch input data-only in shell commands, use fully qualified tag refs, and verify
  the checked-out commit against the remote immutable tag before producing or publishing a candidate.
- Restrict every release job to dispatches from `main`; restrict the GitHub Release and npm publishing
  environments to `main` and disallow administrator bypass.
- Bind the GitHub Release candidate manifest to the checked-out and remote tag commit, and protect
  release-tag updates/deletions with an active no-bypass ruleset.
- Fail closed on prerelease SemVer before creating a GitHub Release until the workflow has a tested
  npm `dist-tag` and GitHub prerelease policy.
- Preserve the bytes of the historical files, the `v1.0.0` tag, the package allowlist, and the resulting package contents.
- Retry the existing official release workflow only after the protected follow-up PR and all its checks pass.

Issue: [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155). This is a release-preflight follow-up, not a second implementation of the Node baseline.
