# Recovery rehearsal

Date: 2026-09-24. The change's rollback strategy is to revert its protected PR. It changes no remote Project state, so reverting the versioned baseline, receipt, code, and docs restores the prior repository contract without a compensating remote action.

As a separate local rehearsal, an empty disposable Git repository under the Windows temp directory was bootstrapped. The CLI reported `APPLIED`, transaction `tx-2026-09-24T18-45-19-891Z-760f10da`, with 91 changes. Running the documented `project-os rollback --target <temp-target> --transaction <id> --json` returned exit 0, `ROLLED_BACK`, `restored: 91`; its journal recorded `rolled-back`. Verification found no generated project files remaining. The expected empty scaffold directories and transaction history remained in the isolated temp target. No file in the upstream checkout or any consumer project was part of this rehearsal.
