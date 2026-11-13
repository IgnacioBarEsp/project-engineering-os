# Final product verification — #204 and bounded Windows amendment

Code reviewed/tested:346e3bdc2d1d6e3c991b65963077aabea568b8ee; production bytes equal54245cb,
with the later commit changing QA fixtures only. Base3335cc7 is the unchanged approved#214source.
Approvals8d335a2/f3b4ff2 and their literal replies are resolved, not inferred from a heartbeat.
The retained [product manifest](product-manifest.json) indexes hashes in the standalone persistent
collection owned by C:/Users/RitualDesktop/.codex/worktrees/204-official-npm-adoption/project-engineering-os.
The preflight collection and original failed artifacts remain in [manifest.json](manifest.json).

## Actual artifact and disposable installation

A clean short owned copy of all1814trackedfiles matched source digest
4ec58c41a57a1e047e422baea2c1007502154e01d0671f0739cba03da19dcd9b.
Build used existing verified dependencies, Node24.18.0 and the unchanged CI npm11.19.1 client.
The pinned cached Electron44.1.1 archive matched its published checksum. No new npm candidate install,
host dependency/pin, NSIS or CI/policy change was used to obtain the artifact.

ProjectEngineeringOS-Setup-0.3.7-x64.exe:133271517bytes,
SHA25656b944b6cc8b90bec5e409bc74ce733289e478d5f5f1b53900e798d72c33f912.
Full production verifier passed against source346e3bd:2549packagedfiles/69008463bytes,
2621installedfiles/457604623bytes and151productiondependencies. Actual Authenticode status was
NotSigned, matching the declared candidate limitation. The npm ZIP is4207812bytes, hash
fef16d4e55a97a22965ab51dd6dc2b670274a4d303d48e6b1da1d0f7a29803ef,
and extracted official tree1944files/12296462bytes/hash
5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82.
Two real-manifest negatives changed only ZIP digest or raw coverage hash:2/2 rejected for the intended
reason, original manifest byte-restored after each; installer unchanged. License/notices coverage passed.

One owned offline Windows Sandbox, ID8b26b106-94b6-4a24-8c2e-8d5ba0c47710, completed and was stopped.
Inputs were mapped read-only, with only the private evidence output writable; host installation was
never enabled. Guest identity was WDAGUtilityAccount. The final status at2026-11-12T21:35:47.708Z was
PASS and finished.ok=true. Primary hashes of the actual published0.1.0 and0.3.6 baseline assets were
verified before use, preserving their release identities.

The installed0.3.6→0.3.7 migration retained the exact old npm slot, project/history sentinels and all
prior bytes. New manager uses only the compiled new identity and rejects unfit fallback. Real packaged
install/warm/corrupt repair, cancellation after quarantine, SIGKILL repair/restart/recovery passed.
The actual new npm CLI reports11.21.2 under real Node22.22.0/24.18.0/24.20.0 in the guest.
The prior vulnerable npm CLI was never executed for the comparison.

The canonical release-install harness also passed0.1.0→0.3.7, five native automated profile journeys,
and uninstall with project/history/runtime sentinels retained and application/link removed.
Native results:0findings,14unverified. Engine-assisted folder/base choices and automated screenshots
do not establish human chooser use, installer wizard acceptance, final reading or visual approval.
Earlier human approvals retain their original scope; separate#146/#147human journeys remain separate.
The guest evidence ZIP includes raw JSON and screenshots, not invented human acceptance.

## Audits and regressions

All four original raw scopes passed the unchanged high threshold: root/root-runtime/blueprint/Companion
have0high/critical, and1/0/0/32moderate respectively. Root fast-uri and Companion glob/minimatch residuals
remain visible. No exceptions, overrides, audit fix, bundled-source patch or reduced protection.
The144npm closure entries match official source, unrelated nodes and approved#214lock attributes
remain unchanged. Root/blueprint zod4.6.6 identities and MIT license remain as separately approved.

