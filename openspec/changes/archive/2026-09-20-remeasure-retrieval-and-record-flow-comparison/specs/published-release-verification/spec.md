## ADDED Requirements

### Requirement: The documented start is verified end to end
The start that public documentation tells a newcomer to run SHALL have a reproducible check that executes every
documented step in order against the published package, in a disposable directory, and fails when any step
stops exiting zero or when the doctor reports an unjustified FAIL. The check SHALL declare that it needs
network access and SHALL NOT run as part of the offline check suite. Its record SHALL name the package version
it ran against and the exit code of each step.

#### Scenario: A documented step stops working
- **WHEN** one of the documented start steps exits non-zero against the published package
- **THEN** the check fails and names the step and its exit code

#### Scenario: The check cannot reach the registry
- **WHEN** the registry is unreachable
- **THEN** the check reports that it could not run instead of reporting success

#### Scenario: The documented steps and the check disagree
- **WHEN** public documentation changes the steps it publishes
- **THEN** the check is updated in the same change, so that what is verified is what is documented
