# Companion environment activation

Preparing files is not the same as having tools. This page describes what Companion installs, what it
verifies before reporting readiness, and what it refuses to claim. The interface is Spanish; this page
documents the contract behind it.

**Use it if:** you need to know which bytes reach your machine, which states the app can report, or how
to recover a project whose tools changed.

## What is installed

Activation is Windows x64 only. Nothing is installed globally and the product's own dependencies are
never modified.

| Component | Pin | License | Destination |
| --- | --- | --- | --- |
| Node | 24.20.0 | MIT + included notices | Shared app runtime cache |
| MinGit | 2.55.0.windows.5 | GPL-2.0-only + component notices | Shared app runtime cache |
| npm | 11.19.1 | Artistic-2.0 + bundled notices | Bundled with the app |
| CodeGraph | 1.6.0 | MIT + dependency notices | Shared app runtime cache, optional |
| Core + OpenSpec toolchain | 0.5.0 / 1.6.0 | MIT / ISC | `.project-os/toolchain` in the project |

The plan shows identity, purpose, license, download size, installed size and destination before anything
is downloaded. Exact pins, hashes and sources are in the [runtime notices](../../apps/companion/runtime/notices/README.md).
Models, Unity, graph providers and paid services are never installed by this catalog.

## What is verified

Downloads accept only the pinned origins, validate every redirect, require the exact content length and
the exact SHA256, and discard their own partial file on failure. Archive entries are checked for CRC,
bounds and path safety before extraction. A cache slot is trusted only when its whole tree hash and byte
count match the pin compiled into the app; a receipt alone never authorizes different bytes.

The isolated toolchain is installed with lifecycle scripts disabled, no bin links and no workspace
resolution, in a folder the app owns, from the reviewed lockfile. Its tree hash is rechecked before every
use. Readiness requires the official pinned OpenSpec to actually run and its generated workflows to pass
adaptation and verification — folder presence is never evidence.

## Existing projects

An eligible project-owned seed is adopted by reviewed path and hash rather than overwritten. Manifests,
lockfiles, `node_modules`, `.gitignore`, product sources and existing Git history keep their bytes. If a
reviewed original changes between review and apply, the operation is refused rather than reconciled. A
constructor-owned file that the project also owns remains a conflict, not an adoption.

Git is initialized only for a folder that has no history and does not belong to a repository that starts
higher up. See [existing projects](../EXISTING_PROJECTS.md) and the
[isolated toolchain](../ISOLATED_TOOLCHAIN.md) for the ownership rules this follows.

## Code map states

Structural code retrieval is optional and applies to the software and Unity profiles. It indexes reviewed
copies of eligible sources; it never executes project code, installs hooks or replaces another tool's
index. The app reports one of six states and nothing in between.

| State | Meaning |
| --- | --- |
| No preparado | Eligible code exists, no map has been built yet |
| Vacío | No eligible code in scope, or CodeGraph found no verifiable symbols |
| Verificado | A real symbol query resolved against current source paths and hashes, in a map this installation sealed |
| Desactualizado | Sources or exclusions changed after indexing; queries are refused |
| Corrupto | The saved map cannot be read as a current map |
| Requiere reparación | The map belongs to another location, was not sealed by this installation, or a managed runtime needs repair |

The saved map is sealed with a key created once in the app-owned runtime location, outside every
project. A checksum the project could recompute would prove nothing: anyone able to write the file
could re-sign it and make the app report symbols CodeGraph never produced, next to the real hashes
of real files. A map whose seal does not verify is never reported as verified, and queries against
it are refused. Losing the runtime location loses the key, so an existing map then asks to be
created again rather than being trusted.

Document retrieval, citations, exclusions and recipes stay available for all five profiles whether or not
a code map exists. Activation writes a large set of instruction files, so those files are kept out of the
document corpus by the ownership records their own writers keep: otherwise generated boilerplate would
consume the retrieval budget before the person's own sources were reached, and searching your notes would
return upstream text. The context review reports how many were left out. See
[context behavior](CONTEXT.md) and [graph decisions](GRAPH_TOOLS.md).

