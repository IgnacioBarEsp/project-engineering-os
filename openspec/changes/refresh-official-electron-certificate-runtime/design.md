# Design — official Electron certificate runtime

## Decisions and authority

Revision7af8a2a has actual maintainer approval (evidence/spec-approval.md).
Prepatch investigation invoked the explicit STOP before fixture generation/freeze:
evidence/prepatch-stop.md. The original self-signed/bag protocol below is retained
as approved history; its concrete replacement in production-chain-witness-amendment.md
was separately approved in revision2d2d28c with the literal response recorded in
production-chain-witness-amendment.md. Execute only that replacement protocol;
the original STOP stays historical. No extra investigation or allowance is added.

Owner IgnacioBarEsp; issue218, Project3 Backlog/security. Preparation uses fixed
local OpenSpec1.6.0. The source baseline is716f9e2 (product e713e9a plus approved
harness fixes), on main7073033. The upstream advisory is
[GHSA-jr5w-w6x2-84p9](https://github.com/electron/electron/security/advisories/GHSA-jr5w-w6x2-84p9).
Source44.9.1 is commit e02265be96c5e13ae43644ef482b718e1e800499, official
tag object d24ef8561046a7e72c5f355dd9e50f0b04e1101c; tag signature verified:false.
This is supplier identity evidence, not a claim of a signed installer or exploit.

Registry wrapper:
`sha512-x/tECFFDa2OFNjMObFH0EGKWrCnFZPOR1wP2iMIVt0STecGl8FmDXdaiaryY0kf8mtw9kSLP2yK8dfdaWkfDmw==`,
MIT, engines>=22.12.0. Its three dependency ranges match44.1.1. The version-only
document supplies no gitHead/publication time; actual existing age7 resolution
must succeed, with no new exclusion. The official binary release was published
2026-10-20T02:35:15Z. Windows ZIP158389896bytes,
SHA25641bd7900bd42d0f49110a81617876137041fbbf473466920248ddb076349ef91.
Fetch actual SHASUMS256 and bytes under owned staging and compare with declared
identities before execution; no alternate mirror/latest/range.

## Exact future source/data allowlist

1. `apps/companion/package.json`: only devDependencies.electron44.1.1→44.9.1.
2. `apps/companion/package-lock.json`: only packages[""].devDependencies.electron
   and version/resolved/integrity of packages["node_modules/electron"]. All other
   entries/flags and manifests/locks remain exact. No npm audit fix or overrides.
3. `apps/companion/scripts/electron-certificate-boundary.mjs` (new): isolated
   parent/production-Electron-main test harness using existing builtins/APIs.
4. `apps/companion/scripts/verify-electron.mjs`: call that boundary verifier and
   retain its report/runtime identity; preserve every existing screenshot,
   clipboard, route, guard, provenance assertion and timeout. No skipped boundary.
5. Test-only files under `apps/companion/qa/fixtures/electron-certificates/`:
   `trusted.pem`, `trusted.key`, `untrusted.pem`, `untrusted.key`,
   `blocked-intermediate.pem`, `provenance.json`. No other fixture input.
6. `docs/companion/INSTALLER.md` and `docs/companion/EVALUATION.md`: exact
   candidate identity/protocol/limits, preserving prior artifact receipts.
7. This change and linked150/167 handoff/evidence docs; one eligible new official
   assessment in .project-os/debt/assessments through the CLI. Existing debt objects
   and assessments are unchanged; no capture/close of the remaining206 umbrella.
   Root capability is materialized only during the later official OpenSpec archive.

No new dependency, global tool install, source reconstruction or vendor patch.
No desktop/main/service/preload/renderer/IPC/NSIS, runtime catalog/manager/npm
identity/slots, managed Node/Git/CodeGraph, core/blueprint, root lock, workflow,
audit/exceptions, isolation or timeout changes. Embedded Electron Node/Chromium
versions are part of the selected official binary and are measured, not pinned
independently. Other package drift or required extra files stops this proposal.

## Frozen test inputs and legitimate controls

Public blocked certificate comes from the CA's
[repository](https://repository.emsign.com/certs/EMDVTLSCAG3C.crt). DER SHA256
0164d7ceae5bb909c272af151ff44b1177ae9b47d9424b94f1d9558c30934d19,
SPKI SHA25649dd353dc2b919a3770645117d0e60c16115e7d1bc259eefe734b00ea434fe5f
matches the official compiled blocklist; canonical PEM SHA256
4fff198fb2c913407a63f13a6884bfe5781ced50f6b129e83a6595180a4fcb3c.
Only public certificate data is used, never its CA private key.

Generate two fresh localhost-only self-signed TEST identities, once, in owned
temporary storage, using the already installed Git OpenSSL3.5.7 executable
SHA25678340fb01dea2df5caab73dcf28833b31329226a4c9e02f717f1d399592265b9.
Verify actual tool hash/version first; no fallback/install. Keys are disposable
public test data with no service/account use. Dates must cover the actual current
clock and intended fixture lifetime, SAN must include localhost/127.0.0.1, and
keys/certs must correspond. Freeze all bytes/hashes/provenance before any candidate
execution; both builds/CI reuse those exact bytes, never fresh random generations.
Generation uses an explicit owned configuration and SAN/usage arguments, with no
inherited OpenSSL config, provider path or seed file. Record the exact recipe and
tool identity; randomness is frozen as fixture bytes, not claimed reproducible RNG.
No host clock or trust-store modification. Test fixture provenance describes data
origin; no invented license grant on the CA's public data. App-verifier's existing
exclusion of qa/scripts/PEM/keys remains a mandatory packaging negative.

The upstream cert-revocation.spec.ts uses a DCHECK-only testing binding and its
root/intermediate/server examples expire2026-04-16. They were inspected as metadata
and are not valid positive controls. Never enable those hooks in production or
credit their skipped suite. No new X509/TLS/HTTP parser or signing implementation.

## Production-runtime witness protocol

Use official Electron main in an isolated minimal probe process, loopback only,
with no BrowserWindow/renderer authority. Freeze expected runtime/binary/source
identity, capture process.versions and executable hash, and close servers/sockets/
children in every path. Execute Node TLS, HTTPS and global fetch in that Electron
process, not the host Node/client or a stub.

For EACH of the three transports, use the same frozen inputs:
- trusted localhost fixture: succeeds only with its explicit process-scoped test CA;
  rejectUnauthorized remains true. For fetch, the fixture CA is supplied only to
  the isolated child at process creation, never the host or product environment.
- unrelated untrusted localhost leaf: fails with an actual X509 trust error, never
  timeout, missing port/module, undefined cause or arbitrary exit1.
- the same untrusted leaf plus the frozen PUBLIC blocked intermediate in the peer
  certificate bag: corrected Electron must reject with CERT_REVOKED; original44.1.1
  must retain a non-revocation X509 rejection. This exercises the supplier's
  failure-path chain check without needing a compromised CA private key.

The final case is a boundary witness, not a forged trusted end-to-end CA attack.
No claim of demonstrated project exploitation or dynamic Chromium-network coverage.
Preserve the Node source callback's distinction between a verified chain and the
untrusted bag. Extract exact nested fetch/TLS errors. The baseline must have the
same valid controls, 9 declared cases and measured denominators. Expected normal
X509 errors are limited to DEPTH_ZERO_SELF_SIGNED_CERT,
SELF_SIGNED_CERT_IN_CHAIN or UNABLE_TO_VERIFY_LEAF_SIGNATURE; CERT_REVOKED is
required for the corrected witness. No catch-all "any failure" credit.

If the production library does not transmit that bag, the test cannot observe
CERT_REVOKED, legitimate controls fail, or the binary differs, STOP and present the
specific disagreement. Do not change expectations, disable verification, add
debug hooks or count unavailable/skipped cases as PASS. The source-level supplier
fix and a binary hash alone do not substitute this declared production witness.

## Apply, qualification, cost and bounded budget

Current execution result: frozen1ba consumed the single variant and baseline
attempt, ending in120s PROCESS_TIMEOUT without a child case report. Independent
review F1 confirms a startup lifecycle defect in the verifier. STOP is in effect.
The concrete verifier-bootstrap-amendment.md was actually approved in1cb and applied as variant2. See evidence/bootstrap-variant2-result.md for the9/9 contrast and18/12 native result. Its cumulative extra allowance is now consumed; no further helper variant or owner repeat. Remaining
candidate execution/build/VM allowances are not proof that this failed gate passed.

Actual immutable-revision approval is required before any allowlisted source,
lock or new test-fixture generation. Then one fresh readonly investigation
subagent checks the proposed boundary/protocol before freeze; one fresh readonly
postpatch adversarial subagent reviews the actual resulting diff/evidence.
Those are separate from the consumed c8/e713 incremental review, not another pass
at that unchanged harness.

Maximum one frozen Electron source variant; one fixture-generation set; one
9-case baseline and one9-case candidate owner execution; existing mandatory CI
executions retain their normal meaning. Case cap20s/process cap120s/256MiB JS heap,
no source/caps edits while measuring. Diagnostic collection does not turn FAIL
into PASS or authorize new variants/repeated identical inputs.

Install in owned disposable staging with scripts/bin-links/workspaces off, fixed
registry, age7 and only the existing create-project-engineering-os exclusion.
Validate wrapper source/LICENSE and explicit pinned install.js downloader before
the existing explicit Electron install step; reject mirror/env/config injection,
source drift, links or executable inputs masquerading as fixture data.
No installer or dependency install on the maintainer host.

Owning validation includes existing core/app suites and supported host Node
22.22.0/24.18.0/24.20.0 where applicable, original raw audits and current required
CI3OS. Preserve all severity findings; confirm advisory identity fixed without
claiming all9development highs remediated. No policy/exclusion or unrelated upgrade.

Build the combined app twice from identical frozen source/dependency/fixture input.
Compare sealed inventories, official runtime files, npm identity/archive and
licenses; report any installer timestamp/container nondeterminism honestly.
The existing npm reproducibility receipt is unchanged, not re-earned by these
builds. Run full current artifact verifier without expanding its allowlists.
Record signature status (currently NotSigned), actual byte totals and versions.

Measure resources against the retained e713 artifact: download/build/verify/
install times, sizes and peak resources as comparable single samples, with all
differences/caps visible rather than an invented statistical budget. Expected
new runtime ZIP is ~151MiB; whole output/working set is unknown until measured.
No paid service/new account; owner accepts this bounded maintenance and I/O cost,
not an indefinite fork or automatic patch stream.

The only corrected canonical VM cycle approved under150 is still0/1. After all
applicable gates, use THAT allowance on the final44.9.1 combined installer instead
of e713, with offline4GiB/ROinputs/owned evidence and unchanged caps. Do not add
another cycle or use a stale driver hardcoded to716/e713 identities. Verify actual
six canonical profiles/seven scenarios, update0.1.0, recovery, uninstall and raw
denominators; the wrapper's old console5 does not certify seven. This changes the
candidate input explicitly, not the prior FAIL or budget history.

## Security, recovery and integration

Applicable root SECURITY.md and docs/companion/SECURITY.md require actual Electron
distribution posture, unchanged IPC/sandbox/permission and no project-data egress.
Test-generated keys/trust stay in their disposable probe; no real key/secret is
introduced. The known affected44.1.1 is retained only for controlled offline
contrast and history, never promoted as safe fallback. User files/history stay
intact through failure/cancel/recovery; no automatic host install or rollback.

Both c8 harness receipts and this phase keep separate review/debt/archive evidence.
Prepare on current217 source; integrate only by the approved joint protected
protocol after all phases and human gates. Previous human surface receipts retain
their scope. When all applicable gates pass, archive218 officially first, then
the seven UI phases144→150 in their already approved order; no phase is closed
just because that documentation was archived.
Previous human surface receipts retain
their scope, while real146 and SoftwareA/B147 on an apt candidate remain required.
Do not archive incomplete work, close218/150, publish/tag/change download0.3.6
or start wave4 by approval of this proposal. Future changed inputs need a new
concrete decision; no automatic rebase/variant budget reset.
