# Independent static addendum — integrated harness delta

Reviewer: separate Codex agent `/root/wave3_closeout_review`, using `engineering:code-review`. Exact clean integrated head **b4e3e2c61e872b34ba35d394252921a1f8b0d74e**, compared directly with previously reviewed **799c2b6079bb4036289607f17c510ae2b16b9465**, in `C:/Users/RitualDesktop/.codex/worktrees/wave3-harness/project-engineering-os`.

## Conclusion

No new P0–P3 defect was confirmed by this **bounded static review** of the harness propagation delta. The phase/route distinction is handled consistently: a wizard descriptor's `context` phase is not asserted to be a route, and only the actual rendered `state.page` enters route coverage. This is not a new browser/contract/native execution atb4, a certification of intermediate branches, human approval, release/integration readiness or Wave3 closure.

The earlier799 review, focusedfb98 reprueba and separatefb98 Home/Help layout report retain their own SHA/execution boundaries. None is relabeled as an execution ofb4.

## Exact evidence and own checks

Own command: `node <this-directory>/static-check.mjs`, cwd the exact worktree above, Node24.18.0; exit0. `static-delta.json` records exact timestamps, file/source hashes, original/new mutation IDs, syntax command outputs/exits, source observer, stable-surface comparisons and reviewer identity. `functional-delta.diff` preserves the compared source diff with its digest.

Verified own read-only Git state and comparisons:

- Headb4 clean before/after, `git diff --check` exit0.
- **UI, engine, context, runtime, desktop, package.json, package-lock and root screenshot provenance helper are byte-identical to799.** This supports retaining the prior product-code conclusions for those unchanged bytes, not claiming another execution or identical whole-app/probe digest; the harness did change.
- The only three changes under `apps/companion` are added `qa/route-traversal.mjs`, added `scripts/route-traversal.mjs`, and modified `scripts/verify-interface-contract.mjs`.
- Node syntax checks of those exact three Git blobs each exited0. No full test suite or installation was repeated.
- The route-guard and focused QA blobs are exactly identical to the correspondingfb98 files exercised independently earlier. Recorded hashes: guard `18a22c59f5bece4aea0149fb733c6989e2de89be1fbd42e76832eb043ed9b078`; QA `221388c32bccd8abbdffc0ae95d2ec51cf49d644ed76d48ab91c9e2b624fde1f`. This establishes shared implementation identity, not integrated fixture runtime equivalence.
- All46 original top-level mutation IDs remain; exactly one new missing-route negative was added, totaling47. No original negative was dropped, renamed or converted into a construction probe.

## Static reasoning about the correction

1. `inspectRouteTraversal` gets the declarations and current route metadata from the **served renderer's** modules. Coverage collects only observed `value.id` after a nonbusy view heading, visited state, matching nav and breadcrumb. The closed-set guard rejects empty numerator/denominator, missing/unexpected IDs and duplicate declarations; baseline traversal/run problems feed findings.
2. `walkToFinished` already checks each phase's real heading and presses its actual next control. Its route observer now omits an expected route ID for those phases rather than equating their descriptive phase names with routes. The actual `wizard-prepare.mjs` sets `state.page='install'` while rendering the heading «Preparar tu proyecto»; therefore counting that observation as install instead of inventing a context route matches product bytes. Maintenance navigation still supplies explicit expected IDs and asserts them, as do start/finished/help/projects/workspace and connection-error.
3. Fixed maintenance service envelopes remain explicitly fixtures, not downloaded tools or engine success evidence. The new STATUS import is actually exported by the unchanged renderer fixture module. The missing-native-API route remains separate from the broken-module fallback.
4. The inherited `pressed` path still uses `revealDetails` to open real existing disclosure summaries before normal clicking; it does not force-click, edit details.open, or count an intended destination as visited. This helper was unchanged from799. This static pass does not test a separate backport of that helper into an ancestor branch.
5. The new missing-route negative requires the specific added name in missing and all original traversal runs without problems. Exceptions still count as **not detected**, so an integration failure cannot be credited as its detection. Its restored/actual baseline must pass the separate route guard. The new provenance records commit/dirty state and hashes instead of claiming that a dirty earlier run was clean.

## Limits and retained failures

No browser/contract,47-negative run, physical clipboard, native Electron, engine, dependency audit, npm candidate or installer execution occurred atb4 in this pass. Parent-reported per-head contracts are not attributed to this reviewer and were not substituted for this static scope. Parent retains the earlier phase-name and hidden-technology integration failures; this addendum does not delete, relabel or claim independent execution of those attempts.

Different intermediate heads must retain their own source comparisons and observed contract results. In particular, thefb98 layout captures are of its earlier first-layer UI, not of the byte-different final799/b4 UI. Human gates and #204 remain separate. No repository files, dependencies, branches, GitHub state or real projects were modified, and no Wave4 work was started.
