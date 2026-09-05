# Validation — 2026-09-05

PASS: issue #33 DoR 13 checks. Exact local OpenSpec 1.6.0 strict validation: nine items passed. Repository
check: 260 tests passed, plus package, neutrality, documentation, workflows and captured debt checks.
Full installed-tarball fixture PASS, including the new offline tracker command. Dependency audit PASS:
zero high/critical findings and zero exceptions. Environment: Windows, Node 24.18.0, npm 11.19.1.

Twelve tracker tests cover offline snapshots, canonical restrictions, expired/tampered plans, wider approval,
source changes, no credential access before local rejection, all three provider wire contracts, replay,
uncertain create, concurrent lock, owned rollback, content preservation, path aliases/traversal, credential
patterns, bounds, redirects, wrong identities and asynchronous Azure polling without following supplied URLs.

Live GitHub evidence, 2026-09-05 at 20:49 UTC:

- Existing upstream Project 3: configuration, existence and project-items-read smoke PASS, no writes.
- Reviewed temporary private project plan digest:
  `c1ba7eda765fd737bb0f497556ca08319fb83d0b344b15a0c32fbf05b1dab261`.
- Created and configured project `PVT_kwHOBUE3s84BikmW`; private, zero items, three verification surfaces PASS.
- Repeated apply returned replay true, mutationPerformed false and identical snapshot.
- Separately authorized rollback returned PASS after deleting only that temporary unchanged empty project
  and confirming its absence. The upstream Project was never configured or removed by this smoke.

After extending the structural snapshot, live verification exposed the API field name
`multiSelectOptions` (not the single-select `options` name). Introspection and a corrected real read
confirmed the contract. The final create/replay/rollback cycle passed again at 20:59 UTC with digest
`870c106d392839d6738ffc300e4dc28722b61cc8aa3143d6ea5ddc0aedd612c1` and temporary project
`PVT_kwHOBUE3s84BikoK`, also removed successfully while private and empty. No temporary remote project remains.

Plans, approvals and checksummed journal remain in local temporary evidence. Credentials came from the
existing authenticated GitHub session in memory and were never printed or stored in evidence. Azure/Jira
are tested with simulated protocol responses; no live authentication or organization readiness is claimed.

Manual inspection confirms public help, documented approval format, exact scopes, bounded provider support,
consumer ownership, preserved github-plan, no automatic login and recovery for uncertain outcomes. Final
protected PR CI also checks the installed planner's before/after filesystem snapshot.
