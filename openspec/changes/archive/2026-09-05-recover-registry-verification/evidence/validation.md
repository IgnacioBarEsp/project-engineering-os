# Validation — 2026-09-05

PASS: Issue #74 DoR, all 13 checks. Approved specification follows the maintainer's explicit delegation.
Exact local OpenSpec 1.6.0 strict validation passes all nine active/canonical items. Repository check
passes package, neutrality, documentation/findability/links, workflow and debt policies plus 271 tests.
The eleven registry/recovery tests pass after the final malformed-evidence redaction adjustment.
Dependency audit: zero high/critical findings, zero exceptions. Windows, Node 24.18.0, npm 11.19.1.

Full installed-tarball empty repository fixture PASS (normal install, no skip-install). It covers generated
capability contracts, doctor/OPSX, sync, idempotent second run, owned rollback and tracker read-only planning.
Upstream doctor JSON: 9 PASS, 0 FAIL, 2 WARN, 18 SKIP. Expected warnings are the working tree with the
in-progress change/private untracked documents and absence of an optional local CI receipt. The latter
does not claim remote CI execution. Required PR CI remains a separate integration gate.

Manual real verification: `verify-published.mjs --tag v0.3.0` PASS with the reviewed npm client, authenticated
GitHub reads, canonical asset download and exact registry install. SHA-256
`e5d0e54a96ac0f93d4afa7b002f851a2771a54246d4da56954584b5c1dc07ada`, 317404 bytes, commit
`de47fb7b1373da7f02ea2bac5958635a338f76e0`. npm signatures and signed SLSA provenance bind the artifact
to the expected upstream release workflow and source commit. `verify-provenance.mjs` separately passes
the exact-version metadata probe. No tag, release asset or npm package is modified by these checks.

Negative evidence: simulated delay reaches 45 seconds before passing; absent attestations reach the full
ten-minute deadline and fail; fetch timeouts/network/408/429/503 retry; permanent errors, malformed JSON,
wrong identity/integrity/origins, oversized bodies, path/argument injection, manifest drift, missing audit
evidence and wrong signed subject/repository/commit fail. Workflow policy rejects added publishing,
write permissions, OIDC, floating npm and inline shell interpolation of input.

Manual review confirms the recovery guide is reachable through the existing release documentation and
distinguishes publication acceptance, metadata visibility and cryptographic verification. The original
run 33995560577 remains failed; it is not rerun. Private local documents remain untracked and unpublished.
No runtime/provider, consumer seed or production dependency changes. Drift decision: main's upstream
verifier may advance while immutable v0.3.0 and its original package remain unchanged.

Rollback inspection: reverting this PR restores the prior verifier and removes the recovery workflow;
it does not alter the published artifact or consumer files. The full fixture rehearses a managed
transaction rollback. Technical debt assessment is clean; no accepted behavioral degradation is added.

## Post-merge closure

Require protected PR CI, archive through OpenSpec and integrate without weakening protection. Dispatch
Verify published release from main for v0.3.0; attach the actual run to #74/#72 before closing those issues
and the release milestone. The workflow is not available on main before integration; no remote PASS is
claimed here. Preserve future installer discovery #66 as Backlog, outside this release.
