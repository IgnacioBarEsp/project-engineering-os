# Manual review: degradations and scope

Date: 2026-09-24. Change: `verify-published-workflow-provenance`.

## Declared degradations

- If npm's signature/provenance data is absent or invalid, or GitHub cannot return the exact run and attempt, verification fails closed. The operator can retry the read-only verifier; it does not republish, edit the release, or move the tag to recover from an API outage.
- If the attested workflow, repository, `main` ref, run SHA, attempt, required job/step result or execution order differs, verification fails. A workflow step rename requires an explicit verifier/test update; it is not silently treated as success.
- GitHub's run summary does not expose the dispatch input or logs. As recorded in the design and adversarial review, successful source-validation steps in the signed workflow revision plus independent manifest/tag and tarball checks are the trust boundary; the verifier does not claim to inspect the input directly.
- A published version is immutable. If published bytes were ever wrong, recovery is a new corrective version, not rewriting the tag or registry record. This change leaves the already-published bytes unchanged.

## Clarity, ownership and drift

The change belongs to upstream release verification (`scripts/` and its tests), not to a generated consumer overlay. Its distribution contract documents the distinct workflow and source identities. The change does not activate consumer frameworks, providers, secrets, telemetry or services and does not alter the release pipeline itself. The change proposal/design record the issue link and current limitation; the original issue and release history remain intact.

This is an author-run manual clarity/ownership review. It is not a human PR approval or an independent reviewer sign-off.
