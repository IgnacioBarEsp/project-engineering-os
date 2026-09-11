## Context

Approved under the maintainer's explicit #66 delegation after current #87 DoR passed on 2026-09-10.
People should finish the visual preparation with usable tools and clear limits. The app already owns
recoverable base/context operations and native project handles. Core 0.5.0 adds hash-bound seed adoption
and `toolchainRoot`; its canonical release must be verified before updating the app dependency.

## Goals / Non-Goals

Goals: activate engineering without editing product dependencies; provide optional structural code
retrieval; leave usable local instructions/tool entry points; keep reviewed downloads, cancellation,
freshness and failures understandable. Research, media and general projects retain bounded document
retrieval and relevant recipes without compulsory programming tools.

Non-goals: builtin chat, accounts, automatic global AI configuration, all-platform native installation,
models or Unity engine downloads, mandatory paid services, indiscriminate RAG installation or measured
token-saving claims. Packaging the EXE and native five-profile evaluation remain #80 and #81.

## Decisions

### Separate preparation from the installed product

Use the app's pinned public core module for plans and transactions. Read the core's adoption candidates,
display their paths as preserved originals and bind consent to exact hashes in the retained plan. Repeat
the same reviewed adoption list during revalidation and apply; never infer permission from matching bytes.
After bootstrap, prepare a dedicated `.project-os/toolchain` with exact core/OpenSpec dependencies, retain
the complete existing configuration and explicitly set `toolchainRoot`. Review and sync that configuration
change. Existing product manifests, lockfiles, dependencies and scripts remain untouched.

The isolated runtime manifest/lock is app-owned and distributed with the app, derived from verified
published artifacts. Use reviewed npm with scripts disabled, fixed public registry and bounded output;
do not inherit arbitrary npm configuration, Node injection flags or credentials. Never execute product
install scripts. Existing repositories retain their Git history; a new repository may be initialized
through the reviewed preparation plan, without committing, publishing or changing global Git settings.
Bundle reviewed npm 11.19.1 (Artistic-2.0) in the private app and copy its complete distribution/notices to
the managed runtime. The official Node 24.20.0 ZIP contains npm 11.19.0, so extract its Node executable and
license while using the separately pinned reviewed client. This avoids a second package bootstrap whose
client identity depends on an arbitrary system installation. It adds app size; the universal core is unchanged.

### Own persistent runtimes and explicit downloads

Use a dedicated per-user runtime location that survives ordinary app replacement/removal and can serve
multiple projects. Project instructions record the exact selected runtime and a local tool entry point;
the external AI does not depend on an open Companion process. The Windows runtime catalog pins official
portable Node, reviewed npm and optional MinGit/CodeGraph artifacts with URL, version, size, hash, license
and source notices. Reuse only a verified installation. Prefer a managed fixed executable over trusting
an arbitrary executable found inside a user project or the current working directory.

The plan states actual download sizes, destinations and why each item is needed. HTTPS downloads have
allowed origins, explicit redirect validation, time/size bounds and streaming hashes. Extract only safe
relative regular entries into a fresh staging directory; reject links, devices, duplicates and escaping
paths. Validate package/entry identity and publish the complete runtime atomically; partial downloads or
extractions never become active. Do not run lifecycle installers or a self-updating shim. Source archives
and notices accompany tools as required by their licenses. Unavailable network or unsupported architecture
produces a recoverable result with the existing local context still usable.

### Verify engineering through actual execution

Invoke the verified Node executable with literal arguments and the constructor wrapper from the selected
project. Generate workflows with official OpenSpec 1.6.0, retain its preference isolation and telemetry
defaults, run OPSX adaptation and verify OPSX/core identity. Check explicit configuration sync and source
hashes before reporting readiness. Persist a bounded receipt linking selected versions, configuration,
plan and generated output; later status revalidates the receipt and current files. Mere presence, exit0
alone or a receipt from another project is not sufficient.

The process layer uses named operations, explicit cwd, minimal environment, bounded output/time and a
cancellation-aware process tree. The renderer cannot supply a command, executable, module, destination
URL, filesystem root or raw options. Keep IPC schema validation and sender checks. Progress and failures
are text, with a useful next action; cancel preserves completed verified work and makes incomplete stages
available for retry rather than reporting complete.

### Profile-specific retrieval

