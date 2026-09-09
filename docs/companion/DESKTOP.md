# Companion desktop

Companion is a separate local application, owned and packaged outside the universal CLI. It prepares
folders for research, software, Unity, creative work and general tasks, then supports the person's
existing AI through reviewed instructions or a bounded context export. The interface is currently Spanish.

## What is implemented

- Role, goal, guidance preference, five project types and six AI choices.
- A native folder picker, reviewed base/context/engineering plans, local history and checked recovery.
- Source search with line, PDF page and DOCX paragraph citations, visible extraction limits and exclusions.
- Three focused recipes per project type, with budgets identified as bytes rather than measured tokens.
- A preview before copying context or an initial instruction and opening a fixed provider destination.
  These destinations currently open in the browser; the app does not claim to attach a folder or activate
  a local agent. The selected AI and verified project selection constrain the action.

Status distinguishes prepared files, current or stale context, engineering that does not apply and
external tools that still need verification. The graph catalog does not treat a directory as an activated
index. Scanned PDF pages need OCR; complex document parts and unsupported media remain visible limitations.

## Local data and privileges

The app stores a bounded project history in its app-data directory. Project configuration, indexes and
recovery journals remain in the selected folder. Indexes contain source excerpts; recovery journals may
retain earlier versions of app-owned files. Protect these files as part of the project. Removing a history
entry does not remove project files. The app has no account, telemetry or automatic source upload.

The renderer loads packaged assets through a fixed local protocol and restrictive Content Security Policy.
It has no Node integration, arbitrary network access, shell commands or raw IPC API. Main validates sender
frame and payload, accepting project handles created by the native picker or validated history. Source
text is rendered as text. Export and handoff previews expire when their relevant preparation changes.

Interrupted base/context operations can resume or roll back after hash checks. Interrupted constructor
operations expose a reviewed continuation or rollback using the core transaction identity. Subsequent
edits can block recovery and are preserved. Existing seed-file adoption is tracked separately in #85.

## Contributor verification

Use Node 24.18.0 or newer and the reviewed npm client. From the repository root:

```sh
npm ci --prefix apps/companion --ignore-scripts
npm run runtime:install --prefix apps/companion
npm start --prefix apps/companion
npm test --prefix apps/companion
```

Runtime installation is an explicit reviewed Electron artifact download with SHA256 verification.
Lifecycle scripts remain disabled during dependency installation. For browser verification:

```sh
node apps/companion/node_modules/playwright/cli.js install chromium
npm run test:ui --prefix apps/companion -- /path/to/evidence
```

Windows verification uses the installed Edge browser. The test runs the shipping renderer and real
engines in a temporary fixture, injecting native capabilities and transport. CI runs it with Chromium on
Linux. This is separate from native Windows/installer testing and does not demonstrate Electron isolation
by itself. Use the native application for picker and process-boundary checks.

## Delivery boundaries

The desktop implementation is #79 under program #66. Installer, bundled prerequisites and distribution
are #80; installer journeys, the landing page and measured model benchmarks are #81. No installer
compatibility, signed publisher, token savings or external-agent activation is inferred from the
development app or its automated tests. See [experience](EXPERIENCE.md), [context behavior](CONTEXT.md)
and [graph decisions](GRAPH_TOOLS.md).
