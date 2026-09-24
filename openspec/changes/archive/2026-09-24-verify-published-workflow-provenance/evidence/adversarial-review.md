# Adversarial review

Date: 2026-09-24. Change: `verify-published-workflow-provenance`; issue [#155](https://github.com/IgnacioBarEsp/project-engineering-os/issues/155).

## Review scope and method

Reviewed the complete change diff, including `scripts/verify-published.mjs`, `test/registry-release.test.mjs`, the distribution delta, design, task list and validation evidence. The review checked trust-boundary binding, strict URL parsing, run/attempt identity, release-job and critical-step ordering, failure behavior, package/tag immutability, and whether tests reject malformed or incomplete remote evidence.

The Codex Security diff scan `98e1e7d6-a85f-4e47-aec3-f090a2821d43` completed with full declared coverage and zero findings. The scan inventory did not include the new test file or all OpenSpec artifacts, so those files were reviewed manually rather than treating the scan as complete coverage of them. A fresh-context architecture review also examined the caller, API data and workflow assumptions.

## Findings and disposition

- No unresolved Blocker or Major. The implementation fails closed for missing, malformed, unsuccessful or mismatched attestation/run evidence; tests exercise mismatched SHA, attempt, event, branch, workflow path, digest, missing/failed jobs and steps, and invalid order.
- The GitHub run-summary API does not expose `workflow_dispatch` inputs or step logs. The verifier therefore cannot independently read back the requested tag from those fields. This limitation is stated in the design; the verifier instead requires the attested workflow commit to equal the exact successful run's `main` commit, the release workflow identity and required validation/comparison/publication steps to succeed, the manifest source commit to match the immutable remote tag, and the npm subject bytes to match the canonical release tarball. The assumption is that the protected, reviewed workflow on `main` implements those named steps as specified. No claim is made that this API proves the workflow input value by itself.
- This review does not represent a human approval or independent GitHub PR review. The protected PR review remains a separate gate.

## Conclusion

PASS for this bounded verifier correction: zero open Blockers, zero open Majors, no new dependency or privileged action, and no mutation of the release, tag, package registry or published bytes. The documented run-input limitation is an explicit trust assumption, not an undisclosed guarantee.
