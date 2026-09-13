# companion-prompt-composition Specification

## Purpose
Define what the text this product hands to a person's own AI is composed from, what may and may not leave the
machine it is composed on, and what a model is allowed to change about it.

The composition draws on what the application already knows — the kind of project, the person's experience,
goal and role, the AI they chose, the stages that are not ready, and an aggregate of file types — and never on
the content of a file. A model may be asked to write it better, at four levels from templates alone to a
provider the person pays for, but no route may send the content or the path of a file, the level that leaves
the machine ships off, no key is distributed inside the application, and every call is bounded by destination,
time and size. The template is the floor, and this product's own rules are appended after whatever a model
returns: that text is about to be pasted into an AI that can open the person's folder, so a model's output is
untrusted input. When more depth is needed than the aggregate gives, the application does not read the files —
it writes text for the AI that already can.

## Requirements
### Requirement: The prompt is composed from what the application already knows
The companion SHALL compose the text it hands to an AI from the project's profile, the person's experience
level, their goal and role, the AI they chose, the stages that are not ready and an aggregate of the folder's
file types, and SHALL NOT compose it from the content of any file.

#### Scenario: Two projects of different profiles are compared
- **WHEN** the composed text of two profiles is compared
- **THEN** they SHALL differ in what they instruct, compared as text rather than as length
- **AND** the same inputs SHALL always produce the same text, so the difference is attributable to the inputs

#### Scenario: The folder's contents inform the prompt
- **WHEN** the inventory is used
- **THEN** only an aggregate of extension, kind and count SHALL be derived from it, and no file path SHALL
  enter that aggregate

#### Scenario: A stage of the project is not ready
- **WHEN** the composition runs for a project with pending stages
- **THEN** the text SHALL say which are pending and SHALL NOT instruct the AI to assume they are done

### Requirement: No route sends a person's material to a model
The companion SHALL NOT include the content of a file or the path of a file in any request to a model, SHALL
build every outbound payload from a declared shape rather than by removing fields from a general one, and
SHALL refuse to send a payload in which either appears.

#### Scenario: A request to a model is made
- **WHEN** any level above templates composes a request
- **THEN** the body SHALL contain only the person's own answers, the pending stages, the aggregate and the
  draft, and the check SHALL fail on a file path or on file content appearing anywhere in it

#### Scenario: The guard finds project data in a payload
- **WHEN** the payload contains a path or content belonging to the project
- **THEN** the request SHALL NOT be made, and the level SHALL degrade with that as its stated cause

#### Scenario: More depth is needed than the aggregate gives
- **WHEN** the composition would benefit from what only the files can answer
- **THEN** the companion SHALL produce text for the AI the person already uses to read that folder and report
  back, and SHALL NOT read the files itself for this purpose

### Requirement: A model may only improve the template
The companion SHALL work completely with no model available, SHALL treat the composed template as the floor,
and SHALL NOT present a model's output that is invalid, empty, shorter than the floor or off-topic.

#### Scenario: No model is available
- **WHEN** no level above templates is available or accepted
- **THEN** the application SHALL remain complete and SHALL hand over the composed template without presenting
  it as degraded

#### Scenario: A model answers
- **WHEN** the response is received
- **THEN** it SHALL be validated and compared against the draft, the draft SHALL be used if the response fails
  the comparison, and both texts SHALL be kept where the comparison can be read

#### Scenario: A provider is unreachable, slow or answers nonsense
- **WHEN** the call fails, exceeds its timeout or exceeds its size cap
- **THEN** the level SHALL degrade to the one below without blocking the preparation, and the screen SHALL say
  which level was used and why

### Requirement: A person is told what a level sends before it is used
The companion SHALL state, before the first call of a level that leaves this machine, which destination will
be used and what it will receive, SHALL ship the free-provider level turned off, and SHALL remain complete for
a person who refuses it.

#### Scenario: A level that leaves this machine is offered
- **WHEN** the screen offers it
- **THEN** it SHALL name the destination and what is sent, and SHALL say that no file content or path is sent

#### Scenario: A person refuses
- **WHEN** the level is not turned on
- **THEN** every other level SHALL remain available and no capability of the application SHALL be withheld

#### Scenario: No key is required from the maintainer
- **WHEN** a level that needs a key is used
- **THEN** the key SHALL be the person's own, and no key SHALL be distributed inside the application

### Requirement: Every call to a model is bounded
The companion SHALL bound every request to a model by destination, time and size, and SHALL make those
requests only from the process that already holds the network boundary.

#### Scenario: A request is made
- **WHEN** any level above templates calls a model
- **THEN** the destination SHALL be in an explicit allowlist, the call SHALL carry a timeout and a maximum
  response size, it SHALL NOT follow redirects and SHALL NOT carry credentials in the URL
- **AND** the request SHALL be made in the main process, never in the renderer, whose content security policy
  forbids it

#### Scenario: The bound is measured
- **WHEN** the evidence reports that no level can hang the interface
- **THEN** it SHALL report the elapsed time of a dead provider and of a slow one, rather than asserting the
  bound

