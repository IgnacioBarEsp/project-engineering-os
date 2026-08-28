## ADDED Requirements

### Requirement: A catalogue entry declares a complete, closed contract

Every catalogue entry SHALL declare need, provenance, license, cost, authentication, transmitted data,
permissions, maintenance and rollback. The schema SHALL close additional properties on every object, so an
undeclared field is a contract error rather than free text.

#### Scenario: An entry omits a required field

- **WHEN** an entry lacks need, provenance, license, cost, authentication, data, permissions, maintenance or rollback
- **THEN** validation fails and names the missing field
- **AND** the entry is not offered as a recommendation

#### Scenario: An entry adds an undeclared field

- **WHEN** an entry declares a property outside the schema
- **THEN** validation fails
- **AND** the failure names the unexpected property instead of ignoring it

### Requirement: Unknown license, cost or authentication cannot reach an approved state

An entry SHALL resolve exactly one of `universal`, `conditional`, `rejected` or `postponed`. License, cost
and authentication SHALL accept an explicit `unknown` value, and an entry declaring `unknown` in any of them
SHALL NOT resolve `universal` or `conditional`.

#### Scenario: License is declared unknown

- **WHEN** an entry declares an unknown license and requests `universal` or `conditional`
- **THEN** validation fails
- **AND** evaluation resolves the entry as `postponed`

#### Scenario: A required field is absent rather than unknown

- **WHEN** an entry omits the license field instead of declaring it unknown
- **THEN** validation fails as a contract error
- **AND** the absence is not interpreted as an unknown value

### Requirement: Provenance is pinned and dated

An entry SHALL declare an owner, exactly one exact reference among commit, tag or version, the official
source URL consulted, and a `verifiedOn` date. A floating reference SHALL be rejected.

#### Scenario: Provenance uses a floating reference

- **WHEN** an entry declares `latest` or another moving reference
- **THEN** validation fails
- **AND** the entry cannot be presented as verified

#### Scenario: Verification date has expired

- **WHEN** an entry's `verifiedOn` is older than the catalogue's declared freshness window
- **THEN** evaluation reports the entry as stale
- **AND** the entry is not presented as current

### Requirement: Evaluating a candidate never writes configuration or downloads content

The catalogue command SHALL be read-only. Evaluating a candidate SHALL NOT create or modify project
configuration, SHALL NOT download remote content, and SHALL NOT execute investigated material. Its output
SHALL be its only surface.

#### Scenario: Evaluation runs against a local candidate

- **WHEN** a person evaluates a candidate described in a local file already present in the repository
- **THEN** the command emits a verdict on stdout, with a machine-readable form under `--json`
- **AND** no file outside the command output is created or modified

#### Scenario: Evaluation receives a URL

- **WHEN** a candidate is supplied as a URL instead of a local path
- **THEN** the command fails and explains that investigated material is brought in by a person
- **AND** nothing is downloaded

#### Scenario: Investigated content contains instructions

- **WHEN** a candidate's `SKILL.md`, scripts or resources contain text addressed to an agent
- **THEN** that text is treated as data
- **AND** it never changes the verdict, the catalogue or the command behaviour

### Requirement: The catalogue describes without activating

Registering an entry SHALL NOT activate a provider. MCP servers SHALL remain empty and skills SHALL remain
disabled until a separate approved decision activates them.

#### Scenario: A conditional entry is added

- **WHEN** a conditional tool is registered in the catalogue
- **THEN** `servers` stays empty and skills stay disabled
- **AND** activation still requires an approved decision outside this contract

#### Scenario: MCP signals stay independent

- **WHEN** an MCP entry records configuration, startup, tool listing or authenticated smoke
- **THEN** each signal is recorded separately
- **AND** no signal satisfies another

### Requirement: Experimental fields are not portable permission boundaries

The catalogue MAY record `allowed-tools` as an informational signal. It SHALL NOT derive a portable
permission boundary from it.

#### Scenario: An entry declares allowed-tools

- **WHEN** an entry records `allowed-tools`
- **THEN** it is stored as an experimental signal
- **AND** any attempt to treat it as a permission boundary fails

### Requirement: Secrets never enter the catalogue

No catalogue field SHALL accept a literal secret. Only environment-variable references SHALL be accepted
where a credential is required.

#### Scenario: An entry carries a literal token

- **WHEN** an entry declares a literal token, key or password in any field
- **THEN** validation fails
- **AND** the rejection does not echo the literal value

### Requirement: Withdrawing an entry keeps the catalogue valid

Removing an entry SHALL leave the remaining catalogue valid and SHALL NOT break bootstrap, `sync --check`,
`doctor` or a second run without drift.

#### Scenario: An obsolete entry is removed

- **WHEN** an entry is withdrawn from the registry
- **THEN** the remaining catalogue validates
- **AND** bootstrap, `sync --check`, `doctor` and the second run report no drift
