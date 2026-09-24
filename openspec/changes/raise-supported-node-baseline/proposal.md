## Why

Issue [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155) tracks that Node 20 reached end of life on 2026-04-30, yet the core package and generated consumer seed still accept it and CI continues to spend half of its cross-platform runtime matrix on it. Raise the supported floor now so new consumers inherit patched LTS lines and future EOL transitions have an explicit review policy.

## What Changes

- **BREAKING** Restrict core and generated consumer support to Node `^22.22.0 || ^24.18.0`; recommend Node 24 and set the contributor pin to 24.18.0.
- Replace the Node 20 CI leg with Node 24.x while retaining Node 22.22.0 on Ubuntu, Windows, and macOS.
- Make CLI and doctor version checks enforce the same LTS-only range and explain Node 20's EOL date and the recommended line.
- Document upstream-LTS support, the minimum-advance-on-EOL rule, and a dated next review; update active core and seed guidance, package metadata, fixtures, and changelog.
- Classify this incompatible runtime-policy change as a major release under `docs/architecture/VERSIONING.md`.
- Keep Companion's app-runtime declaration and package manager policy unchanged; Node 26 remains out of the supported/recommended range until it becomes LTS and is reviewed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime`: define the supported LTS runtime range, its CLI diagnostics, and the generated consumer/runtime test contract.

## Impact

Root package metadata and lockfile, Node version detection in CLI and doctor, core blueprint package and lockfile, generated consumer CI workflow and runtime metadata, root/seed compatibility docs, README and CLI guide, compatibility tests and fixtures, changelog, and the major-version release artifacts. No new dependencies, paid services, or app-runtime changes are introduced. The upstream Node.js release schedule is the source of support and review dates.
