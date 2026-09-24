# Adversarial review

Date: 2026-09-24. Change: `doctor-baseline-and-receipt-lifecycle`; issue [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

## Scope and method

A fresh-context architecture reviewer statically checked the upstream receipt path/size contract, consumer compatibility, freshness/config binding, and the updated runtime spec and CLI/runbook guidance. Automated tests and the packed-consumer fixture separately exercised the changed boundaries.

The review found one actionable contract mismatch: upstream doctor could accept a legacy `.project-constructor/evidence/github-project.json`, while freshness and the runbook recognized only the canonical `.project-os/evidence/github-project.json`. The doctor now uses only the canonical path in upstream mode; consumers retain the legacy fallback. Regression tests prove both sides. The reviewer confirmed the bounded upstream read and config-hash binding are present. No unresolved Blocker or Major remains.

The final Codex Security diff report for the corrected patch is retained in the Codex Security workbench and will be associated with the protected PR. The earlier scan of the pre-correction snapshot is not presented as final evidence. This is an agent review, not human maintainer approval; required protected-PR review remains a separate gate.

## Conclusion

PASS for this bounded change after correction. No credentialed command, network renewal, consumer data migration, or remote mutation was introduced. The expected three upstream profile failures remain explicit and baseline-checked; the renewed Project receipt is fresh and configuration-bound.