Immutable official preflight evidence retains physical coverage144packages plus40owned module markers,
all1944files, tarball SRI/source identity, twelve immutable real-lock installs across three Node versions,
58Undici regressions per runtime and policy controls for scripts/bin-links/workspaces/config/age/registry.
Product older-advisories QA13/13 adds CJS/ESM brace-expansion legitimate/capped recursion controls for
GHSA-q2hr-2g5m-vwhr/qhr7-859c-m2p7/6j4f-fj2g-mc7p and actual retry/WebSocket/inflate checks for
GHSA-r53p-7pc4-xj5r/rfgv-xxqx-mfg5/3wwx-pv8p-q78v, preserving valid HEAD/subprotocol controls.
Together with the five newer Undici advisories, these cover the declared old baseline regression scope.
No exploit of Companion is demonstrated or inferred merely from an advisory/version range.
The withdrawn cache/braces advisories are historical;#208 remains NOT_PLANNED, not an implementation.

## Independent review and trust boundary

The fresh original investigator/reviewer cycle examined the changed product and found twoP2:
missing destination could advance selection, and a crash after journal archival could strand the lock.
Parent confirmed both before the correction and reran the same real triggers after: generation remains
unchanged on missing payload; completed exact-nonce history permits verified bounded recovery.
The expressly approved additional investigator/reviewer cycle examined Windows source normalization,
independently reproducing1971raw→1944canonical with official digest and original source retained.
Its oneP3 staging leak was parent-confirmed and corrected; permanent actual pack-prefix success/failure
cleanup controls2/2 pass. Reports and before/after triggers are indexed. No second completed cycle
for either scope or independent post-fix approval is invented.

Authority stays in the self-contained compiled catalog, never a mutable receipt/renderer route.
Exact full identities separate equal-version synthetic channels; selector generation/hash/readback,
canonical/type/link/size/case/unknown-key checks and stale/cancel controls fail closed.
Only the exact27regular bounded Windows auxiliaries are excluded in a new canonical copy; raw inventory
and excluded hashes remain descriptive, not authority. Official source, packaged extractor and all
other runtime contracts are unchanged. POSIX installer symlinks are rejected by production; corrected
QA constructs an explicitly separate canonical fixture and proves that rejection independently.

The existing trusted-operation model checks manager acquisition/selection, not every unchanged
subprocess caller against a hostile concurrent filesystem writer. Nonce/lockhash/root/compiledidentity/
selection/receipt/tree bind journal recovery; deadPID alone does not authorize takeover.
Locks without journals and interrupted recovery claims remain fail-closed/manual. Power loss,
malicious host filesystem and a real roundtrip between two apt channels are not established.
The only enabled real destination is official11.21.2. Future destinations require frozen identities
and the same gates; no automatic latest/rebase, vulnerable rollback or indefinite npm fork.

Automatic approval review rejected the reviewer's temporary junction cleanup with “blocked by policy”.
It was not retried or bypassed; the inconclusive reproduction is excluded from findings. The product
cleanup fix concerns only its exclusively owned staging, with canonical bounds and primary-error retention.

## Recovery and retention

Real manager tests cover interrupted repair at publication/selection/finalization, absent destination,
selection preservation, actual process kill/restart and exact current payload verification. Additional
packaged guest recovery uses the actual ZIP/installed manager and conserves quarantine, history and
project sentinels. Unknown ownership stays manual rather than deleting another operation's evidence.

Owner CLI captured this clean remediation assessment exactly once. Registry remains
2711f41198011fa04434a3ded8c6b805a2fe5de9102140ecbedb85c54914d6d3,
50items/37open; all74prior assessments byte-identical; new75th assessment SHA256
f1d50bcf01379c45f031ad61add24f9f4ca32161f6e3c0bf70945a7b89b0b371.
No new debt item/exception/closure or#206/#214recapture. Plan open4/budget5 and residual3flows are
distinct from total37registry-open items and are retained without relabelling.

