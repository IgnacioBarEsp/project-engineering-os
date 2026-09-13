# Brownfield baseline

Measured on `main` at 48557fe, the commit that integrated issue 97. Everything below is what the code does
today, read from the files named, not from memory of what it was supposed to do.

## What the list shows today

`listProjects` in `apps/companion/desktop/service.mjs` returns one row per remembered folder with
`{id, name, root, profile, recorded: true, state, error?}`. The state is one of `not-prepared`,
`interrupted`, `prepared`, `context`, `unreadable`, and it comes from `base.summary()` and
`context.summary()` — each of which reads that stage's receipt and journal and nothing else. No folder
inspection, no source hashing. Every row is wrapped in `withBudget(..., SUMMARY_BUDGET_MS)` with the budget
at 1500 ms, and rows are read concurrently, so the whole list is bounded by the budget rather than by the
sum of its rows.

`showProjects` in `apps/companion/ui/app.mjs` renders each row with its state label, the sentence
`Estado guardado la última vez; se comprueba al abrirlo.` at the same size as the state, the profile tag,
and two controls: `Abrir →` and `Quitar de la lista`.

So the list already has a state per row, a bound, and an honest label about what that state is. What it
does **not** have is any relation to a real check: `prepared` means a receipt file exists. It cannot
distinguish a project whose stages were verified from one whose receipts merely exist, it does not say what
a project is missing, and it offers no next step.

## What a real check produces today, and what it costs

`status(p, controls)` in the same file runs the actual verification, stage by stage:

- `base.verify()` re-inspects every file under the folder to compare the inventory fingerprint, and
  validates the three owned files against the receipt.
- `context.verify()` loads the index and reports `current | not-prepared | stale | interrupted`.
- `environment.verify()` (software and Unity only) resolves the managed toolchain.
- `engineering.verify()` and `activation.verify()` check the constructor files and that OpenSpec answers.
- `codeGraph.verify()` re-extracts symbols to compare against the snapshot.

Each stage's failure is caught by `safeStage` and becomes `{status: 'requires-action', error}` so one broken
stage does not take the others. The result is the truth this issue wants on the list — and it is minutes of
work for a software project, which is exactly why issue 97 kept it off the list.

Nothing persists that result. It lives in `state.status` in the renderer until the window closes.

## Receipts a verdict could be anchored to

Written inside the person's folder, all under `.project-os/companion/`:

| Stage | Receipt | Journal |
| --- | --- | --- |
| base | `receipt.json` | `transaction.json` |
| context | `context/receipt.json` | `context/transaction.json` |
| environment | `environment.json` | — |
| activation | `activation.json` | `activation-transaction.json` |

`engineering` writes under `.project-constructor/`, and the code map is verified by re-extraction rather
than by a receipt in the folder.

## What exists for the destructive and secondary actions

`forgetProject` removes the entry from `projects.json` and returns
`{forgotten: true, projectFilesChanged: false}`. It never touches the folder. The interface calls it from
`forget(project)`, which opens a confirmation dialog saying the files stay where they are.

There is **no** duplicate operation, in the service or the interface. There is no secondary menu: the two
row controls sit next to each other, and inside a project every action is already a visible button.

## What the checks currently assert

- `apps/companion/qa/project-list.mjs` — four tests on the bound and on one broken row not taking the rest.
- `apps/companion/scripts/interface-contract.mjs` — `EXPECTED_ACTIONS` is 11 ids, `ACTION_PAIRS` collects
  every visible/spoken name pair, `UNDEFINED_VOCABULARY` checks every glossary word is reachable from the
  screen it appears on, and `LIST_PURITY` walks every text node of the list.
- `apps/companion/scripts/verify-interface-contract.mjs` — 23 mutations, 23 detected, plus one construction
  probe.
- `apps/companion/scripts/verify-native-journeys.mjs` — five profiles against the installed window, behind
  an identity guard over the whole application directory.
- `test/companion-language.test.mjs` — the golden Inicio sentence, nine families of undemonstrated claim,
  nine limit sentences, and the four button construction paths.

## Constraints carried in

- One name per action is enforced by construction: the label lives in a closed `ACTIONS` table and `doBtn`
  takes no label. Two names for one action are unrepresentable, not merely detectable.
- Every glossary word that reaches a screen must have a control on that screen that opens its definition.
- The private `peos://` scheme serves an exact asset allowlist in `apps/companion/desktop/main.mjs`.
- No absolute path, account name or session identifier may reach a versioned file; anchor with
  `apps/companion/scripts/portable-path.mjs`.
- The debt budget stands at 4 of 5.
