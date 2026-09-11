# Validation record — issue 80

Every entry was executed for this change on Windows 11 x64. Nothing here claims a verified publisher, an
update channel, another platform, or an installation experience observed on a second machine.

## Automated validations

| Validation | Result |
| --- | --- |
| `constructor-tests`, `capability-matrix-check`, `doctor-json-check`, `sync-check` | `npm run check` at the repository root: 304/304 tests pass, with the constructor and harness checks included. `project-os doctor` reports the three pre-existing technical-profile findings that already exist on `main`; this change activates no profile and does not touch `.project-os/profiles.json`. |
| `critical-document-presence`, `relative-link-check`, `findability-two-hop-check`, `neutrality-check` | `npm run check:docs` passes 27 README links, the prompt contract and 16 spec purposes. `npm run check:neutrality` passes the public tree and the export allowlist. `docs/companion/INSTALLER.md` is linked from the documentation index and from the desktop and environment pages. |
| `openspec-strict` | `openspec validate --all --strict` with the pinned official 1.6.0 CLI. |
| `opsx-check` | Unchanged by this change; the workflow contract is the one verified in #87 and re-run by the repository checks. |
| `second-run-idempotence` | Measured, not assumed: two consecutive builds from the identical tree produced the same 2,535 packaged files with the same sizes, while the installer bytes and SHA-256 differed. The packager embeds non-deterministic data, which is why identity is published as a recorded SHA-256 per build instead of as a reproducible-build claim. See `build-idempotence.json`. |
| Application tests | `npm test` in `apps/companion`: 65/65 pass, including the eight new packaging-contract tests: the allowlist cannot become a whole-tree include, the installation settings are what they claim, the custom installer steps exist, the license page states the data handling and the signing status, the notices match the lockfile, the declared identity is pinned, the build-time binaries stay pinned, and the icon is a real multi-size Windows icon. |
| Dependency risk | `npm run check:audit` reports 0 high or critical findings with 0 exceptions; `npm run check:install-policy` passes; `npm audit` reports 0 vulnerabilities for the core and for the app, development dependencies included. |

`npm run pack` cannot run in CI: it needs Windows, the downloaded Electron runtime and several minutes.
The automated tests therefore cover the packaging contract — the declared contents, the notices derived
from the lockfile, the license and data notice, the settings that decide what an installation owns, and
the identity the installer displays — while the build and the installation are recorded as evidence.

## Artifact and installation evidence

`installation.md` records the full cycle on the maintainer's machine: verification against the produced
installation rather than the configuration, the assisted wizard, per-user installation, launch from the
desktop shortcut, uninstall that removed the program, its shortcuts and the update cache while preserving
the person's project, history and managed runtimes, and reinstall over that preserved state.
`artifact-verification.json` is the verifier's own output for the artifact that was installed.
`artifact-manifest.json` records the identity published with the artifact that was actually installed. The packaged application contents of that artifact, 68,649,055 bytes across 2,535 files, are byte-identical to what the final tree produces, so the installation evidence applies to the code being merged.

Five real defects were found before any publication. This change's own checks caught two: the packager
silently dropped a toolchain resource the application needs at runtime, and the package declared no
author, leaving an empty publisher in Add or remove programs. The independent review caught three more,
all observable on this machine: an orphaned copy of the installer that survived uninstalling while the
license page promised otherwise, an elevation helper shipping inside the artifact, and a recorded commit
that did not contain the packaging. All five are fixed, covered and re-verified.

## Manual evidence

| Evidence | Where |
| --- | --- |
| `adversarial-review` | `independent-review.md`: an independent session that did not implement the change. |
| `issue-link` | https://github.com/IgnacioBarEsp/project-engineering-os/issues/80 |
| `qualitative-review-for-clarity-and-current-ownership` | `docs/companion/INSTALLER.md` is written for the person installing, states what each location holds and who writes it, and is linked within two hops of the documentation index. The universal core keeps its own release contract in the `distribution` capability; this artifact has its own version and cycle. |
| `recorded-drift-decisions` | The toolchain lockfile resource was renamed because packagers strip a file named `package-lock.json`; the application copies it back under its original name so the installed payload is unchanged. The application is packaged without `asar` because it copies part of its own source into a prepared project and executes it with the managed Node, which cannot read an archive. |
| `review-of-declared-degradations` | Windows x64 only. No signature, so SmartScreen warns and the documentation says so instead of offering a way around it. No automatic update channel. CI does not build the artifact. |
| `recovery-rehearsal-for-one-transaction` | Uninstall and reinstall were rehearsed against a project prepared by the installed application, and every path the installer does not own survived. |

## Known limits

The interactive wizard pages were not clicked through by a person in this session; that belongs to the
five-profile journeys in #81. Installer bytes are not reproducible across builds: the packager embeds a
timestamp, so identity is published as a recorded SHA-256 per build. Build-time downloads are
integrity-checked against hashes pinned inside the exact packager version the lockfile pins, and those
identities are recorded in `apps/companion/build/BUILD-TOOLS.md` with a test that fails if the pinned
packager stops requesting exactly those bytes. That is a weaker anchor than the reviewed runtime catalog
the application downloads itself, and it is stated as such.