Keep local text/PDF/DOCX retrieval as the baseline for every profile. Research uses source citations and
evidence recipes; media uses briefs, provenance and approved workflow references without installing a
model; general use gets focused task/context recipes. Software and Unity can additionally choose CodeGraph
1.6.0 under MIT. GitNexus remains conditional on its noncommercial license and Graphify remains an optional
evaluation; neither is silently installed. Explain the purpose of the recommendation in ordinary language.

The pinned CodeGraph SDK was exercised with JS and C# files and returned real symbols. Use that SDK in a
fixed subprocess rather than its interactive installer: its CLI `init --yes` can add Git hooks when file
watching is disabled. Build only from reviewed eligible code sources, with the same exclusions and hash
guards as the context plan. A staging corpus of owned copies preserves relative source paths, bounds the
scope and avoids rewriting a pre-existing user's CodeGraph index/config. Map results back to original
paths and hashes; verify at least one known indexed symbol through a real query, and report zero-code
corpora as not applicable/empty rather than a fabricated successful graph. Refresh and search reject
stale, missing, oversized or unsafe originals. No scripts, hooks or source modules are executed while
indexing. Bound corpus size and worker resources; disable telemetry/update checks and no automatic models.

### Handoff and calm user experience

Continue the current visual language and five-profile workflow. Show the summary of what is ready, what
was preserved and any external step in a single understandable results view. A recommended plan carries
the normal user through preparation; optional downloads are selectable with an explanation and no repeated
technical prompt. Keep keyboard focus, live progress, reduced motion and enlarged text usable during
downloads, retries and errors. Do not show internal hashes or command lines in the normal happy path.

Use supported installed-app interfaces for folder launch (for example observed `codex app [PATH]`) only
after trusted executable detection, with literal arguments and fixed behavior. Keep explicit preview
before copying an initial prompt or exporting source excerpts. Where folder attachment is unavailable,
open the known web destination and clearly state the copy/paste or attachment step. Do not auto-send a
message, start paid inference, claim the agent read files or replace the person's AI. Local tool commands,
source maps and selected recipes are discoverable from the generated agent entry point after app closure.

## Risks / Trade-offs

### Implementation refinements from adversarial evidence

The private runtime bridge loads the exact core from the verified isolated toolchain in an owned
subprocess directory. Core's optional Git status probe is not executed there: repository clean/process
filters can run product commands even during status. A worker-local adapter, installed before importing
the fixed core, permits only the explicit repository-root probe through the verified Git executable.
It reports the optional status probe as not inspected and rejects unexpected Git operations. Windows
cwd executable shadowing is therefore not part of tool discovery. The public core remains unchanged;
Companion does not use its optional dirtiness field or claim that a repository is clean.

Official OpenSpec generation runs against an owned staging project, using the official wrapper and an
explicit target path. A dedicated adapter publishes the reviewed official output bytes and configuration
selection with a bounded recovery journal. It does not author replacement OpenSpec templates. Unrecognized
custom workflows remain conflicts; matching pre-existing files are preserved on rollback. Configuration
snapshots are bound to the same hash that supplied the selected configuration, including changes during
preview. Core configuration synchronization and actual OPSX verification precede the readiness receipt.

Runtime integrity checks may be shared among internal calls within one trusted UI operation. The next
operation receives fresh cancellation controls and verifies the complete pinned trees again; there is no
session-wide or time-based trust cache. Checked trees are not modified by these core operations. This
retains the stated limit concerning concurrent edits by another process with the same user privileges.

The toolchain lock contains 81 exact registry artifacts (MIT/ISC), totaling 3,090,932 compressed bytes.
Their complete GET bodies were checked against the lock integrities to establish reviewable download size;
HEAD responses do not consistently expose a length. npm lifecycle scripts and bin-link generation are
disabled. A pinned complete installed-tree digest is verified before toolchain publication or execution.

The persistent entry point must not trust the project file it reads. Its expected tree digests and
executable entries are compiled into the copied source modules; the project's `settings.json` only
locates the runtime root and its claims are compared against those pins before any tree is inspected.
Editing that file therefore cannot re-point Node, Git or the toolchain at another tree or entry, and a
descriptor that is internally consistent with attacker-supplied bytes is still rejected.

