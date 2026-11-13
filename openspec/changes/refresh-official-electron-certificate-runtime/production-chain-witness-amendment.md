# Pending amendment — production chain witness for #218

**Prepared, not approved or applied.** The original revision7af8a2a was approved
with «Sí, apruebo #218 en 7af8a2a». That approval remains recorded; it is not
pending again. Its prepatch investigation found a concrete protocol disagreement
before any fixture generation, variant freeze or runtime download.

## Why the original witness stops

The declared self-signed unrelated leaf plus blocked public intermediate does not
force that intermediate into the built certificate chain. Exact Node24.22.0
VerifyCallback returns1 while preserving its X509 error; BoringSSL can consequently
return ok1 with a leaf-only chain. Electron then scans that chain, rather than the
unrelated peer bag. Both the independent investigator and parent traced the exact
supplier revisions. This is a static counter-witness, not an executed binary FAIL
or evidence that official44.9.1 fails to mitigate a real compromised chain.
[Retained stop and identities](evidence/prepatch-stop.md).

The original design explicitly requires STOP on this disagreement. No pin, lock,
harness implementation, fixture or production protection was changed. Source
variants0/1, generation sets0/1, owner contrasts0/1, builds0/2 and corrected VM0/1.
Only the one prepatch investigation has been consumed.

## Concrete replacement proposed

Replace only the generation/shape of the already allowlisted untrusted test
identity and the corresponding exact expected negative codes. Keep the same
six fixture paths, two locally generated test keys, public blocked certificate,
official Electron identity, source allowlist and nine cases per runtime.

- Trusted control B stays a valid localhost self-signed test identity, trusted
  explicitly only by the isolated probe. Verification stays strict.
- Untrusted A uses its own test key and localhost public key/SAN, but is deliberately
  **not self-issued**: its issuer distinguished name equals the frozen public
  intermediate's subject. Sign it only with its own test key, never a CA key.
  Omit Authority Key Identifier explicitly using the existing OpenSSL3.5.7
  configuration value authorityKeyIdentifier=none. The resulting fixture has no
  valid CA signature and cannot authenticate as a real CA-issued identity.
- Without the public intermediate, A must be rejected with
  UNABLE_TO_VERIFY_LEAF_SIGNATURE in both runtimes.
- With the SAME A followed by the frozen public intermediate in one PEM
  certificate-chain value, the retained affected baseline44.1.1 must reject with
  CERT_SIGNATURE_FAILURE. The corrected44.9.1 must reject with CERT_REVOKED.
  Both TLS and HTTPS use rejectUnauthorized:true; fetch uses only child-startup
  NODE_EXTRA_CA_CERTS for B. Never trust the public blocked intermediate.
- All three transports must pass the valid B control and distinguish both exact
  invalid cases: 3transports ×3conditions =9 declared cases for each runtime.
  Capture nested fetch causes, actual binary/runtime identities and every result.
  A setup error, different certificate code, expiry, timeout or skip is FAIL.

Why this is a source-backed candidate: BoringSSL X509_check_issued checks issuer
name, optional AKI and issuer key usage before selecting a candidate issuer; it
does not perform the signature check at that selection point. Its issuer search
can therefore build A→publicIntermediate, and internal_verify later records the
deliberately invalid signature. Node's continuing callback does not grant trust:
JavaScript still rejects the retained error. Electron's compiled check then sees
the blocked public key in the built chain. This is an inference pending actual
production-binary observation, **not a test PASS or proof of project exploitation**.

Primary references:
- [BoringSSL issuer selection](https://github.com/google/boringssl/blob/572a4c68475d284b34675f45ddbb9c158ef3c2ae/crypto/x509/v3_purp.cc#L471)
- [Built chain and signature/error flow](https://github.com/google/boringssl/blob/572a4c68475d284b34675f45ddbb9c158ef3c2ae/crypto/x509/x509_vfy.cc#L219)
- [Official Electron callback](https://github.com/electron/electron/blob/e02265be96c5e13ae43644ef482b718e1e800499/patches/node/tls_reject_chains_containing_blocked_public_keys.patch)
- [Existing OpenSSL issuer option](https://docs.openssl.org/3.5/man1/openssl-x509/#certificate-output-options)
- [Existing OpenSSL AKI suppression](https://docs.openssl.org/3.5/man5/x509v3_config/#authority-key-identifier)

## Authority, budget and stop condition

This changes an explicit protocol/data expectation of7af8a2a and therefore needs
approval of this actual amendment revision before generation or implementation.
It does not ask again for the original runtime-update approval.

No extra fixture file, dependency, source file, parser, signing implementation,
debug hook, TLS bypass, host clock/trust modification or CA private key is added.
Use the already approved OpenSSL executable/config isolation and freeze the one
fixture set once, with current dates,365-day intended lifetime, SAN/key checks and
all input/output hashes. No generation or prototype has been run to establish
this alternative. Unexpected tool, DER shape or identity stops before execution.

Reuse the completed prepatch investigation's source facts; the alternative is
parent-proposed and has no independent approval. Do not start another investigation
or reset its allowance. The one fresh readonly postpatch review remains pending.
Maximum one frozen source variant, one generation set, one owner9+9 contrast,
two builds and the SAME still-unused corrected canonical VM cycle remain.
Existing mandatory CI keeps its normal meaning; no same-input discretionary reruns.

If actual baseline/control or corrected witness differs from the exact declared
codes, stop and preserve the raw failure. Do not substitute broader errors, alter
expectations after observation, chain variants or lower any protection. No claim
that a synthetic invalid chain establishes a trusted end-to-end attack or
Chromium-network coverage. Existing source/LICENSE/inventory/audit/runtime/
artifact/recovery/resource gates, human146/147, debt, official archive and protected
PR remain unchanged. No release, issue closure or wave4 is authorized by this
amendment.
