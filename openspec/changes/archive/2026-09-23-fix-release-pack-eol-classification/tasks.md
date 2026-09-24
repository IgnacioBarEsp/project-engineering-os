## 1. Readiness and reproduction

- [x] 1.1 Confirm issue #155 remains open, the tag and merge commit identities, and the failed release run; record that no release artifact or npm version was published.
- [x] 1.2 Reproduce the EOL preflight failure from a fresh worktree at the immutable tag's commit.

## 2. EOL classifier and regression tests

- [x] 2.1 Treat `none` as canonical only for files with no line terminators; continue rejecting CRLF and mixed endings.
- [x] 2.2 Add focused tests for LF, CRLF, mixed, no-final-newline, and empty-file states.
- [x] 2.3 Prove `pack-release --dry-run` completes from a clean checkout without editing the two historical files.

## 3. Protected release workflow compatibility

- [x] 3.1 Load the release helper, source validator and tag resolver from the exact `main` workflow commit in both build and npm verification jobs, and fail closed unless dispatch runs from `main`.
- [x] 3.2 Extend workflow policy tests to require both pinned helper steps; verify the public tarball still excludes release tooling.
- [x] 3.3 Fully qualify tag checkouts, pass the release input through quoted environment variables, and reject a source commit that differs from the exact remote tag target.
- [x] 3.4 Restrict all release jobs and both privileged deployment environments to `main`, preserve the existing npm reviewer, and disallow administrator bypass.
- [x] 3.5 Bind the GitHub Release candidate manifest to the checked-out/remote tag commit and enforce no-bypass update/deletion rules for release tags.
- [x] 3.6 Reject prerelease package versions before candidate creation until npm and GitHub release-channel behavior is explicitly supported.

## 4. Verification

- [x] 4.1 Run focused tests, full `npm run check`, strict OpenSpec validation, EOL fixture checks, and release pack dry-run; record evidence.
- [x] 4.2 Complete adversarial review and debt assessment; close any findings.
- [x] 4.3 Assemble closure evidence and run the fixed local readiness runners in the disposable fixture.

After 4.3, run the archive-readiness gate with `--run-local`; archive through the official OpenSpec CLI only if it passes. Then open/update the protected PR and require its CI before merge. Finally dispatch a new release workflow from the updated `main` (rerunning `35949205399` itself would retain its old SHA) against the unchanged tag `v1.0.0`; verify GitHub Release assets, npm tarball/version, SHA-256 and OIDC provenance before closing issue #155. PR CI, publication and issue closure are post-archive gates, not implementation checkboxes.
