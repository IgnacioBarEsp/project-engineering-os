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
in CI. Project Engineering OS-owned `openspec:*` scripts also default `OPENSPEC_TELEMETRY` to `0` without
writing global configuration; an explicit environment value is preserved. A direct OpenSpec invocation
outside those scripts keeps the upstream behavior. Any one of the following disables telemetry:

- `openspec config set telemetry.enabled false` (global config; unset means enabled)
- `OPENSPEC_TELEMETRY=0`
- `DO_NOT_TRACK=1`

The core npm package has no production dependencies today. `check:package` compares every future
production package in its lockfile with a package/version/license row in this notice and fails closed
when license metadata or the notice is missing. The Companion artifact is a separate redistribution;
its full dependency and Electron notices are maintained in
[the Companion notice](https://github.com/IgnacioBarEsp/project-engineering-os/blob/main/apps/companion/THIRD-PARTY-NOTICES.md)
and checked against its production lock inventory. No standalone third-party source tree is included in
the core npm package.

The release gate also verifies the core dependency inventory against the lockfile and stops on an
unknown or incompatible license. The
[versioned supply-chain triage](docs/security/SUPPLY_CHAIN_TRIAGE_2026-08-18.md) records scanner signals,
affected surfaces and decisions.
