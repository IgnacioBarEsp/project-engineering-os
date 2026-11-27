# Independent addendum: #144's two P2 corrections

Reviewer: separate Codex agent `/root/wave3_closeout_review`, using `engineering:code-review`; not Bugbot, not human acceptance. Date: 30 September 2026 America/Mexico_City, with exact 1 October UTC execution times retained. No delegation.

## Verdict and exact scope

Both previously reported P2 findings are **resolved in the correction reviewed at fb98d62001e3ec57935b477724c34f2dc173742b**. No new P0–P3 defect was confirmed within this correction's scope. This addendum does not supersede the earlier integrated review at799c2b6 or certify other stack heads, integration, release, or Wave3 completion. Visual acceptance remains pending; correcting its metadata does not complete the human gate.

- Worktree: `C:/Users/RitualDesktop/.codex/worktrees/wave3-companion/project-engineering-os`.
- Frozen clean head: `fb98d62001e3ec57935b477724c34f2dc173742b`.
- Compared correction directly with previous first-layer head `49378d70a89302fa0be347d4e6e71fd9a9179c07`.
- Only renderer change is removal of two orphan declarations in `ui/lib/router.mjs`; all other renderer files are byte-identical to493. Engine/context/runtime/desktop/package/lock surfaces are unchanged.
- Environment: Node `v24.18.0` at `C:/Program Files/nodejs/node.exe`, Windows, existing Playwright/Edge reused; no installation, npm audit, runtime mutation or dependency edit.
- Own evidence is solely in this newly allocated temporary directory. No versioned file, branch, GitHub state, actual user project or earlier review artifact was changed.

## Own commands and results

Commands executed through `run.mjs`; exact arguments, cwd, executable, UTC times/exits and stdout/stderr are retained in corresponding `*-command.json` and `.log` files.

| Own execution | Outcome |
| --- | --- |
| `node scripts/verify-interface-contract.mjs <this-directory>/contract` from `apps/companion` | exit0, 04:54:06.759Z–04:56:25.392Z.46/46 detected negatives,1/1 separate construction probe, zero findings. |
| `node --test qa/renderer-foundation.mjs qa/route-traversal.mjs` from `apps/companion` | exit0,3/3 tests; empty declarations/visits, missing route, newly added route, unexpected route and duplicate declaration negatives exercised. |
| `node <this-directory>/verify-retest.mjs` from repository root | exit0; independently validates raw contract record, provenance hashes, exact route sets, actual negative observation, pending visual metadata, removed-orphan consumer search, unchanged critical surfaces, and preserved implementer evidence hashes. |
| `git status --porcelain`, `git rev-parse HEAD`, `git diff --check` | clean exact head before/after; diff check exit0. |

The complete151-test implementation run was **not rerun** and is not claimed as reviewer execution. The focused3 tests plus full browser contract execution are the proportional independent correction checks. No full wizard/engine/native suite, new installation or human capture was performed.

## P2 declared/rendered route guard: resolved

The contract now imports the separate closed-set `routeTraversal` guard, reads declarations from the **served router module**, and derives observations through real renderer interactions. An observation is counted only after `state.page` matches the expected journey destination, its screen-state visited flag is true, a view heading exists outside busy, and breadcrumb/active navigation match the served route metadata. The numerator is not inferred from the declaration table or the intended click alone.

The own baseline record in `contract/interface-contract.json` contains exactly21 declared and21 actually observed routes, no missing/unexpected route or traversal problem. Maintenance screens were traversed using normal visible-control clicks and explicit fixed-service envelopes. The real missing-native-API state was opened independently of the broken-module fallback. The extra route-closure journey covers1180×820/reduced motion, not a complete new layout matrix; the unchanged existing contract wizard still executes6 runs/36 screens/318 of318 reachable controls across its three sizes and two motion preferences.

The two removed declarations, `stack-choice` and `ready`, had no corresponding page assignment, renderer/action consumer or route lookup; their removal is confined to those orphan table entries. The real screen modules/actions remain byte-identical. The earlier failing23/21 result is preserved below, not disguised as a pass.

### Observed negative is not an exception

The own reexecution of the repository's new mutation `a-declared-route-never-rendered-by-the-journey` modifies only the disposable served router copy, adding `reviewer-unvisited-route`. Its raw observed result has22 declared/21 rendered routes, with exactly that added name missing. Both original traversals have empty problem lists and the21 original routes are still observed. The record reports `detected: true`, `by: "la propiedad que nombra"`; there was no exception, timeout or fixture failure counted as detection.

This is the reviewer's execution of the repository's newly added negative, not a claim that the reviewer authored a different original mutation in this addendum. The harness restores pristine copied bytes after each mutation; the actual frozen worktree remained clean. Existing45 negatives remain present and detected alongside this46th case. The construction probe remains separately counted1/1 and is not inflated into a defect detection.

Own `verify-retest.mjs` compares declared and rendered IDs against independently imported exact-head `routeIds()`, checks each observation's route/nav/breadcrumb assertions, validates46/46 and the specific missing name, and verifies every renderer hash plus harness/guard hashes against cleanfb98 source. The raw contract provenance records the exact head and `dirty:false`. `retest-verification.json` preserves the raw artifact SHA-256, observed route records, negative record, and checks.

## P2 visual evidence consistency: resolved; approval still pending

`visual-check-when-configured` now has `status: "pending"`, `evidence: null`, and a justification explicitly separating Codex inspection from maintainer acceptance of this layer's Inicio/Ayuda. The later #149 acceptance is not attributed to this version. The adversarial/independent status also remains pending until this exact-head reprueba is recorded appropriately. Historical honest documents were preserved, with a dated correction explaining the earlier metadata mismatch.

This fixes the inconsistency, **not** the missing human approval. No new maintainer acceptance, usability response, native traversal or assistive-technology review is supplied by this agent. The prior report's human and production-audit limitations remain intact.

## Preserved evidence from the implementer, not reviewer execution

The correction's versioned extract identifies two existing raw contract reports. Their SHA-256 values were independently checked against the raw files; neither was modified:

- Before orphan cleanup: `C:/Users/RitualDesktop/AppData/Local/Temp/peos-144-route-guard-before-cleanup/interface-contract.json`, SHA-256 `cda8e4d60cdd1a2bda679ecefc9dcbcd129764091cc883c12d034d94016991b4`. Expected exit1 is reported by the implementer; raw summary records23/21 with `stack-choice, ready` missing and a finding. It lacks provenance, and this addendum does not invent clean-checkout provenance for it.
- Implementer final: its raw path and SHA-256 `499a9566489a01aa36636ca42f765455e5c2dddd161c5f29ee469dabf08b926f` are preserved in `retest-verification.json`. This is the earlier dirty-source pass, not relabeled as cleanfb98 execution. The new independent clean pass is the separate artifact under this directory.

The original independent report remains at `C:/Users/RitualDesktop/AppData/Local/Temp/peos-wave3-closeout-review-4e5906fd-c6b9-4631-ac67-b0c3f28cde8a/independent-review.md`; its bytes/hash are recorded for preservation, not replaced. No failed/dirty earlier attempt was deleted.

## Remaining boundaries

No new npm candidate installation/audit, rebuilding npm, alternate manager, exception, reduced protection or external integration was attempted. Production audit #204 and exact issue-specific human gates are unchanged. This focused favorable correction review supports resolving the **two P2 findings on fb98**, not claiming that #144 is ready to archive, that all heads are re-reviewed, that CI is green, or that Wave3 is finished. Propagation creates new heads that require comparing their changed bytes; this addendum does not preapprove them. No Wave4 work was started.
