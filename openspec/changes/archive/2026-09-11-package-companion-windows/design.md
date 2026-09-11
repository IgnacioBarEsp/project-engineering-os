## Context

The application verified in #87 can only be started from a repository checkout. The maintainer asked for
an artifact a person can download and install on Windows without preparing Node or opening a terminal.
This change packages what already exists; it does not add product behaviour.

## Goals / Non-Goals

Goals: one verifiable Windows x64 artifact; a conventional per-user installation with destination,
license and data notice and a shortcut; published identity, checksum, licenses and honest signing status;
an uninstall that removes only what the installer wrote.

Non-Goals: a purchased signing certificate, an automatic update channel, other platforms, a store
listing, or any claim about installation experience, reputation or performance that was not observed.
Five-profile installer journeys, the landing page and benchmarks are #81.

## Decisions

### What produces the artifact

The application is Electron, so the artifact is the packaged Electron app plus a Windows installer. The
packaging dependency is pinned exactly, stays a development dependency of the private app, and never
enters the universal core. The packager downloads three more binaries at build time that the lockfile does
not cover. Each comes from a fixed origin and is verified against a SHA-256 hardcoded inside the exact
packager version the lockfile pins, so the integrity chain is rooted in the lockfile. Their identities are
recorded next to the build configuration, and a test compares those recorded values against what the
pinned packager actually requests: a packager update that changes a binary fails the test instead of
downloading different bytes silently. None of them reach the published artifact. This is a weaker anchor
than the reviewed runtime catalog the application downloads itself, and the difference is stated rather
than blurred.

### What may be inside

Packaging uses an allowlist, not an exclusion list: the app's own source, its runtime dependencies, its
notices and licenses, and nothing else. Development dependencies, tests, evidence, the repository's own
documents and anything outside the app package are excluded by construction. Verification reads the
produced artifact and fails on an unexpected entry, a missing license, a development dependency or a core
version that is not the pinned one. A file the maintainer happens to have in the working tree cannot
reach a public artifact.

### What the installer may touch

Installation is per-user and needs no administrator: it writes the program directory it offered, a
shortcut and its own uninstall entry. It writes nothing into a project folder. Uninstall removes those
same paths and nothing else, which takes two additions the packager does not make on its own.

The packager copies the installer into a per-user cache so a later version can build a differential
update. This application publishes no updates, so nothing ever reads that copy and it is exactly as large
as the installer. Leaving it behind would make the license page false, so an uninstall step removes it —
except during an update, where that copy belongs to the installer that is arriving.

The uninstaller deletes the installation directory recursively. That is right for a directory this
installer created and destructive for one the person already uses. A chosen destination normally gains a
product subdirectory, except when the path already contains the product name; that is the only case where
an installation and the person's files would share a folder, and the wizard refuses such a destination
unless it is empty or already holds this application.

The local project history and the managed runtimes live outside the program directory precisely so that
reinstalling or removing the application does not destroy prepared work; removing them is a separate,
explicit action the person takes.

### What is claimed

Without a certificate the artifact is unsigned, and Windows will warn. The published identity says so.
No instruction tells a person to disable a protection, and no wording implies a verified publisher.
Installation evidence comes from a real installation on the maintainer's machine, described as what it is:
one machine, one configuration.

## Risks / Trade-offs

- Unreviewed bytes in a public artifact → allowlist plus verification of the produced file.
- Data loss on uninstall → the installer owns only its own paths, and that is verified by installing,
  preparing a project, uninstalling and checking that the project, the history and the runtimes remain.
- A build-time download that nobody reviewed → pin and verify it, or do not depend on it.
- Claiming an experience that was not observed → evidence names the machine and configuration.

## Migration Plan

The application keeps its own version, separate from the core package. A previous installation is
replaced in place; the person's data is never migrated by the installer because it never owns it.

## Validation and Open Questions

Install, launch, prepare a project, uninstall and reinstall on the maintainer's Windows machine. Verify
the artifact contents, the checksum and the licenses. Confirm that the uninstall left project folders,
history and runtimes intact. Independent adversarial review, captured debt, official archive and
protected CI precede merge.
