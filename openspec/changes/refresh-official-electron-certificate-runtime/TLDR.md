# #218 — builds 2/2 PASS on 20fbe4c; corrected VM 1/1 FAILED at Phase 2 (sync amendment pending)

**Update 2026-11-26/27:** CI [45906034881](https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/45906034881) on `20fbe4c` succeeded `12/12`, and literal maintainer authorization («continua donde te quedaste, autorizo», DoR `13/13`) was recorded in [builds-and-vm-approval-20fbe4c.md](../companion-harness-reachability-electron/evidence/builds-and-vm-approval-20fbe4c.md). Both reproducible builds (`2/2 PASS`, `0` remaining) completed on clean clones of `20fbe4c` (`Electron 44.9.1`, `npm 11.21.2`, Node `v24.18.0`, zero downloads): `win-unpacked/` is `100%` byte-identical (`2,662` files / `458,983,230` B, `d8ea18bb...`), `resources/npm-dist.zip` is identical (`fef16d4e...`, matching `e713`), `verify-app-artifact.mjs` passed `2/2` (`NotSigned`), with an honest 5-byte NSIS container timestamp diff (`133,698,243` B `3b6410b4...` vs `133,698,238` B `e05bda0f...`; `+390,821` B vs `e713`; see [reproducible-builds-20fbe4c.md](../companion-harness-reachability-electron/evidence/reproducible-builds-20fbe4c.md)). The single authorized offline Windows Sandbox cycle (`1/1` consumed, `0` remaining, no retry) passed Phase 1 (`packaged-runtime.json`: `0.3.6 -> 0.3.7`, paired metrics, migration, cancel/crash recovery, Node `22.22.0`/`24.18.0`/`24.20.0`, uninstall) and **FAILED Phase 2** (`canonical-0.1.0-update-native-uninstall`, `exit 1`, `288,799 ms`) at `verify-native-journeys.mjs:520:29` (`Timeout 180000ms` waiting for `Archivos`, `0` DOM matches) due to harness synchronization races; see [corrected-vm-cycle-20fbe4c.md](../companion-harness-reachability-electron/evidence/corrected-vm-cycle-20fbe4c.md). The unapproved `#150` amendment [native-journeys-sync-amendment.md](../companion-harness-reachability-electron/native-journeys-sync-amendment.md) proposes a 2-file harness/QA fix (zero product changes), reuse of the unchanged verified Build 1 `20fbe4c` installer (`0` extra builds) and `1` explicitly additional offline VM cycle plus bounded review and CI. Human `#146`/`#147`, final debt assessment, official archives (`#218`, `#144`→`#150`) and protected PR `#217` merge remain open.

**Update 2026-11-26:** Under `#150` approved revisions `5013`/`fa15` and `f41af24`, the
remaining local interrupted-repair case passed uninstrumented in `69,049.573 ms` TAP
(`69,197 ms` process, `1 PASS / 0 FAIL / 0 CANCELLED / 0 SKIP`) on verified physical
`npm 11.21.2` (`1,944` files) and Node `v24.18.0`, with byte-exact equivalence confirmed
against `fa15` (`9 PASS`) and `d812` (`2 PASS` copy/pack, `9/9` inputs unchanged) across all
`223/223` `apps/companion` files. All historical failures (`d812` `2 PASS / 2 CANCELLED`,
`e978`, `fa15` `9 PASS / 1 CANCELLED`, `0999922`) and `4a88216` (`DIAGNOSTIC_ONLY`) remain
preserved, and no single-run `10/10` is claimed. CI `45902071618` on `f41af24` succeeded
`12/12`. See [qualification result](../companion-harness-reachability-electron/evidence/remaining-repair-qualification-result-f41af24.md).
Current CI on this evidence commit and maintainer review of the qualification evidence
remain required before authorizing builds (`0/2`), corrected VM (`0/1`), human `#146`/`#147`,
final debt assessment, official archives (`#218`, `#144`→`#150`) and protected integration.

**Approvals7af/2d2/1cb/d812 are all actually resolved. Do not ask again.**
[Latest approval](evidence/local-qa-resource-approval.md).

The single authorized sequential QA invocation completed with2PASS/2CANCELLED,
0SKIP and exit1. The two journal interruption/recovery controls again exhausted
90000ms; canonical copying/sealing and pack-prefix cleanup passed. The4/4 gate
was not met. [Exact result, raw hashes and stop](evidence/local-qa-resource-result.md).
No further targeted/full local suite, owner probe, variant, review or timeout
increase is authorized by this exhausted decision. Observation-only e978 under150
was approved and consumed once:1PASS/1CANCELLED;no qualification credit.
[Diagnostic result](../companion-harness-reachability-electron/evidence/recovery-diagnostic-result-e978.md).
The separate [QA lifecycle correction](../companion-harness-reachability-electron/recovery-qa-lifecycle-amendment.md)
is now prepared,still unapproved/unapplied. No previous budget reset or runtime change.

Source/tests/executable/ten frozen inputs stayed unchanged. The strict Electron
contrast9/9per runtime, native18screens/12copies, F1 reconciliation and prior full
CI12/12 on d812 retain their measured scope; they do not erase local failures.
The first two local full-suite FAILs and original bootstrap timeout are preserved.

Targeted1/1,variants2/2,baseline owner2/2,candidate owner1/1 and both review budgets
are consumed. Builds0/2 and same corrected VM0/1 remain unused. Stop before them,
archive, integration or release. Human146/147, debt and all final gates remain.
No host installation, project/history change or ola4.
[Ledger](evidence/apply-ledger.json), [manifest](evidence/manifest.json).
