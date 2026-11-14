# ADR-150: prove the harness against real regressions

**Status:** Accepted for implementation within issue and maintainer's delegated Wave 3 scope.
**Date:** 2026-09-26.
**Deciders:** IgnacioBarEsp (scope), implementer (bounded harness choices).

## Context and baseline

DoR 13/13. No equivalent #150 PR found. #142 already added reachability and clipboard negatives; #146/#147 introduced a genuine four-step preparation flow, #148 segmented projects, #149 destination transitions and timed feedback. Reuse these suites, not duplicate engines. The stack remains draft pending actual human/independent gates.

## Decisions

1. Extend existing real service journeys to six canonical profiles × two choices × two motion preferences × three required windows. Additional actual operations (existing prepared/unprepared folder, duplicate/remove, recovery, search, handoff) stay exercised by UI journeys. Record routes after settled actions; declared but unvisited routes fail. Native-only stages use explicitly labelled stubbed service fixtures for renderer coverage, not a claim of installing a toolchain in Chromium.
2. Shared probes return denominators and facts; every targeted negative must fail its intended assertion. Exceptions/timeouts are never detections. Keep existing mutations and add missing profile/rail/nav/decorative/motion/coverage controls. Hidden nodes without painted boxes do not count as occluding content.
3. Real Electron on Windows uses _electron.launch, firstWindow and main-process clipboard.readText. Official [Playwright Electron](https://playwright.dev/docs/api/class-electron) checked 2026-09-26 describes main-process evaluation and native-dialog stubbing. Only picker selection is injected into disposable folders. Source captures are labelled source captures and include hashes/commit/runtime, never installation/release evidence.
4. Historical runs serve immutable Git bytes in memory with git show and inject only the service fixture through the browser harness. Assert old/fixed reachability, containment and copy defect signatures, preserving logs and source commits. New taxonomy/motion-token rules are not retroactive hotfix requirements. Do not change release assets or checkout historical code over user files.
5. Independent report is mandatory before archive. Maintainer walkthrough and two-person cold reading remain separate; models cannot provide those observations.

## Security, cost, compatibility and rollback

No new runtime dependencies/services/secrets. CI permissions stay contents:read; pinned actions and existing npm policy. User projects untouched. Required aggregate includes the Windows job; absent/skipped tests cannot pass. Runtime installation uses the pinned Electron install script. Revert test/CI PR if infrastructure fails, without marking an unexecuted check green.

## Risks

Probes may expose bounded renderer defects: fix them in this change with a regression, documenting the
specific expansion. First finding: empty notice reserved blank space at the scroll end outside the wizard;
collapse only the empty region, retaining live notices and their accessible status behavior.

The normal-motion resize journey exposed transient navigation clipping: transition:all animated padding
and font size across breakpoints. Navigation now transitions only color/background/border/press transform;
its layout snaps to the target size. A static regression asserts this bounded change. The harness also
waits for the asynchronous agent-selection save/plan rebuild before measuring the replacement footer.
Painted borders and direct text count as content at the scroll end; empty wrapper boxes do not.

The previous color guard only rejected hex literals. The new CSSOM/source guard also rejects functional
colors outside tokens.css. All 62 existing rgba declarations now reference 34 alpha tokens with the
same exact channel/alpha values (39 layout, 7 components, 16 pages). No palette or contrast change.

Full cross-product costs CI time: bounded fixtures and explicit timeout, no silent sampling. Motion readiness must precede hit-testing; virtual clocks must not freeze compositor transitions. Route coverage cannot be manufactured by merely assigning a route string; evidence identifies live versus stubbed paths. A historical defect unrelated to this scope remains reported rather than hidden.

## Integration refinement — 2026-09-30

The maintainer requested the #149 full-window ambient background and finite title/primary illumination.
Integrate that parent without weakening the interaction limit: only the exact body pseudo-element may
repeat (20 seconds, linear, alternate, opacity), and only the scoped one-pass title/primary sheen may
last 900 ms. Reduced motion remains fully static. Import the parent's renderer probe and preserve all
existing duration, route, containment, contrast and reachability negatives; add wrong-origin and
repeating-sheen negatives. Journey settling waits for finite animations only, never for the ambient
cycle; the property probe must reject other loops rather than accepting them by timeout.
The earlier CI/native results do not cover this refinement. Repeat evidence on the integrated tree.

## Final-head coordination — f9ed23c approved

The original implementation authorization above remains historical and scoped.
It does not approve the new [coordination protocol](coordinated-final-head-amendment.md).
The [literal human approval](evidence/coordinated-final-head-approval.md) now
authorizes that protocol. It validates the final composed product while preserving the
seven-phase order, criteria, human receipt boundaries and individual official archives.
It replaces neither failed checks nor human #146/#147 journeys with approval of a plan.

Candidate `332a261` combines the stack with main `7073033`; owner byte comparisons
and the raw failed qualification attempts are indexed in
[the preflight manifest](evidence/coordinated-final-head-preflight.json).
Only docs are added by this proposal. No source patch, CI/timeout change, readiness
flag promotion, new debt capture, archive or integration is performed by recording
approval. A draft joint PR may obtain current CI before archive; it remains unmerged
until all applicable gates, ordered archives and final required CI are complete.
Product changes outside this scope require a concrete owner/spec decision.
Source snapshots and original failures remain.

## Installed-evidence corrective scope — 2667452 approved

The independent review of e713 found F1 (new native fixtures still use retired
profile IDs) and F2 (two service-mutation anchors no longer exist). A real VM cycle
failed with PROFILE_INVALID before its native window journey; runtime/installer
steps that passed retain their narrower scope. The product guard is not weakened.
The [installed-evidence amendment](installed-evidence-harness-amendment.md) fixes
five named verifier/fixture/QA files. Explicit approval of2667452 is now recorded
in evidence/installed-harness-approval.md.
Its bounded regression/installed cycle and same-reviewer incremental reconciliation
preserve the original source, failure, report and human gates. This is a separate
decision from the approved f9ed23c protocol. A bounded source correction is being
prepared/frozen; no future execution or post-fix review is inferred from approval.

The actual freeze at662fc27 and first regression execution are retained separately:
five passed and two failed on business.role=analyst. The unchanged product
normalizer recognizes freelancer and rejects analyst. No validator or assertion
will be relaxed. The [fixture-role decision](fixture-role-correction-amendment.md)
contains the exact one-literal diff, preimage/postimage and explicitly additional
budget. Actual c8cd8d5 approval is recorded in evidence/fixture-role-approval.md;
716f9e2 applies only that literal, with7/7 real regressions. The same reviewer
completed the approved single incremental reconciliation; its scope/remaining
installed gate are recorded in evidence/fixture-role-c8-result.json. Original
failure/budget remain; unchanged mutation sources were not rerun. Electron218
approvals7af/2d2/1cb/d812 are resolved, with focused TLS/native checks retained.
Its local owning gate failed2PASS/2CANCELLED; installed UI remains unqualified.

## Observation-only diagnostic proposed after d812 STOP

See bounded-recovery-qa-diagnostic-amendment.md for the exact two names, copied
QA-file allowlist, trace points, unchanged assertions/fault points/timeouts,
180s preparation/240s process limits and single invocation. Only the copied
QA observer and a managed supervisor may differ; production sources remain exact.
Freeze original and diagnostic hashes separately before execution. Do not
attribute the original app fingerprint to an instrumented QA tree.

Record parent/child monotonic phases and existing progress events to at most1MiB,
preserve the90s cancellation and all raw failures, and inspect only owned journal/
selector bytes without invoking extra recovery. Terminate only owned diagnostic
children after recording failure, never to manufacture PASS. No new qualification
credit or automatic fix follows even if both observed cases pass.

Actual e978 approval preceded the one observation variant/invocation,now consumed:
1PASS/1CANCELLED,178799ms,98events. The three-point test spent64.535s before its
third iteration;cleanup overlapped the still-active child. See the retained
result/analysis for facts,unknowns and physical-root-retention limitation.
No product patch,ownerTLS/native/review cycle,fullsuite,build,VM or CI change occurred.

## QA lifecycle correction —5013 approved/applied; blocked

recovery-qa-lifecycle-amendment.md defines the exact three-file QA allowlist,
four real90s cases and five3s helper regressions. Start from original QA6382307b,
not the instrumented copy. Preserve the runtime and every original recovery,
selection,generation,history and project assertion. Each fault point becomes an
independent test;the greater aggregate cost is explicit,not a hidden cap increase.

The new test-only fixture holds ChildProcess handles and installs error/close
listeners before waiting. It checks a bounded exclusive nonce/point witness,
rejects unrelated exits,and terminates/awaits only its active children before
deleting its proven root. On unresolved ownership/close,retain root and fail.
After close and before new recovery,check actual test cancellation so a timed-out
body does not continue recovery. Do not use TestContext.signal alone to skip
cleanup;the actual trace also emitted it after a passing case.

One approved QA variant/focused run/scoped fresh review does not reset any prior
budget. Only focused9/9 plus full current requiredCI3OS and review without
unresolved findings can reconcile these corrected QA gates. Unchanged d812
copy/pack controls remain retained by source/input hashes. Builds/VM/humans,
debt/archives and protected integration keep their separate original requirements.

5013 approval and frozen-source/result receipts are indexed in
evidence/recovery-qa-lifecycle-result-5013.json. The one focused run passed9/9;
the independent cycle is incomplete after a service usage-limit error. Its
partial P2 is parent-confirmed statically from exact Node24.18.0 source,not
runtime-reproduced: absent stderr on EMFILE/ENFILE rejects completion before
close registration. Preserve the frozen QA,all failures and consumed budgets.

The concrete recovery-qa-spawn-error-amendment.md is a NEW pending decision.
Only helper and unit QA may change after its real approval. Install close/error
observation before optional stderr,record first cause and wait close on either
failure. A pure observation seam grants no spawn/kill/root/ownership authority;
synthetic absence/stream-error controls cannot be counted as real process tests.
Preserve the existing nine controls and add one explicitly synthetic test with
two controls;proposed focused denominator10,not9. Additional variant/run and
same-reviewer continuation are explicit,not a reset or a second fresh review.
