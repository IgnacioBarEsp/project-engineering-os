# Manual evidence and ownership review

Date: 2026-09-24. Change: `doctor-baseline-and-receipt-lifecycle`; issue [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

## Declared degradations

The upstream's expected raw doctor failures remain exactly `profile.ui`, `profile.auth-security`, and `profile.library-cli`, each linked to #115 in the baseline. They represent absent upstream technical-profile receipts; this change neither claims those checks passed nor edits the active profiles. The `github.project` receipt is no longer a degradation: it is fresh, bounded to 180 days, and bound to the current Product OS configuration hash. `freshness` displays its fixed renewal command but does not execute it.

## Clarity, ownership, and drift decisions

The runbook distinguishes upstream-owned CLI/baseline/evidence from consumer-owned product files and legacy receipt placement. Upstream GitHub Project evidence is read only from `.project-os/evidence/github-project.json`; consumers retain the existing `.project-constructor/evidence/` fallback. The regression suite verifies both behaviors.

The handoff issue's historical note says #122 blocked `sync --check` and `upgrade --check`. That no longer matches current state: #122 is closed, and direct checks now return exit 0 with `SKIP` and no mutation on the upstream. The current fact and scope decision are recorded in the proposal and brownfield baseline; no remote issue text was edited.

The receipt contains only the configured project identity, status, config hash, timestamps, verification summary, and inert fixed command. It contains no credentials or project item contents. No new provider, service, dependency, scheduled workflow, telemetry, or consumer migration was added.
