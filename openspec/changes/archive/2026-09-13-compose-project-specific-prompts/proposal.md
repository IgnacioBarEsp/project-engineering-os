## Why

Issue [#99](https://github.com/IgnacioBarEsp/project-engineering-os/issues/99).

The maintainer said it plainly: *«el prompt que te da al final para dárselo a la IA es muy simple, vago y sin
profundidad, no le pide a la IA que instale las herramientas necesarias según tu tipo de proyecto»*. Today it
is one template with the project's name and goal in it, identical for the five profiles, while the application
already knows the profile, the experience level, the AI that was chosen, what stages are pending and what kinds
of file are in the folder.

The interesting half of this issue is not the composition. It is that making the prompt deeper is tempting to
solve by sending the person's material somewhere, and this product's whole promise is that the documents stay
on this machine. So the rule the issue sets is the design: **no route sends file content to any model**, and
when more depth is genuinely needed, the companion does not read the files — it writes a prompt for the AI the
person **already uses**, which already has access to those files and is more capable than any small model, and
asks them to paste the summary back.

There is a second thing worth stating before starting. The criterion says "solo respuestas del asistente e
inventario de tipos y conteos". The inventory this application keeps carries **the path of every file**, and a
path is the person's data: `contrato-despido-2024.pdf` says more than `.pdf` does. What may leave is an
aggregate — extension, count and kind, plus totals — never the list of paths, and the test the issue asks for
has to fail on a path as well as on content.

## What Changes

- **A prompt engine** that composes from the profile, the experience level, the goal, the chosen AI, the
  pending stages and an **aggregated** inventory. Pure and testable, with no I/O: the same inputs give the
  same text. It replaces the single template that every handover used. The per-recipe texts issue 98
  composes for a specific task are a different thing and stay as they are; an independent review caught an
  earlier draft of this sentence claiming both, so it says what changed.
- **Four levels behind one OpenAI-compatible client**, in the main process, because the renderer cannot reach
  the network and must not start:
  - **0 · Templates.** Always. The application is complete without any model, and the level-0 prompt is kept
    as evidence for the five profiles so "complete" can be read rather than claimed.
  - **1 · A model on this machine.** An OpenAI-compatible server on the loopback interface, detected rather
    than assumed.
  - **2 · A free provider.** Off out of the box, turned on by a person who has been told what it receives.
  - **3 · The person's own key.** Their key, their provider, nothing of ours.
- **The floor is the template, and the rules are not the model's.** What comes back is validated against a
  floor that asks for coverage and not only length, and discarded when it fails. Whatever survives, this
  application's own rules are appended after it with a line saying which half came from where — the text is
  about to be pasted into an AI that can open the person's folder, so a model's output is untrusted input.
- **Every request is bounded** — an explicit destination allowlist, a timeout, a maximum response size, no
  redirects, no credentials in a URL — and a payload guard refuses to send anything containing a file path or
  file content. A provider that is down, slow or answering nonsense degrades to the level below and says so.
- **"Que tu IA investigue tu carpeta"**: a prompt the person hands to the AI they already use, which reads
  their folder and returns a summary they paste back into the wizard, deepening the composition without this
  application reading anything.
- **The screen says what each level sends and what it does not**, before it is used, and refusing leaves the
  application whole.

## Capabilities

### New Capabilities
- `companion-prompt-composition`: what the prompt is composed from, what may and may not leave this machine,
  and how a level degrades.

### Modified Capabilities
None. The handover screen changes, but what `companion-experience` requires of it does not: the new
obligations — what may leave, what a model may replace, what the screen has to say first — are all in the new
capability.

## Impact

`apps/companion/context/prompts.mjs` (new), `apps/companion/runtime/inference.mjs` (new),
`apps/companion/desktop/service.mjs`, `apps/companion/ui/`, the shared probes, the tests, and
`docs/companion/EXPERIENCE.md` and `docs/companion/SECURITY.md`. No change to the published core 0.5.0, the
required CI gate `CI / required`, branch protection, the installer's file list, or the renderer's content
security policy — which is what keeps the interface off the network and is not relaxed here.

Risk: that a file path or a fragment of a document reaches a provider. Mitigated by composing the outbound
payload from an allowlisted shape rather than by stripping a general one, by a guard that refuses to send a
payload containing a path or a document line, and by a test that intercepts the request and fails on either.

Second risk: that a maintainer key ends up inside the application. It cannot: the installer packages with
`asar: false`, so the code is plain text, and this change ships no key. Level 2 uses a key the person pastes;
the hosted alternative is issue #107.

Third risk: that a small model writes a worse prompt than the template. Mitigated by making the template the
floor, by validating and comparing what comes back, and by recording both texts.

Fourth risk: that a slow provider blocks the preparation. Mitigated by a timeout and a size cap on every call,
measured rather than asserted.

Rollback reverts the pull request: the prompt returns to the single template, the client disappears with the
change, and no configuration is left to read.

The maintainer delegated implementation, testing, DCO commits, independent adversarial review and protected
integration for this scope. That delegation does not extend to accepting a third-party provider's terms on
their behalf: level 2 ships off, and turning it on is theirs.
