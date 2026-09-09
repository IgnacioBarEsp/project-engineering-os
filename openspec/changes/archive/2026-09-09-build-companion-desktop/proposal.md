## Why

Issue #79 passed 13 DoR checks after #78 merged through protected PR #84. The engines can prepare and
verify folders, but people still need a real visual application to choose a project, review changes,
understand progress, recover interruptions and use their preferred external AI without hand-written commands.

## What Changes

- Build the separate Electron Companion app with Spanish onboarding, history and project workspace.
- Expose native folder choice and narrow validated actions through an isolated preload bridge.
- Compose base/context/constructor checks and surface coverage, collisions and recovery honestly.
- Provide local search, recipes, export preview and supported external-app/web handoff.
- Validate real UI interactions, keyboard, resize/zoom, motion preferences, error states and local data handling.

## Capabilities

### New Capabilities
- companion-desktop: accessible local UI, scoped bridge, project status and external-AI handoff.

## Impact

The app uses reviewed Electron and the pinned neutral core in its private package. No framework or
provider is added to the universal CLI. The maintainer explicitly delegates this #66 implementation and
asks for navigated Awwwards references; the experience remains local with no account or telemetry.
Approval follows that delegation and the existing Companion design, not a fabricated user-study result.

Installer/distribution is #80; full end-to-end field journeys, landing and model benchmarks are #81.
Existing-file adoption needs its own neutral-core change. Conflicts remain visible until safely resolved;
the UI cannot declare engineering ready merely because base/context preparation succeeded.
Rollback preserves project documents and uses the existing checked transaction paths.
