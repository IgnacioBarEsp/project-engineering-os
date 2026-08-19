## Context

There are two dependency graphs that matter: the publishable root package and the private package seeded
into every consumer repository. Socket conflated them because the second manifest ships inside the tarball.
Both current lockfiles audit clean, but CI has no online audit gate. OpenSpec 1.6.0 exposes only global
configuration for telemetry, so a project-local YAML key cannot implement the requested default.

The upstream repository owns CI, the blueprint, scripts and public documentation. OpenSpec owns its CLI,
generated OPSX assets and telemetry implementation. Consumers retain ownership of global preferences and
may invoke the upstream CLI directly.

## Goals / Non-Goals

**Goals:**

- Fail required CI on unaccepted `high` or `critical` findings across all relevant dependency scopes.
- Make exceptions exact, reviewable, short-lived and testable.
- Give project-owned OpenSpec commands a cross-platform privacy default without global side effects.
- Leave a readable, versioned decision trail for scanner signals, cost, licensing and recovery.

**Non-Goals:**

- Replace npm, adopt Socket, update OpenSpec or change release publication.
- Intercept arbitrary direct OpenSpec invocations outside package scripts.
- Suppress moderate or lower findings through an undocumented exit-code workaround.

## Decisions

### One online gate, three explicit scopes

`scripts/check-audit.mjs` will run `npm audit --json --audit-level=high` for root, root with
`--omit=dev`, and `blueprint/core`. A dedicated Ubuntu/Node 22 CI job avoids multiplying registry traffic
across the six compatibility jobs. `CI / required` will depend on both jobs. The local `npm run check`
remains deterministic and offline-capable; `npm run check:audit` is the explicit online command.

Alternative rejected: add audit to every matrix leg. It offers little additional platform evidence because
the lockfiles are identical, while increasing rate-limit and availability noise.

### Parse npm JSON and evaluate a versioned policy

The gate treats every high/critical advisory identity as a finding. A policy under `config/` declares fixed
scopes, threshold, maximum exception lifetime and initially no exceptions. Matching is exact on scope,
package and advisory; malformed, overlong or expired entries fail closed. Pure extraction and evaluation
functions receive fixtures in unit tests, including registry failure and injected high findings.

Alternative rejected: rely only on npm's exit code. It cannot express bounded exceptions or prove that a
failure was an advisory rather than unavailable evidence.

### A generated Node wrapper owns the local telemetry default

The blueprint will install `.project-constructor/openspec.mjs`, and existing `openspec:*` scripts will call
it. The wrapper resolves the pinned local binary, uses `process.execPath` without a shell, defaults
`OPENSPEC_TELEMETRY` only when absent and forwards signals/exit status. `OPENSPEC_TELEMETRY=1` remains an
explicit opt-in. Quickstarts use `npm run openspec:init`.

Alternatives rejected: global `openspec config set` changes all projects for the user; a project-local
OpenSpec setting does not exist in 1.6.0; `.npmrc` cannot reliably set a child process environment default.

### Documentation is evidence, not scanner marketing

The triage record will include date, source, affected graph, verdict, rationale and follow-up for every
signal from #18. The cost/license guide links it, notices explain privacy behavior, and the blueprint
manifest is explicitly described as a consumer template. No paid scanner becomes authoritative.

## Risks / Trade-offs

- [npm registry or advisory API is unavailable] → fail the dedicated job with the exact scope; retry CI
  after service recovery instead of issuing a false PASS.
- [npm changes audit JSON] → contract tests reject missing metadata; update the parser through a new change.
- [an exception remains after remediation] → expiration remains enforced; remove it in the remediation PR.
- [direct `npm exec openspec` uses upstream default] → state the boundary beside every supported quickstart
  and preserve user choice rather than mutate global state.
- [wrapper path drifts from the pinned package] → blueprint identity, fixture and wrapper tests fail.

## Migration Plan

1. Add policy, parser/evaluator, unit tests and the dedicated CI job.
2. Add the managed wrapper, manifest entry and package-script rewiring.
3. Update quickstarts, notices and triage; bootstrap a temporary repository and verify default plus opt-in.
4. Run audits, full checks, fixture, OpenSpec strict, adversarial review and debt capture.
5. Roll back by reverting the change. Confirm prior checks and fixture, then investigate before reapplying.

Compatibility remains Node 20.20+/22.22+, Windows/macOS/Linux and npm lockfile v3. Cost is zero. Licenses
remain MIT upstream and in the pinned development tools; no runtime dependency is added.

## Open Questions

None. The exact default, supported boundary, audit scopes and exception contract are resolved in this design.

