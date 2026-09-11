# Validation record — issue 81

Everything here was executed on Windows 11 x64, against the application installed from the artifact
verified in #80. Nothing claims a study with users, a token measurement, or a comparison with another
product.

## Automated validations

| Validation | Result |
| --- | --- |
| `constructor-tests`, `capability-matrix-check`, `doctor-json-check`, `sync-check` | `npm run check` at the repository root: 304/304 tests pass. `project-os doctor` reports the three pre-existing technical-profile findings that already exist on `main`; this change activates no profile. |
| `critical-document-presence`, `relative-link-check`, `findability-two-hop-check`, `neutrality-check` | `npm run check:docs` passes 27 README links, the prompt contract and 17 spec purposes. `npm run check:neutrality` passes after adding `site` to the export allowlist as a reviewed decision; the published package lists the files it ships and the landing is not among them. |
| `openspec-strict` | `openspec validate --all --strict` with the pinned official 1.6.0 CLI. |
| `component-or-interaction-tests` | `npm test` in `apps/companion`. The packaging regression is now a behaviour test: it seals a tree holding a dependency vendored inside another dependency with the real sealing code, extracts it with the real extractor and compares tree digests. Reintroducing the exact regression it guards was tried and the test fails; the previous version, which asserted that the packer's source still contained certain strings, survived that mutation untouched. |
| `accessibility-check`, `responsive-check-when-configured`, `visual-check-when-configured` | `scripts/verify-landing.mjs` drives the page in a real browser: no external request, single `h1` with headings in order, working skip link, 78 text nodes measured for contrast across both colour schemes with 5.35 as the worst case, and reflow at 1180, 1024, 768, 480, 360 and 240 pixels and at double text size — checking both that no horizontal scrollbar appears and that no text lands outside the viewport inside a container that clips. Screenshots in `screenshots/`. |
| `secret-scan`, `dependency-signal-review` | `npm run check:audit` reports 0 high or critical findings; `npm audit` reports 0 vulnerabilities for the core and for the app. |
| `second-run-idempotence` | The journeys reopen every prepared project from history with a fresh service instance and find it `prepared` and `current`. |

## How to reproduce this

From `apps/companion`, with the application installed from the #80 artifact:

```
npm run evidence:journeys -- "<install>/resources/app" <evidence directory>
npm run evidence:benchmark -- "<install>/resources/app" <evidence directory>
npm run evidence:landing -- ../../site/index.html <evidence directory>
```

Each command rewrites the record it owns and exits non-zero on a finding, so the files in this directory
are output, never prose. Deleting the runtime cache under `<localappdata>/Project Engineering OS/runtimes`
before the journeys is what makes the download figures mean what they say. The landing check needs a
Chromium-based browser; on Windows it uses the installed Edge channel.

## Journey evidence

`journeys.json` records the five profiles run end to end on the installed application: 7 steps for
research, creative and general; 15 for software and Unity, which additionally review and install the
reviewed tools, prepare engineering, activate the official OpenSpec workflows, build the code map and
search a symbol. **Zero findings.**

The tool cache was `absent` when the run started, and the record says so rather than the reader having
to trust it. "From an empty cache" is only true of the *first* engineering profile: software downloaded
79 620 371 bytes, and Unity then downloaded 0 because it reused what software had installed — exactly
what a second project on the same machine does. Both numbers are in the record.

Each profile ends with negative cases **asserted**, not recorded. Twelve assertions, where an earlier
version of this script had two:

- A modified source leaves the context `stale` and the search is refused with `CONTEXT_STALE` rather
  than answering from the old text; regenerating returns it to `current`.
- A corrupted index produces `requires-action` with `CONTEXT_CONFLICT`, never `current`; restoring it
  recovers. The expected value is not supplied by the script: an earlier version filled it in with a
  default while reading a field the product leaves undefined, so it printed the right-looking state
  whatever the product did.
- In the profiles without engineering, a **real** engine is injected so the refusal can only come from
  the product's own profile rule, and the exact code is asserted: `ENVIRONMENT_UNAVAILABLE` for the tool
  stage, `GRAPH_PROFILE` for the code map. Document search still works.
- A project copied elsewhere: the document index is addressed by content, so the copy is legitimately
  `current` and the journey asserts that; the code map is bound to its location and must report
  `requires-repair`, which it does. Asserting that both go stale would have demanded wrong behaviour.
- The person's own sources are byte-identical to how the journey found them after every recovery.

Every profile then reopens from history through a new service instance.

The record also keeps what the code-map plan disclosed before installing anything —
`codegraph@1.6.0:missing`, 52 593 717 bytes — because the product claims every tool arrives with its
identity, size and destination visible, and that claim needs evidence rather than assertion.

