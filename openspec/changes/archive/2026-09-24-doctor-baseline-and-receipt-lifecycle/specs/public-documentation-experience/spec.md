## ADDED Requirements

### Requirement: Upstream operations document the expected doctor baseline and receipt renewal

The upstream runbook SHALL state which doctor failures are accepted and issue-tracked, how the exact-set
baseline gate detects new or unresolved failures, and how to renew the GitHub Project receipt with its
read-only command. It SHALL explain that freshness is advisory, the command is not executed by doctor or
CI, and the receipt does not certify future access.

#### Scenario: A maintainer encounters a new upstream doctor failure

- **WHEN** the baseline gate reports an unlisted `FAIL`
- **THEN** the runbook directs the maintainer to investigate and track it before any baseline change
- **AND** it forbids widening the baseline to make the check green

#### Scenario: A GitHub Project receipt is stale

- **WHEN** the freshness report marks the receipt stale or due soon
- **THEN** the runbook gives the exact read-only command and the values to compare before renewing it
- **AND** it tells the maintainer to redact the saved receipt and never put credentials in it
