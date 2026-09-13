## Why

Issue [#98](https://github.com/IgnacioBarEsp/project-engineering-os/issues/98).

Someone who prepared a folder two weeks ago comes back and has no way to know where they left it. The
maintainer put it in two sentences: *«cuando los proyectos ya estén listos salgan en verde o con una
palomita, así cuando vayas a mis proyectos puedas ver cuáles ya están listos»*, and *«si el proyecto detecta
que le faltan cosas, que te ponga un apartado en cada proyecto en el que te dé prompts para terminar de
configurar»*.

The application already knows almost everything needed: it verifies base, context, environment, engineering,
activation and the code map, and each one reports its own state. What is missing is not detection. It is
persisting that verdict, showing it, and turning it into a next step.

And there is a tension in this issue worth naming before touching anything, because getting it wrong is the
whole failure mode. One acceptance criterion says the state shown comes from **a real check, never from the
presence of a folder**. The decision criterion says a green check mark may appear only when every stage that
profile needs verified for real. But a real check is what `status()` does when a project opens: it
re-inspects the folder, re-hashes the sources and, for software, checks the managed toolchain — minutes of
work. Doing that per row on every visit would make the list the slowest screen in the application, which is
precisely what issue 97 avoided and measured.

The way out is not to pick one of the two extremes. It is to **save the verdict of the real check together
with the digests of the receipts it was computed over**. The list already reads those receipts, so
comparing them is within the bound it already has, and that comparison lets the list say three different
things that are all true: verified and nothing has changed since; verified but something changed, so it has
to be checked again; or never verified. The green check mark appears only in the first case.

## What Changes

- A verdict store in Companion's own data directory, next to `projects.json`: for each project, the result
  of the last real check, stage by stage, with the digest of every receipt and journal it depended on and
  the time it was taken. Writing it is a side effect of a check that already ran; no check is added.
- `listProjects` reads that verdict and the same digests it already reads, and reports one of
  `verified`, `changed`, `unverified`, `interrupted` or `unreadable` per row, with the list of stages a
  project is missing in the person's words rather than an internal code. The green check mark requires
  `verified` **and** every digest unchanged.
- The list says, at the same size as the state, what the check covered and what it does not: it does not
  re-read the person's files, so a file edited since the check is not visible from the list.
- Opening a project from its card. The card itself is the control; `Abrir →` stops being a separate name for
  the same action, which the closed action table would refuse anyway.
- A secondary menu on each row for what is secondary or destructive, with every primary action still a
  visible control outside it.
- **Duplicar esta preparación**: a new project that reuses the original's selection against a folder the
  person chooses, applied fresh. None of the original's preparation artefacts are copied — they carry that
  folder's paths, receipts and digests — and the new folder is verified on disk not to contain
  `.project-os/companion/` after the duplicate is created.
- **Cómo trabajar en este proyecto** inside the project: what to do given this profile and what this project
  is missing, in the order the steps have to be given. The content is composed from the recipes and the
  pending stages that already exist. The prompt engine is issue #99 and will replace that composition.
- The issue lists «duplicar, eliminar, quitar del historial» as three menu entries while its own acceptance
  criterion defines *eliminar* as removing from the list and never touching the folder. Those are one
  action, and one name per action is enforced by construction since issue 97. The design records which name
  survives and why.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `companion-experience`: adds the persisted-verdict contract, what a green check mark may claim, the
  secondary-menu rule, and the two folder-preserving guarantees for duplicating and for removing from the
  list.

## Impact

`apps/companion/desktop/service.mjs` (verdict store, duplicate), `apps/companion/ui/app.mjs`, the shared
interface probes, the project-list tests, the two journey checks, `docs/companion/EXPERIENCE.md` and the
`companion-experience` spec. No change to the published core 0.5.0, the required CI gate `CI / required`,
branch protection, the installer's file allowlist, the content security policy or the asset allowlist in the
Electron main process.

Risk: that `listo` becomes an empty claim if the threshold is chosen for convenience. Mitigated by declaring
per profile in the spec which stages a green check mark requires, by making a missing or unknown stage
resolve to «le falta algo», and by a mutation that breaks one verified stage on purpose and asserts the
project leaves the ready state.

Second risk: that a saved verdict is presented as current when the folder has already changed. Mitigated by
the digest comparison, by the screen stating what the verdict does not cover, and by a test that edits a
receipt and asserts the row stops being `verified`.

Third risk: that verifying per row returns to the list the slowness issue 97 removed. Mitigated by keeping
every list read inside `SUMMARY_BUDGET_MS` and by measuring the list with one unreachable row.

Rollback reverts the pull request: the list returns to the recorded state of issue 97 and the saved verdict
stops being read. No prepared folder or history entry is touched.

The maintainer delegated implementation, testing, DCO commits, independent adversarial review and protected
integration for this scope. That delegation does not extend to choosing a folder, which still needs a
person, nor to standing in for a usability study. Nothing here claims one.
