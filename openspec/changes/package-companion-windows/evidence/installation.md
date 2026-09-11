# Installation evidence — issue 80

One machine, one configuration: Windows 11 IoT Enterprise LTSC 2024, build 10.0.26100, x64, running as
the maintainer's own user without administrator elevation. Nothing here claims compatibility on other
machines, a verified publisher, or an installation experience observed by anyone else.

The artifact under test is the one described in `artifact-manifest.json`:
`ProjectEngineeringOS-Setup-0.1.0-x64.exe`, 129,389,671 bytes,
SHA-256 `4012ee646629971df5ffacd196db274dae1e19dd1ecfa224ae4553334dae6b2f`, built from commit
`5d175fcbfac9870725fb08feb85aa8a75b536607` with a clean working tree. A build from a tree with uncommitted
changes is refused, because a recorded commit that does not describe the artifact is not an identity.

## Artifact verification

`npm run pack:verify` walked the produced installation rather than the configuration that describes it,
and covered the complete tree — the Electron runtime included, which is most of the installed bytes:

- 2,535 application files (68,646,604 bytes) inside 2,606 installed files (453,034,952 bytes).
- Every application path inside the declared allowlist, matched by exact name or directory prefix.
- No symbolic link, no entry that is not a regular file, and no document, credential, source map or
  repository anywhere in the tree, dependencies included.
- No `electron`, `electron-builder`, `playwright`, `app-builder-lib`, `dmg-builder` or `js-yaml` among
  the packaged dependencies, and no elevation helper.
- 151 installed dependencies, each one named in the third-party notices, and the count matching
  what the manifest declares. The Electron and Chromium notices are required to be present.
- The packaged core is 0.5.0, matching the pin, checked in the packaged manifest, in the copied package
  and against the manifest's own claim.
- The recorded SHA-256 was recomputed from the installer and matches `SHA256SUMS`.
- The signing status was read from the executable with `Get-AuthenticodeSignature`, which returned
  `NotSigned`, agreeing with the manifest. The verifier fails if those disagree, and reports a
  partial verdict rather than `PASS` when it cannot read a signature at all.

## What this change's own checks caught before publication

The first build passed the packager and failed verification: `runtime/toolchain/package-lock.json` was
missing, because electron-builder removes any file with that name. That file is an input the application
copies into the isolated toolchain payload, so an installed app would have failed to prepare engineering
tools. The resource was renamed and is copied back under its original name; the real `npm ci` path was
then exercised by the bundled-npm cache repair test.

The first installation registered an empty publisher in Add or remove programs, because the package
declared no `author` or `description`. The entry now reads
`Project Engineering OS 0.1.0 — Ignacio Barboza Espinoza`. That is metadata, not a verified signature.

The independent adversarial review then found three more problems on this same machine, recorded in
`independent-review.md`: an orphaned 129 MB copy of the installer that survived uninstalling while the
license page promised otherwise, an elevation helper shipping inside the artifact, and a manifest whose
recorded commit did not contain the packaging. All three are fixed and re-verified below.

## Installation

The installer was started without arguments: it opened a window titled `Project Engineering OS Setup` and
waited for input instead of installing, confirming an assisted wizard rather than a one-click install.
The compiled NSIS script inserts `MUI_PAGE_LICENSE` pointing at `build/license.txt`, which carries the
MIT text, the data notice and the signing statement. That wizard run was cancelled and left the existing
installation untouched.

Installation itself was then performed non-interactively, which uses the same file placement, shortcut
and registration code paths:

| Result | Observed |
| --- | --- |
| Program directory | `%LOCALAPPDATA%\Programs\Project Engineering OS`, per user, no elevation requested |
| Desktop and Start menu shortcuts | Created |
| Uninstall entry | `HKCU`, `/currentuser`, version 0.1.0, publisher `Ignacio Barboza Espinoza` |
| Elevation helper | Absent from the installed tree |

Clicking through the wizard pages by hand is left to the five-profile journeys in #81; this evidence does
not claim a person navigated them.

## Launch

Starting the application from its **desktop shortcut** produced four processes and a responsive main
window, then closed cleanly through its own close handler. An earlier launch of the installed executable
also created the application's user-data directory and the managed runtime root, confirming that the
environment capability initialises on Windows x64.

## Removal and reinstallation

A real project was prepared using the installed application's own service and engines, not a copy of the
development tree: base `prepared`, context `current`, registered in the installed app's local history. A
sentinel file was placed in the managed runtime directory.

Uninstalling non-interactively produced:

| Path | After uninstall |
| --- | --- |
| Program directory | Removed |
| Desktop and Start menu shortcuts | Removed |
| Update cache copy of the installer, and its folder | Removed |
| The prepared project folder and its files | Preserved, byte for byte |
| Local project history | Preserved |
| Managed runtime directory | Preserved |

Reinstalling over that preserved state then showed the history still listing the project and the project
still reporting `prepared` and `current`, read through the reinstalled application.

## Limits

The interactive wizard pages were not clicked through by a person in this session. Silent and interactive
installation share the same install logic, but the wizard's own usability is not evidenced here. No
signing certificate exists, so SmartScreen will warn; that is stated rather than avoided. Compatibility
on any other machine, Windows version or account type is not demonstrated.
