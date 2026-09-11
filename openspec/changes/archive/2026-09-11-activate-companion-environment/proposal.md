## Why

Companion can prepare files and searchable context, but a person creating software still needs to install
and activate the engineering tools separately. Issue #87 closes that gap so the visual workflow can
produce an honestly verified project without modifying the product's dependencies.

## What Changes

- Add reviewed preparation of project-local engineering dependencies using core 0.5.0 and OpenSpec 1.6.0,
  with a managed portable runtime on Windows and explicit existing-file adoption by reviewed hashes.
- Show download/tool identity, size, license, destination and recovery in the preparation plan; use bounded
  jobs, cancellation and receipts. Verify actual execution and workflows instead of folder presence.
- Offer structural code context for software/Unity using the reviewed CodeGraph package and a controlled
  SDK worker. Retain attributed local document retrieval for research, creative and general projects.
- Provide usable agent instructions and local tool entry points after setup, along with supported local
  AI launch or reviewed web export. Keep project history, source exclusions and recovery understandable.

## Capabilities

### New Capabilities
- `companion-environment`: reviewed local runtimes, engineering activation, optional code graph verification,
  persistent agent routing, cancellation and recovery in the desktop workflow.

### Modified Capabilities
None. Existing desktop and context requirements continue to apply; this change implements the missing
runtime verification rather than redefining their meaning.

## Impact

Private Companion package, engine/runtime workers, native service/IPC, UI and docs. Update the app's pinned
core dependency only after the public 0.5.0 artifact is verified. Portable tools and external licenses
belong to the app distribution, never the universal core. Windows is the installation target; injected
cross-platform service tests continue without claiming portable-runtime installation on other systems.

No builtin chat, global agent configuration, automatic paid services, bulk model/Unity installation,
indiscriminate graph tools or benchmark claims. Existing context/search/export stays usable when an
optional external tool cannot be installed. Native installer packaging is #80; full five-profile installer
QA, landing and same-model benchmarks are #81. Risk: executing unintended code, stale receipts or unsafe
recovery; use fixed reviewed executables, bounded inputs, own paths and fresh hash/identity checks. Restore
only app-owned verified state and retain product originals, models and other applications.

Approved for design under the maintainer's explicit program #66 delegation; current DoR passes after
#79, #85 and #89 closed. Implementation follows the approved design/spec and local OpenSpec apply guidance.
