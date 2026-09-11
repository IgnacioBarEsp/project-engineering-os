## Why

Companion now prepares, activates and verifies a project's tools, but the only way to run it is to clone
the repository, install dependencies and start Electron from a terminal. The people this app is for do
not do that. Issue #80 turns the verified application into an artifact a person can download, install and
uninstall on Windows without preparing Node or opening a console.

## What Changes

- Package the private app into a Windows x64 installer with a conventional wizard: destination, license
  and data notice, shortcut and per-user installation that needs no administrator.
- Publish artifact identity: version, commit, SHA-256, included licenses and the real signing status,
  without suppressing any system warning the absence of a signature produces.
- Verify the packaged contents before publishing: only allowed files, the pinned core dependency, no
  development tooling, no personal documents and no credentials.
- Keep uninstall and reinstall safe: project folders, app history and managed runtimes survive, and
  removing them is an explicit separate choice.

## Capabilities

### New Capabilities
- `companion-distribution`: a verifiable Windows artifact, its declared identity and licenses, and an
  installation and removal path that preserves the person's work.

### Modified Capabilities
None. The universal core release contract in `distribution` is unchanged and the app keeps its own
version and cycle.

## Impact

Private Companion package, a new packaging script and artifact verification. Build-time binaries that the
packager downloads must be pinned and identified like the runtime catalog, or the build must not depend
on them. No signing certificate is purchased or claimed. Windows x64 only.

Risk: shipping unreviewed bytes, deleting the person's data on uninstall, or claiming an installation
experience that was never observed. Mitigation: an allowlist of packaged contents verified against the
artifact, an uninstall that touches only what the installer wrote, and evidence from a real installation
on the maintainer's machine. Five-profile installer journeys, the landing page and benchmarks are #81.
