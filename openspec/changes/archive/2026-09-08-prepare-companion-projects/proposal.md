## Why

Issue #77 passes DoR after #76 closed through protected PR #82. Companion needs an independently testable
preparation engine before the UI can modify folders. The maintainer authorizes five profiles, preservation,
recovery and actual verification. Main ab0b58a contains the approved experience and a simulated prototype.

## What Changes

- Add an isolated Companion engine under `apps/companion`, outside the neutral npm distribution.
- Bound inventory and select profiles without running project code or requiring Git for document folders.
- Generate a reviewable plan, apply under a per-folder lock, verify hashes, resume and roll back owned files.
- Expose the existing neutral constructor through a checked adapter for applicable software/Unity projects.
- Test five fixtures, invalid inputs, conflicts, symlinks, stale plans, concurrent runs and interruption.

## Capabilities

### New Capabilities
- companion-preparation: profile selection, attributed local preparation and recovery.

## Impact

No new runtime dependency or core CLI behavior. Allowlist and ownership explicitly admit the isolated app
source, while npm package files continue excluding it. Context extraction/recipes, desktop UI, packaged
dependencies and installer remain #78–#81. File preparation does not imply context or external tools ready.
Activate the upstream auth-security profile with the local plan/data/privilege decision in docs/companion/SECURITY.md.
Spec approval follows the maintainer's explicit delegation for #66 and derived issues. No approval is
fabricated for an external account, model license or unknown installation requirement.
