## Architecture and scope

Use Node built-ins in an isolated `apps/companion/engine` package surface. Inventory, preparation and the
constructor adapter are separate modules; renderer/installer dependencies are not introduced here.
The eventual desktop main process retains opaque plan identifiers and supplies only allowed options.
No renderer-selected command, arbitrary URL or project script is executed. The program retains external AI.

Inventory is read-only, deterministic and bounded by entries, depth and file size. It does not follow
symlinks/junctions, enter generated/credential directories or read secret-shaped files. Files that cannot
be read remain explicit limitations. Profiles are recommendations based on evidence; explicit selection
can override them. Roles affect explanation, not access to tools. No folder scan is an LLM invocation.

Preparation owns only a fixed namespace `.project-os/companion`, not arbitrary paths named in a receipt.
The engine validates persisted state as untrusted input, binds plans to the canonical root and input
fingerprint, and preserves any preexisting namespace conflict. Plan/verify do not create folders or locks.
A lock created exclusively coordinates app processes; stale or malformed locks require explicit recovery.
Before writes and restoration, validate paths, source/managed hashes and original ownership again.
Interrupted work retains its journal and can resume after validating every operation. Restoration removes
only unchanged files created by the operation or restores its verified prior bytes; edits block recovery
instead of being overwritten. Live hostile modification of the filesystem by another privileged process
is outside this local-app threat boundary; normal edits and app concurrency are tested.

The existing constructor is a separate stage because it owns its own files and transaction journal.
Its adapter calls the published plan/apply/rollback APIs and retains their conflict and Git-root rules.
The app does not silently adopt existing package files, replace policy or fake constructor receipts.
Missing Git, project-root mismatch and existing unmanaged collisions are explicit requirements/conflicts
in the reviewed engineering stage, never a successful engineering result. Desktop onboarding will expose
the appropriate action in #79; required runtime distribution and full journeys are tested in #80–#81.
The app preparation receipt distinguishes its own files from constructor, context and external-tool state.

## Validation and rollback

Five temporary fixtures cover documents, software, Unity, media and general work, including original-byte
preservation, exact second run, changed inputs, tampered state, symlink escape, cancellation/interruption,
duplicate apply and modified owned files. Exercise the real neutral constructor on a separate Git fixture,
including its existing collision behavior and hash-aware rollback. No private user project is modified.

This stage supplies no PDF text extraction, code graph, GPU download, external upload, AI client or installer.
Readiness exposes those as pending or not requested. Revert the implementation PR to remove the app source;
consumer recovery uses its own journal, and the neutral constructor uses its own transaction identifier.