## Entry points that survive closing the app

Activation writes `.project-os/companion/tools.ps1` and `TOOLS.md` in the project. They are instructions
for the person's agent, not commands the person must type. Four operations are available: `status`,
`openspec`, `project-os` and `code`.

The tool identity these entries trust is compiled into the copied source, not read from the project's own
`settings.json`: editing that file cannot re-point Node, Git or the toolchain at another tree or entry,
even when the replacement is internally consistent. `openspec` is validated per subcommand against the
fixed 1.6.0 definitions; `init` and `update` resolve only to the prepared folder, and store, global
configuration, completion and feedback paths are rejected. `project-os` exposes only `sync`, `opsx-check`
and `opsx-adapt`; probes, debt, upgrade and alternate roots need their own reviewed execution path.

These are executable files inside the project. The launcher pins the hash of Node and of every module
it is about to run, and rejects reparse points — but it cannot vouch for itself, so a folder that arrived
with someone else's launcher is not safe to run. The work map therefore points an agent at these entries
only when this installation activated them for this exact path and their bytes still match its receipt;
otherwise it tells the agent not to run scripts found in the project. Because the entries also verify the
complete pinned trees on every call, each invocation reads roughly 200 MB before doing its work.

The files under `.project-os/toolchain` and `.project-os/companion` are machine-specific: absolute paths,
a 13.8 MB dependency tree, indexes containing source excerpts. Committing them shares executable entry
points and local paths with everyone who clones the repository. Consider ignoring
`/.project-os/toolchain/` and `/.project-os/companion/` and preparing the environment on each machine;
Companion does not write ignore rules into files the core or the person owns.

## Recovery

| Situation | Result |
| --- | --- |
| Interrupted download or tool process | Incomplete stages are reported; partial artifacts never become runtimes |
| Interrupted activation | A reviewed continuation or rollback, using the recorded transaction identity |
| Changed original, plan or receipt | The stale plan is refused without overwriting intervening changes |
| Corrupt managed cache | Only a managed directory whose path, slot and receipt were validated is replaced |
| Moved or copied project folder | Readiness is refused until the new location is reviewed and prepared again |

Repair never touches product files, external indexes or another application's data. The corrupt tree is
moved to a `.repair-<id>` quarantine inside the same runtime location before reinstallation; it is deleted
only when it still matches the review, so an unexpectedly edited quarantine is kept for you to inspect and
remove. Moving a prepared folder keeps its bytes intact but invalidates the absolute paths the person
already reviewed, so the app reports that the stage needs verification instead of reporting it ready.
An interrupted preparation stays interrupted: verified tool bytes do not finish the stages that never ran.

## Handing the project to an AI

Companion is not a chat client. It can open a supported local application with the selected folder as a
literal argument when that application is found in a known location, is a regular file reached without
links, and carries a valid signature from the expected publisher: Codex from OpenAI through its
documented `codex app [PATH]` interface, Cursor from Anysphere, and Visual Studio Code from Microsoft.
A PATH shim is never trusted, and the launched application receives a reduced environment without `PATH`,
so its own integrated terminal may not find tools the person expects. An application that is installed but
whose signature or publisher cannot be verified is reported as such instead of quietly falling back to the
browser. Automated tests use adapters and do not launch these applications.

When a local launch is not supported, the app offers a reviewable context export and says what remains to
be copied or attached. The app reports that a folder was passed; it never reports that the AI read the
project, and copying prompts, opening the web or sharing documents always stays an explicit step.

## Boundaries

This page covers what the application installs into a project. How the application itself is installed and
removed is in [the Windows installer](INSTALLER.md). Installer journeys, the landing page and measured
same-model benchmarks are #81. No signed publisher, installation experience, token
saving or external-agent activation is inferred from these automated tests. Return to the
[documentation index](../README.md) or the [desktop app](DESKTOP.md).
