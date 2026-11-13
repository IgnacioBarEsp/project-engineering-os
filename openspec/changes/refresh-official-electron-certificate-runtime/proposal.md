## Why

Issue #218 records a public upstream certificate mitigation affecting the exact
Electron44.1.1 runtime packaged by Companion0.3.7. Existing production package
audits do not certify this development-labeled but shipped runtime. A supported
explicit provider connection runs in main and relies on that runtime's TLS trust.

## What Changes

Subject to approval of this exact proposal, update only Electron to official44.9.1
and preserve the rest of the dependency graph. Add a bounded production-runtime
certificate witness with legitimate controls to the existing Windows Electron
verifier, then rebuild and qualify the actual combined candidate. Preserve all
existing sandbox/CSP/IPC/toolchain, audit and protected integration contracts.

The correction in c8cd8d5 is already approved and implemented in716f9e2, with7/7
regressions and same-reviewer reconciliation. It does not authorize Electron Apply.

## Capabilities

### New Capabilities
- `companion-electron-certificate-runtime`: exact official runtime identity,
  non-vacuous production certificate-boundary controls and qualification evidence.

### Modified Capabilities
None. Existing app/product capabilities and human acceptance boundaries remain.

## Impact

Exact files and budget are in design.md. No renderer, IPC, service, NSIS, CI,
managed Node/npm/Git/CodeGraph/core/OpenSpec pin or audit-policy change.
Test data stays outside the shipped app. Docs/evidence and one eligible official
debt assessment are append-only. Production Apply is blocked until actual approval
of the immutable proposal. Archive and protected PR are later gates, not approval
side effects.
