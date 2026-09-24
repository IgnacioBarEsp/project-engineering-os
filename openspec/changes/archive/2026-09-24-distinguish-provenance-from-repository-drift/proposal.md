## Why

As reported in [issue #154](https://github.com/IgnacioBarEsp/project-engineering-os/issues/154), `sync --check` can report a state-only distributor identity change as repository drift even when the consumer's managed files and configuration are unchanged. That ambiguous status and exit code 1 cause people and `project-os:check` to treat a CLI-origin difference as a repairable consumer problem.

## What Changes

- Report field-level state differences in human and JSON output, including saved and observed values for distributor hash, blueprint hash, configuration hash, active profiles and state format.
- Add `PROVENANCE_MISMATCH` for read-only `sync --check` when `packageHash` is the sole state difference and package version, blueprint, configuration, active profiles and state format match; return success (0), warn that the CLI came from a different package origin, and propose no repairs.
- Keep real file/configuration drift at `DRIFT` with exit code 1; preserve the existing `packageHash` and its identity verification. Report the changed tracked state field(s) and both values so a state-only difference is never an anonymous `state=update`.
- Document `IN_SYNC`, `DRIFT`, `PROVENANCE_MISMATCH` and the four existing exit codes in the CLI and recovery guides. The machine-readable command manifest remains in the scope of issue #157.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `runtime`: read-only sync checks distinguish package provenance from consumer drift and report relevant state-field changes.
- `public-documentation-experience`: the CLI and recovery guides document check outcomes and exit codes.

## Impact

Changes affect `src/state.mjs`, `src/plan.mjs`, `src/commands.mjs`, `src/cli.mjs`, CLI/recovery documentation and automated fixtures. No dependency, state-format, transaction-engine or upgrade behavior changes. Issue #157 remains responsible for publishing exit-code meanings in its command manifest.
