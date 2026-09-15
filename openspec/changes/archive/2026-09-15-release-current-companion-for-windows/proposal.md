## Why

Companion 0.1.0 is a real public installer, but it predates the seven integrated improvements in
#97–#107. The public guides now say that distinction plainly; #117 turns the reviewed source into a new
Windows artifact instead of asking a person to infer that main is downloadable.

## What Changes

- Bump only the private Companion package from 0.1.0 to 0.2.0; keep the public core package at 0.5.0.
- Add the release workflow and test harness that will build a clean Windows x64 installer, verify its
  actual contents/signature/checksum and record its source commit, bytes and toolchain identity.
- Make its disposable Windows runner exercise install, update and uninstall in isolated locations.
  Evidence names automated, silent and human-only steps rather than treating a missing observation as
  success.
- Prepare the 0.2.0 source/version and release notes for a later, post-merge publication change. That
  change will tag main, run this workflow, compare canonical assets and reconcile public documentation.
  0.1.0 remains immutable throughout.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `companion-distribution`: require a post-merge, clean-source release identity and a canonical-asset
  comparison for every Companion Windows release.

## Impact

Issue: https://github.com/IgnacioBarEsp/project-engineering-os/issues/117.

Changes the Companion package version, its lockfile, release workflow, release notes and distribution
test harness only. It does not yet create a tag or public GitHub Release. No core npm release, new
runtime, certificate, cloud service, product framework or landing deployment is introduced. The future
release is Windows x64, unsigned and per-user.
