# Prepatch STOP — approved #218 revision7af8a2a

Original approval is satisfied and recorded in [spec-approval.md](spec-approval.md).
The single fresh readonly investigator and parent independently found a static
disagreement with the self-signed blocked-bag witness. Apply stopped before
generation, source freeze or runtime download. No binary result is claimed.

Exact source lineage: Electron e02265be96c5e13ae43644ef482b718e1e800499 →
Nodev24.22.0 / Chromium152.0.7977.167 →
BoringSSL572a4c68475d284b34675f45ddbb9c158ef3c2ae.
Node's continuing verify callback retains X509 errors while returning1. BoringSSL
can build a leaf-only chain for the unrelated self-signed fixture and return1;
Electron's added callback then scans that built chain, omitting the unrelated
blocked intermediate. Strict JavaScript certificate rejection still happens.

The investigator also read all64 active Electron Node patches; none changes
Node's VerifyCallback/SetVerifyMode. This does not establish that the supplier fix
is ineffective for an actual compromised chain, or demonstrate project exploitation.

Standalone targetPath is the current wave3 worktree in manifest.json, persistent
prefix artifacts/wave3-current/electron218/. Parent trace:
Independent report, one completed investigation (no alternative review):
independent-prepatch-investigation.md
SHA25651d89f71fdb516bec65db7453f59439756142f1ee4477438dfcb45a6b9036d55.
Parent trace:
parent-prepatch-reconciliation.json
SHA256f00cd3b2bf087021145acaba7801915f2280597bd598cd7867584a79d3233b16.
Actual approved Node patch: upstream-node-patch.txt
SHA256323d583d95989692c1a54702c5e47ef65e310f5f37f9c494e03931ccde43dc72.
Source receipts:
- source-electron-DEPS.txt:c254ca413381a28243b3808e10dc8842ff0bc09629e1663ee7e09ef79dd4514a
- source-node-crypto-tls.txt:044d15e5dad3d44cad0ae9558522977b1a1411c058ab427b1a4c129b887b2c32
- source-chromium-DEPS.txt:c3cd8ae90218c260d5fadbe5d9095164693fe420812218a18dfcf65c3f1743b9
- source-boringssl-ssl-x509.txt:d97679cffb58f5feba6a7922c8233015490a5301cbc6451c45ea19955c123029
- source-boringssl-x509-vfy.txt:8a2fa3f8cff682ba844bc14e7d69876bd56621ffb0fc446a4b9f8c0a6cd8ea8b

Fresh preApply DoR13/13,0exceptions,mutationPerformedfalse:
preapply-dor.json SHA256e88f0fb65274f8a0276302916e422c73ef648dfa28316fc1d021ec8d405a0822.
Metadata/preimages/tool identity inputs.json
SHA2561a62300a639bb17305c411d21935e4372dbac9bdc45031deb88d2ee67d02f694.
Official SHASUMS fetched successfully after connector release-download GET was
unsupported; shasums.json SHAd83390f24263da3bf078ba0cd8797e425540b4fd47ee189456d0aa00ad10d1ea.
Registry SRI and ZIP SHASUMS agree with the approved declared identities, but no
wrapper/binary payload has been downloaded or executed.

Budget: prepatch investigation1/1 consumed; source variant0/1, generation0/1,
baseline/candidate executions0/1 each, builds0/2, postpatchreview0/1, correctedVM0/1.
The [pending amendment](../production-chain-witness-amendment.md) is a concrete
source-backed alternative proposed by the parent, not yet approved, generated,
executed or independently reviewed. It must not be inferred from the original
approval. All c8 evidence, completed CI4346268029512/12 and original failures stay.
