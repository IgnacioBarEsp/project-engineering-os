## Context

`companion-v0.1.0` was published from `4b863af12df351b402dc4fda3683de1f3a445da2`. The private
Companion package still declares 0.1.0, while #97–#107 are integrated through `0c632a3` and public
guidance #116 through main `5039992`. The app's packer already refuses a dirty tree, emits
`artifact-manifest.json` and `SHA256SUMS`, and the artifact verifier checks its unpacked contents,
checksum, pinned core, licenses and real unsigned status on Windows.

The maintainer approved this delivery scope on 2026-09-15. DoR #117 passed 13/13 before this change was
created.

## Goals / Non-Goals

**Goals:** publish a traceable 0.2.0 Windows x64 Companion release from reviewed source; make the
release's exact evidence inspectable; preserve 0.1.0 and user-owned data; leave the public docs pointing
only to a release whose bytes were checked.

**Non-Goals:** publish the core npm package, purchase/sign with a certificate, create automatic updates,
support another OS, change app behavior, deploy the landing, delete project folders or use personal data.

## Decisions

1. **Version boundary.** 0.2.0 is a minor version of the private app because it aggregates visible,
   compatible capabilities added after 0.1.0. `create-project-engineering-os` stays pinned at 0.5.0 and
   is neither changed nor published. `companion-v0.1.0` is never retagged or given replacement assets.
2. **Three SDD steps.** This change delivers the source/version and a manually dispatched release
   workflow, but does not publish. A second approved change tags clean main and dispatches that workflow,
   so the artifact is not built from a private dirty checkout or an unmerged branch. A final protected
   documentation reconciliation follows publication because a pre-merge source document cannot truthfully
   claim assets that do not yet exist. All remain traceable to #117; the issue closes only after the
   public state is reconciled.
3. **Artifact identity.** Build in an exact, empty output directory outside the repository from the clean
   tagged checkout. Run `pack:verify` against that precise directory. Publish exactly the installer,
   `artifact-manifest.json` and `SHA256SUMS` it emits. Download them into a fresh canonical directory and
   compare filename, size, manifest fields and SHA-256. A second build is not asserted byte-reproducible:
   electron-builder timestamps installers, so identity is recorded per build.
4. **Native evidence.** The package checks, app QA and renderer journeys are automated. The installer has
   a per-user uninstall registry identity shared with an existing Companion, so it MUST NOT be executed
   on a maintainer workstation merely by redirecting folders. The release workflow runs on a disposable
   GitHub Windows runner. There it uses a test-only install directory, `APPDATA`, `LOCALAPPDATA` and
   project fixture beneath one verified temporary root, installs public 0.1.0, updates to the candidate
   and uninstalls. It records silent automation and does not claim a person read or clicked the wizard.
5. **Unsigned remains a limit.** The build sets signing discovery off and verifier reads the resulting
   executable status. `NotSigned` is expected and the release notes/instructions retain the SmartScreen
   warning without evasion advice.
6. **Recovery.** A discovered artifact/documentation defect does not mutate an existing tag or asset.
   Mark it superseded where appropriate, restore documentation to the last verified release and issue a
   new patch only after its own gates.

## Risks / Trade-offs

- [Unmerged source treated as release] → tag only the post-merge clean main commit.
- [Build output mixed with a prior run] → caller provides a new exact output directory and verifier has no
  default output.
- [Test modifies real data] → use a disposable runner; resolve and assert every filesystem test path
  beneath one new temporary root before a destructive installer action.
- [Silent run overclaims UX] → record it as automation; preserve human-only wizard observations as not
  measured.
- [Release upload differs from verified file] → fresh download and canonical comparison after publication.
- [Core release accidentally coupled] → tests and release notes assert core remains 0.5.0/no npm publish.

## Migration Plan

Merge this source-preparation PR through protected CI. A later #117 publication change creates an
annotated `companion-v0.2.0` tag on its main commit and dispatches the reviewed workflow; a final one
reconciles public docs. Existing 0.1.0 users are not migrated by the installer; standard per-user update
preserves app data by design. Rollback does not delete or rewrite public bytes: reverse the docs
recommendation and publish a new fixed version if the artifact itself is defective.

## Open Questions

The interactive wizard requires a human-visible test to say it was read or clicked. This delivery will not
invent one; automated silent evidence and installed-resource checks are sufficient for the claims they
actually observe.
