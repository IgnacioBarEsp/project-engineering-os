# Independent adversarial review — issue 80

Scope: change `package-companion-windows` under program 66, on `codex/companion-installer` over `main`
at `fffb33c`. There was no pull request when the review ran, so the surface was `git diff main` plus every
untracked file. The reviewer ran in a separate session that did not implement the change, followed a
borrowed local adversarial-review playbook, worked read-only, and checked claims against the packager's
own templates and against the state left on disk by the installation evidence.

## Verdict

First pass: **FAIL** — three blockers and seven majors. Two blockers were observable on the same machine
that produced the evidence, which is the part worth stating plainly: the verification did not cover what
it claimed to cover. After the corrections below, and a rebuild, reinstall and re-verification from a
clean tree, every blocker and major is resolved. No finding was closed by weakening a check or a claim.

## Blockers

| Finding | Correction |
| --- | --- |
| The packager copies the whole installer into `%LOCALAPPDATA%\<cache>\installer.exe` and the uninstaller never removes it. On disk it was 129,438,483 bytes — exactly the artifact size — surviving an uninstall cycle that the evidence described as clean. The license page shown during installation said the opposite. | An uninstall step removes that copy and its folder, skipped during an update because the copy then belongs to the arriving installer. Verified on disk: after uninstalling, the cache folder is gone, and the project, history and managed runtimes still survive. |
| `elevate.exe` from the packager's NSIS bundle shipped inside the artifact although elevation is disabled, and the build-tools record asserted that no downloaded binary reaches the artifact — with a test pinning that false sentence. | The elevation helper is no longer packaged. The record is now true and the verifier refuses the file by name anywhere in the installed tree. |
| The manifest recorded `git rev-parse HEAD` without checking the working tree, so the published identity named a commit that did not contain the packaging at all. Checking out that commit produced a different application. | Building refuses a dirty tree unless an explicit environment variable marks the build as unpublishable, the manifest records `tree`, and the verifier requires `clean`. The published identity was regenerated from a committed tree. |

## Majors

| Finding | Correction |
| --- | --- |
| The verifier walked only `resources/app`, so roughly half the installed bytes were never inspected, and it exempted `node_modules/` from every forbidden-content rule. | It walks the complete installed tree, applies the forbidden-content rules to dependencies as well, requires the Electron and Chromium notices to be present, and reports an unexpected path outside the application package. |
| The packaging tests parsed YAML with regular expressions and stayed green with a pattern that would have packaged the entire working tree. | The configuration is parsed as YAML, any pattern that recurses from the package root is refused, and every include must name one of the declared files or directories. |
| The uninstaller removes the installation directory recursively, and the destination is chosen by the person; a path that already contains the product name gains no subdirectory. | The wizard refuses such a destination unless it is empty or already holds this application. |
| `npm run pack` and `npm run pack:verify` had different default directories, so verification could pass against an older build while a newer artifact was published. | Verification has no default directory: it requires the path the build printed. |
| The notices omitted the Electron runtime — most of the installed bytes and a development dependency — listed optional binaries for other platforms, invented package names for nested dependencies, and the declared package count was wrong. | Names come from the last path segment, optional dependencies for other platforms are excluded, the runtime has its own section naming the notices that ship beside the executable, and the verifier compares the notices and the count against the dependencies actually present in the artifact. |
| The build-tools record attributed MIT to NSIS and 7-Zip because the repository that hosts them is MIT, omitted sizes, and its test only checked that a constant appeared somewhere in the packager's source. | The record states the real licenses, includes sizes, and the test binds each checksum to the call that requests that file while asserting no alternative binary set is selected. |
| The spec scenario about installing and launching was evidenced with a non-interactive install and a direct executable launch. | The application was launched from the desktop shortcut and observed with a responsive window; the interactive wizard was confirmed to open and wait for input, and what a person still has to click through is named as belonging to #81. |

## Minors resolved

`'C:\Windows'` was `"C:Windows"` in JavaScript, so the signature probe would have failed with a
misleading message without `SystemRoot`. The allowlist matched by string prefix, so `LICENSE.exe` or
`runtime-extra/` would have passed; it now matches exact names and directory prefixes. Outside Windows
the verifier reported `PASS` while never reading the signature; it now reports a partial verdict. The
generated icon had no verification at all; a test now checks the icon header, its sizes and each embedded
image.

## What resisted the attack

The reviewer confirmed the toolchain lockfile rename is correct and necessary — the payload is
byte-identical because the file is copied back under its original name, the pinned tree digest still
matches, and the old name would have been stripped from the artifact by the packager, breaking tool
preparation in the installed app. No injection was found in the packaging script. Data preservation on
the default installation path was confirmed on disk. Every statement about the signing status was found
honest, with nothing anywhere suggesting a verified publisher or a way around SmartScreen.

## Recorded debt

Installer bytes are not reproducible across builds, CI does not build or install the artifact, and the
application ships without `asar`. Each has a compensating control and is recorded in
`debt-assessment.json` as an optional improvement rather than a deferred obligation.
