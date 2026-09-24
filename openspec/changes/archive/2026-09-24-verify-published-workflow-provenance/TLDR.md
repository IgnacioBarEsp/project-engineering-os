# TL;DR

Fix the read-only verifier for the already-published `v1.0.0`: npm provenance names the protected `main` workflow commit, while the release manifest and immutable tag name the source commit. Verify these identities independently, bind provenance to the exact successful release run and attempt, and retain the tarball/signature checks. No release bytes, tags, registry records, or package behavior change.
