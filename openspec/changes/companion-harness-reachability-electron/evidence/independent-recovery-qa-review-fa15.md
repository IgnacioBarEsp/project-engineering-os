# Independent read-only review continuation — QA5013 / fa15e43

## Result and scope

The original independent review cycle is complete through this approved continuation. The original P2 is resolved in the current source. No additional concrete, actionable finding was identified within the three QA files and their necessary direct context. This is an agent source review, not human approval, product approval, installed-product evidence, or a qualification PASS.

Reviewer: /root/qa5013_candidate_review, the same reviewer that issued the partial QA5013 finding. No additional reviewer or sub-agent was created. The continuation instruction identifies the maintainer's literal approval “Sí, apruebo la enmienda fa15e43”; the repository approval record was read as scope evidence, not as an approval issued by this reviewer.

Worktree: C:/Users/RitualDesktop/.codex/worktrees/wave3-current-source-verification/project-engineering-os
Original review baseline: 5013e0c44cd8f0bcf54c2e4170269103aafee237
Continuation published baseline / observed HEAD: fa15e432d1d69571a9f527692a75fb320ecf06ac

## Reviewed source identity and status

All three QA files were read completely. The exact original tracked diff and complete additions of both originally untracked files were inspected in the first part of this same cycle. In the continuation, the exact helper/unit diff against fa15e43 was inspected, both files were read completely, and the unchanged main QA file was read completely again.

| Repository-relative source | SHA-256 of current bytes | Status against fa15e43 |
| --- | --- | --- |
| apps/companion/qa/distribution-identity.mjs | a97ac1e84cddda5fb4e9b05a0170a905ee8a126cc1cf8fd993decc1ecaa9565c | Unchanged |
| apps/companion/qa/helpers/owned-crash-fixture.mjs | 990166fcc3ad1b6237edc8a2710007be8125f0ac9aaa5a06074317318afb2306 | Modified |
| apps/companion/qa/owned-crash-fixture.mjs | c7942e9e8efbaa03ef28a1296e880abec818b9b4b3319182fd3f5266de38f125 | Modified |

Final read-only verification confirmed the same three QA hashes and HEAD. Documentation was updated concurrently after the initial status inspection: additional modified paths were openspec/changes/companion-harness-reachability-electron/TLDR.md, design.md, evidence/current-wave3-progress-20261114.md and proposal.md; new untracked paths were evidence/recovery-qa-spawn-result-fa15.json and evidence/recovery-qa-spawn-result-fa15.md. These later documentation contents were not reviewed. No additional QA source drift was observed.

The two preimages associated with the partial P2 remain identified as ab6ca641b23c349e2a2b6824ba599416bf2c0711e7cc5ec8f85649ac5ef691a7 (helper) and e3dc0e679add8ed442ff781df08de4213d333650a0ffe0a9615cd9a8b885976f (unit QA).

The initial continuation working-tree status also listed the spawn amendment and tasks.md as modified and the fa15 approval record as untracked. At that inspection, the tracked file-name diff against fa15e43 contained only those two QA files and those two documentation files. No working-tree runtime, dependency, pin, lock, CI, guard, or product change appears in that diff. This statement concerns the observed checkout, not a review of unrelated history.

## Preserved original partial finding

The prior partial message from this reviewer is preserved here as historical review output:

> Source review found one actionable failure-path gap: helper lines75–84 dereference child.stderr and attach data before registering close. When spawn/pipe setup yields no stderr stream, the Promise executor rejects with TypeError before close listener exists; original spawn cause is only stored later, and record.closed never updates. waitForExit/cleanup then consume the TypeError rather than cause. Also no stderr error listener. I am framing this narrowly as a P2 stdio/spawn failure handling defect, with source facts separated from unexecuted error-path inference; no tests/experiments have run.

That message was a partial finding, not a completed clean review. The historical helper preimage is the affected source. The repository result record says the parent independently confirmed the Node 24.18.0 EMFILE/ENFILE early-return applicability from Node source. This reviewer did not execute native resource exhaustion or independently inspect that external Node source during this continuation.

## P2 reconciliation

**Resolved by source inspection.**

In apps/companion/qa/helpers/owned-crash-fixture.mjs:39–65, observeChildExit registers child.error and child.close before reading child.stderr. An absent stderr returns from listener setup without dereferencing it or resolving completion. The close handler sets closed and synthesizes QA_STDERR_MISSING only if no original cause has already been recorded. A present stderr receives its own error listener before data handling. The nullish assignments preserve the first cause.

The real fixture calls this observer immediately after its fixed native spawn at helper lines103–109. waitForExit at lines117–124 waits for completion/close, checks cancellation, and throws the recorded cause. Thus the original missing-stream TypeError path no longer prevents close observation or substitutes for the original spawn cause. A stream error also becomes a recorded failure instead of an unhandled stderr error.

The added upper-level test at apps/companion/qa/owned-crash-fixture.mjs:85–116 specifies two event-only controls: missing stderr with an exact EMFILE error object, and stderr.error followed by a later child.error. Both assert that error alone leaves completion pending and closed false, then assert close and identity of the first cause. These are source assertions that were inspected, not test results witnessed by this reviewer. They do not demonstrate native EMFILE/ENFILE.

## Invariants and adversarial paths examined

