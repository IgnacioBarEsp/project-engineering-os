# Approved amendment — verifier bootstrap and one bounded retry

**Approved1cbfe2a: «Sí, apruebo la enmienda 1cbfe2a».** See evidence/bootstrap-amendment-approval.md and evidence/bootstrap-variant2-result.md. Exact patch applied/frozen; future gates remain. Original7af8a2a and witness amendment2d2d28c
were both actually approved. Their decisions stay resolved. This is a new,
concrete one-file repair and explicit cumulative budget decision after a retained
failure; continuing or a previous approval does not approve it.

## Measured failure and independently confirmed source defect

Frozen implementation1ba2933dbeb4d2d2fcbe93f7514953ffe073e8c5, recipe
eacc55ee90c87ecfedd6180e382cdbdedc48db5cb2a912f2c227903c4ad8f188,
ran its one baseline attempt2026-11-13T18:42:38.754Z–18:44:39.830Z.
The120s guard terminated it: PROCESS_TIMEOUT, report:null,
observedComplete:false. No X509 cases can be credited; candidate9cases,
native18screens/12copies, builds and corrected VM were not executed.

The one fresh independent candidate reviewer found F1, Medium/qualification
blocker, in electron-certificate-boundary.mjs:195,267 and its caller
verify-electron.mjs:31. Parent confirmed the same source chain:
the entrypoint top-level-awaits childProbe(), which awaits app.whenReady().
Electron's default app awaits the target import; browser/init signals appCodeLoaded
only after that import; native startup joins app code before DidFinishLaunching
and ready. This creates a startup dependency cycle. The measured timeout is
consistent with that source diagnosis; it contains no stack sample proving the
exact suspension point. No supplier TLS failure or project exploitation is claimed.

The parent also observed that the20s case timer currently starts after
server.listen(), leaving setup outside the declared case deadline. This is a
separate parent static resource-contract observation, not a second reviewer
finding or a measured20s-overrun. Both repairs stay in the same verifier file.

## Exact proposed source repair

ONLY apps/companion/scripts/electron-certificate-boundary.mjs may change:

The [exact proposed diff](evidence/proposed-bootstrap-repair.patch) is prepared as
data and was not applied or executed. Current preimage SHA256
360ad8f222f75246cb845d7ab68d318f42d808955f78f7d1d9940895cd40343a;
proposed postimage6695b1dcc2f4d6b2079b2c0d4b37614ed8a0e90884e2ff92a045131fc2486089;
patch51b30f0679650791e57ee32a19fbf8a27b2b196c7ed4ec382427dbb08a11cf98.
Node syntax check PASS for the proposed data, not a production-runtime result.

1. Parse/validate the child invocation and obtain the Electron API during the
   short pre-ready bootstrap. Configure the owned userData and hardware settings
   before ready. Finish the module import without awaiting readiness-dependent
   child work: schedule that work with an explicit caught promise.
2. Keep app.whenReady() in the asynchronously scheduled phase, after the entrypoint
   can complete. Persist a phase receipt before waiting for readiness, and route
   bootstrap/rejected-promise failures to a bounded structured report and nonzero
   app exit. Never permit an uncaught-error dialog or a missing report to PASS.
3. Start the existing20s deadline before case server setup and cover setup,
   certificate verification and cleanup with the same abort/termination path.
   Keep the process120s and JS heap256MiB ceilings unchanged. A timeout/setup/
   cleanup error is FAIL, never an expected certificate rejection.
4. Preserve exact official executable identities, all six fixture hashes, nonce/
   source/readback checks, strict TLS, error-code expectations, three transports,
   three conditions and nine declared cases. Keep verify-electron.mjs byte-identical
   to1ba, including its18screens/12copies and original assertions/timeouts.

No application feature, runtime identity, manifest/lock, fixture byte, new source
file, dependency, parser, certificate signing/generation, reinstall/download,
renderer/IPC/NSIS, CI/policy/audit exception or managed-toolchain change.

## Explicit additional allowance, not a reset

The rejected frozen variant and baseline failure remain immutable. Proposed maxima:
- Frozen source variants:2 cumulative (first1 consumed, exactly1 additional).
- Baseline owner attempts:2 cumulative (first1 timed out, exactly1 additional on
  the changed verifier). This is not another attempt with unchanged inputs.
- Candidate owner9-case execution:still at most1, currently0.
- The one fresh postpatch review is already completed on1ba. Permit exactly ONE
  bounded incremental reconciliation by that SAME reviewer after the single-file
  repair and its actual results. No second fresh agent/global sweep, invented
  post-fix approval or repetition of earlier c8 review.
- Reuse the identical installed supplier payload and the SAME frozen fixture set.
  Two keys were generated once; the trusted certificate's pre-freeze completion
  and all originals stay recorded. No regeneration or new fixture set.
- Builds remain at most2, corrected canonical VM remains the SAME unused0/1.
  Human146/147 remain separate on an apt candidate. No release/archive/merge is
  inferred from this amendment.

Freeze variant2 and exact helper preimage/postimage/recipe before execution,
linking frozen-variant.json rather than replacing it. All other frozen app inputs
must match their recorded hashes. Use fresh managed output names for the new
attempt; never overwrite failed receipts. The helper diagnostic/readback must
show the new source and actual case denominators. Existing mandatory CI retains
its ordinary meaning; do not manually rerun unchanged jobs.

If the repaired source, any declared code/control, resource or cleanup gate still
fails, STOP with the actual report. No third variant, additional owner baseline
attempt, expectation change or budget reset is authorized.

## Retained evidence

Standalone targetPath/storage/prefix are in evidence/manifest.json.
- owner-contrast.json SHA8d9c4652b32b94a9c88ea3e63a74c8ae05d786e48283f33c22578ef905fd6e84
- owner-launch.json SHAe48e0945646976be491a55e80ebf6ddae58a5ec4635a30c236c8abeecd146297
- baseline-contrast/baseline-certificate-boundary.json SHA9f494c09fa1cc40e2defa8ac93c2b3ae5c03b46171df43e220a2a3db474b1fef
- independent-candidate-review.md SHA9f4d45d980a48c8e479dfd5b259425a1cee6e95dd19321ba50c3ef1b68440545
- frozen-variant.json SHAf3e2a861cbff54309520183e5a607a78e53a9df52d5d33b1767632609af40d37

All ten frozen source inputs were byte-identical after the failed attempt.
No Electron process remained after the guard terminated the owned process tree.
Official installation/SRI/ZIP/73-file comparison remain measured evidence, not a
TLS/installed qualification PASS.

Primary lifecycle sources:
[baseline browser init](https://github.com/electron/electron/blob/v44.1.1/lib/browser/init.ts#L194),
[default-app import](https://github.com/electron/electron/blob/v44.1.1/default_app/main.ts#L150),
[native app-code join](https://github.com/electron/electron/blob/v44.1.1/shell/common/node_bindings.cc#L1053),
[startup ordering](https://github.com/electron/electron/blob/v44.1.1/shell/browser/electron_browser_main_parts.cc#L363).
