# Independent Wave 3 closeout review

Reviewer: separate Codex agent `/root/wave3_closeout_review`, using `engineering:code-review`. This is not the Bugbot service, not implementation self-review, not human acceptance, and not release certification. No delegation was used. Evidence was created only in this newly allocated temporary directory; no versioned source, branches, GitHub state or real user projects were modified.

Review date: 30 September 2026 America/Mexico_City; execution records retain their exact 1 October UTC timestamps. Worktree: `C:/Users/RitualDesktop/.codex/worktrees/wave3-harness/project-engineering-os`.

## Verdict

No new P0–P3 functional defect was confirmed in the integrated product at **799c2b6079bb4036289607f17c510ae2b16b9465** within the independently executed checks below. Two P2 verification/evidence findings are confirmed in the exact first layer **49378d70a89302fa0be347d4e6e71fd9a9179c07**. Request changes for those findings before treating that layer as ready to archive. Neither this favorable integrated-code result nor an old green CI certifies the seven branches, pending human gates, production dependency audit, installer, or release.

The reviewer protocol was **partially executed**, not completed from a fresh dependency/runtime installation. Existing dependencies were reused; the full wizard/route/contract matrix and real Electron artifacts were independently inspected as CI evidence, not rerun or attributed to the reviewer. Exact-head first-layer review is static plus syntax/import/unit checks, not its own native or renderer traversal.

## Source identity and scope

- Frozen HEAD: `799c2b6079bb4036289607f17c510ae2b16b9465`; clean before, during and after review.
- Actual main and merge-base: `9751c301976fe27e9bbad33e69f39372b69f901e`.
- Earlier separate review boundary: `8072df1d3e067a82ce0a470bdea20cf0766785b7`. This pass reviewed its subsequent delta and relevant cumulative implementation; it does not relabel that agent's tests as its own.
- Own computed product/probe source digest: `50923ce03792b6f96223566f9de351148067811428f9728a51238fd3e67b84ba`, using the tracked/nonignored `apps/companion` sources and root screenshot provenance helper with the native harness's digest construction.
- Environment: Windows `10.0.26100`, win32-x64, Node `v24.18.0`, existing Electron `44.1.1`, reviewer browser Microsoft Edge `154.0.4258.37`.
- Read repository AGENTS, README, CONTRIBUTING, OWNERSHIP and `docs/companion/EVALUATION.md`, plus the code-review skill. Cumulative and post-independent diffs are preserved as `cumulative.diff` and `post-independent.diff`; branch identities and blob comparisons are in `scope.json`.

### Exact stack identities

| Issue / PR | Exact head | Base head | Conclusion and boundary |
| --- | --- | --- | --- |
| #144 / #196 | `49378d70a89302fa0be347d4e6e71fd9a9179c07` | `9751c301976fe27e9bbad33e69f39372b69f901e` | Separate exact-head static foundation review and own syntax/import/asset/unit checks. Two findings below. No own runtime/three-size native review at this head. |
| #145 / #197 | `d3fc78318fc5c9a2d5ee4a79e2938ec8f3026871` | `49378d70a89302fa0be347d4e6e71fd9a9179c07` | Canonical profile taxonomy, profile/focus normalization and compatibility inspected and exercised as integrated in799. Older profile/service/UI blobs differ: no independent runtime certification of d3fc. |
| #146 / #198 | `428c0e984bc74913351800767ec597b8c478f5a7` | `d3fc78318fc5c9a2d5ee4a79e2938ec8f3026871` | Integrated single-flow/draft ownership and preserving choices covered by799 checks and inspected CI. Historical wizard/preparation blobs differ; not a traversal of428c. |
| #147 / #199 | `2e5a6c66f374807e54e4f152c02db07d0b6d430c` | `428c0e984bc74913351800767ec597b8c478f5a7` | Exact equal799 blobs for desktop service, preparation engine, context engine and prompts support a specific review of those shared implementation bytes. UI/profiles/harness differ; no blanket head certification. Maintainer A/B-to-own-AI manual gate remains separate. |
| #148 / #200 | `396028a73c4ce68441cef5efe78ef60a8040cd79` | `2e5a6c66f374807e54e4f152c02db07d0b6d430c` | Management overview bytes exactly equal799; management/duplicate/forget tested there. Workspace at396 differs by the later deferred-focus callback, and Files/wizard/catalog/CSS have later changes. Do not credit396 with799's focus runtime result. |
| #149 / #201 | `f7bf60bf150fd25b786d68883a7570a7c52d0486` | `396028a73c4ce68441cef5efe78ef60a8040cd79` | Selected product JS blobs including overview/workspace/Files/profiles/service/wizard/preparation/context are identical to799. CSS is not byte-identical: #150 tokenization/finite transition changes and harness/package changes remain explicit. Human evidence is accepted only for its recorded screenshot/version, not every prior head. |
| #150 / #202 | `799c2b6079bb4036289607f17c510ae2b16b9465` | `f7bf60bf150fd25b786d68883a7570a7c52d0486` | Exact independently executed review target; full shared probes and CI artifacts inspected. Limits below apply. |

