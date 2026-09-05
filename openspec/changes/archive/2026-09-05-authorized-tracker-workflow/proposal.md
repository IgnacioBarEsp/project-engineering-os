## Why

Issue #33 passes 13 DoR checks. The existing offline github-plan cannot apply or verify approved tracker
operations. The maintainer authorized completing the backlog; preserve consumer authorization boundaries.

## What Changes

- Add offline tracker plans and separately approved apply/rollback, with source binding and expiry.
- Support private GitHub Project creation and description configuration; conditionally verify/configure
  existing Azure Boards and Jira Cloud projects without creating organization-level infrastructure.
- Keep a durable journal, reject uncertain retries and re-read actual remote state.

## Capabilities

### Modified Capabilities
- adaptive-onboarding: authorized, conditional remote tracker workflow.

## Impact

New neutral runtime modules, CLI commands, automated contract tests and public guide. No SDK dependency,
automatic provider activation, paid service purchase, data migration or change to github-plan. Rollback
only restores unchanged attributable description writes or deletes an unchanged empty created GitHub Project.
