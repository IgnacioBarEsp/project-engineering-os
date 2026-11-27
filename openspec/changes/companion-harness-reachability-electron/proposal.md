## Why

Issue #150 completes Wave 3 verification. Existing tests already cover many regressions from #142 and #144–#149, but do not cross all six profiles, both preparation choices, both motion preferences and the required three window sizes. Native Electron source-app captures need a required Windows CI job.

## What Changes

- Extend existing journeys and measure visited routes against the authoritative renderer table.
- Add explicit bounded-motion, route/rail/nav, occlusion, scroll and transformed-ancestor probes with measured denominators and targeted mutations.
- Run real Electron Windows source app in CI, verify IPC clipboard from the main process and emit provenance-bound captures.
- Reproduce historical #141 defects at a3b1efd and the #142 fix using isolated snapshots, without mutating product checkouts.
- Document the independent adversarial review protocol; keep human/independent gates pending until actual evidence.

## Capabilities

### Approved coordination amendment — f9ed23c

The [final-head amendment](coordinated-final-head-amendment.md) proposes qualifying
all seven existing phases on one identified final source, then archiving them in
their original order and integrating through one protected PR. It preserves every
phase criterion, scoped human receipt, independent review and debt history.
It does not approve historical intermediate layouts or replace the real #146/#147
maintainer journeys. Explicit approval of f9ed23c is recorded in
[the receipt](evidence/coordinated-final-head-approval.md); the protocol may begin.
Current local timeouts remain failures, not qualification.

### New Capabilities
- `companion-harness-coverage`: complete route/motion/window coverage, non-vacuous probes, negative controls and Electron source-app provenance.

### Modified Capabilities
None.

## Impact

### Reproducible builds (2/2 PASS), corrected VM cycle (1/1 FAIL at Phase 2) and pending sync amendment — 26–27 November 2026

After CI `45906034881` passed `12/12` on `20fbe4c` and literal maintainer authorization was recorded (`evidence/builds-and-vm-approval-20fbe4c.md`, fresh DoR `13/13`), both reproducible builds (`2/2 PASS`) completed on clean clones of `20fbe4c` (`Electron 44.9.1`, `npm 11.21.2`, `win-unpacked/` `2,662` files byte-identical `d8ea18bb...`, `resources/npm-dist.zip` identical `fef16d4e...`, `verify-app-artifact.mjs` `2/2 PASS`, `NotSigned`, honest 5-byte NSIS container timestamp diff; see `evidence/reproducible-builds-20fbe4c.md`). The single authorized offline Windows Sandbox cycle (`1/1` consumed, `0` remaining, no retry) passed Phase 1 (`packaged-runtime.json`: `0.3.6 -> 0.3.7`, paired metrics, migration, cancel/crash recovery, Node `22.22.0`/`24.18.0`/`24.20.0`, uninstall) and **FAILED Phase 2** (`canonical-0.1.0-update-native-uninstall`, `exit 1`, `288,799 ms`) at `apps/companion/scripts/verify-native-journeys.mjs:520:29` (`Timeout 180000ms` waiting for `Archivos` with zero DOM matches). Static analysis traces this to harness synchronization races (`waitForTimeout(1500)` after `Leer mis archivos` racing cold `pdfjs-dist` worker startup on `research`, plus `Detener`-based `notBusy`/`settle` vs `#content[aria-busy="false"]` and pre-render `revealDetails` calls; see `evidence/corrected-vm-cycle-20fbe4c.md`). The separate unapproved [native-journeys-sync-amendment.md](native-journeys-sync-amendment.md) proposes a bounded 2-file harness/QA allowlist (`verify-native-journeys.mjs`, `qa/verification-harness-contract.mjs`, zero product changes), reuse of the byte-identical verified Build 1 `20fbe4c` installer (`0` new builds), and `1` explicitly additional offline VM cycle plus bounded review and CI. No source edits, extra VM runs, human substitutions, debt capture, archive, merge or Wave 4 occur before literal approval.

### Remaining repair qualification — f41af24 approved and executed

Following the approved `4a88216` physical-source diagnostic (`1 PASS` in `64,865 ms` TAP,
`DIAGNOSTIC_ONLY`, historical cause `UNKNOWN`), the separate
[remaining-repair-qualification-proposal.md](remaining-repair-qualification-proposal.md)
(`f41af24`) received literal maintainer approval («apruebo») and fresh DoR `13/13`.
Its single authorized preparation (`40,436 ms`, uninstrumented `223/223` app files,
verified `1,944`-file physical copy of `npm 11.21.2`) and single invocation passed
(`1 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP`, `69,049.573 ms` TAP, `69,197 ms` process,
`exit 0`, zero traces). Byte equivalence with `fa15` (`9 PASS`) and `d812` (`2 PASS`) is
verified across code, Node `24.18.0`, physical npm and `9/9` `d812` inputs without claiming
a single-run `10/10`. CI `45902071618` on `f41af24` succeeded `12/12`. All prior failures
and `DIAGNOSTIC_ONLY` records remain intact; no product/QA/policy/dependency edits occurred.
Current CI on this evidence head and maintainer evidence review remain required before
authorizing builds (`0/2`), corrected VM (`0/1`), human `#146`/`#147`, debt/archives or merge.
See `evidence/remaining-repair-qualification-result-f41af24.md`.

