# #218 — local recovery QA receipts complete via f41af24; builds and VM still gated

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
