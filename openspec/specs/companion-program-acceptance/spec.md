# companion-program-acceptance Specification

## Purpose
Define what it takes to say the Companion application is accepted, measured and delivered, as opposed to
merely built. Acceptance here is observed on the artifact a person installs, never on a development
harness; a step that needs a person stays a step that needs a person, recorded with its cause instead of
replaced by a passing fixture; a measurement publishes its method before its numbers and reports a result
that does not favour the product exactly as it reports one that does; and what is delivered publishes its
identity, its checksum and its real signing status.

A stated choice is part of what gets accepted: where a person's work continues is decided by what they chose,
never substituted for something else because the choice could not be met — and a substitution is kept absent
rather than merely unreached, so restoring it would take a deliberate decision instead of deleting a guard.

**Use this if:** you are about to claim the product works, is faster, or is ready to hand to someone.
## Requirements
### Requirement: Native acceptance reflects observed behavior
The program SHALL record actual installer and installed interface behavior for all five profiles, separately
from service fixtures, browser tests and human usability research.

#### Scenario: Completing and reopening a prepared project
- **WHEN** the installed application prepares a reviewed synthetic folder through its native interface
- **THEN** evidence records visible results, citations and source preservation after closing and reopening
- **AND** engineering, official OpenSpec and CodeGraph are verified for software and Unity where applicable

#### Scenario: A native step is blocked
- **WHEN** a required native step cannot be completed or a security interstitial requires a person
- **THEN** the step remains unverified with its cause and is never replaced by a silent fixture success

### Requirement: Local application discovery and launch are truthful
Companion SHALL distinguish absence from an existing unverifiable application and SHALL only claim that opening
the folder was requested when trusted arguments actually included that folder.

#### Scenario: Known installation paths do not exist
- **WHEN** every candidate at known installation locations is absent
- **THEN** discovery reports no application instead of claiming an installed app with an invalid signature

#### Scenario: An existing candidate cannot be trusted
- **WHEN** a candidate exists but is linked, inaccessible or has an unapproved signature
- **THEN** discovery retains the refusal and does not silently classify it as an absent app

### Requirement: Paired model measurement is reproducible
The evaluation SHALL retain frozen synthetic corpus, questions, model identity, parameters, prompts, answers,
raw usage when exposed and outcomes for both full parsed corpus and prepared retrieval under the same conditions.

#### Scenario: Repeating inference for both conditions
- **WHEN** the paired experiment runs
- **THEN** each condition runs three repetitions with alternating order and the same question set and model
- **AND** answerable and unanswerable cases, citations, errors, preparation cost and negative results are reported
- **AND** unavailable token counters or model controls are identified without estimation or invented settings

### Requirement: Public delivery has verifiable identity
Companion delivery SHALL provide a working landing and downloadable EXE, manifest and SHA-256 tied to a clean
commit without relabeling the existing core release or claiming an absent editor signature.

#### Scenario: Verifying the public download
- **WHEN** an installer is released
- **THEN** a download through its public URL matches the locally verified artifact and its declared checksum
- **AND** the landing clearly states the actual signing status and links to that delivery

### Requirement: Visual comparison is traceable and original
The landing review SHALL identify current Awwwards references and record observations and design decisions
without copying reference assets or code or inventing ratings.

#### Scenario: Reviewing public reference interactions
- **WHEN** visual review is recorded
- **THEN** it identifies reference URLs and date with hierarchy, navigation, responsive and motion observations
- **AND** distinguishes measured checks of this landing from qualitative comparison

### Requirement: A stated destination is never substituted for another
The program SHALL decide where a person continues from what that person chose, not from what happens to be
installed, SHALL NOT open a web destination for someone who chose a desktop application, and SHALL NOT hold a
web address for a desktop application at all, so that the substitution is absent rather than merely unreached.

#### Scenario: A desktop application is chosen and can be opened
- **WHEN** the chosen application declares how it receives a folder and every verification for it passes
- **THEN** the application SHALL be opened with the folder
- **AND** the screen SHALL continue to state that opening it does not demonstrate that the AI read the project

#### Scenario: A desktop application is chosen and cannot be opened
- **WHEN** the chosen application is absent, or cannot be verified, or declares no folder route
- **THEN** nothing SHALL be launched and no address SHALL be opened
- **AND** the instruction SHALL be copied and the person SHALL be told to open the application themselves
- **AND** the reason SHALL be the one that applies, told apart from the other reasons

#### Scenario: A web chat is chosen
- **WHEN** the person chose a web chat rather than a desktop application
- **THEN** the web chat MAY be opened and the instruction copied

#### Scenario: An application present without verifiable provenance
- **WHEN** an application is installed but its signature or publisher cannot be verified
- **THEN** it SHALL still be refused with its cause, and this requirement SHALL NOT weaken that refusal

#### Scenario: Acceptance measures the substitution cannot return
- **WHEN** native and launch evidence is recorded
- **THEN** it SHALL record, for every desktop application present on the machine, that no address was opened
- **AND** deliberate removal of the rule SHALL be detected by a named check rather than by review

