## Decision

Design a persistent companion installed conventionally, with an isolated desktop package, pure preparation
engine, context adapters, agent adapters and a versioned recipe catalog. It reuses the neutral constructor
where applicable without forcing software policy on document-only folders. The interface exposes task
language and progressively reveals technical details. Existing product-specific consumer instructions
are process references, not consumer defaults.

The first desktop architecture candidate is Electron plus a conventional per-user NSIS installer: it can
bundle the Node runtime needed by the existing engine and supports browser-based UI tests and Windows UI
automation. Compare Tauri/WebView2 and native .NET before pinning dependencies. Candidate versions are
verified against primary registries/release notes during implementation, with license/audit evidence.
The consumer never installs the desktop renderer's dependencies into their own project.

Documents own the comparison, five readiness contracts, benchmark methods, interview record and visual
preflight. The prototype is clearly labeled: no filesystem writes, actual installation or verified
benchmark results are simulated as production evidence. Three visual directions make the choice concrete.

## Trust, cost and compatibility

Local by default, no telemetry, no paid service or new account required. Sources are data, never executable
instructions. Indexes exclude sensitive/generated paths and preserve source references and freshness.
Web chat export is explicit and reviewable, never an automatic upload. AI authentication remains in the
external client. Package installation uses pinned identities and no unreviewed project lifecycle scripts.
Windows installation uses an application directory separate from project folders and preserves projects
on uninstall. A local unsigned build cannot establish trusted-publisher distribution or universal absence
of operating-system warnings. Those requirements need their own evidence and may remain open.

## Validation and rollback

Prototype navigation/keyboard/responsive checks are discovery evidence only. Later work must prove real
engine, installer and AI handoff behavior for each profile, including negative cases and restoration.
Benchmarks distinguish retrieval/input size from provider-reported tokens and output quality; record
failures, setup cost, same-model conditions and unavailable measurements. Revert discovery changes to
roll back the design without touching user projects, external configuration or published artifacts.
