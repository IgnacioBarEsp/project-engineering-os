# Recovery review and rehearsal

Date: 2026-09-24. Change: `verify-published-workflow-provenance`.

The operation being changed is verification only. A successful check may use its existing temporary verification directory, but it does not write the tag, GitHub Release, npm registry, release manifest or consumer repository. The published `v1.0.0` remains immutable. If this verifier regression is later found, recovery is a protected revert of this verifier/test/contract change; correct `main`, then rerun the same read-only verifier. There is no package rollback or republish in this recovery path.

Rehearsal evidence: the full verifier ran against `v1.0.0` and returned PASS after checking the remote tag/source, canonical release assets, npm version/integrity/signature, and the exact provenance run. The failure-path tests supply missing, malformed and unsuccessful run responses and assert rejection rather than fallback. No destructive action was taken against the real release. This exercises the read-only transaction and its fail-closed recovery boundary; the protected GitHub revert remains the operational rollback mechanism, not an action to rehearse against the real branch.
