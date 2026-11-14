# #218 — Electron official certificate runtime

**Current qualification: blocked by local QA resource failures.** Original decisions
7af/2d2/1cb are resolved; no new source variant is proposed. See
[actual stop](evidence/local-qa-qualification-stop.json) and
[pending bounded verification amendment](local-qa-resource-amendment.md).
One targeted sequential QA invocation is proposed, not approved or executed.

**All decisions7af/2d2/1cb are actually approved. Do not ask again.**
[Original approval](evidence/spec-approval.md),
[bootstrap approval](evidence/bootstrap-amendment-approval.md).

Variant2 applies the exact approved one-file bootstrap/deadline patch. The real
production-main contrast passed9/9cases per runtime: baseline44.1.1 returned
CERT_SIGNATURE_FAILURE and corrected44.9.1 returned CERT_REVOKED across TLS/HTTPS/
fetch. Trusted controls and unrelated untrusted peers stayed distinct. Full native
verification completed18screens/12copies. [Actual result](evidence/bootstrap-variant2-result.md).

This does not yet qualify the installer or close #218/ola3. Same-reviewer incremental,
owning checks/current requiredCI, two builds, artifact/licenses/resources, existing
corrected VM, debt/official archive and real humans146/147 remain gates.
No human acceptance, release, host install or ola4 is inferred.

Official SRI/ZIP/73runtime files were verified once and reused with the same six
frozen fixtures. No dependency, managed toolchain, CI/policy, TLS or cap change.
[Design](design.md), [ledger](evidence/apply-ledger.json), [manifest](evidence/manifest.json).

First disagreement and120s failure stay immutable:
[prepatch stop](evidence/prepatch-stop.md), [bootstrap failure](evidence/bootstrap-failure.md).
Variants2/2,baseline owner2/2,candidate owner1/1 are consumed. No more variants or
owner repeats. Builds0/2 and same corrected VM0/1 remain unused.
