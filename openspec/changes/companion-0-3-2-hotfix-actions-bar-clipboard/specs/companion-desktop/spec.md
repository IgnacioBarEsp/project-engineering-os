## MODIFIED Requirements

### Requirement: Scoped desktop privileges
The application SHALL isolate the renderer and expose only validated operations on explicitly selected
or remembered project handles, plus a bounded text-only clipboard write requested by a copy control,
with project data rendered as text and no arbitrary execution or networking. Clipboard writes SHALL use
the existing main-process IPC sender validation and SHALL NOT grant clipboard permissions to the renderer
or expose clipboard reading through the preload.

#### Scenario: Untrusted UI or project input
- **WHEN** a payload contains an unknown handle, invalid command/path/URL or markup in project data
- **THEN** the main process rejects unauthorized operations and source text does not become executable UI

#### Scenario: An untrusted frame requests a clipboard write
- **WHEN** the IPC sender is not the application webContents, main frame and exact application URL
- **THEN** the request SHALL fail before the clipboard adapter is called
- **AND** the general request-size limit of 64000 serialized UTF-8 bytes SHALL remain enforced

## ADDED Requirements

### Requirement: Explicit copy actions write bounded exact text
The desktop service SHALL expose copyText with an object containing only text. It SHALL accept a
non-blank string without NUL, of at most 32000 UTF-8 bytes, whose serialized request is at most 64000
UTF-8 bytes. It SHALL preserve accepted Unicode, whitespace and line breaks exactly, await the native
write, and return copied true, the text byte count and sent false through the existing IPC envelope.

#### Scenario: A person copies the project path or master prompt
- **WHEN** the person clicks Copiar ruta or Copiar Prompt Maestro with a valid displayed value
- **THEN** the renderer SHALL call the service through the common envelope-checking helper
- **AND** the system clipboard SHALL contain that exact value before a visible and accessible success confirmation
- **AND** the operation SHALL send no content to an external application or service

#### Scenario: A malformed or excessive payload is supplied
- **WHEN** the request is a bare string, array, null, has extra keys, lacks text, contains non-string or blank
  text, contains NUL, or exceeds either byte limit
- **THEN** validation SHALL reject it before native writing and leave the existing clipboard unchanged
- **AND** accepted boundary cases SHALL be copied without trimming or truncation

#### Scenario: Native writing or IPC fails
- **WHEN** native writing rejects, transport rejects or the IPC response has ok false
- **THEN** the UI SHALL show a safe cause and recovery action through its error surface
- **AND** it SHALL NOT display a copied confirmation or fall back to navigator.clipboard
- **AND** diagnostic output SHALL NOT include the clipboard payload

#### Scenario: Existing context-aware copy operations are used
- **WHEN** a person copies an export, guide step or reviewed handoff
- **THEN** the existing handle, byte-limit and context-freshness checks SHALL still govern that operation
- **AND** the generic text operation SHALL not replace those checks in the UI

### Requirement: Clipboard evidence observes real Electron transport
Clipboard acceptance evidence SHALL exercise the shipped main, preload and service in real Electron on
Windows and compare native clipboard contents from the main process with the displayed expected text.
Browser-injected clipboard evidence SHALL not satisfy native clipboard acceptance.

#### Scenario: The two final controls are verified natively
- **WHEN** Playwright launches Electron against an isolated test project and clicks each final copy control
- **THEN** clipboard.readText from the main process SHALL equal the corresponding expected path or prompt
- **AND** the evidence SHALL identify source commit, Electron version, OS, executable, viewport and both observations
- **AND** source execution SHALL be distinguished from testing the installed release artifact

#### Scenario: Native execution is unavailable
- **WHEN** a runner cannot launch Electron or does not observe one of the required copy controls
- **THEN** native acceptance SHALL remain unverified and SHALL not be reported as PASS
