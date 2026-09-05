# Design

## Decisions approved for execution

The existing issues supply scope and observable criteria. Each passed the real pre-propose gate with 13 PASS and no exceptions on 2026-09-04 using a temporary policy target. The maintainer's session authorization covers this implementation.

1. Upstream readiness policy, profile catalogue and Product OS manifest are independently owned configuration, initially seeded from the blueprint. Future upstream releases must not overwrite them.
2. Historical assessments are imported using the debt CLI. The captured store is operationally canonical; archived evidence remains an immutable source with a migration manifest. Normalize only invalid plan ownership, documenting the mapping. Resolve already-fixed Purpose debt with a remediation assessment and current spec evidence.
3. An explicit repositoryKind=upstream in repository governance, together with the package identity, selects upstream diagnostic applicability. Consumer-shape checks become SKIP with their original result preserved; genuine obligation checks retain their result. Every result carries category and applicability in evidence, preserving the v1 envelope.
4. codeIndexable remains opt-in. When true, existing independently named GitNexus/CodeGraph receipt locations can prove operation through the same opt-in, status, time and config-hash contract as other doctor evidence. Missing evidence fails; disabled policy skips without claiming code is absent. This does not choose or install an indexer.
5. Profile schema permits a coherent explicit set. Core profiles remain mandatory; a conditional active profile requires a nonempty approved decision reference. Diagnostics identify the offending profile.
6. Reserved uppercase TODO remains invalid; lowercase Spanish todo is ordinary text. Other unambiguous markers remain case-insensitive. Diagnostics name a safe canonical pattern label and field, never echo arbitrary input or secrets.
7. readiness archive incorporates the existing debt gate when configured. Unconfigured consumers retain their documented behavior. The upstream check explicitly requires configured debt.
8. Remove only the upstream npm script opsx-check, retaining the published CLI and consumer script. Use an explicit consumer target for OPSX validation.

## Evidence and adversarial cases

Exercise activated profiles, missing decisions, incoherent active lists, Spanish text, unresolved markers, secret-safe diagnostics, absent/expired/mismatched/valid receipts, upstream versus consumer applicability, real upstream failures and missing debt assessments. Validate the complete suite, fixture, audit and OpenSpec; run an in-situ propose probe and debt check.
