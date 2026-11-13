## Context

The public source tree contains an upstream skill tree, four repository-specific agents and an active `.github/hooks/impeccable.json` command hook. The hook dispatches to a vendored launcher that fetches and executes an upstream binary on first use. `.impeccable/design.json` is the only tracked file in that generated-state directory. The npm archive does not include these paths, but the allowlisted public-tree export does.

The core npm license gate currently checks the lockfile for missing or disallowed licenses but does not prove that production packages have matching notice rows. Companion already renders notices from its lockfile; the root `check:package` does not verify that committed notice against the same inventory. One Companion package record (`qrcode-terminal@0.12.0`) lacks the SPDX value present in its own package metadata, leaving a placeholder instead of a license in the generated notice.

## Goals / Non-Goals

**Goals:** remove the vendor while preserving historical records; block any project-local hook unless it is deliberately added to an empty, code-reviewed allowlist; ensure the core and Companion package notices cannot silently drift from production lock metadata; make local plugin state ignored and non-exported.

**Non-Goals:** assess the upstream plugin's quality, prohibit collaborators from installing it in their agent profile, alter `PRODUCT.md`, change Companion behavior, or rewrite already published releases.

## Decisions

1. **Use an empty closed hook allowlist.** `check:neutrality` will recursively inspect `.github/hooks` and reject every file and symlink. A future hook must require an explicit source-code policy change and focused test; checking only for strings such as `curl` would miss alternate interpreters or indirect execution. The whole hook surface is denied for now because no project-owned hook is required.
2. **Keep `.github` in the public export.** It contains workflows, templates, CODEOWNERS and other first-party governance material. Remove only the Impeccable files; remove `.impeccable` from exported directories and place it in ignored directories so local plugin-generated state stays private.
3. **Check both redistributable package inventories in `check:package`.** For the core npm surface, every production package in the lockfile must have a notice row matching package name, version and license. For Companion, generate the expected notice from its production lock inventory and compare it byte-for-byte with the committed notice. Missing license metadata fails closed. The app lock's `qrcode-terminal` record will carry the SPDX identifier from its upstream package metadata (`Apache-2.0`). Existing Electron and portable-tool notices remain part of the Companion notice template.
4. **Document upstream plugin installation, not repository bootstrap.** Contributor guidance will link to the upstream installation instructions and direct users to their agent's plugin mechanism. It will warn against adding the plugin's project-level files or hook back to this repository.
5. **Preserve historical evidence.** Archived OpenSpec changes, release notes and debt assessments remain untouched; the deletion is represented by Git history, not by rewriting prior records.

Alternatives rejected: removing all of `.github` would break unrelated governance and CI; scanning hook contents for known download commands would be bypassable; duplicating Companion's generated package table by hand would become stale; editing historical documents would obscure provenance.

## Risks / Trade-offs

- [Contributors lose the repo-shipped automatic hook and agent wrappers] → Document the supported external plugin path and keep local generated state out of exports.
- [The empty hook policy blocks even a harmless future hook] → This is intentional; future hooks need an explicit reviewed allowlist change and tests.
- [Lockfile metadata can omit a license or use non-SPDX text] → Fail package validation and require the lock record to be corrected from authoritative upstream metadata before redistribution.
- [Plugin installation interfaces may change] → Link directly to the upstream installation page instead of copying its full command matrix.

## Migration Plan

1. Remove the vendor, wrappers, active hook and obsolete design sidecar; update export and ignore policy.
2. Add the hook-policy test and package-notice comparisons; record the missing Companion SPDX value and regenerate its notice.
3. Document external plugin installation and verify both positive controls (no project hooks; current notice inventories) and negative controls (a hook or unnoted package fails).
4. Run the full project checks, review the deletion and notice diff, assess debt, archive this change with the fixed local OpenSpec CLI, and merge only through protected PR checks.

Rollback: revert the protected PR. Git retains the exact removed source; no published artifact or tag is modified.

## Open Questions

None. The issue explicitly approves removal and an empty repository-owned hook surface.
