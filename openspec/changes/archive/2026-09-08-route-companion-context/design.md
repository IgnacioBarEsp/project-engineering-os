## Decision and approval

Approved for implementation under the maintainer's explicit #66 delegation. Baseline: main 92c3c82,
base engine and constructor adapter present; context is pending. Five profiles and external AI confirmed.

## Local extraction and retrieval

Use pdfjs-dist 6.3.289 (Apache-2.0), fflate 0.8.3 (MIT) and saxes 6.0.0 (ISC), pinned in an isolated private app package.
These releases exceed the upstream seven-day quarantine on 2026-09-08. Node 24 app tests are separate
from core Node 20/22 tests. PDF.js avoids an external converter executable; DOCX uses only document XML,
never relationships, macros or external resources. Worker threads bound parser time/heap and output.
They are resource containment, not an OS security sandbox. No source scripts or PDF actions execute.

Inventory limits and exclusions are retained and extended for common private/build/graph files. Text
uses line references; PDF uses page numbers; DOCX uses paragraph numbers (never invented page numbers).
Partial/empty/encrypted/malformed/over-limit documents retain visible reasons. Scanned pages require OCR.
Exclude likely credentials and content with recognizable secrets, without claiming a perfect DLP system.
Users review sources before export; all source content is untrusted data, not agent instructions.

Build a bounded local lexical index (accent-insensitive term matching with source diversity). Store
original file hashes and recheck the corpus before search/export. Changed source blocks stale excerpts.
No vector/semantic/AST-graph equivalence claim. Export has a strict UTF-8 byte budget including wrappers,
citations and warnings, and never sends itself. Empty retrieval reports insufficient evidence.

## Ownership and recovery

Context lives under .project-os/companion/context. Reviewed entry-point blocks append to existing
agent instruction files, preserving their bytes outside the block. Only selected agents are configured.
The context engine uses opaque plans, source/hash revalidation, the shared base lock and a checked
journal for interruption/resume/rollback. Fixed path allowlist; changes to user-owned text after a plan
require a new plan. Context metadata and route blocks must not invalidate their own corpus fingerprint.
Base START points to context when present but its own readiness receipt still describes the base stage.
If constructor state exists, route Codex/Claude/OpenCode/Copilot through the project-owned canonical
instructions rather than modifying generated mirrors. Expose the sync requirement, apply a reviewed
sync through the neutral constructor adapter, then refresh context after generated sources change.
The integration fixture verifies both constructor and context remain current after this sequence.

## Recipes and graph options

Recipes cover research synthesis/evidence, software SDD/implementation/review, Unity change/play-mode,
media recipe/asset verification, general deliverable plus shared efficient navigation and clear writing.
Each records inputs, steps, outputs, validation and bounded context/work. They are task instructions,
not unverified third-party skills. Existing core OpenSpec commands remain owned by OpenSpec.

Evaluate the exact CodeGraph used by the maintainer's consumer (@colbymchenry/codegraph), GitNexus (PolyForm
Noncommercial) and Graphify (graphifyy, Apache-2.0) separately. Other similarly named repositories are
not interchangeable. Optional graph integration remains explicitly unverified until its executable,
index freshness and representative query are observed. No shell commands inferred from project files.

## Verification and limits

Fixtures cover five profiles, exact PDF pages/DOCX paragraphs/lines, negative retrieval, scanned and
malformed files, byte/entry/time limits, secret-shaped input, stale hashes, injection strings, six
agent selections, existing instructions, interruption, rollback and core distribution isolation.
Run independent adversarial verification and debt assessment, then official archive and protected PR.
Native installer usability and before/after model metrics require #80/#81; this scope cannot prove them.
