# Independent adversarial review — issue #89

Reviewer: separate agent `review_isolated_toolchain`, applying the borrowed PlanearIA adversarial-review
skill. Source: current branch diff, proposal/design/spec/tasks, distributed helper, schemas, diagnostics,
documentation and tests. The reviewer did not modify the repository. This is not human review.

| Original severity | Finding | Independently verified resolution |
| --- | --- | --- |
| Major | Doctor re-read rejected config above 64 KiB and consumed its profiles. | Reuses validated configuration; zero subsequent full reads, rejected UI profile stays inactive. |
| Major | Root manifest classification bypassed the metadata bound. | Shared bounded `readProjectManifest`; independent 17 MiB repro observes no full `readFile`. |
| Minor | Schema/runtime disagree on reserved names with uppercase and U+2028/U+2029. | Aligned validation and AJV parity test PASS. |
| Minor | Wrapper omitted recovery supplied by the resolver. | Remediation printed and missing-installation case verified. |

Independent evidence: 30 focused tests PASS with zero failures (doctor, toolchain selection and wrapper
isolation). Five additional temporary-fixture repros PASS: isolated installation without root manifest
or `.bin` shim; directory CLI entry rejected; installed metadata array rejected; lock above 16 MiB rejected;
internal link resolving within the selected tree accepted as designed. Checked metadata, selected
location and expected entry consistency across wrapper/OPSX/doctor, distribution/ownership of the helper,
root-layout compatibility and consumer preservation.

No verified open findings remain. These controls validate declared identity and local paths, not the
integrity of every installed byte or a lock against concurrent processes. This review does not certify
the installer, the five complete user journeys or multi-platform CI.

Verdict: **PASS**. Official archive is appropriate after complete suite/fixture/CI results and debt
assessment are recorded. Existing maintainer delegation authorizes the workflow without representing
this agent review as human approval.
