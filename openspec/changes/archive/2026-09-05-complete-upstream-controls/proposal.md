## Why

Issues #49–#56 describe eight verified gaps: readiness cannot run in situ, debt is not captured, doctor confuses a consumer layout with upstream obligations, opsx-check targets an incompatible tree, two CLI contracts lack specs, approved profiles break readiness, codeIndexable has no PASS path, and ordinary Spanish text triggers an opaque placeholder rejection.

## What Changes

- Adopt upstream-owned readiness and debt configuration without bootstrapping the upstream.
- Classify diagnostics by published obligation or consumer shape; preserve FAIL for real obligations.
- Make optional structural evidence verifiable without starting tools.
- Support explicit profile activation and report placeholder patterns precisely.
- Remove the misleading upstream opsx-check script; document consumer-target execution.
- Specify both readiness phases and OPSX ownership/Purpose checks.
- Isolate official OpenSpec generation from user-wide preferences and prompts (#64).
- Limit published documentation to Markdown and public image assets, excluding private reference documents.

## Capabilities

### Modified Capabilities
- runtime: readiness, diagnostics and profile activation.
- debt-control: upstream capture and closure enforcement.

## Impact

Runtime, blueprint schemas, upstream configuration, tests and documentation. No production dependencies, provider activation, fees or external indexing. The maintainer authorized completion, remote integration and release in the 2026-09-04 session. That authorization does not substitute technical evidence or claim another human reviewed the code.

## Rollback

Revert the implementation PR. Preserve captured assessments and registry as historical evidence; restore runtime and schemas together. Existing consumer defaults remain unchanged.
