## Context

The release workflow runs by `workflow_dispatch` on protected `main`, while its build and npm jobs explicitly check out and validate the requested protected tag. npm's SLSA statement therefore names the release workflow commit in `resolvedDependencies`; the release manifest independently names the tag source commit. `verify-published.mjs` currently assumes those commits are the same, so it rejects the completed `v1.0.0` publication even though the signed subject matches the canonical tarball.

## Goals / Non-Goals

**Goals:**

- Verify npm's signature and SLSA attestation for the exact canonical tarball.
- Bind the signed workflow identity to the exact successful GitHub Actions run and attempt.
- Verify the release manifest's source commit against the requested immutable remote tag as a separate check.
- Require successful workflow stages that validate the tag, compare canonical artifacts, publish, and verify registry provenance.

**Non-Goals:**

- Do not change the published package, GitHub Release assets, tag, or release workflow behavior.
- Do not weaken npm signature verification or accept unsigned registry metadata as provenance.
- Do not claim that npm's publisher-workflow commit is the protected source-tag commit.

## Decisions

1. **Keep artifact source and publisher workflow as separate identities.** The manifest and remote tag establish the source commit; the signed SLSA dependency and `workflow_dispatch` run establish which protected `main` workflow published the artifact. Requiring equality between those commits is invalid for this workflow design.
2. **Resolve only the attestation's bounded invocation URL.** Accept the exact repository URL with numeric run ID and attempt, then query GitHub's read-only run and attempt-jobs endpoints. Require a completed successful dispatch from `main`, the expected workflow path, matching run SHA/attempt, the expected release jobs, and successful named security-critical steps. Reject redirects/alternate hosts through strict URL matching.
3. **Preserve existing byte and cryptographic checks.** Continue checking npm audit `invalid`/`missing`, package identity, SHA-512 subject digest, downloaded registry bytes, canonical release assets, and manifest-to-tag commit equality before accepting the run evidence.
4. **Fail closed without mutation.** Any unavailable or inconsistent GitHub run/job evidence causes verification failure; the verifier performs no publish, release edit, tag update, or filesystem write outside its existing temporary verification directories.

## Risks / Trade-offs

- **GitHub Actions API availability and retained job metadata:** verification can fail if run/attempt evidence is unavailable even when the package remains public. Mitigation: fail closed with a concise error and retain the verified report when produced; verification is read-only and can be retried.
- **Workflow step names are part of the evidence contract:** renaming required workflow steps without updating the verifier will fail verification. Mitigation: tests pin the required jobs/steps and make intentional changes explicit.
- **Run API does not expose dispatch inputs in its summary:** the verifier relies on successful required steps from the workflow version named by the signed attestation, while independently validating the manifest against the immutable tag and the package against the canonical asset. No claim is made that the SLSA publisher commit itself is the tag source commit.

## Migration Plan

No release migration is required. Merge the verifier and contract tests through the protected PR flow, run the read-only verifier for the already published `v1.0.0`, and close #155 only if the exact artifact, provenance run, and tag checks all pass. Rollback is a normal protected revert of the verifier change; do not republish or move `v1.0.0`.

## Open Questions

None.
