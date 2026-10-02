# Brownfield baseline

Date: 2026-09-24. Issue: [#160](https://github.com/IgnacioBarEsp/project-engineering-os/issues/160).

## Before this change

Issue #160 recorded four upstream doctor failures: `profile.ui`, `profile.auth-security`, `profile.library-cli`, and `github.project`. The three technical-profile failures predated this receipt-lifecycle change and were separately associated with #115; this change does not suppress them or claim that upstream technical evidence exists. The GitHub Project failure was different: its local receipt was expired, and no documented freshness report or renewal lifecycle existed.

The current upstream doctor’s expected failure set is now versioned in `.project-os/doctor-failure-baseline.json`. Its comparator requires exact equality, so new or untracked failures and silently removed unresolved failures both fail `npm run check`. The receipt is separately checked for lifecycle state and configuration drift.

## Scope and ownership

This is upstream-owned CLI, baseline, test, and documentation work. It does not edit product code, change active profiles, add dependencies or scheduled workflows, or migrate consumer-owned data. The GitHub Project renewal is a manually performed read-only smoke; only the minimal redacted receipt is retained. The configured renewal command remains inert data.

Issue #122 is closed. On this upstream checkout, `sync --check` and `upgrade --check` return exit 0 with `SKIP` and `mutationPerformed: false`, because the upstream does not consume the managed consumer layout. That historical failure is not represented as a current regression or as part of this change’s baseline.