The same entry accepts only reviewed commands. Core operations are limited to `sync`, `opsx-check` and
`opsx-adapt`; probes, debt, upgrade and root-changing options are refused because they carry different
path semantics or permissions. OpenSpec arguments are validated per subcommand against the fixed 1.6.0
definitions rather than as a flat flag list: `init` and `update` take a positional folder, so that value
must resolve to the prepared project, and store, global configuration, completion and feedback paths stay
outside this transport. Both limits carry negative regressions.

Automatic repair replaces only a managed cache directory whose parent root, slot name and receipt
identity were validated together, and whose enumerated tree matched the review. The corrupt tree is moved
to an owned quarantine inside the same root before reinstallation; a failed replacement restores it and an
unexpectedly edited quarantine is retained rather than deleted. Product folders, user indexes and other
applications are never candidates.

A prepared folder that moved or was copied keeps valid bytes but invalidates the absolute paths the person
reviewed. The environment receipt records its location: readiness is refused with a distinct relocated
state, while planning still reads the receipt so the moved folder can be reviewed and prepared again.

A saved code map must not be forgeable by the project it describes. A checksum the project can
recompute proves nothing: anyone able to write the index can re-sign it and make the app report
symbols CodeGraph never produced, against the real hashes of real files. The index therefore
carries a MAC under a 32-byte key created once in the app-owned runtime location, outside every
project; a map whose seal does not verify is reported as needing repair rather than verified, and
the persistent entry reads that key only from the runtime root whose pinned trees it just checked.

The generated local entry points are executable files that live in the project, so a cloned or
shared folder can contain a launcher nobody here reviewed. The work map only points an agent at
them when this installation activated them for this exact path and their bytes still match its
receipt; otherwise it tells the agent not to run scripts it finds. The launcher additionally pins
the hash of every module it is about to execute, not only Node, and rejects reparse points. That
protects against an edit of those modules, not against an edit of the launcher itself, which is why
the routing condition — and not the launcher — is the actual boundary.

Activation writes far more instruction bytes than a person's own documents. A measured software project
reaches 2,985 of the 3,000 retrieval extracts after the constructor alone; official activation crosses
that limit, and because sources are read in path order the person's own files were the ones dropped.
Generated instruction files are therefore kept out of the document corpus, using the path lists their own
writers record rather than folder-name heuristics: the constructor state and the activation receipt. The
agent already receives those files through its route, so excluding them costs no capability, and the
context review reports how many were left out. An unreadable ownership record keeps the earlier behavior
of indexing them rather than hiding sources.


- External code and downloads → fixed catalog, hashes, notices, allowlisted transport, bounded extraction,
  process isolation, no product scripts, default telemetry opt-out and independent execution review.
- Corrupt or stale cache/receipts → revalidate identity/hashes and selected root before use; no fallback
  to unverified/global tools. Distinguish installed, ready, stale, not applicable and requires action.
- Large code/model projects → reviewed exclusions and bounded code copies; keep useful document retrieval
  and explain coverage. Do not download engines, weights or every graph tool to claim completeness.
- Another process edits a file → hash-bound plans and recovery refuse intervening changes; do not claim
  an OS-wide lock against another same-user process.
- Unsupported local AI launch → accessible web/context fallback with an honest attachment status.

## Migration Plan

Update the private app to verified core 0.5.0, add the runtime layer and opt-in graph capability, then wire
service/IPC/UI and agent entry points. Existing projects remain readable; preparing new stages requires a
new plan. Retain or regenerate only app-owned receipts whose format is understood. Remove only verified
app-owned staging/outputs during recovery; leave product files, Git hooks, global tools, models and user
changes intact. Runtime removal and installer data retention are integrated explicitly in #80.

## Validation and Open Questions

Test new/existing software and Unity folders, research documents, media and general projects, missing Git,
offline/cache cases, wrong hashes, extraction escape, cancellation, interruption, duplicate apply, stale
plans/receipts, modified originals, corrupt context, unsupported launch and post-app tool usability. Run
real OpenSpec generation and real CodeGraph queries locally; injected IPC/browser tests are not native
installer evidence. Reuse the five visual journeys and add runtime success/error/retry states. Independent
adversarial review, captured debt, official archive and protected CI precede merge. A dependency pin that
fails the reviewed license/integrity or real runtime probe must be replaced through a recorded design
decision, not silently activated. Exact artifact details and experiment limits are kept in tool evidence.
