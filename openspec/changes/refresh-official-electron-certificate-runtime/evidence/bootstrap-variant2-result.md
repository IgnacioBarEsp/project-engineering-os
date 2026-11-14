# Frozen variant 2 — measured owner contrast

[Actual approval](bootstrap-amendment-approval.md). Exact one-file postimage:
6695b1dcc2f4d6b2079b2c0d4b37614ed8a0e90884e2ff92a045131fc2486089.
Other nine inputs are byte-identical. Freeze2026-11-14T07:20:57.272Z, recipe
0b979f38812f7c25afd683169e98b46bd1e8a41902648ffb335a78a13cf1fd95.
Persistent frozen-variant2.json SHA45d10333f018915ab9b07a384173c1f92fb95fc07be735d442d9ccc621fd898e.
First frozen recipe/120s failure retained unchanged.

Actual run2026-11-14T07:23:00.669Z–07:23:34.898Z, Windows only:

| Runtime | Cases | Blocked-chain TLS/HTTPS/fetch | Trusted controls |
| --- | --- | --- | --- |
| Electron44.1.1 / Node24.19.0 / Chromium152.0.7977.65 |9/9PASS|CERT_SIGNATURE_FAILURE|3/3PASS|
| Electron44.9.1 / Node24.22.0 / Chromium152.0.7977.167 |9/9PASS|CERT_REVOKED|3/3PASS|

Both runtimes returned UNABLE_TO_VERIFY_LEAF_SIGNATURE for all three unrelated
untrusted-leaf cases. Zero skipped/cancelled. Largest case26ms versus20s cap;
observed JS heap226492416bytes versus256MiB cap in both. This is production-main
loopback evidence, not project exploitation or dynamic Chromium-network coverage.

Candidate ran through unchanged full native verifier:18screens/12clipboard
matches,completed:true,failures:[],exit0. All18PNGs/18provenance sidecars retained.
Aggregate90e066f637bba6bb1b7b470c57b7568d5fa626c1d34c18146c1421c08724e9a7
matches freeze2. Stage provenance is commit1ba plus approved helper delta,dirty:true;
not a clean public build. Git MAX_PATH stderr and GPU cache warning are retained.
Read-only stage guard initially reported seven archival paths deleted under default
Git handling; command-scoped core.longpaths=true proved it clean before copy.
That diagnostic preceded runtime/copy and consumed no runtime attempt or variant.

Persistent prefix artifacts/wave3-current/electron218/bootstrap-v2/:
- owner-contrast.json SHA38189b0d5a86df42da45c95475a74ab15893f9c824951618ea048f8cc80c3a4c
- baseline-contrast/baseline-certificate-boundary.json SHAce46c7fbf779f047d4e37d1ccbfe1d5b5f88e0292723f500ccccc6671c36c0b1
- candidate-native/certificate-boundary/candidate-certificate-boundary.json SHAfc4fc036d96b2565f1db846559a81b72750b737fe3684e24a56f5102429ef0e7
- candidate-native/electron-evidence.json SHAf59a5f5577cc0405765c3fcd3e4a6a5ed6ac22a9993bd41c1f039ae2417cec17
- capture-manifest.json SHA9a97cbb4427123b4d2844d5023b0119538324bb9b37c393a61998b8b957281f4

All ten hashes still match; no Electron process remained. No install/download,
generation, TLS bypass or host trust/clock/cap change. Variants2/2,baseline2/2,
candidate1/1 consumed. Same-reviewer incremental completed: F1 resolved, no new concrete finding; report45dace94c7373a43504abbfae01f73a683408aa854948bb92b1793acc23a6868. No global or installed approval. Owning checks/currentCI, builds,
installer/VM/debt/archive/humans remain separate gates. No ola4 or public release.
