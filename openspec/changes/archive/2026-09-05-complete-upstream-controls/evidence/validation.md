# Validation

Environment: Windows, Node 24.18.0, npm 11.16.0, exact local OpenSpec 1.6.0.

DoR: #49–#56 each returned 13 PASS, 0 FAIL, 0 exceptions using a temporary target. After adoption,
#49 returned the same verdict directly over the upstream. #64 was enriched after its verified diagnosis.

Local final validation on 2026-09-04: `npm run check` passed all 242 tests and package, neutrality,
documentation, workflow and debt checks; `npm run check:audit` passed with zero high/critical findings
and no exceptions. Exact local OpenSpec strict validation passed all nine current items. The complete
installed-tarball fixture passed after the generation-isolation fix. `npm run pack:verify` passed
installation, bootstrap, idempotence and debt smoke checks. The publication allowlist excludes office
documents and PDFs; the supplied private DOCX remains untouched and outside version control.

`doctor --json` reports zero FAIL, nine PASS, two WARN and eighteen SKIP on the explicitly configured
upstream. Remote matrix results are linked in the protected pull request; integration remains pending
until its required aggregate succeeds. Transaction recovery cases are exercised in the automated suite;
manual inspection confirmed the paths, ownership and recovery instructions against those results.

Manual inspection: classification is explicit in every doctor result, generated workflows retain official
ownership, conditional profile decisions and receipt contracts are documented, and rollback is a normal
PR revert. Captured historical evidence is retained during rollback. Project identity was re-read with
GitHub CLI and its timestamped receipt is bound to the actual manifest hash.

The first complete fixture failed on host delivery preferences; that failure was retained as issue #64,
not reclassified as PASS. The abbreviated fixture and unit suite had not detected it.

The first remote matrix additionally exposed macOS suppression of spinner progress. The classifier now
accepts the official complete summary naming every tool; missing tools, failed generation and unexpected
stderr still fail. Generated-file and OPSX ownership checks remain unchanged. A regression test covers
the non-interactive summary and four negative cases (243 total tests after this correction).

No new licenses, services, provider activation, runtime dependencies or global preference changes are
introduced. Agent self-review and maintainer authorization are stated without claiming independent review.
