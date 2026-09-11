# Installation evidence — issue 80

One machine, one configuration: Windows 11 IoT Enterprise LTSC 2024, build 10.0.26100, x64, running as
the maintainer's own user without administrator elevation. Nothing here claims compatibility on other
machines, a verified publisher, or an installation experience observed by anyone else.

The artifact under test is the one described in `artifact-manifest.json`:
`ProjectEngineeringOS-Setup-0.1.0-x64.exe`, 129,438,483 bytes,
SHA-256 `c64f09ecefbf0484d329f807c61a3dce9832179cf2a14fbce8a05c427052003b`, built from commit
`fffb33c5f16ecfea6adfed91a4c492773a4f99aa`.

## Artifact verification

`npm run pack:verify` walked the produced package rather than the configuration that describes it:

- 2,535 packaged files, 68,649,055 bytes, every path inside the declared allowlist.
- No symbolic link, no `.docx`, `.pdf`, `.env`, `.npmrc`, source map, test, script or evidence directory.
- No `electron`, `electron-builder`, `playwright`, `app-builder-lib` or `dmg-builder` in the packaged
  dependencies.
- The packaged `create-project-engineering-os` is 0.5.0, matching the pinned dependency, checked both in
  the packaged manifest and in the copied package itself.
- `LICENSE`, `THIRD-PARTY-NOTICES.md`, the runtime notices and the toolchain resources are present.
- The recorded SHA-256 was recomputed from the installer and matches `SHA256SUMS`.
- The signing status was read from the executable with `Get-AuthenticodeSignature`, which returned
  `NotSigned`, agreeing with the manifest. The verifier fails if those disagree.

## What the verifier caught before installation

The first build passed the packager but failed verification: `runtime/toolchain/package-lock.json` was
missing, because electron-builder removes any file with that name. That file is an input the application
copies into the isolated toolchain payload, so an installed app would have failed to prepare engineering
tools. The resource was renamed to `toolchain-lock.json` and is copied back under its original name; the
real `npm ci` path was then exercised by the bundled-npm cache repair test.

The first installation also registered an empty publisher in Add or remove programs, because the package
declared no `author` or `description`. Both were added and the entry now reads
`Project Engineering OS 0.1.0 — Ignacio Barboza Espinoza`. That is metadata, not a verified signature.

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
| Desktop shortcut | Created |
| Start menu shortcut | Created |
| Uninstall entry | Registered under `HKCU`, `/currentuser`, version 0.1.0, publisher set |

Clicking through the wizard pages by hand is left to the five-profile journeys in #81; this evidence does
not claim a person navigated them.

## Launch

Starting the installed executable produced a real window titled `Project Engineering OS` with the
expected main, renderer, GPU and utility processes. The application created its user-data directory and
the managed runtime root, confirming that the environment capability initialises on Windows x64. The
window was then closed cleanly through its own close handler.

## Removal and reinstallation

A real project was prepared using the installed application's own service and engines, not a copy of the
development tree: base `prepared`, context `current`, registered in the installed app's local history. A
sentinel file was placed in the managed runtime directory.

Uninstalling non-interactively produced:

| Path | After uninstall |
| --- | --- |
| Program directory | Removed |
| Desktop shortcut | Removed |
| Start menu shortcut | Removed |
| The prepared project folder and its files | Preserved, byte for byte |
| Local project history | Preserved |
| Managed runtime directory | Preserved |

Reinstalling over that preserved state then showed the history still listing the project and the project
still reporting `prepared` and `current` with its source, read through the reinstalled application.

## Limits

The interactive wizard pages were not clicked through by a person in this session. Silent and interactive
installation share the same install logic, but the wizard's own usability is not evidenced here. No
signing certificate exists, so SmartScreen will warn; that is stated rather than avoided. Compatibility
on any other machine, Windows version or account type is not demonstrated.
