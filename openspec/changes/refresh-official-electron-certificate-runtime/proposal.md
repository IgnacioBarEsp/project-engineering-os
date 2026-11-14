## Why

Issue #218 records a public upstream certificate mitigation affecting the exact
Electron44.1.1 runtime packaged by Companion0.3.7. Existing production package
audits do not certify this development-labeled but shipped runtime. A supported
explicit provider connection runs in main and relies on that runtime's TLS trust.

## What Changes

Revision7af8a2a is actually approved; see evidence/spec-approval.md. Its prepatch
investigation stopped before freeze on the concrete static witness disagreement
in evidence/prepatch-stop.md. The replacement fixture/expected-error protocol in
production-chain-witness-amendment.md is actually approved in2d2 and applied. The later bootstrap amendment1cb is also actually approved and applied; see evidence/bootstrap-variant2-result.md.
The original approval remains valid for its scope; no new protocol is inferred.

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

The first bounded frozen implementation1ba is blocked by an actual120s baseline
startup timeout and independent F1. evidence/bootstrap-failure.md retains it.
verifier-bootstrap-amendment.md is approved1cb and applied as variant2. Actual baseline/candidate contrast9/9 and native18/12 completed; other qualification gates remain. Original approvals stay resolved.

Exact files and budget are in design.md. No renderer, IPC, service, NSIS, CI,
managed Node/npm/Git/CodeGraph/core/OpenSpec pin or audit-policy change.
Test data stays outside the shipped app. Docs/evidence and one eligible official
debt assessment are append-only. Production Apply is blocked until actual approval
of the immutable proposal. Archive and protected PR are later gates, not approval
side effects.
