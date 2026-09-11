# Independent adversarial review — issue 87

Scope: change `activate-companion-environment` under program 66. There was no pull request when the
review ran, so the surface was `git diff` against `e91cf1425aaf01beebcd7d6a350d5a5850034159` plus every
untracked file of the change. The reviewer ran in a separate session that did not implement the change,
followed a borrowed local adversarial-review playbook, worked read-only, and checked the argument tables
against the real pinned CLIs in `node_modules`.

## Verdict

First pass: **FAIL** — one blocker and four majors. After the corrections below and a full re-run of the
automated and real-runtime evidence, every blocker and major is resolved and the remaining findings are
recorded as debt. No finding was closed by weakening a check, a gate or a test.

## Blocker and majors, with their corrections

| Severity | Finding | Correction |
| --- | --- | --- |
| Blocker | The new relocation test called `environment.plan` with no platform guard. Managed runtimes are Windows x64 only, so `CI / Companion` would fail on ubuntu and macOS and `CI / required` needs all three. | The test now asserts the Windows path on Windows x64 and asserts `PLATFORM_UNSUPPORTED` elsewhere, so both behaviours stay covered instead of skipped. |
| Major | A forged `.project-os/companion/code/index.json` produced the state `Verificado`. The stored checksum was `sha256(payload)`, which anyone able to write the file can recompute. The reviewer reproduced it: invented symbols were returned next to the real hashes of real files, and CodeGraph never ran. | The index is sealed with HMAC-SHA256 under a 32-byte key created once in the app-owned runtime location, outside every project. An unverifiable seal reports `requires-repair` and refuses queries. Regression covers re-signing with another key, with the old checksum shape and with the original seal; a correctly sealed map whose shape leaves the reviewed sources is still `corrupt`. |
| Major | `MAP.md` told every agent to read `../TOOLS.md` and use the local entry points. Those are project files, so a cloned or shared folder could carry a launcher nobody reviewed. The launcher itself pinned only `node.exe`, not the eighteen modules it executes. | The pointer is written only when this installation activated those entries for this exact path and their bytes still match its receipt; otherwise the map tells the agent not to run scripts found in the project. The launcher now pins the hash of every module it is about to run and rejects reparse points. The remaining limit — a replaced launcher cannot vouch for itself — is stated in the design, `TOOLS.md` and the public documentation. |
| Major | None of the nine new service operations had automated coverage, and the generated launcher had never been executed by anything. | `qa/desktop-runtime.mjs` covers unrecognized input, missing identity, single-use plans, plan-kind confusion across stages, profile and capability gates, honest code-map states, and the generated launcher content. `scripts/verify-engineering-runtime.mjs` now runs the real PowerShell launcher and proves that editing a copied module stops it before Node starts. |
| Major | `tasks.md` declared 13 of 15 tasks incomplete while their code existed. | The ledger was corrected after the findings were resolved. Task 5.3 stays open until protected CI passes and the pull request is integrated. |

## Minor findings resolved

- An environment receipt left in `preparing` or `interrupted` reported `prepared` once the tool trees
  verified. Readiness now stays refused with `ENVIRONMENT_INTERRUPTED` until the stage is reviewed again.
- The desktop entry created the runtime manager unconditionally, which broke in-process engineering on
  macOS and Linux and could abort startup if the runtime location was unusable. It is now created only on
  Windows x64, inside a guard, and the app degrades to no environment capability.
- `view` was allowed through the persistent OpenSpec entry, but it opens an interactive dashboard and has
  no non-interactive option, so it would have hung until the 180 s timeout. It was removed.
- Local application detection swallowed every failure, so an installed application with an unexpected
  publisher silently became a browser handoff. It is now reported as installed but not verifiable.
- A failure while inspecting the repair quarantine turned a successful reinstallation into an error. The
  post-install step is isolated and the retained quarantine is named in the result.

## Questions the reviewer raised, answered with evidence

- **Planted recovery journal.** Adoption consent during recovery is read from a journal inside the
  project. A regression now plants a guard for a file the constructor never writes; the core refuses it,
  the file is not listed as a preserved original and its bytes are unchanged.
- **Shared verification within one operation.** The design already limits tree re-verification to a single
  trusted user operation with its own cancellation controls. The status reported after a write reuses that
  operation's verification by design; this is recorded as debt rather than changed late in the change.

## Recorded debt

The latency of the persistent entry (each call re-reads roughly 200 MB of pinned trees), the absence of
reviewed ignore rules for `.project-os/toolchain` and `.project-os/companion`, the reduced environment
passed to a launched application, and the interactive-encoding failure path in activation are documented
limits, not resolved work. They are captured in `debt-assessment.json`.
