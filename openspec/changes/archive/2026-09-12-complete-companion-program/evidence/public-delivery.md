# Public delivery — release and landing

The maintainer authorised publishing the release, deploying the landing and installing the build. All three
were done, in an order chosen so the published identity can be checked rather than trusted.

## Why publication waited for the merge

The artifact manifest records the commit it was built from, and that claim only means something if someone
can check out that commit and get this application. The repository squash-merges, so a manifest naming a
branch commit would name something unreachable from `main` once the branch was deleted.

So the change was merged first, the artifact **rebuilt from the merge commit**, verified again, and only
then published. The cost was one extra build; what it avoids is a release whose stated identity cannot be
followed.

Along the way the build guard from #80 fired for real: a first build refused to write a manifest because an
uncommitted edit to the landing meant the recorded commit did not describe the artifact. That refusal is
exactly what the check exists for.

## The published artifact, re-verified from the network

Downloaded from the public release with `gh release download` and hashed again on this machine — not
compared against the local build, but re-derived from the bytes GitHub served:

| | |
| --- | --- |
| Asset | `ProjectEngineeringOS-Setup-0.1.0-x64.exe` |
| Bytes served | 133 229 171, matching the manifest |
| SHA-256 of the download | `7ee11c66c1a0f8b2e3f0faca00da333f094814eb161e645adbcd823463a4b51a` |
| `SHA256SUMS` in the release | identical |
| `artifact-manifest.json` | identical |
| Commit | `4b863af12df351b402dc4fda3683de1f3a445da2`, reachable from `main` |
| Signature observed on the download | `NotSigned` |
| Signature the manifest declares | `signed: false` |

The last two lines matter as much as the hash: the release does not claim a signature it lacks. The notes
say plainly that Windows will warn, that the warning is correct, and they describe no way around it.

## The landing, live

Deployed by the `Landing` workflow to `https://ignaciobaresp.github.io/project-engineering-os/`. The first
run failed — the workflow token could not create the Pages site — so Pages was enabled for the repository
with the Actions source and the deployment re-run. Failing there rather than half-publishing is the correct
outcome of a token with least privilege.

The served page answers `200` at **13 728 bytes and is byte-identical to `site/index.html`** in the commit
that deployed it. It carries the corrected measurement, including the row where the baseline ties.

**A drift this created, and fixed.** The page said "todavía no hay ningún release publicado" — true when it
was written, false the moment the release went out. Publishing made the page dishonest by an hour. It now
names `companion-v0.1.0`, states that the artifact is unsigned, and tells the reader to check the file
against `SHA256SUMS` before installing.

## What this does not demonstrate

That the installer works on another machine, that SmartScreen behaves the same for every reader, or that
anyone other than the maintainer has installed it. The pages of the installer's own wizard were not walked:
the artifact was installed silently, and its prompts need a person for the same reason the folder picker
does.
