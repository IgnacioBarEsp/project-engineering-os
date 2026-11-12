## ADDED Requirements

### Requirement: Pinned unmodified official npm adoption
Companion SHALL adopt only official npm11.21.2 at the exact source/SRI/full-tree identity stated in this
change. Its entire bundled physical graph and source files SHALL match the independently audited bytes.
The app version SHALL be0.3.7 for this candidate. Other runtime/core/OpenSpec pins and unrelated lock nodes
SHALL remain unchanged. No upstream source patch, audit exception or fifth derived recipe SHALL be inferred.

#### Scenario: Official input or bundled graph differs
- **WHEN** SRI, source, package identity, any included source file or physical audit coverage differs
- **THEN** adoption SHALL stop before execution or publication of that destination
- **AND** a green raw audit SHALL NOT override missing coverage or a source change

#### Scenario: Active moderate advisories remain
- **WHEN** the current policy permits the recorded glob/minimatch moderate findings
- **THEN** full raw findings and scope limits SHALL remain visible without claiming they are fixed
- **AND** a high/critical finding SHALL stop adoption without an exception or policy change

### Requirement: Compiled distribution identity and verified selection
A distribution SHALL be identified by channel, version, source, complete tree digest and recipe digest
when derived. Only compiled reviewed identities SHALL be selectable. Slots and receipts SHALL preserve
each identity separately; mutable state SHALL NOT grant new authority. The initial allowlist SHALL
enable only the qualified official11.21.2, with no arbitrary renderer paths or dynamic latest version.

#### Scenario: Equal nominal versions have different provenance
- **WHEN** official and derived fixtures share a version but differ in channel, tree or recipe
- **THEN** they SHALL retain different identities and slots
- **AND** the fixture SHALL NOT be reported as a real apt derived npm distribution

#### Scenario: A receipt selects an unknown or altered destination
- **WHEN** a selector/receipt names an uncompiled identity, modified tree, unsafe path or incomplete slot
- **THEN** the runtime SHALL refuse activation and preserve the evidence/originals
- **AND** it SHALL NOT use a vulnerable old official as fallback

### Requirement: Durable bounded transitions and recovery
An npm selection SHALL stage and verify its destination before confirming a generation-checked durable
selection with readback. Failed, stale, cancelled or interrupted operations SHALL preserve prior state
and never activate partial bytes. Recovery SHALL be demonstrated with the actual changed runtime;
PID or age alone SHALL NOT authorize taking another operation's lock or deleting its artifacts.

#### Scenario: Selection changes during asynchronous verification
- **WHEN** the expected generation or verified destination changes before confirmation
- **THEN** commit SHALL fail closed and preserve the prior selection and both slots

#### Scenario: Process terminates during installation or repair
- **WHEN** a real disposable process is interrupted and the runtime restarts
- **THEN** no staging/quarantined payload SHALL be reported verified
- **AND** reviewed recovery SHALL preserve projects/history/originals and be tested before it is called usable

#### Scenario: Only one real apt channel is available
- **WHEN** no derived distribution satisfies all gates
- **THEN** the official qualified destination MAY be tested for this adoption
- **AND** model tests SHALL remain labelled synthetic and no real two-channel roundtrip SHALL be claimed
- **AND** any future official/derived destination SHALL require its own frozen identity and equal gates
