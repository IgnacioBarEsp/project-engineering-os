# Brownfield baseline

Main7073033724a20ee60bb76bc1791a7c3ae7cfca34 already integrates npm/Zod,
#152 and phase1#206. Product e713e9a and current716f9e2 pin Electron44.1.1.
The existing installer0.3.7 is133307422bytes,
SHA25663754b6a9311ef45ecabe2968265cbb7bbb4a6ca58a3beb8a599934b89bec499,
manifest Electron44.1.1/NotSigned. Public download remains0.3.6.

Approval c8cd8d5 is implemented: one native fixture literal corrected,
7/7 regressions on716f9e2; same independent reviewer reconciled F1/F2 with no
new actionable delta findings. Runner37/37 is retained by verified identical
inputs, not repeated. Two harness variants and the one incremental review are
consumed; the corrected installed cycle remains0/1. Old5/7, e713PROFILE_INVALID,
local timeouts, raw reviews, builds and VM evidence remain unchanged.

This is a separate public upstream dependency update, not a new vulnerability
disclosure or exploit demonstration. Electron advisory says affected branch44
before44.9.1. Static main→service→inference establishes supported remote TLS;
renderer sandbox/CSP and default off/local retain their narrower protection.
Other8high development alerts have not been triaged in this bounded phase.
Production-only audit PASS is not proof that Electron is safe.

Preparation only fetched official metadata/source and public certificate data.
No Electron tarball/binary installation/execution, new fixture key generation,
lock change, test implementation, archive or merge was performed. The prior
upstream test certificate dates and debug-only hook limitation are retained.
Supplier identities/hashes are declared until actual candidate bytes are checked;
test witness feasibility remains an explicit Apply gate, never a future PASS.
