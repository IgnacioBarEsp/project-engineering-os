## Why

Issue [#106](https://github.com/IgnacioBarEsp/project-engineering-os/issues/106).

Claude and OpenCode are on the maintainer's must-have list. Both are installed on the machine this was
measured on, both are signed, and until now **neither was even recognised**: a person using either of them fell
into the export path without the application saying why.

The issue asks for one verified answer per application — there is an opening contract and this is it, or there
is not and here is why — and says plainly that **both answers are valid results**. Its decision criterion is
the one this repository already applied to Antigravity: inventing a command-line argument because it
"probably works" is what this project decided not to do.

So the work was research first, and the two answers came out different.

## What Changes

- **Claude is recognised and can be opened**, because its installed build declares how. Not from
  documentation, not from a guess: the build itself contains the route `claude://code/new?folder=<encoded
  path>`, constructed by its own code from a path it first confirms is a directory, and the system has that
  scheme registered to that same signed executable. Both are observations of the installation.
- **Opening Claude requires six things at once**, re-checked between the review and the launch: a regular file
  with no links, a valid signature, the publisher `Anthropic, PBC`, identical bytes, the scheme registered to
  that executable, and the route declared by that build. Any one missing refuses the opening and says which.
- **OpenCode is recognised and never opened.** It is signed by `Anomaly Innovations, Inc`, it registers
  `opencode://`, and it forwards deep links to its renderer — but it declares no route that takes a folder.
  It joins Antigravity in the set of applications this product will not launch, with its own reason on screen,
  and the reviewed export stays the correct answer for it.
- The launch harness covers both, so the two conclusions are reproducible rather than remembered.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `companion-experience`: what an application has to declare before this one hands it a folder, and that a
  declaration may be a protocol route rather than a help line.

## Impact

`apps/companion/desktop/local-apps.mjs`, its tests, `apps/companion/scripts/verify-local-launches.mjs`, the
sentence the handover dialog shows for an application it will not open — which needed the publisher to travel
with the refusal — and `docs/companion/SECURITY.md` and `docs/companion/ENVIRONMENT.md`. No change to the
published core 0.5.0, the required CI gate `CI / required`, branch protection, the installer's file list or the
content security policy.

Risk: that a route gets invented because it looks plausible. Mitigated by requiring the route to be present in
the installed build's own resources and the scheme to be registered to that same verified executable — two
observations, not one assumption — and by a test that removes each one and asserts the refusal.

Second risk: that reading a declaration out of a 36 MiB bundle becomes a way to hang the interface. Mitigated
by reading in bounded chunks and stopping at the first match — **11 ms** measured — and bounded by size, by a
deadline, and by failing closed on anything it cannot read.

Third risk: that opening gets read as "the AI read my project". The existing sentence that refuses that claim
stays, and this change adds no claim of its own.

Rollback reverts the pull request: both applications go back to not being recognised, and the export path is
the answer for both again. Nothing on the machine is modified either way.

The maintainer delegated implementation, testing, DCO commits, independent adversarial review and protected
integration for this scope. That delegation does not extend to looking at a screen: whether Claude's window
actually opens that folder is recorded as unverified with its cause, because confirming it needs a person.
