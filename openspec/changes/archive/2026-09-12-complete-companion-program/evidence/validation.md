# Validation record — issue 94

Everything here ran on Windows 11 x64 against the application installed from the artifact this change
publishes. Nothing claims a study with users, a token measurement, or a comparison with another product.

## How to reproduce this

From `apps/companion`, with the application installed:

```
npm run evidence:native    -- "<install>/resources/app" <evidence directory>
npm run evidence:launches  -- "<install>/resources/app" <evidence directory> [--launch cursor]
npm run evidence:model     -- "<install>/resources/app" <evidence directory> <absolute codex.exe>
npm run evidence:landing   -- ../../site/index.html <evidence directory>
```

Each command rewrites the record it owns and exits non-zero on a finding, so the files in this directory
are output rather than prose. Launching an editor is opt-in because it puts a window on someone's screen.

## Automated validations

| Validation | Result |
| --- | --- |
| `constructor-tests`, `capability-matrix-check`, `doctor-json-check`, `sync-check` | `npm run check` at the repository root: 304/304. |
| `critical-document-presence`, `relative-link-check`, `findability-two-hop-check`, `neutrality-check` | `npm run check:docs` and `npm run check:neutrality` pass. |
| `openspec-strict` | `openspec validate --all --strict` with the pinned official 1.6.0 CLI: 19/19. |
| `component-or-interaction-tests` | `npm test` in `apps/companion`: 78/78, including the Antigravity regression and the rebuilt benchmark regressions. |
| `accessibility-check`, `responsive-check-when-configured`, `visual-check-when-configured` | `verify-landing.mjs` drives the page in a real browser: no external request, headings in order, working skip link, contrast measured across both colour schemes, reflow to 240 px and at double text size, and every published number reconciled against the raw measurement. |
| `secret-scan`, `dependency-signal-review` | `npm run check:audit` reports 0 high or critical findings. No absolute path, account name or credential in any versioned file — the one exception was a screenshot, found by review and fixed at the point of capture. |
| `second-run-idempotence` | Every native journey closes the project back to the history and opens it again; three profiles keep their citation and two refuse it with a stated cause. |
| `authorization-tests`, `session-negative-tests` | `verify-local-launches.mjs` exercises the refusal paths against the real signed applications: a recorded identity that no longer matches its bytes is refused with `APP_CHANGED` by all three, and an unsigned application is refused with `APP_UNTRUSTED` rather than launched. |
| `opsx-check` | Official OpenSpec workflows activate inside the native journeys for the engineering profiles. |

## Manual evidence

| Evidence | Where |
| --- | --- |
| `adversarial-review` | `independent-review.md`: an independent session that did not implement the change. Verdict FAIL, both blockers and five majors resolved. |
| `issue-link` | https://github.com/IgnacioBarEsp/project-engineering-os/issues/94 |
| `ground-truth-comparison` | Every benchmark question has one known source and one known answer, frozen before inference; every journey query has a known expected source, and each citation is resolved against the file on disk. |
| `keyboard-and-assistive-technology-review` | The landing's skip link is reached by the first tab, activates its target and shows a visible focus ring. No screen reader was used, and that is stated. |
| `loading-empty-error-and-constrained-connectivity-states` | The journeys assert refused, stale and recovered states, and record what the interface said in each. |
| `privilege-review` | The installer is per-user with elevation disabled and its helper not packaged. The verification scripts run as the signed-in account and write only to a temporary workspace, the evidence directory and the application's own isolated data directory. |
| `qualitative-review-for-clarity-and-current-ownership` | `native-acceptance.md`, `model-experiment.md` and `public-delivery.md` publish the method before the numbers and name what each number does not support. |
| `recorded-drift-decisions` | Antigravity added as selectable but never launched; publication deliberately deferred until after the merge; the landing corrected twice, once before publishing and once after. |
| `recovery-path-verification` | Closing and reopening each project, with the person's files re-hashed afterwards and unchanged in all five profiles. |
| `recovery-rehearsal-for-one-transaction` | The context transaction: sources change, the application refuses to cite and says why, and the folder is left byte-identical. |
| `review-of-declared-degradations` | The folder picker and the installer's wizard pages need a person; the native window does not exercise activation, engineering apply or the code map; the model experiment ran against a build older than the delivered artifact. |
| `threat-model` | The release publishes its identity, checksum and real signature status, and the artifact is unsigned — stated in the notes, on the landing and in the manifest, with no way around the warning described. The Pages workflow takes least privilege and checks what it is about to publish before uploading it. |

## Known limits

The measurement compares two retrieval methods over a synthetic corpus, not two products, and it ended in
a tie. One machine, one configuration, one reviewer. No person other than the maintainer has installed the
published artifact, and no usability study was run.