All seven heads were verified as ancestors of799 through Git and checked against actual PR metadata. These are seven scope entries, **not seven executions**. A rebase, merge, fix or new head requires comparing the new bytes and renewing relevant evidence.

## Confirmed findings

### [P2] #144 does not enforce its declared-route traversal contract

Exact head493's `openspec/changes/companion-renderer-foundation/specs/companion-renderer/spec.md` requires the interface harness to fail with missing route names when a declared route is not rendered by a journey. `apps/companion/qa/renderer-foundation.mjs` merely compares `routeIds()` to the same table's keys and checks route metadata. At that head `scripts/verify-ui.mjs` imports `routeFor` only to verify manually visited wizard screens; neither it nor `verify-interface-contract.mjs` derives/compares the full declared route set against observed routes. Manually enumerated wizard screens and navigable actions are not a closed route denominator.

Reproduction: run the preserved `static-144.mjs`. It reads the exact493 Git blobs, executes the exact renderer-foundation QA with its relative imports replaced by data URLs, then adds only an in-memory route `reviewer-unvisited-route` with no renderer or journey. Baseline exit0; mutated QA exit0; restored QA exit0. `static-144.json` records stdout, hashes, the mutation and absence of full route-table references in both harnesses. This is a demonstrated unit-level nondetection plus static absence of the required global traversal gate; **the entire mutated UI harness was not executed**, and no claim of that execution is made.

Consequence: a future declared route can silently escape the first PR's traversal acceptance check. Derive the expected route IDs at this layer and compare them with actually rendered/measured routes; make missing routes fail non-vacuously and add a missing-route negative control. Preserve the older layer's actual taxonomy/constraints instead of blindly applying downstream-only motion rules. The integrated #150 harness already covers its own20 declared routes in120 cells and detects a missing-route mutation; this does not retroactively install that protection in493.

### [P2] #144 visual readiness contradicts its cited pending-human evidence

At exact493, `openspec/changes/companion-renderer-foundation/readiness.json:67` identifies `visual-check-when-configured`; line68 marks it passed and cites `evidence/validation.md` with no qualification. That document's line18 says Codex inspection is **not** maintainer visual approval and both human/independent gates remain pending. `evidence/adversarial-review.md:3` also explicitly says independent layout review and maintainer approval are pending. The docs are honest about their limit; the status and cited evidence are inconsistent.

Reproduction: read the three exact Git blobs, or run `static-144.mjs`, whose `evidenceLines` preserve the exact lines and whose assertions confirm the passed status. Set the unresolved human gate pending, or cite an authenticated maintainer acceptance clearly bound to the correct version/surfaces and update the contradictory documentation. Do not infer approval of493's Inicio/Ayuda from later #149 approval of different screenshots. An agent's static code review cannot provide that human acceptance or a three-size real traversal it did not perform.