### Physical source transport proposed after0999922 setup failure

0999922 received actual approval andits one observation failed before repair:
the agent's dependency junction was rejected by the unchanged canonicalFolder.
See evidence/remaining-repair-observation-result-0999922.md. The original timeout
remainsUNKNOWN. The new physical-source-observation-amendment.md proposes only
regular physical copying of the same1944-file npm source,complete inventory
verification andone explicitly additional attempt with all limits unchanged.
It remains unapplied until its own immutable revision is actually approved.

### Remaining repair observation proposed —26 November 2026

The [one-target observation amendment](remaining-repair-observation-amendment.md)
is a separate concrete decision after fa15 consumed its budget with9PASS/1CANCELLED.
Current source CI43616684145 is12/12SUCCESS;the original scoped review is complete.
Neither resolves the local90s repair timeout. The proposed one instrumented copy
and one exact-target invocation preserve90s/120s process/180s preparation limits
and all runtime/helper/assertion bytes. No instrumentation or invocation is
authorized before actual approval of this revision. The result is always
DIAGNOSTIC_ONLY and approves no future correction or qualification.

### Approved installed-evidence harness amendment — 2667452

Qualification of e713e9a exposed two verifier defects, documented by the independent
review and a real failed installed cycle. The [new concrete amendment](installed-evidence-harness-amendment.md)
proposes an exact five-file harness/fixture/QA allowlist, one bounded correction
and incremental reconciliation; no product/CI/policy changes. The maintainer
approved2667452 separately; the literal receipt is in evidence/installed-harness-approval.md.
Apply may begin within that scope. Original qualification/human gates remain.

### Approved fixture-role budget decision after the bounded Apply

The correction frozen at662fc27 failed2/7 regressions because its business fixture
uses an unrecognized optional role. The product guard is correct. The original
approval and consumed one-variant budget remain recorded. The
[new concrete decision](fixture-role-correction-amendment.md) proposes only
analyst-to-freelancer in that fixture and one changed-input regression execution.
The maintainer approved c8cd8d5 with «CONTINUA DONDE TE QUEDASTE, apruebo».
It is applied in716f9e2, with the unchanged seven regressions7/7 and the actual
same-reviewer incremental report retained. No budget reset or mutation rerun.
Installed qualification remains0/1. Electron218 approvals7af/2d2/1cb/d812
are now resolved; TLS/native checks passed in their scope, but the actual
d812 local QA2PASS/2CANCELLED blocks qualification.

### Observation-only diagnostic — e978 approved and consumed

The [bounded diagnostic](bounded-recovery-qa-diagnostic-amendment.md) requests
one instrumented QA-copy variant and one two-target invocation, retaining90s
per case and240s process/180s preparation caps. No runtime/test expectation,
dependency, guard or previous allowance changes. Its phase/process evidence
cannot qualify the candidate or authorize a future fix/build/VM.
Actual e978 approval was recorded before execution. The single diagnostic
returned1PASS/1CANCELLED and identified aggregate90s allocation/child-cleanup overlap;
see evidence/recovery-diagnostic-result-e978.md. No qualification credit or retry.

### QA lifecycle correction —5013 approved/applied; blocked

The [three-file QA proposal](recovery-qa-lifecycle-amendment.md) separates the
three interruption points into independent90s cases, preserves every real manager
assertion, and owns child close/error/fault witnesses before root cleanup.
It requests one frozen QA variant,one four-real/five-helper focused execution
under420s,one fresh scoped readonly review and full current requiredCI3OS.
This explicit qualification-protocol change received actual5013 approval.
No product/runtime/guard/dependency/CI changes or previous budget reset.

The one frozen variant and focused invocation returned9/9PASS in172725ms.
The one fresh independent reviewer sent a partial P2 then errored at a service
usage limit; the review is incomplete. Parent static confirmation establishes
missing stderr on EMFILE/ENFILE can reject completion before close registration.
See evidence/recovery-qa-lifecycle-result-5013.md. No post-freeze QA edits or retry.
The separate recovery-qa-spawn-error-amendment.md received literal fa15 approval
and was applied to only two QA files. Its additional variant/run are consumed:
9PASS/1CANCELLED,200117ms,the original repair exceeded90s again. No retry or
product/old-budget authority is inferred. The same reviewer completed the
source review and reported P2 resolved without another concrete finding;the
actual report retains its bounded scope and does not erase failed qualification.
See evidence/recovery-qa-spawn-result-fa15.md. No new amendment is implicitly
approved or pending just because the bounded invocation failed.

Companion test harnesses, CI, EVALUATION documentation. No dependencies, release, installed-app mutation, product data migration or Wave 4. Existing live-service and stubbed native-capability evidence remain explicitly distinct.
