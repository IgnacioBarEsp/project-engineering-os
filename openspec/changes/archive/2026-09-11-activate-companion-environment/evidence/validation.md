# Validation record — issue 87

Every entry below was executed on Windows 11 x64 for this change. Nothing here claims installer
behaviour, a signed publisher, external-agent activation or a measured token saving. Those belong to
issues 80 and 81.

## Automated validations

| Validation | Result |
| --- | --- |
| `constructor-tests`, `unit-and-contract-tests` | `npm run check` at the repository root: 304/304 tests pass, including the updated companion preparation contract. |
| `component-or-interaction-tests` | `npm test` in `apps/companion`: 56/56 tests pass, including the new service, runtime, code-map, launcher, local-application and context regressions. |
| `accessibility-check`, `responsive-check-when-configured` | `npm run test:ui` drives the shipping renderer for the five profiles at 1180, 768, 480 and 240 CSS pixels with reduced motion, keyboard dialog focus and no horizontal overflow. See `browser-evidence.json`. |
| `visual-check-when-configured` | Screenshots captured from the same run in `screenshots/`, including the verified code search for software and Unity and the enlarged-text view. |
| `authorization-tests`, `session-negative-tests` | The renderer cannot supply a path, command, executable, module or URL; plans are single use and are refused across stages; profile and capability gates refuse stages that were not requested. Covered in `qa/desktop-runtime.mjs` and `qa/desktop.mjs`. |
| `secret-scan`, `dependency-signal-review` | `npm run check:audit` reports 0 high or critical findings with 0 exceptions; `npm run check:install-policy` verifies quarantine and the scoped exception; `npm audit` reports 0 vulnerabilities for the core and for the app. |
| `openspec-strict` | `openspec validate --all --strict` with the pinned official 1.6.0 CLI: 16/16 items valid. |
| `opsx-check`, `sync-check` | Executed for real inside a prepared project by `scripts/verify-engineering-runtime.mjs`: workflows `PASS`, files `IN_SYNC`, through the project-local entry point and through the generated PowerShell launcher. |
| `capability-matrix-check`, `doctor-json-check` | `npm run check` includes both. `project-os doctor` reports the three pre-existing technical-profile findings that already exist at the base commit `e91cf14`; this change does not activate a profile or alter `.project-os/profiles.json`. |
| `critical-document-presence`, `relative-link-check`, `findability-two-hop-check`, `neutrality-check` | `npm run check:docs` passes 27 README links, the prompt contract and 15 spec purposes; `npm run check:neutrality` passes the public tree and the export allowlist. |
| `second-run-idempotence` | `npm run fixture` and `npm run fixture -- --isolated-toolchain` both pass; repeated context preparation reports `changed: 0`. |

## Real runtime validation

`scripts/verify-code-runtime.mjs` and `scripts/verify-engineering-runtime.mjs` use the previously
reviewed managed cache, with no download during the probe. Results are recorded in
`activation-verification.json`.

- CodeGraph 1.6.0 indexed a JavaScript and a C# source, produced 5 symbols and 3 relations, and a real
  `CodeGraph.searchNodes` query matched. A pre-existing user index in `.codegraph` was preserved, a new
  engine answered after restart, and a changed source moved the map to `stale` and refused the query
  without replacing the saved file.
- Core 0.5.0 and official OpenSpec 1.6.0 prepared a project that already had a product `package.json`
  with a `postinstall` script. The manifest bytes were unchanged, 75 files were generated, workflows
  verified, and a new engine confirmed readiness. The project-local entry reported `IN_SYNC` and `PASS`
  from a fresh child process, `openspec --version` returned 1.6.0, and a changed toolchain selection was
  rejected with `TOOLS_CHANGED`.
- The generated PowerShell launcher was executed for real and returned the same status. Editing one of
  the copied modules stopped it before Node started.
- Moving the prepared folder produced `TOOLS_MOVED` from the entry and `ENVIRONMENT_MOVED` from the app;
  returning it to the reviewed location restored readiness without repreparing anything.

## Manual evidence

| Evidence | Where |
| --- | --- |
| `adversarial-review` | `independent-final.md`: an independent session, one blocker and four majors found and resolved, remaining findings recorded as debt. |
| `ground-truth-comparison` | Symbol search results map to current original paths and hashes; document citations carry line, PDF page and DOCX paragraph. Verified in the browser run and the real runtime probes. |
| `keyboard-and-assistive-technology-review` | Dialog focus return, live regions and keyboard-only navigation exercised across the five browser journeys. |
| `loading-empty-error-and-constrained-connectivity-states` | Bounded downloads, cancellation, interrupted activation, stale plans, corrupt cache and an offline or unsupported platform all produce a recoverable state; covered by `qa/runtime.mjs`, `qa/activation.mjs`, `qa/cache-repair.mjs` and `qa/codegraph.mjs`. |
| `privilege-review`, `threat-model` | `docs/companion/SECURITY.md` and the decisions recorded in `design.md`, including what the launcher can and cannot vouch for. |
| `recovery-path-verification`, `recovery-rehearsal-for-one-transaction` | A real interrupted engineering transaction was resumed and rolled back through the reviewed opaque plan; the repair path replaced a corrupt managed npm cache using the real distribution and restored the corrupt bytes when replacement failed. |
| `qualitative-review-for-clarity-and-current-ownership` | `docs/companion/ENVIRONMENT.md` is new and linked from the documentation index and the desktop page; ownership boundaries follow `docs/architecture/OWNERSHIP.md`. |
| `recorded-drift-decisions` | The upstream companion preparation contract test changed meaning because core 0.5.0 adopts eligible seeds instead of declaring a conflict; the test was updated and a negative case for a constructor-owned original was added. |
| `review-of-declared-degradations` | Managed runtimes are Windows x64 only; elsewhere the app degrades to in-process preparation without the environment capability. CI runs the browser journeys without a runtime cache, so the engineering screens are covered by this local evidence and not by CI. |

## Known limits

The persistent entry re-reads roughly 200 MB of pinned trees on every call. The launcher cannot vouch
for itself if it is replaced, which is why the work map only routes an agent to it after a verified
activation. No reviewed ignore rules are written for `.project-os/toolchain` or `.project-os/companion`;
the documentation recommends them instead. These are captured in `debt-assessment.json`.
