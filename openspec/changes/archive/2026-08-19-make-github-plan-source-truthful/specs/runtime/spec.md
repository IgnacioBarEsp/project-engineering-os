## ADDED Requirements

### Requirement: GitHub plans report actual provenance and target governance

The read-only GitHub plan SHALL report the actual resolved source and whether it came from the target,
blueprint seed or inline manifest. It SHALL prefer applicable target governance, SHALL NOT attribute seed
content to a nonexistent target path, and SHALL NOT mix consumer discovery into an upstream plan.

#### Scenario: Upstream governance exists in the target

- **WHEN** `github-plan` runs on the upstream with `repository-governance.json`
- **THEN** source and provenance identify that target file
- **AND** the plan contains the upstream statuses and labels with zero consumer discovery issues

#### Scenario: Consumer target has not been bootstrapped

- **WHEN** no applicable target manifest exists and the blueprint contains the default Product OS seed
- **THEN** source identifies the tracked blueprint seed and provenance identifies `blueprint-seed`
- **AND** consumer discovery resources remain available without claiming a nonexistent target file

#### Scenario: A custom source has no target or seed

- **WHEN** the blueprint declares a custom GitHub plan source that exists neither in the target nor as a seed
- **THEN** the command fails with `GITHUB_PLAN_SOURCE_MISSING`
- **AND** provides a recovery that names how to declare or add the missing manifest

#### Scenario: Human-readable output is inspected

- **WHEN** the plan is printed without JSON mode
- **THEN** it displays the resolved source and provenance kind
- **AND** continues to state that remote status is unverified and mutations are absent
