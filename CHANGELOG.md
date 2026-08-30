# Changelog

All notable changes follow [Semantic Versioning](https://semver.org/).

## Unreleased

### Spec Purpose gate reaches every repository

- Publish the spec Purpose inspection as `src/spec-purpose.mjs`. It previously lived under `scripts/`, which
  `files` does not distribute, so the gate protected only this repository.
- Wire it into the read-only `opsx-check`, the command a bootstrapped repository already runs on every
  `project-os:check`. A published capability that keeps the text `openspec archive` seeds under
  `## Purpose`, leaves it empty or omits the section now fails, and the recovery names the spec file and
  what to write in it.
- Keep the upstream documentation gate and `opsx-check` on the same module, so a consumer never receives a
  divergent copy of the rule.
- Report `SKIP` while a repository has published no capability, and fail closed when the specs tree exists
  and cannot be read. A `SKIP` is not a `PASS`.
- Export `inspectSpecPurposes`, `classifySpecPurpose`, `specPurposePath`, `specPurposeRecovery`,
  `SPEC_PURPOSE_FAILURE_KINDS` and `SPECS_ROOT` from the package entry point.

**Migration.** A repository whose published specs already carry the seeded text will see a new failure after
the upgrade. It is pre-existing debt made observable, not a false positive. Redact the Purpose of every
capability the command names; there is no state migration and no configuration change, and the command stays
read-only. See [docs/SPEC_PURPOSE.md](docs/SPEC_PURPOSE.md).

### Curated tool catalogue

- Add `schema/tool-catalog.schema.json` and the seeded `.project-os/tool-catalog.json` registry, turning the
  tool catalogue and the safe-research procedure from prose into a versioned contract.
- Model four states where a declared unknown license, cost or authentication can never resolve as
  `universal` or `conditional`. An absent field stays a contract error: absence and declared unknown do not
  mean the same thing.
- Require pinned, dated provenance. A reference must be an exact commit, tag or version, so a floating
  reference such as `latest` fails validation and a stale verification is reported rather than presented as
  current.
- Add the read-only `project-os tool-catalog list|evaluate` command. Its output is its only surface: it
  writes no configuration, downloads nothing, and refuses a URL so investigated material is brought in by a
  person and treated as data.
- Keep describing separate from activating: registering an entry leaves `servers` empty, skills disabled and
  every MCP entry `disabled`, with configuration, startup, tool listing and authenticated smoke recorded as
  independent signals.
- Record `allowed-tools` as an experimental signal only, and reject a literal secret in any field without
  echoing the value.

### Release recovery

- Document the `v0.2.0` npm recovery in `docs/RELEASES.md`: the protected-tag rebuild uses a
  repository-compatible workspace and only the canonical GitHub Release tarball reaches `npm publish`.

## 0.2.0 - 2026-08-20

### Adaptive onboarding

- Add the read-only `onboarding-plan` classifier with five canonical answers and deterministic
  `beginner`, `experienced-new` or `brownfield` routes.
- Add versioned onboarding answers/state schemas, in-memory v0 migration and privacy-preserving evidence.
- Add the router prompt that records the classified route under an explicit human gate and orchestrates
  Prompt 00 and Prompt 01 per route, including handoff between chats and recovery.
- Make Prompt 00 and Prompt 01 consume the recorded route: Stage A still never asks for stack or the
  complete product, and discovery reuses confirmed facts instead of restarting the interview.
- Verify root and blueprint prompt parity through a shared, executable prompt contract.

### Per-agent compatibility

- Separate what the constructor renders from what has been proven about consumption. `support` now
  describes only the rendering; a new `verification` block records minimum version, the dated official
  source, the fixture, and startup, tool listing and smoke as independent signals that accept only
  `not-verified` or an opt-in receipt. A configuration reference can no longer read as a smoke.
- Fail the rendering when a `native` or `generated` capability lacks a dated official source, a minimum
  version, a fixture, a consuming surface, a visible fallback or a written degradation.
- Stop a `native` capability from excluding official surfaces of its own harness. GitHub Copilot MCP is
  now `generated` and names the surfaces configured only outside the repository.
- Move the Codex skill adapter to `.agents/skills`, the location its official documentation lists;
  `.codex/skills` was a legacy convention. The project skill now installs in two official locations
  instead of one copy per vendor, so each harness receives it exactly once.
- Promote Cursor, GitHub Copilot and OpenCode skills to the shared documented location, and correct
  GitHub Copilot permissions from `unsupported` to `documented`.
- Keep a seed-once capability matrix readable when it still names a retired target: the capability is
  delivered through the installed replacement and the stale target is published as a declared
  degradation, without rewriting the file the consumer owns.
- Evaluate Antigravity in a separate candidate fixture; it stays unsupported until it meets the same
  promotion contract.

### Scope

- Remote tracker operations and the curated skills/MCP catalogue remain outside this release.
- Rules by path stay `documented` on every harness: the renderer emits one aggregate file with a
  universal scope and does not preserve per-glob selection.

## 0.1.6 - 2026-08-04

- Fix the seeded `package-lock.json`, left at `0.1.4` while the seeded `package.json` moved to `0.1.5`.
  Every repository bootstrapped with `0.1.5` aborted the documented `npm ci` with `EUSAGE`, and the
  `openspec init`, `opsx-adapt`, `check` and `doctor` steps then failed for want of `node_modules`.
- Guard the seeded pair offline. `check:package` now reproduces the rule `npm ci` applies, both over the
  blueprint source and over the tree a bootstrap writes, so a desynchronized pin cannot reach a release.
- `0.1.5` is published and immutable. Move to `0.1.6`; reinstalling `0.1.5` reproduces the failure.

## 0.1.5 - 2026-08-04

- Migrate project ownership metadata from the former GitHub handle to `IgnacioBarEsp`.
- Point `repository`, `bugs` and `homepage` at the current owner so the npm listing resolves.
- Restore code ownership rules and the release owner guard, which no longer matched after the rename.
- Record authorship in `LICENSE` and `author` under the maintainer's legal name.

## 0.1.4 - 2026-07-23

- Allow a feature to archive after it captures pre-existing minor debt; the resulting pause governs
  subsequent work in the owner plan.
- Keep `NO GENERAR MAS DEUDA TECNICA` strict for remediation flows.
- Persist a newly created GitHub remediation-issue backreference from the `gh` URL even when issue
  listing is eventually consistent, so the immediate handoff is accurate.

## 0.1.3 - 2026-07-23

- Correct state metadata drift immediately after an upgrade.
- Require normal `sync --check` and `upgrade --check` to converge without a second state mutation.

## 0.1.2 - 2026-07-23

- Fail release packing when a legacy checkout violates the canonical LF policy.
- Name offending paths and recover through a fresh worktree/clone instead of reporting a false PASS.

## 0.1.1 - 2026-07-23

- First stable npm/npx release through Trusted Publishing OIDC.
- Correct relative tarball publication and make GitHub Release recovery idempotent.
- Enforce canonical LF export identity across Windows, macOS and Linux.
- Move public workflows to current Node 24-based immutable action releases.

## 0.1.0 - 2026-07-23

- Partial GitHub-only release candidate; npm promotion failed before publishing and this version must not
  be consumed.
- Reproducible environment bootstrap, harness parity, OpenSpec SDD and read-only doctor.
- Integrated `project-os debt` control loop with immutable assessments and per-plan budgets.
- Deterministic consumer upgrades, transactional recovery and optional pull-request handoff.

No version is considered released until its Git tag, GitHub Release tarball, checksum, npm artifact and
provenance have the same verified identity.
