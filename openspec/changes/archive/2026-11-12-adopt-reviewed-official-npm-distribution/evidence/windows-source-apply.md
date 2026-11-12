# Windows development-source Apply — bounded evidence

Approved revision f3b4ff25cf21ae1690c28f07bf378d2afb8678f7: the maintainer replied **«Sí, apruebo la enmienda f3b4ff2»**.
[Literal record](windows-source-approval.md). Earlier8d335a2 remains approved; no fifth upstream patch.

## Implemented boundary

One helper inventories the raw source and permits only zero or the exact27 bounded regular auxiliary
paths, including rejection of unknown/partial/case-variant names, nested empty directories, links,
hardlinks and >16KiB auxiliaries before reading. Complete raw traversal is capped at1971files and
12738830bytes. The projection and destination must remain the official1944files/12296462bytes/tree
`5f3ed5146082cfcb794ebb8fe6c1d8cc58b336aec26e3df0f871823c1758ec82`.
The exception is bound to the full reviewed identity key, not whichever future version becomes default.
Source/destination must be disjoint, ancestor-safe and destination exclusive. Only inventoried files
and ancestor directories are copied, then destination and full raw source are reverified. Cancellation
or observed drift never returns a verified result. No auxiliary is copied/executed or grants authority.

The manager uses this only for its development copy; packaged ZIP extraction stays unchanged. Pack
seals the canonical copy, records raw/projected coverage, and the artifact verifier reconstructs raw
coverage from the actual extracted official inventory plus excluded path/size/hash records. Existing
catalog, identity, ZIP digest/size, full-tree and byte/file-count checks remain.

## Independent review and confirmed correction

One fresh investigator /root/npm204_windows_source_boundary and one fresh reviewer
/root/npm204_windows_source_candidate_review completed the expressly approved bounded cycle.
The review turn hit a usage limit and resumed once; that is not a second completed review cycle.
Reviewer independently confirmed raw1971 → canonical1944, official digest,27excluded and unchanged
source. It found one P3: pack staging retained another12.3MB after each build. Parent confirmed with
the actual production npm preparation prefix before the fix: successful seal left staging present.
After the fix the same prefix leaves staging absent. A new permanent QA test executes that production
prefix and confirms cleanup both on success and injected preparation failure, without executing builder
or installer. Cleanup validates the owned canonical temporary child before removing it and preserves
a primary preparation error if cleanup fails. Canonicalizing the system temp base also avoids rejecting
its ordinary aliases; linked npm input still fails closed. No independent post-fix approval is claimed.

The reviewer's TEMP/junction execution was inconclusive and is excluded from findings. Parent separately
confirmed the existing junction is rejected by canonicalFolder through a read-only call, not a complete
pack or macOS proof. Automatic approval review rejected the reviewer's junction cleanup with
“blocked by policy”; no further removal attempt was made. Its exact temporary path is retained in the
managed review report, separate from product cleanup.

## Actual checks and limits

- Syntax/import and fixed local OpenSpec1.6.0 strict/docs/neutrality/diff checks passed.
- Canonical/27-input and concurrent-owner controls2/2; unknown/partial/type/size/link/official drift,
  cancellation and observed auxiliary drift3/3. Source unchanged, deterministic seals agree.
- Actual manager installation/selection/repair/data preservation1/1; interrupted repair, three real
  publication/selection/finalization crash points and missing published slot3/3 passed with the real CI
  raw source. These do not establish two real apt channels or hostile-filesystem authentication.
- Existing packaging22/22; actual pack-prefix cleanup success/failure2/2. Full installer is still pending.
- Pinned Electron44.1.1 restored using the already cached archive with exact published checksum;
  no change to its pin, download policy, runtime or installer source.
- Official metadata/primary advisories were checked again12nov20:50–20:52UTC, identities unchanged.
  The root and app moderate findings remain visible; no “vulnerability-free” claim or new exception.

