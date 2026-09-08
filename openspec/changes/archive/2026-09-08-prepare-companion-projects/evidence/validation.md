# Validation — 2026-09-08

Scope: #77 local preparation engine and checked neutral-constructor adapter. No installer, native UI,
PDF extraction, code graph, agent runtime or token/quality benchmark is claimed by this evidence.

## Automated checks

- PASS DoR, 13 checks after declaring auth-security; #76 closed through protected PR #82.
- PASS `npm run check`: 286 tests, zero failures/skips; package, neutrality, documentation, workflows
  and debt checks. Exact local OpenSpec 1.6.0 strict validation: 11 items before archive.
- PASS 15 engine tests: five profiles, read-only previews, original-byte preservation, honest stage
  readiness, exact reapplication, first-install and update rollback, known exclusions and budgets,
  junction/symlink/hardlink rejection, stale and copied preview data, invalid names/AI choices, plan from
  another engine instance, edited owned files, four interruption points including after receipt write,
  cancellation before writes, concurrent instances, live/malformed lock recovery, custom scan limits,
  source drift during recovery, large journal and forged recovery paths. These use temporary synthetic
  files; the inventory PDF fixture is intentionally not extraction evidence.
- PASS real constructor adapter: read-only plan, bootstrap, read-only verification and rollback, preserving
  original bytes; no Git and existing package.json collisions remain explicit requirements/conflicts.
- PASS installed-tarball fixture: bootstrap, second run, sync, official OPSX, capability matrix and doctor.
  `constructor-fixture.json` retains its results. No consumer profile inherits the upstream UI/security flags.
- PASS dependency audit: zero high/critical findings, zero exceptions. No dependency was added.
- PASS core pack boundary: 169 files, no app source or private office/PDF files. See `core-boundary.json`.
  App source remains outside the npm core package and uses only Node built-ins.

## Independent and observed evidence

The separate review agent exercised a real fixture with 2,600 Unicode-named files: inventory 1,169,403
bytes, update journal 2,489,964 bytes, application/verification/rollback PASS and original project name
restored. It removed only its temporary fixture after validating the absolute cleanup root. This is
scale/recovery evidence, not a time/token benchmark or a study with 2,600 users.

The review also independently confirmed rejection of changed source files on resume, custom scan limits,
malformed journal operations and malformed locks. All reported findings were corrected and revalidated;
see `adversarial-review.md`. The implementing agent observed suite outputs and inspected namespace,
returned readiness, source preservation and the original constructor boundary. The source reports pending
context, workflows and external tools explicitly, including when base files are prepared.

Security approval follows the maintainer's explicit #66 delegation. The threat/privilege decision is
`docs/companion/SECURITY.md`; opaque plan sessions and folder ownership are the current authorization
surface. Cross-process coordination uses exclusive filesystem creation; tests hold one engine instance
while a second tries to apply. This does not claim testing Electron IPC, remote authentication, a native
screen reader or a hostile privileged process. The existing neutrality scan checks its documented secret
patterns; the new source contains no credentials, network client or external command execution beyond
the trusted, injected constructor API.

## Issues corrected and rollback

Initial tests caught preparation metadata invalidating its own inventory fingerprint. Internal metadata
is now excluded from that user-input budget/fingerprint. Review caught source drift on resume, lost scan
limits, inconsistent 2/20 MiB journal limits and malformed-lock raw exceptions. Regressions cover each.

Recovery rehearsals are real engine and constructor operations on temporary folders. The engine restores
only its recorded files and stops on human edits; the constructor retains its own journal and API. A
partial file with an unknown hash remains a visible conflict rather than overwrite authority. No original
user project, global account or machine setting was changed. Revert this PR and its upstream profile
activation to roll back implementation; retain historical evidence and consumer-owned files.

The protocol and documentation are linked from Companion experience. #78–#81 retain context, interface,
installer, prerequisite resolution and full profile journeys. No remaining Blocker/Major belongs to #77.

## CI follow-up before merge

The first PR matrix failed on macOS because its temporary-directory alias passes through a system link.
The fixture now resolves its newly created, owned temporary root before passing it to the strict engine.
Product link rejection and explicit symlink/junction tests remain unchanged. Local engine tests were
rerun after the fixture fix; protected CI must pass on the new commit before merge. Initial failed run:
https://github.com/IgnacioBarEsp/project-engineering-os/actions/runs/34249778003.
