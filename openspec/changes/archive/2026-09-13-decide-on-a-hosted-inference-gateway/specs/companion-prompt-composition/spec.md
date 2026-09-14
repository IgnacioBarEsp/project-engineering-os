## ADDED Requirements

### Requirement: Adding an inference level is a recorded decision
An inference level SHALL depend only on what the person controls or on a credential the person supplies.
Adding a level that depends on anything else — infrastructure, an account, or a machine belonging to the
project — SHALL require a decision recorded before it is built, and offering no such level SHALL be a valid
outcome of that decision rather than a gap.

The existing requirement that no key is distributed inside the application is not restated here; this one is
about what has to happen before a level exists at all.

#### Scenario: A level that would depend on the project's own infrastructure
- **WHEN** such a level is proposed
- **THEN** it SHALL NOT be built before a record states what it adds beyond the levels that already exist,
  what the application would have to stop promising, whose data would pass through where, what it costs, what
  happens when it fails, and what continuing work it requires
- **AND** convenience alone SHALL NOT be recorded as sufficient justification

#### Scenario: The comparison behind that decision
- **WHEN** hosting options are compared
- **THEN** the criteria SHALL be versioned with a declared digest before any option is evaluated, so that a
  criterion written to fit a conclusion is detectable rather than a matter of trust
- **AND** not offering any such level SHALL appear as an option with the same fields as the others
- **AND** at least one option that addresses the same need without the project operating infrastructure SHALL
  be evaluated, where one exists

#### Scenario: What a cost estimate in that record may assume
- **WHEN** a cost is estimated
- **THEN** it SHALL declare the volume it assumes, SHALL use a measurement already published by this
  repository where one exists rather than a guess, and SHALL include deliberate abuse rather than expected use
  alone

#### Scenario: What such a record may claim about its logs
- **WHEN** a design records that its logs cannot reconstruct anyone's project
- **THEN** that claim SHALL be stated together with the condition it depends on, rather than on its own
