## Decision

Use npm 11.19.1, published to the registry on 2026-08-26, with Node ^20.17.0 or >=22.9.0. The upstream supports newer minima. Its patch fixes explicit pack targets and refreshes dependencies; nine days have elapsed at review. Install the pinned client with scripts disabled on ephemeral CI runners before dependency installation. The local rehearsal uses a temporary prefix, never a global installation.

Set min-release-age=7 in the upstream .npmrc only. Seven days trades early regression/compromise exposure against delayed fixes. It is a resolution delay, not an audit of locked or executing code. Measure the unchanged lockfile under npm ci; prove rejection and narrowly scoped exemption using a deterministic local registry fixture. Urgent exceptions name the package, pin the intended version, remain command-scoped and require evidence of advisory, provenance and tests in the issue. Do not add persistent broad exclusions.

The client pin is reviewed each quarter, before release, and upon a client security advisory. Keep install scripts explicitly disabled; do not assume merely updating npm activates controls. Consumer guidance chooses no manager and distinguishes their units, defaults, lockfile behavior and trust boundaries.

## Validation and rollback

Use the selected client for check, installed fixture, audit and two canonical dry-run packs. Inspect OIDC and absence of token fallback; no experimental registry publication is needed. Inspect guidance against primary docs dated at consultation. Revert the PR for a verified regression; do not move published tags.
