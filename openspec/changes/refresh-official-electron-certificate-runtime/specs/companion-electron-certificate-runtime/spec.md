## Purpose
Qualify the exact official Electron distribution used by Companion against its
declared certificate-boundary mitigation while preserving app/toolchain isolation,
artifact identity, human acceptance and protected delivery.

## ADDED Requirements

### Requirement: Approved exact official Electron identity
The application SHALL use only the approved official Electron44.9.1 identity after
actual immutable-revision approval. The wrapper and platform archive SHALL match
the frozen SRI/SHASUMS and physical byte inventory before execution. All unrelated
dependency, toolchain and protection inputs SHALL remain unchanged.

#### Scenario: Unapproved or drifting candidate
- **WHEN** approval is missing, metadata/content differs or unrelated lock/source changes are required
- **THEN** Apply stops with its exact cause and no silent pin, exception, mirror or extra variant is introduced

### Requirement: Production certificate witness with legitimate controls
Qualification SHALL exercise TLS, HTTPS and fetch in the selected production
Electron main process with nine explicit witness/control cases, frozen data,
strict verification and bounded resources. The blocked-public-certificate witness
SHALL yield CERT_REVOKED on the corrected runtime and an ordinary non-revocation
X509 rejection on the retained affected offline baseline.

#### Scenario: Invalid evidence cannot satisfy the boundary
- **WHEN** a debug hook is unavailable, a suite is skipped, a positive fixture is expired, or a case fails through setup/timeout rather than its declared certificate behavior
- **THEN** the candidate remains unqualified and neither expectations nor production TLS/clock/trust protections are weakened

#### Scenario: Valid and unrelated invalid peers remain distinguished
- **WHEN** the probe connects to the valid localhost fixture and the unrelated untrusted fixture under identical declared conditions
- **THEN** the valid trusted control succeeds, the untrusted peer is rejected with an actual X509 cause, and both remain separate from the blocked-certificate witness

### Requirement: Shipped artifact and app guards stay verifiable
The final artifact SHALL preserve the existing app/toolchain isolation contracts,
exclude test keys/certificates and verify actual Electron/Chromium/Node identities,
licenses, complete inventories and recovery behavior. Supplier metadata or a
development dependency label alone SHALL NOT certify the installed application.

#### Scenario: Source or package boundary discrepancy
- **WHEN** packaged files, official runtime hashes, licenses, project/history preservation or a required guard does not match the approved contract
- **THEN** qualification fails visibly, original receipts remain and affected artifacts are not promoted as safe fallback

### Requirement: Budgeted independent and human closure
The phase SHALL preserve prior failed evidence and use its single frozen variant
and bounded review/qualification protocol without resetting other budgets. The
still-unconsumed corrected canonical cycle SHALL qualify the final combined
candidate with six profiles and seven scenarios before required human reports.

#### Scenario: Technical success does not imply human or release approval
- **WHEN** runtime tests or source/CI checks pass but an installed, independent, human, debt, archive or protected-delivery gate is missing
- **THEN** the phase and wave remain open, and no new release, issue closure or wave4 work is inferred
