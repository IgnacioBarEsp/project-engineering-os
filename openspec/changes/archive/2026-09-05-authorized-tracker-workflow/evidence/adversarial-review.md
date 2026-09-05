# Adversarial self-review — 2026-09-05

Applied engineering:code-review to correctness, authority, credential handling and recovery. This is agent
self-review under explicit maintainer delegation, not an independent human review.

- Exact plan reconstruction and source binding reject payload/context drift before credentials. Approval
  permits only enumerated operations and exact scopes; effective credential grants remain unverified.
- Provider scope arrays were initially shared with output. Replaced them with immutable catalog values and
  independent operation arrays to avoid accidental authority mutation by a caller building an approval.
- Fixed HTTPS origins and blocked redirects; bounds and sanitized errors cover provider-controlled data.
  Recognizable credential patterns in descriptions are rejected before output or journal storage. This
  detector is not a claim to recognize arbitrary secrets.
- Remote identities are checked against the requested GitHub node/owner, Azure UUID or Jira ID/key.
  Response-provided URLs never determine Azure operation polling.
- Extended the GitHub structural snapshot beyond IDs to README, field metadata/options/iterations and
  view name/filter/layout/revision. The guide explicitly bounds this to observed API properties.
- Write-ahead intent and exclusive target lock preserve uncertain outcomes; no automatic create retry.
  Existing trackers are never deleted. Created GitHub project deletion requires exact snapshot, privacy
  and zero items. Shared remote APIs lack an atomic cross-call compare-and-swap; the guide states the
  quiet-window requirement and does not claim exactly-once or universal race prevention.
- Partial failure recovery is conservative. A receipt without a verified snapshot requires operator
  reconciliation; verify does not silently mark it complete. No scope expansion, migration or paid setup.
- Azure/Jira real credentials were unavailable and not requested; their evidence is explicitly contract
  simulation. GitHub create, replay, existing-project read and rollback were exercised live.

Blockers: 0. Majors: 0. Verified residual technical debt: none within the documented v1 contract.
