# Adversarial review

Reviewer: Codex implementation session, using the engineering code-review checklist. This is not an independent human approval. Scope: changed receipt verifier/schema/manifest and their doctor/readiness tests. An earlier Codex Security attempt was canceled at setup/preflight before analysis and is not counted as a completed scan or evidence.

A separate final Codex Security diff scan completed after the recursive-hash guard was added: scan `5ffee433-8813-4e9d-8735-9fa5a690ec5c`, working-tree snapshot `codex-security-snapshot/v1:sha256:8ae736d9dba30f4cfbd27a9acb3c4abcec78dfb20bfbf4ae95fa55588ba8eb97`. The workbench-assigned review inventory was 7/7 complete, with 0 reportable findings. This automated security scan is evidence for this code scope, not a human approval or independent reviewer sign-off.

## Attacker-controlled inputs and probes

| Probe | Expected boundary | Result |
| --- | --- | --- |
| Consumer edits its profile lists to omit required probes | Required IDs come from the packaged canonical profile entry | **FAIL**; test tampers with consumer manual-evidence catalog and receipt |
| Receipt is missing, malformed, contains extra keys/commands, wrong profile/config/profile hash, duplicate/unknown/missing ID, or `N/A` | Exact fixed shape and canonical ID set; no metadata execution | **FAIL**; covered by schema/runtime negative tests |
| Receipt time is impossible, future, expired, reversed or longer than 30 days | Canonical UTC timestamps and bounded validity window | **FAIL**; covered by invalid/stale/future time cases |
| Receipt/artifact is over 256 KiB / 10 MiB or aggregate artifacts exceed 50 MiB | Bounded reads before use | **FAIL**; per-file and aggregate limits exercised |
| Artifact points through traversal or an escaping symlink, is missing/non-regular, or its bytes change | Confined relative paths, regular-file check, raw-byte SHA-256 | **FAIL**; traversal, receipt/artifact symlink and hash cases exercised |
| Evidence claims to prove tests or human approval independently | Doctor can validate integrity/completeness only | **Not claimed**; JSON output and docs explicitly state this limit |
| Complete evidence causes unrelated doctor failures to disappear | Profile result is additive; all other result IDs/statuses remain visible | **Rejected**; regression test compares all non-profile results |
| Deeply nested malformed `activeProfiles` makes recursive hash serialization throw | Invalid profile hash input becomes a profile `FAIL` and preserves the doctor report | **Rejected**; regression test verifies `profile.ui` fails while `runtime.node` remains visible |

No actionable Blocker or Major was found. The local receipt is consumer-owned and not cryptographically authenticated; an authorized consumer can self-report fabricated evidence. That is an explicit trust boundary, not an independent-test guarantee, and the doctor labels its result `integrity-and-completeness-only`. A concurrent writer with access to the consumer repository could race ordinary path checks, but doctor does not return artifact contents, execute them, or mutate the repository; the same writer already controls the self-attested receipt. The repository is not treated as an isolation boundary against its owner.

## Review disposition

**Passed for the documented scope: 0 Blockers, 0 Majors.** Evidence integrity, fail-closed completeness, fixed runner behavior, read-only behavior, backward compatibility and preservation of unrelated results have automated negative/positive coverage. The final security scan found 0 reportable findings in its complete assigned scope. No independent human sign-off is implied.
