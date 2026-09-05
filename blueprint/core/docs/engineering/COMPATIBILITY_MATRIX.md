# Compatibility matrix

This document describes the portable contract of the universal environment. The canonical machine-readable
harness matrix is `.project-os/harness-capabilities.json`; generated copies are evidence of configuration,
not proof that an IDE process loaded or authenticated a tool.

## Capability vocabulary

`support` describes only what the constructor renders. It is never a claim that an agent process loaded the
file.

- `native`: the constructor writes a location the harness's own official documentation lists for this
  capability, in the documented format, and an offline fixture proves the rendering.
- `generated`: the constructor maps the canonical source into a surface the harness reads, but the surface
  is general, shared, or unavailable to part of the harness's official surfaces.
- `documented`: the rule remains visible through repository instructions but has no claimed technical
  enforcement.
- `unsupported`: the harness cannot represent the capability and no equivalent is claimed.

## Harness compatibility

| Harness | Instructions | Rules by path | Skills | Permissions | MCP | Profiles |
|---|---|---|---|---|---|---|
| Claude Code | native | generated | native | documented | native | documented |
| Codex | native | documented | native | documented | native | documented |
| Cursor | native | generated | native | documented | native | documented |
| GitHub Copilot | native | generated | native | documented | generated | documented |
| OpenCode | generated | documented | native | documented | native | documented |

The generated matrix inside `AGENTS.md` carries the full record for every cell: minimum version, the dated
official source, the fixture that proves the configuration, the three runtime signals, the visible fallback,
and the surfaces that cannot consume the target.

### What each rendered cell must declare

A `native` or `generated` cell fails to render unless it declares a minimum version, an official https
source with an ISO consultation date, a fixture identifier that exists, at least one consuming surface, a
visible fallback, and a written degradation. A `native` cell additionally may not exclude any official
surface of its own harness: when surfaces diverge the cell drops to `generated` and names the excluded ones.
That rule is what keeps a single generic row from hiding a surface that has no versioned file.

### Shared skill surface

The project skill installs twice, not once per vendor: `.claude/skills/project-os/SKILL.md` for Claude Code,
and `.agents/skills/project-os/SKILL.md` for Codex, Cursor, GitHub Copilot, and OpenCode, all of which
document that shared location. A copy per vendor would place the same content several times inside agents
that scan more than one directory.

### Declared degradations

Rules by path are `generated` for Claude Code, Cursor and Copilot CLI: each canonical rule becomes a file
with its selector, while the aggregate files are indexes. The offline fixture checks selectors and bodies;
it does not prove model adherence. Codex and OpenCode retain `documented` textual fallbacks. Use portable
lowercase IDs and relative slash-separated globs with `*`, `**` or `?`; list multiple patterns separately.
Ambiguous selectors fail before writes. Existing consumers keep their seed-once matrix until an explicit
migration, so their declared support can remain conservative even after new files are generated.

Permissions stay `documented` on all five. The canonical vocabulary in `.project-os/permissions.json` is
abstract capability tokens, not tool names or shell patterns, so deriving enforcement syntax from it would
invent semantics and claim an enforcement the repository never decided. The policy always appears in
`AGENTS.md`.

Codex reads a project `config.toml` only in trusted projects. The file is written either way; without
granted trust it exists and is not applied.

An unsupported or documented cell must never be counted as native parity.

## Candidate harnesses

A harness outside the supported five is evaluated in an isolated candidate fixture and stays `unsupported`
until it meets the same contract as every rendered cell: a renderer with a declared target, a dated official
source, a minimum version, an existing fixture, a visible fallback, and a written degradation for each of
the six capabilities. Resemblance to an already supported surface never promotes a cell.

## Operating-system and runtime contract

| Environment | Runtime configured in advisory CI | Contract |
|---|---|---|
| Ubuntu | Node 20.20.0 and 22.22.0 | Locked install, parity check, OPSX check, doctor JSON, and OpenSpec validation |
| Windows | Node 20.20.0 and 22.22.0 | Same commands through npm and the Node runtime; no Bash dependency in the constructor |
| macOS | Node 20.20.0 and 22.22.0 | Same commands through npm and the Node runtime |

The supported Node range is `^20.20.0 || >=22.22.0`. Generated text uses LF and repository-relative paths.
Filesystem preflight rejects unsafe traversal and symlink escape. The advisory matrix uses `fail-fast:
false` to collect all results, but an individual failure remains a failure. A missing, skipped, or
cancelled job is not success evidence.

## Signals that remain distinct

1. A generated configuration proves only structural presence.
2. Process startup proves only that a harness can launch.
3. Tool listing proves only discovery.
4. An authenticated smoke proves usable authority at that moment.

The doctor reports these separately as `PASS`, `FAIL`, `WARN`, or `SKIP`. It never installs, repairs,
authenticates, updates, reindexes, or starts a process.

## Promotion and rollback

Promote an advisory capability or CI job only after a stable baseline, a versioned decision, false-positive
review, and a tested rollback. On regression, restore the previous immutable package version, run
`project-os sync --check`, and use the transaction-specific rollback only when its hashes still match.
