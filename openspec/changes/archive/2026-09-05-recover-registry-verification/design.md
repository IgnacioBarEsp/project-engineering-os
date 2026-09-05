## Context and decisions

The twenty-second probe confused asynchronous propagation with publication failure. Query the exact
version, retry missing/incomplete metadata and transient HTTP/network errors with exponential backoff
capped at fifteen seconds, and enforce both a ten-minute deadline and a fifteen-second request timeout.
Reject permanent HTTP errors, malformed identity and unexpected artifact origins immediately.

An independent manual verification workflow runs the current reviewed verifier against an existing tag.
It has only contents:read, no publishing step, no OIDC and no environment approval requirement. Pinned
actions and npm 11.19.1 retain current supply-chain policy. Pass the user tag through an environment
variable and validate it before subprocess arguments. Resolve the remote Git tag to the manifest commit;
download only the three expected assets to a private temporary directory. Verify identity, safe filenames,
SHA-256, byte count and registry SHA-512. Install the exact registry version with scripts disabled and a
narrow age exception for that already reviewed artifact; verify lock integrity, npm signatures and signed
attestations. Do not execute downloaded package code. Output public evidence, never raw subprocess errors.

All remote operations are reads. Local temporary files are diagnostic artifacts and may be discarded by
the ephemeral CI runner. The workflow has a twenty-minute timeout covering bounded registry propagation,
downloads and npm verification. GitHub and npm remain the existing trust roots; this does not claim an
independent rebuild or compare current main with an older tag.

## Ownership, compatibility and recovery

Only upstream owns these scripts and workflow. Existing verify-provenance invocation stays compatible.
No extra dependency, license or cost. Rollback reverts the tooling PR; 0.3.0 remains unchanged. Permanent
identity/signature failures require investigation. A timeout can be retried through verification alone;
the original release run keeps its actual failed status. The published-release issue remains open until
the new workflow verifies 0.3.0 on GitHub.