Context coverage is `complete` for the three document profiles and partial for software and Unity, with
the count of excluded files that makes it partial recorded beside it. A `false` with no cause is not
evidence.

**What drove them.** A script through the installed application's service layer, with folder choice,
clipboard and external launch injected. That exercises the installed engines, the installed core and the
tools this machine downloaded. It does not exercise the interface, which the five browser journeys cover,
nor the installer's wizard pages. No person participated.

## Measurement

`benchmark.json` holds the method, the corpus, the question set with its answer key, the raw per-question
results, and what could not be measured. The published summary is in `docs/companion/EVIDENCE.md` and on
the landing page, and `verify-landing.mjs` fails if any number on the page stops reconciling with the raw
data.

The leading column is the strictest one: whether the text the method returned actually contains the known
answer.

**The first version of this measurement was wrong in the product's favour, and the independent review
caught it.** It published 5 of 10 for a literal scan and attributed the gap to file format. The gap was
an extension allowlist in the measuring script: it never opened the corpus PDF, whose text streams are
uncompressed and perfectly greppable. Two further columns were decided rather than measured — `read-all`
derived its answers from file extensions, and the locator and files-opened counts were hard-coded against
the baselines and in favour of the prepared context.

Measured properly, a literal scan answers **8 of 10**, the same eight as opening the whole corpus, while
reading 6812 bytes per query against the prepared context's 88 814 bytes of index. What preparation adds
over a competent scan, on this corpus, is two questions — both in the Word document, which is genuinely
deflated — and a passage locator instead of a line number. Both published places say so, and both name
the earlier figure as an artefact of the instrument.

## Threat model

What this change adds is evaluation material and a public page, so the assets worth protecting are the
records themselves and whoever visits the page.

The landing is a static file with no scripts, no forms, no analytics and no external request of any kind,
verified in a real browser rather than asserted: it has no input to attack and cannot disclose a visitor
to a third party. It is not in the published package, so it never reaches a consumer's project.

The evidence files are committed and public. Each one is produced by a script, not written by hand, and
every path they record is anchored to `<repo>`, `<home>`, `<localappdata>` or `<temp>` instead of the
absolute path, so a record does not carry the account name of whoever ran it. That also makes two runs on
two machines comparable. The index sealing key is never read into a record, and no record contains it.

The journeys reach the network only through the reviewed catalog: pinned URL, expected byte count and
SHA-256, and a full-tree digest compared after extraction. A substituted or truncated download fails
closed with `RUNTIME_INTEGRITY` rather than being used — which is exactly how the packaging defect below
was caught. This change introduces no new endpoint, no new IPC method and no new file the application
writes into a person's project.

The residual risk is that an evidence file is only as good as the machine that produced it: a compromised
machine produces a passing record. Nothing here detects that. What limits it is that the contract tests
run in CI on a different machine, and that the artifact verification recomputes every pin from the
artifact instead of trusting a recorded claim.

## Privilege review

Nothing in this change asks for administrator, and nothing in it can obtain it. The installer verified in
#80 is per-user, with `perMachine: false`, `allowElevation: false` and the elevation helper deliberately
not packaged, so an installed application has no path to elevation to exercise here.

The verification scripts run as the signed-in account with no elevation. They write in three places only:
the system temporary directory for the projects they build and discard, the evidence directory they are
given, and the application's own runtime cache under `LOCALAPPDATA` when they prepare tools. They create
no service, no scheduled task, no registry entry and no autostart.

The application window the journeys do not drive still runs sandboxed, with context isolation on and Node
integration off; this change adds no preload surface and no IPC method, so the boundary reviewed in #87 is
unchanged. The sealing key stays where it was created, with `wx` and mode `0o600` under the app-owned
runtime root.

## Recovery rehearsal

The transaction rehearsed is the one that can leave a project citing something that is no longer true:
the prepared context and the code map.

In every profile the journey modifies a real source after indexing, confirms the context reports itself
stale, and confirms the search is **refused** with `CONTEXT_STALE` rather than answering from the old
text. It then regenerates and confirms the context is current again. Separately it overwrites the
app-owned index with garbage, confirms the resulting state asks for review instead of crashing or passing
silently, restores the index and confirms recovery. Both rehearsals end with the person's own files
byte-identical to how they started, which the journey asserts rather than assumes.

## Known limits

The journeys are tests, not a study with users. The measurement compares two retrieval methods over a
synthetic corpus, not two products. The landing check is not an accessibility audit and used a
Chromium-based engine. CI does not build or install the artifact, so the packaging fix is covered by the
contract tests plus this recorded evidence.
