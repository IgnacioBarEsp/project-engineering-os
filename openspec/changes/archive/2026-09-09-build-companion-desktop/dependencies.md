# Desktop dependency review

Electron 44.1.1 (MIT) is pinned only in the private app, with its runtime, Chromium and third-party
notices retained by packaging. No paid service or telemetry is introduced. Its install script was read:
it downloads the platform artifact from Electron's official GitHub releases, verifies the bundled
SHA256 checksums and extracts it. Lifecycle scripts remain disabled; the reviewed installer is invoked
explicitly for development/build. Recheck security releases before #80 distribution.

The private app depends on the published neutral core `create-project-engineering-os@0.3.0` (MIT,
no runtime dependencies). This is the canonical release already verified by the repository's release
workflow, not a mutable checkout dependency. A command-scoped npm `min-release-age-exclude` for only
this package allowed installing this maintainer-reviewed release during its seven-day quarantine.
The exact lock and integrity remain authoritative; no global quarantine or lifecycle setting changed.
Other packages still use the seven-day policy. This exception authorizes no future core version.

Playwright 1.62.1 and its exact playwright-core 1.62.1 dependency (Apache-2.0, published 2026-07-30)
are development-only UI verification tools. The CI runner explicitly installs Chromium for the five
journeys; browser binaries and test fixtures are excluded from the distributed app. Local evidence uses
the same Playwright version with the installed Edge browser. No provider account or remote test service.

Sources: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[npm scoped exclusion](https://docs.npmjs.com/cli/v11/using-npm/config/#min-release-age-exclude),
[canonical core release](https://github.com/IgnacioBarEsp/project-engineering-os/releases/tag/v0.3.0).
