# Adversarial review

Date: 2026-09-24. Change: `doctor-baseline-and-receipt-lifecycle`; issue [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

## Scope and method

A fresh-context architecture reviewer statically checked the upstream receipt path/size contract, consumer compatibility, freshness/config binding, and the updated runtime spec and CLI/runbook guidance. Automated tests and the packed-consumer fixture separately exercised the changed boundaries.

The independent architecture review found one actionable contract mismatch: upstream doctor could accept a legacy `.project-constructor/evidence/github-project.json`, while freshness and the runbook recognized only the canonical `.project-os/evidence/github-project.json`. The doctor now uses only the canonical path in upstream mode; consumers retain the legacy fallback. Regression tests prove both sides.

The final Codex Security diff review then found that size checks followed by `readFile` did not hard-bound bytes consumed if a file grew concurrently. The shared reader now reads through an open file handle and stops at the configured limit plus one byte; doctor receipt, freshness receipt/config, tool-catalog and upstream-baseline readers use it. A focused regression simulates growth after `fstat`. The exact candidate was suppressed in security validation because exploitation requires same-host concurrent write access and no additional remote or privilege boundary was evidenced. This follow-up review was performed in the parent session, not by an independent reviewer.

The completed Codex Security diff report for the final corrected snapshot will be associated with the protected PR. This agent review is not human maintainer approval; required protected-PR review remains a separate gate.

## Conclusion

PASS for the final bounded-read correction. No credentialed command, network renewal, consumer data migration, or remote mutation was introduced. The expected three upstream profile failures remain explicit and baseline-checked; the renewed Project receipt is fresh and configuration-bound. Protected PR checks and review remain outstanding.