- **Real coverage and limits:** distribution-identity.mjs:75–109 retains npm-quarantined and the three separate npm-published / npm-selection-written / npm-confirmed scenarios. Each real scenario retains timeout:90000 and the original platform condition. Journal presence/archival, exact previous selector bytes or expected generation/hash, verified tree status, restart/new install, corrupted original retention, and project/history controls remain. The other original test bodies and their fixture remain unchanged. The five original helper regressions retain their assertions; the delta adds one explicitly synthetic upper-level test. Every helper test retains timeout:3000.
- **Error and close ordering:** child/stdio failure is recorded separately from completion. Error alone does not establish closure. waitForExit checks failure before waitForCrash can accept a witness. A missing stderr without a spawn cause becomes QA_STDERR_MISSING. Stderr storage remains bounded to 65536 bytes; overflow records failure and reports once to the real fixture's held-handle termination callback. Observer completion or a successful numeric exit cannot erase an already recorded failure.
- **Witness legitimacy:** helper lines12–25 and98–102,127–140 require an exclusively created, exact format/nonce/PID/point record outside the payload. The reader rejects non-regular files, symbolic links, multiple hard links, records over4096 bytes, detected replacement/change, and content mismatches. Missing, wrong-point/nonce or malformed records cannot be accepted merely because exit was nonzero. A zero exit without a signal is rejected. No asynchronous IPC acknowledgement substitutes for the file witness.
- **Cancellation and pending work:** helper lines77–90 checks cancellation before queueing, before deferred invocation, and after the awaited work. Every real recovery/filesystem await uses owned.run, and both real bodies explicitly check t.signal after the child wait. Once disposing begins, queued work cannot start and subsequent recovery cannot be returned as successful. Already started work remains tracked until its promise settles. Cleanup itself does not skip on the context signal, which may also be aborted at normal completion.
- **Handle/root ownership and cleanup:** only start's fixed native spawn inserts a record into the closure-private children Set. owned rejects other records. cleanup at lines149–168 acts through those held ChildProcess handles, skips already exited/closed children, observes close, and waits tracked work within the shared five-second close deadline before root proof and deletion. Kill failure, missing close, unfinished work or root-proof failure prevents recursive removal and rejects cleanup. Root proof checks canonical parent/path, directory identity and the exact exclusively created owner record. No PID/age discovery, foreign lock acquisition or historical-temp sweep was added.
- **Synthetic observer has no fixture authority:** observeChildExit only attaches event listeners, accumulates bounded observation state and calls an optional overflow notification. It has no spawn, root deletion, children-Set insertion or direct kill operation. The synthetic test obtains observation records only and never joins fixture ownership. No arbitrary spawn provider was introduced. Native lifecycle integration remains in the original real-child tests and manager scenarios.

These conclusions are inferences from the inspected code and control flow. They are not claims that every OS/filesystem/error interleaving was exercised.

## Sources actually read

- AGENTS.md and CONTRIBUTING.md, read again for the continuation; README.md and docs/architecture/OWNERSHIP.md were read in the first part of this same cycle.
- The engineering code-review SKILL.md was read in the first part of this same cycle.
- openspec/changes/companion-harness-reachability-electron/recovery-qa-lifecycle-amendment.md, original and current approved status.
- openspec/changes/companion-harness-reachability-electron/recovery-qa-spawn-error-amendment.md, read completely.
- openspec/changes/companion-harness-reachability-electron/evidence/recovery-qa-lifecycle-result-5013.md and evidence/recovery-qa-spawn-approval-fa15.md.
- The three complete QA files identified and hashed above.
- Direct context only: apps/companion/runtime/manager.mjs (creation/verification, npm plan/repair/install and progress stages; relevant ranges1–54 and93–181 across the same cycle), apps/companion/runtime/distribution-identity.mjs (development-copy context92–122 and journal/commit/recovery173–260), runtime/process.mjs symbol references, apps/companion/package.json test/engine declarations, and the root package.json test command reference.

The directly inspected unchanged runtime-context SHA-256 values are 492534792a2087acfc5f5b0176dce049a1bf7b61735335bf6b8421c2268af510 (manager.mjs) and e99d042afc729665f27ce47895e9fe4c1047aae615d8bbb3a9c8b2c911111ae9 (runtime/distribution-identity.mjs). The runtime files were context for QA review; this was not an independent production audit.

## Execution, qualification and remaining limits

No tests, syntax checks, reproductions, resource-exhaustion attempts, benchmarks, installations, builds, services, VMs or product processes were executed by this reviewer in either part of this cycle. Read-only file/Git/status/hash inspection was used. No source, configuration or documentation was edited. The sole authorized output write is this managed review artifact.

The parent reports that the additional authorized invocation ended **9PASS / 1CANCELLED**, with the real repair scenario reaching its90-second limit. That qualification result remains a failure irrespective of this source conclusion. The older documented9/9 result remains historical and does not replace it. This reviewer did not execute or independently replay either invocation and does not attribute the repair timeout to the resolved P2.

Native EMFILE/ENFILE behavior, hostile-filesystem races, installed-product behavior, CI status and causes of timing variation remain unverified by this review. Completing this source review and reconciling the P2 do not establish10/10, CI qualification, build/VM permission, human review, protected merge or release readiness.