Initial per-file copy exceeded the90s test budget; its failure is retained. The bounded existing copier
then initially rejected its already-created root (EEXIST); that failure is also retained. Copies now
start at inventoried top-level children under the exclusively owned root. A grouped four-case driver
hit180s and retained two passing negative groups plus its timed-out aggregate. Final tests use separate
positive/concurrency and negative groups, with unchanged per-test and process limits. A fixture's empty
directory cleanup EISDIR was corrected to nonrecursive rmdir. Original failures are not replaced by PASS.

## Managed index

Target: `C:/Users/RitualDesktop/.codex/worktrees/204-official-npm-adoption/project-engineering-os`,
 storage `persistent`, prefix `artifacts/adoption204/`. Read with read_codex_security_artifact.

| Artifact | SHA256 |
| --- | --- |
| windows-amendment-approval-f3b4ff2.json | eb220fce6181af8d653a64fa7ab432bbe4bf4e841a3847587a8a017a27174c95 |
| windows-source-independent-review.md | 2ab733fa43fa5239902fbc72ec379cc14d69109670b88a097e7cf1c651f7d2df |
| windows-source-positive-v4-result.json | f8f43fdaa7b6b577ada2a706d89abbdb8ad6f060e5e41ca8510784dfd91daed6 |
| windows-source-negative-v4-result.json | d67484cba4286f61332187f75997d8ec5ed420b42c3fcdb1f18c948b1544936d |
| windows-source-manager-install-result.json | a90dbffd724453c633ce16454c9aceb1d17268d4c256ff51e88c0d6c032c8694 |
| windows-source-recovery-result.json | 233cab7d7a73103ed2d95509883f21e396b67b4e2634edb61ae21362057c3d3f |
| pack-npm-cleanup-before-after-result.json | 55c41dc8a375f11e7be3c867f270c6bef1c2ebf248269bc73ff40567ad693fdc |
| pack-cleanup-postreview-result.json | fa820e30e712f2d32a62ead7a61635b867de671b91abd73cd936bd8286b304d9 |
| windows-source-focused-result.json (failed) | 2ff7a3b585cdcdedfdfa1b4bd0f601fc953725764d4879af4488eb178d14093d |
| windows-source-focused-v2-result.json (failed) | 774597ae3f361927a4ac56d7a5758b589fdd9bcbeccde2f863115c717cba8a18 |
| windows-source-focused-v3-result.json (timeout) | 3c872ed906bac10baf5d1b03f0d7a864bfa2456088f0acc45d081bd90b5111a4 |

This is a verified bounded source candidate. Full build/artifact/installer, final debt/readiness/archive,
required CI at the actual final head and protected integration remain gates. No merge/release/issue
closure or completion of ola3 is claimed, and no ola4 work is started.


## Cross-platform CI fixture reconciliation after54245cb

Run43305650052 head54245cb rejects original POSIX installer inputs because their .bin entries are
symlinks, not the exact27 regular Windows auxiliaries. The product rejection is intentional and stays
unchanged. New positive QA originally assumed every installed input was Windows-shaped. The QA-only
fixture now omits solely the nine known POSIX installer symlinks from its own separate copy and verifies
all1944official files/12296462bytes/full digest before it can serve as an accepted test input. Unknown
files/links remain and fail the full pin; no product path accepts POSIX links. A separate POSIX test
confirms the product still rejects the linked input, including when local installation used bin-links off.
Pack-prefix cleanup tests use that explicitly constructed canonical fixture on POSIX. Windows tests
continue using the real1971-file source. This is fixture correction, not widened acceptance, policy or
source change. Original remote failures are retained as managed ci-43305650052-linux-original.json.

The first complete Windows build reached the pinned packager but failed before graph collection because
the isolated build PATH lacked Windows PowerShell. product-pack-54245cb-result.json retains that error;
no installer/manifests or successful build claim resulted. Retry uses a different, complete isolated
build environment with the already reviewed fixed CI npm client; it is not another npm candidate install.

## Final product checkpoint

The subsequent full artifact, disposable installer/runtime/recovery cycle, all-platform CI and owner debt
assessment completed; [final evidence](final-product-verification.md) supersedes the earlier pending
labels above without replacing their raw results. Protected integration and release remain distinct.


