# Baseline

Main de47fb7 and tag v0.3.0 already contain 260 passing tests and the completed original backlog.
verify-provenance fetches a whole packument ten times with two-second sleeps. It has no request timeout
or read-only recovery workflow. Publication run 33995560577 accepted and signed the package before its
probe failed. Local independent downloads subsequently matched canonical SHA-256
e5d0e54a96ac0f93d4afa7b002f851a2771a54246d4da56954584b5c1dc07ada and npm signature verification passed.
The two unrelated local documents remain untracked and outside this change.
