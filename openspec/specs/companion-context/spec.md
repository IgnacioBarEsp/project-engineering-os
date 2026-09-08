# companion-context Specification

## Purpose
Provide bounded offline source retrieval, recoverable agent entry points and task recipes for Companion,
with explicit provenance, freshness and coverage limits.
## Requirements
### Requirement: Attributed offline context
Companion SHALL extract bounded local text, text-bearing PDF pages and DOCX paragraphs with file hashes
and precise source locators, without uploading documents or executing source content.

#### Scenario: Research sources
- **WHEN** a corpus contains text, a PDF with text and a DOCX document
- **THEN** retrieval identifies the original path and line, page or paragraph and retains source hashes

#### Scenario: Incomplete coverage
- **WHEN** a source is scanned, encrypted, malformed, excluded or exceeds a configured limit
- **THEN** coverage reports its reason and does not claim its contents were read

#### Scenario: Source changed
- **WHEN** an indexed file changes before search or export
- **THEN** the operation rejects stale excerpts and requests a context refresh

### Requirement: Recoverable agent routing
Companion SHALL preview context and agent-entry changes, preserve existing instruction content and
apply only fixed owned paths with checked recovery under the per-folder lock.

#### Scenario: Selected agents
- **WHEN** a user selects supported local agents or web chat
- **THEN** each selection has a concrete entry to the context and activation is not inferred from configuration

#### Scenario: Interrupted or conflicting write
- **WHEN** a write is interrupted or the user changes a planned destination
- **THEN** resume or rollback verifies every path and hash and refuses to overwrite intervening edits

### Requirement: Bounded task assistance
Companion SHALL supply recipes with inputs, outputs, validation and context budgets for all five
profiles and a reviewable, size-bounded context export with explicit insufficient-evidence behavior.

#### Scenario: No supporting sources
- **WHEN** retrieval finds no matching evidence
- **THEN** export states that evidence is insufficient instead of fabricating source-backed answers

#### Scenario: Optional graph tool
- **WHEN** a graph adapter is listed or its artifact exists
- **THEN** its identity and license are visible and it remains unverified until execution, freshness and a query are checked
