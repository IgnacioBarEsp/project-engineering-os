## Decision and scope

Approved under the maintainer's #66 delegation on 2026-09-09. The core adds explicit support for a local
engineering dependency location; the app remains responsible for preparing it. Use
`.project-constructor/config.json` optional `toolchainRoot`, for example `.project-os/toolchain`.
When absent, resolve from the project root exactly as before. Do not change product seeds or relocate
existing installations implicitly. Configuration and its selected toolchain belong to the consumer.
The maintainer's existing publication delegation also covers the compatible 0.5.0 release, enriched in
issue #89 and rechecked through DoR before changing release identity. Publish through the protected
canonical-artifact pipeline only after integration; verify registry/GitHub bytes and signed provenance.

## One resolution contract

Place the shared, dependency-free resolver in the blueprint's constructor-owned wrapper directory and
import that same source from upstream diagnostics. The installed wrapper imports its sibling. This
avoids divergent parsing/path logic and does not depend on the product having installed the core package.
Configuration reads are bounded to 64 KiB. A declared toolchainRoot must be a normalized relative path,
not empty/dot/absolute/traversal or reserved metadata location. Reject symbolic links in the configured
path and paths outside the project. Missing selected directories are a diagnostic, never a global fallback.
Other package metadata reads are bounded to 16 MiB per regular JSON file. These checks validate declared
identity and local paths; they are not artifact-integrity verification or a filesystem lock against concurrent
same-user changes. Canonicalize the project root so explicit project aliases and macOS `/var` remain valid.

Check OpenSpec's exact declared, locked and installed identity plus the expected package-local CLI entry.
The wrapper resolves the entry inside that selected package and uses its own Node process executable.
The app can provide a reviewed portable Node to start it; this change does not install Node or mutate PATH.
Resolve the expected package entry directly, independent of npm-created `.bin` shims; do not follow
package links outside the selected local tree. Read-only checks validate metadata and paths without
executing the selected CLI or project package scripts.

Doctor uses the selected manifest/lock/install for engineering package checks, while retaining the actual
root package for classifying this upstream repository. A failing resolver produces explicit failing
engineering checks with a remedy; it does not hide unrelated diagnostic results. OPSX and wrapper agree
on the same selected location and pinned version. Existing contracts keep OpenSpec-owned generation and
the constructor wrapper command; configuration changes do not rewrite official workflows or approvals.

## Compatibility and recovery

Existing config files omit the new optional property. The traditional root installation and wrapper
remain supported. Non-default locations require explicit setup; the constructor does not manufacture
installation success by changing manifests. A user may restore a previous configured location after
validating its pinned packages. No automatic deletion, relocation, package install, global fallback or
replacement of product dependencies occurs. Reverting the PR preserves directories and consumer files.
Follow the existing library-cli compatibility, license and release policy; MIT, no new dependency.

## Evidence

Test default and isolated layouts, exact wrapper execution, wrong versions, missing entries, malformed or
oversized config, unsafe paths and links, read-only snapshots, preserved product manifests, and switching
back. Run actual pinned OpenSpec generation and OPSX adaptation in a temporary consumer with isolated
dependencies. Maintain full core/fixture/multi-platform checks, independent adversarial review, captured
debt and official archive before protected merge. App installation and native UI remain #87/#80/#81.
