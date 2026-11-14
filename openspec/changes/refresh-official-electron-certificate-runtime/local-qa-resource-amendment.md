# Approved amendment — bounded reconciliation of local QA resources

**Approved in revisiond812f92: «Sí, apruebo la enmienda d812f92».** See evidence/local-qa-resource-approval.md. The one authorized invocation completed2PASS/2CANCELLED; the4/4gate failed. See evidence/local-qa-resource-result.md. STOP; no further attempt is authorized. Approvals7af/2d2/1cb and their exact Apply
remain resolved. The approved bootstrap repair passed its real18-case contrast
and18screens/12copies; its same-reviewer incremental resolved F1. No new source
variant, owner contrast, native execution or review cycle is requested.

## Actual remaining disagreement

Source eaf2dd21a24261ce28a74623a3fa6bfe6a9e255f, frozen app aggregate
90e066f637bba6bb1b7b470c57b7568d5fa626c1d34c18146c1421c08724e9a7.
The first local full suite returned261tests/241PASS/16FAIL/3cancel/1SKIP.
The parent's chosen test home made a Git sample path263characters. A routine
owned temporary-home correction reduced that path to199, preserving sources,
tests, assertions, tool identities and all limits. The second full suite returned
261tests/256PASS/1FAIL/3cancel/1SKIP, exit1,431380ms. Path failures disappeared;
three90s cancellations and one fixture SIGKILL remained. Neither run is PASS or
silently invalidated as setup. All raw failures are retained.

| Exact test source/name | Retained remaining result |
| --- | --- |
| qa/distribution-identity.mjs:75 — interrupted repair restores only the journal-owned unchanged quarantine, and retains project/history bytes | timeout90000ms |
| qa/distribution-identity.mjs:89 — real process interruption at publication and selector-write rolls back journal-owned selection on restart | timeout90000ms |
| qa/npm-development-source.mjs:29 — official fixture and exact 27 auxiliaries preserve the official tree and deterministic sealed bytes | timeout90000ms |
| qa/npm-pack-preparation.mjs:14 — actual npm pack preparation cleans its owned temporary copy on success | SIGKILL instead of expected null signal |

Execution must enumerate names from these unchanged files and refuse a
missing/duplicate/mismatching target; no fuzzy or silent name matching.

The four tests exercise real copies/inventories/process interruption of the
already reviewed npm distribution. Concurrent test processes were observed, but
contention is an inference, not proof of the timeout cause. Source/executable
hashes remain unchanged; no Electron TLS regression is inferred from these QA
failures. On the same application aggregate, CI43571554648 Windows full QA is
260PASS/1SKIP/0FAIL/0cancel and macOS is256PASS/5SKIP/0FAIL/0cancel; ElectronWindows
also passed18/12. Ubuntu app-behavior step succeeded, while the final browser/
interface matrix and required result were still pending when prepared. No future
CI result is approved by this proposal.

## Concrete proposed protocol, before execution

Permit exactly ONE additional local owning-QA invocation, at most600s, using the
same fixed Node24.18.0/npm11.21.2 and clean immutable source with the frozen app
hash above. No reinstall, download, source modification or dependency change.
Use a new short owned temporary home under the prepared MCP temporary root and
fresh report names. Do not use a junction, alias, host trust/config modification,
old report overwrite or cleanup of shared directories.

Use Node's existing test runner with --test-concurrency=1 and an exact escaped,
anchored --test-name-pattern selecting ONLY the four names above in their three
existing files. Files/tests/assertions/fault injection/cleanup code stay exact.
Keep each existing90000ms test and80000ms subprocess limit, the process600s guard,
output bounds, regular-file/link guards and all product policies. This isolates
concurrency without increasing any timeout or changing expected behavior.
The report must preserve actual tests/pass/fail/cancel/skip totals and exactly
four executed target identities; other filtered tests are SKIP and cannot count
as four successes. Require4/4 actual target PASS, zero target skip/cancel/fail,
unchanged source/lock/tool hashes, and proper cleanup. Capture peak/time/bytes as
observations only; do not claim a statistical performance guarantee.

The original261-test local runs remain FAIL. Their procedural reconciliation may
be accepted only with BOTH actual4/4 targeted evidence and the full existing QA
suite/required CI3OS green on the final published head, preserving legitimate
platform SKIPs and the exact application-source correspondence. A targeted run
alone cannot mark the full local suite green or substitute CI, installer, canonical
VM, debt, archive, protected integration, humans146/147 or any existing guard.
This is a proposed explicit qualification-protocol amendment, not an audit
exception, deletion of tests or approval of results not yet obtained.

If any target, code, identity, resource or cleanup gate fails, STOP with the raw
result. No second targeted invocation, third full local suite, further source
variant, owner probe/native run, additional review or timeout increase is allowed
by this decision. A different repair/protocol/cost needs its own concrete decision.

## Cumulative limits and cost

Unchanged consumed budgets: frozen source variants2/2; baseline owner2/2;
candidate owner1/1; fresh investigation1/1; fresh review1/1; same-reviewer
incremental1/1. The earlier two full local QA attempts and pre-spawn instrumentation
failure remain recorded. This proposal adds only the one targeted owning-QA
invocation above, up to600s and the existing transient copy I/O; it resets nothing.
Builds0/2 and the SAME corrected canonical VM0/1 remain unused and keep all gates.
No new dependency, service, account or paid component. Owner IgnacioBarEsp decides
whether this additional verification cost and protocol are accepted.

## Retained evidence

Same standalone targetPath/storage/prefix as evidence/manifest.json:
- bootstrap-v2/qualification-app-v2b.json SHAb1243ebe468f91b15a76875d4f1fd9f25b67a315464ec9ff575cf2d754a95d6b
- bootstrap-v2/qualification-app-short-home.json SHAfb72b62f21b95f7c203109fa761aac49f9c10af7dcf537acd0259ecbf920f0db
- bootstrap-v2/qualification-stop.json SHAf6274e72d3661369650a5b39ccd05190a4ebe92468487f64621a4b936c414944
- bootstrap-v2/qa-environment-correction.json SHAdf70cdeab40cb5ab06d62620b787a7350b2882fc4ec2cc5e70b207380b7ca93a
- bootstrap-v2/clean-source-stage.json SHA5aaf3453fde115257b6fd7ebd22c0898a1ed957f5120ca4060ceeb1f7864d5fd

Actual npm raw audits remain root0high/critical+1moderate,root-runtime0,blueprint0,
Companion-runtime0high/critical+32moderate,Companion-all2high+38moderate. No other
alert, global security, installed or human approval is inferred. No archive,
merge, release, host install or ola4 by preparing/approving this amendment.

CI checkpoint: run43571554648/attempt1/head eaf2dd21a24261ce28a74623a3fa6bfe6a9e255f actually completed SUCCESS with12/12jobs, including required, before this amendment publication. This does not erase the local FAIL or approve this proposed reconciliation. The final published head still needs its own required CI.