No P0/P1 findings were introduced by this review. The known production audit failure (#204) is an existing integration blocker, not a newly discovered functional regression in the reviewed renderer.

## Own executed checks at799

Every command's arguments, cwd, Node executable, UTC times and exit are retained in `*-command.json`, with stdout/stderr in the corresponding `.log`. Commands are reproducible using `node <this-directory>/run.mjs <name> <cwd> <node-args...>`; the child uses the existing `C:/Program Files/nodejs/node.exe`. Existing installed dependencies were reused; no official npm candidate was installed.

| Own command (cwd apps/companion except scripts under this temp directory) | Result |
| --- | --- |
| `node --test qa/*.mjs` | exit0,224/224; no failures/skips/cancellations. Synthetic bundled runtime repair cases are existing QA, not a repeat candidate11.21/12.2 installation. |
| `node <temp>/reviewer-mutations.mjs` | exit0; real renderer/service and synthetic corpus; nine own checks and two original mutations with baseline/FAIL/restoration; six original PNGs/provenance records. |
| `node scripts/verify-project-screens.mjs <temp>/project-screens` | exit0;32 cells,4tabs×4widths×2motions;8 exact copies; zero external opens/errors;5 original fixture files unchanged. |
| `node scripts/verify-historical-pair.mjs <temp>/historical-pair` | exit0; old defect a3b1efda6a53501a2a06e277cf0b7f18f11c6bed produced90 measured issues in6 runs, hotfix c044d2d241db152e9d14efaee15595aab494d448 zero in6. Immutable historical renderer bytes and fixed service envelopes, **not historical native installations** or retroactive new rules. |
| `node <temp>/scope.mjs` | successful attempt3 exit0; exact branch/base/blob/source and old native artifact provenance checks. |
| `node <temp>/inspect-ci.mjs` | successful attempt5 exit0; source equivalence, matrix IDs/nonzero denominators,46 actual detected contract mutations, provenance, exact new CI tree. |
| `node <temp>/static-144.mjs` | exit0; supplementary493 review:14 module syntax checks,31 relative imports resolve,22/22 actual/declarative assets; exact unit baseline/nondetection/restoration. No493 renderer launch. |

Own management-default cells were1180/480 ×normal/reduced motion, with visible saved choices, optional tools folded and prompt content hidden. Original probes confirmed hierarchy, reachable controls and accessible names/contrast. Extra independent cases verified rejection of foreign project hashes, unknown tabs and malformed `%ZZ` routes without service calls/rerenders; busy export prevented collapsing its tools; and a source edit caused the old export to refuse with `CONTEXT_STALE` and no copy. Original bytes were restored and no external opening occurred.

The existing project-screen suite independently reexecuted here covered saved canonical organization choices, review/edit retaining choices, picker cancellation, duplicate normalization with no unapproved apply/receipt/original changes, forget cancellation retaining history, confirmed forget removing history only, optional guide/terms, route fallback, focus, and300ms loading/10s timeout behavior. Its native picker/clipboard/open boundaries are injected, not real desktop operations.

### Two original adversarial mutations

| Own mutation | Baseline | Mutated observation | Restoration |
| --- | --- | --- | --- |
| `reviewer-recipes-close-hidden-focus` | PASS: closing optional Recetas returns management and focuses visible tools summary. | FAIL by `optional-route-close-focus-not-on-visible-summary`: HTTP response only replaces the deferred focus target with a hidden tab. Probe observes focus outside the visible summary. | PASS; fresh unmutated source served again. |
| `reviewer-export-envelope-without-reviewed-payload` | PASS: explicit copy sends the exact previewed text once. | FAIL by `copyExport-success-without-exact-payload`: injected transport returns a fabricated copied-success envelope but never invokes the native text callback; independent spy sees zero exact payloads. | PASS; real service wrapper restored. |

Declaration/attempt/detection sets are exactly the same two IDs. No timeout, construction success or exception is counted as detection. The outer command exit0 means the intentional failures were correctly observed and restoration passed, not that the mutated application passed. Source/transport patches are recorded as `.diff`, and the six originals have v1 provenance containing file hash/size/dimensions, renderer source commit, engine, generator and exact phase/ran boundaries. They are synthetic test evidence, not a maintainer usability session. Avoid publicly exposing incidental local paths visible in private originals.

## Reused CI evidence and equivalence

Inspected artifacts from run36809073279 (head e456df8c3ca80da1c3b5245f67b4576651e3eb16) are preserved in `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-ci-36809073279`. Own Git comparison shows **no diff** from that head to799 under `apps/companion` plus root screenshot provenance helper; the source digest is identical. This supports reuse of those exact product/probe results, not unrelated revisions or environments.

`ci-inspection.json` preserves raw artifact hashes and independently checked:

- Exactly72 required profile/way/motion/window cells, no duplicate/missing IDs;534 primary screenshots plus30 screenshots across8 supplemental records. Minimum9 controls,243 motion measurements and1 positioned element per primary cell; nonempty denominators.
- Current declared20 routes×2motions×3windows=120 actual cells; nonempty minimum6 controls/165 motion/1 positioned;16 observed negative records including missing-route detection.
- All46 top-level declared interface mutation IDs match the46 observed IDs and each is actually detected;1 construction probe is separate. Zero baseline findings;6 wizard runs/36 screens and402/402 controls reachable.
- Wizard28 runs/168screens,1876/1876 controls,56/56 exact copies, zero problems;22 compatibility cases and10 isolation cases completed.

For new run36811775092, native artifact11140060189 in `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-ci-36811775092` directly records synthetic merge `9ff67f324f9cf902d046fea98bfd97561e0d1e08`. Own read-only GitHub commit metadata proves its tree **e335b9543e394d1bfd9661d815cfdc6933f73be8** equals799's tree. Native record completed=true,dirty=false,18screens,12clipboard events,failures=[], same source digest. All18 original PNG/provenance hashes, lengths, dimensions and commit fields were checked. This is **CI's real Electron execution**, not the reviewer's; native picker remains injected, and it is not installer or downloaded-managed-toolchain evidence. The newly downloaded browser artifact was available but not needed/reinspected because the prior inspected product/probe bytes were identical.

Own read-only `gh run view 36811775092` confirmed completion with Companion macOS/Ubuntu/Windows failing only **Audit app dependencies**, root matrix/root dependency audit and Windows native succeeding, and required aggregator failing to preserve protection. The complete run is not green. Parent reports unchanged official11.21.0/12.2.0 still fail the production audit; no candidate installs or audit exceptions were performed by this reviewer.

All seven layers share package-lock blob **501559665250d7b45829154a3bfbda862ac684e9**, verified in `scope.json`; first144 also has unchanged lock/runtime against main. Consequently a25September green first-layer CI is not evidence of today's clean production audit. Waiting for an official correction (#204) applies to the affected shared dependency bytes, including the first layer; no historical green is used to bypass it.

## Human evidence and original export criterion

The original #97 acceptance text was re-read via read-only GitHub: the renamed export control must have a name someone unfamiliar understands without opening it, verified by asking that person. It does not prescribe literal words `texto`/`copiar`, two export readers or unanimity. #149 separately expands Inicio/paso1 to two different unfamiliar people. These obligations are not conflated.

The received answer for the new export name is preserved verbatim:

> Supongo que lo que hace el boton es recopilar informacion de los archivos que hay en mi carpeta para que una IA sepa donde estan o los analice

It recognizes obtaining information from the files and the intended AI destination in the person's own words. It therefore satisfies the **minimum original name/function recognition criterion**, without weakening that criterion into generic praise or technical automatic validation. It does **not** establish understanding of review, manual copying, exact selected fragments, nonautomatic sending, or absence of direct AI folder access. Those details were not measured and must not be represented as human findings. The user supplied this answer in response to the request for a new unexposed reader, pointing to the unopened control without explanation; the reviewer did not conduct the interview and invents no identity, interview date, hesitation, questions or recording. Historical failed/mixed export rounds retain their original names/outcomes.

The final confirmed two-person Inicio/paso1 reading and maintainer approvals remain evidence for their recorded version/surfaces. Later reorganization exclusive to project detail does not require inventing/repeating a different Inicio cold round. The main preparation screen was approved, Inicio approved, and Files acceptance conditional on the agreed reorganization must remain accurately recorded. Agent test fixtures cannot satisfy those decisions.

Other issue-specific manual gates must be checked separately, not inferred from those readings: #145 maintainer visual reading of names/descriptions; #146 maintainer real walkthrough/captures plus the unfamiliar Inicio/paso1 observation already present in #149; #147 real maintainer preparation of a software folder via A and another via B, pasting the prompt in their own AI and recording real checks. #147 does not itself demand another unfamiliar-person round. #144's earlier visual evidence discrepancy and exact-version independent-layout limit remain as reported above.

## Integrity of failed attempts and remaining limits

All failed reviewer scaffold attempts are retained. Scope attempt1 exited1 because a downstream-only file was absent at an ancestor; attempt2 exited1 due a too-small exec buffer; corrected attempt3 passed. CI inspection attempts1–4 exited1 while correctly reconciling supplemental cells, supplemental screenshot totals, mutation ID parsing, and a synthetic merge not available as a local object; corrected attempt5 passed. These are reviewer tooling errors, **not product regressions or mutation detections**, and no failed record was deleted. Wrong-location exploratory `git show` reads after resume also failed and were corrected using the exact tree inventory; those tool outputs remain in the session transcript.

No own fresh `npm ci --ignore-scripts`/runtime install, no own full native/wizard/46-negative run, no installer install/repair/uninstall, no downloaded-toolchain setup, no maintainer AI session, no assistive-technology human session and no protected integration/archive were performed in this pass. Those limitations prohibit calling this completed release evaluation. Existing224 QA and the specific own browser suites are execution evidence; the broader CI matrices and old maintainer records are inspected/reused evidence with their provenance.

The review does not authorize fabricated acceptance, audit exceptions, rebuilding npm, switching managers, lowering protections, archival/merge without its gates, or starting Wave4. Fix the confirmed verification/evidence findings and validate on their resulting exact heads; preserve human gates and #204. The tree and stack were kept fixed throughout this review.