A disposable source inverse reversed only adoption commits346e3bd,54245cb,f4db025,6f39c43.
Its index exactly equals the approved214base tree551fe4d2e5f4884fed765dc40b6899433e4190cb;
registry and all75assessments were kept. This is source recovery, not permission to deploy or execute
the older vulnerable npm; current product/main/projects were untouched. Prior recipe4 stays rejected,
4/4consumed,0remaining,0fullnpmcompositions, with original amendments/raw ledger retained elsewhere.

## Resources and declared degradations

Paired same-guest Node24.18.0, installed0.3.6 vs actual0.3.7, one isolated-worker sample each:

| Operation | Baseline ms | Candidate ms | maxRSS raw baseline / candidate |
| --- | ---: | ---: | ---: |
| cold | 7013.6896 | 8145.7162 | 167068 / 160756 |
| warm | 2865.0228 | 2781.9587 | 72832 / 72508 |
| corrupt-cache repair | 14560.4976 | 13867.4422 | 209772 / 196104 |

Cold adds1132ms(~16%) with the added full identity/publication safeguards; warm/repair and peak RSS
decrease in this sample. This does not establish a statistical benchmark or universal acceptance budget.
Retained baseline tree/slot is not an allowed fallback. No process/output/file limit was increased.
Unsigned installer, moderate findings, manual orphan handling,14native-unverified and human boundaries
remain explicit. IgnacioBarEsp owns the small selector/receipt layer, not patched upstream components.

## Readiness evidence

[CI43306807954](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/43306807954)
completed SUCCESS at346e3bd: six core/fixture matrix jobs (3OS ×22.22.0/24.x), dependency-audit,
three Companion jobs and CI / required. All other pins/CI/install policy stayed unchanged.
Core check/normal+isolated constructor fixtures prove opsx/workflow, sync/idempotence, capability
and doctor JSON classification; expected baseline doctor WARN/SKIP/three upstream technical FAILs
remain classified, not claimed universally green. Companion suites, UI/contract/landing and mutation
checks passed; authorization/session-style negatives are identity/receipt/stale/cancel and existing
trust-contract controls. Windows skipped only the POSIX-specific symlink test; POSIX actually ran it.
Local three-Node controls supplement this; three runtimes alone are not a three-platform claim.

Fixed local OpenSpec1.6.0 strict, documentation presence/relative links/findability, neutrality and
read-only debt checks are rerun for the changed closure documents before archive. Focused literal
secret-signal scan of added patch lines found0; it is not an exhaustive repository security/secret audit.
No metadata command grants authority. Product validation bytes stay those of346e3bd.

Retained earlier failures include Windows launcher inventory, POSIX fixture mismatch, grouped timeouts,
EEXIST/EISDIR, missing isolated PowerShell, long-path NSIS include, fixture/version assertions and
invalidated concurrent QA. They are not attributed to current CI or silently overwritten.
Build retry changed only the owned short source/environment, never NSIS/guards/policy.

## Integration remains a subsequent protected operation

PR#216 carries unchanged approved#214 plus independently approved#204. Both phases retain own
assessment/review/archive inputs. After true readiness, archive each with fixed official OpenSpec,
commit only closure docs/specs/debt data, and require CI / required at that actual final head.
Only then protected merge can integrate;#215 stays draft until replacement is truly integrated.
No issue/card Done, merge, canonical release comparison, tag/release/public download or ola3 closure
is claimed by this evidence. Actual canonical release assets remain a separate protected release gate.
Do not archive rejected research, reorder the UI pile or begin ola4.

## Official archive checkpoint — 2026-11-12

Readiness16PASS/0FAIL/0exceptions for each phase was verified without mutation. Fixed official
OpenSpec1.6.0 then archived both changes and updated the three canonical specs with validation enabled.
This is an actual local archive, not integration. Protected merge still waits for required CI at the
closure head; published download remains0.3.6. The rejected research was not archived.
