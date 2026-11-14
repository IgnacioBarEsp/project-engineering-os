## ADDED Requirements

### Requirement: Reviewed stage execution
The wizard SHALL execute base and context for both routes, and environment, engineering, activation and explicitly chosen stack only for local Software preparation. Every write/download SHALL use an existing preview/apply pair, with newly available plans reviewed before application in step four.

#### Scenario: Non software or delegated preparation
- **WHEN** either a non-software profile or delegated route is applied
- **THEN** base and context run without installing development tools and the final report names any required unfinished stages

#### Scenario: Software local preparation
- **WHEN** all current plans are approved and their operations succeed in a software fixture
- **THEN** required stages are ready in the saved real verdict and all selected technologies have measured results

### Requirement: Failure and cancellation preserve evidence
The wizard SHALL display pending, running, done and failed stage states; real completed/total progress where available; cancel, re-preview retry and explicit continuation with skipped work. It SHALL preserve completed work and use existing interrupted-transaction recovery.

#### Scenario: Cancel a reading operation
- **WHEN** the person cancels file reading
- **THEN** no subsequent stage starts, the completed base remains recoverable and retry gets a new plan

### Requirement: Final facts come from verification
The final screen SHALL derive completed and pending work from service stageReport, not from route selection, and use native clipboard and verified handoff.

#### Scenario: Success followed by stale files
- **WHEN** files change after an operation succeeds
- **THEN** the final report does not mark stale stages ready and offers a reviewed refresh
