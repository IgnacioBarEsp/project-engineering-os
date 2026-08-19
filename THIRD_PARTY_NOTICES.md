# Third-party notices

The published package has one development-only dependency:

| Package | Version | License | Runtime |
| --- | --- | --- | --- |
| `ajv` | `8.20.0` | MIT | No; tests and schema verification only |

Generated repositories pin `@fission-ai/openspec` `1.6.0`, licensed under MIT. It is installed in the
consumer repository as a development dependency and is the exclusive owner of generated OPSX workflows.

## Telemetry in generated repositories

`@fission-ai/openspec` collects anonymous usage telemetry through `posthog-node`: command name and
version only, with no arguments, paths, file content or personal data, and it is disabled automatically
in CI. This package neither enables, configures nor forwards that telemetry, but bootstrapping a
repository does install it. Any one of the following disables it in the consumer repository:

- `openspec config set telemetry.enabled false` (global config; unset means enabled)
- `OPENSPEC_TELEMETRY=0`
- `DO_NOT_TRACK=1`

No third-party source is vendored in the npm package. The release gate verifies this inventory against
the lockfile and stops on an unknown or incompatible license.
