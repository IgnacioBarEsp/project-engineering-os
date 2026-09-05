# Adversarial review

The implementing agent reviewed the diff and tested rejection paths. This is not an independent-agent
or human review claim; the maintainer authorized integration in the completion session.

- A configured release-age key alone is insufficient: tested real resolver behavior and lockfile bypass.
- An exclusion is by package name, not version: documentation requires an exact target and command scope.
- CI must use the same compatible client as both release jobs: policy checks reject missing/different pins.
- A new npm pin does not activate all controls: scripts remain explicitly disabled and policy is declared.
- pnpm's implicit age default may fall back; Yarn's example is not its default; Bun has a built-in trusted
  list. These limitations are stated rather than flattened into a misleading security ranking.
- The probe binds only loopback, uses invented temporary packages, has bounded subprocess timeouts,
  and removes only its verified temporary root. It publishes nothing and stores no credential receipt.

No unresolved blocker or major in scope. Existing path-rule debt #65 remains outside this change.
