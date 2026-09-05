# Validation — 2026-09-05

PASS: DoR #72, 13 checks. Exact local OpenSpec 1.6.0 strict validation, nine items. Full repository check,
260 tests, package/neutrality/documentation/workflow/debt checks. Full installed-tarball fixture PASS.
Dependency audit PASS with zero high/critical findings and zero exceptions. Environment: Windows,
Node 24.18.0 and reviewed npm 11.19.1.

Two independently packed candidates passed installation/bootstrap/idempotence/debt smoke and produced
317404-byte tarballs with identical SHA-256:
`e5d0e54a96ac0f93d4afa7b002f851a2771a54246d4da56954584b5c1dc07ada`.
This is local preparation evidence; the protected release workflow builds and compares its canonical
candidate after the final main commit and tag.

Manual inspection: root and lock 0.3.0; blueprint constructor/self-dependency/lock URL 0.3.0; consumer product
version remains 0.0.0. Current README examples agree and historical availability notes remain accurate.
No office/PDF documents enter the pack. PR template distinguishes Closes from Refs and records authority.
Strict CI / required and admin enforcement remain active; protected tags and npm-publish reviewer
environment remain configured, with canonical asset comparison and token-free OIDC publishing unchanged.

Issue and board reconciliation uses actual GitHub issue states; closed items become Done, the maintainer
is assigned where absent, the closeout issues enter milestone 0.3.0, and future discovery #66 remains
Backlog. The release issue remains open until the post-merge runbook finishes.

## Post-merge publication runbook

1. Require the release PR's complete CI aggregate, merge through protection and fetch its main commit.
2. Create the new v0.3.0 tag on that commit; never move an existing public tag.
3. Dispatch the existing Release workflow with tag v0.3.0 and observe exact-candidate build/GitHub release.
4. Approve the npm-publish environment under the maintainer's already explicit delegation. Preserve its gate.
5. Verify workflow completion, npm 0.3.0 identity, immutable GitHub assets/checksums and registry attestations.
6. Close #72 and milestone only after publication succeeds; update its board status and preserve #66.

If publication fails, inspect the failing job and retained candidate. Never overwrite a published version
or claim success based only on build. Use a subsequent patch for a released defect and preserve receipts.
